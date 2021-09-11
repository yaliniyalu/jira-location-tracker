import Utils from "./Utils";

import { invoke } from '@forge/bridge';

const MapApi = {
    async searchAddress(address) {
        return await invoke('searchAddress', {address});
    },

    async getAddress(lat, lng) {
        return await invoke('getAddress', {lat, lng});
    },

    async getRoute(origin, destination, travelMode) {
        const maps = window.google.maps;
        const service = new maps.DistanceMatrixService();
        const res = await service.getDistanceMatrix({
            origins: [new maps.LatLng(origin.lat, origin.lng)],
            destinations: [new maps.LatLng(destination.lat, destination.lng)],
            travelMode: travelMode
        });

        if (!res['rows'].length || !res['rows'][0]['elements'].length) {
            return null;
        }

        return res['rows'][0]['elements'][0]
    },

    isAroundLocation(from, to, radius) {
        return window.google.maps.geometry.spherical.computeDistanceBetween(Utils.obj2LatLng(from), Utils.obj2LatLng(to)) <= radius
    }
}

export default MapApi