import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BarChart3,
    MapPin,
    Play,
    Folder,
    Users,
    CheckSquare,
    ChevronDown,
    Layers,
    Building,
    Grid
} from "lucide-react";

import "./sidebar.css";

export default function Sidebar() {
    const [openTerritorial, setOpenTerritorial] = useState(false);

    const navigate = useNavigate();

    return (
        <aside className="sidebar">

            {/* HEADER */}
            <div className="sidebar-header">
                <div className="logo-icon">
                    <span>🌿</span>
                </div>
                <div>
                    <h2>EFAGRAM S.A.S</h2>
                    <p>Sistema de Gestión</p>
                </div>
            </div>

            <hr />

            <div className="sidebar-menu">

                <div className="menu-title">General</div>

                <div className="menu-item active">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </div>

                <div className="menu-title">Módulos</div>

                <div className="menu-item">
                    <BarChart3 size={18} />
                    <span>Reportes</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

                <div
                    className="menu-item"
                    onClick={() => setOpenTerritorial(!openTerritorial)}
                >
                    <MapPin size={18} />
                    <span>Territorial</span>
                    <ChevronDown
                        size={16}
                        className={`arrow ${openTerritorial ? "rotate" : ""}`}
                    />
                </div>

                {openTerritorial && (
                    <div className="submenu">
                        <div
                            className="submenu-item"
                            onClick={() => navigate("/territorial/zonas")}
                        >
                            <MapPin size={16} />
                            Zonas
                        </div>

                        <div className="submenu-item">
                            <Layers size={16} />
                            Núcleos
                        </div>

                        <div className="submenu-item">
                            <Building size={16} />
                            Fincas
                        </div>

                        <div className="submenu-item">
                            <Grid size={16} />
                            Lotes
                        </div>
                    </div>
                )}


                <div className="menu-item">
                    <Play size={18} />
                    <span>Ejecución</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

                <div className="menu-item">
                    <Folder size={18} />
                    <span>Proyectos</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

                <div className="menu-item">
                    <Users size={18} />
                    <span>Personal / Nómina</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

                <div className="menu-item">
                    <CheckSquare size={18} />
                    <span>Actividades</span>
                    <ChevronDown size={16} className="arrow" />
                </div>

            </div>

            {/* FOOTER */}
            <div className="sidebar-footer">
                <div className="user-avatar">J</div>
                <div>
                    <strong>Julianavida1309</strong>
                    <span>Administrador</span>
                </div>
            </div>

        </aside>
    );
}
