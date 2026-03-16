import { useState, useMemo, useCallback } from 'react';
import {
  BarChart3, Target, Activity, DollarSign,
  Search, RefreshCw, AlertCircle, TrendingUp,
  Users, Clock, CheckCircle, XCircle, Loader
} from 'lucide-react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import reportesService from '../services/reportes.service';
import '../../../assets/styles/reportes.css';

// ─── Helpers ────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const fmtNum = (n) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(n || 0);

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const hoy = () => new Date().toISOString().split('T')[0];
const hace30 = () => {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};

const pctColor = (p) => {
  const n = parseFloat(p);
  if (n >= 80) return 'pct-high';
  if (n >= 50) return 'pct-mid';
  return 'pct-low';
};

const pctFill = (p) => {
  const n = Math.min(100, parseFloat(p));
  if (n >= 80) return '#1f8f57';
  if (n >= 50) return '#d97706';
  return '#dc2626';
};

const estadoBadge = (estado) => {
  const m = {
    CUMPLIDA:     ['badge-green',  'Cumplida'],
    EN_EJECUCION: ['badge-blue',   'En ejecución'],
    PENDIENTE:    ['badge-amber',  'Pendiente'],
    CANCELADA:    ['badge-red',    'Cancelada'],
    REPROGRAMADA: ['badge-purple', 'Reprogramada'],
  };
  const [cls, label] = m[estado] || ['badge-gray', estado || '—'];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Sub-componentes ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="r-stat-card">
    <div className="r-stat-icon" style={{ background: bg }}>
      <Icon size={19} color={color} />
    </div>
    <div>
      <p className="r-stat-value">{value}</p>
      <p className="r-stat-label">{label}</p>
    </div>
  </div>
);

const Spinner = () => (
  <div className="r-loading">
    <div className="r-spinner" />
    <span>Cargando datos…</span>
  </div>
);

const Empty = ({ msg = 'Sin datos para el período seleccionado.' }) => (
  <div className="r-empty">
    <BarChart3 size={36} strokeWidth={1.2} />
    <p>{msg}</p>
  </div>
);

