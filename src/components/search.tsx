import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import axios from 'axios';

const url = 'https://nominatim.openstreetmap.org/search.php';

interface Props {
    setMapCenter: (center: LatLng) => void;
    addMarker: (pos: LatLng) => void;
}

const Search: React.FC<Props> = ({ setMapCenter, addMarker }) => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
    const [isSearchPaused, setIsSearchPaused] = useState<boolean>(false);

    const onSearch = async (nextValue: string) => {
        const response = await axios.get(url, {
            params: {
                q: nextValue,
                format: 'jsonv2',
            },
        });

        return response.data;
    };

    const debouncedSearch = useCallback(
        debounce(async (nextValue: string) => {
            if (nextValue && !isSearchPaused) {
                const searchResults = await onSearch(nextValue);
                setResults(searchResults);
                setIsDropdownVisible(true);
            } else {
                setResults([]);
                setIsDropdownVisible(false);
            }
        }, 500),
        [isSearchPaused]
    );

    useEffect(() => {
        if (!isSearchPaused) {
            debouncedSearch(query);
        }

        return () => {
            debouncedSearch.cancel();
        };
    }, [query, debouncedSearch]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        event.preventDefault();
        setIsSearchPaused(false);
        setQuery(event.target.value);
    };

    const handleMoveToClick = (event: React.MouseEvent, result: any) => {
        stopPropagation(event);
        setMapCenter([result.lat, result.lon]);
        setQuery(result.display_name);
        setResults([]);
        setIsSearchPaused(true);
        setIsDropdownVisible(false);
    };

    const handleSetMarkerClick = (event: React.MouseEvent, result: any) => {
        stopPropagation(event);
        setMapCenter([result.lat, result.lon]);
        addMarker([result.lat, result.lon]);
        setQuery(result.display_name);
        setResults([]);
        setIsSearchPaused(true);
        setIsDropdownVisible(false);
    };

    const stopPropagation = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '50%',
                zIndex: 1000,
            }}
            onClick={stopPropagation}
        >
            <input
                type='text'
                value={query}
                onChange={handleChange}
                placeholder='Search...'
                style={{
                    width: '100%',
                    height: '40px',
                    padding: '10px',
                    fontSize: '16px',
                }}
            />
            {isDropdownVisible && (
                <ul
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        zIndex: 1000,
                        listStyleType: 'none',
                        margin: 0,
                        padding: 0,
                    }}
                    onClick={stopPropagation}
                >
                    {results.length > 0 ? (
                        results.map((result, index) => (
                            <li
                                key={index}
                                onMouseDown={stopPropagation}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span>{result.display_name}</span>
                                <div>
                                    <button
                                        onClick={event =>
                                            handleMoveToClick(event, result)
                                        }
                                        style={{
                                            marginRight: '10px',
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Move To
                                    </button>
                                    <button
                                        onClick={event =>
                                            handleSetMarkerClick(event, result)
                                        }
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Set Marker & Move To
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                fontWeight: 'bold',
                                fontSize: '24px',
                            }}
                        >
                            Nothing found
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Search;
