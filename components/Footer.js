import React from "react";

const Footer = () => (
    <div className="footerContainer">
        <div className="footer">
            <div className="secondaryFooter">
                <div className="socialLinks">
                    <a href="https://discord.gg/R5wqYhvv53">
                        <i className={`socialIcon discord`}>
                            <img src="/discord.svg" alt="Discord icon" />
                        </i>
                    </a>
                    <a href="https://twitter.com/webaverse">
                        <i className={`socialIcon twitter`}>
                            <img src="/twitter.svg" alt="Twitter icon" />
                        </i>
                    </a>
                    <a href="https://github.com/webaverse">
                        <i className={`socialIcon github`}>
                            <img src="/github.svg" alt="GitHub icon" />
                        </i>
                    </a>
                </div>
                <div className="copyright">{"© 2021 Webaverse"}</div>
            </div>
        </div>
    </div>
);
export default Footer;
