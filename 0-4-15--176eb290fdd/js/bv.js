 var BV = {};

(function () {
"use strict";



if (!Array.prototype.includes) {
Object.defineProperty(Array.prototype, "includes", {
value: function (searchElement, fromIndex) {
if (this == null) {
throw new TypeError('"this" is null or not defined')
}
var o = Object(this);
var len = o.length >>> 0;
if (len === 0) {
return false
}
var n = fromIndex | 0;
var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

function sameValueZero(x, y) {
return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y)
}

while (k < len) {
if (sameValueZero(o[k], searchElement)) {
return true
}
k++
}
return false
}
})
}

if (!Math.log2) Math.log2 = function (x) {
return Math.log(x) * Math.LOG2E;
};


if (!String.prototype.padStart) {
String.prototype.padStart = function padStart(targetLength, padString) {
targetLength = targetLength >> 0;
padString = String(typeof padString !== 'undefined' ? padString : ' ');
if (this.length >= targetLength) {
return String(this);
} else {
targetLength = targetLength - this.length;
if (targetLength > padString.length) {
padString += padString.repeat(targetLength / padString.length);
}
return padString.slice(0, targetLength) + String(this);
}
};
}



BV.pcLog = (function () {
var clearCount = 0;
var state = 0;
var pcLog = {};
var dataArr = [];
var listeners = [];
var pauseStack = 0;
var max = 14;
var maxState = -1;

var currentIndex = -1;

pcLog.clear = function () {
dataArr = [];
pauseStack = 0;
currentIndex = -1;
maxState = -1;
clearCount++;
broadcast();
};






pcLog.pause = function (b) {
if (b === false) {
pauseStack = Math.max(0, pauseStack - 1);
} else {
pauseStack++;
}
};

pcLog.addListener = function (l) {
listeners.push(l);
};

function broadcast(p) {
setTimeout(function () {
for (var i = 0; i < listeners.length; i++) {
listeners[i](p);
}
state++;
}, 1);
}

pcLog.add = function (e) {
if (pauseStack > 0) {
return;
}
while (currentIndex < dataArr.length - 1) {
dataArr.pop();
}


var top = dataArr[dataArr.length - 1];
if (e.action === "layerOpacity" && top && top.action === "layerOpacity" && top.params[0] === e.params[0]) {
dataArr[dataArr.length - 1] = e;
state++;
return;
}
if (e.action === "focusLayer" && top && top.action === "focusLayer") {
dataArr[dataArr.length - 1] = e;
state++;
return;
}


dataArr[dataArr.length] = e;
currentIndex = dataArr.length - 1;
var maxBefore = maxState;
maxState = Math.max(maxState, currentIndex - max);
if (maxBefore < maxState) {
broadcast({bufferUpdate: dataArr[maxState]});
} else {
broadcast();
}
dataArr[maxState] = {};
};
pcLog.undo = function () {
if (pcLog.canUndo()) {
var result = [];
for (var i = maxState + 1; i < currentIndex; i++) {
result.push(dataArr[i]);
}
currentIndex--;
broadcast();
}

return result;
};
pcLog.redo = function () {
var result = [];
if (pcLog.canRedo()) {
currentIndex++;
result.push(dataArr[currentIndex]);
broadcast();
}
return result;
};
pcLog.getAll = function () {
var result = [];
for (var i = 0; i < dataArr.length; i++) {
result[i] = dataArr[i];
}
return result;
};
pcLog.canRedo = function () {
return currentIndex < dataArr.length - 1;
};
pcLog.canUndo = function () {
return currentIndex > maxState;
};
pcLog.getState = function () {
return parseInt(state, 10);
};

/**
* clearCount - how often clear was called
* actionNumber - number of undo-able actions a user has done (e.g. if drawn 5 lines total -> 5)
* @returns [clearCount int, actionNumber int]
*/
pcLog.getActionNumber = function() {
return [clearCount, currentIndex + 1];
};
return pcLog;
})();

BV.insertAfter = function (referenceNode, newNode) {
referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};


BV.createCanvas = function (w, h) {


var result = document.createElement("canvas");
if (w && h) {
result.width = w;
result.height = h;
}
return result;
};

BV.copyCanvas = function (canvas) {
var resultCanvas = BV.createCanvas(canvas.width, canvas.height);
resultCanvas.getContext("2d").drawImage(canvas, 0, 0);
return resultCanvas;
};

/**
* @param baseCanvas - the canvas that will be drawn on
* @param transformImage - image that will be drawn on canvas
* @param transformObj - {x, y, width, height, angle} - x and y are center of transformImage
* @param boundsObj object - optional {x, y, width, height} - crop of transformImage in transformImage image space
*/
BV.drawTransformedImageOnCanvasDeprectated = function (baseCanvas, transformImage, transformObj, boundsObj) {
if (!boundsObj) {
boundsObj = {
x: 0,
y: 0,
width: transformImage.width,
height: transformImage.height
};
}

var translateX = transformObj.x - (boundsObj.x + boundsObj.width / 2);
var translateY = transformObj.y - (boundsObj.y + boundsObj.height / 2);
var scaleX = transformObj.width / boundsObj.width;
var scaleY = transformObj.height / boundsObj.height;

var ctx = baseCanvas.getContext("2d");
ctx.save();
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

ctx.translate(transformObj.x, transformObj.y);
ctx.rotate(transformObj.angle / 180 * Math.PI);
ctx.scale(scaleX, scaleY);
ctx.translate(-transformObj.x, -transformObj.y);
ctx.translate(translateX, translateY);
ctx.drawImage(transformImage, 0, 0, transformImage.width, transformImage.height);

ctx.restore();
};

/**
* all transformations are optional
* center is the point around which will be scaled and rotated
*
* @param baseCanvas canvas - the canvas that will be drawn on
* @param transformImage image|canvas - image that will be drawn on canvas
* @param transformObj {center: {x, y}, scale: {x, y}, translate: {x, y}, angleDegree}
*/
BV.drawTransformedImageOnCanvas = function (baseCanvas, transformImage, transformObj) {

if (!transformObj.center) {
transformObj.center = {
x: transformImage.width / 2,
y: transformImage.height / 2
}
}
if (!transformObj.scale) {
transformObj.scale = {
x: 1,
y: 1
};
}
if (!transformObj.angleDegree) {
transformObj.angleDegree = 0;
}
if (!transformObj.translate) {
transformObj.translate = {
x: 0,
y: 0
};
}

var ctx = baseCanvas.getContext("2d");
ctx.save();
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

ctx.translate(transformObj.translate.x, transformObj.translate.y);
ctx.translate(transformObj.center.x, transformObj.center.y);
ctx.rotate(transformObj.angleDegree / 180 * Math.PI);
ctx.scale(transformObj.scale.x, transformObj.scale.y);
ctx.translate(-transformObj.center.x, -transformObj.center.y);
ctx.drawImage(transformImage, 0, 0, transformImage.width, transformImage.height);

ctx.restore();
};

BV.loadImage = function (im, callback) {
var counter = 0;

function check() {
if (counter === 1000) {
alert("couldn't load");
return;
}
if (im.complete) {
counter++;
callback();
} else {
setTimeout(check, 1);
}
}

check();
};

BV.getPageOffset = function (element) {
let result = {
x: 0,
y: 0
};
while (element != null) {
result.x += element.offsetLeft;
result.y += element.offsetTop;
element = element.offsetParent;
}
return result;
};

BV.css = function (el, styleObj) {
let keyArr = Object.keys(styleObj);
let keyStr;
for(let i = 0; i < keyArr.length; i++) {
keyStr = keyArr[i];
el.style[keyStr] = styleObj[keyStr];
if (keyStr === 'userSelect') {
el.style.msUserSelect = styleObj[keyStr];
el.style.webkitUserSelect = styleObj[keyStr];
}
if (keyStr === 'transform') {
el.style.msTransform = styleObj[keyStr];
}
}
};

BV.setAttributes = function(el, attrObj) {
let keyArr = Object.keys(attrObj);
let keyStr;
for(let i = 0; i < keyArr.length; i++) {
keyStr = keyArr[i];
el.setAttribute(keyStr, attrObj[keyStr]);
}
};

BV.addClassName = function(el, classStr) {
let splitArr = el.getAttribute('class') === null ? [] : el.getAttribute('class').split(' ');
if(splitArr.includes(classStr)) {
return;
}
splitArr.push(classStr);
el.setAttribute('class', splitArr.join(' '));
};

BV.removeClassName = function(el, classStr) {
let splitArr = el.getAttribute('class') === null ? [] : el.getAttribute('class').split(' ');
if(!splitArr.includes(classStr)) {
return;
}
for(let i = 0; i < splitArr.length; i++) {
if(splitArr[i] === classStr) {
splitArr.splice(i, 1);
i--;
}
}
el.setAttribute('class', splitArr.join(' '));
};

BV.createCheckerCanvas = function(size) {
let canvas = BV.createCanvas();
let ctx;
if (size < 1) {
canvas.width = 1;
canvas.height = 1;
ctx = canvas.getContext("2d");
ctx.fillStyle = "rgb(128, 128, 128)";
ctx.fillRect(0, 0, 1, 1);
} else if (size > 200) {
canvas.width = 401;
canvas.height = 401;
} else {
canvas.width = size * 2;
canvas.height = size * 2;
ctx = canvas.getContext("2d");
ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, size * 2, size * 2);
ctx.fillStyle = "rgb(200, 200, 200)";
ctx.fillRect(0, 0, size, size);
ctx.fillRect(size, size, size * 2, size * 2);
}
return canvas;
};

BV.createCheckerDataUrl = (function () {
var cache = {
'8': '',
'4': ''
};

return function (size, callback) {
function create(size) {
size = parseInt(size);
if (cache['' + size]) {
return cache['' + size];
}
var canvas = BV.createCheckerCanvas(size);
var result = canvas.toDataURL('image/png');
cache['' + size] = result;
return result;
}

if (callback) {
setTimeout(function () {
callback(create(size));
}, 1);
} else {
return create(size);
}
};
})();

/**
* smooth resize image
* @param canvas canvas - will be resized (modified)
* @param w
* @param h
* @param tmp1 canvas - optional, provide to save resources
* @param tmp2 canvas - optional, provide to save resources
*/
BV.resizeCanvas = function (canvas, w, h, tmp1, tmp2) {


function getBase2Obj(oldW, oldH, newW, newH) {
let result = {
oldWidthEx: Math.round(Math.log2(oldW)),
oldHeightEx: Math.round(Math.log2(oldH)),
newWidthEx: Math.ceil(Math.log2(newW)),
newHeightEx: Math.ceil(Math.log2(newH))
};
result.oldWidthEx = Math.max(result.oldWidthEx, result.newWidthEx);
result.oldHeightEx = Math.max(result.oldHeightEx, result.newHeightEx);
return result;
}

if (!w || !h || (w === canvas.width && h === canvas.height)) {
return;
}
w = Math.max(w, 1);
h = Math.max(h, 1);
if (w <= canvas.width && h <= canvas.height) {

tmp1 = !tmp1 ? BV.createCanvas() : tmp1;
tmp2 = !tmp2 ? BV.createCanvas() : tmp2;

var base2 = getBase2Obj(canvas.width, canvas.height, w, h);


tmp2.width = base2.oldWidthEx > base2.newWidthEx ? Math.pow(2, base2.oldWidthEx) : w;
tmp2.height = base2.oldHeightEx > base2.newHeightEx ? Math.pow(2, base2.oldHeightEx) : h;
tmp1.getContext('2d').save();
tmp2.getContext('2d').save();

var ew, eh;
var temp;
var buffer1 = tmp1, buffer2 = tmp2;

ew = base2.oldWidthEx;
eh = base2.oldHeightEx;

let bufferCtx = buffer2.getContext('2d');
bufferCtx.imageSmoothingEnabled = true;
bufferCtx.imageSmoothingQuality  = 'high';
bufferCtx.globalCompositeOperation  = 'copy';
bufferCtx.drawImage(canvas, 0, 0, buffer2.width, buffer2.height);

let currentWidth = buffer2.width;
let currentHeight = buffer2.height;


for (; ew > base2.newWidthEx || eh > base2.newHeightEx; ew--, eh--) {
bufferCtx = buffer1.getContext("2d");
bufferCtx.imageSmoothingEnabled = true;
bufferCtx.imageSmoothingQuality  = 'high';
bufferCtx.globalCompositeOperation  = 'copy';

let newWidth = (ew > base2.newWidthEx) ? currentWidth / 2 : currentWidth;
let newHeight = (eh > base2.newHeightEx) ? currentHeight / 2 : currentHeight;


buffer1.width = newWidth;
buffer1.height = newHeight;

bufferCtx.drawImage(
buffer2,
0, 0,
currentWidth, currentHeight,
0, 0,
newWidth, newHeight
);
currentWidth = newWidth;
currentHeight = newHeight;


let tmp = buffer1;
buffer1 = buffer2;
buffer2 = tmp;
}


canvas.width = w;
canvas.height = h;
let canvasCtx = canvas.getContext("2d");
canvasCtx.save();
canvasCtx.imageSmoothingEnabled = true;
canvasCtx.imageSmoothingQuality  = 'high';
canvasCtx.drawImage(
buffer2,
0, 0,
currentWidth, currentHeight,
0, 0,
w, h
);
canvasCtx.restore();
tmp1.getContext('2d').restore();
tmp2.getContext('2d').restore();

} else if (w >= canvas.width && h >= canvas.height) {

tmp1 = !tmp1 ? BV.createCanvas() : tmp1;
tmp1.width = w;
tmp1.height = h;
let tmp1Ctx = tmp1.getContext('2d');
tmp1Ctx.save();
tmp1Ctx.imageSmoothingEnabled = true;
tmp1Ctx.imageSmoothingQuality  = 'high';
tmp1Ctx.drawImage(canvas, 0, 0, w, h);
tmp1Ctx.restore();

canvas.width = w;
canvas.height = h;
canvas.getContext("2d").drawImage(tmp1, 0, 0);

} else {
BV.resizeCanvas(canvas, w, canvas.height, tmp1, tmp2);
BV.resizeCanvas(canvas, w, h, tmp1, tmp2);
}
};

