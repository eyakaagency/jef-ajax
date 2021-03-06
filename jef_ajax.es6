/**
 *  AJAX loading data
 ****************************************************/

"use strict";

var jef_ajax = {

    settings : {
        jquery: true,
        expose() {
            console.log('oui');
            let extension;
            if(window.jQuery) {
                $.fn.pageLoader = function(params) {
                    return this.each(() => {
                        jef_ajax.pageLoader(params);
                    });
                };
            } else {
                console.log('[Jef] jQuery does not seem to be loaded');
            }
        }
    },

    ajax(options) {

        let req = new XMLHttpRequest();

        req.open(options.method || 'GET', options.url, true);

        req.onreadystatechange = function (aEvt) {

            if (req.readyState === 4) {
                if(req.status === 200) {
                    if (options.success) {
                        options.success.call(this);
                        return req.responseText;
                    }
                } else {
                    console.log('[jef] error ajax loading');
                }
            }
        };

        req.send(null);

    },

    /**
     *  AJAX loader element
     ****************************************************/
    loader : {
        show: function () {
            let loaderDiv;

            // if the loader has not yet been created in the DOM
            // we create it and we inject
            if (document.querySelectorAll('#js-JefLoader').length === 0) {
                loaderDiv = document.createElement('div');
                loaderDiv.setAttribute('id', 'js-JefLoader');
                loaderDiv.setAttribute('class', 'js-JefLoader--enter');
                document.body.appendChild(loaderDiv);
                // get loaderDiv DOM element
                this.loaderDiv = document.getElementById('js-JefLoader');

                setTimeout(function () {
                    document.getElementById('js-JefLoader').classList.add('js-JefLoader--enter-active');
                }, 100);

            } else {
                document.getElementById('js-JefLoader').classList.add('js-JefLoader--enter-active');

                setTimeout(function () {
                    document.getElementById('js-JefLoader').classList.add('js-JefLoader--enter-active');
                }, 100);
            }
        },

        hide: function (delay) {
            var _this = this;
            setTimeout(function () {
                document.getElementById('js-JefLoader').classList.remove('js-JefLoader--enter');

                setTimeout(function () {
                    document.getElementById('js-JefLoader').classList.remove('js-JefLoader--enter-active');
                }, 100);
            }, delay);
        },

        // display classes on containers
        classToggleContainer : {

            oneContainer : function(container, options) {
                container.classList.add('JefLoader--enter');
                setTimeout(function () {
                    container.classList.add('JefLoader--enter-active');
                }, 100);

                setTimeout(function () {
                    container.classList.remove('JefLoader--enter-active');
                    container.classList.remove('JefLoader--enter');
                }, options.time);
            },

            twoContainers : function(newContainer, currentContainer, options) {
                newContainer.classList.add('JefLoader--enter');
                currentContainer.classList.add('JefLoader--leave');

                setTimeout(function () {
                    newContainer.classList.add('JefLoader--enter-active');
                    currentContainer.classList.add('JefLoader--leave-active');
                }, 100);

                setTimeout(function () {
                    newContainer.classList.remove('JefLoader--enter-active');
                    newContainer.classList.remove('JefLoader--enter');
                }, options.time + 100);
            }
        }
    },


    /**
     * inject new content into the DOM
     * params
     * @container (HTMLElement) : the container of the current page that will host the new content
     * @data : the data to be injected
     * @target : the element whose content is recovered
     * @displayMode : the new content is displayed side by side relative
     *                to old content or it is remplaced by the old content container
     ****************************************************/
    injectNewContent : {

        newContainer : '',

        display : {
            default(container, data, options) {
                // add/remove classes on container for the CSS animations
                jef_ajax.loader.classToggleContainer.oneContainer(document.querySelector(container), options);

                jef_ajax.injectNewContent.injectHTML(data, options);
            },
            sidebyside(container, data, options) {

                // the new content is displayed side by side relative to old content
                // get the attributes of the current container and paste it on the new container
                // --> clone element function
                let currentContainer = document.querySelector(container),
                    newContainerElement = document.createElement(currentContainer.nodeName),
                    insertElement,
                    i;

                // insert the new element before the current container
                insertElement = currentContainer.parentNode.insertBefore(newContainerElement, currentContainer);

                // add/remove classes on container for the CSS animations
                jef_ajax.loader.classToggleContainer.twoContainers(insertElement, currentContainer, options);

                // inject HTML into the DOM
                jef_ajax.injectNewContent.injectHTML(data, options, insertElement);

            }
        },

        injectHTML(data, options, otherContainer) {

            // inject content in HTML format
            let newContent = document.createElement('div'),
                container = document.querySelector(__JEF__.view),
                e,y,a,k;

            // load new content in HTMLElement object
            newContent.innerHTML = data;

            let oldAttrs = container.attributes,
                newAttrs = newContent.querySelector(__JEF__.view).attributes;


            // if the content is loaded on other container
            if(otherContainer) {

                // get attributes
                newAttrs = newContent.querySelector(__JEF__.view).attributes;

                // insert new content in container
                otherContainer.innerHTML = newContent.querySelector(__JEF__.view).innerHTML;

                for(y = 0, a = newAttrs.length; y < a; y++) {
                    otherContainer.setAttribute(newAttrs[y].name, newAttrs[y].value);
                }

                // remove old container
                setTimeout(()=> {
                    container.parentNode.removeChild(container);
                }, options.time + (options.time/2));

                // else if content is loaded on the same container
            } else {
                // remove old content
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                // insert new content in container
                container.innerHTML = newContent.querySelector(__JEF__.view).innerHTML;

                // replace attributes
                // remove old
                for(e = 0, k = oldAttrs.length; e < k-1; e++) {
                    container.removeAttribute(oldAttrs[e].name);
                }

                // add news
                for(y = 0, a = newAttrs.length; y < a; y++) {
                    container.setAttribute(newAttrs[y].name, newAttrs[y].value);
                }
            }

        }
    },

    history : {

        listening : false,

        pushState : function(options) {
            history.pushState({}, '', __JEF__.url);
        },

        event : function(options) {
            if(!this.listening) {
                window.onpopstate = function() {
                    options.historyCall = true;
                    options.url = __JEF__.url = document.location;
                    jef_ajax.pageLoader(options);
                };
                this.listening = true;
            }
        }
    },


    /**
     * AJAX loading and display loader
     * params
     * @options : all options
     ****************************************************/
        pageLoader(options) {

        //
        // set defaults options
        //***************************************************/

        let _this = this,
            myXHR;

        // set default options if there is no
        if(typeof options === 'undefined') {options = {};}

        // if time is not specified, we assign a minimum value
        options.time = options.hasOwnProperty('time') ? options.time : 1000;

        // defined display mod
        options.display = options.hasOwnProperty('display') ? options.display : 'default';

        // set default diplay loader
        options.loader = options.hasOwnProperty('loader') ? options.loader : false;

        // if target is not specified,
        // considering that we want to load the defined view
        options.target = options.hasOwnProperty('target') ? options.target : false;

        // manage history if it is set
        options.history = options.hasOwnProperty('history') ? options.history : true;
        options.historyCall = options.hasOwnProperty('historyCall') ? options.historyCall : false; // for history events

        // legacy : defined target & container for the next …
        options.container = __JEF__.view;


        //
        // AJAX request
        //***************************************************/

        // managed history event if it is set
        if(options.history) {
            jef_ajax.history.event(options);
        }

        // show loading
        if(options.loader) {
            jef_ajax.loader.show();
        }

        // send ajax request with our super object ajax homemade
        myXHR = this.ajax({
            url: __JEF__.url,
            success: function() {

                // inject new content
                setTimeout(() => {
                    jef_ajax.injectNewContent.display[options.display](
                        options.container,
                        this.response,
                        options
                    );
                }, 200);


                // push state in history
                // if history options is active
                // and if isn't a call with the back/prev browser btn (history call)
                if(options.history && !options.historyCall) { jef_ajax.history.pushState(options); }

                // the loader is hidden in the specified time
                if(options.loader) {jef_ajax.loader.hide(options.time);}

                // launch success function if it is set
                if(options.hasOwnProperty('success')) { setTimeout(function () { options.success(); }, options.time); }

                // reload Jef models and modules
                __JEF__.instance.init();

            },
            error: function () {
                console.log(this.status);
            }
        });

        return this;
    },

    /**
     * check HTMLinXHR compatibilty
     ****************************************************/

        HTMLinXHR() {
        if (!window.XMLHttpRequest) {return false;}
        var req = new window.XMLHttpRequest();
        req.open('GET', window.location.href, false);
        try {
            req.responseType = 'document';
        } catch (e) {
            return true;
        }
        return false;
    }
};
