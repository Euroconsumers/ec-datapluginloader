/**
 * Euroconsumers Script Loader 
 * @module ec-script-loader
 * @author Raphaël Desaegher (belux\rds) <rdesaegher@test-achats.be>
 * @license LGPL-3.0
 */

import { getLibraryName, getVersionNumber, getFileExtension, getDomainName, changeUrlHostname } from './modules/utilities';
import { getAlreadyLoadedScripts, getScript, getStyle } from './modules/dom-manipulation'
import { jqPreload } from './modules/jquery-preload';

(function (window, document, jQuery) {
    'use strict';

    /**
     * jQuery script path
     * @constant
     * @default {@link https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.4/jquery-2.1.4.min.js }
     * @type {string}
     * @memberof module:ec-script-loader
     */
    const jQueryPath = 'https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.4/jquery-2.1.4.min.js';

    jQueryPromise = jqPreload(window, document, jQueryPath);

    let jQueryPromise,
        scripts = {},
        styles = [],
        _options;

    window.loadScriptsAndWidgets = async (options) => {
        options.cdnUrl = options.cdnUrl || 'https://cdn.euroconsumers.org';
        _options = options;

        //Check which scripts are already loaded
        getAlreadyLoadedScripts(scripts, getDomainName(_options.cdnUrl));

        //wait that jQuery is loaded before starting
        await jQueryPromise;

        //Load jQuery UI
        await Promise.all(loadjQueryUI());

        //Load and initialize all the widgets.
        processWidgets();
    }

    window.reloadWidgets = async () => {
        processWidgets();
    }

    /**
     * Get the list of widgets that were not yet processed and initialize them.
     * @async
     * @memberof module:ec-script-loader
     * @function processWidgets
     */
    const processWidgets = async () => {
        //Get all the widgets
        const widgets = await getWidgets();

        for (let widget in widgets) {
            loadAndInitializeWidget(widgets[widget]);
        }
    }

    /**
     * Load the jQuery UI needed scripts and styles. 
     * @function loadjQueryUi
     * @memberof module:ec-script-loader 
     * @return {Promise[]} An array containing a promise for each script or style loaded.
     */
    const loadjQueryUI = () => {
        let promises = [],
            { jQueryUI } = _options;

        for (let item of jQueryUI) {
            let extension = getFileExtension(item);
            if (extension === 'js') {
                promises.push(getScript(changeUrlHostname(item, _options.cdnUrl)));
            }
            else if (extension === 'css') {
                promises.push(getStyle(changeUrlHostname(item, _options.cdnUrl)));
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
     * @memberof module:ec-script-loader 
     * @async
     * @return {Object} The list of widgets present on the page
     * @function getWidgets
     */
    const getWidgets = async () => {
        let dataWidgets = document.body.querySelectorAll('[data-plugin],[data-widget]'),
            widgets = {},
            versionList = await getWidgetVersionList();

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
                let rootUrl = `${_options.cdnUrl}/vendor/euroconsumers/ec-${name}/${version}/`;
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
     * @return {Promise} A promise wich resolve in the list of widgets with the number of their latest version.
     * @async
     * @function getWidgetVersionList
     * @memberof module:ec-script-loader
     */
    const getWidgetVersionList = async () => {
        let widgetVersionUrl = _options.widgetVersionUrl,
            response = await fetch(widgetVersionUrl);
        if (response.ok) {
            return response.json();
        }
        console.error(`${widgetVersionUrl} is not a valid url`)
        return undefined;
    }

    /**
     * Load the scripts and initialize a specific widget passed as argument.
     * @param {Object} widget - The widget to load and initialize.
     * @async
     * @function loadAndInitializeWidget
     * @memberof module:ec-script-loader
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
        getStyle(widget.urls.style, true);

        await Promise.all(widgetScript.dependencies);

        widgetScript.promise = getScript(widget.urls.script);
        scripts[widget.name] = widgetScript;

        await widgetScript.promise;

        initializeWidget(widget);
    }

    /**
     * Load the dependency file of a widget and transform this into a usable JSON object. 
     * This function is quite long (and the code seems to be repeated) because this is still handling the "old structure" of the dependencies file. It will be shortened when all widgets are adapted to the new structure (flat array).
     * @param {string} dependenciesUrl 
     * @async
     * @function getDependencies
     * @return {Object} An object containing the list of scripts & styles urls to be loaded as dependencies of a specific widget.
     * @memberof module:ec-script-loader
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
                    dependencies[getFileExtension(dependency)].push(changeUrlHostname(dependency, _options.cdnUrl));
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
                                        dependencies[type].push(changeUrlHostname(json[type][dependency][subdependency][subsubdependency], _options.cdnUrl));
                                    }
                                } else {
                                    dependencies[type].push(changeUrlHostname(json[type][dependency][subdependency], _options.cdnUrl));
                                }
                            }
                        }
                        else {
                            dependencies[type].push(changeUrlHostname(json[type][dependency], _options.cdnUrl));
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
     * Initialize a widget based on his name. If settings for the widgets are provided, they are used. All the elements using this widget detected on the page are initialized.
     * @param {Object} - the widget to initialize.
     * @function initializeWidget
     * @memberof module:ec-script-loader
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
            element.classList.add('has-widget');
        }
    }

})(window, document);