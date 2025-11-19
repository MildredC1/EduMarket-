export function verificarSesion(req, res, next) {
  const { usuario, rol } = req.cookies; 

  if (!usuario || !rol) {
    return res.status(401).json({ error: 'Sesión no válida o expirada' });
  }

  next();
}
