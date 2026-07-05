import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

export const getErrorMessage = (err, defaultMessage = 'Something went wrong.') => {
  if (!err) return defaultMessage;
  const apiError = err.response?.data?.error;
  if (typeof apiError === 'string') return apiError;
  if (apiError && typeof apiError === 'object' && typeof apiError.message === 'string') return apiError.message;
  if (typeof err.response?.data === 'string') return err.response.data;
  if (err.response?.data && typeof err.response.data === 'object' && typeof err.response.data.message === 'string') return err.response.data.message;
  if (typeof err.message === 'string') return err.message;
  return defaultMessage;
};

export default api;
