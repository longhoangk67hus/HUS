import api from './api';

class BaseApiService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll() {
    try {
      const response = await api.get(`/v1/${this.endpoint}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`/v1/${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaging(pagingRequest) {
    try {
      const response = await api.post(`/v1/${this.endpoint}/paging`, pagingRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(entity) {
    try {
      const response = await api.post(`/v1/${this.endpoint}`, entity);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, entity) {
    try {
      const response = await api.put(`/v1/${this.endpoint}/${id}`, entity);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateFields(id, fieldUpdates) {
    try {
      const response = await api.patch(`/v1/${this.endpoint}/${id}`, fieldUpdates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBulk(entities) {
    try {
      const response = await api.post(`/v1/${this.endpoint}/bulk`, entities);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBulk(entities) {
    try {
      const response = await api.delete(`/v1/${this.endpoint}/bulk`, { data: entities });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.UserMessage || error.response.data?.SystemMessage || 'An error occurred',
        data: error.response.data
      };
    }
    return {
      message: error.message || 'Network error occurred'
    };
  }
}

export default BaseApiService;