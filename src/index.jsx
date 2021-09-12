import ForgeUI, {
    Fragment,
    CustomField,
    CustomFieldEdit,
    render,
    Text,
    Table,
    Row,
    Cell,
    Strong,
    useProductContext,
    Em
} from "@forge/ui";

const View = () => {
    const { extensionContext: { fieldValue } } = useProductContext();

    let content
    if (!fieldValue || !fieldValue.current) {
        content = (<Text>No location logged</Text>)
    } else {
        const current = fieldValue.current;

        let percentage = 100
        if (!current.destinationReached) {
            percentage = ((fieldValue.distance.value - current.distance.value) * 100) / fieldValue.distance.value
        }

        content = (
            <Fragment>
                { current.address && <Text>{ current.address }</Text> }
                <Text>{ percentage.toFixed(0) }% completed. {percentage < 100 && <Em>{ current.distance.text } / { current.duration.text } remaining</Em>}</Text>
            </Fragment>
        )
    }

    return (
        <CustomField>
            { content }
        </CustomField>
    );
};

const Edit = () => {
    const onSubmit = () => {
        const { extensionContext: { fieldValue } } = useProductContext();
        return null
    }

    const { extensionContext: { fieldValue } } = useProductContext();

    const isLogged = fieldValue && fieldValue.origin && fieldValue.destination;

    const renderRow = (title, value) => {
        return (
            <Row>
                <Cell><Text><Strong>{ title }</Strong></Text></Cell>
                <Cell><Text>{ value }</Text></Cell>
            </Row>
        )
    }

    const renderDetails = () => {
        const {origin, destination, distance, duration, travelMode} = fieldValue
        return (
            <Table>
                { renderRow("Origin", origin.address || `lat: ${origin.location.lat}, lng: ${origin.location.lng}`) }
                { renderRow("Destination", destination.address || `lat: ${destination.location.lat}, lng: ${destination.location.lng}`) }
                { renderRow("Travel Mode", travelMode) }
                { renderRow("Distance / Duration", `${distance?.text} / ${duration?.text}`) }
            </Table>
        )
    }

    const renderCurrent = () => {
        const current = fieldValue.current

        if (!current) return null

        if (current.destinationReached) {
            return (
                <Text>Destination Reached on <Em>{ (new Date(current.timestamp * 1000)).toLocaleString() }</Em></Text>
            )
        }

        return (
            <Table>
                { renderRow("Current Location", current.address || `lat: ${current.location.lat}, lng: ${current.location.lng}`) }
                { renderRow("Distance / Duration Remaining", `${current.distance?.text || 'None'} / ${current.duration?.text || 'None'}`) }
                { renderRow("Reached On", (new Date(current.timestamp * 1000)).toLocaleString()) }
            </Table>
        )
    }

    return (
        <CustomFieldEdit onSubmit={onSubmit}>
            { !isLogged && <Text>No location logged</Text> }
            {isLogged && (
                <Fragment>
                    { renderDetails() }
                    { renderCurrent() }
                </Fragment>
            )}
            <Text>Please use Location Tracker app to update this field</Text>
        </CustomFieldEdit>
    );
}

export const runView = render(<View/>);
export const runEdit = render(<Edit/>)
