import pool from '../config/db.js';

//  Listar todas las categorías
export async function listarCategorias(req, res) {
  try {
    const [categorias] = await pool.promise().query(`
      SELECT id, nombre
      FROM categorias
      ORDER BY nombre ASC
    `);
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

//  Crear nueva categoría (solo admin)
export async function crearCategoria(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  try {
    await pool.promise().query(
      'INSERT INTO categorias (nombre) VALUES (?)',
      [nombre]
    );
    res.status(201).json({ mensaje: 'Categoría creada correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

//  Asignar categoría a curso (solo admin)
export async function asignarCategoriaACurso(req, res) {
  const { cursos_id, categoria_id } = req.body;

  if (!cursos_id || !categoria_id) {
    return res.status(400).json({ error: 'Curso y categoría son obligatorios' });
  }

  try {
    await pool.promise().query(
      'INSERT INTO categoria_cursos (cursos_id, categoria_id) VALUES (?, ?)',
      [cursos_id, categoria_id]
    );
    res.status(201).json({ mensaje: 'Categoría asignada al curso correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asignar categoría al curso' });
  }
}
