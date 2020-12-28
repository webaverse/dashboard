import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import logo from '../../assets/images/webaverse.png';
import preview from '../../assets/images/preview.png';
import { useAppContext } from "../../libs/contextLib";
import '../../assets/css/footer.css';

export default () =>
<div className="footer-container">
  <div className="footer">
{/*
    <div className="main-footer">
      <div className="links">
        <Link to="/browse">Browse</Link>
        <Link to="/creators">Creators</Link>
        <Link to="/mint">Mint</Link>
        <a href="https://docs.webaverse.com">Docs</a>
        <a href="https://blog.webaverse.com">Blog</a>
      </div>
    </div>
*/}
    <div className="secondary-footer">
      <div className="social-links">
        <a href="https://discord.gg/R5wqYhvv53">
          <i className="social-icon discord">
            <FontAwesomeIcon icon={faDiscord} />
          </i>
        </a>
        <a href="https://twitter.com/webaverse">
          <i className="social-icon twitter">
            <FontAwesomeIcon icon={faTwitter} />
          </i>
        </a>
        <a href="https://github.com/webaverse">
          <i className="social-icon github">
            <FontAwesomeIcon icon={faGithub} />
          </i>
        </a>
      </div>
      <div className="copyright">
        {"© 2020 Webaverse"}
      </div>
    </div>
  </div>
</div>
