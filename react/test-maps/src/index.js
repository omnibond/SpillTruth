import React from 'react';
import ReactDOM from 'react-dom';
//import { Route, HashRouter as Router } from 'react-router-dom'
//import CircularProgress from '@material-ui/core/CircularProgress';
//import { PortLoginInterface } from './port-login-interface.js';
import { getCameras, getUserInfo, getFavorites, postFavorites, getAIS } from './port-requests.js';
import { MapPage } from './map-page.js';
//import { pulseVerify } from './pulse-requests.js';
import { checkObjectDifferences } from './utility.js';
import { logout } from './port-requests.js';
import './index.css';

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.updateCamerasTimer = null;
        this.updateAISTimer = null;
        this.updateFavoritesTimer = null;

        this.state = {
            'cameras': {},
            'ais': {},
            'userinfo': {
                'first_name': "User"
            },
            'favorites': {},
            'cameraGroups': {}
        };
    }

    componentDidMount() {
        var self = this;

        self.getUserInfoRequest();
        self.getCamerasRequest();
        self.getFavoritesRequest();
        self.getAISRequest();

        this.updateCamerasTimer = window.setInterval(function() {
            self.getCamerasRequest();
        }, 300000);

        this.updateAISTimer = window.setInterval(function() {
            self.getAISRequest();
        }, 300000);

        this.updateFavoritesTimer = window.setInterval(function() {
            self.getFavoritesRequest();
        }, 300000);
    }

    componentWillUnmount() {
        window.clearInterval(this.updateCamerasTimer);
    }

    getCamerasRequest() {
        getCameras()
        .then(

            (successResponse) => {
                try {
                    var data = JSON.parse(successResponse);
                    // Check for differences and only then setState
                    if ( checkObjectDifferences(this.state.cameras, data) ) {
                        var newState = Object.assign({}, this.state, {
                            'cameras': data
                        });
                        this.setState(newState);
                    }
                } catch(e) {
                    console.log(e);
                }
            },

            (errorResponse) => {
                console.log(errorResponse);
            }

        );
    }

    getUserInfoRequest() {
        getUserInfo()
        .then(

            (successResponse) => {
                try {
                    var data = JSON.parse(successResponse);                   
                    var newState = Object.assign({}, this.state, {
                        'userinfo': data
                    });
                    this.setState(newState);
                } catch(e) {
                    console.log(e);
                }
            },

            (errorResponse) => {
                console.log(errorResponse);
            }

        );
    }

    getFavoritesRequest() {
        getFavorites()
        .then(

            (successResponse) => {                
                try { 
                    var data = JSON.parse(successResponse);
                    var newState = Object.assign({}, this.state, {
                        'favorites': data
                    });

                    this.setState(newState);
                } catch(e) {
                    console.log(e);
                }
            },

            (errorResponse) => {
                console.log(errorResponse);
            }

        );
    }

    postFavoritesRequest(newFavorites) {
        postFavorites(newFavorites)
        .then(

            (successResponse) => {
                try {
                    var newState = Object.assign({}, this.state, {
                        'favorites': newFavorites
                    });

                    this.setState(newState);
                } catch(e) {
                    console.log(e);
                }
            },

            (errorResponse) => {
                console.log(errorResponse);
            }
        );
    }

    getAISRequest() {
        getAIS()
        .then(

            (successResponse) => {
                try {
                    var data = JSON.parse(successResponse);
                    var newState = Object.assign({}, this.state, {
                        'ais': data
                    });

                    this.setState(newState);
                } catch(e) {
                    console.log(e);
                }
            },

            (errorResponse) => {
                console.log(errorResponse);
            }

        );
    }


    onChangeFavorites = (newFavorites) => {
        this.postFavoritesRequest(newFavorites);
    }

    handleLogout = () => {
        logout();
    }

    render() {
        return <MapPage 
            userName={this.state.userinfo.first_name}
            cameraData={this.state.cameras}
            aisData={this.state.ais}
            favoritesData={this.state.favorites}
            cameraGroups={this.state.cameraGroups}
            onChangeFavorites={this.onChangeFavorites}
            onLogout={this.handleLogout} 
        />; 
    }
}

// ============================================
/*const routing = (
    <Router>
        <div>
            <Route exact path="/" component={Main} />
            <Route path="/login" component={PortLoginInterface} />
        </div>
    </Router>
)*/

// =============================================

ReactDOM.render(
    <Main />,
    document.getElementById('root')
);