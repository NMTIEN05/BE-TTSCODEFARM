import FlashSale from './FlashSale.js';
import FlashSaleItem from './FlashSaleItem.js';

const flashSaleController = {
  // Flash Sale CRUD
  getAll: async (req, res) => {
    try {
      const flashSales = await FlashSale.find({ isDeleted: false }).sort({ createdAt: -1 });
      res.json({ success: true, results: flashSales });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const flashSale = await FlashSale.findById(req.params.id);
      if (!flashSale || flashSale.isDeleted) {
        return res.status(404).json({ success: false, message: 'Flash sale not found' });
      }
      res.json({ success: true, data: flashSale });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const flashSale = new FlashSale(req.body);
      await flashSale.save();
      res.status(201).json({ success: true, data: flashSale });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const flashSale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!flashSale) {
        return res.status(404).json({ success: false, message: 'Flash sale not found' });
      }
      res.json({ success: true, data: flashSale });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await FlashSale.findByIdAndUpdate(req.params.id, { 
        isDeleted: true, 
        deletedAt: new Date() 
      });
      res.json({ success: true, message: 'Flash sale deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Flash Sale Items CRUD
  getAllItems: async (req, res) => {
    try {
      const { flashSaleId } = req.query;
      const query = flashSaleId ? { flashSaleId } : {};
      
      const items = await FlashSaleItem.find(query)
        .populate('flashSaleId', 'name')
        .populate('productId', 'title price cover_image')
        .populate('variantId', 'sku price')
        .sort({ createdAt: -1 });
      
      res.json({ success: true, results: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getItemById: async (req, res) => {
    try {
      const item = await FlashSaleItem.findById(req.params.id)
        .populate('flashSaleId', 'name')
        .populate('productId', 'title price cover_image')
        .populate('variantId', 'sku price');
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Flash sale item not found' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createItem: async (req, res) => {
    try {
      const item = new FlashSaleItem(req.body);
      await item.save();
      
      const populatedItem = await FlashSaleItem.findById(item._id)
        .populate('flashSaleId', 'name')
        .populate('productId', 'title price cover_image')
        .populate('variantId', 'sku price');
      
      res.status(201).json({ success: true, data: populatedItem });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const item = await FlashSaleItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('flashSaleId', 'name')
        .populate('productId', 'title price cover_image')
        .populate('variantId', 'sku price');
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Flash sale item not found' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteItem: async (req, res) => {
    try {
      await FlashSaleItem.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Flash sale item deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get active flash sale products for client
  getActiveFlashSaleProducts: async (req, res) => {
    try {
      const now = new Date();
      const activeFlashSales = await FlashSale.find({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      if (activeFlashSales.length === 0) {
        return res.json({ success: true, results: [] });
      }

      const flashSaleIds = activeFlashSales.map(fs => fs._id);
      const items = await FlashSaleItem.find({ flashSaleId: { $in: flashSaleIds } })
        .populate('productId', 'title price cover_image author category')
        .populate('flashSaleId', 'name startDate endDate')
        .limit(8);

      res.json({ success: true, results: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default flashSaleController;