import { Component, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import MdApi from './services/md-api';
import MoviesList from './components/movies-list/movie-list';
import './App.css'

import { GenresProvider } from './services/genres-context';

import { Tabs, Layout, Flex, Input, Spin, Alert, Pagination } from 'antd';
const { Header, Content, Footer } = Layout;

const moviesAPI: IMdApi = new MdApi();

// Разделяем приложение на 2 таба - Search и Rated, в табе Rated выводим только список тех фильмов, которые оценивали.
// Компонент Rate. Если вы не голосовали за фильм - все звезды должны быть пустыми, если голосовали - тот рейтинг, что вы проставили фильму.

interface IMovies {
    genre_ids: number[]
    title: string
}

interface IGenre {
    id: number,
    name: string
}

interface IAppState {
    sessionId: string | null
    movieList: IMovies[] | null
    moviesFlag: number
    paginatedMovies: IMovies[][] | null
    isLoading: boolean
    error: boolean
    currentPage: number,
    ratedList: number[]
    tab: 'search' | 'rating'
}

interface IMdApi {
    getMovies(keyword: string): Promise<IMovies[]>
}

export default class App extends Component<object, IAppState> {

    private initialState: IAppState = {
        sessionId: null,
        movieList: null,
        moviesFlag: 0,
        paginatedMovies: null,
        isLoading: true,
        error: false,
        currentPage: 1,
        ratedList: [1, 2, 3],
        tab: 'search'
    }

    private genresList: IGenre[] | null = null

    state = { ...this.initialState }

    componentDidMount() {
        this.initializeData();
    }

    async initializeData() {
        try {
            const sessionId = await moviesAPI.createSession();
            this.setState({ sessionId: sessionId });
            await this.loadGenres();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.setState({ error: true, isLoading: false });
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
        this.setState({ ...this.initialState, isLoading: false })
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

    async updateMovies(keyword: string): Promise<void> {
        this.setState({ isLoading: true })

        try {
            const list = await moviesAPI.getMovies(keyword);
            if(list.length) {
                const paginatedMovies = this.paginateMovies(list, 6)
                this.setState({
                    movieList: paginatedMovies[0],
                    moviesFlag: list.length,
                    paginatedMovies,
                    isLoading: false
                });
            }
            else {
                this.setState({
                    movieList: null,
                    moviesFlag: -1,
                    isLoading: false,
                });
            }
        }
        catch (err) {
            this.setState({
                error: true,
                isLoading: false
            })
        }
    }

    async getRatedList(sessionId) {
        try {
            console.log(this.state.sessionId)
            const list = await moviesAPI.getRatedMovies(sessionId)
            console.log(list)
        } catch (e) {
            console.error(e.message)
        }
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
            this.setState({ tab: 'rating' })
        }
    }

    render() {
        const { movieList, isLoading, error, moviesFlag, currentPage, sessionId, tab } = this.state

        const spinner = isLoading ? <Spin size='large' /> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const contentSearch = !error && !isLoading ? <MoviesList moviesData={ movieList } moviesFlag = { moviesFlag } /> : null;
        //const contentRating = <MoviesList moviesData={ ratedList } moviesFlag = { moviesFlag } />;
        const contentRating = <button type="button" onClick={ () => this.getRatedList(sessionId) }>List</button>;

        const searchInput = tab === 'search'
            ? <Input placeholder='Type for searching...'
                     onChange={this.debounceOnChange}
                     onClear={this.onClear}
                     allowClear disabled={isLoading || error}/>
            : null

        const pagination = moviesFlag > 0 && tab === 'search'
            ? <Pagination align='center'
                          current={currentPage}
                          total={moviesFlag}
                          defaultPageSize={6}
                          onChange={this.onPageChange}/>
            : null

        const providerProps = {genresList: this.genresList, sessionId: sessionId}

        return (
            <Layout className='layout'>
                <GenresProvider value={ providerProps }>
                    <Header className='header'>
                        <Tabs
                            defaultActiveKey='1'
                            onChange={ this.onTabSwitch }
                            items={[{ key: '1', label: 'Search' }, { key: '2', label: 'Rated' }]}
                            style={{ display: 'grid', placeItems: 'center' }}
                            // destroyInactiveTabPane
                        />
                        { searchInput }
                    </Header>
                    <Content className='main'>
                        <Flex className='cards-container' justify='center' >
                            { spinner }
                            { tab === 'search' ? contentSearch : contentRating }
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
