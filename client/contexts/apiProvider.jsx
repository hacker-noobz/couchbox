import React, { createContext, useContext } from 'react';

const ApiContext = createContext(null);

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const defaultApiUrl = 'http://localhost:8000/api';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

  // Function to make GET requests
  const get = async (endpoint) => {
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  };

  // TODO: Add functions for POST, PUT, DELETE as needed
  const apiFunctions = {
    get,
    // post,
    // put,
    // delete,
  };

  return (
    <ApiContext.Provider value={apiFunctions}>
      {children}
    </ApiContext.Provider>
  );
};
