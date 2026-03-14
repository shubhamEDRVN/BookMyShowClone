import React, { useState, useRef, useEffect } from "react";
import { useScrollPosition, useDebounce, useLocalStorage } from "../../hooks/useCustomHooks";
import { navLinks, cities, moviesData } from "../../constants";
import "./Navbar.css";

const Navbar = () => {
  const scrollY = useScrollPosition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useLocalStorage("city", "Mumbai");
  const [citySearch, setCitySearch] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);
  const cityRef = useRef(null);

  const isScrolled = scrollY > 20;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const searchResults = debouncedSearch
    ? moviesData.filter((m) =>
        m.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  return (
    <nav className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container-app">
        {/* Logo */}
        <a href="#top" className="navbar__logo" aria-label="ShowTime Home">
          <span className="navbar__logo-show">show</span>
          <span className="navbar__logo-time">time</span>
        </a>

        {/* City Selector */}
        <div className="navbar__city" ref={cityRef}>
          <button
            className="navbar__city-btn"
            onClick={() => setCityOpen(!cityOpen)}
            aria-expanded={cityOpen}
            aria-haspopup="listbox"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{selectedCity}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`navbar__chevron ${cityOpen ? "navbar__chevron--open" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {cityOpen && (
            <div className="navbar__city-dropdown animate-scale-in" role="listbox" aria-label="Select city">
              <input
                type="text"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="navbar__city-search"
                aria-label="Search city"
              />
              <ul className="navbar__city-list">
                {filteredCities.map((city) => (
                  <li key={city}>
                    <button
                      className={`navbar__city-option ${selectedCity === city ? "navbar__city-option--active" : ""}`}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityOpen(false);
                        setCitySearch("");
                      }}
                      role="option"
                      aria-selected={selectedCity === city}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="navbar__search" ref={searchRef}>
          <div className="navbar__search-box">
            <svg className="navbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search movies, events, plays..."
              className="navbar__search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Search movies, events, plays"
            />
            {searchQuery && (
              <button
                className="navbar__search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchOpen && debouncedSearch && (
            <div className="navbar__search-dropdown animate-scale-in">
              {searchResults.length > 0 ? (
                <ul className="navbar__search-results">
                  {searchResults.map((movie) => (
                    <li key={movie.id}>
                      <button className="navbar__search-result">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="navbar__search-thumb"
                          loading="lazy"
                        />
                        <div>
                          <span className="navbar__search-title">{movie.title}</span>
                          <span className="navbar__search-meta">
                            {movie.genre.join(", ")} · {movie.language[0]}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="navbar__search-empty">No results for "{debouncedSearch}"</p>
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Sign In */}
        <button className="btn btn-primary navbar__signin">Sign In</button>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="navbar__drawer animate-fade-in" role="dialog" aria-label="Navigation menu">
          <div className="navbar__drawer-content">
            <ul className="navbar__drawer-links">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="navbar__drawer-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg navbar__drawer-signin">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
