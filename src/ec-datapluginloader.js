
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
        var appendScriptPromises = [];
        for (const prop in sortedDataPlugins.nonexistent) {
            console.log(prop);
            //console.log(sortedDataPlugins.nonexistent[prop][0]);

            //resolve urls
            let widgetFullname = 'ec-' + prop;
            let rootUrl = 'https://cdn.euroconsumers.org/vendor/euroconsumers/';
            let widgetUrl = rootUrl + widgetFullname + '/0.0.1/';
            let dependenciesUrl = widgetUrl + 'dependencies.json';
            
            //load dependencies
            getUrl(dependenciesUrl).then(function (dependencies) {
                console.log(dependencies);
                loadDependencies(dependencies).then(() => {
                    console.log('Dependency loaded.');
                })
            });

            appendScriptPromises.push(appendScript(widgetUrl + widgetFullname + '.min.js'));
        }

        Promise.all(appendScriptPromises).then(function (result) {
            console.log('Script loading finished.');        
            console.log(result);

            //TODO: set all settings

        }).catch((err) => {
            console.error('Dynamic script loading failed.');
            console.log(err);
        });

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
