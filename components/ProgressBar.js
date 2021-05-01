import {useState} from 'react';
import {schedulePerFrame} from "../webaverse/util";

const ProgressBar = ({
  className,
  style,
  value: initialValue,
}) => {
  const [localValue, setValue] = useState(initialValue);
  const value = typeof initialValue === 'number' ? initialValue : localValue;
  
  // console.log('load initial value', initialValue);

  const _updateMintProgress = () => {
    let frame = null;
    let startTime = 0;
    const _scheduleFrame = () => {
      frame = requestAnimationFrame(_recurse);
    };
    const _recurse = () => {
      _scheduleFrame();
      // if (mintMenuStep === 3) {
        /* const _makeValue = () => {
          const now = Date.now();
          const f = 1 + Math.sin((now - startTime)/1000 * Math.PI) / 2;
          return (-1 + Math.random() * 2) * 10 * f;
        };
        setJitter([
          _makeValue(),
          _makeValue(),
        ]); */
        setValue(Date.now() % 1000 / 1000);
      // }
    };
    schedulePerFrame(() => {
      startTime = Date.now();
      _scheduleFrame();
    }, () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    });
  };
  _updateMintProgress();
  
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