import { useEffect, useState } from "react";
import { createProceso, updateProceso } from "../services/procesosService";
import "../../../assets/styles/procesos.css";

const ProcesoModal = ({ isOpen, onClose, onSuccess, procesoEditar }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    estado: "Activo"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos si es modo edición
  useEffect(() => {
    if (procesoEditar) {
      setFormData({
        codigo: procesoEditar.codigo || "",
        nombre: procesoEditar.nombre || "",
        estado: procesoEditar.estado || "Activo"
      });
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        estado: "Activo"
      });
    }
    setErrors({});
  }, [procesoEditar, isOpen]);

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.codigo?.trim()) {
      newErrors.codigo = "El código es obligatorio";
    }

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      if (procesoEditar) {
        // Modo edición
        await updateProceso(procesoEditar._id, formData);
      } else {
        // Modo creación
        await createProceso(formData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error guardando proceso:", error);
      alert(error.response?.data?.message || "Error al guardar el proceso");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-actividad" onClick={onClose}>
      <div 
        className="modal-actividad"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <h2 className="modal-actividad-title">
          {procesoEditar ? "Editar Proceso" : "Nuevo Proceso"}
        </h2>
        <p className="modal-actividad-subtitle">
          {procesoEditar 
            ? "Actualiza la información del proceso" 
            : "Completa los datos del nuevo proceso"
          }
        </p>

        <form onSubmit={handleSubmit}>
          {/* CÓDIGO */}
          <div className="form-group-actividad">
            <label htmlFor="codigo">
              Código <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: PROC-001"
              disabled={!!procesoEditar} // El código no se puede editar
            />
            {errors.codigo && (
              <span style={{ 
                color: '#e74c3c', 
                fontSize: '12px', 
                marginTop: '4px', 
                display: 'block' 
              }}>
                {errors.codigo}
              </span>
            )}
          </div>

          {/* NOMBRE */}
          <div className="form-group-actividad">
            <label htmlFor="nombre">
              Nombre <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Proceso de Reforestación"
            />
            {errors.nombre && (
              <span style={{ 
                color: '#e74c3c', 
                fontSize: '12px', 
                marginTop: '4px', 
                display: 'block' 
              }}>
                {errors.nombre}
              </span>
            )}
          </div>

          {/* ESTADO */}
          <div className="form-group-actividad">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="modal-actividad-buttons">
            <button
              type="button"
              className="btn-modal-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-modal-crear"
              disabled={loading}
            >
              {loading 
                ? "Guardando..." 
                : procesoEditar 
                  ? "Actualizar" 
                  : "Crear Proceso"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcesoModal;