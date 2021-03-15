import React from "react";
import Link from "next/link";
import styles from "../styles/CardRowHeader.module.css";

import FaceIcon from "@material-ui/icons/Face";
import LandscapeIcon from "@material-ui/icons/Landscape";
import PaletteIcon from "@material-ui/icons/Palette";
import ToysIcon from "@material-ui/icons/Toys";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const CardRowHeader = ({ name }) => {
    let Icon;
    if (name === "Avatars") {
        Icon = <FaceIcon className={styles.icon} />;
    } else if (name === "Land") {
        Icon = <LandscapeIcon className={styles.icon} />;
    } else if (name === "Digital Art") {
        Icon = <PaletteIcon className={styles.icon} />;
    } else if (name === "3D Models") {
        Icon = <ToysIcon className={styles.icon} />;
    }

    return (
        <div className={styles.cardRowHeaderContainer}>
            <div>
                {Icon}
                <div className={styles.title}>{name}</div>
            </div>
            <div>
                <Link href={"/assets"}>
                    <a className={styles.viewAll}>
                        <div className={styles.title}>View all</div>
                        <ChevronRightIcon className={styles.icon} />
                    </a>
                </Link>
            </div>
        </div>
    );
};

export default CardRowHeader;
