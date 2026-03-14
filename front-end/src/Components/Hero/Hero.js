import React, { useState, useEffect, useCallback } from "react";
import { moviesData } from "../../constants";
import "./Hero.css";

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = moviesData;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const movie = slides[current];

  return (
    <section
      className="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured movies carousel"
    >
      {/* Background */}
      <div className="hero__bg">
        <img
          src={movie.backdrop}
          alt=""
          className="hero__bg-img"
          key={movie.id}
          loading="eager"
        />
        <div className="hero__bg-overlay" />
      </div>

      {/* Content */}
      <div className="hero__content container-app">
        <div className="hero__info" key={movie.id}>
          {movie.badge && (
            <span className="badge badge-primary hero__badge">{movie.badge}</span>
          )}
          <h1 className="hero__title">{movie.title}</h1>
          <div className="hero__meta">
            {movie.genre.map((g) => (
              <span key={g} className="badge badge-surface">
                {g}
              </span>
            ))}
            <span className="hero__rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-gold)">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {movie.rating}/5
              <span className="hero__votes">{movie.votes} votes</span>
            </span>
          </div>
          <p className="hero__meta-detail">
            {movie.runtime} · {movie.language.join(", ")} ·{" "}
            <span className="badge badge-surface">{movie.certification}</span>
          </p>
          <p className="hero__description">{movie.tagline}</p>
          <div className="hero__actions">
            <button className="btn btn-primary btn-lg hero__book-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Book Now
            </button>
            <button className="btn btn-ghost btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Trailer
            </button>
          </div>
        </div>

        {/* Poster Card */}
        <div className="hero__poster" key={`poster-${movie.id}`}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="hero__poster-img"
            loading="eager"
          />
        </div>
      </div>

      {/* Navigation */}
      <button className="hero__nav hero__nav--prev" onClick={prevSlide} aria-label="Previous slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="hero__nav hero__nav--next" onClick={nextSlide} aria-label="Next slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="hero__dots" role="tablist" aria-label="Slide indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero__dot ${i === current ? "hero__dot--active" : ""}`}
            onClick={() => setCurrent(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
