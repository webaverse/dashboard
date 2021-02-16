import { ArrowDropDownCircleOutlined } from '@material-ui/icons';
import Link from 'next/link';

const drops = [
  {
    id: 1,
    name: "Lightsaber",
    hidden: false
  },
  {
    id: 2,
    name: "Gumball",
    hidden: false
  },
  {
    id: 3,
    name: "Yehaw",
  },
  {
    id: 4,
    name: "asdfasdfasdf",
  },
  {
    id: 5,
    name: "cvbzvxcbxcvbxc",
  },
  {
    id: 6,
    name: "qweqweqweqwe"
  },
  {
    id: 7,
    name: "asdfasdfasdf"
  },
  {
    id: 8,
    name: "cvbzvxcbxcvbxc"
  },
  {
    id: 9,
    name: "qweqweqweqwe"
  },
];

const DropCard = ({ isHidden = true }) => {
  return (
    <div className={`drop-card ${isHidden ? "foggy" : ""}`}>

    </div> 
  );
};

const DropList = ({ dropList = [] }) => {
  return (
    <div className="drop-list-container"> 
      {drops.map((drop, index) => {
        return <DropCard key={index} isHidden={drop.hidden} title={drop.name} />
      })}
    </div>
  );
};

export default function Drop() {
  return (
    <div className="drop-container">
      <img src="/lightsaber-card.jpg" className="lightsaber-card" />
      <div className="drop-info">
        <h1 className="drop-header">The first drop of the internet MMO</h1>
        <div>
          <h1>Avaer x Shaw</h1>
          <h1>Cybersaber</h1>
          <button className="moreinfo-btn">More Info</button>
        </div>
      </div>
      <div className="season-container">
        <h1 className="season-header">Season 1</h1>
        <DropList dropList={drops} />
      </div>
      <div className="season-container">
        <h1 className="season-header">Season 2</h1>
        <DropList dropList={drops} />
      </div>
    </div>
  );
};