/* Original data preserved for backward compatibility */
export const moviesList = [
  "Justice League",
  "Tenet",
  "Fast X",
  "Planet of the Apes",
  "Come Play",
];
export const slots = ["10:00 AM", "01:00 PM", "03:00 PM", "08:00 PM"];
export const seats = ["A1", "A2", "A3", "A4", "D1", "D2"];

/* ============================================
   EXPANDED DATA FOR REDESIGNED UI
   ============================================ */

export const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
];

export const genres = [
  "All",
  "Action",
  "Romance",
  "Thriller",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Animation",
];

export const languages = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];

export const formats = ["2D", "3D", "IMAX", "4DX"];

export const certifications = ["U", "U/A", "A"];

export const navLinks = [
  { label: "Movies", href: "#movies" },
  { label: "Events", href: "#events" },
  { label: "Plays", href: "#plays" },
  { label: "Sports", href: "#sports" },
  { label: "Activities", href: "#activities" },
];

export const quickFilters = [
  "All",
  "Now Showing",
  "Coming Soon",
  "Action",
  "Romance",
  "Thriller",
  "Comedy",
  "Hindi",
  "English",
  "Tamil",
];

export const moviesData = [
  {
    id: 1,
    title: "Justice League",
    genre: ["Action", "Sci-Fi"],
    rating: 4.2,
    votes: "12.4K",
    runtime: "2h 1m",
    language: ["English", "Hindi"],
    certification: "U/A",
    poster: "https://picsum.photos/seed/justice/400/600",
    backdrop: "https://picsum.photos/seed/justice-bg/1400/600",
    badge: "Trending",
    director: "Zack Snyder",
    cast: ["Ben Affleck", "Gal Gadot", "Jason Momoa", "Ezra Miller"],
    tagline: "You can't save the world alone.",
    description:
      "Fueled by his restored faith in humanity and inspired by Superman's selfless act, Bruce Wayne enlists newfound ally Diana Prince to face an even greater threat.",
    releaseDate: "2017-11-17",
    nowShowing: true,
  },
  {
    id: 2,
    title: "Tenet",
    genre: ["Action", "Thriller", "Sci-Fi"],
    rating: 4.5,
    votes: "18.2K",
    runtime: "2h 30m",
    language: ["English"],
    certification: "U/A",
    poster: "https://picsum.photos/seed/tenet/400/600",
    backdrop: "https://picsum.photos/seed/tenet-bg/1400/600",
    badge: "Selling Fast 🔥",
    director: "Christopher Nolan",
    cast: ["John David Washington", "Robert Pattinson", "Elizabeth Debicki"],
    tagline: "Time runs out.",
    description:
      "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.",
    releaseDate: "2020-08-26",
    nowShowing: true,
  },
  {
    id: 3,
    title: "Fast X",
    genre: ["Action", "Thriller"],
    rating: 3.8,
    votes: "9.1K",
    runtime: "2h 21m",
    language: ["English", "Hindi"],
    certification: "U/A",
    poster: "https://picsum.photos/seed/fastx/400/600",
    backdrop: "https://picsum.photos/seed/fastx-bg/1400/600",
    badge: "New Release",
    director: "Louis Leterrier",
    cast: ["Vin Diesel", "Michelle Rodriguez", "Jason Statham"],
    tagline: "The end of the road begins.",
    description:
      "Dom Toretto and his family are targeted by the vengeful son of drug kingpin Hernan Reyes.",
    releaseDate: "2023-05-19",
    nowShowing: true,
  },
  {
    id: 4,
    title: "Planet of the Apes",
    genre: ["Action", "Drama", "Sci-Fi"],
    rating: 4.0,
    votes: "7.3K",
    runtime: "2h 25m",
    language: ["English"],
    certification: "U/A",
    poster: "https://picsum.photos/seed/apes/400/600",
    backdrop: "https://picsum.photos/seed/apes-bg/1400/600",
    badge: null,
    director: "Wes Ball",
    cast: ["Owen Teague", "Freya Allan", "Kevin Durand"],
    tagline: "No one can stop the reign.",
    description:
      "Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything he's been taught about the past.",
    releaseDate: "2024-05-10",
    nowShowing: true,
  },
  {
    id: 5,
    title: "Come Play",
    genre: ["Horror", "Thriller"],
    rating: 3.5,
    votes: "4.8K",
    runtime: "1h 36m",
    language: ["English"],
    certification: "A",
    poster: "https://picsum.photos/seed/comeplay/400/600",
    backdrop: "https://picsum.photos/seed/comeplay-bg/1400/600",
    badge: null,
    director: "Jacob Chase",
    cast: ["Azhy Robertson", "Gillian Jacobs", "John Gallagher Jr."],
    tagline: "He's always watching.",
    description:
      "A lonely young boy feels different from everyone else. When a mysterious creature uses his phone and tablet to communicate, a terrifying game begins.",
    releaseDate: "2020-10-30",
    nowShowing: true,
  },
];

