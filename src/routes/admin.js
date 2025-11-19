import express from 'express';
import {
  listarUsuarios,
  cambiarRol,
  actualizarFoto,
  listarCursosAdmin,
  cambiarEstadoCurso
} from '../controllers/adminController.js';

import { verificarSesion } from '../middlewares/sesion.js';
import { soloAdmin } from '../middlewares/roles.js';

const router = express.Router();

// Usuarios
router.get('/usuarios', verificarSesion, soloAdmin, listarUsuarios);
router.put('/usuarios/:id/rol', verificarSesion, soloAdmin, cambiarRol);
router.put('/usuarios/:id/foto', verificarSesion, soloAdmin, actualizarFoto);

// Cursos
router.get('/cursos', verificarSesion, soloAdmin, listarCursosAdmin);
router.put('/cursos/:id/estado', verificarSesion, soloAdmin, cambiarEstadoCurso);

export default router;
