/**
 * return the name of the library in the given path.(The filename without its extension)
 * @function getLibraryName
 * @param {string} path - Path to the library
 * @return  {string} The library name
 * @memberof module:ec-script-loader 
 */
export function getLibraryName(path) {
    let begin = path.lastIndexOf('/') + 1,
        end = path.lastIndexOf('.');
    if (begin >= end) {
        console.error(`"${path}" is not a correct path.`);
        return undefined;
    }

    let libraryName = path.substring(begin, end);

    const version = libraryName.match(/-(\d+\.)?(\d+\.)?(\*|\d+)/)
    //remove the version if it's part of the name
    if (version) {
        libraryName = libraryName.split(version[0])[0];
    }
    //Remove the known extension used for minification.
    libraryName = libraryName.split('.min')[0].split('.pack')[0];

    return libraryName;
}

/**
* return the version number of the file in the given path. This version number is retrieved by searching in the before last part of the page
* @param {string} path  - Path to the library (it should contain the version number)
* @return {string} The version number
* @function getVersionNumber
* @memberof module:ec-script-loader 
*/
export function getVersionNumber(path) {
    var version = path.match(/(\d+\.)?(\d+\.)?(\*|\d+)/g)
    return version ? version.slice(-1)[0] : 'dist';
}

/**
* return the extension of the file in the given path.
* @function getFileExtension
* @param {string} path - File path
* @return {string} The file extension or undefined.
* @memberof module:ec-script-loader
*/
export function getFileExtension(path) {
    let index = path.lastIndexOf('.');
    if (index === -1 || index === path.length - 1) {
        console.error(`"${path}" is not a correct url.`);
        return undefined;
    }
    return path.slice(index + 1);
}

/**
* return the hostname of the given url (or the one from window.location if the path is relative)
* @param {script} url - The url in which we will exclude the hostname
* @function getDomainName
* @return {string} - The domain name 
* @memberof module:ec-script-loader
*/
export function getDomainName(url) {
    //This is only to handle the file that might be added to the DOM by an extension. Other exception might appear in the future.
    if (url.startsWith('chrome-extension://')) {
        return 'chrome-extension://';
    }

    let parts = url.replace(/http(s?):\/\//, '').split('/');
    if (parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)) {
        return parts[0];
    }
    //If the url does not contains a domain name, it means it's relative, we can return the hostname of the window location in this case.
    return window.location.hostname;
}

/**
 * Remove the hostname (and protocol) of the given url (if apply) then add the hostname passed as argument.
 * @function changeUrlHostname
 * @param {string} url - Url to clean
 * @param {string} hostname - the hostname where the  url should be transfered. 
 * @return {string} The url with the defined hostname.
 * @memberof module:ec-script-loader
 */
export function changeUrlHostname(url,hostname) {
    //Remove the protocol then split on '/'. the goal of removing the protocol is to facilitate the split on '/'. 
    let parts = url.replace(/http(s?):\/\//, '').split('/');

    //If the first part of a url is a hostname, remove it and rebuild the url. 
    if (parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)) {
        parts.splice(0, 1);
        url = `${parts.join('/')}`;
    }
    if(url.indexOf('/') != 0 ){
        url= `/${url}`;
    }
    //Prepend the CDN Url
    return `${hostname}${url}`;
}