import React from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const PanierCardMenu = ({ item, updateQuantity, removeItem }) => {
    return (
        <div key={item.id} className="card mb-3 shadow-sm">
            <div className="row g-3 align-items-center p-3">
                <div className="col-md-3">
                    <img src={item.image} alt={item.name} className="img-fluid rounded" />
                </div>
                <div className="col-md-5">
                    <h5>{item.name}</h5>
                    <p className="text-muted">{item.nomResto || item.nomresto}</p>
                    <p className="text-warning fw-bold">{item.price} FCFA</p>
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, -1)}>
                            <FaMinus />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, 1)}>
                            <FaPlus />
                        </button>
                    </div>
                </div>
                <div className="col-md-2 text-end">
                    <p className="fw-bold">{item.price * item.quantity} FCFA</p>
                </div>
                <div className="col-md-2 text-end">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item.id)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanierCardMenu;
