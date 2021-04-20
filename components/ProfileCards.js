import React from "react";
import Link from "next/link";
import Clip from './Clip';

const ProfileCards = ({profiles}) => {
  return (
    <div className="accounts">
      {profiles.map((item, i) => {
        // console.log('check item', item);
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
                  src={`https://preview.exokit.org/[https://webaverse.github.io/assets/sacks3.vrm]/preview.webm`
                  }
                  className="profileVideo"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  ref={el => {
                    if (el) {
                      el.load();
                    }
                  }}
                />
              :
                <div
                  className="profileVideoPlaceholder"
                />
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
