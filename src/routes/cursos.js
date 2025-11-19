import express from 'express';
import { listarCursos, crearCurso, actualizarCurso } from '../controllers/cursosController.js';
import { verificarSesion } from '../middlewares/sesion.js';
import { soloInstructor } from '../middlewares/roles.js';

const router = express.Router();

// Ver cursos públicos (sin sesión)
router.get('/', listarCursos);

// Crear curso (solo instructores con sesión)
router.post('/', verificarSesion, soloInstructor, crearCurso);

// Actualizar curso (solo instructores con sesión)
router.put('/:id', verificarSesion, soloInstructor, actualizarCurso);

export default router;
