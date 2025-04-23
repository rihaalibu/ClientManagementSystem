/*import axios from 'axios';

export const createAuthenticatedAxios = () => {
  return axios.create({
    baseURL: 'http://localhost:8080/',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
};

//axios is http client, it is used to make http request to backend*/

import axios from 'axios';

export const createAuthenticatedAxios = () => {
  // Create axios instance with base configuration
  const instance = axios.create({
    baseURL: 'http://localhost:8080/', // Make sure this matches your backend URL
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    timeout: 10000, // Adding a reasonable timeout
  });

  // Add request interceptor to dynamically add the token to each request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Log errors for debugging
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

