require('babel-register');
require('jsdom-global')('',{
    url: 'https://example.org/'
});

let assert  = require('assert'),
    { getLibraryName, getVersionNumber,getFileExtension,getDomainName } = require('../modules/utilities');

describe('Utilities',function(){
    describe('getLibraryName()',function(){
        it('should return the library name based on the url passed',function(){
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

    describe('getVersionNumber()',function(){
        it('should return the version number based on the url passed',function(){
            assert.equal(getVersionNumber('https://cdn.euroconsumers.org/vendor/jquery/jquery-cookie/1.4.1/jquery.cookie.js'),'1.4.1');
            assert.equal(getVersionNumber('https://cdn.euroconsumers.org/vendor/jquery/jquery-tiny-pubsub/0.7.0/dist/ba-tiny-pubsub.min.js'),'0.7.0');
        });

        it('should work if the version is in the querystring',function(){
            assert.equal(getVersionNumber('http://localhost:8080/browser-sync/browser-sync-client.js?v=2.18.13'),'2.18.13');
        });

        it('should return "dist" if no version is found',function(){
            assert.equal(getVersionNumber('https://cdn.euroconsumers.org/vendor/euroconsumers/ec-dateSelect/dist/ec-dateSelect.min.js'),'dist');
        });

        it('should return the rightmost version found in the url',function(){
            //This test by itself does not really make sense. It is only to make sure that what is returned is consistent. if the function change in the future.
            assert.equal(getVersionNumber('https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.5/jquery-2.1.4.min.js'),'2.1.4');
        });
    });

    describe('getFileExtension()',function(){
        it('should return the extension of a file based on the path passed',function(){
            assert.equal(getFileExtension('/vendor/jquery/jquery-ui/1.12.0/jquery-ui.min.js'),'js');
            assert.equal(getFileExtension('/vendor/jquery/jquery-ui/1.12.0/jquery-ui.min.css'),'css');
        });

        it('should return undefined if no extension can be found',function(){
            assert.equal(getFileExtension('file/without/extension'),undefined);
        });
    });

    describe('getDomainName()',function(){
        it('should return the domain name of the url passed',function(){
            assert.equal(getDomainName('https://cdn.euroconsumers.org/vendor/jquery/jquery/2.1.5/jquery-2.1.4.min.js'),'cdn.euroconsumers.org');
            assert.equal(getDomainName('cdn.euroconsumers.org/test/file.js'),'cdn.euroconsumers.org');
        });
        it('should return "chrome-extension://" if the script is coming from a Chrome extension',function(){
            //This does not really make sense. but the goal is to make sure that this behavior is consistent. Other exception might appear in the future.
            assert.equal(getDomainName('chrome-extension://aoclhcccfdkjddgpaaajldgljhllhgmd/common/optionsProvider.js'),'chrome-extension://');
        });
        it('should return the window.location.hostname when there is no hostname in the url (meaning it is a relative url.', function(){
            assert.equal(getDomainName('/test/file.js'),'example.org');
        })
    });
});
