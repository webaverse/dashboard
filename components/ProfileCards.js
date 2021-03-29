import React from "react";
import Link from "next/link";

const ProfileCards = ({ profiles }) => {
    return profiles.map((item, i) => {
        let url, name;
        const image =
            item.image || item.avatarPreview.replace(/\.[^.]*$/, ".png");

        const homeSpaceImage =
            item.homeSpacePreview || "./defaulthomespace.svg";

        if (!image) {
            return;
        } // blank card

        if (item.id) {
            url = "/assets/" + item.id;
            name = item.name;
        } else if (item.address) {
            url = "/accounts/" + item.address;
            name = item.name ? item.name : "Anonymous";
        }

        return (
            <div
                key={i}
                className="content"
                style={{
                    backgroundImage: `url("${image}")`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                }}
            >
                <div
                    className="contentBackground"
                    style={{
                        backgroundImage: `url("${homeSpaceImage}")`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                    }}
                />
                <Link href={url}>
                    <div className="content-inner">
                        <h3 className="contentText">{name}</h3>
                    </div>
                </Link>
            </div>
        );
    });
};

export default ProfileCards;
