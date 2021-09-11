

const Utils = {
    getTimestamp() {
        return Math.round(new Date().getTime()/1000)
    },

    getHumanDate(timestamp) {
        return (new Date(timestamp * 1000)).toLocaleString()
    },

    latLng2Obj(latLan) {
        return {lat: latLan.lat(), lng: latLan.lng()}
    },

    obj2LatLng(obj) {
        return new window.google.maps.LatLng(obj)
    }
}

export default Utils