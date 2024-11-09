import axios from 'axios';

export const getRoute = async (markers: LatLng[]) => {
    const routingApiUrl = 'https://valhalla1.openstreetmap.de/route?json=';
    const params = {
        locations: [
            ...markers.map(marker => ({
                latLng: {
                    lat: marker[0],
                    lng: marker[1],
                },
                options: { allowUTurn: false },
                lat: marker[0],
                lon: marker[1],
            })),
        ],
        costing: 'pedestrian',
        directions_options: { language: 'en-US' },
    };
    try {
        const response = await axios.get(
            routingApiUrl + encodeURIComponent(JSON.stringify(params))
        );

        return response.data;
    } catch (err) {
        console.error(err);
    }
};
