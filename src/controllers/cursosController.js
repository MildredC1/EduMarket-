
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

