export default class MdApi {

    private options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZjkyOWMyM2UyMjM0YzI4NmJjMGJlMmY2ZjZhZWIyZCIsIm5iZiI6MTcyMDYyNDA3Ny41NzgwMDYsInN1YiI6IjY2OGFiMjVkOGE4MDMyMDIyNTg5MmU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bGVjV5bpmDoX1xcjmd8eRGwft5AL7OECiF9qsHmM5A4'
        }
    }

    private apiKey = 'ef929c23e2234c286bc0be2f6f6aeb2d'

    private apiBase: string = 'https://api.themoviedb.org/3/search/movie?query='

    private genresUrl: string = `https://api.themoviedb.org/3/genre/movie/list`

    private sessionUrl: string = 'https://api.themoviedb.org/3/authentication/guest_session/new'

    async rateMovie(id, value, sessionId) {
        const requestOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json', 'Content-Type': 'application/json;charset=utf-8',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZjkyOWMyM2UyMjM0YzI4NmJjMGJlMmY2ZjZhZWIyZCIsIm5iZiI6MTcyMDYyNDA3Ny41NzgwMDYsInN1YiI6IjY2OGFiMjVkOGE4MDMyMDIyNTg5MmU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bGVjV5bpmDoX1xcjmd8eRGwft5AL7OECiF9qsHmM5A4'
            },
            body: JSON.stringify({ value })
        }

        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/rating?guest_session_id=${sessionId}`, requestOptions)
        if(!response.ok) console.error(`Could not fetch ${response.status}`)
        const data = await response.json();
        console.log(data.status_message)
    }

    async getRatedMovies(sessionId) {
        console.log(sessionId)
        const url = `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies`;

        try {
            const response = await fetch(url, this.options)
            if (!response.ok) console.error(`Error: ${response.status} ${response.statusText}`)
            return await response.json()
        } catch (error) {
            console.error('Failed to fetch rated movies:', error.message)
        }
    }

    async createSession() {
        const response = await fetch(this.sessionUrl, this.options);
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`)
        const data = await response.json();
        return data.guest_session_id
    }

    async getAllGenres() {
        const genresResponse = await fetch(this.genresUrl, this.options)
        const genresData = await genresResponse.json();

        return genresData.genres
    }

    async getMovies(title) {
        const response = await fetch(`${this.apiBase}${title}`, this.options)
        if (!response.ok) throw new Error(`Could not fetch ${response.status}`)
        const json = await response.json()

        return json.results
    }
}