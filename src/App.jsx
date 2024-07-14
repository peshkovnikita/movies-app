import React, { Component } from 'react';
import MoviesList from './components/movies-list';
import { Layout, Flex, Button, Pagination, Input, Space } from 'antd';

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
        movieList: null
    }

    async updateMovies() {
        const list = await this.moviesAPI.getMovies('return');
        this.setState({ movieList: list.splice(0, 6) });
    }

    render() {
        const gapSize = 32;
        const { movieList } = this.state

        return (
            <Layout className='layout'>
                <Header className='header'>
                    <Input.Search placeholder='Type to search...' allowClear />
                    <Button onClick={ () => console.log(movieList) } type='primary'>
                        Get movies
                    </Button>
                </Header>
                <Content className='main'>
                    <Flex className='cards-container' gap={gapSize} justify='center'>
                        <MoviesList moviesData={ movieList }/>
                    </Flex>
                </Content>
                <Footer className='footer'>
                    <Pagination align='center' defaultCurrent={1} total={50} />
                </Footer>
            </Layout>
        )
    }
}
