import React from "react";
import Link from "next/link";
import Clip from './Clip';

const ProfileCards = ({profiles}) => {
  return (
    <div className="accounts">
      {profiles.map((item, i) => {
        const image = item.avatarPreview.replace(/\.[^.]*$/, '.png');

        // console.log('got image', image);

        const homeSpaceImage = item.homeSpacePreview || "./defaulthomespace.svg";

        /* if (!image) { // blank card
          return;
        } */

        const url = "/accounts/" + item.address;
        const name = item.name ? item.name : "Anonymous";

        return (
          <Link href={url} key={i}>
            <a className="account">
              {image ?
                <Clip
                  src={
                    image.replace(
                      /\.[^.]*$/,
                      '.webm'
                    )
                  }
                  className="profileVideo"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                />
              :
                <div className="clip-error">
                  <img className="icon" src="/error.svg" />
                </div>
              }
              <div className="profileName">{name}</div>
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileCards;
