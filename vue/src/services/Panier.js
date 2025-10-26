import { useEffect, useState } from "react";

export function useMenusGroupedByRestaurant(menuIds) {
    const [groupedMenus, setGroupedMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!menuIds || menuIds.length === 0) {
            setGroupedMenus([]);
            setLoading(false);
            return;
        }

        const fetchMenus = async () => {
            try {
                const results = await Promise.all(
                    menuIds.map(async (id_menu) => {
                        const res = await fetch(`http://localhost:8000/api/menu/${id_menu}/restaurant`);
                        const data = await res.json();
                        return data.success ? data.data : null;
                    })
                );

                // Filtrer les null et regrouper par restaurant
                const grouped = results
                    .filter(Boolean)
                    .reduce((acc, menu) => {
                        const key = menu.id_restaurant;
                        if (!acc[key]) {
                            acc[key] = {
                                restaurant: {
                                    id: menu.id_restaurant,
                                    nom: menu.nom_restaurant,
                                    localisation: menu.localisation
                                },
                                menus: []
                            };
                        }
                        acc[key].menus.push(menu);
                        return acc;
                    }, {});

                setGroupedMenus(Object.values(grouped));
            } catch (error) {
                console.error("Erreur fetch menus :", error);
                setGroupedMenus([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, [menuIds]);

    return { groupedMenus, loading };
}