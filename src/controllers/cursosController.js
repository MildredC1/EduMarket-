
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

//  Crear curso (solo instructores)
export async function crearCurso(req, res) {
  const {
    titulo,
    descripcion,
    imagen_principal,
    imagenes_secundarias,
    precio,
    nivel
  } = req.body;

  const { usuario, rol } = req.cookies;

  if (!titulo || !descripcion || !imagen_principal || !precio || !nivel) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (rol !== 'instructor') {
    return res.status(403).json({ error: 'Solo instructores pueden crear cursos' });
  }

  try {
    await pool.promise().query(
      `INSERT INTO cursos (titulo, descripcion, imagen_principal, imagenes_secundarias, precio, nivel, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        usuario // aquí debe ser el id del instructor guardado en la cookie/session
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
    habilitado
  } = req.body;

  const { usuario, rol } = req.cookies;

  if (rol !== 'instructor') {
    return res.status(403).json({ error: 'Solo instructores pueden actualizar cursos' });
  }

  try {
    const [resultado] = await pool.promise().query(
      `UPDATE cursos
       SET titulo = ?, descripcion = ?, imagen_principal = ?, imagenes_secundarias = ?, precio = ?, nivel = ?, habilitado = ?
       WHERE id = ? AND instructor_id = ?`,
      [
        titulo,
        descripcion,
        imagen_principal,
        JSON.stringify(imagenes_secundarias || []),
        precio,
        nivel,
        habilitado,
        id,
        usuario // validamos que el curso pertenezca al instructor logueado
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