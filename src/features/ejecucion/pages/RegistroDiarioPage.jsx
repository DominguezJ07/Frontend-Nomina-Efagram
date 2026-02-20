import { useEffect, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import EjecucionStats from '../components/EjecucionStats';
import RegistrosTable from '../components/RegistrosTable';
import { getRegistros, createRegistro, updateRegistro, deleteRegistro } from '../services/ejecucion.service';
import '../ejecucion.css';

const normalizeList = (res) => {
  if (Array.isArray(res))             return res;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const fmt = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    if (val.nombreCompleto) return val.nombreCompleto;
    if (val.nombres)        return `${val.nombres} ${val.apellidos ?? ''}`.trim();
    if (val.nombre)         return val.nombre;
    if (val.codigo)         return val.codigo;
    return '';
  }
  return String(val).toLowerCase();
};

export default function RegistroDiarioPage() {
  const [registros, setRegistros] = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const getId = (r) => r?._id ?? r?.id;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getRegistros();
      setRegistros(normalizeList(res));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredRegistros = registros.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r?.codigo ?? '').toLowerCase().includes(q) ||
      fmt(r?.trabajador).toLowerCase().includes(q) ||
      fmt(r?.cuadrilla).toLowerCase().includes(q) ||
      fmt(r?.proyecto_actividad_lote).toLowerCase().includes(q)
    );
  });

  // ── Crear registro(s) ──────────────────────────────────────────────────
  // Si el payload trae `trabajadores` (array), crea uno por cada trabajador.
  // Si no, crea un único registro sin trabajador.
  const handleAdd = async (payload) => {
    const { trabajadores, ...base } = payload;

    if (Array.isArray(trabajadores) && trabajadores.length > 0) {
      // Creación en bulk: un registro por trabajador
      const results = await Promise.all(
        trabajadores.map((trabajadorId) =>
          createRegistro({ ...base, trabajador: trabajadorId })
        )
      );

      // Agregar todos los nuevos registros al estado
      const nuevos = results
        .map((r) => r?.data ?? r)
        .filter((r) => r && (r._id || r.id));

      if (nuevos.length > 0) {
        setRegistros((prev) => [...nuevos, ...prev]);
      } else {
        await fetchAll();
      }
    } else {
      // Creación individual (sin cuadrilla o cuadrilla sin miembros seleccionados)
      const created = await createRegistro(base);
      const obj = created?.data ?? created;
      if (obj && (obj._id || obj.id)) {
        setRegistros((prev) => [obj, ...prev]);
      } else {
        await fetchAll();
      }
    }
  };

  // ── Actualizar registro ────────────────────────────────────────────────
  const handleUpdate = async (id, payload) => {
    const updated = await updateRegistro(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setRegistros((prev) => prev.map((r) => (getId(r) === id ? obj : r)));
    } else {
      await fetchAll();
    }
  };

  // ── Eliminar registro ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await deleteRegistro(id);
    setRegistros((prev) => prev.filter((r) => getId(r) !== id));
  };

  return (
    <DashboardLayout>
      <div className="ejecucion-wrapper">
        <EjecucionStats registros={registros} />
        {loading ? (
          <div className="ejecucion-loading">Cargando…</div>
        ) : error ? (
          <div className="ejecucion-error">{error}</div>
        ) : (
          <RegistrosTable
            registros={filteredRegistros}
            search={search}
            setSearch={setSearch}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}