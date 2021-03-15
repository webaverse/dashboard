import React from "react";
import styles from "../styles/Home.module.css";

export default ({ heroBg, title, subtitle, callToAction, ctaUrl }) => (
    <div className={styles.heroContainer}>
        <div
            className={styles.heroBg}
            style={{
                background: `url(${heroBg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
            }}
        />
        <div className={styles.hero}>
            <div className={styles.heroCopy}>
                <h1 className={styles.primary}>{title}</h1>
                <p className={styles.primary}>{subtitle}</p>
                <a href={ctaUrl} className={styles.button}>
                    {callToAction}
                </a>
            </div>
        </div>
    </div>
);
