import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, BarChart3, Play, Folder,
    Users, CheckSquare, ChevronDown, Layers, Building,
    AlertTriangle, Calendar, Clock,
    Settings, MapPin, Wrench, GitBranch, FileText, Activity, Briefcase
} from "lucide-react";
import "./sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isEjecucion = location.pathname.startsWith("/ejecucion");
    const isProyectos = location.pathname.startsWith("/proyectos");
    const isProgramacion = location.pathname.startsWith("/programacion");
    const isConfiguracion = location.pathname.startsWith("/configuracion");
    const isReportes = location.pathname.startsWith("/reportes");

    const [manualEjecucion, setManualEjecucion] = useState(null);
    const [manualProyectos, setManualProyectos] = useState(null);
    const [manualConfiguracion, setManualConfiguracion] = useState(null);
    const [openReportes, setOpenReportes] = useState(false);

    const [openUbicacion, setOpenUbicacion] = useState(
        location.pathname.startsWith("/configuracion/ubicacion")
    );

    const openEjecucion = manualEjecucion !== null ? manualEjecucion : isEjecucion;
    const openProyectos = manualProyectos !== null ? manualProyectos : isProyectos;
    const openConfiguracion = manualConfiguracion !== null ? manualConfiguracion : isConfiguracion;

    const toggleEjecucion = () => setManualEjecucion(!openEjecucion);
    const toggleProyectos = () => setManualProyectos(!openProyectos);
    const toggleConfiguracion = () => setManualConfiguracion(!openConfiguracion);

    const isActive = (path) => location.pathname === path;
    const isActiveSub = (path) => location.pathname === path ? "submenu-active" : "";

    return (
        <aside className="sidebar">

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
                <div className={`menu-item ${isReportes ? "active" : ""}`} onClick={() => setOpenReportes(!openReportes)}>
                    <BarChart3 size={18} /><span>Reportes</span>
                    <ChevronDown size={16} className={`arrow ${openReportes ? "rotate" : ""}`} />
                </div>
                {openReportes && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActiveSub("/reportes")}`} onClick={() => navigate("/reportes")}>
                            <BarChart3 size={16} />Reporte General
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
                        <div className={`submenu-item ${isActiveSub("/ejecucion/novedades")}`} onClick={() => navigate("/ejecucion/novedades")}>
                            <AlertTriangle size={16} />Novedades
                        </div>
                        <div className={`submenu-item ${isActiveSub("/ejecucion/calendario")}`} onClick={() => navigate("/ejecucion/calendario")}>
                            <Calendar size={16} />Calendario
                        </div>
                        <div className={`submenu-item ${isActiveSub("/ejecucion/semanas-operativas")}`} onClick={() => navigate("/ejecucion/semanas-operativas")}>
                            <Clock size={16} />Semanas Operativas
                        </div>
                    </div>
                )}

                {/* ── PROGRAMACIÓN (NUEVO) ── */}
                <div
                    className={`menu-item ${isProgramacion ? "active" : ""}`}
                    onClick={() => navigate("/programacion")}
                >
                    <Activity size={18} /><span>Programación</span>
                </div>

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
                        <div className={`submenu-item ${isActiveSub("/proyectos")}`} onClick={() => navigate("/proyectos")}>
                            <Folder size={16} />Proyectos
                        </div>
                        <div className={`submenu-item ${isActiveSub("/proyectos/subproyectos")}`} onClick={() => navigate("/proyectos/subproyectos")}>
                            <GitBranch size={16} />Subproyectos
                        </div>
                        <div className={`submenu-item ${isActiveSub("/proyectos/contratos")}`} onClick={() => navigate("/proyectos/contratos")}>
                            <FileText size={16} />Contratos
                        </div>
                    </div>
                )}

                <div className="menu-title">Sistema</div>

                {/* ── CONFIGURACIÓN ── */}
                <div
                    className={`menu-item ${isConfiguracion ? "active" : ""}`}
                    onClick={toggleConfiguracion}
                >
                    <Settings size={18} /><span>Configuración</span>
                    <ChevronDown size={16} className={`arrow ${openConfiguracion ? "rotate" : ""}`} />
                </div>

                {openConfiguracion && (
                    <div className="submenu">

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-clientes")}`}
                            onClick={() => navigate("/configuracion/catalogo-clientes")}
                        >
                            <Users size={16} />Catálogo Clientes
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-actividades")}`}
                            onClick={() => navigate("/configuracion/catalogo-actividades")}
                        >
                            <CheckSquare size={16} />Catálogo Actividades
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-intervenciones")}`}
                            onClick={() => navigate("/configuracion/catalogo-intervenciones")}
                        >
                            <Wrench size={16} />Catálogo Intervenciones
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-procesos")}`}
                            onClick={() => navigate("/configuracion/catalogo-procesos")}
                        >
                            <Layers size={16} />Catálogo Procesos
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-personal")}`}
                            onClick={() => navigate("/configuracion/catalogo-personal")}
                        >
                            <Users size={16} />Catálogo Personal
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-cargos")}`}
                            onClick={() => navigate("/configuracion/catalogo-cargos")}
                        >
                            <Briefcase size={16} />Catálogo Cargos
                        </div>

                        {/* ── Ubicación ── */}
                        <div
                            className="submenu-item submenu-group"
                            onClick={() => setOpenUbicacion(!openUbicacion)}
                        >
                            <MapPin size={16} />
                            <span>Ubicación</span>
                            <ChevronDown size={13} className={`arrow arrow-sub ${openUbicacion ? "rotate" : ""}`} />
                        </div>
                        {openUbicacion && (
                            <div className="submenu submenu-nested">
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/zonas")}`}
                                    onClick={() => navigate("/configuracion/ubicacion/zonas")}
                                >
                                    <MapPin size={14} />Zonas
                                </div>
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/nucleos")}`}
                                    onClick={() => navigate("/configuracion/ubicacion/nucleos")}
                                >
                                    <Layers size={14} />Núcleos
                                </div>
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/fincas")}`}
                                    onClick={() => navigate("/configuracion/ubicacion/fincas")}
                                >
                                    <Building size={14} />Fincas
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>

            <div className="sidebar-footer">
                <div className="user-avatar">J</div>
                <div><strong>Julianavida1309</strong><span>Administrador</span></div>
            </div>

        </aside>
    );
}