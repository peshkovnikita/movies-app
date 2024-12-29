import React, { Component } from 'react';
import { format, parseISO } from 'date-fns';
import { StarFilled } from '@ant-design/icons'; //??????????
import { Rate } from 'antd';
import './movie-card.css';

export default class MovieCard extends Component{

    _posterPath = 'https://media.themoviedb.org/t/p/w220_and_h330_face';

    sliceDesc(str) {
        if(str.length > 210) {
            const sliced = str.slice(0, 210);
            return `${sliced}...`;
        }
        return str;
    }

    sliceTitle(str) {
        if(str.length > 33) {
            const sliced = str.slice(0, 33);
            return `${sliced}...`;
        }
        return str;
    }

    render() {
        const { title, poster_path, vote_average, release_date, overview, genres } = this.props

        return(
            <li className='card'>
                <img className='movie-poster' src={`${this._posterPath}${poster_path}`} loading='lazy' alt='poster'/>
                <div className='title'>
                    <p>{ this.sliceTitle(title) }</p>
                </div>
                <div className='rating'>
                    <div className='rating-circle'>
                        <span>{ vote_average.toFixed(1) }</span>
                    </div>
                </div>
                <div className='info'>
                    <p className='date'>{ release_date ? format(parseISO(release_date), 'MMMM d, y') : null }</p>
                    <div className='genres'>
                        {genres.length ? genres.map(genre => <span key={genre.id}>{genre.name}</span>) : null}
                    </div>
                </div>
                <p className='desc'>{ overview ? this.sliceDesc(overview) : null }</p>
                <div className='stars'>
                    <div className='stars-container'>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                        <StarFilled className='star-item'></StarFilled>
                    </div>
                </div>
            </li>
        )
    }
}