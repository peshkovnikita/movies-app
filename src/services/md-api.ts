export default class MdApi {

    private options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZjkyOWMyM2UyMjM0YzI4NmJjMGJlMmY2ZjZhZWIyZCIsIm5iZiI6MTcyMDYyNDA3Ny41NzgwMDYsInN1YiI6IjY2OGFiMjVkOGE4MDMyMDIyNTg5MmU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bGVjV5bpmDoX1xcjmd8eRGwft5AL7OECiF9qsHmM5A4'
        }
    }

    private urlBase: string = 'https://api.themoviedb.org/3/'

    async rateMovie(id, value, sessionId) {
        const requestOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json', 'Content-Type': 'application/json;charset=utf-8',
                Authorization: this.options.headers.Authorization
            },
            body: JSON.stringify({ value })
        }

        const response = await fetch(`${this.urlBase}movie/${id}/rating?guest_session_id=${sessionId}`, requestOptions)
        if(!response.ok) console.error(`Could not fetch ${response.status}`)
    }

    async getRatedMovies(sessionId) {
        const response = await fetch(`${this.urlBase}guest_session/${sessionId}/rated/movies`, this.options)
        if (!response.ok) console.error(`Error: ${response.status} ${response.statusText}`)
        const ratedList = await response.json()

        return ratedList.results
    }

    async createSession() {
        const response = await fetch(`${this.urlBase}authentication/guest_session/new`, this.options);
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`)
        const data = await response.json();
        return [data.guest_session_id, data.expires_at]
    }

    async getAllGenres() {
        const genresResponse = await fetch(`${this.urlBase}genre/movie/list`, this.options)
        const genresData = await genresResponse.json();

        return genresData.genres
    }

    async getMovies(title) {
        const response = await fetch(`${this.urlBase}search/movie?query=${title}`, this.options)
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`)
        const json = await response.json()

        return json.results
    }
}