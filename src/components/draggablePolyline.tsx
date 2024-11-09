'use client';

import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { CircleIcon, MarkerIcon } from '@/components/markers';
import MovableMarker from './movableMarker';
import { decodePolyline } from '@/utils/decodePolyline';
import { getRoute } from '@/requests/getRoute';

const DraggablePolyline: React.FC<{
    segment: SegmentType;
    setSegmentBreakPoints: (points: LatLng[]) => void;
    onDrag: (v: boolean) => void;
    isSelected: boolean;
}> = ({ segment, onDrag, setSegmentBreakPoints, isSelected }) => {
    const map = useMap();
    const [dragging, setDragging] = useState<boolean>(false);
    const [dragMarker, setDragMarker] = useState<L.Marker | null>(null);
    const [dragMarkerPosition, setDragMarkerPosition] = useState<LatLng | null>(
        null
    );
    const [dragMarkerIndex, setDragMarkerIndex] = useState<{
        start: LatLng;
        end: LatLng;
        index: number;
    } | null>();
    const [routingShape, setRoutingShape] = useState<LatLng[][] | undefined>();
    const [hoveredBreakpointIndex, setHoveredBreakpointIndex] = useState<
        number | null
    >(null);

    const handleDeleteBreakpoint = () => {
        if (hoveredBreakpointIndex !== null) {
            const updatedBreakpoints = [...segment.breakpoints];
            updatedBreakpoints.splice(hoveredBreakpointIndex, 1);
            setSegmentBreakPoints(updatedBreakpoints);
        }
    };

    // Додаємо обробку клавіші Delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (hoveredBreakpointIndex !== null) {
                if (e.key === 'Backspace') {
                    handleDeleteBreakpoint();
                } else if (e.key === 'Delete') {
                    setSegmentBreakPoints([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredBreakpointIndex, segment.breakpoints]);

    useEffect(() => {
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleDragEnd);

        return () => {
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleDragEnd);
        };
        // };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, dragging]);

    const handleDragStart = (e: L.LeafletMouseEvent) => {
        console.log(`dragStart`);
        if (e.originalEvent.button !== 0) return;
        if (dragging) return;

        onDrag(false);
        setDragging(true);
        map.dragging.disable();
        document.body.classList.add('no-select');
        const latlng = e.latlng;
        const newMarker = L.marker(latlng, {
            draggable: true,
        });
        newMarker.setIcon(MarkerIcon);
        newMarker.addTo(map);
        setDragMarker(newMarker);
        setDragMarkerPosition([latlng.lat, latlng.lng]);
        e.originalEvent.stopPropagation();
    };

    useEffect(() => {
        const markers: LatLng[] = [
            segment.start,
            ...segment.breakpoints,
            segment.end,
        ];

        if (segment.isRouting) {
            const setData = async () => {
                const data: any | undefined = await getRoute(markers);

                if (data) {
                    const shapes: LatLng[][] = data.trip.legs.reduce(
                        (shape: any, leg: any) => {
                            const decodePolylineShape = decodePolyline(
                                leg.shape
                            );

                            shape.push([...decodePolylineShape]);

                            return shape;
                        },
                        []
                    );

                    setRoutingShape(shapes);
                }
            };

            setData();
        } else {
            setRoutingShape(
                markers.reduce(
                    (shape: LatLng[][], marker: LatLng, index: number) => {
                        if (index > 0) {
                            shape.push([markers[index - 1], marker]);
                        }
                        return shape;
                    },
                    []
                )
            );
        }
    }, [segment.start, segment.end, segment]);

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
        if (dragging && dragMarker) {
            const latlng = e.latlng;
            dragMarker.setLatLng(latlng);
            setDragMarkerPosition([latlng.lat, latlng.lng]);

            if (map) {
                const mapBounds = map.getBounds();
                const markerLatLng = dragMarker.getLatLng();
                const markerPoint = map.latLngToLayerPoint(markerLatLng);
                const mapPoint = map.latLngToLayerPoint(map.getCenter());
                const markerBounds = L.bounds(
                    markerPoint.subtract([10, 10]),
                    markerPoint.add([10, 10])
                );

                if (!mapBounds.contains(markerLatLng)) {
                    const offset = markerPoint.subtract(mapPoint);
                    map.panBy(offset.multiplyBy(-1), { animate: true });
                }
            }
        }
    };

    const handleDragEnd = (e: L.LeafletMouseEvent) => {
        if (e.originalEvent.button !== 0) return;
        if (dragging && dragMarker && dragMarkerIndex) {
            const latlng = dragMarker.getLatLng();

            const breakPoints = [...segment.breakpoints];

            const newLatLng: LatLng = [latlng.lat, latlng.lng];

            breakPoints.splice(dragMarkerIndex.index, 0, newLatLng);

            setSegmentBreakPoints(breakPoints);

            dragMarker.remove();
            setDragMarker(null);
            document.body.classList.remove('no-select');

            setTimeout(() => {
                setDragging(false);
                onDrag(true);
                setDragMarkerIndex(null);
            }, 10);
            setDragMarkerPosition(null);
        }
    };

    const handlePolylineMouseDown = (e: L.LeafletMouseEvent, index: number) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        handleDragStart(e);

        if (segment.breakpoints.length === 0) {
            setDragMarkerIndex({
                start: segment.start,
                end: segment.end,
                index: index,
            });
        } else if (index === 0) {
            setDragMarkerIndex({
                start: segment.start,
                end: segment.breakpoints[0],
                index: index,
            });
        } else if (routingShape && index === routingShape.length - 1) {
            setDragMarkerIndex({
                start: segment.breakpoints[segment.breakpoints.length - 1],
                end: segment.end,
                index: index,
            });
        } else {
            setDragMarkerIndex({
                start: segment.breakpoints[index - 1],
                end: segment.breakpoints[index],
                index: index,
            });
        }
    };

    useEffect(() => {
        console.log(hoveredBreakpointIndex);
    }, [hoveredBreakpointIndex]);

    return (
        <>
            {routingShape &&
                routingShape.map((shape, index) => (
                    <Polyline
                        key={index}
                        positions={shape}
                        weight={4}
                        dashArray='6'
                        pathOptions={{ color: isSelected ? 'red' : 'blue' }}
                        eventHandlers={{
                            mousedown: e => handlePolylineMouseDown(e, index),
                        }}
                    />
                ))}
            {dragMarkerPosition && dragMarkerIndex && dragging && (
                <>
                    <Polyline
                        positions={[dragMarkerIndex.start, dragMarkerPosition]}
                        color='gray'
                        weight={2}
                        dashArray='4'
                    />
                    <Polyline
                        positions={[dragMarkerIndex.end, dragMarkerPosition]}
                        color='gray'
                        weight={2}
                        dashArray='4'
                    />
                </>
            )}
            {segment.breakpoints.length > 0 &&
                segment.breakpoints.map((breakpoint, index) => (
                    <MovableMarker
                        key={index}
                        position={breakpoint}
                        setPosition={pos => {
                            const newBreakpoints = [...segment.breakpoints];
                            newBreakpoints[index] = pos;
                            setSegmentBreakPoints(newBreakpoints);
                        }}
                        eventHandlers={{
                            mouseover: () => setHoveredBreakpointIndex(index),
                            mouseout: () => setHoveredBreakpointIndex(null),
                        }}
                        icon={CircleIcon}
                    />
                ))}
        </>
    );
};

export default DraggablePolyline;
