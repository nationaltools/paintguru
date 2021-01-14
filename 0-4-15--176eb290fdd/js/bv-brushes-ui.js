(function () {
"use strict";

var eventResMs = 1000 / 30;

/**
* UI for brushes.
* each brush ui carries the brush with it.
* so if you want to draw, you do it through the UI. should be changed sometime
*
* each brush: {
*     image: str,
*     tooltip: str,
*     sizeSlider: {
*         min: number,
*         max: number,
*         curve: []
*     },
*     opacitySlider: same as size slider,
*     Ui: function(p)
* }
*
*/
BV.BrushLibUI =
{
defaultBrush: (function () {
let brushInterface = {
image: '0-4-15--176eb290fdd/img/ui/brush-smpl.png',
tooltip: 'Pen',
sizeSlider: {
min: 0.5,
max: 100,
curve: BV.quadraticSplineInput(0.5, 100, 0.1)
},
opacitySlider: {
min: 0,
max: 1,
curve: [[0, 1 / 100], [0.5, 0.3], [1, 1]]
}
};

let alphaNames = ['Circle', 'Chalk', 'Calligraphy', 'Square'];

/**
* @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
* @constructor
*/
brushInterface.Ui = function (p) {
var div = document.createElement("div");
var brush = new BV.BrushLib.defaultBrush();
brush.setLogger(BV.pcLog);
p.onSizeChange(brush.getSize());
let sizeSlider;
let opacitySlider;

var alphas = [];
var currentAlpha = 0;
for (var i = 0; i < 4; i++) {
(function (i) {
var alpha = BV.el({
title: alphaNames[i]
});

let canvas = BV.createCanvas(70, 70);
let ctx = canvas.getContext('2d');

if (i === 0 || i === 3) {
if (i === 0) {
ctx.beginPath();
ctx.arc(35, 35, 25, 0, 2 * Math.PI);
ctx.closePath();
ctx.fill();
} else {
ctx.fillRect(10, 10, 50, 50);
}
alpha.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
canvas = null;
} else {
let im = new Image();
im.onload = function() {
ctx.drawImage(im, 7, 7, 54, 54);
alpha.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
im = null;
};
im.src = "0-4-15--176eb290fdd/img/brush-alpha/alpha_0" + i + ".png";
}

alphas.push(alpha);
alpha.onclick = function () {
alphaClick(i);
};
}(i));
}

function updateAlphas() {
for (var i = 0; i < alphas.length; i++) {
if (i === currentAlpha) {
alphas[i].className = 'brush-alpha-selected';
} else {
alphas[i].className = 'brush-alpha';
}
}
}

updateAlphas();

function alphaClick(id) {
currentAlpha = id;
brush.setAlpha(id);
updateAlphas();
}

var lockAlphaToggle = BV.checkBox({
init: brush.getLockAlpha(),
label: 'Lock Alpha',
callback: function (b) {
brush.setLockAlpha(b);
}
});
lockAlphaToggle.title = "Locks layer's alpha channel";
lockAlphaToggle.style.cssFloat = 'right';
lockAlphaToggle.style.width = '97px';
lockAlphaToggle.style.textAlign = 'right';

var spacingSpline = new BV.SplineInterpolator([[0, 15], [8, 7], [14, 4], [30, 3], [50, 2.7], [100, 2]]);

function setSize(size) {
brush.setSize(size);
brush.setSpacing(Math.max(2, spacingSpline.interpolate(size)) / 15);
}

function init() {
sizeSlider = new BV.PcSlider({
label: 'Size',
width: 225,
height: 30,
min: brushInterface.sizeSlider.min,
max: brushInterface.sizeSlider.max,
initValue: brush.getSize(),
eventResMs: eventResMs,
onChange: function (val) {
setSize(val);
p.onSizeChange(val);
},
curve: brushInterface.sizeSlider.curve,
formatFunc: function (v) {
v *= 2;
if (v < 10) {
return Math.round(v * 10) / 10;
} else {
return Math.round(v);
}
}
});
opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 225,
height: 30,
min: brushInterface.opacitySlider.min,
max: brushInterface.opacitySlider.max,
initValue: brushInterface.opacitySlider.max,
eventResMs: eventResMs,
onChange: function (val) {
brush.setOpacity(val);
p.onOpacityChange(val);
},
curve: brushInterface.opacitySlider.curve,
formatFunc: function(v) {
return Math.round(v * 100);
}
});

var pressureSizeToggle = BV.penPressureToggle(true, function (b) {
brush.sizePressure(b);
});
var pressureOpacityToggle = BV.penPressureToggle(false, function (b) {
brush.opacityPressure(b);
});

div.appendChild(pressureSizeToggle);
div.appendChild(sizeSlider.getElement());
BV.el({
parent: div,
css: {
clear: 'both',
marginBottom: '10px'
}
});
div.appendChild(pressureOpacityToggle);
div.appendChild(opacitySlider.getElement());

var alphaWrapper = document.createElement("div");
for (var i = 0; i < alphas.length; i++) {
alphaWrapper.appendChild(alphas[i]);
}
alphaWrapper.style.marginTop = "10px";
div.appendChild(alphaWrapper);
alphaWrapper.appendChild(lockAlphaToggle);

}

init();

this.increaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.increaseValue(f);
}
};
this.decreaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.decreaseValue(f);
}
};

