import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
//import FormGroup from '@material-ui/core/FormGroup';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
//import Checkbox from '@material-ui/core/Checkbox';
import './login-interface.css';

export class LoginInterface extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'username': "",
            'password': "",
            'rememberMeChecked': false
        };
    }

    componentWillUnmount() {
        this.setState({
            'username': "",
            'password': "",
            'rememberMeChecked': false
        });
    }

    handleUsernameTextFieldChange = (e) => {
        this.setState({ 
            'username': e.target.value
        });
        this.props.onInputChanged(e.target.value, this.state.password);
    }

    handleUsernameTextFieldKeyDown = (e) => {
        if ( e.keyCode === 13 ) {
            this.handleLoginButtonClick(e);
        }
    }

    handlePasswordTextFieldChange = (e) => {
        this.setState({ 
            'password': e.target.value
        });
        this.props.onInputChanged(this.state.username, e.target.value);
    }

    handlePasswordTextFieldKeyDown = (e) => {
        if ( e.keyCode === 13 ) {
            this.handleLoginButtonClick(e);
        }
    }

    handleRememberMeChanged = (e) => {
        this.setState({
            'rememberMeChecked': e.target.checked
        });
    }

    handleLoginButtonClick = (e) => {
        if ( this.state.username && this.state.password ) {
            this.props.onLogin(this.state.username, this.state.password, this.state.rememberMeChecked);            
        }
    }

    render() {
        return (
            <div className="login-interface">
                <div className="center-column">
                    <div className="login-dialog">
                        <div>
                            <form className="" autoComplete="off">
                                <TextField 
                                    id="username"
                                    label="Username"
                                    className="text-field"
                                    autoFocus={true}
                                    value={this.state.username}
                                    disabled={this.props.loginInProgress}
                                    required={true}
                                    margin="normal"
                                    variant="outlined"
                                    onChange={this.handleUsernameTextFieldChange}
                                    onKeyDown={this.handleUsernameTextFieldKeyDown}
                                />

                                <TextField 
                                    id="password"
                                    label="Password"
                                    className="text-field"
                                    value={this.state.password}
                                    disabled={this.props.loginInProgress}
                                    required={true}
                                    type="password"
                                    margin="normal"
                                    variant="outlined"
                                    onChange={this.handlePasswordTextFieldChange}
                                    onKeyDown={this.handlePasswordTextFieldKeyDown}
                                />
                                
                                
                                <Button 
                                    variant="contained"
                                    className="login-button"
                                    color="primary"
                                    disabled={this.props.loginButtonDisabled}
                                    onClick={this.handleLoginButtonClick}
                                >
                                    {( this.props.loginInProgress ? <CircularProgress size={24}/> : "Login" )}
                                </Button>
                            </form>

                            {( this.props.showMessage ? <div className="login-message">{this.props.message}</div> : <div></div>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

/*
<FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={this.state.rememberMeChecked} onChange={this.handleRememberMeChanged} value="rememberMeCheckBox" color="primary" />
                                        }
                                        label="Remember me"
                                    />
                                </FormGroup>
                                */