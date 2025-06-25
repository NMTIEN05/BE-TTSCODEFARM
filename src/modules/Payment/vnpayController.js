import { createVnpayPaymentUrl, verifyVnpayReturn } from './vnpayService.js'
import Payment from './Payment.js'
import Order from '../Order/Order.js'
import OrderDetail from '../OrderDetail/OrderDetail.js'
import Cart from '../Cart/Cart.js'
import CartItem from '../CartItem/CartItem.js'

export const vnpayController = {
  createPayment: async (req, res) => {
    try {
      console.log('Full req.body:', req.body)
      const { amount, orderId, orderData } = req.body
      const ipAddr = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1'

      console.log('Destructured:', { amount, orderId, orderData })
      console.log('Types:', { 
        amount: typeof amount, 
        orderId: typeof orderId, 
        orderData: typeof orderData 
      })
      
      if (!amount || !orderId || !orderData) {
        return res.status(400).json({ 
          success: false,
          message: 'Thiếu thông tin thanh toán',
          error: 'MISSING_PAYMENT_INFO',
          received: { 
            amount: !!amount, 
            orderId: !!orderId, 
            orderData: !!orderData,
            fullBody: req.body
          }
        })
      }

      // Chuyển orderData thành string để truyền qua VNPay
      const orderInfoString = JSON.stringify(orderData)
      console.log('OrderData string length:', orderInfoString.length)
      console.log('OrderData content:', orderData)
      
      // VNPay giới hạn orderInfo 255 ký tự, nếu quá dài thì lưu vào database riêng
      let orderInfo
      if (orderInfoString.length > 200) {
        // Lưu orderData vào session hoặc database tạm thời
        orderInfo = `VNPAY_${orderId}_${orderData.user_id || 'GUEST'}`
        // TODO: Lưu orderData vào Redis hoặc database tạm
      } else {
        orderInfo = orderInfoString
      }
      
      const paymentUrl = createVnpayPaymentUrl({
        amount: Number(amount),
        orderId: orderId.toString(),
        orderInfo: orderInfo,
        ipAddr: ipAddr.toString()
      })
      
      if (!paymentUrl) {
        return res.status(500).json({ 
          success: false,
          message: 'Không thể tạo URL thanh toán',
          error: 'PAYMENT_URL_GENERATION_FAILED'
        })
      }

      return res.json({ 
        success: true,
        paymentUrl,
        message: 'Tạo URL thanh toán thành công'
      })
    } catch (error) {
      console.error('VNPay create payment error:', error)
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi hệ thống khi tạo thanh toán',
        error: error.message
      })
    }
  },

  vnpayReturn: async (req, res) => {
    try {
      console.log('VNPay Return API called')
      console.log('Query params:', req.query)
      
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)
      
      console.log('Verification result:', result)
      
      if (result.responseCode === '00') {
        // Lấy thông tin từ orderInfo để tạo đơn hàng
        let orderData
        try {
          const orderInfo = result.data.orderInfo
          console.log('Processing orderInfo:', orderInfo)
          
          if (orderInfo.startsWith('VNPAY_')) {
            // Nếu là format VNPAY_orderId_userId
            const parts = orderInfo.split('_')
            const userId = parts[2] !== 'GUEST' ? parts[2] : null
            console.log('Extracted userId from orderInfo:', userId)
            
            orderData = {
              user_id: userId,
              shipping_address: 'VNPay Order - Chưa có địa chỉ chi tiết',
              shipping_fee: 0,
              tax: 0,
              details: [{
                book_id: '000000000000000000000000', // Placeholder
                quantity: 1,
                price: result.data.amount
              }]
            }
          } else if (orderInfo.startsWith('Order_')) {
            // Format cũ để tương thích
            orderData = {
              user_id: null,
              shipping_address: 'Default Address',
              shipping_fee: 0,
              tax: 0,
              details: []
            }
          } else {
            // Thử parse JSON
            orderData = JSON.parse(orderInfo)
          }
        } catch (error) {
          console.log('Cannot parse orderInfo, using default:', error)
          orderData = {
            user_id: null,
            shipping_address: 'Default Address',
            shipping_fee: 0,
            tax: 0,
            details: []
          }
        }
        
        console.log('Order data from VNPay:', orderData)
        
        // Tạo đơn hàng
        console.log('OrderData received:', orderData)
        console.log('User ID from orderData:', orderData.user_id)
        
        const newOrder = new Order({
          user_id: orderData.user_id || null,
          cart_id: orderData.cart_id || null,
          total_amount: result.data.amount,
          shipping_address: orderData.shipping_address,
          payment_method: 'vnpay',
          shipping_fee: orderData.shipping_fee || 0,
          tax: orderData.tax || 0,
          status: 'confirmed',
          customer_info: {
            name: orderData.customer_name,
            phone: orderData.customer_phone,
            email: orderData.customer_email,
            note: orderData.note
          }
        })
        
        console.log('Creating order with user_id:', newOrder.user_id)
        
        const savedOrder = await newOrder.save()
        console.log('Order created:', savedOrder._id)
        
        // Tạo chi tiết đơn hàng
        if (orderData.details && orderData.details.length > 0) {
          for (const item of orderData.details) {
            await OrderDetail.create({
              order_id: savedOrder._id,
              book_id: item.book_id,
              variant_id: item.variant_id || null,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price
            })
          }
          console.log('Order details created')
        } else {
          // Nếu không có details, tạo một item mặc định
          console.log('No order details, creating default item')
        }
        
        // Tạo/cập nhật Payment record
        await Payment.findOneAndUpdate(
          { transaction_id: result.data.transactionNo },
          { 
            order_id: savedOrder._id,
            status: 'success',
            transaction_id: result.data.transactionNo,
            payment_date: new Date(),
            amount: result.data.amount,
            payment_method: 'vnpay'
          },
          { upsert: true }
        )
        
        // Xóa giỏ hàng sau khi đặt hàng thành công
        if (orderData.cart_id) {
          await CartItem.deleteMany({ cart_id: orderData.cart_id })
          await Cart.findByIdAndDelete(orderData.cart_id)
          console.log('Cart cleared after successful order')
        }

        console.log('Payment and order processing completed')

        return res.json({
          success: true,
          message: 'Thanh toán và tạo đơn hàng thành công',
          data: {
            ...result.data,
            order_id: savedOrder._id
          },
          verified: result.isValid
        })
      } else {
        // Cập nhật trạng thái thanh toán thất bại
        await Payment.findOneAndUpdate(
          { transaction_id: result.data.transactionNo },
          { 
            status: 'failed',
            transaction_id: result.data.transactionNo,
            amount: result.data.amount,
            payment_method: 'vnpay'
          },
          { upsert: true }
        )

        return res.json({
          success: false,
          message: 'Thanh toán thất bại',
          code: result.responseCode,
          data: result.data,
          verified: result.isValid
        })
      }
    } catch (error) {
      console.error('VNPay return error:', error)
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xác thực thanh toán',
        error: error.message
      })
    }
  },

  vnpayIPN: async (req, res) => {
    try {
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)
      
      if (result.responseCode === '00') {
        await Payment.findOneAndUpdate(
          { order_id: result.data.orderId },
          { 
            status: 'success',
            transaction_id: result.data.transactionNo,
            payment_date: new Date()
          }
        )

        await Order.findByIdAndUpdate(result.data.orderId, {
          status: 'confirmed'
        })

        return res.json({ RspCode: '00', Message: 'success' })
      } else {
        await Payment.findOneAndUpdate(
          { order_id: result.data.orderId },
          { status: 'failed' }
        )
        
        return res.json({ RspCode: '01', Message: 'failed' })
      }
    } catch (error) {
      console.error('VNPay IPN error:', error)
      return res.json({ RspCode: '99', Message: 'error' })
    }
  }
}