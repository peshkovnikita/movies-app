import React, { Component } from 'react';
import MdApi from './services/md-api.js';
import MoviesList from './components/movies-list';
import { debounce } from 'lodash';

import './App.css'
import { Layout, Flex, Button, Pagination, Input, Space, Spin, Alert } from 'antd';
const { Header, Content, Footer } = Layout;

export default class App extends Component {

    moviesAPI = new MdApi();

    state = {
        movieList: null,
        moviesCounter: 0,
        paginatedMovies: null,
        isLoading: false,
        error: false,
        currentPage: 1
    }

    onSearchChange = (e) => {
        if(!e.target.value) return;
        this.setState({ isLoading: true })
        this.updateMovies(e.target.value)
    }

    debounceOnChange = debounce(this.onSearchChange, 700)

    paginateMovies = (arr, size) => {
        const initial = [...arr]
        const result = [null]
        for (let i = 0; i < initial.length; i += size) {
            result.push(initial.slice(i, i + size))
        }
        return result
    }

    async updateMovies(keyword) {
        try {
            const list = await this.moviesAPI.getMovies(keyword);
            const paginatedMovies = this.paginateMovies(list, 6)
            this.setState({
                movieList: paginatedMovies[1],
                moviesCounter: list.length,
                paginatedMovies: paginatedMovies,
                isLoading: false
            });
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
            movieList: paginatedMovies[page]
        })
    }

    render() {
        const { movieList ,isLoading, error, moviesCounter, currentPage } = this.state

        const spinner = isLoading ? <Spin size='large'></Spin> : null;
        const alertWarning = error ? <Alert message='Something went wrong' type='warning' showIcon /> : null;
        const content = !error && !isLoading ? <MoviesList moviesData={ movieList }/> : null;
        const gapSize = 32;

        return (
            <Layout className='layout'>
                <Header className='header'>
                    <Input placeholder='Type to search...' allowClear onChange={this.debounceOnChange}/>
                </Header>
                <Content className='main'>
                    <Flex className='cards-container' gap={gapSize} justify='center' >
                        {spinner}
                        {content}
                        {alertWarning}
                    </Flex>
                </Content>
                {moviesCounter
                    ? <Footer>
                        <Pagination align="center" current={currentPage} total={moviesCounter} defaultPageSize={6} onChange={this.onPageChange}/>
                      </Footer>
                    : null}
            </Layout>
        )
    }
}
