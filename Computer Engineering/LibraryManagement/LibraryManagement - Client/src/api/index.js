import authApi from './authApi';
import booksApi from './booksApi';
import authorsApi from './authorsApi';
import categoriesApi from './categoriesApi';
import borrowingRecordsApi from './borrowingRecordsApi';
import { setAuthToken } from './api';

// Named exports for individual services
export {
  authApi,
  booksApi,
  authorsApi,
  categoriesApi,
  borrowingRecordsApi,
  setAuthToken
};

// Default export for convenience
export default {
  auth: authApi,
  books: booksApi,
  authors: authorsApi,
  categories: categoriesApi,
  borrowingRecords: borrowingRecordsApi,
  setAuthToken
};