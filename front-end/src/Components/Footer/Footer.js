import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner container-app">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <a href="#top" className="footer__logo" aria-label="ShowTime Home">
              <span className="footer__logo-show">show</span>
              <span className="footer__logo-time">time</span>
            </a>
            <p className="footer__tagline">
              Your one-stop destination for movies, events, plays, and more.
              Book your entertainment experience today.
            </p>
            <div className="footer__social">
              <a href="#social" className="footer__social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#social" className="footer__social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#social" className="footer__social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#social" className="footer__social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="var(--color-bg)" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div className="footer__col">
            <h4 className="footer__col-title">Movies</h4>
            <ul className="footer__col-list">
              <li><a href="#now-showing">Now Showing</a></li>
              <li><a href="#coming-soon">Coming Soon</a></li>
              <li><a href="#top-rated">Top Rated</a></li>
              <li><a href="#genres">Browse by Genre</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Help</h4>
            <ul className="footer__col-list">
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#terms">Terms of Use</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <ul className="footer__col-list">
              <li><a href="#events">Events</a></li>
              <li><a href="#plays">Plays</a></li>
              <li><a href="#sports">Sports</a></li>
              <li><a href="#activities">Activities</a></li>
              <li><a href="#offers">Offers</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} ShowTime. All rights reserved. Made with ❤️ for movie lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
