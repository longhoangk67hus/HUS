import BaseApiService from './baseApi';

class AuthorsApiService extends BaseApiService {
  constructor() {
    super('authors');
  }
}

export default new AuthorsApiService();