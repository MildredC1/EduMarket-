import express from 'express';
import { inscribirseEnCurso, listarCursosInscritos } from '../controllers/inscripcionesController.js';
import { verificarSesion } from '../middlewares/sesion.js';
import { soloEstudiante } from '../middlewares/roles.js';

const router = express.Router();

// Inscribirse en curso (solo estudiantes con sesión)
router.post('/cursos/:id/inscribirse', verificarSesion, soloEstudiante, inscribirseEnCurso);

// Ver cursos inscritos (solo estudiantes con sesión)
router.get('/estudiante/cursos', verificarSesion, soloEstudiante, listarCursosInscritos);

export default router;
