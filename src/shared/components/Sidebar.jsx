import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, BarChart3, MapPin, Play, Folder,
    Users, CheckSquare, ChevronDown, Layers, Building,
    Grid, ClipboardList, AlertTriangle, Calendar, Clock
} from "lucide-react";
import "./sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isTerritorial = location.pathname.startsWith("/territorial");
    const isEjecucion = location.pathname.startsWith("/ejecucion");

    const [openTerritorial, setOpenTerritorial] = useState(isTerritorial);
    const [openEjecucion, setOpenEjecucion] = useState(isEjecucion);

    useEffect(() => { if (isTerritorial) setOpenTerritorial(true); }, [isTerritorial]);
    useEffect(() => { if (isEjecucion) setOpenEjecucion(true); }, [isEjecucion]);

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon"><span>🌿</span></div>
                <div><h2>EFAGRAM S.A.S</h2><p>Sistema de Gestión</p></div>
            </div>
            <hr />
            <div className="sidebar-menu">
                <div className="menu-title">General</div>
                <div className={`menu-item ${isActive("/") ? "active" : ""}`} onClick={() => navigate("/")}>
                    <LayoutDashboard size={18} /><span>Dashboard</span>
                </div>

                <div className="menu-title">Módulos</div>

                <div className="menu-item">
                    <BarChart3 size={18} /><span>Reportes</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

                <div className={`menu-item ${isTerritorial ? "active" : ""}`} onClick={() => setOpenTerritorial(!openTerritorial)}>
                    <MapPin size={18} /><span>Territorial</span>
                    <ChevronDown size={16} className={`arrow ${openTerritorial ? "rotate" : ""}`} />
                </div>
                {openTerritorial && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActive("/territorial/zonas") ? "submenu-active" : ""}`} onClick={() => navigate("/territorial/zonas")}><MapPin size={16} />Zonas</div>
                        <div className={`submenu-item ${isActive("/territorial/nucleos") ? "submenu-active" : ""}`} onClick={() => navigate("/territorial/nucleos")}><Layers size={16} />Núcleos</div>
                        <div className={`submenu-item ${isActive("/territorial/fincas") ? "submenu-active" : ""}`} onClick={() => navigate("/territorial/fincas")}><Building size={16} />Fincas</div>

                    </div>
                )}

                <div className={`menu-item ${isEjecucion ? "active" : ""}`} onClick={() => setOpenEjecucion(!openEjecucion)}>
                    <Play size={18} /><span>Ejecución</span>
                    <ChevronDown size={16} className={`arrow ${openEjecucion ? "rotate" : ""}`} />
                </div>
                {openEjecucion && (
                    <div className="submenu">
                        <div className={`submenu-item ${isActive("/ejecucion/registros-diarios") ? "submenu-active" : ""}`} onClick={() => navigate("/ejecucion/registros-diarios")}><ClipboardList size={16} />Registro Diario</div>
                        <div className={`submenu-item ${isActive("/ejecucion/novedades") ? "submenu-active" : ""}`} onClick={() => navigate("/ejecucion/novedades")}><AlertTriangle size={16} />Novedades</div>
                        <div className={`submenu-item ${isActive("/ejecucion/calendario") ? "submenu-active" : ""}`} onClick={() => navigate("/ejecucion/calendario")}><Calendar size={16} />Calendario</div>
                        <div className={`submenu-item ${isActive("/ejecucion/semanaoperativas") ? "submenu-active" : ""}`} onClick={() => navigate("/ejecucion/semanas-operativas")}><Clock size={16} />Semanas Operativas</div>
                    </div>
                )}

                <div className="menu-item"><Folder size={18} /><span>Proyectos</span><ChevronDown size={16} className="arrow" /></div>
                <div className="menu-item"><Users size={18} /><span>Personal / Nómina</span><ChevronDown size={16} className="arrow" /></div>
                <div className="menu-item"><CheckSquare size={18} /><span>Actividades</span><ChevronDown size={16} className="arrow" /></div>
            </div>

            <div className="sidebar-footer">
                <div className="user-avatar">J</div>
                <div><strong>Julianavida1309</strong><span>Administrador</span></div>
            </div>
        </aside>
    );
}