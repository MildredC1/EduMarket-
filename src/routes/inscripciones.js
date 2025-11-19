import express from 'express';
import { inscribirseEnCurso, listarCursosInscritos } from '../controllers/inscripcionesController.js';

const router = express.Router();

// Inscribirse en curso
router.post('/cursos/:id/inscribirse', inscribirseEnCurso);

// Ver cursos inscritos
router.get('/estudiante/cursos', listarCursosInscritos);

export default router;
