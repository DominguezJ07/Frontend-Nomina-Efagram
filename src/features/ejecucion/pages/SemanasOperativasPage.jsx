import { useEffect, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import SemanasStats from '../components/SemanasStats';
import SemanasTable from '../components/SemanasTable';
import { getSemanas, createSemana, updateSemana, deleteSemana } from '../services/semanas.service';
import '../ejecucion.css';

const normalizeList = (res) => {
  if (Array.isArray(res))             return res;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.docs)) return res.data.docs;
  if (Array.isArray(res?.docs))       return res.docs;
  return [];
};

export default function SemanasOperativasPage() {
  const [semanas,  setSemanas]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const getId = (s) => s?._id ?? s?.id;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getSemanas();
      console.log('SEMANAS:', res);
      setSemanas(normalizeList(res));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las semanas operativas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (payload) => {
    const created = await createSemana(payload);
    const obj = created?.data ?? created;
    if (obj && (obj._id || obj.id)) {
      setSemanas((prev) => [obj, ...prev]);
    } else { await fetchAll(); }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateSemana(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setSemanas((prev) => prev.map((s) => (getId(s) === id ? obj : s)));
    } else { await fetchAll(); }
  };

  const handleDelete = async (id) => {
    await deleteSemana(id);
    setSemanas((prev) => prev.filter((s) => getId(s) !== id));
  };

  return (
    <DashboardLayout>
      <div className="ejecucion-wrapper">
        <SemanasStats semanas={semanas} />
        {loading ? (
          <div className="ejecucion-loading">Cargando…</div>
        ) : error ? (
          <div className="ejecucion-error">{error}</div>
        ) : (
          <SemanasTable
            semanas={semanas}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}