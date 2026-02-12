import { MapPin, Layers, Trees, Grid3X3 } from "lucide-react";

export default function TerritorialStats() {
  return (
    <div className="territorial-stats">

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon">
          <MapPin size={18} />
        </div>
        <div className="territorial-stat-text">
          <p>Zonas</p>
          <h3>4</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon">
          <Layers size={18} />
        </div>
        <div className="territorial-stat-text">
          <p>Núcleos</p>
          <h3>11</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon">
          <Trees size={18} />
        </div>
        <div className="territorial-stat-text">
          <p>Fincas</p>
          <h3>31</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon">
          <Grid3X3 size={18} />
        </div>
        <div className="territorial-stat-text">
          <p>Hectáreas</p>
          <h3>1730</h3>
        </div>
      </div>

    </div>
  );
}
