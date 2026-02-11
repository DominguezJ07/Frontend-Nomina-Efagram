const KEY = 'efagram_token';

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(KEY);
};

export const clearToken = () => {
  localStorage.removeItem(KEY);
};
