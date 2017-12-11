(function() {
    'use strict';
    /**
     * 
     * @param {*} options 
     */
    window.initialiseWidgets = async (options) => {
        let scripts = [[], []], styles = [], promises = [];

        options.cdnUrl = options.cdnUrl || 'https://cdn.euroconsumers.org';

        const widgets = getWidgets(options);

        //Get all the dependencies and put them together
        for(let widget in widgets){
            const dependencies =  await getDependencies(widgets[widget].urls.dependencies,options);

            scripts[1].push(widgets[widget].urls.script);

            //avoid duplicates in script
            scripts[0] = scripts[0].concat(dependencies.js.filter(function(item){
                return scripts[0].indexOf(item) < 0;
            }));

            //avoid duplicates in styles
            styles = styles.concat(dependencies.css.filter(function(item){
                return styles.indexOf(item) < 0;
            }));
        }

        //Inspect the dependencies and clean them
        cleanScripts(scripts);

        // Load all scripts and styles
        promises.push(loadScripts(scripts));
        promises.push(loadStyles(styles));
        await Promise.all(promises)

        //Initialise all the widets
        for(let widget in widgets){
            for(let element of widgets[widget].elements){

                let $element = $(element);

                //Check if the widget does have settings or not. And use them if apply.
                let widgetSettingsElement = $element.data('plugin-settings')||$element.data('widget-settings');
                if (widgetSettingsElement) {
                    let settings = JSON.parse($(widgetSettingsElement).text());
                   $element[widget](settings);
                } else {
                    $element[widget]();
                }
            }
        }      
    } 

    /**
     * Get the list of widget used on the page.
     * @param {object} {cdnUrl} the cdn Url passed in the options of the initialiseWidgets function
     * @returns {array} an array containing the list of all widgets used on the page.
     */
    const getWidgets = ({cdnUrl}) => {
        /**
         * REMAINING 'S :
         * - Handle version madness !
         */
        let dataPlugins = document.body.querySelectorAll('[data-plugin],[data-widget]'), widgets = {};

        for(let item of dataPlugins){

            //if the widget is already initialized, skip it
            if (item.classList.contains('has-plugin')) continue;

            // Manipulate a bit the name to reformat it correctly. 
            // The behavior is that if a plugin contains an uppercase, this uppercase is replace by a dash and the letter in lowercase.
            // The manipulation here is done to get back the correct file names and path

            let name = item.getAttribute('data-plugin') || item.getAttribute('data-widget'),
            nameParts = name.split('-');
            nameParts.forEach((entry,index,array) => {
                if(index !== 0)
                {
                    array[index] = entry.charAt(0).toUpperCase() + entry.slice(1);
                }
            });
            name = nameParts.join('');


            /********************************************************************************************
             * This code is a temporary total bullshit in order to handle difference between widgets    *
             * (some have a version. other not)                                                         *
             * It should be removed ASAP !!!                                                            *
             ********************************************************************************************/
            
            let version = 'dist';
            if(name === 'weakpasswordindicator') version = '0.0.3';
            if(name === 'showcode') version = '0.0.1';

            /****************
             * End bullshit *
             ****************/

            if(widgets.hasOwnProperty(name)){
                widgets[name].elements.push(item);
            } else {
                widgets[name] = {};
                widgets[name].elements = [item];

                // build the differents urls from the widget
                let rootUrl =`${cdnUrl}/vendor/euroconsumers/ec-${name}/${version}/`;
                widgets[name].urls ={
                    script : `${rootUrl}ec-${name}.min.js`,
                    style: `${rootUrl}ec-${name}.min.css`,
                    dependencies:`${rootUrl}dependencies.json`
                }
                
            }
        }
        return widgets;
    } 
    
    /**
     * Get the dependecies of a widget.
     * @param {string} dependenciesUrl - url to the dependency JSON file. 
     * @return {object} An object containing both Css & JS dependencies (as arrays) of a specific widget.
     */
    const getDependencies = async (dependenciesUrl,{cdnUrl}) => {
        /**
         * REMAINING TODO's
         * - Check version
         */
        let dependencies = {
            js : [],
            css : []
        };

        const response = await fetch(dependenciesUrl);
        if(response.ok){
            const json = await response.json();

            //New structure example. this can be used as test.
            // const json = [
            //     "/vendor/zxcvbn/4.4.2/dist/zxcvbn.min.js",
            //     "/vendor/euroconsumers/ec-loadingbar/0.0.1/ec-loadingbar.min.css",
            //      "cdn.google.com/script/1.0.0/script.js"
            // ];

            /********************************************************************************************************************************
            * This code handle the new structure of the dependecies.json files. This structure is currently not implemented in any widget.  *
            * The new structure looks like this the example in the previous comment                                                         *
            *********************************************************************************************************************************/
            if(Array.isArray(json)){
                for(let dependency of json){

                    //Check if the dependency contains a hostname & remove it if it's the case. 
                    let parts = dependency.replace('//','X').split('/');
                    if(parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)){
                        parts.splice(0,1);
                        dependency = `/${parts.join('/')}`;   
                    }

                    //the correct cdn hostname is here applied to all the dependencies.
                    dependencies[getFileExtension(dependency)].push(`${cdnUrl}${dependency}`);
                }
                return dependencies;
            }
            /********************************************************************************
            * This code only exist to support the old structure.                            *
            * Once all the widgets are migrated to the new structure it can be removed.     *
            * Replace it with an error message                                              *
            *********************************************************************************/
            for(let type in json){
                if(json.hasOwnProperty(type))
                {
                    for (let dependency in json[type]){

                        if(typeof json[type][dependency] !== 'string')
                        {
                            console.error(`Formatting issue in dependencies in ${dependenciesUrl} : \n ${dependency} is not in a valid format for ${type}. it's a(n) ${typeof json[type][dependency]} but it should be a string`);
                            continue;
                        }

                        //Check if the dependency contains a hostname & remove it if it's the case. 
                        let parts = json[type][dependency].replace('//','X').split('/');
                        if(parts[0].match(/^(?:https?:\/\/)?.+\.(?:.{2,3})/g)){
                            parts.splice(0,1);
                            json[type][dependency] = `/${parts.join('/')}`;   
                        }

                        dependencies[type].push(`${cdnUrl}${json[type][dependency]}`);
                    }
                }
            }
        } else {
            console.error(`Unable to get ${dependenciesUrl}. No dependencies will be loaded for this widget.`)
        }
        return dependencies;        
    }

    /**
     * Check all the scripts. Remove the duplicates. Show warning if different versions are requested and remove the oldest.
     * 
     * @param {object} scripts 
     */
    const cleanScripts = (scripts) => {
        /**
         * TODO's :
         *  Ensure that the min version is used. 
         *  Ensure that the correct cdnUrl is used. 
         *  Remove library duplicated with different versions.
         *  Check that the script is not loaded yet. 
         */
        for(let group of scripts){
            var groupIndex = scripts.indexOf(group);
            for(let script of group){
                // console.log(script);
                // console.log(getFileExtension(script));
                // console.log(getVersionNumber(script));
                // console.log(getFileName(script))
            }
        }
        
    }

    /**
     * Load all the scripts passed in argument group by group (one array at a time).
     * @param {array} scripts - the lists of scripts in groups. Each script inside a group can be loaded independently that the other scripts of the same group.
     */
    const loadScripts = async (scripts) => {
        for(let group of scripts){
            let promises = [];
            for (let script of group){
                promises.push(getScript(script));
            }
            await Promise.all(promises);
        }
    }

    /**
     * Load a specific script and add it to the DOM.
     * @param {string} url - url to a js script file.
     */
    const getScript = (url) =>{
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;
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
     * Load all the styles in the list given as argument.
     * @param {array} styles - the list of styles.
     */
    const loadStyles = async (styles) => {
        let promises = [];
        for (let style of styles){
            promises.push(getStyle(style));
        }
        await Promise.all(promises);
    }

    /**
     * Load a specific stylesheet and add it to the DOM.
     * @param {string} url - url to a css stylesheet.
     */
    const getStyle = (url) => {
        return new Promise((resolve, reject) => {
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.media = 'all';
            head.appendChild(link);
            link.onload = function () {
                resolve();
            }
            link.onerror = function (err) {
                console.warn(err);
                reject(err);
            }
        })
    }

    /**
     * return the extension of the file in the given path.
     * @param {string} path - file path
     */
    const getFileExtension = (path) =>{
        let index = path.lastIndexOf('.');
        if(index === -1 || index === path.length - 1){
            console.error(`"${path}" is not a correct url.`);
            return undefined;
        }
        return path.slice(index+1);
    }

    /**
     * return the version of the file in the given path. This version number is retrieved by searching 
     * @param {string} path - file path
     */
    const getVersionNumber = (path) => {
        let versionEnd = path.lastIndexOf('/'),
        versionStart = path.lastIndexOf('/',versionEnd - 1);
        if(versionStart === -1 || versionEnd === path.length){
            console.error(`"${path}" does not contain a version number.`);
            return undefined;
        }
        return path.substring(versionStart+1,versionEnd)
    }

    const getFileName = (path) => {
    //TODO : force min version to all filename. NEED TO BE CHECKED WITH KVG
        let begin = path.lastIndexOf('/') + 1,
            end = path.lastIndexOf('.');
        if(begin >= end){
            console.error(`"${path}" does not contain a version number.`);
            return undefined;
        }

        return path.substring(begin,end);
    }

})()
