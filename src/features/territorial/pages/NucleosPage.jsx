import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import NucleosStats from '../components/nucleos/NucleosStats';
import NucleosTable from '../components/nucleos/NucleosTable';
import {
  getNucleos,
  createNucleo,
  updateNucleo,
  deleteNucleo,
} from '../services/nucleos.service';
import { getZonas } from '../services/zonas.service';
import '../territorial.css';

export default function NucleosPage() {
  const [nucleos, setNucleos] = useState([]);
  const [zonas, setZonas]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const normalizeList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [nRes, zRes] = await Promise.all([getNucleos(), getZonas()]);
      setNucleos(normalizeList(nRes));
      setZonas(normalizeList(zRes));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los núcleos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredNucleos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nucleos;
    return nucleos.filter((n) => {
      const codigo = String(n?.codigo ?? '').toLowerCase();
      const nombre = String(n?.nombre ?? '').toLowerCase();
      return codigo.includes(q) || nombre.includes(q);
    });
  }, [nucleos, search]);

  const getId = (n) => n?._id ?? n?.id;

  const handleAdd = async (payload) => {
    const created = await createNucleo(payload);
    const obj = created?.data ?? created;
    if (obj && (obj._id || obj.id)) {
      setNucleos((prev) => [obj, ...prev]);
    } else {
      await fetchAll();
    }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateNucleo(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setNucleos((prev) => prev.map((n) => (getId(n) === id ? obj : n)));
    } else {
      await fetchAll();
    }
  };

  const handleDelete = async (id) => {
    await deleteNucleo(id);
    setNucleos((prev) => prev.filter((n) => getId(n) !== id));
  };

  return (
    <DashboardLayout>
      <div className="territorial-wrapper">
        <NucleosStats nucleos={nucleos} />

        {loading ? (
          <div className="territorial-loading">Cargando…</div>
        ) : error ? (
          <div className="territorial-error">{error}</div>
        ) : (
          <NucleosTable
            nucleos={filteredNucleos}
            zonas={zonas}
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