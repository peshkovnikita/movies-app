export default class MdApi {

    private options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZjkyOWMyM2UyMjM0YzI4NmJjMGJlMmY2ZjZhZWIyZCIsIm5iZiI6MTcyMDYyNDA3Ny41NzgwMDYsInN1YiI6IjY2OGFiMjVkOGE4MDMyMDIyNTg5MmU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bGVjV5bpmDoX1xcjmd8eRGwft5AL7OECiF9qsHmM5A4'
        }
    };

    private apiBase = 'https://api.themoviedb.org/3/search/movie?query=';

    async getMovies(title) {
        const response = await fetch(`${this.apiBase}${title}`, this.options);
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`);
        const json = await response.json();

        // for(let i = 0; i < movies.length; i++) {
        //     const genreIds = movies[i].genre_ids
        //
        //     movies[i].genres = genresList.filter(genre => genreIds.includes(genre.id))
        // }

        return json.results
    }

    async getAllGenres() {
        const genresResponse = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, this.options);
        const genresData = await genresResponse.json();

        return genresData.genres
    }
}