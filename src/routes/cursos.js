import express from 'express';
import { listarCursos, crearCurso, verDetalleCurso,actualizarCurso,listarCursosInstructor } from '../controllers/cursosController.js';
import { verificarSesion } from '../middlewares/sesion.js';
import { soloAdminOInstructor, soloInstructor } from '../middlewares/roles.js';

const router = express.Router();

// Ver cursos públicos (sin sesión)
router.get('/', listarCursos);
//ver el detalle del curso 
router.get('/catalogo/cursos/:id', verDetalleCurso);
// Crear curso (solo instructores con sesión)
router.post('/', verificarSesion, soloAdminOInstructor, crearCurso);

// Actualizar curso (solo instructores con sesión)
router.put('/:id', verificarSesion, soloAdminOInstructor, actualizarCurso);

// Ver cursos creados por el instructor logueado
router.get('/mis-cursos', verificarSesion, soloAdminOInstructor, listarCursosInstructor);

export default router;
