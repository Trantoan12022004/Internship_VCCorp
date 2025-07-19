import { useState } from 'react';

// Mock API hook for data fetching
const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on URL
      let mockData;
      if (url.includes('users')) {
        mockData = [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ];
      } else if (url.includes('posts')) {
        mockData = [
          { id: 1, title: 'First Post', content: 'This is the first post' },
          { id: 2, title: 'Second Post', content: 'This is the second post' }
        ];
      } else {
        mockData = { message: 'Success', data: [] };
      }
      
      setData(mockData);
      return { success: true, data: mockData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const postData = async (url, payload) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock POST request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      
      setData(mockResponse);
      return { success: true, data: mockResponse };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (url, payload) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock PUT request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        ...payload,
        updatedAt: new Date().toISOString()
      };
      
      setData(mockResponse);
      return { success: true, data: mockResponse };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (url) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock DELETE request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(null);
      return { success: true, message: 'Deleted successfully' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
    postData,
    updateData,
    deleteData
  };
};

export default useApi;
