import React, { FC } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface Props {
    position: LatLng;
    setPosition: (position: LatLng) => void;
    icon?: L.Icon;
    eventHandlers?: {
        [event: string]: (event: L.LeafletEvent) => void;
    };
}

const MovableMarker: FC<Props> = ({
    position,
    setPosition,
    icon,
    eventHandlers,
}) => {
    const handleMarkerDragEnd = (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const newPosition = marker.getLatLng();
        setPosition([newPosition.lat, newPosition.lng]);
    };

    return (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend: handleMarkerDragEnd,
                ...eventHandlers,
            }}
            icon={icon}
        />
    );
};

export default MovableMarker;
