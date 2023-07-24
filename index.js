const baseURL = "http://www.omdbapi.com/?apikey=cb4af09e&";
let searching = "";
const movieIds = [];

const getCoverImage = async () => {
  try {
    const res = await fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=movie");
    const data = await res.json();
    if (!data.errors) {
      return data;
    } else {
      throw new Error(data.errors[0]);
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const setCoverImg = async () => {
  try {
    const defaultImgURL = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
    const coverImg = await getCoverImage();
    document.getElementById("cover-img").style.backgroundImage = `url(${coverImg?.urls?.regular || defaultImgURL})`;
  } catch (error) {
    console.error(error);
  }
};

await setCoverImg();

const getMoviesBySearch = async (search) => {
  try {
    const res = await fetch(`${baseURL}s=${search}`);
    const data = await res.json();
    if (!data.Error) {
      return data.Search;
    } else {
      throw new Error(data.Error);
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMovieById = async (id) => {
  try {
    const res = await fetch(`${baseURL}i=${id}`);
    const data = await res.json();
    if (!data.Error) {
      return data;
    } else {
      throw Error(data.Error);
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getHtmlByMovie = (movie, className) => {
  const { Poster, Title, imdbRating, Runtime, Genre, imdbID, Plot } = movie;
  const icon = className === "movie-wl" ? "plus" : "remove";
  const btnName = className === "movie-wl" ? "Watchlist" : "Remove";
  
  return `
    <div class="movie-container">
      <div class="movie">
        <div class="movie-img">
          <img src="${Poster}" alt=${Title}>
        </div>
        <div class="movie-info">
          <div class="movie-title">
            <span class="movie-name">${Title}</span>
            <div class="movie-imdb">
              <img src="./images/star.png" alt="Star Icon" />
              <span class="movie-rate">${imdbRating}</span>
            </div>
          </div>
          <div class="movie-cont">
            <span class="movie-dur">${Runtime}</span>
            <span class="movie-genre">${Genre}</span>
            <button id=${imdbID} class=${className}>
              <img src="./images/${icon}.png" alt="${icon} icon" class="icon" />
              <span class="btnName">${btnName}</span>
            </button>
          </div>
          <div class="movie-desc">${Plot}</div>
        </div>
      </div>
      <hr />
    </div>
  `;
};

const getHtmlForMovies = async (movies) => {
  let html = "";
  for (const movie of movies) {
    const m = await getMovieById(movie.imdbID);
    if (m) html += getHtmlByMovie(m, "movie-wl");
  };
  return html;
};

const getHtmlForList = async (movieIds) => {
  let html = "";
  for (const id of movieIds) {
    const movie = await getMovieById(id);
    if (movie) html += getHtmlByMovie(movie, "movie-wl-list");
  };
  return html;
};

const handleRemoveList = (id) => {
  const movieIdsArr = JSON.parse(localStorage.getItem("movieArr"));
  const index = movieIdsArr.indexOf(id);
  movieIdsArr.splice(index, 1);
  localStorage.setItem("movieArr", JSON.stringify(movieIdsArr));
  location.reload();
};

const setHtmlForList = async () => {
  const movieIdsArr = JSON.parse(localStorage.getItem("movieArr"));
  const listEl = document.getElementById("movies-list");
  if (movieIdsArr) {
    if (listEl) {
      listEl.innerHTML = `
        <div class="movies-loader">
          <div class="loader"></div>
        </div>
      `;
      const html = await getHtmlForList(movieIdsArr);
      if (html) {
        listEl.innerHTML = html;
        const list = document.querySelectorAll(".movie-wl-list");
        list.forEach(item => item.addEventListener("click", () => handleRemoveList(item.id)));
      } else {
        listEl.innerHTML = `
          <div class="movies-initial">
            <p>Your watchlist is looking a little empty...</p>
            <a href="index.html" class="movie-wl-list">
              <img src="./images/plus.png" alt="Add Icon" />
              <span>Let's add some movies</span>
            </a>
          </div>
        `;
      };
    };
  };
};

const handleSearchChange = (e) => {
  e.preventDefault();
  searching = e.target.value;
};

const handleAddList = (id) => {
  if (!movieIds.includes(id)) {
    movieIds.push(id);
    localStorage.setItem("movieArr", JSON.stringify(movieIds));
    const list = document.querySelectorAll(".movie-wl");
    list.forEach(item => {
      if (item.id === id) {
        const icon = item.querySelector("img");
        icon.setAttribute("src", "./images/ok.png");
        icon.setAttribute("alt", "added icon");
        item.querySelector("span").textContent = "Added to Watchlist";
        item.classList.add("remove");
      };
    });
  };
};

const handleSearchClick = async () => {
  if (searching) {
    const moviesEl = document.getElementById("movies");
    moviesEl.innerHTML = `
      <div class="movies-loader">
        <div class="loader"></div>
      </div>
    `;
    const movies = await getMoviesBySearch(searching);
    if (movies) {
      const html = await getHtmlForMovies(movies);
      if (html) {
        moviesEl.innerHTML = html;
        const addWatchlist = document.querySelectorAll(".movie-wl");
        addWatchlist.forEach(item => item.addEventListener("click", () => handleAddList(item.id)));
      };
    } else {
      moviesEl.innerHTML = `
        <div class="movies-notFounded">
          <h1>
            Unable to find what you're looking for. Please try another search.
          </h1>
        </div>
      `;
    };
    document.getElementById("search-btn").value = "";
  };
};

const addEventToSearch = () => {
  if (document.getElementById("search") && document.getElementById("search-btn")) {
    document.getElementById("search").addEventListener("change", handleSearchChange);
    document.getElementById("search-btn").addEventListener("click",handleSearchClick);
  };
};

addEventToSearch();

if (document.getElementById("movies-list")) {
  document.getElementById("movies-list").innerHTML = `
    <div class="movies-initial">
      <p>Your watchlist is looking a little empty...</p>
      <a href="index.html" class="movie-wl-list">
        <img src="./images/plus.png" alt="Add Icon" />
        <span>Let's add some movies</span>
      </a>
    </div>
  `;
};

if (JSON.parse(localStorage.getItem("movieArr")).length > 0) setHtmlForList();