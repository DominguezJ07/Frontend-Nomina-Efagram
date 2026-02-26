import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import IntervencionesTable from '../components/IntervencionesTable';
import {
  getIntervenciones,
  createIntervencion,
  updateIntervencion,
  deleteIntervencion,
} from '../services/intervencionesService';
import '../../territorial/territorial.css';

export default function CatalogoIntervencionesPage() {
  const [intervenciones, setIntervenciones] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchIntervenciones = async () => {
    try {
      setLoading(true);
      const res = await getIntervenciones();
      setIntervenciones(normalizeList(res));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las intervenciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntervenciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIntervenciones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return intervenciones;
    return intervenciones.filter((i) => {
      const codigo = String(i?.codigo ?? '').toLowerCase();
      const nombre = String(i?.nombre ?? '').toLowerCase();
      // ✅ CORREGIDO: proceso es un objeto, acceder a su nombre
      const proceso = String(i?.proceso?.nombre ?? '').toLowerCase();
      return codigo.includes(q) || nombre.includes(q) || proceso.includes(q);
    });
  }, [intervenciones, search]);

  const getId = (i) => i?._id ?? i?.id;

  const handleAdd = async (payload) => {
    const created = await createIntervencion(payload);
    const obj = created?.data?.data ?? created?.data ?? created;
    if (obj && (obj._id || obj.id)) {
      setIntervenciones((prev) => [obj, ...prev]);
    } else {
      await fetchIntervenciones();
    }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateIntervencion(id, payload);
    const obj = updated?.data?.data ?? updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setIntervenciones((prev) => prev.map((i) => (getId(i) === id ? obj : i)));
    } else {
      await fetchIntervenciones();
    }
  };

  const handleDelete = async (id) => {
    await deleteIntervencion(id);
    setIntervenciones((prev) => prev.filter((i) => getId(i) !== id));
  };

  return (
    <DashboardLayout>
      <div className="territorial-wrapper">
        {loading ? (
          <div className="territorial-loading">Cargando…</div>
        ) : error ? (
          <div className="territorial-error">{error}</div>
        ) : (
          <IntervencionesTable
            intervenciones={filteredIntervenciones}
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