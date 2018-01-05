/**
 * Euroconsumers Script Loader 
 * @module ec-script-loader
 * @author Raphaël Desaegher (belux\rds) <rdesaegher@test-achats.be>
 * @license LGPL-3.0
 */
(function (window, document, jQuery) {

    'use strict';

    /**
     * jQuery script path
     * @constant
     * @default {@link https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.4/jquery-2.1.4.min.js }
     * @type {string}
     * @memberof module:ec-script-loader
     */
    const jQueryPath = "https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.4/jquery-2.1.4.min.js";

    let jQueryPromise,
        cdnUrl,
        scripts = {},
        styles = []

    window.loadScriptsAndWidgets = async (options) => {
        cdnUrl = options.cdnUrl || 'https://cdn.euroconsumers.org';

        //Check which scripts are already loaded
        getAlreadyLoadedScripts();
        
        //wait that jQuery is loaded before starting
        await jQueryPromise;

        //Load and initialize all the widgets.
        processWidgets(options);

    }

    /**
     * TODO
     * @param {*} options 
     */
    const processWidgets = async (options) => {
        //Load jQuery UI
        await Promise.all(loadjQueryUI(options));

        //Get all the widgets
        const widgets = await getWidgets(options);

        for (let widget in widgets) {
            loadAndInitializeWidget(widgets[widget]);
        }
    }

    /**
     * Load the jQuery UI needed scripts and styles. 
     * @function loadjQueryUi
     * @param {string[]} jQueryUI - Paths of the different parts of jQuery UI needed  
     * @memberof module:ec-script-loader 
     * @return {Promise[]} An array containing a promise for each script or style loaded.
     */
    const loadjQueryUI = ({ jQueryUI }) => {
        let promises = [];
        for (let item of jQueryUI) {
            let extension = getFileExtension(item);
            if (extension === 'js') {
                promises.push(getScript(convertUrlToCDNUrl(item)));
            }
            else if (extension === 'css') {
                promises.push(getStyle(convertUrlToCDNUrl(item)));
            }
            else {
                console.error(`Error in jQuery UI loading : "${item}" does not have a valid file extension. Accepted extensions are "js" or "css"`);
            }
            getScript
        }
        return promises;
    }

    /**
     * Return the list of widgets present on the page
     * @param {string} widgetVersionUrl - Url to the widget version's file. This is basically a JSON file containing the name of all widgets and their version as key-value pair.
     * @memberof module:ec-script-loader 
     * @async
     * @return {Object} The list of widgets present on the page
     * @function getWidgets
     */
    const getWidgets = async ({ widgetVersionUrl }) => {
        let dataWidgets = document.body.querySelectorAll('[data-plugin],[data-widget]'),
            widgets = {},
            versionList = await getWidgetVersionList(widgetVersionUrl);

        for (let item of dataWidgets) {

            //if the widget is already initialized, skip it
            if (item.classList.contains('has-plugin') || item.classList.contains('has-widget')) continue;

            // Manipulate a bit the name to reformat it correctly. 
            // The behavior is that if a plugin contains an uppercase, this uppercase is replace by a dash and the letter in lowercase.
            // The manipulation here is done to get back the correct file names and path

            let name = item.getAttribute('data-plugin') || item.getAttribute('data-widget'),
                nameParts = name.split('-');
            nameParts.forEach((entry, index, array) => {
                if (index !== 0) {
                    array[index] = entry.charAt(0).toUpperCase() + entry.slice(1);
                }
            });
            name = nameParts.join('');
            let version = versionList[name];

            //Create the list of widgets
            if (widgets.hasOwnProperty(name)) {
                widgets[name].elements.push(item);
            } else {
                widgets[name] = { name: name };
                widgets[name].elements = [item];

                // build the differents urls from the widget
                let rootUrl = `${cdnUrl}/vendor/euroconsumers/ec-${name}/${version}/`;
                widgets[name].urls = {
                    script: `${rootUrl}ec-${name}.min.js`,
                    style: `${rootUrl}ec-${name}.min.css`,
                    dependencies: `${rootUrl}dependencies.json`
                }

            }
        }
        return widgets;
    }

    /**
     * Get the list containing the version of all the widgets existing in {@link https://design.euroconsumers.org/Common/widgets/}.
     * @param {string} widgetVersionUrl - Url to the widget version file. This url is not modified so it can be really specific to the site using it.
     * @return {Promise} A promise wich resolve in the list of widgets with the number of their latest version.
     * @async
     * @function getWidgetVersionList
     * @memberof module:ec-script-loader
     */
    const getWidgetVersionList = async (widgetVersionUrl) => {
        let response = await fetch(widgetVersionUrl);
        if (response.ok) {
            return response.json();
        }
        console.error(`${widgetVersionUrl} is not a valid url`)
        return undefined;
    }

    /**
     * TODO
     * @param {*} widget 
     */
    const loadAndInitializeWidget = async (widget) => {
        let dependencies = await getDependencies(widget.urls.dependencies);
        let widgetScript = {
            version: [getVersionNumber(widget.urls.script)],
            dependencies: []
        };

        //Manage the JS dependencies
        for (let dependency of dependencies.js) {
            let name = getLibraryName(dependency);
            let version = getVersionNumber(dependency);

            //Check if this library was already loaded
            if (scripts[name] && scripts[name].version.indexOf(version) === -1) {
                scripts[name].version.push(version);
                console.warn(`Conflit in dependencies : you are trying to load more than one version of ${name}. Here is the list of version found until now : ${scripts[name].version.concat(' - ')}`);
            } else if (!scripts[name]) {
                scripts[name] = {
                    version: [version],
                    promise: getScript(dependency)
                }
            }
            widgetScript.dependencies.push[scripts[name.promise]];
        }

        //Manage the CSS dependencies
        for (let style of dependencies.css) {
            getStyle(style);
        }
        getStyle(widget.urls.style,true);

        await Promise.all(widgetScript.dependencies);

        widgetScript.promise = getScript(widget.urls.script);
        scripts[widget.name] = widgetScript;   

        await widgetScript.promise;

        initializeWidget(widget);
    }

    /**
     * TODO
     * @param {*} dependenciesUrl 
     */
    const getDependencies = async (dependenciesUrl) => {
        let dependencies = {
            js: [],
            css: []
        };

        const response = await fetch(dependenciesUrl);
        if (response.ok) {
            const json = await response.json();

            //New structure example. this can be used as test.
            // const json = [
            //     "/vendor/zxcvbn/4.4.2/dist/zxcvbn.min.js",
            //     "/vendor/euroconsumers/ec-loadingbar/0.0.1/ec-loadingbar.min.css",
            //      "cdn.google.com/script/1.0.0/script.js"
            // ];

            /********************************************************************************************************************************
            * This code handle the new structure of the dependencies.json files. This structure is currently not implemented in any widget.  *
            * The new structure looks like this the example in the previous comment                                                         *
            *********************************************************************************************************************************/
            if (Array.isArray(json)) {
                for (let dependency of json) {
                    dependencies[getFileExtension(dependency)].push(convertUrlToCDNUrl(dependency));
                }
                return dependencies;
            }
            /********************************************************************************
            * This code only exist to support the old structure.                            *
            * Once all the widgets are migrated to the new structure it can be removed.     *
            * Replace it with an error message                                              *
            *********************************************************************************/
            for (let type in json) {
                if (json.hasOwnProperty(type)) {
                    for (let dependency in json[type]) {

                        if (typeof json[type][dependency] !== 'string') {
                            for (let subdependency in json[type][dependency]) {
                                if (typeof json[type][dependency][subdependency] !== 'string') {
                                    for (let subsubdependency in json[type][dependency][subdependency]) {
                                        dependencies[type].push(convertUrlToCDNUrl(json[type][dependency][subdependency][subsubdependency]));
                                    }
                                } else {
                                    dependencies[type].push(convertUrlToCDNUrl(json[type][dependency][subdependency]));
                                }
                            }
                        }
                        else {
                            dependencies[type].push(convertUrlToCDNUrl(json[type][dependency]));
                        }
                    }
                }
            }
        } else {
            console.error(`Unable to get ${dependenciesUrl}. No dependencies will be loaded for this widget.`)
        }
        return dependencies;
    }

    /**
     * TODO
     */
    const initializeWidget = (widget) => {
        for (let element of widget.elements) {
            let $element = $(element);
            //Check if the widget does have settings or not. And use them if apply.
            let widgetSettingsElement = $element.data('plugin-settings') || $element.data('widget-settings');
            if (widgetSettingsElement) {
                let settings = JSON.parse($(widgetSettingsElement).text());
                $element[widget.name](settings);
            } else {
                $element[widget.name]();
            }
        }
    }

    /**
     * TODO
     */
    const getAlreadyLoadedScripts = () => {
        let loaded = document.querySelectorAll('script[src]');
        for(let element of loaded){
            let source = element.src;
            if(getDomainName(source) === getDomainName(cdnUrl) || getDomainName(source) === window.location.hostname){
                scripts[getLibraryName(source)] = {
                    version : [getVersionNumber(source)],
                    promise : Promise.resolve()
                }
            }   
        }
    }
    
    // #region Utilities

    /**
     * Load a specific script and add it to the DOM.
     * @function getScript
     * @param {string} url - Url to a js script file.
     * @return {Promise} A promise to know if it fails or succeed
     * @memberof module:ec-script-loader 
     */
    const getScript = (url) => {
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

    /**
     * Load a specific stylesheet and add it to the DOM.
     * @function getStyle
     * @param {string} url - Url to a css stylesheet.
     * @return {Promise} A promise to know if it fails or succeed
     * @memberof module:ec-script-loader
     */
    const getStyle = (url,canFail) => {
        return new Promise((resolve, reject) => {
            let head = document.getElementsByTagName('head')[0];
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.media = 'all';
            head.appendChild(link);
            link.onload = function () {
                resolve();
            }
            link.onerror = function (err) {
                if(canFail){
                    resolve()
                }
                else{
                    console.warn(err);
                    reject(err);
                }
            }
        })
    }

    /**
     * return the extension of the file in the given path.
     * @function getFileExtension
     * @param {string} path - File path
     * @return {string} The file extension or undefined.
     * @memberof module:ec-script-loader
     */
    const getFileExtension = (path) => {
        let index = path.lastIndexOf('.');
        if (index === -1 || index === path.length - 1) {
            console.error(`"${path}" is not a correct url.`);
            return undefined;
        }
        return path.slice(index + 1);
    }

    /**
     * Remove the hostname (and protocol) of the given url (if apply) then add the cdn hostname.
     * @function convertUrlToCDNUrl
     * @param {string} url - Url to clean
     * @return {string} The url with the defined cdn hostname.
     * @memberof module:ec-script-loader
     */
    const convertUrlToCDNUrl = (url) => {
        //Remove the protocol then split on '/'. the goal of removing the protocol is to facilitate the split on '/'. 
        let parts = url.replace(/http(s?):\/\//, '').split('/');

        //If the first part of a url is a hostname, remove it and rebuild the url. 
        if (parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)) {
            parts.splice(0, 1);
            url = `/${parts.join('/')}`;
        }

        //Prepend the CDN Url
        return `${cdnUrl}${url}`;

    }

    /**
     * return the name of the library in the given path.(The filename without its extension)
     * @function getLibraryName
     * @param {string} path 
     * @return  {string} the library name
     * @memberof module:ec-script-loader 
     */
    const getLibraryName = (path) => {
        //TODO : force min version to all filename. NEED TO BE CHECKED WITH KVG
        let begin = path.lastIndexOf('/') + 1,
            end = path.lastIndexOf('.');
        if (begin >= end) {
            console.error(`"${path}" is not a correct path.`);
            return undefined;
        }

        return path.substring(begin, end);
    }

    /**
     * return the version number of the file in the given path. This version number is retrieved by searching in the before last part of the pag
     * @param {string} path 
     * @return {string}
     * @memberof module:ec-script-loader 
     */
    const getVersionNumber = (path) => {
        let versionEnd = path.lastIndexOf('/'),
            versionStart = path.lastIndexOf('/', versionEnd - 1);
        if (versionStart === -1 || versionEnd === path.length) {
            console.error(`"${path}" does not contain a version number.`);
            return undefined;
        }
        return path.substring(versionStart + 1, versionEnd)
    }

    /**
     * TODO
     * @param {*} url 
     */
    const getDomainName = (url) => {
        if(url.startsWith('chrome-extension://')){
            return 'chrome-extension://';
        }
        let parts = url.replace(/http(s?):\/\//, '').split('/');
        if (parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)) {
            return parts[0];
        }
        return window.location.hostname;
    }
    // #endregion 

    //jQuery replacement function
    //This code is based on http://writing.colin-gourlay.com/safely-using-ready-before-including-jquery/ 
    ((w, d, u) => {
        // Define two queues for handlers
        w.readyQ = [];
        w.bindReadyQ = [];

        // Push a handler into the correct queue
        function pushToQ(x, y) {
            if (x == "ready") {
                w.bindReadyQ.push(y);
            } else {
                w.readyQ.push(x);
            }
        }

        // Define an alias object (for use later)
        let alias = {
            ready: pushToQ,
            bind: pushToQ
        }

        // Define the fake jQuery function to capture handlers
        w.$ = w.jQuery = function (handler) {
            if (handler === d || handler === u) {
                // Queue $(document).ready(handler), $().ready(handler)
                // and $(document).bind("ready", handler) by returning
                // an object with alias methods for pushToQ
                return alias;
            } else {
                // Queue $(handler)
                pushToQ(handler);
            }
        }

        jQueryPromise = getScript(jQueryPath).then(() => {
            $.each(readyQ, function (index, handler) {
                $(handler);
            });
            $.each(bindReadyQ, function (index, handler) {
                $(document).bind("ready", handler);
            });
        })

    })(window, document);

})(window, document);