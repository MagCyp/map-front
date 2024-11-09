type LatLng = [number, number];

type MarkerType = {
    position: LatLng;
    icon: L.Icon;
};

type CustomMarkerType = {
    url: string;
    size: L.PointTuple;
    iconAnchor: L.PointTuple;
};

type IconOptionsType = {
    value: string;
    component: CustomMarkerType;
};

type POIType = {
    position: LatLng;
    name?: string;
    description?: string;
    photoUrl?: string[];
    icon: L.Icon;
};

type SegmentType = {
    start: LatLng;
    end: LatLng;
    breakpoints: LatLng[];
    isRouting: boolean;
    name?: string;
    description?: string;
    poi?: POIType[];
};

type RouteType = {
    start: LatLng;
    end: LatLng;
    decodedShape: LatLng[];
};
