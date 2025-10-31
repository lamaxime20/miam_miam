import React from "react";

function ProgressionRestaurant({ NbreSteps = 4, StepActu = 1 }) {
    const steps = Array.from({ length: NbreSteps }, (_, i) => i + 1);
    const progress = ((Math.min(StepActu, NbreSteps) - 1) / (NbreSteps - 1)) * 100;

    return (
        <div className="progressionRestaurant">
            <div className="progressionRestaurant-track">
                <div
                    className="progressionRestaurant-bar"
                    style={{ width: `${isFinite(progress) ? progress : 0}%` }}
                />
            </div>
            <div className="progressionRestaurant-steps">
                {steps.map((s) => {
                    const status = s < StepActu ? "completed" : s === StepActu ? "active" : "pending";
                    return (
                        <div key={s} className={`progressionRestaurant-step ${status}`}>
                            <span className="progressionRestaurant-index">{s}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProgressionRestaurant;