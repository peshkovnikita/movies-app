import React, { Component } from 'react';
import { format, parseISO } from 'date-fns';
import { Rate } from 'antd';
import './movie-card.css';

export default class MovieCard extends Component{

    _posterBase = 'https://media.themoviedb.org/t/p/w220_and_h330_face';

    _fallbackImage = 'data:image/svg+xml,%3Csvg width=\'183\' height=\'275\' viewBox=\'0 0 183 275\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M156.668 85.1835H27.4691C26.2068 85.1835 25.1835 86.2068 25.1835 87.4691V186.531C25.1835 187.793 26.2068 188.817 27.4691 188.817H156.668C157.93 188.817 158.953 187.793 158.953 186.531V87.4691C158.953 86.2068 157.93 85.1835 156.668 85.1835ZM27.4691 78C22.2395 78 18 82.2395 18 87.4691V186.531C18 191.761 22.2395 196 27.4691 196H156.668C161.897 196 166.137 191.761 166.137 186.531V87.4691C166.137 82.2395 161.897 78 156.668 78H27.4691Z\' fill=\'%23CCCCCC\'/%3E%3Cpath d=\'M67.2383 112.169C67.2383 120.491 60.4919 127.237 52.1699 127.237C43.8479 127.237 37.1016 120.491 37.1016 112.169C37.1016 103.847 43.8479 97.1006 52.1699 97.1006C60.4919 97.1006 67.2383 103.847 67.2383 112.169Z\' fill=\'%23CCCCCC\'/%3E%3Cpath d=\'M37.1016 161.407L62.357 136.576L74.4541 149.097L114.566 109.41L146.612 142.094V176.475H37.1016V161.407Z\' fill=\'%23CCCCCC\'/%3E%3C/svg%3E%0A'

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
                <img className='movie-poster'
                     src={poster_path ? `${this._posterBase}${poster_path}` : `${this._fallbackImage}`}
                     loading='lazy'
                     alt='poster'
                />
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
                    <ul className='genres'>
                        {genres.length
                            ? genres.map(genre => <li key={genre.id}>{ genre.name }</li>)
                            : null}
                    </ul>
                </div>
                <p className='desc'>{ overview ? this.sliceDesc(overview) : null }</p>
                <div className='stars-container'>
                    <Rate count={10} allowHalf />
                </div>
            </li>
        )
    }
}