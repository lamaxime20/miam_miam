import { useState } from "react";
import { Trophy, Star, TrendingUp, Award, Crown, Medal } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const topClientsData = [
  { rank: 1, name: "Sophie Diallo", email: "sophie.diallo@email.com", totalOrders: 156, totalSpent: 234500, loyaltyPoints: 23450, level: "Diamond", joinDate: "2023-01-15" },
  { rank: 2, name: "Amadou Ndiaye", email: "amadou.ndiaye@email.com", totalOrders: 142, totalSpent: 213000, loyaltyPoints: 21300, level: "Platinum", joinDate: "2023-02-20" },
  { rank: 3, name: "Fatou Sall", email: "fatou.sall@email.com", totalOrders: 128, totalSpent: 192000, loyaltyPoints: 19200, level: "Platinum", joinDate: "2023-03-10" },
  { rank: 4, name: "Moussa Cissé", email: "moussa.cisse@email.com", totalOrders: 115, totalSpent: 172500, loyaltyPoints: 17250, level: "Gold", joinDate: "2023-01-25" },
  { rank: 5, name: "Aïcha Ba", email: "aicha.ba@email.com", totalOrders: 98, totalSpent: 147000, loyaltyPoints: 14700, level: "Gold", joinDate: "2023-04-05" },
  { rank: 6, name: "Léa Martin", email: "lea.martin@email.com", totalOrders: 87, totalSpent: 130500, loyaltyPoints: 13050, level: "Gold", joinDate: "2023-05-12" },
  { rank: 7, name: "Kenji Takahashi", email: "kenji.takahashi@email.com", totalOrders: 76, totalSpent: 114000, loyaltyPoints: 11400, level: "Silver", joinDate: "2023-06-18" },
  { rank: 8, name: "Maria Gonzalez", email: "maria.gonzalez@email.com", totalOrders: 65, totalSpent: 97500, loyaltyPoints: 9750, level: "Silver", joinDate: "2023-07-22" },
  { rank: 9, name: "John Smith", email: "john.smith@email.com", totalOrders: 54, totalSpent: 81000, loyaltyPoints: 8100, level: "Silver", joinDate: "2023-08-30" },
  { rank: 10, name: "Cheikh Thiam", email: "cheikh.thiam@email.com", totalOrders: 48, totalSpent: 72000, loyaltyPoints: 7200, level: "Bronze", joinDate: "2023-09-14" },
];

export default function TopClients() {
  const [period, setPeriod] = useState("all");

  const totalRevenue = topClientsData.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrders = topClientsData.reduce((acc, c) => acc + c.totalOrders, 0);
  const avgOrder = Math.round(totalRevenue / totalOrders);

  const top3 = topClientsData.slice(0, 3);

  const levelColors = {
    Diamond: "text-white bg-[#cfbd97] border border-[#cfbd97]",
    Platinum: "text-white bg-[#cfbd97] border border-[#cfbd97]",
    Gold: "text-white bg-[#cfbd97] border border-[#cfbd97]",
    Silver: "text-white bg-[#cfbd97] border border-[#cfbd97]",
    Bronze: "text-white bg-[#cfbd97] border border-[#cfbd97]",
  };

  return (
    <div className="container py-4" style={{ backgroundColor: "#ffffff", color: "#000000", minHeight: "100vh" }}>
      <h2 className="fw-bold mb-4 text-center" style={{ color: "#cfbd97" }}>🏆 Top 10 Clients</h2>

      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group">
          <button className={`btn ${period === "Week" ? "btn-outline-dark" : "btn-light"}`} onClick={() => setPeriod("week")}>
            Cette semaine
          </button>
          <button className={`btn ${period === "month" ? "btn-outline-dark" : "btn-light"}`} onClick={() => setPeriod("month")}>
            Ce mois
          </button>
          <button className={`btn ${period === "all" ? "btn-outline-dark" : "btn-light"}`} onClick={() => setPeriod("all")}>
            Tout
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center p-3 shadow-sm">
            <Trophy size={24} className="mb-2" style={{ color: "#cfbd97" }} />
            <h6>Total Clients</h6>
            <h5 className="fw-bold">{topClientsData.length}</h5>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 shadow-sm">
            <TrendingUp size={24} className="mb-2" style={{ color: "#cfbd97" }} />
            <h6>Chiffre d’affaires</h6>
            <h5 className="fw-bold">{totalRevenue.toLocaleString()} FCFA</h5>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 shadow-sm">
            <Award size={24} className="mb-2" style={{ color: "#cfbd97" }} />
            <h6>Commandes</h6>
            <h5 className="fw-bold">{totalOrders}</h5>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 shadow-sm">
            <Star size={24} className="mb-2" style={{ color: "#cfbd97" }} />
            <h6>Panier moyen</h6>
            <h5 className="fw-bold">{avgOrder.toLocaleString()} FCFA</h5>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mb-4">
        {top3.map((client) => (
          <div key={client.rank} className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center p-3 h-100 shadow-sm border" style={{ borderColor: "#cfbd97" }}>
              {client.rank === 1 ? (
                <Crown size={30} className="mb-2" style={{ color: "#cfbd97" }} />
              ) : client.rank === 2 ? (
                <Medal size={30} className="mb-2" style={{ color: "#cfbd97" }} />
              ) : (
                <Trophy size={30} className="mb-2" style={{ color: "#cfbd97" }} />
              )}
              <h5 className="fw-bold">{client.name}</h5>
              <p className="mb-1">{client.level}</p>
              <p className="mb-1">{client.totalSpent.toLocaleString()} FCFA</p>
              <span className="badge" style={{ backgroundColor: "#cfbd97", color: "#fff" }}>{client.loyaltyPoints} pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm">
        <div className="card-header fw-bold" style={{ backgroundColor: "#cfbd97", color: "#6c6565ff" }}>Classement complet</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Client</th>
                <th>Niveau</th>
                <th className="text-end">Commandes</th>
                <th className="text-end">Dépenses</th>
                <th className="text-end">Points</th>
                <th>Date d’inscription</th>
              </tr>
            </thead>
            <tbody>
              {topClientsData.map((client) => (
                <tr key={client.rank}>
                  <td>#{client.rank}</td>
                  <td>
                    <div className="fw-bold">{client.name}</div>
                    <small className="text-muted">{client.email}</small>
                  </td>
                  <td>
                    <span className={`badge ${levelColors[client.level]}`}>{client.level}</span>
                  </td>
                  <td className="text-end">{client.totalOrders}</td>
                  <td className="text-end">{client.totalSpent.toLocaleString()} FCFA</td>
                  <td className="text-end">{client.loyaltyPoints}</td>
                  <td>{new Date(client.joinDate).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
