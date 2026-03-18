import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import SubproyectoModal from '../components/SubproyectoModal';
import { getSubproyectos, deleteSubproyecto } from '../services/subproyectosService';
import { getProyectos } from '../services/proyectosService';
import { FolderGit2, Plus, Pencil, Trash2, MapPin, Users } from 'lucide-react';
import '../../../assets/styles/proyectos.css';

const ESTADO_COLOR = {
  ACTIVO: { bg: '#f0faf4', color: '#1f8f57', border: '#1f8f57' },
  CERRADO: { bg: '#f1f5f9', color: '#64748b', border: '#94a3b8' },
  CANCELADO: { bg: '#fee2e2', color: '#dc2626', border: '#dc2626' },
};

const SubproyectosPage = () => {
  const [searchParams] = useSearchParams();
  const proyectoIdParam = searchParams.get('proyecto');

  const [proyectos, setProyectos] = useState([]);
  const [proyectoSel, setProyectoSel] = useState(proyectoIdParam || '');
  const [proyectoObj, setProyectoObj] = useState(null);
  const [subproyectos, setSubproyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, sub: null });

  // Cargar proyectos para el selector
  useEffect(() => {
    getProyectos().then(res => {
      const data = res?.data?.data ?? [];
      setProyectos(data);
      if (proyectoIdParam) {
        setProyectoObj(data.find(p => p._id === proyectoIdParam) ?? null);
      }
    }).catch(console.error);
  }, [proyectoIdParam]);

  // Cargar subproyectos al cambiar selección
  useEffect(() => {
    const cargar = async () => {
      if (!proyectoSel) {
        setSubproyectos([]);
        setProyectoObj(null);
        return;
      }
      setLoading(true);
      try {
        const res = await getSubproyectos({ proyecto: proyectoSel });
        setSubproyectos(res?.data?.data ?? []);
        setProyectoObj(proyectos.find(p => p._id === proyectoSel) ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [proyectoSel, proyectos]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este subproyecto?')) return;
    try {
      await deleteSubproyecto(id);
      setSubproyectos(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message ?? 'No se pudo eliminar');
    }
  };

  const recargar = () => {
    if (!proyectoSel) return;
    setLoading(true);
    getSubproyectos({ proyecto: proyectoSel })
      .then(res => setSubproyectos(res?.data?.data ?? []))
      .finally(() => setLoading(false));
  };

  const activos = subproyectos.filter(s => s.estado === 'ACTIVO').length;
  const cerrados = subproyectos.filter(s => s.estado === 'CERRADO').length;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.12)',
              }}>
                <FolderGit2 size={20} color="#6366f1" />
              </span>
              Subproyectos
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
              Gestiona los subproyectos y la asignación de actividades
            </p>
          </div>
          {proyectoSel && (
            <button
              onClick={() => setModalState({ open: true, sub: null })}
              style={{
                background: '#1f8f57', color: '#fff', border: 'none',
                padding: '11px 20px', borderRadius: 12, fontWeight: 700,
                fontSize: 14, cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(31,143,87,0.25)',
              }}
            >
              <Plus size={16} /> Nuevo Subproyecto
            </button>
          )}
        </div>

        {/* ── Selector de proyecto ── */}
        <div style={{ background: '#fff', border: '1px solid #e6e8ef', borderRadius: 14, padding: '18px 20px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
            Selecciona un proyecto
          </label>
          <select
            value={proyectoSel}
            onChange={e => setProyectoSel(e.target.value)}
            style={{ width: '100%', maxWidth: 480, padding: '10px 14px', border: '1.5px solid #e6e8ef', borderRadius: 10, fontSize: 14, color: '#0f172a', background: '#fff', outline: 'none' }}
          >
            <option value="">— Seleccione proyecto —</option>
            {proyectos.map(p => (
              <option key={p._id} value={p._id}>
                {p.codigo} · {p.nombre} {p.zona?.nombre ? `(${p.zona.nombre})` : ''}
              </option>
            ))}
          </select>

          {/* Info del proyecto seleccionado */}
          {proyectoObj && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e6e8ef', borderRadius: 8, padding: '5px 12px', fontSize: 13 }}>
                <FolderGit2 size={13} color="#64748b" />
                <span style={{ color: '#64748b' }}>Estado:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{proyectoObj.estado}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e6e8ef', borderRadius: 8, padding: '5px 12px', fontSize: 13 }}>
                <MapPin size={13} color="#64748b" />
                <span style={{ color: '#64748b' }}>Zona:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{proyectoObj.zona?.nombre ?? 'Sin zona'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e6e8ef', borderRadius: 8, padding: '5px 12px', fontSize: 13 }}>
                <Users size={13} color="#64748b" />
                <span style={{ color: '#64748b' }}>Cliente:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{proyectoObj.cliente?.nombre ?? proyectoObj.cliente?.razon_social ?? '—'}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        {proyectoSel && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Total', value: subproyectos.length, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Activos', value: activos, color: '#1f8f57', bg: '#f0faf4' },
              { label: 'Cerrados', value: cerrados, color: '#64748b', bg: '#f1f5f9' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}33`, borderRadius: 12, padding: '16px 20px' }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!proyectoSel && (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
            <p style={{ margin: '0 0 6px', fontSize: 28 }}>📂</p>
            <p style={{ margin: 0, fontSize: 14 }}>Selecciona un proyecto para ver sus subproyectos</p>
          </div>
        )}

        {proyectoSel && loading && (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Cargando subproyectos...</div>
        )}

        {proyectoSel && !loading && subproyectos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
            <p style={{ margin: '0 0 6px', fontSize: 28 }}>📦</p>
            <p style={{ margin: 0, fontSize: 14 }}>Este proyecto no tiene subproyectos aún</p>
          </div>
        )}

        {/* ── Tabla ── */}
        {proyectoSel && !loading && subproyectos.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e6e8ef', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e6e8ef' }}>
                  {['Código', 'Nombre', 'Núcleos', 'Supervisor', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subproyectos.map((s, i) => {
                  const est = ESTADO_COLOR[s.estado] ?? {};
                  return (
                    <tr key={s._id} style={{ borderBottom: i < subproyectos.length - 1 ? '1px solid #f0f2f5' : 'none' }}>

                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {s.codigo}
                      </td>

                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#0f172a' }}>
                        {s.nombre}
                      </td>

                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>
                        {s.nucleos?.length > 0
                          ? s.nucleos.map(n => n.nombre ?? n).join(', ')
                          : <span style={{ color: '#cbd5e1' }}>Sin núcleos</span>}
                      </td>

                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>
                        {s.supervisor
                          ? `${s.supervisor.nombres ?? ''} ${s.supervisor.apellidos ?? ''}`.trim()
                          : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>

                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                          border: `1.5px solid ${est.border}`,
                          background: est.bg, color: est.color,
                        }}>
                          {s.estado}
                        </span>
                      </td>

                      {/* ── Acciones ── */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>

                          {/* Editar */}
                          <button
                            title="Editar subproyecto"
                            onClick={() => setModalState({ open: true, sub: s })}
                            style={{
                              background: '#f0faf4', border: '1.5px solid #bbf7d0',
                              color: '#1f8f57', height: 34, padding: '0 12px',
                              borderRadius: 8, display: 'flex', alignItems: 'center',
                              gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            }}
                          >
                            <Pencil size={13} />
                            Editar
                          </button>

                          {/* Eliminar */}
                          <button
                            title="Eliminar subproyecto"
                            onClick={() => handleDelete(s._id)}
                            style={{
                              background: '#fee2e2', border: '1.5px solid #fecaca',
                              color: '#dc2626', height: 34, padding: '0 12px',
                              borderRadius: 8, display: 'flex', alignItems: 'center',
                              gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            }}
                          >
                            <Trash2 size={13} />
                            Eliminar
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal crear / editar ── */}
      <SubproyectoModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, sub: null })}
        onSuccess={recargar}
        subproyecto={modalState.sub}
        proyecto={proyectoObj}
      />
    </DashboardLayout>
  );
};

export default SubproyectosPage;