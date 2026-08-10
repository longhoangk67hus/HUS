import BaseApiService from './baseApi';
import api from './api';

class BorrowingRecordsApiService extends BaseApiService {
  constructor() {
    super('borrowingrecords');
  }

  async borrowBook(borrowRequest) {
    try {
      const response = await api.post('/v1/borrowingrecords/borrowing-record', borrowRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async returnBook(returnRequest) {
    try {
      const response = await api.post('/v1/borrowingrecords/return', returnRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Override getPaging to use custom endpoint
  async getPaging(pagingRequest) {
    try {
      const response = await api.post(`/v1/${this.endpoint}/paging`, pagingRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new BorrowingRecordsApiService();