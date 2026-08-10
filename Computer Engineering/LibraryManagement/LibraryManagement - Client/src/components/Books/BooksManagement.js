import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './BooksManagement.css';

// Tách BookModal thành component riêng để tránh re-render
const BookModal = React.memo(({ 
  show, 
  title, 
  onClose, 
  onSubmit, 
  formData,
  errors,
  categories,
  onInputChange,
  loading 
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="title">Tên sách *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Nhập tên sách"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">Tác giả *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={onInputChange}
              className={`form-control ${errors.author ? 'error' : ''}`}
              placeholder="Nhập tên tác giả"
            />
            {errors.author && <span className="error-message">{errors.author}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Thể loại *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className={`form-control ${errors.category ? 'error' : ''}`}
              >
                <option value="">Chọn thể loại</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="publishYear">Năm xuất bản *</label>
              <input
                type="number"
                id="publishYear"
                name="publishYear"
                value={formData.publishYear}
                onChange={onInputChange}
                className={`form-control ${errors.publishYear ? 'error' : ''}`}
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.publishYear && <span className="error-message">{errors.publishYear}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="publisher">Nhà xuất bản</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={onInputChange}
              className="form-control"
              placeholder="Nhập tên nhà xuất bản"
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalCopies">Số lượng *</label>
            <input
              type="number"
              id="totalCopies"
              name="totalCopies"
              value={formData.totalCopies}
              onChange={onInputChange}
              className={`form-control ${errors.totalCopies ? 'error' : ''}`}
              placeholder="1"
              min="1"
            />
            {errors.totalCopies && <span className="error-message">{errors.totalCopies}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className="form-control"
              placeholder="Nhập mô tả sách"
              rows="3"
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

BookModal.displayName = 'BookModal';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    publishYear: '',
    publisher: '',
    totalCopies: 1,
    availableCopies: 1,
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Mock categories
  const categories = [
    'Công nghệ thông tin',
    'Văn học',
    'Khoa học',
    'Lịch sử',
    'Kinh tế',
    'Tâm lý học',
    'Giáo dục',
    'Nghệ thuật'
  ];

  // Load books data
  useEffect(() => {
    loadBooks();
  }, []);

  // Filter books based on search and category
  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, filterCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const savedBooks = localStorage.getItem('library_books');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data if no saved data
      const mockBooks = [
        {
          id: 1,
          title: 'Clean Code',
          author: 'Robert C. Martin',
          category: 'Công nghệ thông tin',
          publishYear: 2008,
          publisher: 'Prentice Hall',
          totalCopies: 5,
          availableCopies: 3,
          description: 'A Handbook of Agile Software Craftsmanship'
        },
        {
          id: 2,
          title: 'Design Patterns',
          author: 'Gang of Four',
          category: 'Công nghệ thông tin',
          publishYear: 1994,
          publisher: 'Addison-Wesley',
          totalCopies: 3,
          availableCopies: 2,
          description: 'Elements of Reusable Object-Oriented Software'
        },
        {
          id: 3,
          title: 'Tôi Tài Giỏi, Bạn Cũng Thế',
          author: 'Adam Khoo',
          category: 'Tâm lý học',
          publishYear: 2005,
          publisher: 'NXB Trẻ',
          totalCopies: 4,
          availableCopies: 4,
          description: 'Cuốn sách về phát triển bản thân'
        }
      ];
      
      setBooks(mockBooks);
      // Save to localStorage
      localStorage.setItem('library_books', JSON.stringify(mockBooks));
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = useCallback(() => {
    let filtered = books;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(book => book.category === filterCategory);
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books, searchTerm, filterCategory]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        return {
          ...prev,
          [name]: ''
        };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên sách không được để trống';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Tác giả không được để trống';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn thể loại';
    }

    if (!formData.publishYear || formData.publishYear < 1900 || formData.publishYear > new Date().getFullYear()) {
      newErrors.publishYear = 'Năm xuất bản không hợp lệ';
    }

    if (!formData.totalCopies || formData.totalCopies < 1) {
      newErrors.totalCopies = 'Số lượng phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let updatedBooks;
      
      if (showEditModal) {
        // Update existing book
        updatedBooks = books.map(book =>
          book.id === selectedBook.id
            ? { ...book, ...formData, id: selectedBook.id }
            : book
        );
        setBooks(updatedBooks);
      } else {
        // Add new book
        const newBook = {
          ...formData,
          id: Date.now(),
          availableCopies: formData.totalCopies
        };
        updatedBooks = [...books, newBook];
        setBooks(updatedBooks);
      }

      // Save to localStorage
      localStorage.setItem('library_books', JSON.stringify(updatedBooks));

      setFormData({
        title: '',
        author: '',
        category: '',
        publishYear: '',
        publisher: '',
        totalCopies: 1,
        availableCopies: 1,
        description: ''
      });
      setErrors({});
      setSelectedBook(null);
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setLoading(false);
    }
  }, [validateForm, showEditModal, selectedBook, formData, books]);

  const handleEdit = useCallback((book) => {
    setSelectedBook(book);
    setFormData({ ...book });
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (bookId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedBooks = books.filter(book => book.id !== bookId);
      setBooks(updatedBooks);
      
      // Save to localStorage
      localStorage.setItem('library_books', JSON.stringify(updatedBooks));
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setLoading(false);
    }
  }, [books]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      author: '',
      category: '',
      publishYear: '',
      publisher: '',
      totalCopies: 1,
      availableCopies: 1,
      description: ''
    });
    setErrors({});
    setSelectedBook(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setFormData({
      title: '',
      author: '',
      category: '',
      publishYear: '',
      publisher: '',
      totalCopies: 1,
      availableCopies: 1,
      description: ''
    });
    setErrors({});
    setSelectedBook(null);
    setShowAddModal(false);
    setShowEditModal(false);
  }, []);

  // Pagination with memoization
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBooks = filteredBooks.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      currentBooks
    };
  }, [filteredBooks, currentPage, itemsPerPage]);

  const { totalPages, currentBooks } = paginationData;

  if (loading && books.length === 0) {
    return (
      <div className="books-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="books-management">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">📚 Quản lý Sách</h1>
          <p className="page-subtitle">Quản lý toàn bộ sách trong thư viện</p>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Thêm sách mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control category-filter"
          >
            <option value="all">Tất cả thể loại</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Danh sách sách ({filteredBooks.length})</h3>
        </div>

        {currentBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Không tìm thấy sách nào</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Thể loại</th>
                    <th>Năm XB</th>
                    <th>Số lượng</th>
                    <th>Có sẵn</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.map(book => (
                    <tr key={book.id}>
                      <td>
                        <div className="book-info">
                          <div className="book-title">{book.title}</div>
                          {book.description && (
                            <div className="book-description">{book.description}</div>
                          )}
                        </div>
                      </td>
                      <td>{book.author}</td>
                      <td>
                        <span className="category-badge">{book.category}</span>
                      </td>
                      <td>{book.publishYear}</td>
                      <td className="text-center">{book.totalCopies}</td>
                      <td className="text-center">
                        <span className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                          {book.availableCopies}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(book)}
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(book.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ‹ Trước
                </button>
                
                <span className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Book Modal */}
      <BookModal
        show={showAddModal}
        title="➕ Thêm sách mới"
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        errors={errors}
        categories={categories}
        onInputChange={handleInputChange}
        loading={loading}
      />

      {/* Edit Book Modal */}
      <BookModal
        show={showEditModal}
        title="✏️ Chỉnh sửa thông tin sách"
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        errors={errors}
        categories={categories}
        onInputChange={handleInputChange}
        loading={loading}
      />
    </div>
  );
};

export default BooksManagement;