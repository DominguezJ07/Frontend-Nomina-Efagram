import httpClient from "@/core/api/httpClient";

export const getClientes = async () => {
  const response = await httpClient.get("/clientes");
  return response;
};

export const createCliente = async (data) => {
  const response = await httpClient.post("/clientes", data);
  return response;
};
