import L, { PointTuple } from 'leaflet';

export const createCustomIcon = (
    url: string,
    size: PointTuple,
    iconAnchor: PointTuple
) =>
    new L.Icon({
        iconUrl: url,
        iconSize: size,
        iconAnchor: iconAnchor,
    });

export const MarkerIcon = createCustomIcon('/marker.svg', [32, 32], [16, 32]);
export const CircleIcon = createCustomIcon(
    '/circle-outline-with-dot.svg',
    [16, 16],
    [4, 8]
);
export const TrainWithMarkerIcon = createCustomIcon(
    '/train-with-marker.svg',
    [32, 32],
    [16, 32]
);

export const availableIcons = [MarkerIcon, CircleIcon, TrainWithMarkerIcon];

export const Circle = () => {
    return;
};
