require('babel-register');

let assert = require('assert'),
    { getLibraryName } = require('../modules/utilities');

describe('Utilities',function(){
    describe('#getLibraryName()',function(){
        it('should return the library name base on the url passed',function(){
            assert.equal(getLibraryName("https://cdn.euroconsumers.org/vendor/zxcvbn/4.4.2/dist/zxcvbn.js"),"zxcvbn");
        });
        it('should handle minified version',function(){
            assert.equal(getLibraryName("https://cdn.euroconsumers.org/vendor/jquery/jquery-tiny-pubsub/0.7.0/dist/ba-tiny-pubsub.min.js"),"ba-tiny-pubsub");
            assert.equal(getLibraryName("https://cdn.euroconsumers.org/vendor/highlight/9.2.0/highlight.pack.js"),"highlight");
        })
        it('should handle relative path',function(){
            assert.equal(getLibraryName("vendor/jquery/jquery-ui/1.12.0/jquery-ui.min.js"),"jquery-ui");
        })
        it('should return undefined if the path is wrong',function(){
            assert.equal(getLibraryName('lib.test/failure'),undefined); 
        });
        it('should remove the version if it is a part of the name',function(){
            assert.equal(getLibraryName('https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.4/jquery-2.1.4.min.js'),'jquery');
        });
    });
});