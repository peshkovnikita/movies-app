import { Component } from 'react';
import { format, parseISO } from 'date-fns';
import { Rate } from 'antd';
import './movie-card.css';
import { GenresConsumer } from "../../services/genres-context";
import MdApi from "../../services/md-api";

interface IGenre {
    id: number,
    name: string
}

interface IMovieCardProps {
    id: number
    title: string
    poster_path: string | null
    vote_average: number
    release_date: string | null
    overview: string | null
    genre_ids: number[],
    rating?: number | unknown
}

export default class MovieCard extends Component<IMovieCardProps, object> {
    private posterBase: string = 'https://media.themoviedb.org/t/p/w220_and_h330_face';
    private fallbackImage: string = 'data:image/svg+xml,%3Csvg width=\'183\' height=\'275\' viewBox=\'0 0 183 275\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M156.668 85.1835H27.4691C26.2068 85.1835 25.1835 86.2068 25.1835 87.4691V186.531C25.1835 187.793 26.2068 188.817 27.4691 188.817H156.668C157.93 188.817 158.953 187.793 158.953 186.531V87.4691C158.953 86.2068 157.93 85.1835 156.668 85.1835ZM27.4691 78C22.2395 78 18 82.2395 18 87.4691V186.531C18 191.761 22.2395 196 27.4691 196H156.668C161.897 196 166.137 191.761 166.137 186.531V87.4691C166.137 82.2395 161.897 78 156.668 78H27.4691Z\' fill=\'%23CCCCCC\'/%3E%3Cpath d=\'M67.2383 112.169C67.2383 120.491 60.4919 127.237 52.1699 127.237C43.8479 127.237 37.1016 120.491 37.1016 112.169C37.1016 103.847 43.8479 97.1006 52.1699 97.1006C60.4919 97.1006 67.2383 103.847 67.2383 112.169Z\' fill=\'%23CCCCCC\'/%3E%3Cpath d=\'M37.1016 161.407L62.357 136.576L74.4541 149.097L114.566 109.41L146.612 142.094V176.475H37.1016V161.407Z\' fill=\'%23CCCCCC\'/%3E%3C/svg%3E%0A'

    private moviesApi = new MdApi()

    state = {
        rating: this.props.rating
    }

    sliceText = (str: string, length: number): string => {
        if (str.length > length) return `${str.slice(0, length)}...`
        return str
    }

    genresMatching = (ids: number[], genreTitles: IGenre[]): IGenre[] | null => {
        if(!genreTitles.length) return null
        return genreTitles
            .filter(genre => ids.includes(genre.id))
            .slice(0, 3)
    }

    async onRate(movieId: number, value: number, sessionId: string) {
        try {
            await this.moviesApi.rateMovie(movieId, value, sessionId)
            this.setState({ rating: value })
        }
        catch (err) {
            console.error(err.message)
        }
    }

    render() {
        const { id: movieId, title, poster_path, vote_average, release_date, overview, genre_ids } = this.props
        const ratingColor: string = vote_average > 7 ? '#66E900' : vote_average > 5 ? '#E9D100' : vote_average > 3 ? '#E97E00' : '#E90000'

        return (
            <GenresConsumer>
                {({ genresList, sessionId }) => {
                    return (
                        <li className='card'>
                            <img className='movie-poster'
                                 src={poster_path ? `${this.posterBase}${poster_path}` : `${this.fallbackImage}`}
                                 loading='lazy'
                                 alt='poster'
                            />
                            <div className='title'>
                                <p>{ this.sliceText(title, 33) }</p>
                            </div>
                            <div className='rating'>
                                <div className='rating-circle' style={{ borderColor: ratingColor }}>
                                    <span>{ vote_average.toFixed(1) }</span>
                                </div>
                            </div>
                            <div className='info'>
                                <p className='date'>{ release_date ? format(parseISO(release_date), 'MMMM d, y') : null }</p>
                                <ul className='genres'>
                                    { this.genresMatching(genre_ids, genresList).map(genre =>
                                        <li key={ genre.id }>{ genre.name }</li>
                                    )}
                                </ul>
                            </div>
                            <p className='desc'>{ overview ? this.sliceText(overview, 210) : null }</p>
                            <div className='stars-container'>
                                <Rate count={ 10 }
                                      value={ this.state.rating }
                                      onChange={ (value) => this.onRate(movieId, value, sessionId) }
                                      allowHalf
                                      disabled={ this.state.rating }
                                />
                            </div>
                        </li>
                    )
                }}
            </GenresConsumer>
        );
    }
}

