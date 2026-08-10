import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './BorrowReturn.css';

// Modal component for borrowing books
const BorrowModal = React.memo(({ 
  show, 
  onClose, 
  onSubmit, 
  formData,
  errors,
  books,
  onInputChange,
  loading 
}) => {
  if (!show) return null;

  const availableBooks = books.filter(book => book.availableCopies > 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Đăng ký mượn sách</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="borrowerName">Tên người mượn *</label>
              <input
                type="text"
                id="borrowerName"
                name="borrowerName"
                value={formData.borrowerName}
                onChange={onInputChange}
                className={`form-control ${errors.borrowerName ? 'error' : ''}`}
                placeholder="Nhập tên người mượn"
              />
              {errors.borrowerName && <span className="error-message">{errors.borrowerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="borrowerPhone">Số điện thoại *</label>
              <input
                type="text"
                id="borrowerPhone"
                name="borrowerPhone"
                value={formData.borrowerPhone}
                onChange={onInputChange}
                className={`form-control ${errors.borrowerPhone ? 'error' : ''}`}
                placeholder="Nhập số điện thoại"
              />
              {errors.borrowerPhone && <span className="error-message">{errors.borrowerPhone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="borrowerEmail">Email</label>
              <input
                type="email"
                id="borrowerEmail"
                name="borrowerEmail"
                value={formData.borrowerEmail}
                onChange={onInputChange}
                className="form-control"
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="borrowerStudentId">Mã sinh viên/thẻ thư viện</label>
              <input
                type="text"
                id="borrowerStudentId"
                name="borrowerStudentId"
                value={formData.borrowerStudentId}
                onChange={onInputChange}
                className="form-control"
                placeholder="Nhập mã sinh viên"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bookId">Chọn sách *</label>
            <select
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={onInputChange}
              className={`form-control ${errors.bookId ? 'error' : ''}`}
            >
              <option value="">Chọn sách cần mượn</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author} (Còn: {book.availableCopies})
                </option>
              ))}
            </select>
            {errors.bookId && <span className="error-message">{errors.bookId}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="borrowDate">Ngày mượn</label>
              <input
                type="date"
                id="borrowDate"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={onInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Ngày hẹn trả *</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={onInputChange}
                className={`form-control ${errors.dueDate ? 'error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
              className="form-control"
              placeholder="Ghi chú thêm..."
              rows="3"
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký mượn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

BorrowModal.displayName = 'BorrowModal';

const BorrowReturn = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerPhone: '',
    borrowerEmail: '',
    borrowerStudentId: '',
    bookId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'borrowed', label: 'Đang mượn' },
    { value: 'returned', label: 'Đã trả' },
    { value: 'overdue', label: 'Quá hạn' }
  ];

  // Load data
  useEffect(() => {
    loadBorrowRecords();
    loadBooks();
  }, []);

  // Filter records when search or filter changes
  useEffect(() => {
    filterRecords();
  }, [borrowRecords, searchTerm, statusFilter]);

  const loadBorrowRecords = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first
      const savedRecords = localStorage.getItem('borrowRecords');
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        // Update status based on current date
        const updatedRecords = parsedRecords.map(record => {
          if (record.status === 'borrowed') {
            const today = new Date();
            const dueDate = new Date(record.dueDate);
            if (today > dueDate) {
              return { ...record, status: 'overdue' };
            }
          }
          return record;
        });
        setBorrowRecords(updatedRecords);
        if (JSON.stringify(updatedRecords) !== JSON.stringify(parsedRecords)) {
          localStorage.setItem('borrowRecords', JSON.stringify(updatedRecords));
        }
        setLoading(false);
        return;
      }

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/borrowrecords`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setBorrowRecords(data);
      //   localStorage.setItem('borrowRecords', JSON.stringify(data));
      //   setLoading(false);
      //   return;
      // }

      // Mock data for demo (only if no localStorage data)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockRecords = [
        {
          id: 1,
          borrowerName: 'Nguyễn Văn A',
          borrowerPhone: '0123456789',
          borrowerEmail: 'nguyenvana@email.com',
          borrowerStudentId: 'SV001',
          bookId: 1,
          bookTitle: 'Lập Trình C++',
          bookAuthor: 'Bjarne Stroustrup',
          borrowDate: '2024-03-15',
          dueDate: '2024-03-29',
          returnDate: null,
          status: 'borrowed',
          notes: 'Mượn để học tập',
          createdAt: '2024-03-15T09:00:00Z'
        },
        {
          id: 2,
          borrowerName: 'Trần Thị B',
          borrowerPhone: '0987654321',
          borrowerEmail: 'tranthib@email.com',
          borrowerStudentId: 'SV002',
          bookId: 2,
          bookTitle: 'JavaScript Guide',
          bookAuthor: 'Mozilla Foundation',
          borrowDate: '2024-03-10',
          dueDate: '2024-03-24',
          returnDate: '2024-03-23',
          status: 'returned',
          notes: '',
          createdAt: '2024-03-10T14:30:00Z'
        },
        {
          id: 3,
          borrowerName: 'Lê Văn C',
          borrowerPhone: '0555666777',
          borrowerEmail: 'levanc@email.com',
          borrowerStudentId: 'SV003',
          bookId: 3,
          bookTitle: 'React Native Guide',
          bookAuthor: 'Facebook Team',
          borrowDate: '2024-03-05',
          dueDate: '2024-03-19',
          returnDate: null,
          status: 'overdue',
          notes: 'Nghiên cứu mobile app',
          createdAt: '2024-03-05T11:15:00Z'
        }
      ];

      // Update status based on due date
      const updatedRecords = mockRecords.map(record => {
        if (record.status === 'borrowed') {
          const today = new Date();
          const dueDate = new Date(record.dueDate);
          if (today > dueDate) {
            return { ...record, status: 'overdue' };
          }
        }
        return record;
      });

      setBorrowRecords(updatedRecords);
      
      // Save to localStorage
      localStorage.setItem('borrowRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error loading borrow records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      // Try to load from localStorage first
      const savedBooks = localStorage.getItem('books');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
        return;
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/books`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setBooks(data);
      //   localStorage.setItem('books', JSON.stringify(data));
      // }

      // Mock books data - in reality this would come from Books API
      const mockBooks = [
        { id: 1, title: 'Lập Trình C++', author: 'Bjarne Stroustrup', availableCopies: 3 },
        { id: 2, title: 'JavaScript Guide', author: 'Mozilla Foundation', availableCopies: 5 },
        { id: 3, title: 'React Native Guide', author: 'Facebook Team', availableCopies: 0 },
        { id: 4, title: 'Python Programming', author: 'Guido van Rossum', availableCopies: 2 },
        { id: 5, title: 'Data Structures', author: 'Robert Sedgewick', availableCopies: 4 }
      ];
      
      setBooks(mockBooks);
      localStorage.setItem('books', JSON.stringify(mockBooks));
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const filterRecords = useCallback(() => {
    let filtered = borrowRecords;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(record =>
        record.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.borrowerPhone.includes(searchTerm) ||
        record.borrowerStudentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [borrowRecords, searchTerm, statusFilter]);

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

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = 'Tên người mượn không được để trống';
    }

    if (!formData.borrowerPhone.trim()) {
      newErrors.borrowerPhone = 'Số điện thoại không được để trống';
    } else if (!/^\d{10}$/.test(formData.borrowerPhone.replace(/\s/g, ''))) {
      newErrors.borrowerPhone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.bookId) {
      newErrors.bookId = 'Vui lòng chọn sách cần mượn';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Vui lòng chọn ngày hẹn trả';
    } else {
      const dueDate = new Date(formData.dueDate);
      const borrowDate = new Date(formData.borrowDate);
      if (dueDate <= borrowDate) {
        newErrors.dueDate = 'Ngày hẹn trả phải sau ngày mượn';
      }
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

      const selectedBook = books.find(book => book.id === parseInt(formData.bookId));
      
      const newRecord = {
        id: Date.now(),
        ...formData,
        bookTitle: selectedBook.title,
        bookAuthor: selectedBook.author,
        returnDate: null,
        status: 'borrowed',
        createdAt: new Date().toISOString()
      };

      const updatedBorrowRecords = [newRecord, ...borrowRecords];
      setBorrowRecords(updatedBorrowRecords);
      
      // Save to localStorage
      localStorage.setItem('borrowRecords', JSON.stringify(updatedBorrowRecords));
      
      // Update book availability
      const updatedBooks = books.map(book =>
        book.id === parseInt(formData.bookId)
          ? { ...book, availableCopies: book.availableCopies - 1 }
          : book
      );
      setBooks(updatedBooks);
      localStorage.setItem('books', JSON.stringify(updatedBooks));

      resetForm();
      setShowBorrowModal(false);
    } catch (error) {
      console.error('Error creating borrow record:', error);
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData, books]);

  const handleReturn = useCallback(async (recordId) => {
    if (!window.confirm('Xác nhận trả sách này?')) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedBorrowRecords = borrowRecords.map(record => {
        if (record.id === recordId) {
          // Update book availability
          const updatedBooks = books.map(book =>
            book.id === record.bookId
              ? { ...book, availableCopies: book.availableCopies + 1 }
              : book
          );
          setBooks(updatedBooks);
          localStorage.setItem('books', JSON.stringify(updatedBooks));
          
          return {
            ...record,
            returnDate: new Date().toISOString().split('T')[0],
            status: 'returned'
          };
        }
        return record;
      });

      setBorrowRecords(updatedBorrowRecords);
      localStorage.setItem('borrowRecords', JSON.stringify(updatedBorrowRecords));
    } catch (error) {
      console.error('Error returning book:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      borrowerName: '',
      borrowerPhone: '',
      borrowerEmail: '',
      borrowerStudentId: '',
      bookId: '',
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
    setErrors({});
  }, []);

  const handleCloseModal = useCallback(() => {
    resetForm();
    setShowBorrowModal(false);
  }, [resetForm]);

  // Pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);
    
    return {
      totalPages,
      currentRecords
    };
  }, [filteredRecords, currentPage, itemsPerPage]);

  const { totalPages, currentRecords } = paginationData;

  const getStatusBadge = (status) => {
    const statusMap = {
      borrowed: { class: 'status-borrowed', text: 'Đang mượn' },
      returned: { class: 'status-returned', text: 'Đã trả' },
      overdue: { class: 'status-overdue', text: 'Quá hạn' }
    };
    return statusMap[status] || { class: '', text: status };
  };

  const getDaysRemaining = (dueDate, status) => {
    if (status === 'returned') return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Quá hạn ${Math.abs(diffDays)} ngày`;
    if (diffDays === 0) return 'Hết hạn hôm nay';
    if (diffDays <= 3) return `Còn ${diffDays} ngày`;
    return null;
  };

  if (loading && borrowRecords.length === 0) {
    return (
      <div className="borrow-return loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu mượn trả...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="borrow-return">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">📚 Quản lý Mượn Trả</h1>
          <p className="page-subtitle">Quản lý việc mượn và trả sách của thư viện</p>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={() => setShowBorrowModal(true)}
          >
            ➕ Đăng ký mượn sách
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, mã SV, tên sách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control status-filter"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-number">{borrowRecords.filter(r => r.status === 'borrowed').length}</div>
            <div className="stat-label">Đang mượn</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{borrowRecords.filter(r => r.status === 'returned').length}</div>
            <div className="stat-label">Đã trả</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{borrowRecords.filter(r => r.status === 'overdue').length}</div>
            <div className="stat-label">Quá hạn</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{borrowRecords.length}</div>
            <div className="stat-label">Tổng phiếu</div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="table-container">
        {currentRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Chưa có phiếu mượn nào</h3>
            <p>Bắt đầu bằng cách đăng ký mượn sách đầu tiên</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowBorrowModal(true)}
            >
              Đăng ký mượn sách
            </button>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người mượn</th>
                  <th>Thông tin sách</th>
                  <th>Ngày mượn</th>
                  <th>Ngày hẹn trả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record, index) => (
                  <tr key={record.id} className={record.status === 'overdue' ? 'overdue-row' : ''}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="borrower-info">
                        <div className="borrower-name">{record.borrowerName}</div>
                        <div className="borrower-details">
                          {record.borrowerPhone} • {record.borrowerStudentId}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="book-info">
                        <div className="book-title">{record.bookTitle}</div>
                        <div className="book-author">{record.bookAuthor}</div>
                      </div>
                    </td>
                    <td>{new Date(record.borrowDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div>
                        {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                        {getDaysRemaining(record.dueDate, record.status) && (
                          <div className={`days-remaining ${record.status === 'overdue' ? 'overdue' : 'warning'}`}>
                            {getDaysRemaining(record.dueDate, record.status)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(record.status).class}`}>
                        {getStatusBadge(record.status).text}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {record.status === 'borrowed' || record.status === 'overdue' ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleReturn(record.id)}
                            title="Trả sách"
                          >
                            ✅ Trả sách
                          </button>
                        ) : (
                          <span className="text-success">
                            ✓ Đã trả: {new Date(record.returnDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </button>
                
                <div className="page-info">
                  <span>Trang {currentPage} / {totalPages}</span>
                  <span>({filteredRecords.length} phiếu)</span>
                </div>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Borrow Modal */}
      <BorrowModal
        show={showBorrowModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        errors={errors}
        books={books}
        onInputChange={handleInputChange}
        loading={loading}
      />
    </div>
  );
};

export default BorrowReturn;