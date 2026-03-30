import { useState, useEffect, useCallback } from "react";
import { getActividades } from "../services/actividadesService";
import { getClientes } from "../services/clientesService"; // ✅ CORREGIDO
import { getIntervenciones } from "../services/intervencionesService";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const PALETA = [
  { bg: "#f0faf4", border: "#1f8f57", accent: "#1f8f57", light: "#e8f5ee", emoji: "🌿" },
  { bg: "#eff6ff", border: "#3b82f6", accent: "#1d4ed8", light: "#dbeafe", emoji: "💧" },
  { bg: "#fff5f5", border: "#ef4444", accent: "#dc2626", light: "#fee2e2", emoji: "🌱" },
  { bg: "#fff7ed", border: "#f97316", accent: "#ea580c", light: "#ffedd5", emoji: "🔶" },
  { bg: "#f5f3ff", border: "#8b5cf6", accent: "#7c3aed", light: "#ede9fe", emoji: "🔷" },
  { bg: "#fdf4ff", border: "#d946ef", accent: "#c026d3", light: "#fae8ff", emoji: "🌸" },
];

const getColor = (idx) => PALETA[idx % PALETA.length];

const fmtMoney = (n) =>
  n != null && n > 0
    ? "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 })
    : "$ 0";

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 6,
  textTransform: "uppercase",
};

const inputNumStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1.5px solid #e6e8ef",
  borderRadius: 8,
  fontSize: 13,
};

let _uid = 0;
const uid = () => `blq-${++_uid}-${Date.now()}`;

const ActividadesIntervencion = ({ intervenciones = [], setIntervenciones }) => {
  const [clientes, setClientes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [intervencionesLista, setIntervencionesLista] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [cRes, aRes, iRes] = await Promise.all([
          getClientes(),
          getActividades(),
          getIntervenciones(),
        ]);

        setClientes(cRes?.data?.data ?? cRes?.data ?? []);
        setCatalogo(aRes?.data?.data ?? aRes?.data ?? []);

        const lista = iRes?.data?.data ?? iRes?.data ?? [];
        setIntervencionesLista(lista.filter((i) => i.activo !== false));
      } catch (e) {
        console.error("Error:", e);
      }
    };

    cargar();
  }, []);

  const agregarIntervencion = (interv) => {
    const nuevo = {
      _uid: uid(),
      intervencion_id: interv._id,
      intervencion_nombre: interv.nombre,
      cliente_id: "",
      actividades: [],
    };

    setIntervenciones((prev) => [...prev, nuevo]);
  };

  const actualizarBloque = useCallback((index, data) => {
    setIntervenciones((prev) => prev.map((b, i) => (i === index ? data : b)));
  }, []);

  const eliminarBloque = (index) => {
    setIntervenciones((prev) => prev.filter((_, i) => i !== index));
  };

  const totalGeneral = (intervenciones || []).reduce((sum, bloque) => {
    return (
      sum +
      (bloque.actividades || []).reduce(
        (s, a) => s + (Number(a.precio_unitario) || 0) * (Number(a.cantidad) || 0),
        0
      )
    );
  }, 0);

  return (
    <div>
      <h3>Intervenciones</h3>

      <div>
        {intervencionesLista.map((interv) => (
          <button key={interv._id} onClick={() => agregarIntervencion(interv)}>
            + {interv.nombre}
          </button>
        ))}
      </div>

      {intervenciones.map((bloque, i) => {
        const actividadesFiltradas = catalogo.filter(
          (act) =>
            String(act?.intervencion?._id ?? act?.intervencion) ===
            String(bloque.intervencion_id)
        );

        return (
          <div key={bloque._uid} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <h4>{bloque.intervencion_nombre}</h4>

            <select
              value={bloque.cliente_id}
              onChange={(e) =>
                actualizarBloque(i, { ...bloque, cliente_id: e.target.value })
              }
            >
              <option value="">Seleccione cliente</option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre || c.razon_social}
                </option>
              ))}
            </select>

            <div>
              <h5>Agregar actividades</h5>
              {actividadesFiltradas.map((ac) => (
                <button
                  key={ac._id}
                  onClick={() =>
                    actualizarBloque(i, {
                      ...bloque,
                      actividades: [
                        ...(bloque.actividades || []),
                        {
                          catalogo_id: ac._id,
                          nombre: ac.nombre,
                          precio_unitario: "",
                          cantidad: "",
                        },
                      ],
                    })
                  }
                >
                  + {ac.nombre}
                </button>
              ))}
            </div>

            {(bloque.actividades || []).map((act, idx) => {
              const total =
                (Number(act.precio_unitario) || 0) *
                (Number(act.cantidad) || 0);

              return (
                <div key={idx}>
                  {act.nombre}

                  <input
                    type="number"
                    placeholder="Precio"
                    value={act.precio_unitario}
                    onChange={(e) => {
                      const copia = [...bloque.actividades];
                      copia[idx].precio_unitario = e.target.value;
                      actualizarBloque(i, { ...bloque, actividades: copia });
                    }}
                  />

                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={act.cantidad}
                    onChange={(e) => {
                      const copia = [...bloque.actividades];
                      copia[idx].cantidad = e.target.value;
                      actualizarBloque(i, { ...bloque, actividades: copia });
                    }}
                  />

                  <span>{fmtMoney(total)}</span>

                  <button
                    onClick={() => {
                      const copia = bloque.actividades.filter((_, j) => j !== idx);
                      actualizarBloque(i, { ...bloque, actividades: copia });
                    }}
                  >
                    ❌
                  </button>
                </div>
              );
            })}

            <button onClick={() => eliminarBloque(i)}>Eliminar intervención</button>
          </div>
        );
      })}

      <h3>Total: {fmtMoney(totalGeneral)}</h3>
    </div>
  );
};

export default ActividadesIntervencion;