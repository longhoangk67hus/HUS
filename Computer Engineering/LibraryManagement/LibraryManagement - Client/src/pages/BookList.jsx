import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

function BookList({ userRole }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Công nghệ', 'Văn học', 'Khoa học', 'Lịch sử', 'Kinh doanh'];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      // Load from localStorage hoặc mock data
      const savedBooks = localStorage.getItem('library_books');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      } else {
        // Mock data
        const mockBooks = [
          {
            id: 1,
            title: "JavaScript Guide",
            author: "Douglas Crockford",
            category: "Công nghệ",
            publishYear: 2023,
            publisher: "NXB Công nghệ",
            totalCopies: 32,
            availableCopies: 28,
            description: "Hướng dẫn toàn diện về JavaScript"
          },
          {
            id: 2,
            title: "React Handbook",
            author: "Alex Banks",
            category: "Công nghệ", 
            publishYear: 2023,
            publisher: "NXB Kỹ thuật",
            totalCopies: 28,
            availableCopies: 25,
            description: "Sách hướng dẫn React từ cơ bản đến nâng cao"
          },
          {
            id: 3,
            title: "Node.js Guide",
            author: "Kyle Simpson",
            category: "Công nghệ",
            publishYear: 2022,
            publisher: "NXB Đại học",
            totalCopies: 25,
            availableCopies: 22,
            description: "Hướng dẫn phát triển backend với Node.js"
          }
        ];
        setBooks(mockBooks);
        localStorage.setItem('library_books', JSON.stringify(mockBooks));
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Đang tải danh sách sách...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Danh sách sách</h1>
        <p>Khám phá thư viện sách phong phú của chúng tôi</p>
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
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          <option value="all">Tất cả thể loại</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard key={book.id} book={book} userRole={userRole} />
          ))
        ) : (
          <div className="no-results">
            <h3>Không tìm thấy sách nào</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookList;
