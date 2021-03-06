/* global postRobot */ // tell eslint that postRobot is globally defined
/* global Cookies */ // tell eslint that Cookies is globally defined
console.log('[DEBUG - SAMI] loading storedDataManager.js')
console.log('[DEBUG - SAMI] postRobot loaded: ', postRobot);
var localStorageEnabled = false;

// source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
    var storage;
    var x;
    try {
        storage = window[type];
        x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

if (storageAvailable('localStorage')) {
    localStorageEnabled = true;
}

function setCookie(name, value, attributes) {
    Cookies.set(name, value, attributes);
}

function setLocalStorage(name, value) {
    if (localStorageEnabled) {
        sessionStorage.setItem(name, value);
    }
}

function getCookie(name) {
    return Cookies.get(name) || null;
}

function getLocalStorage(name) {
    console.log('[DEBUG - SAMI] getLocalStorage', name);
    // if (localStorageEnabled) {
    return sessionStorage.getItem(name);
    // }

    // return null;
}

function clearCookie(name) {
    Cookies.remove(name);
}

function clearLocalStorage(name) {
    if (localStorageEnabled) {
        localStorage.removeItem(name);
    }
}

function checkStorageThenCookie(name) {
    console.log('[DEBUG - SAMI] checkStorageThenCookie', name);
    return getLocalStorage(name) // || getCookie(name);
}

let TokenBoi;

postRobot.on('setData', function prSetData(event) {
    var daysToExpire = event.data.daysToExpire || 3650; // default to 10yr, like sso cookie
    var domain = event.data.domain || '.shoprunner.com'; // default to .shoprunner.com base domain

    if (event.data.name && event.data.value) {
        setCookie(event.data.name, event.data.value, {
            expires: daysToExpire,
            domain: domain,
        });

        if (document.hasStorageAccess && document.requestStorageAccess) {
            document.hasStorageAccess().then(hasAccess => {
                if (!hasAccess) {
                    return document.requestStorageAccess();
                    console.log('[DEBUG - SAMI] requested access');
                }
            }).then(() => {
                console.log('[DEBUG - SAMI] set in local storage with access');
                setLocalStorage(event.data.name, event.data.value);
                console.log('[DEBUG - SAMI] [][][][][][][][][][][][][][][][][][][]][][][]]');
            })
        }

        console.log('[DEBUG - SAMI] setData in io');
        // setLocalStorage(event.data.name, event.data.value);

        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name and value are required in all setCookie calls');
});

postRobot.on('getData', function prGetData(event) {
    console.log('[DEBUG - SAMI] getData postRobot', event);
    if (event.data.name) {
        console.log('DEBUG ???? +++++ !!!!! ~~~~');
        if (document.hasStorageAccess && document.requestStorageAccess) {
            document.hasStorageAccess().then(hasAccess => {
                console.log('[DEBUG - SAMI] HAS ACCESS', hasAccess);
                if (!hasAccess) {
                    console.log('[DEBUG - SAMI] NO ACCESS');
                    console.log(document.requestStorageAccess());
                    return document.requestStorageAccess();
                }
            }).then(() => {
                console.log('[DEBUG - SAMI] THEN WHAT?????');
                const token = localStorage.getItem('sr_ssotoken');
                console.log('[DEBUG - SAMI] get token from local storage with access!!!!!!!!!!!!!!!', token);
            })
        }



        // if (event.data.cookieOnly) {
        //     return {
        //         value: getCookie(event.data.name),
        //     };
        // }
        console.log('[DEBUG]checking local storage in efodi.github.io storedData Manager: ', checkStorageThenCookie(event.data.name));
        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name is required in all getCookie calls');
});

postRobot.on('clearData', function prClearData(event) {
    if (event.data.name) {
        clearCookie(event.data.name);
        clearLocalStorage(event.data.name);
        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name is required in all clearCookie calls');
});