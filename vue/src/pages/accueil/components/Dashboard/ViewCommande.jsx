import React from "react";
import { useMenusGroupedByRestaurant } from "../../../../services/Panier";

export default function ViewCommande({ menuIds, onBack }) {
    const { groupedMenus, loading } = useMenusGroupedByRestaurant(menuIds);

    if (loading) {
        return <p className="text-center text-white">Chargement...</p>;
    }

    return (
        <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <h4 className="text-white mb-4">📋 Vue de la Commande</h4>

                    {groupedMenus.map((group) => (
                        <div key={group.restaurant.id} className="card mb-4 shadow-sm">
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
                                                <h6 className="mb-1 text-white">{menu.nom_menu}</h6>
                                                <p className="mb-0 text-muted">{menu.description_menu}</p>
                                                <p className="mb-0 text-white">{menu.prix_menu} €</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
