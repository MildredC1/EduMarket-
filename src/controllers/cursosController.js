
import pool from '../config/db.js';

export async function listarCursos(req, res) {
  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido,
             GROUP_CONCAT(cat.nombre SEPARATOR ', ') AS categorias
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      LEFT JOIN categoria_cursos cc ON c.id = cc.cursos_id
      LEFT JOIN categorias cat ON cc.categoria_id = cat.id
      WHERE c.habilitado = 1
      GROUP BY c.id
    `);

    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
}

export async function verDetalleCurso(req, res) {
  const { id } = req.params;

  try {
    const [[curso]] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel,
             c.imagen_principal, c.imagenes_secundarias, c.enlace_youtube,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      WHERE c.id = ? AND c.habilitado = 1
    `, [id]);

    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no habilitado' });
    }

    // Obtener categorías del curso
    const [categorias] = await pool.promise().query(`
      SELECT cat.id, cat.nombre
      FROM categoria_cursos cc
      JOIN categorias cat ON cc.categoria_id = cat.id
      WHERE cc.cursos_id = ?
    `, [id]);

    curso.categorias = categorias;

    // Obtener promedio de valoraciones
    const [[{ promedio }]] = await pool.promise().query(`
      SELECT ROUND(AVG(puntuacion), 1) AS promedio
      FROM valoraciones
      WHERE curso_id = ?
    `, [id]);

    curso.rating_promedio = promedio || 0;
    curso.imagenes_secundarias = JSON.parse(curso.imagenes_secundarias || '[]');

    res.json(curso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener detalle del curso' });
  }
}

export async function crearCurso(req, res) {
  const {
    titulo,
    descripcion,
    imagen_principal,
    imagenes_secundarias,
    precio,
    nivel,
    enlace_youtube,
    categorias // array de IDs de categorías
  } = req.body;

  const { usuario: instructor_id, rol } = req.cookies;

  // Validaciones 
  if (!titulo || !descripcion || !imagen_principal || !precio || !nivel) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar rol
  if (rol !== 'instructor' && rol !== 'admin') {
    return res.status(403).json({ error: 'Solo instructores o administradores pueden crear cursos' });
  }

  try {
    // 1. Insertar curso
    const [resultado] = await pool.promise().query(
      `INSERT INTO cursos (titulo, descripcion, imagen_principal, imagenes_secundarias, precio, nivel, enlace_youtube, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        enlace_youtube,
        instructor_id
      ]
    );

    const cursoId = resultado.insertId;

    // Insertar categorías en tabla intermedia
    if (Array.isArray(categorias) && categorias.length > 0) {
      for (const categoriaId of categorias) {
        await pool.promise().query(
          `INSERT INTO categoria_cursos (cursos_id, categoria_id) VALUES (?, ?)`,
          [cursoId, categoriaId]
        );
      }
    }

    res.status(201).json({ mensaje: 'Curso creado correctamente', curso_id: cursoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
}

//  Actualizar curso (solo instructoresy admin)
export async function actualizarCurso(req, res) {
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    imagen_principal,
    imagenes_secundarias,
    precio,
    nivel,
    habilitado,
    enlace_youtube,
    categorias // array de IDs de categorías
  } = req.body;

  const { usuario: instructor_id, rol } = req.cookies;

  if (rol !== 'instructor' && rol !== 'admin') {
    return res.status(403).json({ error: 'Solo instructores o administradores pueden actualizar cursos' });
  }

  try {
    let query, params;

    if (rol === 'instructor') {
      // Instructor solo puede actualizar sus propios cursos
      query = `UPDATE cursos
               SET titulo = ?, descripcion = ?, imagen_principal = ?, imagenes_secundarias = ?, precio = ?, nivel = ?, habilitado = ?, enlace_youtube = ?
               WHERE id = ? AND instructor_id = ?`;
      params = [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        habilitado,
        enlace_youtube,
        id,
        instructor_id
      ];
    } else {
      // Admin puede actualizar cualquier curso
      query = `UPDATE cursos
               SET titulo = ?, descripcion = ?, imagen_principal = ?, imagenes_secundarias = ?, precio = ?, nivel = ?, habilitado = ?, enlace_youtube = ?
               WHERE id = ?`;
      params = [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        habilitado,
        enlace_youtube,
        id
      ];
    }

    const [resultado] = await pool.promise().query(query, params);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso no encontrado o no autorizado' });
    }

    //  Actualizar categorías en tabla intermedia
    if (Array.isArray(categorias)) {
      // Primero eliminar las categorías actuales
      await pool.promise().query(`DELETE FROM categoria_cursos WHERE cursos_id = ?`, [id]);

      // Insertar las nuevas categorías
      for (const categoriaId of categorias) {
        await pool.promise().query(
          `INSERT INTO categoria_cursos (cursos_id, categoria_id) VALUES (?, ?)`,
          [id, categoriaId]
        );
      }
    }

    res.json({ mensaje: 'Curso actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
}


// Listar cursos creados por el instructor logueado
export async function listarCursosInstructor(req, res) {
  const { usuario: instructorId, rol } = req.cookies;

  try {
    let query, params;

    if (rol === 'admin') {
      // Admin ve todos los cursos
      query = `
        SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
               u.nombre AS instructor_nombre, u.apellido AS instructor_apellido,
               GROUP_CONCAT(cat.nombre SEPARATOR ', ') AS categorias
        FROM cursos c
        JOIN usuarios u ON u.id = c.instructor_id
        LEFT JOIN categoria_cursos cc ON c.id = cc.cursos_id
        LEFT JOIN categorias cat ON cc.categoria_id = cat.id
        GROUP BY c.id
      `;
      params = [];
    } else if (rol === 'instructor') {
      // Instructor solo ve sus cursos
      query = `
        SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
               GROUP_CONCAT(cat.nombre SEPARATOR ', ') AS categorias
        FROM cursos c
        LEFT JOIN categoria_cursos cc ON c.id = cc.cursos_id
        LEFT JOIN categorias cat ON cc.categoria_id = cat.id
        WHERE c.instructor_id = ?
        GROUP BY c.id
      `;
      params = [instructorId];
    } else {
      return res.status(403).json({ error: 'Acceso denegado: requiere rol admin o instructor' });
    }

    const [cursos] = await pool.promise().query(query, params);
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
}
