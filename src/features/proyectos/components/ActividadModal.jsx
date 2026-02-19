import { useEffect, useState } from "react";
import { createActividad, updateActividad } from "../services/actividadesService";

const CATEGORIAS = [
  "PREPARACION_TERRENO",
  "SIEMBRA",
  "MANTENIMIENTO",
  "CONTROL_MALEZA",
  "FERTILIZACION",
  "PODAS",
  "OTRO",
];

const UNIDADES = ["HECTAREA", "METRO", "UNIDAD", "VIAJE"];

const ActividadModal = ({
  isOpen,
  onClose,
  onSuccess,
  actividadEditar = null,
}) => {
  const isEdit = Boolean(actividadEditar);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "OTRO",
    unidad_medida: "HECTAREA",
    rendimiento_diario_estimado: "",
    activa: true,
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (actividadEditar) {
      setForm({
        codigo: actividadEditar.codigo || "",
        nombre: actividadEditar.nombre || "",
        descripcion: actividadEditar.descripcion || "",
        categoria: actividadEditar.categoria || "OTRO",
        unidad_medida: actividadEditar.unidad_medida || "HECTAREA",
        rendimiento_diario_estimado:
          actividadEditar.rendimiento_diario_estimado || "",
        activa: actividadEditar.activa ?? true,
      });
    }
  }, [actividadEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rendimiento_diario_estimado"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.codigo.trim()) return setError("El código es obligatorio");
    if (!form.nombre.trim()) return setError("El nombre es obligatorio");

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...form,
        codigo: form.codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
      };

      if (isEdit) {
        await updateActividad(actividadEditar._id, payload);
      } else {
        await createActividad(payload);
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        err?.message ||
        "Error guardando actividad";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-actividad"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{isEdit ? "Editar Actividad" : "Nueva Actividad"}</h3>

        {error && <div className="modal-error">{error}</div>}

        <div className="form-group">
          <label>Código *</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: ACT-001"
            disabled={isEdit}
          />
        </div>

        <div className="form-group">
          <label>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de la actividad"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unidad</label>
            <select
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Rendimiento diario estimado</label>
          <input
            type="number"
            step="0.1"
            name="rendimiento_diario_estimado"
            value={form.rendimiento_diario_estimado}
            onChange={handleChange}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="activa"
              checked={form.activa}
              onChange={handleChange}
            />
            Activa
          </label>
        </div>

        <div className="modal-buttons">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActividadModal;
