import express from 'express';
import { registrarse, iniciarSesion } from '../controllers/authController.js';

const router = express.Router();

// Registro
router.post('/registrarse',registrarse);

// Login
router.post('/login', iniciarSesion);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('usuario');
  res.clearCookie('rol');
  res.json({ mensaje: 'Sesión cerrada correctamente' });
});

export default router;
