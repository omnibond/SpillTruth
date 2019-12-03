import React from "react";

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';

import { getCameraToken, renewCameraToken } from './port-requests.js';
import { parseShipCargoTypeForDataDisplay } from './utility.js';


const useStyles = makeStyles(theme => ({
    title: {
        width: "100%",
        textAlign: "center", 
        fontWeight: "bold", 
        fontSize: ".8em",
        [theme.breakpoints.up('md')]: {
            fontSize: "1.3em",
        }
    },
    imageDisplay: {
        border: "0px solid black", 
        marginTop: "5px",
        minHeight: 120,
        minWidth: 160,
        [theme.breakpoints.up('md')]: {
            minHeight: 240,
            minWidth: 320
        }
    },
    image: {
        maxHeight: "100%", 
        maxWidth: "100%",
        height: 120,
        [theme.breakpoints.up('md')]: {
            height: 240,
        }
    },
    controlsDisplayShowFramerate: {
        width: "100%", 
        display: "flex", 
        justifyContent: "space-between", 
        marginTop: "5px", 
        marginBottom: "5px"
    },
    controlsDisplayHideFramerate: {
        width: "100%", 
        display: "flex", 
        justifyContent: "flex-end", 
        marginTop: "5px", 
        marginBottom: "5px"
    },
    aisTable: {
        borderCollapse: "collaspe",
        borderSpacing: "0px"
    },
    aisTableHeader: {
        textAlign: "left",
        padding: "3px",
        border: "1px solid black"
    },
    aisTableData: {
        textAlign: "right",
        padding: "3px 3px 3px 10px",
        border: "1px solid black"
    }
}));


if ( !window.cameraTimers ) {
    window.cameraTimers = {};
}

export function stopAllUpdateImageTimers() {
    for (var cid in window.cameraTimers) {
        if ( window.cameraTimers[cid]['imageTimer'] !== null ) {
            window.clearInterval(window.cameraTimers[cid]['imageTimer']);
            window.cameraTimers[cid]['imageTimer'] = null;
            window.cameraTimers[cid]['loaded'] = true;
        }
    }
}

export function startRenewTokenTimer(cameraID, token) {
    stopRenewTokenTimer();
    if ( window.cameraTimers[cameraID]['tokenTimer'] === null ) {
        window.cameraTimers[cameraID]['tokenTimer'] = window.setInterval(function() {
            renewCameraToken(cameraID, token);
        }, 600000);
    }
}

export function stopRenewTokenTimer(cameraID) {
    if ( cameraID ) {
        if ( window.cameraTimers[cameraID]['tokenTimer'] !== null ) {
            window.clearInterval(window.cameraTimers[cameraID]['tokenTimer']);
            window.cameraTimers[cameraID]['tokenTimer'] = null;
        }
    } else {
        for (var cid in window.cameraTimers ) {
            if ( window.cameraTimers[cid]['tokenTimer'] !== null ) {
                window.clearInterval(window.cameraTimers[cid]['tokenTimer']);
                window.cameraTimers[cid]['tokenTimer'] = null;
            }
        }
    }    
}