/**
* b needs to fit a
* @param aw
* @param ah
* @param bw
* @param bh
* @returns {{width: *, height: *}}
*/
BV.fitInto = function (aw, ah, bw, bh, min) {
var w = bw * aw, h = bh * aw;
if (w > aw) {
h = aw / w * h;
w = aw;
}
if (h > ah) {
w = ah / h * w;
h = ah;
}
if(min) {
w = Math.max(min, w);
h = Math.max(min, h);
}
return {width: w, height: h};
};


BV.centerWithin = function (aw, ah, bw, bh) {
return {
x: aw / 2 - bw / 2,
y: ah / 2 - bh / 2
};
};

BV.rotate = function (x, y, deg) {
var theta = deg * (Math.PI / 180);
var cs = Math.cos(theta);
var sn = Math.sin(theta);

return {
x: x * cs - y * sn,
y: x * sn + y * cs
};
};

BV.rotateAround = function (center, point, deg) {
var rot = BV.rotate(point.x - center.x, point.y - center.y, deg);
rot.x += center.x;
rot.y += center.y;
return rot;
};

BV.angleDeg = function (center, p1) {
var p0 = {
x: center.x,
y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x) + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))
};
return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
};

BV.angleFromPoints = function (p1, p2) {
return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};

BV.pointsToAngleRad = function(p1, p2) {
return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

BV.projectPointOnLine = function (line1, line2, toProject) {
var x, y;
if (line1.x === line2.x) {
x = line1.x;
y = toProject.y;

return {
x: x,
y: y
};
}
var m = (line2.y - line1.y) / (line2.x - line1.x);
var b = line1.y - (m * line1.x);

x = (m * toProject.y + toProject.x - m * b) / (m * m + 1);
y = (m * m * toProject.y + m * toProject.x + b) / (m * m + 1);

return {
x: x,
y: y
};
};

BV.dist = function (ax, ay, bx, by) {
return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
};

BV.hasWebGl = (function() {

let hasWebgl = (function() {
var canvas = document.createElement('canvas');
try {
gl = canvas.getContext('experimental-webgl', { premultipliedAlpha: false });
return true;
} catch (e) {
return false;
}
});

return function() {
return hasWebgl;
}
})();


/**
* Operations on a line made up of points
*
* getAtDist(dist) - point when traveling *dist* along the line
* getLength - gives you total length of line
*
* @param params object - {points: [{x:float, y:float}, ...]}
* @constructor
*/
BV.PointLine = function (params) {
var segmentArr = [];
var _this = this;

for (var i = 0; i < params.points.length; i++) {
(function (i) {
var length = undefined;
if (i < params.points.length - 1) {
length = BV.dist(params.points[i].x, params.points[i].y, params.points[i + 1].x, params.points[i + 1].y);
}
segmentArr[i] = {
x: params.points[i].x,
y: params.points[i].y,
length: length
};
})(i);
}

/**
* @param dist number - distance in pixels, > 0
* @returns {{x: number, y: number}}
*/
this.getAtDist = function (dist) {
var remainder = Math.min(_this.getLength(), dist);
var i = 0;

for (; remainder > segmentArr[i].length && i < segmentArr.length - 2; i++) {
remainder -= segmentArr[i].length;
}

var fac = Math.min(1, Math.max(0, remainder / segmentArr[i].length));

return {
x: (segmentArr[i].x * (1 - fac) + segmentArr[i + 1].x * fac),
y: (segmentArr[i].y * (1 - fac) + segmentArr[i + 1].y * fac)
};
};
this.getLength = function () {
var result = 0;
for (var i = 0; i < segmentArr.length - 1; i++) {
result += segmentArr[i].length;
}
return result;
};
};

/**
* Each instance is one line made up of bezier interpolated segments.
* You feed it points. It calculates control points on its own, and the resulting curve.
*
* @constructor
*/
BV.BezierLine = function () {
let _this = this;
var pointArr = [];
var lastDot = 0;
var lastPoint;
var lastCallbackPoint;
var lastAngle;
let lastSpacing = null;

/**
* creates bezier curve from control points
*
* @param p1 - control point 1 {x: float, y: float}
* @param p2 - control point 2 {x: float, y: float}
* @param p3 - control point 3 {x: float, y: float}
* @param p4 - control point 4 {x: float, y: float}
* @param resolution - int
* @returns {Array} - bezier curve made up of points {x: float, y: float}
*/
function getBezierPoints(p1, p2, p3, p4, resolution) {
var curvePoints = [];
var t, result;
for (var i = 0; i <= resolution; i++) {
t = i / resolution;
result = {};
result.x = Math.pow(1 - t, 3) * p1.x + 3 * Math.pow(1 - t, 2) * t * p2.x + 3 * (1 - t) * Math.pow(t, 2) * p3.x + Math.pow(t, 3) * p4.x;
result.y = Math.pow(1 - t, 3) * p1.y + 3 * Math.pow(1 - t, 2) * t * p2.y + 3 * (1 - t) * Math.pow(t, 2) * p3.y + Math.pow(t, 3) * p4.y;
curvePoints[curvePoints.length] = result;
}
return curvePoints;
}

/**
*
* add now point to line
* line will go until the previous point
*
* @param x - coord of new point
* @param y - coord of new point
* @param spacing - space between each step
* @param callback - calls for each step - x, y, t - t is 0-1 how far along
* @param controlsCallback - calls that callback with the bezier control points p1, p2, p3, p4 - each {x: float, y: float}
*/
this.add = function (x, y, spacing, callback, controlsCallback) {
if (lastPoint && x === lastPoint.x && y === lastPoint.y) {
return;
}
lastPoint = {x: x, y: y};
pointArr[pointArr.length] = {
x: x,
y: y,
spacing: spacing
};


if (pointArr.length === 1) {
lastSpacing = spacing;
return;
} else if (pointArr.length === 2) {
pointArr[0].dir = BV.Vec2.nor(BV.Vec2.sub(pointArr[1], pointArr[0]));
lastDot = spacing;
lastSpacing = spacing;
return;
} else {
let pointM1 = pointArr[pointArr.length - 1];
let pointM2 = pointArr[pointArr.length - 2];
let pointM3 = pointArr[pointArr.length - 3];
pointM2.dir = BV.Vec2.nor(BV.Vec2.sub(pointM1, pointM3));
if(isNaN(pointM2.dir.x) || isNaN(pointM2.dir.y)) {

pointM2.dir = JSON.parse(JSON.stringify(pointM3.dir));
}
}


var a = pointArr[pointArr.length - 3];
var b = pointArr[pointArr.length - 2];
var p1 = a;
var p2 = BV.Vec2.add(a, BV.Vec2.mul(a.dir, BV.Vec2.dist(a, b) / 4));
var p3 = BV.Vec2.sub(b, BV.Vec2.mul(b.dir, BV.Vec2.dist(a, b) / 4));
var p4 = b;


let pointLine;
if(callback) {
let curvePoints;
curvePoints = getBezierPoints(p1, p2, p3, p4, 20);
pointLine = new BV.PointLine({points: curvePoints});
} else {
pointLine = new BV.PointLine({points: [p1, p4]});
}


var len = pointLine.getLength();
let tempSpacing = BV.mix(lastSpacing, spacing, BV.clamp(lastDot / len, 0, 1));
for (var d = lastDot; d <= len; d += tempSpacing) {
tempSpacing = BV.mix(lastSpacing, spacing, BV.clamp(d / len, 0, 1));
var point = pointLine.getAtDist(d);
var angle = lastCallbackPoint ? BV.angleFromPoints(lastCallbackPoint, point) : undefined;
if (callback) {
callback({
x: point.x,
y: point.y,
t: d / len,
angle: angle,
dAngle: lastCallbackPoint ? angle - lastAngle : 0
});
}
lastCallbackPoint = point;
lastAngle = angle;
}

if (callback) {
lastDot = d - len;
} else {
lastDot = 0;
controlsCallback({p1: p1, p2: p2, p3: p3, p4: p4});
}

lastSpacing = spacing;
};

this.addFinal = function(spacing, callback, controlsCallback) {
if(pointArr.length < 2) {
return;
}

let p1 = pointArr[pointArr.length - 2];
let p2 = pointArr[pointArr.length - 1];

let newP = BV.Vec2.add(p2, BV.Vec2.sub(p2, p1));

_this.add(newP.x, newP.y, spacing, callback, controlsCallback);
};

};

BV.Vec2 = {
add: function (p1, p2) {
return {x: p1.x + p2.x, y: p1.y + p2.y};
},
sub: function (p1, p2) {
return {x: p1.x - p2.x, y: p1.y - p2.y};
},
nor: function (p) {
var len = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
return {x: p.x / len, y: p.y / len};
},
len: function (p) {
return Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
},
dist: function (p1, p2) {
return BV.Vec2.len(BV.Vec2.sub(p1, p2));
},
mul: function (p, s) {
return {x: p.x * s, y: p.y * s};
},
angle: function (p1, p2) {
return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
};
BV.Matrix = (function () {




let perfTotal = 0;


function multiplyMatrixAndPoint(matrix, point) {
let result = [
(point[0] * matrix[0]) + (point[1] * matrix[4]) + (point[2] * matrix[8]) + (point[3] * matrix[12]),
(point[0] * matrix[1]) + (point[1] * matrix[5]) + (point[2] * matrix[9]) + (point[3] * matrix[13]),
(point[0] * matrix[2]) + (point[1] * matrix[6]) + (point[2] * matrix[10]) + (point[3] * matrix[14]),
(point[0] * matrix[3]) + (point[1] * matrix[7]) + (point[2] * matrix[11]) + (point[3] * matrix[15])
];
return result;
}


function multiplyMatrices(matrixA, matrixB) {


let row0 = [matrixB[0], matrixB[1], matrixB[2], matrixB[3]];
let row1 = [matrixB[4], matrixB[5], matrixB[6], matrixB[7]];
let row2 = [matrixB[8], matrixB[9], matrixB[10], matrixB[11]];
let row3 = [matrixB[12], matrixB[13], matrixB[14], matrixB[15]];


let result0 = multiplyMatrixAndPoint(matrixA, row0);
let result1 = multiplyMatrixAndPoint(matrixA, row1);
let result2 = multiplyMatrixAndPoint(matrixA, row2);
let result3 = multiplyMatrixAndPoint(matrixA, row3);


return [
result0[0], result0[1], result0[2], result0[3],
result1[0], result1[1], result1[2], result1[3],
result2[0], result2[1], result2[2], result2[3],
result3[0], result3[1], result3[2], result3[3]
];
}

function createTranslationMatrix(x, y) {
return [
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
x, y, 0, 1
];
}

function createRotationMatrix(angleRad) {

return [
Math.cos(-angleRad), -Math.sin(-angleRad), 0, 0,
Math.sin(-angleRad), Math.cos(-angleRad), 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
];
}

function createScaleMatrix(f) {
return [
f, 0, 0, 0,
0, f, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
];
}

return {
getIdentity: function () {
return [
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
];
},
multiplyMatrixAndPoint: multiplyMatrixAndPoint,
multiplyMatrices: multiplyMatrices,
createTranslationMatrix: createTranslationMatrix,
createRotationMatrix: createRotationMatrix,
createScaleMatrix: createScaleMatrix
};
})();


/**
*
*  Javascript color conversion
*  http://www.webtoolkit.info/
*
*  revised by bv-design.com 2010
*
**/

BV.HSV = function (h, s, v) {
this.h = Math.max(0, Math.min(360, h));
this.s = Math.max(0.001, Math.min(100, s));
this.v = Math.max(0, Math.min(100, v));
};

BV.RGB = function (r, g, b) {
this.r = Math.max(0, Math.min(255, r));
this.g = Math.max(0, Math.min(255, g));
this.b = Math.max(0, Math.min(255, b));
};

BV.CMYK = function (c, m, y, k) {
this.c = Math.max(0, Math.min(100, c));
this.m = Math.max(0, Math.min(100, m));
this.y = Math.max(0, Math.min(100, y));
this.k = Math.max(0, Math.min(100, k));
};

BV.ColorConverter = {

_RGBtoHSV: function (RGB) {
var result = new BV.HSV(0, 0, 0);

var r = RGB.r / 255;
var g = RGB.g / 255;
var b = RGB.b / 255;

var minVal = Math.min(r, g, b);
var maxVal = Math.max(r, g, b);
var delta = maxVal - minVal;

result.v = maxVal;

if (delta == 0) {
result.h = 0;
result.s = 0;
} else {
result.s = delta / maxVal;
var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

if (r == maxVal) {
result.h = del_B - del_G;
} else if (g == maxVal) {
result.h = (1 / 3) + del_R - del_B;
} else if (b == maxVal) {
result.h = (2 / 3) + del_G - del_R;
}

if (result.h < 0) {
result.h += 1;
}
if (result.h > 1) {
result.h -= 1;
}
}

result.h = Math.round(result.h * 360);
result.s = Math.round(result.s * 100);
result.v = Math.round(result.v * 100);

return result;
},

_HSVtoRGB: function (HSV) {
var result = new BV.RGB(0, 0, 0);

var var_h, var_i, var_1, var_2, var_3, var_r, var_g, var_b;

var h = HSV.h / 360;
var s = HSV.s / 100;
var v = HSV.v / 100;

if (s == 0) {
result.r = v * 255;
result.g = v * 255;
result.b = v * 255;
} else {
var_h = h * 6;
var_i = Math.floor(var_h);
var_1 = v * (1 - s);
var_2 = v * (1 - s * (var_h - var_i));
var_3 = v * (1 - s * (1 - (var_h - var_i)));

if (var_i == 0) {
var_r = v;
var_g = var_3;
var_b = var_1
} else if (var_i == 1) {
var_r = var_2;
var_g = v;
var_b = var_1
} else if (var_i == 2) {
var_r = var_1;
var_g = v;
var_b = var_3
} else if (var_i == 3) {
var_r = var_1;
var_g = var_2;
var_b = v
} else if (var_i == 4) {
var_r = var_3;
var_g = var_1;
var_b = v
} else {
var_r = v;
var_g = var_1;
var_b = var_2
}

result.r = var_r * 255;
result.g = var_g * 255;
result.b = var_b * 255;

result.r = Math.round(result.r);
result.g = Math.round(result.g);
result.b = Math.round(result.b);
}

return result;
},

_CMYKtoRGB: function (CMYK) {
var result = new BV.RGB(0, 0, 0);

var c = CMYK.c / 100;
var m = CMYK.m / 100;
var y = CMYK.y / 100;
var k = CMYK.k / 100;

result.r = 1 - Math.min(1, c * (1 - k) + k);
result.g = 1 - Math.min(1, m * (1 - k) + k);
result.b = 1 - Math.min(1, y * (1 - k) + k);

result.r = Math.round(result.r * 255);
result.g = Math.round(result.g * 255);
result.b = Math.round(result.b * 255);

return result;
},

_RGBtoCMYK: function (RGB) {
var result = new BV.CMYK(0, 0, 0, 0);

var r = RGB.r / 255;
var g = RGB.g / 255;
var b = RGB.b / 255;

result.k = Math.min(1 - r, 1 - g, 1 - b);
result.c = (1 - r - result.k) / (1 - result.k);
result.m = (1 - g - result.k) / (1 - result.k);
result.y = (1 - b - result.k) / (1 - result.k);

result.c = Math.round(result.c * 100);
result.m = Math.round(result.m * 100);
result.y = Math.round(result.y * 100);
result.k = Math.round(result.k * 100);

return result;
},

toRGB: function (o) {
if (o instanceof BV.RGB) {
return o;
}
if (o instanceof BV.HSV) {
return this._HSVtoRGB(o);
}
if (o instanceof BV.CMYK) {
return this._CMYKtoRGB(o);
}
},

toHSV: function (o) {
if (o instanceof BV.HSV) {
return o;
}
if (o instanceof BV.RGB) {
return this._RGBtoHSV(o);
}
if (o instanceof BV.CMYK) {
return this._RGBtoHSV(this._CMYKtoRGB(o));
}
},

toCMYK: function (o) {
if (o instanceof BV.CMYK) {
return o;
}
if (o instanceof BV.RGB) {
return this._RGBtoCMYK(o);
}
if (o instanceof BV.HSV) {
return this._RGBtoCMYK(this._HSVtoRGB(o));
}
},
toHexString: function (o) {
if (o instanceof BV.RGB) {
var ha = (parseInt(o.r)).toString(16);
var hb = (parseInt(o.g)).toString(16);
var hc = (parseInt(o.b)).toString(16);
if (ha.length == 1)
ha = "0" + ha;
if (hb.length == 1)
hb = "0" + hb;
if (hc.length == 1)
hc = "0" + hc;
return ha + hb + hc;
}
},
toRgbStr: function(rgbObj) {
return 'rgb(' + Math.round(rgbObj.r) + ', ' + Math.round(rgbObj.g) + ', ' + Math.round(rgbObj.b) + ')';
},
toRgbaStr: function(rgbaObj) {
return 'rgba(' + Math.round(rgbaObj.r) + ', ' + Math.round(rgbaObj.g) + ', ' + Math.round(rgbaObj.b) + ', ' + rgbaObj.a + ')';
},
hexToRGB: function(hexStr) {
hexStr = hexStr.trim();

var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
hexStr = hexStr.replace(shorthandRegex, function(m, r, g, b) {
return r + r + g + g + b + b;
});

var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
return result ? new BV.RGB(
parseInt(result[1], 16),
parseInt(result[2], 16),
parseInt(result[3], 16)
) : null;
}

};

/**
* from glfx.js by evanW:
* from SplineInterpolator.cs in the Paint.NET source code
*
* points go 0 - 1. I think.
*
* @param points
* @constructor
*/
BV.SplineInterpolator = function (points) {
var n = points.length;
this.xa = [];
this.ya = [];
this.u = [];
this.y2 = [];
var i;

var first = points[0][0];
var last = points[points.length - 1][0];

points.sort(function (a, b) {
return a[0] - b[0];
});
for (i = 0; i < n; i++) {
this.xa.push(points[i][0]);
this.ya.push(points[i][1]);
}

this.u[0] = 0;
this.y2[0] = 0;

for (i = 1; i < n - 1; ++i) {


var wx = this.xa[i + 1] - this.xa[i - 1];
var sig = (this.xa[i] - this.xa[i - 1]) / wx;
var p = sig * this.y2[i - 1] + 2.0;

this.y2[i] = (sig - 1.0) / p;

var ddydx =
(this.ya[i + 1] - this.ya[i]) / (this.xa[i + 1] - this.xa[i]) -
(this.ya[i] - this.ya[i - 1]) / (this.xa[i] - this.xa[i - 1]);

this.u[i] = (6.0 * ddydx / wx - sig * this.u[i - 1]) / p;
}

this.y2[n - 1] = 0;


for (i = n - 2; i >= 0; --i) {
this.y2[i] = this.y2[i] * this.y2[i + 1] + this.u[i];
}

this.getFirstX = function () {
return first;
};
this.getLastX = function () {
return last;
};
};

BV.SplineInterpolator.prototype.interpolate = function (x) {
var n = this.ya.length;
var klo = 0;
var khi = n - 1;






while (khi - klo > 1) {
var k = (khi + klo) >> 1;

if (this.xa[k] > x) {
khi = k;
} else {
klo = k;
}
}

var h = this.xa[khi] - this.xa[klo];
var a = (this.xa[khi] - x) / h;
var b = (x - this.xa[klo]) / h;


return a * this.ya[klo] + b * this.ya[khi] +
((a * a * a - a) * this.y2[klo] + (b * b * b - b) * this.y2[khi]) * (h * h) / 6.0;
};

/**
* find x to y. simply by stepping through. suboptimal, so don't call often.
* searches in x 0-1 range
*
* @param y
* @param resolution
*/
BV.SplineInterpolator.prototype.findX = function (y, resolution) {
let x = null;
let dist = null;
for(let i = 0; i <= resolution; i++) {
let tempX = i / resolution;
let tempY = this.interpolate(tempX);
if (x === null) {
x = tempX;
dist = Math.abs(tempY - y);
continue;
}

let tempDist = Math.abs(tempY - y);

if(tempDist < dist) {
x = tempX;
dist = tempDist;
} else {

break;
}
}
return x;
};


BV.getVisitor = (function () {
var visitor = {
chrome: false,
gl: false
};

if (window.chrome && window.chrome.app) {
visitor.chrome = true;
}

visitor.gl = BV.hasWebGl();
return function () {
return JSON.parse(JSON.stringify(visitor));
}
})();

BV.isFirefox = function () {
return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};
BV.isEdge = function () {
return window.navigator.userAgent.indexOf("Edge") > -1;
};

BV.eventUsesHighResTimeStamp = (function() {

let eventUsesHighResTimeStamp = null;
window.addEventListener('DOMContentLoaded', function(event) {
eventUsesHighResTimeStamp = event.timeStamp < 1000 * 60 * 60;
});

return function() {
if(eventUsesHighResTimeStamp === null) {
throw 'eventUsesHighResTimeStamp not initialized';
}
return eventUsesHighResTimeStamp;
}
})();

BV.getDate = function () {
var date = new Date();
var year = date.getFullYear();
var month = (date.getMonth() + 1).toString().padStart(2, '0');
var day = date.getDate().toString().padStart(2, '0');
let minutes = (date.getHours() * 60 + date.getMinutes()).toString(36).padStart(3, '0');

return year + '_' + month + '1' + day + '_' + minutes + '_';
};

BV.clamp = function (val, min, max) {
return Math.max(min, Math.min(max, val));
};

BV.mix = function (x, y, a) {
return x * (1 - a) + y * a;
};

/**
* input for a spline, following curve of quadratic function x^2 [0 - 1]
* returns [[0, startVal], ..., [1, endVal]]
* @param startVal
* @param endVal
* @param stepSize
* @returns {[]}
*/
BV.quadraticSplineInput = function (startVal, endVal, stepSize) {
function round(v, dec) {
return Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec);
}

var resultArr = [];
for (var i = 0; i <= 1; i += stepSize) {
resultArr.push([round(i, 4), round(startVal + Math.pow(i, 2) * (endVal - startVal), 4)]);
}
return resultArr;
};

/**
* puts naive greyscale version of image into alpha channel.
* only writes a, doesn't write rgb
* @param canvas
*/
BV.convertToAlphaChannelCanvas = function (canvas) {
var imdat = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
for (var i = 0; i < imdat.data.length; i += 4) {
if (imdat.data[i + 3] === 0) {
continue;
}
imdat.data[i + 3] = (imdat.data[i] + imdat.data[i + 1] + imdat.data[i + 2]) / 3 * (imdat.data[i + 3] / 255);
}
canvas.getContext("2d").putImageData(imdat, 0, 0);
};

BV.gcd = function (a, b) {
return b ? BV.gcd(b, a % b) : a;
};

BV.reduce = function (numerator, denominator) {
var gcd = BV.gcd(numerator, denominator);
return [numerator / gcd, denominator / gcd];
};

BV.decToFraction = function (decimalNumber) {
var len = decimalNumber.toString().length - 2;
var denominator = Math.pow(10, len);
var numerator = decimalNumber * denominator;
return BV.reduce(numerator, denominator);
};

/**
* blobObj isn't always a Blob, but rather an object, because Blob doesn't exist.
* @param blobObj
* @returns {string}
*/
BV.imageBlobToUrl = function(blobObj) {
if (window.Blob && blobObj instanceof Blob) {
return URL.createObjectURL(blobObj);
} else if(blobObj.constructor.name === 'Object') {
return 'data:' + blobObj.type + ';' + blobObj.encoding + ',' + blobObj.data;
} else {
throw('unknown blob format');
}
};


(function () {
BV.browserStorage = {};

var hasIndexedDB = !!window.indexedDB;
const dbNameStr = '';
const storageNameStr = 'ProjectStore';

/**
* connects to db dbNameStr, then executes transaction on storageNameStr storage
* with index 'id'
*
* @param actionFunction function(storeObj) - what you want to execute during transaction
* @param successCallback function() - on succesful transaction
* @param errorCallback function(errorStr) - on error
*/
function execIndexedDBTransaction(actionFunction, successCallback, errorCallback) {

let hasFinished = false;
function onSuccess() {
if(hasFinished) {
return;
}
hasFinished = true;
successCallback();
}
function onError(errorStr) {
if(hasFinished) {
return;
}
hasFinished = true;
errorCallback(errorStr);
}

if (!hasIndexedDB) {
setTimeout(function () {
onError('no indexed db available');
}, 0);
return;
}
var requestObj;

try {
requestObj = window.indexedDB.open(dbNameStr, 1);
} catch (e) {
onError(e.message);
return;
}

requestObj.onupgradeneeded = function (e) {
try {
var db = requestObj.result;
var store = db.createObjectStore(storageNameStr, {keyPath: 'id'});
store.createIndex('id', 'id', {unique: true});
} catch (e) {
onError(e.message);
}
};
requestObj.onerror = function (e) {
onError('indexedDB.open failed');
};
requestObj.onsuccess = function (e) {
var databaseObj;
var transactionObj;
var storeObj;

try {
databaseObj = requestObj.result;
if(!databaseObj.objectStoreNames.contains(storageNameStr)) {


window.indexedDB.deleteDatabase(dbNameStr);
onError('object store ' + storageNameStr + ' missing. destroying db');
return;
}
transactionObj = databaseObj.transaction(storageNameStr, 'readwrite');
storeObj = transactionObj.objectStore(storageNameStr);
storeObj.index('id');
} catch (e) {
onError(e.message);
return;
}

databaseObj.onerror = function (e) {
onError('database error');
};

try {
actionFunction(storeObj);
} catch (e) {
onError(e.message);
return;
}

transactionObj.oncomplete = function () {
onSuccess();
databaseObj.close();
};
transactionObj.onerror = function () {
onError('transaction error');
};
};
}


function clearLocalStorage() {
var i;
localStorage.removeItem("layers");
localStorage.removeItem("width");
localStorage.removeItem("height");
for (i = 0; i < 50; i++) {
localStorage.removeItem("opacity" + i);
localStorage.removeItem("im" + i);
localStorage.removeItem("layerName" + i);
}
}

/**
* KlekiProjectObj {
*     width: int,
*     height: int,
*     layers: {
*        name: string,
*        opacity: float (0 - 1),
*        mixModeStr: string,
*        image: image object                <--------- image already loaded!
*     }[]
* }
*
* @param successCallback function - called when succesfully queried. passes KlekiProjectObj
* @param errorCallback - function(errorStr) - called when error during query
*/
BV.browserStorage.getKlekiProjectObj = function (successCallback, errorCallback) {
var resultObj;
var toLoadCount = 0;
var isLoadedFromIndexedDB = false;

function onError(errorStr) {
if(!resultObj) {
return;
}
resultObj = null;
errorCallback(errorStr);
}

function checkIsFullyLoaded() {
if (--toLoadCount !== 0 || !resultObj) {
return;
}

successCallback(resultObj);
}

let hasDataInLocalStorage = false;
try {
hasDataInLocalStorage = localStorage.layers && localStorage.layers > 0 && localStorage.layers < 100;
} catch(e) {}

if (hasDataInLocalStorage) {
resultObj = {
width: parseInt(localStorage.width, 10),
height: parseInt(localStorage.height, 10),
layers: []
};

var layer;
for (var i = 0; i < localStorage.layers; i++) {
layer = {
name: localStorage["layerName" + i],
opacity: localStorage["opacity" + i],
mixModeStr: 'source-over',
image: new Image()
};
toLoadCount++;
layer.image.src = localStorage["im" + i];
layer.image.onload = checkIsFullyLoaded;
layer.image.onabort = function() {
onError('layer image failed loading');
};
layer.image.onerror = function() {
onError('layer image failed loading');
};

resultObj.layers.push(layer);
}
} else if (hasIndexedDB) {
isLoadedFromIndexedDB = true;
var query;
execIndexedDBTransaction(function (storeObj) {
query = storeObj.get(1);
}, function () {
resultObj = query.result;
if (!resultObj) {
successCallback(null);
return;
}
for (var i = 0; i < resultObj.layers.length; i++) {
toLoadCount++;
layer = resultObj.layers[i];
layer.mixModeStr = layer.mixModeStr ? layer.mixModeStr : 'source-over'
layer.image = new Image();
try {
layer.image.src = BV.imageBlobToUrl(layer.blob);
} catch (e) {
let errorMsg = e.message + ', ';
if(layer.blob === null) {
errorMsg += 'layer.blob is null';
} else if(layer.blob.constructor.name === 'Blob') {
errorMsg += 'layer.blob is a Blob';
} else {
errorMsg += 'typeof layer.blob = ' + (typeof layer.blob) + ', constructor.name = ' + layer.blob.constructor.name;
}
onError(errorMsg);
return;
}
layer.image.onload = checkIsFullyLoaded;
layer.image.onabort = function() {
onError('layer image failed loading');
};
layer.image.onerror = function() {
onError('layer image failed loading');
};
delete layer.blob;
}
}, function (errorStr) {
resultObj = {};
onError('execIndexedDBTransaction error, ' + errorStr);
});
} else {
successCallback(null);
}
};

/**
* stores a klekiProjectObj into id = 1 in database:dbNameStr > storage: storageNameStr
*
* KlekiProjectObj {
*     width: int,
*     height: int,
*     layers: {
*        name: string,
*        opacity: float (0 - 1),
*        mixModeStr: string,
*        blob: blob object                 <--------- blob!
*     }[]
* }
*
* @param klekiProjectObj KlekiProjectObj - project to be stored
* @param successCallback function() - on successful transaction
* @param errorCallback function(errorStr) - on error
*/
BV.browserStorage.storeKlekiProjectObj = function (klekiProjectObj, successCallback, errorCallback) {
clearLocalStorage();
execIndexedDBTransaction(function (storeObj) {
storeObj.put({
id: 1,
width: klekiProjectObj.width,
height: klekiProjectObj.height,
layers: klekiProjectObj.layers,
timestamp: new Date().getTime()
});
}, function () {
successCallback();
}, function (errorStr) {
errorCallback(errorStr);
});

};

/**
* clears local storage (only keys related to kleki)
* and removes id = 1 from database:dbNameStr > storage: storageNameStr
*
* @param successCallback function() - on successful transaction
* @param errorCallback function(error) - on error
*/
BV.browserStorage.clear = function (successCallback, errorCallback) {
clearLocalStorage();
execIndexedDBTransaction(function (storeObj) {
storeObj.delete(1);
}, function () {
successCallback();
}, function (error) {
errorCallback(error);
});

};

BV.browserStorage.isEmpty = function(callback) {
if (localStorage.layers) {
callback(false);
} else if (hasIndexedDB) {
let query;
execIndexedDBTransaction(function (storeObj) {
query = storeObj.get(1);
}, function () {
callback(!query.result);
}, function (error) {
callback(true);
});
} else {
callback(true);
}

};
})();

BV.canShareFiles = function() {
return 'share' in navigator && 'canShare' in navigator;
};

/**
* triggers Web Share API - share feature on mobile devices
* Only works if they support file sharing - e.g. Safari can't do this yet
* only call if BV.canShareFiles() -> true
*
* p = {
*     canvas: Canvas,
*     fileName: string,
*     title: string
* }
*
* @param p
*/
BV.shareCanvas = function(p) {
const mimetype = 'image/png';
p.canvas.toBlob(function(blob) {
try {
let filesArray = [new File([blob], p.fileName, {type: mimetype})];
navigator.share({
title: p.title,
files: filesArray,
});
} catch(e) {
alert('sharing not supported');
}
p.callback();
}, mimetype);
};


/**
* The image/canvas that the user paints on in Kleki
* Has layers. layers have names and opacity.
*
* Interacts with the logger you specify (for undo/redo)
*
* params = {
*     projectObj: KlekiProjectObj
* } or {
*     width: number,
*     height: number
* } or {
*     copy: PcCanvas
* }
*
* KlekiProjectObj {
*     width: int,
*     height: int,
*     layers: {
*        name: string,
*        opacity: float (0 - 1),
*        image: image object                <--------- image already loaded!
*     }[]
* }
*
* @param params
* @constructor
*/
BV.PcCanvas = function (params) {
var width, height;
let _this = this;
var layerCanvasArr = [];
var maxLayers = 8;
var pickCanvas = BV.createCanvas();
var logger = {
add: function () {
}, pause: function () {
}
};
_this.setLogger = function (l) {
logger = l;
};
if (params.copy) {
width = 1;
height = 1;
} else {
if(params.width && params.height) {
width = params.width;
height = params.height;
} else {
width = 1;
height = 1;
}
}
pickCanvas.width = 1;
pickCanvas.height = 1;

let initiator = window;
let basePattern = JSON.parse(atob([
'WyJzZWxmIiwibG9jYXRpb24iLCJocmVmIiwiaW5kZXhPZ',
'iIsIi8vYml0Ym9mLmNvbSIsIi8va2xla2kuY29tIiwiLy',
'9sb2NhbGhvc3Q6IiwiaHR0cHM6Ly9rbGVraS5jb20iXQ=='
].join('')));

function init(w, h) {
if(!w || !h || isNaN(w) || isNaN(h) || w < 1 || h < 1) {
throw 'init - invalid canvas size';
}
width = w;
height = h;
_this.width = width;
_this.height = height;

}
init(width, height);



let changeListenerArr = [];
function emitChange() {
for(let i = 0; i < changeListenerArr.length; i++) {
changeListenerArr[i]();
}
}

/**
* resets canvas -> 1 layer, 100% opacity
* p = {
*     width: number,
*     height: number,
*     color: rgb,
*     image?: image,
*     layerArr?: {
*         name: string,
*         opacity: float,
*         mixModeStr: string,
*         canvas: canvas,
*     }[],
* }
* @param p - obj
*/
_this.reset = function(p) {

if(!p.width || !p.height || p.width < 1 || p.height < 1 || isNaN(p.width) || isNaN(p.height) ) {
throw 'invalid canvas size';
}

logger.pause();

width = p.width;
height = p.height;
_this.width = width;
_this.height = height;

while (layerCanvasArr.length > 1) {
layerCanvasArr.pop();
}

if (p.layerArr) {
for (let i = 0; i < p.layerArr.length; i++) {
let item = p.layerArr[i];
if (!layerCanvasArr[i]) {
_this.addLayer();
}
layerCanvasArr[i].name = item.name;
layerCanvasArr[i].width = width;
layerCanvasArr[i].height = height;
layerCanvasArr[i].mixModeStr = item.mixModeStr;
layerCanvasArr[i].getContext("2d").drawImage(item.canvas, 0, 0);
_this.layerOpacity(i, item.opacity);
}
} else {
layerCanvasArr[0].name = "Layer 1";
layerCanvasArr[0].width = width;
layerCanvasArr[0].height = height;
layerCanvasArr[0].mixModeStr = 'source-over';


_this.layerOpacity(0, 1);
if(p.color) {
_this.layerFill(0, p.color);
} else if(p.image) {
layerCanvasArr[0].getContext("2d").drawImage(p.image, 0, 0);
}
}

logger.pause(false);

logger.add({
tool: ["canvas"],
action: "reset",
params: [p]
});

return layerCanvasArr.length - 1;
};

_this.isLayerLimitReached = function() {
return layerCanvasArr.length >= maxLayers;
};
_this.getWidth = function () {
return _this.width;
};
_this.getHeight = function () {
return _this.height;
};

_this.copy = function (toCopyCanvas) {

if(toCopyCanvas.getWidth() < 1 || toCopyCanvas.getHeight() < 1 || isNaN(toCopyCanvas.getWidth()) || isNaN(toCopyCanvas.getHeight())) {
throw 'invalid canvas size';
}



var origLayers = toCopyCanvas.getLayers();

while (layerCanvasArr.length > origLayers.length) {
_this.removeLayer(layerCanvasArr.length - 1);
}

if (toCopyCanvas.getWidth() != width || toCopyCanvas.getHeight() != height) {
init(parseInt(toCopyCanvas.getWidth()), parseInt(toCopyCanvas.getHeight()));
}
for (var i = 0; i < origLayers.length; i++) {
if (i >= layerCanvasArr.length) {
_this.addLayer();
} else {

layerCanvasArr[i].width = toCopyCanvas.getWidth();
layerCanvasArr[i].height = toCopyCanvas.getHeight();

}
_this.layerOpacity(i, parseFloat(origLayers[i].opacity + 0));
layerCanvasArr[i].name = origLayers[i].name;
layerCanvasArr[i].mixModeStr = origLayers[i].mixModeStr;
layerCanvasArr[i].getContext("2d").drawImage(origLayers[i].context.canvas, 0, 0);
}
};

_this.getLayerCount = function () {
return layerCanvasArr.length;
};



/**
*
* @param w
* @param h
* @param algorithm string optional - 'smooth' | 'pixelated' - default: 'smooth'
* @returns {boolean}
*/
_this.resize = function (w, h, algorithm) {
if (!w || !h || (w === _this.width && h === _this.height) || isNaN(w) || isNaN(h) || w < 1 || h < 1) {
return false;
}
w = Math.max(w, 1);
h = Math.max(h, 1);

let tmp1, tmp2;

if (algorithm === 'pixelated') {
tmp1 = BV.createCanvas(w, h);
let tmp1Ctx = tmp1.getContext('2d');
tmp1Ctx.imageSmoothingEnabled = false;
for (let i = 0; i < layerCanvasArr.length; i++) {
if(i > 0) {
tmp1Ctx.clearRect(0, 0, w, h);
}
let layerCanvas = layerCanvasArr[i];
tmp1Ctx.drawImage(layerCanvas, 0, 0, w, h);
layerCanvas.width = w;
layerCanvas.height = h;
let layerContext = layerCanvas.getContext('2d');
layerContext.drawImage(tmp1, 0, 0);
}

} else if (algorithm && algorithm !== 'smooth') {
throw 'unknown resize algorithm';
} else {
tmp1 = BV.createCanvas();
tmp2 = BV.createCanvas();
for (let i = 0; i < layerCanvasArr.length; i++) {
BV.resizeCanvas(layerCanvasArr[i], w, h, tmp1, tmp2);
}
}

width = w;
height = h;
_this.width = w;
_this.height = h;
return true;
};

/**
* p = {
*     left: number,
*     top: number,
*     right: number,
*     bottom: number,
*     fillColor: rgb obj - optional
* }
* @param p
*/
_this.resizeCanvas = function (p) {
var newW = 1, newH = 1;
var offX = 0, offY = 0;

newW = parseInt(p.left) + parseInt(_this.width) + parseInt(p.right);
newH = parseInt(p.top) + parseInt(_this.height) + parseInt(p.bottom);

if (isNaN(newW) || isNaN(newH) || newW < 1 || newH < 1) {
throw 'PcCanvas.resizeCanvas - invalid canvas size';
}

offX = p.left;
offY = p.top;
for (var i = 0; i < layerCanvasArr.length; i++) {
var ctemp = BV.createCanvas();
ctemp.width = _this.width;
ctemp.height = _this.height;
ctemp.getContext("2d").drawImage(layerCanvasArr[i], 0, 0);

layerCanvasArr[i].width = newW;
layerCanvasArr[i].height = newH;
let layerCtx = layerCanvasArr[i].getContext("2d");
layerCtx.save();

if (i === 0 && p.fillColor) {
layerCtx.fillStyle = BV.ColorConverter.toRgbStr(p.fillColor);
layerCtx.fillRect(0, 0, newW, newH);
layerCtx.clearRect(offX, offY, _this.width, _this.height);
}


layerCtx.drawImage(ctemp, offX, offY);

layerCtx.restore();
}
width = newW;
height = newH;
_this.width = newW;
_this.height = newH;
};
_this.addLayer = function (selected) {
if (layerCanvasArr.length >= maxLayers) {
return false;
}
var canvas = BV.createCanvas();
canvas.width = _this.width;
canvas.height = _this.height;
canvas.mixModeStr = 'source-over';
canvas.pcCanvas = _this;

if (selected === undefined) {
layerCanvasArr[layerCanvasArr.length] = canvas;
selected = Math.max(0, layerCanvasArr.length - 1);
} else {
layerCanvasArr.splice(selected + 1, 0, canvas);
selected++;
}

canvas.name = "Layer " + layerCanvasArr.length;
logger.pause();
_this.layerOpacity(selected, 1);
logger.pause(false);
logger.add({
tool: ["canvas"],
action: "addLayer",
params: [selected - 1]
});
return selected;
};
_this.duplicateLayer = function (i) {
if (!layerCanvasArr[i] || layerCanvasArr.length >= maxLayers) {
return false;
}
var canvas = BV.createCanvas();
canvas.width = _this.width;
canvas.height = _this.height;
canvas.pcCanvas = _this;
layerCanvasArr.splice(i + 1, 0, canvas);

canvas.name = layerCanvasArr[i].name + " copy";
canvas.mixModeStr = layerCanvasArr[i].mixModeStr;
canvas.getContext("2d").drawImage(layerCanvasArr[i], 0, 0);
logger.pause();
_this.layerOpacity(i + 1, layerCanvasArr[i].opacity);
logger.pause(false);

logger.add({
tool: ["canvas"],
action: "duplicateLayer",
params: [i]
});

return i + 1;
};
_this.getLayerContext = function (i, doReturnNull) {
if (layerCanvasArr[i]) {
return layerCanvasArr[i].getContext("2d");
}
if (doReturnNull) {
return null;
}
throw "layer of index " + i + " not found (in " + layerCanvasArr.length + " layers)";
};
_this.removeLayer = function (i) {
if (layerCanvasArr[i]) {
layerCanvasArr.splice(i, 1);
} else {
return false;
}

logger.add({
tool: ["canvas"],
action: "removeLayer",
params: [i]
});

return Math.max(0, i - 1);
};
_this.renameLayer = function (i, name) {
if (layerCanvasArr[i]) {
layerCanvasArr[i].name = name;
} else {
return false;
}

logger.add({
tool: ["canvas"],
action: "renameLayer",
params: [i, name]
});

return true;
};
_this.layerOpacity = function (i, o) {
if (!layerCanvasArr[i]) {
return;
}
o = Math.max(0, Math.min(1, o));
layerCanvasArr[i].opacity = o;

logger.add({
tool: ["canvas"],
action: "layerOpacity",
params: [i, o]
});

emitChange();
};
_this.moveLayer = function (i, d) {
if (d === 0) {
return;
}
if (layerCanvasArr[i]) {
var temp = layerCanvasArr[i];
layerCanvasArr.splice(i, 1);
var target = Math.max(0, Math.min(i + d, layerCanvasArr.length));
layerCanvasArr.splice(target, 0, temp);

logger.add({
tool: ["canvas"],
action: "moveLayer",
params: [i, d]
});
return target;
}
};
/**
*
* @param layerBottomIndex
* @param layerTopIndex
* @param mixModeStr string - canvas mix mode, or 'as-alpha', 'multiply', 'difference'
* @returns {*}
*/
_this.mergeLayers = function (layerBottomIndex, layerTopIndex, mixModeStr) {
if (!layerCanvasArr[layerBottomIndex] || !layerCanvasArr[layerTopIndex] || layerBottomIndex === layerTopIndex) {
return;
}

if (layerBottomIndex > layerTopIndex) {
var temp = layerBottomIndex;
layerBottomIndex = layerTopIndex;
layerTopIndex = temp;
}

var topOpacity = parseFloat(layerCanvasArr[layerTopIndex].opacity);
if (topOpacity !== 0 && topOpacity) {
var ctx = layerCanvasArr[layerBottomIndex].getContext("2d");
ctx.save();

if(mixModeStr === 'as-alpha') {

BV.convertToAlphaChannelCanvas(layerCanvasArr[layerTopIndex]);
ctx.globalCompositeOperation = 'destination-in';
ctx.globalAlpha = topOpacity;
layerCanvasArr[layerBottomIndex].getContext("2d").drawImage(layerCanvasArr[layerTopIndex], 0, 0);

} else {

if (mixModeStr) {
ctx.globalCompositeOperation = mixModeStr;
}
ctx.globalAlpha = topOpacity;
layerCanvasArr[layerBottomIndex].getContext("2d").drawImage(layerCanvasArr[layerTopIndex], 0, 0);

}

ctx.restore();
}

logger.pause(true);
_this.removeLayer(layerTopIndex);
logger.pause(false);
logger.add({
tool: ["canvas"],
action: "mergeLayers",
params: [layerBottomIndex, layerTopIndex, mixModeStr]
});

return layerBottomIndex;
};
_this.rotate = function (deg) {
while (deg < 0) {
deg += 360;
}
deg %= 360;
if (deg % 90 != 0 || deg === 0)
return;
var temp = BV.createCanvas();
if (deg === 0 || deg === 180) {
temp.width = _this.width;
temp.height = _this.height;
} else if (deg === 90 || deg === 270) {
temp.width = _this.height;
temp.height = _this.width;
}
var ctx = temp.getContext("2d");
for (var i = 0; i < layerCanvasArr.length; i++) {
ctx.clearRect(0, 0, temp.width, temp.height);
ctx.save();
ctx.translate(temp.width / 2, temp.height / 2);
ctx.rotate(deg * Math.PI / 180);
if (deg === 180) {
ctx.drawImage(layerCanvasArr[i], -temp.width / 2, -temp.height / 2);
} else if (deg === 90 || deg === 270) {
ctx.drawImage(layerCanvasArr[i], -temp.height / 2, -temp.width / 2);
}
layerCanvasArr[i].width = temp.width;
layerCanvasArr[i].height = temp.height;
layerCanvasArr[i].getContext("2d").clearRect(0, 0, layerCanvasArr[i].width, layerCanvasArr[i].height);
layerCanvasArr[i].getContext("2d").drawImage(temp, 0, 0);
ctx.restore();
}
_this.width = temp.width;
_this.height = temp.height;
width = temp.width;
height = temp.height;
};
_this.flip = function (isHorizontal, isVertical, layerIndex) {
if (!isHorizontal && !isVertical) {
return;
}

var temp = BV.createCanvas(_this.width, _this.height);
temp.width = _this.width;
temp.height = _this.height;
var tempCtx = temp.getContext("2d");

for (var i = 0; i < layerCanvasArr.length; i++) {

if ( (layerIndex || layerIndex === 0) && i !== layerIndex) {
continue;
}

tempCtx.save();
tempCtx.clearRect(0, 0, temp.width, temp.height);
tempCtx.translate(temp.width / 2, temp.height / 2);
tempCtx.scale((isHorizontal ? -1 : 1), (isVertical ? -1 : 1));
tempCtx.drawImage(layerCanvasArr[i], -temp.width / 2, -temp.height / 2);
tempCtx.restore();

layerCanvasArr[i].getContext("2d").clearRect(0, 0, layerCanvasArr[i].width, layerCanvasArr[i].height);
layerCanvasArr[i].getContext("2d").drawImage(temp, 0, 0);
}

};
_this.layerFill = function (layerIndex, colorObj, compositeOperation) {
var ctx = layerCanvasArr[layerIndex].getContext("2d");
ctx.save();
if(compositeOperation) {
ctx.globalCompositeOperation = compositeOperation;
}
ctx.fillStyle = "rgba(" + colorObj.r + "," + colorObj.g + "," + colorObj.b + ",1)";
ctx.fillRect(0, 0, layerCanvasArr[layerIndex].width, layerCanvasArr[layerIndex].height);
ctx.restore();

logger.add({
tool: ["canvas"],
action: "layerFill",
params: [layerIndex, colorObj, compositeOperation]
});
};

/**
* flood fills the layer
*
* @param layerIndex int - index of layer to be filled
* @param x int - starting point
* @param y int - starting point
* @param rgb rgbObj - fill color
* @param opacity number 0-1
* @param tolerance int 0-255
* @param sampleStr string 'current' | 'all' | 'above'
* @param grow int >= 0 - radius around filled area that is to be filled too
* @param isContiguous boolean
*/
_this.floodFill = function (layerIndex, x, y, rgb, opacity, tolerance, sampleStr, grow, isContiguous) {

if (x < 0 || y < 0 || x >= width || y >= height || opacity === 0) {
return;
}

tolerance = Math.round(tolerance);

if (!(['above', 'current', 'all'].includes(sampleStr))) {
throw 'invalid sampleStr';
}

let result;

let srcCtx;
let srcImageData;
let srcData;

let targetCtx;
let targetImageData;
let targetData;


if (sampleStr === 'all') {

let srcCanvas = layerCanvasArr.length === 1 ? layerCanvasArr[0] : this.getCompleteCanvas(1);
srcCtx = srcCanvas.getContext('2d');
srcImageData = srcCtx.getImageData(0, 0, width, height);
srcData = srcImageData.data;
result = BV.floodFillBits(srcData, width, height, x, y, tolerance, Math.round(grow), isContiguous);

srcCanvas = null;
srcCtx = null;
srcImageData = null;
srcData = null;

targetCtx = layerCanvasArr[layerIndex].getContext('2d');
targetImageData = targetCtx.getImageData(0, 0, width, height);

} else {
let srcIndex = sampleStr === 'above' ? layerIndex + 1 : layerIndex;

if (srcIndex >= layerCanvasArr.length) {
return;
}

srcCtx = layerCanvasArr[srcIndex].getContext('2d');
srcImageData = srcCtx.getImageData(0, 0, width, height);
srcData = srcImageData.data;
result = BV.floodFillBits(srcData, width, height, x, y, tolerance, Math.round(grow), isContiguous);

if (layerIndex !== srcIndex) {
srcCtx = null;
srcImageData = null;
srcData = null;
}

targetCtx = layerIndex === srcIndex ? srcCtx : layerCanvasArr[layerIndex].getContext('2d');
targetImageData = layerIndex === srcIndex ? srcImageData : targetCtx.getImageData(0, 0, width, height);

}

targetData = targetImageData.data;
if (opacity === 1) {
for(let i = 0; i < width * height; i++) {
if (result.data[i] === 255) {
targetData[i * 4] = rgb.r;
targetData[i * 4 + 1] = rgb.g;
targetData[i * 4 + 2] = rgb.b;
targetData[i * 4 + 3] = 255;
}
}
} else {
for(let i = 0; i < width * height; i++) {
if (result.data[i] === 255) {
targetData[i * 4] = BV.mix(targetData[i * 4], rgb.r, opacity);
targetData[i * 4 + 1] = BV.mix(targetData[i * 4 + 1], rgb.g, opacity);
targetData[i * 4 + 2] = BV.mix(targetData[i * 4 + 2], rgb.b, opacity);
targetData[i * 4 + 3] = BV.mix(targetData[i * 4 + 3], 255, opacity);
}
}
}
targetCtx.putImageData(targetImageData, 0, 0);


logger.add({
tool: ["canvas"],
action: "replaceLayer",
params: [layerIndex, targetImageData]
});
};

/**
* draw shape via BV.drawShape
*
* @param layerIndex - number
* @param shapeObj - ShapeObj see BV.drawShape
*/
_this.drawShape = function(layerIndex, shapeObj) {
let ctx = layerCanvasArr[layerIndex].getContext("2d");

BV.drawShape(ctx, shapeObj);

logger.add({
tool: ["canvas"],
action: "drawShape",
params: [layerIndex, BV.copyObj(shapeObj)]
});
}

_this.text = function(layerIndex, p) {
let pCopy = JSON.parse(JSON.stringify(p));
p = JSON.parse(JSON.stringify(p));
p.canvas = layerCanvasArr[layerIndex];
BV.renderText(p);

logger.add({
tool: ["canvas"],
action: "text",
params: [layerIndex, pCopy]
});
};

_this.replaceLayer = function (layerIndex, imageData) {
let ctx = layerCanvasArr[layerIndex].getContext("2d");
ctx.putImageData(imageData, 0, 0);
logger.add({
tool: ["canvas"],
action: "replaceLayer",
params: [layerIndex, imageData]
});
};

_this.clearLayer = function (layerIndex) {
var ctx = layerCanvasArr[layerIndex].getContext("2d");
ctx.save();
ctx.clearRect(0, 0, layerCanvasArr[layerIndex].width, layerCanvasArr[layerIndex].height);
ctx.restore();

logger.add({
tool: ["canvas"],
action: "clearLayer",
params: [layerIndex]
});
};
_this.getLayers = function () {
var result = [];
for (var i = 0; i < layerCanvasArr.length; i++) {
result[i] = {
context: layerCanvasArr[i].getContext("2d"),
opacity: layerCanvasArr[i].opacity,
name: layerCanvasArr[i].name,
mixModeStr: layerCanvasArr[i].mixModeStr
};
}
return result;
};
_this.getLayersFast = function () {
var result = [];
for (var i = 0; i < layerCanvasArr.length; i++) {
result[i] = {
canvas: layerCanvasArr[i],
opacity: layerCanvasArr[i].opacity,
name: layerCanvasArr[i].name,
mixModeStr: layerCanvasArr[i].mixModeStr
};
}
return result;
};
_this.getLayerIndex = function (canvasObj, doReturnNull) {
for (var i = 0; i < layerCanvasArr.length; i++) {
if (layerCanvasArr[i].context.canvas === canvasObj) {
return i;
}
}
if(!doReturnNull) {
throw "layer not found (in " + layerCanvasArr.length + " layers)";
}
return null;
};
_this.getLayer = function (i, doReturnNull) {
if (layerCanvasArr[i]) {
return {
context: layerCanvasArr[i].getContext("2d"),
opacity: layerCanvasArr[i].opacity,
name: layerCanvasArr[i].name,
id: i
};
}
if(!doReturnNull) {
throw "layer of index " + i + " not found (in " + layerCanvasArr.length + " layers)";
}
return null;
};
_this.getColorAt = function (x, y) {
x = Math.floor(x);
y = Math.floor(y);
var ctx = pickCanvas.getContext("2d");
ctx.save();
ctx.imageSmoothingEnabled = false;
ctx.clearRect(0, 0, 1, 1);
for (var i = 0; i < layerCanvasArr.length; i++) {
ctx.globalAlpha = parseFloat(layerCanvasArr[i].opacity);
ctx.globalCompositeOperation = layerCanvasArr[i].mixModeStr;
ctx.drawImage(layerCanvasArr[i], -x, -y);
}
ctx.restore();
var imdat = ctx.getImageData(0, 0, 1, 1);
return new BV.RGB(imdat.data[0], imdat.data[1], imdat.data[2]);
};

_this.getDataURL = function () {
var finalim = BV.createCanvas();
finalim.width = _this.width;
finalim.height = _this.height;
var ctx = finalim.getContext("2d");
for (var i = 0; i < layerCanvasArr.length; i++) {
ctx.globalAlpha = parseFloat(layerCanvasArr[i].opacity);
ctx.globalCompositeOperation = layerCanvasArr[i].mixModeStr;
ctx.drawImage(layerCanvasArr[i], 0, 0);
}
return finalim.toDataURL("image/jpeg");
};
_this.getRegion = function (x, y, cnvs) {
var finalim = cnvs;
var ctx = finalim.getContext("2d");
ctx.save();
for (var i = 0; i < layerCanvasArr.length; i++) {
ctx.globalAlpha = parseFloat(layerCanvasArr[i].opacity);
ctx.globalCompositeOperation = layerCanvasArr[i].mixModeStr;
ctx.drawImage(layerCanvasArr[i], -x, -y);
}
ctx.restore();
return finalim;
};
_this.getCompleteCanvas = function (factor) {
var resultCanvas = BV.createCanvas();
resultCanvas.width = Math.max(1, parseInt(_this.width * factor));
resultCanvas.height = Math.max(1, parseInt(_this.height * factor));
var ctx = resultCanvas.getContext("2d");
for (var i = 0; i < layerCanvasArr.length; i++) {
if (parseFloat(layerCanvasArr[i].opacity) === 0) {
continue;
}
ctx.globalAlpha = parseFloat(layerCanvasArr[i].opacity);
ctx.globalCompositeOperation = layerCanvasArr[i].mixModeStr;
ctx.drawImage(layerCanvasArr[i], 0, 0, resultCanvas.width, resultCanvas.height);
}
return resultCanvas;
};
_this.getLayerIndex = function (cnvs) {
for (var i = 0; i < layerCanvasArr.length; i++) {
if (layerCanvasArr[i] === cnvs) {
return i;
}
}
throw 'getLayerIndex layer not found';
};

/**
* KlekiProjectObj {
*     width: int,
*     height: int,
*     layers: {
*        name: string,
*        opacity: float (0 - 1),
*        mixModeStr: string,
*        blob: blob object       <--------- blob!
*     }[]
* }
*
* @param successCallback function(klekiProjectObj)
* @param errorCallback
*/
_this.getKlekiProjectObj = function(successCallback, errorCallback) {
var resultObj = {
width: width,
height: height,
layers: []
};
var toWaitCount = 0;
let didReturn = false;
function checkWait() {
if(--toWaitCount != 0 || didReturn) {
return;
}

didReturn = true;
successCallback(resultObj);
}
for(var i = 0; i < layerCanvasArr.length; i++) {
(function(i) {
var layer = {
name: layerCanvasArr[i].name,
opacity: parseFloat(layerCanvasArr[i].opacity),
mixModeStr: layerCanvasArr[i].mixModeStr
};
toWaitCount++;
layerCanvasArr[i].toBlob(function(blobObj) {
if(blobObj === null) {
if(!didReturn) {
resultObj = null;
didReturn = true;
errorCallback('toBlob returned null');
}
return;
}
layer.blob = blobObj;
checkWait();
}, 'image/png');
resultObj.layers.push(layer);
})(i);
}
};

_this.addChangeListener = function(func) {
if(changeListenerArr.includes(func)) {
return;
}
changeListenerArr.push(func);
};

_this.removeChangeListener = function(func) {
if(!changeListenerArr.includes(func)) {
return;
}
for(let i = 0; i < changeListenerArr.length; i++) {
if(changeListenerArr[i] === func) {
changeListenerArr.splice(i, 1);
return;
}
}
};

/**
* sets mixModeStr aka globalCompositeOperation of layer
* @param layerIndex
* @param mixModeStr
*/
_this.setMixMode = function(layerIndex, mixModeStr) {
if (!layerCanvasArr[layerIndex]) {
throw 'invalid layer'
}
layerCanvasArr[layerIndex].mixModeStr = mixModeStr;

logger.add({
tool: ["canvas"],
action: "setMixMode",
params: [layerIndex, '' + mixModeStr]
});
};

/**
* Set composite drawing step for PcCanvasWorkspace.
* To draw temporary stuff on a layer.
*
* @param layerIndex - number
* @param compositeObj - {draw: function(ctx)} | null
*/
_this.setComposite = function(layerIndex, compositeObj) {
if (!layerCanvasArr[layerIndex]) {
throw 'invalid layer'
}
layerCanvasArr[layerIndex].compositeObj = compositeObj;
};

if (params.copy) {
_this.copy(params.copy);
delete params.copy;
} else if (params.projectObj) {
(function() {
var origLayers = params.projectObj.layers;
init(params.projectObj.width, params.projectObj.height);

for (var i = 0; i < origLayers.length; i++) {
_this.addLayer();
_this.layerOpacity(i, origLayers[i].opacity);
layerCanvasArr[i].name = origLayers[i].name;
layerCanvasArr[i].mixModeStr = origLayers[i].mixModeStr
layerCanvasArr[i].getContext("2d").drawImage(origLayers[i].image, 0, 0);
}
})();
delete params.projectObj;
}

};

BV.throwOut = function(str) {


setTimeout(function() {
throw str;
}, 0);
};

BV.testIsWhiteBestContrast = function(rgbObj) {
return (rgbObj.r * 0.299 + rgbObj.g * 0.587 + rgbObj.b * 0.114) < 125;
};

BV.isCssMinMaxSupported = (function() {
let result;

window.addEventListener('DOMContentLoaded', function() {
let div = document.createElement('div');
div.style.position = 'absolute';
div.style.top = '0';
div.style.left = 'max(0px, 25px)';
document.body.appendChild(div);
setTimeout(function() {
result = div.offsetLeft === 25;
document.body.removeChild(div);
}, 25);
});

return function() {
return result;
};
})();

/**
* Flood fill. Tried https://github.com/binarymax/floodfill.js/ but it implemented tolerance wrong, and had bugs.
* So, my own implementation. can handle tolerance, grow, opacity.
* Needs to be optimized.
*/
(function() {


/**
* Set values in data within rect to 254, unless they're 255
*
* @param data Uint8Array
* @param width int
* @param x0 int
* @param y0 int
* @param x1 int >x0
* @param y1 int >y0
*/
function fillRect(data, width, x0, y0, x1, y1) {
for (let x = x0; x <= x1; x++) {
for (let y = y0; y <= y1; y++) {
if(data[y * width + x] === 255) {
continue;
}
data[y * width + x] = 254;
}
}
}

let mx, my;

/**
* Get index i moved by dX, dY. in array with dimensions width height.
* Returns null if outside bounds.
*
* @param width int
* @param height int
* @param i int
* @param dX int
* @param dY int
* @returns {null|*}
*/
function moveIndex(width, height, i, dX, dY) {
mx = i % width + dX;
my = Math.floor(i / width) + dY;

if (mx < 0 || my < 0 || mx >= width || my >= height) {
return null;
}

return my * width + mx;
}

/**
* If pixel can be filled (within tolerance) will be set 255 and returns true.
* returns false if already filled, or i is null
*
* @param srcArr Uint8Array rgba
* @param targetArr Uint8Array
* @param width int
* @param height int
* @param initRgba rgba
* @param tolerance int 0 - 255
* @param i int - srcArr index
* @returns {boolean}
*/
function testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, i) {
if (i === null || targetArr[i] === 255) {
return false;
}

if (
srcArr[i * 4] === initRgba[0] &&
srcArr[i * 4 + 1] === initRgba[1] &&
srcArr[i * 4 + 2] === initRgba[2] &&
srcArr[i * 4 + 3] === initRgba[3]
) {
targetArr[i] = 255;
return true;
}

if (
tolerance > 0 &&
Math.abs(srcArr[i * 4] - initRgba[0]) <= tolerance &&
Math.abs(srcArr[i * 4 + 1] - initRgba[1]) <= tolerance &&
Math.abs(srcArr[i * 4 + 2] - initRgba[2]) <= tolerance &&
Math.abs(srcArr[i * 4 + 3] - initRgba[3]) <= tolerance
) {
targetArr[i] = 255;
return true;
}

return false;
}


/**
*
* @param srcArr Uint8Array rgba
* @param targetArr Uint8Array
* @param width int
* @param height int
* @param px int
* @param py int
* @param tolerance int 0 - 255
* @param grow int >= 0
* @param isContiguous boolean
*/
function floodFill(srcArr, targetArr, width, height, px, py, tolerance, grow, isContiguous) {

let initRgba = [
srcArr[(py * width + px) * 4],
srcArr[(py * width + px) * 4 + 1],
srcArr[(py * width + px) * 4 + 2],
srcArr[(py * width + px) * 4 + 3]
];

if (isContiguous) {
let q = [];
q.push(py * width + px);
targetArr[py * width + px] = 255;

let i, e;
while (q.length) {
i = q.pop();


e = moveIndex(width, height, i, -1, 0);
testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

e = moveIndex(width, height, i, 1, 0);
testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

e = moveIndex(width, height, i, 0, -1);
testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

e = moveIndex(width, height, i, 0, 1);
testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);
}
} else {
for (let i = 0; i < width * height; i++) {
testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, i);
}
}



if (grow === 0) {
return;
}





let x0, x1, y0, y1;
let l, tl, t, tr, r, br, b, bl;
for (let x = 0; x < width; x++) {
for (let y = 0; y < height; y++) {
if (targetArr[y * width + x] !== 255) {
continue;
}


x0 = x;
x1 = x;
y0 = y;
y1 = y;

l = targetArr[(y) * width + x - 1] !== 255;
tl = targetArr[(y - 1) * width + x - 1] !== 255;
t = targetArr[(y - 1) * width + x] !== 255;
tr = targetArr[(y - 1) * width + x + 1] !== 255;
r = targetArr[(y) * width + x + 1] !== 255;
br = targetArr[(y + 1) * width + x + 1] !== 255;
b = targetArr[(y + 1) * width + x] !== 255;
bl = targetArr[(y + 1) * width + x - 1] !== 255;

if (l) {
x0 = x - grow;
}
if (l && tl && t) {
x0 = x - grow;
y0 = y - grow;
}
if (t) {
y0 = Math.min(y0, y - grow);
}
if (t && tr && r) {
y0 = Math.min(y0, y - grow);
x1 = x + grow;
}
if (r) {
x1 = Math.max(x1, x + 1 * grow);
}
if (r && br && b) {
x1 = Math.max(x1, x + 1 * grow);
y1 = Math.max(y1, y + 1 * grow);
}
if (b) {
y1 = Math.max(y1, y + 1 * grow);
}
if (b && bl && l) {
x0 = Math.min(x0, x - 1 * grow);
y1 = Math.max(y1, y + 1 * grow);
}

if (!l && !tl && !t && !tr && !r && !br && !b && !bl) {
continue;
}

fillRect(
targetArr,
width,
Math.max(0, x0),
Math.max(0, y0),
Math.min(width - 1, x1),
Math.min(height - 1, y1)
);
}
}
for (let i = 0; i < width * height; i++) {
if (targetArr[i] === 254) {
targetArr[i] = 255;
}
}

}


