import React from "react";
import { useMenusGroupedByRestaurant } from "../../../../services/Panier.js";

export default function ViewCommande({ onBack }) {
    const { groupedMenus, loading } = useMenusGroupedByRestaurant();

    if (loading) {
        return <p className="text-center text-white">Chargement...</p>;
    }

    /**
     * Calcule le total pour un groupe de menus d'un restaurant.
     * @param {Array<Object>} menus - La liste des menus pour un restaurant.
     */
    const calculateGroupTotal = (menus) => {
        return menus.reduce((total, menu) => total + (menu.prix_menu * menu.quantity), 0);
    }

    return (
        <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <h4 className="text-white mb-4">📋 Vue de la Commande</h4>

                    {groupedMenus.map((group) => (
                        <div key={group.restaurant.id} className="card mb-4 shadow-sm" style={{backgroundColor: "#1a1a1a", color: "white"}}>
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0">{group.restaurant.nom}</h5>
                                <small className="text-muted">{group.restaurant.localisation}</small>
                            </div>
                            <div className="card-body">
                                {group.menus.map((menu) => (
                                    <div key={menu.id_menu} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={menu.image_menu ? `data:image/jpg;base64,${menu.image_menu}` : "/placeholder.svg"}
                                                alt={menu.nom_menu}
                                                style={{ width: 80, height: 80, objectFit: "cover", marginRight: 16 }}
                                            />
                                            <div>
                                                <h6 className="mb-1">{menu.nom_menu} <span className="badge bg-warning text-dark ms-2">x{menu.quantity}</span></h6>
                                                <p className="mb-0 text-muted">{menu.description_menu}</p>
                                                <p className="mb-0 fw-bold" style={{color: "#cfbd97"}}>{menu.prix_menu} FCFA</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="card-footer bg-dark d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="text-white-50">Total pour ce restaurant : </span>
                                    <span className="fw-bold fs-5" style={{color: "#cfbd97"}}>
                                        {calculateGroupTotal(group.menus)} FCFA
                                    </span>
                                </div>
                                <button className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }}>Commander</button>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-secondary mt-3" onClick={onBack}>
                        ← Retour au panier
                    </button>
                </div>
            </div>
        </div>
    );
}
