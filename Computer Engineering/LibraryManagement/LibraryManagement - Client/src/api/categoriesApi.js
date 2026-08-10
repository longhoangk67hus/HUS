import BaseApiService from './baseApi';

class CategoriesApiService extends BaseApiService {
  constructor() {
    super('categories');
  }
}

export default new CategoriesApiService();