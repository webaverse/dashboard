import {useState} from 'react';

const Clip = props => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  
  return (!errored ?
    <video
      {...props}
      onLoad={e => {
        setLoaded(true);
      }}
      onError={e => {
        setLoaded(true);
        setErrored(true);
      }}
    >
      <source src={props.src} />
    </video>
  :
    <div className="clip-error">
      <img className="icon" src="/error.svg" />
    </div>
  );
};
export default Clip;