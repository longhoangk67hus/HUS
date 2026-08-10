import React from 'react';
import BooksManagement from '../components/Books/BooksManagement';

const AdminBooks = ({ userRole }) => {
  return <BooksManagement userRole={userRole} />;
};

export default AdminBooks;
