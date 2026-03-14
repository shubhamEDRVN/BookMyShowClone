import React from "react";
import "./MovieCard.css";

const MovieCard = ({ movie, index }) => {
  return (
    <article
      className={`movie-card animate-fade-in-up stagger-${(index % 10) + 1}`}
      style={{ opacity: 0 }}
    >
      <div className="movie-card__poster">
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-card__img"
          loading="lazy"
        />
        <div className="movie-card__overlay">
          <button className="btn btn-primary movie-card__cta">
            Book Tickets
          </button>
        </div>
        {movie.badge && (
          <span className={`movie-card__badge ${
            movie.badge.includes("🔥") ? "movie-card__badge--hot" :
            movie.badge === "New Release" ? "movie-card__badge--new" :
            "movie-card__badge--trend"
          }`}>
            {movie.badge}
          </span>
        )}
      </div>
      <div className="movie-card__info">
        <div className="movie-card__rating">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="movie-card__rating-value">{movie.rating}/5</span>
          <span className="movie-card__votes">{movie.votes}</span>
        </div>
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__tags">
          {movie.language.map((lang) => (
            <span key={lang} className="movie-card__tag">{lang}</span>
          ))}
          <span className="movie-card__tag">{movie.certification}</span>
        </div>
        <p className="movie-card__genre">{movie.genre.join(" · ")}</p>
      </div>
    </article>
  );
};

export default MovieCard;
