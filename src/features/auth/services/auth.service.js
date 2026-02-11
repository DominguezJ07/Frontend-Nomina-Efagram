import httpClient from '../../../core/api/httpClient';
import { endpoints } from '../../../core/api/endpoints';

export const loginRequest = async ({ email, password }) => {
  const response = await httpClient.post(endpoints.auth.login, {
    email,
    password,
  });
  return response.data;
};

export const meRequest = async () => {
  const response = await httpClient.get(endpoints.auth.me);
  return response.data;
};

export const logoutRequest = async () => {
  const response = await httpClient.post(endpoints.auth.logout);
  return response.data;
};
