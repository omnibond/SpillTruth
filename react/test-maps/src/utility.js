export function setAuthToken(token='', rememberMeFlag=false) {
    if ( rememberMeFlag ) {
        var exp = new Date();
        exp.setDate(exp.getDate() + 365);
        document.cookie = "auth=" + token + "; expires=" + exp.toUTCString();
    } else {
        document.cookie = "auth=" + token;
    }
}

export function getAuthToken() {
    var cookie = document.cookie;
    var c1 = cookie.split("; ");

    for (var i in c1) {
        if ( c1[i].split("=")[0] === "auth" ) {
            return c1[i].split("=")[1];
        }
    }

    return '';
}

export function getLoggedInUser() {
    var cookie = document.cookie;
    var c1 = cookie.split("; ");

    for (var i in c1) {
        if ( c1[i].split("=")[0] === "user" ) {
            return c1[i].split("=")[1];
        }
    }

    return '';
}


export function checkObjectDifferences(obj1, obj2) {
    // TODO
    
    return true;
}

export function checkIfCidInCameraGroups(cid, selectedGroups, cameraGroups) {
    for (var i = 0; i < selectedGroups.length; i++) {
        var sg = selectedGroups[i];
        if ( (sg in cameraGroups) && (cameraGroups[sg]['cameras'].indexOf(cid) >= 0) ) {
            return true;
        }
    }

    return false;
}

export function parseCameraGroupsInitials(groupName) {
    var initials = groupName[0];

    if ( groupName.length > 1 ) {
        var spaceIndex = groupName.indexOf(' ');
        if ( (spaceIndex >= 1) && (groupName.length > spaceIndex + 1) ) {
            initials += groupName[spaceIndex + 1];
        } else {
            initials += groupName[1];
        }
    }

    return initials;
}

export var shipCargoTypeAndColor = {
    'Base Station': "cyan",
    'Aids-to-Navigation': "yellow",
    'Wing-in-Ground Effects': "violet",
    'High-speed Crafts': "white",
    'Tugs & Special Crafts': "teal",
    'Fishing Vessels': "brown",
    'Towing Vessels': "pink",
    'Dredging & Diving Vessels': "purple",
    'Military Vessels': "red",
    'Passenger Vessels': "blue",
    'Pleasure & Sailing Crafts': "magenta",
    'Cargo Vessels': "green",
    'Tankers': "orange",
    'Others': "black",
    'Unknown': "grey"
};

export function parseShipCargoType(msgID, typeID) {
    if ( msgID === 4 ) {
        return {
            'type': 'Base Station',
            'color': shipCargoTypeAndColor['Base Station']
        };
    }

    if ( msgID === 21 ) {
        return {
            'type': 'Aids-to-Navigation',
            'color': shipCargoTypeAndColor['Aids-to-Navigation']
        };
    }

    if ( !typeID ) {
        return {
            'type': 'Unknown',
            'color': shipCargoTypeAndColor['Unknown']
        };
    }

    var typeIDString = typeID.toString();
    switch (typeIDString[0]) {
        case '2':
            return {
                'type': 'Wing-in-Ground Effects',
                'color': shipCargoTypeAndColor['Wing-in-Ground Effects']
            };

        case '3':
            if ( typeIDString[1] === '0' ) {
                return {
                    'type': 'Fishing Vessels',
                    'color': shipCargoTypeAndColor['Fishing Vessels']
                };
            }

            if ( typeIDString[1] === '1' || typeIDString[1] === '2' ) {
                return {
                    'type': 'Towing Vessels',
                    'color': shipCargoTypeAndColor['Towing Vessels']
                };
            }

            if ( typeIDString[1] === '3' || typeIDString[1] === '4' ) {
                return {
                    'type': 'Dredging & Diving Vessels',
                    'color': shipCargoTypeAndColor['Dredging & Diving Vessels']
                };
            }

            if ( typeIDString[1] === '5' ) {
                return {
                    'type': 'Military Vessels',
                    'color': shipCargoTypeAndColor['Military Vessels']
                };
            }

            if ( typeIDString[1] === '6' || typeIDString[1] === '7' ) {
                return {
                    'type': 'Pleasure & Sailing Crafts',
                    'color': shipCargoTypeAndColor['Pleasure & Sailing Crafts']
                };
            }

            if ( typeIDString[1] === '8' || typeIDString[1] === '9' ) {
                return {
                    'type': 'Unknown',
                    'color': shipCargoTypeAndColor['Unknown']
                };
            }
        break;

        case '4':
            return {
                'type': 'High-speed Crafts',
                'color': shipCargoTypeAndColor['High-speed Crafts']
            };

        case '5':
            return {
                'type': 'Tugs & Special Crafts',
                'color': shipCargoTypeAndColor['Tugs & Special Crafts']
            };

        case '6':
            return {
                'type': 'Passenger Vessels',
                'color': shipCargoTypeAndColor['Passenger Vessels']
            };

        case '7':
            return {
                'type': 'Cargo Vessels',
                'color': shipCargoTypeAndColor['Cargo Vessels']
            };

        case '8':
            return {
                'type': 'Tankers',
                'color': shipCargoTypeAndColor['Tankers']
            };

        case '9':
            return {
                'type': 'Others',
                'color': shipCargoTypeAndColor['Others']
            };

        default:
            return {
                'type': 'Unknown',
                'color': shipCargoTypeAndColor['Unknown']
            };
    }

}


