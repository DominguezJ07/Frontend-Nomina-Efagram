import { useState } from "react";

const TIPOS = ["mantenimiento", "no_programadas", "establecimiento"];

const ProyectoActividades = ({
  actividades,
  setActividades,
  setForm,
}) => {
  const [intervencionesActivas, setIntervencionesActivas] = useState({
    mantenimiento: false,
    no_programadas: false,
    establecimiento: false,
  });

  const [actividadTemp, setActividadTemp] = useState({
    tipo: null,
    nombre: "",
    precio_unitario: "",
    cantidad: "",
    unidad: "hectareas",
    estado: "Pendiente",
  });

  // ============================
  // Calcular totales
  // ============================
  const calcularTotales = (acts = []) => {
    const cantidad = acts.reduce(
      (sum, a) => sum + (Number(a.cantidad) || 0),
      0
    );

    const monto = acts.reduce(
      (sum, a) =>
        sum +
        (Number(a.precio_unitario) || 0) *
          (Number(a.cantidad) || 0),
      0
    );

    return { cantidad, monto };
  };

  // ============================
  const toggleIntervencion = (tipo) => {
    setIntervencionesActivas((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  // ============================
  const agregarActividad = (tipo) => {
    const temp =
      actividadTemp.tipo === tipo ? actividadTemp : null;

    if (!temp || !temp.nombre.trim()) {
      alert("El nombre de la actividad es obligatorio");
      return;
    }

    const nueva = {
      nombre: temp.nombre.trim(),
      precio_unitario: Number(temp.precio_unitario) || 0,
      cantidad: Number(temp.cantidad) || 0,
      unidad: temp.unidad,
      estado: temp.estado,
    };

    setActividades((prev) => {
      const next = {
        ...prev,
        [tipo]: [...(prev[tipo] || []), nueva],
      };

      const totales = calcularTotales(next[tipo]);

      setForm((f) => ({
        ...f,
        presupuesto_por_intervencion: {
          ...f.presupuesto_por_intervencion,
          [tipo]: {
            cantidad_actividades: totales.cantidad,
            monto_presupuestado: totales.monto,
          },
        },
      }));

      return next;
    });

    setActividadTemp({
      tipo: null,
      nombre: "",
      precio_unitario: "",
      cantidad: "",
      unidad: "hectareas",
      estado: "Pendiente",
    });
  };

  const eliminarActividad = (tipo, index) => {
    setActividades((prev) => {
      const copia = [...prev[tipo]];
      copia.splice(index, 1);

      const totales = calcularTotales(copia);

      setForm((f) => ({
        ...f,
        presupuesto_por_intervencion: {
          ...f.presupuesto_por_intervencion,
          [tipo]: {
            cantidad_actividades: totales.cantidad,
            monto_presupuestado: totales.monto,
          },
        },
      }));

      return { ...prev, [tipo]: copia };
    });
  };

  // ============================
  return (
    <>
      <div className="form-group">
        <label>Intervención</label>

        <div className="intervencion-chips">
          {TIPOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`chip-intervencion chip-intervencion--${tipo} ${
                intervencionesActivas[tipo] ? "active" : ""
              }`}
              onClick={() => toggleIntervencion(tipo)}
            >
              {tipo.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {TIPOS.map((tipo) => {
        if (!intervencionesActivas[tipo]) return null;

        return (
          <div
            key={tipo}
            className="intervencion-desplegable-completa"
          >
            <h4>{tipo.replace("_", " ")}</h4>

            {/* Lista actividades */}
            {actividades[tipo]?.map((act, i) => (
              <div key={i} className="actividad-row">
                {act.nombre} | {act.cantidad} | $
                {act.precio_unitario}
                <button
                  type="button"
                  onClick={() =>
                    eliminarActividad(tipo, i)
                  }
                >
                  ❌
                </button>
              </div>
            ))}

            {/* Form agregar */}
            <input
              type="text"
              placeholder="Nombre actividad"
              value={
                actividadTemp.tipo === tipo
                  ? actividadTemp.nombre
                  : ""
              }
              onChange={(e) =>
                setActividadTemp({
                  ...actividadTemp,
                  tipo,
                  nombre: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Precio"
              value={
                actividadTemp.tipo === tipo
                  ? actividadTemp.precio_unitario
                  : ""
              }
              onChange={(e) =>
                setActividadTemp({
                  ...actividadTemp,
                  tipo,
                  precio_unitario: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Cantidad"
              value={
                actividadTemp.tipo === tipo
                  ? actividadTemp.cantidad
                  : ""
              }
              onChange={(e) =>
                setActividadTemp({
                  ...actividadTemp,
                  tipo,
                  cantidad: e.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={() => agregarActividad(tipo)}
            >
              + Agregar
            </button>
          </div>
        );
      })}
    </>
  );
};

export default ProyectoActividades;