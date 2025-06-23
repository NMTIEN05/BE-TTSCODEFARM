const FlashSaleItemModel = require('../models/flashSaleItem.model')
const { StatusCodes } = require('http-status-codes')
const { flashSaleItemValidate } = require('../validations/flashSaleItemValidate')

exports.getFlashSaleItems = async (req, res) => {
  const { offset = 0, limit = 10, flashSaleId } = req.query
  const page = Math.max(parseInt(offset), 0)
  const perPage = Math.max(parseInt(limit), 1)

  const filter = {}
  if (flashSaleId) {
    filter.flash_sale_id = flashSaleId
  }

  try {
    const items = await FlashSaleItemModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * perPage)
      .limit(perPage)
      .populate('product_id', 'name price cover_image')

    const total = await FlashSaleItemModel.countDocuments(filter)

    return res.success(
      {
        data: items,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total
      },
      'Lấy danh sách flash sale item thành công'
    )
  } catch (err) {
    console.error(err)
    return res.error('Lỗi server khi lấy danh sách flash sale item')
  }
}

exports.getFlashSaleItemById = async (req, res) => {
  const { id } = req.params
  try {
    const item = await FlashSaleItemModel.findById(id).populate('product_id')
    if (!item) return res.error('Không tìm thấy flash sale item', 404)
    return res.success({ data: item }, 'Lấy flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Lỗi server khi lấy flash sale item')
  }
}

exports.createFlashSaleItem = async (req, res) => {
  const { error } = flashSaleItemValidate.create.validate(req.body)
  if (error) {
    return res.error(error.details.map(d => d.message), 400)
  }

  try {
    const created = await FlashSaleItemModel.create(req.body)
    return res.success({ data: created }, 'Tạo flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Lỗi khi tạo flash sale item', 500)
  }
}

exports.updateFlashSaleItem = async (req, res) => {
  const { id } = req.params

  const { error } = flashSaleItemValidate.update.validate(req.body)
  if (error) {
    return res.error(error.details.map(d => d.message), 400)
  }

  try {
    const updated = await FlashSaleItemModel.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (!updated) return res.error('Không tìm thấy flash sale item', 404)
    return res.success({ data: updated }, 'Cập nhật flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Cập nhật flash sale item thất bại', 400)
  }
}

exports.deleteFlashSaleItem = async (req, res) => {
  const { id } = req.params
  try {
    const deleted = await FlashSaleItemModel.findByIdAndDelete(id)
    if (!deleted) return res.error('Không tìm thấy flash sale item', 404)
    return res.success({ data: deleted }, 'Xoá flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Xoá flash sale item thất bại', 500)
  }
}

exports.activateFlashSaleItem = async (req, res) => {
  const { id } = req.params
  try {
    const updated = await FlashSaleItemModel.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    )
    return res.success({ data: updated }, 'Kích hoạt flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Lỗi khi kích hoạt', 500)
  }
}

exports.deactivateFlashSaleItem = async (req, res) => {
  const { id } = req.params
  try {
    const updated = await FlashSaleItemModel.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    )
    return res.success({ data: updated }, 'Huỷ kích hoạt flash sale item thành công')
  } catch (err) {
    console.error(err)
    return res.error('Lỗi khi huỷ kích hoạt', 500)
  }
}