const ProgressBar = ({ pct }) => {
  const n = Math.min(100, parseFloat(pct) || 0);
  return (
    <div className="progress-wrap">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${n}%`, background: pctFill(pct) }} />
      </div>
      <span className={`progress-pct ${pctColor(pct)}`}>{n.toFixed(1)}%</span>
    </div>
  );
};

// ─── Tab: Avance de Metas ────────────────────────────────────────────
function TabAvanceMetas({ data }) {
  const [busqueda, setBusqueda] = useState('');

  const resumen = data?.resumen || {};
  const detalle = useMemo(() => {
    const lista = data?.detalle || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(p =>
      (p.proyecto || '').toLowerCase().includes(q) ||
      (p.actividad || '').toLowerCase().includes(q) ||
      (p.lote || '').toLowerCase().includes(q)
    );
  }, [data, busqueda]);

  return (
    <>
      {/* Stats resumen */}
      <div className="reportes-stats">
        <StatCard icon={Target}      label="Total PALs"       value={resumen.total_pals ?? 0}              color="#2563eb" bg="rgba(37,99,235,0.1)" />
        <StatCard icon={TrendingUp}  label="Avance general"   value={`${resumen.porcentaje_avance_general ?? 0}%`} color="#1f8f57" bg="rgba(31,143,87,0.1)" />
        <StatCard icon={CheckCircle} label="PALs cumplidos"   value={resumen.pals_cumplidos ?? 0}          color="#1f8f57" bg="rgba(31,143,87,0.1)" />
        <StatCard icon={Activity}    label="En ejecución"     value={resumen.pals_en_ejecucion ?? 0}       color="#d97706" bg="rgba(217,119,6,0.1)" />
        <StatCard icon={Clock}       label="Pendientes"        value={resumen.pals_pendientes ?? 0}         color="#64748b" bg="rgba(100,116,139,0.1)" />
      </div>

      {/* Tabla detalle */}
      <div className="reportes-section">
        <div className="section-header">
          <h2><Target size={16} /> Detalle por PAL</h2>
          <input
            className="search-input"
            placeholder="Buscar proyecto, actividad, lote…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        {detalle.length === 0 ? <Empty /> : (
          <div className="reportes-table-wrap">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Proyecto</th>
                  <th>Actividad</th>
                  <th>Lote</th>
                  <th>Meta mín.</th>
                  <th>Ejecutado</th>
                  <th>Avance</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.pal_codigo || '—'}</strong></td>
                    <td>{p.proyecto || '—'}</td>
                    <td>{p.actividad || '—'}</td>
                    <td>{p.lote || '—'}</td>
                    <td>{fmtNum(p.meta_minima)}</td>
                    <td>{fmtNum(p.cantidad_ejecutada_total)}</td>
                    <td style={{ minWidth: 160 }}><ProgressBar pct={p.porcentaje_avance} /></td>
                    <td>{estadoBadge(p.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Tab: Producción por Actividad ───────────────────────────────────
function TabPorActividad({ data }) {
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(a => (a.actividad || '').toLowerCase().includes(q));
  }, [data, busqueda]);

  const totalMeta = lista.reduce((s, a) => s + (a.meta_total || 0), 0);
  const totalEjec = lista.reduce((s, a) => s + (a.ejecutado_total || 0), 0);
  const pctGlobal = totalMeta > 0 ? ((totalEjec / totalMeta) * 100).toFixed(1) : 0;

  return (
    <>
      <div className="reportes-stats">
        <StatCard icon={Activity}   label="Actividades"      value={lista.length}             color="#7c3aed" bg="rgba(124,58,237,0.1)" />
        <StatCard icon={Target}     label="Meta total"        value={fmtNum(totalMeta)}        color="#2563eb" bg="rgba(37,99,235,0.1)" />
        <StatCard icon={TrendingUp} label="Ejecutado total"   value={fmtNum(totalEjec)}        color="#1f8f57" bg="rgba(31,143,87,0.1)" />
        <StatCard icon={BarChart3}  label="Avance promedio"   value={`${pctGlobal}%`}          color="#d97706" bg="rgba(217,119,6,0.1)" />
      </div>

      <div className="reportes-section">
        <div className="section-header">
          <h2><Activity size={16} /> Producción por actividad</h2>
          <input
            className="search-input"
            placeholder="Buscar actividad…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        {lista.length === 0 ? <Empty /> : (
          <div className="reportes-table-wrap">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Total PALs</th>
                  <th>Meta total</th>
                  <th>Ejecutado</th>
                  <th>% Avance</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.actividad || '—'}</strong></td>
                    <td>{a.total_pals ?? 0}</td>
                    <td>{fmtNum(a.meta_total)}</td>
                    <td>{fmtNum(a.ejecutado_total)}</td>
                    <td style={{ minWidth: 160 }}><ProgressBar pct={a.porcentaje_avance} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Tab: Nómina General ─────────────────────────────────────────────
function TabNomina({ data }) {
  const [busqueda, setBusqueda] = useState('');

  const resumen = data?.resumen_general || {};
  const detalle = useMemo(() => {
    const arr = data?.detalle_por_trabajador || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(t => {
      const nombre = t.trabajador?.nombre_completo || `${t.trabajador?.nombres || ''} ${t.trabajador?.apellidos || ''}`;
      return nombre.toLowerCase().includes(q) || (t.trabajador?.cargo || '').toLowerCase().includes(q);
    });
  }, [data, busqueda]);

  return (
    <>
      {/* Tarjeta total destacada */}
      <div className="nomina-total-card">
        <div>
          <p className="nt-label">Total nómina del período</p>
          <p className="nt-value">{fmtMoney(resumen.nomina_total)}</p>
          <p className="nt-meta">{resumen.total_trabajadores ?? 0} trabajador(es) · {fmtNum(resumen.total_horas)} horas totales</p>
        </div>
        <DollarSign size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
      </div>

      <div className="reportes-stats">
        <StatCard icon={Users}      label="Trabajadores"     value={resumen.total_trabajadores ?? 0}        color="#2563eb" bg="rgba(37,99,235,0.1)" />
        <StatCard icon={Clock}      label="Horas totales"    value={fmtNum(resumen.total_horas)}            color="#7c3aed" bg="rgba(124,58,237,0.1)" />
        <StatCard icon={DollarSign} label="Prom. por trab."  value={fmtMoney(resumen.promedio_nomina_por_trabajador)} color="#1f8f57" bg="rgba(31,143,87,0.1)" />
      </div>

      <div className="reportes-section">
        <div className="section-header">
          <h2><Users size={16} /> Detalle por trabajador</h2>
          <input
            className="search-input"
            placeholder="Buscar trabajador o cargo…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        {detalle.length === 0 ? <Empty /> : (
          <div className="reportes-table-wrap">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Trabajador</th>
                  <th>Cargo</th>
                  <th>Días trabajados</th>
                  <th>Horas</th>
                  <th>Nómina</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((t, i) => {
                  const nombre = t.trabajador?.nombre_completo
                    || `${t.trabajador?.nombres || ''} ${t.trabajador?.apellidos || ''}`.trim()
                    || '—';
                  return (
                    <tr key={i}>
                      <td><strong>{nombre}</strong></td>
                      <td>{t.trabajador?.cargo || '—'}</td>
                      <td>{t.dias_trabajados ?? 0}</td>
                      <td>{fmtNum(t.horas_trabajadas)}</td>
                      <td><strong style={{ color: 'var(--r-green)' }}>{fmtMoney(t.nomina_total)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'metas',     label: 'Avance de metas',      icon: Target      },
  { id: 'actividad', label: 'Producción actividad',  icon: Activity    },
  { id: 'nomina',    label: 'Nómina general',        icon: DollarSign  },
];

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(hace30());
  const [fechaFin,    setFechaFin]    = useState(hoy());
  const [tabActiva,   setTabActiva]   = useState('metas');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // Datos por sección
  const [dataMetas,     setDataMetas]     = useState(null);
  const [dataActividad, setDataActividad] = useState(null);
  const [dataNomina,    setDataNomina]    = useState(null);
  const [buscado,       setBuscado]       = useState(false);

  const cargar = useCallback(async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona un rango de fechas para generar el reporte.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [rMetas, rActividad, rNomina] = await Promise.allSettled([
        reportesService.getAvanceMetas(null, fechaInicio, fechaFin),
        reportesService.getPorActividad(fechaInicio, fechaFin),
        reportesService.getNominaGeneral(fechaInicio, fechaFin),
      ]);

      setDataMetas(     rMetas.status     === 'fulfilled' ? rMetas.value?.data     : null);
      setDataActividad( rActividad.status === 'fulfilled' ? rActividad.value?.data : null);
      setDataNomina(    rNomina.status    === 'fulfilled' ? rNomina.value?.data    : null);

      // Mostrar error si alguno falló
      const fallidos = [rMetas, rActividad, rNomina].filter(r => r.status === 'rejected');
      if (fallidos.length > 0) {
        setError(`Algunos reportes no se pudieron cargar: ${fallidos.map(f => f.reason?.message || 'error').join(', ')}`);
      }

      setBuscado(true);
    } catch (err) {
      setError(err?.message || 'Error al cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  const tabContent = () => {
    if (loading) return <Spinner />;
    if (!buscado) return (
      <div className="r-empty">
        <BarChart3 size={44} strokeWidth={1.2} />
        <p>Selecciona un período y presiona <strong>Generar reporte</strong>.</p>
      </div>
    );
    if (tabActiva === 'metas')     return <TabAvanceMetas    data={dataMetas}     />;
    if (tabActiva === 'actividad') return <TabPorActividad   data={dataActividad} />;
    if (tabActiva === 'nomina')    return <TabNomina         data={dataNomina}    />;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="reportes-page">

        {/* Header */}
        <div className="reportes-header">
          <div>
            <h1>📊 Reportes Generales</h1>
            <p>Avance de metas, producción por actividad y nómina del período seleccionado</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="reportes-filtros">
          <label>Desde</label>
          <input
            type="date"
            value={fechaInicio}
            max={fechaFin}
            onChange={e => setFechaInicio(e.target.value)}
          />
          <span className="sep">→</span>
          <label>Hasta</label>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio}
            onChange={e => setFechaFin(e.target.value)}
          />
          <button className="btn-buscar" onClick={cargar} disabled={loading}>
            {loading
              ? <><Loader size={14} className="spin" /> Cargando…</>
              : <><RefreshCw size={14} /> Generar reporte</>
            }
          </button>
        </div>

        {/* Alerta */}
        {error && (
          <div className="r-alert r-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="reportes-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`tab-btn ${tabActiva === id ? 'active' : ''}`}
              onClick={() => setTabActiva(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {tabContent()}

      </div>
    </DashboardLayout>
  );
}