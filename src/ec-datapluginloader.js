
(function($) {
    'use strict';
    
    $.fn.initialiseWidgets = function () {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var callback = arguments[1];

        var dataPlugins = document.body.querySelectorAll('[data-plugin]');
        const filteredDataPlugins = filterDataPlugins(dataPlugins);
        const sortedDataPlugins = sortDataPluginsByExistence(filteredDataPlugins);

        dataPlugins.forEach(function(element) {
            console.log(element)
        }, this);
        console.log(filteredDataPlugins);
        console.log(sortedDataPlugins);

        //load non-existing
        let getDependencyPromises = [];
        for (const widgetName in sortedDataPlugins.nonexistent) {
            console.log(widgetName);
            //console.log(sortedDataPlugins.nonexistent[widgetName][0]);
            let resolver = resolveWidget(widgetName);
            getDependencyPromises.push(getUrl(resolver.dependenciesUrl));
        }

        // TODO: remove pyramid of doom
        Promise.all(getDependencyPromises).then((dependenciesArray) => {
            console.log('Dependencies identified.');
            let loadDependencyPromises = [];
            for (const dependencies of dependenciesArray)
            {
                console.log(dependencies);
                loadDependencyPromises.push(loadDependencies(dependencies));
            }
            Promise.all(loadDependencyPromises).then(() => {
                console.log('Dependencies loaded.');
                let appendScriptPromises = [];
                for (const widgetName in sortedDataPlugins.nonexistent) {
                    let resolver = resolveWidget(widgetName);
                    appendScriptPromises.push(appendScript(resolver.scriptUrl));
                }                    
                Promise.all(appendScriptPromises).then(function () {
                    console.log('Script loading finished.');        
                    
                    //load settings and initialize dataplugins
                    for (const widgetName in filteredDataPlugins)
                    {
                        console.log(widgetName);
                        for (const widgetElement of filteredDataPlugins[widgetName])
                        {
                            console.log(widgetElement);
                            let settings = {};
                            let $widgetElement = $(widgetElement);
                            let widgetSettingsElement = $widgetElement.data('plugin-settings');
                            if (widgetSettingsElement) {
                               let widgetSettings = $(widgetSettingsElement).text();
                               settings = JSON.parse(widgetSettings);
                               console.log(settings);
                               $widgetElement[widgetName](settings);
                            } else {
                                $widgetElement[widgetName]();
                            }
                        }
                    }
                    console.log('DataPlugins initialized.');  

                }).catch((err) => {
                    //TODO: make sure other promises are also caught
                    console.error('Dynamic script loading failed.');
                    console.log(err);
                });
            });                
        });

    }        

    const resolveWidget = (widgetName) => {
        let resolved = {};
        
        resolved.widgetFullname = 'ec-' + widgetName;
        resolved.rootUrl = 'https://cdn.euroconsumers.org/vendor/euroconsumers/';
        
        //TODO: handle version madness
        resolved.version = '/0.0.1/';
        if (widgetName == 'weakpasswordindicator') resolved.version = '/0.0.3/';

        resolved.widgetUrl = resolved.rootUrl + resolved.widgetFullname + resolved.version; 
        resolved.styleUrl = resolved.widgetUrl + resolved.widgetFullname + '.min.css';
        resolved.scriptUrl = resolved.widgetUrl + resolved.widgetFullname + '.min.js';
        resolved.dependenciesUrl = resolved.widgetUrl + 'dependencies.json';
        
        return resolved;
    }

    const filterDataPlugins = (dataPlugins) => {
        var filteredDataPlugins = {};
        
        for (const item of dataPlugins) {
          
          //If an element already has a widget, go to the next one
          if (item.classList.contains('has-plugin')) continue;
          
          var pluginName = item.getAttribute('data-plugin');
          
          //Skip legacy plugins
          //if (pluginName === 'file_upload') continue;
          //if (pluginName === 'socialShare') continue;
          
          //Skip disabled plugins
          //if (isPluginDisabled(item, pluginName)) continue;
          
          if (filteredDataPlugins.hasOwnProperty(pluginName)) {
            filteredDataPlugins[pluginName].push(item);
          } else {
            filteredDataPlugins[pluginName] = [item];
          }
        }
        
        return filteredDataPlugins;
    }

    const sortDataPluginsByExistence = (filteredDataPlugins) => {
        var result = { existent: {}, nonexistent: {} };

        //TODO: sort out existing, not sure of the format yet
        result.nonexistent = filteredDataPlugins;

        return result;
    }

    const loadDependencies = (dependencies) => {
        return new Promise(function (resolve, reject) {
            //load css
            let cssPromises = [];
            for (const dependencyName in dependencies.css) {
                //console.log(dependencyName);
                //console.log(dependencies.css[dependencyName]);
                cssPromises.push(appendStyle(dependencies.css[dependencyName]));
            }
            //load js
            let jsPromises = [];
            for (const dependencyName in dependencies.js) {
                //console.log(dependencyName);
                //console.log(dependencies.js[dependencyName]);
                jsPromises.push(appendScript(dependencies.js[dependencyName]));
            }
            Promise.all([...cssPromises, ...jsPromises]).then(resolve).catch((err) => { reject(err)});
        });
    }

    const getUrl = (url) => {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener('load', function () {
            if (xhr.status >= 200 && xhr.status < 400) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(xhr.status);
            }
          });
          xhr.open('get', url, true);
          xhr.send();
        });
    };

    const appendScript = (url) => {
        return new Promise((resolve, reject) => {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = false;
            document.body.appendChild(script);
            script.onload = function () {
                console.log(url + ' loaded.');
                resolve();
            }
            script.onerror = function (err) {
                //console.warn(e);
                reject(err);
            }
        })
    }

    /**
     * Dynamically load stylesheet
     * Also, see {@link https://stackoverflow.com/questions/574944/how-to-load-up-css-files-using-javascript}
     */
    const appendStyle = (url) => {
        return new Promise((resolve, reject) => {
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            //link.id   = cssId; // you could encode the url for this
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.media = 'all';
            head.appendChild(link);
            link.onload = function () {
                console.log(url + ' loaded.');
                resolve();
            }
            link.onerror = function (err) {
                //console.warn(err);
                reject(err);
            }
        })
    }

})(jQuery)
