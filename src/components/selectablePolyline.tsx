import { FC, useEffect, useRef } from 'react';
import { Polyline } from 'react-leaflet';

const SelectablePolyline: FC<{ isSelected: boolean; position: LatLng[] }> = ({
    isSelected,
    position,
}) => {
    const polylineRef = useRef<L.Polyline | null>(null);

    useEffect(() => {
        if (polylineRef.current) {
            const element = polylineRef.current.getElement();
            if (element) {
                if (isSelected) element.classList.add('selected');
                else element.classList.remove('selected');
            }
        }
    }, [isSelected]);

    return (
        <Polyline
            ref={ref => {
                polylineRef.current = ref;
            }}
            positions={position}
            weight={3}
            dashArray='6'
            className='disabled'
        />
    );
};

export default SelectablePolyline;
