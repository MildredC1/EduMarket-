import express from 'express';
import { listarCatalogo, listarPorCategoria, listarPorNivel } from '../controllers/catalogoController.js';

const router = express.Router();

// Catálogo completo (visitantes/estudiantes/instructores)
router.get('/catalogo', listarCatalogo);

// Filtrar por categoría
router.get('/catalogo/categoria/:categoria', listarPorCategoria);

// Filtrar por nivel
router.get('/catalogo/nivel/:nivel', listarPorNivel);

export default router;
