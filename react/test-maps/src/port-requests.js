export function login(username='', password='') {
    var data = {
        username: username,
        password: password
    };

    return fetch(window.location.origin + '/login', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            //'X-Xsrf-Token': document.cookie('_xsrf')
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}



export function logout() {
    window.open(window.location.origin + '/logout',"_self");
}



export function getCameras() {
    var cameras = {
        'camera-1-sid': {
            'name': "Camera 1",
            'latitude': 33.7529314,
            'longitude': -118.2553935,
            'url_mjpeg': ""
        },
        'camera-2-sid': {
            'name': "Camera 2",
            'latitude': 33.7722374,
            'longitude': -118.2426467,
            'url_mjpeg': ""
        }
    };
    
    return fetch(window.location.origin + '/cameras', {
        method: 'GET',
        cache: 'no-cache'/*,
        headers: {
            'Content-Type': 'application/json'
        }*/
    }).then(response => response.text());
    //.then(response => JSON.stringify(cameras));//
}



export function getUserInfo() {
    return fetch(window.location.origin + '/userinfo', {
        method: 'GET',
        cache: 'no-cache'/*,
        headers: {
            'Content-Type': 'application/json'
        }*/
    }).then(response => response.text());
}



export function renewCameraToken(cameraID, token) {
    return fetch(window.location.origin + '/cameras/renewtoken?cid=' + cameraID, {
        method: 'GET',
        cache: 'no-cache',        
    });
}

export function getCameraToken(cameraID) {
    var data = {
        'endpoint_url': "",
        'token': "0b6995f3ecda4b9a9ef6b23085887790"
    };

    return fetch(window.location.origin + '/cameras/createtoken?cid=' + cameraID, {
        method: 'GET',
        cache: 'no-cache',        
    }).then(response => response.text());
    //.then(response => JSON.stringify(data));//
}








export function getFavorites() {
    var favorites = {
        'My Favorites': {'cameras': ['camera-1-sid'], 'color': "blue"},
        'Some more': {'cameras': ['camera-2-sid'], 'color': "black"},
        'GG': {'cameras': ['camera-1-sid', 'camera-2-sid'], 'color': "red"}
    };

    return fetch(window.location.origin + '/cameras/favorites', {
        method: 'GET',
        cache: 'no-cache'
    }).then(response => response.text());
    //.then(response => JSON.stringify(favorites));//
}

export function postFavorites(favorites) {
    return fetch(window.location.origin + '/cameras/favorites', {
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify(favorites)
    }).then(response => response.text());
}



export function getAIS() {
    return fetch(window.location.origin + '/ais', {
        method: 'GET',
        cache: 'no-cache'
    }).then(response => response.text());
}