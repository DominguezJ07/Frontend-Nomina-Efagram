// ==========================================
// PÁGINA: PROGRAMACIÓN — VERSIÓN FINAL CORREGIDA v2
// ==========================================
// BUGS CORREGIDOS:
//
// BUG #1 — ERROR 400 x5 en consola:
//   El frontend viejo enviaba estado='ACTIVA' como query param al GET /programaciones.
//   En el servidor Render, la ruta GET /:id intercepta 'activas' como un MongoID inválido
//   → validateMongoId('id') devuelve 400 {"message":"ID inválido: activas"}.
//   FIX: Cuando filtroEstado==='ACTIVA' usar el endpoint dedicado /programaciones/activas.
//   Cuando filtroEstado==='' NO enviar el parámetro estado al servidor.
//
// BUG #2 — Colección Programacion no existe en MongoDB:
//   La colección solo se crea al insertar el PRIMER documento exitoso.
//   Como el modal de creación tenía errores, nunca se llegó a crear ninguna.
//   FIX: Con el modal corregido (ModalCrearProgramacion), la primera creación
//   exitosa creará automáticamente la colección en Mongo Atlas.
//
// BUG #3 — Página sin DashboardLayout:
//   El componente no usaba DashboardLayout → no aparecía integrado al sistema.

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, AlertCircle, CheckCircle,
  Activity, Clock, XCircle, CheckSquare
} from 'lucide-react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import ProgramacionTable from '../components/ProgramacionTable';
import ModalCrearProgramacion from '../components/ModalCrearProgramacion';
import ModalRegistroEjecucion from '../components/ModalRegistroEjecucion';
import programacionService from '../services/programacionService';
import '../../../assets/styles/Programacionpage.css';

// ── Normalizar respuesta ──────────────────────────────────────────────
const normalizeProgramaciones = (response) => {
  if (Array.isArray(response?.data?.programaciones)) return response.data.programaciones;
  if (Array.isArray(response?.data))                 return response.data;
  if (Array.isArray(response))                       return response;
  return [];
};

// ── Stat card ─────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => {
  const Icon = icon;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e6e8ef', borderRadius: 12,
      padding: '16px 20px', display: 'flex', alignItems: 'center',
      gap: 14, flex: 1, minWidth: 130,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{value}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
