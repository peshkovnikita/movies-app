import { Component } from 'react';
import MovieCard from '../movie-card/movie-card';
import { Alert } from 'antd';

interface IMovieInfo {
    id: number
}

interface IMovieListProps {
    moviesData: IMovieInfo[] | null;
    moviesFlag: number;
}

interface IMovieListState {
    list: IMovieInfo[] | null;
    flag: number;
}

export default class MovieList extends Component<IMovieListProps, IMovieListState> {

    state: IMovieListState = {
        list: this.props.moviesData,
        flag: this.props.moviesFlag
    }

    componentDidUpdate(prevProps: IMovieListProps) {
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
            ? list.map(movieInfo => <MovieCard {...movieInfo} key={ Date.now() + Number(Math.random().toFixed(4)) } />)
            : null;

        return(
            <>
                { flag < 0 ? alertNotFound : flag > 0 ? movies : alertInfo }
            </>
        );
    }
}