export const comingSoonMovies = [
  {
    id: 101,
    title: "Dune: Part Three",
    genre: ["Sci-Fi", "Drama"],
    poster: "https://picsum.photos/seed/dune3/400/600",
    releaseDate: "2026-11-20",
    interested: 45200,
    director: "Denis Villeneuve",
  },
  {
    id: 102,
    title: "Avatar 3",
    genre: ["Sci-Fi", "Action"],
    poster: "https://picsum.photos/seed/avatar3/400/600",
    releaseDate: "2026-12-19",
    interested: 62800,
    director: "James Cameron",
  },
  {
    id: 103,
    title: "The Batman 2",
    genre: ["Action", "Thriller"],
    poster: "https://picsum.photos/seed/batman2/400/600",
    releaseDate: "2026-10-03",
    interested: 38400,
    director: "Matt Reeves",
  },
  {
    id: 104,
    title: "Interstellar 2",
    genre: ["Sci-Fi", "Drama"],
    poster: "https://picsum.photos/seed/inter2/400/600",
    releaseDate: "2027-07-21",
    interested: 51000,
    director: "Christopher Nolan",
  },
];

export const events = [
  {
    id: 201,
    title: "Arijit Singh Live",
    category: "Music",
    venue: "MMRDA Grounds, Mumbai",
    date: "Apr 15, 2026",
    time: "7:00 PM",
    priceRange: "₹999 - ₹15,000",
    poster: "https://picsum.photos/seed/arijit/400/300",
  },
  {
    id: 202,
    title: "Comedy Night with Zakir Khan",
    category: "Comedy",
    venue: "Phoenix Mall, Bangalore",
    date: "Apr 20, 2026",
    time: "8:30 PM",
    priceRange: "₹499 - ₹2,999",
    poster: "https://picsum.photos/seed/zakir/400/300",
  },
  {
    id: 203,
    title: "IPL 2026 Finals",
    category: "Sports",
    venue: "Narendra Modi Stadium, Ahmedabad",
    date: "May 25, 2026",
    time: "7:30 PM",
    priceRange: "₹1,500 - ₹25,000",
    poster: "https://picsum.photos/seed/ipl/400/300",
  },
  {
    id: 204,
    title: "Hamlet - Theatre Play",
    category: "Plays",
    venue: "Prithvi Theatre, Mumbai",
    date: "Apr 10, 2026",
    time: "6:00 PM",
    priceRange: "₹300 - ₹1,200",
    poster: "https://picsum.photos/seed/hamlet/400/300",
  },
];

export const offers = [
  {
    id: 301,
    bank: "HDFC Bank",
    headline: "Get 15% off up to ₹200",
    code: "HDFCSHOW",
    expiresIn: "2026-03-31",
  },
  {
    id: 302,
    bank: "SBI Card",
    headline: "Buy 1 Get 1 Free on weekdays",
    code: "SBIBOGO",
    expiresIn: "2026-04-15",
  },
  {
    id: 303,
    bank: "ICICI Bank",
    headline: "Flat ₹150 off on 2+ tickets",
    code: "ICICI150",
    expiresIn: "2026-04-30",
  },
  {
    id: 304,
    bank: "Paytm Wallet",
    headline: "Get 20% cashback up to ₹100",
    code: "PAYTM20",
    expiresIn: "2026-03-25",
  },
];

export const seatCategories = [
  { id: "A1", label: "Royal - Row A", price: 350, type: "premium" },
  { id: "A2", label: "Royal - Row B", price: 350, type: "premium" },
  { id: "A3", label: "Executive - Row C", price: 250, type: "standard" },
  { id: "A4", label: "Executive - Row D", price: 250, type: "standard" },
  { id: "D1", label: "Classic - Row E", price: 150, type: "economy" },
  { id: "D2", label: "Classic - Row F", price: 150, type: "economy" },
];
