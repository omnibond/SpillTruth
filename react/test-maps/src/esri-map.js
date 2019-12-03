import React, { useState, useEffect } from 'react';
import { Map, loadModules } from '@esri/react-arcgis';

/**********************************************
* <ESRIMap 
* center={lat: <number>, lng: <number>}
* zoom=<integer>
* graphics=<jsx array>
* onMapClick=<callback>
* onGraphicClick=<callback>
* onMapMove=<callback>
************************************************/
export class ESRIMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            map: null,
            view: null
        };
        window.me = this;
        this.webMercatorUtils = null;
        loadModules(['esri/geometry/support/webMercatorUtils']).then(([webMercatorUtils]) => {
            this.webMercatorUtils = webMercatorUtils;
        }, []);
    }

    handleMapLoad = (map, view) => {console.log("handleMapLoad");        
        this.setState({map, view});
    }

    handleMapFail = (e) => {
        console.error(e);
    }

    handleMapClick = (e) => {
        var self = this;
        this.props.onMapClick(e);
        this.state.view.hitTest(e.screenPoint)
            .then(function(r) {
                if ( r.results.length > 0 ) {
                    self.props.onGraphicClick(r.results[0].mapPoint.latitude, r.results[0].mapPoint.longitude, r.results[0].graphic.attributes);
                }
            });
    }

    handleMapMove = (e) => {        
        var center = {
                'latitude': this.state.view.center.latitude, 
                'longitude': this.state.view.center.longitude
            },
            zoom = this.state.view.zoom,
            nw = this.webMercatorUtils.xyToLngLat(this.state.view.extent.xmin, this.state.view.extent.ymax),
            se = this.webMercatorUtils.xyToLngLat(this.state.view.extent.xmax, this.state.view.extent.ymin),
            viewExtent = {
                'nw': {'latitude': nw[1], 'longitude': nw[0]},
                'se': {'latitude': se[1], 'longitude': se[0]}
            };
        
        if ( e.action === 'start' || e.action === 'update' ) {
            this.props.onMapMove(center, zoom, viewExtent);
        } else {
            this.props.onMapMoveStop(center, zoom, viewExtent);
        }        
    }

    handleMapMouseWheel = (e) => {
        this.handleMapMove(e);
    }

    render() {
        console.log("rendering");
        /*if ( this.state.map && this.state.view && this.state.view.graphics.items.length > 0 ) {console.log("refreshing graphics");
            this.state.view.graphics.removeAll();
            console.log(this.state.view.graphics.items);
        }*/     
        console.log(this.props.graphics);
        return (
            <Map
                viewProperties={{
                    center: [this.props.center.lng, this.props.center.lat],
                    zoom: this.props.zoom
                }}
                mapProperties={{
                    basemap: (this.props.mapType ? this.props.mapType : 'topo') // https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html
                }}
                onClick={this.handleMapClick}
                onLoad={this.handleMapLoad} 
                onFail={this.handleMapFail}
                onDrag={this.handleMapMove}
                onMouseWheel={this.handleMapMouseWheel}
            >
                {this.props.graphics}
            </Map>
        );
    }
}


export const SimpleMarker = (props) => {console.log(props);
    
    const [graphic, setGraphic] = useState(null);
    useEffect(() => {

        loadModules(['esri/Graphic']).then(([Graphic]) => {

            const point = {
                type: "point",
                longitude: props.lng,
                latitude: props.lat
            };

            const markerSymbol = {
                type: "simple-marker",
                color: props.fillColor,
                size: (props.size ? props.size : 12),
                style: (props.markerStyle ? props.markerStyle : "circle"), // circle, cross, diamond, square, triangle, x
                xoffset: (props.xoffset ? props.xoffset : 0),
                yoffset: (props.yoffset ? props.yoffset : 0),
                angle: (props.angle ? props.angle : 0),
                outline: {
                    color: props.outlineColor,
                    width: props.outlineWidth
                }
            };

            const graphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                attributes: props.attributes
            });
            
            setGraphic(graphic);            
            props.view.graphics.add(graphic);
        }).catch((err) => console.error(err));

        return function cleanup() {
            props.view.graphics.remove(graphic);
        }

    }, []);

    return null;

}

export const PictureMarker = (props) => {//console.log(props);
    
    const [graphic, setGraphic] = useState(null);
    useEffect(() => {

        loadModules(['esri/Graphic']).then(([Graphic]) => {

            const point = {
                type: "point",
                longitude: props.lng,
                latitude: props.lat
            };

            const markerSymbol = {
                type: "picture-marker",
                url: props.url,
                width: props.width,
                height: props.height,
                xoffset: (props.xoffset ? props.xoffset : 0),
                yoffset: (props.yoffset ? props.yoffset : 0),
                angle: (props.angle ? props.angle : 0)
            };

            const graphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                attributes: props.attributes
            });
            setGraphic(graphic); 
            props.view.graphics.add(graphic);
        }).catch((err) => console.error(err));

        return function cleanup() {console.log("cleanup");
            props.view.graphics.remove(graphic);
        }

    }, []);

    return null;

}


/*export const BermudaTriangle = (props) => {

    const [graphic, setGraphic] = useState(null);
    useEffect(() => {

        loadModules(['esri/Graphic']).then(([Graphic]) => {
            // Create a polygon geometry
            const polygon = {
                type: "polygon", // autocasts as new Polygon()
                rings: [
                    [-64.78, 32.3],
                    [-66.07, 18.45],
                    [-80.21, 25.78],
                    [-64.78, 32.3]
                ]
            };

            // Create a symbol for rendering the graphic
            const fillSymbol = {
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: [227, 139, 79, 0.8],
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 255, 255],
                    width: 1
                }
            };

            // Add the geometry and symbol to a new graphic
            const graphic = new Graphic({
                geometry: polygon,
                symbol: fillSymbol
            });
            setGraphic(graphic);
            props.view.graphics.add(graphic);
        }).catch((err) => console.error(err));

        return function cleanup() {
            props.view.graphics.remove(graphic);
        };
    }, []);

    return null;

}*/