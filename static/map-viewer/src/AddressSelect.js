import React, {useEffect, useState} from "react";
import { AsyncSelect } from '@atlaskit/select';
import Tooltip from '@atlaskit/tooltip';
import MapApi from "./modal/MapApi";
import throttle from 'lodash.throttle';

const throttledGetAddress = throttle((func) => func(), 2500);

function AddressSelect(props) {
    const handleLoadOptions = (query) => {
        return new Promise(((resolve, reject) => {
            throttledGetAddress(async () => {
                if (!query) {
                    return resolve([])
                }

                try {
                    const res = await MapApi.searchAddress(query)
                    const options = res.map(v => {
                        return {
                            label: v['formatted_address'],
                            value: {
                                address: v['formatted_address'],
                                location: v['geometry']['location']
                            }
                        }
                    })
                    resolve(options)
                } catch (e) {
                    reject(e)
                }
            })
        }))
    }

    const handleOnChange = (e) => emitChange(e.value)

    const emitChange = (value) =>  {
        (props.onChange && value) && props.onChange(value)
        setSelectedItem({ label: value.address, value })
        props.setCenter(value.location)
    }

    const setLatLng = async (lat, lng) => {
        let value = {
            address: `lat: ${lat}, lng: ${lng}`,
            location: { lat, lng }
        }

        try {
            const res = await MapApi.getAddress(lat, lng)
            value = {
                address: res['formatted_address'],
                location: res['geometry']['location']
            }
        } catch (e) {
        }

        emitChange(value)
    }

    const handleCurrentLocationClick = () => {
        if (!window.navigator.geolocation) {
            props.onError && props.onError("GEOLOCATION_NOT_SUPPORTED")
            return
        }

        window.navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            await setLatLng(lat, lng)
        }, () => {
            props.onError && props.onError("GEOLOCATION_PERMISSION_DENIED")
        });
    }

    const handlePutMarkerClick = () => {
        const lat = props.center.lat;
        const lng = props.center.lng;
        setLatLng(lat, lng)
    }

    const [selectedItem, setSelectedItem] = useState(props.selectedItem && {label: props.selectedItem.address, value: props.selectedItem})

    useEffect(() => {
        setSelectedItem(props.selectedItem && {label: props.selectedItem.address, value: props.selectedItem})
    }, [props.selectedItem])

    return (
        <div>
            <label htmlFor={props.inputId}>{props.label}</label>
            <div className="address-select">
                <Tooltip content="Put marker in map">
                    <div className="icon" onClick={handlePutMarkerClick}><span className="material-icons">place</span></div>
                </Tooltip>

                <div className="select">
                    <AsyncSelect
                        value={selectedItem}
                        inputId={props.inputId}
                        cacheOptions
                        defaultOptions
                        onChange={handleOnChange}
                        loadOptions={handleLoadOptions}
                        placeholder={props.label}
                    />
                </div>

{/*                <Tooltip content="Current Location">
                    <div className="icon" onClick={handleCurrentLocationClick}><span className="material-icons">my_location</span></div>
                </Tooltip>*/}
            </div>
        </div>
    )
}

export default AddressSelect