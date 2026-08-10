// Enums from backend
export const BorrowingStatus = {
  Borrowed: 1,
  Returned: 2,
  Overdue: 3
};

export const ModelState = {
  None: 0,
  Insert: 1,
  Update: 2,
  Delete: 3,
  Duplicate: 4,
  Restore: 5
};

// Helper functions for API requests
export const createPagingRequest = ({
  pageIndex = 0,
  pageSize = 20,
  filter = null,
  customFilter = null,
  quickSearch = null,
  sorts = null,
  customParams = null
} = {}) => ({
  PageIndex: pageIndex,
  PageSize: pageSize,
  Filter: filter,
  CustomFilter: customFilter,
  QuickSearch: quickSearch,
  Sorts: sorts,
  CustomParams: customParams
});

export const createBorrowRequest = (bookId, quantity = 1) => ({
  BookID: bookId,
  Quantity: quantity
});

export const createReturnBookRequest = (borrowingRequestId, status = BorrowingStatus.Returned) => ({
  BorrowingRequestId: borrowingRequestId,
  Stauts: status // Note: keeping the typo as it matches the backend
});

// Login request
export const createLoginRequest = (userName, password) => ({
  UserName: userName,
  Password: password
});

// Register request
export const createRegisterRequest = (userName, password, email, fullName) => ({
  UserName: userName,
  Password: password,
  Email: email,
  FullName: fullName
});

// Entity creation helpers
export const createBook = (title, authorID, categoryID, isbn, publishedYear, quantity = 1) => ({
  Title: title,
  AuthorID: authorID,
  CategoryID: categoryID,
  ISBN: isbn,
  PublishedYear: publishedYear,
  Quantity: quantity,
  ModelState: ModelState.Insert
});

export const createAuthor = (name, biography = '') => ({
  Name: name,
  Biography: biography,
  ModelState: ModelState.Insert
});

export const createCategory = (name, description = '') => ({
  Name: name,
  Description: description,
  ModelState: ModelState.Insert
});