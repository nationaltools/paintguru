BV.BrushLib = (function () {
"use strict";

let alphaImArr = [];
alphaImArr[1] = new Image();
alphaImArr[1].src = "0-4-15--176eb290fdd/img/brush-alpha/alpha_01.png";
alphaImArr[2] = new Image();
alphaImArr[2].src = "0-4-15--176eb290fdd/img/brush-alpha/alpha_02.png";

return {
defaultBrush: function () {

let _this = this;
var debugStr = '';
var context;
var logger = {
add: function () {
},
isFake: true
}, log;

var settingColor, settingSize = 2, settingSpacing = 0.8489, settingOpacity = 1;
var settingColorStr;
var settingHasSizePressure = true, settingHasOpacityPressure = false;
var settingLockLayerAlpha = false;
let ALPHA_CIRCLE = 0, ALPHA_CHALK = 1, ALPHA_CAL = 2, ALPHA_SQUARE = 3;
var settingAlphaId = ALPHA_CIRCLE;

var lineToolLastDot;
let lastInput = {x: 0, y: 0, pressure: 0};
let lastInput2 = {x: 0, y: 0, pressure: 0};

var isDrawing = false;
var alphaOpacityArr = [1, 0.9, 1, 1];


var alphaCanvas128 = document.createElement("canvas");
alphaCanvas128.width = 128;
alphaCanvas128.height = 128;
var alphaCanvas64 = document.createElement("canvas");
alphaCanvas64.width = 64;
alphaCanvas64.height = 64;
var alphaCanvas32 = document.createElement("canvas");
alphaCanvas32.width = 32;
alphaCanvas32.height = 32;

var bezierLine = null;

var twoPI = Math.PI * 2;

function updateAlphaCanvas() {
if (settingAlphaId === ALPHA_CIRCLE || settingAlphaId === ALPHA_SQUARE) {
return;
}

var instructionArr = [
[alphaCanvas128, 128],
[alphaCanvas64, 64],
[alphaCanvas32, 32]
];

var ctx;

for(var i = 0; i < instructionArr.length; i++) {
ctx = instructionArr[i][0].getContext("2d");

ctx.save();
ctx.clearRect(0, 0, instructionArr[i][1], instructionArr[i][1]);

ctx.fillStyle = "rgba(" + settingColor.r + ", " + settingColor.g + ", " + settingColor.b + ", " + alphaOpacityArr[settingAlphaId] + ")";
ctx.fillRect(0, 0, instructionArr[i][1], instructionArr[i][1]);

ctx.globalCompositeOperation = "destination-in";
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(alphaImArr[settingAlphaId], 0, 0, instructionArr[i][1], instructionArr[i][1]);

ctx.restore();
}
}

/**
*
*
* @param x
* @param y
* @param size
* @param opacity
* @param angle
* @param before - [x, y, size, opacity, angle] the drawDot call before
*/
function drawDot(x, y, size, opacity, angle, before) {
if(size <= 0) {
return;
}

if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
}

if (!before || before[3] !== opacity) {
context.globalAlpha = opacity;
}

if (!before && (settingAlphaId === ALPHA_CIRCLE || settingAlphaId === ALPHA_SQUARE)) {
context.fillStyle = settingColorStr;
}

if (settingAlphaId === ALPHA_CIRCLE) {
context.beginPath();
context.arc(x, y, size, 0, twoPI);
context.closePath();
context.fill();

} else if (settingAlphaId === ALPHA_SQUARE) {
if(angle !== undefined) {
context.save();
context.translate(x, y);
context.rotate(angle / 180 * Math.PI);
context.fillRect(-size, -size, size * 2, size * 2);
context.restore();
}

} else {
context.save();
context.translate(x, y);
var targetMipmap = alphaCanvas128;
if (size <= 32 && size > 16) {
targetMipmap = alphaCanvas64;
} else if (size <= 16) {
targetMipmap = alphaCanvas32;
}
context.scale(size, size);
if (settingAlphaId === ALPHA_CHALK) {
context.rotate(((x + y) * 53123) % twoPI);
}
context.drawImage(targetMipmap, -1, -1, 2, 2);

context.restore();
}
}

function continueLine(x, y, size, pressure) {
if(bezierLine === null) {
bezierLine = new BV.BezierLine();
bezierLine.add(lastInput.x, lastInput.y, 0, function(){});
}

let drawArr = [];

function dotCallback(val) {
var localPressure = BV.mix(lastInput2.pressure, pressure, val.t);
var localOpacity = settingOpacity * (settingHasOpacityPressure ? (localPressure * localPressure) : 1);
var localSize = Math.max(0.1, settingSize * (settingHasSizePressure ? localPressure : 1));
drawArr.push([val.x, val.y, localSize, localOpacity, val.angle]);
}

var localSpacing = size * settingSpacing;
if(x === null) {
bezierLine.addFinal(localSpacing, dotCallback);
} else {
bezierLine.add(x, y, localSpacing, dotCallback);
}


context.save();
let before;
for (let i = 0; i < drawArr.length; i++) {
let item = drawArr[i];
drawDot(item[0], item[1], item[2], item[3], item[4], before);
before = item;
}
context.restore();
}




this.startLine = function (x, y, p) {
log = {
tool: ["brush", "defaultBrush"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [settingHasOpacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [settingHasSizePressure]
});
log.actions.push({
action: "setSize",
params: [settingSize]
});
log.actions.push({
action: "setSpacing",
params: [settingSpacing]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setAlpha",
params: [settingAlphaId]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});

p = BV.clamp(p, 0, 1);
var localOpacity = settingHasOpacityPressure ? (settingOpacity * p * p) : settingOpacity;
var localSize = settingHasSizePressure ? Math.max(0.1, p * settingSize) : Math.max(0.1, settingSize);

isDrawing = true;
context.save();
drawDot(x, y, localSize, localOpacity);
context.restore();

lineToolLastDot = localSize * settingSpacing;
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;
lastInput2.pressure = p;

log.actions.push({
action: "startLine",
params: [x, y, p]
});
};

this.goLine = function (x, y, p) {
if (!isDrawing) {
return;
}
log.actions.push({
action: "goLine",
params: [x, y, p]
});

let pressure = BV.clamp(p, 0, 1);
let localSize = settingHasSizePressure ? Math.max(0.1, lastInput.pressure * settingSize) : Math.max(0.1, settingSize);

context.save();
continueLine(x, y, localSize, lastInput.pressure);

/*context.fillStyle = 'red';
context.fillRect(Math.floor(x), Math.floor(y - 10), 1, 20);
context.fillRect(Math.floor(x - 10), Math.floor(y), 20, 1);*/

context.restore();

lastInput.x = x;
lastInput.y = y;
lastInput2.pressure = lastInput.pressure;
lastInput.pressure = pressure;
};

this.endLine = function (x, y) {

var localSize = settingHasSizePressure ? Math.max(0.1, lastInput.pressure * settingSize) : Math.max(0.1, settingSize);
context.save();
continueLine(null, null, localSize, lastInput.pressure);
context.restore();

isDrawing = false;

bezierLine = null;

if (log) {
log.actions.push({
action: "endLine",
params: [x, y]
});
logger.add(log);
log = undefined;
}
};

this.drawLineSegment = function (x1, y1, x2, y2) {
lastInput.x = x2;
lastInput.y = y2;
lastInput.pressure = 1;

if (isDrawing || x1 === undefined) {
return;
}

var angle = BV.angleFromPoints({x:x1, y:y1}, {x:x2, y:y2});
var mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
var eX = (x2 - x1) / mouseDist;
var eY = (y2 - y1) / mouseDist;
var loopDist;
var bdist = settingSize * settingSpacing;
lineToolLastDot = settingSize * settingSpacing;
for (loopDist = lineToolLastDot; loopDist <= mouseDist; loopDist += bdist) {
drawDot(x1 + eX * loopDist, y1 + eY * loopDist, settingSize, settingOpacity, angle);
}


var log = {
tool: ["brush", "defaultBrush"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [settingHasOpacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [settingHasSizePressure]
});
log.actions.push({
action: "setSize",
params: [settingSize]
});
log.actions.push({
action: "setSpacing",
params: [settingSpacing]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setAlpha",
params: [settingAlphaId]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});

log.actions.push({
action: "drawLineSegment",
params: [x1, y1, x2, y2]
});
logger.add(log);
};


this.isDrawing = function () {
return isDrawing;
};

this.setAlpha = function (a) {
if(settingAlphaId === a) {
return;
}
settingAlphaId = a;
updateAlphaCanvas();
};
this.setColor = function (c) {
if(settingColor === c) {
return;
}
settingColor = {r: c.r, g: c.g, b: c.b};
settingColorStr = "rgb(" + settingColor.r + "," + settingColor.g + "," + settingColor.b + ")";
updateAlphaCanvas();
};
this.setContext = function (c) {
context = c;
};
this.setLogger = function (l) {
logger = l;
};
this.setSize = function (s) {
settingSize = s;
};
this.setOpacity = function (o) {
settingOpacity = o;
};
this.setSpacing = function (s) {
settingSpacing = s;
};
this.sizePressure = function (b) {
settingHasSizePressure = b;
};
this.opacityPressure = function (b) {
settingHasOpacityPressure = b;
};
this.setLockAlpha = function (b) {
settingLockLayerAlpha = b;
};

this.getSpacing = function () {
return settingSpacing;
};
this.getSize = function () {
return settingSize;
};
this.getOpacity = function () {
return settingOpacity;
};
this.getLockAlpha = function (b) {
return settingLockLayerAlpha;
};
this.setDebug = function(str) {
debugStr = str;
};
},

smoothBrush: function () {
var debugStr = '';
var color;
var context;
var size = 29, spacing = 1 / 3, opacity = 0.6, blending = 0.65;
var realsize = size;
var lastDot;
var settingLockLayerAlpha = false;
var blendCol = {r: 0, g: 0, b: 0, a: 1}, blendMix = 0.45, mixr, mixg, mixb;
var localColOld;
var isDrawing = false;
let lastInput = {x: 0, y: 0, pressure: 0};
let lastInput2 = {x: 0, y: 0, pressure: 0};
var sizePressure = true, opacityPressure = false;
var lastPressure = 0;
var logger = {
add: function () {
}
};
this.setLogger = function (l) {
logger = l;
};
var log;

var bezierLine;


function getAverage(x, y, size) {
let width = Math.max(1, parseInt(size * 1.5, 10));


let x0 = Math.round(x - width / 2);
let y0 = Math.round(y - width / 2);
let x1 = Math.round(x + width / 2);
let y1 = Math.round(y + width / 2);


var imdat = context.getImageData(x0, y0, x1 - x0, y1 - y0);
var stepSize = Math.pow(size * 1.5, 2) / 60;
stepSize = Math.max(1, parseInt(stepSize + 0.5, 10));
var ar = 0, ag = 0, ab = 0, aa = 0, alpha;
for (var i = 0; i < imdat.data.length; i += 4 * stepSize) {
alpha = imdat.data[i + 3];
ar += imdat.data[i] * alpha;
ag += imdat.data[i + 1] * alpha;
ab += imdat.data[i + 2] * alpha;
aa += alpha;
}
if (aa !== 0) {
ar /= aa;
ag /= aa;
ab /= aa;
aa = Math.min(1, aa);
}
return {
r: ar,
g: ag,
b: ab,
a: aa
};
}


function drawDot(x, y, size, opacity, pressure) {

if(mixr === null | mixg === null || mixg === null) {
return;
}

context.save();
if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
}
size = Math.max(1, size);
let radgrad = context.createRadialGradient(size, size, 0, size, size, size);
let sharpness = Math.pow(opacity, 2) * 0.8;
let oFac = Math.max(0, Math.min(1, opacity));
let localOpacity = 2 * oFac - oFac * oFac;
radgrad.addColorStop(sharpness, "rgba(" + parseInt(mixr) + ", " + parseInt(mixg) + ", " + parseInt(mixb) + ", "+localOpacity+")");

radgrad.addColorStop(1, "rgba(" + parseInt(mixr) + ", " + parseInt(mixg) + ", " + parseInt(mixb) + ", 0)");
context.fillStyle = radgrad;
context.translate(x - size, y - size);
context.fillRect(0, 0, size * 2, size * 2);
context.restore();
}

function continueLine(x, y, p, avrg, isCoalesced) {

let average;
var localPressure;
var localOpacity;
var localSize = (sizePressure) ? Math.max(1, p * size) : Math.max(1, size);

var bdist = BV.mix(
(localSize * 2) / 2,
(localSize * 2) / 9,
BV.clamp((localSize - 2.7) / (12 - 2.7), 0, 1)
);

let avgX = x;
let avgY = y;
if(x === null) {
avgX = lastInput.x;
avgY = lastInput.y;
}

let localColNew;

if (blending === 0) {
mixr = parseInt(color.r);
mixg = parseInt(color.g);
mixb = parseInt(color.b);
average = {r: color.r, g: color.g, b: color.b};
} else {

if (avrg != undefined) {
average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
} else if(isCoalesced) {
average = {r: localColOld.r, g: localColOld.g, b: localColOld.b, a: 0};
} else {
average = getAverage(avgX, avgY, ((sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size)));
}
localColNew = {r: 0, g: 0, b: 0, a: 0};

if (average.a > 0 && blendCol.a === 0) {
blendCol.r = average.r;
blendCol.g = average.g;
blendCol.b = average.b;
blendCol.a = average.a;
localColNew.r = BV.mix(color.r, blendCol.r, blending);
localColNew.g = BV.mix(color.g, blendCol.g, blending);
localColNew.b = BV.mix(color.b, blendCol.b, blending);
localColNew.a = blendCol.a;

} else {
blendCol.r = BV.mix(blendCol.r, BV.mix(blendCol.r, average.r, blendMix), average.a);
blendCol.g = BV.mix(blendCol.g, BV.mix(blendCol.g, average.g, blendMix), average.a);
blendCol.b = BV.mix(blendCol.b, BV.mix(blendCol.b, average.b, blendMix), average.a);
blendCol.a = Math.min(1, blendCol.a + average.a);

localColNew.r = BV.mix(color.r, BV.mix(color.r, blendCol.r, blending), blendCol.a);
localColNew.g = BV.mix(color.g, BV.mix(color.g, blendCol.g, blending), blendCol.a);
localColNew.b = BV.mix(color.b, BV.mix(color.b, blendCol.b, blending), blendCol.a);
localColNew.a = blendCol.a;
}

}


function bezierCallback(val) {
if (blending >= 1 && blendCol.a <= 0) {
return;
}
var factor = val.t;
localPressure = lastInput2.pressure * (1 - factor) + p * factor;
localOpacity = (opacityPressure) ? (opacity * localPressure * localPressure) : opacity;
localSize = (sizePressure) ? Math.max(0.1, localPressure * size) : Math.max(0.1, size);
if (blending != 0) {
mixr = parseInt(BV.mix(localColOld.r, localColNew.r, factor));
mixg = parseInt(BV.mix(localColOld.g, localColNew.g, factor));
mixb = parseInt(BV.mix(localColOld.b, localColNew.b, factor));
}
if (blending === 1 && localColOld.a === 0) {
mixr = localColNew.r;
mixg = localColNew.g;
mixb = localColNew.b;
}
drawDot(val.x, val.y, localSize, localOpacity, p);
}

if(x === null) {
bezierLine.addFinal(bdist, bezierCallback);
} else {
bezierLine.add(x, y, bdist, bezierCallback);
}


localColOld = localColNew;

return average;
}




this.setSize = function (s) {
size = s;
};
this.getSize = function () {
return size;
};
this.getOpacity = function () {
return opacity;
};
this.setOpacity = function (o) {
opacity = o;
};
this.setBlending = function (b) {
blending = b;
};
this.getBlending = function () {
return blending;
};
this.setColor = function (c) {
color = c;
};
this.setSpacing = function (s) {
spacing = s;
};
this.setContext = function (c) {
context = c;
};
this.sizePressure = function (b) {
sizePressure = b;
};
this.opacityPressure = function (b) {
opacityPressure = b;
};
this.startLine = function (x, y, p, avrg) {
log = {
tool: ["brush", "smoothBrush"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [opacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [sizePressure]
});
log.actions.push({
action: "setSize",
params: [size]
});
log.actions.push({
action: "setOpacity",
params: [opacity]
});
log.actions.push({
action: "setColor",
params: [color]
});
log.actions.push({
action: "setBlending",
params: [blending]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});


isDrawing = true;

p = Math.max(0, Math.min(1, p));
var localOpacity = (opacityPressure) ? (opacity * p * p) : opacity;
var localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);
var average;
if (blending === 0) {
mixr = parseInt(color.r);
mixg = parseInt(color.g);
mixb = parseInt(color.b);
average = {r: color.r, g: color.g, b: color.b};
} else {
if (avrg != undefined) {
average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
} else {
average = getAverage(x, y, ((sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size)));
}

blendCol = {
r: average.r,
g: average.g,
b: average.b,
a: average.a
};

mixr = color.r * (1 - blendCol.a) + (blending * blendCol.r + color.r * (1 - blending)) * blendCol.a;
mixg = color.g * (1 - blendCol.a) + (blending * blendCol.g + color.g * (1 - blending)) * blendCol.a;
mixb = color.b * (1 - blendCol.a) + (blending * blendCol.b + color.b * (1 - blending)) * blendCol.a;
mixr = parseInt(mixr);
mixg = parseInt(mixg);
mixb = parseInt(mixb);
}

localColOld = {r: mixr, g: mixg, b: mixb, a: blendCol.a};

if (blending < 1 || blendCol.a > 0) {
drawDot(x, y, localSize, localOpacity);
}

bezierLine = new BV.BezierLine();
bezierLine.add(x, y, 0, function () {
});

lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;
lastInput2 = BV.copyObj(lastInput);
lastDot = realsize * spacing;
log.actions.push({
action: "startLine",
params: [x, y, p, {r: average.r, g: average.g, b: average.b, a: average.a}]
});
};
this.goLine = function (x, y, p, avrg, isCoalesced) {
if (!isDrawing) {
return;
}

let average = continueLine(x, y, lastInput.pressure, avrg, isCoalesced);

lastInput2 = BV.copyObj(lastInput);
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;

log.actions.push({
action: "goLine",
params: [x, y, p, {r: average.r, g: average.g, b: average.b, a: average.a}]
});
};
this.endLine = function () {

if(bezierLine) {
continueLine(null, null, lastInput.pressure, null, false);
}

isDrawing = false;
bezierLine = undefined;
if (log) {
log.actions.push({
action: "endLine",
params: []
});
logger.add(log);
log = undefined;
}
};


this.drawLineSegment = function (x1, y1, x2, y2, avrg) {
lastInput.x = x2;
lastInput.y = y2;

if (isDrawing || x1 === undefined) {
return;
}

var average;
if (avrg != undefined) {
average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
} else {
average = getAverage(x1, y1, Math.max(0.1, size));
}

blendCol = {
r: average.r,
g: average.g,
b: average.b,
a: average.a
};

mixr = color.r * (1 - blendCol.a) + (blending * blendCol.r + color.r * (1 - blending)) * blendCol.a;
mixg = color.g * (1 - blendCol.a) + (blending * blendCol.g + color.g * (1 - blending)) * blendCol.a;
mixb = color.b * (1 - blendCol.a) + (blending * blendCol.b + color.b * (1 - blending)) * blendCol.a;
mixr = parseInt(mixr);
mixg = parseInt(mixg);
mixb = parseInt(mixb);


var p = 1;
var localOpacity = (opacityPressure) ? (opacity * p * p) : opacity;
var localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);


var mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
var eX = (x2 - x1) / mouseDist;
var eY = (y2 - y1) / mouseDist;
var loopDist;
var bdist = localSize * spacing;
lastDot = 0;
for (loopDist = lastDot; loopDist <= mouseDist; loopDist += bdist) {
drawDot(x1 + eX * loopDist, y1 + eY * loopDist, localSize, localOpacity);
}


var log = {
tool: ["brush", "smoothBrush"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [opacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [sizePressure]
});
log.actions.push({
action: "setSize",
params: [size]
});
log.actions.push({
action: "setOpacity",
params: [opacity]
});
log.actions.push({
action: "setColor",
params: [color]
});
log.actions.push({
action: "setBlending",
params: [blending]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});

log.actions.push({
action: "drawLineSegment",
params: [x1, y1, x2, y2, {r: average.r, g: average.g, b: average.b, a: average.a}]
});
logger.add(log);
};

var requestCanvas = function () {
return false;
};

this.setRequestCanvas = function (f) {
requestCanvas = f;
};
this.isDrawing = function () {
return isDrawing;
};
this.setDebug = function(str) {
debugStr = str;
};


this.setLockAlpha = function (b) {
settingLockLayerAlpha = !!b;
};


this.getLockAlpha = function () {
return settingLockLayerAlpha;
};
},


sketchy: function () {
var debugStr = '';
var context;
var settingColor;

var settingSize = 1, settingOpacity = 0.2;
var settingBlending = 0.5;
var settingScale = 1;

var lastX, lastY;
var isDrawing = false;
let lastInput = {x: 0, y: 0, pressure: 0};
var logger = {
add: function () {
}
};
var sketchySeed = 0;
this.setLogger = function (l) {
logger = l;
};
var log;
this.setSeed = function (s) {
sketchySeed = parseInt(s);
};
this.getSeed = function () {
return parseInt(sketchySeed);
};

function rand() {
sketchySeed++;
return Math.sin(6324634.2345 * Math.cos(sketchySeed * 5342.3423)) * 0.5 + 0.5;
}

var points = [];
var count = 0;
var mixmode = [
function (c1, c2) {
return c1;
},
function (c1, c2) {
var result = new BV.RGB(c1.r, c1.g, c1.b);
result.r *= c2.r / 255;
result.g *= c2.g / 255;
result.b *= c2.b / 255;
return result;
},
function (c1, c2) {
var result = new BV.RGB(c1.r, c1.g, c1.b);
result.r *= c2.r / 255;
result.g *= c2.g / 255;
result.b *= c2.b / 255;
return result;
}
];

this.getSize = function () {
return settingSize / 2;
};
this.setColor = function (c) {
settingColor = c;
};
this.getOpacity = function () {
return settingOpacity;
};
this.setOpacity = function (o) {
settingOpacity = o;
};
this.getBlending = function () {
return settingBlending;
};
this.setBlending = function (b) {
settingBlending = b;
};
this.setSize = function (s) {
settingSize = s * 2;
};
this.getScale = function () {
return settingScale;
};
this.setScale = function (s) {
settingScale = s;
};
this.setContext = function (c) {
context = c;
};
this.startLine = function (x, y, pressure, shift) {
if (shift && lastInput.x) {
var lx = lastInput.x, ly = lastInput.y;
isDrawing = true;

this.endLine();
} else {
isDrawing = true;
lastX = x;
lastY = y;
lastInput.x = x;
lastInput.y = y;
log = {
tool: ["brush", "sketchy"],
actions: []
};
log.actions.push({
action: "setScale",
params: [settingScale]
});
log.actions.push({
action: "setSize",
params: [settingSize / 2]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setBlending",
params: [settingBlending]
});
log.actions.push({
action: "startLine",
params: [x, y, pressure]
});
}

};
this.goLine = function (p_x, p_y, pressure, preMixedColor) {
if (!isDrawing || (p_x === lastInput.x && p_y === lastInput.y)) {
return;
}

var e, b, a, g;
var x = parseInt(p_x);
var y = parseInt(p_y);
points.push([x, y]);

var mixr = settingColor.r;
var mixg = settingColor.g;
var mixb = settingColor.b;

if (preMixedColor !== null) {
mixr = preMixedColor.r;
mixg = preMixedColor.g;
mixb = preMixedColor.b;
} else {
if (settingBlending !== 0) {
if (x + 5 >= 0 && y + 5 >= 0 && x - 5 < context.canvas.width - 1 && y - 5 < context.canvas.height - 1) {
mixr = 0;
mixg = 0;
mixb = 0;
var mixx = Math.min(context.canvas.width - 1, Math.max(0, x - 5));
var mixy = Math.min(context.canvas.height - 1, Math.max(0, y - 5));
var mixw = Math.min(context.canvas.width - 1, Math.max(0, x + 5));
var mixh = Math.min(context.canvas.height - 1, Math.max(0, y + 5));
mixw -= mixx;
mixh -= mixy;

if (mixw > 0 && mixh > 0) {
var imdat = context.getImageData(mixx, mixy, mixw, mixh);
var countmix = 0;
for (var i = 0; i < imdat.data.length; i += 4) {
mixr += imdat.data[i + 0];
mixg += imdat.data[i + 1];
mixb += imdat.data[i + 2];
countmix++;
}
mixr /= countmix;
mixg /= countmix;
mixb /= countmix;
}

var mixed = mixmode[0](new BV.RGB(mixr, mixg, mixb), settingColor);
mixr = parseInt(BV.mix(settingColor.r, mixed.r, settingBlending));
mixg = parseInt(BV.mix(settingColor.g, mixed.g, settingBlending));
mixb = parseInt(BV.mix(settingColor.b, mixed.b, settingBlending));
}
}
}

context.save();
context.strokeStyle = "rgba(" + mixr + ", " + mixg + ", " + mixb + ", " + settingOpacity + ")";
context.lineWidth = settingSize;

context.beginPath();
context.moveTo(lastX, lastY);
context.lineTo(x, y);

for (e = 0; e < points.length; e++) {
b = points[e][0] - points[count][0];
a = points[e][1] - points[count][1];
g = b * b + a * a;
if (g < 4000 * settingScale * settingScale && rand() > g / 2000 / settingScale / settingScale) {
context.moveTo(points[count][0] + (b * 0.3), points[count][1] + (a * 0.3));
context.lineTo(points[e][0] - (b * 0.3), points[e][1] - (a * 0.3));
}
}

context.stroke();
context.restore();


count++;
lastX = x;
lastY = y;
lastInput.x = x;
lastInput.y = y;
log.actions.push({
action: "goLine",
params: [p_x, p_y, pressure, {r: mixr, g: mixg, b: mixb}]
});
};
this.endLine = function () {
isDrawing = false;
count = 0;
points = [];
if (log) {
log.actions.push({
action: "endLine",
params: []
});
logger.add(log);
log = undefined;
}
};

this.drawLineSegment = function (x1, y1, x2, y2) {
lastInput.x = x2;
lastInput.y = y2;

if (isDrawing || x1 === undefined) {
return;
}


context.save();
context.lineWidth = settingSize;

var mixr = settingColor.r, mixg = settingColor.g, mixb = settingColor.b;
if (x1 + 5 >= 0 && y1 + 5 >= 0 && x1 - 5 < context.canvas.width - 1 && y1 - 5 < context.canvas.height - 1) {
mixr = 0;
mixg = 0;
mixb = 0;
var mixx = Math.min(context.canvas.width - 1, Math.max(0, x1 - 5));
var mixy = Math.min(context.canvas.height - 1, Math.max(0, y1 - 5));
var mixw = Math.min(context.canvas.width - 1, Math.max(0, x1 + 5));
var mixh = Math.min(context.canvas.height - 1, Math.max(0, y1 + 5));
mixw -= mixx;
mixh -= mixy;
if (mixw > 0 && mixh > 0) {
var imdat = context.getImageData(mixx, mixy, mixw, mixh);
var countmix = 0;
for (var i = 0; i < imdat.data.length; i += 4) {
mixr += imdat.data[i + 0];
mixg += imdat.data[i + 1];
mixb += imdat.data[i + 2];
countmix++;
}
mixr /= countmix;
mixg /= countmix;
mixb /= countmix;
}
}
var mixed = mixmode[0](new BV.RGB(mixr, mixg, mixb), settingColor);
mixr = parseInt(settingBlending * mixed.r + settingColor.r * (1 - settingBlending));
mixg = parseInt(settingBlending * mixed.g + settingColor.g * (1 - settingBlending));
mixb = parseInt(settingBlending * mixed.b + settingColor.b * (1 - settingBlending));
context.strokeStyle = "rgba(" + mixr + ", " + mixg + ", " + mixb + ", " + settingOpacity + ")";
context.beginPath();
context.moveTo(x1, y1);
context.lineTo(x2, y2);
context.stroke();
context.strokeStyle = "rgba(" + mixr + ", " + mixg + ", " + mixb + ", " + settingOpacity + ")";
context.restore();


var log = {
tool: ["brush", "sketchy"],
actions: []
};
log.actions.push({
action: "setScale",
params: [settingScale]
});
log.actions.push({
action: "setSize",
params: [settingSize / 2]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setBlending",
params: [settingBlending]
});

log.actions.push({
action: "drawLineSegment",
params: [x1, y1, x2, y2]
});
logger.add(log);
};

this.isDrawing = function () {
return isDrawing;
};
this.setDebug = function(str) {
debugStr = str;
};
},

pixel: function () {

let _this = this;
var debugStr = '';
var context;
var logger = {
add: function () {
}
}, log;

var settingColor, settingSize = 0.5, settingSpacing = 0.9, settingOpacity = 1;
var settingColorStr;
var settingHasSizePressure = true, settingHasOpacityPressure = false;
var settingLockLayerAlpha = false;
var settingIsEraser = false;
var settingUseDither = true;

var lineToolLastDot;
let lastInput = {x: 0, y: 0, pressure: 0};
let lastInput2 = {x: 0, y: 0, pressure: 0};

var isDrawing = false;
var bezierLine = null;
var twoPI = Math.PI * 2;


let ditherCanvas = BV.createCanvas(4, 4);
let ditherCtx = ditherCanvas.getContext('2d');
let ditherPattern;
let ditherArr = [
[3, 2],
[1, 0],
[3, 0],
[1, 2],
[2, 1],
[0, 3],
[0, 1],
[2, 3],

[2, 0],
[0, 2],
[0, 0],
[2, 2],
[1, 1],
[3, 3],
[3, 1],
[1, 3]
];

function updateDither() {
ditherCtx.clearRect(0, 0, 4, 4);
ditherCtx.fillStyle = settingIsEraser ? '#fff' : settingColorStr;
for (let i = 0; i < Math.max(1, Math.round(settingOpacity * ditherArr.length)); i++) {
ditherCtx.fillRect(ditherArr[i][0], ditherArr[i][1], 1, 1);
}
ditherPattern = context.createPattern(ditherCanvas, 'repeat');
}



/**
* Tests p1->p2 or p3->p4 deviate in their direction more than max, compared to p1->p4
* @param p1
* @param p2
* @param p3
* @param p4
* @param maxAngleRad
*/
function cubicCurveOverThreshold(p1, p2, p3, p4, max) {
let d = BV.Vec2.nor({
x: p4.x - p1.x,
y: p4.y - p1.y
});
let d2 = BV.Vec2.nor({
x: p2.x - p1.x,
y: p2.y - p1.y
});
let d3 = BV.Vec2.nor({
x: p4.x - p3.x,
y: p4.y - p3.y
});
let a2 = Math.abs(BV.Vec2.angle(d, d2) % Math.PI) / Math.PI * 180;
let a3 = Math.abs(BV.Vec2.angle(d, d3) % Math.PI) / Math.PI * 180;

return Math.max(BV.Vec2.dist(d, d2), BV.Vec2.dist(d, d3)) > max;
}


function plotLine(x0, y0, x1, y1, skipFirst) {
context.save();

if (settingIsEraser) {
context.fillStyle = settingUseDither ? ditherPattern : '#fff';
if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
} else {
context.globalCompositeOperation = "destination-out";
}
} else {
context.fillStyle = settingUseDither ? ditherPattern : settingColorStr;
if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
}
}
context.globalAlpha = settingUseDither ? 1 : settingOpacity;

x0 = Math.floor(x0);
y0 = Math.floor(y0);
x1 = Math.floor(x1);
y1 = Math.floor(y1);

let dX = Math.abs(x1 - x0);
let sX = x0 < x1 ? 1 : -1;
let dY = -Math.abs(y1 - y0);
let sY = y0 < y1 ? 1 : -1;
let err = dX + dY;
while (true) {
if (skipFirst) {
skipFirst = false;
} else {
context.fillRect(x0, y0, 1, 1);
}
if (x0 === x1 && y0 === y1) {
break;
}
let e2 = 2 * err;
if (e2 >= dY) {
err += dY;
x0 += sX;
}
if (e2 <= dX) {
err += dX;
y0 += sY;
}
}

context.restore();
}

function plotCubicBezierLine(p1, p2, p3, p4) {

let isOverThreshold = cubicCurveOverThreshold(p1, p2, p3, p4, 0.1);

p1.x = Math.floor(p1.x);
p1.y = Math.floor(p1.y);
p4.x = Math.floor(p4.x);
p4.y = Math.floor(p4.y);

let dist = BV.dist(p1.x ,p1.y, p4.x, p4.y);
if (!isOverThreshold || dist < 7) {
plotLine(p1.x ,p1.y, p4.x, p4.y, true);
return;
}

let n = Math.max(2, Math.round(dist / 4));
let pointArr = [];
for (let i = 0; i <= n; i++) {
let t = i / n;
let a = Math.pow(1 - t, 3);
let b = 3 * t * Math.pow(1 - t, 2);
let c = 3 * Math.pow(t, 2) * (1 - t);
let d = Math.pow(t, 3);
pointArr.push({
x: a * p1.x + b * p2.x + c * p3.x + d * p4.x,
y: a * p1.y + b * p2.y + c * p3.y + d * p4.y
});
}

for (let i = 0; i < n; i++) {
plotLine(
Math.round(pointArr[i].x),
Math.round(pointArr[i].y),
Math.round(pointArr[i + 1].x),
Math.round(pointArr[i + 1].y),
true
);
}
}

function drawDot(x, y, size, opacity, angle) {
context.save();
if (settingIsEraser) {
context.fillStyle = settingUseDither ? ditherPattern : '#fff';
if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
} else {
context.globalCompositeOperation = "destination-out";
}
} else {
context.fillStyle = settingUseDither ? ditherPattern : settingColorStr;
if (settingLockLayerAlpha) {
context.globalCompositeOperation = "source-atop";
}
}
context.globalAlpha = settingUseDither ? 1 : opacity;
context.fillRect(
Math.round(x + -size),
Math.round(y + -size),
Math.round(size * 2),
Math.round(size * 2)
);
context.restore();
}


function continueLine(x, y, size, pressure) {
if(bezierLine === null) {
bezierLine = new BV.BezierLine();
bezierLine.add(lastInput.x, lastInput.y, 0, function(){});
}

context.save();

function dotCallback(val) {
var localPressure = BV.mix(lastInput2.pressure, pressure, val.t);
var localOpacity = settingOpacity * (settingHasOpacityPressure ? (localPressure * localPressure) : 1);
var localSize = Math.max(0.5, settingSize * (settingHasSizePressure ? localPressure : 1));
drawDot(val.x, val.y, localSize, localOpacity, val.angle);
}

function controlCallback(controlObj) {
plotCubicBezierLine(controlObj.p1, controlObj.p2, controlObj.p3, controlObj.p4);
}

if (Math.round(settingSize * 2) === 1) {
if(x === null) {
bezierLine.addFinal(4, null, controlCallback);
} else {
bezierLine.add(x, y, 4, null, controlCallback);
}

} else {
var localSpacing = size * settingSpacing;

if(x === null) {
bezierLine.addFinal(localSpacing, dotCallback);
} else {
bezierLine.add(x, y, localSpacing, dotCallback);
}
}

context.restore();
}




this.startLine = function (x, y, p) {
log = {
tool: ["brush", "pixel"],
actions: []
};
log.actions.push({
action: "sizePressure",
params: [settingHasSizePressure]
});
log.actions.push({
action: "setSize",
params: [settingSize]
});
log.actions.push({
action: "setSpacing",
params: [settingSpacing]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});
log.actions.push({
action: "setIsEraser",
params: [settingIsEraser]
});
log.actions.push({
action: "setUseDither",
params: [settingUseDither]
});

if (settingUseDither) {
updateDither();
}

p = Math.max(0, Math.min(1, p));
var localOpacity = settingHasOpacityPressure ? (settingOpacity * p * p) : settingOpacity;
var localSize = settingHasSizePressure ? Math.max(0.5, p * settingSize) : Math.max(0.5, settingSize);

isDrawing = true;
drawDot(x, y, localSize, localOpacity);
lineToolLastDot = localSize * settingSpacing;
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;
lastInput2 = BV.copyObj(lastInput);

log.actions.push({
action: "startLine",
params: [x, y, p]
});
};

this.goLine = function (x, y, p) {
if (!isDrawing) {
return;
}
log.actions.push({
action: "goLine",
params: [x, y, p]
});




let pressure = BV.clamp(p, 0, 1);
let localSize = settingHasSizePressure ? Math.max(0.1, lastInput.pressure * settingSize) : Math.max(0.1, settingSize);

continueLine(x, y, localSize, lastInput.pressure);

lastInput2 = BV.copyObj(lastInput);
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = pressure;
};

this.endLine = function (x, y) {

var localSize = settingHasSizePressure ? Math.max(0.1, lastInput.pressure * settingSize) : Math.max(0.1, settingSize);
continueLine(null, null, localSize, lastInput.pressure);





isDrawing = false;

bezierLine = null;

if (log) {
log.actions.push({
action: "endLine",
params: [x, y]
});
logger.add(log);
log = undefined;
}
};

this.drawLineSegment = function (x1, y1, x2, y2) {
lastInput.x = x2;
lastInput.y = y2;
lastInput.pressure = 1;

if (isDrawing || x1 === undefined) {
return;
}


if (Math.round(settingSize * 2) === 1) {
plotLine(x1, y1, x2, y2, true);
} else {
var angle = BV.angleFromPoints({x:x1, y:y1}, {x:x2, y:y2});
var mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
var eX = (x2 - x1) / mouseDist;
var eY = (y2 - y1) / mouseDist;
var loopDist;
var bdist = settingSize * settingSpacing;
lineToolLastDot = settingSize * settingSpacing;
for (loopDist = lineToolLastDot; loopDist <= mouseDist; loopDist += bdist) {
drawDot(x1 + eX * loopDist, y1 + eY * loopDist, settingSize, settingOpacity, angle);
}
}

var log = {
tool: ["brush", "pixel"],
actions: []
};
log.actions.push({
action: "sizePressure",
params: [settingHasSizePressure]
});
log.actions.push({
action: "setSize",
params: [settingSize]
});
log.actions.push({
action: "setSpacing",
params: [settingSpacing]
});
log.actions.push({
action: "setOpacity",
params: [settingOpacity]
});
log.actions.push({
action: "setColor",
params: [settingColor]
});
log.actions.push({
action: "setLockAlpha",
params: [settingLockLayerAlpha]
});
log.actions.push({
action: "setIsEraser",
params: [settingIsEraser]
});

log.actions.push({
action: "drawLineSegment",
params: [x1, y1, x2, y2]
});
logger.add(log);
};


this.isDrawing = function () {
return isDrawing;
};

this.setColor = function (c) {
if(settingColor === c) {
return;
}
settingColor = c;
settingColorStr = "rgb(" + settingColor.r + "," + settingColor.g + "," + settingColor.b + ")";
};
this.setContext = function (c) {
context = c;
};
this.setLogger = function (l) {
logger = l;
};
this.setSize = function (s) {
settingSize = s;
};
this.setOpacity = function (o) {
settingOpacity = o;
};
this.setSpacing = function (s) {
settingSpacing = s;
};
this.sizePressure = function (b) {
settingHasSizePressure = b;
};
this.opacityPressure = function (b) {
settingHasOpacityPressure = b;
};
this.setLockAlpha = function (b) {
settingLockLayerAlpha = b;
};
this.setIsEraser = function(b) {
settingIsEraser = !!b;
};
this.setUseDither = function(b) {
settingUseDither = !!b;
};

this.getSpacing = function () {
return settingSpacing;
};
this.getSize = function () {
return settingSize;
};
this.getOpacity = function () {
return settingOpacity;
};
this.getLockAlpha = function () {
return settingLockLayerAlpha;
};
this.getIsEraser = function() {
return settingIsEraser;
};
this.getUseDither = function() {
return settingUseDither;
};
this.setDebug = function(str) {
debugStr = str;
};
},

