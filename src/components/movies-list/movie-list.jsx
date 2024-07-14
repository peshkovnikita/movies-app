import React from 'react';
import MovieCard from '../movie-card/movie-card.jsx';

export default function MovieList({ moviesData }) {
    const movies =
        moviesData ?
        moviesData.map(movieInfo => <MovieCard { ...movieInfo } key={movieInfo.id}/>)
        : null

    return(
        <>
            { movies }
        </>
    );
}