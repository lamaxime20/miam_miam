import { useEffect, useState } from "react";
import { getImageBase64 } from "../../../../services/Menu";
import "./MenuSection.css";

function MenuSection({ item }) {
    const [imageSrc, setImageSrc] = useState("/placeholder.svg");
    const [nomresto, setNomresto] = useState("Mon Miam Miam Space");

    useEffect(() => {
        if (item.image) {
            getImageBase64(item.image).then(setImageSrc);
        }
    }, [item.image]);

    useEffect(() => {
        if (item.nomresto) {
            setNomresto(item.nomresto);
        }
    }, [item.nomresto]);


    return (
        <div key={item.id} className="col-12 col-md-6 col-lg-3">
            <div className="menu-card">
                <div className="menu-image-container">
                    <img src={imageSrc} alt={item.name} className="menu-image" />
                    <div className="menu-icons"></div>
                </div>
                <h3 className="menu-item-name">{item.name}</h3>
                <p className="menu-item-description">{nomresto}</p>
                <div className="menu-rating">
                    {[...Array(Math.floor(item.rating))].map((_, i) => (
                        <span key={i} className="star">★</span>
                    ))}
                </div>
                <p className="menu-item-description">{item.description}</p>
                <p className="menu-item-price">{item.price}</p>
                <button className="order-button">Commander</button>
            </div>
        </div>
    );
}

export default MenuSection;