import {compose, withProps} from "recompose";
import {withGoogleMap, withScriptjs} from "react-google-maps";
import React from "react";
import CustomMap from "./CustomMap";

const MapComponent = compose(
    withProps({
        googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `300px` }} />,
        mapElement: <div style={{ height: `100%` }} />
    }),
    withScriptjs,
    withGoogleMap
)(props => (
    <CustomMap {...props} />
));

export default MapComponent
