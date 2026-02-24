import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import TerritorialStats from '../components/TerritorialStats';
import ZonasTable from '../components/ZonasTable';
import {
  getZonas,
  createZona,
  updateZona,
  deleteZona,
} from '../services/zonas.service';
import '../territorial.css';

export default function ZonasPage() {
  const [zonas, setZonas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeList = (res) => {
    // service retorna response.data; pero si el backend responde { data: [] }, lo soportamos igual
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchZonas = async () => {
    try {
      setLoading(true);
      const res = await getZonas();
      setZonas(normalizeList(res));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las zonas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredZonas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zonas;
    return zonas.filter((z) => {
      const codigo = String(z?.codigo ?? '').toLowerCase();
      const nombre = String(z?.nombre ?? '').toLowerCase();
      return codigo.includes(q) || nombre.includes(q);
    });
  }, [zonas, search]);

  const getId = (z) => z?._id ?? z?.id;

  const handleAdd = async (payload) => {
    const created = await createZona(payload);
    // si backend devuelve el objeto, lo insertamos; si no, recargamos
    const obj = created?.data ?? created;
    if (obj && (obj._id || obj.id)) {
      setZonas((prev) => [obj, ...prev]);
    } else {
      await fetchZonas();
    }
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateZona(id, payload);
    const obj = updated?.data ?? updated;
    if (obj && (obj._id || obj.id)) {
      setZonas((prev) => prev.map((z) => (getId(z) === id ? obj : z)));
    } else {
      await fetchZonas();
    }
  };

  const handleDelete = async (id) => {
    await deleteZona(id);
    setZonas((prev) => prev.filter((z) => getId(z) !== id));
  };

  return (
    <DashboardLayout>
      <div className="territorial-wrapper">
        

        <TerritorialStats zonas={zonas} />

        {loading ? (
          <div className="territorial-loading">Cargando…</div>
        ) : error ? (
          <div className="territorial-error">{error}</div>
        ) : (
          <ZonasTable
            zonas={filteredZonas}
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
