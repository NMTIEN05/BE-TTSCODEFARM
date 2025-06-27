
import Book from "./Book.js";
import Author from "../Author/Author.js";
import Category from "../Category/Category.js";
import { BookValidate } from "./bookValidate.js";


export const createBook = async (req, res) => {
  const {
    category_id,
    title,
    author_id,
    publisher,
    publish_year,
    description,
    price,
    stock_quantity,
    cover_image,
    is_available,
    format,
  } = req.body;
  
  console.log('Create book request body:', req.body);
  
  try {
    // Xác thực dữ liệu
    const { error } = BookValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }
    // Kiểm tra author_id tồn tại
    const author = await Author.findById(author_id);
    if (!author) {
      return res.error("Tác giả không tồn tại", 400);
    }
    // Kiểm tra category_id tồn tại
    const category = await Category.findById(category_id);
    if (!category) {
      return res.error("Danh mục không tồn tại", 400);
    }
    // Kiểm tra sách đã tồn tại
    const existingBook = await Book.findOne({ title, author_id });
    if (existingBook) {
      return res.error("Sách đã tồn tại", 400);
    }
    // Tạo và lưu sách
    const newBook = new Book({
      category_id,
      title,
      author_id,
      publisher,
      publish_year,
      description,
      price,
      stock_quantity: Number(stock_quantity) || 0,
      cover_image,
      is_available: is_available !== undefined ? is_available : true,
      format: format || 'paperback',
      created_at: new Date(),
      updated_at: new Date(),
    });
    await newBook.save();
    return res.success(
      { data: newBook },
      "Tạo sách thành công",
      201
    );
  } catch (error) {
    console.error("Lỗi khi tạo sách:", error); // Ghi log lỗi chi tiết
    return res.error(`Lỗi server khi tạo sách: ${error.message}`, 500);
  }
};
// Lấy danh sách sách
export const getBooks = async (req, res) => {
  const {
    offset = 0,
    limit = 5,
    title,
    search, // Thêm parameter search để tương thích
    category_id,
    author_id,
    sortBy = "createdAt",
    order = "desc",
    includeDeleted = false,
  } = req.query;

  const query = {};
  
  // Hỗ trợ tìm kiếm cả title và search parameter
  if (title || search) {
    const searchTerm = title || search;
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { publisher: { $regex: searchTerm, $options: "i" } }
    ];
  }
  
  if (category_id) {
    query.category_id = category_id;
  }
  if (author_id) {
    query.author_id = author_id;
  }

  // Lọc theo trạng thái xóa
  if (includeDeleted === 'true') {
    query.deleted_at = { $ne: null };
  } else {
    query.deleted_at = { $eq: null };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    console.log('Books query:', query);
    const books = await Book.find(query)
      .populate("category_id", "name")
      .populate("author_id", "name")
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);
    console.log('Books found:', books.length, 'Total:', total);

    return res.success(
      {
        data: books,
        offset: parseInt(offset),
        limit: parseInt(limit),
        totalItems: total,
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
      "Lấy danh sách sách thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi lấy danh sách sách");
  }
};

// Lấy thông tin sách theo ID
export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findOne({ _id: id, deleted_at: null })
      .populate("category_id", "name")
      .populate("author_id", "name");

    if (!book) {
      return res.error("Không tìm thấy sách", 404);
    }

    return res.success({ data: book }, "Lấy thông tin sách thành công");
  } catch (error) {
    return res.error("Lỗi server khi lấy thông tin sách", 500);
  }
};

// Cập nhật sách
export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { category_id, title, author_id, publisher, publish_year, description, price, stock_quantity, cover_image, is_available, format } = req.body;

  try {
    console.log('Update book request:', { id, body: req.body });
    
    // Xác thực dữ liệu
    const { error } = BookValidate.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    // Kiểm tra danh mục tồn tại
    const category = await Category.findById(category_id);
    if (!category) {
      return res.error("Danh mục không tồn tại", 404);
    }

    // Kiểm tra tác giả tồn tại
    const author = await Author.findById(author_id);
    if (!author) {
      return res.error("Tác giả không tồn tại", 404);
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          category_id,
          title,
          author_id,
          publisher,
          publish_year,
          description,
          price,
          stock_quantity,
          cover_image,
          is_available,
          format,
        },
      },
      { new: true }
    ).populate("category_id", "name").populate("author_id", "name");

    if (!updatedBook) {
      return res.error( "Không tìm thấy sách", 404);
    }

    return res.success(
      { data: updatedBook },
      "Cập nhật sách thành công"
    );
  } catch (error) {
    console.error('Update book error:', error);
    return res.error(`Lỗi server khi cập nhật sách: ${error.message}`, 500);
  }
};