eraser: function () {
let debugStr = '';
let context;
let logger = {
add: function () {
}
}, log;

let size = 30, spacing = 0.4, opacity = 1;
let sizePressure = true, opacityPressure = false;
let lastDot, lastInput = {x: 0, y: 0, pressure: 0};
let lastInput2 = {x: 0, y: 0, pressure: 0};
let started = false;

let bezierLine;
let isBaseLayer = false;
let isTransparentBG = false;

function drawDot(x, y, size, opacity) {

context.save();
if (isBaseLayer) {
if (isTransparentBG) {
context.globalCompositeOperation = "destination-out";
} else {
context.globalCompositeOperation = "source-atop";
}
} else {
context.globalCompositeOperation = "destination-out";
}
let radgrad = context.createRadialGradient(size, size, 0, size, size, size);
let sharpness = Math.pow(opacity, 2);
sharpness = Math.max(0, Math.min((size - 1) / size, sharpness));
let oFac = Math.max(0, Math.min(1, opacity));
let localOpacity = 2 * oFac - oFac * oFac;
radgrad.addColorStop(sharpness, "rgba(255, 255, 255, " + localOpacity + ")");
radgrad.addColorStop(1, "rgba(255, 255, 255, 0)");
context.fillStyle = radgrad;
context.translate(x - size, y - size);
context.fillRect(0, 0, size * 2, size * 2);
context.restore();
}

function continueLine(x, y, p) {
p = Math.max(0, Math.min(1, p));
var localPressure;
var localOpacity;
var localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);

var bdist = Math.max(1, Math.max(0.5, 1 - opacity) * localSize * spacing);

function bezierCallback(val) {
var factor = val.t;
localPressure = lastInput2.pressure * (1 - factor) + p * factor;
localOpacity = (opacityPressure) ? (opacity * localPressure * localPressure) : opacity;
localSize = (sizePressure) ? Math.max(0.1, localPressure * size) : Math.max(0.1, size);

drawDot(val.x, val.y, localSize, localOpacity);
}

if(x === null) {
bezierLine.addFinal(bdist, bezierCallback);
} else {
bezierLine.add(x, y, bdist, bezierCallback);
}
}