export default function ProgramacionPage() {
  const [programaciones,           setProgramaciones]           = useState([]);
  const [loading,                  setLoading]                  = useState(true);
  const [error,                    setError]                    = useState(null);
  const [success,                  setSuccess]                  = useState(null);
  const [showModalCrear,           setShowModalCrear]           = useState(false);
  const [showModalRegistro,        setShowModalRegistro]        = useState(false);
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState(null);
  const [searchTerm,               setSearchTerm]               = useState('');
  const [filtroEstado,             setFiltroEstado]             = useState(''); // '' = TODAS

  useEffect(() => {
    cargarProgramaciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  // ── Cargar programaciones ─────────────────────────────────────────
  const cargarProgramaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      let lista = [];

      if (filtroEstado === 'ACTIVA') {
        // ✅ FIX BUG #1: Usar endpoint /activas (evita conflicto /:id con 'activas')
        const res = await programacionService.getActivas();
        lista = Array.isArray(res?.data) ? res.data : [];
      } else {
        // ✅ FIX BUG #1: Solo enviar estado si tiene valor real (no string vacío)
        const params = {};
        if (filtroEstado) params.estado = filtroEstado;
        const res = await programacionService.getAll(params);
        lista = normalizeProgramaciones(res);
      }

      setProgramaciones(lista);
    } catch (err) {
      const msg = err?.message || err?.error || 'Error al cargar programaciones';
      setError(msg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtro local por búsqueda de texto
  const programacionesFiltradas = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return programaciones;
    return programaciones.filter(p =>
      (p.contrato?.codigo  || '').toLowerCase().includes(q) ||
      (p.finca?.nombre     || '').toLowerCase().includes(q) ||
      (p.actividad?.nombre || '').toLowerCase().includes(q)
    );
  }, [programaciones, searchTerm]);

  // Stats derivadas del array local
  const stats = useMemo(() => ({
    total:       programaciones.length,
    activas:     programaciones.filter(p => p.estado === 'ACTIVA').length,
    completadas: programaciones.filter(p => p.estado === 'COMPLETADA').length,
    canceladas:  programaciones.filter(p => p.estado === 'CANCELADA').length,
  }), [programaciones]);

  // ── Crear ─────────────────────────────────────────────────────────
  const handleCrearProgramacion = async (datos) => {
    // Lanzamos el error para que el modal lo muestre
    const response = await programacionService.create(datos);
    if (!response?.success) {
      throw new Error(response?.message || 'No se pudo crear la programación');
    }
    setShowModalCrear(false);
    setSuccess('Programación creada exitosamente');
    setTimeout(() => setSuccess(null), 4000);
    await cargarProgramaciones();
  };

  // ── Registro de ejecución ─────────────────────────────────────────
  const handleAbrirRegistro = (prog) => {
    setProgramacionSeleccionada(prog);
    setShowModalRegistro(true);
  };
  const handleCerrarRegistro = () => {
    setShowModalRegistro(false);
    setProgramacionSeleccionada(null);
    cargarProgramaciones();
  };

  // ── Eliminar ──────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta programación y sus 7 registros diarios?')) return;
    try {
      await programacionService.delete(id);
      setProgramaciones(prev => prev.filter(p => p._id !== id));
      setSuccess('Programación eliminada');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.message || 'Error al eliminar');
      setTimeout(() => setError(null), 4000);
    }
  };

  const FILTROS = [
    { value: '',           label: 'Todas'      },
    { value: 'ACTIVA',     label: 'Activas'    },
    { value: 'COMPLETADA', label: 'Completadas'},
    { value: 'CANCELADA',  label: 'Canceladas' },
    { value: 'PAUSADA',    label: 'Pausadas'   },
  ];

  return (
    <DashboardLayout>
      <div className="programacion-page">

        {/* Header */}
        <div className="programacion-header">
          <div className="header-content">
            <h1>📅 Programación de Ejecución</h1>
            <p>Gestiona la ejecución semanal de contratos — cada programación cubre 7 días</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setShowModalCrear(true)}>
            <Plus size={18} /> Nueva Programación
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard icon={Activity}    label="Total"       value={stats.total}       color="#3b82f6" bg="rgba(59,130,246,0.1)"  />
          <StatCard icon={Clock}       label="Activas"     value={stats.activas}     color="#1f8f57" bg="rgba(31,143,87,0.1)"   />
          <StatCard icon={CheckSquare} label="Completadas" value={stats.completadas} color="#8b5cf6" bg="rgba(139,92,246,0.1)"  />
          <StatCard icon={XCircle}     label="Canceladas"  value={stats.canceladas}  color="#64748b" bg="rgba(100,116,139,0.1)" />
        </div>

        {/* Alertas */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>&times;</button>
          </div>
        )}
        {success && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#1f8f57', color: '#fff',
            padding: '12px 18px', borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 6px 24px rgba(31,143,87,0.35)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fadeInUp 0.25s ease',
          }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Filtros */}
        <div className="programacion-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por contrato, finca o actividad..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTROS.map(f => (
              <button
                key={f.value}
                onClick={() => setFiltroEstado(f.value)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  border:     filtroEstado === f.value ? '2px solid #1f8f57' : '1.5px solid #e2e8f0',
                  background: filtroEstado === f.value ? '#1f8f57' : '#fff',
                  color:      filtroEstado === f.value ? '#fff' : '#475569',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <ProgramacionTable
          programaciones={programacionesFiltradas}
          loading={loading}
          onRegistrarEjecucion={handleAbrirRegistro}
          onEliminar={handleEliminar}
        />

        {/* Modal Crear */}
        {showModalCrear && (
          <ModalCrearProgramacion
            isOpen={showModalCrear}
            onClose={() => setShowModalCrear(false)}
            onSave={handleCrearProgramacion}
          />
        )}

        {/* Modal Registro Ejecución */}
        {showModalRegistro && programacionSeleccionada && (
          <ModalRegistroEjecucion
            isOpen={showModalRegistro}
            onClose={handleCerrarRegistro}
            programacion={programacionSeleccionada}
          />
        )}
      </div>
    </DashboardLayout>
  );
}