(function() {
"use strict";

var eventResMs = 60;

BV.FilterLib.glBrightnessContrast.getDialog = function (params) {

var div = document.createElement("div");
let result = {
element: div
};
var tempCanvas = BV.createCanvas();

var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);

function finishInit() {

var brightness = 0, contrast = 0;
div.innerHTML = "Change brightness and contrast for the selected layer.<br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

var brightnessSlider = new BV.PcSlider({
label: 'Brightness',
width: 300,
height: 30,
min: 0,
max: 100,
initValue: (brightness + 1) * 50,
eventResMs: eventResMs,
onChange: function (val) {
brightness = val / 50 - 1;
glCanvas.draw(texture).brightnessContrast(brightness, contrast).update();
pcCanvasPreview.render();
}
});
var contrastSlider = new BV.PcSlider({
label: 'Contrast',
width: 300,
height: 30,
min: 0,
max: 100,
initValue: (contrast + 1) * 50,
eventResMs: eventResMs,
onChange: function (val) {
contrast = val / 50 - 1;
glCanvas.draw(texture).brightnessContrast(brightness, contrast).update();
pcCanvasPreview.render();
}
});
brightnessSlider.getElement().style.marginBottom = "10px";
div.appendChild(brightnessSlider.getElement());
div.appendChild(contrastSlider.getElement());



var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);

div.appendChild(previewWrapper);

try {
glCanvas.draw(texture).brightnessContrast(brightness, contrast).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}

result.getInput = function () {
brightnessSlider.destroy();
contrastSlider.destroy();
texture.destroy();
return {
brightness: brightness,
contrast: contrast
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.glBrightnessContrast.apply = function (params) {
var context = params.context;
var brightness = params.input.brightness;
var contrast = params.input.contrast;
var logger = params.logger;
if (!context || brightness === null || contrast === null || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).brightnessContrast(brightness, contrast).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glBrightnessContrast"],
action: "apply",
params: [{
input: params.input
}]
});

return true;
};

BV.FilterLib.cropExtend.getDialog = function (params) {
var canvas = params.canvas;
if (!canvas)
return false;
var tempCanvas = BV.createCanvas();
(function () {
var fit = BV.fitInto(560, 400, canvas.width, canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);
var previewFactor = w / canvas.width;
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.style.display = 'block';
tempCanvas.getContext("2d").drawImage(canvas.getCompleteCanvas(previewFactor), 0, 0, w, h);
})();

var div = document.createElement("div");
let result = {
element: div
};
div.innerHTML = "Crop or extend the image.<br/><br/>";
var left = 0, right = 0, top = 0, bottom = 0;
var leftChanged = false, rightChanged = false, topChanged = false, bottomChanged = false;
var maxWidth = params.maxWidth, maxHeight = params.maxHeight;
var scale;



var lrWrapper = BV.el({
css: {lineHeight: '30px', height: '35px'}
});
var tbWrapper = BV.el({
css: {lineHeight: '30px', height: '35px'}
});
div.appendChild(lrWrapper);
div.appendChild(tbWrapper);

var leftInput = BV.input({
init: 0,
type: 'number',
min: -canvas.width,
max: maxWidth,
css: {width: '75px', marginRight: '20px'},
callback: function(v) {
leftChanged = true;
updateInput();
}
});
var rightInput = BV.input({
init: 0,
type: 'number',
min: -canvas.width,
max: maxWidth,
css: {width: '75px'},
callback: function(v) {
rightChanged = true;
updateInput();
}
});
var topInput = BV.input({
init: 0,
type: 'number',
min: -canvas.height,
max: maxHeight,
css: {width: '75px', marginRight: '20px'},
callback: function(v) {
topChanged = true;
updateInput();
}
});
var bottomInput = BV.input({
init: 0,
type: 'number',
min: -canvas.height,
max: maxHeight,
css: {width: '75px'},
callback: function(v) {
bottomChanged = true;
updateInput();
}
});

var labelStyle = {
display: 'inline-block',
width: '60px'
};
lrWrapper.appendChild(BV.el({content: 'Left:', css: labelStyle}));
lrWrapper.appendChild(leftInput);
lrWrapper.appendChild(BV.el({content: 'Right:', css: labelStyle}));
lrWrapper.appendChild(rightInput);
tbWrapper.appendChild(BV.el({content: 'Top:', css: labelStyle}));
tbWrapper.appendChild(topInput);
tbWrapper.appendChild(BV.el({content: 'Bottom:', css: labelStyle}));
tbWrapper.appendChild(bottomInput);





function updateInput() {
left = parseInt(leftInput.value);
right = parseInt(rightInput.value);
top = parseInt(topInput.value);
bottom = parseInt(bottomInput.value);
var newWidth = canvas.width + left + right;
var newHeight = canvas.height + top + bottom;

if (newWidth <= 0) {
if (leftChanged) {
left = -canvas.width - right + 1;
leftInput.value = left;
}
if (rightChanged) {
right = -canvas.width - left + 1;
rightInput.value = right;
}
newWidth = 1;
}
if (newWidth > maxWidth) {
if (leftChanged) {
left = -canvas.width - right + maxWidth;
leftInput.value = left;
}
if (rightChanged) {
right = -canvas.width - left + maxWidth;
rightInput.value = right;
}
newWidth = maxWidth;
}
if (newHeight <= 0) {
if (topChanged) {
top = -canvas.height - bottom + 1;
topInput.value = top;
}
if (bottomChanged) {
bottom = -canvas.height - top + 1;
bottomInput.value = bottom;
}
newHeight = 1;
}
if (newHeight > maxHeight) {
if (topChanged) {
top = -canvas.height - bottom + maxHeight;
topInput.value = top;
}
if (bottomChanged) {
bottom = -canvas.height - top + maxHeight;
bottomInput.value = bottom;
}
newHeight = maxHeight;
}
cropper.setTransform({
x: -left,
y: -top,
width: newWidth,
height: newHeight
});


leftChanged = false;
rightChanged = false;
topChanged = false;
bottomChanged = false;
}


function updateGrid() {
cropper.showThirds(useRuleOfThirds);
}

var useRuleOfThirds = true;
var ruleOThirdsCheckbox = BV.checkBox({
init: true,
label: 'Rule of Thirds',
allowTab: true,
callback: function(b) {
useRuleOfThirds = b;
updateGrid();
}
});
div.appendChild(BV.el({
css: {
clear: 'both'
}
}));

let selectedRgbaObj = {r: 0, g: 0, b: 0, a: 0};
let colorOptionsArr = [
{r: 0, g: 0, b: 0, a: 0},
{r: 255, g: 255, b: 255, a: 1},
{r: 0, g: 0, b: 0, a: 1}
];
colorOptionsArr.push({
r: params.currentColorRgb.r,
g: params.currentColorRgb.g,
b: params.currentColorRgb.b,
a: 1,
});
colorOptionsArr.push({
r: params.secondaryColorRgb.r,
g: params.secondaryColorRgb.g,
b: params.secondaryColorRgb.b,
a: 1,
});

let colorOptions = new BV.ColorOptions({
label: 'fill',
colorArr: colorOptionsArr,
onChange: function(rgbaObj) {
selectedRgbaObj = rgbaObj;
updateBg(rgbaObj);
}
});


let flewRow = BV.el({
css: {
display: 'flex',
justifyContent: 'space-between'
}
});
div.appendChild(flewRow);
flewRow.appendChild(ruleOThirdsCheckbox);
flewRow.appendChild(colorOptions.getElement());



function update(transform) {
var fit = BV.fitInto(260, 180, transform.width, transform.height, 1);
scale = fit.width / transform.width;

var offset = BV.centerWithin(340, 220, fit.width, fit.height);

tempCanvas.style.width = canvas.width * scale + "px";
tempCanvas.style.height = canvas.height * scale + "px";

offsetWrapper.style.left = (offset.x - transform.x * scale) + "px";
offsetWrapper.style.top = (offset.y - transform.y * scale) + "px";

left = parseInt(-transform.x);
top = parseInt(-transform.y);
right = parseInt(transform.x + transform.width - canvas.width);
bottom = parseInt(transform.y + transform.height - canvas.height);
leftInput.value = left;
topInput.value = top;
rightInput.value = right;
bottomInput.value = bottom;

BV.createCheckerDataUrl(parseInt(50 * scale), function (url) {
previewWrapper.style.background = "url(" + url + ")";
});
previewWrapper.style.backgroundPosition = (offset.x) + "px " + (offset.y) + "px";

cropper.setScale(scale);
}

var previewWrapper = document.createElement("div");
previewWrapper.oncontextmenu = function () {
return false;
};
BV.css(previewWrapper, {
width: "340px",
marginTop: '10px',
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
position: "relative",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
userSelect: 'none'
});
let bgColorOverlay = BV.el({
css: {
position: 'absolute',
left: 0,
top: 0,
bottom: 0,
right: 0
}
});
previewWrapper.appendChild(bgColorOverlay);

var offsetWrapper = document.createElement("div");
offsetWrapper.style.position = "absolute";
offsetWrapper.style.left = "0px";
offsetWrapper.style.top = "0px";
previewWrapper.appendChild(offsetWrapper);


var canvasWrapper = BV.appendTextDiv(offsetWrapper, "");
canvasWrapper.appendChild(tempCanvas);


tempCanvas.style.boxShadow = "0 0 3px 1px rgba(0,0,0,0.5)";
tempCanvas.style.position = "absolute";
tempCanvas.style.left = "0px";
tempCanvas.style.top = "0px";

div.appendChild(previewWrapper);
var cropper = new BV.Cropper({
x: 0,
y: 0,
width: canvas.width,
height: canvas.height,
scale: scale,
callback: update,
maxW: maxWidth,
maxH: maxHeight
});
update(cropper.getTransform());
offsetWrapper.appendChild(cropper.getElement());

function updateBg(rgbaObj) {

let borderColor;
if(rgbaObj.a === 0) {
borderColor = 'rgba(0,0,0,0.5)';
bgColorOverlay.style.background = '';
} else {
borderColor = (rgbaObj.r + rgbaObj.g + rgbaObj.b < 255 * 3 / 2) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
bgColorOverlay.style.background = BV.ColorConverter.toRgbStr(rgbaObj);
}
tempCanvas.style.boxShadow = "0 0 3px 1px " + borderColor;
}


result.getInput = function () {
cropper.destroy();
return {
left: left,
right: right,
top: top,
bottom: bottom,
fillColor: selectedRgbaObj.a === 0 ? null : selectedRgbaObj
};
};
return result;
};
BV.FilterLib.cropExtend.apply = function (params) {
var canvas = params.canvas;
var logger = params.logger;
if (!canvas || !logger || isNaN(params.input.left) || isNaN(params.input.right) || isNaN(params.input.top) || isNaN(params.input.bottom)) {
return false;
}
logger.pause();
canvas.resizeCanvas(params.input);
logger.pause(false);
logger.add({
tool: ["filter", "cropExtend"],
action: "apply",
params: [{
input: JSON.parse(JSON.stringify(params.input))
}]
});
return true;
};

BV.FilterLib.glCurves.getDialog = function (params) {

var context = params.context;
var canvas = params.canvas;
if (!context || !canvas)
return false;

var currentLayerIndex;

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.style.display = 'block';
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);

var div = document.createElement("div");
let result = {
element: div
};
let pcCanvasPreview;

function finishInit() {

var previewFactor = w / context.canvas.width;
var brightness = 0, contrast = 0;

div.innerHTML = "Apply curves on the selected layer.<br/><br/>";

var curves = {
r: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
g: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
b: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
};

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

function update() {
try {
glCanvas.draw(texture).curves(curves.r, curves.g, curves.b).update();
if(pcCanvasPreview) {
pcCanvasPreview.render();
}
} catch(e) {
div.errorCallback(e);
}
}

function CurvesInput(p) {
var div = document.createElement("div");
div.oncontextmenu = function () {
return false;
};
div.style.position = "relative";
div.style.marginBottom = "10px";
var mode = "All";
var curves = p.curves;
var modeButtons = new BV.Options( {
optionArr: [
{
id: 'All',
label: 'All'
},
{
id: 'Red',
label: 'Red'
},
{
id: 'Green',
label: 'Green'
},
{
id: 'Blue',
label: 'Blue'
},
],
initialId: 'All',
onChange: function(id) {
mode = id;
if (mode === "All") {
curves = {
r: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
g: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
b: [[0, 0], [1 / 3, 1 / 3], [2 / 3, 2 / 3], [1, 1]],
};
}
var curve = curves.r;
if (mode === "Green") {
curve = curves.g;
}
if (mode === "Blue") {
curve = curves.b;
}
p0.setPos(0, areah - curve[0][1] * areah);
p1.setPos(curve[1][0] * areaw, areah - curve[1][1] * areah);
p2.setPos(curve[2][0] * areaw, areah - curve[2][1] * areah);
p3.setPos(areaw, areah - curve[3][1] * areah);

update();
}
});
div.appendChild(modeButtons.getElement());

var curveArea = document.createElement("div");
BV.css(curveArea, {
position: 'relative',
marginTop: '10px'
})
div.appendChild(curveArea);

var areaw = 300, areah = 100;
var canvas = document.createElement("canvas");
canvas.width = areaw;
canvas.height = areah;
BV.css(canvas, {
background: "rgba(0, 0, 0, 0.1)",
boxShadow: "0 0 0 1px rgba(0,0,0,0.3)"
});
var ctx = canvas.getContext("2d");
curveArea.appendChild(canvas);

var points = {
r: [],
g: [],
b: []
};

function fit(v) {
return Math.max(0, Math.min(1, v));
}

function createPoint(x, y, callback, lock) {
let gripSize = 14;
var internalY = y, internalX = x;
var point = document.createElement("div");
BV.css(point, {
position: "absolute",
left: (x - gripSize / 2) + "px",
top: (y - gripSize / 2) + "px",
width: gripSize + "px",
height: gripSize + "px",
background: "#fff",
cursor: "move",
borderRadius: gripSize + "px",
boxShadow: "inset 0 0 0 2px #000",
userSelect: 'none'
});

function update() {
BV.css(point, {
left: (x - gripSize / 2) + "px",
top: (y - gripSize / 2) + "px"
});
}

point.pointerListener = new BV.PointerListener({
target: point,
maxPointers: 1,
onPointer: function(event) {
if (event.button === 'left' && event.type === 'pointermove') {
if (!lock) {
internalX += event.dX;
}
x = Math.max(0, Math.min(areaw, internalX));
internalY += event.dY;
y = Math.max(0, Math.min(areah, internalY));
update();
callback({
x: x,
y: y
});
}
}
});

curveArea.appendChild(point);

point.setPos = function (newX, newY) {
x = newX;
y = newY;
internalY = y;
internalX = x;
BV.css(point, {
left: (x - gripSize / 2) + "px",
top: (y - gripSize / 2) + "px"
});
};

return point;
}

function updateControl(i, x, y) {
if (mode === "All") {
curves.r[i] = [fit(x / areaw), fit(1 - y / areah)];
curves.g[i] = [fit(x / areaw), fit(1 - y / areah)];
curves.b[i] = [fit(x / areaw), fit(1 - y / areah)];
}
if (mode === "Red") {
curves.r[i] = [fit(x / areaw), fit(1 - y / areah)];
}
if (mode === "Green") {
curves.g[i] = [fit(x / areaw), fit(1 - y / areah)];
}
if (mode === "Blue") {
curves.b[i] = [fit(x / areaw), fit(1 - y / areah)];
}
}

var p0 = createPoint(0, areah, function (val) {
updateControl(0, val.x, val.y);
update();
}, true);
var p1 = createPoint(areaw / 3, areah / 3 * 2, function (val) {
updateControl(1, val.x, val.y);
update();
});
var p2 = createPoint(areaw / 3 * 2, areah / 3, function (val) {
updateControl(2, val.x, val.y);
update();
});
var p3 = createPoint(areaw, 0, function (val) {
updateControl(3, val.x, val.y);
update();
}, true);


function update() {
canvas.width = canvas.width;
ctx = canvas.getContext("2d");

var outCurves = {
r: [],
g: [],
b: []
};
for (var i = 0; i < curves.r.length; i++) {
outCurves.r.push(curves.r[i]);
outCurves.g.push(curves.g[i]);
outCurves.b.push(curves.b[i]);
}

function drawCurve(curve) {
ctx.beginPath();
var spline = new BV.SplineInterpolator(curve);
for (var i = 0; i < 100; i++) {
var y = spline.interpolate(i / 100);
y = Math.max(0, Math.min(1, y));

if (i === 0) {
ctx.moveTo(i / 100 * areaw, areah - y * areah);
} else {
ctx.lineTo(i / 100 * areaw, areah - y * areah);
}
}
ctx.stroke();
}

ctx.save();
if (mode === "All") {
ctx.strokeStyle = "black";
drawCurve(outCurves.r);
} else {
ctx.globalAlpha = 0.5;
ctx.strokeStyle = "red";
drawCurve(outCurves.r);
ctx.strokeStyle = "green";
drawCurve(outCurves.g);
ctx.strokeStyle = "blue";
drawCurve(outCurves.b);
}
ctx.restore();
p.callback(outCurves);
}

update();


this.getDiv = function () {
return div;
};
this.destroy = function() {
p0.pointerListener.destroy();
p1.pointerListener.destroy();
p2.pointerListener.destroy();
p3.pointerListener.destroy();
};
}

var input = new CurvesInput({
curves: curves,
callback: function (val) {
curves = val;
update();
}
});


div.appendChild(input.getDiv());



var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);


div.appendChild(previewWrapper);

result.getInput = function () {
input.destroy();
texture.destroy();
return {
curves: curves
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.glCurves.apply = function (params) {
var context = params.context;
var curves = params.input.curves;
var logger = params.logger;
if (!context || curves === null || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).curves(curves.r, curves.g, curves.b).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glCurves"],
action: "apply",
params: [{
input: params.input
}]
});

return true;
};

BV.FilterLib.flip.getDialog = function (params) {
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.style.display = 'block';
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};
var isHorizontal = true;
var isVertical = false;
var doFlipCanvas = true;
div.innerHTML = "Flips layer or whole canvas.<br/><br/>";


var horizontalCheckbox = BV.checkBox({
init: isHorizontal,
label: 'Horizontal ⟷',
allowTab: true,
callback: function(v) {
isHorizontal = v;
updatePreview();
},
css: {
marginBottom: '10px'
}
});
var verticalCheckbox = BV.checkBox({
init: isVertical,
label: 'Vertical ↕',
allowTab: true,
callback: function(v) {
isVertical = v;
updatePreview();
},
css: {
marginBottom: '10px'
}
});
div.appendChild(horizontalCheckbox);
div.appendChild(verticalCheckbox);





var fcOption = document.createElement("div");
BV.setEventListener(fcOption, 'onpointerdown', function () {
return false;
});
fcOption.textContent = "Flip Canvas";
fcOption.style.width = "150px";
fcOption.style.height = "30px";
fcOption.style.paddingTop = "10px";
fcOption.style.textAlign = "center";
fcOption.style.cssFloat = "left";
fcOption.style.paddingBottom = "0px";
fcOption.style.borderTopLeftRadius = "10px";
fcOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";
fcOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
fcOption.style.backgroundColor = "#9e9e9e";

var flOption = document.createElement("div");
BV.setEventListener(flOption, 'onpointerdown', function () {
return false;
});
flOption.textContent = "Flip Layer";
flOption.style.width = "150px";
flOption.style.height = "30px";
flOption.style.paddingTop = "10px";
flOption.style.textAlign = "center";
flOption.style.cssFloat = "left";
flOption.style.paddingBottom = "0px";
flOption.style.borderTopRightRadius = "10px";
flOption.style.cursor = "pointer";
flOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";

BV.setEventListener(fcOption, 'onpointerover', function () {
if (doFlipCanvas === false)
fcOption.style.backgroundColor = "#ccc";
});
BV.setEventListener(fcOption, 'onpointerout', function () {
if (doFlipCanvas === false)
fcOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
});
BV.setEventListener(flOption, 'onpointerover', function () {
if (doFlipCanvas === true)
flOption.style.backgroundColor = "#ccc";
});
BV.setEventListener(flOption, 'onpointerout', function () {
if (doFlipCanvas === true)
flOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
});

fcOption.onclick = function () {
doFlipCanvas = true;

flOption.style.background = "";
flOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
flOption.style.boxShadow = "";
flOption.style.cursor = "pointer";

fcOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
fcOption.style.backgroundColor = "#9e9e9e";
fcOption.style.cursor = "default";
fcOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";

updatePreview();
};
flOption.onclick = function () {
doFlipCanvas = false;

fcOption.style.background = "";
fcOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
fcOption.style.boxShadow = "";
fcOption.style.cursor = "pointer";

flOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
flOption.style.backgroundColor = "#9e9e9e";
flOption.style.cursor = "default";
flOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";

updatePreview();
};

var optionWrapper = document.createElement("div");
optionWrapper.appendChild(fcOption);
optionWrapper.appendChild(flOption);
div.appendChild(optionWrapper);


var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayer = {
canvas: BV.createCanvas(parseInt(w), parseInt(h)),
opacity: 1,
mixModeStr: 'source-over'
};
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: [previewLayer]
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);

function updatePreview() {
let ctx = previewLayer.canvas.getContext('2d');
ctx.save();
ctx.clearRect(0, 0, previewLayer.canvas.width, previewLayer.canvas.height);

if (doFlipCanvas) {
if (isHorizontal) {
ctx.translate(previewLayer.canvas.width, 0);
ctx.scale(-1, 1);
}
if (isVertical) {
ctx.translate(0, previewLayer.canvas.height);
ctx.scale(1, -1);
}
}

for(let i = 0; i < layers.length; i++) {
ctx.save();
if (!doFlipCanvas && selectedLayerIndex === i) {
if (isHorizontal) {
ctx.translate(previewLayer.canvas.width, 0);
ctx.scale(-1, 1);
}
if (isVertical) {
ctx.translate(0, previewLayer.canvas.height);
ctx.scale(1, -1);
}
}
ctx.globalAlpha = parseFloat(layers[i].opacity);
ctx.globalCompositeOperation = layers[i].mixModeStr;
ctx.drawImage(layers[i].context.canvas, 0, 0, previewLayer.canvas.width, previewLayer.canvas.height);
ctx.restore();
}
pcCanvasPreview.render();
ctx.restore();
}
setTimeout(updatePreview, 0);


div.appendChild(previewWrapper);
result.getInput = function () {
return {
horizontal: isHorizontal,
vertical: isVertical,
flipCanvas: doFlipCanvas
};
};
return result;
};
BV.FilterLib.flip.apply = function (params) {
var context = params.context;
var canvas = params.canvas;
var logger = params.logger;
var horizontal = params.input.horizontal;
var vertical = params.input.vertical;
var flipCanvas = params.input.flipCanvas;
if (!context || !canvas || !logger) {
return false;
}

logger.pause();
canvas.flip(horizontal, vertical, flipCanvas ? null : canvas.getLayerIndex(context.canvas));
logger.pause(false);

logger.add({
tool: ["filter", "flip"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.glHueSaturation.getDialog = function (params) {

var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};

function finishInit() {
var hue = 0, Saturation = 0;
div.innerHTML = "Change hue and saturation for the selected layer.<br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

var hueSlider = new BV.PcSlider({
label: 'Hue',
width: 300,
height: 30,
min: -100,
max: 100,
initValue: hue * 100,
eventResMs: eventResMs,
onChange: function (val) {
hue = val / 100;
glCanvas.draw(texture).hueSaturation(hue, Saturation).update();
pcCanvasPreview.render();
}
});
var saturationSlider = new BV.PcSlider({
label: 'Saturation',
width: 300,
height: 30,
min: 0,
max: 100,
initValue: (Saturation + 1) * 50,
eventResMs: eventResMs,
onChange: function (val) {
Saturation = val / 50 - 1;
glCanvas.draw(texture).hueSaturation(hue, Saturation).update();
pcCanvasPreview.render();
}
});
hueSlider.getElement().style.marginBottom = "10px";
div.appendChild(hueSlider.getElement());
div.appendChild(saturationSlider.getElement());


var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);


div.appendChild(previewWrapper);

try {
glCanvas.draw(texture).hueSaturation(hue, Saturation).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}

result.getInput = function () {
hueSlider.destroy();
saturationSlider.destroy();
texture.destroy();
return {
hue: hue,
Saturation: Saturation
};
};
}

setTimeout(finishInit, 1);
return result;
};
BV.FilterLib.glHueSaturation.apply = function (params) {
var context = params.context;
var hue = params.input.hue;
var logger = params.logger;
var Saturation = params.input.Saturation;
if (!context || hue === null || Saturation === null || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).hueSaturation(hue, Saturation).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glHueSaturation"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.invert.apply = function (params) {
var context = params.context;
var logger = params.logger;
if (!context || !logger) {
return false;
}
logger.pause();

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).invert().update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);

logger.pause(false);
logger.add({
tool: ["filter", "invert"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.glPerspective.getDialog = function (params) {
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

let isSmall = window.innerWidth < 550;
var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(isSmall ? 280 : 490, isSmall ? 200 : 240, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewScale = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};
if (!isSmall) {
result.width = 500;
}

let pointerListenerArr = [];

function finishInit() {
var blur = 0;
div.innerHTML = "Transforms the selected layer. <br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);
var ba, bb, bc, bd;
var aa, ab, ac, ad;
function update() {
try {
glCanvas.draw(texture).perspective([ba.x, ba.y, bb.x, bb.y, bc.x, bc.y, bd.x, bd.y], [aa.x, aa.y, ab.x, ab.y, ac.x, ac.y, ad.x, ad.y]).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}
}

function nob(x, y, callback) {
var nobSize = 14;
var div = document.createElement("div");
div.x = x;
div.y = y;
div.style.width = nobSize + "px";
div.style.height = nobSize + "px";
div.style.backgroundColor = "#fff";
div.style.boxShadow = "inset 0 0 0 2px #000";
div.style.borderRadius = nobSize + "px";
div.style.position = "absolute";
div.style.cursor = "move";
div.style.left = (div.x - nobSize / 2) + "px";
div.style.top = (div.y - nobSize / 2) + "px";
BV.css(div, {
userSelect: 'none'
});
let pointerListener = new BV.PointerListener({
target: div,
maxPointers: 1,
onPointer: function(event) {
if (event.button === 'left' && event.type === 'pointermove') {
div.x += event.dX;
div.y += event.dY;
div.style.left = (div.x - nobSize / 2) + "px";
div.style.top = (div.y - nobSize / 2) + "px";
if (callback != undefined)
callback();
update();
}
}
});
div.copy = function (p) {
div.x = p.x;
div.y = p.y;
div.style.left = (div.x - nobSize / 2) + "px";
div.style.top = (div.y - nobSize / 2) + "px";
};
pointerListenerArr.push(pointerListener);
return div;
}

function updateAfter() {
aa.copy(ba);
ab.copy(bb);
ac.copy(bc);
ad.copy(bd);
}

ba = nob(0, 0, updateAfter);
bb = nob(w, 0, updateAfter);
bc = nob(w, h, updateAfter);
bd = nob(0, h, updateAfter);
aa = nob(0, 0);
ab = nob(w, 0);
ac = nob(w, h);
ad = nob(0, h);

var before = false;
var beforeOption = document.createElement("div");
BV.setEventListener(beforeOption, 'onpointerdown', function () {
return false;
});
beforeOption.textContent = "Before";
beforeOption.style.width = "150px";
beforeOption.style.height = "30px";
beforeOption.style.marginLeft = isSmall ? '0' : "100px";
beforeOption.style.paddingTop = "10px";
beforeOption.style.textAlign = "center";
beforeOption.style.cssFloat = "left";
beforeOption.style.paddingBottom = "0px";
beforeOption.style.borderTopLeftRadius = "10px";
beforeOption.style.cursor = "pointer";
beforeOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";

var afterOption = document.createElement("div");
BV.setEventListener(afterOption, 'onpointerdown', function () {
return false;
});
afterOption.textContent = "After";
afterOption.style.width = "150px";
afterOption.style.height = "30px";
afterOption.style.paddingTop = "10px";
afterOption.style.textAlign = "center";
afterOption.style.cssFloat = "left";
afterOption.style.paddingBottom = "0px";
afterOption.style.borderTopRightRadius = "10px";
afterOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";
afterOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
afterOption.style.backgroundColor = "#9e9e9e";


BV.setEventListener(beforeOption, 'onpointerover', function () {
if (before === false)
beforeOption.style.backgroundColor = "#ccc";
});
BV.setEventListener(beforeOption, 'onpointerout', function () {
if (before === false)
beforeOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
});
BV.setEventListener(afterOption, 'onpointerover', function () {
if (before === true)
afterOption.style.backgroundColor = "#ccc";
});
BV.setEventListener(afterOption, 'onpointerout', function () {
if (before === true)
afterOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
});

beforeOption.onclick = function () {

beforeOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
beforeOption.style.backgroundColor = "#9e9e9e";
beforeOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";
beforeOption.style.cursor = "default";

afterOption.style.background = "";
afterOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
afterOption.style.boxShadow = "";
afterOption.style.cursor = "pointer";

aa.style.display = "none";
ab.style.display = "none";
ac.style.display = "none";
ad.style.display = "none";

ba.style.display = "block";
bb.style.display = "block";
bc.style.display = "block";
bd.style.display = "block";
ba.copy(aa);
bb.copy(ab);
bc.copy(ac);
bd.copy(ad);
before = true;
update();
};
afterOption.onclick = function () {
before = false;

afterOption.style.background = "url(0-4-15--176eb290fdd/img/ui/checkmark.png) no-repeat 12px 16px";
afterOption.style.backgroundColor = "#9e9e9e";
afterOption.style.boxShadow = "inset 0px 5px 10px rgba(0,0,0,0.5)";
afterOption.style.cursor = "default";

beforeOption.style.background = "";
beforeOption.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
beforeOption.style.boxShadow = "";
beforeOption.style.cursor = "pointer";

ba.style.display = "none";
bb.style.display = "none";
bc.style.display = "none";
bd.style.display = "none";

aa.style.display = "block";
ab.style.display = "block";
ac.style.display = "block";
ad.style.display = "block";
aa.copy(ba);
ab.copy(bb);
ac.copy(bc);
ad.copy(bd);
};

var optionWrapper = document.createElement("div");
optionWrapper.appendChild(beforeOption);
optionWrapper.appendChild(afterOption);
div.appendChild(optionWrapper);


var previewWrapper = document.createElement("div");
previewWrapper.oncontextmenu = function () {
return false;
};
BV.css(previewWrapper, {
width: isSmall ? '340px' : '540px',
marginLeft: "-20px",
height: isSmall ? '260px' : '300px',
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
let canvas = i === selectedLayerIndex ? glCanvas : layers[i].context.canvas;
previewLayerArr.push({
canvas: canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);

previewInnerWrapper.appendChild(aa);
previewInnerWrapper.appendChild(ab);
previewInnerWrapper.appendChild(ac);
previewInnerWrapper.appendChild(ad);

ba.style.display = "none";
bb.style.display = "none";
bc.style.display = "none";
bd.style.display = "none";
previewInnerWrapper.appendChild(ba);
previewInnerWrapper.appendChild(bb);
previewInnerWrapper.appendChild(bc);
previewInnerWrapper.appendChild(bd);


div.appendChild(previewWrapper);
update();
result.getInput = function () {
for(let i = 0; i < pointerListenerArr.length; i++) {
pointerListenerArr[i].destroy();
}
texture.destroy();
return {
before: [ba.x / previewScale, ba.y / previewScale, bb.x / previewScale, bb.y / previewScale, bc.x / previewScale, bc.y / previewScale, bd.x / previewScale, bd.y / previewScale],
after: [aa.x / previewScale, aa.y / previewScale, ab.x / previewScale, ab.y / previewScale, ac.x / previewScale, ac.y / previewScale, ad.x / previewScale, ad.y / previewScale]
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.glPerspective.apply = function (params) {
var context = params.context;
var logger = params.logger;
var before = params.input.before;
var after = params.input.after;
if (!context || !before || !after || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
var w = context.canvas.width;
var h = context.canvas.height;
glCanvas.draw(texture).perspective(before, after).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glPerspective"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.resize.getDialog = function (params) {

var canvas = params.canvas;
if (!canvas)
return false;

var fit = BV.fitInto(280, 200, canvas.width, canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var previewFactor = w / canvas.width;
var tempCanvas = canvas.getCompleteCanvas(1);


var div = document.createElement("div");
let result = {
element: div
};
var newWidth = canvas.width, newHeight = canvas.height;

div.innerHTML = "Resizes the image.<br/><br/>";


var maxWidth = params.maxWidth, maxHeight = params.maxHeight;

var widthWrapper = document.createElement("div");
var heightWrapper = document.createElement("div");
var widthInput = document.createElement("input");
var heightInput = document.createElement("input");
widthInput.style.cssFloat = "right";
widthInput.style.width = "90px";
widthWrapper.style.width = "150px";
widthWrapper.style.height = "35px";
widthWrapper.style.lineHeight = "30px";
heightInput.style.cssFloat = "right";
heightInput.style.width = "90px";
heightWrapper.style.width = "150px";
heightWrapper.style.height = "35px";
heightWrapper.style.lineHeight = "30px";
if (navigator.appName != 'Microsoft Internet Explorer')
widthInput.type = "number";
widthInput.min = 1;
widthInput.max = maxWidth;
if (navigator.appName != 'Microsoft Internet Explorer')
heightInput.type = "number";
heightInput.min = 1;
heightInput.max = maxHeight;
widthInput.value = canvas.width;
heightInput.value = canvas.height;
widthInput.onclick = function () {
this.focus();
widthChanged = true;
update();
};
heightInput.onclick = function () {
this.focus();
heightChanged = true;
update();
};
widthInput.onchange = function () {
widthChanged = true;
update();
};
heightInput.onchange = function () {
heightChanged = true;
update();
};
/*widthInput.onkeyup = function () {
widthChanged = true;
update();
};
heightInput.onkeyup = function () {
heightChanged = true;
update();
};*/
widthWrapper.appendChild(document.createTextNode("Width: "));
widthWrapper.appendChild(widthInput);
heightWrapper.appendChild(document.createTextNode("Height: "));
heightWrapper.appendChild(heightInput);
var inputWrapper = document.createElement("div");
inputWrapper.style.background = "url(0-4-15--176eb290fdd/img/ui/constrain.png) no-repeat 150px 5px";
inputWrapper.appendChild(widthWrapper);
inputWrapper.appendChild(heightWrapper);
div.appendChild(inputWrapper);


var heightChanged = false, widthChanged = false;
var ratio = canvas.width / canvas.height;

function updateConstrain() {
if (isConstrained) {
widthInput.value = canvas.width;
heightInput.value = canvas.height;
inputWrapper.style.background = "url(0-4-15--176eb290fdd/img/ui/constrain.png) no-repeat 150px 5px";
update();
} else {
inputWrapper.style.background = "";
}
}

var isConstrained = true;
var constrainCheckbox = BV.checkBox({
init: true,
label: 'Constrain Proportions',
allowTab: true,
callback: function(b) {
isConstrained = b;
updateConstrain();
}
});
div.appendChild(BV.el({
css: {
clear: 'both'
}
}));


let algorithmSelect = new BV.Select({
optionArr: [
['smooth', 'Smooth'],
['pixelated', 'Pixelated']
],
initValue: 'smooth',
onChange: function() {
update();
}
});

let secondRowElement = BV.el({
parent: div,
title: 'Algorithm',
css: {
display: 'flex',
justifyContent: 'space-between'
}
});
secondRowElement.appendChild(constrainCheckbox);
secondRowElement.appendChild(algorithmSelect.getElement());

var previewCanvas = BV.createCanvas();
previewCanvas.width = w;
previewCanvas.height = h;

let previewCtx = previewCanvas.getContext('2d');
previewCtx.imageSmoothingQuality = 'high';

function draw() {

if(algorithmSelect.getValue() === 'smooth') {
previewCanvas.style.imageRendering = '';

previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCtx.drawImage(tempCanvas, 0, 0);
BV.resizeCanvas(previewCanvas, newWidth, newHeight);

} else {
previewCanvas.style.imageRendering = 'pixelated';
previewCanvas.width = newWidth;
previewCanvas.height = newHeight;
previewCtx.save();
previewCtx.imageSmoothingEnabled = false;
previewCtx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
previewCtx.restore();
}
}

function update() {
/*if (widthInput.value === newWidth && heightInput.value === newHeight) {
heightChanged = false;
widthChanged = false;
return;
}*/
if ((widthInput.value.length === 0 && widthChanged) || (heightInput.value.length === 0 && heightChanged)) {
heightChanged = false;
widthChanged = false;
return;
}
widthInput.value = Math.max(1, widthInput.value);
heightInput.value = Math.max(1, heightInput.value);
if (isConstrained) {
if (heightChanged) {
widthInput.value = parseInt(heightInput.value * ratio);
}
if (widthChanged) {
heightInput.value = parseInt(widthInput.value / ratio);
}

if (widthInput.value > maxWidth || heightInput.value > maxHeight) {
var fit = BV.fitInto(maxWidth, maxHeight, widthInput.value, heightInput.value, 1);
widthInput.value = parseInt(fit.width);
heightInput.value = parseInt(fit.height);
}
}

if (widthInput.value > maxWidth)
widthInput.value = maxWidth;
if (heightInput.value > maxHeight)
heightInput.value = maxHeight;

heightChanged = false;
widthChanged = false;

newWidth = widthInput.value;
newHeight = heightInput.value;

var preview = BV.fitInto(280, 200, newWidth, newHeight, 1);
var previewW = parseInt(preview.width), previewH = parseInt(preview.height);
var previewWf = preview.width;

var offset = BV.centerWithin(340, 220, previewW, previewH);

draw();

previewCanvas.style.width = Math.max(1, previewW) + "px";
previewCanvas.style.height = Math.max(1, previewH) + "px";
canvasWrapper.style.left = offset.x + "px";
canvasWrapper.style.top = offset.y + "px";
canvasWrapper.style.width = Math.max(1, previewW) + "px";
canvasWrapper.style.height = Math.max(1, previewH) + "px";
}

var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
display: "table",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
position: "relative",
userSelect: 'none'
});


var canvasWrapper = BV.appendTextDiv(previewWrapper, "");
canvasWrapper.appendChild(previewCanvas);
canvasWrapper.style.width = w + "px";
canvasWrapper.style.height = h + "px";
canvasWrapper.style.position = "absolute";
canvasWrapper.style.overflow = "hidden";
canvasWrapper.style.boxShadow = "0 0 5px rgba(0,0,0,0.8)";
canvasWrapper.style.overflow = "hidden";
BV.createCheckerDataUrl(8, function (url) {
previewWrapper.style.background = "url(" + url + ")";
});

div.appendChild(previewWrapper);
update();

result.getInput = function () {

return {
width: newWidth,
height: newHeight,
algorithm: algorithmSelect.getValue()
};
};
return result;
};
BV.FilterLib.resize.apply = function (params) {
var canvas = params.canvas;
var logger = params.logger;
var width = params.input.width;
var height = params.input.height;
var algorithm = params.input.algorithm;
if (!canvas || !logger) {
return false;
}
logger.pause();
canvas.resize(width, height, algorithm);
logger.pause(false);
logger.add({
tool: ["filter", "resize"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.rotate.getDialog = function (params) {
var canvas = params.canvas;
if (!canvas)
return false;

var fit = BV.fitInto(280, 200, canvas.width, canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var previewFactor = w / canvas.width;
var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.style.display = 'block';
tempCanvas.getContext("2d").drawImage(canvas.getCompleteCanvas(previewFactor), 0, 0, w, h);


var div = document.createElement("div");
let result = {
element: div
};
var deg = 0;
div.innerHTML = "Rotates the image.<br/><br/>";

var first = true;

function update() {
canvasWrapper.style.WebkitTransform = "rotate(" + deg + "deg)";
canvasWrapper.style.MozTransform = "rotate(" + deg + "deg)";
canvasWrapper.style.OTransform = "rotate(" + deg + "deg)";
canvasWrapper.style.msTransform = "rotate(" + deg + "deg)";
if (Math.abs(deg % 180) === 90) {

var fit = BV.fitInto(280, 200, h, w, 1);
var scale = parseInt(fit.height) / w;
canvasWrapper.style.WebkitTransform = "rotate(" + deg + "deg) scale(" + scale + ")";
canvasWrapper.style.MozTransform = "rotate(" + deg + "deg) scale(" + scale + ")";
canvasWrapper.style.OTransform = "rotate(" + deg + "deg) scale(" + scale + ")";
canvasWrapper.style.msTransform = "rotate(" + deg + "deg) scale(" + scale + ")";
}
}

var btnPlus = document.createElement("button");
btnPlus.innerHTML = "<span style='font-size: 1.3em'>⟳</span> 90°";
var btnMinus = document.createElement("button");
btnMinus.innerHTML = "<span style='font-size: 1.3em'>⟲</span> 90°";
btnMinus.style.marginRight = '5px';


btnPlus.onclick = function () {
deg += 90;
update();
};
btnMinus.onclick = function () {
deg -= 90;
update();
};

div.appendChild(btnMinus);
div.appendChild(btnPlus);

var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
display: "table",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none'
});

var previewcell = document.createElement("div");
previewcell.style.display = "table-cell";
previewcell.style.verticalAlign = "middle";
var canvasWrapper = BV.appendTextDiv(previewcell, "");
canvasWrapper.appendChild(tempCanvas);
previewWrapper.appendChild(previewcell);
canvasWrapper.style.width = w + "px";
canvasWrapper.style.height = h + "px";
canvasWrapper.style.marginLeft = "auto";
canvasWrapper.style.marginRight = "auto";
canvasWrapper.style.boxShadow = "0 0 5px rgba(0,0,0,0.8)";
canvasWrapper.style.overflow = "hidden";
BV.createCheckerDataUrl(4, function (url) {
canvasWrapper.style.background = "url(" + url + ")";
});

canvasWrapper.style.transition = "all 0.4s ease-in-out";


div.appendChild(previewWrapper);
update();

result.getInput = function () {
return {
deg: deg
};
};
return result;
};
BV.FilterLib.rotate.apply = function (params) {
var canvas = params.canvas;
var logger = params.logger;
var deg = params.input.deg;
if (!canvas || !logger)
return false;
logger.pause();
canvas.rotate(deg);
logger.pause(false);
logger.add({
tool: ["filter", "rotate"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.glTiltShift.getDialog = function (params) {
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;
var div = document.createElement("div");
let result = {
element: div
};

let pointerListenerArr = [];

function finishInit() {
var blur = 20, gradient = 200;
div.innerHTML = "Applies tilt shift on the selected layer.<br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);
var fa, fb;
function update() {
try {
glCanvas.draw(texture).tiltShift(fa.x, fa.y, fb.x, fb.y, blur * previewFactor, gradient * previewFactor).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}
}

function nob(x, y) {
var nobSize = 14;
var div = document.createElement("div");
div.x = x;
div.y = y;
div.style.width = nobSize + "px";
div.style.height = nobSize + "px";
div.style.backgroundColor = "#fff";
div.style.boxShadow = "inset 0 0 0 2px #000";
div.style.borderRadius = nobSize + "px";
div.style.position = "absolute";
div.style.cursor = "move";
div.style.left = (x - nobSize / 2) + "px";
div.style.top = (y - nobSize / 2) + "px";
BV.css(div, {
userSelect: 'none'
});
let pointerListener = new BV.PointerListener({
target: div,
maxPointers: 1,
onPointer: function(event) {
if (event.button === 'left' && event.type === 'pointermove') {
div.x += event.dX;
div.y += event.dY;
div.style.left = (div.x - nobSize / 2) + "px";
div.style.top = (div.y - nobSize / 2) + "px";
update();
}
}
});
pointerListenerArr.push(pointerListener);
return div;
}

fa = nob(parseInt(w / 6), parseInt(h / 2));
fb = nob(parseInt(w - w / 6), parseInt(h - h / 3));

var blurSlider = new BV.PcSlider({
label: 'Blur Radius',
width: 300,
height: 30,
min: 0,
max: 200,
initValue: blur,
eventResMs: eventResMs,
onChange: function (val) {
blur = val;
update();
}
});
blurSlider.getElement().style.marginBottom = "10px";
div.appendChild(blurSlider.getElement());
var gradientSlider = new BV.PcSlider({
label: 'Gradient Radius',
width: 300,
height: 30,
min: 0,
max: 1000,
initValue: gradient,
eventResMs: eventResMs,
onChange: function (val) {
gradient = val;
update();
}
});
div.appendChild(gradientSlider.getElement());


var previewWrapper = document.createElement("div");
previewWrapper.oncontextmenu = function () {
return false;
};
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);

previewInnerWrapper.appendChild(fa);
previewInnerWrapper.appendChild(fb);


div.appendChild(previewWrapper);
update();
result.getInput = function () {
for(let i = 0; i < pointerListenerArr.length; i++) {
pointerListenerArr[i].destroy();
}
blurSlider.destroy();
gradientSlider.destroy();
texture.destroy();
return {
a: {x: fa.x / previewFactor, y: fa.y / previewFactor},
b: {x: fb.x / previewFactor, y: fb.y / previewFactor},
blur: blur,
gradient: gradient
};
};
}

setTimeout(finishInit, 1);


return result;
};
BV.FilterLib.glTiltShift.apply = function (params) {
var context = params.context;
var logger = params.logger;
var a = params.input.a;
var b = params.input.b;
var blur = params.input.blur;
var gradient = params.input.gradient;
if (!context || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
var w = context.canvas.width;
var h = context.canvas.height;
glCanvas.draw(texture).tiltShift(a.x, a.y, b.x, b.y, blur, gradient).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glTiltShift"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.transform.getDialog = function (params) {
var i;
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

let isSmall = window.innerWidth < 550;
var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(isSmall ? 280 : 490, isSmall ? 200 : 240, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);
var ratio = fit.width / context.canvas.width;

var boundsObj = {
x1: null,
y1: null,
x2: null,
y2: null
};
var imdat = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
for (i = 0; i < context.canvas.width; i++) {
for (var e = 0; e < context.canvas.height; e++) {
if (imdat.data[i * 4 + e * context.canvas.width * 4 + 3] > 0) {
if (i < boundsObj.x1 || boundsObj.x1 === null) {
boundsObj.x1 = i;
}
if (e < boundsObj.y1 || boundsObj.y1 === null) {
boundsObj.y1 = e;
}
if (i > boundsObj.x2 || boundsObj.x2 === null) {
boundsObj.x2 = i;
}
if (e > boundsObj.y2 || boundsObj.y2 === null) {
boundsObj.y2 = e;
}
}
}
}
if (boundsObj.x1 === null || boundsObj.y1 === null) {
alert('Layer is empty.');
return false;
}
boundsObj = {
x: boundsObj.x1,
y: boundsObj.y1,
width: boundsObj.x2 - boundsObj.x1 + 1,
height: boundsObj.y2 - boundsObj.y1 + 1
};

var div = document.createElement("div");
let result = {
element: div
};
if (!isSmall) {
result.width = 500;
}
var brightness = 0, contrast = 0;
div.innerHTML = "Transforms selected layer. Hold Shift for additional behavior.<br/><br/>";

let keyListener = new BV.KeyListener({
onDown: function(keyStr) {
if(document.activeElement && document.activeElement.tagName === 'INPUT') {
return;
}

if (keyStr === 'left') {
inputX.value = parseFloat(inputX.value) - 1;
onInputsChanged();
}
if (keyStr === 'right') {
inputX.value = parseFloat(inputX.value) + 1;
onInputsChanged();
}
if (keyStr === 'up') {
inputY.value = parseFloat(inputY.value) - 1;
onInputsChanged();
}
if (keyStr === 'down') {
inputY.value = parseFloat(inputY.value) + 1;
onInputsChanged();
}
}

});

var leftWrapper = document.createElement("div");
var rightWrapper = document.createElement("div");
var rotWrapper = document.createElement("div");
var inputY = document.createElement("input");
var inputX = document.createElement("input");
var inputR = document.createElement("input");
leftWrapper.style.width = "100px";
leftWrapper.style.height = "30px";
rightWrapper.style.width = "100px";
rightWrapper.style.height = "30px";
rightWrapper.style.display = "inline-block";
leftWrapper.style.display = "inline-block";
rotWrapper.style.display = "inline-block";
rotWrapper.style.width = "150px";
rotWrapper.style.height = "30px";
if (navigator.appName !== 'Microsoft Internet Explorer') {
inputY.type = "number";
inputX.type = "number";
inputR.type = "number";
}
inputX.style.width = 70 + "px";
inputY.style.width = 70 + "px";
inputR.style.width = 70 + "px";
inputY.value = 0;
inputX.value = 0;
inputR.value = 0;
inputY.onclick = function () {
this.focus();
onInputsChanged();
};
inputX.onclick = function () {
this.focus();
onInputsChanged();
};
inputR.onclick = function () {
this.focus();
onInputsChanged();
};
inputY.onchange = function () {
onInputsChanged();
};
inputX.onchange = function () {
onInputsChanged();
};
inputR.onchange = function () {
onInputsChanged();
};
inputY.onkeyup = function () {
onInputsChanged();
};
inputX.onkeyup = function () {
onInputsChanged();
};
inputR.onkeyup = function () {
onInputsChanged();
};
leftWrapper.appendChild(document.createTextNode("X: "));
leftWrapper.appendChild(inputX);
rightWrapper.appendChild(document.createTextNode("Y: "));
rightWrapper.appendChild(inputY);
rotWrapper.appendChild(document.createTextNode('Rotation: '));
rotWrapper.appendChild(inputR);

div.appendChild(leftWrapper);
div.appendChild(rightWrapper);
div.appendChild(rotWrapper);



var isConstrained = true;
var constrainCheckbox = BV.checkBox({
init: true,
label: 'Constrain Proportions',
allowTab: true,
callback: function(b) {
isConstrained = b;
freeTransformObj.setConstrained(isConstrained);
},
css: {
display: 'inline-block'
}
});
var isSnapping = false;
var snappingCheckbox = BV.checkBox({
init: true,
label: 'Snapping',
allowTab: true,
callback: function(b) {
isSnapping = b;
freeTransformObj.setSnapping(isSnapping);
},
css: {
display: 'inline-block',
marginLeft: '5px'
}
});

div.appendChild(BV.el({
css: {
clear: 'both',
height: '10px'
}
}));
div.appendChild(constrainCheckbox);
div.appendChild(snappingCheckbox);



var previewWrapper = document.createElement("div");
previewWrapper.oncontextmenu = function () {
return false;
};
BV.css(previewWrapper, {
width: isSmall ? '340px' : '540px',
marginLeft: "-20px",
height: isSmall ? '260px' : '300px',
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
let canvas;
if (i === selectedLayerIndex) {
canvas = BV.createCanvas(parseInt(w), parseInt(h));
let ctx = canvas.getContext('2d');
ctx.drawImage(layers[i].context.canvas, 0, 0, canvas.width, canvas.height);
} else {
canvas = layers[i].context.canvas;
}
previewLayerArr.push({
canvas: canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);


function updateTransformLayer() {
if(!freeTransformObj) {
return;
}

let transformationObj = freeTransformObj.getTransform();
let transformLayerCanvas = previewLayerArr[selectedLayerIndex].canvas;
let ctx = transformLayerCanvas.getContext('2d');
ctx.save();
ctx.clearRect(0, 0, transformLayerCanvas.width, transformLayerCanvas.height);
BV.drawTransformedImageOnCanvasDeprectated(transformLayerCanvas, layers[selectedLayerIndex].context.canvas, transformationObj, boundsObj);
ctx.restore();
pcCanvasPreview.render();

}

var transformParams = {
x: boundsObj.x * ratio + boundsObj.width * ratio / 2,
y: boundsObj.y * ratio + boundsObj.height * ratio / 2,
width: boundsObj.width * ratio,
height: boundsObj.height * ratio,
angle: 0,


constrained: true,
snapX: [0, fit.width],
snapY: [0, fit.height],
callback: function (t) {
inputX.value = "" + Math.round(t.x / ratio);
inputY.value = "" + Math.round(t.y / ratio);
inputR.value = "" + Math.round(t.angle);
updateTransformLayer();
},
scale: ratio
};
var freeTransformObj = new BV.FreeTransform(transformParams);
BV.css(freeTransformObj.getElement(), {
position: 'absolute',
left: 0,
top: 0
});
previewInnerWrapper.appendChild(freeTransformObj.getElement());

function onInputsChanged() {
freeTransformObj.setPos({x: inputX.value * ratio, y: inputY.value * ratio});
freeTransformObj.setAngle(inputR.value);
updateTransformLayer();
}

updateTransformLayer();

div.appendChild(previewWrapper);
result.getInput = function () {
keyListener.destroy();
var trans = freeTransformObj.getTransform();
trans.width /= ratio;
trans.height /= ratio;
trans.x /= ratio;
trans.y /= ratio;
trans.bounds = boundsObj;
freeTransformObj.destroy();

return trans;
};
return result;
};
BV.FilterLib.transform.apply = function (params) {
var context = params.context;
var logger = params.logger;
if (!context || !logger)
return false;
logger.pause();

var transformObj = {
translate: {
x: Math.round(params.input.x - (params.input.bounds.x + params.input.bounds.width / 2)),
y: Math.round(params.input.y - (params.input.bounds.y + params.input.bounds.height / 2))
},
scale: {
x: params.input.width / params.input.bounds.width,
y: params.input.height / params.input.bounds.height
},
center: {
x: params.input.bounds.x + params.input.bounds.width / 2,
y: params.input.bounds.y + params.input.bounds.height / 2
},
angleDegree: params.input.angle
};
var copyCanvas = BV.copyCanvas(context.canvas);
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
BV.drawTransformedImageOnCanvas(context.canvas, copyCanvas, transformObj);

logger.pause(false);
logger.add({
tool: ["filter", "transform"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.glBlur.getDialog = function (params) {
var canvas = params.canvas;
var context = params.context;
if (!canvas || !context) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};


function finishInit() {
var radius = 10;
div.innerHTML = "Applies triangle blur on the selected layer.<br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

var radiusSlider = new BV.PcSlider({
label: 'Radius',
width: 300,
height: 30,
min: 1,
max: 200,
initValue: radius,
eventResMs: eventResMs,
onChange: function (val) {
radius = val;
glCanvas.draw(texture).triangleBlur(radius * previewFactor).update();
pcCanvasPreview.render();
}
});
div.appendChild(radiusSlider.getElement());

document.glcan = glCanvas;


var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);

div.appendChild(previewWrapper);

try {
glCanvas.draw(texture).triangleBlur(radius * previewFactor).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}

result.getInput = function () {
radiusSlider.destroy();
return {
radius: radius
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.glBlur.apply = function (params) {
var context = params.context;
var logger = params.logger;
var radius = params.input.radius;
if (!context || !radius || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).triangleBlur(radius).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
logger.pause(false);
logger.add({
tool: ["filter", "glBlur"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.glUnsharpMask.getDialog = function (params) {
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};

function finishInit() {
var radius = 2, strength = 5.1 / 10;
div.innerHTML = "Sharpens the selected layer by scaling pixels away from the average of their neighbors.<br/><br/>";

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

var radiusSlider = new BV.PcSlider({
label: 'Radius',
width: 300,
height: 30,
min: 0,
max: 200,
initValue: 2,
eventResMs: eventResMs,
onChange: function (val) {
radius = val;
glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
pcCanvasPreview.render();
},
curve: [[0, 0], [0.1, 2], [0.5, 50], [1, 200]]
});
var strengthSlider = new BV.PcSlider({
label: 'Strength',
width: 300,
height: 30,
min: 0,
max: 50,
initValue: 5.1,
eventResMs: eventResMs,
onChange: function (val) {
strength = val / 10;
glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
pcCanvasPreview.render();
},
curve: [[0, 0], [0.1, 2], [0.5, 10], [1, 50]]
});
radiusSlider.getElement().style.marginBottom = "10px";
div.appendChild(radiusSlider.getElement());
div.appendChild(strengthSlider.getElement());


var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);


div.appendChild(previewWrapper);

try {
glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
pcCanvasPreview.render();
} catch(e) {
div.errorCallback(e);
}

result.getInput = function () {
radiusSlider.destroy();
strengthSlider.destroy();
texture.destroy();
return {
radius: radius,
strength: strength
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.glUnsharpMask.apply = function (params) {
var context = params.context;
var logger = params.logger;
var radius = params.input.radius;
var strength = params.input.strength;
if (!context || radius === null || strength === null || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).unsharpMask(radius, strength).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "glUnsharpMask"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

BV.FilterLib.toAlpha.getDialog = function (params) {
var context = params.context;
var canvas = params.canvas;
if (!context || !canvas) {
return false;
}

var layers = canvas.getLayers();
var selectedLayerIndex = canvas.getLayerIndex(context.canvas);

var fit = BV.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
var w = parseInt(fit.width), h = parseInt(fit.height);

var tempCanvas = BV.createCanvas();
tempCanvas.width = w;
tempCanvas.height = h;
tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
var previewFactor = w / context.canvas.width;

var div = document.createElement("div");
let result = {
element: div
};

function finishInit() {
var radius = 2, strength = 5.1 / 10;
div.appendChild(BV.el({
content: 'Generates alpha channel for selected layer from:',
css: {
marginBottom: '5px'
}
}));

var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return;
}
var texture = glCanvas.texture(tempCanvas);

function updatePreview() {
glCanvas.draw(texture).toAlpha(sourceId === 'inverted-luminance', selectedRgbaObj).update();
pcCanvasPreview.render();
}


let sourceId = 'inverted-luminance';
let sourceOptions = new BV.Options({
optionArr: [
{
id: 'inverted-luminance',
label: 'Inverted Luminance'
},
{
id: 'luminance',
label: 'Luminance'
}
],
initialId: sourceId,
onChange: function(id) {
sourceId = id;
updatePreview();
}
});
div.appendChild(sourceOptions.getElement());


let selectedRgbaObj = {r: 0, g: 0, b: 0, a: 1};
let colorOptionsArr = [
null,
{r: 0, g: 0, b: 0, a: 1},
{r: 255, g: 255, b: 255, a: 1}
];
colorOptionsArr.push({
r: params.currentColorRgb.r,
g: params.currentColorRgb.g,
b: params.currentColorRgb.b,
a: 1,
});
colorOptionsArr.push({
r: params.secondaryColorRgb.r,
g: params.secondaryColorRgb.g,
b: params.secondaryColorRgb.b,
a: 1,
});

let colorOptions = new BV.ColorOptions({
label: 'Replace RGB',
colorArr: colorOptionsArr,
initialIndex: 1,
onChange: function(rgbaObj) {
selectedRgbaObj = rgbaObj;
updatePreview();
}
});
colorOptions.getElement().style.marginTop = '10px';
div.appendChild(colorOptions.getElement());


var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
width: "340px",
marginLeft: "-20px",
height: "220px",
backgroundColor: "#9e9e9e",
marginTop: "10px",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
position: "relative",
userSelect: 'none',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
});

let previewLayerArr = [];
{
for(let i = 0; i < layers.length; i++) {
previewLayerArr.push({
canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
opacity: layers[i].opacity,
mixModeStr: layers[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: parseInt(w),
height: parseInt(h),
layerArr: previewLayerArr
});

let previewInnerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: parseInt(w) + 'px',
height: parseInt(h) + 'px'
}
});
previewInnerWrapper.appendChild(pcCanvasPreview.getElement());
previewWrapper.appendChild(previewInnerWrapper);


div.appendChild(previewWrapper);

setTimeout(function() {
try {
updatePreview();
} catch(e) {
div.errorCallback(e);
}
}, 1);

result.getInput = function () {
texture.destroy();
return {
sourceId: sourceId,
selectedRgbaObj: selectedRgbaObj
};
};
}

setTimeout(finishInit, 1);

return result;
};
BV.FilterLib.toAlpha.apply = function (params) {
var context = params.context;
var logger = params.logger;
var sourceId = params.input.sourceId;
var selectedRgbaObj = params.input.selectedRgbaObj;
if (!context || !sourceId || !logger)
return false;
logger.pause();
var glCanvas;
try {
glCanvas = fx.canvas();
} catch (e) {
return false;
}
var texture = glCanvas.texture(context.canvas);
glCanvas.draw(texture).toAlpha(sourceId === 'inverted-luminance', selectedRgbaObj).update();
context.clearRect(0, 0, context.canvas.width, context.canvas.height);
context.drawImage(glCanvas, 0, 0);
texture.destroy();
logger.pause(false);
logger.add({
tool: ["filter", "toAlpha"],
action: "apply",
params: [{
input: params.input
}]
});
return true;
};

})();
