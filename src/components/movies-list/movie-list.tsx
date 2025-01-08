import { Component } from 'react';
import MovieCard from '../movie-card/movie-card';
import { Alert } from 'antd';

interface IMovieInfo {
    id: number
}

interface IMovieListProps {
    moviesData: IMovieInfo[] | null;
}

interface IMovieListState {
    list: IMovieInfo[] | null;
}

export default class MovieList extends Component<IMovieListProps, IMovieListState> {

    state: IMovieListState = {
        list: this.props.moviesData,
    }

    componentDidUpdate(prevProps: IMovieListProps) {
        if(this.props.moviesData !== prevProps.moviesData ) {
            this.setState({
                list: this.props.moviesData,
            })
        }
    }

    render() {
        const { list } = this.state;

        const movies = list
            ? list.map(movieInfo => <MovieCard {...movieInfo} key={ Date.now() + Number(Math.random().toFixed(4)) } />)
            : null;

        return(
            <>
                { movies }
            </>
        );
    }
}