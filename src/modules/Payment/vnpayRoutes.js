import express from 'express'
import { vnpayController } from './vnpayController.js'

const router = express.Router()

router.post('/vnpay/create-payment', vnpayController.createPayment)
router.get('/vnpay/return', vnpayController.vnpayReturn)
router.get('/vnpay/ipn', vnpayController.vnpayIPN)

export default router