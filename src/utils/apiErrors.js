import axios from 'axios';

class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'APIError';
  }
}

export const handleAPIError = (error) => {
  if (axios.isAxiosError(error)) {
    // Handle network errors
    if (!error.response) {
      throw new APIError(
        'Unable to connect to server. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    // Handle API errors
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        throw new APIError(
          data.message || 'Invalid request. Please check your input.',
          status,
          'BAD_REQUEST'
        );
      case 401:
        // Clear auth state and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        throw new APIError(
          'Your session has expired. Please login again.',
          status,
          'UNAUTHORIZED'
        );
      case 403:
        throw new APIError(
          'You do not have permission to perform this action.',
          status,
          'FORBIDDEN'
        );
      case 404:
        throw new APIError(
          'The requested resource was not found.',
          status,
          'NOT_FOUND'
        );
      case 422:
        throw new APIError(
          data.message || 'Validation failed. Please check your input.',
          status,
          'VALIDATION_ERROR'
        );
      case 429:
        throw new APIError(
          'Too many requests. Please try again later.',
          status,
          'RATE_LIMIT'
        );
      default:
        throw new APIError(
          'An unexpected error occurred. Please try again later.',
          status,
          'INTERNAL_ERROR'
        );
    }
  }

  // Handle non-Axios errors
  throw new APIError(
    'An unexpected error occurred.',
    500,
    'UNKNOWN_ERROR'
  );
};

export const createAPIErrorMessage = (error) => {
  if (error instanceof APIError) {
    return {
      title: error.code.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
      message: error.message,
      action: error.code === 'UNAUTHORIZED' ? 'Login Again' : 'Try Again'
    };
  }

  return {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Try Again'
  };
};