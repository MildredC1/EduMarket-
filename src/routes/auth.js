import express from 'express';
import { registrarse, iniciarSesion,cerrarSesion } from '../controllers/authController.js';

const router = express.Router();

// Registro
router.post('/registrarse',registrarse);

// Login
router.post('/login', iniciarSesion);

// Logout
router.post('/logout', cerrarSesion);

export default router;
