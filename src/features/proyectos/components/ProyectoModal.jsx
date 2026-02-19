import { useEffect, useMemo, useState } from "react";
import { createProyecto } from "../services/proyectosService";
import { getClientes } from "@/modules/clientes/clientes/services/clientesService";
import { getPersonas } from "@/personal/services/personalService";
import ActividadesIntervencion from "./ActividadesIntervencion";
 
const ProyectoModal = ({ isOpen, onClose, onSuccess }) => {
  const [clientes, setClientes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
 
  const [actividades, setActividades] = useState({
    mantenimiento: [],
    no_programadas: [],
    establecimiento: [],
  });
 
  const initialForm = useMemo(() => ({
    codigo: "",
    nombre: "",
    cliente: "",
    responsable: "",
    fecha_inicio: "",
    fecha_fin_estimada: "",
    tipo_contrato: "FIJO_TODO_COSTO",
    avance: 0,
    descripcion: "",
    presupuesto_por_intervencion: {
      mantenimiento: { cantidad_actividades: 0, monto_presupuestado: 0 },
      no_programadas: { cantidad_actividades: 0, monto_presupuestado: 0 },
      establecimiento: { cantidad_actividades: 0, monto_presupuestado: 0 },
    },
  }), []);
 
  const [form, setForm] = useState(initialForm);
 
  // ==============================
  // Cargar clientes y personas
  // ==============================
  useEffect(() => {
    if (!isOpen) return;
 
    const cargarDatos = async () => {
      try {
        setLoadingData(true);
 
        const [clientesRes, personasRes] = await Promise.all([
          getClientes(),
          getPersonas(),
        ]);

        const clientesData = clientesRes?.data?.data || clientesRes?.data || [];
        const personasData = personasRes?.data?.data || personasRes?.data || [];
 
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setPersonas(Array.isArray(personasData) ? personasData : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setClientes([]);
        setPersonas([]);
      } finally {
        setLoadingData(false);
      }
    };
 
    cargarDatos();
  }, [isOpen]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    setForm((prev) => ({
      ...prev,
      [name]: name === "avance" ? Number(value) : value,
    }));
  };
 
  const handleSubmit = async () => {
    if (!form.codigo.trim()) return alert("Código obligatorio");
    if (!form.nombre.trim()) return alert("Nombre obligatorio");
    if (!form.cliente) return alert("Cliente obligatorio");
 
    try {
      setLoading(true);
 
      const payload = {
        ...form,
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        actividades_por_intervencion: actividades,
      };
 
      await createProyecto(payload);
 
      alert("Proyecto creado correctamente");
 
      setForm(initialForm);
      setActividades({
        mantenimiento: [],
        no_programadas: [],
        establecimiento: [],
      });
 
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
        "Error creando proyecto"
      );
    } finally {
      setLoading(false);
    }
  };
 
  if (!isOpen) return null;
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-proyecto" onClick={(e) => e.stopPropagation()}>
        <h3>Nuevo Proyecto</h3>
 
        <div className="form-group">
          <label>Código *</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
          />
        </div>
 
        <div className="modal-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>
 
          <div className="form-group">
            <label>Cliente *</label>
            <select
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              disabled={loadingData}
            >
              <option value="">
                {loadingData ? "Cargando clientes..." : "Seleccione cliente"}
              </option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre || c.razon_social || c.razonSocial || "Cliente"}
                </option>
              ))}
            </select>
          </div>
        </div>
 
        <div className="form-group">
          <label>Responsable</label>
          <select
            name="responsable"
            value={form.responsable}
            onChange={handleChange}
            disabled={loadingData}
          >
            <option value="">
              {loadingData ? "Cargando responsables..." : "Seleccione responsable (opcional)"}
            </option>
            {personas.map((p) => (
              <option key={p._id} value={p._id}>
                {`${p.nombres || ""} ${p.apellidos || ""}`.trim() || p.nombre || "Persona"}
              </option>
            ))}
          </select>
        </div>
 
        <div className="modal-grid">
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
            />
          </div>
 
          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              name="fecha_fin_estimada"
              value={form.fecha_fin_estimada}
              onChange={handleChange}
            />
          </div>
        </div>
 
        <div className="form-group">
          <label>Tipo de Contrato</label>
          <select
            name="tipo_contrato"
            value={form.tipo_contrato}
            onChange={handleChange}
          >
            <option value="FIJO_TODO_COSTO">Fijo todo costo</option>
            <option value="ADMINISTRACION">Administración</option>
            <option value="VARIABLE">Variable</option>
            <option value="CONTRATO_ESPECIAL">Contrato especial</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
 
        {/* 🔥 COMPONENTE EXTERNO LIMPIO */}
        <ActividadesIntervencion
          actividades={actividades}
          setActividades={setActividades}
          setForm={setForm}
        />
 
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>
 
        <div className="form-group">
          <label>Avance: {form.avance}%</label>
          <input
            type="range"
            name="avance"
            min="0"
            max="100"
            value={form.avance}
            onChange={handleChange}
          />
        </div>
 
        <div className="modal-buttons">
          <button onClick={onClose} disabled={loading}>
            Cancelar
          </button>
 
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear Proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default ProyectoModal;