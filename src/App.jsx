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

    onClear() {
        this.setState(() => {
            return {
                movieList: null,
                moviesCounter: 0,
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
            this.setState({ isLoading: true })
        } else {
            this.onClear()
        }
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
            if(list.length) {
                const paginatedMovies = this.paginateMovies(list, 6)
                this.setState({
                    movieList: paginatedMovies[1],
                    moviesCounter: list.length,
                    paginatedMovies: paginatedMovies,
                    isLoading: false
                });
            }
            else {
                this.setState(() => {
                    return {
                        movieList: null,
                        moviesCounter: 'not found',
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
            movieList: paginatedMovies[page]
        })
    }

    render() {
        const { movieList ,isLoading, error, moviesCounter, currentPage } = this.state

        const spinner = isLoading ? <Spin size='large'></Spin> : null;
        const alertWarning = error ? <Alert message='Network error. Use VPN' type='warning' /> : null;
        const content = !error && !isLoading ? <MoviesList moviesData={ movieList } moviesCounter = { moviesCounter }/> : null;

        return (
            <Layout className='layout'>
                <Header className='header'>
                    <Input placeholder='Type to search...' allowClear onChange={this.debounceOnChange} onClear={this.onClear}/>
                </Header>
                <Content className='main'>
                    <Flex className='cards-container' gap={32} justify='center' >
                        {spinner}
                        {content}
                        {alertWarning}
                    </Flex>
                </Content>
                {Number(moviesCounter)
                    ? <Footer>
                        <Pagination align="center" current={currentPage} total={moviesCounter} defaultPageSize={6} onChange={this.onPageChange}/>
                      </Footer>
                    : null}
            </Layout>
        )
    }
}
