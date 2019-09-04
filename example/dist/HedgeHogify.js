(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("HedgeHogify", [], factory);
	else if(typeof exports === 'object')
		exports["HedgeHogify"] = factory();
	else
		root["HedgeHogify"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ts/HedgeHogify.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ts/HedgeHogify.ts":
/*!*******************************!*\
  !*** ./src/ts/HedgeHogify.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar HedgeHogifyComponent = (function () {\n    function HedgeHogifyComponent() {\n        this._hedgeHogifyCount = 0;\n        this._hedgeHogifyUrl = 'https://nowtwo-llc.com/hedgehogify/';\n        this._windowHeight = 768;\n        this._windowWidth = 1024;\n        this._numType = 'px';\n        this._height = 0;\n        this._width = 0;\n    }\n    HedgeHogifyComponent.prototype.konami = function (callback) {\n        var input = '';\n        var key = '38384040373937396665';\n        document.addEventListener('keydown', function (ev) {\n            input += ('' + ev.keyCode);\n            if (input === key) {\n                return callback();\n            }\n            if (!key.indexOf(input)) {\n                return;\n            }\n            input = ('' + ev.keyCode);\n        });\n    };\n    HedgeHogifyComponent.prototype.add = function () {\n        this._hedgeHogifyCount += 1;\n        var _divEl = document.createElement('div');\n        _divEl.style.position = 'fixed';\n        var heightRandom = Math.random() * 0.75;\n        var documentEl = document.documentElement;\n        if (typeof (window.innerHeight) == 'number') {\n            this._windowHeight = window.innerHeight;\n            this._windowWidth = window.innerWidth;\n        }\n        else if (documentEl && documentEl.clientHeight) {\n            this._windowHeight = documentEl.clientHeight;\n            this._windowWidth = documentEl.clientWidth;\n        }\n        else {\n            this._numType = '%';\n            this._height = Math.round(this._height * 100);\n        }\n        _divEl.className = 'hedgehogify-image';\n        _divEl.style.zIndex = String(10);\n        _divEl.style.outline = String(0);\n        _divEl.style.webkitTransition = 'all .1s linear';\n        _divEl.style.webkitTransform = 'rotate(1deg) scale(1.01,1.01)';\n        _divEl.style.transition = 'all .1s linear';\n        if (this._hedgeHogifyCount == 15) {\n            _divEl.style.top = Math.max(0, Math.round((this._windowHeight - 530) / 2)) + 'px';\n            _divEl.style.left = Math.round((this._windowWidth - 530) / 2) + 'px';\n            _divEl.style.zIndex = String(1000);\n        }\n        else {\n            if (this._numType == 'px') {\n                _divEl.style.top = Math.round(this._windowHeight * heightRandom) + this._numType;\n            }\n            else {\n                _divEl.style.top = this._height + this._numType;\n            }\n            _divEl.style.left = Math.round(Math.random() * 90) + '%';\n        }\n        var _imgEl = document.createElement('img');\n        var currentTime = new Date();\n        var submitTime = currentTime.getTime();\n        if (this._hedgeHogifyCount == 15) {\n            submitTime = 0;\n        }\n        var requestUrl = this._hedgeHogifyUrl + 'randomize.php' +\n            '?r=' + submitTime + '&url=' + document.location.href;\n        _imgEl.setAttribute('src', requestUrl);\n        _imgEl.style.width = (Math.floor(Math.random() * (350 - 100)) + 100) + 'px';\n        var that = this;\n        _divEl.onmouseover = function (ev) {\n            var size = 1 + Math.round(Math.random() * 10) / 100;\n            var angle = Math.round(Math.random() * 20 - 10);\n            var result = 'rotate(' + angle + 'deg) scale(' + size + ',' + size + ')';\n            _divEl.style.transform = result;\n            _divEl.style.webkitTransform = result;\n        };\n        _divEl.onmouseout = function (ev) {\n            var size = .9 + Math.round(Math.random() * 10) / 100;\n            var angle = Math.round(Math.random() * 6 - 3);\n            var result = 'rotate(' + angle + 'deg) scale(' + size + ',' + size + ')';\n            _divEl.style.transform = result;\n            _divEl.style.webkitTransform = result;\n        };\n        var bodyEl = document.getElementsByTagName('body')[0];\n        bodyEl.appendChild(_divEl);\n        _divEl.appendChild(_imgEl);\n    };\n    HedgeHogifyComponent.prototype.burst = function (count) {\n        if (count === void 0) { count = 50; }\n        for (var i = 0; i < count; i++) {\n            this.add();\n        }\n        setTimeout(this.clear, 10000);\n    };\n    HedgeHogifyComponent.prototype.clear = function () {\n        var elements = document.querySelectorAll('.hedgehogify-image');\n        elements.forEach(function (el) { return el.remove(); });\n    };\n    return HedgeHogifyComponent;\n}());\nexports.HedgeHogifyComponent = HedgeHogifyComponent;\n\n\n//# sourceURL=webpack://HedgeHogify/./src/ts/HedgeHogify.ts?");

/***/ })

/******/ });
});