this.startLine = function (x, y, p) {
log = {
tool: ["brush", "eraser"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [opacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [sizePressure]
});
log.actions.push({
action: "setSize",
params: [size]
});
log.actions.push({
action: "setOpacity",
params: [opacity]
});
log.actions.push({
action: "setTransparentBG",
params: [isTransparentBG]
});

var pcCanvas = context.canvas.pcCanvas;
if(!pcCanvas) {
throw 'context.canvas has no parent element ('+debugStr+')';
}
isBaseLayer = 0 === pcCanvas.getLayerIndex(context.canvas);

p = Math.max(0, Math.min(1, p));
var localOpacity = (opacityPressure) ? (opacity * p * p) : opacity;
var localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);

started = true;
if (localSize > 1) {
drawDot(x, y, localSize, localOpacity);
}
lastDot = localSize * spacing;
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;
lastInput2 = BV.copyObj(lastInput);

bezierLine = new BV.BezierLine();
bezierLine.add(x, y, 0, function () {});

log.actions.push({
action: "startLine",
params: [x, y, p]
});
};
this.goLine = function (x, y, p) {
if (!started) {
return;
}
log.actions.push({
action: "goLine",
params: [x, y, p]
});

continueLine(x, y, lastInput.pressure);

lastInput2 = BV.copyObj(lastInput);
lastInput.x = x;
lastInput.y = y;
lastInput.pressure = p;
};
this.endLine = function () {

if(bezierLine) {
continueLine(null, null, lastInput.pressure);
}

started = false;
bezierLine = undefined;

if (log) {
log.actions.push({
action: "endLine",
params: []
});
logger.add(log);
log = undefined;
}
};

