import cron from 'node-cron';
import FlashSale from '../modules/FlashSale/FlashSale.js';

// Chạy mỗi phút để cập nhật trạng thái flash sale
const updateFlashSaleStatus = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Kích hoạt flash sale đã đến thời gian bắt đầu
    await FlashSale.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: false,
        isDeleted: false
      },
      { isActive: true }
    );

    // Vô hiệu hóa flash sale đã hết hạn
    await FlashSale.updateMany(
      {
        endDate: { $lt: now },
        isActive: true,
        isDeleted: false
      },
      { isActive: false }
    );

    console.log('Flash sale status updated at:', now);
  } catch (error) {
    console.error('Error updating flash sale status:', error);
  }
}, {
  scheduled: false
});

export { updateFlashSaleStatus };