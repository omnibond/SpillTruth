import React from 'react';
import { CirclePicker } from 'react-color';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { FavoriteCameraDisplay } from './info-window-ex.js';




const useStyles = makeStyles(theme => ({
    root: { 
        display: "flex", 
        justifyContent: "flex-start", 
        flexWrap: "wrap",
        padding: 5
    },
    loading: {
        display: "flex", 
        justifyContent: "center", 
        flexWrap: "wrap",
        padding: 5,
        fontWeight: "bold"
    },
    favoriteDisplay: {
        display: "inline-block",
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
        border: "1px solid #ededed",
        borderRadius: 5,
        boxShadow: "2px 2px 2px grey",
        padding: 2,
        backgroundColor: "#ededed",
        [theme.breakpoints.up('md')]: {
            padding: 5
        }
    },
    favoritesList: {
        minWidth: "300px"
    },
    favoritesListMain: {
        maxHeight: "200px",
        minHeight: "200px",
        minWidth: "300px"
    },
    dialogContent: {
        padding: "0 0 0 0"
    },
    favoritesTextField: {
        width: "200px"
    }
}));





export function FavoritesPage(props) {
    const classes = useStyles();

    function checkForCamerasToDisplay(favData, selectedGroups) {
        for (var i = 0; i < selectedGroups.length; i++) {
            var groupName = selectedGroups[i];

            if ( (groupName in favData) &&  favData[groupName]['cameras'].length > 0 ) {
                return true;
            }
        }

        return false;
    }

    function onFavoriteCameraClick(favoriteBool, cameraID) {
        props.onChangeFavorites(favoriteBool, cameraID);
    }

    function renderFavoriteCameras(favData, camData, selectedGroups) {
        var displayArray = [],
            camsDisplayed = [];

        for (var i = 0; i < selectedGroups.length; i++) {
            var groupName = selectedGroups[i];

            if ( groupName in favData ) {
                var favCameras = favData[groupName]['cameras'];

                for (var j = 0; j < favCameras.length; j++) {
                    var cid = favCameras[j];

                    if ( (cid in camData) && (camsDisplayed.indexOf(cid) === -1) ) {
                        displayArray.push(
                            <div key={cid} className={classes.favoriteDisplay}>
                                <FavoriteCameraDisplay
                                    title={camData[cid]['name']} 
                                    cameraID={cid}
                                    favorited={true}
                                    showFramerate={true}
                                    onClickFavoriteButton={onFavoriteCameraClick}
                                />
                            </div>
                        );

                        camsDisplayed.push(cid);
                    }
                }
            }
        }

        return displayArray;
    }

    return (
        ( (props.selectedCameraGroups.length === 0) || (Object.keys(props.favoritesData).length === 0) ) ? 
        
            <div className={classes.loading}>   
                <Typography variant="h6" gutterBottom>
                    Select cameras to view.
                </Typography>
            </div>

            :

            <div className={classes.root}>
                {renderFavoriteCameras(props.favoritesData, props.cameraData, props.selectedCameraGroups)}
            </div>
        
    );
}