this.drawLineSegment = function (x1, y1, x2, y2) {

var pcCanvas = context.canvas.pcCanvas;
isBaseLayer = 0 === pcCanvas.getLayerIndex(context.canvas);

lastInput.x = x2;
lastInput.y = y2;

if (started || x1 === undefined) {
return;
}

var mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
var eX = (x2 - x1) / mouseDist;
var eY = (y2 - y1) / mouseDist;
var loopDist;
var bdist = Math.max(1, Math.max(0.5, 1 - opacity) * size * spacing);
lastDot = 0;
for (loopDist = lastDot; loopDist <= mouseDist; loopDist += bdist) {
drawDot(x1 + eX * loopDist, y1 + eY * loopDist, size, opacity);
}


var log = {
tool: ["brush", "eraser"],
actions: []
};
log.actions.push({
action: "opacityPressure",
params: [opacityPressure]
});
log.actions.push({
action: "sizePressure",
params: [sizePressure]
});
log.actions.push({
action: "setSize",
params: [size]
});
log.actions.push({
action: "setOpacity",
params: [opacity]
});
log.actions.push({
action: "setTransparentBG",
params: [isTransparentBG]
});

log.actions.push({
action: "drawLineSegment",
params: [x1, y1, x2, y2]
});
logger.add(log);
};


this.isDrawing = function () {
return started;
};

/*this.setAlpha = function(a) {
lastInput = {};
alpha = a;
updateAlphaCanvas();
};*/
this.setContext = function (c) {
context = c;
};
this.setLogger = function (l) {
logger = l;
};
this.setSize = function (s) {
size = s;
};
this.setOpacity = function (o) {
opacity = o;
};
this.sizePressure = function (b) {
sizePressure = b;
};
this.opacityPressure = function (b) {
opacityPressure = b;
};
this.setTransparentBG = function (b) {
isTransparentBG = b == true;
};

this.getSize = function () {
return size;
};
this.getOpacity = function () {
return opacity;
};
this.setDebug = function(str) {
debugStr = str;
};
}
};
}());
