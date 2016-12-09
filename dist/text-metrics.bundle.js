(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.textMetrics = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'exports', './utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports, require('./utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports, global.utils);
        global.index = mod.exports;
    }
})(this, function (module, exports, _require) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var isElement = _require.isElement,
        isObject = _require.isObject,
        getStyle = _require.getStyle,
        getFont = _require.getFont,
        getStyledText = _require.getStyledText,
        getContext2d = _require.getContext2d,
        normalizeOptions = _require.normalizeOptions,
        prop = _require.prop;

    var TextMetrics = function () {
        function TextMetrics(el) {
            var overwrites = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, TextMetrics);

            if (!isElement(el) && isObject(el)) {
                this.el = undefined;
                this.overwrites = normalizeOptions(el);
            } else {
                this.el = el;
                this.overwrites = normalizeOptions(overwrites);
            }

            this.style = getStyle(this.el, this.overwrites);
            this.font = prop(overwrites, 'font', null) || getFont(this.style, this.overwrites);
        }

        /**
         * Compute Text Metrics based for given text
         *
         * @param {string} text
         * @param {object} options
         * @param {object} overwrites
         * @returns {function}
         */


        _createClass(TextMetrics, [{
            key: 'width',
            value: function width(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                var styledText = getStyledText(text, this.style);

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                var ctx = getContext2d(font);

                if (options.multiline) {
                    return this.lines(styledText, options).reduce(function (res, text) {
                        return Math.max(res, ctx.measureText(text).width);
                    }, 0);
                }

                return ctx.measureText(styledText).width;
            }
        }, {
            key: 'height',
            value: function height(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));

                var lineHeight = parseInt(prop(styles, 'line-height') || this.style.getPropertyValue('line-height'), 10);

                return this.lines(text, options, styles).length * lineHeight;
            }
        }, {
            key: 'lines',
            value: function lines(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                // get max width
                var delimiter = prop(options, 'delimiter', ' ');
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                var styledText = getStyledText(text, this.style);
                var words = styledText.split(delimiter);

                if (text.length === 0 || words.length === 0) {
                    return 0;
                }

                var ctx = getContext2d(font);

                var lines = [];
                var line = words.shift();

                words.forEach(function (word, index) {
                    var _ctx$measureText = ctx.measureText(line + delimiter + word),
                        width = _ctx$measureText.width;

                    if (width <= max) {
                        line += delimiter + word;
                    } else {
                        lines.push(line);
                        line = word;
                    }

                    if (index === words.length - 1) {
                        lines.push(line);
                    }
                });

                if (words.length === 0) {
                    lines.push(line);
                }

                return lines;
            }
        }, {
            key: 'maxFontSize',
            value: function maxFontSize(text) {
                var _this = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                // simple compute function which adds the size and computes the with
                var compute = function compute(size) {
                    return _this.width(text, options, _extends({}, overwrites, { 'font-size': size + 'px' }));
                };

                // get max width
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                // start with half the max size
                var size = Math.floor(max / 2);
                var cur = compute(size);

                // compute next result based on first result
                size = Math.floor(size / cur * max);
                cur = compute(size);

                // happy cause we got it already
                if (Math.ceil(cur) === max) {
                    return size + 'px';
                }

                // go on by increase/decrease pixels
                if (cur > max && size > 0) {
                    while (cur > max && size > 0) {
                        cur = compute(size--);
                    }
                    return size + 'px';
                }

                while (cur < max) {
                    cur = compute(size++);
                }
                size--;
                return size + 'px';
            }
        }]);

        return TextMetrics;
    }();

    exports.default = function (el, options) {
        return new TextMetrics(el, options);
    };

    module.exports = function (el, options) {
        return new TextMetrics(el, options);
    };
});
},{"./utils":2}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.utils = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFont = getFont;
    exports.isCSSStyleDeclaration = isCSSStyleDeclaration;
    exports.canGetComputedStyle = canGetComputedStyle;
    exports.isElement = isElement;
    exports.isObject = isObject;
    exports.getStyle = getStyle;
    exports.getStyledText = getStyledText;
    exports.prop = prop;
    exports.normalizeOptions = normalizeOptions;
    exports.getContext2d = getContext2d;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    /* eslint-env es6, browser */
    var DEFAULTS = exports.DEFAULTS = {
        'font-size': '16px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    };

    /**
     * Map css styles to canvas font property
     *
     * font: font-style font-variant font-weight font-size/line-height font-family;
     * http://www.w3schools.com/tags/canvas_font.asp
     *
     * @param {CSSStyleDeclaration} style
     * @param {object} options
     * @returns {string}
     */
    function getFont(style, options) {
        var font = [];

        var fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight')) || DEFAULTS['font-weight'];
        if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight.toString()) !== -1) {
            font.push(fontWeight);
        }

        var fontStyle = prop(options, 'font-style', style.getPropertyValue('font-style'));
        if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
            font.push(fontStyle);
        }

        var fontVariant = prop(options, 'font-variant', style.getPropertyValue('font-variant'));
        if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
            font.push(fontVariant);
        }

        var fontSize = prop(options, 'font-size', style.getPropertyValue('font-size')) || DEFAULTS['font-size'];
        var fontSizeValue = parseFloat(fontSize);
        var fontSizeUnit = fontSize.replace(fontSizeValue, '');
        // eslint-disable-next-line default-case
        switch (fontSizeUnit) {
            case 'rem':
            case 'em':
                fontSizeValue *= 16;
                break;
            case 'pt':
                fontSizeValue /= 0.75;
                break;

        }

        font.push(fontSizeValue + 'px');

        var fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family')) || DEFAULTS['font-family'];
        font.push(fontFamily);

        return font.join(' ');
    }

    /**
     * check for CSSStyleDeclaration
     *
     * @param val
     * @returns {bool}
     */
    function isCSSStyleDeclaration(val) {
        return val && typeof val.getPropertyValue === 'function';
    }

    /**
     * check wether we can get computed style
     *
     * @param el
     * @returns {bool}
     */
    function canGetComputedStyle(el) {
        return isElement(el) && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
    }

    /**
     * check for DOM element
     *
     * @param el
     * @retutns {bool}
     */
    function isElement(el) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? el instanceof HTMLElement : Boolean(el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string');
    }

    /**
     * check if argument is object
     * @param obj
     * @returns {boolean}
     */
    function isObject(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null && !(obj instanceof Array);
    }

    /**
     * Get style declaration if available
     *
     * @returns {CSSStyleDeclaration}
     */
    function getStyle(el) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (isCSSStyleDeclaration(options.style)) {
            return options.style;
        }

        if (canGetComputedStyle(el)) {
            return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
        }

        return {
            getPropertyValue: function getPropertyValue(key) {
                return prop(options, key);
            }
        };
    }

    /**
     * get styled text
     *
     * @param {string} text
     * @param {CSSStyleDeclaration} style
     * @returns {string}
     */
    function getStyledText(text, style) {
        switch (style.getPropertyValue('text-transform')) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            default:
                return text;
        }
    }

    /**
     * Get property from src
     *
     * @param src
     * @param attr
     * @param defaultValue
     * @returns {*}
     */
    function prop(src, attr, defaultValue) {
        return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
    }

    /**
     * Normalize options
     *
     * @param options
     * @returns {*}
     */
    function normalizeOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var opts = {};

        // normalize keys (fontSize => font-size)
        Object.keys(options).forEach(function (key) {
            var dashedKey = key.replace(/([A-Z])/g, function ($1) {
                return '-' + $1.toLowerCase();
            });
            opts[dashedKey] = options[key];
        });

        return opts;
    }

    /**
     * Get Canvas
     * @param font
     * @throws {Error}
     * @return {Context2d}
     */
    function getContext2d(font) {
        try {
            var ctx = document.createElement('canvas').getContext('2d');
            ctx.font = font;
            return ctx;
        } catch (err) {
            throw new Error('Canvas support required');
        }
    }
});
},{}]},{},[1])(1)
});