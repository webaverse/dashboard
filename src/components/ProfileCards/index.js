import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { setAvatar, setHomespace, setLoadoutState } from "../../functions/AssetFunctions";
import defaulthomespace from "../../assets/images/defaulthomespace.svg";

import "./style.css";

export default ({ globalState, setGlobalState, profiles, loadout }) => {
  if (!profiles) { return null; }

  console.log("loadout", loadout);

  return profiles.map((item, i) => {
    console.log("item", item);
    let url, name;
    const image = item.image || item.avatarPreview.replace(/\.[^.]*$/, '.png');
    console.log("image", image);
  
    const homeSpaceImage = item.homeSpacePreview || defaulthomespace;

    if (!image) { return; } // blank card

    if (item.id) {
      url = "/assets/" + item.id;
      name = item.name;
    } else if (item.address) {
      url = "/profiles/" + item.address;
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

      const handleSuccess = () => {
        console.log("success");
      };

      const handleError = (err) => {
        console.error("error", err);
      };

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
          !equal && (
            <div key={i} className="popoutMenuOptions" onClick={async (e) => {
              e.preventDefault();
              const newState = await setAvatar(item.id, globalState, handleSuccess, handleError);
              setGlobalState(newState);
            }}>
              Set as avatar
            </div >
          )
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
          !equal && (
            <div key={i} className="popoutMenuOptions" onClick={async (e) => {
              e.preventDefault();
              const newState = await setHomespace(item.id, globalState, handleSuccess, handleError);
              setGlobalState(newState);
            }}>
              Set as homespace
            </div >
          )
        )
      }

      const AddToLayoutOptions = ({ item, loadout }) => [1,2,3,4,5,6,7,8].map((num, i) => {
        let equal = false;
        console.log("loadout:", loadout);
        console.log("item:", item);
        if (item && item.id && loadout && loadout[num-1]) {
          equal = item.id == loadout[num-1][0];
          console.log(equal);
        }

        return (
          !equal && (
            <div key={i} className="popoutMenuOptions" onClick={async (e) => {
              e.preventDefault();
              const newState = await setLoadoutState(item.id, num, globalState);
              setGlobalState(newState);
            }}>
             Add to loadout {num}
            </div>
          )
        )
      });

      return (
        <>
          <div ref={wrapperRef} onClick={(e) => { e.preventDefault(); setIsVisible(!isVisible); }} className="tripleDot"></div>
          { isVisible ?
            <div className="popoutMenu">
              <AvatarOption item={item} />
              <HomeSpaceOption item={item} />
              <AddToLayoutOptions loadout={loadout} item={item} />
            </div>
          : null }
        </>
      )
    }

    return (
      <div key={i} className="content" style={{
        backgroundImage: `url("${image}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}>
        <div className="contentBackground" style={{
          backgroundImage: `url("${homeSpaceImage}")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }} />
        <Link to={url}>
          <div className="content-inner">
            <h3 className="contentText">{name}</h3>
            { item.owner && globalState && item.owner.address.toLowerCase() === globalState.address ?
              <OwnerOptions />
            :
              null
            }
          </div>
        </Link>
      </div>
    )
  })
}
