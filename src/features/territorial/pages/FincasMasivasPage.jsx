import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  FolderUp,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import {
  getFincasBulkTemplateData,
  bulkUpsertFincas,
} from '../services/fincas.service';
import '../territorial.css';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
};

const statCardStyle = {
  ...cardStyle,
  padding: '14px 16px',
  minHeight: '88px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const iconWrapStyle = (bg, color, size = 44) => ({
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: bg,
  color,
  flexShrink: 0,
});

const actionBtnStyle = (variant = 'primary') => ({
  height: '42px',
  borderRadius: '12px',
  border: variant === 'primary' ? 'none' : '1px solid #d1d5db',
  background: variant === 'primary' ? '#16a34a' : '#ffffff',
  color: variant === 'primary' ? '#ffffff' : '#111827',
  padding: '0 16px',
  fontWeight: 700,
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  boxShadow: variant === 'primary' ? '0 8px 18px rgba(22, 163, 74, 0.16)' : 'none',
});

const stepCardStyle = {
  ...cardStyle,
  padding: '14px',
  minHeight: '96px',
};

export default function FincasMasivasPage() {
  const inputRef = useRef(null);

  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const buildTemplateWorkbook = (data) => {
    const nucleos = (data?.nucleos || []).map((n) => ({
      nucleo_id: n._id,
      codigo: n.codigo || '',
      nombre: n.nombre || '',
      zona_id: n?.zona?._id || '',
      zona_nombre: n?.zona?.nombre || '',
    }));

    const fincas = (data?.fincas || []).map((f) => ({
      operacion: 'ACTUALIZAR',
      finca_id: f._id,
      codigo: f.codigo || '',
      nucleo_id: f?.nucleo?._id || '',
      nombre: f.nombre || '',
      area_total: f?.area_total ?? '',
      activa: f?.activa ?? true,
    }));

    const instrucciones = [
      {
        regla: 'CREAR',
        descripcion:
          'Usa operacion=CREAR, deja finca_id vacío y diligencia nucleo_id, nombre y opcionalmente codigo.',
      },
      {
        regla: 'ACTUALIZAR',
        descripcion:
          'Usa operacion=ACTUALIZAR y diligencia finca_id para actualizar una finca existente.',
      },
      {
        regla: 'NUCLEO_ID',
        descripcion:
          'El núcleo debe indicarse por nucleo_id, no por nombre. Tómalo de la hoja Nucleos.',
      },
      {
        regla: 'CODIGO',
        descripcion:
          'Si codigo va vacío en una fila CREAR, el sistema puede generarlo automáticamente.',
      },
    ];

    const wb = XLSX.utils.book_new();

    const wsFincas = XLSX.utils.json_to_sheet(fincas);
    const wsNucleos = XLSX.utils.json_to_sheet(nucleos);
    const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);

    XLSX.utils.book_append_sheet(wb, wsFincas, 'Fincas');
    XLSX.utils.book_append_sheet(wb, wsNucleos, 'Nucleos');
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

    return wb;
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoadingDownload(true);
      setError('');
      const res = await getFincasBulkTemplateData();
      const wb = buildTemplateWorkbook(res?.data || {});
      XLSX.writeFile(wb, 'fincas_masivas.xlsx');
    } catch (e) {
      console.error(e);
      setError('No se pudo descargar la plantilla');
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
        finca_id: row.finca_id,
        codigo: row.codigo,
        nucleo_id: row.nucleo_id,
        nombre: row.nombre,
        area_total: row.area_total,
        activa: row.activa,
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

      if (!workbook.Sheets['Fincas']) {
        throw new Error('El archivo no contiene la hoja Fincas');
      }

      const sheet = workbook.Sheets['Fincas'];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const payloadRows = parseRowsFromExcel(rows);

      const res = await bulkUpsertFincas(payloadRows);
      setResult(res?.data || null);
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
      <div
        style={{
          padding: '16px',
          height: 'calc(100vh - 72px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: '18px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: '#ecfdf5',
                  color: '#15803d',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                <Database size={13} />
                Gestión masiva territorial
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                Carga masiva de fincas
              </h1>

              <p
                style={{
                  marginTop: '6px',
                  marginBottom: 0,
                  color: '#6b7280',
                  fontSize: '13px',
                  maxWidth: '760px',
                }}
              >
                Descarga la plantilla, edita los campos permitidos y vuelve a subir el archivo usando{' '}
                <strong>nucleo_id</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={loadingDownload}
                style={actionBtnStyle('secondary')}
              >
                {loadingDownload ? <RefreshCw size={16} className="spin-icon" /> : <Download size={16} />}
                {loadingDownload ? 'Descargando...' : 'Descargar'}
              </button>

              <label style={actionBtnStyle('primary')}>
                {loadingUpload ? <RefreshCw size={16} className="spin-icon" /> : <Upload size={16} />}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div style={stepCardStyle}>
              <div style={iconWrapStyle('#eff6ff', '#2563eb', 38)}>
                <Download size={18} />
              </div>
              <h3 style={{ margin: '10px 0 4px', fontSize: '15px', color: '#111827' }}>1. Descarga</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>
                Plantilla con hojas <strong>Fincas</strong>, <strong>Nucleos</strong> e instrucciones.
              </p>
            </div>

            <div style={stepCardStyle}>
              <div style={iconWrapStyle('#f5f3ff', '#7c3aed', 38)}>
                <FileSpreadsheet size={18} />
              </div>
              <h3 style={{ margin: '10px 0 4px', fontSize: '15px', color: '#111827' }}>2. Edita</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>
                Usa operación, código, <strong>nucleo_id</strong>, nombre, área y estado.
              </p>
            </div>

            <div style={stepCardStyle}>
              <div style={iconWrapStyle('#ecfdf5', '#16a34a', 38)}>
                <FolderUp size={18} />
              </div>
              <h3 style={{ margin: '10px 0 4px', fontSize: '15px', color: '#111827' }}>3. Sube</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>
                Procesa el archivo y revisa el resumen de creadas, actualizadas y rechazadas.
              </p>
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              borderStyle: 'dashed',
              borderWidth: '2px',
              borderColor: '#bbf7d0',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              padding: '16px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={iconWrapStyle('#dcfce7', '#15803d', 40)}>
                <Upload size={20} />
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
                  Zona de carga rápida
                </h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>
                  El archivo debe contener la hoja <strong>Fincas</strong> y el núcleo debe ir por{' '}
                  <strong>nucleo_id</strong>.
                </p>
              </div>

              <label style={actionBtnStyle('primary')}>
                {loadingUpload ? <RefreshCw size={16} className="spin-icon" /> : <FileSpreadsheet size={16} />}
                {loadingUpload ? 'Procesando...' : 'Seleccionar archivo'}
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
                marginBottom: '14px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#b91c1c',
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#eff6ff', '#2563eb', 40)}>
                    <Database size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Total</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{result.total}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#ecfdf5', '#16a34a', 40)}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Creadas</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{result.creadas}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#f0fdf4', '#15803d', 40)}>
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Actualizadas</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{result.actualizadas}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={iconWrapStyle('#fef2f2', '#dc2626', 40)}>
                    <XCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Rechazadas</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{result.rechazadas}</div>
                  </div>
                </div>
              </div>

              {Array.isArray(result.errores) && result.errores.length > 0 && (
                <div
                  style={{
                    ...cardStyle,
                    padding: '16px',
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
                        Errores encontrados
                      </h3>
                      <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '12px' }}>
                        Revisa estas filas antes de volver a subir el archivo.
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {result.errores.length} errores
                    </div>
                  </div>

                  <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '10px 12px',
                              background: '#f9fafb',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: '12px',
                              position: 'sticky',
                              top: 0,
                            }}
                          >
                            Fila
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '10px 12px',
                              background: '#f9fafb',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: '12px',
                              position: 'sticky',
                              top: 0,
                            }}
                          >
                            Mensaje
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errores.map((err, idx) => (
                          <tr key={`${err.rowNumber}-${idx}`}>
                            <td
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid #f3f4f6',
                                fontWeight: 700,
                                color: '#111827',
                                width: '90px',
                                fontSize: '13px',
                              }}
                            >
                              {err.rowNumber}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid #f3f4f6',
                                color: '#6b7280',
                                fontSize: '13px',
                              }}
                            >
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
          animation: spinBulkPage 1s linear infinite;
        }

        @keyframes spinBulkPage {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}