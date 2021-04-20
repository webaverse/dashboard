import React from "react";

const ProgressBar = ({ percentage, progress, loadingMessage }) => {
    return (
        <div className={`progress-button ${progress}`}>
            <span className="loading-text">{loadingMessage}</span>
            <button className="download-button">
                <span className="button-text">
                    {progress === "finished" ? "🎉 Done" : ""}
                </span>
            </button>
            <span className="percentage">{percentage}%</span>
        </div>
    );
};
export default ProgressBar;