export function CameraDisplay(props) {
    const classes = useStyles();    

    const [jpegUrl, setJpegUrl] = React.useState('');
    const [imageSrc, setImageSrc] = React.useState('');
    //const [favorited, setFavorited] = React.useState(props.favorited);
    const [framerate, setFramerate] = React.useState((props.framerate ? props.framerate : 5));
    
    React.useEffect(() => {
        if ( (props.cameraID in window.cameraTimers) && (window.cameraTimers[props.cameraID]['imageTimer'] !== null) ) {
            window.clearInterval(window.cameraTimers[props.cameraID]['imageTimer']);
        }

        window.cameraTimers[props.cameraID] = {};   
        window.cameraTimers[props.cameraID]['loaded'] = true;    
        window.cameraTimers[props.cameraID]['imageTimer'] = null;

        getCameraUrl();       

        return () => {
            stopUpdateImageTimer();
            stopRenewTokenTimer(props.cameraID);
        };
    }, []);

    function getCameraUrl() {        
        getCameraToken(props.cameraID)
        .then(

            (successResponse) => {
                var data = JSON.parse(successResponse);
                var url = data['endpoint_url'] + "/jpeg?token=" + data['token'];
                setJpegUrl(url);
                setImageSrc(url);

                startUpdateImageTimer(url, framerate);
                startRenewTokenTimer(props.cameraID, data['token']);
            },

            (errorResponse) => {
                console.log(errorResponse);
                stopUpdateImageTimer();
                stopRenewTokenTimer(props.cameraID);
                getCameraUrl();                
            }

        );
    }

    function startUpdateImageTimer(url, updateImageFramerate) {
        if ( window.cameraTimers[props.cameraID]['imageTimer'] === null ) {  
            window.cameraTimers[props.cameraID]['loaded'] = true;    
            window.cameraTimers[props.cameraID]['imageTimer'] = window.setInterval(function() {
                if ( window.cameraTimers[props.cameraID]['loaded'] ) {
                    window.cameraTimers[props.cameraID]['loaded'] = false;
                    setImageSrc(url + "&r=" + Math.random());
                }
            }, 1000 / updateImageFramerate);
        }
    }

    function stopUpdateImageTimer() {
        if ( (window.cameraTimers[props.cameraID]['imageTimer'] !== null) ) {
            window.clearInterval(window.cameraTimers[props.cameraID]['imageTimer']);
            window.cameraTimers[props.cameraID]['imageTimer'] = null;
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    function handleFramerateClick() {
        props.onClickFramerate();
    }

    function handleFramerateChange(event) {
        setFramerate(event.target.value);
        stopUpdateImageTimer();
        startUpdateImageTimer(jpegUrl, event.target.value);

        props.onChangeFramerate(event.target.value);
    }

    function handleFavoriteButtonClick() {
        //var liked = !favorited;
        //setFavorited(liked);

        props.onClickFavoriteButton(props.cameraID);
    }

    function handleImgLoad() {
        if ( (props.cameraID in window.cameraTimers) && !window.cameraTimers[props.cameraID]['loaded'] ) {
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    function handleImgError() {
        if ( (props.cameraID in window.cameraTimers) && !window.cameraTimers[props.cameraID]['loaded'] ) {
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    return (
        <div>            
            <div className={classes.title}>
                {props.title}
            </div>

            <div className={classes.imageDisplay}>
                <img
                    src={imageSrc} 
                    alt={props.title}
                    className={classes.image}
                    onLoad={handleImgLoad}
                    onError={handleImgError}
                />                
            </div>

            <div className={(props.showFramerate ? classes.controlsDisplayShowFramerate : classes.controlsDisplayHideFramerate)}>
                {(props.showFramerate ? 
                    <Select
                        value={framerate}
                        onChange={handleFramerateChange}
                        onClick={handleFramerateClick}
                        style={{fontSize: "12px"}}
                        inputProps={{
                            name: 'frametrate',
                            id: 'outlined-framerate-simple',
                        }}
                    >
                        <MenuItem value={2}>2 fps</MenuItem>
                        <MenuItem value={5}>5 fps</MenuItem>
                        <MenuItem value={15}>15 fps</MenuItem>
                    </Select>

                    :

                    <div />
                )}

                <IconButton aria-label="favorite button" onClick={handleFavoriteButtonClick}>
                    <img
                        alt="Favorites Group Icon"
                        src={"./images/videocam_solid_heart_GREY-24px.svg"}
                        width="24px"
                        height="24px"
                    />
                </IconButton>
                
                
            </div>
        </div>
    );
}




export function FavoriteCameraDisplay(props) {
    const classes = useStyles();    
    
    const [jpegUrl, setJpegUrl] = React.useState('');
    const [imageSrc, setImageSrc] = React.useState('');
    const [framerate, setFramerate] = React.useState(2);

    React.useEffect(() => {
        window.cameraTimers[props.cameraID] = {};   
        window.cameraTimers[props.cameraID]['loaded'] = true;    
        window.cameraTimers[props.cameraID]['imageTimer'] = null;

        getCameraToken(props.cameraID)
        .then(
            
            (successResponse) => {
                var data = JSON.parse(successResponse);
                var url = data['endpoint_url'] + "/jpeg?token=" + data['token'];
                setJpegUrl(url);
                setImageSrc(url);

                startUpdateImageTimer(url, framerate);
                startRenewTokenTimer(props.cameraID, data['token']);
            },

            (errorResponse) => {
                stopUpdateImageTimer();
                stopRenewTokenTimer(props.cameraID);
                console.log(errorResponse);
            }

        );
        
        
        return () => {console.log(props.cameraID);
            stopUpdateImageTimer();
            stopRenewTokenTimer(props.cameraID);
        };
    }, []);

    function startUpdateImageTimer(url, updateImageFramerate) {
        if ( window.cameraTimers[props.cameraID]['imageTimer'] === null ) {  
            window.cameraTimers[props.cameraID]['loaded'] = true;    
            window.cameraTimers[props.cameraID]['imageTimer'] = window.setInterval(function() {
                if ( window.cameraTimers[props.cameraID]['loaded'] ) {
                    window.cameraTimers[props.cameraID]['loaded'] = false;
                    setImageSrc(url + "&r=" + Math.random());
                }
            }, 1000 / updateImageFramerate);
        }
    }

    function stopUpdateImageTimer() {
        if ( (window.cameraTimers[props.cameraID]['imageTimer'] !== null) ) {
            window.clearInterval(window.cameraTimers[props.cameraID]['imageTimer']);
            window.cameraTimers[props.cameraID]['imageTimer'] = null;
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    function handleFramerateClick() {
        //props.onClickFramerate();
    }

    function handleFramerateChange(event) {
        setFramerate(event.target.value);
        stopUpdateImageTimer();
        startUpdateImageTimer(jpegUrl, event.target.value);
    }

    function handleFavoriteButtonClick() {
        props.onClickFavoriteButton(props.cameraID);
    }

    function handleImageLoad() {
        if ( (props.cameraID in window.cameraTimers) && !window.cameraTimers[props.cameraID]['loaded'] ) {
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    function handleImageError() {
        if ( (props.cameraID in window.cameraTimers) && !window.cameraTimers[props.cameraID]['loaded'] ) {
            window.cameraTimers[props.cameraID]['loaded'] = true;
        }
    }

    return (
        <div>            
            <div className={classes.title}>
                {props.title}
            </div>

            <div className={classes.imageDisplay}>
                <img
                    src={imageSrc}
                    alt={props.title}
                    className={classes.image}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>

            <div className={(props.showFramerate ? classes.controlsDisplayShowFramerate : classes.controlsDisplayHideFramerate)}>
                {(props.showFramerate ? 
                    <Select
                        value={framerate}
                        onChange={handleFramerateChange}
                        onClick={handleFramerateClick}
                        style={{fontSize: "12px"}}
                        inputProps={{
                            name: 'frametrate',
                            id: 'outlined-framerate-simple',
                        }}
                    >
                        <MenuItem value={2}>2 fps</MenuItem>
                        <MenuItem value={5}>5 fps</MenuItem>
                        <MenuItem value={15}>15 fps</MenuItem>
                    </Select>

                    :

                    <div />
                )}


                <IconButton aria-label="favorite button" onClick={handleFavoriteButtonClick}>
                    <img
                        alt="Favorites Group Icon"
                        src={"./images/videocam_solid_heart_GREY-24px.svg"}
                        width="24px"
                        height="24px"
                    />
                </IconButton>
                
            </div>
        </div>
    );
}






export function AisDisplay(props) {
    const classes = useStyles();    

    React.useEffect(() => {
        stopAllUpdateImageTimers();

        return () => {
            
        };
    }, []);


    function parseETA(attr) {
        var month  = attr['eta_month'],
            day    = attr['eta_day'],
            hour   = attr['eta_hour'],
            minute = attr['eta_minute'];

        if ( month === 0 && day === 0 && hour === 24 && minute === 60 ) {
            return "N/A";
        }

        var datetimeString = "";
        if ( month > 0 && day > 0 ) {
            datetimeString += (month < 10 ? "0" + month.toString() : month.toString());
            datetimeString += "/" + (day < 10 ? "0" + day.toString() : day.toString());
        }

        if ( hour < 24 && minute < 60 ) {
            datetimeString += " " + (hour < 10 ? "0" + hour.toString() : hour.toString());
            datetimeString += ":" + (minute < 10 ? "0" + minute.toString(): minute.toString());
        }

        return datetimeString;
    }

    return (
        <div>
            <table className={classes.aisTable}>
                <tr>
                    <th className={classes.aisTableHeader}>
                        MMSI
                    </th>
                    <td className={classes.aisTableData}>
                        {props['attributes']['mmsi']}
                    </td>
                </tr>
                
                {(props['attributes']['callsign'] !== undefined ?
                    <tr>
                        <th className={classes.aisTableHeader}>
                            CALLSIGN
                        </th>
                        <td className={classes.aisTableData}>
                            {props['attributes']['callsign'].replace(/@/g, "").trim()}
                        </td>
                    </tr>

                    :

                    undefined
                )}

                {(props['attributes']['name'] !== undefined ?
                    <tr>
                        <th className={classes.aisTableHeader}>
                            NAME
                        </th>
                        <td className={classes.aisTableData}>
                            {props['attributes']['name'].replace(/@/g, "").trim()}
                        </td>
                    </tr>

                    :

                    undefined
                )}

                {(props['attributes']['type_and_cargo'] !== undefined ?
                    <tr>
                        <th className={classes.aisTableHeader}>
                            SHIP/CARGO TYPE
                        </th>
                        <td className={classes.aisTableData}>
                            {parseShipCargoTypeForDataDisplay(props['attributes']['type_and_cargo'])}
                        </td>
                    </tr>

                    :

                    undefined
                )}

                {(props['attributes']['destination'] !== undefined ?
                    <tr>
                        <th className={classes.aisTableHeader}>
                            DESTINATION
                        </th>
                        <td className={classes.aisTableData}>
                            {props['attributes']['destination'].replace(/@/g, "").trim()}
                        </td>
                    </tr>

                    :

                    undefined
                )}

                {(props['attributes']['eta_month'] !== undefined ?
                    <tr>
                        <th className={classes.aisTableHeader}>
                            ETA
                        </th>
                        <td className={classes.aisTableData}>
                            {parseETA(props['attributes'])}
                        </td>
                    </tr>

                    :

                    undefined
                )}

                <tr>
                    <th className={classes.aisTableHeader}>
                        LATITUDE
                    </th>
                    <td className={classes.aisTableData}>
                        {props['attributes']['y']}
                    </td>
                </tr>

                <tr>
                    <th className={classes.aisTableHeader}>
                        LONGITUDE
                    </th>
                    <td className={classes.aisTableData}>
                        {props['attributes']['x']}
                    </td>
                </tr>

            </table>
        </div>
    );
}