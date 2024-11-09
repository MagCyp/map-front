'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DraggablePolyline from '@/components/draggablePolyline';
import ExpandedSegment from '@/components/ExpandedSegment';
import ContextMenu from '@/components/contextMenu';
import Search from '@/components/search';
import { availableIcons, MarkerIcon } from '@/components/markers';
import Image from 'next/image';

//TODO: add poi

const Map: React.FC = () => {
    //map
    const mapRef = useRef<L.Map>(null);
    const [mapCenter, setMapCenter] = useState<LatLng>([50.4501, 30.5234]);
    const [mapDragging, setMapDragging] = useState<boolean>(true);

    //choosable options
    const [routingType, setRoutingType] = useState<string>('pedestrian');
    const [isRouting, setIsRouting] = useState<boolean>(false);
    const [markerIcon, setMarkerIcon] = useState<L.Icon>(MarkerIcon);

    //all polyline markers
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [hoveredMarkerIndex, setHoveredMarkerIndex] = useState<number | null>(
        null
    );

    //all polyline segments with name, description, photos and POIs
    const [segments, setSegments] = useState<SegmentType[]>([]);
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(0);

    const [contextMenu, setContextMenu] = useState<{
        latLng: LatLng;
        x: number;
        y: number;
    } | null>(null);

    const markerRef = useRef<L.Marker>(null);

    const handleMarkerMouseOver = (index: number) => {
        setHoveredMarkerIndex(index);
    };

    const handleMarkerMouseOut = () => {
        setHoveredMarkerIndex(null);
    };

    const handleMarkerDelete = (type: string) => {
        if (hoveredMarkerIndex === null) {
            return;
        }

        const updatedMarkers = [...markers];
        const updatedSegments = [...segments];

        updatedMarkers.splice(hoveredMarkerIndex, 1);

        if (segments.length > 1) {
            if (hoveredMarkerIndex === updatedSegments.length) {
                updatedSegments.splice(updatedSegments.length - 1, 1);
            } else if (hoveredMarkerIndex === 0) {
                updatedSegments.splice(0, 1);
            } else {
                const firstPart = updatedSegments[hoveredMarkerIndex - 1];
                const secondPart = updatedSegments[hoveredMarkerIndex];
                let mergedSegment: SegmentType = {
                    start: firstPart.start,
                    end: secondPart.end,
                    breakpoints: [],
                    isRouting: false,
                    name: '',
                    description: '',
                    poi: [],
                };

                if (type === 'backspace') {
                    mergedSegment = {
                        start: firstPart.start,
                        end: secondPart.end,
                        breakpoints: [
                            ...firstPart.breakpoints,
                            ...secondPart.breakpoints,
                        ],

                        isRouting: firstPart.isRouting || secondPart.isRouting,
                        name: firstPart.name || secondPart.name,
                        description:
                            firstPart.description || secondPart.description,
                        poi: [
                            ...(firstPart.poi || []),
                            ...(secondPart.poi || []),
                        ],
                    };
                }

                updatedSegments.splice(
                    hoveredMarkerIndex - 1,
                    2,
                    mergedSegment
                );
            }
        } else {
            updatedSegments.length = 0;
        }

        setMarkers(updatedMarkers);
        setSegments(updatedSegments);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                handleMarkerDelete('delete');
                setHoveredMarkerIndex(null);
            } else if (e.key === 'Backspace') {
                handleMarkerDelete('backspace');
                setHoveredMarkerIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredMarkerIndex, markers, segments]);

    const addMarker = (pos: LatLng) => {
        setMarkers(prev => [...prev, { position: pos, icon: markerIcon }]);

        if (markers.length >= 1) {
            setSegments(prev => [
                ...prev,
                {
                    start: markers[markers.length - 1].position,
                    end: pos,
                    isRouting: isRouting,
                    breakpoints: [],
                },
            ]);
        }
    };

    //place marker
    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!mapDragging) return;
        if (e.originalEvent.defaultPrevented) return;

        const { lat, lng } = e.latlng;

        addMarker([lat, lng]);
    };

    const handleAddPOI = (poi: POIType) => {
        setSegments(prev => {
            const updatedSegments = [...prev];
            const segment = updatedSegments[selectedSegmentIndex];

            if (!segment?.poi) {
                segment.poi = [];
            }

            segment.poi.push(poi);

            return updatedSegments;
        });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    //open contextmenu
    const handleMapRightClick = (e: L.LeafletMouseEvent) => {
        const mapElement = e.target.getContainer();
        const { clientX, clientY } = e.originalEvent;

        const rect = mapElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setContextMenu({
            latLng: [e.latlng.lat, e.latlng.lng],
            x: x,
            y: y,
        });
    };

    //all map click events
    const MapClickHandler: React.FC = () => {
        useMapEvent('contextmenu', handleMapRightClick);
        useMapEvent('click', handleMapClick);
        return null;
    };

    const handleMarkerDragEnd = (e: L.LeafletEvent, index: number) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();

        setMarkers(prevMarkers => {
            const updatedMarkers = [...prevMarkers];
            updatedMarkers[index].position = [lat, lng];
            return updatedMarkers;
        });

        if (segments) {
            setSegments(prevSegments => {
                const updatedSegments = [...prevSegments];

                if (index === 0) {
                    updatedSegments[0].start = [lat, lng];
                } else if (index === markers.length - 1) {
                    updatedSegments[updatedSegments.length - 1].end = [
                        lat,
                        lng,
                    ];
                } else {
                    updatedSegments[index - 1].end = [lat, lng];
                    updatedSegments[index].start = [lat, lng];
                }

                return updatedSegments;
            });
        }
    };

    useEffect(() => {
        if (mapRef.current) {
            if (mapDragging) {
                mapRef.current.dragging.enable();
            } else {
                mapRef.current.dragging.disable();
            }
        }
    }, [mapDragging]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.flyTo(mapCenter);
        }
    }, [mapCenter]);

    return (
        <div style={{ padding: '10px' }}>
            {/* <div style={{ margin: '10px' }}>
                <label>
                    <input
                        type='radio'
                        value='auto'
                        checked={routingType === 'auto'}
                        onChange={() => setRoutingType('auto')}
                    />
                    Автомобіль
                </label>
                <label>
                    <input
                        type='radio'
                        value='bicycle'
                        checked={routingType === 'bicycle'}
                        onChange={() => setRoutingType('bicycle')}
                    />
                    Велосипед
                </label>
                <label>
                    <input
                        type='radio'
                        value='pedestrian'
                        checked={routingType === 'pedestrian'}
                        onChange={() => setRoutingType('pedestrian')}
                    />
                    Пішки
                </label>
            </div> */}
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                }}
            ></div>
            <div
                style={{
                    display: 'flex',
                    height: '65vh',
                    flexDirection: 'row',
                }}
            >
                <MapContainer
                    center={mapCenter}
                    zoom={16}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                    }}
                    ref={mapRef}
                >
                    <TileLayer
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {markers &&
                        markers.map((marker, index) => (
                            <Marker
                                key={index}
                                position={marker.position}
                                draggable
                                title={`${index}, ${markers[index].position}`}
                                eventHandlers={{
                                    dragend: e => handleMarkerDragEnd(e, index),
                                    mouseover: () =>
                                        handleMarkerMouseOver(index),
                                    mouseout: handleMarkerMouseOut,
                                }}
                                icon={marker.icon}
                            />
                        ))}
                    {segments.map((segment, index) => (
                        <DraggablePolyline
                            key={index}
                            onDrag={setMapDragging}
                            segment={segment}
                            isSelected={selectedSegmentIndex === index}
                            setSegmentBreakPoints={points => {
                                setSegments(prev => {
                                    const updatedSegments = [...prev];

                                    updatedSegments[index] = {
                                        ...updatedSegments[index],
                                        breakpoints: points,
                                    };

                                    return updatedSegments;
                                });
                            }}
                        />
                    ))}

                    {contextMenu && (
                        <Marker position={contextMenu.latLng} ref={markerRef} />
                    )}
                    {segments.length > 0 &&
                        segments.map(
                            segment =>
                                segment.poi &&
                                segment.poi.map(p => (
                                    <Marker
                                        key={`${p.position[0]}-${p.position[1]}`}
                                        position={p.position}
                                        icon={p.icon}
                                    />
                                ))
                        )}

                    <MapClickHandler />
                </MapContainer>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '50%',
                        overflow: 'auto',
                        height: '100%',
                    }}
                >
                    {segments.map((segment, index) => (
                        <ExpandedSegment
                            key={index}
                            segment={segment}
                            setSegment={newSegment =>
                                setSegments(prev => {
                                    const updatedSegments = [...prev];
                                    updatedSegments[index] = newSegment;
                                    return updatedSegments;
                                })
                            }
                            setSelectedSegmentIndex={() =>
                                setSelectedSegmentIndex(index)
                            }
                            isSelected={selectedSegmentIndex === index}
                        />
                    ))}
                </div>
            </div>
            {contextMenu && (
                <ContextMenu
                    markerPosition={contextMenu.latLng}
                    position={[contextMenu.y, contextMenu.x]}
                    closeContextMenu={closeContextMenu}
                    onAddPOI={handleAddPOI}
                    markerRef={markerRef}
                    disabled={segments.length <= 0}
                />
            )}
            <div style={{ width: '60%', height: '100%' }}>
                <p style={{ fontSize: '15px', fontWeight: 'bold' }}>delete: </p>
                <p
                    style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                    }}
                >
                    when hovered marker - will delete marker & make clear merged
                    segment
                </p>
                <p
                    style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                    }}
                >
                    when hovered breakpoint - will delete all breakpoints in
                    current segment
                </p>
                <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    backspace:
                </p>
                <p
                    style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                    }}
                >
                    when hovered marker - will delete marker and merge segments
                </p>
                <p
                    style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                    }}
                >
                    when hovered breakpoint - will delete hovered breakpoint
                </p>

                <Search setMapCenter={setMapCenter} addMarker={addMarker} />
                <div style={{ margin: '10px' }}>
                    <label>
                        <input
                            type='radio'
                            value='auto'
                            checked={isRouting}
                            onChange={() => setIsRouting(true)}
                        />
                        with auto routing
                    </label>
                    <label>
                        <input
                            type='radio'
                            value='auto'
                            checked={!isRouting}
                            onChange={() => setIsRouting(false)}
                        />
                        without auto routing
                    </label>
                </div>
                <div style={{ margin: '10px' }}>
                    {availableIcons.map((icon, index) => (
                        <label key={index}>
                            <input
                                type='radio'
                                value='auto'
                                checked={markerIcon === icon}
                                onChange={() => setMarkerIcon(icon)}
                            />
                            <Image
                                src={icon.options.iconUrl}
                                alt={icon.options.iconUrl}
                                width={32}
                                height={32}
                            />
                        </label>
                    ))}
                </div>
            </div>
            <button onClick={() => console.log(segments)}>
                aaaaaaaaa debug
            </button>
        </div>
    );
};

export default Map;
