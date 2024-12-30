import React, { Component } from 'react';
import MdApi from './services/md-api';
import MoviesList from './components/movies-list/movie-list';
import { debounce } from 'lodash';

import './App.css'
import { Tabs, Layout, Flex, Input, Spin, Alert, Pagination } from 'antd';
const { Header, Content, Footer } = Layout;

export default class App extends Component {
    moviesAPI = new MdApi();

    state = {
        movieList: null,
        moviesFlag: 0,
        paginatedMovies: null,
        isLoading: false,
        error: false,
        currentPage: 1
    }

    onClear() {
        this.setState(() => {
            return {
                movieList: null,
                moviesFlag: 0,
                paginatedMovies: null,
                isLoading: false,
                error: false,
                currentPage: 1
            }
        })
    }

    onSearchChange = (e) => {
        if(e.target.value.trim()) {
            this.updateMovies(e.target.value.trim())
                .catch(e => console.error(e))
            this.setState({ isLoading: true })
        } else {
            this.onClear()
        }
    }

    debounceOnChange = debounce(this.onSearchChange, 700)

    paginateMovies = (arr, size) => {
        const initial = [...arr]
        const result = []
        for (let i = 0; i < initial.length; i += size) {
            result.push(initial.slice(i, i + size))
        }
        return result
    }

    async updateMovies(keyword) {
        try {
            const list = await this.moviesAPI.getMovies(keyword);
            if(list.length) {
                const paginatedMovies = this.paginateMovies(list, 6)
                this.setState({
                    movieList: paginatedMovies[0],
                    moviesFlag: list.length,
                    paginatedMovies: paginatedMovies,
                    isLoading: false
                });
            }
            else {
                this.setState(() => {
                    return {
                        movieList: null,
                        moviesFlag: -1,
                        isLoading: false,
                    }
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

    onPageChange = (page) => {
        const paginatedMovies = this.state.paginatedMovies
        this.setState({
            currentPage: page,
            movieList: paginatedMovies[page-1]
        })
    }

    onTabSwitch = (key) => {
        console.log(key)
    }

    render() {
        const { movieList ,isLoading, error, moviesFlag, currentPage } = this.state

        const spinner = isLoading ? <Spin size='large'></Spin> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const content = !error && !isLoading ? <MoviesList moviesData={ movieList } moviesFlag = { moviesFlag }/> : null;
        const pagination = moviesFlag > 0
            ? <Pagination align='center'
                          current={currentPage}
                          total={moviesFlag}
                          defaultPageSize={6}
                          onChange={this.onPageChange} /> : null

        return (
            <Layout className='layout'>
                <Tabs
                    defaultActiveKey='1'
                    onChange={this.onTabSwitch}
                    items={ [{key: '1', label: 'Search'}, {key: '2', label: 'Rated'}] }
                    style={ { display: 'grid', placeItems: 'center'} }
                />
                <Header className='header'>
                    <Input placeholder='Type for searching...' allowClear onChange={this.debounceOnChange} onClear={this.onClear}/>
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
            </Layout>
        )
    }
}
