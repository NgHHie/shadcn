// src/components/Footer.js
import React from 'react';
import './style.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 Học SQL. All rights reserved.</p>
        <ul className="social-links">
          <li><a href="#facebook">Facebook</a></li>
          <li><a href="#twitter">Twitter</a></li>
          <li><a href="#linkedin">LinkedIn</a></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
