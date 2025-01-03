export default class MdApi {

    _options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZjkyOWMyM2UyMjM0YzI4NmJjMGJlMmY2ZjZhZWIyZCIsIm5iZiI6MTcyMDYyNDA3Ny41NzgwMDYsInN1YiI6IjY2OGFiMjVkOGE4MDMyMDIyNTg5MmU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bGVjV5bpmDoX1xcjmd8eRGwft5AL7OECiF9qsHmM5A4'
        }
    };

    _apiBase = 'https://api.themoviedb.org/3/search/movie?query=';

    async getMovies(title) {
        const response = await fetch(`${this._apiBase}${title}`, this._options);
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`);
        const json = await response.json();

        const genresResponse = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, this._options);
        const genresData = await genresResponse.json();
        const genresList = genresData.genres;

        const movies = [...json.results]

        for(let i = 0; i < movies.length; i++) {
            const genreIds = movies[i].genre_ids

            movies[i].genres = genresList.filter(genre => genreIds.includes(genre.id))
        }

        return movies
    }
}