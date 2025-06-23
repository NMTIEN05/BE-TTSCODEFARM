const express = require('express')
const router = express.Router()
const flashSaleItemController = require('../controllers/flashSaleItem.controller')

router.get('/', flashSaleItemController.getFlashSaleItems)
router.get('/:id', flashSaleItemController.getFlashSaleItemById)
router.post('/', flashSaleItemController.createFlashSaleItem)
router.put('/:id', flashSaleItemController.updateFlashSaleItem)
router.delete('/:id', flashSaleItemController.deleteFlashSaleItem)
router.patch('/:id/activate', flashSaleItemController.activateFlashSaleItem)
router.patch('/:id/deactivate', flashSaleItemController.deactivateFlashSaleItem)

module.exports = router
