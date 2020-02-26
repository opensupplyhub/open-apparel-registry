import React from 'react';
import { connect } from 'react-redux';
import { updateBoundariesFilter } from '../actions/filters';
import { FeatureGroup, Polygon, withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import '../../node_modules/leaflet-draw/dist/leaflet.draw.css';
import { fetchFacilities } from '../actions/facilities';
import Control from 'react-leaflet-control';

class PolygonalSearchControl extends React.Component {
    constructor(props) {
        super(props);

        this.onCreate = this.onCreate.bind(this);
    }

    componentDidMount() {
        const map = this.props.leaflet.map;
        const editableLayers = this.refs.drawnItems.leafletElement;

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
                        }
                },
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
            }
         });

         if (!this.props.boundaries.length) {
             map.addControl(this.drawControl);
         }

         map.on(L.Draw.Event.CREATED, this.onCreate);
    }

    componentDidUpdate(prevProps) {
        const map = this.props.leaflet.map;
        if (prevProps.boundaries.length && !this.props.boundaries.length) {
            map.addControl(this.drawControl);
        }
        if (!prevProps.boundaries.length && this.props.boundaries.length) {
            map.removeControl(this.drawControl);
        }
    }

    onCreate(e) {
        const map = this.props.leaflet.map;
        const boundaries = e.layer._latlngs[0].map(({ lat, lng }) => [lat, lng]);

        if (boundaries.length > 2) {
            this.updateBoundaries(boundaries);
        }
    }

    updateBoundaries(boundaries) {
        this.props.updateBoundaries(boundaries);
        this.props.search();
    }

    render() {
        const { boundaries } = this.props;
        const svgRenderer = L.svg({ padding: 0.5 });

        return (
            <FeatureGroup ref="drawnItems">
                {!!boundaries.length && (
                    <Control position="topleft">
                        <div className="leaflet-draw-toolbar leaflet-bar leaflet-draw-toolbar-top">
                            <a
                                href="#"
                                title="Delete a polygon"
                                className="leaflet-draw-edit-remove"
                                onClick={() => this.updateBoundaries([])} />
                        </div>
                    </Control>
                )}
                <Polygon
                    positions={boundaries}
                    renderer={svgRenderer}
                    interactive={false}
                />
            </FeatureGroup>
        )
    }
}

const mapStateToProps = ({ filters }) => ({
    boundaries: filters.boundaries,
});

const mapDispatchToProps = dispatch => ({
    updateBoundaries: boundaries => dispatch(updateBoundariesFilter(boundaries)),
    search: () => dispatch(fetchFacilities({})),
});

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(PolygonalSearchControl));
