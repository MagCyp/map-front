// import axios from 'axios';
// import { useEffect, useState } from 'react';

// const url = 'https://nominatim.openstreetmap.org/reverse.php';

// const ExpandedSegment: React.FC<{
//     segments: SegmentType[];
//     setSegments: (segment: SegmentType) => void;
//     selectedSegment: { start: LatLng; end: LatLng; index: number } | undefined;
//     setSelectedSegment: React.Dispatch<
//         React.SetStateAction<{ start: LatLng; end: LatLng; index: number }>
//     >;
// }> = ({ segments, setSegments, selectedSegment, setSelectedSegment }) => {
//     const [addresses, setAddresses] = useState<{
//         [key: number]: { start: string; end: string };
//     }>({});

//     const handleDescriptionChange = (index: number, newDescription: string) => {
//         setSegments(prev => {
//             const newSegments = [...prev];
//             newSegments[index].description = newDescription;
//             return newSegments;
//         });
//     };

//     const handleSegmentClick = (start: LatLng, end: LatLng, index: number) => {
//         setSelectedSegment({ start, end, index });
//     };

//     useEffect(() => {
//         if (segments.length > 0 && selectedSegment === undefined) {
//             setSelectedSegment({
//                 start: segments[0].start,
//                 end: segments[0].end,
//                 index: 0,
//             });
//         }
//     }, [segments, selectedSegment, setSelectedSegment]);

//     const convertToAddress = async (position: LatLng) => {
//         const [lat, lon] = position;

//         try {
//             const response = await axios.get(url, {
//                 params: {
//                     lat: lat,
//                     lon: lon,
//                     format: 'jsonv2',
//                 },
//             });

//             const address = response.data.address;
//             const stringifyAddress = `${address.city || ''} ${
//                 address.borough || ''
//             } ${address.road || ''} ${address.house_number || ''}`;
//             return stringifyAddress;
//         } catch (error) {
//             console.error('Error fetching address:', error);
//             return null;
//         }
//     };

//     useEffect(() => {
//         const fetchAddresses = async () => {
//             const newAddresses: {
//                 [key: number]: { start: string; end: string };
//             } = {};
//             let previousEndAddress = '';

//             for (let i = 0; i < segments.length; i++) {
//                 const startAddress =
//                     i === 0
//                         ? await convertToAddress(segments[i].start)
//                         : previousEndAddress;

//                 const endAddress = await convertToAddress(segments[i].end);
//                 previousEndAddress = endAddress || 'Unknown';

//                 newAddresses[i] = {
//                     start: startAddress || 'Unknown',
//                     end: endAddress || 'Unknown',
//                 };
//             }

//             setAddresses(newAddresses);
//         };

//         fetchAddresses();
//     }, [segments]);

//     return (
//         <div>
//             {segments.map((segment, index) => (
//                 <div
//                     key={index}
//                     style={{
//                         marginBottom: '10px',
//                         cursor: 'pointer',
//                         backgroundColor:
//                             selectedSegment?.index === index
//                                 ? '#f0f0f0'
//                                 : 'white',
//                         border:
//                             selectedSegment?.index === index
//                                 ? '2px solid #007bff'
//                                 : '1px solid #ddd',
//                         padding: '10px',
//                         borderRadius: '5px',
//                     }}
//                     onClick={() =>
//                         handleSegmentClick(segment.start, segment.end, index)
//                     }
//                 >
//                     <p>
//                         <strong>Index {index + 1}:</strong>
//                     </p>
//                     <p>
//                         <strong>Start:</strong>{' '}
//                         {addresses[index]?.start || 'Loading...'}
//                     </p>
//                     <p>
//                         <strong>End:</strong>{' '}
//                         {addresses[index]?.end || 'Loading...'}
//                     </p>
//                     <textarea
//                         value={segment.description}
//                         onChange={e =>
//                             handleDescriptionChange(index, e.target.value)
//                         }
//                         placeholder='Додайте опис відрізка'
//                         style={{ width: '100%' }}
//                     />

