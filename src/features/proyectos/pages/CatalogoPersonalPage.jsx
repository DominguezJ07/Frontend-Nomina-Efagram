import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import PersonalStats from '../components/PersonalStats';
import PersonalTable from '../components/PersonalTable';
import {
  getPersonal,
  createPersona,
  updatePersona,
  deletePersona,
} from '../services/personalService';
import '../../territorial/territorial.css';

export default function CatalogoPersonalPage() {
  const [personal, setPersonal] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const res = await getPersonal();
      const data = normalizeList(res);

      // No mostrar retirados en catálogo
      const visibles = data.filter(
        (p) => String(p?.estado ?? '').toUpperCase() !== 'RETIRADO'
      );

      setPersonal(visibles);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPersonal = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return personal;

    return personal.filter((p) => {
      const doc = String(p?.num_doc ?? '').toLowerCase();
      const nombre = `${p?.nombres ?? ''} ${p?.apellidos ?? ''}`.toLowerCase();
      const cargo = String(p?.cargo ?? '').toLowerCase();
      return doc.includes(q) || nombre.includes(q) || cargo.includes(q);
    });
  }, [personal, search]);

  const getId = (p) => p?._id ?? p?.id;

  const handleAdd = async (payload) => {
    const created = await createPersona(payload);
    const obj = created?.data ?? created;

    if (obj && (obj._id || obj.id)) {
      const estado = String(obj?.estado ?? '').toUpperCase();

      if (estado !== 'RETIRADO') {
        setPersonal((prev) => [obj, ...prev]);
      } else {
        await fetchPersonal();
      }
    } else {
      await fetchPersonal();
    }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updatePersona(id, payload);
    const obj = updated?.data ?? updated;

    if (obj && (obj._id || obj.id)) {
      const estado = String(obj?.estado ?? '').toUpperCase();

      if (estado === 'RETIRADO') {
        setPersonal((prev) => prev.filter((p) => getId(p) !== id));
      } else {
        setPersonal((prev) => prev.map((p) => (getId(p) === id ? obj : p)));
      }
    } else {
      await fetchPersonal();
    }
  };

  const handleDelete = async (id) => {
    await deletePersona(id);
    // El backend retira lógicamente, así que refrescamos y filtramos retirados
    await fetchPersonal();
  };

  return (
    <DashboardLayout>
      <div className="territorial-wrapper">
        <PersonalStats personal={personal} />

        {loading ? (
          <div className="territorial-loading">Cargando…</div>
        ) : error ? (
          <div className="territorial-error">{error}</div>
        ) : (
          <PersonalTable
            personal={filteredPersonal}
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