this.getSize = function () {
return brush.getSize();
};
this.setSize = function(size) {
setSize(size);
sizeSlider.setValue(size);
};
this.getOpacity = function () {
return brush.getOpacity();
};
this.setOpacity = function(opacity) {
brush.setOpacity(opacity);
opacitySlider.setValue(opacity);
};

this.setColor = function (c) {
brush.setColor(c);
};
this.setContext = function (c) {
brush.setContext(c);
};
this.startLine = function (x, y, p) {
brush.startLine(x, y, p);
};
this.goLine = function (x, y, p) {
brush.goLine(x, y, p);
};
this.endLine = function (x, y) {
brush.endLine(x, y);
};
this.getBrush = function () {
return brush;
};
this.isDrawing = function () {
return brush.isDrawing();
};
this.getElement = function () {
return div;
};
};
return brushInterface;
})(),
smoothBrush: (function () {
let brushInterface = {
image: '0-4-15--176eb290fdd/img/ui/brush-smooth.png',
tooltip: 'Blend',
sizeSlider: {
min: 0.5,
max: 200,
curve: BV.quadraticSplineInput(0.5, 200, 0.1)
},
opacitySlider: {
min: 1 / 100,
max: 1
}
};

/**
* @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
* @constructor
*/
brushInterface.Ui = function (p) {
var div = document.createElement("div");
var brush = new BV.BrushLib.smoothBrush();
brush.setLogger(BV.pcLog);
p.onSizeChange(brush.getSize());

let sizeSlider;
let opacitySlider;

function setSize(size) {
brush.setSize(size);
}

function init() {
sizeSlider = new BV.PcSlider({
label: 'Size',
width: 225,
height: 30,
min: brushInterface.sizeSlider.min,
max: brushInterface.sizeSlider.max,
initValue: 58 / 2,
eventResMs: eventResMs,
onChange: function (val) {
setSize(val);
p.onSizeChange(val);
},
curve: brushInterface.sizeSlider.curve,
formatFunc: function (v) {
v *= 2;
return Math.round(v);
}
});
opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 225,
height: 30,
min: brushInterface.opacitySlider.min,
max: brushInterface.opacitySlider.max,
initValue: brush.getOpacity(),
eventResMs: eventResMs,
onChange: function (val) {
brush.setOpacity(val);
p.onOpacityChange(val);
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});
var blendingSlider = new BV.PcSlider({
label: 'Blending',
width: 225,
height: 30,
min: 0,
max: 100,
initValue: brush.getBlending() * 100,
eventResMs: eventResMs,
onChange: function (val) {
brush.setBlending(val / 100);
}
});
blendingSlider.getElement().style.marginTop = "10px";

var pressureSizeToggle = BV.penPressureToggle(true, function (b) {
brush.sizePressure(b);
});
var pressureOpacityToggle = BV.penPressureToggle(false, function (b) {
brush.opacityPressure(b);
});

var lockAlphaToggle = BV.checkBox({
init: brush.getLockAlpha(),
label: 'Lock Alpha',
callback: function (b) {
brush.setLockAlpha(b);
}
});
lockAlphaToggle.title = "Locks layer's alpha channel";
BV.css(lockAlphaToggle, {
width: '97px',
marginTop: '10px'
});


div.appendChild(pressureSizeToggle);
div.appendChild(sizeSlider.getElement());
BV.el({
parent: div,
css: {
clear: 'both',
marginBottom: '10px'
}
});
div.appendChild(pressureOpacityToggle);
div.appendChild(opacitySlider.getElement());
div.appendChild(blendingSlider.getElement());
div.appendChild(lockAlphaToggle);
}

init();

this.increaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.increaseValue(f);
}
};
this.decreaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.decreaseValue(f);
}
};

