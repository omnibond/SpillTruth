import React from 'react';
import { GoogleMap } from './google-map.js';
import { CameraMarker, AISMarker } from './map-markers.js';
//import { ESRIMap, SimpleMarker, PictureMarker } from './esri-map.js';

export class MapInterface extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //'center': this.props.center,
            //'zoom': this.props.zoom
        };
    }

    onMapClick = (e) => {
        this.props.onMapClick(e);
    }

    onGraphicClick = (lat, lng, attributes) => {
        console.log(attributes);
        this.props.onGraphicClick(lat, lng, attributes);
    }

    onAISGraphicClick = (lat, lng, attributes) => {
        console.log(attributes);
        this.props.onAISGraphicClick(lat, lng, attributes);
    }

    onMapMove = (center, zoom, viewExtent) => {
        console.log(center);
        console.log(zoom);
        console.log(viewExtent);
        this.props.onMapMove(center, zoom, viewExtent);
    }

    onMapMoveStop = (center, zoom, viewExtent) => {
        this.props.onMapMoveStop(center, zoom, viewExtent);
    }

    onCloseClickInfoWindow = () => {
        this.props.onCloseClickInfoWindow();
    }

    onResetView = () => {
        this.props.onResetView();
    }

    renderDisplayGraphics = (objectArray) => {
        var graphics = [];

        if ( objectArray ) {
            for (var i = 0; i < objectArray.length; i++) {
                var obj = objectArray[i];

                switch (obj['marker_type']) {
                    /*case 'simple-marker':
                        graphics.push(
                            <SimpleMarker
                                key={obj['id'] + Math.random().toString()}
                                lat={obj['latitude']}
                                lng={obj['longitude']}
                                markerStyle={obj['style']}
                                size={obj['size']}
                                fillColor={obj['color']}
                                outlineWidth={obj['outlineWidth']}
                                outlineColor={obj['outlineColor']}
                                attributes={obj['attributes']}
                                visible={obj['visible']}
                                onClick={this.onGraphicClick}
                            />
                        );
                    break;

                    case 'picture-marker':
                        graphics.push(
                            <PictureMarker
                                key={obj['id'] + Math.random().toString()}
                                lat={obj['latitude']}
                                lng={obj['longitude']}
                                url={obj['marker_url']}
                                width={obj['marker_width']}
                                height={obj['marker_height']}
                                attributes={obj['attributes']}
                                visible={obj['visible']}
                                onClick={this.onGraphicClick}
                            />
                        );
                    break;*/

                    case 'camera-marker':
                        graphics.push(
                            <CameraMarker
                                key={obj['id'] + Math.random().toString()}
                                lat={obj['latitude']}
                                lng={obj['longitude']}
                                size={obj['marker_size']}
                                attributes={obj['attributes']}
                                visible={obj['visible']}
                                favorited={obj['favorited']}
                                onClick={this.onGraphicClick}
                            />
                        );
                    break;


                    case 'ais-marker':
                        graphics.push(
                            <AISMarker
                                key={obj['id'] + Math.random().toString()}
                                lat={obj['latitude']}
                                lng={obj['longitude']}
                                size={obj['marker_size']}
                                fillColor={obj['fillColor']}
                                outlineWidth="1px"
                                outlineColor={obj['outlineColor']}
                                attributes={obj['attributes']}
                                visible={obj['visible']}
                                onClick={this.onAISGraphicClick}
                            />
                        )
                    break;

                    default:
                        console.error("Marker type: " + obj['marker_type'] + " is not supported.");
                    break;
                };
            }
        }

        return graphics;
    }

    render() {        
        /*return <ESRIMap 
            center={this.props.center} 
            zoom={this.props.zoom} 
            graphics={this.renderDisplayGraphics(this.props.objectArray)} 
            onMapClick={this.onMapClick} 
            onGraphicClick={this.onGraphicClick}
            onMapMove={this.onMapMove}
            onMapMoveStop={this.onMapMoveStop}
        />;*/

        return <GoogleMap
            center={this.props.center}
            zoom={this.props.zoom}
            graphics={this.renderDisplayGraphics(this.props.objectArray)}
            showTraffic={this.props.showTraffic}
            onMapMove={this.onMapMove}
            onMapClick={this.onMapClick}
            onCloseClickInfoWindow={this.onCloseClickInfoWindow}
            onResetView={this.onResetView}
        />;
    }
}