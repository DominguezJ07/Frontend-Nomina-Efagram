import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import FincasStats from '../components/fincas/FincasStats';
import FincasTable from '../components/fincas/FincasTable';
import {
  getFincas,
  createFinca,
  updateFinca,
  deleteFinca,
} from '../services/fincas.service';
import { getNucleos } from '../services/nucleos.service';
import '../territorial.css';

export default function FincasPage() {
  const [fincas, setFincas]   = useState([]);
  const [nucleos, setNucleos] = useState([]);
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
      const [fRes, nRes] = await Promise.all([getFincas(), getNucleos()]);
      setFincas(normalizeList(fRes));
      setNucleos(normalizeList(nRes));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las fincas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredFincas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fincas;
    return fincas.filter((f) => {
      const codigo = String(f?.codigo ?? '').toLowerCase();
      const nombre = String(f?.nombre ?? '').toLowerCase();
      return codigo.includes(q) || nombre.includes(q);
    });
  }, [fincas, search]);

  const getId = (f) => f?._id ?? f?.id;

  const handleAdd = async (payload) => {
    const created = await createFinca(payload);
    const obj = created?.data ?? created;
    if (obj && (obj._id || obj.id)) {
      setFincas((prev) => [obj, ...prev]);
    } else {
      await fetchAll();
    }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateFinca(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setFincas((prev) => prev.map((f) => (getId(f) === id ? obj : f)));
    } else {
      await fetchAll();
    }
  };

  const handleDelete = async (id) => {
    await deleteFinca(id);
    setFincas((prev) => prev.filter((f) => getId(f) !== id));
  };

  return (
    <DashboardLayout>
      <div className="territorial-wrapper">
        <FincasStats fincas={fincas} />

        {loading ? (
          <div className="territorial-loading">Cargando…</div>
        ) : error ? (
          <div className="territorial-error">{error}</div>
        ) : (
          <FincasTable
            fincas={filteredFincas}
            nucleos={nucleos}
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