this.getSize = function () {
return brush.getSize();
};
this.setSize = function(size) {
setSize(size);
sizeSlider.setValue(size);
};
this.getOpacity = function () {
return brush.getOpacity();
};
this.setOpacity = function(opacity) {
brush.setOpacity(opacity);
opacitySlider.setValue(opacity);
};

this.setColor = function (c) {
brush.setColor(c);
};
this.setContext = function (c) {
brush.setContext(c);
};
this.startLine = function (x, y, p) {
brush.startLine(x, y, p);
};
this.goLine = function (x, y, p, isCoalesced) {
brush.goLine(x, y, p, undefined, isCoalesced);
};
this.endLine = function () {
brush.endLine();
};

this.setRequestCanvas = function (f) {
brush.setRequestCanvas(f);
};
this.getBrush = function () {
return brush;
};
this.isDrawing = function () {
return brush.isDrawing();
};
this.getElement = function () {
return div;
};
};

return brushInterface;
})(),
sketchy: (function () {
let brushInterface = {
image: '0-4-15--176eb290fdd/img/ui/brush-sketchy.png',
tooltip: 'Sketchy',
sizeSlider: {
min: 0.5,
max: 10
},
opacitySlider: {
min: 1 / 100,
max: 1
}
};

/**
* @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
* @constructor
*/
brushInterface.Ui = function (p) {
var div = document.createElement("div");
var brush = new BV.BrushLib.sketchy();
brush.setLogger(BV.pcLog);
p.onSizeChange(brush.getSize());
let sizeSlider;
let opacitySlider;

function setSize(size) {
brush.setSize(size);
}

function init() {
sizeSlider = new BV.PcSlider({
label: 'Size',
width: 250,
height: 30,
min: brushInterface.sizeSlider.min,
max: brushInterface.sizeSlider.max,
initValue: brush.getSize(),
eventResMs: eventResMs,
onChange: function (val) {
brush.setSize(val);
p.onSizeChange(brush.getSize());
},
formatFunc: function (v) {
v *= 2;
if (v < 10) {
return Math.round(v * 10) / 10;
} else {
return Math.round(v);
}
}
});
opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 250,
height: 30,
min: brushInterface.opacitySlider.min,
max: brushInterface.opacitySlider.max,
initValue: brush.getOpacity(),
eventResMs: eventResMs,
onChange: function (val) {
brush.setOpacity(val);
p.onOpacityChange(val);
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});
var blendSlider = new BV.PcSlider({
label: 'Blending',
width: 250,
height: 30,
min: 0,
max: 100,
initValue: brush.getBlending() * 100,
eventResMs: eventResMs,
onChange: function (val) {
brush.setBlending(val / 100);
}
});
var scaleSlider = new BV.PcSlider({
label: 'Scale',
width: 250,
height: 30,
min: 1,
max: 20,
initValue: brush.getScale(),
eventResMs: eventResMs,
onChange: function (val) {
brush.setScale(val);
}
});
opacitySlider.getElement().style.marginTop = "10px";
blendSlider.getElement().style.marginTop = "10px";
scaleSlider.getElement().style.marginTop = "10px";
div.appendChild(sizeSlider.getElement());
div.appendChild(opacitySlider.getElement());
div.appendChild(blendSlider.getElement());
div.appendChild(scaleSlider.getElement());
}

init();

this.increaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.increaseValue(f);
}
};
this.decreaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.decreaseValue(f);
}
};
this.getSize = function () {
return brush.getSize();
};
this.setSize = function(size) {
setSize(size);
sizeSlider.setValue(size);
};
this.getOpacity = function () {
return brush.getOpacity();
};
this.setOpacity = function(opacity) {
brush.setOpacity(opacity);
opacitySlider.setValue(opacity);
};
this.setColor = function (c) {
brush.setColor(c);
};
this.setContext = function (c) {
brush.setContext(c);
};
this.startLine = function (x, y, pressure) {
brush.startLine(x, y, pressure);
};
this.goLine = function (x, y, pressure) {
brush.goLine(x, y, pressure, null);
};
this.endLine = function () {
brush.endLine();
};
this.getSeed = function () {
return parseInt(brush.getSeed());
};
this.setSeed = function (s) {
brush.setSeed(parseInt(s));
};
this.getBrush = function () {
return brush;
};
this.isDrawing = function () {
return brush.isDrawing();
};
this.getElement = function () {
return div;
};
};

