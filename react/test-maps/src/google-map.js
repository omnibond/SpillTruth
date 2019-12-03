import React from 'react';
import ReactDOM from 'react-dom';

import GoogleMapReact from 'google-map-react';
import { makeStyles } from '@material-ui/core/styles';
//import MyLocationIcon from '@material-ui/icons/MyLocation';
import HomeIcon from '@material-ui/icons/Home';


const useStyles = makeStyles(theme => ({
    resetViewRoot: {
        backgroundColor: "white",
        padding: "6px 8px 6px 8px",
        borderRadius: 3,
        cursor: "pointer"
    },
    resetViewIcon: {
        opacity: 0.7,
        '&:hover': {
            opacity: 1
        }
    }
}));


export class GoogleMap extends React.Component {
    constructor(props) {
        super(props);
        window.map = this.map = null;
        window.maps = this.maps = null;
        window.infoWindow = this.infoWindow = null;

        this.state = {

        };
    }

    onGoogleApiLoaded = ({map, maps}) => {
        var self = this;

        window.map = this.map = map;
        window.maps = this.maps = maps;
        window.infoWindow = this.infoWindow = new maps.InfoWindow({
            pixelOffset: {width: 15, height: 0, "h": "px", "g": "px"}
        });

        var resetViewControl = document.createElement("div");
        resetViewControl.style.margin = "0 10px 0 0";
        ReactDOM.render(<ResetViewControl onClick={this.props.onResetView} />, resetViewControl);
        this.map.controls[this.maps.ControlPosition.RIGHT_TOP].push(resetViewControl);



        window.maps.event.addListener(window.infoWindow, 'closeclick', function() {
            self.props.onCloseClickInfoWindow();
        });
    }

    handleOnChange = (e) => {
        var center = {'latitude': e.center.lat, 'longitude': e.center.lng},
            zoom = e.zoom,
            nw = e.bounds.nw,
            se = e.bounds.se,
            viewExtent = {'nw': {'latitude': nw.lat, 'longitude': nw.lng}, 'se': {'latitude': se.lat, 'longitude': se.lng}};
            
        this.props.onMapMove(center, zoom, viewExtent);
    }

    handleOnClick = (e) => {
        this.props.onMapClick();
    }

    render() {
        var layerTypes = [];
        if ( this.props.showTraffic ) {
            layerTypes.push("TrafficLayer");
        }

        return (
            <GoogleMapReact
                bootstrapURLKeys={{key: "AIzaSyA3xOLcaTSMnZdKEBqJmGrLefLy86AzDMU"}}
                onGoogleApiLoaded={this.onGoogleApiLoaded}
                yesIWantToUseGoogleMapApiInternals={true}
                //defaultCenter={this.props.center}
                //defaultZoom={this.props.zoom}
                center={this.props.center}
                zoom={this.props.zoom}
                onChange={this.handleOnChange}
                onClick={this.handleOnClick}
                layerTypes={layerTypes}
            >
                {this.props.graphics}
                              
            </GoogleMapReact>
        );
    }
}



export function ResetViewControl(props) {
    const classes = useStyles();

    return (
        <div className={classes.resetViewRoot} title="Reset Map View" onClick={props.onClick}>
            <HomeIcon 
                className={classes.resetViewIcon}
            />
        </div>
    );
}