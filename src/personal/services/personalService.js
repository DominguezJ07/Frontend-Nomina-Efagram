import httpClient from "../../core/api/httpClient";

export const getPersonas = async () => {
  return httpClient.get("/personas");
};