return brushInterface;
})(),
pixel: (function () {
let brushInterface = {
image: '0-4-15--176eb290fdd/img/ui/brush-pixel.png',
tooltip: 'Pixel',
sizeSlider: {
min: 0.5,
max: 100,
curve: BV.quadraticSplineInput(0.5, 100, 0.1)
},
opacitySlider: {
min: 0,
max: 1,
curve: [[0, 1 / 100], [0.5, 0.3], [1, 1]]
}
};

/**
* @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
* @constructor
*/
brushInterface.Ui = function (p) {
var div = document.createElement("div");
var brush = new BV.BrushLib.pixel();
brush.setLogger(BV.pcLog);
p.onSizeChange(brush.getSize());
let sizeSlider;
let opacitySlider;

var lockAlphaToggle = BV.checkBox({
init: brush.getLockAlpha(),
label: 'Lock Alpha',
callback: function (b) {
brush.setLockAlpha(b);
}
});
lockAlphaToggle.title = "Locks layer's alpha channel";
BV.css(lockAlphaToggle, {
width: '97px',
marginRight: '10px'
});

let eraserToggle = BV.checkBox({
init: brush.getIsEraser(),
label: 'Eraser',
callback: function (b) {
brush.setIsEraser(b);
}
});
BV.css(eraserToggle, {
width: '70px',
marginRight: '10px'
});

let ditherToggle = BV.checkBox({
init: brush.getUseDither(),
label: 'Dither',
callback: function (b) {
brush.setUseDither(b);
}
});

var spacingSpline = new BV.SplineInterpolator([[0.5, 0.45], [100, 4]]);

function setSize(size) {
brush.setSize(size);
brush.setSpacing(spacingSpline.interpolate(size) / size);
}

function init() {
sizeSlider = new BV.PcSlider({
label: 'Size',
width: 225,
height: 30,
min: brushInterface.sizeSlider.min,
max: brushInterface.sizeSlider.max,
initValue: brush.getSize(),
eventResMs: eventResMs,
onChange: function (val) {
setSize(val);
p.onSizeChange(val);
},
curve: brushInterface.sizeSlider.curve,
formatFunc: function (v) {
v *= 2;
return Math.round(v);
}
});
opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 225,
height: 30,
min: brushInterface.opacitySlider.min,
max: brushInterface.opacitySlider.max,
initValue: brushInterface.opacitySlider.max,
eventResMs: eventResMs,
onChange: function (val) {
brush.setOpacity(val);
p.onOpacityChange(val);
},
curve: brushInterface.opacitySlider.curve,
formatFunc: function(v) {
return Math.round(v * 100);
}
});

var pressureSizeToggle = BV.penPressureToggle(true, function (b) {
brush.sizePressure(b);
});

div.appendChild(pressureSizeToggle);
div.appendChild(sizeSlider.getElement());
BV.el({
parent: div,
css: {
clear: 'both',
marginBottom: '10px'
}
});
div.appendChild(opacitySlider.getElement());

let toggleRow = BV.el({
parent: div,
css: {
display: 'flex',
marginTop: '10px'
}
});

toggleRow.appendChild(lockAlphaToggle);
toggleRow.appendChild(eraserToggle);
toggleRow.appendChild(ditherToggle);
}

init();

this.increaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.increaseValue(f);
}
};
this.decreaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.decreaseValue(f);
}
};

