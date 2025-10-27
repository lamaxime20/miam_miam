import './Dashboard.css';

function StatCard({ icon, title, value }) {
  return (
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            {icon}
            <div>
              <h6 className="text-muted mb-0">{title}</h6>
              <h3 className="mb-0">{value}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;