import React from 'react';

const ProgressBar = ({
  className,
  style,
  value,
}) => {
    return (
        <div
          className={`progress-bar ${className || ''}`}
          style={style}
        >
          <div className="progress-bar-inner" style={{
            transform: `scaleX(${value})`,
          }} />
        </div>
    );
};
export default ProgressBar;