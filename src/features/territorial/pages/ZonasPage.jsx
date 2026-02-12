import DashboardLayout from "../../../app/layouts/DashboardLayout";
import TerritorialStats from "../components/TerritorialStats";
import ZonasTable from "../components/ZonasTable";
import "../territorial.css";

export default function ZonasPage() {
  return (
    <DashboardLayout>
      <div className="territorial-container">

        <div className="territorial-header">
          <h1 className="page-title">Territorial</h1>
        </div>

        <TerritorialStats />

        <div className="tabs">
          <button className="tab active">Zonas</button>
          <button className="tab">Fincas</button>
        </div>

        <ZonasTable />

      </div>
    </DashboardLayout>
  );
}
