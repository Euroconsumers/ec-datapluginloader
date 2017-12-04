(function() {
    'use strict';
    window.initialiseWidgets = async (options) => {
        let scripts = [[], []], styles = [], promises = [];

        const widgets = getWidgets(options);

        //Get all the dependencies and put them together
        for(let widget in widgets){

            const dependencies =  await getDependencies(widgets[widget].urls.dependencies);

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
     * Get the list of data-plugin used on the page.
     * 
     * @param {object} {cdnUrl} the cdn Url passed in the options of the initialiseWidgets function
     * @returns {Array} an array containing the list of all widgets used on the page.
     */
    const getWidgets = ({cdnUrl}) => {
        /**
         * REMAINING TODO'S :
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
                cdnUrl = cdnUrl || 'https://cdn.euroconsumers.org';
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
    const getDependencies = async (dependenciesUrl) => {
        /**
         * REMAINING TODO'S
         * - Remove cdn hostname from all the urls and replace it with the provided (or default one)
         * - Test new structure.
         * - Check version
         */
        let dependencies = {
            js : [],
            css : []
        };

        const response = await fetch(dependenciesUrl);
        if(response.ok){ //TODO Check if 'ok' is reliable
            const json = await response.json();
            for(let type in json){
                if(json.hasOwnProperty(type))
                {
                    if(Array.isArray(json[type])){
                        dependencies[type] = json[type];
                    }
                    else {
                        /********************************************************************************
                        * This code only exist to support the old structure.                            *
                        * Once all the widgets are migrated to the new structure it can be removed.     *
                        * Replace it with an error message                                              *
                        *********************************************************************************/
                        for (let dependency in json[type]){

                            if(typeof json[type][dependency] !== 'string')
                            {
                                console.error(`Formatting issue in dependencies in ${dependenciesUrl} : \n ${dependency} is not in a valid format for ${type}. it's a(n) ${typeof json[type][dependency]} but it should be a string`);
                                continue;
                            }

                            dependencies[type].push(json[type][dependency]);
                        }
                    }
                }
            }
        }
        return dependencies;        
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
})()
