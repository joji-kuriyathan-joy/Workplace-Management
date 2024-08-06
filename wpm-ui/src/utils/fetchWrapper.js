import { useNavigate } from 'react-router-dom';

export const fetchWrapper = async (url, options = {}) => {
  const navigate = useNavigate();

  try {
    console.log("fetchWraper", url, options);
    const response = await fetch(url, options);
    if (response.status === 401) { // Token expired or unauthorized
      navigate('/login'); // Redirect to login
      throw new Error('Token expired or unauthorized. Redirecting to login.');
    }

    const data = await response.json();
    console.log("DATA: ",data);
    if (!response.ok) {
      throw new Error(data.msg || 'An error occurred.');
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw to handle in the calling component if needed
  }
};