export function FavoritesDialog(props) {
    const classes = useStyles();

    const [showBodyDisplay, setShowBodyDisplay] = React.useState("list");
    const [createFavoritesInput, setCreateFavoritesInput] = React.useState("");
    const [createFavoritesColor, setCreateFavoritesColor] = React.useState("#000000");
    const [editFavoritesInput, setEditFavoritesInput] = React.useState("");
    const [removeGroupName, setRemoveGroupName] = React.useState("");


    function handleClose() {
        setShowBodyDisplay("list");
        props.onDialogClose();
    }

    const handleCheckboxToggle = groupName => () => {
        var index = props.favoritesData[groupName]['cameras'].indexOf(props.cameraID);
        if ( index !== -1 ) {
            props.favoritesData[groupName]['cameras'].splice(index, 1);
        } else {
            props.favoritesData[groupName]['cameras'].push(props.cameraID);
        }
        props.onChangeFavoritesData(props.favoritesData);
    }

    const handleEditFavoritesClick = groupName => () => {
        setEditFavoritesInput(groupName);
        setShowBodyDisplay(groupName);
    }

    function handleCreateFavoritesGroupButtonClick() {
        setShowBodyDisplay("create");
    }

    const handleOnChangeCreateFavoritesInput = event => {
        setCreateFavoritesInput(event.target.value);
    }

    const handleOnChangeEditFavoritesInput = event => {
        setEditFavoritesInput(event.target.value);
    }

    function handleOnClickEditFavoritesGroup() {
        var oldGroupName = showBodyDisplay,
            newGroupName = editFavoritesInput,
            color = createFavoritesColor;

            if ( (newGroupName !== "") && (oldGroupName in props.favoritesData) ) {
                var temp = props.favoritesData[oldGroupName];
                delete props.favoritesData[oldGroupName];
                props.favoritesData[newGroupName] = temp;
                props.favoritesData[newGroupName]['color'] = color;

                props.onChangeFavoritesData(props.favoritesData);
                setShowBodyDisplay("list");
            }
    }

    function handleOnChangeCreateFavoritesColor(color, event) {
        setCreateFavoritesColor(color['hex']);
    }

    function handleOnClickCreateFavoritesGroup() {
        var groupName = createFavoritesInput,
            color = createFavoritesColor;

        if ( groupName !== "" ) {
            if ( groupName in props.favoritesData ) {
                if ( props.favoritesData[groupName]['cameras'].indexOf(props.cameraID) !== -1 ) {
                    props.favoritesData[groupName]['cameras'].push(props.cameraID);
                }
            } else {
                props.favoritesData[groupName] = {
                    'cameras': [props.cameraID],
                    'color': color
                };
            }

            props.onChangeFavoritesData(props.favoritesData);
            setShowBodyDisplay("list");
        }
    }

    function handleOnClickRemoveFavoritesGroup() {
        var groupName = removeGroupName;
        if ( groupName in props.favoritesData ) {
            delete props.favoritesData[groupName];
        }

        props.onChangeFavoritesData(props.favoritesData);
        setShowBodyDisplay("list");
    }

    function handleOnClickCancel() {
        setShowBodyDisplay("list");
    }

    const handleRemoveFavoritesGroupsButtonClick = groupName => () => {
        setRemoveGroupName(groupName);
        setShowBodyDisplay("remove");
    }

    function renderBodyDisplay() {
        if ( showBodyDisplay === 'list' ) {
            return (
                <List className={classes.favoritesListMain}>
                    {renderFavoritesList()}
                </List>
            );  
        }

        if ( showBodyDisplay === 'create' ) {
            return renderCreateFavoritesDisplay();
        }

        if ( showBodyDisplay === 'remove' ) {
            return renderRemoveSelectedDisplay();
        }

        return renderManageFavoritesGroupDisplay();        
    }

    function renderCreateFavoritesDisplay() {
        return (
            <div className={classes.favoritesListMain}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <TextField
                        required
                        id="create-new-favorites-group"
                        aria-label="new favorites group name input"
                        label="Name"
                        className={classes.favoritesTextField}
                        margin="normal"
                        variant="outlined"
                        value={createFavoritesInput}
                        onChange={handleOnChangeCreateFavoritesInput}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", marginTop: "10px" }}>
                    <CirclePicker 
                        colors={['#000000', '#FF0000', '#00FF00', '#0000FF', 'orange', 'purple']}
                        onChange={handleOnChangeCreateFavoritesColor}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Button
                        disabled={(createFavoritesInput === "")}
                        variant="contained"
                        color="primary"
                        aria-label="create new favorites group"
                        onClick={handleOnClickCreateFavoritesGroup}
                    >
                        Create
                    </Button>

                    <Button
                        variant="contained"
                        color="default"
                        aria-label="cancel new favorites group"
                        onClick={handleOnClickCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    function renderManageFavoritesGroupDisplay() {
        return (
            <div className={classes.favoritesListMain}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <TextField
                        required
                        id="edit-favorites-group"
                        aria-label="edit existing favorites group name input"
                        label="Name"
                        className={classes.favoritesTextField}
                        margin="normal"
                        variant="outlined"
                        value={editFavoritesInput}
                        onChange={handleOnChangeEditFavoritesInput}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", marginTop: "10px" }}>
                    <CirclePicker 
                        colors={['#000000', '#FF0000', '#00FF00', '#0000FF', 'orange', 'purple']}
                        onChange={handleOnChangeCreateFavoritesColor}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Button
                        disabled={( (editFavoritesInput === "") )}
                        variant="contained"
                        color="primary"
                        aria-label="confirm edit existing favorites group"
                        onClick={handleOnClickEditFavoritesGroup}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="default"
                        aria-label="cancel new favorites group"
                        onClick={handleOnClickCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    function renderRemoveSelectedDisplay() {
        return (
            <div className={classes.favoritesListMain} style={{ display: "flex", justifyContent: "space-around", flexDirection: "column" }}> 
                
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="h6" gutterBottom>
                        Remove {removeGroupName}?
                    </Typography>  
                </div>

                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        aria-label="confirm removing selected groups button"
                        onClick={handleOnClickRemoveFavoritesGroup}
                    >
                        Remove
                    </Button>

                    <Button
                        variant="contained"
                        color="default"
                        aria-label="cancel removing selected groups button"
                        onClick={handleOnClickCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    function renderFavoritesList() {
        var listArray = [],
            groups = Object.keys(props.favoritesData);

        for (var i = 0; i < groups.length; i++) {
            listArray.push(
                <ListItem key={groups[i]} role={undefined} dense button onClick={handleCheckboxToggle(groups[i])}>
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={props.favoritesData[groups[i]]['cameras'].indexOf(props.cameraID) !== -1}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-label': groups[i] }}
                            color="primary"
                        />
                    </ListItemIcon>
                    <ListItemText id={groups[i]} primary={groups[i]} />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={handleRemoveFavoritesGroupsButtonClick(groups[i])}>
                            <DeleteIcon />
                        </IconButton>

                        <IconButton edge="end" aria-label="edit" onClick={handleEditFavoritesClick(groups[i])}>
                            <CreateIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            );
        }

        return listArray;
    }

    return (
        <Dialog onClose={handleClose} open={props.open} aria-labelledby="favorites-dialog-title" fullWidth={false} maxWidth="lg">
            <DialogContent dividers className={classes.dialogContent}>
                <List className={classes.favoritesList}>
                    <ListItem key="header" role={undefined} dense>
                        <ListItemText primary="Favorites" />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="close favorites dialog" onClick={handleClose}>
                                <ClearIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>                 
                </List>
            </DialogContent>
            
            <DialogContent dividers className={classes.dialogContent}>
                {renderBodyDisplay()}
            </DialogContent>
           
            <DialogContent dividers className={classes.dialogContent}>
                <List className={classes.favoritesList}>
                    <ListItem key="create favorites group" role={undefined} dense button onClick={handleCreateFavoritesGroupButtonClick}>
                        <ListItemIcon>
                            <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary="Create Favorites Group" />
                    </ListItem>
                </List>
            </DialogContent>

        </Dialog>
    );
}