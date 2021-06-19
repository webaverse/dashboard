import React from "react";
import Link from "next/link";
import Clip from './Clip';

const ProfileCards = ({profiles}) => {  
  return (
    <div className="accounts">
      {profiles.map((item, i) => {
        const homeSpaceImage = item.homeSpacePreview || "./defaulthomespace.svg";

        const url = "/accounts/" + item.address;
        const name = item.name ? item.name : "Anonymous";
        
        const src = item.avatarPreview
          .replace(
            /\/[^\/]*\.([^\/]*)$/,
            '/preview.webm'
          );

        return (
          <Link href={url} key={i}>
            <a className="account">
              <Clip
                src={src}
                className="profileVideo"
                autoPlay={true}
                loop={true}
                muted={true}
              />
              <div className="profileName">{name}</div>
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileCards;
