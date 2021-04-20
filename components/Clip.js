const Clip = props => {
  return (
    <video {...props} key={props.src}>
      <source src={props.src} />
    </video>
  );
};
export default Clip;