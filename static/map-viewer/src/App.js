import React, {useEffect, useState} from 'react';
import Select from '@atlaskit/select';

import MapComponent from "./MapComponent";
import AddressSelect from "./AddressSelect";
import AlertDialog from "./AlertDialog";

import cloneDeep from 'lodash.clonedeep';

import './style.css'
import 'material-design-icons'
import JiraApi from "./modal/JiraApi";
import Utils from "./modal/Utils";

function App() {

    const TravelModes = {BICYCLING: 'BICYCLING', DRIVING: 'DRIVING', TRANSIT: 'TRANSIT', WALKING: 'WALKING'}

    const [center, setCenter] = useState({lat: 40.758896, lng: -73.985130})
    const [data, setData] = useState({
        origin: null,
        destination: null,
        distance: null,
        duration: null,
        travelMode: TravelModes.DRIVING,
        waypoints: [],
        current: null
    })
    const [current, setCurrent] = useState(null)

    const [errorCode, setErrorCode] = useState(null)
    const [alertOpen, setAlertOpen] = useState(null)

    const [state, setState] = useState("LOADING")

    useEffect(() => {
        JiraApi.getLocationData()
            .then(v => {
                setState("LOADED")
                v && setData(v)
            })
            .catch(_ => {
                setState("FIELD_UNAVAILABLE")
            })
    }, [])

    useEffect(() => {
        JiraApi.saveLocationData(data).catch(_ => showError("UPDATE_FIELD_ERROR"))
    }, [data])

    const showError = (e) => {
        setErrorCode(e)
        setAlertOpen(true)
    }

    const handleCenterChanged = (center) => {
        setCenter(center)
    }

    const handleRouteChanged = async (direction) => {
        setData(direction)
    }

    const handleUpdateCurrentLocation = () => {
        if (!window.navigator.geolocation) {
            showError("GEOLOCATION_NOT_SUPPORTED")
            return
        }

        window.navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCurrent({lat, lng})
        }, () => {
            showError("GEOLOCATION_PERMISSION_DENIED")
        });
    }

    const handleOnMapError = (e) => showError(e)

    function setOrigin(v) {
        const res = cloneDeep(data)
        res.origin = v
        setData(res)
    }

    function setDestination(v) {
        const res = cloneDeep(data)
        res.destination = v
        setData(res)
    }

    function setTravelMode(v) {
        if (v === 'TRANSIT' && data.waypoints.length) {
            showError("TRAVEL_MODE_TRANSIT_ERROR")
            return
        }
        const res = cloneDeep(data)
        res.travelMode = v
        setData(res)
    }

    function handleAlertAction(action) {
        if (action === "DELETE_WAYPOINTS_SET_TM_TRANSIT") {
            const d = cloneDeep(data)
            d.waypoints = [];
            d.travelMode = TravelModes.TRANSIT
            setData(d)
        }
        setAlertOpen(false)
    }

    function renderDetails() {
        if (!(data.origin && data.destination)) {
            return;
        }

        return (
            <table>
                <tbody>
                <tr>
                    <th>Origin</th>
                    <td>{data.origin.address || `lat: ${data.origin.location.lat}, lng: ${data.origin.location.lng}`}</td>
                </tr>
                <tr>
                    <th>Destination</th>
                    <td>{data.destination.address || `lat: ${data.destination.location.lat}, lng: ${data.destination.location.lng}`}</td>
                </tr>
                <tr>
                    <th>Travel Mode</th>
                    <td>{data.travelMode}</td>
                </tr>
                <tr>
                    <th>Distance / Duration</th>
                    <td>{data.distance?.text} / {data.duration?.text}</td>
                </tr>
                </tbody>
            </table>
        )
    }

    function renderCurrent() {
        if (!data || !data.current) {
            return
        }

        let current = data.current

        return (
            <table>
                <tbody>
                <tr>
                    <th>Current Location</th>
                    <td>{current.address || `lat: ${current.location.lat}, lng: ${current.location.lng}`}</td>
                </tr>
                { current.destinationReached
                    ? <>
                        <tr>
                            <th className="text-center" colSpan={2}>Destination Reached on <i>{ Utils.getHumanDate(current.timestamp) }</i></th>
                        </tr>
                    </>
                    : <>
                        <tr>
                            <th>Distance / Duration Remaining</th>
                            <td>{current.distance?.text || 'None'} / {current.duration?.text || 'None'}</td>
                        </tr>
                        <tr>
                            <th>Reached On</th>
                            <td>{ Utils.getHumanDate(current.timestamp) }</td>
                        </tr>
                    </>
                }
                </tbody>
            </table>
        )
    }

    if (state === "LOADING") {
        return (<p className="text-center">Loading...</p>)
    }

    if (state === "FIELD_UNAVAILABLE") {
        return (<p className="text-center">Location tracker field is available for this app to function. Please add Location Tracker field to this issue.</p>)
    }

    return (
        <div className="container">
            <MapComponent
                route={data}
                center={center}
                readonly={false}
                current={current}

                onCenterChanged={handleCenterChanged}
                onRouteChanged={handleRouteChanged}
                onError={handleOnMapError}
            />
            <div className="row mt-15">
                <div className="col">
                    <AddressSelect
                        label="Origin"
                        inputId="select-from"
                        selectedItem={data && data.origin}
                        setCenter={setCenter}
                        center={center}
                        onError={(e) => showError(e)}
                        onChange={(v) => setOrigin(v)} />
                </div>
                <div className="col">
                    <AddressSelect
                        label="Destination"
                        inputId="select-destination"
                        selectedItem={data && data.destination}
                        setCenter={setCenter}
                        center={center}
                        onError={(e) => showError(e)}
                        onChange={(v) => setDestination(v)} />
                </div>
                <div className="col">
                    <div>
                        <label htmlFor="select-travel-mode">Travel Mode</label>
                        <Select
                            readonly
                            value={{label: data.travelMode, value: data.travelMode}}
                            inputId="select-travel-mode"
                            options={Object.keys(TravelModes).map(v => ({label: v, value: v}))}
                            onChange={(e) => setTravelMode(e.value)}
                            placeholder="Select Travel Mode"
                        />
                    </div>
                </div>
            </div>
            <div className="row mt-15">
                <div className="col">
                    { renderDetails() }
                </div>
                <div className="col">
                    { renderCurrent() }

                    {/*{ data.current && !data.current.destinationReached &&
                    <div className="update-current-location-btn">
                        <Button
                            iconBefore={<span className="material-icons">my_location</span>}
                            onClick={handleUpdateCurrentLocation}
                        >Update Current Location</Button>
                    </div>
                    }*/}
                </div>
            </div>
            <AlertDialog errorCode={errorCode} isOpen={alertOpen} onAction={handleAlertAction} onClose={() => setAlertOpen(false)}/>
        </div>
    );
}

export default App;