//                     {segment.poi && Array.isArray(segment.poi) ? (
//                         segment.poi.map((p, poiIndex) => (
//                             <div key={poiIndex}>
//                                 <div
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '15px',
//                                     }}
//                                 >
//                                     <h5>name:</h5>
//                                     <p>{p?.name}</p>
//                                 </div>
//                                 <div
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '15px',
//                                     }}
//                                 >
//                                     <p>description</p>
//                                     <textarea>{p?.description}</textarea>
//                                 </div>
//                                 <div
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '15px',
//                                     }}
//                                 >
//                                     <p>photos</p>
//                                     <textarea>{p?.photoUrl}</textarea>
//                                 </div>
//                                 <p>
//                                     {p?.position[0] + '  |  ' + p?.position[1]}
//                                 </p>
//                             </div>
//                         ))
//                     ) : (
//                         <p>haven`t POI </p>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ExpandedSegment;
import axios from 'axios';
import { useEffect, useState } from 'react';

const url = 'https://nominatim.openstreetmap.org/reverse.php';

interface Props {
    segment: SegmentType;
    setSegment: (newSegment: SegmentType) => void;
    setSelectedSegmentIndex: () => void;
    isSelected: boolean;
}

const ExpandedSegment: React.FC<Props> = ({
    segment,
    setSegment,
    setSelectedSegmentIndex,
    isSelected,
}) => {
    const [address, setAddress] = useState<string[]>([]);
    const [editingName, setEditingName] = useState<boolean>(false);
    const [editingDescription, setEditingDescription] =
        useState<boolean>(false);
    const [name, setName] = useState<string>(segment.name || '');
    const [description, setDescription] = useState<string>(
        segment.description || ''
    );

    const handleSegmentClick = () => {
        setSelectedSegmentIndex();
    };

    const convertToAddress = async (position: LatLng) => {
        const [lat, lon] = position;

        try {
            const response = await axios.get(url, {
                params: {
                    lat: lat,
                    lon: lon,
                    format: 'jsonv2',
                },
            });

            const address = response.data.address;
            const stringifyAddress = `${address.city || ''}, ${
                address.borough || ''
            }, ${address.road || ''}, ${address.house_number || ''}`;
            return stringifyAddress;
        } catch (error) {
            console.error('Error fetching address:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            const startAddress = await convertToAddress(segment.start);
            const endAddress = await convertToAddress(segment.end);
            setAddress([startAddress || 'unknown', endAddress || 'unknown']);
        };

        fetchAddresses();
    }, [segment]);

    const handleEditNameClick = () => {
        setEditingName(true);
    };

    const handleEditDescriptionClick = () => {
        setEditingDescription(true);
    };

    const handleSaveNameClick = () => {
        setSegment({
            ...segment,
            name: name,
        });
        setEditingName(false);
    };

    const handleSaveDescriptionClick = () => {
        setSegment({
            ...segment,
            description: description,
        });
        setEditingDescription(false);
    };

    const handleCancelNameClick = () => {
        setName(segment.name || '');
        setEditingName(false);
    };

    const handleCancelDescriptionClick = () => {
        setDescription(segment.description || '');
        setEditingDescription(false);
    };

    return (
        <div
            onClick={handleSegmentClick}
            style={{
                border: isSelected
                    ? '1.5px solid black'
                    : '1px solid lightgray',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
            }}
        >
            {address && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h4>Start:</h4>
                        <h5>{address[0]}</h5>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h4>End:</h4>
                        <h5>{address[1]}</h5>
                    </div>
                </>
            )}

            {isSelected && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                    }}
                >
                    {editingName ? (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <label>
                                Name:
                                <input
                                    type='text'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </label>
                            <button onClick={handleSaveNameClick}>
                                Save Name
                            </button>
                            <button onClick={handleCancelNameClick}>
                                Cancel Name
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <h4>Name: {segment.name || 'N/A'}</h4>
                            <button onClick={handleEditNameClick}>
                                Edit Name
                            </button>
                        </div>
                    )}

                    {/* Edit Description */}
                    {editingDescription ? (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <label>
                                Description:
                                <textarea
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                />
                            </label>
                            <button onClick={handleSaveDescriptionClick}>
                                Save Description
                            </button>
                            <button onClick={handleCancelDescriptionClick}>
                                Cancel Description
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <p>Description: {segment.description || 'N/A'}</p>
                            <button onClick={handleEditDescriptionClick}>
                                Edit Description
                            </button>
                        </div>
                    )}
                </div>
            )}
            {segment.poi &&
                segment.poi.map((p, index) => (
                    <div key={index}>
                        <h3>POI {index}</h3>
                        <p>name:{p.name}</p>
                        <p>description:{p.description}</p>
                        <p>photos:{p.photoUrl}</p>
                    </div>
                ))}
        </div>
    );
};

export default ExpandedSegment;
