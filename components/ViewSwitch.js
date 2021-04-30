const ViewSwitch = ({
  selectedView,
  setSelectedView,
}) => {
  return (
    <div className="navbarSwitchWrap">
      <div className="navbarSwitch">
        <div className={`option ${selectedView === 'cards' ? 'selected' : ''}`} onClick={e => {
          setSelectedView('cards');
        }}>
          Cards
        </div>
        <div className={`option ${selectedView === '2d' ? 'selected' : ''}`} onClick={e => {
          setSelectedView('2d');
        }}>
          2D
        </div>
        <div className={`option ${selectedView === '3d' ? 'selected' : ''}`} onClick={e => {
          setSelectedView('3d');
        }}>
          3D
        </div>
        {/* <div className={`option ${selectedView === 'live' ? 'selected' : ''}`} onClick={e => {
          setSelectedView('live');
        }}>
          Live
        </div> */}
      </div>
    </div>
  );
};
export default ViewSwitch;