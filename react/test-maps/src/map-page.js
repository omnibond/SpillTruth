import React from 'react';
import ReactDOM from 'react-dom';

import { MapInterface } from './map-interface.js';
import { CameraDisplay, AisDisplay, stopRenewTokenTimer, stopAllUpdateImageTimers } from './info-window-ex.js';
import { FavoritesPage, FavoritesDialog } from './favorites-page.js';
import { parseCameraGroupsInitials, checkIfCidInCameraGroups, parseShipCargoType } from './utility.js';

import clsx from 'clsx';
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
/*import VideocamIcon from '@material-ui/icons/Videocam';*/
import VideocamIcon from '@material-ui/icons/EmojiFlags';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import GridOnIcon from '@material-ui/icons/GridOn';
import MapIcon from '@material-ui/icons/Map';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';


const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%'
    },
    grow: {
        flexGrow: 1,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "#FFFFFF",
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
        color: "rgba(0, 0, 0, 0.54)"
    },
    userAvatar: {
        marginRight: 5,
        color: '#FFFFFF',
        backgroundColor: deepOrange[500]
    },
    title: {
        flexGrow: 1,
        //display: 'none',
        //[theme.breakpoints.up('sm')]: {
            //display: 'block',
        //},
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(7),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        //width: theme.spacing(10) + 1,
        [theme.breakpoints.up('sm')]: {
            //width: theme.spacing(10) + 1,
            width: theme.spacing(9) + 1,
        },
    },
    list: {
        paddingTop: "0",
        paddingBottom: "0"
    },
    listIcon: {
        [theme.breakpoints.up('sm')]: {
            marginLeft: '8px',
        }
    },
    listAvatar: {
        marginRight: "9px",
        marginLeft: "-5px",
        [theme.breakpoints.down('sm')]: {
            marginLeft: "-5px",
            marginRight: "9px",
        }
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        height: "64px !important",
        ...theme.mixins.toolbar,
    },
    cameraGroupAvatar: {
        color: '#fff',
        width: '32px',
        height: '32px',
        fontSize: '1.2em',
        [theme.breakpoints.down('sm')]: {
            //paddingLeft: '-5px',
            //marginLeft: "-8px"
        }
        
    },
    content: {
        flexGrow: 1,
        padding: 0,
        margin: 0,
        width: '100%',
        display: "flex",
        flexDirection: "column"
        //padding: theme.spacing(3),
    },
}));



