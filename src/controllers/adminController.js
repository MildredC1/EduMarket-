import pool from '../config/db.js';

// Listar todos los usuarios
export async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await pool.promise().query(`
      SELECT id, nombre, apellido, correo, rol, foto_url, creado_en, actualizado_en
      FROM usuarios
    `);
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// Cambiar rol de un usuario
export async function cambiarRol(req, res) {
  const { id } = req.params;
  const { rol } = req.body;

  // Validar con los roles definidos en la tabla
  const rolesValidos = ['visitante', 'estudiante', 'instructor', 'soporte', 'admin'];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    await pool.promise().query(
      'UPDATE usuarios SET rol = ? WHERE id = ?',
      [rol, id]
    );
    res.json({ mensaje: `Rol actualizado a ${rol}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
}

// Actualizar foto de perfil de un usuario
export async function actualizarFoto(req, res) {
  const { id } = req.params;
  const { foto_url } = req.body;

  if (!foto_url) {
    return res.status(400).json({ error: 'La URL de la foto es obligatoria' });
  }

  try {
    await pool.promise().query(
      'UPDATE usuarios SET foto_url = ? WHERE id = ?',
      [foto_url, id]
    );
    res.json({ mensaje: 'Foto de perfil actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar foto de perfil' });
  }
}

// Habilitar o deshabilitar curso (relación con tabla cursos)
export async function cambiarEstadoCurso(req, res) {
  const { id } = req.params;
  const { habilitado } = req.body;

  try {
    await pool.promise().query(
      'UPDATE cursos SET habilitado = ? WHERE id = ?',
      [habilitado, id]
    );
    res.json({ mensaje: `Curso ${habilitado ? 'habilitado' : 'deshabilitado'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar estado del curso' });
  }
}
