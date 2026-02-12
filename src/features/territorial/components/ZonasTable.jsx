import { Eye, Pencil, Trash2, Plus } from "lucide-react";

export default function ZonasTable() {
  return (
    <div className="zonas-table">

      <div className="table-header">
        <h2>Zonas Territoriales</h2>

        <button className="btn-primary">
          <Plus size={18} />
          Nueva Zona
        </button>
      </div>

      <table className="zonas-table-grid">
        <thead>
          <tr>
            <th>Zona</th>
            <th>Núcleos</th>
            <th>Fincas</th>
            <th>Lotes</th>
            <th>Hectáreas</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="zona-name">
              <span className="zona-icon">📍</span> Zona Norte
            </td>
            <td><span className="pill">3</span></td>
            <td><span className="pill">8</span></td>
            <td><span className="pill">24</span></td>
            <td>450 ha</td>
            <td className="actions">
              <Eye size={18} />
              <Pencil size={18} />
              <Trash2 size={18} />
            </td>
          </tr>

          <tr>
            <td className="zona-name">
              <span className="zona-icon">📍</span> Zona Sur
            </td>
            <td><span className="pill">2</span></td>
            <td><span className="pill">5</span></td>
            <td><span className="pill">15</span></td>
            <td>310 ha</td>
            <td className="actions">
              <Eye size={18} />
              <Pencil size={18} />
              <Trash2 size={18} />
            </td>
          </tr>

          <tr>
            <td className="zona-name">
              <span className="zona-icon">📍</span> Zona Central
            </td>
            <td><span className="pill">4</span></td>
            <td><span className="pill">12</span></td>
            <td><span className="pill">36</span></td>
            <td>680 ha</td>
            <td className="actions">
              <Eye size={18} />
              <Pencil size={18} />
              <Trash2 size={18} />
            </td>
          </tr>

          <tr>
            <td className="zona-name">
              <span className="zona-icon">📍</span> Zona Oriente
            </td>
            <td><span className="pill">2</span></td>
            <td><span className="pill">6</span></td>
            <td><span className="pill">18</span></td>
            <td>290 ha</td>
            <td className="actions">
              <Eye size={18} />
              <Pencil size={18} />
              <Trash2 size={18} />
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}
