import httpClient from "../../../core/api/httpClient";

export const getProcesos = async () => {
  try {
    const response = await httpClient.get("/procesos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener procesos:", error);
    throw error;
  }
};