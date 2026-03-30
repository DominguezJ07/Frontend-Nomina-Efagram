import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import {
  Upload,
  Download,
  Users,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Database,
} from 'lucide-react';
import {
  getPersonasBulkTemplateData,
  bulkUpsertPersonas,
} from '../../proyectos/services/personalService';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
};

const statCardStyle = {
  ...cardStyle,
  padding: '18px 20px',
  minHeight: '110px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const iconWrapStyle = (bg, color) => ({
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: bg,
  color,
  flexShrink: 0,
});

const actionBtnStyle = (variant = 'primary') => ({
  height: '46px',
  borderRadius: '14px',
  border: variant === 'primary' ? 'none' : '1px solid #d1d5db',
  background: variant === 'primary' ? '#2563eb' : '#ffffff',
  color: variant === 'primary' ? '#ffffff' : '#111827',
  padding: '0 18px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  boxShadow: variant === 'primary' ? '0 10px 20px rgba(37, 99, 235, 0.18)' : 'none',
});

export default function CargaMasivaPersonalPage() {
  const inputRef = useRef(null);

  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const splitNombres = (fullName = '') => {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    return {
      primer_nombre: parts[0] || '',
      segundo_nombre: parts.slice(1).join(' ') || '',
    };
  };

  const splitApellidos = (fullName = '') => {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    return {
      primer_apellido: parts[0] || '',
      segundo_apellido: parts.slice(1).join(' ') || '',
    };
  };

  const buildTemplateWorkbook = (data) => {
    const personas = (data?.personas || []).map((p) => {
      const nombres = splitNombres(p.nombres);
      const apellidos = splitApellidos(p.apellidos);

      return {
        operacion: 'ACTUALIZAR',
        persona_id: p._id,
        cedula: p.num_doc || '',
        primer_nombre: nombres.primer_nombre,
        segundo_nombre: nombres.segundo_nombre,
        primer_apellido: apellidos.primer_apellido,
        segundo_apellido: apellidos.segundo_apellido,
        cargo: p.cargo || '',
        tipo_contrato: p.tipo_contrato || '',
        fecha_ingreso: p.fecha_ingreso ? String(p.fecha_ingreso).slice(0, 10) : '',
        estado: p.estado || 'ACTIVO',
        finca_id: p?.finca?._id || '',
        proceso_id: p?.proceso?._id || '',
        supervisor_id: p?.supervisor?._id || '',
      };
    });

    const fincas = (data?.fincas || []).map((f) => ({
      finca_id: f._id,
      codigo: f.codigo || '',
      nombre: f.nombre || '',
    }));

    const procesos = (data?.procesos || []).map((p) => ({
      proceso_id: p._id,
      codigo: p.codigo || '',
      nombre: p.nombre || '',
    }));

    const supervisores = (data?.supervisores || []).map((s) => ({
      supervisor_id: s._id,
      cedula: s.num_doc || '',
      nombres: s.nombres || '',
      apellidos: s.apellidos || '',
      cargo: s.cargo || '',
    }));

    const instrucciones = [
      {
        regla: 'CREAR',
        descripcion: 'Usa operacion=CREAR, deja persona_id vacío y diligencia los campos obligatorios.',
      },
      {
        regla: 'ACTUALIZAR',
        descripcion: 'Usa operacion=ACTUALIZAR y diligencia persona_id para actualizar un registro existente.',
      },
      {
        regla: 'FECHA',
        descripcion: 'fecha_ingreso debe ir como YYYY-MM-DD o DD/MM/YYYY.',
      },
      {
        regla: 'RELACIONES',
        descripcion: 'finca_id, proceso_id y supervisor_id deben tomarse de sus hojas de referencia.',
      },
    ];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(personas), 'Personal');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fincas), 'Fincas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(procesos), 'Procesos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supervisores), 'Supervisores');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(instrucciones), 'Instrucciones');

    return wb;
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoadingDownload(true);
      setError('');
      const res = await getPersonasBulkTemplateData();
      const wb = buildTemplateWorkbook(res?.data?.data || res?.data || {});
      XLSX.writeFile(wb, 'personal_masivo.xlsx');
    } catch (e) {
      console.error(e);
      setError('No se pudo descargar la plantilla de personal');
    } finally {
      setLoadingDownload(false);
    }
  };

  const parseRowsFromExcel = (rows) => {
    return rows
      .filter((row) => {
        const values = Object.values(row || {});
        return values.some((v) => String(v ?? '').trim() !== '');
      })
      .map((row, index) => ({
        rowNumber: index + 2,
        operacion: row.operacion,
        persona_id: row.persona_id,
        cedula: row.cedula,
        primer_nombre: row.primer_nombre,
        segundo_nombre: row.segundo_nombre,
        primer_apellido: row.primer_apellido,
        segundo_apellido: row.segundo_apellido,
        cargo: row.cargo,
        tipo_contrato: row.tipo_contrato,
        fecha_ingreso: row.fecha_ingreso,
        estado: row.estado,
        finca_id: row.finca_id,
        proceso_id: row.proceso_id,
        supervisor_id: row.supervisor_id,
      }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoadingUpload(true);
      setError('');
      setResult(null);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      if (!workbook.Sheets['Personal']) {
        throw new Error('El archivo no contiene la hoja Personal');
      }

      const sheet = workbook.Sheets['Personal'];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const payloadRows = parseRowsFromExcel(rows);

      const res = await bulkUpsertPersonas(payloadRows);
      setResult(res?.data?.data || res?.data || null);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'No se pudo procesar el archivo');
    } finally {
      setLoadingUpload(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ ...cardStyle, padding: '28px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '14px',
                }}
              >
                <Users size={14} />
                Módulo de personal
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '30px',
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                Carga masiva de personal
              </h1>

              <p
                style={{
                  marginTop: '10px',
                  marginBottom: 0,
                  color: '#6b7280',
                  fontSize: '15px',
                  maxWidth: '760px',
                }}
              >
                Descarga la plantilla, edítala con los campos más necesarios y súbela nuevamente.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={loadingDownload}
                style={actionBtnStyle('secondary')}
              >
                {loadingDownload ? <RefreshCw size={18} className="spin-icon" /> : <Download size={18} />}
                {loadingDownload ? 'Descargando...' : 'Descargar plantilla'}
              </button>

              <label style={actionBtnStyle('primary')}>
                {loadingUpload ? <RefreshCw size={18} className="spin-icon" /> : <Upload size={18} />}
                {loadingUpload ? 'Procesando...' : 'Subir Excel'}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={loadingUpload}
                />
              </label>
            </div>
          </div>

          {error && (
            <div
              style={{
                ...cardStyle,
                marginBottom: '24px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#b91c1c',
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#eff6ff', '#2563eb')}>
                    <Database size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Total filas</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827' }}>{result.total}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#ecfdf5', '#16a34a')}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Creadas</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827' }}>{result.creadas}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#f0fdf4', '#15803d')}>
                    <RefreshCw size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Actualizadas</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827' }}>{result.actualizadas}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#fef2f2', '#dc2626')}>
                    <XCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Rechazadas</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827' }}>{result.rechazadas}</div>
                  </div>
                </div>
              </div>

              {Array.isArray(result.errores) && result.errores.length > 0 && (
                <div style={{ ...cardStyle, padding: '22px' }}>
                  <h3 style={{ marginTop: 0, color: '#111827' }}>Errores encontrados</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Fila</th>
                          <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Mensaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errores.map((err, idx) => (
                          <tr key={`${err.rowNumber}-${idx}`}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontWeight: 700 }}>
                              {err.rowNumber}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                              {err.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .spin-icon {
          animation: spinBulkPersonal 1s linear infinite;
        }

        @keyframes spinBulkPersonal {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}