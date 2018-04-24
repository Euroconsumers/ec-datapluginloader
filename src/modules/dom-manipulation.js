import {getDomainName, getLibraryName, getVersionNumber} from './utilities';

/**
 * Load a specific stylesheet and add it to the DOM.
 * @function getStyle
 * @param {string} url - Url to a css stylesheet.
 * @return {Promise} A promise to know if it fails or succeed
 * @memberof module:ec-script-loader
 */
export function getStyle(url, canFail) {
    return new Promise((resolve, reject) => {
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
       link.onload = function () {
            resolve();
        }
        link.onerror = function (err) {
            if (canFail) {
                resolve()
            }
            else {
                console.warn(err);
                reject(err);
            }
        }
        head.appendChild(link);
    });
}

/**
 * Check the document in order to get the list of script that are already loaded. This is used to not load a script which was already loaded in a "classic" way.
 * It alters the scripts object (available in all the widget loader).
 * @function getAlreadyLoadedScripts
 * @param {object} scripts - Object containing all the scripts in the correct formatting. 
 * @param {string} cdnDomainName - CDN Domain name. This is used because we do not take care of scripts that are not coming from the current hostname NOR the CDN hostname
 * @memberof module:ec-script-loader
 */
export function getAlreadyLoadedScripts (scripts, cdnDomainName) {
    let loaded = document.querySelectorAll('script[src]');
    for (let element of loaded) {
        let source = element.src;
        //We do not rely on scripts that are not loaded from the CDN or the current domain.
        if (getDomainName(source) === cdnDomainName || getDomainName(source) === window.location.hostname) {
            scripts[getLibraryName(source)] = {
                version: [getVersionNumber(source)],
                promise: Promise.resolve()
            }
        }
    }
}

/**
 * Load a specific script and add it to the DOM.
 * @function getScript
 * @param {string} url - Url to a js script file.
 * @return {Promise} A promise to know if it fails or succeed
 * @memberof module:ec-script-loader 
 */
export function getScript (url) {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = false;
        document.body.appendChild(script);
        script.onload = function () {
            resolve();
        }
        script.onerror = function (err) {
            console.warn(e);
            reject(err);
        }
    })
}