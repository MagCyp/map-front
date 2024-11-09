import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Image from 'next/image';
import { availableIcons, createCustomIcon } from './markers';

const ContextMenu: React.FC<{
    markerPosition: LatLng;
    position: [number, number];
    onAddPOI: (poi: POIType) => void;
    closeContextMenu: () => void;
    markerRef: React.RefObject<L.Marker>;
    disabled: boolean;
}> = ({
    markerPosition,
    position,
    closeContextMenu,
    onAddPOI,
    markerRef,
    disabled,
}) => {
    const [poiName, setPoiName] = useState<string>('');
    const [selectedIcon, setSelectedIcon] = useState<L.Icon>(availableIcons[0]);
    const [height, setHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleAddPOI = () => {
        onAddPOI({
            position: markerPosition,
            name: poiName,
            icon: selectedIcon,
        });
        closeContextMenu();
    };

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setIcon(selectedIcon);
        }
    }, [markerRef, selectedIcon]);

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    }, []);

    const handleIconChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value);

        setSelectedIcon(availableIcons[index]);
    };

    return (
        <div
            ref={ref}
            style={{
                position: 'absolute',
                top: position[0] - height,
                left: position[1],
                backgroundColor: 'white',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                padding: '10px',
                borderRadius: '5px',
            }}
        >
            {!disabled ? (
                <>
                    <h3>Add POI</h3>
                    <input
                        type='text'
                        placeholder='Назва POI'
                        value={poiName}
                        onChange={e => setPoiName(e.target.value)}
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            width: '100%',
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <select
                            onChange={handleIconChange}
                            style={{
                                display: 'block',
                                marginBottom: '5px',
                                width: '100%',
                            }}
                            value={availableIcons
                                .findIndex(icon => icon === selectedIcon)
                                .toString()}
                        >
                            {availableIcons.map((icon, index) => (
                                <option
                                    key={icon.options.iconUrl}
                                    value={index}
                                >
                                    {icon.options.iconUrl}
                                </option>
                            ))}
                        </select>
                        <div
                            style={{ marginBottom: '5px', marginLeft: '10px' }}
                        >
                            <Image
                                src={selectedIcon.options.iconUrl}
                                alt='Selected Icon'
                                width={24}
                                height={24}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddPOI}
                        style={{ marginRight: '5px' }}
                    >
                        Add
                    </button>{' '}
                </>
            ) : (
                <h4>Please choose segment</h4>
            )}
            <button onClick={closeContextMenu}>Close</button>
        </div>
    );
};

export default ContextMenu;