// Xóa mềm sách
export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await Book.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!deletedBook) {
      return res.error("Không tìm thấy sách", 404);
    }

    return res.success(
      { data: deletedBook },
      "Xóa sách thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi xóa sách", 500);
  }
};

// Khôi phục sách
export const restoreBook = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredBook = await Book.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null },
      { new: true }
    ).populate("category_id", "name").populate("author_id", "name");

    if (!restoredBook) {
      return res.error("Không tìm thấy sách đã xóa", 404);
    }

    return res.success(
      { data: restoredBook },
      "Khôi phục sách thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi khôi phục sách", 500);
  }
};

// Tìm kiếm sách
export const searchBooks = async (req, res) => {
  const {
    q = '',
    offset = 0,
    limit = 20,
    sortBy = 'relevance',
    minPrice,
    maxPrice,
    category_id,
    author_id
  } = req.query;

  try {
    if (!q.trim()) {
      return res.error("Từ khóa tìm kiếm không được để trống", 400);
    }

    // Tạo query tìm kiếm
    const searchQuery = {
      deleted_at: null,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { publisher: { $regex: q, $options: 'i' } }
      ]
    };

    // Thêm filter theo giá
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    // Thêm filter theo category
    if (category_id) {
      searchQuery.category_id = category_id;
    }

    // Thêm filter theo author
    if (author_id) {
      searchQuery.author_id = author_id;
    }

    // Tạo sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'name':
        sortOptions = { title: 1 };
        break;
      case 'newest':
        sortOptions = { created_at: -1 };
        break;
      case 'relevance':
      default:
        // Sắp xếp theo độ liên quan (title match trước, sau đó theo created_at)
        sortOptions = { created_at: -1 };
        break;
    }

    // Thực hiện tìm kiếm
    const books = await Book.find(searchQuery)
      .populate('category_id', 'name')
      .populate('author_id', 'name')
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Book.countDocuments(searchQuery);

    // Tính toán relevance score cho sorting
    if (sortBy === 'relevance') {
      books.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, q);
        const bScore = calculateRelevanceScore(b, q);
        return bScore - aScore;
      });
    }

    return res.success(
      {
        data: books,
        offset: parseInt(offset),
        limit: parseInt(limit),
        total,
        query: q,
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      `Tìm thấy ${total} sản phẩm cho "${q}"`
    );
  } catch (error) {
    console.error('Search error:', error);
    return res.error("Lỗi server khi tìm kiếm sách", 500);
  }
};

// Hàm tính điểm relevance
function calculateRelevanceScore(book, query) {
  let score = 0;
  const queryLower = query.toLowerCase();
  const titleLower = book.title.toLowerCase();
  const descriptionLower = (book.description || '').toLowerCase();
  const publisherLower = (book.publisher || '').toLowerCase();

  // Title match có điểm cao nhất
  if (titleLower.includes(queryLower)) {
    score += 10;
    // Exact match có điểm cao hơn
    if (titleLower === queryLower) {
      score += 20;
    }
    // Match ở đầu title có điểm cao hơn
    if (titleLower.startsWith(queryLower)) {
      score += 15;
    }
  }

  // Description match
  if (descriptionLower.includes(queryLower)) {
    score += 5;
  }

  // Publisher match
  if (publisherLower.includes(queryLower)) {
    score += 3;
  }

  // Author name match (nếu có populate)
  if (book.author_id && book.author_id.name) {
    const authorLower = book.author_id.name.toLowerCase();
    if (authorLower.includes(queryLower)) {
      score += 8;
    }
  }

  return score;
}

// Lấy gợi ý tìm kiếm
export const getSearchSuggestions = async (req, res) => {
  const { q = '', limit = 5 } = req.query;

  try {
    if (!q.trim()) {
      return res.success({ data: [] }, "Không có từ khóa tìm kiếm");
    }

    const suggestions = await Book.find({
      deleted_at: null,
      title: { $regex: q, $options: 'i' }
    })
    .select('title cover_image price')
    .limit(parseInt(limit))
    .sort({ title: 1 });

    return res.success(
      { data: suggestions },
      "Lấy gợi ý tìm kiếm thành công"
    );
  } catch (error) {
    console.error('Get suggestions error:', error);
    return res.error("Lỗi server khi lấy gợi ý tìm kiếm", 500);
  }
};