export function parseShipCargoTypeForDataDisplay(typeID) {
    if ( typeID === 0 ) {
        return "N/A";
    }

    var typeArray = [
        ["", "", "", "", "", "", "", "", "", ""],
        ["Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved"],
        ["WIG", "WIG (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "WIG (Carrying DG, HS, MP,IMO hazard or pollutant category Y)", "WIG (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "WIG (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "WIG (Reserved)", "WIG (Reserved)", "WIG (Reserved)", "WIG (Reserved)", "WIG (No additional information)"],
        ["Vessel (Fishing)", "Vessel (Towing)", "Vessel (Towing length exceeding 200 m or breadth exceeds 25 m)", "Vessel (Dredging or underwater operations)", "Vessel (Diving operations)", "Vessel (Military operations)", "Vessel (Sailing)", "Vessel (Pleasure craft)", "Vessel (Reserved)", "Vessel (Reserved)"],
        ["HSC", "HSC (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "HSC (Carrying DG, HS, MP, IMO hazard or pollutant category Y)", "HSC (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "HSC (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "HSC (Reserved)", "HSC (Reserved)", "HSC (Reserved)", "HSC (Reserved)", "HSC (No additional information)"],
        ["Pilot vessel", "Search and rescue vessel", "Tug", "Port tender", "Vessel w/ anti-pollution facilities and equipment", "Law enforcement vessel", "Spare (local vessel)", "Spare (local vessel)", "Medical transport", "Ship and/or aircraft of states not parties to an armed conflict"],
        ["Passenger ship", "Passenger ship (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "Passenger ship (Carrying DG, HS, MP, IMO hazard or pollutant category Y)", "Passenger ship (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "Passenger ship (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "Passenger ship (Reserved)", "Passenger ship (Reserved)", "Passenger ship (Reserved)", "Passenger ship (Reserved)", "Passenger ship (No additional information)"],
        ["Cargo ship", "Cargo ship (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "Cargo ship (Carrying DG, HS, MP, IMO hazard or pollutant category Y)", "Cargo ship (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "Cargo ship (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "Cargo ship (Reserved)", "Cargo ship (Reserved)", "Cargo ship (Reserved)", "Cargo ship (Reserved)", "Cargo ship (No additional information)"],
        ["Tanker", "Tanker (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "Tanker (Carrying DG, HS, MP, IMO hazard or pollutant category Y)", "Tanker (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "Tanker (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "Tanker (Reserved)", "Tanker (Reserved)", "Tanker (Reserved)", "Tanker (Reserved)", "Tanker (No additional information)"],
        ["Other", "Other (Carrying DG, HS, MP, IMO hazard or pollutant category X)", "Other (Carrying DG, HS, MP, IMO hazard or pollutant category Y)", "Other (Carrying DG, HS, MP, IMO hazard or pollutant category Z)", "Other (Carrying DG, HS, MP, IMO hazard or pollutant category OS)", "Other (Reserved)", "Other (Reserved)", "Other (Reserved)", "Other (Reserved)", "Other (No additional information)"],
    ];

    var typeIDString = typeID.toString();

    return typeArray[typeIDString[0]][typeIDString[1]];
}