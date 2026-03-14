import React from "react";
import "./Skeleton.css";

export const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card__poster skeleton-shimmer" />
    <div className="skeleton-card__info">
      <div className="skeleton-card__line skeleton-shimmer" style={{ width: "40%" }} />
      <div className="skeleton-card__line skeleton-card__line--lg skeleton-shimmer" style={{ width: "80%" }} />
      <div className="skeleton-card__line skeleton-shimmer" style={{ width: "60%" }} />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 5 }) => (
  <div className="movies-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
