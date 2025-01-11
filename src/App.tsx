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
    isLoading?: boolean
    error?: boolean
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
        isLoading: true,
        error: false,
        ratedList: null,
        tab: 'search'
    }

    componentDidMount() {
        this.initializeData();
    }

    async createSession() {
        const sessionId = await moviesAPI.createSession()
        const expires: number = Date.now() + 1_800_000 //сессия истекает через 30 мин

        localStorage.setItem('session_id', `${sessionId}`)
        localStorage.setItem('expires', `${expires}`)
    }

    async initializeData() {
        try {
            const timestamp: number = Date.now()
            const sessionId: string = localStorage.getItem('session_id')
            await this.loadGenres()

            if(!sessionId) await this.createSession()
            else {
                if(timestamp > localStorage.getItem('expires')) {
                    await this.createSession()
                }
            }

            await this.getRatedList(sessionId)

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
            isLoading: false,
            error: false,
            tab: 'search'
        })
    }

    onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.trim()) this.updateMovies(e.target.value.trim())
        else this.onClear()
    }

    debounceOnChange = debounce(this.onSearchChange, 700)

    compareRating(movies, ratedMovies): IMovies[] {
        return movies.map(movie => {
            const ratedMovie = ratedMovies.find(rm => rm.id === movie.id)
            return ratedMovie ? { ...movie, rating: ratedMovie.rating } : movie
        })
    }

    async updateMovies(keyword: string): Promise<void> {
        this.setState({ isLoading: true })

        try {
            let list = await moviesAPI.getMovies(keyword);
            if(list.length) {
                if(this.state.ratedList) list = this.compareRating(list, this.state.ratedList)
                this.setState({ movieList: list, isLoading: false})
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
        else return;
    }

    onTabSwitch = async (key: string) => {
        await this.getRatedList(localStorage.getItem('session_id'))
        if (key === '1') this.setState({ tab: 'search' })
        else this.setState({ tab: 'rating' })
    }

    render() {
        const { movieList, isLoading, error, tab, ratedList } = this.state

        const spinner = isLoading ? <Spin size='large' /> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const content = !error && !isLoading
            ? <MoviesList moviesData={ tab === 'search' ? movieList : ratedList } /> : null

        const providerProps = {
            genresList: this.genresList,
            sessionId: localStorage.getItem('session_id')
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
                        />
                        <div style={{ height: '32px' }}>
                            <Input placeholder='Type for searching...'
                                   onChange={this.debounceOnChange}
                                   onClear={this.onClear}
                                   style={{ display: tab === 'rating' ? 'none' : 'inline-flex' }}
                                   allowClear disabled={isLoading || error}
                            />
                        </div>
                    </Header>
                    <Content className='main'>
                        <Flex className='cards-container' justify='center' >
                            { spinner }
                            { content }
                            { alertWarning }
                        </Flex>
                    </Content>
                    <Footer>
                        { movieList ? <Pagination align='center' defaultCurrent={1} /> : null }
                    </Footer>
                </GenresProvider>
            </Layout>
        )
    }
}
