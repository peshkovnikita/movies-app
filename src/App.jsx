import React, { Component } from 'react';
import MdApi from './services/md-api.js';
import MoviesList from './components/movies-list';
import { debounce } from 'lodash';

import './App.css'
import { Layout, Flex, Button, Pagination, Input, Space, Spin, Alert } from 'antd';
const { Header, Content } = Layout;

export default class App extends Component {

    moviesAPI = new MdApi();

    state = {
        movieList: null,
        isLoading: false,
        error: false
    }

    onSearchChange = (e) => {
        this.setState({ isLoading: true })
        this.updateMovies(e.target.value)
    }

    debounceOnChange = debounce(this.onSearchChange, 700)

    async updateMovies(keyword) {
        try {
            const list = await this.moviesAPI.getMovies(keyword);
            this.setState({
                movieList: list,
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

    render() {
        const { movieList ,isLoading, error } = this.state

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
            </Layout>
        )
    }
}
