import React, {Component} from 'react';
import MovieCard from '../movie-card/movie-card.jsx';
import {Alert, Button} from "antd";

export default class MovieList extends Component{

    state = {
        list: this.props.moviesData,
        counter: this.props.moviesCounter
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.moviesData !== prevProps.moviesData || this.props.moviesCounter !== prevProps.moviesCounter) {
            this.setState({
                list: this.props.moviesData,
                counter: this.props.moviesCounter
            })
        }
    }

    render() {
        const { list, counter } = this.state;
        const alertInfo = <Alert message='Use search to find a movie' type='info' />;
        const alertNotFound = <Alert message='Movie not found' type='error' />;

        const movies = list
            ? list.map(movieInfo => <MovieCard { ...movieInfo } key={ movieInfo.id }/>)
            : null;

        return(
            <>
                { counter === 'not found' ? alertNotFound : counter > 0 ? movies : alertInfo }
            </>
        );
    }
}