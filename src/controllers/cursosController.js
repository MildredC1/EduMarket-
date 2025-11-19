
import pool from '../config/db.js';

export async function listarCursos(req, res) {
  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
             u.nombre, u.apellido
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      WHERE c.habilitado = 1
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


//  Crear curso (solo instructores)
export async function crearCurso(req, res) {
  const {
    titulo,
    descripcion,
    imagen_principal,
    imagenes_secundarias,
    precio,
    nivel,
    enlace_youtube
  } = req.body;

  const { usuario:instructor_id, rol } = req.cookies;

  if (!titulo || !descripcion || !imagen_principal || !precio || !nivel) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (rol !== 'instructor') {
    return res.status(403).json({ error: 'Solo instructores pueden crear cursos' });
  }

  try {
    await pool.promise().query(
      `INSERT INTO cursos (titulo, descripcion, imagen_principal, imagenes_secundarias, precio, nivel,enlace_youtube, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
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
    res.status(201).json({ mensaje: 'Curso creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
}

//  Actualizar curso (solo instructores)
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
    enlace_youtube
  } = req.body;

  const { usuario:instructor_id, rol } = req.cookies;

  if (rol !== 'instructor') {
    return res.status(403).json({ error: 'Solo instructores pueden actualizar cursos' });
  }

  try {
    const [resultado] = await pool.promise().query(
      `UPDATE cursos
       SET titulo = ?, descripcion = ?, imagen_principal = ?, imagenes_secundarias = ?, precio = ?, nivel = ?, habilitado = ?, enlace_youtube = ?
       WHERE id = ? AND instructor_id = ?`,
      [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        habilitado,
        enlace_youtube,
        id,
        instructor_id // validamos que el curso pertenezca al instructor logueado
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso no encontrado o no autorizado' });
    }

    res.json({ mensaje: 'Curso actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
}
// Listar cursos creados por el instructor logueado
export async function listarCursosInstructor(req, res) {
  const instructorId = req.cookies.usuario; // id del instructor guardado en cookie/session
  try {
    const [cursos] = await pool.promise().query(
      'SELECT * FROM cursos WHERE instructor_id = ?',
      [instructorId]
    );
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos del instructor' });
  }
}