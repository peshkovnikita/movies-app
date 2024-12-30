import React, {Component} from 'react';
import MovieCard from '../movie-card/movie-card';
import { Alert } from "antd";

export default class MovieList extends Component{

    state = {
        list: this.props.moviesData,
        flag: this.props.moviesFlag
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.moviesData !== prevProps.moviesData || this.props.moviesFlag !== prevProps.moviesFlag) {
            this.setState({
                list: this.props.moviesData,
                flag: this.props.moviesFlag
            })
        }
    }

    render() {
        const { list, flag } = this.state;
        const alertInfo = <Alert message='Use search to find a movie' type='info' />;
        const alertNotFound = <Alert message='Movie not found' type='error' />;

        const movies = list
            ? list.map(movieInfo => <MovieCard { ...movieInfo } key={ movieInfo.id }/>)
            : null;

        return(
            <>
                { flag < 0 ? alertNotFound : flag > 0 ? movies : alertInfo }
            </>
        );
    }
}