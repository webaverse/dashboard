import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { setAvatar, setHomespace, setLoadoutState } from "../../functions/AssetFunctions";

export default ({ inventory }) => {
  if (!inventory) { return null; }

  const { globalState, setGlobalState } = useAppContext();

  if (typeof inventory === 'object') {
    const inventoryKeys = Object.keys(inventory);

      console.log("globalState", globalState);
    return inventoryKeys.map((item, i) => {
      let url, name;
      const address = item;
      item = inventory[item];
      const image = item.image || item.avatarPreview;
  
      if (!image || !item.name) { return; } // blank card
      
      if (item.id) {
        url = "/browse/" + item.id;
        name = item.name.replace(/\.[^/\\.]+$/, "");
      } else if (item.address) {
        url = "/accounts/" + address;
        name = item.name ? item.name : "Anonymous";
      }

      const OwnerOptions = () => {
        const wrapperRef = useRef(null);
        const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
          document.addEventListener("click", handleClickOutside, false);
          return () => {
            document.removeEventListener("click", handleClickOutside, false);
          };
        }, []);

        const handleClickOutside = event => {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsVisible(false);
          }
        };

        const AvatarOption = ({ item }) => {
          let equal = false;
          if (item) {
            console.log("item.preview", item.image);
            console.log("globalState.avatarPreview", globalState.avatarPreview);
            equal = item.image === globalState.avatarPreview;
          }

          return (
            equal ?
              <div className="popoutMenuOptions" onClick={(e) => { e.preventDefault(); alert(`test avatar ${item.id}`) }}>
                Remove from avatar
              </div >
            :
              <div className="popoutMenuOptions" onClick={(e) => { e.preventDefault(); alert(`test avatar ${item.id}`) }}>
                Set as avatar
              </div >
          )
        }

        const HomeSpaceOption = ({ item }) => {
          let equal = false;
          if (item) {
            console.log("item.preview", item.image);
            console.log("globalState.homeSpacePreview", globalState.homeSpacePreview);
            equal = item.image === globalState.homeSpacePreview;
          }

          return (
            equal ?
              <div className="popoutMenuOptions" onClick={(e) => { e.preventDefault(); alert(`test avatar ${item.id}`) }}>
                Remove from homespace
              </div >
            :
              <div className="popoutMenuOptions" onClick={(e) => { e.preventDefault(); alert(`test avatar ${item.id}`) }}>
                Set as homespace
              </div >
          )
        }

        const AddToLayoutOptions = ({ item }) => [1,2,3,4,5,6,7,8].map((num, i) => {
          let equal = false;
          const parsedLoadout = JSON.parse(globalState.loadout);
          if (item && item.properties && parsedLoadout[num]) {
            equal = item.properties.hash === "0x" + parsedLoadout[num][1].replace(/\.[^/\\.]+$/, "");
          }

          return (
            equal ?
              <div key={i} className="popoutMenuOptions" onClick={async (e) => {
                e.preventDefault();
                const newState = await setLoadoutState(item.id, num, globalState);
                console.log("newState", newState);
                setGlobalState(newState);
              }}>
               Remove from loadout {num}
              </div>
            :
              <div key={i} className="popoutMenuOptions" onClick={async (e) => {
                e.preventDefault();
                const newState = await setLoadoutState(item.id, num, globalState);
                console.log("newState", newState);
                setGlobalState(newState);
              }}>
               Add to loadout {num}
              </div>
          )
        });

        return (
          <>
            <div ref={wrapperRef} onClick={(e) => { e.preventDefault(); setIsVisible(!isVisible); }} className="tripleDot"></div>
            { isVisible ?
              <div className="popoutMenu">
                <AvatarOption item={item} />
                <HomeSpaceOption item={item} />
                <AddToLayoutOptions item={item} />
              </div>
            : null }
          </>
        )
      }
  
      return (
        <Col key={i} className="content" sm={12} md={3} style={{
          backgroundImage: `url("${image}")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}>
          <Link to={url}>
            <div className="content-inner">
              <h3 className="contentText">{name}</h3>
              { item.owner && item.owner.address.toLowerCase() === globalState.address ?
                <OwnerOptions />
              :
                null
              }
            </div>
          </Link>
        </Col>
      )
    })
  } else {
    return inventory.map((item, i) => {
      let url, name;
      const image = item.image || item.avatarPreview;
  
      if (!image || !item.name) { return; } // blank card
      
      if (item.id) {
        url = "/browse/" + item.id;
        name = item.name.replace(/\.[^/\\.]+$/, "");
      } else if (item.address) {
        url = "/accounts/" + item.address;
        name = item.name ? item.name : "Anonymous";
      }
  
      return (
        <Col key={i} className="content" sm={12} md={4} style={{
          backgroundImage: `url("${image}")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}>
          <Link to={url}>
            <div className="content-inner">
              <h3 className="contentText">{name}</h3>
            </div>
          </Link>
        </Col>
      )
    })
  }
}
