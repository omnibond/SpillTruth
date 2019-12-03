import React from 'react';
import { LoginInterface } from './login-interface.js';
import { login } from './port-requests.js';
//import { setAuthToken } from './utility.js';
import './port-login-interface.css';

export class PortLoginInterface extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'loginButtonDisabled': true,
            'loginInProgress': false,
            'showMessage': false,
            'message': ""
        };
    }

    componentWillUnmount() {
        this.setState({
            'loginButtonDisabled': true,
            'loginInProgress': false,
            'showMessage': false,
            'message': ""
        });
    }

    handleOnLoginInputChanged = (username, password) => {
        this.setState({
            'loginButtonDisabled': (username === "" || password === "")
        });
    }

    handleOnLogin = (username, password, rememberMeFlag) => {
        this.setState({
            'loginButtonDisabled': true,
            'loginInProgress': true,
            'showMessage': false,
            'message': ""
        });

        login(username, password)
        .then(

            (result) => {
                console.log(result);
            },

            (error) => {
                console.error(error);
                this.setState({
                    'loginButtonDisabled': false,
                    'loginInProgress': false,
                    'showMessage': true,
                    'message': "Username / Password is incorrect."
                });
            }
        );
    }

    render() {
        return <LoginInterface 
            onInputChanged={this.handleOnLoginInputChanged}
            onLogin={this.handleOnLogin} 
            loginInProgress={this.state.loginInProgress} 
            loginButtonDisabled={this.state.loginButtonDisabled}
            showMessage={this.state.showMessage}
            message={this.state.message}
        />;
    }
}