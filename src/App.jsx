import React, { Component } from 'react';
import MoviesList from './components/movies-list';
import { Layout, Flex, Button, Pagination, Input, Space, Spin, Alert } from 'antd';

import MdApi from './services/md-api.js';
import './App.css'

const { Header, Footer, Content } = Layout;

export default class App extends Component {
    constructor() {
        super();
        this.updateMovies()
    }

    moviesAPI = new MdApi();

    state = {
        movieList: null,
        isLoading: true,
        error: false
    }

    async updateMovies() {
        try {
            const list = await this.moviesAPI.getMovies('return');
            this.setState({
                movieList: list.splice(0, 6),
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
        const { movieList, isLoading, error } = this.state

        const spinner = isLoading ? <Spin size='large'></Spin> : null;
        const alert = error ? <Alert message='Something went wrong' type='warning' showIcon /> : null;
        const content = error && isLoading ? null : <MoviesList moviesData={ movieList }/>;
        const gapSize = 32;

        return (
            <Layout className='layout'>
                <Header className='header'>
                    <Input.Search placeholder='Type to search...' allowClear />
                    <Button onClick={ () => console.log(this.state) } type='primary'>Check State</Button>
                </Header>
                <Content className='main'>
                    <Flex className='cards-container' gap={gapSize} justify='center' >
                        {spinner}
                        {content}
                        {alert}
                    </Flex>
                </Content>
                <Footer className='footer'>
                    <Pagination align='center' defaultCurrent={1} total={50} />
                </Footer>
            </Layout>
        )
    }
}
