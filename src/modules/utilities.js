    /**
     * return the name of the library in the given path.(The filename without its extension)
     * @function getLibraryName
     * @param {string} path - Path to the library
     * @return  {string} The library name
     * @memberof module:ec-script-loader 
     */
     export function getLibraryName (path) {
        let begin = path.lastIndexOf('/') + 1,
            end = path.lastIndexOf('.');
        if (begin >= end) {
            console.error(`"${path}" is not a correct path.`);
            return undefined;
        }

        let libraryName = path.substring(begin, end);

        const version = libraryName.match(/-(\d+\.)?(\d+\.)?(\*|\d+)/)
        //remove the version if it's part of the name
        if(version){
            libraryName = libraryName.split(version[0])[0];
        }
        //Remove the known extension used for minification.
        libraryName = libraryName.split('.min')[0].split('.pack')[0];

        return libraryName;
    }