import React from "react";

const ProgressBar = ({ value }) => {
    return (
        <div className={`progress-bar`}>
          <div className="progress-bar-inner" style={{
            transform: `scaleX(${value})`,
          }} />
        </div>
    );
};
export default ProgressBar;