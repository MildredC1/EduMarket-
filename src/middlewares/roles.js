// Solo administradores
export function soloAdmin(req, res, next) {
  const { rol } = req.cookies;

  if (rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: requiere rol admin' });
  }

  next();
}
export function soloEstudiante(req, res, next) {
  const { rol } = req.cookies;
  if (rol !== 'estudiante') {
    return res.status(403).json({ error: 'Acceso restringido a estudiantes' });
  }
  next();
}


// Solo instructores
export function soloInstructor(req, res, next) {
  const { rol } = req.cookies;

  if (rol !== 'instructor') {
    return res.status(403).json({ error: 'Acceso denegado: requiere rol instructor' });
  }

  next();
}

// Solo soporte
export function soloSoporte(req, res, next) {
  const { rol } = req.cookies;

  if (rol !== 'soporte') {
    return res.status(403).json({ error: 'Acceso denegado: requiere rol soporte' });
  }

  next();
}
