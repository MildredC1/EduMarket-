import express from 'express';
import { verificarSesion } from '../middlewares/sesion.js';
import { soloAdmin } from '../middlewares/roles.js';
import {
  listarCategorias,
  crearCategoria,
  asignarCategoriaACurso
} from '../controllers/categoriaController.js';

const router = express.Router();

// Listar categorías (público)
router.get('/', listarCategorias);

// Crear categoría (solo admin)
router.post('/', verificarSesion, soloAdmin, crearCategoria);

// Asignar categoría a curso (solo admin)
router.post('/asignar', verificarSesion, soloAdmin, asignarCategoriaACurso);

export default router;
