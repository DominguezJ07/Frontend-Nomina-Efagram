import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, BarChart3, Play, Folder,
    Users, CheckSquare, ChevronDown, Layers, Building,
    AlertTriangle, Calendar, Clock,
    Settings, MapPin, Wrench, GitBranch, FileText, Activity, Briefcase
} from "lucide-react";
import "./sidebar.css";

const SIDEBAR_SCROLL_KEY = "efagram_sidebar_scroll_top";
const SIDEBAR_STATE_KEY = "efagram_sidebar_state";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    const isEjecucion = location.pathname.startsWith("/ejecucion");
    const isProyectos = location.pathname.startsWith("/proyectos");
    const isProgramacion = location.pathname.startsWith("/programacion");
    const isConfiguracion = location.pathname.startsWith("/configuracion");
    const isReportes = location.pathname.startsWith("/reportes");

    const getInitialSidebarState = () => {
        try {
            const saved = sessionStorage.getItem(SIDEBAR_STATE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    manualEjecucion: parsed.manualEjecucion ?? null,
                    manualProyectos: parsed.manualProyectos ?? null,
                    manualConfiguracion: parsed.manualConfiguracion ?? null,
                    openReportes: parsed.openReportes ?? false,
                    openUbicacion:
                        parsed.openUbicacion ??
                        location.pathname.startsWith("/configuracion/ubicacion"),
                };
            }
        } catch (error) {
            console.error("No se pudo leer el estado del sidebar:", error);
        }

        return {
            manualEjecucion: null,
            manualProyectos: null,
            manualConfiguracion: null,
            openReportes: false,
            openUbicacion: location.pathname.startsWith("/configuracion/ubicacion"),
        };
    };

    const initialState = getInitialSidebarState();

    const [manualEjecucion, setManualEjecucion] = useState(initialState.manualEjecucion);
    const [manualProyectos, setManualProyectos] = useState(initialState.manualProyectos);
    const [manualConfiguracion, setManualConfiguracion] = useState(initialState.manualConfiguracion);
    const [openReportes, setOpenReportes] = useState(initialState.openReportes);
    const [openUbicacion, setOpenUbicacion] = useState(initialState.openUbicacion);

    const openEjecucion = manualEjecucion !== null ? manualEjecucion : isEjecucion;
    const openProyectos = manualProyectos !== null ? manualProyectos : isProyectos;
    const openConfiguracion = manualConfiguracion !== null ? manualConfiguracion : isConfiguracion;

    const toggleEjecucion = () => setManualEjecucion((prev) => !(prev !== null ? prev : isEjecucion));
    const toggleProyectos = () => setManualProyectos((prev) => !(prev !== null ? prev : isProyectos));
    const toggleConfiguracion = () => setManualConfiguracion((prev) => !(prev !== null ? prev : isConfiguracion));

    const isActive = (path) => location.pathname === path;
    const isActiveSub = (path) => location.pathname === path ? "submenu-active" : "";

    const saveSidebarScroll = () => {
        const el = sidebarRef.current;
        if (!el) return;
        sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
    };

    const navigatePreservingSidebar = (path) => {
        saveSidebarScroll();
        navigate(path);
    };

    useEffect(() => {
        try {
            sessionStorage.setItem(
                SIDEBAR_STATE_KEY,
                JSON.stringify({
                    manualEjecucion,
                    manualProyectos,
                    manualConfiguracion,
                    openReportes,
                    openUbicacion,
                })
            );
        } catch (error) {
            console.error("No se pudo guardar el estado del sidebar:", error);
        }
    }, [manualEjecucion, manualProyectos, manualConfiguracion, openReportes, openUbicacion]);

    useLayoutEffect(() => {
        const el = sidebarRef.current;
        if (!el) return;

        const savedScroll = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
        if (savedScroll !== null) {
            el.scrollTop = Number(savedScroll) || 0;
        }
    }, [location.pathname]);

    useEffect(() => {
        const el = sidebarRef.current;
        if (!el) return;

        const handleScroll = () => {
            sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (location.pathname.startsWith("/configuracion/ubicacion")) {
            setManualConfiguracion(true);
            setOpenUbicacion(true);
        }
    }, [location.pathname]);

    return (
        <aside className="sidebar" ref={sidebarRef}>

            <div className="sidebar-header">
                <div className="logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 3C21 3 13 3 8 8c-3.5 3.5-4 9-4 9s5.5-.5 9-4c1.2-1.2 2.1-2.6 2.7-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 21c2-2 4-6 5-9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <div><h2>EFAGRAM S.A.S</h2><p>Sistema de Gestión</p></div>
            </div>

            <hr />

            <div className="sidebar-menu">

                <div className="menu-title">General</div>

                <div
                    className={`menu-item ${isActive("/") ? "active" : ""}`}
                    onClick={() => navigatePreservingSidebar("/")}
                >
                    <LayoutDashboard size={18} /><span>Dashboard</span>
                </div>

                <div className="menu-title">Módulos</div>

                <div
                    className={`menu-item ${isReportes ? "active" : ""}`}
                    onClick={() => setOpenReportes((prev) => !prev)}
                >
                    <BarChart3 size={18} /><span>Reportes</span>
                    <ChevronDown size={16} className={`arrow ${openReportes ? "rotate" : ""}`} />
                </div>
                {openReportes && (
                    <div className="submenu">
                        <div
                            className={`submenu-item ${isActiveSub("/reportes")}`}
                            onClick={() => navigatePreservingSidebar("/reportes")}
                        >
                            <BarChart3 size={16} />Reporte General
                        </div>
                    </div>
                )}

                <div
                    className={`menu-item ${isEjecucion ? "active" : ""}`}
                    onClick={toggleEjecucion}
                >
                    <Play size={18} /><span>Ejecución</span>
                    <ChevronDown size={16} className={`arrow ${openEjecucion ? "rotate" : ""}`} />
                </div>
                {openEjecucion && (
                    <div className="submenu">
                        <div
                            className={`submenu-item ${isActiveSub("/ejecucion/novedades")}`}
                            onClick={() => navigatePreservingSidebar("/ejecucion/novedades")}
                        >
                            <AlertTriangle size={16} />Novedades
                        </div>
                        <div
                            className={`submenu-item ${isActiveSub("/ejecucion/calendario")}`}
                            onClick={() => navigatePreservingSidebar("/ejecucion/calendario")}
                        >
                            <Calendar size={16} />Calendario
                        </div>
                        <div
                            className={`submenu-item ${isActiveSub("/ejecucion/semanas-operativas")}`}
                            onClick={() => navigatePreservingSidebar("/ejecucion/semanas-operativas")}
                        >
                            <Clock size={16} />Semanas Operativas
                        </div>
                    </div>
                )}

                <div
                    className={`menu-item ${isProgramacion ? "active" : ""}`}
                    onClick={() => navigatePreservingSidebar("/programacion")}
                >
                    <Activity size={18} /><span>Programación</span>
                </div>

                <div
                    className={`menu-item ${isProyectos ? "active" : ""}`}
                    onClick={toggleProyectos}
                >
                    <Folder size={18} /><span>Proyectos</span>
                    <ChevronDown size={16} className={`arrow ${openProyectos ? "rotate" : ""}`} />
                </div>
                {openProyectos && (
                    <div className="submenu">
                        <div
                            className={`submenu-item ${isActiveSub("/proyectos")}`}
                            onClick={() => navigatePreservingSidebar("/proyectos")}
                        >
                            <Folder size={16} />Proyectos
                        </div>
                        <div
                            className={`submenu-item ${isActiveSub("/proyectos/subproyectos")}`}
                            onClick={() => navigatePreservingSidebar("/proyectos/subproyectos")}
                        >
                            <GitBranch size={16} />Subproyectos
                        </div>
                        <div
                            className={`submenu-item ${isActiveSub("/proyectos/contratos")}`}
                            onClick={() => navigatePreservingSidebar("/proyectos/contratos")}
                        >
                            <FileText size={16} />Contratos
                        </div>
                    </div>
                )}

                <div className="menu-title">Sistema</div>

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
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-clientes")}
                        >
                            <Users size={16} />Catálogo Clientes
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-actividades")}`}
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-actividades")}
                        >
                            <CheckSquare size={16} />Catálogo Actividades
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-intervenciones")}`}
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-intervenciones")}
                        >
                            <Wrench size={16} />Catálogo Intervenciones
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-procesos")}`}
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-procesos")}
                        >
                            <Layers size={16} />Catálogo Procesos
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-personal")}`}
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-personal")}
                        >
                            <Users size={16} />Catálogo Personal
                        </div>

                        <div
                            className={`submenu-item ${isActiveSub("/configuracion/catalogo-cargos")}`}
                            onClick={() => navigatePreservingSidebar("/configuracion/catalogo-cargos")}
                        >
                            <Briefcase size={16} />Catálogo Cargos
                        </div>

                        <div
                            className="submenu-item submenu-group"
                            onClick={() => setOpenUbicacion((prev) => !prev)}
                        >
                            <MapPin size={16} />
                            <span>Ubicación</span>
                            <ChevronDown size={13} className={`arrow arrow-sub ${openUbicacion ? "rotate" : ""}`} />
                        </div>

                        {openUbicacion && (
                            <div className="submenu submenu-nested">
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/zonas")}`}
                                    onClick={() => navigatePreservingSidebar("/configuracion/ubicacion/zonas")}
                                >
                                    <MapPin size={14} />Zonas
                                </div>
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/nucleos")}`}
                                    onClick={() => navigatePreservingSidebar("/configuracion/ubicacion/nucleos")}
                                >
                                    <Layers size={14} />Núcleos
                                </div>
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/fincas")}`}
                                    onClick={() => navigatePreservingSidebar("/configuracion/ubicacion/fincas")}
                                >
                                    <Building size={14} />Fincas
                                </div>
                                <div
                                    className={`submenu-item ${isActiveSub("/configuracion/ubicacion/fincas-masivas")}`}
                                    onClick={() => navigatePreservingSidebar("/configuracion/ubicacion/fincas-masivas")}
                                >
                                    <Building size={14} />Carga masiva fincas
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