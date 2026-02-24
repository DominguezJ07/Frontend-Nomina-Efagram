import { useEffect, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout'; // 👈 agrega esto
import NovedadesStats from '../components/NovedadesStats';
import NovedadesList  from '../components/NovedadesList';
import { getNovedades, createNovedad, updateNovedad, deleteNovedad } from '../services/novedades.service';
import '../ejecucion.css';

const normalizeList = (res) => {
  if (Array.isArray(res))                  return res;
  if (Array.isArray(res?.data))            return res.data;
  if (Array.isArray(res?.data?.data))      return res.data.data;
  if (Array.isArray(res?.data?.novedades)) return res.data.novedades;
  if (Array.isArray(res?.novedades))       return res.novedades;
  if (Array.isArray(res?.data?.docs))      return res.data.docs;
  if (Array.isArray(res?.docs))            return res.docs;
  return [];
};

export default function NovedadesPage() {
  const [novedades, setNovedades] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const getId = (n) => n?._id ?? n?.id;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getNovedades();
      setNovedades(normalizeList(res));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las novedades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (payload) => {
    const created = await createNovedad(payload);
    const obj = created?.data ?? created;
    if (obj && (obj._id || obj.id)) setNovedades((prev) => [obj, ...prev]);
    else await fetchAll();
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateNovedad(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) setNovedades((prev) => prev.map((n) => (getId(n) === id ? obj : n)));
    else await fetchAll();
  };

  const handleDelete = async (id) => {
    await deleteNovedad(id);
    setNovedades((prev) => prev.filter((n) => getId(n) !== id));
  };

  return (
    <DashboardLayout> {/* 👈 envuelve todo */}
      <div className="ejecucion-wrapper">
        <NovedadesStats novedades={novedades} />
        {loading ? (
          <div className="ejecucion-loading">Cargando…</div>
        ) : error ? (
          <div className="ejecucion-error">{error}</div>
        ) : (
          <NovedadesList
            novedades={novedades}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}