import { useEffect, useState } from "react";
import { getProcesos } from "../services/procesosService";

function CatalogoProcesosPage() {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProcesos = async () => {
      try {
        const data = await getProcesos();

        if (Array.isArray(data)) {
          setProcesos(data);
        } else if (Array.isArray(data.data)) {
          setProcesos(data.data);
        } else {
          setProcesos([]);
        }
      } catch (err) {
        console.error("Error cargando procesos", err);
        setError("No se pudieron cargar los procesos");
      } finally {
        setLoading(false);
      }
    };

    cargarProcesos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Catálogo de Procesos</h2>

      {loading && <p>Cargando procesos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && procesos.length === 0 && (
        <p>No hay procesos registrados</p>
      )}

      {!loading && !error && procesos.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {procesos.map((proceso) => (
              <tr key={proceso._id || proceso.id}>
                <td style={tdStyle}>{proceso.codigo}</td>
                <td style={tdStyle}>{proceso.nombre}</td>
                <td style={tdStyle}>{proceso.descripcion || "—"}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      backgroundColor: proceso.activo ? "#d4edda" : "#f8d7da",
                      color: proceso.activo ? "#155724" : "#721c24",
                    }}
                  >
                    {proceso.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f4f4f4",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default CatalogoProcesosPage;