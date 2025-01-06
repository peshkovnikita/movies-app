import { Component, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import MdApi from './services/md-api';
import MoviesList from './components/movies-list/movie-list';
import './App.css'

import { GenresProvider } from './services/genres-context';

import { Tabs, Layout, Flex, Input, Spin, Alert, Pagination } from 'antd';
const { Header, Content, Footer } = Layout;

const moviesAPI: IMdApi = new MdApi();

// При запуске вашего приложения создаем новую гостевую сессию по апи
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
    movieList: IMovies[] | null
    moviesFlag: number
    paginatedMovies: IMovies[][] | null
    isLoading: boolean
    error: boolean
    currentPage: number
}

interface IMdApi {
    getMovies(keyword: string): Promise<IMovies[]>
}

export default class App extends Component<object, IAppState> {

    private initialState: IAppState = {
        movieList: null,
        moviesFlag: 0,
        paginatedMovies: null,
        isLoading: true,
        error: false,
        currentPage: 1
    }

    private genresList: IGenre[] = null

    state = { ...this.initialState }

    componentDidMount() {
        this.getGenres()
    }

    async getGenres() {
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
        this.setState({ ...this.initialState })
    }

    onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.trim()) {
            this.updateMovies(e.target.value.trim())
        } else {
            this.onClear()
        }
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

    onPageChange = (page: number) => {
        const { paginatedMovies } = this.state
        this.setState({
            currentPage: page,
            movieList: paginatedMovies[page - 1]
        })
    }

    onTabSwitch = (key: string) => {
        console.log(key)
    }

    render() {
        const { movieList, isLoading, error, moviesFlag, currentPage } = this.state

        const spinner = isLoading ? <Spin size='large' /> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const content = !error && !isLoading ? <MoviesList moviesData={ movieList } moviesFlag = { moviesFlag } /> : null;
        const pagination = moviesFlag > 0
            ? <Pagination align='center'
                          current={currentPage}
                          total={moviesFlag}
                          defaultPageSize={6}
                          onChange={this.onPageChange}
              /> : null

        return (
            <Layout className='layout'>
                <GenresProvider value={this.genresList}>
                    <Header className='header'>
                        <Tabs
                            defaultActiveKey='1'
                            onChange={this.onTabSwitch}
                            items={[{ key: '1', label: 'Search' }, { key: '2', label: 'Rated' }]}
                            style={{ display: 'grid', placeItems: 'center' }}
                        />
                        <Input placeholder='Type for searching...' onChange={this.debounceOnChange} onClear={this.onClear} allowClear autoFocus disabled={isLoading || error}/>
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
