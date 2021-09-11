import {DirectionsRenderer, GoogleMap, Marker} from "react-google-maps";
import React, {useEffect, useRef, useState} from "react";

import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';
import MapApi from "./modal/MapApi";
import Utils from "./modal/Utils";

function CustomMap(props) {
    const [directions, setDirections] = useState(undefined)
    const [route, setRoute] = useState(null)

    const map = useRef(null)
    const directionRenderer = useRef(null)

    useEffect(() => {
        if (isEqual(route, props.route)) {
            return;
        }

        if (!(props.route.origin && props.route.destination && props.route.travelMode)) {
            return
        }

        processDirectionService(props.route)
    }, [props.route])

    useEffect(() => {
        if (!props.current) {
            return
        }
        processCurrentLocationChange(props.current).then()
    }, [props.current])

    function processDirectionService({origin, destination, travelMode, waypoints}) {
        const DirectionsService = new window.google.maps.DirectionsService();
        DirectionsService.route({origin: origin.location, destination: destination.location, travelMode, waypoints}, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    processDirectionChange(result)
                } else {
                    if (status === "ZERO_RESULTS") status = "DIRECTION_NO_DATA"
                    props.onError && props.onError(status)
                }
            }
        );
    }

    const handleOnCenterChanged = () => {
        const center = map.current.getCenter()
        props.onCenterChanged && props.onCenterChanged({lat: center.lat(), lng: center.lng()})
    }

    const handleOriginChange = async (e) => {
        await processPartialDirectionChange("origin", e.latLng)
    }

    const handleDestinationChange = async (e) => {
        await processPartialDirectionChange("destination", e.latLng)
    }

    const processPartialDirectionChange = async (type, value) => {
        if (!props.route) {
            return
        }

        const data = cloneDeep(props.route)

        const res = await MapApi.getAddress(value.lat(), value.lng())
        data[type] = {
            address: res['formatted_address'],
            location: res['geometry']['location']
        }

        setRoute(data)
        props.onRouteChanged && props.onRouteChanged(data)
    }

    const processDirectionChange = direction => {
        setDirections(direction)

        const leg = direction["routes"][0]["legs"][0]

        let current = props.route.current;
        if (!current) {
            current = {
                address: leg.start_address,
                location: Utils.latLng2Obj(leg.start_location),
                distance: leg.distance,
                duration: leg.duration,
                destinationReached: false,
                timestamp: Utils.getTimestamp()
            }
        }

        const data = {
            origin: {address: leg.start_address, location: Utils.latLng2Obj(leg.start_location)},
            destination: {address: leg.end_address, location: Utils.latLng2Obj(leg.end_location)},
            distance: leg.distance,
            duration: leg.duration,
            travelMode: props.route.travelMode,
            waypoints: leg.via_waypoints.map(v => ({ location: Utils.latLng2Obj(v), stopover: false })),
            current: current
        }

        setRoute(data)
        props.onRouteChanged && props.onRouteChanged(data)
    }

    const processCurrentLocationChange = async (curr) => {
        const maps = window.google.maps
        const data = cloneDeep(props.route)

        const path = new maps.Polyline({ path: directions["routes"][0]["overview_path"] });
        const res1 = maps.geometry.poly.isLocationOnEdge(Utils.obj2LatLng(curr), path, 10e-4)
        if (res1) {
            const res = await MapApi.getAddress(curr.lat, curr.lng)
            const r = await MapApi.getRoute(curr, route.destination.location, route.travelMode)
            data.current = {
                address: res['formatted_address'],
                location: res['geometry']['location'],
                duration: r.duration,
                distance: r.distance,
                destinationReached: MapApi.isAroundLocation(curr, route.destination.location, 1500),
                timestamp: Utils.getTimestamp()
            }
        } else {
            props.onError && props.onError('CURRENT_LOCATION_OUT_OF_RANGE')
        }

        setRoute(data)
        props.onRouteChanged && props.onRouteChanged(data)
    }

    const handleOnDirectionsChanged = () => {
        const direction = directionRenderer.current.getDirections();
        processDirectionChange(direction)
    }

    const handleCurrentLocationChange = async (e) => {
        if (!props.route && directions) {
            return
        }

        const curr = Utils.latLng2Obj(e.latLng)
        await processCurrentLocationChange(curr)
    }

    return (
        <GoogleMap
            ref={ref => map.current = ref}
            center={props.center}
            onCenterChanged={handleOnCenterChanged}
            defaultZoom={12}
            defaultCenter={{lat: 40.758896, lng: -73.985130}}>

            {route?.current?.location && directions && <Marker label={"C"} onDragEnd={handleCurrentLocationChange} draggable={true} position={route.current.location} defaultZIndex={1} />}

            {directions && <DirectionsRenderer
                onDirectionsChanged={handleOnDirectionsChanged}
                ref={ref => directionRenderer.current = ref}
                options={{draggable: !props.readonly}}
                directions={directions}
                routeIndex={0} /> }

            {props.route?.origin && !directions && <Marker label={"A"} onDragEnd={handleOriginChange} draggable={!props.readonly} position={props.route.origin.location} />}
            {props.route?.destination && !directions && <Marker label={"B"} onDragEnd={handleDestinationChange} draggable={!props.readonly} position={props.route.destination.location} />}

        </GoogleMap>
    )
}

export default CustomMap