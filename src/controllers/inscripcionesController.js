import pool from '../config/db.js';

// Inscribir estudiante en un curso
export async function inscribirseEnCurso(req, res) {
  const { id } = req.params; // id del curso
  const { usuario, rol } = req.cookies;

  if (rol !== 'estudiante') {
    return res.status(403).json({ error: 'Solo estudiantes pueden inscribirse en cursos' });
  }

  try {
    // Evitar inscripción duplicada
    const [existe] = await pool.promise().query(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [usuario, id]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    // Insertar inscripción
    await pool.promise().query(
      'INSERT INTO inscripciones (usuario_id, curso_id) VALUES (?, ?)',
      [usuario, id]
    );

    res.status(201).json({ mensaje: 'Inscripción realizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al inscribirse en el curso' });
  }
}

// Listar cursos inscritos por el estudiante
export async function listarCursosInscritos(req, res) {
  const { usuario, rol } = req.cookies;

  if (rol !== 'estudiante') {
    return res.status(403).json({ error: 'Solo estudiantes pueden ver sus cursos inscritos' });
  }

  try {
    const [cursos] = await pool.promise().query(`
      SELECT c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.habilitado,
             u.nombre AS instructor_nombre, u.apellido AS instructor_apellido,
             i.fecha_inscripcion
      FROM inscripciones i
      JOIN cursos c ON c.id = i.curso_id
      JOIN usuarios u ON u.id = c.instructor_id
      WHERE i.usuario_id = ?
    `, [usuario]);

    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos inscritos' });
  }
}