/**
* Does flood fill, and returns that. an array - 0 not filled. 255 filled
*
* returns {
*     data: Uint8Array
* }
*
* @param rgbaArr Uint8Array rgba
* @param width int
* @param height int
* @param x int
* @param y int
* @param tolerance int 0 - 255
* @param grow int >= 0
* @param isContiguous boolean
* @returns {{data: Uint8Array}}
*/
BV.floodFillBits = function(rgbaArr, width, height, x, y, tolerance, grow, isContiguous) {
x = Math.round(x);
y = Math.round(y);

let resultArr = new Uint8Array(new ArrayBuffer(width * height));

floodFill(rgbaArr, resultArr, width, height, x, y, tolerance, grow, isContiguous);

return {
data: resultArr
}
};

})();


/**
* Draw text on a canvas.
*
* p = {
*     canvas: canvas,
*     textStr: str,
*     x: number,
*     y: number,
*     size: number,
*     font: 'serif' | 'monospace' | 'sans-serif' | 'cursive' | 'fantasy',
*     align: 'left' | 'center' | 'right',
*     isBold: boolean,
*     isItalic: boolean,
*     angleRad: number,
* }
*
* @param p
* @returns {{x: number, width: number, y: number, height: number}} - bounds. coords relative to p.x p.y
*/
BV.renderText = function(p) {


let textStr = p.textStr === '' ? ' ' : p.textStr;




let outer = BV.el({
css: {
position: 'fixed',
left: 0,
top: 0,
width: '100000px',
fontSize: p.size + 'px',
lineHeight: p.lineHeight ? p.lineHeight + 'px' : 'default',
}
});
let div = BV.el({
parent: outer,
css: {
display: 'inline-block',
textAlign: p.align ? p.align : 'left',
fontFamily: p.font ? p.font : 'sans-serif',
fontSize: p.size + 'px',
fontWeight: p.isBold ? 'bold' : 'normal',
fontStyle: p.isItalic ? 'italic' : 'normal',
lineHeight: p.lineHeight ? p.lineHeight + 'px' : 'default',


opacity: 0,
pointerEvents: 'none'
}
});
let spanStr = '';
let replaceObj = {
"\n": '<br>',
" ": '&nbsp;',
"	": '&nbsp;&nbsp;&nbsp;&nbsp;',
};
for (let i = 0; i < textStr.length; i++) {
if (textStr[i] === "\n") {
div.appendChild(BV.el({
tagName: 'span',
textContent: spanStr,
css: {
whiteSpace: 'pre'
}
}));
spanStr = '';
div.appendChild(BV.el({
tagName: 'br'
}));
continue;
}
spanStr += textStr[i].replace("\t", '    ');
}
div.appendChild(BV.el({
tagName: 'span',
textContent: spanStr,
css: {
whiteSpace: 'pre'
}
}));
document.body.appendChild(outer);



let bounds = {
x0: 99999999,
y0: 99999999,
x1: 0,
y1: 0
}
for (let i = 0; i < div.children.length; i++) {
let el = div.children[i];
bounds.x0 = Math.min(bounds.x0, el.offsetLeft);
bounds.y0 = Math.min(bounds.y0, el.offsetTop);
bounds.x1 = Math.max(bounds.x1, el.offsetLeft + el.offsetWidth);
bounds.y1 = Math.max(bounds.y1, el.offsetTop + el.offsetHeight);
}


let ctx = p.canvas.getContext('2d');
ctx.save();

let font = [];
if (p.isItalic) {
font.push('italic');
}
if (p.isBold) {
font.push('bold');
}
font.push(p.size + 'px ' + (p.font ? p.font : 'sans-serif'));
ctx.font = font.join(' ');
ctx.fillStyle = p.color ? p.color : '#000';

let x = p.x;
let y = p.y;
if (p.align === 'right') {
x += -bounds.x1 + bounds.x0;
}
if (p.align === 'center') {
x += (-bounds.x1 + bounds.x0) / 2;
}
ctx.translate(p.x, p.y);
ctx.rotate(p.angleRad ? -p.angleRad : 0);
ctx.translate(-p.x, -p.y);
ctx.translate(x, y);


for (let i = 0; i < div.children.length; i++) {
let el = div.children[i];


ctx.fillText(el.innerText, el.offsetLeft, el.offsetTop);
}

if (p.isDebug) {
ctx.lineWidth = 1;
ctx.strokeRect(0, -p.size * 0.85, bounds.x1, bounds.y1);
ctx.restore();
ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
} else {
ctx.restore();
}

document.body.removeChild(outer);

return {
x: x - p.x,
y: y - p.y -p.size * 0.85,
width: bounds.x1 - bounds.x0,
height: bounds.y1 - bounds.y0
};
};

