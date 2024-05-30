import {useEffect, useState} from "react";
import "./App.css";
import _ from "lodash";
import { url } from "inspector";

interface Movie {
    title: string;
    releaseDate: Date;
    opening_crawl: string;
    director: string;
    producer: string;
    charactersUrls: string[];
}

interface Character {
    name: string;
    height: number;
    mass: number;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
}

function CharacterModal({name, height, mass, hair_color, skin_color, eye_color, birth_year}: Character): JSX.Element {
    return (
        <div className='character'>
            <h1>{name}</h1>
            <p>{height}</p>
            <p>{mass}</p>
            <p>{hair_color}</p>
            <p>{skin_color}</p>
            <p>{eye_color}</p>
            <p>{birth_year}</p>
        </div>
    );
}
const characterIdToCharacter: Map<number, Character> = new Map();
function MovieCard({movie}: {movie: Movie}): JSX.Element {
    const [characters, setCharacters] = useState<Character[]>([]);
    useEffect(() => {
        movie.charactersUrls.forEach(characterUrl => {
            function getCharacterUrlId(characterURL: string): number {
                const urlParts = characterUrl.split("/");
                return parseInt(urlParts.at(-2) ?? "0");
            }
            async function fetchAdditionalCharacter(characterId: number) {
                if (!characterIdToCharacter.has(characterId)) {
                    const response = await fetch(characterUrl);
                    const character: Character = await response.json();
                    characterIdToCharacter.set(characterId, character);
                }
                setCharacters([...characters, characterIdToCharacter.get(characterId)!]);
            }
            fetchAdditionalCharacter(getCharacterUrlId(characterUrl));
        });
    }, []);
    console.log(movie.title, characters.length);
    return (
        <div className='movie'>
            <h2>{movie.title}</h2>
            <p>{movie.releaseDate.toDateString()}</p>
            <p>{movie.opening_crawl}</p>
            <p>{movie.director}</p>
            <p>{movie.producer}</p>
            <ul>
                {characters.map((character, index) => (
                    <li key={index} value={character.name}>{character.name}</li>
                ))}
            </ul>
        </div>
    );
}

function MovieGrid({movies}: {movies: Movie[]}): JSX.Element {
    return (
        <div>
            <div className='movieGrid'>
                {movies.map(movie => (
                    <div className='movieCard'>
                        <MovieCard movie={movie} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function App() {
    const [movies, setMovies] = useState<Movie[]>([]);
    useEffect(() => {
        async function fetchMovies() {
            const response = await fetch("https://swapi.dev/api/films/");
            const moviesData = await response.json();
            const movies: Movie[] = moviesData.results.map((film: any) => ({
                title: film.title,
                releaseDate: new Date(film.release_date),
                opening_crawl: film.opening_crawl,
                director: film.director,
                producer: film.producer,
                charactersUrls: film.characters,
            }));
            setMovies(movies);
        }
        fetchMovies();
    }, []);
    return (
        <div>
            <MovieGrid movies={movies} />
        </div>
    );
}

export default App;
