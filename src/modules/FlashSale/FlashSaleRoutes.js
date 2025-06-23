// src/modules/FlashSale/FlashSaleRoutes.js
import express from 'express'
import {
  getFlashSales,
  getFlashSaleById,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  activateFlashSale,
  deactivateFlashSale
} from './FlashSaleController.js'

const flashSaleRouter = express.Router()

// Danh sách flash sale (GET), thêm mới (POST)
flashSaleRouter.get('/flash-sales', getFlashSales)
flashSaleRouter.post('/flash-sales/add', createFlashSale)

// Chi tiết flash sale
flashSaleRouter.get('/flash-sales/:id', getFlashSaleById)

// Cập nhật và xoá flash sale
flashSaleRouter.put('/flash-sales/edit/:id', updateFlashSale)
flashSaleRouter.delete('/flash-sales/:id', deleteFlashSale)

// Kích hoạt và hủy kích hoạt flash sale
flashSaleRouter.post('/flash-sales/:id/activate', activateFlashSale)
flashSaleRouter.post('/flash-sales/:id/deactivate', deactivateFlashSale)

export default flashSaleRouter