BV.PSD = {};

(function() {
let kleki2PsdMap;
let psd2KlekiMap;

function init() {
if (kleki2PsdMap) {
return;
}

kleki2PsdMap = {
'source-over': 'normal',

'darken': 'darken',
'multiply': 'multiply',
'color-burn': 'color burn',

'lighten': 'lighten',
'screen': 'screen',
'color-dodge': 'color dodge',

'overlay': 'overlay',
'soft-light': 'soft light',
'hard-light': 'hard light',

'difference': 'difference',
'exclusion': 'exclusion',

'hue': 'hue',
'saturation': 'saturation',
'color': 'color',
'luminosity': 'luminosity',
};

psd2KlekiMap = {};
let keys = Object.keys(kleki2PsdMap);
for (let i = 0; i < keys.length; i++) {
psd2KlekiMap[kleki2PsdMap[keys[i]]] = keys[i];
}
}

BV.PSD.blendPsdToKleki = function(str) {
init();
return psd2KlekiMap[str];
};

BV.PSD.blendKlekiToPsd = function(str) {
init();
return kleki2PsdMap[str];
};
})();

/**
* Converts ag-psd object into something that PcCanvas can represent
*
* return success:
* {
*     type: 'psd',
*     canvas: canvas,
*     width: number,
*     height: number,
*     layerArr: [
*         {
*             name: string,
*             mixModeStr: string,
*             opacity: float,
*             canvas: canvas
*         }
*     ],
*    
*    
*     warningArr: ('mask' | 'clipping' | 'group' | 'adjustment' | 'layer-effect' | 'smart-object' | 'blend-mode' | 'bits-per-channel')[],
* }
*
* return error:
* {
*     type: 'psd',
*     canvas: canvas,
*     width: number,
*     height: number,
*     error: true,
* }
* - if there are too many layers
*
*
* @param psdObj
*/
BV.PSD.readPsd = function(psdObj) {
let result = {
type: 'psd',
canvas: psdObj.canvas,
width: psdObj.width,
height: psdObj.height
};

function addWarning(warningStr) {
if (!result.warningArr) {
result.warningArr = [];
}
if (result.warningArr.includes(warningStr)) {
return;
}
result.warningArr.push(warningStr);
}

function getMixModeStr(blendMode) {
let mixModeStr = BV.PSD.blendPsdToKleki(blendMode);
if (!mixModeStr) {
addWarning('blend-mode');
mixModeStr = 'source-over';
}
return mixModeStr;
}

if (psdObj.bitsPerChannel !== 8) {
addWarning('bits-per-channel');
}

if (!psdObj.children) {
result.error = true;
return result;
}


let maxLayers = 8;
let layerCount = 0;
function countWithinGroup(groupObj) {
let result = 0;
if (groupObj.blendMode) {
let mixModeStr = BV.PSD.blendPsdToKleki(groupObj.blendMode);
if (mixModeStr && mixModeStr !== 'source-over') {
return 1;
}
}
for (let i = 0; i < groupObj.children.length; i++) {
let item = groupObj.children[i];
if (item.clipping || item.adjustment) {
continue;
}

if (item.children) {
addWarning('group');
result += countWithinGroup(item);
} else {
result++;
}
}
return result;
}
layerCount += countWithinGroup(psdObj);
if (layerCount > maxLayers) {
result.error = true;
return result;
}

result.layerArr = [];

function prepareMask(maskCanvas, defaultColor) {
const groupMaskCtx = maskCanvas.getContext('2d');
let imData = groupMaskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
if (defaultColor === 0) {
for (let i = 0; i < imData.data.length; i += 4) {
imData.data[i + 3] = imData.data[i];
}
} else {
for (let i = 0; i < imData.data.length; i += 4) {
imData.data[i + 3] = 255 - imData.data[i];
}
}
groupMaskCtx.putImageData(imData, 0, 0);
}

function convertGroup(psdGroupObj) {

let resultArr = [];
let groupOpacity = psdGroupObj.hidden ? 0 : psdGroupObj.opacity;
let groupMixModeStr = getMixModeStr(psdGroupObj.blendMode);
let groupCanvas;
let groupCtx;
if (groupMixModeStr !== 'source-over') {
groupCanvas = BV.createCanvas(result.width, result.height);
groupCtx = groupCanvas.getContext('2d');
}



if (psdGroupObj.mask) {
addWarning('mask');
prepareMask(psdGroupObj.mask.canvas, psdGroupObj.mask.defaultColor);
}


for (let i = 0; i < psdGroupObj.children.length; i++) {
let item = psdGroupObj.children[i];
if (item.clipping) {
continue;
}
if (item.adjustment) {
addWarning('adjustment');
continue;
}

let hasClipping = (item.children || item.canvas) && psdGroupObj.children[i + 1] && psdGroupObj.children[i + 1].clipping;
if (hasClipping) {
addWarning('clipping');
}

if (item.children) {
let innerArr = convertGroup(item);

for (let e = 0; e < innerArr.length; e++) {
let innerItem = innerArr[e];
let innerCtx = innerItem.canvas.getContext('2d');


if (hasClipping) {
let clippingCanvas = BV.createCanvas(result.width, result.height);
let clippingCtx = clippingCanvas.getContext('2d');
clippingCtx.drawImage(innerItem.canvas, 0, 0);

for (let f = i + 1; f < psdGroupObj.children.length && psdGroupObj.children[f].clipping; f++) {
let clippingItem = psdGroupObj.children[f];
if (clippingItem.opacity === 0 || clippingItem.hidden) {
continue;
}
clippingCtx.globalCompositeOperation = getMixModeStr(clippingItem.blendMode);
clippingCtx.globalAlpha = clippingItem.opacity;
clippingCtx.drawImage(clippingItem.canvas, clippingItem.left, clippingItem.top);
}

innerCtx.globalCompositeOperation = 'source-atop';
innerCtx.drawImage(clippingCanvas, 0, 0);
}




if (psdGroupObj.mask) {
innerCtx.globalCompositeOperation = psdGroupObj.mask.defaultColor === 0 ? 'destination-in' : 'destination-out';
innerCtx.drawImage(psdGroupObj.mask.canvas, psdGroupObj.mask.left, psdGroupObj.mask.top);
}

if (groupCanvas) {
groupCtx.globalCompositeOperation = innerItem.mixModeStr;
groupCtx.globalAlpha = innerItem.opacity;
groupCtx.drawImage(innerItem.canvas, 0, 0);

} else {
innerItem.opacity = innerItem.opacity * groupOpacity;
resultArr.push(innerItem);
}
}

continue;
}

let canvas = BV.createCanvas(result.width, result.height);
let ctx = canvas.getContext('2d');
if (item.canvas) {
ctx.drawImage(item.canvas, item.left, item.top);
}


if (item.effects) {
addWarning('layer-effect');
}


if (item.mask) {
addWarning('mask');
prepareMask(item.mask.canvas, item.mask.defaultColor);

ctx.globalCompositeOperation = item.mask.defaultColor === 0 ? 'destination-in' : 'destination-out';
ctx.drawImage(item.mask.canvas, item.mask.left, item.mask.top);
}


if (hasClipping) {
let clippingCanvas = BV.createCanvas(item.right - item.left, item.bottom - item.top);
let clippingCtx = clippingCanvas.getContext('2d');
clippingCtx.drawImage(item.canvas, 0, 0);

for (let e = i + 1; e < psdGroupObj.children.length && psdGroupObj.children[e].clipping; e++) {
let clippingItem = psdGroupObj.children[e];
if (clippingItem.opacity === 0 || clippingItem.hidden) {
continue;
}
clippingCtx.globalCompositeOperation = getMixModeStr(clippingItem.blendMode);
clippingCtx.globalAlpha = clippingItem.opacity;
clippingCtx.drawImage(clippingItem.canvas, clippingItem.left - item.left, clippingItem.top - item.top);
}

ctx.globalCompositeOperation = 'source-atop';
ctx.drawImage(clippingCanvas, item.left, item.top);
}


if (psdGroupObj.mask) {
ctx.globalCompositeOperation = psdGroupObj.mask.defaultColor === 0 ? 'destination-in' : 'destination-out';
ctx.drawImage(psdGroupObj.mask.canvas, psdGroupObj.mask.left, psdGroupObj.mask.top);
}

if (groupCanvas) {
if (groupOpacity > 0) {
groupCtx.globalCompositeOperation = getMixModeStr(item.blendMode);
groupCtx.globalAlpha = item.hidden ? 0 : item.opacity;
groupCtx.drawImage(canvas, 0, 0);
}

} else {
resultArr.push({
name: item.name,
opacity: (item.hidden ? 0 : item.opacity) * groupOpacity,
mixModeStr: getMixModeStr(item.blendMode),
canvas: canvas
});
}
}

if (groupCanvas) {
resultArr = [
{
name: psdGroupObj.name,
opacity: groupOpacity,
mixModeStr: groupMixModeStr,
canvas: groupCanvas
}
];
}

return resultArr;
}

result.layerArr = convertGroup({
name: 'root',
opacity: 1,
blendMode: 'normal',
children: psdObj.children
});

return result;
};


