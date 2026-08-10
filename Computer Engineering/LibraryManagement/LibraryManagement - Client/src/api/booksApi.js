import BaseApiService from './baseApi';

class BooksApiService extends BaseApiService {
  constructor() {
    super('books');
  }

  // Override getPaging for custom filtering with details
  async getPagingWithDetails(pagingRequest) {
    const requestWithDetails = {
      ...pagingRequest,
      CustomParams: {
        ...pagingRequest.CustomParams,
        FilterByDetails: true
      }
    };
    return this.getPaging(requestWithDetails);
  }
}

export default new BooksApiService();