import React from 'react';

  /*import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';*/
import VideocamOutlinedIcon from '@material-ui/icons/EmojiFlags';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import NavigationIcon from '@material-ui/icons/Navigation';
import DirectionsBoatOutlinedIcon from '@material-ui/icons/DirectionsBoatOutlined';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';





export class CameraMarker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    handleOnClick = (e) => {
        this.props.onClick(this.props.lat, this.props.lng, this.props.attributes);
    }

    render() {
        if ( this.props.favorited ) {
            return (
                <img
                    alt="Camera Marker"
                    src="./images/videocam_clr_heart-24px.svg"
                    width={(this.props.size ? this.props.size : 32)}
                    height={(this.props.size ? this.props.size : 32)}
                    style={{
                        cursor: "pointer",
                        display: (this.props.visible ? "inherit" : "none")
                    }}
                    onClick={this.handleOnClick}
                />
            );
        } else {
            return (
                <VideocamOutlinedIcon
                    style={{
                        cursor: "pointer", 
                        display: (this.props.visible ? "inherit" : "none"), 
                        fontSize: (this.props.size ? this.props.size : 32)
                    }}
                    onClick={this.handleOnClick} 
                />
            );
        }
    }
}








export class AISMarker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    handleOnClick = (e) => {
        this.props.onClick(this.props.lat, this.props.lng, this.props.attributes);
    }

    render() {

        if ( 'true_heading' in this.props.attributes && this.props.attributes['true_heading'] !== 511 ) {
            return (
                <NavigationIcon
                    style={{
                        cursor: "pointer",
                        display: (this.props.visible ? "inherit" : "none"),
                        fontSize: 16, //(this.props.size ? this.props.size*4 : 32),
                        color: this.props.fillColor,
                        transform: "rotate(" + (this.props.attributes['true_heading']).toString() + "deg)"
                    }}
                    onClick={this.handleOnClick}
                />        
            );
        } else {
            return (
                <div 
                    style={{ 
                        cursor: "pointer",
                        display: (this.props.visible ? "inherit" : "none"),
                        height: 8, //(this.props.size ? this.props.size : 32), 
                        width: 8, //(this.props.size ? this.props.size : 32), 
                        backgroundColor: this.props.fillColor, 
                        
                        border: [this.props.outlineWidth, "solid", this.props.outlineColor].join(" "),
                        borderRadius: "100%",
                        MozBorderRadius: "100%",
                        WebkitBorderRadius: "100%"
                    }}
                    onClick={this.handleOnClick}
                />
            );
        }
    }
}




/***************************************
 * lat=<Number>
 * lng=<Number>
 * url=<String>
 * width=<String-pixels>
 * height=<String-pixels>
 * attributes=<Object>
 * visible=<Boolean>
 * onClick=<callback>
 */
export class PictureMarker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    handleOnClick = (e) => {
        this.props.onClick(this.props.lat, this.props.lng, this.props.attributes);
    }

    render() {
        return <img
            style={{cursor: "pointer", display: (this.props.visible ? "inherit" : "none")}}
            src={this.props.url} 
            width={this.props.width}
            height={this.props.height}
            alt={this.props.attributes.id} 
            onClick={this.handleOnClick} 
        />;
    }
}



/***************************************
 * lat=<Number>
 * lng=<Number>
 * markerStyle=<String> // "circle", "square"
 * fillColor=<color code>
 * size=<pixels>
 * outlineColor=<color code>
 * outlineWidth=<pixels>
 * attributes=<Object>
 * onClick=<callback>
 */
export class SimpleMarker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    handleOnClick = (e) => {
        this.props.onClick(this.props.lat, this.props.lng, this.props.attributes);
    }

    render() {
        if ( this.props.markerStyle === "square" ) {
            return <div 
                style={{ 
                    height: this.props.size, 
                    width: this.props.size, 
                    backgroundColor: this.props.fillColor, 
                    border: [this.props.outlineWidth, "solid", this.props.outlineColor].join(" ") 
                }}
                onClick={this.handleOnClick}
            />;
        }

        return <div 
            style={{ 
                height: this.props.size, 
                width: this.props.size, 
                backgroundColor: this.props.fillColor, 
                border: [this.props.outlineWidth, "solid", this.props.outlineColor].join(" "),
                borderRadius: "100%",
                MozBorderRadius: "100%",
                WebkitBorderRadius: "100%"
            }}
            onClick={this.handleOnClick}
        />;
    }
}



export class TestCom extends React.Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            'count': 0
        };
    }

    componentWillMount() {
        this.timer = window.setInterval(this.updateDom, 1000);
    }

    componentWillUnmount() {
        window.clearInterval(this.timer);
    }

    updateDom = () => {
        var newState = Object.assign({}, this.state, {
            'count': this.state.count + 1
        });
        this.setState(newState);
    }

    handleClick = () => {
        console.log("You clicked me");
    }

    render() {
        return <div onClick={this.handleClick}>Counter: {this.state.count}</div>
    }
}