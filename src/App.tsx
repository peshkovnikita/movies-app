import { Component, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import MdApi from './services/md-api';
import MoviesList from './components/movies-list/movie-list';
import './App.css'

import { GenresProvider } from './services/genres-context';

import { Tabs, Layout, Flex, Input, Spin, Alert, Pagination } from 'antd';
const { Header, Content, Footer } = Layout;

const moviesAPI: IMdApi = new MdApi();

interface IMovies {
    genre_ids: number[]
    title: string
}

interface IGenre {
    id: number,
    name: string
}

interface IAppState {
    movieList?: IMovies[] | null
    totalMovies?: number
    paginatedMovies?: IMovies[][] | null
    isLoading?: boolean
    error?: boolean
    currentPage?: number,
    ratedList?: IMovies[] | null
    tab?: 'search' | 'rating'
}

interface IMdApi {
    getMovies(keyword: string): Promise<IMovies[]>
}

export default class App extends Component<object, IAppState> {

    private genresList: IGenre[] | null = null

    state: IAppState = {
        movieList: null,
        totalMovies: 0,
        paginatedMovies: null,
        isLoading: true,
        error: false,
        currentPage: 1,
        ratedList: null,
        tab: 'search'
    }

    componentDidMount() {
        this.initializeData();
    }

    async createSession() {
        const [sessionId, expires] = await moviesAPI.createSession()
        const expireDate = new Date(expires)
        localStorage.setItem('sessionId', `${sessionId}`)
        localStorage.setItem('expires', `${expireDate.getTime()}`)
    }

    async initializeData() {
        try {
            const timestamp = Date.now()
            await this.loadGenres()
            this.getRatedList(localStorage.getItem('sessionId'))
            if(!localStorage.getItem('sessionId')) await this.createSession()
            if(timestamp > localStorage.getItem('expires')) {
                localStorage.clear()
                await this.createSession()
            }
        } catch (error) {
            console.error('Initialization failed:', error)
            this.setState({ error: true, isLoading: false })
        }
    }

    async loadGenres() {
        try {
            this.genresList = await moviesAPI.getAllGenres()
            this.setState({ isLoading: false })
        }
        catch (err) {
            this.genresList = null
            this.setState({ error: true, isLoading: false })
        }
    }

    onClear() {
        this.setState({
            movieList: null,
            totalMovies: 0,
            paginatedMovies: null,
            isLoading: false,
            error: false,
            currentPage: 1,
            tab: 'search'
        })
    }

    onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.trim()) this.updateMovies(e.target.value.trim())
        else this.onClear()
    }

    debounceOnChange = debounce(this.onSearchChange, 700)

    paginateMovies = (arr: IMovies[], size: number): IMovies[][] => {
        const initial = [...arr]
        const result: IMovies[][] = []
        for (let i = 0; i < initial.length; i += size) {
            result.push(initial.slice(i, i + size))
        }
        return result
    }

    compareRating(movies, ratedMovies): IMovies[] {
        return movies.map(movie => {
            const ratedMovie = ratedMovies.find(rm => rm.id === movie.id)
            return ratedMovie ? { ...movie, rating: ratedMovie.rating } : movie
        })
    }

    async updateMovies(keyword: string): Promise<void> {
        this.setState({ isLoading: true })
        this.getRatedList(localStorage.getItem('sessionId'))
        try {
            let list = await moviesAPI.getMovies(keyword);
            if(list.length) {
                if(this.state.ratedList) {
                    list = this.compareRating(list, this.state.ratedList)
                }
                const paginatedMovies = this.paginateMovies(list, 6)
                this.setState({
                    movieList: paginatedMovies[0],
                    totalMovies: list.length,
                    paginatedMovies,
                    isLoading: false
                })
            }
            else this.setState({ isLoading: false })
        }
        catch (err) {
            this.setState({
                error: true,
                isLoading: false
            })
        }
    }

    async getRatedList(sessionId) {
        const list = await moviesAPI.getRatedMovies(sessionId)
        if(list) this.setState({ ratedList: list })
    }

    onPageChange = (page: number) => {
        const { paginatedMovies } = this.state
        this.setState({
            currentPage: page,
            movieList: paginatedMovies[page - 1]
        })
    }

    onTabSwitch = (key: string) => {
        if(key === '1') this.setState({ tab: 'search' })
        else {
            this.getRatedList(localStorage.getItem('sessionId'))
            this.setState({
                tab: 'rating',
                paginatedMovies: null,
                movieList: null,
                currentPage: 1
            })
        }
    }

    render() {
        const { movieList, isLoading, error, totalMovies, currentPage, tab, ratedList } = this.state

        const spinner = isLoading ? <Spin size='large' /> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const content = !error && !isLoading
            ? <MoviesList moviesData={ tab === 'search' ? movieList : ratedList } /> : null

        const searchInput = tab === 'search'
            ? <Input placeholder='Type for searching...'
                     onChange={this.debounceOnChange}
                     onClear={this.onClear}
                     allowClear disabled={isLoading || error}/>
            : null

        const pagination = movieList && tab === 'search'
            ? <Pagination align='center'
                          current={currentPage}
                          total={totalMovies}
                          defaultPageSize={6}
                          onChange={this.onPageChange}/>
            : null

        const providerProps = {
            genresList: this.genresList,
            sessionId: localStorage.getItem('sessionId')
        }

        return (
            <Layout className='layout'>
                <GenresProvider value={ providerProps }>
                    <Header className='header'>
                        <Tabs
                            defaultActiveKey='1'
                            onChange={ this.onTabSwitch }
                            items={[{ key: '1', label: 'Search' }, { key: '2', label: 'Rated' }]}
                            style={{ display: 'grid', placeItems: 'center' }}
                            destroyInactiveTabPane
                        />
                        { searchInput }
                    </Header>
                    <Content className='main'>
                        <Flex className='cards-container' justify='center' >
                            { spinner }
                            { content }
                            { alertWarning }
                        </Flex>
                    </Content>
                    <Footer>
                        { pagination }
                    </Footer>
                </GenresProvider>
            </Layout>
        )
    }
}
