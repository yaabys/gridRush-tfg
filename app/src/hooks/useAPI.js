import axios from 'axios';

const useAPI = () => {
  const makeRequest = async (method, endpoint, data = null) => {
    const config = {
      method,
      url: `/api/${endpoint}`,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    return axios(config);
  };

  return {
    get: (endpoint) => makeRequest('GET', endpoint),
    post: (endpoint, data) => makeRequest('POST', endpoint, data)
  };
};

export default useAPI; 