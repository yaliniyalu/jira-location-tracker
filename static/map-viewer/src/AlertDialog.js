import React, {useCallback, useEffect, useState} from 'react';

import Button from '@atlaskit/button/standard-button';

import Modal, {
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition,
} from '@atlaskit/modal-dialog';

export default function AlertDialog(props) {
    const closeModal = useCallback(() => props.onClose && props.onClose(), []);
    const sendAction = (action) => props.onAction && props.onAction(action)

    const ErrorData = {
        GEOLOCATION_PERMISSION_DENIED: {
            title: "Geolocation Permission Denied",
            body: (
                <>
                <p>You must give permission to access the geo location data.</p>
                <ol>
                    <li>Click the button again.</li>
                    <li>Click allow on top left corner.</li>
                </ol>
                </>
            )
        },
        GEOLOCATION_NOT_SUPPORTED: {
            title: "Geolocation is not supported",
            body: (
                <p>Geolocation is not supported on this device or browser. Please update your browser and try again. You can also move the 'C' marker in map to set the current location.</p>
            )
        },
        DIRECTION_NO_DATA: {
            title: "No direction data found",
            body: (
                <p>No route data can be found for your origin and destination. Please check your origin and destination data and try again.</p>
            )
        },
        CURRENT_LOCATION_OUT_OF_RANGE: {
            title: "Location out of range",
            body: (
                <p>Unable to update the current location. Your current location doesn't fall on the assigned route.</p>
            )
        },
        TRAVEL_MODE_TRANSIT_ERROR: {
            title: "Travel mode error",
            body: (
                <p>Travel mode transit must not have any waypoints. <b>Do you want to delete the waypoints?</b></p>
            ),
            button: (
                <>
                    <Button appearance="subtle" onClick={closeModal}>Cancel</Button>
                    <Button appearance="danger" onClick={() => sendAction("DELETE_WAYPOINTS_SET_TM_TRANSIT")}>Delete Waypoints</Button>
                </>
            )
        },
        UPDATE_FIELD_ERROR: {
            title: "Update field error",
            body: (<p>Unable to update the location field. Please try again.</p>)
        },
        UNKNOWN: {
            title: "Unknown Error",
            body: (<p>An unexpected error occurred please try again.</p>)
        }
    }

    const [data, setData] = useState(ErrorData.UNKNOWN)

    useEffect(() => {
        if (ErrorData[props.errorCode]) {
            setData(ErrorData[props.errorCode])
        } else {
            setData(ErrorData.UNKNOWN)
        }
    }, [props.errorCode])

    return (
        <>
            <ModalTransition>
                {props.isOpen && (
                    <Modal onClose={closeModal}>
                        <ModalHeader>
                            <ModalTitle appearance="danger">
                                {data.title}
                            </ModalTitle>
                        </ModalHeader>
                        <ModalBody>
                            { data.body }
                        </ModalBody>
                        <ModalFooter>
                            { !data.button && <Button appearance="subtle" onClick={closeModal}>OK</Button>}
                            { data.button }
                        </ModalFooter>
                    </Modal>
                )}
            </ModalTransition>
        </>
    );
}