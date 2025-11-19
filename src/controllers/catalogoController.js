import pool from '../config/db.js';

// Listar catálogo completo (solo cursos habilitados)
export async function listarCatalogo(req, res) {
  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido,
             GROUP_CONCAT(cat.nombre) AS categorias
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      LEFT JOIN categoria_cursos cc ON cc.cursos_id = c.id
      LEFT JOIN categorias cat ON cat.id = cc.categoria_id
      WHERE c.habilitado = 1
      GROUP BY c.id
    `);

    // Transformar la cadena de categorías en array
    const cursosFormateados = cursos.map(curso => ({
      ...curso,
      categorias: curso.categorias ? curso.categorias.split(',') : []
    }));

    res.json(cursosFormateados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener catálogo de cursos' });
  }
}

// Filtrar cursos por categoría
export async function listarPorCategoria(req, res) {
  const { categoria } = req.params;
  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      JOIN categoria_cursos cc ON cc.cursos_id = c.id
      JOIN categorias cat ON cat.id = cc.categoria_id
      WHERE c.habilitado = 1 AND cat.nombre = ?
    `, [categoria]);

    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al filtrar cursos por categoría' });
  }
}

// Filtrar cursos por nivel
export async function listarPorNivel(req, res) {
  const { nivel } = req.params;
  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido
      FROM cursos c
      JOIN usuarios u ON u.id = c.instructor_id
      WHERE c.habilitado = 1 AND c.nivel = ?
    `, [nivel]);

    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al filtrar cursos por nivel' });
  }
}