this.getSize = function () {
return brush.getSize();
};
this.setSize = function(size) {
setSize(size);
sizeSlider.setValue(size);
};
this.getOpacity = function () {
return brush.getOpacity();
};
this.setOpacity = function(opacity) {
brush.setOpacity(opacity);
opacitySlider.setValue(opacity);
};

this.setColor = function (c) {
brush.setColor(c);
};
this.setContext = function (c) {
brush.setContext(c);
};
this.startLine = function (x, y, p) {
brush.startLine(x, y, p);
};
this.goLine = function (x, y, p) {
brush.goLine(x, y, p);
};
this.endLine = function (x, y) {
brush.endLine(x, y);
};
this.getBrush = function () {
return brush;
};
this.isDrawing = function () {
return brush.isDrawing();
};
this.getElement = function () {
return div;
};
};
return brushInterface;
})(),
eraser: (function () {
let brushInterface = {
image: '0-4-15--176eb290fdd/img/ui/brush-eraser.png',
tooltip: 'Eraser',
sizeSlider: {
min: 0.5,
max: 200,
curve: BV.quadraticSplineInput(0.5, 200, 0.1)
},
opacitySlider: {
min: 1 / 100,
max: 1
}
};

/**
* @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
* @constructor
*/
brushInterface.Ui = function (p) {
var div = document.createElement("div");
var brush = new BV.BrushLib.eraser();
brush.setLogger(BV.pcLog);
p.onSizeChange(brush.getSize());

let sizeSlider;
let opacitySlider;
var isTransparentBg = false;

function setSize(size) {
brush.setSize(size);
}

function init() {
sizeSlider = new BV.PcSlider({
label: 'Size',
width: 225,
height: 30,
min: brushInterface.sizeSlider.min,
max: brushInterface.sizeSlider.max,
initValue: 30,
eventResMs: eventResMs,
onChange: function (val) {
setSize(val);
p.onSizeChange(val);
},
curve: brushInterface.sizeSlider.curve,
formatFunc: function (v) {
v *= 2;
if (v < 10) {
return Math.round(v * 10) / 10;
} else {
return Math.round(v);
}
}
});
opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 225,
height: 30,
min: brushInterface.opacitySlider.min,
max: brushInterface.opacitySlider.max,
initValue: 1,
eventResMs: eventResMs,
onChange: function (val) {
brush.setOpacity(val);
p.onOpacityChange(val);
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});

var pressureSizeToggle = BV.penPressureToggle(true, function (b) {
brush.sizePressure(b);
});
var pressureOpacityToggle = BV.penPressureToggle(false, function (b) {
brush.opacityPressure(b);
});

div.appendChild(pressureSizeToggle);
div.appendChild(sizeSlider.getElement());
BV.el({
parent: div,
css: {
clear: 'both',
marginBottom: '10px'
}
});
div.appendChild(pressureOpacityToggle);
div.appendChild(opacitySlider.getElement());

var transparencyToggle = BV.checkBox({
init: false,
label: 'Transparent Background',
callback: function (b) {
isTransparentBg = b;
brush.setTransparentBG(b);
}
});
transparencyToggle.style.marginTop = "10px";
div.appendChild(transparencyToggle);
}

init();

function drawDot(x, y) {
brush.drawDot(x, y);
}

this.increaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.increaseValue(f);
}
};
this.decreaseSize = function (f) {
if (!brush.isDrawing()) {
sizeSlider.decreaseValue(f);
}
};
this.getSize = function () {
return brush.getSize();
};
this.setSize = function(size) {
setSize(size);
sizeSlider.setValue(size);
};
this.getOpacity = function () {
return brush.getOpacity();
};
this.setOpacity = function(opacity) {
brush.setOpacity(opacity);
opacitySlider.setValue(opacity);
};
this.setColor = function (c) {

};
this.setContext = function (c) {
brush.setContext(c);
};
this.startLine = function (x, y, p) {
brush.startLine(x, y, p);
};
this.goLine = function (x, y, p) {
brush.goLine(x, y, p);
};
this.endLine = function () {
brush.endLine();
};
this.getBrush = function () {
return brush;
};
this.getIsTransparentBg = function () {
return isTransparentBg;
};
this.isDrawing = function () {
return brush.isDrawing();
};
this.getElement = function () {
return div;
}
};

return brushInterface;
})()
};

})();
