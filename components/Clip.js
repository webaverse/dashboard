import {useState} from 'react';

const Clip = props => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(!props.src);

  return (!errored ?
    <video
      {...props}
      onLoad={e => {
        setLoaded(true);
      }}
      onError={e => {
        console.log('clip load error', props.src, e);
        setLoaded(true);
        setErrored(true);
      }}
    >
      <source src={props.src} />
    </video>
  :
    <div className="profileVideoPlaceholder">
      {props.src ?
        <img className="icon" src="/error.svg" />
      :
        <img className="icon" src="/avatar.svg" />
      }
    </div>
  );
};
export default Clip;