export function MapPage(props) {
    if ( window.infoWindowClick === undefined ) {
        window.infoWindowClick = false;
    }
    

    const classes = useStyles();
    const theme = useTheme();    

    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  

    const [center, setCenter] = React.useState({lat: 33.7428634, lng: -118.2365507});
    const [zoom, setZoom] = React.useState(13);
    const [showCameras, setShowCameras] = React.useState(false);
    const [showAIS, setShowAIS] = React.useState(false);
    const [showTraffic, setShowTraffic] = React.useState(false);
    const [showWeather, setShowWeather] = React.useState(false);
    const [showCameraGridView, setShowCameraGridView] = React.useState(false);
    const [selectedCameraGroups, setSelectedCameraGroups] = React.useState([]);

    const [favoritesDialogCID, setFavoritesDialogCID] = React.useState(undefined);
    const [favoriteGroupsOpen, setFavoriteGroupsOpen] = React.useState(false);
    const [cameraGroupsOpen, setCameraGroupsOpen] = React.useState(false);

    if ( !window.mjpegFramerate ) {
        window.mjpegFramerate = 5;
    }


    function handleDrawerOpen() {
        setOpen(true);
    }

    function handleDrawerClose() {
        setOpen(false);
    }

    function handleProfileMenuOpen(event) {
        setAnchorEl(event.currentTarget);
    }
  
    function handleMobileMenuClose() {
        setMobileMoreAnchorEl(null);
    }
  
    function handleMenuClose() {
        setAnchorEl(null);
        handleMobileMenuClose();
    }
  
    function handleMobileMenuOpen(event) {
        setMobileMoreAnchorEl(event.currentTarget);
    }

    function handleLogout() {        
        handleMenuClose();
        props.onLogout();
    }

    function handleShowCamerasClick() {
        if ( !showCameraGridView ) {
            setShowCameras(!showCameras);
        } else {
            setShowCameraGridView(!showCameraGridView);
        }

        closeInfoWindow();
    }

    function handleShowAISClick() {
        if ( !showCameraGridView ) {
            setShowAIS(!showAIS);
        } else {
            setShowCameraGridView(!showCameraGridView);
        }
    }

    function handleShowTrafficClick() {
        if ( !showCameraGridView ) {
            setShowTraffic(!showTraffic);
        } else {
            setShowCameraGridView(!showCameraGridView);
        }
    }

    function handleShowWeatherClick() {
        if ( !showCameraGridView ) {
            setShowWeather(!showWeather);
        } else {
            setShowCameraGridView(!showCameraGridView);
        }
    }

    function handleCameraGridViewToggle() {
        setShowCameraGridView(!showCameraGridView);
        closeInfoWindow();
    }
  
    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >

            <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                    <Avatar className={classes.userAvatar}>
                        {props.userName[0]}
                    </Avatar>
                </ListItemIcon>
                <ListItemText primary={props.userName} />
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
            </MenuItem>

        </Menu>
    );
  
    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        > 

            <MenuItem>
                <IconButton aria-label="Notifications" color="inherit">
                    <Badge color="secondary">
                        <NotificationsIcon style={{color: "rgba(0, 0, 0, 0.54)"}} />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>

            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle style={{color: "rgba(0, 0, 0, 0.54)"}} />
                </IconButton>
                <p>Profile</p>
            </MenuItem>

        </Menu>
    );

    function openCameraInfoWindow(lat, lng, attributes) {
        closeInfoWindow();

        var content = document.createElement('div');
        content.setAttribute("id", "infowindowContents");
        ReactDOM.render(
            <CameraDisplay 
                title={attributes['name']} 
                cameraID={attributes['sid']}
                favorited={checkIfCidInCameraGroups(attributes['sid'], Object.keys(props.favoritesData), props.favoritesData)}
                onClickFavoriteButton={onFavoriteCameraClick}
                framerate={window.mjpegFramerate}
                showFramerate={true}
                onClickFramerate={onClickFramerate}
                onChangeFramerate={onChangeFramerate}
            />, 
            content
        );

        window.infoWindow.setContent(content);
        window.infoWindow.setPosition({lat: lat, lng: lng});
        window.infoWindow.setOptions({
            pixelOffset: {width: 15, height: 0, "h": "px", "g": "px"}
        });
        window.infoWindow.open(window.map);
    }

    function openAISInfoWindow(lat, lng, attributes) {
        closeInfoWindow();

        var content = document.createElement('div');
        content.setAttribute("id", "infowindowContents");
        ReactDOM.render(
            <AisDisplay
                attributes={attributes}
            />, 
            content
        );

        window.infoWindow.setContent(content);
        window.infoWindow.setPosition({lat: lat, lng: lng});
        window.infoWindow.setOptions({
            pixelOffset: {width: 3, height: 0, "h": "px", "g": "px"}
        });
        window.infoWindow.open(window.map);
    }

    function closeInfoWindow() {console.log("closeInfoWindow");
        stopAllUpdateImageTimers();
        stopRenewTokenTimer();
        if ( window.infoWindow ) { 
            var contentsDom = document.getElementById("infowindowContents");
            if ( contentsDom ) {
                ReactDOM.unmountComponentAtNode(contentsDom);        
            }
            window.infoWindow.close(); 
        }
    }

    function onCloseClickInfoWindow() {
        closeInfoWindow();
    }

    function onMapClick(e) {
        //console.log("onMapClick");
        if ( !window.infoWindowClick ) {
            closeInfoWindow();
        }
        window.infoWindowClick = false;
    }

    function onMapMove(center, zoom, viewExtent) {
        //console.log("onMapMove");
        setCenter({lat: center.latitude, lng: center.longitude});
        setZoom(zoom);
    }

    function onMapMoveStop(center, zoom, viewExtent) {
        // console.log("onMapMoveStop");
        setCenter({lat: center.latitude, lng: center.longitude});
        setZoom(zoom);
    }

    function onGraphicClick(lat, lng, attributes) {
        openCameraInfoWindow(lat, lng, attributes);
    }

    function onAISGraphicClick(lat, lng, attributes) {
        openAISInfoWindow(lat, lng, attributes);
    }

    function onFavoriteCameraClick(cameraID) {
        window.infoWindowClick = true;
        
        setFavoritesDialogCID(cameraID);
    }

    function handleFavoritesDialogClose() {
        setFavoritesDialogCID(undefined);
    }

    function handleOnChangeFavoritesData(newFavoritesData) {
        var clone = selectedCameraGroups.slice(0);
        for (var i = 0; i < clone.length; i++) {
            if ( !(clone[i] in newFavoritesData) ) {
                clone.splice(i, 1);
            }
        }
        setSelectedCameraGroups(clone);

        props.onChangeFavorites(newFavoritesData);
    }

    function handleFavoritesGroupOpenToggle() {
        setFavoriteGroupsOpen(!favoriteGroupsOpen);
    }

    function handleCameraGroupsOpenToggle() {
        setCameraGroupsOpen(!cameraGroupsOpen);
    }

    function onClickFramerate() {
        window.infoWindowClick = true;
    }

    function onChangeFramerate(framerate) {
        window.infoWindowClick = true;
        window.mjpegFramerate = framerate;
    }

    function onResetView() {
        setCenter({lat: 33.7428634, lng: -118.2365507});
        setZoom(13);
    }

    function handleCameraGroupClick(groupID, event) {
        var groupsClone = selectedCameraGroups.slice(0),
        index = groupsClone.indexOf(groupID);
        if ( index >= 0 ) {
            groupsClone.splice(index, 1);            
        } else {
            groupsClone.push(groupID);
        }
        setSelectedCameraGroups(groupsClone);        
    }

    function buildObjectArray(camerasObj, aisObject) {
        var objectArray = [];
        
        for (var sid in camerasObj) {
            var cameraGroupsSelected = (checkIfCidInCameraGroups(sid, selectedCameraGroups, props.cameraGroups) || checkIfCidInCameraGroups(sid, selectedCameraGroups, props.favoritesData));         
            camerasObj[sid]['sid'] = sid;
            var cameraObj = {
                'id': sid,
                'object_type': "camera",
                'marker_type': "camera-marker",
                'name': camerasObj[sid]['name'],
                'latitude': camerasObj[sid]['latitude'],
                'longitude': camerasObj[sid]['longitude'],
                'favorited': checkIfCidInCameraGroups(sid, Object.keys(props.favoritesData), props.favoritesData),
                'marker_size': "32px",
                'attributes': camerasObj[sid],
                'visible': (showCameras || cameraGroupsSelected)
            };

            objectArray.push(cameraObj);
        }


        for (var mmsi in aisObject) {
            if ( 'x' in aisObject[mmsi] && 'y' in aisObject[mmsi] ) {
                var shipCargoTypeObject = parseShipCargoType(aisObject[mmsi]['id'], aisObject[mmsi]['type_and_cargo']);
                var aisObj = {
                    'id': mmsi,
                    'object_type': "ais",
                    'marker_type': "ais-marker",
                    'latitude': aisObject[mmsi]['y'],
                    'longitude': aisObject[mmsi]['x'],
                    'marker_size': "8px",
                    'attributes': aisObject[mmsi],
                    'visible': showAIS,
                    'fillColor': shipCargoTypeObject['color'],
                    'outlineColor': shipCargoTypeObject['color']
                };

                objectArray.push(aisObj);
            }
        }
        
        return objectArray;
    }


    function renderFavoritesGroups() {
        var listArray = [];


    }


    function renderCameraGroups() {
        var listArray = [];


    }

    
    return (
        <div className={classes.root}>
            <CssBaseline />

            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
            
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>

                    <img
                        alt={"Logo"}
                        src={"./images/logo_inline.png"}
                        style={{height: "64px", maxHeight: "100%", maxWidth: "100%"}}
                    />

                    <div className={classes.grow} />

                    <div className={classes.sectionDesktop}>
                        <Tooltip title="Alerts" aria-label="Alerts">             
                            <IconButton aria-label="Alerts" color="inherit">
                                <Badge color="secondary">                                    
                                    <NotificationsIcon style={{color: "rgba(0, 0, 0, 0.54)"}} />                                    
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account" aria-label="Account">
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >                                
                                <AccountCircle style={{color: "rgba(0, 0, 0, 0.54)"}} />                                
                            </IconButton>
                        </Tooltip>
                    </div>

                    <div className={classes.sectionMobile}>
                        <Tooltip title="More Options" aria-label="More Options">
                            <IconButton
                                aria-label="show more"
                                aria-controls={mobileMenuId}
                                aria-haspopup="true"
                                onClick={handleMobileMenuOpen}
                                color="inherit"
                            >                            
                                <MoreVertIcon style={{color: "rgba(0, 0, 0, 0.54)"}} />                            
                            </IconButton>
                        </Tooltip>
                    </div>
                </Toolbar>

            </AppBar>

            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
                open={open}
            >

                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
            
                <Divider />

                
                {!showCameraGridView ?
                    <List className={classes.list}>
                        <Tooltip title="Camera Grid View" aria-label="Camera Grid View">
                            <ListItem button key="CameraGridView" onClick={handleCameraGridViewToggle}>
                                <ListItemIcon className={classes.listIcon}>
                                    <GridOnIcon />
                                </ListItemIcon>
                                <ListItemText primary="Camera Grid View" />
                            </ListItem>
                        </Tooltip>

                        <Divider />

                        <Tooltip title="Spills" aria-label="Cameras">
                            <ListItem button key="CamerasItem" onClick={handleShowCamerasClick} >                        
                                <ListItemIcon className={classes.listIcon}>
                                    <Badge color="primary" variant="dot" invisible={!showCameras}>                                    
                                        <VideocamIcon />                                    
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText primary="Cameras" />
                            </ListItem>
                        </Tooltip>                    

                        <Tooltip title="AIS" aria-label="AIS">
                            <ListItem button key="AISItem" onClick={handleShowAISClick} >
                                <ListItemIcon className={classes.listIcon}>
                                    <Badge color="primary" variant="dot" invisible={!showAIS}>                                    
                                        <DirectionsBoatIcon />                   
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText primary="AIS" />
                            </ListItem>
                        </Tooltip> 



                        <Divider />
                    </List>

                    :

                    <List className={classes.list}>
                        <Tooltip title="Map View" aria-label="Map View">
                            <ListItem button key="MapView" onClick={handleCameraGridViewToggle}>
                                <ListItemIcon className={classes.listIcon}>
                                    <MapIcon />
                                </ListItemIcon>
                                <ListItemText primary="Map View" />
                            </ListItem>
                        </Tooltip>

                        <Divider />
                    </List>
                }  

                

                {renderFavoritesGroups()}
                {renderCameraGroups()}

            </Drawer>

            <main className={classes.content}>
                <div className={classes.toolbar} />

                {(showCameraGridView ? 
                    <FavoritesPage 
                        loading={(Object.keys(props.favoritesData).length === 0)}
                        favoritesData={props.favoritesData}
                        cameraData={props.cameraData}
                        selectedCameraGroups={selectedCameraGroups}
                        onChangeFavorites={onFavoriteCameraClick}
                    />

                    :

                    <MapInterface 
                        center={center} 
                        zoom={zoom} 
                        objectArray={buildObjectArray(props.cameraData, props.aisData)}
                        showTraffic={showTraffic} 
                        onMapMove={onMapMove}
                        onMapMoveStop={onMapMoveStop}
                        onMapClick={onMapClick}
                        onGraphicClick={onGraphicClick}
                        onAISGraphicClick={onAISGraphicClick}
                        onCloseClickInfoWindow={onCloseClickInfoWindow}
                        onResetView={onResetView}
                    />                    
                )}
            </main>

            {renderMobileMenu}
            {renderMenu}

            <FavoritesDialog 
                open={(favoritesDialogCID !== undefined)}
                favoritesData={props.favoritesData}
                onDialogClose={handleFavoritesDialogClose}
                cameraID={favoritesDialogCID}
                onChangeFavoritesData={handleOnChangeFavoritesData}
            />
        </div>
    );

}


/*

{!showCameraGridView ?
                    <MenuItem onClick={handleCameraGridViewToggle}>
                        <IconButton aria-label="Camera Grid View" >
                            <GridOnIcon />
                        </IconButton>
                        <p>Camera Grid View</p>
                    </MenuItem>

                    :

                    <MenuItem onClick={handleCameraGridViewToggle}>
                        <IconButton aria-label="Map View" >
                            <MapIcon />
                        </IconButton>
                        <p>Map View</p>
                    </MenuItem>
                } 

{!showCameraGridView ?
                            <Tooltip title="Camera Grid View" aria-label="Camera Grid View">
                                <IconButton aria-label="Camera Grid View" onClick={handleCameraGridViewToggle} >
                                    <GridOnIcon />
                                </IconButton>
                            </Tooltip>

                            :

                            <Tooltip title="Map View" aria-label="Map View">
                                <IconButton aria-label="Map View" onClick={handleCameraGridViewToggle} >
                                    <MapIcon />
                                </IconButton>
                            </Tooltip>
                        }
                        */