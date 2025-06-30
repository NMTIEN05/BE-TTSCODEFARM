import express from 'express';
import flashSaleController from './flashSaleController.js';

const router = express.Router();

// Flash Sale routes
router.get('/', flashSaleController.getAll);
router.get('/active-products', flashSaleController.getActiveFlashSaleProducts);
router.get('/:id', flashSaleController.getById);
router.post('/', flashSaleController.create);
router.patch('/:id', flashSaleController.update);
router.delete('/:id', flashSaleController.delete);

// Flash Sale Items routes
router.get('/items/all', flashSaleController.getAllItems);
router.get('/items/:id', flashSaleController.getItemById);
router.post('/items', flashSaleController.createItem);
router.patch('/items/:id', flashSaleController.updateItem);
router.delete('/items/:id', flashSaleController.deleteItem);

export default router;