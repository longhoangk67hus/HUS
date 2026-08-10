import api from './api';

class AuthApiService {
  async login(loginRequest) {
    try {
      const response = await api.post('/v1/authens/login', loginRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(registerInfo) {
    try {
      const response = await api.post('/v1/authens/user/register', registerInfo);
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

export default new AuthApiService();