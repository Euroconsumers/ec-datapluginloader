import { getScript } from './dom-manipulation';

//This code is based on http://writing.colin-gourlay.com/safely-using-ready-before-including-jquery/ 
export function jqPreload (w, d, jQueryPath, u) {
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

    return getScript(jQueryPath).then(() => {
        $.each(readyQ, function (index, handler) {
            $(handler);
        });
        $.each(bindReadyQ, function (index, handler) {
            $(document).bind("ready", handler);
        });
    })
 
}