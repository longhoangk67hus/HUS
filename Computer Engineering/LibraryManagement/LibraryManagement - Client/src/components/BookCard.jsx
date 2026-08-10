import React from 'react';
import './BookCard.css';

const BookCard = ({ book, userRole }) => {
  const handleBorrow = () => {
    // Logic mượn sách
    console.log('Mượn sách:', book.title);
    alert(`Bạn đã mượn sách: ${book.title}`);
  };

  const handleViewDetails = () => {
    // Logic xem chi tiết
    console.log('Xem chi tiết:', book.title);
  };

  return (
    <div className="book-card">
      <div className="book-cover">
        <div className="book-icon">📖</div>
      </div>
      
      <div className="book-info">
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>
        
        <p className="book-author">
          <span className="icon">✍️</span>
          {book.author}
        </p>
        
        <p className="book-category">
          <span className="icon">🏷️</span>
          {book.category}
        </p>
        
        <p className="book-year">
          <span className="icon">📅</span>
          {book.publishYear}
        </p>
        
        <div className="book-availability">
          <span className="icon">📊</span>
          <span className="available">{book.availableCopies}</span>
          /
          <span className="total">{book.totalCopies}</span>
          <span className="label">có sẵn</span>
        </div>
        
        {book.description && (
          <p className="book-description" title={book.description}>
            {book.description.length > 100 
              ? `${book.description.substring(0, 100)}...` 
              : book.description
            }
          </p>
        )}
      </div>
      
      <div className="book-actions">
        <button 
          className="btn btn-outline"
          onClick={handleViewDetails}
        >
          Chi tiết
        </button>
        
        {book.availableCopies > 0 ? (
          <button 
            className="btn btn-primary"
            onClick={handleBorrow}
          >
            🔄 Mượn sách
          </button>
        ) : (
          <button className="btn btn-disabled" disabled>
            Hết sách
          </button>
        )}
      </div>
      
      {book.availableCopies <= 5 && book.availableCopies > 0 && (
        <div className="low-stock-warning">
          ⚠️ Chỉ còn {book.availableCopies} cuốn
        </div>
      )}
    </div>
  );
};

export default BookCard;
