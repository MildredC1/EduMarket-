import pool from '../config/db.js';
import bcrypt from 'bcryptjs';


export async function registrarse(req, res) {
  const { nombre, apellido, correo, contrasena } = req.body;

  if (!nombre || !apellido || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try { 
    const [existe] = await pool.promise().query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const [resultado] = await pool.promise().query(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hash, 'instructor']
    );

    // Obtener el usuario recién creado
    const [[usuario]] = await pool.promise().query(
      'SELECT id, nombre, apellido, correo, rol FROM usuarios WHERE id = ?',
      [resultado.insertId]
    );

    // Guardar cookies 
    res.cookie('usuario', usuario.id, { httpOnly: true, maxAge: 3600000 });
    res.cookie('rol', usuario.rol, { httpOnly: true, maxAge: 3600000 });

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario
    });
  } catch (error) { 
    console.error('Error en registrarse:', error);
    
    res.status(500).json({ error: 'Error interno del servidor en el registro' });
  }
}


export async function iniciarSesion(req, res) {
  try {
    const { correo, contrasena } = req.body;

    const [[usuario]] = await pool.promise().query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const valido = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.cookie('usuario', usuario.id, { httpOnly: true, maxAge: 3600000 });
    res.cookie('rol', usuario.rol, { httpOnly: true, maxAge: 3600000 });

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
export async function cerrarSesion(req, res) {
  try {
    res.clearCookie('usuario');
    res.clearCookie('rol');
    res.json({ mensaje: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en cerrarSesion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
