export default function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="stat-card">

      <div className="stat-left">
        <div className="stat-icon">
          {Icon && <Icon size={20} />}
        </div>

        <div className="stat-info">
          <div className="stat-title">{title}</div>

          <div className="stat-number-row">
            <div className="stat-value">{value}</div>

            {change && (
              <div className="stat-change">
                {change}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