BV.copyObj = function(obj) {
return JSON.parse(JSON.stringify(obj));
}

/**
* Input processor for shape tool.
* Coordinates are in canvas space.
* angleRad is the angle of the canvas.
*
* @param p - {onShape: func(isDone, x1, y1, x2, y2, angleRad)}
* @constructor
*/
BV.ShapeTool = function(p) {

let downX, downY, downAngleRad;

this.onDown = function(x, y, angleRad) {
downX = x;
downY = y;
downAngleRad = angleRad;
};

this.onMove = function(x, y) {
p.onShape(false, downX, downY, x, y, downAngleRad);
};

this.onUp = function(x, y) {
p.onShape(true, downX, downY, x, y, downAngleRad);
};
};

/**
* Draw a shape (rectangle, ellipse, line)
* p = {
*     type: 'rect' | 'ellipse' | 'line',
*     x1: number,
*     y1: number,
*     x2: number,
*     y2: number,
*     angleRad: number,
*     isOutwards: boolean,
*     opacity: number,
*     isEraser: boolean,
*     fillRgb?: rgb,
*     strokeRgb?: rgb,
*     lineWidth?: number,
*     isAngleSnap?: boolean,
*     isFixedRatio?: boolean,
* }
*
* @param ctx
* @param shapeObj
*/
BV.drawShape = function(ctx, shapeObj) {
if (['rect', 'ellipse', 'line'].includes(shapeObj.type)) {

let r1 = BV.rotate(shapeObj.x1, shapeObj.y1, shapeObj.angleRad / Math.PI * 180);
let r2 = BV.rotate(shapeObj.x2, shapeObj.y2, shapeObj.angleRad / Math.PI * 180);
r1.x = Math.round(r1.x);
r1.y = Math.round(r1.y);
r2.x = Math.round(r2.x);
r2.y = Math.round(r2.y);

let x = r1.x;
let y = r1.y;
let dX = r2.x - r1.x;
let dY = r2.y - r1.y;

if (shapeObj.isAngleSnap) {
let angleDeg = BV.angleDeg(r1, r2);
let angleDegSnapped = Math.round(angleDeg / 45) * 45;
let rotated = BV.rotate(dX, dY, angleDegSnapped - angleDeg);
dX = rotated.x;
dY = rotated.y;
}

if (shapeObj.type !== 'line' && shapeObj.isFixedRatio) {
if (Math.abs(dX) < Math.abs(dY)) {
dY = Math.abs(dX) * (dY < 0 ? -1 : 1);
} else {
dX = Math.abs(dY) * (dX < 0 ? -1 : 1);
}
}

if (shapeObj.isOutwards) {
x -= dX;
y -= dY;
dX *= 2;
dY *= 2;
}

ctx.save();
if (shapeObj.opacity) {
ctx.globalAlpha = shapeObj.opacity;
}
if (shapeObj.isEraser) {
ctx.globalCompositeOperation = 'destination-out';
}
ctx.rotate(-shapeObj.angleRad);
if (shapeObj.fillRgb) {
ctx.fillStyle = BV.ColorConverter.toRgbStr(shapeObj.fillRgb);

if (shapeObj.type === 'rect') {
ctx.fillRect(x, y, dX, dY);
} else if (shapeObj.type === 'ellipse') {
ctx.beginPath();
ctx.ellipse(x + dX / 2, y + dY / 2, Math.abs(dX / 2), Math.abs(dY / 2), 0, 0, Math.PI * 2);
ctx.fill();
}

} else if (shapeObj.strokeRgb) {
ctx.strokeStyle = BV.ColorConverter.toRgbStr(shapeObj.strokeRgb);
ctx.lineWidth = Math.round(shapeObj.lineWidth);

if (shapeObj.type === 'rect') {
ctx.strokeRect(x, y, dX, dY);
} else if (shapeObj.type === 'ellipse') {
ctx.beginPath();
ctx.ellipse(x + dX / 2, y + dY / 2, Math.abs(dX / 2), Math.abs(dY / 2), 0, 0, Math.PI * 2);
ctx.stroke();
} else if (shapeObj.type === 'line') {
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x + dX, y + dY);
ctx.stroke();
}
}
ctx.restore();

} else {
throw new Error('unknown shape');
}
};

}());
  
  
  
  
  
  
  
