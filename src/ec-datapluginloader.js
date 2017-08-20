
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
        for (const prop in sortedDataPlugins.nonexistent) {
            console.log(prop);
            //console.log(sortedDataPlugins.nonexistent[prop][0]);

            let widgetFullname = 'ec-' + prop;
            let rootUrl = 'https://cdn.euroconsumers.org/vendor/euroconsumers/';
            let widgetUrl = rootUrl + widgetFullname + '/0.0.1/';

            //TODO: load dependencies

            loadScript(widgetUrl + widgetFullname + '.min.js');
        }

        //set all settings
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

    const loadScript = (url) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = false;
        document.body.appendChild(script);
        script.onload = function () {
          console.log(url + ' loaded.');
        };
        // script.onerror = function (e) {
        //   console.warn(e);
        // };
    }

    const loadDataPluginAndDependencies = (url, pluginNameCamelCase, ns, ext) => {
        return new Promise((resolve, reject) => {
          getDependenciesForNonExistentPlugins(`${url}dependencies.json`).then(data => {
            loadDependencies(data);
          }).then(() => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `${url}${ns}-${pluginNameCamelCase}${ext}`;
            script.async = false;
            document.body.appendChild(script);
            script.onload = () => {
              //console.log('script success');
              resolve();
            };
            script.onerror = () => {
              console.debug('Script Error');
              reject();
            };
          });
        });
    }

})(jQuery)
