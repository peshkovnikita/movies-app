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
        const alertThumb = <Alert message='Use search to find a movie' type='info' showIcon />;
        const alertNotFounded = <Alert message='There is no movie like this' type='error'/>;

        const movies = list
            ? list.map(movieInfo => <MovieCard { ...movieInfo } key={ movieInfo.id }/>)
            : null;

        return(
            <>
                { counter === 'not found' ? alertNotFounded : null }
                { !movies && counter !== 'not found' ? alertThumb : movies}
            </>
        );
    }
}