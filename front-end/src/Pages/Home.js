import React, { useState } from "react";
import LastBookingDetails from "../Components/LastBookingDetails";
import SelectMovie from "../Components/SelectMovie";
import SelectSeats from "../Components/SelectSeats";
import TimeShedule from "../Components/TimeShedule";
import Modal from "../Components/ModalComponent";
import Hero from "../Components/Hero/Hero";
import MovieCard from "../Components/MovieCard/MovieCard";
import "../Css/Home.css";
import BsContext from "../Context/BsContext";
import { useContext } from "react";
import {
  moviesData,
  comingSoonMovies,
  events,
  offers,
  quickFilters,
} from "../constants";

const Home = () => {
  const context = useContext(BsContext);
  const {
    movie,
    time,
    noOfSeat,
    handlePostBooking,
    setErrorPopup,
    setErrorMessage,
  } = context;

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeEventTab, setActiveEventTab] = useState("All");
  const [notifiedMovies, setNotifiedMovies] = useState([]);

  // Countdown calculator
  const getCountdown = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target - now;
    if (diff <= 0) return "Released";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days to go`;
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Toggle notify
  const toggleNotify = (movieId) => {
    setNotifiedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Copy offer code
  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  // Validation functions
  const checkNegativeSeatsValidity = (seats) => {
    for (let seat in seats) {
      if (Number(seats[seat]) < 0) {
        return true;
      }
    }
    return false;
  };

  const checkZeroSeatsValidity = (seats) => {
    for (let seat in seats) {
      if (Number(seats[seat]) > 0) {
        return false;
      }
    }
    return true;
  };

  const handleBookNow = () => {
    if (!movie) {
      setErrorPopup(true);
      setErrorMessage("Please select  a movie!");
    } else if (!time) {
      setErrorPopup(true);
      setErrorMessage("Please select a time slot!");
    } else if (
      checkNegativeSeatsValidity(noOfSeat) ||
      checkZeroSeatsValidity(noOfSeat)
    ) {
      setErrorPopup(true);
      setErrorMessage("Invalid Seats!");
    } else {
      handlePostBooking();
    }
  };

  const eventTabs = ["All", "Music", "Comedy", "Sports", "Plays"];
  const filteredEvents =
    activeEventTab === "All"
      ? events
      : events.filter((e) => e.category === activeEventTab);

  return (
    <>
      <Modal />

      {/* Hero Carousel */}
      <Hero />

      {/* Quick Filters */}
      <section className="container-app">
        <div className="quick-filters" role="tablist" aria-label="Movie filters">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              className={`quick-filter ${activeFilter === filter ? "quick-filter--active" : ""}`}
              onClick={() => setActiveFilter(filter)}
              role="tab"
              aria-selected={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Now Showing Movies */}
      <section className="section container-app" id="movies" aria-label="Now Showing Movies">
        <div className="section-header">
          <h2 className="section-title">Now Showing</h2>
          <a href="#movies" className="section-link">
            See All →
          </a>
        </div>
        <div className="movies-grid">
          {moviesData.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="section container-app" aria-label="Coming Soon Movies">
        <div className="section-header">
          <h2 className="section-title">Coming Soon</h2>
          <a href="#coming-soon" className="section-link">
            See All →
          </a>
        </div>
        <div className="coming-soon-scroll">
          {comingSoonMovies.map((m) => (
            <article key={m.id} className="coming-soon-card">
              <div className="coming-soon-card__poster">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="coming-soon-card__img"
                  loading="lazy"
                />
              </div>
              <div className="coming-soon-card__info">
                <h3 className="coming-soon-card__title">{m.title}</h3>
                <p className="coming-soon-card__genre">
                  {m.genre.join(" · ")}
                </p>
                <p className="coming-soon-card__countdown">
                  ⏱ {getCountdown(m.releaseDate)}
                </p>
                <div className="coming-soon-card__footer">
                  <span className="coming-soon-card__interest">
                    {formatNumber(m.interested)} interested
                  </span>
                  <button
                    className={`coming-soon-card__notify ${notifiedMovies.includes(m.id) ? "coming-soon-card__notify--active" : ""}`}
                    onClick={() => toggleNotify(m.id)}
                    aria-label={
                      notifiedMovies.includes(m.id)
                        ? `Remove notification for ${m.title}`
                        : `Notify me about ${m.title}`
                    }
                  >
                    🔔 {notifiedMovies.includes(m.id) ? "Notified" : "Notify"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="section container-app" id="events" aria-label="Events">
        <div className="section-header">
          <h2 className="section-title">Events & Experiences</h2>
        </div>
        <div className="events-tabs" role="tablist" aria-label="Event categories">
          {eventTabs.map((tab) => (
            <button
              key={tab}
              className={`events-tab ${activeEventTab === tab ? "events-tab--active" : ""}`}
              onClick={() => setActiveEventTab(tab)}
              role="tab"
              aria-selected={activeEventTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <article key={event.id} className="event-card">
              <div className="event-card__poster">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="event-card__img"
                  loading="lazy"
                />
              </div>
              <div className="event-card__info">
                <span className="event-card__category">{event.category}</span>
                <h3 className="event-card__title">{event.title}</h3>
                <p className="event-card__venue">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.venue}
                </p>
                <p className="event-card__date">
                  {event.date} · {event.time}
                </p>
                <p className="event-card__price">{event.priceRange}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="section container-app" aria-label="Offers and Deals">
        <div className="section-header">
          <h2 className="section-title">Offers & Deals</h2>
        </div>
        <div className="offers-scroll">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <p className="offer-card__bank">{offer.bank}</p>
              <p className="offer-card__headline">{offer.headline}</p>
              <div className="offer-card__footer">
                <button
                  className="offer-card__code"
                  onClick={() => copyCode(offer.code)}
                  aria-label={`Copy code ${offer.code}`}
                >
                  {offer.code}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <span className="offer-card__terms">T&C Apply</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Section (original functionality) */}
      <section className="section" id="book" aria-label="Book Tickets">
        <div className="container">
          <div className="section-header" style={{ marginBottom: "var(--spacing-xl)" }}>
            <h2 className="section-title">Book Your Tickets</h2>
          </div>
          <div className="selection_container">
            <div className="wrapper">
              <div className="select_movie_component">
                <SelectMovie />
              </div>
              <div className="last_booking_details_container">
                <LastBookingDetails />
              </div>
            </div>
            <div className="time_seats_container">
              <TimeShedule />
              <SelectSeats />
              <button
                onClick={() => {
                  handleBookNow();
                }}
                className="BN-btn"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;