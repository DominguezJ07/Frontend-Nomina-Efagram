import { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, Layers, X } from 'lucide-react';
import NuevoNucleoModal from './NuevoNucleoModal';

function NucleoDetalleModal({ isOpen, nucleo, onClose }) {
    if (!isOpen || !nucleo) return null;

    let isActive = false;
    const raw = nucleo?.activo ?? nucleo?.activa ?? nucleo?.estado;
    if (typeof raw === 'boolean') isActive = raw;
    else if (typeof raw === 'string') {
        const v = raw.toLowerCase().trim();
        isActive = v === 'activo' || v === 'activa' || v === 'active' || v === 'true' || v === '1';
    } else if (typeof raw === 'number') isActive = raw === 1;

    return (
        <>
            <div className="zdm-overlay" />
            <div className="zdm-panel" role="dialog" aria-modal="true">
                <button className="zdm-close" onClick={onClose} aria-label="Cerrar"><X size={15} /></button>

                <div className="zdm-header">
                    <h2 className="zdm-title">Detalle de Núcleo</h2>
                    <p className="zdm-subtitle">Información del núcleo territorial</p>
                </div>

                <div className="zdm-name-card">
                    <div className="zdm-pin-wrap" style={{ background: '#f0f7ff', borderColor: '#2563eb', color: '#2563eb' }}>
                        <Layers size={20} />
                    </div>
                    <div className="zdm-name-info">
                        <span className="zdm-name">{nucleo?.nombre ?? '-'}</span>
                        <span className="zdm-code">{nucleo?.codigo ?? '-'}</span>
                    </div>
                </div>

                {nucleo?.zona && (
                    <div className="zdm-estado-box" style={{ marginBottom: 8 }}>
                        <span className="zdm-estado-label">Zona</span>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                            {typeof nucleo.zona === 'object' ? (nucleo.zona?.nombre ?? '-') : nucleo.zona}
                        </span>
                    </div>
                )}

                <div className="zdm-estado-box">
                    <span className="zdm-estado-label">Estado</span>
                    <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
                        {isActive ? '⊙ Activo' : '⊗ Inactivo'}
                    </span>
                </div>
            </div>
        </>
    );
}

export default function NucleosTable({ nucleos = [], zonas = [], search = '', setSearch, onAdd, onUpdate, onDelete }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editNucleo, setEditNucleo] = useState(null);
    const [detalleNucleo, setDetalleNucleo] = useState(null);

    const getId = (n) => n?._id ?? n?.id;

    const handleDelete = async (id) => {
        const ok = window.confirm('¿Eliminar este núcleo?');
        if (!ok) return;
        await onDelete?.(id);
    };

    const resolveZonaNombre = (n) => {
        if (!n?.zona) return '-';
        if (typeof n.zona === 'object') return n.zona?.nombre ?? '-';
        const found = zonas.find((z) => (z?._id ?? z?.id) === n.zona);
        return found?.nombre ?? n.zona;
    };

    return (
        <div className="zonas-card">
            <div className="zonas-card-header">
                <h2 className="zonas-card-title">Núcleos Territoriales</h2>
                <div className="zonas-card-actions">
                    <div className="zonas-search">
                        <Search size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch?.(e.target.value)}
                            placeholder="Buscar núcleo..."
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setOpenCreate(true)}>
                        <Plus size={16} />
                        Nuevo Núcleo
                    </button>
                </div>
            </div>

            <div className="zonas-table-scroll">
                <table className="zonas-table-grid">
                    <thead>
                        <tr>
                            <th className="th-code">Código</th>
                            <th className="th-name">Nombre</th>
                            <th>Zona</th>
                            <th className="th-status">Estado</th>
                            <th className="th-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nucleos.length === 0 ? (
                            <tr><td colSpan={5} className="zonas-empty">No hay núcleos para mostrar</td></tr>
                        ) : (
                            nucleos.map((n) => {
                                const id = getId(n);
                                let isActive = false;
                                const raw = n?.activo ?? n?.activa ?? n?.estado;
                                if (typeof raw === 'boolean') isActive = raw;
                                else if (typeof raw === 'string') {
                                    const v = raw.toLowerCase().trim();
                                    isActive = v === 'activo' || v === 'activa' || v === 'active' || v === 'true' || v === '1';
                                } else if (typeof raw === 'number') isActive = raw === 1;

                                return (
                                    <tr key={id}>
                                        <td>{n?.codigo ?? '-'}</td>
                                        <td>
                                            <div className="zona-name-cell">
                                                <span className="zona-pin-icon"><Layers size={13} /></span>
                                                {n?.nombre ?? '-'}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13, color: '#374151' }}>{resolveZonaNombre(n)}</td>
                                        <td>
                                            <span className={isActive ? 'badge-active' : 'badge-inactive'}>
                                                {isActive ? '⊙ Activo' : '⊗ Inactivo'}
                                            </span>
                                        </td>
                                        <td className="td-actions">
                                            <div className="td-actions-inner">
                                                <button className="icon-btn" type="button" title="Ver detalle" onClick={() => setDetalleNucleo(n)}><Eye size={16} /></button>
                                                <button className="icon-btn" type="button" title="Editar" onClick={() => setEditNucleo(n)}><Pencil size={16} /></button>
                                                <button className="icon-btn danger" type="button" title="Eliminar" onClick={() => handleDelete(id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <NucleoDetalleModal isOpen={!!detalleNucleo} nucleo={detalleNucleo} onClose={() => setDetalleNucleo(null)} />

            <NuevoNucleoModal
                isOpen={openCreate}
                title="Nuevo Núcleo"
                initialValues={{ codigo: '', nombre: '', zona: '', estado: true }}
                zonas={zonas}
                onClose={() => setOpenCreate(false)}
                onSubmit={async (values) => { await onAdd?.(values); setOpenCreate(false); }}
            />

            <NuevoNucleoModal
                isOpen={!!editNucleo}
                title="Editar Núcleo"
                initialValues={{
                    codigo: editNucleo?.codigo ?? '',
                    nombre: editNucleo?.nombre ?? '',
                    zona: typeof editNucleo?.zona === 'object'
                        ? (editNucleo?.zona?._id ?? editNucleo?.zona?.id ?? '')
                        : (editNucleo?.zona ?? ''),
                    activo: typeof editNucleo?.activo === 'boolean'
                        ? editNucleo.activo
                        : (typeof editNucleo?.activa === 'boolean' ? editNucleo.activa : true),
                }}
                zonas={zonas}
                onClose={() => setEditNucleo(null)}
                onSubmit={async (values) => { const id = getId(editNucleo); await onUpdate?.(id, values); setEditNucleo(null); }}
            />
        </div>
    );
}