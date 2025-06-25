import crypto from 'crypto'
import { vnpayConfig } from '../../configs/vnpay.js'

export const createVnpayPaymentUrl = ({
  amount,
  orderId,
  orderInfo,
  ipAddr
}) => {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Số tiền không hợp lệ')
    }
    if (!orderId) {
      throw new Error('Mã đơn hàng không hợp lệ')
    }
    if (!orderInfo) {
      throw new Error('Thông tin đơn hàng không hợp lệ')
    }
    if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret) {
      throw new Error('Cấu hình VNPay chưa đầy đủ')
    }

    const date = new Date()
    const createDate = date
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(),
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    }

    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key]
        return acc
      }, {})

    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&')

    const secureHash = crypto.createHmac('sha512', vnpayConfig.hashSecret).update(signData).digest('hex')

    sortedParams['vnp_SecureHash'] = secureHash

    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&')

    const paymentUrl = `${vnpayConfig.url}?${queryString}`
    
    if (!paymentUrl || !paymentUrl.includes('vnp_SecureHash')) {
      throw new Error('Không thể tạo URL thanh toán hợp lệ')
    }
    
    return paymentUrl
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error)
    throw error
  }
}

export const verifyVnpayReturn = (vnpayParams) => {
  const secureHash = vnpayParams['vnp_SecureHash']
  const paramsCopy = { ...vnpayParams }
  delete paramsCopy['vnp_SecureHash']
  delete paramsCopy['vnp_SecureHashType']

  const sortedParams = Object.keys(paramsCopy)
    .sort()
    .reduce((acc, key) => {
      if (paramsCopy[key] !== '' && paramsCopy[key] !== null && paramsCopy[key] !== undefined) {
        acc[key] = decodeURIComponent(paramsCopy[key])
      }
      return acc
    }, {})

  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&')

  const checkSum = crypto.createHmac('sha512', vnpayConfig.hashSecret).update(signData).digest('hex')

  return {
    isValid: secureHash === checkSum,
    responseCode: vnpayParams['vnp_ResponseCode'],
    data: {
      orderId: vnpayParams['vnp_TxnRef'],
      amount: parseInt(vnpayParams['vnp_Amount']) / 100,
      orderInfo: vnpayParams['vnp_OrderInfo'],
      transactionNo: vnpayParams['vnp_TransactionNo'],
      bankCode: vnpayParams['vnp_BankCode'],
      payDate: vnpayParams['vnp_PayDate']
    }
  }
}