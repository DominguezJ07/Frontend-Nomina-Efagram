import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, BarChart3, MapPin, Play, Folder,
    Users, CheckSquare, ChevronDown, Layers, Building,
    ClipboardList, AlertTriangle, Calendar, Clock
} from "lucide-react";
import "./sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Detección de sección activa por ruta ──────────────────
    const isTerritorial = location.pathname.startsWith("/territorial");
    const isEjecucion   = location.pathname.startsWith("/ejecucion");
    const isProyectos   = location.pathname.startsWith("/proyectos") ||
                          location.pathname.startsWith("/clientes")  ||
                          location.pathname.startsWith("/catalogo-actividades");

    // null = seguir la ruta automáticamente; true/false = el usuario lo cambió manualmente
    const [manualTerritorial, setManualTerritorial] = useState(null);
    const [manualEjecucion,   setManualEjecucion]   = useState(null);
    const [manualProyectos,   setManualProyectos]   = useState(null);
    const [openPersonal,      setOpenPersonal]      = useState(false);
    const [openActividades,   setOpenActividades]   = useState(false);
    const [openReportes,      setOpenReportes]      = useState(false);

    // Se abre automáticamente según la ruta; el usuario puede abrir/cerrar manualmente
    const openTerritorial = manualTerritorial !== null ? manualTerritorial : isTerritorial;
    const openEjecucion   = manualEjecucion   !== null ? manualEjecucion   : isEjecucion;
    const openProyectos   = manualProyectos   !== null ? manualProyectos   : isProyectos;

    const toggleTerritorial = () => setManualTerritorial(!openTerritorial);
    const toggleEjecucion   = () => setManualEjecucion(!openEjecucion);
    const toggleProyectos   = () => setManualProyectos(!openProyectos);

    const isActive    = (path) => location.pathname === path;
    const isActiveSub = (path) => location.pathname === path ? "submenu-active" : "";

    return (
        <aside className="sidebar">

            {/* HEADER */}
            <div className="sidebar-header">
                <div className="logo-icon"><span>🌿</span></div>
                <div><h2>EFAGRAM S.A.S</h2><p>Sistema de Gestión</p></div>
            </div>

            <hr />

            <div className="sidebar-menu">

                <div className="menu-title">General</div>

                <div
                    className={`menu-item ${isActive("/") ? "active" : ""}`}
                    onClick={() => navigate("/")}
                >
                    <LayoutDashboard size={18} /><span>Dashboard</span>
                </div>

                <div className="menu-title">Módulos</div>

                {/* ── REPORTES ── */}
                <div className="menu-item" onClick={() => setOpenReportes(!openReportes)}>
                    <BarChart3 size={18} /><span>Reportes</span>
                    <ChevronDown size={16} className={`arrow ${openReportes ? "rotate" : ""}`} />
                </div>
                {openReportes && (
                    <div className="submenu">
                        <div className="submenu-item">
                            <BarChart3 size={16} />Reporte General
                        </div>
                    </div>
                )}

                {/* ── TERRITORIAL ── */}
                <div
                    className={`menu-item ${isTerritorial ? "active" : ""}`}
                    onClick={toggleTerritorial}
                >
                    <MapPin size={18} /><span>Territorial</span>
                    <ChevronDown size={16} className={`arrow ${openTerritorial ? "rotate" : ""}`} />
                </div>
                {openTerritorial && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActiveSub("/territorial/zonas")}`}   onClick={() => navigate("/territorial/zonas")}>
                            <MapPin size={16} />Zonas
                        </div>
                        <div className={`submenu-item ${isActiveSub("/territorial/nucleos")}`} onClick={() => navigate("/territorial/nucleos")}>
                            <Layers size={16} />Núcleos
                        </div>
                        <div className={`submenu-item ${isActiveSub("/territorial/fincas")}`}  onClick={() => navigate("/territorial/fincas")}>
                            <Building size={16} />Fincas
                        </div>
                    </div>
                )}

                {/* ── EJECUCIÓN ── */}
                <div
                    className={`menu-item ${isEjecucion ? "active" : ""}`}
                    onClick={toggleEjecucion}
                >
                    <Play size={18} /><span>Ejecución</span>
                    <ChevronDown size={16} className={`arrow ${openEjecucion ? "rotate" : ""}`} />
                </div>
                {openEjecucion && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActiveSub("/ejecucion/registros-diarios")}`}  onClick={() => navigate("/ejecucion/registros-diarios")}>
                            <ClipboardList size={16} />Registro Diario
                        </div>
                        <div className={`submenu-item ${isActiveSub("/ejecucion/novedades")}`}          onClick={() => navigate("/ejecucion/novedades")}>
                            <AlertTriangle size={16} />Novedades
                        </div>
                        <div className={`submenu-item ${isActiveSub("/ejecucion/calendario")}`}         onClick={() => navigate("/ejecucion/calendario")}>
                            <Calendar size={16} />Calendario
                        </div>
                        <div className={`submenu-item ${isActiveSub("/ejecucion/semanas-operativas")}`} onClick={() => navigate("/ejecucion/semanas-operativas")}>
                            <Clock size={16} />Semanas Operativas
                        </div>
                    </div>
                )}

                {/* ── PROYECTOS ── */}
                <div
                    className={`menu-item ${isProyectos ? "active" : ""}`}
                    onClick={toggleProyectos}
                >
                    <Folder size={18} /><span>Proyectos</span>
                    <ChevronDown size={16} className={`arrow ${openProyectos ? "rotate" : ""}`} />
                </div>
                {openProyectos && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActiveSub("/proyectos")}`}            onClick={() => navigate("/proyectos")}>
                            <Folder size={16} />Proyectos
                        </div>
                        <div className={`submenu-item ${isActiveSub("/clientes")}`}             onClick={() => navigate("/clientes")}>
                            <Users size={16} />Clientes
                        </div>
                        <div className={`submenu-item ${isActiveSub("/catalogo-actividades")}`} onClick={() => navigate("/catalogo-actividades")}>
                            <CheckSquare size={16} />Catálogo Actividades
                        </div>
                        {/* Precios eliminado */}
                    </div>
                )}

                {/* ── PERSONAL / NÓMINA ── */}
                <div className="menu-item" onClick={() => setOpenPersonal(!openPersonal)}>
                    <Users size={18} /><span>Personal / Nómina</span>
                    <ChevronDown size={16} className={`arrow ${openPersonal ? "rotate" : ""}`} />
                </div>
                {openPersonal && (
                    <div className="submenu">
                        <div className="submenu-item">
                            <Users size={16} />Empleados
                        </div>
                    </div>
                )}

                {/* ── ACTIVIDADES ── */}
                <div className="menu-item" onClick={() => setOpenActividades(!openActividades)}>
                    <CheckSquare size={18} /><span>Actividades</span>
                    <ChevronDown size={16} className={`arrow ${openActividades ? "rotate" : ""}`} />
                </div>
                {openActividades && (
                    <div className="submenu">
                        <div className="submenu-item">
                            <CheckSquare size={16} />Gestión de Actividades
                        </div>
                    </div>
                )}

            </div>

            {/* FOOTER */}
            <div className="sidebar-footer">
                <div className="user-avatar">J</div>
                <div><strong>Julianavida1309</strong><span>Administrador</span></div>
            </div>

        </aside>
    );
}