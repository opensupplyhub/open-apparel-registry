import React from 'react';
import { connect } from 'react-redux';
import { FeatureGroup, withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import '../../node_modules/leaflet-draw/dist/leaflet.draw.css';
import { fetchFacilities } from '../actions/facilities';
import { updateBoundaryFilter } from '../actions/filters';
import { showDrawFilter } from '../actions/ui';

class PolygonalSearchControl extends React.Component {
    constructor(props) {
        super(props);

        this.editableLayers = React.createRef();
        this.onCreate = this.onCreate.bind(this);
    }

    componentDidMount() {
        const {
            leaflet: { map },
        } = this.props;
        const editableLayers = this.editableLayers.current.leafletElement;

        this.drawControl = new L.Control.Draw({
            position: 'topleft',
            edit: {
                featureGroup: editableLayers,
                edit: false,
                remove: false,
            },
            draw: {
                polyline: false,
                polygon: {
                    shapeOptions: {
                        interactive: false,
                        renderer: L.svg({ padding: 0.5 }),
                    },
                },
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
            },
        });

        map.addControl(this.drawControl);
        /* eslint-disable-next-line no-underscore-dangle */
        this.drawControl._toolbars.draw._modes.polygon.handler.enable();

        map.on(L.Draw.Event.CREATED, this.onCreate);
        map.on('draw:toolbarclosed', this.props.hideDrawFilter);
    }

    onCreate(e) {
        this.props.updateBoundary(e.layer.toGeoJSON().geometry);
        this.props.search();
    }

    componentWillUnmount() {
        const {
            leaflet: { map },
        } = this.props;
        map.removeControl(this.drawControl);
    }

    render() {
        return <FeatureGroup ref={this.editableLayers} />;
    }
}

const mapDispatchToProps = dispatch => ({
    updateBoundary: boundary => dispatch(updateBoundaryFilter(boundary)),
    search: () => dispatch(fetchFacilities({})),
    hideDrawFilter: () => dispatch(showDrawFilter(false)),
});

export default connect(
    null,
    mapDispatchToProps,
)(withLeaflet(PolygonalSearchControl));
