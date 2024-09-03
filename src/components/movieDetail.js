import React, { useState, useEffect } from 'react';
import Overdrive from 'react-overdrive';
import { Link, useLocation } from 'react-router-dom';
import formatDate from './formatDate';

const BACKDROP_PATH = 'http://image.tmdb.org/t/p/w1280';
const POSTER_PATH = 'http://image.tmdb.org/t/p/w342';
const IMAGE_PATH = 'http://image.tmdb.org/t/p/w200';
const PROFILE_PATH = 'http://image.tmdb.org/t/p/w185';
const API_KEY = 'a62fd138fc3adf6aa51790c63f1f498e';

const MovieDetail = ({ match }) => {
  const location = useLocation();
  const { query = '', page = 1 } = location.state || {}; // Use defaults if state is undefined

  const [movie, setMovie] = useState({});
  const [images, setImages] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState([]); 
  const [similarMovies, setSimilarMovies] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [streamingProviders, setStreamingProviders] = useState([]);


  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}?api_key=${API_KEY}&language=en-US`);
        const movie = await res.json();
        setMovie(movie);
      } catch (e) {
        console.log(e);
      }
    };

    const fetchImages = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}/images?api_key=${API_KEY}`);
        const data = await res.json();
        setImages(data.backdrops.slice(0, 8));
      } catch (e) {
        console.log(e);
      }
    };

    const fetchCredits = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}/credits?api_key=${API_KEY}`);
        const data = await res.json();
        const director = data.crew.find(person => person.job === 'Director');
        setDirector(director ? director.name : 'N/A');

        // Filter and set cast members with profile images
        const castWithImages = data.cast.filter(member => member.profile_path);
        setCast(castWithImages.slice(0, 5));
      } catch (e) {
        console.log(e);
      }
    };

    const fetchVideos = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}/videos?api_key=${API_KEY}`);
        const data = await res.json();
        const trailerVideo = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        setTrailerKey(trailerVideo ? trailerVideo.key : null);
      } catch (e) {
        console.log(e);
      }
    };

    const fetchSimilarMovies = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}/similar?api_key=${API_KEY}&language=en-US`);
        const data = await res.json();
        const filteredMovies = data.results.filter(movie => movie.backdrop_path);
        setSimilarMovies(filteredMovies.slice(0, 3));
      } catch (e) {
        console.log(e);
      }
    };

    const fetchStreamingProviders = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${match.params.id}/watch/providers?api_key=${API_KEY}`);
        const data = await res.json();
        if (data.results.US && data.results.US.flatrate) {
          setStreamingProviders(data.results.US.flatrate);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchMovie();
    fetchImages();
    fetchCredits();
    fetchVideos();
    fetchSimilarMovies();
    fetchStreamingProviders();
  }, [match.params.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movie.id]);

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this movie: ${movie.title}`;
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text,
        url,
      }).catch(console.error);
    } else {
      alert("Your browser doesn't support the Web Share API.");
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this movie: ${movie.title}`)}`;
    window.open(url, '_blank');
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const showPreviousImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const showNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prevIndex => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  const currentImage = images[selectedImageIndex];

  return (
    <>
      <div className="movie-wrapper" style={{ backgroundImage: `url(${BACKDROP_PATH}${movie.backdrop_path})` }}>
      </div>
      <div className='container relative'>
        <h1 className='movie-title text-center'>
          {movie.title}
        </h1>
        <em className='block text-center'>{movie.tagline}</em>
        <div className="movie-info">
          <Overdrive id={movie.id}>
            <img
              className="poster"
              src={`${POSTER_PATH}${movie.poster_path}`}
              alt={movie.title}
            />
          </Overdrive>
          <div className='detailed-movie'>
            <h3>Release Date:</h3>
            <p>{movie.release_date ? formatDate(movie.release_date) : 'N/A'}</p>
            <h3>Director:</h3>
            <p>{director}</p>
            <h3>Summary:</h3>
            <p>{movie.overview}</p>
            <h3>Vote Average:</h3>
            <p>{movie.vote_average}/10 with {movie.vote_count} votes</p>
            <h3>Genres:</h3>
            <p>
              {movie.genres && movie.genres.length > 0
                ? movie.genres.map(genre => genre.name).join(', ')
                : 'No genres available'}
            </p>
              {streamingProviders.length > 0 ? (
                <>
                  <h3>Watch on:</h3>
                  <div className="gap streaming-providers">
                    {streamingProviders.map((provider, index) => (
                      <div className="stream-contain" key={index}>
                        <a className="movie-card stream-card" href={`https://www.${provider.provider_name.toLowerCase().replace(' ', '')}.com`} target="_blank" rel="noopener noreferrer">
                          <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="provider-logo"
                            />
                          {provider.provider_name}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3>Watch on:</h3>
                  <p>Not currently streaming.</p>
                </>
              )}
            {trailerKey && (
              <button onClick={() => setIsTrailerModalOpen(true)} className="button trailer-button">Watch Trailer</button>
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <div className="cast-section similar-movies">
            <h2 className='text-center'>Cast:</h2>
            <div className="image-grid gap flex flex-wrap justify-content-center">
              {cast.map((member, index) => (
                <div key={index} className="cast-member">
                  <div className='cast-contain'>
                    <img
                      src={`${PROFILE_PATH}${member.profile_path}`}
                      alt={member.name}
                      className="cast-image"
                    />
                  </div>
                  <p className="cast-name">{member.name}</p>
                  <p className="cast-character">{member.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className='similar-movies'>
            <h2 className='text-center'>Images from {movie.title}:</h2>
            <div className="image-grid gap flex flex-wrap justify-content-center">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={`${IMAGE_PATH}${image.file_path}`}
                  alt={`Backdrop ${index + 1}`}
                  onClick={() => openImageModal(index)}
                />
              ))}
            </div>
          </div>
        )}
        {isImageModalOpen && selectedImageIndex !== null && (
          <div className="image-modal" onClick={closeImageModal}>
            <button className="prev-button" onClick={showPreviousImage}>&lt;</button>
            <img
              src={`${IMAGE_PATH}${currentImage.file_path}`}
              alt={`Backdrop ${selectedImageIndex + 1}`}
              onClick={e => e.stopPropagation()} 
            />
            <button className="next-button" onClick={showNextImage}>&gt;</button>
          </div>
        )}

        {similarMovies.length > 0 && (
          <div className="similar-movies">
            <h2 className='text-center'>Similar Movies:</h2>
            <div className="justify-content-center flex flex-wrap">
              {similarMovies.map(movie => (
                <div key={movie.id} className="single-card">
                  <Link to={`/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="movie-card">
                      <div className="movie-details">
                        <img
                          className="card-img"
                          src={`${BACKDROP_PATH}${movie.backdrop_path}`}
                          alt={movie.title}
                        />
                        <h2 className="title">{movie.title}</h2>
                        <p className="description">
                          {movie.overview.length > 100 ? movie.overview.substring(0, 100) + '...' : movie.overview}
                        </p>
                        <p className='read-more'>Read More</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <div className="share-buttons">
          <button onClick={handleShare}>Share</button>
          <button onClick={shareOnTwitter}>Share on Twitter</button>
        </div> */}

        {isTrailerModalOpen && trailerKey && (
          <div className="trailer-modal">
            <div className="trailer-container">
              <button onClick={() => setIsTrailerModalOpen(false)} className="trailer-close">&times;</button>
              <iframe
                title="movie-trailer"
                width="100%"
                height="400px"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
        <div className='back-parent flex justify-content-center'>
          <Link to={`/?query=${query}&page=${page}`}  className="button">Back to Movies</Link>
        </div>
      </div>
    </>
  );
};

export default MovieDetail;
