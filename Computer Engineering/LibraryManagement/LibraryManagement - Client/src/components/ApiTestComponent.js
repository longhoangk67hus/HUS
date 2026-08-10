import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import api from '../api';
import { createPagingRequest, createBorrowRequest, createLoginRequest } from '../api/types';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  // Test function helper
  const runTest = async (testName, apiCall) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await apiCall();
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          data: result,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message || 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  // Test Books API
  const testBooks = () => {
    const pagingRequest = createPagingRequest({
      pageSize: 5,
      pageIndex: 0
    });
    runTest('books', () => api.books.getPaging(pagingRequest));
  };

  // Test Authors API
  const testAuthors = () => {
    const pagingRequest = createPagingRequest({
      pageSize: 5,
      pageIndex: 0
    });
    runTest('authors', () => api.authors.getPaging(pagingRequest));
  };

  // Test Categories API
  const testCategories = () => {
    const pagingRequest = createPagingRequest({
      pageSize: 5,
      pageIndex: 0
    });
    runTest('categories', () => api.categories.getPaging(pagingRequest));
  };

  // Test Borrowing Records API
  const testBorrowingRecords = () => {
    const pagingRequest = createPagingRequest({
      pageSize: 5,
      pageIndex: 0
    });
    runTest('borrowingRecords', () => api.borrowingRecords.getPaging(pagingRequest));
  };

  // Test Auth API (this will likely fail unless backend is running)
  const testLogin = () => {
    const loginRequest = createLoginRequest('admin', '123456');
    runTest('login', () => api.auth.login(loginRequest));
  };

  // Render test result
  const renderTestResult = (testName) => {
    const result = testResults[testName];
    const isLoading = loading[testName];

    if (isLoading) {
      return <div className="loading">Testing {testName}...</div>;
    }

    if (!result) {
      return <div>Not tested yet</div>;
    }

    if (result.success) {
      return (
        <div className="success">
          <strong>✅ Success!</strong> ({result.timestamp})
          <div className="data-display">
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        </div>
      );
    } else {
      return (
        <div className="error">
          <strong>❌ Error:</strong> {result.error} ({result.timestamp})
        </div>
      );
    }
  };

  return (
    <div>
      <div className="api-test-section">
        <h2>📚 Books API Test</h2>
        <button 
          className="button" 
          onClick={testBooks}
          disabled={loading.books}
        >
          Test Books API
        </button>
        {renderTestResult('books')}
      </div>

      <div className="api-test-section">
        <h2>✍️ Authors API Test</h2>
        <button 
          className="button" 
          onClick={testAuthors}
          disabled={loading.authors}
        >
          Test Authors API
        </button>
        {renderTestResult('authors')}
      </div>

      <div className="api-test-section">
        <h2>🏷️ Categories API Test</h2>
        <button 
          className="button" 
          onClick={testCategories}
          disabled={loading.categories}
        >
          Test Categories API
        </button>
        {renderTestResult('categories')}
      </div>

      <div className="api-test-section">
        <h2>📋 Borrowing Records API Test</h2>
        <button 
          className="button" 
          onClick={testBorrowingRecords}
          disabled={loading.borrowingRecords}
        >
          Test Borrowing Records API
        </button>
        {renderTestResult('borrowingRecords')}
      </div>

      <div className="api-test-section">
        <h2>🔐 Authentication API Test</h2>
        <button 
          className="button" 
          onClick={testLogin}
          disabled={loading.login}
        >
          Test Login API
        </button>
        {renderTestResult('login')}
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          <strong>Note:</strong> This will likely fail with CORS or connection error unless your backend is running on https://localhost:5001
        </p>
      </div>

      <div className="api-test-section">
        <h2>📊 API Configuration Info</h2>
        <div className="data-display">
          <pre>{JSON.stringify({
            baseURL: process.env.REACT_APP_API_URL || 'https://localhost:5001/api',
            endpoints: {
              auth: '/v1/authens/*',
              books: '/v1/books/*',
              authors: '/v1/authors/*',  
              categories: '/v1/categories/*',
              borrowingRecords: '/v1/borrowingrecords/*'
            },
            features: [
              'CRUD Operations',
              'Pagination Support',
              'Authentication',
              'Error Handling',
              'Token Management'
            ]
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;