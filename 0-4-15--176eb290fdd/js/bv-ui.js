(function () {
"use strict";

/**
* Prevent ipad from zooming in when double tapping. iPadOS 13 bug.
* Give it your click event
*
* @param clickEvent
* @returns {boolean}
*/
BV.handleClick = function(clickEvent) {
if(['A', 'LABEL', 'INPUT'].includes(clickEvent.target.tagName) || clickEvent.target.allowClick) {
return true;
}
clickEvent.preventDefault();
return false;
};

BV.Output = function() {
var div = null;
var innerDiv = null;

let angleIm;
let innerEl;

let isWide = false;
let uiState = 'right';

function updateUiState() {
if (!div) {
return;
}
if (uiState === 'left') {
div.style.left = '271px';
} else {
div.style.removeProperty('left');
}
}



this.setWide = function(b) {
isWide = !!b;

if (!div) {
return;
}

if (isWide) {
div.style.width = '100%';
} else {
div.style.removeProperty('width');
}
};

this.setUiState = function(state) {
uiState = state;
updateUiState();
};

this.out = function(outStrOrObj, doPulse) {
var timeout, timeout2;
if (div === null) {
div = document.createElement("div");
div.className = "top-overlay g-root";

if (isWide) {
div.style.width = '100%';
}

updateUiState();

innerDiv = document.createElement("div");
innerDiv.className = "top-overlay-inner";


angleIm = new Image();
angleIm.src = '0-4-15--176eb290fdd/img/ui/angle.png';
BV.css(angleIm, {
verticalAlign: 'bottom',
width: '20px',
height: '20px',
marginLeft: '5px',
borderRadius: '10px'
});

innerEl = document.createElement('div');
innerEl.style.display = 'inline-block';

innerDiv.appendChild(innerEl);
innerDiv.appendChild(angleIm);
div.appendChild(innerDiv);
document.body.appendChild(div);
}

if(typeof outStrOrObj === 'object' && outStrOrObj !== null) {

if(outStrOrObj.type === 'transform') {
angleIm.style.display = 'inline-block';
angleIm.style.transform = 'rotate(' + outStrOrObj.angleDeg + 'deg)';

if(outStrOrObj.angleDeg % 90 === 0) {
angleIm.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.7)';
} else {
angleIm.style.boxShadow = '';
}

innerEl.innerHTML = Math.round(outStrOrObj.scale * 100) + "%";


} else {
angleIm.style.display = 'none';
}



} else {
angleIm.style.display = 'none';
innerEl.innerHTML = outStrOrObj;
}

if(doPulse) {
innerDiv.style.transition = '';
innerDiv.style.backgroundColor = 'var(--kleki-color)';
setTimeout(function() {
innerDiv.style.transition = 'background-color 0.5s ease-out';
innerDiv.style.backgroundColor = '';
}, 20);
}



if (div.timeout) {
clearTimeout(div.timeout);
}
if (div.timeout2) {
clearTimeout(div.timeout2);
}
div.style.animationName = "consoleIn";
div.style.opacity = "1";
div.timeout = setTimeout(function () {
div.style.opacity = "0";
div.style.animationName = "consoleOut";
div.timeout2 = setTimeout(function () {
div.style.display = "none";
div.timeout2 = 0;
}, 450);
div.timeout = 0;
}, 1200);
div.style.display = "flex";
};
};

BV.appendTextDiv = function (target, text) {
var div = document.createElement("div");
div.innerHTML = text;
target.appendChild(div);
return div;
};

/**
* clears text selection in window
*/
BV.clearSelection = function() {
if (window.getSelection) {
if (window.getSelection().empty) {
window.getSelection().empty();
} else if (window.getSelection().removeAllRanges) {
window.getSelection().removeAllRanges();
}
} else if (document.selection) {
document.selection.empty();
}
};

/**
* prevents being able to focus element.
* warning: it creates a listener
*
* @param el - dom element
*/
BV.makeUnfocusable = (function() {

function preventFocus(event) {
event.preventDefault();
let didFocusRelated = false;
if (event.relatedTarget) {
try {
event.relatedTarget.focus();
didFocusRelated = true;
} catch(e) {}
}
if(!didFocusRelated) {
event.currentTarget.blur();
}
}

return function(el) {
el.setAttribute('tabindex', '-1');
BV.addEventListener(el, 'focus', preventFocus);
};
})();


BV.exportDialog = function (parent, image) {
var boxSize, aboutCloseFunc, aboutDiv, closed, aniToggle, imageContainer, coverImage, coverSize,
text, holding, aniTimeout, halfBoxSize;
boxSize = 22 * 2;
halfBoxSize = 22;
aboutCloseFunc = function () {
};
closed = false;
aniToggle = false;
aboutDiv = document.createElement("div");
BV.css(aboutDiv, {
width: (7 * boxSize) + "px"
});

imageContainer = document.createElement("div");
coverImage = new Image();
coverImage.src = image.src;

imageContainer.appendChild(coverImage);
imageContainer.appendChild(image);

BV.css(imageContainer, {
width: (6 * boxSize) + "px",
height: (4 * boxSize) + "px",
marginTop: (boxSize / 2 - 1) + "px",
marginLeft: (boxSize / 2 - 1) + "px",
position: "relative",
overflow: "hidden",
boxShadow: "0 0 10px 4px rgba(255,255,255, 0)",
border: "1px solid rgba(255, 255, 255, 1)",
transition: "box-shadow 0.7s linear"
});
BV.css(image, {
position: "absolute",
left: 0,
top: 0,
width: (6 * boxSize) + "px",
height: (4 * boxSize) + "px",
opacity: 0
});
coverSize = {
width: (6 * boxSize),
height: (6 * boxSize / image.width) * image.height
};
if (coverSize.height < (4 * boxSize)) {
coverSize.height = (4 * boxSize);
coverSize.width = (coverSize.height / image.height) * image.width;
}
BV.css(coverImage, {
position: "absolute",
top: (2 * boxSize) + "px",
left: (3 * boxSize) + "px",
width: coverSize.width + "px",
height: coverSize.height + "px",
marginLeft: (-coverSize.width / 2) + "px",
marginTop: (-coverSize.height / 2) + "px"
});

function animation() {
if (closed) {
return;
}
aniToggle = !aniToggle;
if (aniToggle) {
BV.css(imageContainer, {
border: "1px solid rgba(0, 0, 0, 1)"
});
} else {
BV.css(imageContainer, {
border: "1px solid rgba(200, 200, 200, 1)"
});
}
setTimeout(animation, 510);
}

animation();

text = document.createElement("div");
text.innerHTML = "Right-Click or Press-Hold on the image, then save.";
text.ontouchstart = function () {
return false;
};
BV.css(text, {
fontSize: (boxSize / 2.5) + "px",
color: "#777",
padding: "10px",
textAlign: "center"
});

aboutDiv.appendChild(imageContainer);
aboutDiv.appendChild(text);

holding = false;
image.ontouchstart = function () {
BV.css(imageContainer, {
boxShadow: "0 0 10px 8px rgba(0,255,255, 1)"
});
holding = true;
aniTimeout = setTimeout(function () {
holding = false;
BV.css(imageContainer, {
boxShadow: "0 0 10px 4px rgba(0,255,255, 0)"
});
}, 1500);
};
image.ontouchmove = function () {
BV.css(imageContainer, {
boxShadow: "0 0 10px 4px rgba(0,255,255, 0)"
});
holding = false;
clearTimeout(aniTimeout);
};
image.ontouchend = function () {
BV.css(imageContainer, {
boxShadow: "0 0 10px 4px rgba(0,255,255, 0)"
});
holding = false;
clearTimeout(aniTimeout);
};

BV.popup({
target: parent,
message: "<b>Save Image</b>",
div: aboutDiv,
buttons: ["Close"],
callback: function (result) {
closed = true;
}
});
};


/**
*
* params:
* {
*      target: DOM Element
*      div: node with content
*      message:
*      callback:
*      buttons: [string, ...]
*      type:
*      closefunc:
*      style:
*      clickOnEnter: string
*      autoFocus: string
* }
*
* @param params
*/
BV.popup = function (params) {
KLEKI.isInDialog++;

var target = params.target;
var callback = params.callback;
var buttons = params.buttons;
var type = params.type;
var div = document.createElement("div");
div.className = 'g-root';
div.id = "popup";
div.style.cursor = "default";
var destructed = false;
BV.css(div, {
width: "100%",
height: "100%",
position: "absolute",
left: 0,
top: 0
});
div.onclick = BV.handleClick;

BV.addEventListener(div, 'wheel', function(event) {
event.preventDefault();
});

var autoFocusArr = [];
if(params.autoFocus) {
autoFocusArr = [params.autoFocus];
} else if(params.autoFocus === false) {
autoFocusArr = [];
} else {
autoFocusArr = ['Ok', 'Yes', 'Upload'];
}


var closingLayer = document.createElement("div");
BV.css(closingLayer, {
width: "100%",
height: "100%",
position: "fixed",
left: 0,
top: 0
});
div.appendChild(closingLayer);

var cell = document.createElement("div");
cell.id = "cell";
div.appendChild(cell);
var content = document.createElement("div");
content.style.position = "relative";
content.className = 'popup-content';

function closePopup(result) {
if(destructed) {
return;
}
KLEKI.isInDialog--;
BV.clearSelection();
target.removeChild(div);
callback(result);
keyListener.destroy();
BV.removeEventListener(closingLayer, "click", onClosingLayerClick);
destructed = true;
document.body.style.overflow = "";
}

function onClosingLayerClick() {
closePopup("Cancel");
}
BV.addEventListener(closingLayer, "click", onClosingLayerClick);


var xButton = document.createElement("div");
xButton.className = 'dialog-closebtn';
if (navigator.appName === 'Microsoft Internet Explorer') {
xButton.textContent = "X";
} else {
xButton.textContent = "╳";
}
xButton.title = "Close";
xButton.onclick = function () {
closePopup("Cancel");
};
content.appendChild(xButton);


cell.appendChild(content);
target.appendChild(div);
var message = document.createElement("div");
content.appendChild(message);
if (params.div) {
content.appendChild(params.div);
if(params.buttons) {
params.div.style.marginBottom = "20px";
}
}
if (!params.message) {
} else if (typeof params.message === 'string') {
message.innerHTML = params.message;
} else {
message.appendChild(params.message);
}
message.style.marginRight = "15px";
message.style.marginBottom = "10px";
var buttonWrapper = document.createElement("div");
buttonWrapper.style.textAlign = 'right';
var clickOnEnterButton = null;
var addbutton = function (label, i) {
var button = document.createElement("button");

button.style.minWidth = "80px";
button.style.display = "inline-block";
button.style.marginLeft = "8px";
if (label === "Ok") {
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/check.png"/>' + label;
} else if (label === "Cancel") {
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/cancel.png"/>' + label;
} else if (label === "Upload") {
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/upload-confirm.png"/>' + label;
} else {
button.innerHTML = label;
}
buttonWrapper.appendChild(button);

button.onclick = function () {
closePopup(label);
};

if(autoFocusArr.includes(label)) {
setTimeout(function () {
button.focus();
}, 10);
}

if(label === params.clickOnEnter) {
clickOnEnterButton = button;
}
};
/*for (var i = params.buttons.length - 1; i >= 0; i--) {
addbutton(params.buttons[i], i);
}*/
if(params.buttons) {
for (var i = 0; i < params.buttons.length; i++) {
addbutton(params.buttons[i], i);
}
content.appendChild(buttonWrapper);
}

content.appendChild(BV.el({
css: {
clear: 'both'
}
}));

let keyListener = new BV.KeyListener({
onDown: function(keyStr, e, comboStr) {
if (destructed) {
return;
}
if(comboStr === 'enter') {
setTimeout(function() {
if(clickOnEnterButton !== null) {
e.stopPropagation();
clickOnEnterButton.click();
}
}, 10);
}
if (comboStr === 'esc') {
e.stopPropagation();
closePopup("Cancel");
}
}
});

if (type === "error") {
BV.addClassName(content, 'poperror');
}
if (type === "ok") {
BV.addClassName(content, 'popok');
}
if (type === "warning") {
BV.addClassName(content, 'popwarning');
}
if (type === "upload") {
BV.addClassName(content, 'popupload');
}
if (type === "trash") {
BV.addClassName(content, 'poptrash');
}
if (!type) {
BV.addClassName(content, 'popdefault');
}
if (params.style) {
BV.css(content, params.style);
}
/*content.onclick = function() {
		target.removeChild(div);
	}*/
if (params.closefunc) {
params.closefunc(function () {
closePopup("Cancel");
});
}

};


/**
* popups that fill whole height, with some padding.
* currently only used for iframe popups.
*
* p = {
*      title: DOM Element | string,
*      icon: 'ok',
*      content: DOM Element,
*      buttonArr: [
*          'Ok',
*          'Cancel'
*      ],
*      autoFocus: string | false,
*      clickOnEnter: string,
*      onClose: function(result: string),
*
*     
*      width: 500,
*      isMaxHeight: boolean
* }
*
* @param p
* @constructor
*/
BV.Popup = function(p) {
KLEKI.isInDialog++;
let parent = document.body;
let div = BV.el({
parent: parent,
className: 'g-root',
css: {
position: 'fixed',
left: 0,
top: 0,
bottom: 0,
right: 0,
background: 'rgba(0, 0, 0, 0.45)',
overflow: 'auto',
animationName: 'consoleIn',
animationDuration: '0.3s',
animationTimingFunction: 'ease-out'
}
});
div.onclick = BV.handleClick;

let updateInterval;

function close() {
KLEKI.isInDialog--;
parent.removeChild(div);
clearInterval(updateInterval);
window.removeEventListener('resize', updatePos);
keyListener.destroy();
if(p.onClose) {
p.onClose();
}
}


let bgEl = BV.el({
parent: div,
css: {
position: 'absolute',
left: 0,
top: 0,
bottom: 0,
right: 0
},
onClick: close
});


let popupEl = BV.el({
parent: div,
css: {
position: 'absolute',
width: (BV.isCssMinMaxSupported() ?
'min(calc(100% - 40px), ' + (p.width ? p.width : 400) + 'px)' :
(p.width ? p.width : 400) + 'px'),
height: 'calc(100% - 40px)',
background: '#eee',
borderRadius: '10px',
overflow: 'hidden',
boxShadow: 'rgba(0, 0, 0, 0.25) 0px 5px 60px'
}
});


function updatePos() {
let elW = popupEl.offsetWidth;
let elH = popupEl.offsetHeight;

BV.css(popupEl, {
left: Math.max(0, (window.innerWidth - elW) / 2) + 'px',
top: Math.max(20, (window.innerHeight - elH) / 2 - (elH * 0.20)) + 'px'
});
}


updatePos();
window.addEventListener('resize', updatePos);


let titleHeight = 40;
let titleEl = BV.el({
parent: popupEl,
css: {
height: titleHeight + 'px',
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
paddingLeft: (titleHeight / 2) + 'px'
}
});
if(p.title) {
titleEl.appendChild(p.title);
}
let xButton = BV.el({
parent: titleEl,
className: 'popup-x',
content: '╳',
title: 'Close',
onClick: close,
css: {
width: titleHeight + 'px',
height: titleHeight + 'px',
lineHeight: titleHeight + 'px'
}
});

let contentEl = BV.el({
parent: popupEl,
css: {
height: 'calc(100% - ' + titleHeight + 'px)'
}
});
if(p.content) {
contentEl.appendChild(p.content);
}

let keyListener = new BV.KeyListener({
onDown: function(keyStr, e) {
if (keyStr === 'esc') {
e.stopPropagation();
close();
}
}
});



this.close = function() {
close();
};
};


BV.clipboardDialog = function (parent, fullCanvas, cropCallback) {
var boxSize = 22 * 2;
var halfBoxSize = 22;
var div = document.createElement("div");

var topWrapper = BV.el({
content:'Drag to crop<br><b>Right-Click &gt; Copy Image</b>',
css: {
textAlign: 'center'
}
});
div.appendChild(topWrapper);


var cropCopy = new BV.CropCopy({
width: 540,
height: 350,
canvas: fullCanvas
});
BV.css(cropCopy.getEl(), {
marginTop: '10px',
marginLeft: '-20px',
borderTop: '1px solid #bbb',
borderBottom: '1px solid #bbb'
});
div.appendChild(cropCopy.getEl());

var closefunc;
function blur() {
closefunc();
}
BV.addEventListener(window, "blur", blur);
BV.popup({
target: parent,
message: "<b>Copy To Clipboard / Crop</b>",
div: div,
style: {
width: "500px"
},
buttons: ['Apply Crop', 'Close'],
callback: function (result) {
cropCopy.destroy();
BV.removeEventListener(window, "blur", blur);
if(result === 'Apply Crop') {
var rectObj = cropCopy.getRect();
cropCallback({
left: Math.round(-rectObj.x),
right: Math.round(rectObj.x + rectObj.width - fullCanvas.width),
top: Math.round(-rectObj.y),
bottom: Math.round(rectObj.y + rectObj.height - fullCanvas.height)
});
}
},
onEnter: 'Close',
closefunc: function (func) {
closefunc = func;
}
});
};

/*
	DIV - make a div with most stuff
params = {
	parent: someOtherDiv,
	css: {
		width: "500px",
		backgroundColor: "#fff"
	},
	content: "test",
	className: "bla",
	id: "bla"
}
*/
BV.el = function (params) {
var div = document.createElement(params.tagName ? params.tagName : "div");
var arr = [];
if (params.css) {
BV.css(div, params.css);
}
if (!params.content) {
} else if (typeof params.content === typeof "aa") {
div.innerHTML = params.content;
} else if (!params.content[0]) {
div.appendChild(params.content);
} else if (typeof params.content === typeof arr) {
for (var i = 0; i < params.content.length; i++) {
div.appendChild(params.content[i]);
}
}
if(params.textContent) {
div.textContent = params.textContent;
}
if (params.className) {
div.className = params.className;
}
if(params.id) {
div.id = params.id;
}
if(params.parent) {
params.parent.appendChild(div);
}
if('title' in params && params.title !== undefined) {
div.title = params.title;
}
if('onClick' in params) {
BV.addEventListener(div, 'click', params.onClick);
}
if('onChange' in params) {
BV.addEventListener(div, 'change', params.onChange);
}
if('custom' in params) {
let customKeyArr = Object.keys(params.custom);
for(let i = 0; i < customKeyArr.length; i++) {
div.setAttribute(customKeyArr[i], params.custom[customKeyArr[i]]);
}
}
return div;
};

/**
* @param el {elementType: string, childrenArr: []el, ...svg attributes...}
* @returns svg element tree
*/
BV.createSvg = function(el) {
let result = document.createElementNS('http://www.w3.org/2000/svg', el.elementType);
let keyArr = Object.keys(el);
let keyStr;
for(let i = 0; i < keyArr.length; i++) {
keyStr = keyArr[i];
if(keyStr === 'childrenArr') {
for(let e = 0; e < el.childrenArr.length; e++) {
result.appendChild(BV.createSvg(el.childrenArr[e]));
}
} else if(keyStr !== 'elementType') {
result.setAttribute(keyStr, el[keyStr]);
}
}
return result;
};

/**
* CHECKBOX - with label
* params = {
*      init: false,
*      label: "blabla"
*      callback: myfunc(boolean),
*      allowTab: boolean,
*      title?: string
* }
*
* @param params
* @returns {HTMLLabelElement}
*/
BV.checkBox = function (params) {
let div = BV.el({
className: 'bv-checkbox'
});

let innerEl = BV.el({
parent: div,
tagName: 'label',
className: 'bv-checkbox__inner'
});

let check = BV.el({
parent: innerEl,
tagName: 'input',
css: {
marginLeft: "0",
display: "inline-block"
},
custom: {
type: 'checkbox'
}
});
check.checked = params.init;
if(!params.allowTab) {
check.tabIndex = -1;
}

if (params.title) {
innerEl.title = params.title;
}

var label = document.createElement("div");
label.style.display = "inline-block";
label.innerHTML = params.label;
label.allowClick = true;
innerEl.appendChild(label);

check.onchange = function () {
params.callback(check.checked);
setTimeout(function() {
check.blur();
}, 0);
};
if(params.css) {
BV.css(div, params.css);
}

div.getValue = function() {
return check.checked;
};

return div;
};

BV.input = function (params) {
var result = document.createElement('input');
if(params.type) {
try {
result.type = params.type;
} catch(e) {}
}
if(params.min !== undefined) {
result.min = params.min;
}
if(params.max !== undefined) {
result.max = params.max;
}
result.value = params.init;
if(params.callback) {
result.onchange = function() {
params.callback(result.value);
};
}
if(params.css) {
BV.css(result, params.css);
}

return result;
};

/**
* A select dropdown
*
* p = {
*     optionArr: [
*         [value: string, label: string]
*     ],
*     initValue?: string | null,
*     onChange: func(str),
* }
*
* @param p
* @constructor
*/
BV.Select = function(p) {

let selectEl = BV.el({
tagName: 'select',
css: {
cursor: 'pointer',
fontSize: '15px',
padding: '3px'
}
});
if (p.css) {
BV.css(selectEl, p.css);
}
selectEl.tabIndex = -1;
let optionArr = p.optionArr;
for(let i = 0; i < optionArr.length; i++) {
if (optionArr[i] === null) {
continue;
}
let option = document.createElement('option');
option.value = optionArr[i][0];
option.textContent = optionArr[i][1];
selectEl.appendChild(option);
}
selectEl.addEventListener('change', function() {
selectEl.blur();
p.onChange(selectEl.value);
});
selectEl.value = 'initValue' in p ? p.initValue : null;



this.setValue = function(val) {
selectEl.value = val;
};

this.getValue = function() {
return selectEl.value;
};

this.setDeltaValue = function(delta) {
let index = 0;
for (let i = 0; i < optionArr.length; i++) {
if ('' + optionArr[i][0] === selectEl.value) {
index = i;
break;
}
}
index = Math.max(0, Math.min(optionArr.length -1, index + delta));
selectEl.value = optionArr[index][0];
p.onChange(selectEl.value);
};

this.getElement = function() {
return selectEl;
};
};

/**
* to make sliders more finegrained.
* @param deltaY number - how far pointer moved away vertically since down
* @returns {number} the factor 0-1. 0 -> infinite movement for change of 1. 1 -> 1px for change of 1
*/
BV.calcSliderFalloffFactor = function(deltaY, isRightButton) {
let result = Math.min(10, 1 + Math.pow(Math.floor(deltaY / 50), 2));
if(isRightButton) {
result *= 2;
}
return 1 / result;
};

/**
* Toggle button with an image
*
* p = {
*     initValue: boolean,
*     title: string,
*     isRadio: boolean,
*     onChange: function(boolean)
* }
*
* @param p
* @constructor
*/
BV.ImageToggle = function(p) {
let result = {};
let isActive = !!p.initValue;
let div = BV.el({
className: 'image-toggle',
title: p.title,
css: {
backgroundImage: "url('" + p.image + "')"
},
onClick: function(e) {
e.preventDefault();
if (p.isRadio && isActive) {
return;
}
isActive = !isActive;
update();
p.onChange(isActive);
},
});

function update() {
if (isActive) {
BV.addClassName(div, 'image-toggle-active');
} else {
BV.removeClassName(div, 'image-toggle-active');
}
}

update();


this.setValue = function(b) {
isActive = !!b;
update();
};
this.getElement = function() {
return div;
};
this.getValue = function() {
return isActive;
}

};

/**
* Radio input group. each one has an image
*
* p = {
*     optionArr: {
*         id: string,
*         title: string,
*         image: string,
*     }[],
*     initId: string,
*     sizePx: number,
*     onChange: function(id: string): void
* }
*
* @param p
*/
BV.ImageRadioList = function(p) {

var div = BV.el({
className: 'image-radio-wrapper',
css: {
display: 'flex'
}
});

let activeIndex;
let optionArr = [];

function select(index, id) {
activeIndex = index;
for (let i = 0; i < optionArr.length; i++) {
optionArr[i].setValue(i === activeIndex);
}
p.onChange(id);
}

function createOption(index, o) {
if (o.id === p.initId) {
activeIndex = index;
}
let radioEl = new BV.ImageToggle({
image: o.image,
title: o.title,
initValue: o.id === p.initId,
isRadio: true,
onChange: function(b) {
select(index, o.id);
}
});
div.appendChild(radioEl.getElement());

return radioEl;

}

for (let i = 0; i < p.optionArr.length; i++) {
optionArr.push(createOption(i, p.optionArr[i]));
}



this.getElement = function() {
return div;
};
this.getValue = function() {
return p.optionArr[activeIndex].id;
};
};

/**
* small toggle button with a pen icon - representing toggling pressure sensitivity
* @param isChecked - boolean - initial value
* @param changeCallback - function(isChecked boolean) - called on change
* @returns {HTMLElement} - the toggle button
*/
BV.penPressureToggle = function(isChecked, changeCallback) {

var toggleDiv = BV.el({
css: {
float: 'right',
marginTop: '8px',
borderRadius: '3px',
width: "15px",
height: "15px",
backgroundImage: 'url("0-4-15--176eb290fdd/img/ui/brush-pressure.png")',
backgroundSize: 'contain',
backgroundRepeat: 'no-repeat',
cursor: 'pointer',
boxSizing: 'border-box'
}
});

if(!BV.hasPointerEvents()) {
toggleDiv.style.display = 'none';
}

function redraw() {
if(isChecked) {
BV.css(toggleDiv, {
backgroundColor: '#fff',
opacity: 0.9,
border: '1px solid var(--active-highlight-color)'
});
} else {
BV.css(toggleDiv, {
backgroundColor: 'transparent',
opacity: 0.5,
border: '1px solid #777'
});
}
}

toggleDiv.title = 'Toggle Pressure Sensitivity';
toggleDiv.onclick = function() {
isChecked = !isChecked;
redraw();
changeCallback(isChecked);
};

redraw();
changeCallback(isChecked);

return toggleDiv;
};


/**
* big slider, e.g. used for brush size
*
* p = {
*      label: 'Size',
*      width: 500,
*      height: 20,
*      theme: 'compact-light',
*      min: 0,
*      max: 100,
*      initValue: 10,
*      resolution: 600,
*      curve: 'quadratic' | [...],
*      formatFunc: function(value) {
*          return Math.round(value);
*      },
*      onChange: function(value) {},
*      isChangeOnFinal: true,
*      eventResMs: 123
* }
*
* Values can be spline interpolated
* On change callback can be debounced
*
* @param p - obj
* @constructor
*/
BV.PcSlider = function (p) {
let isDisabled = false;
let useSpline = !!p.curve;
let splineInterpolator;

if (!p.label || !p.onChange) {
throw 'PcSlider missing params';
}
if (p.min != 0 && p.max != 0 && p.initValue != 0) {
if (!p.min || !p.max || !p.initValue) {
throw 'PcSlider broken params';
}
}
if (p.min >= p.max) {
throw 'PcSlider broken params';
}

let elementWidth = p.width;
let elementHeight = p.height;
let resolution = p.resolution ? p.resolution : elementWidth;
let min = p.min;
let max = p.max;
let onChange = p.onChange;
let isChangeOnFinal = !!p.isChangeOnFinal;
let formatFunc = p.formatFunc;
let eventResMs = p.eventResMs;

if (useSpline) {
let curveArr = p.curve === 'quadratic' ? BV.quadraticSplineInput(min, max, 0.1) : p.curve;
splineInterpolator = new BV.SplineInterpolator(curveArr);
}

function toLinearValue(value) {
if (useSpline) {
return splineInterpolator.findX(value, Math.floor(resolution * 1.5));
}
return (value - min) / (max - min);
}

function toValue(pLinearValue) {
let result = min + pLinearValue * (max - min);
if (useSpline) {
result = splineInterpolator.interpolate(pLinearValue);
}
return result;
}

var div = BV.el({
className: 'sliderWrapper',
css: {
overflow: "hidden",
position: "relative",
width: elementWidth + "px",
height: elementHeight + "px",
userSelect: "none"
}
});
var labelCaption = p.label;
var label = document.createElement("div");
var control = document.createElement("div");
var controlInner = document.createElement("div");
var linearValue = toLinearValue(p.initValue);
var hover = false;

div.appendChild(control);
div.appendChild(label);
control.appendChild(controlInner);
control.className = "sliderInner";


div.oncontextmenu = function () {
return false;
};

label.innerHTML = labelCaption;

control.style.position = "absolute";
control.style.left = 0;
control.style.top = 0;
control.style.width = (linearValue * elementWidth) + "px";
control.style.height = elementHeight + "px";

let labelFontSize = elementHeight - 14;
BV.css(label, {
position: 'absolute',
left: '7px',
top: (elementHeight / 2 - labelFontSize / 2 + 1) + 'px',
lineHeight: labelFontSize + 'px',
fontSize: labelFontSize + 'px',
pointerEvents: 'none'
});

function getOutsideVal() {
var result = min + linearValue * (max - min);
if (useSpline) {
result = splineInterpolator.interpolate(linearValue);
}
return result;
}

function updateLabel() {
var outVal = toValue(linearValue);
outVal = formatFunc ? formatFunc(outVal) : parseInt(outVal);
label.innerHTML = labelCaption + "&nbsp;&nbsp;<span style=\"font-weight:bold\">" + outVal + "</span>";
control.style.width = (linearValue * elementWidth) + "px";
}

var lastCallbackTime = 0;
function emit(isFinal) {
if(!isFinal && isChangeOnFinal) {
return;
}
if(eventResMs && !isFinal) {
var now = performance.now();
if(now - lastCallbackTime >= eventResMs) {
lastCallbackTime = now;
onChange(getOutsideVal(linearValue));
}
} else {
onChange(getOutsideVal(linearValue));
}
}

let virtualVal;
function onPointer(event) {
if (isDisabled) {
return;
}

if(event.type === 'pointerdown') {
div.className = "sliderWrapper sliderWrapperActive";

if(event.button === 'left') {
linearValue = event.relX / elementWidth;
linearValue = Math.max(0, Math.min(1, linearValue));
updateLabel();
emit(false);
}
virtualVal = linearValue;
}

if(event.type === 'pointermove' && ['left', 'right'].includes(event.button)) {

let deltaX = event.dX;
let deltaY = Math.abs(event.pageY - event.downPageY);
let factor = BV.calcSliderFalloffFactor(deltaY, event.button === 'right');
deltaX *= factor;
deltaX /= elementWidth;

virtualVal += deltaX;
linearValue = Math.max(0, Math.min(1, virtualVal));

updateLabel();
emit(false);
}

if(event.type === 'pointerup') {
div.className = "sliderWrapper";
emit(true);
}

}

let pointerListener;
setTimeout(function() {
pointerListener = new BV.PointerListener({
target: div,
maxPointers: 1,
onPointer: onPointer,
onWheel: function(event) {
if (useSpline) {
linearValue += -event.deltaY * (splineInterpolator.getLastX() - splineInterpolator.getFirstX()) / 40;
linearValue = Math.max(splineInterpolator.getFirstX(), Math.min(splineInterpolator.getLastX(), linearValue));
} else {
linearValue += -event.deltaY / 40;
linearValue = Math.max(0, Math.min(1, linearValue));
}
updateLabel();
onChange(getOutsideVal(linearValue));
}
});
updateLabel();
}, 1);



this.increaseValue = function (f) {
linearValue = Math.min(1, linearValue + Math.abs(f));
updateLabel();
onChange(getOutsideVal(linearValue));
};
this.decreaseValue = function (f) {
linearValue = Math.max(0, linearValue - Math.abs(f));
updateLabel();
onChange(getOutsideVal(linearValue));
};
this.setValue = function(v) {
linearValue = toLinearValue(v);
updateLabel();
};
this.getValue = function () {
return getOutsideVal(linearValue);
};
/**
* @param config {min: number, max: number, curve: []} curve optional
*/
this.update = function(config) {
min = config.min;
max = config.max;
useSpline = !!config.curve;
if (useSpline) {
let curveArr = config.curve === 'quadratic' ? BV.quadraticSplineInput(min, max, 0.1) : config.curve;
splineInterpolator = new BV.SplineInterpolator(curveArr);
} else {
splineInterpolator = null;
}
};
this.disable = function () {
isDisabled = true;
};

this.destroy = function() {
pointerListener.destroy();
};

this.getElement = function() {
return div;
}

};

/**
* dialog for manually inputting the color
* @param p {color: rgbObj, onClose: function(rgbObj | null)}
* @constructor
*/
BV.HexColorDialog = function (p) {

let lastValidRgb = new BV.RGB(p.color.r, p.color.g, p.color.b);

let div = BV.el({});

let previewEl = BV.el({
css: {
width: '20px',
height: '20px',
marginBottom: '10px',
boxShadow: 'inset 0 0 0 1px #fff, 0 0 0 1px #000',
background: '#' + BV.ColorConverter.toHexString(lastValidRgb)
}
});
div.appendChild(previewEl);



let hexRowEl = BV.el({
css: {
display: 'flex',
alignItems: 'center',
marginBottom: '15px'
}
});
let hexLabel = BV.el({
content: 'Hex',
css: {
width: '50px'
}
});
let hexInput = BV.input({
init: '#' + BV.ColorConverter.toHexString(lastValidRgb),
css: {
width: '80px'
},
callback: function() {
let rgbObj = BV.ColorConverter.hexToRGB(hexInput.value);
if(rgbObj === null) {
rgbObj = lastValidRgb;
hexInput.value = '#' + BV.ColorConverter.toHexString(lastValidRgb);
} else {
lastValidRgb = rgbObj;
}
previewEl.style.background = '#' + BV.ColorConverter.toHexString(rgbObj);

for(let i = 0; i < rgbArr.length; i++) {
rgbArr[i].update();
}
}
});
let copyButton = BV.el({
tagName: 'button',
content: 'Copy',
css: {
marginLeft: '10px'
},
onClick: function() {
hexInput.select();
document.execCommand('copy');
}
});
hexRowEl.appendChild(hexLabel);
hexRowEl.appendChild(hexInput);
hexRowEl.appendChild(copyButton);
div.appendChild(hexRowEl);
setTimeout(function () {
hexInput.focus();
hexInput.select();
}, 0);



function createRgbInputRow(labelStr, attributeStr) {
let result = {};

let rowEl = BV.el({
css: {
display: 'flex',
alignItems: 'center',
marginTop: '5px',
}
});
let labelEl = BV.el({
content: labelStr,
css: {
width: '50px'
}
});

let inputEl = BV.input({
init: lastValidRgb[attributeStr],
min: 0,
max: 255,
type: 'number',
css: {
width: '80px'
},
callback: function() {
if(inputEl.value === '' || inputEl.value < 0 || inputEl.value > 255) {
result.update();
return;
}
inputEl.value = Math.round(inputEl.value);
lastValidRgb[attributeStr] = inputEl.value;
previewEl.style.background = '#' + BV.ColorConverter.toHexString(lastValidRgb);
hexInput.value = '#' + BV.ColorConverter.toHexString(lastValidRgb);
}
});

rowEl.appendChild(labelEl);
rowEl.appendChild(inputEl);
div.appendChild(rowEl);


result.update = function() {
inputEl.value = lastValidRgb[attributeStr];
};
return result;
}
let rgbArr = [];
rgbArr.push(createRgbInputRow('Red', 'r'));
rgbArr.push(createRgbInputRow('Green', 'g'));
rgbArr.push(createRgbInputRow('Blue', 'b'));


let popup = BV.popup({
target: document.body,
message: '<b>Manual Color Input</b>',
div: div,
autoFocus: false,
clickOnEnter: 'Ok',
buttons: ['Ok', 'Cancel'],
callback: function (resultStr) {
let rgbObj = null;
if (resultStr === 'Ok') {
rgbObj = BV.ColorConverter.hexToRGB(hexInput.value);
}
p.onClose(rgbObj);
}
});

};

/**
* big main HS+V color slider in kleki
* 2 elements: slider, and colorpreview(output) + eyedropper
*
* p = {
*     width: number,
*     height: number,
*     svHeight: number,
*     startValue: rgb,
*     onPick: function(rgb)
* }
*
* @param p
* @constructor
*/
BV.PcColorSlider = function (p) {

let _this = this;
let pickCallback = function() {};
var div = document.createElement("div");
div.style.position = "relative";
div.className = "colorSlider";
let outputDiv = BV.el({
css: {
display: 'flex',
alignItems: 'center'
}
});
var width = p.width;
var svHeight = p.svHeight;
var height = p.height;
var emitColor = p.onPick;
let colorRGB = {
r: parseInt(p.startValue.r, 10),
g: parseInt(p.startValue.g, 10),
b: parseInt(p.startValue.b, 10)
};
var color = BV.ColorConverter.toHSV(p.startValue);
let secondColorRGB = {r: 255, g: 255, b: 255};
let secondColor = BV.ColorConverter._RGBtoHSV(secondColorRGB);

let svWrapper = BV.el({});
let svSvg = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"> <defs> <linearGradient id="value" gradientTransform="rotate(90)"> <stop offset="0" stop-color="rgba(0,0,0,0)"/> <stop offset="100%" stop-color="rgba(0,0,0,1)"/> </linearGradient> <linearGradient id="hue" gradientTransform="rotate(0)"> <stop offset="0" stop-color="#fff"/> <stop id="hue-stop" offset="100%" stop-color="#f00"/> </linearGradient> </defs> <rect x="0" y="0" width="100" height="100" fill="url(\'#hue\')"/> <rect x="0" y="0" width="100" height="100" fill="url(\'#value\')"/></svg>', 'image/svg+xml').documentElement;
let hueStop = svSvg.getElementById('hue-stop');
BV.setAttributes(hueStop, {
'stop-color': '#f0f'
});
BV.css(svSvg, {
width: width + 'px',
height: svHeight + 'px'
});
svWrapper.appendChild(svSvg);

var divH = document.createElement("div");
BV.css(divH, {
position: 'relative',
height: height + 'px'
});
var divPreview = document.createElement("div");
var controlH = document.createElement("div");

var enabled = true;

function createHueBg(targetEl) {
var im = new Image();
BV.css(im, {
position: 'absolute',
left: 0,
top: 0,
display: 'none',
pointerEvents: 'none'
});
var cv = BV.createCanvas();
cv.width = width;
cv.height = height;
var ctx = cv.getContext("2d");
var gradH = ctx.createLinearGradient(0, 0, width, 0);
for (var i = 0; i < 1; i += 0.01) {
var col = BV.ColorConverter.toRGB(new BV.HSV(i * 360, 100, 100));
var ha = (parseInt(col.r)).toString(16);
var hb = (parseInt(col.g)).toString(16);
var hc = (parseInt(col.b)).toString(16);
if (ha.length === 1)
ha = "0" + ha;
if (hb.length === 1)
hb = "0" + hb;
if (hc.length === 1)
hc = "0" + hc;
gradH.addColorStop(i, '#' + ha + hb + hc);
}
ctx.fillStyle = gradH;
ctx.fillRect(0, 0, width, height);

targetEl.appendChild(im);
im.alt = 'hue';
im.src = cv.toDataURL("image/png");
im.style.display = 'block';
}


function updateSVCanvas() {
let rgb = BV.ColorConverter.toRGB(new BV.HSV(color.h, 100, 100));
BV.setAttributes(hueStop, {
'stop-color': '#' + BV.ColorConverter.toHexString(rgb)
});
}

function updateSVPointer() {

var left = color.s / 100 * width - 7;
var top = (1 - color.v / 100) * svHeight - 6;
BV.css(pointerSV, {
left: left + "px",
top: top + "px"
});
}

function setColPreview() {
divPreview.style.backgroundColor = "rgb(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ")";

if (BV.testIsWhiteBestContrast(colorRGB)) {
BV.css(pickerButton, {
filter: 'invert(1)'
});
BV.css(hexButton, {
filter: 'invert(1)'
});
} else{
BV.css(pickerButton, {
filter: ''
});
BV.css(hexButton, {
filter: ''
});
}

}

updateSVCanvas();
div.style.width = width + "px";
div.oncontextmenu = function () {
return false;
};

var SVContainer = document.createElement("div");
BV.css(SVContainer, {
width: width + "px",
height: svHeight + "px",
overflow: "hidden",
display: "block",
position: "relative",
cursor: "crosshair",
boxShadow: "rgb(188, 188, 188) 0 0 0 1px"
});

var pointerSV = document.createElement("div");
BV.css(pointerSV, {
width: "12px",
height: "12px",
borderRadius: "6px",
position: "absolute",
pointerEvents: "none",
boxShadow: "0px 0px 0 1px #000, inset 0px 0px 0 1px #fff"
});

SVContainer.appendChild(svWrapper);
SVContainer.appendChild(pointerSV);
updateSVPointer();
div.appendChild(SVContainer);
div.appendChild(divH);
outputDiv.appendChild(divPreview);
BV.css(divPreview, {
display: 'flex',
justifyContent: 'space-between',
width: (height * 2.5) + "px",
height: height + "px",

boxShadow: "rgb(188, 188, 188) 0 0 0 1px"
});

BV.css(divH, {
overflow: "hidden",
position: "relative",
width: width + "px",
height: height + "px",
cursor: "ew-resize",
boxShadow: "rgb(188, 188, 188) 0 0 0 1px",
marginTop: "1px",
marginBottom: "1px"
});


BV.css(controlH, {
width: '1px',
height: height + 'px',
background: '#000',
borderLeft: '1px solid #fff',
position: 'absolute',
top: 0,
left: parseInt(color.h / 360 * width - 1) + "px"
});


let virtualHSV = {
h: 0,
s: 0,
v: 0
};
let svPointerListener;
let hPointerListener;


var pickerButton = BV.el({
title: 'Eyedropper',
className: 'color-picker-preview-button',
css: {
width: "30px",
height: "30px",
backgroundImage: 'url(0-4-15--176eb290fdd/img/ui/tool-picker.png)',
backgroundRepeat:  'no-repeat',
backgroundSize: '70%',
backgroundPosition: 'center'
}
});
var isPicking = false;


pickerButton.onclick = function () {
if (isPicking === false) {
BV.removeClassName(pickerButton, 'color-picker-preview-button-hover');
BV.addClassName(pickerButton, 'color-picker-preview-button-active');
isPicking = true;
pickCallback(true);
} else {
pickCallback(false);
_this.pickingDone();
}
};
let pickerButtonPointerListener = new BV.PointerListener({
target: pickerButton,
onEnterLeave: function(isOver) {
if(isPicking) {
return;
}
if(isOver) {
BV.addClassName(pickerButton, 'color-picker-preview-button-hover');
} else {
BV.removeClassName(pickerButton, 'color-picker-preview-button-hover');
}
}
});
divPreview.appendChild(pickerButton);


let hexButton = BV.el({
content: '#',
className: 'color-picker-preview-button',
title: 'Manual Color Input',
css: {
height: '100%',
width: height + 'px',
lineHeight: height + 'px',
fontSize: (height * 0.65) + 'px'
},
onClick: function() {
BV.HexColorDialog({
color: BV.ColorConverter.toRGB(color),
onClose: function(rgbObj) {
if(!rgbObj) {
return;
}
_this.setColor(rgbObj);
emitColor(BV.ColorConverter.toRGB(color));
}
});
}
});
let hexButtonPointerListener = new BV.PointerListener({
target: hexButton,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(hexButton, 'color-picker-preview-button-hover');
} else {
BV.removeClassName(hexButton, 'color-picker-preview-button-hover');
}
}
});
divPreview.appendChild(hexButton);

setColPreview();


setTimeout(function() {
createHueBg(divH);
divH.appendChild(controlH);
svPointerListener = new BV.PointerListener({
target: svWrapper,
maxPointers: 1,
onPointer: function(event) {
if(event.type === 'pointerdown') {
BV.css(SVContainer, {
boxShadow: "0px 0px 0px 1px rgb(255,255,255)",
zIndex: 1
});

if(event.button === 'left') {

virtualHSV.s = event.relX / width * 100;
virtualHSV.v = 100 - event.relY / svHeight * 100;

color = new BV.HSV(color.h, virtualHSV.s, virtualHSV.v);
colorRGB = BV.ColorConverter.toRGB(color);

updateSVPointer();
setColPreview();
emitColor(BV.ColorConverter.toRGB(color));
} else {
virtualHSV.s = color.s;
virtualHSV.v = color.v;
}
}

if(event.type === 'pointermove' && ['left', 'right'].includes(event.button)) {

let factor = 1;
if(event.button === 'right') {
factor = 0.5;
}

virtualHSV.s += event.dX / width * 100 * factor;
virtualHSV.v -= event.dY / svHeight * 100 * factor;

color = new BV.HSV(color.h, virtualHSV.s, virtualHSV.v);
colorRGB = BV.ColorConverter.toRGB(color);
updateSVPointer();
setColPreview();
emitColor(BV.ColorConverter.toRGB(color));

}

if(event.type === 'pointerup') {
BV.css(SVContainer, {
boxShadow: "0 0 0 1px rgb(188, 188, 188)",
zIndex: 0
});
}

}
});
hPointerListener = new BV.PointerListener({
target: divH,
maxPointers: 1,
onPointer: function(event) {

if(event.type === 'pointerdown') {
BV.css(divH, {
boxShadow: "0px 0px 0px 1px rgba(255,255,255,1)"
});

if(event.button === 'left') {

virtualHSV.h = event.relX / width * 359.99;

color = new BV.HSV(virtualHSV.h, color.s, color.v);
colorRGB = BV.ColorConverter.toRGB(color);
controlH.style.left = (Math.round(color.h / 359.99 * width) - 1) + "px";
updateSVCanvas();
setColPreview();
emitColor(BV.ColorConverter.toRGB(color));
} else {
virtualHSV.h = color.h;
}
}

if(event.type === 'pointermove' && ['left', 'right'].includes(event.button)) {

let deltaY = Math.abs(event.pageY - event.downPageY);
let factor = BV.calcSliderFalloffFactor(deltaY, event.button === 'right');

virtualHSV.h += event.dX / width * 359.99 * factor;

if(event.button === 'right') {
virtualHSV.h = virtualHSV.h % 359.99;
if (virtualHSV.h < 0) {
virtualHSV.h += 359.99;
}
}
virtualHSV.h = Math.min(359.99, virtualHSV.h);
color = new BV.HSV(virtualHSV.h, color.s, color.v);
colorRGB = BV.ColorConverter.toRGB(color);
controlH.style.left = (Math.round(color.h / 359.99 * width) - 1) + "px";
updateSVCanvas();
setColPreview();
emitColor(BV.ColorConverter.toRGB(color));

}

if(event.type === 'pointerup') {
BV.css(divH, {
boxShadow: "rgb(188, 188, 188) 0 0 0 1px"
});
}
}
});
}, 1);




let secondColorBtn = BV.el({
parent: outputDiv,
title: 'Secondary Color [X]',
css: {
cursor: 'pointer',
marginLeft: '5px',
width: '22px',
height: '22px',
boxShadow: 'rgb(188, 188, 188) 0px 0px 0px 1px'
},
onClick: function(e) {
e.preventDefault();
swapColors();
}
});
function updateSecondColor() {
secondColorBtn.style.backgroundColor = BV.ColorConverter.toRgbStr(secondColorRGB);
}
function swapColors() {

let tmp = secondColor;
secondColor = color;
color = tmp;

tmp = secondColorRGB;
secondColorRGB = colorRGB;
colorRGB = tmp;

controlH.style.left = parseInt(color.h / 359 * width - 1) + "px";
updateSVCanvas();
updateSVPointer();
setColPreview();
updateSecondColor();

emitColor(BV.ColorConverter.toRGB(color));
}
updateSecondColor();





this.setColor = function (c) {
colorRGB = {r: parseInt(c.r, 10), g: parseInt(c.g, 10), b: parseInt(c.b, 10)};
color = BV.ColorConverter.toHSV(c);
controlH.style.left = parseInt(color.h / 359 * width - 1) + "px";
updateSVCanvas();
updateSVPointer();
setColPreview();
};

this.getColor = function () {
return BV.ColorConverter.toRGB(color);
};

this.setPickCallback = function (func) {
pickCallback = func;
};

this.pickingDone = function () {
if(!isPicking) {
return;
}
isPicking = false;
BV.removeClassName(pickerButton, 'color-picker-preview-button-active');
};

this.enable = function (e) {
if (e) {
div.style.pointerEvents = "";
div.style.opacity = "1";
outputDiv.style.pointerEvents = "";
outputDiv.style.opacity = "1";
} else {
div.style.pointerEvents = "none";
div.style.opacity = "0.5";
outputDiv.style.pointerEvents = "none";
outputDiv.style.opacity = "0.5";
}
};

this.setHeight = function (h) {
h = parseInt(h - height * 2 - 3, 10);
if (h === svHeight) {
return;
}
svHeight = h;
BV.css(svSvg, {
width: width + 'px',
height: svHeight + 'px'
});
SVContainer.style.height = svHeight + "px";
updateSVPointer();
};

this.swapColors = function() {
swapColors();
};

this.getSecondaryRGB = function() {
return BV.ColorConverter._HSVtoRGB(secondColor);
};

this.getElement = function() {
return div;
};

this.getOutputElement = function() {
return outputDiv;
}

};

/*
a small color slider
params {
	width: 200,
	heightSV: 200,
	heightH: 10,
	color: {r,g,b}
	callback: function(c){}
}
*/
BV.PcSmallColorSlider = function (params) {
let _this = this;
var div = document.createElement("div");
div.oncontextmenu = function(e) {
e.preventDefault();
};
var color = BV.ColorConverter.toHSV(new BV.RGB(params.color.r, params.color.g, params.color.b));
BV.css(div, {
width: params.width + "px",
position: "relative",
overflow: "hidden",
userSelect: 'none'
});

var canvasSV = BV.createCanvas();
canvasSV.width = 10;
canvasSV.height = 10;
canvasSV.style.width = params.width + "px";
canvasSV.style.height = params.heightSV + "px";
canvasSV.style.cursor = "crosshair";

function updateSV() {
var ctx = canvasSV.getContext("2d");
for (var i = 0; i < canvasSV.height; i += 1) {
var gradient1 = ctx.createLinearGradient(0, 0, canvasSV.width, 0);

var colleft = BV.ColorConverter.toRGB(new BV.HSV(color.h, 1, 100 - (i / canvasSV.height * 100.0)));
var colright = BV.ColorConverter.toRGB(new BV.HSV(color.h, 100, 100 - (i / canvasSV.height * 100.0)));
gradient1.addColorStop(0, '#' + BV.ColorConverter.toHexString(colleft));
gradient1.addColorStop(1, '#' + BV.ColorConverter.toHexString(colright));
ctx.fillStyle = "#ff0000";
ctx.fillStyle = gradient1;
ctx.fillRect(0, i, canvasSV.width, 1);
}
}

updateSV();

var canvasH = BV.createCanvas();
canvasH.width = params.width;
canvasH.height = params.heightH;
canvasH.style.cursor = "ew-resize";
(function () {
var ctx = canvasH.getContext("2d");

var gradH = ctx.createLinearGradient(0, 0, params.width, 0);
for (var i = 0; i < 1; i += 0.01) {
var col = BV.ColorConverter.toRGB(new BV.HSV(i * 360, 100, 100));
gradH.addColorStop(i, "rgba(" + parseInt(col.r) + ", " + parseInt(col.g) + ", " + parseInt(col.b) + ", 1)");
}
ctx.fillStyle = gradH;
ctx.fillRect(0, 0, params.width, params.heightH);

})();
BV.css(canvasSV, {
width: params.width + "px",
height: params.heightSV + "px",
overflow: "hidden",
position: "relative"
});
canvasSV.style.cssFloat = "left";
canvasH.style.cssFloat = "left";

div.appendChild(canvasSV);
div.appendChild(canvasH);

var pointerSV = document.createElement("div");
BV.css(pointerSV, {
width: "8px",
height: "8px",
borderRadius: "8px",
position: "absolute",
pointerEvents: "none",
boxShadow: "0 0 0 1px #000, inset 0 0 0 1px #fff"
});
div.appendChild(pointerSV);

var pointerH = document.createElement("div");
BV.css(pointerH, {
width: 0,
height: params.heightH + "px",
borderLeft: "1px solid #fff",
borderRight: "1px solid #000",
position: "absolute",
top: params.heightSV + "px",
pointerEvents: "none"
});
div.appendChild(pointerH);


function updateSVPointer() {
var left = color.s / 100 * params.width - 4;
var top = (1 - color.v / 100) * params.heightSV - 4;
BV.css(pointerSV, {
left: left + "px",
top: top + "px"
});
/*if(top < params.heightSV/3) {
			pointerSV.style.border = "1px solid rgba(0,0,0,1)";
		} else {
			pointerSV.style.border = "1px solid rgba(255,255,255,1)";
		}*/
}

function updateHPointer() {
pointerH.style.left = (color.h / 359.999 * params.width - 1) + "px";
}

updateSVPointer();
updateHPointer();

let virtualHSV = {
h: 0,
s: 0,
v: 0
};

let svPointerId = null;
let svPointerListener = new BV.PointerListener({
target: canvasSV,
maxPointers: 1,
onPointer: function(event) {

if(event.type === 'pointerdown') {
svPointerId = event.pointerId;
if(event.button === 'left') {

virtualHSV.s = event.relX / params.width * 100;
virtualHSV.v = 100 - event.relY / params.heightSV * 100;

color = new BV.HSV(color.h, virtualHSV.s, virtualHSV.v);

updateSVPointer();
params.callback(BV.ColorConverter.toRGB(color));
} else {
virtualHSV.s = color.s;
virtualHSV.v = color.v;
}
}

if(event.type === 'pointermove' && ['left', 'right'].includes(event.button) && svPointerId === event.pointerId) {

let factor = 1;
if(event.button === 'right') {
factor = 0.5;
}

virtualHSV.s += event.dX / params.width * 100 * factor;
virtualHSV.v -= event.dY / params.heightSV * 100 * factor;

color = new BV.HSV(color.h, virtualHSV.s, virtualHSV.v);
updateSVPointer();
params.callback(BV.ColorConverter.toRGB(color));

}
if(event.type === 'pointerup') {
svPointerId = null;
}

}
});

let hPointerId = null;
let hPointerListener = new BV.PointerListener({
target: canvasH,
maxPointers: 1,
onPointer: function(event) {

if(event.type === 'pointerdown') {
hPointerId = event.pointerId;
if(event.button === 'left') {

virtualHSV.h = event.relX / params.width * 359.99;

color = new BV.HSV(virtualHSV.h, color.s, color.v);
updateSV();
updateHPointer();
params.callback(BV.ColorConverter.toRGB(color));
} else {
virtualHSV.h = color.h;
}
}

if(event.type === 'pointermove' && ['left', 'right'].includes(event.button) && hPointerId === event.pointerId) {

let deltaY = Math.abs(event.pageY - event.downPageY);
let factor = BV.calcSliderFalloffFactor(deltaY, event.button === 'right');

virtualHSV.h += event.dX / params.width * 359.99 * factor;

if(event.button === 'right') {
virtualHSV.h = virtualHSV.h % 359.99;
if (virtualHSV.h < 0) {
virtualHSV.h += 359.99;
}
}
virtualHSV.h = Math.min(359.99, virtualHSV.h);
color = new BV.HSV(virtualHSV.h, color.s, color.v);
updateSV();
updateHPointer();
params.callback(BV.ColorConverter.toRGB(color));

}
if(event.type === 'pointerup') {
hPointerId = null;
}
}
});


var cleardiv = document.createElement("div");
cleardiv.style.clear = "both";
div.appendChild(cleardiv);


this.setColor = function (c) {
color = BV.ColorConverter.toHSV(new BV.RGB(c.r, c.g, c.b));
updateSV();
updateSVPointer();
updateHPointer();
};
this.getColor = function () {
return BV.ColorConverter.toRGB(color);
};
this.getElement = function() {
return div;
};
this.destroy = function() {
svPointerListener.destroy();
hPointerListener.destroy();
};
this.end = function() {
svPointerId = null;
hPointerId = null;
};

};

/**
* TabMenu deprecated - soon removed
* @param params
* @returns {HTMLDivElement}
* @constructor
*/
BV.TabMenu = function (params) {
var div = document.createElement("div");
var width = params.width;
div.className = params.cssContainer;
BV.css(div, {
width: width + "px",
webkitTapHighlightColor:  'rgba(255, 255, 255, 0)'
});
var currentTabId = 0;
if (params.init) {
currentTabId = params.init;
}

var entries = [];

function updateEntries() {
for (var i = 0; i < entries.length; i++) {
if (params.entries[i].custom) {
continue;
}
if (i === currentTabId) {
entries[i].className = params.cssSelected;
BV.css(entries[i], {
cursor: "default"
});
} else {
entries[i].className = params.css;
BV.css(entries[i], {
cursor: "pointer"
});
}
}
}

var widthSum = 0;
for (var i = 0; i < params.entries.length; i++) {
(function (i) {
if (params.entries[i].custom) {
entries[i] = params.entries[i].content;
entries[i].style.cssFloat = "left";
div.appendChild(entries[i]);
} else {
entries[i] = document.createElement("div");
BV.setEventListener(entries[i], 'onpointerdown', function (e) {
return false;
});
BV.css(entries[i], {
width: (parseInt(width / params.entries.length)) + "px",
textAlign: "center",
cssFloat: "left",
overflow: "hidden",
borderTopLeftRadius: '4px',
borderTopRightRadius: '4px'
});
if(i === params.entries.length - 1) {
entries[i].style.width = width - widthSum + 'px';
} else {
widthSum += parseInt(width / params.entries.length);
}
if (params.entries[i].tooltip) {
entries[i].title = params.entries[i].tooltip;
}
if (params.custom) {
entries[i].style.width = params.entries[i].width + "px";
}
if (params.height) {
entries[i].style.height = params.height + "px";
}
entries[i].innerHTML = params.entries[i].content;
if (params.entries[i].name) {
div.title = params.entries[i].name;
}
entries[i].onclick = function () {
div.show(i);
};
if (i === currentTabId) {
params.entries[i].show();
} else {
params.entries[i].hide();
}
div.appendChild(entries[i]);
}
})(i);
}

div.show = function (i) {
if (i === currentTabId) {
return;
}
if (params.entries[i].keepState) {
params.entries[i].show();
} else {
params.entries[currentTabId].hide();
params.entries[i].show();
currentTabId = i;
updateEntries();
}
};

var clearDiv = document.createElement("div");
clearDiv.style.clear = "both";
updateEntries();
div.appendChild(clearDiv);

return div;
};

BV.pcLayerManager = function (p_canvas, p_func, p_rootDiv) {
var pcCanvas = p_canvas;
var layerElArr = [];
var layerHeight = 35;
var layerSpacing = 0;
var width = 250;
var oldLoggerState;
var updatefunc = p_func;
let uiState = 'right';


var largeThumbDiv = document.createElement("div");
BV.css(largeThumbDiv, {
position: "absolute",
right: "280px",
top: "500px",
background: "#aaa",
boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
pointerEvents: "none",
padding: 0,
border: "1px solid #aaa",
transition: "opacity 0.3s ease-out"
});
BV.createCheckerDataUrl(4, function(url) {
largeThumbDiv.style.backgroundImage = "url(" + url + ")";
});
var largeThumbCanvas = document.createElement("canvas");
largeThumbCanvas.style.display = "block";
largeThumbCanvas.width = 200;
largeThumbCanvas.height = 200;
largeThumbDiv.appendChild(largeThumbCanvas);
var largeThumbTimeout, largeThumbInTimeout;
var largeThumbInDocument = false;


var pcCanvasLayerArr = pcCanvas.getLayers();
var selectedSpotIndex = pcCanvasLayerArr.length - 1;
var div = document.createElement("div");
div.style.marginRight = "10px";
div.style.marginBottom = "10px";
div.style.marginLeft = "10px";
div.style.marginTop = "10px";
div.style.cursor = "default";

var listdiv = document.createElement("div");
BV.css(listdiv, {
width: width + "px",
height: "500px",
position: "relative"

});


function renameLayer(layer) {
var div = document.createElement('div');

var label = BV.el({
content: 'Name:',
css: {
marginRight: '5px'
}
});

var input = document.createElement('input');
input.value = pcCanvas.getLayer(layer).name;

div.appendChild(label);
div.appendChild(input);

setTimeout(function() {
input.focus();
input.select();
}, 10);

BV.popup({
target: p_rootDiv,
message: "<b>Rename Layer</b>",
div: div,
buttons: ['Rename', 'Cancel'],
callback: function (val) {
if (val === "Rename") {

if(input.value === pcCanvas.getLayer(layer).name) {
return;
}
pcCanvas.renameLayer(layer, input.value.replace(/[^\w\s]/gi, ''));
createLayerList();
BV.pcLog.pause();
updatefunc(layer);
BV.pcLog.pause(false);
}
},
clickOnEnter: 'Rename'
});
}


var regularContainer = document.createElement("div");

div.disableButtons = function(){};
div.enableButtons = function(){};
var addnewBtn = document.createElement("button");
var duplicateBtn = document.createElement("button");
var mergeBtn = document.createElement("button");
var removeBtn = document.createElement("button");
var renameBtn = document.createElement("button");

function createButtons() {
var div = document.createElement("div");
function async() {
BV.makeUnfocusable(addnewBtn);
BV.makeUnfocusable(duplicateBtn);
BV.makeUnfocusable(mergeBtn);
BV.makeUnfocusable(removeBtn);
BV.makeUnfocusable(renameBtn);

addnewBtn.style.cssFloat = 'left';
duplicateBtn.style.cssFloat = 'left';
mergeBtn.style.cssFloat = 'left';
removeBtn.style.cssFloat = 'left';
renameBtn.style.cssFloat = 'left';

addnewBtn.title = "New Layer";
duplicateBtn.title = "Duplicate Layer";
removeBtn.title = "Remove Layer";
mergeBtn.title = "Merge with layer below";
renameBtn.title = "Rename layer";

addnewBtn.style.paddingLeft = "5px";
addnewBtn.style.paddingRight = "3px";

removeBtn.style.paddingLeft = "5px";
removeBtn.style.paddingRight = "3px";

duplicateBtn.style.paddingLeft = "5px";
duplicateBtn.style.paddingRight = "3px";

mergeBtn.style.paddingLeft = "5px";
mergeBtn.style.paddingRight = "3px";

renameBtn.style.height = "30px";
renameBtn.style.lineHeight = "20px";

addnewBtn.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/add-layer.png' height='20'/> ";
duplicateBtn.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/duplicate-layer.png' height='20'/> ";
mergeBtn.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/merge-layers.png'/>";
removeBtn.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/remove-layer.png'/> ";
renameBtn.textContent = "Rename";
addnewBtn.style.marginRight = "5px";
removeBtn.style.marginRight = "5px";
duplicateBtn.style.marginRight = "5px";
mergeBtn.style.marginRight = "5px";
div.appendChild(addnewBtn);
div.appendChild(removeBtn);
div.appendChild(duplicateBtn);
div.appendChild(mergeBtn);
div.appendChild(renameBtn);
div.appendChild(BV.el({
css: {
clear: 'both'
}
}));

var clearboth = document.createElement("div");
clearboth.style.clear = "both";
clearboth.style.height = "10px";
div.appendChild(clearboth);


addnewBtn.onclick = function () {
if (pcCanvas.addLayer(selectedSpotIndex) === false) {
return;
}
pcCanvasLayerArr = pcCanvas.getLayers();

if (pcCanvasLayerArr.length === 8) {
addnewBtn.disabled = true;
duplicateBtn.disabled = true;
}
removeBtn.disabled = false;
selectedSpotIndex = selectedSpotIndex + 1;
createLayerList();
BV.pcLog.pause();
updatefunc(selectedSpotIndex);
BV.pcLog.pause(false);
};
duplicateBtn.onclick = function () {
if (pcCanvas.duplicateLayer(selectedSpotIndex) === false) {
return;
}
pcCanvasLayerArr = pcCanvas.getLayers();
if (pcCanvasLayerArr.length === 8) {
addnewBtn.disabled = true;
duplicateBtn.disabled = true;
}
removeBtn.disabled = false;
selectedSpotIndex++;
createLayerList();
BV.pcLog.pause();
updatefunc(selectedSpotIndex);
BV.pcLog.pause(false);
};
removeBtn.onclick = function () {
if (layerElArr.length <= 1) {
return;
}

pcCanvas.removeLayer(selectedSpotIndex);
if (selectedSpotIndex > 0) {
selectedSpotIndex--;
}
pcCanvasLayerArr = pcCanvas.getLayers();
createLayerList();
BV.pcLog.pause();
updatefunc(selectedSpotIndex);
BV.pcLog.pause(false);
if (pcCanvasLayerArr.length === 1) {
removeBtn.disabled = true;
}
if (pcCanvasLayerArr.length < 8) {
addnewBtn.disabled = false;
duplicateBtn.disabled = false;
}
};
mergeBtn.onclick = function () {
if (selectedSpotIndex <= 0) {
return;
}

function mergeDialog(p) {
var div = document.createElement("div");
div.innerHTML = "Merges the selected layer with the one underneath. Select the mix mode:";

let options = new BV.Options({
optionArr: [
{id: p.mixModeStr, label: p.mixModeStr === 'source-over' ? 'normal' : p.mixModeStr},
{id: 'source-in', label: 'source-in'},
{id: 'source-out', label: 'source-out'},
{id: 'source-atop', label: 'source-atop'},
{id: 'destination-in', label: 'destination-in'},
{id: 'destination-out', label: 'destination-out'},
{id: 'destination-atop', label: 'destination-atop'},
{id: 'xor', label: 'xor'}
],
initId: p.mixModeStr,
onChange: function(id) {
update();
},
isSmall: true
});
options.getElement().style.marginTop = '5px';
div.appendChild(options.getElement());

var preview = document.createElement("canvas");
var spacer = document.createElement("div");
spacer.innerHTML = "<br/>";
spacer.style.clear = "both";
div.appendChild(spacer);
div.appendChild(preview);
var thumbDimensions = BV.fitInto(200, 200, p.topCanvas.width, p.topCanvas.height, 1);
preview.width = thumbDimensions.width;
preview.height = thumbDimensions.height;
BV.css(preview, {
display: "block",
marginLeft: "auto",
marginRight: "auto"
});
preview.style.boxShadow = "0 0 3px rgba(0,0,0,0.5)";
BV.createCheckerDataUrl(4, function(url) {
preview.style.backgroundImage = "url(" + url + ")";
});

var alphaCanvas = BV.copyCanvas(preview);
alphaCanvas.getContext("2d").drawImage(p.topCanvas, 0, 0, alphaCanvas.width, alphaCanvas.height);
BV.convertToAlphaChannelCanvas(alphaCanvas);

function update() {
var ctx = preview.getContext("2d");
ctx.save();
ctx.clearRect(0, 0, preview.width, preview.height);
ctx.drawImage(p.bottomCanvas, 0, 0, preview.width, preview.height);

if(options.getValue() === 'as-alpha') {
ctx.globalCompositeOperation = 'destination-in';
ctx.globalAlpha = p.topOpacity;
ctx.drawImage(alphaCanvas, 0, 0, preview.width, preview.height);
} else {
ctx.globalCompositeOperation = options.getValue();
ctx.globalAlpha = p.topOpacity;
ctx.drawImage(p.topCanvas, 0, 0, preview.width, preview.height);
}
ctx.restore();
}

update();


let keyListener = new BV.KeyListener({
onDown: function(keyStr) {
if (keyStr === 'right') {
options.next();
}
if (keyStr === 'left') {
options.previous();
}
}
});

BV.popup({
target: p_rootDiv,
message: "<b>Merge/Mix Layers</b>",
div: div,
buttons: ["Ok", "Cancel"],
callback: function (val) {
keyListener.destroy();
if (val === "Ok") {
p.callback(options.getValue());
}
}
});
}
mergeDialog({
topCanvas: pcCanvasLayerArr[selectedSpotIndex].context.canvas,
bottomCanvas: pcCanvasLayerArr[selectedSpotIndex - 1].context.canvas,
topOpacity: parseFloat(pcCanvas.getLayer(selectedSpotIndex).opacity),
mixModeStr: pcCanvasLayerArr[selectedSpotIndex].mixModeStr,
callback: function (mode) {
pcCanvas.mergeLayers(selectedSpotIndex, selectedSpotIndex - 1, mode);
pcCanvasLayerArr = pcCanvas.getLayers();
selectedSpotIndex--;
if (pcCanvasLayerArr.length === 1) {
removeBtn.disabled = true;
}
if (pcCanvasLayerArr.length < 8) {
addnewBtn.disabled = false;
duplicateBtn.disabled = false;
}
createLayerList();
BV.pcLog.pause();
updatefunc(selectedSpotIndex);
BV.pcLog.pause(false);
}
});
};

renameBtn.onclick = function () {
renameLayer(selectedSpotIndex);
};
}
setTimeout(async, 1);
return div;
}
div.appendChild(createButtons());

let modeWrapper;
let modeSelect;
{
modeWrapper = BV.el({
content: 'Blending&nbsp;',
css: {
fontSize: '15px'
}
});

modeSelect = new BV.Select({
optionArr: [
['source-over', 'normal'],
null,
['darken', 'darken'],
['multiply', 'multiply'],
['color-burn', 'color burn'],
null,
['lighten', 'lighten'],
['screen', 'screen'],
['color-dodge', 'color dodge'],
null,
['overlay', 'overlay'],
['soft-light', 'soft light'],
['hard-light', 'hard light'],
null,
['difference', 'difference'],
['exclusion', 'exclusion'],
null,
['hue', 'hue'],
['saturation', 'saturation'],
['color', 'color'],
['luminosity', 'luminosity']
],
onChange: function(val) {
pcCanvas.setMixMode(selectedSpotIndex, val);
div.update(selectedSpotIndex);
},
css: {
marginBottom: '10px'
}
});

modeWrapper.appendChild(modeSelect.getElement());
div.appendChild(modeWrapper);

}


function createLayerList() {
oldLoggerState = BV.pcLog.getState();
function createLayerEntry(index) {
var layerName = pcCanvas.getLayer(index).name;
var opacity = pcCanvasLayerArr[index].opacity;
var layercanvas = pcCanvasLayerArr[index].context.canvas;

var layer = document.createElement("div");
layer.className = "layerBox";
layerElArr[index] = layer;
layer.posY = ((pcCanvasLayerArr.length - 1) * 35 - index * 35);
BV.css(layer, {
width: "250px",
height: "34px",
backgroundColor: "rgb( 220, 220, 220)",
border: "1px solid #aaa",
position: "absolute",
left: "0 px",
top: layer.posY + "px",
transition: "all 0.1s linear",
borderRadius: "5px",
boxSizing: 'border-box'
});
var innerLayer = document.createElement("div");
BV.css(innerLayer, {
position: "relative"
});

var container1 = document.createElement("div");
BV.css(container1, {
width: "250px",
height: "34px"
});
var container2 = document.createElement("div");
layer.appendChild(innerLayer);
innerLayer.appendChild(container1);
innerLayer.appendChild(container2);

layer.spot = index;


{
layer.thumb = BV.createCanvas();
var thumbDimensions = BV.fitInto(30, 30, layercanvas.width, layercanvas.height, 1);
layer.thumb.width = thumbDimensions.width;
layer.thumb.height = thumbDimensions.height;
var thc = layer.thumb.getContext("2d");
thc.drawImage(layercanvas, 0, 0, layer.thumb.width, layer.thumb.height);
BV.css(layer.thumb, {
position: "absolute",
left: ((32 - layer.thumb.width) / 2) + "px",
top: ((32 - layer.thumb.height) / 2) + "px"
});
BV.createCheckerDataUrl(4, function(url) {
layer.thumb.style.backgroundImage = "url(" + url + ")";
});
}


{
layer.label = document.createElement("div");
layer.lname = layerName;
layer.label.appendChild(document.createTextNode(layer.lname));

BV.css(layer.label, {
position: "absolute",
left: (1 + 32 + 5) + "px",
top: 1 + "px",
fontSize: "13px",
width: "180px",
height: "20px",
overflow: "hidden",
color: "#666"
});

layer.label.ondblclick = function() {
renameLayer(index);
};
}

{
layer.opacityLabel = document.createElement("div");
layer.opacity = opacity;
layer.opacityLabel.appendChild(document.createTextNode(parseInt(layer.opacity * 100) + "%"));

BV.css(layer.opacityLabel, {
position: "absolute",
left: (250 - 1 - 5 - 50) + "px",
top: 1 + "px",
fontSize: "13px",
textAlign: "right",
width: "50px",
color: "#777",
transition: "color 0.2s ease-in-out"
});
}

var oldOpacity;
var opacitySlider = new BV.PointSlider({
init: layer.opacity,
width: 204,
pointSize: 14,
callback: function(sliderValue, isFirst, isLast) {
if(isFirst) {
oldOpacity = pcCanvas.getLayer(layer.spot).opacity;
BV.pcLog.pause();
return;
}
if(isLast) {
BV.pcLog.pause(false);
if (oldOpacity !== sliderValue) {
pcCanvas.layerOpacity(layer.spot, sliderValue);
}
return;
}
layer.opacityLabel.innerHTML = Math.round(sliderValue * 100) + "%";
pcCanvas.layerOpacity(layer.spot, sliderValue);
}
});
BV.css(opacitySlider.getEl(), {
position: 'absolute',
left: '39px',
top: '17px'
});
layer.opacitySlider = opacitySlider;


BV.setEventListener(layer.thumb, 'onpointerover', function (e) {
if(e.buttons !== 0 && (!e.pointerType || e.pointerType !== 'touch')) {
return;
}

var thumbDimensions = BV.fitInto(250, 250, layercanvas.width, layercanvas.height, 1);

if(largeThumbCanvas.width !== thumbDimensions.width || largeThumbCanvas.height !== thumbDimensions.height) {
largeThumbCanvas.width = thumbDimensions.width;
largeThumbCanvas.height = thumbDimensions.height;
}
var ctx = largeThumbCanvas.getContext("2d");
ctx.imageSmoothingQuality = 'high';
ctx.clearRect(0, 0, largeThumbCanvas.width, largeThumbCanvas.height);
ctx.drawImage(layercanvas, 0, 0, largeThumbCanvas.width, largeThumbCanvas.height);
BV.css(largeThumbDiv, {
top: (e.clientY - largeThumbCanvas.height / 2) + "px",
opacity: 0
});
if (largeThumbInDocument === false) {
document.body.appendChild(largeThumbDiv);
largeThumbInDocument = true;
}
clearTimeout(largeThumbInTimeout);
largeThumbInTimeout = setTimeout(function () {
BV.css(largeThumbDiv, {
opacity: 1
});
}, 20);
clearTimeout(largeThumbTimeout);
});
BV.setEventListener(layer.thumb, 'onpointerout', function () {
clearTimeout(largeThumbInTimeout);
BV.css(largeThumbDiv, {
opacity: 0
});
clearTimeout(largeThumbTimeout);
largeThumbTimeout = setTimeout(function () {
if (!largeThumbInDocument) {
return;
}
document.body.removeChild(largeThumbDiv);
largeThumbInDocument = false;
}, 300);
});

container1.appendChild(layer.thumb);
container1.appendChild(layer.label);
container1.appendChild(layer.opacityLabel);
container1.appendChild(opacitySlider.getEl());
var dragstart = false;
var freshSelection = false;


function dragEventHandler(event) {
if (event.type === 'pointerdown' && event.button === 'left') {
BV.css(layer, {
transition: "box-shadow 0.3s ease-in-out"
});

layer.style.zIndex = 1;
lastpos = layer.spot;
freshSelection = false;
if (!layer.isSelected) {
freshSelection = true;
div.activateLayer(layer.spot);
}
dragstart = true;

} else if (event.type === 'pointermove' && event.button === 'left') {

if (dragstart) {
dragstart = false;
BV.css(layer, {
boxShadow: "1px 3px 5px rgba(0,0,0,0.4)"
});
}
layer.posY += event.dY;
var corrected = Math.max(0, Math.min((pcCanvasLayerArr.length - 1) * (35), layer.posY));
layer.style.top = corrected + "px";
updateLayersVerticalPosition(layer.spot, posToSpot(layer.posY));

}
if (event.type === 'pointerup') {
BV.css(layer, {
transition: "all 0.1s linear"
});
setTimeout(function () {
BV.css(layer, {
boxShadow: ""
});
}, 20);
layer.posY = Math.max(0, Math.min((pcCanvasLayerArr.length - 1) * (35), layer.posY));

layer.style.zIndex = "";
var newSpot = posToSpot(layer.posY);
var oldSpot = layer.spot;
move(layer.spot, newSpot);
if (oldSpot != newSpot) {
BV.pcLog.pause();
updatefunc(selectedSpotIndex);
BV.pcLog.pause(false);
}
if (oldSpot === newSpot && freshSelection) {
updatefunc(selectedSpotIndex);
}
freshSelection = false;
}
}

layer.pointerListener = new BV.PointerListener({
target: container1,
maxPointers: 1,
onPointer: dragEventHandler
});

regularContainer.appendChild(layer);
}
layerElArr = [];
while (regularContainer.firstChild) {
let child = regularContainer.firstChild;
child.pointerListener.destroy();
child.opacitySlider.destroy();
regularContainer.removeChild(child);
}
for (var i = 0; i < pcCanvasLayerArr.length; i++) {
createLayerEntry(i);
}
div.activateLayer(selectedSpotIndex);
}


listdiv.appendChild(regularContainer);
div.appendChild(listdiv);


function posToSpot(p) {
var result = parseInt((p) / (layerHeight + layerSpacing) + 0.5);
result = Math.min(pcCanvasLayerArr.length - 1, Math.max(0, result));
result = pcCanvasLayerArr.length - result - 1;
return result;
}

var lastpos = 0;


function updateLayersVerticalPosition(id, newspot) {
newspot = Math.min(pcCanvasLayerArr.length - 1, Math.max(0, newspot));
if(newspot === lastpos) {
return;
}
for (var i = 0; i < pcCanvasLayerArr.length; i++) {
if (layerElArr[i].spot === id) {
continue;
}
var posy = layerElArr[i].spot;
if (layerElArr[i].spot > id) {
posy--;
}
if (posy >= newspot) {
posy++;
}
layerElArr[i].posY = (layerHeight + layerSpacing) * (pcCanvasLayerArr.length - posy - 1);
layerElArr[i].style.top = layerElArr[i].posY + "px";
}
lastpos = newspot;
}

function move(oldSpotIndex, newSpotIndex) {
if(isNaN(oldSpotIndex) || isNaN(newSpotIndex)) {
throw 'layermanager - invalid move';
}
for (var i = 0; i < pcCanvasLayerArr.length; i++) {
(function (i) {
var posy = layerElArr[i].spot;
if (layerElArr[i].spot === oldSpotIndex) {
posy = newSpotIndex;
} else {
if (layerElArr[i].spot > oldSpotIndex)
posy--;
if (posy >= newSpotIndex)
posy++;
}
layerElArr[i].spot = posy;
layerElArr[i].posY = (layerHeight + layerSpacing) * (pcCanvasLayerArr.length - posy - 1);
layerElArr[i].style.top = layerElArr[i].posY + "px";
}(i));
}
if (oldSpotIndex === newSpotIndex) {
return;
}
pcCanvas.moveLayer(selectedSpotIndex, newSpotIndex - oldSpotIndex);
pcCanvasLayerArr = pcCanvas.getLayers();
selectedSpotIndex = newSpotIndex;
mergeBtn.disabled = selectedSpotIndex === 0;
}




var updateThumbsInterval = setInterval(function() {
if(div.style.display !== "block") {
return;
}

var loggerState = BV.pcLog.getState();
if (loggerState === oldLoggerState) {
return;
}
oldLoggerState = loggerState;

for(let i = 0; i < layerElArr.length; i++) {
if (selectedSpotIndex === layerElArr[i].spot && pcCanvasLayerArr[layerElArr[i].spot]) {
let ctx = layerElArr[i].thumb.getContext("2d");
ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
ctx.drawImage(pcCanvasLayerArr[layerElArr[i].spot].context.canvas, 0, 0, layerElArr[i].thumb.width, layerElArr[i].thumb.height);
}
}

}, 1);



div.update = function (activeLayerSpotIndex) {
pcCanvasLayerArr = pcCanvas.getLayers();
if(activeLayerSpotIndex || activeLayerSpotIndex === 0) {
selectedSpotIndex = activeLayerSpotIndex;
}
removeBtn.disabled = pcCanvasLayerArr.length === 1;
if (pcCanvasLayerArr.length === 8) {
addnewBtn.disabled = true;
duplicateBtn.disabled = true;
} else {
addnewBtn.disabled = false;
duplicateBtn.disabled = false;
}
setTimeout(function() {
createLayerList();
}, 1);
};
/*div.setCanvas = function (c) {
pcCanvas = c;
pcCanvasLayerArr = pcCanvas.getLayers();
createLayerList();
};*/
div.getSelected = function () {
return selectedSpotIndex;
};
div.activateLayer = function (spotIndex) {
if(spotIndex < 0 || spotIndex > layerElArr.length - 1) {
throw 'invalid spotIndex ' + spotIndex + ', layerElArr.length ' + layerElArr.length;
}
selectedSpotIndex = spotIndex;
modeSelect.setValue(pcCanvasLayerArr[selectedSpotIndex].mixModeStr);
for (var i = 0; i < layerElArr.length; i++) {
if (selectedSpotIndex === layerElArr[i].spot) {
layerElArr[i].style.backgroundColor = "rgb( 250, 250, 250)";
layerElArr[i].label.style.color = "#000";
layerElArr[i].style.boxShadow = "";
layerElArr[i].style.border = "1px solid var(--active-highlight-color)";
layerElArr[i].opacitySlider.setActive(true);
layerElArr[i].isSelected = true;
} else {
layerElArr[i].style.backgroundColor = "rgb( 220, 220, 220)";
layerElArr[i].label.style.color = "#666";
layerElArr[i].style.boxShadow = "";
layerElArr[i].style.border = "1px solid rgb(158, 158, 158)";
layerElArr[i].opacitySlider.setActive(false);
layerElArr[i].isSelected = false;
}
}
mergeBtn.disabled = selectedSpotIndex === 0;
};
div.setUiState = function(stateStr) {
uiState = '' + stateStr;

if (uiState === 'left') {
BV.css(largeThumbDiv, {
left: '280px',
right: ''
});
} else {
BV.css(largeThumbDiv, {
left: '',
right: '280px'
});
}
};

createLayerList();

return div;
};


/**
* Overlay for PcCanvasWorkspace.
* - brush circle
* - eyedropper circle
* - compass needle (rotation hud)
*
* @param p - {width: number, height: number}
* @constructor
*/
BV.WorkspaceSvgOverlay = function(p) {

const namespaceStr = 'http://www.w3.org/2000/svg';
let rootElement = '';
rootElement = document.createElementNS(namespaceStr, 'svg');
BV.css(rootElement, {
position: 'absolute',
left: 0,
top: 0,
pointerEvents: 'none',
userSelect: 'none'
});
rootElement.setAttribute('width', p.width);
rootElement.setAttribute('height', p.height);


let brushCircleOuter = document.createElementNS(namespaceStr, 'circle');
brushCircleOuter.setAttribute('r', 10);
brushCircleOuter.setAttribute('stroke', 'rgba(0,0,0,0.7)');
brushCircleOuter.setAttribute('stroke-width', '1');
brushCircleOuter.setAttribute('fill', 'none');

let brushCircleInner = document.createElementNS(namespaceStr, 'circle');
brushCircleInner.setAttribute('r', 9);
brushCircleInner.setAttribute('stroke', 'rgba(255,255,255,0.7)');
brushCircleInner.setAttribute('stroke-width', '1');
brushCircleInner.setAttribute('fill', 'none');

rootElement.appendChild(brushCircleOuter);
rootElement.appendChild(brushCircleInner);


let pickerPreviewBorder = document.createElementNS(namespaceStr, 'circle');
pickerPreviewBorder.setAttribute('r', 47);
pickerPreviewBorder.setAttribute('stroke', 'black');
pickerPreviewBorder.setAttribute('stroke-width', '22');
pickerPreviewBorder.setAttribute('fill', 'none');
pickerPreviewBorder.style.opacity = 0;
let pickerPreviewCol = document.createElementNS(namespaceStr, 'circle');
pickerPreviewCol.setAttribute('r', 47);
pickerPreviewCol.setAttribute('stroke', 'black');
pickerPreviewCol.setAttribute('stroke-width', '20');
pickerPreviewCol.setAttribute('fill', 'none');
pickerPreviewCol.style.opacity = 0;
rootElement.appendChild(pickerPreviewBorder);
rootElement.appendChild(pickerPreviewCol);





let compassSize = 30;
let compass = document.createElementNS(namespaceStr, 'g');
let compassInner = document.createElementNS(namespaceStr, 'g');
let compassBaseCircle = document.createElementNS(namespaceStr, 'circle');
let compassLineCircle = document.createElementNS(namespaceStr, 'circle');
let compassUpperTriangle = document.createElementNS(namespaceStr, 'path');
let compassLowerTriangle = document.createElementNS(namespaceStr, 'path');

compassInner.appendChild(compassBaseCircle);
compassInner.appendChild(compassLineCircle);
compassInner.appendChild(compassUpperTriangle);
compassInner.appendChild(compassLowerTriangle);
compass.appendChild(compassInner);
rootElement.appendChild(compass);

compass.style.transition = 'opacity 0.25s ease-in-out';
compass.style.opacity = 0;

compass.setAttribute('transform', 'translate(' + (p.width/2) + ', ' + (p.height/2) + ')');
compassInner.setAttribute('transform', 'rotate(45)');
compassBaseCircle.setAttribute('fill', 'rgba(0,0,0,0.9)');
compassBaseCircle.setAttribute('stroke', 'none');
compassLineCircle.setAttribute('fill', 'none');
compassLineCircle.setAttribute('stroke', 'rgba(255,255,255,0.75)');
compassLineCircle.setAttribute('stroke-width', 1);
compassUpperTriangle.setAttribute('fill', '#f00');
compassUpperTriangle.setAttribute('stroke', 'none');
compassLowerTriangle.setAttribute('fill', '#fff');
compassLowerTriangle.setAttribute('stroke', 'none');

compassBaseCircle.setAttribute('cx', 0);
compassBaseCircle.setAttribute('cy', 0);
compassBaseCircle.setAttribute('r', compassSize);
compassLineCircle.setAttribute('cx', 0);
compassLineCircle.setAttribute('cy', 0);
compassLineCircle.setAttribute('r', compassSize * 0.9);
compassUpperTriangle.setAttribute('d', 'M -'+(compassSize * 0.25)+',0 '+(compassSize * 0.25)+',0 0,-'+(compassSize * 0.9)+' z');
compassLowerTriangle.setAttribute('d', 'M -'+(compassSize * 0.25)+',0 '+(compassSize * 0.25)+',0 0,'+(compassSize * 0.9)+' z');





this.getElement = function() {
return rootElement;
}
this.setSize = function(width, height) {
rootElement.setAttribute('width', width);
rootElement.setAttribute('height', height);
compass.setAttribute('transform', 'translate(' + (width/2) + ', ' + (height/2) + ')');
};
this.updateCursor = function(p) {

if('x' in p) {
brushCircleOuter.setAttribute('cx', p.x);
brushCircleInner.setAttribute('cx', p.x);
}
if('y' in p) {
brushCircleOuter.setAttribute('cy', p.y);
brushCircleInner.setAttribute('cy', p.y);
}
if('radius' in p) {
brushCircleOuter.setAttribute('r', Math.max(0, p.radius));
brushCircleInner.setAttribute('r', Math.max(0, p.radius - 1));
}
if('isVisible' in p) {
brushCircleOuter.style.opacity = p.isVisible ? 1 : 0;
brushCircleInner.style.opacity = p.isVisible ? 1 : 0;
}

};
this.updateColorPreview = function(p) {

if('x' in p) {
pickerPreviewCol.setAttribute('cx', p.x);
pickerPreviewBorder.setAttribute('cx', p.x);
}
if('y' in p) {
pickerPreviewCol.setAttribute('cy', p.y);
pickerPreviewBorder.setAttribute('cy', p.y);
}
if('color' in p) {
pickerPreviewCol.setAttribute('stroke', "rgb(" + parseInt(p.color.r, 10) + ", " + parseInt(p.color.g, 10) + ", " + parseInt(p.color.b, 10) + ")");
let borderColor = BV.testIsWhiteBestContrast(p.color) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
pickerPreviewBorder.setAttribute('stroke', borderColor);
}
if('isVisible' in p) {
pickerPreviewCol.style.opacity = p.isVisible ? 1 : 0;
pickerPreviewBorder.style.opacity = p.isVisible ? 1 : 0;
}

};
this.updateCompass = function(p) {

if('angleDeg' in p) {
compassInner.setAttribute('transform', 'rotate('+p.angleDeg+')');
compassLineCircle.style.opacity = p.angleDeg % 90 === 0 ? 1 : 0;
}
if('isVisible' in p) {
compass.style.opacity = p.isVisible ? 1 : 0;
}

};
};


/**
* Work area that displays the PcCanvas.
* - pan, zoom, rotate (also via multi-touch)
* - input modes: drawing, hand, pick, fill, text
* - drawing input events
* - view change events
* - eyedropper input events (pick)
* - draws cursor, eyedropper overlay
*
* subscribes to pcCanvas changes
* listens to pc log for changes
* and you can manually trigger redraw
*
* p: {
*      pcCanvas: PcCanvas,
*      width: number,
*      height: number,
*      onDraw: func(val),
*      onPick: func(rgb, isPointerup),
*      onFill: func(canvasX, canvasY),
*      onText: func(canvasX, canvasY, angleRad),
*      onShape: func('down'|'up', canvasX, canvasY, angleRad),
*      onViewChange: func(ViewChangeEvent),
*      onUndo: func(),
*      onRedo: func(),
*      mode: 'draw' | 'pick' | 'hand' | 'fill' | 'text'
* }
*
* ViewChangeEvent = {
*      changed: ['scale', 'angle'],
*      angle: targetTransformObj.angle,
*      scale: targetTransformObj.scale
* }
*
* @param p
* @constructor
*/
BV.PcCanvasWorkspace =  function (p) {

var _this = this;
var div = document.createElement('div');
var pcCanvas = p.pcCanvas;
var renderTargetCanvas = BV.createCanvas(p.width, p.height);
var renderTargetCtx = renderTargetCanvas.getContext('2d');
let renderWidth = p.width;
let renderHeight = p.height;
let compositeCanvas = BV.createCanvas(1, 1);
let compositeCtx = compositeCanvas.getContext('2d');
let doResizeCanvas = false;
let oldTransformObj = null;
var targetTransformObj = {
x: 0,
y: 0,
scale: 1,
angle: 0
};
var highResTransformObj = {
x: 0,
y: 0,
scale: 1,
angle: 0
};
let renderedTransformObj = {};
var cursorPos = {
x: 0,
y: 0
};
var usesCssCursor = false;
var bgVisible = true;
var transformIsDirty = true;
var doAnimateTranslate = true;


function getRenderedTransform() {
let result = renderedTransformObj;
result.x = highResTransformObj.x;
result.y = highResTransformObj.y;
result.scale = highResTransformObj.scale;
result.angle = highResTransformObj.angle;

if(result.angle % (Math.PI / 2) === 0 && result.scale % 1 === 0) {
result.x = Math.round(result.x);
result.y = Math.round(result.y);
}

return result;
}

let svgOverlay = new BV.WorkspaceSvgOverlay({
width: p.width,
height: p.height
});

BV.css(renderTargetCanvas, {
userSelect: 'none',
pointerEvents: 'none'

});
BV.createCheckerDataUrl(8, function(url) {
renderTargetCanvas.style.background = "url(" + url + ")";
});
div.appendChild(renderTargetCanvas);
div.appendChild(svgOverlay.getElement());
BV.css(div, {
position: 'absolute',
left: 0,
right: 0,
top: 0,
bottom: 0,
cursor: 'crosshair',
userSelect: 'none'
});
BV.addEventListener(div, 'touchend', function(e) {
e.preventDefault();
return false;
});
BV.addEventListener(div, 'contextmenu', function(e) {
e.preventDefault();
return false;
});
BV.addEventListener(div, 'dragstart', function(e) {
e.preventDefault();
return false;
});

var emptyCanvas = BV.createCanvas(1, 1);
{
let ctx = emptyCanvas.getContext('2d');
ctx.fillRect(0, 0, 1, 1);
}
var MIN_SCALE = 1 / 16, MAX_SCALE = 64;

var keyListener = new BV.KeyListener({
onDown: function(keyStr, event, comboStr, isRepeat) {

if(keyStr === 'alt') {
event.preventDefault();
}
if(isRepeat) {
return;
}

if(currentInputProcessor) {
currentInputProcessor.onKeyDown(keyStr, event, comboStr, isRepeat);

} else {

if ([MODE_DRAW, MODE_PICK, MODE_FILL, MODE_TEXT, MODE_SHAPE].includes(globalMode) && comboStr === 'space') {
currentInputProcessor = inputProcessorObj.spaceHand;
currentInputProcessor.onKeyDown(keyStr, event, comboStr, isRepeat);
return;
}

if ([MODE_DRAW, MODE_HAND, MODE_FILL, MODE_TEXT, MODE_SHAPE].includes(globalMode) && comboStr === 'alt') {
currentInputProcessor = inputProcessorObj.altPicker;
currentInputProcessor.onKeyDown(keyStr, event, comboStr, isRepeat);
return;
}

if (['r', 'shift+r'].includes(comboStr)) {
currentInputProcessor = inputProcessorObj.rotate;
currentInputProcessor.onKeyDown(keyStr, event, comboStr, isRepeat);
return;
}

if ('z' === comboStr) {
currentInputProcessor = inputProcessorObj.zoom;
currentInputProcessor.onKeyDown(keyStr, event, comboStr, isRepeat);
return;
}

}

},
onUp: function(keyStr, event, oldComboStr) {

if(currentInputProcessor) {
currentInputProcessor.onKeyUp(keyStr, event, oldComboStr);
} else {
}

}
});

function updateChangeListener() {
pcCanvas.addChangeListener(function() {
lastRenderedState = -1;
requestFrame();
});
}
updateChangeListener();


let MODE_DRAW = 0, MODE_HAND = 1, MODE_HAND_GRABBING = 2,
MODE_PICK = 3, MODE_ZOOM = 4, MODE_ROTATE = 5,
MODE_ROTATING = 6, MODE_FILL = 7, MODE_TEXT = 8, MODE_SHAPE = 9;
let currentMode = MODE_DRAW;
let globalMode = MODE_DRAW;

/**
*
* @param modeStr 'draw' | 'hand' | 'pick' | 'fill'
*/
function updateCursor(modeInt, doForce) {
if(modeInt === currentMode && !doForce) {
return;
}
let oldMode = currentMode;
currentMode = modeInt;
lastRenderedState = -1;
if(currentMode === MODE_DRAW) {
div.style.cursor = 'crosshair';
} else if (currentMode === MODE_HAND) {
div.style.cursor = 'grab';
} else if (currentMode === MODE_HAND_GRABBING) {
div.style.cursor = 'grabbing';
} else if (currentMode === MODE_PICK) {
div.style.cursor = "url('0-4-15--176eb290fdd/img/ui/cursor-picker.png') 0 15, crosshair";
} else if (currentMode === MODE_ZOOM) {
div.style.cursor = "url('0-4-15--176eb290fdd/img/ui/cursor-zoom-ew.png') 7 7, zoom-in";
} else if (currentMode === MODE_ROTATE) {
div.style.cursor = "grab";
} else if (currentMode === MODE_ROTATING) {
div.style.cursor = "grabbing";
} else if (currentMode === MODE_FILL) {
div.style.cursor = "url('0-4-15--176eb290fdd/img/ui/cursor-fill.png') 1 12, crosshair";
} else if (currentMode === MODE_TEXT) {
div.style.cursor = "url('0-4-15--176eb290fdd/img/ui/cursor-text.png') 1 12, crosshair";
} else if (currentMode === MODE_SHAPE) {
div.style.cursor = 'crosshair';
}

if([MODE_DRAW, MODE_PICK, MODE_FILL, MODE_TEXT, MODE_SHAPE].includes(globalMode)) {
let oldIsHand = [MODE_HAND, MODE_HAND_GRABBING].includes(oldMode);
let currentIsHand = [MODE_HAND, MODE_HAND_GRABBING].includes(currentMode);
if (!oldIsHand && currentIsHand) {
mainDoubleTapper.setAllowedPointerTypeArr(['mouse', 'pen', 'touch']);
}
if (oldIsHand && !currentIsHand) {
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
}

if(currentMode !== MODE_PICK) {
svgOverlay.updateColorPreview({isVisible: false});
}
}

function internalZoomByStep(stepNum, centerX, centerY) {

var step = Math.log2(targetTransformObj.scale);

var newStep = step / Math.abs(stepNum);
newStep += stepNum > 0 ? 1 : -1;
newStep = Math.round(newStep);
newStep *= Math.abs(stepNum);
var newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.pow(2, newStep)));


if (newScale === targetTransformObj.scale) {
return false;
}


let effectiveFactor = newScale / targetTransformObj.scale;
targetTransformObj.scale = newScale;

let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(centerX, centerY));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(effectiveFactor));

matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-centerX, -centerY));


let origin = [targetTransformObj.x, targetTransformObj.y, 0, 1];
origin = BV.Matrix.multiplyMatrixAndPoint(matrix, origin);
targetTransformObj.x = origin[0];
targetTransformObj.y = origin[1];

/*if(transform.scale === 1) {
transform.x = Math.round(transform.x);
transform.y = Math.round(transform.y);
}*/

transformIsDirty = true;

return true;
}

/**
* mixes two transform objects. modifies A
* @param transformA
* @param transformB
* @param blendFactor 0 -> A, 1 -> B
*/
function mixTransformObj(transformA, transformB, blendFactor) {

if (transformA.angle === transformB.angle) {
transformA.scale = BV.mix(transformA.scale, transformB.scale, blendFactor);
transformA.x = BV.mix(transformA.x, transformB.x, blendFactor);
transformA.y = BV.mix(transformA.y, transformB.y, blendFactor);
transformA.angle = BV.mix(transformA.angle, transformB.angle, blendFactor);
return;
}

let w = pcCanvas.getWidth();
let h = pcCanvas.getHeight();


let centerPosA = canvasToWorkspaceCoord({
x: w / 2,
y: h / 2
}, transformA);
let centerPosB = canvasToWorkspaceCoord({
x: w / 2,
y: h / 2
}, transformB);


transformA.x = BV.mix(centerPosA.x , centerPosB.x, blendFactor);
transformA.y = BV.mix(centerPosA.y , centerPosB.y, blendFactor);


transformA.scale = BV.mix(transformA.scale, transformB.scale, blendFactor);
transformA.angle = BV.mix(transformA.angle, transformB.angle, blendFactor);


let mixedPos = canvasToWorkspaceCoord({
x: -w / 2,
y: -h / 2
}, transformA);
transformA.x = mixedPos.x;
transformA.y = mixedPos.y;

}

var renderTime = 0;
function render() {

if(doResizeCanvas) {
doResizeCanvas = false;
renderTargetCanvas.width = renderWidth;
renderTargetCanvas.height = renderHeight;
}

renderContext(renderTargetCtx);
}


function testBgVisible() {



let workspacePointArr = [
[0, 0],
[renderWidth, 0],
[renderWidth, renderHeight],
[0, renderHeight],
];

let art = getRenderedTransform();


let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(1/art.scale));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(-art.angle));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-art.x, -art.y));


for(let i = 0; i < workspacePointArr.length; i++) {
let coords = [workspacePointArr[i][0], workspacePointArr[i][1], 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);

if ( !(0 <= coords[0] && coords[0] <= pcCanvas.getWidth() && 0 <= coords[1] && coords[1] <= pcCanvas.getHeight()) ){

return true;
}
}
return false;
}

function renderContext(ctx) {

let w = pcCanvas.getWidth();
let h = pcCanvas.getHeight();

let art = getRenderedTransform();

if(art.scale >= 4) {
ctx.imageSmoothingEnabled = false;
} else {
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality  = art.scale >= 1 ? 'low' : 'medium';
}





ctx.save();
{
if(bgVisible) {
ctx.fillStyle = 'rgb(158,158,158)';
ctx.fillRect(0, 0, renderWidth, renderHeight);
} else {
ctx.clearRect(0, 0, renderWidth, renderHeight);
}



if(bgVisible) {
ctx.save();

ctx.translate(art.x, art.y);
ctx.scale(art.scale, art.scale);
ctx.rotate(art.angle);

ctx.imageSmoothingEnabled = 'false';


let borderSize = 1;
ctx.globalAlpha = 0.2;
ctx.drawImage(emptyCanvas, -borderSize / art.scale, -borderSize / art.scale, w + borderSize * 2 / art.scale, h + borderSize * 2 / art.scale);
ctx.globalAlpha = 1;


ctx.globalCompositeOperation = 'destination-out';
ctx.drawImage(emptyCanvas, 0, 0, w, h);

ctx.restore();
}

/*let region = new Path2D();
region.rect(80, 10, 20, 130);
ctx.clip(region);*/

ctx.translate(art.x, art.y);
ctx.scale(art.scale, art.scale);
ctx.rotate(art.angle);

let layerArr = pcCanvas.getLayersFast();
for (let i = 0; i < layerArr.length; i++) {
if(layerArr[i].opacity > 0) {
ctx.globalAlpha = layerArr[i].opacity;
ctx.globalCompositeOperation = layerArr[i].mixModeStr;

if (layerArr[i].canvas.compositeObj) {
if (compositeCanvas.width !== layerArr[i].canvas.width || compositeCanvas.height !== layerArr[i].canvas.height) {
compositeCanvas.width = layerArr[i].canvas.width;
compositeCanvas.height = layerArr[i].canvas.height;
} else {
compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
}
compositeCtx.drawImage(layerArr[i].canvas, 0, 0);
layerArr[i].canvas.compositeObj.draw(compositeCtx);
ctx.drawImage(compositeCanvas, 0, 0, w, h);
} else {
ctx.drawImage(layerArr[i].canvas, 0, 0, w, h);
}
}
}
ctx.globalAlpha = 1;



}
ctx.restore();


if(MODE_ROTATE === currentMode || MODE_ROTATING === currentMode) {
svgOverlay.updateCompass({
isVisible: true,
angleDeg: art.angle / Math.PI * 180
});
} else {
svgOverlay.updateCompass({
isVisible: false
});
}

}

function workspaceToCanvasCoord(p) {
let art = getRenderedTransform();
let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(1/art.scale));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(-art.angle));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-art.x, -art.y));

let coords = [p.x, p.y, 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);

return {
x: coords[0],
y: coords[1],
}
}

function canvasToWorkspaceCoord(p, transformObj) {
let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(transformObj.x, transformObj.y));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(transformObj.angle));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(transformObj.scale));

let coords = [p.x, p.y, 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);

return {
x: coords[0],
y: coords[1],
}
}

function snapAngleRad(angleRad, snapDegIncrement, maxDistDeg) {

let angleDeg = angleRad * 180 / Math.PI;
let modDeg = Math.abs(angleDeg % snapDegIncrement);
let dist = Math.min(modDeg, snapDegIncrement - modDeg);

if(dist <= maxDistDeg) {
angleDeg = Math.round(angleDeg / snapDegIncrement) * snapDegIncrement;
}

return angleDeg / 180 * Math.PI;
}

/**
* angle always in range [-PI, PI]
*
* @param angleRad
* @returns {number} - angle in radians
*/
function minimizeAngleRad(angleRad) {
angleRad = angleRad % (2 * Math.PI);
if(angleRad > Math.PI) {
angleRad -= 2 * Math.PI;
} else if (angleRad < -Math.PI) {
angleRad += 2 * Math.PI;
}
return angleRad;
}

var lastDrawEvent = null;
var linetoolProcessor = new BV.EventChain.LinetoolProcessor({
onDraw: function(event) {
function getMatrix() {
let art = getRenderedTransform();
let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(1/art.scale));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(-art.angle));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-art.x, -art.y));
return matrix;
}

if(event.type === 'line' && !lastDrawEvent) {
let matrix = getMatrix();
let coords = [event.x1, event.y1, 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);
lastDrawEvent = {
x: coords[0],
y: coords[1],
pressure: event.pressure1
};
return;
}

if('x' in event || 'x0' in event) {

let matrix = getMatrix();

if('x' in event) {
let coords = [event.x, event.y, 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);
event.x = coords[0];
event.y = coords[1];
}
if('x0' in event) {
event.x0 = lastDrawEvent.x;
event.y0 = lastDrawEvent.y;
event.pressure0 = lastDrawEvent.pressure;
let coords = [event.x1, event.y1, 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);
event.x1 = coords[0];
event.y1 = coords[1];

lastDrawEvent = {
x: event.x1,
y: event.y1,
pressure: event.pressure1,
};
}
}


if(['down', 'move'].includes(event.type)) {
lastDrawEvent = event;
}
p.onDraw(event);
}
});


var pointer = null;
var isDrawing = false;



let inputProcessorObj = {
draw: {
onPointer: function(val) {

requestFrame();
updateCursor(MODE_DRAW);

let comboStr = keyListener.getComboStr();

var event = {
scale: highResTransformObj.scale
};
event.shiftIsPressed = comboStr === 'shift';
event.pressure = val.pressure;
event.isCoalesced = !!val.isCoalesced;

if (val.type === 'pointerdown') {

isDrawing = true;
event.type = 'down';

} else if(val.button) {
event.type = 'move';

} else if (val.type === 'pointerup') {

isDrawing = false;
event.type = 'up';

linetoolProcessor.process(event);
resetInputProcessor();
return;
} else {
return;
}

event.x = val.relX;
event.y = val.relY;

linetoolProcessor.process(event);
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
fill: {
onPointer: function(event) {

requestFrame();
updateCursor(MODE_FILL);

if (event.type === 'pointerdown') {
let coord = workspaceToCanvasCoord({x: event.relX, y: event.relY});
p.onFill(Math.floor(coord.x), Math.floor(coord.y));

} else if (event.type === 'pointerup') {
resetInputProcessor();
return;

}

},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
text: {
onPointer: function(event) {

requestFrame();
updateCursor(MODE_TEXT);

if (event.type === 'pointerdown') {
let coord = workspaceToCanvasCoord({x: event.relX, y: event.relY});
p.onText(Math.floor(coord.x), Math.floor(coord.y), renderedTransformObj.angle);

} else if (event.type === 'pointerup') {
resetInputProcessor();
return;

}

},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
shape: {
onPointer: function(event) {

requestFrame();
updateCursor(MODE_SHAPE);
let coord = workspaceToCanvasCoord({x: event.relX, y: event.relY});

if (event.type === 'pointerdown') {
isDrawing = true;
p.onShape('down', coord.x, coord.y, renderedTransformObj.angle);

} else if (event.type === 'pointermove') {
p.onShape('move', coord.x, coord.y, renderedTransformObj.angle);

} else if (event.type === 'pointerup') {
isDrawing = false;
p.onShape('up', coord.x, coord.y, renderedTransformObj.angle);
resetInputProcessor();

}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
hand: {
onPointer: function(event) {
updateCursor(MODE_HAND);
if(['left', 'middle'].includes(event.button)) {
updateCursor(MODE_HAND_GRABBING);
targetTransformObj.x += event.dX;
targetTransformObj.y += event.dY;
highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
doAnimateTranslate = false;
transformIsDirty = true;
requestFrame(true);
} else if (event.type === 'pointerup') {
resetInputProcessor();
}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
spaceHand: {
onPointer: function(event) {
updateCursor(MODE_HAND);
if(['left', 'middle'].includes(event.button)) {
updateCursor(MODE_HAND_GRABBING);
targetTransformObj.x += event.dX;
targetTransformObj.y += event.dY;
highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
doAnimateTranslate = false;
transformIsDirty = true;
requestFrame(true);
}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {
if(comboStr !== 'space') {
resetInputProcessor();
} else {
updateCursor(MODE_HAND);
}
},
onKeyUp: function(keyStr, event, oldComboStr) {
resetInputProcessor();
}
},
zoom: {
onPointer: function(event) {
updateCursor(MODE_ZOOM);

if(event.button === 'left' && !event.isCoalesced && event.dX != 0) {

let offsetX = event.pageX - event.relX;
let offsetY = event.pageY - event.relY;

internalZoomByStep(event.dX / 200, event.downPageX - offsetX, event.downPageY - offsetY);
highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
lastRenderedState = -1;
requestFrame();

p.onViewChange({
changed: ['scale'],
angle: targetTransformObj.angle,
scale: targetTransformObj.scale
});
}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {
if(comboStr !== 'z') {
resetInputProcessor();
} else {
updateCursor(MODE_ZOOM);
}
},
onKeyUp: function(keyStr, event, oldComboStr) {
resetInputProcessor();
}
},
picker: {
onPointer: function(event) {
updateCursor(MODE_PICK);
if(
(['left', 'right'].includes(event.button) && !event.isCoalesced) ||
event.type === 'pointerup'
) {
let coord = workspaceToCanvasCoord({x: event.relX, y: event.relY});
var pickedColor = pcCanvas.getColorAt(coord.x, coord.y);
p.onPick(pickedColor, event.type === 'pointerup');
svgOverlay.updateColorPreview({
x: event.relX,
y: event.relY,
color: pickedColor,
isVisible: event.type !== 'pointerup'
});

if(event.type === 'pointerup') {
resetInputProcessor();
}
}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {

},
onKeyUp: function(keyStr, event, oldComboStr) {

}
},
altPicker: {
onPointer: function(event) {
updateCursor(MODE_PICK);
if(
(['left', 'right'].includes(event.button) && !event.isCoalesced) ||
event.type === 'pointerup'
) {
let coord = workspaceToCanvasCoord({x: event.relX, y: event.relY});
var pickedColor = pcCanvas.getColorAt(coord.x, coord.y);
p.onPick(pickedColor, event.type === 'pointerup');
svgOverlay.updateColorPreview({
x: event.relX,
y: event.relY,
color: pickedColor,
isVisible: event.type !== 'pointerup'
});
}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {
if(comboStr !== 'alt') {
resetInputProcessor();
} else {
updateCursor(MODE_PICK);
}
},
onKeyUp: function(keyStr, event, oldComboStr) {
resetInputProcessor();
}
},
rotate: {
onPointer: function(event) {
updateCursor(event.button === 'left' ? MODE_ROTATING : MODE_ROTATE);

if (event.type === 'pointerdown' && event.button === 'left') {
oldTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
} else if (event.button === 'left' && !event.isCoalesced && oldTransformObj) {


let offsetX = event.pageX - event.relX;
let offsetY = event.pageY - event.relY;

let centerObj = {
x: renderWidth / 2,
y: renderHeight / 2
};

let startAngleRad = BV.Vec2.angle(centerObj, {x: event.downPageX - offsetX, y: event.downPageY - offsetY});
let angleRad = BV.Vec2.angle(centerObj, {x: event.pageX - offsetX, y: event.pageY - offsetY});
let dAngleRad = angleRad - startAngleRad;


targetTransformObj = JSON.parse(JSON.stringify(oldTransformObj));
targetTransformObj.angle += dAngleRad;

if(keyListener.isPressed('shift')) {
targetTransformObj.angle = Math.round(targetTransformObj.angle / Math.PI * 8) * Math.PI / 8;
dAngleRad = targetTransformObj.angle - oldTransformObj.angle;
}

targetTransformObj.angle = minimizeAngleRad(targetTransformObj.angle);


let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(centerObj.x, centerObj.y));

matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(dAngleRad));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-centerObj.x, -centerObj.y));


let origin = [targetTransformObj.x, targetTransformObj.y, 0, 1];
origin = BV.Matrix.multiplyMatrixAndPoint(matrix, origin);
targetTransformObj.x = origin[0];
targetTransformObj.y = origin[1];

highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));

transformIsDirty = true;
lastRenderedState = -1;
requestFrame();

p.onViewChange({
changed: ['angle'],
scale: targetTransformObj.scale,
angle: targetTransformObj.angle
});

}
},
onKeyDown: function(keyStr, event, comboStr, isRepeat) {
if(['r', 'r+shift', 'shift+r', 'r+left', 'r+right', 'r+left+right', 'r+right+left', 'r+up'].includes(comboStr)) {
updateCursor(MODE_ROTATE);
} else {
resetInputProcessor();
}
},
onKeyUp: function(keyStr, event, oldComboStr) {
let comboStr = keyListener.getComboStr();
if(['r', 'r+shift', 'shift+r', 'r+left', 'r+right', 'r+left+right', 'r+right+left', 'r+up'].includes(comboStr)) {
updateCursor(MODE_ROTATE);
} else {
resetInputProcessor();
}
}
}
};
let currentInputProcessor = null;

function resetInputProcessor() {
currentInputProcessor = null;
updateCursor(globalMode);
requestFrame(true);
}


let angleIsExtraSticky = false;
let pinchZoomer = new BV.EventChain.PinchZoomer({
onPinch: function(event) {

if (event.type === 'move') {

if(!oldTransformObj) {
oldTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
angleIsExtraSticky = targetTransformObj.angle % (Math.PI / 2) === 0;
}

let oldAngle = targetTransformObj.angle;
targetTransformObj = JSON.parse(JSON.stringify(oldTransformObj));

event.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, targetTransformObj.scale * event.scale)) / targetTransformObj.scale;

targetTransformObj.scale *= event.scale;
targetTransformObj.angle += event.angleRad;
targetTransformObj.angle = minimizeAngleRad(
snapAngleRad(
targetTransformObj.angle,
90,
angleIsExtraSticky ? 12 : 4
)
);
if(targetTransformObj.angle % (Math.PI / 2) !== 0) {
angleIsExtraSticky = false;
}

event.angleRad = targetTransformObj.angle - oldTransformObj.angle;


{
let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(event.relX, event.relY));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createScaleMatrix(event.scale));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(event.angleRad));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-event.relX, -event.relY));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(event.relX - event.downRelX, event.relY - event.downRelY));


let origin = [targetTransformObj.x, targetTransformObj.y, 0, 1];
origin = BV.Matrix.multiplyMatrixAndPoint(matrix, origin);

targetTransformObj.x = origin[0];
targetTransformObj.y = origin[1];

}

highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));


p.onViewChange({
changed: ['scale', 'angle'],
scale: targetTransformObj.scale,
angle: targetTransformObj.angle
});

requestFrame();
transformIsDirty = true;
lastRenderedState = -1;


} else if (event.type === 'end') {
oldTransformObj = null;
}


}
});

function onDoubleTap() {
let oldTransform = JSON.parse(JSON.stringify(targetTransformObj));
_this.fitView();

lastRenderedState = -1;
requestFrame();

if(
oldTransform.scale !== targetTransformObj.scale ||
oldTransform.angle !== targetTransformObj.angle
) {
p.onViewChange({
changed: ['scale', 'angle'],
angle: targetTransformObj.angle,
scale: targetTransformObj.scale
});
}
}

let mainDoubleTapper = new BV.EventChain.DoubleTapper({
onDoubleTap: onDoubleTap
});
let middleDoubleTapper = new BV.EventChain.DoubleTapper({
onDoubleTap: onDoubleTap
});
middleDoubleTapper.setAllowedButtonArr(['middle']);


let twoFingerTap = new BV.EventChain.NFingerTapper({
fingers: 2,
onTap: function() {
p.onUndo();
}
});
let threeFingerTap = new BV.EventChain.NFingerTapper({
fingers: 3,
onTap: function() {
p.onRedo();
}
});


let pointerEventChain = new BV.EventChain.EventChain({
chainArr: [
twoFingerTap,
threeFingerTap,
mainDoubleTapper,
middleDoubleTapper,
pinchZoomer,
new BV.EventChain.OnePointerLimiter(),
new BV.EventChain.CoalescedExploder()
]
});
pointerEventChain.setChainOut(function(event) {

cursorPos.x = event.relX;
cursorPos.y = event.relY;
if(event.type === 'pointerup' && event.pointerType === 'touch') {
pointer = null;
lastRenderedState = -1;
requestFrame();
} else {
if(!pointer) {
pointer = {};
}
pointer.x = event.relX;
pointer.y = event.relY;
}

if(currentInputProcessor) {
currentInputProcessor.onPointer(event);

} else {

let comboStr = keyListener.getComboStr();

if (globalMode === MODE_DRAW) {

if (['', 'shift', 'ctrl'].includes(comboStr) && event.type === 'pointerdown' && event.button === 'left') {
currentInputProcessor = inputProcessorObj.draw;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'right') {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'middle') {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_DRAW);
requestFrame();
}

} else if (globalMode === MODE_HAND) {

if(event.type === 'pointerdown' && ['left', 'middle'].includes(event.button)) {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'right') {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_HAND);
}

} else if (globalMode === MODE_PICK) {

if(event.type === 'pointerdown' && ['left', 'right'].includes(event.button)) {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'middle') {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_PICK);
}

} else if (globalMode === MODE_FILL) {

if (event.type === 'pointerdown' && event.button === 'left') {
currentInputProcessor = inputProcessorObj.fill;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'right') {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'middle') {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_FILL);
requestFrame();
}

} else if (globalMode === MODE_TEXT) {

if (event.type === 'pointerdown' && event.button === 'left') {
currentInputProcessor = inputProcessorObj.text;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'right') {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'middle') {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_TEXT);
requestFrame();
}

} else if (globalMode === MODE_SHAPE) {

if (['', 'shift', 'ctrl'].includes(comboStr) && event.type === 'pointerdown' && event.button === 'left') {
currentInputProcessor = inputProcessorObj.shape;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'right') {
currentInputProcessor = inputProcessorObj.picker;
currentInputProcessor.onPointer(event);
} else if ([''].includes(comboStr) && event.type === 'pointerdown' && event.button === 'middle') {
currentInputProcessor = inputProcessorObj.hand;
currentInputProcessor.onPointer(event);
} else {
updateCursor(MODE_SHAPE);
requestFrame();
}

}


}

});


BV.addEventListener(div, 'wheel', function(event) {
event.preventDefault();
});


let pointerListener;
setTimeout(function() {
pointerListener = new BV.PointerListener({
target: div,
onPointer: function(e) {
if (e.type === 'pointerdown' && e.button === 'middle') {
try {
e.eventPreventDefault();
} catch (e) {}
}
/*if(e.type === 'pointermove') {
BV.throwOut(JSON.stringify(e));
}*/

pointerEventChain.chainIn(e)
},
onWheel: function(wheelEvent) {

if (isDrawing) {
return;
}

requestFrame();
let didZoom = internalZoomByStep(-wheelEvent.deltaY / (keyListener.isPressed('shift') ? 8 : 2), wheelEvent.relX, wheelEvent.relY);
if(didZoom) {
p.onViewChange({
changed: ['scale'],
angle: targetTransformObj.angle,
scale: targetTransformObj.scale
});
}


lastRenderedState = -1;


},
onEnterLeave: function(isOver) {
if(!isOver) {
if(!isDrawing) {
pointer = null;
lastRenderedState = -1;
}
}
},
maxPointers: 4
});
}, 1);

let brushRadius = 1;

let animationFrameRequested = false;
function requestFrame(doRedrawCanvas) {
animationFrameRequested = true;
if(doRedrawCanvas) {
lastRenderedState = -1;
}
}




var lastRenderedState = -2;
var lastRenderTime = performance.now();
var debugtime = 0;
function updateLoop() {
window.requestAnimationFrame(updateLoop);

var newState = parseInt(BV.pcLog.getState());
let doRender = lastRenderedState < newState;


var nowTime = performance.now();
var elapsedFrames = (nowTime - lastRenderTime) * 60 / 1000;
lastRenderTime = nowTime;

if(animationFrameRequested || doRender) {
animationFrameRequested = false;
checkChange(elapsedFrames);
}



}
const animationSpeed = 0.3;
function checkChange(elapsedFrames) {

var newState = parseInt(BV.pcLog.getState());
var doRender = lastRenderedState < newState ||
highResTransformObj.scale !== targetTransformObj.scale ||
highResTransformObj.x !== targetTransformObj.x ||
highResTransformObj.y !== targetTransformObj.y;


if(
!doAnimateTranslate &&
(highResTransformObj.scale === targetTransformObj.scale || Math.abs(highResTransformObj.scale - targetTransformObj.scale) < 0.008 * targetTransformObj.scale)
) {
highResTransformObj.scale = targetTransformObj.scale;
highResTransformObj.x = targetTransformObj.x;
highResTransformObj.y = targetTransformObj.y;
highResTransformObj.angle = targetTransformObj.angle;
if(transformIsDirty) {
transformIsDirty = false;
bgVisible = testBgVisible();
}

svgOverlay.updateCursor({radius: brushRadius * highResTransformObj.scale});
} else if (
(highResTransformObj.x === targetTransformObj.x || Math.abs(highResTransformObj.x - targetTransformObj.x) < 0.5) &&
(highResTransformObj.y === targetTransformObj.y || Math.abs(highResTransformObj.y - targetTransformObj.y) < 0.5) &&
(highResTransformObj.scale === targetTransformObj.scale || Math.abs(highResTransformObj.scale - targetTransformObj.scale) < 0.008 * targetTransformObj.scale)
) {
highResTransformObj.scale = targetTransformObj.scale;
highResTransformObj.x = targetTransformObj.x;
highResTransformObj.y = targetTransformObj.y;
highResTransformObj.angle = targetTransformObj.angle;
doAnimateTranslate = false;
if(transformIsDirty) {
transformIsDirty = false;
bgVisible = testBgVisible();
}

svgOverlay.updateCursor({radius: brushRadius * highResTransformObj.scale});
} else {
requestFrame();
let blendFactor = Math.min(1, animationSpeed * elapsedFrames);
mixTransformObj(highResTransformObj, targetTransformObj, blendFactor);
bgVisible = true;
svgOverlay.updateCursor({radius: brushRadius * highResTransformObj.scale});
}

if(pointer && currentMode == MODE_DRAW && !usesCssCursor) {
svgOverlay.updateCursor({
x: pointer.x,
y: pointer.y,
isVisible: true
});
} else {
svgOverlay.updateCursor({isVisible: false});
}


if(doRender) {

lastRenderedState = newState;
let start = performance.now();
render();
renderTime = BV.mix(renderTime, performance.now() - start, 0.05);
}




if(doRender) {


}


}
window.requestAnimationFrame(updateLoop);




this.getElement = function() {
return div;
};

this.setCanvas = function(c) {

pcCanvas = c;
lastDrawEvent = null;
this.resetView();

updateChangeListener();

lastRenderedState = -1;
requestFrame();
};

this.setSize = function(width, height) {
let oldWidth = renderWidth;
let oldHeight = renderHeight;

if(width === oldWidth && height === oldHeight) {
return;
}

doResizeCanvas = true;
renderWidth = width;
renderHeight = height;

svgOverlay.setSize(width, height);

targetTransformObj.x += (width - oldWidth) / 2;
targetTransformObj.y += (height - oldHeight) / 2;

highResTransformObj.x = targetTransformObj.x;
highResTransformObj.y = targetTransformObj.y;

bgVisible = testBgVisible();

lastRenderedState = -1;
requestFrame();
};

this.setMode = function(modeStr) {

if(modeStr === 'draw') {
globalMode = MODE_DRAW;
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
if(modeStr === 'fill') {
globalMode = MODE_FILL;
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
if(modeStr === 'text') {
globalMode = MODE_TEXT;
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
if(modeStr === 'shape') {
globalMode = MODE_SHAPE;
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
if(modeStr === 'hand') {
globalMode = MODE_HAND;
mainDoubleTapper.setAllowedPointerTypeArr(['mouse', 'pen', 'touch']);
}
if(modeStr === 'pick') {
globalMode = MODE_PICK;
mainDoubleTapper.setAllowedPointerTypeArr(['touch']);
}
};

this.setEnabled = function(b) {

};

let disableRadiusPreviewTimeout;
this.setCursorSize = function(s) {
brushRadius = s / 2;

svgOverlay.updateCursor({radius: brushRadius * highResTransformObj.scale});

if(pointer === null) {
clearTimeout(disableRadiusPreviewTimeout);

svgOverlay.updateCursor({
x: renderWidth / 2,
y: renderHeight / 2,
isVisible: true
});

disableRadiusPreviewTimeout = setTimeout(function() {
if(pointer !== null) {
return;
}
svgOverlay.updateCursor({isVisible: false});
}, 500);
}
};

this.zoomByStep = function(stepNum) {
let didZoom = internalZoomByStep(stepNum, renderWidth / 2, renderHeight / 2);
if(!didZoom) {
return;
}

lastRenderedState = -1;
requestFrame();

p.onViewChange({
changed: ['scale'],
angle: targetTransformObj.angle,
scale: targetTransformObj.scale
});
};

this.resetView = function(doAnimate) {

targetTransformObj.scale = 1;
targetTransformObj.angle = 0;

targetTransformObj.x = (renderWidth - pcCanvas.getWidth()) / 2;
targetTransformObj.y = (renderHeight - pcCanvas.getHeight()) / 2;

if(!doAnimate) {
highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
} else {
doAnimateTranslate = true;
transformIsDirty = true;
}

bgVisible = testBgVisible();
requestFrame();

if (doAnimate) {
p.onViewChange({
changed: ['scale', 'angle'],
scale: targetTransformObj.scale,
angle: targetTransformObj.angle
});
}
};
this.resetView();

this.fitView = function() {



let canvasPointsArr = [
[0, 0],
[pcCanvas.getWidth(), 0],
[pcCanvas.getWidth(), pcCanvas.getHeight()],
[0, pcCanvas.getHeight()],
[pcCanvas.getWidth() / 2, pcCanvas.getHeight() / 2],
];


let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(targetTransformObj.angle));


for(let i = 0; i < canvasPointsArr.length; i++) {
let coords = [canvasPointsArr[i][0], canvasPointsArr[i][1], 0, 1];
coords = BV.Matrix.multiplyMatrixAndPoint(matrix, coords);
canvasPointsArr[i][0] = coords[0];
canvasPointsArr[i][1] = coords[1];
}

let boundsObj = {
x0: null,
y0: null,
x1: null,
y1: null
};
for(let i = 0; i < canvasPointsArr.length; i++) {
if(boundsObj.x0 === null || canvasPointsArr[i][0] < boundsObj.x0) {
boundsObj.x0 = canvasPointsArr[i][0];
}
if(boundsObj.y0 === null || canvasPointsArr[i][1] < boundsObj.y0) {
boundsObj.y0 = canvasPointsArr[i][1];
}
if(boundsObj.x1 === null || canvasPointsArr[i][0] > boundsObj.x1) {
boundsObj.x1 = canvasPointsArr[i][0];
}
if(boundsObj.y1 === null || canvasPointsArr[i][1] > boundsObj.y1) {
boundsObj.y1 = canvasPointsArr[i][1];
}
}
let boundsWidth = boundsObj.x1 - boundsObj.x0;
let boundsHeight = boundsObj.y1 - boundsObj.y0;


let padding = 40;
let fit = BV.fitInto(renderWidth - padding, renderHeight - padding, boundsWidth, boundsHeight, 1);


let factor = fit.width / boundsWidth;


targetTransformObj.x = (renderWidth / 2) - (canvasPointsArr[4][0] - canvasPointsArr[0][0]) * factor;
targetTransformObj.y = (renderHeight / 2) - (canvasPointsArr[4][1] - canvasPointsArr[0][1]) * factor;

targetTransformObj.scale = factor;
doAnimateTranslate = true;
transformIsDirty = true;
requestFrame();

p.onViewChange({
changed: ['scale', 'angle'],
scale: targetTransformObj.scale,
angle: targetTransformObj.angle
});
};

this.setAngle = function(angleDeg, isRelative) {

let centerObj = {
x: renderWidth / 2,
y: renderHeight / 2
};

let oldAngleRad = targetTransformObj.angle;
let angleRad = angleDeg / 180 * Math.PI;

if(isRelative) {
targetTransformObj.angle += angleRad;
} else {
targetTransformObj.angle = angleRad;
}

targetTransformObj.angle = minimizeAngleRad(
snapAngleRad(
targetTransformObj.angle,
90,
4
)
);


let matrix = BV.Matrix.getIdentity();
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(centerObj.x, centerObj.y));

matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createRotationMatrix(targetTransformObj.angle - oldAngleRad));
matrix = BV.Matrix.multiplyMatrices(matrix, BV.Matrix.createTranslationMatrix(-centerObj.x, -centerObj.y));


let origin = [targetTransformObj.x, targetTransformObj.y, 0, 1];
origin = BV.Matrix.multiplyMatrixAndPoint(matrix, origin);
targetTransformObj.x = origin[0];
targetTransformObj.y = origin[1];

highResTransformObj = JSON.parse(JSON.stringify(targetTransformObj));
transformIsDirty = true;
requestFrame(true);
};

this.translateView = function(tx, ty) {
let scale = 40;

targetTransformObj.x += tx * scale;
targetTransformObj.y += ty * scale;

transformIsDirty = true;
doAnimateTranslate = true;
requestFrame(true);
};

this.getIsDrawing = function() {
return isDrawing;
};

this.getScale = function() {
return targetTransformObj.scale;
};

this.getAngleDeg = function() {
return targetTransformObj.angle * 180 / Math.PI;
};

this.getMaxScale = function() {
return MAX_SCALE;
};

this.getMinScale = function() {
return MIN_SCALE;
};

this.requestFrame = function() {
lastRenderedState = -1;
requestFrame();
};

this.setLastDrawEvent = function(x, y, pressure) {

if(x === null) {
lastDrawEvent = null;
return;
}

if(!lastDrawEvent) {
lastDrawEvent = {x: 0, y: 0, pressure: 0};
}
lastDrawEvent.x = x;
lastDrawEvent.y = y;
lastDrawEvent.pressure = pressure;
};
};

/**
* a simple canvas where you can transform one layer(move around, rotate, scale)
*
* params = {
*     elementWidth: number,
*     elementHeight: number,
*     actualCanvasWidth: number,
*     actualCanvasHeight: number,
*     layerArr: [
*         {
*             canvas: Canvas|Image,
*             opacity: 0-1,
*             mixModeStr: string
*         }
*     ],
*     transformIndex: number
* }
*
* @param params
* @returns {HTMLDivElement}
* @constructor
*/
BV.FreeTransformCanvas = function (params) {
/*
div
innerWrapper
pcCanvasPreview
transform.div
*/

let previewFit = BV.fitInto(
params.elementWidth - 20,
params.elementHeight - 60,
params.actualCanvasWidth,
params.actualCanvasHeight,
1
);
let scale = previewFit.width / params.actualCanvasWidth;

let div = BV.el({
css: {
width: params.elementWidth + "px",
height: params.elementHeight + "px",
backgroundColor: "#9e9e9e",
boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
overflow: "hidden",
userSelect: "none",
position: "relative",
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
}
});
div.oncontextmenu = function () {
return false;
};

let innerWrapper = BV.el({
css: {
position: 'relative',
boxShadow: '0 0 5px rgba(0,0,0,0.5)',
width: previewFit.width + 'px',
height: previewFit.height + 'px'
}
});
div.appendChild(innerWrapper);

let previewLayerArr = [];
{
for(let i = 0; i < params.layerArr.length; i++) {
let canvas;
if (i === params.transformIndex) {
canvas = BV.createCanvas(previewFit.width, previewFit.height);
let ctx = canvas.getContext('2d');
ctx.drawImage(params.layerArr[i].canvas, 0, 0, canvas.width, canvas.height);
} else {
canvas = params.layerArr[i].canvas;
}
previewLayerArr.push({
canvas: canvas,
opacity: params.layerArr[i].opacity,
mixModeStr: params.layerArr[i].mixModeStr
});
}
}
let pcCanvasPreview = new BV.PcCanvasPreview({
width: previewFit.width,
height: previewFit.height,
layerArr: previewLayerArr
});
innerWrapper.appendChild(pcCanvasPreview.getElement());


let freeTransform;
function updatePreviewCanvas() {
if(!freeTransform) {
return;
}

let transformationObj = freeTransform.getTransform();
let transformLayerCanvas = previewLayerArr[params.transformIndex].canvas;
let ctx = transformLayerCanvas.getContext('2d');
ctx.save();
ctx.clearRect(0, 0, transformLayerCanvas.width, transformLayerCanvas.height);
BV.drawTransformedImageOnCanvasDeprectated(
transformLayerCanvas,
params.layerArr[params.transformIndex].canvas,
transformationObj
);
ctx.restore();
pcCanvasPreview.render();
}

{
let transformSize = {
width: params.layerArr[params.transformIndex].canvas.width * scale,
height: params.layerArr[params.transformIndex].canvas.height * scale
};
if(transformSize.width > previewFit.width || transformSize.height > previewFit.height) {
transformSize = BV.fitInto(
previewFit.width,
previewFit.height,
params.layerArr[params.transformIndex].canvas.width,
params.layerArr[params.transformIndex].canvas.height,
1
);
}
freeTransform = new BV.FreeTransform({
x: previewFit.width / 2,
y: previewFit.height / 2,
width: transformSize.width,
height: transformSize.height,
angle: 0,
constrained: true,
snapX: [0, previewFit.width],
snapY: [0, previewFit.height],
callback: updatePreviewCanvas
});
}
BV.css(freeTransform.getElement(), {
position: 'absolute',
left: 0,
top: 0
});
innerWrapper.appendChild(freeTransform.getElement());
setTimeout(updatePreviewCanvas, 0);




this.move = function(dX, dY) {
freeTransform.move(dX, dY);
};
this.setTransformOriginal = function() {
let w = params.layerArr[params.transformIndex].canvas.width * scale;
let h = params.layerArr[params.transformIndex].canvas.height * scale;

freeTransform.setSize(w, h);
freeTransform.setPos({x: w / 2, y: h / 2});
freeTransform.setAngle(0);
updatePreviewCanvas();
};
this.setTransformFit = function() {

let fit = BV.fitInto(
previewFit.width,
previewFit.height,
params.layerArr[params.transformIndex].canvas.width,
params.layerArr[params.transformIndex].canvas.height,
1
);

freeTransform.setSize(fit.width, fit.height);
freeTransform.setPos({x: fit.width / 2, y: fit.height / 2});
freeTransform.setAngle(0);
updatePreviewCanvas();
};
this.setTransformCenter = function() {
freeTransform.setPos({x: previewFit.width / 2, y: previewFit.height / 2});
freeTransform.setAngle(0);
updatePreviewCanvas();
};

this.getTransformation = function () {
if (!freeTransform) {
return false;
}

var trans = freeTransform.getTransform();
trans.width /= scale;
trans.height /= scale;
trans.x /= scale;
trans.y /= scale;
return trans;
};
this.getElement = function() {
return div;
};
this.destroy = function() {
freeTransform.destroy();
};
};
/*
	FREETRANSFORM
	params = {
		elem: div,
		x: 100,
		y: 100,
		width: 100,
		height: 100,
		angle: 45,
		constrained: false
		range: {x:0,y:0,width:200,height:200} ...within what allow pos
		allowRotate: false
	
	}

aufbau:
div {
	transdiv [
		elem{}
		outline{}
		edges[]{}
		grips[]{}
		rot{}
		snapX []
		snapY []
		constrained bool
		appendElem bool
		callback function(){}
	}
}

*/
BV.FreeTransform = function (params) {
var elem = params.elem;
var x = params.x;
var y = params.y;
var width = params.width;
var height = params.height;
var angle = params.angle;
var constrained = params.constrained;
var appendElem = params.appendElem;
var snapX = params.snapX;
var snapY = params.snapY;
var callback = params.callback;
var scale = params.scale;
var snappingEnabled = true;
var gripCursors = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
var gripCursorsInverted = ['ne', 'n', 'nw', 'w', 'sw', 's', 'se', 'e'];
var ratio = width / height;
var mindist = 7;

var maindiv = document.createElement("div");
var transdiv = document.createElement("div");
maindiv.appendChild(transdiv);
var div = transdiv;
div.style.position = "absolute";

if (elem && appendElem) {
BV.css(elem, {
width: "1px",
height: "1px",
transformOrigin: "0 0",
position: "absolute"
});
}
BV.css(maindiv, {
userSelect: 'none'
});

var outline = document.createElement("div");
BV.css(outline, {
position: "absolute",
cursor: "move",
boxShadow: 'rgba(255, 255, 255, 0.5) 0 0 0 1px inset, rgba(0, 0, 0, 0.5) 0 0 0 1px'
});

let keyListener = new BV.KeyListener();

let outlinePointerListener = new BV.PointerListener({
target: outline,
onPointer: function(event) {
if (event.type === 'pointerdown') {
outline.startPos = {x: x, y: y};
}
if (event.type === 'pointermove' && event.button === 'left') {
x = outline.startPos.x + event.pageX - event.downPageX;
y = outline.startPos.y + event.pageY - event.downPageY;
var dist;
var snap = {};
if (snappingEnabled) {
for (var i = 0; i < snapX.length; i++) {
dist = Math.abs(x - snapX[i]);
if (dist < mindist) {
if (!snap.x || dist < snap.distX) {
snap.x = snapX[i];
snap.distX = dist;
}
}
}
for (i = 0; i < snapY.length; i++) {
dist = Math.abs(y - snapY[i]);
if (dist < mindist) {
if (!snap.y || dist < snap.distY) {
snap.y = snapY[i];
snap.distY = dist;
}
}
}

var outer;
for (i = 0; i < 4; i++) {
outer = getOuter(grips[i].x, grips[i].y);
for (var j = 0; j < snapX.length; j++) {
dist = Math.abs(outer.x - snapX[j]);
if (dist < mindist) {
if (!snap.x || dist < snap.distX) {
snap.x = snapX[j] - (outer.x - x);
snap.distX = dist;
}
}
}
for (j = 0; j < snapY.length; j++) {
dist = Math.abs(outer.y - snapY[j]);
if (dist < mindist) {
if (!snap.y || dist < snap.distY) {
snap.y = snapY[j] - (outer.y - y);
snap.distY = dist;
}
}
}
}
}
if (keyListener.getComboStr() === 'shift') {
var projected = BV.projectPointOnLine(
{x: 0, y: outline.startPos.y},
{x: 10, y: outline.startPos.y},
{x: x, y: y});
var dist = BV.dist(projected.x, projected.y, x, y);
snap = {};
snap.x = projected.x;
snap.y = projected.y;
snap.distX = dist;
snap.distY = dist;

projected = BV.projectPointOnLine(
{x: outline.startPos.x, y: 0},
{x: outline.startPos.x, y: 10},
{x: x, y: y});
dist = BV.dist(projected.x, projected.y, x, y);
if (dist < snap.distX) {
snap.x = projected.x;
snap.y = projected.y;
snap.distX = dist;
snap.distY = dist;
}

projected = BV.projectPointOnLine(
{x: outline.startPos.x, y: outline.startPos.y},
{x: outline.startPos.x + 1, y: outline.startPos.y + 1},
{x: x, y: y});
dist = BV.dist(projected.x, projected.y, x, y);
if (dist < snap.distX) {
snap.x = projected.x;
snap.y = projected.y;
snap.distX = dist;
snap.distY = dist;
}

projected = BV.projectPointOnLine(
{x: outline.startPos.x, y: outline.startPos.y},
{x: outline.startPos.x + 1, y: outline.startPos.y - 1},
{x: x, y: y});
dist = BV.dist(projected.x, projected.y, x, y);
if (dist < snap.distX) {
snap.x = projected.x;
snap.y = projected.y;
snap.distX = dist;
snap.distY = dist;
}
}
if (snap.x != undefined) {
x = snap.x;
}
if (snap.y != undefined) {
y = snap.y;
}
update();
}
}
})

function checkSnapping(px, py) {
if (!snappingEnabled) {
return {x: px, y: py};
}
var dist, outer = getOuter(px, py), snap = {};
for (var e = 0; e < snapX.length; e++) {
dist = Math.abs(outer.x - snapX[e]);
if (dist < mindist) {
if (!snap.x || dist < snap.distX) {
snap.x = snapX[e];
snap.distX = dist;
}
}
}
for (e = 0; e < snapY.length; e++) {
dist = Math.abs(outer.y - snapY[e]);
if (dist < mindist) {
if (!snap.y || dist < snap.distY) {
snap.y = snapY[e];
snap.distY = dist;
}
}
}
if (snap.x != undefined) {
outer.x = snap.x;
}
if (snap.y != undefined) {
outer.y = snap.y;
}
return getInner(outer.x, outer.y);
}

function constrainedGripPos(i, nx, ny) {
if (!constrained) {
return {
x: nx,
y: ny
};
}
var pa = grips[3], pb = grips[1];
if (i === 0 || i === 2) {
pa = grips[2];
pb = grips[0];
}
var projected = BV.projectPointOnLine(pa, pb, {x: nx, y: ny});

return {
x: projected.x,
y: projected.y
};
}

let gripSize = 14;
var grips = [];
for (var i = 0; i < 4; i++) {
(function (i) {
grips[i] = document.createElement("div");
var g = grips[i];
BV.css(g, {
width: gripSize + "px",
height: gripSize + "px",
background: "#fff",
borderRadius: gripSize + "px",
position: "absolute",
boxShadow: "inset 0 0 0 2px #000"
});

g.update = function () {
var angleOffset = Math.round(angle / 45);
while (angleOffset < 0)
angleOffset += 8;
angleOffset = (i * 2 + angleOffset) % gripCursors.length;
BV.css(g, {
left: (g.x - gripSize / 2) + "px",
top: (g.y - gripSize / 2) + "px"
});
if ((width < 0 && height >= 0) || (width >= 0 && height < 0)) {
BV.css(g, {
cursor: gripCursorsInverted[angleOffset] + "-resize"
});
} else {
BV.css(g, {
cursor: gripCursors[angleOffset] + "-resize"
});
}
};
})(i);
}
grips[0].x = (-width / 2);
grips[0].y = (-height / 2);

grips[1].x = (width / 2);
grips[1].y = (-height / 2);

grips[2].x = (width / 2);
grips[2].y = (height / 2);

grips[3].x = (-width / 2);
grips[3].y = (height / 2);

let grip0PointerListener = new BV.PointerListener({
target: grips[0],
onPointer: function(event) {
if (event.type === 'pointerdown' && event.button === 'left') {
grips[0].virtualPos = {
x: grips[0].x,
y: grips[0].y
};
} else if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);

grips[0].virtualPos.x += inner.x;
grips[0].virtualPos.y += inner.y;
var newPos = constrainedGripPos(0, grips[0].x + inner.x, grips[0].y + inner.y);
if (!constrained) {
newPos = checkSnapping(grips[0].virtualPos.x, grips[0].virtualPos.y);
}
let dX = newPos.x - grips[0].x;
let dY = newPos.y - grips[0].y;
grips[0].x = newPos.x;
grips[0].y = newPos.y;
grips[3].x = grips[0].x;
grips[1].y = grips[0].y;

if(keyListener.isPressed('shift')) {
grips[2].x -= dX;
grips[2].y -= dY;
grips[1].x = grips[2].x;
grips[3].y = grips[2].y;
}

grips[0].virtualPos.x -= grips[0].x * 0.5 + grips[1].x * 0.5;
grips[0].virtualPos.y -= grips[0].y * 0.5 + grips[3].y * 0.5;
commitTransform();

}
}
});
let grip1PointerListener = new BV.PointerListener({
target: grips[1],
onPointer: function(event) {
if (event.type === 'pointerdown' && event.button === 'left') {
grips[1].virtualPos = {
x: grips[1].x,
y: grips[1].y
};
} else if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);

grips[1].virtualPos.x += inner.x;
grips[1].virtualPos.y += inner.y;
var newPos = constrainedGripPos(1, grips[1].x + inner.x, grips[1].y + inner.y);
if (!constrained) {
newPos = checkSnapping(grips[1].virtualPos.x, grips[1].virtualPos.y);
}
let dX = newPos.x - grips[1].x;
let dY = newPos.y - grips[1].y;
grips[1].x = newPos.x;
grips[1].y = newPos.y;
grips[2].x = grips[1].x;
grips[0].y = grips[1].y;

if(keyListener.isPressed('shift')) {
grips[3].x -= dX;
grips[3].y -= dY;
grips[0].x = grips[3].x;
grips[2].y = grips[3].y;
}

grips[1].virtualPos.x -= grips[0].x * 0.5 + grips[1].x * 0.5;
grips[1].virtualPos.y -= grips[0].y * 0.5 + grips[3].y * 0.5;
commitTransform();
}
}
});
let grip2PointerListener = new BV.PointerListener({
target: grips[2],
onPointer: function(event) {
if (event.type === 'pointerdown' && event.button === 'left') {
grips[2].virtualPos = {
x: grips[2].x,
y: grips[2].y
};
} else if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);

grips[2].virtualPos.x += inner.x;
grips[2].virtualPos.y += inner.y;
var newPos = constrainedGripPos(2, grips[2].x + inner.x, grips[2].y + inner.y);
if (!constrained) {
newPos = checkSnapping(grips[2].virtualPos.x, grips[2].virtualPos.y);
}
let dX = newPos.x - grips[2].x;
let dY = newPos.y - grips[2].y;
grips[2].x = newPos.x;
grips[2].y = newPos.y;
grips[1].x = grips[2].x;
grips[3].y = grips[2].y;

if(keyListener.isPressed('shift')) {
grips[0].x -= dX;
grips[0].y -= dY;
grips[3].x = grips[0].x;
grips[1].y = grips[0].y;
}

grips[2].virtualPos.x -= grips[0].x * 0.5 + grips[1].x * 0.5;
grips[2].virtualPos.y -= grips[0].y * 0.5 + grips[3].y * 0.5;
commitTransform();
}
}
});
let grip3PointerListener = new BV.PointerListener({
target: grips[3],
onPointer: function (event) {
if (event.type === 'pointerdown' && event.button === 'left') {
grips[3].virtualPos = {
x: grips[3].x,
y: grips[3].y
};
} else if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);

grips[3].virtualPos.x += inner.x;
grips[3].virtualPos.y += inner.y;
var newPos = constrainedGripPos(3, grips[3].x + inner.x, grips[3].y + inner.y);
if (!constrained) {
newPos = checkSnapping(grips[3].virtualPos.x, grips[3].virtualPos.y);
}
let dX = newPos.x - grips[3].x;
let dY = newPos.y - grips[3].y;
grips[3].x = newPos.x;
grips[3].y = newPos.y;
grips[0].x = grips[3].x;
grips[2].y = grips[3].y;

if(keyListener.isPressed('shift')) {
grips[1].x -= dX;
grips[1].y -= dY;
grips[2].x = grips[1].x;
grips[0].y = grips[1].y;
}

grips[3].virtualPos.x -= grips[0].x * 0.5 + grips[1].x * 0.5;
grips[3].virtualPos.y -= grips[0].y * 0.5 + grips[3].y * 0.5;
commitTransform();
}
}
});

let edgeSize = 10;
var edges = [];
for (var i = 0; i < 4; i++) {
(function (i) {
edges[i] = document.createElement("div");
var g = edges[i];
g.style.width = edgeSize + 'px';
g.style.height = edgeSize + 'px';

g.style.position = "absolute";
g.update = function () {
if (i === 0) {
g.style.left = Math.min(grips[0].x, grips[1].x) + "px";
g.style.top = (Math.min(grips[0].y, grips[3].y) - edgeSize) + "px";
g.style.width = Math.abs(width) + "px";
g.style.height = edgeSize + 'px';

} else if (i === 1) {
g.style.left = Math.max(grips[0].x, grips[1].x) + "px";
g.style.top = Math.min(grips[1].y, grips[2].y) + "px";
g.style.width = edgeSize + 'px';
g.style.height = Math.abs(height) + "px";

} else if (i === 2) {
g.style.left = Math.min(grips[3].x, grips[2].x) + "px";
g.style.top = Math.max(grips[0].y, grips[3].y) + "px";
g.style.width = Math.abs(width) + "px";
g.style.height = edgeSize + 'px';

} else if (i === 3) {
g.style.left = (Math.min(grips[0].x, grips[1].x) - edgeSize) + "px";
g.style.top = Math.min(grips[0].y, grips[3].y) + "px";
g.style.width = edgeSize + 'px';
g.style.height = Math.abs(height) + "px";

}
var angleOffset = Math.round(angle / 45);
while (angleOffset < 0)
angleOffset += 8;
angleOffset = (i * 2 + 1 + angleOffset) % gripCursors.length;
g.style.cursor = gripCursors[angleOffset] + "-resize";

};
})(i);
}

function balanceRatio(boolW, boolH) {
if (!constrained)
return;
if (boolH && !boolW) {
var newHeight = Math.abs(grips[3].y - grips[0].y);
var newWidth = ratio * newHeight;
if (grips[1].x - grips[0].x < 0)
newWidth *= -1;
grips[0].x = -newWidth / 2;
grips[3].x = -newWidth / 2;
grips[1].x = newWidth / 2;
grips[2].x = newWidth / 2;
}
if (!boolH && boolW) {
var newWidth = Math.abs(grips[0].x - grips[1].x);
var newHeight = newWidth / ratio;
if (grips[3].y - grips[0].y < 0)
newHeight *= -1;
grips[0].y = -newHeight / 2;
grips[1].y = -newHeight / 2;
grips[2].y = newHeight / 2;
grips[3].y = newHeight / 2;
}
}

let edge0PointerListener = new BV.PointerListener({
target: edges[0],
onPointer: function(event) {
var inverted = false;
if (event.type === 'pointerdown' && event.button === 'left') {
if (grips[0].y < grips[3].y) {
inverted = false;
} else {
inverted = true;
}
}
if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);
if (inverted === false) {
grips[0].y += inner.y;
grips[1].y += inner.y;
} else {
grips[3].y += inner.y;
grips[2].y += inner.y;
}
if (keyListener.isPressed('shift')) {
if (inverted === false) {
grips[3].y -= inner.y;
grips[2].y -= inner.y;
} else {
grips[0].y -= inner.y;
grips[1].y -= inner.y;
}
}
balanceRatio(false, true);
commitTransform();
}
}
});
let edge1PointerListener = new BV.PointerListener({
target: edges[1],
onPointer: function (event) {
var inverted = false;
if (event.type === 'pointerdown' && event.button === 'left') {
if (grips[0].x < grips[1].x) {
inverted = false;
} else {
inverted = true;
}
}
if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);
if (inverted === false) {
grips[1].x += inner.x;
grips[2].x += inner.x;
} else {
grips[0].x += inner.x;
grips[3].x += inner.x;
}
if (keyListener.isPressed('shift')) {
if (inverted === false) {
grips[0].x -= inner.x;
grips[3].x -= inner.x;
} else {
grips[1].x -= inner.x;
grips[2].x -= inner.x;
}
}
balanceRatio(true, false);
commitTransform();
}
}
});
let edge2PointerListener = new BV.PointerListener({
target: edges[2],
onPointer: function (event) {
var inverted = false;
if (event.type === 'pointerdown' && event.button === 'left') {
if (grips[0].y < grips[3].y) {
inverted = false;
} else {
inverted = true;
}
}
if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);
if (inverted === false) {
grips[2].y += inner.y;
grips[3].y += inner.y;
} else {
grips[0].y += inner.y;
grips[1].y += inner.y;
}
if (keyListener.isPressed('shift')) {
if (inverted === false) {
grips[0].y -= inner.y;
grips[1].y -= inner.y;
} else {
grips[2].y -= inner.y;
grips[3].y -= inner.y;
}
}
balanceRatio(false, true);
commitTransform();
}
}
});
let edge3PointerListener = new BV.PointerListener({
target: edges[3],
onPointer: function (event) {
var inverted = false;
if (event.type === 'pointerdown' && event.button === 'left') {
if (grips[0].x < grips[1].x) {
inverted = false;
} else {
inverted = true;
}
}
if (event.type === 'pointermove' && event.button === 'left') {
var inner = BV.rotateAround({x: 0, y: 0},
{x: event.dX, y: event.dY},
-angle);
if (inverted === false) {
grips[0].x += inner.x;
grips[3].x += inner.x;
} else {
grips[1].x += inner.x;
grips[2].x += inner.x;
}
if (keyListener.isPressed('shift')) {
if (inverted === false) {
grips[1].x -= inner.x;
grips[2].x -= inner.x;
} else {
grips[0].x -= inner.x;
grips[3].x -= inner.x;
}
}
balanceRatio(true, false);
commitTransform();
}
}
});

var rot = document.createElement("div");
let rotPointerListener;
(function () {
var g = rot;
g.snap = false;
BV.css(g, {
cursor: "url(0-4-15--176eb290fdd/img/ui/cursor-rotate.png) 10 10, move",
width: gripSize + "px",
height: gripSize + "px",
background: "#0ff",
borderRadius: gripSize + "px",
position: "absolute",
boxShadow: "inset 0 0 0 2px #000"
});

var line = document.createElement("div");
BV.css(line, {
width: "2px",
height: "13px",
left: (gripSize / 2 - 1) + "px",
top: gripSize + "px",
background: "#0ff",
position: "absolute"
});
g.appendChild(line);

g.update = function () {
BV.css(g, {
left: (g.x - gripSize / 2) + "px",
top: (g.y - gripSize / 2) + "px"
});
};
rotPointerListener = new BV.PointerListener({
target: g,
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {

var offset = BV.getPageOffset(maindiv);
var o = {x: event.pageX - offset.x, y: event.pageY - offset.y};

var a = BV.angleDeg({x: x, y: y}, o);
angle = a;
if (keyListener.getComboStr() === 'shift') {
angle = Math.round(a / 360 * 8) * 45;
}
update();

}
}
});
})();

function commitTransform() {
centerAround(grips[0].x * 0.5 + grips[1].x * 0.5,
grips[0].y * 0.5 + grips[3].y * 0.5);

width = grips[1].x - grips[0].x;
height = grips[3].y - grips[0].y;

grips[0].x = (-width / 2);
grips[0].y = (-height / 2);
grips[1].x = (width / 2);
grips[1].y = (-height / 2);
grips[2].x = (width / 2);
grips[2].y = (height / 2);
grips[3].x = (-width / 2);
grips[3].y = (height / 2);

update();
}

function getInner(ox, oy) {
var px, py;
px = ox - x;
py = oy - y;

var rot = BV.rotateAround({x: 0, y: 0},
{x: px, y: py},
-angle);
px = rot.x;
py = rot.y;

return {
x: px,
y: py
};
}

function getOuter(ix, iy) {
var rot = BV.rotateAround({x: 0, y: 0},
{x: ix, y: iy},
angle);
return {
x: rot.x + x,
y: rot.y + y
};
}

function centerAround(cx, cy) {
var rot = BV.rotateAround({x: 0, y: 0},
{x: cx, y: cy},
angle);
x = rot.x + x;
y = rot.y + y;

update();
}

/**
* update grips according to width height
*/
function updateGripPositions() {
grips[0].x = (-width / 2);
grips[0].y = (-height / 2);
grips[1].x = (width / 2);
grips[1].y = (-height / 2);
grips[2].x = (width / 2);
grips[2].y = (height / 2);
grips[3].x = (-width / 2);
grips[3].y = (height / 2);
}

/**
* updates according to grips and angle
* @param skipcallback
*/
function update(skipcallback) {
BV.css(div, {
left: x + "px",
top: y + "px",
WebkitTransformOrigin: "0 0",
WebkitTransform: "rotate(" + angle + "deg)",
MozTransformOrigin: "0 0",
MozTransform: "rotate(" + angle + "deg)"
});

if(elem) {
if (appendElem) {
BV.css(elem, {
WebkitTransform: "scale(" + width + ", " + height + ")",
MozTransform: "scale(" + width + ", " + height + ")",
left: (grips[0].x) + "px",
top: (grips[0].y) + "px"
});
} else {
BV.css(elem, {
width: "1px",
height: "1px",
position: "absolute",
transformOrigin: "50% 50%",
transform: "rotate(" + angle + "deg) scale(" + width + ", " + height + ")",
left: (x) + "px",
top: (y) + "px"
});
}
}

BV.css(outline, {
width: Math.abs(width) + "px",
height: Math.abs(height) + "px",
left: Math.min(grips[0].x, grips[1].x) + "px",
top: Math.min(grips[0].y, grips[3].y) + "px"
});

grips[0].update();
grips[1].update();
grips[2].update();
grips[3].update();

edges[0].update();
edges[1].update();
edges[2].update();
edges[3].update();


rot.x = 0;
rot.y = (-Math.abs(height) / 2) - 20;
rot.update();
if (!skipcallback) {
if (callback) {
callback(getTransform());
}
}
}

update();
if (elem && appendElem) {
div.appendChild(elem);
}
div.appendChild(outline);
div.appendChild(edges[0]);
div.appendChild(edges[1]);
div.appendChild(edges[2]);
div.appendChild(edges[3]);
div.appendChild(grips[0]);
div.appendChild(grips[1]);
div.appendChild(grips[2]);
div.appendChild(grips[3]);
div.appendChild(rot);

function getTransform() {
return {
x: x,
y: y,
width: width,
height: height,
angle: angle
};
}



this.getTransform = getTransform;
this.setConstrained = function (b) {
if (b) {
constrained = true;
ratio = Math.abs(width / height);
} else {
constrained = false;
}
};
this.setSnapping = function (s) {
snappingEnabled = (s) ? true : false;
};
this.setPos = function (p) {
x = p.x + 0;
y = p.y + 0;
update(true);
};
this.move = function(dX, dY) {
x += dX;
y += dY;
update(false);
};
this.setSize = function(w, h) {
width = w;
height = h;
updateGripPositions();
update(false);
};
this.setAngle = function (a) {
angle = a;
update(true);
};
this.destroy = function() {
keyListener.destroy();
outlinePointerListener.destroy();
grip0PointerListener.destroy();
grip1PointerListener.destroy();
grip2PointerListener.destroy();
grip3PointerListener.destroy();
edge0PointerListener.destroy();
edge1PointerListener.destroy();
edge2PointerListener.destroy();
edge3PointerListener.destroy();
rotPointerListener.destroy();
};
this.getElement = function() {
return maindiv;
};
};

/*
	Cropper params
	{
		x: int,
		y: int,
		w: int,
		h: int,
		scale: float,
		callback: function
	}
	the div that you append this to must be relative
*/
BV.Cropper = function (params) {
var x = params.x,
y = params.y,
width = params.width,
height = params.height,
scale = params.scale,
callback = params.callback,
maxW = params.maxW,
maxH = params.maxH;
var div = document.createElement("div");
var gripCursors = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

let keyListener = new BV.KeyListener({});

BV.css(div, {
position: "absolute",
left: (x * scale) + "px",
top: (y * scale) + "px"
});

var outline = document.createElement("div");
BV.css(outline, {
position: "absolute",
border: "1px dashed #fff",
cursor: "move"
});
outline.update = function () {
BV.css(outline, {
left: (grips[0].x * scale - 1) + "px",
top: (grips[0].y * scale - 1) + "px",
width: ((grips[2].x - grips[0].x) * scale) + "px",
height: ((grips[2].y - grips[0].y) * scale) + "px"
});
};
let outlinePointerListener = new BV.PointerListener({
target: outline,
onPointer: function(event) {
if (event.type === 'pointermove' && event.button === 'left') {
grips[0].x += event.dX / scale;
grips[0].y += event.dY / scale;
grips[1].x += event.dX / scale;
grips[1].y += event.dY / scale;
grips[2].x += event.dX / scale;
grips[2].y += event.dY / scale;
grips[3].x += event.dX / scale;
grips[3].y += event.dY / scale;

update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});

var thirdsHorizontal = document.createElement("div");
BV.css(thirdsHorizontal, {
position: "absolute",
borderTop: "1px solid #0ff",
borderBottom: "1px solid #0ff"
});
thirdsHorizontal.update = function () {
BV.css(thirdsHorizontal, {
left: (grips[0].x * scale) + "px",
top: ((grips[0].y + (grips[2].y - grips[0].y) / 3) * scale) + "px",
width: ((grips[2].x - grips[0].x) * scale) + "px",
height: ((grips[2].y - grips[0].y) / 3 * scale) + "px"

});
};
var thirdsVertical = document.createElement("div");
BV.css(thirdsVertical, {
position: "absolute",
borderLeft: "1px solid #0ff",
borderRight: "1px solid #0ff"
});
thirdsVertical.update = function () {
BV.css(thirdsVertical, {
left: ((grips[0].x + (grips[2].x - grips[0].x) / 3) * scale) + "px",
top: (grips[0].y * scale) + "px",
width: ((grips[2].x - grips[0].x) / 3 * scale) + "px",
height: ((grips[2].y - grips[0].y) * scale) + "px"

});
};

const gripSize = 40;
const gripOverlay = 10;

var grips = [];
grips[0] = {};
grips[0].x = 0;
grips[0].y = 0;
grips[1] = {};
grips[1].x = width;
grips[1].y = 0;
grips[2] = {};
grips[2].x = width;
grips[2].y = height;
grips[3] = {};
grips[3].x = 0;
grips[3].y = height;

function transformTop(dY) {
grips[0].y += dY / scale;
grips[0].y = Math.max(grips[3].y - maxH, Math.min(grips[3].y - 1, grips[0].y));
grips[1].y = grips[0].y;
}
function transformRight(dX) {
grips[1].x += dX / scale;
grips[1].x = Math.min(grips[0].x + maxW, Math.max(grips[0].x + 1, grips[1].x));
grips[2].x = grips[1].x;
}
function transformBottom(dY) {
grips[2].y += dY / scale;
grips[2].y = Math.min(grips[1].y + maxH, Math.max(grips[1].y + 1, grips[2].y));
grips[3].y = grips[2].y;
}
function transformLeft(dX) {
grips[0].x += dX / scale;
grips[0].x = Math.max(grips[1].x - maxW, Math.min(grips[1].x - 1, grips[0].x));
grips[3].x = grips[0].x;
}




var edges = [];
for (var i = 0; i < 4; i++) {
(function (i) {
edges[i] = document.createElement("div");
var g = edges[i];
g.style.width = gripSize + "px";
g.style.height = gripSize + "px";

g.style.position = "absolute";
g.update = function () {
if (i === 0) {
g.style.left = (grips[0].x * scale + gripOverlay) + "px";
g.style.top = (grips[0].y * scale - gripSize * 2 + gripOverlay) + "px";
g.style.width = ((grips[1].x - grips[0].x) * scale - gripOverlay * 2) + "px";
g.style.height = (gripSize * 2) + "px";
} else if (i === 1) {
g.style.left = (grips[1].x * scale - gripOverlay) + "px";
g.style.top = (grips[1].y * scale + gripOverlay) + "px";
g.style.width = (gripSize * 2) + "px";
g.style.height = ((grips[2].y - grips[1].y) * scale - gripOverlay * 2) + "px";
} else if (i === 2) {
g.style.left = (grips[3].x * scale + gripOverlay) + "px";
g.style.top = (grips[3].y * scale - gripOverlay) + "px";
g.style.width = ((grips[2].x - grips[3].x) * scale - gripOverlay * 2) + "px";
g.style.height = (gripSize * 2) + "px";
} else if (i === 3) {
g.style.left = (grips[0].x * scale - gripSize * 2 + gripOverlay) + "px";
g.style.top = (grips[0].y * scale + gripOverlay) + "px";
g.style.width = (gripSize * 2) + "px";
g.style.height = ((grips[3].y - grips[0].y) * scale - gripOverlay * 2) + "px";
}
var angleOffset = i * 2 + 1;
g.style.cursor = gripCursors[angleOffset] + "-resize";

};
})(i);
}

var darken = [];
for (var i = 0; i < 4; i++) {
(function (i) {
darken[i] = document.createElement("div");
var g = darken[i];
g.style.position = "absolute";
g.style.background = "#000";
g.style.opacity = "0.5";
g.update = function () {
if (i === 0) {
g.style.left = (grips[0].x * scale) + "px";
g.style.top = (grips[0].y * scale - 8000) + "px";
g.style.width = ((grips[1].x - grips[0].x) * scale) + "px";
g.style.height = "8000px";
} else if (i === 1) {
g.style.left = (grips[1].x * scale) + "px";
g.style.top = (grips[1].y * scale - 8000) + "px";
g.style.width = "8000px";
g.style.height = 16000 + "px";
} else if (i === 2) {
g.style.left = (grips[3].x * scale) + "px";
g.style.top = (grips[3].y * scale) + "px";
g.style.width = ((grips[2].x - grips[3].x) * scale) + "px";
g.style.height = "8000px";
} else if (i === 3) {
g.style.left = (grips[0].x * scale - 8000) + "px";
g.style.top = (grips[0].y * scale - 8000) + "px";
g.style.width = "8000px";
g.style.height = 16000 + "px";
}

};
})(i);
}

let edge0PointerListener = new BV.PointerListener({
target: edges[0],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformTop(event.dY);
if(keyListener.isPressed('shift')) {
transformBottom(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});
let edge1PointerListener = new BV.PointerListener({
target: edges[1],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformRight(event.dX);
if(keyListener.isPressed('shift')) {
transformLeft(-event.dX);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});
let edge2PointerListener = new BV.PointerListener({
target: edges[2],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformBottom(event.dY);
if(keyListener.isPressed('shift')) {
transformTop(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});
let edge3PointerListener = new BV.PointerListener({
target: edges[3],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformLeft(event.dX);
if(keyListener.isPressed('shift')) {
transformRight(-event.dX);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});


var cornerElArr = [];
(function() {
for (var i = 0; i < 4; i++) {
(function (i) {
cornerElArr[i] = document.createElement("div");
var g = cornerElArr[i];
BV.css(g, {

width: (gripSize * 2) + 'px',
height: (gripSize * 2) + 'px',
position: 'absolute'
});
g.style.cursor = ['nwse-resize', 'nesw-resize'][i % 2];
g.update = function () {
if (i === 0) {
BV.css(g, {
left: (grips[0].x * scale - gripSize * 2 + gripOverlay) + "px",
top: (grips[0].y * scale - gripSize * 2 + gripOverlay) + "px"
});
} else if (i === 1) {
BV.css(g, {
left: (grips[1].x * scale - gripOverlay) + "px",
top: (grips[1].y * scale - gripSize * 2 + gripOverlay) + "px"
});
} else if (i === 2) {
BV.css(g, {
left: (grips[1].x * scale - gripOverlay) + "px",
top: (grips[2].y * scale - gripOverlay) + "px"
});
} else if (i === 3) {
BV.css(g, {
left: (grips[0].x * scale - gripSize * 2 + gripOverlay) + "px",
top: (grips[2].y * scale - gripOverlay) + "px"
});
}
};
})(i);
}
})();

let corner0PointerListener = new BV.PointerListener({
target: cornerElArr[0],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformLeft(event.dX);
transformTop(event.dY);
if(keyListener.isPressed('shift')) {
transformRight(-event.dX);
transformBottom(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});

let corner1PointerListener = new BV.PointerListener({
target: cornerElArr[1],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformRight(event.dX);
transformTop(event.dY);
if(keyListener.isPressed('shift')) {
transformLeft(-event.dX);
transformBottom(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});

let corner2PointerListener = new BV.PointerListener({
target: cornerElArr[2],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformRight(event.dX);
transformBottom(event.dY);
if(keyListener.isPressed('shift')) {
transformLeft(-event.dX);
transformTop(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});

let corner3PointerListener = new BV.PointerListener({
target: cornerElArr[3],
onPointer: function (event) {
if (event.type === 'pointermove' && event.button === 'left') {
transformLeft(event.dX);
transformBottom(event.dY);
if(keyListener.isPressed('shift')) {
transformRight(-event.dX);
transformTop(-event.dY);
}
update();
}
if (event.type === 'pointerup') {
callback(getTransform());
}
}
});




function getTransform() {
grips[1].x -= grips[0].x;
grips[1].y -= grips[0].y;
grips[2].x -= grips[0].x;
grips[2].y -= grips[0].y;
grips[3].x -= grips[0].x;
grips[3].y -= grips[0].y;
x += grips[0].x;
y += grips[0].y;
grips[0].x = 0;
grips[0].y = 0;
return {
x: x,
y: y,
width: grips[1].x,
height: grips[2].y
};
}



div.appendChild(darken[1]);
div.appendChild(darken[0]);
div.appendChild(darken[2]);
div.appendChild(darken[3]);
div.appendChild(thirdsHorizontal);
div.appendChild(thirdsVertical);
div.appendChild(outline);

div.appendChild(edges[1]);
div.appendChild(edges[0]);
div.appendChild(edges[2]);
div.appendChild(edges[3]);

div.appendChild(cornerElArr[0]);
div.appendChild(cornerElArr[1]);
div.appendChild(cornerElArr[2]);
div.appendChild(cornerElArr[3]);

function update() {

edges[0].update();
edges[1].update();
edges[2].update();
edges[3].update();
cornerElArr[0].update();
cornerElArr[1].update();
cornerElArr[2].update();
cornerElArr[3].update();
darken[0].update();
darken[1].update();
darken[2].update();
darken[3].update();
outline.update();
thirdsHorizontal.update();
thirdsVertical.update();
}

update();




this.getTransform = getTransform;

this.setTransform = function (p) {
x = p.x;
y = p.y;
width = p.width;
height = p.height;

BV.css(div, {
left: (x * scale) + "px",
top: (y * scale) + "px"
});

grips[0].x = 0;
grips[0].y = 0;
grips[1].x = width;
grips[1].y = 0;
grips[2].x = width;
grips[2].y = height;
grips[3].x = 0;
grips[3].y = height;

update();
callback(getTransform());
};

this.setScale = function (s) {
scale = s;
BV.css(div, {
left: (x * scale) + "px",
top: (y * scale) + "px"
});
update();
};

this.showThirds = function (b) {
if (b) {
thirdsHorizontal.style.display = "block";
thirdsVertical.style.display = "block";
} else {
thirdsHorizontal.style.display = "none";
thirdsVertical.style.display = "none";
}
};

this.getElement = function() {
return div;
};

this.destroy = function() {
keyListener.destroy();
outlinePointerListener.destroy();
corner0PointerListener.destroy();
corner1PointerListener.destroy();
corner2PointerListener.destroy();
corner3PointerListener.destroy();
edge0PointerListener.destroy();
edge1PointerListener.destroy();
edge2PointerListener.destroy();
edge3PointerListener.destroy();
};

};

/**
* Bar at the bottom of toolspace.
*
* p = {
*     onSwap: function(),
*     showHelp: function(),
*     feedbackDialog: function(),
*     showChangelog: function(),
* }
*
* @param p
* @constructor
*/
BV.BottomBar = function (p) {
var div = document.createElement("div");
BV.css(div, {
width: "270px",
position: "absolute",
bottom: 0,
left: 0
});
var isVisible = false;
var line1 = document.createElement("div");
line1.className = "bottomBarLine1";
div.appendChild(line1);



let swapButton = BV.el({
parent: line1,
title: 'Switch left/right UI',
css: {
backgroundImage: "url(0-4-15--176eb290fdd/img/ui/ui-swap-lr.svg)",
backgroundPosition: 'center'
},
onClick: function(e) {
e.preventDefault();
p.onSwap();
}
});

var helpButton = document.createElement("div");


helpButton.textContent = "Help";
BV.css(helpButton, {
backgroundImage: "url(0-4-15--176eb290fdd/img/ui/help.png)",
backgroundSize: '20px',

fontSize: "13px"
});
helpButton.onclick = function () {
p.showHelp();
};

var feedbackButton = document.createElement("div");
feedbackButton.textContent = "Feedback";
BV.css(feedbackButton, {
backgroundImage: "url(0-4-15--176eb290fdd/img/ui/feedback.png)",
backgroundSize: '20px',

fontSize: "13px"
});
feedbackButton.onclick = function () {
p.feedbackDialog();
};

var changelogButton = document.createElement("div");
var now = new Date();
now.setMilliseconds(0);
now.setSeconds(0);
now.setMinutes(0);
now.setHours(0);
var dateDifference = Math.max(0, (now - new Date(KLEKI.lastUpdate)) / (1000 * 60 * 60 * 24));
var lastUpdateOut = "updated<br/>";
if (dateDifference === 0) {
lastUpdateOut += "<b>today</b>";
} else if (dateDifference === 1) {
lastUpdateOut += "<b>yesterday</b>";
} else {
lastUpdateOut += KLEKI.lastUpdate === '{{version-date}}' ? '9999-99-99' : KLEKI.lastUpdate;
}
changelogButton.innerHTML = lastUpdateOut;
BV.css(changelogButton, {
backgroundImage: "url(0-4-15--176eb290fdd/img/ui/changelog.png)",
fontSize: "10px",
lineHeight: "12px",
paddingTop: "6px",
paddingLeft: '24px',

textAlign: 'center'
});
changelogButton.onclick = function () {
p.showChangelog();
};
line1.appendChild(helpButton);
line1.appendChild(feedbackButton);
line1.appendChild(changelogButton);


function update() {
var height = 0;
if (isVisible) {
height += 36;
line1.style.removeProperty('display');
} else {
line1.style.display = "none";
}
BV.css(div, {
height: height + "px"
});
}

update();

this.setIsVisible = function (b) {
isVisible = b;
update();
};
this.getDiv = function () {
return div;
};
};

BV.ProgressPopup = function (p) {
var div = document.createElement("div");

var bg = document.createElement("div");
var box = document.createElement("div");
var label = document.createElement("div");
label.innerHTML = '<img src="https://bitbof.com/doodler/loading.gif"> Uploading...<b>' + 0 + "%</b>";
var button = document.createElement("button");
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/cancel.png"> Cancel';
div.appendChild(bg);
div.appendChild(box);
box.appendChild(label);
box.appendChild(button);
BV.css(button, {
width: "100px",
position: "absolute",
right: "20px",
bottom: "20px"
});

BV.css(div, {
position: "absolute",
left: 0,
top: 0,
width: "100%",
height: "100%"
});
BV.css(bg, {
position: "absolute",
left: 0,
top: 0,
width: "100%",
height: "100%",
background: "rgba(111,111,111,0.4)"
});
BV.css(box, {
position: "absolute",
left: "50%",
top: "45%",
padding: "20px",
boxSizing: "border-box",
width: "300px",
height: "100px",
marginLeft: "-150px",
marginTop: "-50px",
background: "#fff",
boxShadow: "2px 2px 2px rgba(0,0,0,0.5)",
borderRadius: "10px"
});

button.onclick = function () {
p.callback();
};

this.update = function (v, done) {
if (v > -1 && !done) {
label.innerHTML = '<img src="https://bitbof.com/doodler/loading.gif"> Uploading...<b>' + v + "%</b>";
}
if (v === 100 && done === true) {
label.innerHTML = "<b>Successful Upload</b>";
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/check.png"> Ok';
button.focus();
box.style.background = "rgb(223, 255, 194)";
}
if (v === -1) {
label.innerHTML = "<b>Error: Upload Failed</b>";
button.innerHTML = '<img src="0-4-15--176eb290fdd/img/ui/check.png"> Ok';
box.style.background = "rgb(255, 194, 194)";
}
};
this.getDiv = function () {
return div;
};
};


/**
* Previews currently active layer
* thumbnail (hover shows bigger preview), layername, opacity
*
* internally listens to pc log. updates when there's a change.
* but you need to update it when the active layer changed. (different canvas object)
*
* update visibility for performance
*
* p = {
*     onClick: function()
* }
*
* @param p
* @constructor
*/
BV.LayerPreview = function(p) {








let div = BV.el({});
let layerObj;
let isVisible = true;
const height = 40;
const canvasSize = height - 10;
const largeCanvasSize = 300;
let lastDrawnState = -2;
let lastDrawnSize = {
width: 0,
height: 0
};
let animationCanvas = BV.createCanvas();
let animationCanvasCtx = animationCanvas.getContext('2d');
const animationLength = 30;
let animationCount = 0;
let largeCanvasIsVisible = false;
let largeCanvasAnimationTimeout;
const largeCanvasAnimationDurationMs = 300;
let uiState = 'right';



let contentWrapperEl = BV.el({
css: {
display: 'flex',
alignItems: 'center',
height: height + 'px',
color: '#777'
}
});
let canvasWrapperEl = BV.el({
css: {

minWidth: height + 'px',
height: height + 'px',
display: 'flex',
justifyContent: 'center',
alignItems: 'center'
}
});
let canvas = BV.createCanvas(canvasSize, canvasSize);
let canvasCtx = canvas.getContext('2d');
canvas.title = 'Active Layer';
BV.css(canvas, {
boxShadow: '0 0 0 1px #9e9e9e'
});
let nameWrapper = BV.el({
css: {

flexGrow: 1,
paddingLeft: '10px',
fontSize: '13px',
overflow: 'hidden',
position: 'relative'
}
});
let nameLabelEl = BV.el({
content: '',
css: {
cssFloat: 'left',
whiteSpace: 'nowrap'
}
});
let nameFadeEl = BV.el({
css: {
backgroundImage: 'linear-gradient(to right, rgba(221,221,221,0) 0%, rgba(221,221,221,0.8) 100%)',
position: 'absolute',
right: "0",
top: "0",
width: "50px",
height: '100%'
}
});
let clickableEl = BV.el({
css: {

position: 'absolute',
left: "10px",
top: "0",
width: "90px",
height: '100%'
}
});
if(p.onClick) {
BV.addEventListener(clickableEl,'click', function() {
p.onClick();
});
BV.addEventListener(canvas,'click', function() {
p.onClick();
});
}
let opacityEl = BV.el({
content: 'Opacity<br>100%',
css: {

minWidth: '60px',
fontSize: '12px',
textAlign: 'center'
}
});

let largeCanvas = BV.createCanvas(largeCanvasSize, largeCanvasSize);
let largeCanvasCtx = largeCanvas.getContext('2d');
BV.css(largeCanvas, {

pointerEvents: 'none',
background: '#fff',
position: 'absolute',
right: '280px',
top: '10px',
border: '1px solid #aaa',
boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
transition: 'opacity '+largeCanvasAnimationDurationMs+'ms ease-in-out'
});

div.appendChild(contentWrapperEl);
contentWrapperEl.appendChild(canvasWrapperEl);
canvasWrapperEl.appendChild(canvas);
contentWrapperEl.appendChild(nameWrapper);
nameWrapper.appendChild(nameLabelEl);
nameWrapper.appendChild(nameFadeEl);
nameWrapper.appendChild(clickableEl);
contentWrapperEl.appendChild(opacityEl);


let animationCanvasCheckerPattern = animationCanvasCtx.createPattern(BV.createCheckerCanvas(4), 'repeat');
let largeCanvasCheckerPattern = canvasCtx.createPattern(BV.createCheckerCanvas(4), 'repeat');





function animate() {
if(animationCount === 0) {
return;
}

animationCount--;

canvasCtx.save();
canvasCtx.globalAlpha = Math.pow((animationLength - animationCount) / animationLength, 2);
canvasCtx.drawImage(animationCanvas, 0, 0);
canvasCtx.restore();

if(animationCount > 0) {
requestAnimationFrame(animate);
}
}

function draw(isInstant) {

if(!isVisible) {
return;
}

nameLabelEl.textContent = layerObj.name;
opacityEl.innerHTML = 'Opacity<br>' + Math.round(layerObj.opacity * 100) + '%';

let layerCanvas = layerObj.context.canvas;

if(layerCanvas.width !== lastDrawnSize.width || layerCanvas.height !== lastDrawnSize.height) {
let canvasDimensions = BV.fitInto(canvasSize, canvasSize, layerCanvas.width, layerCanvas.height, 1);
canvas.width = Math.round(canvasDimensions.width);
canvas.height = Math.round(canvasDimensions.height);

isInstant = true;
}

animationCanvas.width = canvas.width;
animationCanvas.height = canvas.height;

animationCanvasCtx.save();
animationCanvasCtx.imageSmoothingEnabled = false;
animationCanvasCtx.fillStyle = animationCanvasCheckerPattern;
animationCanvasCtx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);
animationCanvasCtx.drawImage(layerCanvas, 0, 0, animationCanvas.width, animationCanvas.height);
animationCanvasCtx.restore();

if(isInstant) {
animationCount = 0;
canvasCtx.save();
canvasCtx.drawImage(animationCanvas, 0, 0);
canvasCtx.restore();

} else {
animationCount = animationLength;
animate();

}

drawLargeCanvas();

lastDrawnState = BV.pcLog.getState();
lastDrawnSize.width = layerCanvas.width;
lastDrawnSize.height = layerCanvas.height;
}

function update() {
draw(true);
}

setInterval(function() {

if(!layerObj) {
return;
}

let currentState = BV.pcLog.getState();
if(currentState === lastDrawnState) {
return;
}


layerObj.opacity = layerObj.context.canvas.opacity;

draw(false);

}, 2000);



function drawLargeCanvas() {

if(!largeCanvasIsVisible || !layerObj) {
return;
}

let layerCanvas = layerObj.context.canvas;

let canvasDimensions = BV.fitInto(largeCanvasSize, largeCanvasSize, layerCanvas.width, layerCanvas.height, 1);
largeCanvas.width = Math.round(canvasDimensions.width);
largeCanvas.height = Math.round(canvasDimensions.height);

largeCanvasCtx.save();
largeCanvasCtx.imageSmoothingEnabled = true;
largeCanvasCtx.imageSmoothingQuality = 'high';
largeCanvasCtx.fillStyle = largeCanvasCheckerPattern;
largeCanvasCtx.fillRect(0, 0, largeCanvas.width, largeCanvas.height);
largeCanvasCtx.drawImage(layerCanvas, 0, 0, largeCanvas.width, largeCanvas.height);
largeCanvasCtx.restore();

let offset = BV.getPageOffset(div);
BV.css(largeCanvas, {
top: Math.max(10, (offset.y + height / 2 - largeCanvas.height / 2)) + "px"
});

}

function removeLargeCanvas() {
try {
document.body.removeChild(largeCanvas);
} catch(e) {

}
}

function showLargeCanvas(b) {
if (largeCanvasIsVisible === b) {
return;
}

clearTimeout(largeCanvasAnimationTimeout);
largeCanvasIsVisible = b;

if(b) {
largeCanvasAnimationTimeout = setTimeout(function() {
drawLargeCanvas();
largeCanvas.style.opacity = 0;
document.body.appendChild(largeCanvas);
setTimeout(function() {
largeCanvas.style.opacity = 1;
}, 20);
}, 250);

} else {
largeCanvas.style.opacity = 0;
largeCanvasAnimationTimeout = setTimeout(removeLargeCanvas, largeCanvasAnimationDurationMs + 20);
}

}

let pointerListener = new BV.PointerListener({
target: canvas,
onEnterLeave: function(b) {
showLargeCanvas(b);
}
});





this.getElement = function() {
return div;
};

this.setIsVisible = function(b) {
if(isVisible === b) {
return;
}
isVisible = b;
contentWrapperEl.style.display = isVisible ? 'flex' : 'none';
div.style.marginBottom = isVisible ? '' : '10px';

let currentState = BV.pcLog.getState();
if(b && lastDrawnState !== currentState) {
update();
}
};


this.setLayer = function(pcCanvasLayerObj) {
layerObj = pcCanvasLayerObj;
update();
};

this.setUiState = function(stateStr) {
uiState = '' + stateStr;

if (uiState === 'left') {
BV.css(largeCanvas, {
left: '280px',
right: ''
});
} else {
BV.css(largeCanvas, {
left: '',
right: '280px'
});
}
};

};

/**
* a slider that looks like this
* ------O----
*
* param: {init, width, pointSize, callback(value, isFirst, isLast)}
*
* @param param
* @constructor
*/
BV.PointSlider = function(param) {

var div = document.createElement('div');
div.style.position = 'relative';
var sliderLine = document.createElement("div");
var sliderPoint = document.createElement("div");
div.appendChild(sliderLine);
div.appendChild(sliderPoint);


{
BV.css(sliderLine, {
marginTop: parseInt(param.pointSize / 2 - 1) + 'px',
height: "2px",
background: '#aaa',
width: param.width + "px"
});
}


function redrawPoint() {
sliderPoint.style.left = sliderPos + 'px';
if(isDragging) {
sliderPoint.style.boxShadow = "0 0 6px rgba(0,0,0,1)";
} else {
sliderPoint.style.boxShadow = "0 0 3px rgba(0,0,0,0.8)";
}
}
function getValue() {
return sliderPos /  (param.width - param.pointSize);
}

let pointerListener;
{
var isFirst;
var isDragging = false;
var sliderPos = BV.clamp(param.init * (param.width - param.pointSize), 0, param.width - param.pointSize);
BV.css(sliderPoint, {
position: "absolute",
top: '0px',
backgroundColor: "#eaeaea",
boxShadow: "0 0 3px rgba(0,0,0,0.8)",
width: param.pointSize + "px",
height: param.pointSize + "px",
borderRadius: param.pointSize + "px",
cursor: "ew-resize",
transition: "box-shadow 0.2s ease-in-out"
});
redrawPoint();
var imaginaryPos;
pointerListener = new BV.PointerListener({
target: sliderPoint,
onPointer: function(event) {
if (event.type === 'pointerdown' && event.button === 'left') {
isFirst = true;
isDragging = true;
imaginaryPos = sliderPos;
redrawPoint();
event.eventStopPropagation();
} else if (event.type === 'pointermove' && event.button === 'left') {
event.eventStopPropagation();
imaginaryPos = imaginaryPos + event.dX;
sliderPos = parseInt(BV.clamp(imaginaryPos, 0, param.width - param.pointSize));
redrawPoint();
param.callback(getValue(), isFirst, false);
isFirst = false;
}
if (event.type === 'pointerup') {
event.eventStopPropagation();
isDragging = false;
redrawPoint();
param.callback(getValue(), false, true);
}
}
})
}


this.getEl = function() {
return div;
};
this.setActive = function(isActive) {
if(isActive) {
sliderPoint.style.backgroundColor = "#fff";
} else {
sliderPoint.style.backgroundColor = "#eaeaea";
}
};
this.destroy = function() {
pointerListener.destroy();
};
};

/**
* element that lets you crop an image and copy it via right click
*
* param = {
*     width: number,
*     height: number,
*     canvas: image | canvas,
*     isNotCopy: boolean,
*     onChange: function(width, height)
* }
*
* @param param object
* @constructor
*/
BV.CropCopy = function(param) {
var div = document.createElement('div');
BV.css(div, {
position: 'relative',
height: param.height + 'px',
width: param.width + 'px',
overflow: 'hidden'
});
div.style.position = 'relative';

var crop;
function resetCrop() {
crop = {
x: 0,
y: 0,
width: param.canvas.width,
height: param.canvas.height
};
}
resetCrop();


function updateCroppedCanvas() {
croppedCanvas.width = Math.round(crop.width);
croppedCanvas.height = Math.round(crop.height);
var ctx = croppedCanvas.getContext('2d');
ctx.drawImage(param.canvas, Math.round(-crop.x), Math.round(-crop.y));
if(croppedImage) {
croppedImage.src = croppedCanvas.toDataURL('image/png');
}

if (param.onChange) {
param.onChange(croppedCanvas.width, croppedCanvas.height);
}
}
function updateSelectionRect() {
BV.css(selectionRect, {
left: Math.round(thumbX + crop.x * scaleW) + 'px',
top: Math.round(thumbY + crop.y * scaleH) + 'px',
width: Math.round(crop.width * scaleW) + 'px',
height: Math.round(crop.height * scaleH) + 'px'
});
if (param.onChange) {
param.onChange(parseInt(crop.width), parseInt(crop.height));
}
}
function isInsideSelectionRect(p) {
var rect = {
x: Math.round(thumbX + crop.x * scaleW),
y: Math.round(thumbY + crop.y * scaleH),
width: Math.round(crop.width * scaleW),
height: Math.round(crop.height * scaleH)
};
return rect.x <= p.x && p.x <= rect.x + rect.width &&
rect.y <= p.y && p.y <= rect.y + rect.height;
}

var croppedCanvas = document.createElement('canvas');
var eventTarget = croppedCanvas;
var croppedImage = null;
if(!param.isNotCopy) {
croppedImage = new Image();
eventTarget = croppedImage;
}
BV.css(eventTarget, {
height: param.height + 'px',
width: param.width + 'px'
});
div.appendChild(eventTarget);
updateCroppedCanvas();

var padding = 20;
var previewWrapper = BV.el({
css: {
width: param.width + 'px',
height: param.height + 'px',
position: 'absolute',
left: 0,
top: 0,
pointerEvents: 'none'
}
});
div.appendChild(previewWrapper);
BV.createCheckerDataUrl(4, function(v) {
previewWrapper.style.backgroundImage = 'url('+v+')';
});

var thumbCanvas = document.createElement('canvas');
var thumbSize = BV.fitInto(param.width - padding * 2, param.height - padding * 2, param.canvas.width, param.canvas.height, 1);
thumbCanvas.width = parseInt(thumbSize.width);
thumbCanvas.height = parseInt(thumbSize.height);
thumbCanvas.style.imageRendering = 'pixelated';
var scaleW = thumbCanvas.width / param.canvas.width;
var scaleH = thumbCanvas.height / param.canvas.height;
var thumbCtx = thumbCanvas.getContext('2d');
thumbCtx.drawImage(param.canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
previewWrapper.appendChild(thumbCanvas);
var thumbX = parseInt((param.width - thumbCanvas.width) / 2);
var thumbY = parseInt((param.height - thumbCanvas.height) / 2);
BV.css(thumbCanvas, {
position: 'absolute',
left: thumbX + "px",
top: thumbY + "px"
});

var selectionRect = BV.el({
css: {
position: 'absolute',
boxShadow: '0 0 0 1px #fff, 0 0 0 2px #000, 0 0 40px 1px #000'
}
});
previewWrapper.appendChild(selectionRect);
updateSelectionRect();


function toFullSpace(p) {
return {
x: BV.clamp(parseInt((p.x - thumbX) / scaleW), 0, param.canvas.width),
y: BV.clamp(parseInt((p.y - thumbY) / scaleH), 0, param.canvas.height)
};
}

function genCrop(p1, p2) {
var topLeftP = {
x: Math.min(p1.x, p2.x),
y: Math.min(p1.y, p2.y)
};
var bottomRightP = {
x: Math.max(p1.x, p2.x),
y: Math.max(p1.y, p2.y)
};
var FullTopLeftP = toFullSpace(topLeftP);
var FullBottomRightP = toFullSpace(bottomRightP);
return {
x: FullTopLeftP.x,
y: FullTopLeftP.y,
width: FullBottomRightP.x - FullTopLeftP.x,
height: FullBottomRightP.y - FullTopLeftP.y
}
}

function isReset() {
return crop.x === 0 && crop.y === 0 && crop.width === param.canvas.width && crop.height === param.canvas.height;
}

var startP;
var startCrop = null;
var isDragging = false;
var didMove = false;
var updateCropTimeout;
let pointerListener = new BV.PointerListener({
target: eventTarget,
onPointer: function(event) {
var fullPos;
if (event.type === 'pointerdown' && event.button === 'left') {
event.eventPreventDefault();
isDragging = true;
startP = {
x: event.relX,
y: event.relY
};
if(!isReset() && isInsideSelectionRect(startP)) {
startCrop = {
x: crop.x,
y: crop.y,
width: crop.width,
height: crop.height
};
} else {
crop = genCrop(startP, startP);
}
} else if (event.type === 'pointermove' && event.button === 'left') {
event.eventPreventDefault();
didMove = true;
if(startCrop) {
crop.x = startCrop.x + (event.relX - startP.x) / scaleW;
crop.y = startCrop.y + (event.relY - startP.y) / scaleH;
crop.x = BV.clamp(crop.x, 0, param.canvas.width - crop.width);
crop.y = BV.clamp(crop.y, 0, param.canvas.height - crop.height);
} else {
crop = genCrop(startP, {x: event.relX, y: event.relY});
}
updateSelectionRect();
} else if (event.type === 'pointerup' && startP) {
event.eventPreventDefault();
isDragging = false;
startCrop = null;
startP = null;
if(crop.width === 0 || crop.height === 0 || !didMove) {
resetCrop();
updateSelectionRect();
}
didMove = false;
updateCropTimeout = setTimeout(updateCroppedCanvas, 1);
}
}
});

let keyListener = new BV.KeyListener({
onDown: function(keyStr, e, comboStr) {
if(isDragging) {
return;
}
var doUpdate = false;

var stepSize = Math.max(1, 1 / scaleW);
let shiftIsPressed = keyListener.isPressed('shift');

if(keyStr === 'left') {
if(shiftIsPressed) {
crop.width = BV.clamp(crop.width - stepSize, 1, param.canvas.width - crop.x);
} else {
crop.x = BV.clamp(crop.x - stepSize, 0, param.canvas.width - crop.width);
}
doUpdate = true;
}
if(keyStr === 'right') {
if(shiftIsPressed) {
crop.width = BV.clamp(crop.width + stepSize, 1, param.canvas.width - crop.x);
} else {
crop.x = BV.clamp(crop.x + stepSize, 0, param.canvas.width - crop.width);
}
doUpdate = true;
}
if(keyStr === 'up') {
if(shiftIsPressed) {
crop.height = BV.clamp(crop.height - stepSize, 1, param.canvas.height - crop.y);
} else {
crop.y = BV.clamp(crop.y - stepSize, 0, param.canvas.height - crop.height);
}
doUpdate = true;
}
if(keyStr === 'down') {
if(shiftIsPressed) {
crop.height = BV.clamp(crop.height + stepSize, 1, param.canvas.height - crop.y);
} else {
crop.y = BV.clamp(crop.y + stepSize, 0, param.canvas.height - crop.height);
}
doUpdate = true;
}

if(doUpdate) {
e.preventDefault();
updateSelectionRect();
clearTimeout(updateCropTimeout);
updateCropTimeout = setTimeout(updateCroppedCanvas, 100);
}
}
});

this.getEl = function() {
return div;
};
this.reset = function() {
resetCrop();
updateCroppedCanvas();
updateSelectionRect();
};
this.destroy = function() {
keyListener.destroy();
pointerListener.destroy();
};
this.isReset = function() {
return isReset();
};
this.getRect = function() {
return JSON.parse(JSON.stringify(crop));
};
this.getCroppedImage = function() {
return croppedCanvas;
};
};

/**
* fades in a little message that reminds user to save their draw
* goes away by itself. stays a few seconds
*/
BV.showSaveReminderToast = function(remindersShowed) {
let inner = BV.el({
content: '<b>Reminder to save</b><br>Unsaved work may be lost.'
});
var div = BV.el({
content: inner,
className: "reminder-toast g-root",
css: {
opacity: 0,
top: '-20px'
}
});

var transitionMs = 300;
var durationMs = 3500;

let mix = Math.min(1, remindersShowed / 5);
let colA = [0,0,0];
let colB = [255,0,0];
let col = [
Math.round(BV.mix(colA[0], colB[0], mix)),
Math.round(BV.mix(colA[1], colB[1], mix)),
Math.round(BV.mix(colA[2], colB[2], mix))
];
inner.style.background = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ', ' + (0.5 + mix * 0.5) + ')';

document.body.appendChild(div);
setTimeout(function() {
div.style.opacity = 1;
div.style.top = '10px';
}, 22);
setTimeout(function() {
div.style.opacity = 0;
}, durationMs + transitionMs);
setTimeout(function() {
document.body.removeChild(div);
}, durationMs + 2 * transitionMs);
};

/**
* fits image into a size
* params: {
*    image: image,
*    width: int,
*    height: int
* }
*
* methods:
* getDiv()
*
* @param params
* @constructor
*/
BV.FittedImage = function(params) {
var fit = BV.fitInto(params.width, params.height, params.image.width, params.image.height, 1);
var w = parseInt(fit.width);
var h = parseInt(fit.height);

var canvas = BV.createCanvas();
canvas.width = w;
canvas.height = h;

canvas.getContext("2d").drawImage(params.image, 0, 0, w, h);
BV.css(canvas, {
display: "block",
boxShadow: "0 0 0 1px #aaa"
});

this.getElement = function() {
return canvas;
};
};


/**
* transformObj: {angleDegree: number, translate: {x: number, y: number}, scale: {x: number, y: number}}
*
* @param params object - {target, pcCanvas, importImage, callback(transformObj | void)}
*/
BV.showImportAsLayerDialog = function(params) {

var div = document.createElement("div");
BV.appendTextDiv(div, "Adjust the position of the imported image.");
if(params.pcCanvas.isLayerLimitReached()) {
var noteEl = BV.el({
content: 'Layer limit reached. Image will be placed on existing layer.',
css: {
background: '#ff0',
padding: '10px',
marginTop: '5px',
marginBottom: '5px',
border: '1px solid #e7d321',
borderRadius: '5px'
}
});
div.appendChild(noteEl);
}
let isSmall = window.innerWidth < 550;

let buttonRowEl = BV.el({
css: {
display: 'flex'
}
});
let originalSizeBtn = BV.el({
tagName: 'button',
content: '1:1',
css: {
marginRight: '10px'
},
onClick: function() {
freeTransformCanvas.setTransformOriginal();
}
});
let fitSizeBtn = BV.el({
tagName: 'button',
content: 'Fit',
css: {
marginRight: '10px'
},
onClick: function() {
freeTransformCanvas.setTransformFit();
}
});
let centerBtn = BV.el({
tagName: 'button',
content: 'Center',
css: {
marginRight: '10px'
},
onClick: function() {
freeTransformCanvas.setTransformCenter();
}
});
buttonRowEl.appendChild(originalSizeBtn);
buttonRowEl.appendChild(fitSizeBtn);
buttonRowEl.appendChild(centerBtn);
div.appendChild(buttonRowEl);



let layerArr = [];
{
let pcCanvasLayerArr = params.pcCanvas.getLayers();
for(let i = 0; i < pcCanvasLayerArr.length; i++) {
layerArr.push({
canvas: pcCanvasLayerArr[i].context.canvas,
opacity: pcCanvasLayerArr[i].opacity,
mixModeStr: pcCanvasLayerArr[i].mixModeStr
});
}
}
layerArr.push({
canvas: params.importImage,
opacity: 1,
mixModeStr: 'source-over'
});


var freeTransformCanvas = new BV.FreeTransformCanvas({
elementWidth: isSmall ? 340 : 540,
elementHeight: isSmall ? 280 : 350,
actualCanvasWidth: params.pcCanvas.getLayerContext(0).canvas.width,
actualCanvasHeight: params.pcCanvas.getLayerContext(0).canvas.height,
layerArr: layerArr,
transformIndex: layerArr.length - 1
});
BV.css(freeTransformCanvas.getElement(), {
marginTop: '10px',
marginLeft: '-20px'
});
div.appendChild(freeTransformCanvas.getElement());

function move(x, y) {
freeTransformCanvas.move(x, y);
}

let keyListener = new BV.KeyListener({
onDown: function(keyStr) {
if (keyStr === 'left') {
move(-1, 0);
}
if (keyStr === 'right') {
move(1, 0);
}
if (keyStr === 'up') {
move(0, -1);
}
if (keyStr === 'down') {
move(0, 1);
}
}
});

BV.popup({
target: params.target,
message: "<b>Import Image as New Layer</b>",
div: div,
style: isSmall ? {} : {
width: '500px'
},
buttons: ["Ok", "Cancel"],
callback: function(buttonStr) {
keyListener.destroy();
freeTransformCanvas.destroy();
if(buttonStr === 'Ok') {

var freeTransformTransformationObj = freeTransformCanvas.getTransformation();
var transformObj = {
angleDegree: freeTransformTransformationObj.angle,
translate: {
x: Math.round(freeTransformTransformationObj.x - params.importImage.width / 2),
y: Math.round(freeTransformTransformationObj.y - params.importImage.height / 2)
},
scale: {
x: freeTransformTransformationObj.width / params.importImage.width,
y: freeTransformTransformationObj.height / params.importImage.height
}
};

params.callback(transformObj);
} else {
params.callback();
}
}
});

};


/**
* Not really generalized. UI when you drag/drop an image into kleki window.
* The moment you create it, it will listen.
*
* @param p object {onDrop: func(files, optionStr), target: DOM Element, enabledTest: func -> bool} - optionStr: 'default'|'layer'|'image'
* @constructor
*/
BV.PcImageDropper = function(p) {


let rootEl = BV.el({
content: 'Drop to import',
css: {
paddingTop: '100px',
position: 'fixed',
left: 0,
top: 0,
width: '100%',
height: '100%',
background: 'rgba(50, 50, 50, 0.7)',
color: '#fff',
textShadow: '2px 2px #000',
textAlign: 'center',
fontSize: '25px'
}
});
let wrapperEl = BV.el({
css: {
'marginTop': '50px',
'display': 'flex',
'justifyContent': 'center'
}
});
let optionStyle = {
width: '200px',
padding: '50px',
margin: '10px',

borderRadius: '20px',
border: '1px dashed #fff',
background: '#00aefe',
fontWeight: 'bold'
};
let optionLayerEl = BV.el({
content: 'As Layer',
css: optionStyle
});
let optionImageEl = BV.el({
content: 'As New Image',
css: optionStyle
});

rootEl.appendChild(wrapperEl);
wrapperEl.appendChild(optionLayerEl);
wrapperEl.appendChild(optionImageEl);


let rootCounter = 0;
let optionLayerCounter = 0;
let optionImageCounter = 0;

function destroy() {
rootCounter = 0;
optionLayerCounter = 0;
optionImageCounter = 0;
try {
p.target.removeChild(rootEl);
} catch (e) { }
}

function testAcceptType(event) {
try {
return !event.dataTransfer.types.includes('text/plain');
} catch(e) {

}
return false;
}

function updateOptions() {
let boxShadow = '0 0 20px 4px #fff';
if(optionLayerCounter > 0) {
optionLayerEl.style.boxShadow = boxShadow;
optionImageEl.style.boxShadow = '';
} else if(optionImageCounter > 0) {
optionLayerEl.style.boxShadow = '';
optionImageEl.style.boxShadow = boxShadow;
} else {
optionLayerEl.style.boxShadow = '';
optionImageEl.style.boxShadow = '';
}
}

BV.addEventListener(optionLayerEl,'dragenter', function() {
optionLayerCounter++;
updateOptions();
});
BV.addEventListener(optionLayerEl,'dragleave', function() {
optionLayerCounter--;
updateOptions();
});
BV.addEventListener(optionImageEl,'dragenter', function() {
optionImageCounter++;
updateOptions();
});
BV.addEventListener(optionImageEl,'dragleave', function() {
optionImageCounter--;
updateOptions();
});


function rootDragOver(event) {
if(!testAcceptType(event)) {
return;
}
event.stopPropagation();
event.preventDefault();
}
function rootDragEnter(event) {
if(!p.enabledTest() || !testAcceptType(event)) {
return;
}
if(rootCounter === 0) {
p.target.appendChild(rootEl);
}
rootCounter++;

}
function rootDragLeave(event) {
if(!testAcceptType(event) || rootCounter === 0) {
return;
}
rootCounter = Math.max(0, rootCounter - 1);
if(rootCounter === 0) {
p.target.removeChild(rootEl);
}

}
function rootDrop(event) {
if(!testAcceptType(event) || event.dataTransfer.files.length === 0) {
destroy();
return;
}
event.stopPropagation();
event.preventDefault();

let optionStr = 'default';
if(optionLayerCounter > 0) {
optionStr = 'layer';
} else if(optionImageCounter > 0) {
optionStr = 'image';
}

p.onDrop(event.dataTransfer.files, optionStr);


if(rootCounter > 0) {
p.target.removeChild(rootEl);
}
rootCounter = 0;
optionLayerCounter = 0;
optionImageCounter = 0;
updateOptions();
}

BV.addEventListener(window,'dragover', rootDragOver, false);
BV.addEventListener(window,'dragenter', rootDragEnter, false);
BV.addEventListener(window,'dragleave', rootDragLeave, false);
BV.addEventListener(window,'drop', rootDrop, false);


BV.addEventListener(rootEl, 'pointerdown', function() {
destroy();
});
let keyListener = BV.KeyListener({
onDown: function(keyStr) {
if (rootCounter > 0 && keyStr === 'esc') {
destroy();
}
}
});

};

/**
* Compressed HUD toolspace. When you hold ctrl+alt.
* small color picker. in future more ui elements (brushsize, opacity)
*
* p = {
*     brushSettingService: BV.BrushSettingService,
*     enabledTest: func(): bool,
* }
*
* @param p
* @constructor
*/
BV.OverlayToolspace = function(p) {

let sizeObj = {
width: 150,
svHeight: 90,
hHeight: 20,
sliderHeight: 25
}

let isEnabled = true;
let isVisible = false;
let div = BV.el({
css: {
position: 'absolute',
left: '500px',
top: '500px',


background: 'rgb(221, 221, 221)',
display: 'none',
border: '1px solid #fff',
boxShadow: '0 0 10px rgba(0,0,0,0.5)'
}
});
let queuedObj = {
color: null,
size: null,
opacity: null
};





let colorSlider = new BV.PcSmallColorSlider({
width: sizeObj.width,
heightSV: sizeObj.svHeight,
heightH: sizeObj.hHeight,
color: p.brushSettingService.getColor(),
callback: function (rgbObj) {
selectedColorEl.style.backgroundColor = "rgb(" + rgbObj.r + "," + rgbObj.g + "," + rgbObj.b + ")";
p.brushSettingService.setColor(rgbObj, subscriptionFunc);
}
});
let selectedColorEl = BV.el({
css: {
width: sizeObj.width + 'px',
height: sizeObj.hHeight + 'px',
pointerEvents: 'none'
}
});
{
let initialColor = p.brushSettingService.getColor();
selectedColorEl.style.backgroundColor = "rgb(" + initialColor.r + "," + initialColor.g + "," + initialColor.b + ")";
}

div.appendChild(selectedColorEl);
div.appendChild(colorSlider.getElement());


function updateColor(rgbObj) {
colorSlider.setColor(rgbObj);
selectedColorEl.style.backgroundColor = "rgb(" + rgbObj.r + "," + rgbObj.g + "," + rgbObj.b + ")";
}







let sizeSlider = new BV.PcSlider({
label: 'Size',
width: sizeObj.width,
height: sizeObj.sliderHeight,
min: 0,
max: 500,
initValue: 50,
resolution: 225,
eventResMs: 1000 / 30,
onChange: function(v) {
p.brushSettingService.setSize(v);
},
formatFunc: function(v) {
if(v * 2 < 10) {
return Math.round(v * 2 * 10) / 10;
}
return Math.round(v * 2);
}
});
BV.css(sizeSlider.getElement(), {
marginTop: '2px'
});
div.appendChild(sizeSlider.getElement());

let opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: sizeObj.width,
height: sizeObj.sliderHeight,
min: 0,
max: 1,
initValue: 1,
resolution: 225,
eventResMs: 1000 / 30,
onChange: function(v) {
p.brushSettingService.setOpacity(v);
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});
BV.css(opacitySlider.getElement(), {
margin: '2px 0'
});
div.appendChild(opacitySlider.getElement());





let subscriptionFunc = function(event) {
if(event.type === 'color') {
if(!isVisible) {
queuedObj.color = event.value;
} else {
updateColor(event.value);
}
}
if(event.type === 'size') {
if(!isVisible) {
queuedObj.size = event.value;
} else {
sizeSlider.setValue(event.value);
}
}
if(event.type === 'opacity') {
if(!isVisible) {
queuedObj.opacity = event.value;
} else {
opacitySlider.setValue(event.value);
}
}
if(event.type === 'sliderConfig') {
sizeSlider.update(event.value.sizeSlider);
opacitySlider.update(event.value.opacitySlider);
}
};
p.brushSettingService.subscribe(subscriptionFunc);
{
let sliderConfig = p.brushSettingService.getSliderConfig();
sizeSlider.update(sliderConfig.sizeSlider);
opacitySlider.update(sliderConfig.opacitySlider);
sizeSlider.setValue(p.brushSettingService.getSize());
opacitySlider.setValue(p.brushSettingService.getOpacity());
}

function updateUI() {
div.style.display = isVisible ? 'block' : 'none';
if(isVisible && mousePos) {
div.style.left = (mousePos.x - Math.round(sizeObj.width / 2)) + 'px';
div.style.top = (mousePos.y - Math.round(sizeObj.svHeight + sizeObj.hHeight * 3 / 2)) + 'px';
}
}

let mousePos = null;
BV.addEventListener(document, 'pointermove', function(event) {
mousePos = {
x: event.pageX,
y: event.pageY,
};
});

let keyListener = new BV.KeyListener({
onDown: function(keyStr, event, comboStr, isRepeat) {
if(isRepeat) {
return;
}
if(isVisible) {
isVisible = false;
updateUI();
return;
}

if(!p.enabledTest() || !mousePos) {
return;
}

if(['ctrl+alt', 'cmd+alt', 'alt+ctrl', 'alt+cmd'].includes(comboStr)) {
event.preventDefault();
isVisible = true;

if(queuedObj.color !== null) {
updateColor(queuedObj.color);
queuedObj.color = null;
}
if(queuedObj.size !== null) {
sizeSlider.setValue(queuedObj.size);
queuedObj.size = null;
}
if(queuedObj.opacity !== null) {
opacitySlider.setValue(queuedObj.opacity);
queuedObj.opacity = null;
}

updateUI();
}

},
onUp: function(keyStr, event, oldComboStr) {
if(['ctrl+alt', 'cmd+alt', 'alt+ctrl', 'alt+cmd'].includes(oldComboStr) && isVisible) {
isVisible = false;
colorSlider.end();
updateUI();
}
},
onBlur: function() {
if(isVisible) {
isVisible = false;
colorSlider.end();
updateUI();
}
}
});


this.getElement = function() {
return div;
};

};

/**
* Topmost row of buttons in toolspace (with the kleki logo)
*
* p = {
*     onKleki: function(),
*     onNew: function(),
*     onImport: function(),
*     onSave: function(),
*     onShare: function(),
*     onHelp: function()
* }
*
* @param p
* @constructor
*/
BV.ToolspaceTopRow = function(p) {
let div = document.createElement('div');
BV.css(div, {
height: '36px',

display: 'flex',
backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.6) 100%)'
});

function createButton(p) {
let padding = 6 + (p.extraPadding ? p.extraPadding : 0);
let result = BV.el({
className: 'toolspace-row-button nohighlight',
title: p.title,
onClick: p.onClick,
css: {
padding: p.contain ? padding + 'px 0' : ''
}
});
let im = BV.el({
css: {
backgroundImage: 'url(\'' + p.image + '\')',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
backgroundSize: p.contain ? 'contain' : '',

height: '100%'
}
});
im.style.pointerEvents = 'none';
result.appendChild(im);
result.pointerListener = new BV.PointerListener({
target: result,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(result, 'toolspace-row-button-hover');
} else {
BV.removeClassName(result, 'toolspace-row-button-hover');
}
}
});
return result;
}

let klekiButton = createButton({
onClick: p.onKleki,
title: 'Intro / Gallery / About',
image: '0-4-15--176eb290fdd/img/kleki-logo.svg',
contain: true
});
klekiButton.style.width = '45px';
klekiButton.style.borderRight = '1px solid rgb(212, 212, 212)';
let newButton = createButton({
onClick: p.onNew,
title: 'New Image',
image: '0-4-15--176eb290fdd/img/ui/new-image.png'
});
let importButton = createButton({
onClick: p.onImport,
title: 'Import Image',
image: '0-4-15--176eb290fdd/img/ui/import.png'
});
let saveButton = createButton({
onClick: p.onSave,
title: 'Save Image',
image: '0-4-15--176eb290fdd/img/ui/export.png',
extraPadding: 1,
contain: true
});

let shareButton = null;
if(BV.canShareFiles()) {
shareButton = createButton({
onClick: p.onShare,
title: 'Share',
image: '0-4-15--176eb290fdd/img/ui/share.png',
contain: true
});
}
let helpButton = createButton({
onClick: p.onHelp,
title: 'Help',
image: '0-4-15--176eb290fdd/img/ui/help.png',
contain: true
});

div.appendChild(klekiButton);
div.appendChild(newButton);
div.appendChild(importButton);
div.appendChild(saveButton);
if(shareButton) {
div.appendChild(shareButton);
}
div.appendChild(helpButton);



this.getElement = function() {
return div;
}
};


/**
* Toolrow Dropdown. The button where you select: brush, fill, select, transform, etc.
* Touches KLEKI.isInDialog when dropdown open.
*
* p = {
*     onChange: func(activeStr)
* }
*
* activeStr = 'draw' | 'fill' | 'text'
*
* @param p
* @constructor
*/
BV.ToolDropdown = function(p) {

let optionArr = ['draw', 'fill', 'text', 'shape'];
let imArr = ['tool-paint.png', 'tool-fill.png', 'tool-text.png', 'tool-shape.png'];
let currentActiveIndex = 0;
let isActive = true;
let isOpen = false;


setTimeout(function() {
for(let i = 1; i < imArr.length; i++) {
let im = new Image();
im.src = '0-4-15--176eb290fdd/img/ui/' + imArr[i];
}
}, 100);

let smallMargin = '6px 0';
let div = BV.el({
css: {
position: 'relative',
flexGrow: '1'
}
});

let openTimeout;
let isDragging = false;
let startX, startY;
let pointerListener;
if (BV.hasPointerEvents()) {
pointerListener = new BV.PointerListener({
target: div,
maxPointers: 1,
onPointer: function(event) {
if (event.type === 'pointerdown') {
if (isOpen) {
return;
}

openTimeout = setTimeout(function() {
showDropdown();
}, 400);
isDragging = true;
startX = event.pageX;
startY = event.pageY;

} else if (event.type === 'pointermove') {
if (isDragging && !isOpen && BV.dist(startX, startY, event.pageX, event.pageY) > 5) {
clearTimeout(openTimeout);
showDropdown();
}

} else if (event.type === 'pointerup') {
clearTimeout(openTimeout);
if (isOpen && isDragging) {
let target = document.elementFromPoint(event.pageX, event.pageY);
for (let i = 0; i < dropdownBtnArr.length; i++) {
if (target === dropdownBtnArr[i].wrapper) {
closeDropdown();
isActive = true;
currentActiveIndex = i;
updateImage();
p.onChange(optionArr[currentActiveIndex]);
break;
}
}
}
isDragging = false;
}
}
});
}

let activeButton = BV.el({
parent: div,
className: 'toolspace-row-button nohighlight toolspace-row-button-activated',

onClick: function(e) {
if (isActive && !isOpen) {
e.preventDefault();
e.stopPropagation();
showDropdown();
return;
}

isActive = true;
p.onChange(optionArr[currentActiveIndex]);
if (isOpen) {
closeDropdown();
}
},
css: {
padding: '10px 0',
pointerEvents: 'auto',
height: '100%',
boxSizing: 'border-box'
}
});

let activeButtonPL = new BV.PointerListener({
target: activeButton,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(activeButton, 'toolspace-row-button-hover');
} else {
BV.removeClassName(activeButton, 'toolspace-row-button-hover');
}
}
});

let activeButtonIm = BV.el({
parent: activeButton,
css: {
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
backgroundSize: 'contain',
width: 'calc(100% - 7px)',
height: '100%',
pointerEvents: 'none',
opacity: 0.75,
}
});

let arrowButton = BV.el({
parent: activeButton,
css: {
position: 'absolute',
right: '1px',
bottom: '1px',
width: '18px',
height: '18px',


cursor: 'pointer',

backgroundImage: 'url(\'' + '0-4-15--176eb290fdd/img/ui/caret-down.png' + '\')',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
backgroundSize: '60%'
},
onClick: function(e) {
e.preventDefault();
e.stopPropagation();
showDropdown();
}
});


let overlay = BV.el({
css: {
position: 'absolute',

left: 0,
top: 0,
right: 0,
bottom: 0
}
});
let overlayPointerListener = new BV.PointerListener({
target: overlay,
pointers: 1,
onPointer: function(e) {
if (e.type === 'pointerdown') {
e.eventPreventDefault();
closeDropdown();
}
}
});

let dropdownWrapper = BV.el({
className: 'tool-dropdown-wrapper',
css: {
position: 'absolute',
width: '100%',
height: (100 * (optionArr.length - 1)) + '%',
top: '100%',
left: '0',
zIndex: 1,
boxSizing: 'border-box',
cursor: 'pointer',
transition: 'height 0.1s ease-in-out, opacity 0.1s ease-in-out'
}
});

let dropdownBtnArr = [];

function createDropdownButton(p) {
let result = {};

let wrapper = BV.el({
parent: dropdownWrapper,
className: 'tool-dropdown-button',
css: {
padding: '10px 0',
height: (100 / (optionArr.length - 1)) + '%',
boxSizing: 'border-box'
},
onClick: function(e) {
e.preventDefault();
e.stopPropagation();
p.onClick(p.index, p.id);
}
});
result.wrapper = wrapper;
let im = BV.el({
parent: wrapper,
css: {
backgroundImage: 'url(\'' + '0-4-15--176eb290fdd/img/ui/' + p.image + '\')',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
backgroundSize: 'contain',
height: '100%',
pointerEvents: 'none',
opacity: 0.75
}
});


result.show = function(b) {
wrapper.style.display = b ? 'block' : 'none';
};

result.setIsSmall = function(b) {
wrapper.style.padding = b ? smallMargin : '10px 0';
};

return result;
}

function onClickDropdownBtn(index, id) {
closeDropdown();

isActive = true;
currentActiveIndex = index;

updateImage();

p.onChange(optionArr[currentActiveIndex]);
}

for (let i = 0; i < optionArr.length; i++) {
dropdownBtnArr.push(createDropdownButton({
index: i,
id: optionArr[i],
image: imArr[i],
onClick: onClickDropdownBtn
}));
}

function showDropdown() {
KLEKI.isInDialog++;
isOpen = true;

for (let i = 0; i < optionArr.length; i++) {
dropdownBtnArr[i].show(currentActiveIndex !== i);
}

arrowButton.style.display = 'none';
div.style.zIndex = 1;
document.body.appendChild(overlay);
div.appendChild(dropdownWrapper);
}

function closeDropdown() {
KLEKI.isInDialog--;
isOpen = false;
arrowButton.style.removeProperty('display');
div.style.removeProperty('z-index');
document.body.removeChild(overlay);

div.removeChild(dropdownWrapper);
}

function updateImage() {
activeButtonIm.style.backgroundImage = 'url(\'' + '0-4-15--176eb290fdd/img/ui/' + imArr[currentActiveIndex] + '\')';
}
updateImage();




this.setIsSmall = function(b) {
activeButton.style.padding = b ? smallMargin : '10px 0';
for (let i = 0; i < optionArr.length; i++) {
dropdownBtnArr[i].setIsSmall(b);
}
if (b) {
arrowButton.style.width = '14px';
arrowButton.style.height = '14px';
} else {
arrowButton.style.width = '18px';
arrowButton.style.height = '18px';
}
};

this.setActive = function(activeStr) {
if (optionArr.includes(activeStr)) {
isActive = true;
for (let i = 0; i < optionArr.length; i++) {
if (optionArr[i] === activeStr) {
currentActiveIndex = i;
break;
}
}
BV.addClassName(activeButton, 'toolspace-row-button-activated');
updateImage();
} else {
isActive = false;
BV.removeClassName(activeButton, 'toolspace-row-button-activated');
}
};

this.getActive = function() {
return optionArr[currentActiveIndex];
};

this.getElement = function() {
return div;
};
};


/**
* Row of buttons in toolspace. tools (draw, hand), zoom, undo/redo
* Need to do syncing. So tool is correct, and zoom/undo/redo buttons are properly enabled/disabled
* heights: 54px tall, 36px small -> via setIsSmall
*
* p = {
*     onActivate: function(activeStr),
*     onZoomIn: function(),
*     onZoomOut: function(),
*     onUndo: function(),
*     onRedo: function(),
* }
*
* activeStr = 'draw' | 'hand' | 'fill' | 'text'
*
* @param p
* @constructor
*/
BV.ToolspaceToolRow = function(p) {
let div = document.createElement('div');
BV.css(div, {
height: '54px',

display: 'flex',
backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.6) 100%)'
});

let currentActiveStr = 'draw';
let zoomInIsEnabled = true;
let zoomInOutEnabled = true;
let undoIsEnabled = false;
let redoIsEnabled = false;

function setActive(activeStr, doEmit) {
if(currentActiveStr === activeStr) {
return;
}

currentActiveStr = activeStr;

toolDropdown.setActive(currentActiveStr);
if(currentActiveStr === 'hand') {
BV.addClassName(handButton, 'toolspace-row-button-activated');
} else {
BV.removeClassName(handButton, 'toolspace-row-button-activated');
}

if(doEmit) {
p.onActivate(currentActiveStr);
}
}

function createButton(p) {

let smallMargin = p.doLighten ? '6px 0' : '8px 0';

let result = BV.el({
className: 'toolspace-row-button nohighlight',

onClick: p.onClick,
css: {
padding: p.contain ? '10px 0' : ''
}
});
let im = BV.el({
css: {
backgroundImage: 'url(\'' + p.image + '\')',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
backgroundSize: p.contain ? 'contain' : '',

height: '100%',
transform: p.doMirror ? 'scale(-1, 1)' : '',
pointerEvents: 'none',
opacity: p.doLighten ? 0.75 : 1
}
});
result.appendChild(im);
result.pointerListener = new BV.PointerListener({
target: result,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(result, 'toolspace-row-button-hover');
} else {
BV.removeClassName(result, 'toolspace-row-button-hover');
}
}
});
result.setIsSmall = function(b) {
result.style.padding = p.contain ? (b ? smallMargin : '10px 0') : '';
}
return result;
}


function createTriangleButton(p) {

let result = document.createElement('div');
BV.css(result, {
flexGrow: 1,
position: 'relative'
});

let svg = BV.createSvg({
elementType: 'svg',
width: '67px',
height: '54px',
viewBox: '0 0 100 100',
preserveAspectRatio: 'none'
});
BV.css(svg, {
position: 'absolute',
left: 0,
top: 0
});

let blurRadius = 10;
let blurOffsetX = 2;
let blurOffsetY = 2;

let defs = BV.createSvg( {
elementType: 'defs',
childrenArr: [
{
elementType: 'filter',
id: 'innershadow',
x0: '-50%',
y0: '-50%',
width: '200%',
height: '200%',
childrenArr: [
{
elementType: 'feGaussianBlur',
in: 'SourceAlpha',
stdDeviation: blurRadius,
result: 'blur'
}, {
elementType: 'feOffset',
dx: blurOffsetX,
dy: blurOffsetY
}, {
elementType: 'feComposite',
in2: 'SourceAlpha',
operator: 'arithmetic',
k2: -1,
k3: 1,
result: 'shadowDiff'
},

{
elementType: 'feFlood',
'flood-color': '#000',
'flood-opacity': 0.2
}, {
elementType: 'feComposite',
in2: 'shadowDiff',
operator: 'in'
}, {
elementType: 'feComposite',
in2: 'SourceGraphic',
operator: 'over',
result: 'firstfilter'
},

{
elementType: 'feGaussianBlur',
in: 'firstfilter',
stdDeviation: blurRadius,
result: 'blur2'
}, {
elementType: 'feOffset',
dx: blurOffsetX,
dy: blurOffsetY
}, {
elementType: 'feComposite',
in2: 'firstfilter',
operator: 'arithmetic',
k2: -1,
k3: 1,
result: 'shadowDiff'
},

{
elementType: 'feFlood',
'flood-color': '#000',
'flood-opacity': 0.2
}, {
elementType: 'feComposite',
in2: 'shadowDiff',
operator: 'in'
}, {
elementType: 'feComposite',
in2: 'firstfilter',
operator: 'over'
}
]
}
]
});


let svgTriangleLeft = BV.createSvg({
elementType: 'path',
'vector-effect': 'non-scaling-stroke',
d: 'M0,0 L 100,0 0,100 z',
fill: 'rgba(0,0,0,0)',
class: 'toolspace-svg-triangle-button'
});
svgTriangleLeft.onclick = function() {
p.onLeft();
BV.removeClassName(svgTriangleLeft, 'toolspace-svg-triangle-button-hover');
};

let svgTriangleRight = BV.createSvg({
elementType: 'path',
'vector-effect': 'non-scaling-stroke',
d: 'M100,100 L 100,0 0,100 z',
fill: 'rgba(0,0,0,0)',
class: 'toolspace-svg-triangle-button'
});
svgTriangleRight.onclick = function() {
p.onRight();
BV.removeClassName(svgTriangleRight, 'toolspace-svg-triangle-button-hover');
};


result.leftPointerListener = new BV.PointerListener({
target: svgTriangleLeft,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(svgTriangleLeft, 'toolspace-svg-triangle-button-hover');
} else {
BV.removeClassName(svgTriangleLeft, 'toolspace-svg-triangle-button-hover');
}
}
});
result.rightPointerListener = new BV.PointerListener({
target: svgTriangleRight,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(svgTriangleRight, 'toolspace-svg-triangle-button-hover');
} else {
BV.removeClassName(svgTriangleRight, 'toolspace-svg-triangle-button-hover');
}
}
});


svg.appendChild(defs);
svg.appendChild(svgTriangleLeft);
svg.appendChild(svgTriangleRight);
result.appendChild(svg);


let leftIm = BV.el({
css: {
backgroundImage: 'url(\'' + p.leftImage + '\')',
backgroundRepeat: 'no-repeat',
backgroundSize: 'contain',
width: '20px',
height: '20px',
position: 'absolute',
left: '10px',
top: '8px',

pointerEvents: 'none'
}
});
result.appendChild(leftIm);


let rightIm = BV.el({
css: {
backgroundImage: 'url(\'' + (p.rightImage ? p.rightImage : p.leftImage) + '\')',
backgroundRepeat: 'no-repeat',
backgroundSize: 'contain',
width: '20px',
height: '20px',
position: 'absolute',
right: '10px',
bottom: '8px',
transform: p.rightImage ? '' : 'scale(-1, 1)',
pointerEvents: 'none'
}
});
result.appendChild(rightIm);





result.setIsEnabledLeft = function(b) {
if(b) {
BV.removeClassName(svgTriangleLeft, 'toolspace-row-button-disabled');
BV.removeClassName(leftIm, 'toolspace-row-button-disabled');
} else {
BV.addClassName(svgTriangleLeft, 'toolspace-row-button-disabled');
BV.addClassName(leftIm, 'toolspace-row-button-disabled');
}
};
result.setIsEnabledRight = function(b) {
if(b) {
BV.removeClassName(svgTriangleRight, 'toolspace-row-button-disabled');
BV.removeClassName(rightIm, 'toolspace-row-button-disabled');
} else {
BV.addClassName(svgTriangleRight, 'toolspace-row-button-disabled');
BV.addClassName(rightIm, 'toolspace-row-button-disabled');
}
};

return result;
}

function createTriangleButtonViaClipPath(p) {
let result = document.createElement('div');
BV.css(result, {
flexGrow: 1,
position: 'relative'
});


let leftButton = BV.el({
className: 'toolspace-triangle-button',
onClick: p.onLeft,
css: {
clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 100%)'
}
});

let leftIm = BV.el({
css: {
backgroundImage: 'url(\'' + p.leftImage + '\')',
backgroundRepeat: 'no-repeat',
backgroundSize: 'contain',
width: '20px',
height: '20px',
position: 'absolute',
left: '10px',
top: '8px',

pointerEvents: 'none'
}
});
leftButton.appendChild(leftIm);



let rightButton = BV.el({
className: 'toolspace-triangle-button',
onClick: p.onRight,
css: {
clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%, 0% 100%)'
}
});

let rightIm = BV.el({
css: {
backgroundImage: 'url(\'' + (p.rightImage ? p.rightImage : p.leftImage) + '\')',
backgroundRepeat: 'no-repeat',
backgroundSize: 'contain',
width: '20px',
height: '20px',
position: 'absolute',
right: '10px',
bottom: '8px',
transform: p.rightImage ? '' : 'scale(-1, 1)',
pointerEvents: 'none'
}
});
rightButton.appendChild(rightIm);



result.appendChild(leftButton);
result.appendChild(rightButton);



result.leftPointerListener = new BV.PointerListener({
target: leftButton,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(leftButton, 'toolspace-row-button-hover');
} else {
BV.removeClassName(leftButton, 'toolspace-row-button-hover');
}
}
});
result.rightPointerListener = new BV.PointerListener({
target: rightButton,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(rightButton, 'toolspace-row-button-hover');
} else {
BV.removeClassName(rightButton, 'toolspace-row-button-hover');
}
}
});



result.setIsEnabledLeft = function(b) {
if(b) {
BV.removeClassName(leftButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(leftButton, 'toolspace-row-button-disabled');
}
};
result.setIsEnabledRight = function(b) {
if(b) {
BV.removeClassName(rightButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(rightButton, 'toolspace-row-button-disabled');
}
};
return result;
}

/*let brushButton = createButton({
onClick: function() {
setActive('draw', true);
},
image: '0-4-15--176eb290fdd/img/ui/paint.png',
contain: true,
doLighten: true
});
BV.addClassName(brushButton, 'toolspace-row-button-activated');
div.appendChild(brushButton);*/

let toolDropdown = new BV.ToolDropdown({
onChange: function(activeStr) {
setActive(activeStr, true);
}
});
div.appendChild(toolDropdown.getElement());

let handButton = createButton({
onClick: function() {
setActive('hand', true);
},
image: '0-4-15--176eb290fdd/img/ui/tool-move.png',
contain: true,
doLighten: true
});
handButton.style.borderRight = '1px solid rgb(212, 212, 212)';
div.appendChild(handButton);

let zoomInNOutButton = createTriangleButton({
onLeft: p.onZoomIn,
onRight: p.onZoomOut,
leftImage: '0-4-15--176eb290fdd/img/ui/tool-zoom-in.png',
rightImage: '0-4-15--176eb290fdd/img/ui/tool-zoom-out.png',
});
div.appendChild(zoomInNOutButton);

let zoomInButton = createButton({
onClick: p.onZoomIn,
image: '0-4-15--176eb290fdd/img/ui/tool-zoom-in.png',
contain: true
});
div.appendChild(zoomInButton);

let zoomOutButton = createButton({
onClick: p.onZoomOut,
image: '0-4-15--176eb290fdd/img/ui/tool-zoom-out.png',
contain: true
});
div.appendChild(zoomOutButton);

let undoNRedoButton = createTriangleButton({
onLeft: p.onUndo,
onRight: p.onRedo,
leftImage: '0-4-15--176eb290fdd/img/ui/tool-undo.png',
rightImage: null,
});
undoNRedoButton.setIsEnabledLeft(false);
undoNRedoButton.setIsEnabledRight(false);
div.appendChild(undoNRedoButton);

let undoButton = createButton({
onClick: p.onUndo,
image: '0-4-15--176eb290fdd/img/ui/tool-undo.png',
contain: true
});
BV.addClassName(undoButton, 'toolspace-row-button-disabled');
div.appendChild(undoButton);

let redoButton = createButton({
onClick: p.onRedo,
image: '0-4-15--176eb290fdd/img/ui/tool-undo.png',
contain: true,
doMirror: true
});
BV.addClassName(redoButton, 'toolspace-row-button-disabled');
div.appendChild(redoButton);

zoomInButton.style.display = 'none';
zoomOutButton.style.display = 'none';
undoButton.style.display = 'none';
redoButton.style.display = 'none';







this.getElement = function() {
return div;
};
this.setIsSmall = function(b) {
BV.css(div, {
height: b ? '36px' : '54px'
});

toolDropdown.setIsSmall(b);
handButton.setIsSmall(b);
zoomInButton.setIsSmall(b);
zoomOutButton.setIsSmall(b);
undoButton.setIsSmall(b);
redoButton.setIsSmall(b);

if(b) {
zoomInNOutButton.style.display = 'none';
undoNRedoButton.style.display = 'none';
zoomInButton.style.display = 'block';
zoomOutButton.style.display = 'block';
undoButton.style.display = 'block';
redoButton.style.display = 'block';
} else {
zoomInNOutButton.style.display = 'block';
undoNRedoButton.style.display = 'block';
zoomInButton.style.display = 'none';
zoomOutButton.style.display = 'none';
undoButton.style.display = 'none';
redoButton.style.display = 'none';
}

};

this.setEnableZoomIn = function(b) {
if(b) {
BV.removeClassName(zoomInButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(zoomInButton, 'toolspace-row-button-disabled');
}
zoomInNOutButton.setIsEnabledLeft(b);
};
this.setEnableZoomOut = function(b) {
if(b) {
BV.removeClassName(zoomOutButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(zoomOutButton, 'toolspace-row-button-disabled');
}
zoomInNOutButton.setIsEnabledRight(b);
};
this.setEnableUndo = function(b) {
if(b) {
BV.removeClassName(undoButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(undoButton, 'toolspace-row-button-disabled');
}
undoNRedoButton.setIsEnabledLeft(b);
};
this.setEnableRedo = function(b) {
if(b) {
BV.removeClassName(redoButton, 'toolspace-row-button-disabled');
} else {
BV.addClassName(redoButton, 'toolspace-row-button-disabled');
}
undoNRedoButton.setIsEnabledRight(b);
};
this.setActive = function(activeStr) {
setActive(activeStr);
};
this.getActive = function() {
return currentActiveStr;
};

};

/**
* Ui to select stabilizer level. 4 options. returned as 0-3
*
* p = {
*     smoothing: number,
*     onSelect: function(level number)
* }
*
* @param p
* @constructor
*/
BV.ToolspaceStabilizerRow = function(p) {

let div = BV.el({
content: 'Stabilizer&nbsp;',
title: 'Line Stabilizer',
css: {
display: 'flex',
alignItems: 'center',
fontSize: '13px',
color: 'rgba(0,0,0,0.6)'
}
});

let strengthSelect = new BV.Select({
optionArr: [
[0, '0'],
[1, '1'],
[2, '2'],
[3, '3'],
[4, '4'],
[5, '5']
],
initValue: p.smoothing,
onChange: function(val) {
p.onSelect(val);
}
});
div.appendChild(strengthSelect.getElement());

let pointerListener = new BV.PointerListener({
target: div,
onWheel: function(e) {
strengthSelect.setDeltaValue(e.deltaY);
}
});



this.getElement = function() {
return div;
};
};


/**
* UI to pick between colors in colorArr. can display full transparent (checkerboard).
* Can't deal with 0.5 alpha.
* Rectangular buttons.
*
* p = {
*     colorArr: rgba[],
*     onChange: func(rgbaObj),
*     label: string,
*     initialIndex: int// optional, index before duplicates were removed
* }
*
* @param p
* @constructor
*/
BV.ColorOptions = function(p) {
let div = BV.el({
content: p.label ? p.label : '',
css: {
display: 'flex',
alignItems: 'center'
}
});

let selectedIndex = 0;
let colorArr = [];
let buttonArr = [];
const buttonSize = 22;
const checkerUrl = BV.createCheckerDataUrl(5);


for (let i = 0; i < p.colorArr.length; i++) {
let item = p.colorArr[i];
let found = false;
for (let e = 0; e < colorArr.length; e++) {
let sItem = colorArr[e];
if (sItem === null || item === null) {
continue;
}
if (sItem.r === item.r && sItem.g === item.g && sItem.b === item.b && sItem.a === item.a) {
found = true;
break;
}
}
if (found) {
continue;
}
colorArr.push(item);
if ('initialIndex' in p && p.initialIndex === i) {
selectedIndex = colorArr.length - 1;
}
}

for(let i = 0; i < colorArr.length; i++) {
(function(i) {

let colorButton = BV.el({
content: colorArr[i] ? '' : 'X',
css: {
width: buttonSize + 'px',
height: buttonSize + 'px',
backgroundColor: colorArr[i] ? BV.ColorConverter.toRgbaStr(colorArr[i]) : 'transparent',
marginLeft: '7px',
boxShadow: '0 0 0 1px #aaa',
cursor: 'pointer',
userSelect: 'none',
textAlign: 'center',
lineHeight: (buttonSize + 1) + 'px',
color: '#aaa'
}
});
if(colorArr[i] && colorArr[i].a === 0) {
colorButton.style.backgroundImage = 'url(' + checkerUrl + ')';
}

colorButton.onclick = function(e) {
e.preventDefault();
selectedIndex = i;
update();
p.onChange(colorArr[i]);
};

colorButton.setIsSelected = function(b) {
if(b) {
BV.css(colorButton, {
boxShadow: '0 0 0 2px var(--active-highlight-color), 0 0 5px 0 var(--active-highlight-color)',
pointerEvents: 'none'
});
} else {
BV.css(colorButton, {
boxShadow: '0 0 0 1px #aaa',
pointerEvents: ''
});
}
};


div.appendChild(colorButton);
buttonArr.push(colorButton);
})(i);
}


function update() {
for(let i = 0; i < buttonArr.length; i++) {
buttonArr[i].setIsSelected(i === selectedIndex);
}
}
update();


this.getElement = function() {
return div;
};
};

/**
* row of tabs. uses css class .tabrow-tab
*
* p = {
*     initialId: string,
*     useAccent: boolean,
*     tabArr: [
*         {
*             id: string,
*             label: string,
*             image: string,
*             title: string,
*             isVisible: boolean,
*             onOpen: function(),
*             onClose: function()
*         }
*     ]
* }
*
* @param p
* @constructor
*/
BV.TabRow = function(p) {
let _this = this;
let height = 35;
let div = BV.el({
className: 'tabrow',
css: {
height: height + 'px'
}
});

let tabArr = [];
let openedTabObj = null;

function createTab(pTabObj, initialId, useAccent) {
let result = {
id: pTabObj.id,
isVisible: 'isVisible' in pTabObj ? pTabObj.isVisible : true,
onOpen: pTabObj.onOpen,
onClose: pTabObj.onClose,
update: function(openedTabObj) {
tabDiv.className = openedTabObj === result ? (useAccent ? 'tabrow-tab tabrow-tab-opened-accented' : 'tabrow-tab tabrow-tab-opened') : 'tabrow-tab';
tabDiv.style.display = result.isVisible ? 'block' : 'none';
}
};
let tabDiv = BV.el({
content: 'label' in pTabObj ? pTabObj.label : '',
title: 'title' in pTabObj ? pTabObj.title : undefined,
className: initialId === result.id ? (useAccent ? 'tabrow-tab tabrow-tab-opened-accented' : 'tabrow-tab tabrow-tab-opened') : 'tabrow-tab',
css: {
lineHeight: height + 'px',
display: result.isVisible ? 'block' : 'none'
},
onClick: function() {
if (openedTabObj === result) {
return;
}
_this.open(result.id);
}
});
if ('image' in pTabObj) {
BV.css(tabDiv, {
backgroundImage: 'url(' + pTabObj.image + ')',
backgroundSize: (height - 7) + 'px'
});
}
div.appendChild(tabDiv);

let pointerListener = new BV.PointerListener({
target: tabDiv,
onEnterLeave: function(isOver) {
if(isOver) {
BV.addClassName(tabDiv, 'tabrow-tab-hover');
} else {
BV.removeClassName(tabDiv, 'tabrow-tab-hover');
}
}
});

if(initialId === result.id) {
result.onOpen();
} else {
result.onClose();
}

return result;
}

for(let i = 0; i < p.tabArr.length; i++) {
tabArr.push(createTab(p.tabArr[i], p.initialId, p.useAccent));
}

for(let i = 0; i < tabArr.length; i++) {
if (tabArr[i].id === p.initialId) {
openedTabObj = tabArr[i];
}
}
if(openedTabObj === null) {
throw 'invalid initialId';
}

function update() {
for(let i = 0; i < tabArr.length; i++) {
tabArr[i].update(openedTabObj);
}
}


this.getElement = function() {
return div;
};

this.open = function(tabId) {
for(let i = 0; i < tabArr.length; i++) {
if(tabArr[i].id === tabId) {
if(openedTabObj === tabArr[i]) {
return;
}
openedTabObj.onClose();
openedTabObj = tabArr[i];
openedTabObj.onOpen();
update();
return;
}
}
throw 'TabRow.open - invalid tabId';
};

this.getOpenedTabId = function() {
return '' + openedTabObj.id;
};

this.setIsVisible = function(tabId, isVisible) {
for(let i = 0; i < tabArr.length; i++) {
if(tabArr[i].id === tabId) {
tabArr[i].isVisible = !!isVisible;
update();
return;
}
}
throw 'TabRow.setIsVisible - invalid tabId';
};
};

/**
* Ui, when hand tool tab is open.
*
* p = {
*     scale: number,
*     angleDeg: number,
*     onReset: function(),
*     onFit: function(),
*     onAngleChange: function(angleDeg number, isRelative number)
* }
*
* @param p
* @constructor
*/
BV.HandUi = function(p) {
let div = BV.el({
css: {
margin: '10px'
}
});
let isVisible = true;
let scale = p.scale;
let angleDeg = p.angleDeg;

let row1 = BV.el({
css: {
marginBottom: '10px',
display: 'flex'
}
});
div.appendChild(row1);
let row2 = BV.el({
css: {
display: 'flex'
}
});
div.appendChild(row2);


let scaleEl = BV.el({
css: {
width: '55px',
userSelect: 'none'
}
});
row1.appendChild(scaleEl);

let angleIm = new Image();
angleIm.src = '0-4-15--176eb290fdd/img/ui/angle.png';
BV.css(angleIm, {
verticalAlign: 'bottom',
width: '20px',
height: '20px',
marginRight: '5px',
borderRadius: '10px',
background: 'rgba(0,0,0,0.2)',
userSelect: 'none'
});
row1.appendChild(angleIm);

let angleEl = BV.el({
css: {
userSelect: 'none'
}
});
row1.appendChild(angleEl);


function update() {
scaleEl.innerHTML = Math.round(scale * 100) + '%';
angleEl.innerHTML =  Math.round(angleDeg) + '°';


angleIm.style.transform = 'rotate(' + angleDeg + 'deg)';
if(angleDeg % 90 === 0) {
angleIm.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255, 1), 0 0 0 1px rgba(0, 0, 0, 0.3)';
} else {
angleIm.style.boxShadow = '';
}
};
update();


let resetButton = BV.el({
tagName: 'button',
content: 'Reset',
onClick: p.onReset
});
BV.makeUnfocusable(resetButton);
row2.appendChild(resetButton);

let fitButton = BV.el({
tagName: 'button',
content: 'Fit',
css: {
marginLeft: '10px'
},
onClick: p.onFit
});
BV.makeUnfocusable(fitButton);
row2.appendChild(fitButton);

let leftRotateButton = BV.el({
tagName: 'button',
content: '⟲',
css: {
marginLeft: '10px'
},
onClick: function() {
p.onAngleChange(-15, true);
}
});
BV.makeUnfocusable(leftRotateButton);
row2.appendChild(leftRotateButton);

let resetAngleButton = BV.el({
tagName: 'button',
content: '0°',
css: {
marginLeft: '10px'
},
onClick: function() {
p.onAngleChange(0);
}
});
BV.makeUnfocusable(resetAngleButton);
row2.appendChild(resetAngleButton);

let rightRotateButton = BV.el({
tagName: 'button',
content: '⟳',
css: {
marginLeft: '10px'
},
onClick: function() {
p.onAngleChange(15, true);
}
});
BV.makeUnfocusable(rightRotateButton);
row2.appendChild(rightRotateButton);




this.getElement = function() {
return div;
};
this.setIsVisible = function(pIsVisible) {
isVisible = !!pIsVisible;
div.style.display = isVisible ? 'block' : 'none';
if(isVisible) {
update();
}
};
this.update = function(pScale, pAngleDeg) {
scale = pScale;
angleDeg = pAngleDeg;
if(isVisible) {
update();
}
};
};

/**
* Paint Bucket tab contents (color slider, opacity slider, etc)
*
* p = {
*     colorSlider: PcColorSlider// when opening tab, inserts it (snatches it from where else it was)
* }
*
* @param p
* @constructor
*/
BV.FillUi = function(p) {
let div = BV.el({
css: {
margin: '10px'
}
});
let isVisible = true;

let colorDiv = BV.el({
parent: div,
css: {
marginBottom: '10px'
}
});

let opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 250,
height: 30,
min: 0,
max: 1,
initValue: 1,
onChange: function (val) {
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});
div.appendChild(opacitySlider.getElement());

let toleranceSlider = new BV.PcSlider({
label: 'Tolerance',
width: 250,
height: 30,
min: 0,
max: 255,
initValue: 255 / 100 * 20,
onChange: function (val) {
},
formatFunc: function(v) {
return Math.round(v / 255 * 100);
}
});
BV.css(toleranceSlider.getElement(), {
marginTop: '10px'
});
div.appendChild(toleranceSlider.getElement());

let selectRow = BV.el({
parent: div,
css: {
display: 'flex',
marginTop: '10px'
}
});

let modeWrapper;
let modeSelect;
modeWrapper = BV.el({
content: 'Sample&nbsp;',
css: {
fontSize: '15px'
}
});
modeSelect = new BV.Select({
optionArr: [
['all', 'All'],
['current', 'Active'],
['above', 'Above']
],
initValue: 'all',
onChange: function(val) {}
});
modeWrapper.appendChild(modeSelect.getElement());
selectRow.appendChild(modeWrapper);

let growWrapper;
let growSelect;
growWrapper = BV.el({
content: 'Grow&nbsp;',
css: {
fontSize: '15px',
marginLeft: '10px'
}
});
growSelect = new BV.Select({
optionArr: [
[0, '0'],
[1, '1'],
[2, '2'],
[3, '3'],
[4, '4'],
[5, '5'],
[6, '6'],
[7, '7'],
],
initValue: 0,
onChange: function(val) {}
});
growWrapper.appendChild(growSelect.getElement());
selectRow.appendChild(growWrapper);


let isContiguous = true;
var contiguousToggle = BV.checkBox({
init: true,
label: 'Contiguous',
callback: function (b) {
isContiguous = b;
}
});
contiguousToggle.style.marginTop = "10px";
contiguousToggle.style.paddingRight = "5px";
contiguousToggle.style.display = 'inline-block';
div.appendChild(contiguousToggle);






this.getElement = function() {
return div;
};

this.setIsVisible = function(pIsVisible) {
isVisible = !!pIsVisible;
div.style.display = isVisible ? 'block' : 'none';
if(isVisible) {
colorDiv.appendChild(p.colorSlider.getElement());
colorDiv.appendChild(p.colorSlider.getOutputElement());
}
};

this.getTolerance = function() {
return toleranceSlider.getValue();
};

this.getOpacity = function() {
return opacitySlider.getValue();
};

/**
* returns string 'current' | 'all' | 'above'
*/
this.getSample = function() {
return modeSelect.getValue();
};

this.getGrow = function() {
return parseInt(growSelect.getValue(), 10);
}

this.getContiguous = function() {
return isContiguous;
};

};

/**
* Text Tool tab contents (color slider)
*
* p = {
*     colorSlider: PcColorSlider// when opening tab, inserts it (snatches it from where else it was)
* }
*
* @param p
* @constructor
*/
BV.TextUi = function(p) {
let div = BV.el({
css: {
margin: '10px'
}
});
let isVisible = true;

let colorDiv = BV.el({
parent: div,
css: {
marginBottom: '10px'
}
});

let hint = BV.el({
parent: div,
content: 'Click canvas to place text'
});




this.getElement = function() {
return div;
};

this.setIsVisible = function(pIsVisible) {
isVisible = !!pIsVisible;
div.style.display = isVisible ? 'block' : 'none';
if(isVisible) {
colorDiv.appendChild(p.colorSlider.getElement());
colorDiv.appendChild(p.colorSlider.getOutputElement());

}
};

};

/**
* Shape Tool tab contents
*
* p = {
*     colorSlider: PcColorSlider// when opening tab, inserts it (snatches it from where else it was)
* }
*
* @param p
* @constructor
*/
BV.ShapeUi = function(p) {
let div = BV.el({
css: {
margin: '10px'
}
});
let isVisible = true;

let colorDiv = BV.el({
parent: div,
css: {
marginBottom: '10px'
}
});

let previewSize = 35;
let previewPadding = 8;


let rectSvgRect = BV.createSvg({
elementType: 'rect',
x: previewPadding,
width: previewSize - previewPadding * 2
});
let rectSvg = BV.createSvg({
elementType: 'svg',
width: previewSize,
height: previewSize
});
rectSvg.appendChild(rectSvgRect);
BV.css(rectSvg, {
display: 'block'
});


let ellipseSvgEllipse = BV.createSvg({
elementType: 'ellipse',
cx: previewSize / 2,
cy: previewSize / 2,
rx: previewSize / 2 - previewPadding
});
let ellipseSvg = BV.createSvg({
elementType: 'svg',
width: previewSize,
height: previewSize,
});
ellipseSvg.appendChild(ellipseSvgEllipse);
BV.css(ellipseSvg, {
display: 'block'
});


let lineSvgLine = BV.createSvg({
elementType: 'line',
x1: previewPadding,
x2: previewSize - previewPadding
});
let lineSvg = BV.createSvg({
elementType: 'svg',
width: previewSize,
height: previewSize
});
lineSvg.appendChild(lineSvgLine);
BV.css(lineSvg, {
display: 'block'
});

function updatePreviews() {
let strokeWidth = BV.clamp(Math.round(lineWidthSlider.getValue() / 10), 1, 10) + 'px';

let squish = 1.35;

BV.css(
rectSvgRect,
modeOptions.getValue() === 'fill'
? { fill: 'black', stroke: 'none' }
: { fill: 'none', stroke: 'black', strokeWidth: strokeWidth }
);
BV.css(
ellipseSvgEllipse,
modeOptions.getValue() === 'fill'
? { fill: 'black', stroke: 'none' }
: { fill: 'none', stroke: 'black', strokeWidth: strokeWidth }
);
BV.css(
lineSvgLine,
{ fill: 'none', stroke: 'black', strokeWidth: strokeWidth }
);

if (fixedToggle.getValue()) {
rectSvgRect.setAttribute('y', previewPadding);
rectSvgRect.setAttribute('height', previewSize - previewPadding * 2);

ellipseSvgEllipse.setAttribute('ry', previewSize / 2 - previewPadding);
} else {
rectSvgRect.setAttribute('y', previewPadding * squish);
rectSvgRect.setAttribute('height', previewSize - previewPadding * squish * 2);

ellipseSvgEllipse.setAttribute('ry', previewSize / 2 - previewPadding * squish);
}

if (snapToggle.getValue()) {
lineSvgLine.setAttribute('y1', previewSize - previewPadding);
lineSvgLine.setAttribute('y2', previewPadding);
} else {
lineSvgLine.setAttribute('y1', previewSize - previewPadding * squish);
lineSvgLine.setAttribute('y2', previewPadding * squish);
}
}

let row1 = BV.el({
parent: div,
css: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center'
}
});

let shapeOptions = new BV.Options({
optionArr: [
{
id: 'rect',
label: rectSvg,
title: 'Rectangle'
},
{
id: 'ellipse',
label: ellipseSvg,
title: 'Ellipse'
},
{
id: 'line',
label: lineSvg,
title: 'Line'
}
],
initId: 'rect',
onChange: function(id) {
BV.css(modeOptions.getElement(), {
display: id === 'line' ? 'none' : null
});

BV.css(fixedToggle, {
display: id === 'line' ? 'none' : null
});
BV.css(snapToggle, {
display: id === 'line' ? null : 'none'
});
BV.css(lineWidthSlider.getElement(), {
display: (id !== 'line' && modeOptions.getValue() === 'fill') ? 'none' : null
});
},
changeOnInit: true
});
row1.appendChild(shapeOptions.getElement());

let eraserToggle = new BV.checkBox({
init: false,
label: 'Eraser',
callback: function(b) {
updatePreviews();
}
});
row1.appendChild(eraserToggle);

let modeOptions = new BV.Options({
optionArr: [
{
id: 'fill',
label: 'Fill'
},
{
id: 'stroke',
label: 'Stroke'
}
],
initId: 'fill',
onChange: function(id) {
BV.css(lineWidthSlider.getElement(), {
display: id === 'fill' ? 'none' : null
});
updatePreviews();
},
changeOnInit: true
});
BV.css(modeOptions.getElement(), {
marginTop: '10px'
});
div.appendChild(modeOptions.getElement());

let lineWidthSlider = new BV.PcSlider({
label: 'Line Width',
width: 250,
height: 30,
min: 1,
max: 200,
initValue: 4,
curve: 'quadratic',
onChange: function (val) {
updatePreviews();
},
formatFunc: function (v) {
return Math.round(v);
}
});
BV.css(lineWidthSlider.getElement(), {
marginTop: '10px'
});
div.appendChild(lineWidthSlider.getElement());

let opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 250,
height: 30,
min: 0,
max: 1,
initValue: 1,
onChange: function (val) {
},
formatFunc: function (v) {
return Math.round(v * 100);
}
});
BV.css(opacitySlider.getElement(), {
marginTop: '10px'
});
div.appendChild(opacitySlider.getElement());

let row2 = BV.el({
parent: div,
css: {
display: 'flex',
alignItems: 'center',
marginTop: '10px'
}
});

let outwardsToggle = new BV.checkBox({
init: false,
label: 'Outwards',
callback: function(b) {

}
});
BV.css(outwardsToggle, {
width: '50%',
marginRight: '10px'
})
row2.appendChild(outwardsToggle);

let fixedToggle = new BV.checkBox({
init: false,
label: 'Fixed 1:1',
callback: function(b) {
updatePreviews();
}
});
BV.css(fixedToggle, {
flexGrow: 1
});
row2.appendChild(fixedToggle);

let snapToggle = new BV.checkBox({
init: false,
label: 'Snap',
title: '45° Angle Snapping',
callback: function(b) {
updatePreviews();
}
});
BV.css(snapToggle, {
flexGrow: 1
});
row2.appendChild(snapToggle);



updatePreviews();



this.getElement = function() {
return div;
};

this.setIsVisible = function(pIsVisible) {
isVisible = !!pIsVisible;
div.style.display = isVisible ? 'block' : 'none';
if(isVisible) {
colorDiv.appendChild(p.colorSlider.getElement());
colorDiv.appendChild(p.colorSlider.getOutputElement());

}
};

this.getShape = function() {
return shapeOptions.getValue();
};

this.getMode = function() {
return modeOptions.getValue();
};

this.getIsEraser = function() {
return eraserToggle.getValue();
};

this.getOpacity = function() {
return opacitySlider.getValue();
};

this.getLineWidth = function() {
return lineWidthSlider.getValue();
};

this.getIsOutwards = function() {
return outwardsToggle.getValue();
};

this.getIsFixed = function() {
return fixedToggle.getValue();
};

this.getIsSnap = function() {
return snapToggle.getValue();
};

};

/**
* preview of image with layers. can do mix modes and opacity.
* creates a canvas.
*
* p = {
*     width: 123,
*     height: 123,
*     layerArr: [// can be changed after the fact
*         {
*             canvas: Canvas,
*             opacity: 1,
*             mixModeStr: 'source-over'
*         }
*     ]
* }
*
* @param p
* @constructor
*/
BV.PcCanvasPreview = function(p) {
let canvas = BV.createCanvas(p.width, p.height);
canvas.style.backgroundImage = 'url(' + BV.createCheckerDataUrl(8) + ')';
let ctx = canvas.getContext('2d');

function render() {
ctx.save();
ctx.clearRect(0, 0, canvas.width, canvas.height);
for(let i = 0; i < p.layerArr.length; i++) {
ctx.globalAlpha = parseFloat(p.layerArr[i].opacity);
ctx.globalCompositeOperation = p.layerArr[i].mixModeStr;
ctx.drawImage(p.layerArr[i].canvas, 0, 0, canvas.width, canvas.height);
}
ctx.restore();
}

setTimeout(render, 0);


this.getElement = function() {
return canvas;
};

this.render = function() {
render();
};
};

/**
* P = {
*     currentColor: RGB,
*     secondaryColor: RGB,
*     maxCanvasSize: number,
*     canvasWidth: number,
*     canvasHeight: number,
*     workspaceWidth: number,
*     workspaceHeight: number,
*     onConfirm: function(width number, height number, color RGBA),
*     onCancel: function()
* }
*
* @param p
*/
BV.newImageDialog = function(p) {

let currentColor = p.currentColor;
let secondaryColor = p.secondaryColor;
let maxCanvasSize = p.maxCanvasSize;
let canvasWidth = p.canvasWidth;
let canvasHeight = p.canvasHeight;
let workspaceWidth = p.workspaceWidth;
let workspaceHeight = p.workspaceHeight;
let onConfirm = p.onConfirm;
let onCancel = p.onCancel;


function createRatioSize(ratioX, ratioY, width, height, padding) {
return BV.fitInto(Math.min(maxCanvasSize, width - padding), Math.min(maxCanvasSize, height - padding), ratioX, ratioY, 1);
}

var newImDiv = document.createElement("div");
var widthWrapper = document.createElement("div");
var heightWrapper = document.createElement("div");
var widthInput = document.createElement("input");
var widthUnit = document.createElement("div");
var heightInput = document.createElement("input");
var heightUnit = document.createElement("div");
widthWrapper.style.position = "relative";
widthWrapper.style.width = "145px";
widthWrapper.style.height = "35px";
widthWrapper.style.lineHeight = "30px";
heightWrapper.style.width = "145px";
heightWrapper.style.height = "35px";
heightWrapper.style.lineHeight = "30px";

widthUnit.innerText = 'px';
widthUnit.style.color = '#888';
widthUnit.style.fontSize = "12px";
widthUnit.style.marginLeft = "5px";
widthUnit.style.cssFloat = "right";

heightUnit.innerText = 'px';
heightUnit.style.color = '#888';
heightUnit.style.fontSize = "12px";
heightUnit.style.marginLeft = "5px";
heightUnit.style.cssFloat = "right";

widthInput.type = 'number';
widthInput.min = 1;
widthInput.max = maxCanvasSize;
widthInput.style.cssFloat = "right";
widthInput.style.width = "70px";

heightInput.type = 'number';
heightInput.min = 1;
heightInput.max = maxCanvasSize;
heightInput.style.cssFloat = "right";
heightInput.style.width = "70px";
widthInput.value = canvasWidth;
heightInput.value = canvasHeight;
widthInput.onclick = function () {
this.focus();
updateRatio();
};
heightInput.onclick = function () {
this.focus();
updateRatio();
};
widthWrapper.appendChild(widthUnit);
widthWrapper.appendChild(widthInput);
BV.appendTextDiv(widthWrapper, "Width: ");
heightWrapper.appendChild(heightUnit);
heightWrapper.appendChild(heightInput);
BV.appendTextDiv(heightWrapper, "Height: ");
var ratioWrapper = document.createElement("div");
ratioWrapper.style.marginTop = '5px';
ratioWrapper.style.color = '#888';
ratioWrapper.innerText = "Ratio: 23:12";



















var templateWrapper = document.createElement("div");

var presetFitBtn = document.createElement("button");
templateWrapper.style.marginBottom = "10px";
var presetCurrentBtn = document.createElement("button");
var presetSquareBtn = document.createElement("button");
var presetLandscapeBtn = document.createElement("button");
var presetPortraitBtn = document.createElement("button");
var presetOversizeBtn = document.createElement("button");

presetCurrentBtn.textContent = "Current";
presetFitBtn.textContent = "Fit";
presetOversizeBtn.textContent = "Oversize";
presetLandscapeBtn.textContent = "Landscape";
presetPortraitBtn.textContent = "Portrait";
presetSquareBtn.textContent = "Square";

presetCurrentBtn.style.marginRight = "5px";
presetFitBtn.style.marginRight = "5px";
presetOversizeBtn.style.marginRight = "5px";
presetLandscapeBtn.style.marginTop = "5px";
presetLandscapeBtn.style.marginRight = "5px";
presetPortraitBtn.style.marginTop = "5px";
presetPortraitBtn.style.marginRight = "5px";

templateWrapper.appendChild(presetCurrentBtn);
templateWrapper.appendChild(presetFitBtn);
templateWrapper.appendChild(presetOversizeBtn);
templateWrapper.appendChild(presetSquareBtn);
templateWrapper.appendChild(presetLandscapeBtn);
templateWrapper.appendChild(presetPortraitBtn);

var templatePadding = 50;

presetCurrentBtn.onclick = function () {
widthInput.value = canvasWidth;
heightInput.value = canvasHeight;
updateRatio();
};
presetFitBtn.onclick = function () {
widthInput.value = workspaceWidth;
heightInput.value = workspaceHeight;
updateRatio();
};
presetOversizeBtn.onclick = function () {
widthInput.value = workspaceWidth + 500;
heightInput.value = workspaceHeight + 500;
updateRatio();
};
presetSquareBtn.onclick = function () {
var sizeObj = createRatioSize(1, 1, workspaceWidth, workspaceHeight, templatePadding);
widthInput.value = Math.round(sizeObj.width);
heightInput.value = Math.round(sizeObj.height);
updateRatio();
};
presetLandscapeBtn.onclick = function () {
var sizeObj = createRatioSize(4, 3, workspaceWidth, workspaceHeight, templatePadding);
widthInput.value = Math.round(sizeObj.width);
heightInput.value = Math.round(sizeObj.height);
updateRatio();
};
presetPortraitBtn.onclick = function () {
var sizeObj = createRatioSize(3, 4, workspaceWidth, workspaceHeight, templatePadding);
widthInput.value = Math.round(sizeObj.width);
heightInput.value = Math.round(sizeObj.height);
updateRatio();
};

let select = new BV.Select({
optionArr: [
['screen', 'Screen'],
['16 9', 'Video 16:9'],
['3 2', '3:2'],
['5 3', '5:3'],
['2 1', '2:1'],
['paper', 'DIN Paper √2:1'],
['9 16', '9:16'],
['2 3', '2:3'],
['3 5', '3:5'],
['1 2', '1:2'],
['1 1.4142135623730951', '1:√2']
],
onChange: function(val) {
if (val === 'screen') {
widthInput.value = window.screen.width;
heightInput.value = window.screen.height;
} else if (val === 'paper') {
var sizeObj = createRatioSize(Math.sqrt(2), 1, workspaceWidth, workspaceHeight, templatePadding);
widthInput.value = Math.round(sizeObj.width);
heightInput.value = Math.round(sizeObj.height);
} else {
let split = val.split(' ');
var sizeObj = createRatioSize(parseFloat(split[0]), parseFloat(split[1]), workspaceWidth, workspaceHeight, templatePadding);
widthInput.value = Math.round(sizeObj.width);
heightInput.value = Math.round(sizeObj.height);
}
updateRatio();
select.setValue(null);
}
});
templateWrapper.appendChild(select.getElement());



var backgroundRGBA = {r: 255, g: 255, b: 255, a: 1};

let colorOptionsArr = [
{r: 255, g: 255, b: 255, a: 1},
{r: 0, g: 0, b: 0, a: 1},
{r: 0, g: 0, b: 0, a: 0}
];
colorOptionsArr.push({
r: currentColor.r,
g: currentColor.g,
b: currentColor.b,
a: 1
});
colorOptionsArr.push({
r: secondaryColor.r,
g: secondaryColor.g,
b: secondaryColor.b,
a: 1
});

let colorOptions = new BV.ColorOptions({
colorArr: colorOptionsArr,
onChange: function(rgbaObj) {
backgroundRGBA = rgbaObj;
preview.style.backgroundColor = "rgba(" + rgbaObj.r + "," + rgbaObj.g + "," + rgbaObj.b + ", " + rgbaObj.a + ")";
}
});

var previewWrapper = document.createElement("div");
BV.css(previewWrapper, {
boxSizing: 'border-box',
width: '340px',
height: '140px',
display: 'table',
backgroundColor: '#9e9e9e',
padding: '10px',
marginTop: '10px',
boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset',
marginLeft: '-20px'
});
var preview = document.createElement("div");
BV.css(preview, {
width: 200 + "px",
height: 100 + "px",
backgroundColor: "#fff",
marginLeft: "auto",
marginRight: "auto",
color: "#aaa",
fontSize: "16px",
fontWeight: "bold",
textAlign: "center",
verticalAlign: "center",
display: "table",
overflow: "hidden",
boxShadow: "0px 0px 3px rgba(0,0,0,0.5)"
});
var previewcell = document.createElement("div");
previewcell.style.display = "table-cell";
previewcell.style.verticalAlign = "middle";
previewcell.appendChild(preview);
previewWrapper.appendChild(previewcell);
var cell = BV.appendTextDiv(preview, "");

cell.style.display = "table-cell";
cell.style.verticalAlign = "middle";
var prevW = parseInt(widthInput.value);
var prevH = parseInt(heightInput.value);

function updateRatio() {
widthInput.value = Math.min(maxCanvasSize, widthInput.value);
heightInput.value = Math.min(maxCanvasSize, heightInput.value);

function HCF(u, v) {
var U = u, V = v;
while (true) {
if (!(U %= V))
return V;
if (!(V %= U))
return U;
}
}

var w = parseInt(widthInput.value);
var h = parseInt(heightInput.value);
if (w < 1 || w > maxCanvasSize || h < 1 || h > maxCanvasSize) {
if (w > maxCanvasSize)
w = maxCanvasSize;
else if (h > maxCanvasSize)
h = maxCanvasSize;

widthInput.value = w;
heightInput.value = h;
}


var commonRatios = [
[1, 2], [2, 1],
[2, 3], [3, 2],
[3, 4], [4, 3],
[4, 5], [5, 4],
[16, 9], [9, 16],
[3, 2], [2, 3],
[5, 3], [3, 5],
[2, 1], [1, 2],
[1.414, 1], [1, 1.414],
];
var reducedArr = BV.reduce(w, h);
var closestRatio = null;
var closestDistance = null;
for (var i = 0; i < commonRatios.length; i++) {
if (i === 0 || Math.abs(commonRatios[i][0] / commonRatios[i][1] - reducedArr[0] / reducedArr[1]) < closestDistance) {
closestRatio = commonRatios[i];
closestDistance = Math.abs(commonRatios[i][0] / commonRatios[i][1] - reducedArr[0] / reducedArr[1]);
}
}

if (closestDistance > 0 && closestDistance < 0.005) {
ratioWrapper.innerText = 'Ratio: ~' + closestRatio[0] + ':' + closestRatio[1];
} else {
ratioWrapper.innerText = 'Ratio: ' + reducedArr[0] + ':' + reducedArr[1];
}

prevW = w;
prevH = h;
var realw = w;
var T = HCF(w, h);
w /= T;
h /= T;
w *= 260;
h *= 260;
if (w > 260) {
h = 260 / w * h;
w = 260;
}
if (h > 100) {
w = 100 / h * w;
h = 100;

}

preview.style.width = w + "px";
preview.style.height = h + "px";
BV.createCheckerDataUrl(parseInt(30 * (w / realw)), function (url) {
previewWrapper.style.background = "url(" + url + ")";
});
}

widthInput.onchange = function () {
if(widthInput.value === '' || widthInput.value < 0) {
widthInput.value = 1;
}
updateRatio();
};
widthInput.onkeyup = function () {
updateRatio();
};
heightInput.onchange = function () {
if(heightInput.value === '' || heightInput.value < 0) {
heightInput.value = 1;
}
updateRatio();
};
heightInput.onkeyup = function () {
updateRatio();
};
updateRatio();

newImDiv.appendChild(templateWrapper);
let secondRow = BV.el({
parent: newImDiv,
css: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'flex-end'
}
});
let secondRowLeft = BV.el({
parent: secondRow
});
secondRowLeft.appendChild(widthWrapper);
secondRowLeft.appendChild(heightWrapper);
secondRowLeft.appendChild(ratioWrapper);
secondRow.appendChild(colorOptions.getElement());

newImDiv.appendChild(previewWrapper);

BV.popup({
target: document.body,
message: "<b>New Image</b>",
div: newImDiv,
buttons: ['Ok', 'Cancel'],
callback: function (result) {
if (result === "Cancel" || parseInt(widthInput.value) <= 0 || parseInt(heightInput.value) <= 0 || isNaN(widthInput.value) || isNaN(heightInput.value)) {
onCancel();
return;
}
onConfirm(parseInt(widthInput.value), parseInt(heightInput.value), backgroundRGBA);
},
clickOnEnter: 'Ok'
});

};

/**
* selectable options
* p = {
*     optionArr: {
*          id: string,
*          label: string | HTMLElement
*     }[],
*     initialId?: string,
*     onChange: function(id string): void,
*     changeOnInit?: boolean,
* }
*
* @param p
* @constructor
*/
BV.Options = function(p) {
let div = BV.el({});

let wrapperEl = BV.el({
parent: div,
className: 'bv-option-wrapper',
css: {
display: 'flex'
}
});

let optionArr = [];
let selectedId = 'initialId' in p ? p.initialId : p.optionArr[0].id;

function createOption(o) {
let optionObj = {
id: o.id
};

let classArr = ['bv-option'];
if (p.isSmall) {
classArr.push('bv-option--small');
}
if (typeof '' !== typeof o.label) {
classArr.push('bv-option--custom-el');
}

optionObj.el = BV.el({
parent: wrapperEl,
content: o.label,
className: classArr.join(' '),
onClick: function() {
if(selectedId !== optionObj.id) {
selectedId = optionObj.id;
update();
p.onChange(selectedId);
}
}
});

if (o.title) {
optionObj.el.title = o.title;
}

optionArr.push(optionObj);
}

function update() {
for(let i = 0; i < optionArr.length; i++) {
if(optionArr[i].id === selectedId) {
BV.addClassName(optionArr[i].el, 'bv-option-selected');
} else {
BV.removeClassName(optionArr[i].el, 'bv-option-selected');
}
}
}

for(let i = 0; i < p.optionArr.length; i++) {
createOption(p.optionArr[i]);
}

update();

if (p.changeOnInit) {
setTimeout(function() {
p.onChange(selectedId);
}, 0);
}

function getIndex() {
for (let i = 0; i < optionArr.length; i++) {
if (optionArr[i].id === selectedId) {
return i;
}
}
}


this.getElement = function() {
return div;
};
this.getValue = function() {
return selectedId;
}
this.next = function() {
selectedId = optionArr[(getIndex() + 1) % optionArr.length].id;
update();
p.onChange(selectedId);
};
this.previous = function() {
selectedId = optionArr[(optionArr.length + getIndex() - 1) % optionArr.length].id;
update();
p.onChange(selectedId);
};
};


/**
* button that allows to collapse toolspace (for mobile)
*
* p = {
*     onChange: function()
* }
*
* @param p
* @constructor
*/
BV.ToolspaceCollapser = function(p) {
let isOpen = true;
let directionStr = 'right';

function update() {
if (directionStr === 'left') {
icon.style.transform = isOpen ? 'rotate(180deg)' : '';
} else {
icon.style.transform = isOpen ? '' : 'rotate(180deg)';
}
}

let div = BV.el({
css: {
width: '36px',
height: '36px',
background: 'rgba(100, 100, 100, 0.9)',
color: '#fff',
position: 'absolute',
top: '0',
textAlign: 'center',
lineHeight: '36px',
cursor: 'pointer',
userSelect: 'none',
padding: '6px',
boxSizing: 'border-box'
},
onClick: function(e) {
e.preventDefault();
isOpen = !isOpen;
update();
p.onChange();
}
});

let icon = BV.el({
parent: div,
css: {
backgroundImage: "url('0-4-15--176eb290fdd/img/ui/ui-collapse.svg')",
width: '100%',
height: '100%',
backgroundSize: 'contain',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
userSelect: 'none'
}
});
div.oncontextmenu = function () {
return false;
};


this.isOpen = function() {
return isOpen;
};

/**
*
* @param dirStr
*/
this.setDirection = function(dirStr) {
directionStr = dirStr;
update();
};

this.getElement = function() {
return div;
};
};

/**
* Text Tool dialog
*
* p = {
*     pcCanvas: pcCanvas,
*     layerIndex: number,
*     x: number,
*     y: number,
*     angleRad: number,
*     color: rgb,
*     secondaryColor: rgb,
*     size: number,
*     align: 'left' | 'center' | 'right',
*     isBold: boolean,
*     isItalic: boolean,
*     font: 'serif' | 'monospace' | 'sans-serif' | 'cursive' | 'fantasy',
*     opacity: number,
*     onConfirm: function(confirmP)
* }
*
* confirmP = {
*     x: number,
*     y: number,
*     textStr: string,
*     align: 'left' | 'center' | 'right',
*     isItalic: boolean,
*     isBold: boolean,
*     color: rgb,
*     size: number,
*     font: 'serif' | 'monospace' | 'sans-serif' | 'cursive' | 'fantasy',
*     opacity: number,
* }
*
* @param p
*/
BV.textToolDialog = function(p) {

let div = BV.el({});

let isSmallWidth = window.innerWidth < 550;
let isSmallHeight = window.innerHeight < 630;








let width = isSmallWidth ? 340 : 540;
let height = isSmallWidth ? (isSmallHeight ? 210 : 260) : (isSmallHeight ? 230 : 350);
let scale = 1;

let layerArr = p.pcCanvas.getLayersFast();
let textCanvas = BV.createCanvas(p.pcCanvas.getWidth(), p.pcCanvas.getHeight());
let textCtx = textCanvas.getContext('2d');
let targetCanvas = BV.createCanvas(width, height);
let targetCtx = targetCanvas.getContext('2d');
let layersCanvas = BV.createCanvas(width, height);
let layersCtx = layersCanvas.getContext('2d');
let previewCanvas = BV.createCanvas(width, height);
let previewCtx = previewCanvas.getContext('2d');
BV.css(previewCanvas, {
display: 'block'
});
let previewWrapper = BV.el({
parent: div,
css: {
position: 'relative',
width: width + 'px',
marginLeft: '-20px',
cursor: 'move'
},
onClick: function() {
textInput.focus();
}
});
BV.el({
parent: previewWrapper,
css: {
position: 'absolute',
left: 0,
top: 0,
right: 0,
bottom: 0,
boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset',
pointerEvents: 'none'
}
});
previewWrapper.appendChild(previewCanvas);
let checkerPattern = previewCtx.createPattern(BV.createCheckerCanvas(8), 'repeat');
var emptyCanvas = BV.createCanvas(1, 1);
{
let ctx = emptyCanvas.getContext('2d');
ctx.fillRect(0, 0, 1, 1);
}

function updatePreview() {




textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
let colorRGBA = p.color;
colorRGBA.a = opacitySlider.getValue();
let bounds = BV.renderText({
canvas: textCanvas,
x: p.x,
y: p.y,
textStr: textInput.value,
align: alignRadioList.getValue(),
isItalic: italicToggle.getValue(),
isBold: boldToggle.getValue(),
size: sizeInput.value,
font: fontSelect.getValue(),
color: BV.ColorConverter.toRgbaStr(colorRGBA),
angleRad: p.angleRad
});




bounds.width = Math.max(bounds.width, 1);
bounds.height = Math.max(bounds.height, 1);
let rotatedXY = BV.rotate(bounds.x, bounds.y, -p.angleRad / Math.PI * 180);
let rotatedWH = BV.rotate(bounds.width, bounds.height, -p.angleRad / Math.PI * 180);
let centerX = p.x + rotatedXY.x + rotatedWH.x / 2;
let centerY = p.y + rotatedXY.y + rotatedWH.y / 2;

let padding = 100;
let fitBounds = BV.fitInto(width - padding, height - padding, bounds.width, bounds.height);
scale = Math.min(1, fitBounds.width / bounds.width);
scale = Math.min(4, scale * Math.pow(2, zoomFac));



targetCtx.save();

if(scale >= 4) {
targetCtx.imageSmoothingEnabled = false;
} else {
targetCtx.imageSmoothingEnabled = true;
targetCtx.imageSmoothingQuality  = scale >= 1 ? 'low' : 'medium';
}

targetCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
targetCtx.translate(width / 2, height / 2);
targetCtx.scale(scale, scale);
targetCtx.rotate(p.angleRad);
targetCtx.drawImage(layerArr[p.layerIndex].canvas, -centerX, -centerY);
targetCtx.drawImage(textCanvas, -centerX, -centerY);
targetCtx.restore();



layersCtx.save();

layersCtx.fillStyle = 'rgb(158,158,158)';
layersCtx.fillRect(0, 0, width, height);

{
layersCtx.save();

layersCtx.translate(width / 2, height / 2);
layersCtx.scale(scale, scale);
layersCtx.rotate(p.angleRad);

layersCtx.imageSmoothingEnabled = 'false';


let borderSize = 1 / scale;
layersCtx.globalAlpha = 0.2;
layersCtx.drawImage(emptyCanvas, -centerX - borderSize, -centerY - borderSize, textCanvas.width + borderSize * 2, textCanvas.height + borderSize * 2);
layersCtx.globalAlpha = 1;


layersCtx.globalCompositeOperation = 'destination-out';
layersCtx.drawImage(emptyCanvas, -centerX, -centerY, textCanvas.width, textCanvas.height);

layersCtx.restore();
}

{

if(scale >= 4) {
layersCtx.imageSmoothingEnabled = false;
} else {
layersCtx.imageSmoothingEnabled = true;
layersCtx.imageSmoothingQuality  = scale >= 1 ? 'low' : 'medium';
}


layersCtx.save();
layersCtx.translate(width / 2, height / 2);
layersCtx.scale(scale, scale);
layersCtx.rotate(p.angleRad);
for (var i = 0; i < p.layerIndex; i++) {
if (layerArr[i].opacity > 0) {
layersCtx.globalAlpha = layerArr[i].opacity;
layersCtx.globalCompositeOperation = layerArr[i].mixModeStr;
layersCtx.drawImage(layerArr[i].canvas, -centerX, -centerY);
}
}
layersCtx.restore();


layersCtx.globalAlpha = layerArr[p.layerIndex].opacity;
layersCtx.globalCompositeOperation = layerArr[p.layerIndex].mixModeStr;
layersCtx.drawImage(targetCanvas, 0, 0);


layersCtx.save();
layersCtx.translate(width / 2, height / 2);
layersCtx.scale(scale, scale);
layersCtx.rotate(p.angleRad);
for (var i = p.layerIndex + 1; i < layerArr.length; i++) {
if (layerArr[i].opacity > 0) {
layersCtx.globalAlpha = layerArr[i].opacity;
layersCtx.globalCompositeOperation = layerArr[i].mixModeStr;
layersCtx.drawImage(layerArr[i].canvas, -centerX, -centerY);
}
}
layersCtx.restore();

}

layersCtx.restore();




previewCtx.save();
previewCtx.fillStyle = checkerPattern;
previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
previewCtx.drawImage(layersCanvas, 0, 0);
previewCtx.restore();


previewCtx.save();
previewCtx.globalCompositeOperation = 'difference';
previewCtx.strokeStyle = '#fff';
previewCtx.lineWidth = 1;
centerX = p.x + bounds.x + bounds.width / 2;
centerY = p.y + bounds.y + bounds.height / 2;
previewCtx.strokeRect(
Math.round(width / 2 - (bounds.width / 2) * scale),
Math.round(height / 2 - (bounds.height / 2) * scale),
Math.round(bounds.width * scale),
Math.round(bounds.height * scale)
);
previewCtx.restore();

}

function move(x, y) {
let rotated = BV.rotate(x, y, -p.angleRad / Math.PI * 180);
p.x += rotated.x / scale;
p.y += rotated.y / scale;
updatePreview();
}

let previewPointerListener = new BV.PointerListener({
target: previewCanvas,
pointers: 1,
onPointer: function(e) {
if (e.type === 'pointermove' && e.button) {
e.eventPreventDefault();
move(-e.dX, -e.dY);
}
},
onWheel: function(e) {
changeZoomFac(-e.deltaY);
}
});



let row1 = BV.el({
parent: div,
css: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginTop: '10px'
}
});
let row2n3Wrapper = BV.el({
parent: div,
css: isSmallWidth ? {} : {
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between'
}
});
let row2 = BV.el({
parent: row2n3Wrapper,
css: {
display: 'flex',
alignItems: 'center',
marginTop: '5px'
}
});
let row3 = BV.el({
parent: row2n3Wrapper,
css: {
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
marginTop: '5px',
width: isSmallWidth ? '' : '300px'
}
});




let selectedRgbaObj = {r: 0, g: 0, b: 0, a: 1};
let colorOptionsArr = [
{r: 0, g: 0, b: 0, a: 1},
{r: 255, g: 255, b: 255, a: 1}
];
colorOptionsArr.unshift({
r: p.secondaryColor.r,
g: p.secondaryColor.g,
b: p.secondaryColor.b,
a: 1,
});
colorOptionsArr.unshift({
r: p.color.r,
g: p.color.g,
b: p.color.b,
a: 1,
});

let colorOptions = new BV.ColorOptions({
colorArr: colorOptionsArr,
initialIndex: 0,
onChange: function(rgbaObj) {
p.color = rgbaObj;
updatePreview();
}
});
colorOptions.getElement().style.marginLeft = '-5px';
row1.appendChild(colorOptions.getElement());


let zoomFac = 0;
function changeZoomFac(d) {
zoomFac = Math.min(2, Math.max(-2, zoomFac + d));
updatePreview();
}

let zoomWrapper = BV.el({
parent: row1,
css: {

}
})

let zoomInBtn = BV.el({
parent: zoomWrapper,
textContent: '+',
tagName: 'button',
onClick: function() {
changeZoomFac(1);
},
css: {
fontWeight: 'bold'
}
});
let zoomOutBtn = BV.el({
parent: zoomWrapper,
textContent: '-',
tagName: 'button',
onClick: function() {
changeZoomFac(-1);
},
css: {
fontWeight: 'bold',
marginLeft: '5px'
}
});




let sizeInput = BV.el({
parent: row2,
tagName: 'input',
title: 'Size',
custom: {
type: 'number',
min: 1,
max: 1000,
value: p.size
},
css: {
width: '60px'
},
onChange: function() {
sizeInput.value = Math.max(1, Math.min(1000, sizeInput.value));
updatePreview();
}
});
let sizePointerListener = new BV.PointerListener({
target: sizeInput,
onWheel: function(e) {
sizeInput.value = Math.max(1, Math.min(1000, parseInt(sizeInput.value) - e.deltaY));
updatePreview();
}
});

let modeWrapper;
let fontSelect;
let fontPointerListener;
{
modeWrapper = BV.el({
css: {
fontSize: '15px',
marginLeft: '10px'
}
});
fontSelect = new BV.Select({
optionArr: [
['sans-serif', 'Sans-serif'],
['serif', 'Serif'],
['monospace', 'Monospace'],
['cursive', 'Cursive'],
['fantasy', 'Fantasy'],
],
initValue: p.font,
onChange: function(val) {
updatePreview();
}
});

modeWrapper.appendChild(fontSelect.getElement());
row2.appendChild(modeWrapper);

fontPointerListener = new BV.PointerListener({
target: fontSelect.getElement(),
onWheel: function(e) {
fontSelect.setDeltaValue(e.deltaY);
}
});

}




let alignRadioList = new BV.ImageRadioList({
optionArr: [
{
id: 'left',
title: 'Left',
image: '0-4-15--176eb290fdd/img/ui/align-left.svg'
},
{
id: 'center',
title: 'Center',
image: '0-4-15--176eb290fdd/img/ui/align-center.svg'
},
{
id: 'right',
title: 'Right',
image: '0-4-15--176eb290fdd/img/ui/align-right.svg'
}
],
initId: p.align,
onChange: function(id) {
updatePreview();
}
});
row3.appendChild(alignRadioList.getElement());

let italicToggle = new BV.ImageToggle({
image: '0-4-15--176eb290fdd/img/ui/typo-italic.svg',
title: 'Italic',
initValue: p.isItalic,
onChange: function(b) {
updatePreview();
}
});
row3.appendChild(italicToggle.getElement());

let boldToggle = new BV.ImageToggle({
image: '0-4-15--176eb290fdd/img/ui/typo-bold.svg',
title: 'Bold',
initValue: p.isBold,
onChange: function(b) {
updatePreview();
}
});
row3.appendChild(boldToggle.getElement());



let opacitySlider = new BV.PcSlider({
label: 'Opacity',
width: 150,
height: 30,
min: 0,
max: 1,
initValue: p.opacity,
resolution: 225,
eventResMs: 1000 / 30,
onChange: function(v) {
updatePreview();
},
formatFunc: function(v) {
return Math.round(v * 100);
}
});
row3.appendChild(opacitySlider.getElement());



let textInput = BV.el({
parent: div,
tagName: 'textarea',
custom: {
placeholder: 'Your text',
},
css: {
whiteSpace: 'nowrap',
overflow: 'auto',
width: '100%',
height: '70px',
resize: 'vertical',
marginTop: '10px'
},
onChange: function() {
updatePreview();
}
});
textInput.addEventListener('input', updatePreview);
setTimeout(function() {
textInput.focus();
textInput.select();
});

let keyListener = new BV.KeyListener({
onDown: function(keyStr) {
if(document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
return;
}
if (keyStr === 'left') {
move(-1, 0);
}
if (keyStr === 'right') {
move(1, 0);
}
if (keyStr === 'up') {
move(0, -1);
}
if (keyStr === 'down') {
move(0, 1);
}
}
});


function onScroll() {
window.scrollTo(0, 0);
}
window.addEventListener('scroll', onScroll);


BV.popup({
target: document.body,
message: "<b>Add Text</b>",
div: div,
buttons: ["Ok", "Cancel"],
style: isSmallWidth ? {} : {
width: '500px'
},
callback: function(val) {
window.removeEventListener('scroll', onScroll);
previewPointerListener.destroy();
sizePointerListener.destroy();
fontPointerListener.destroy();
keyListener.destroy();
if (val === 'Ok') {
p.onConfirm({
x: p.x,
y: p.y,
textStr: textInput.value,
align: alignRadioList.getValue(),
isItalic: italicToggle.getValue(),
isBold: boldToggle.getValue(),
color: p.color,
size: sizeInput.value,
font: fontSelect.getValue(),
opacity: opacitySlider.getValue()
});
}
},
autoFocus: false,
clickOnEnter: 'Ok'
});

updatePreview();

};

/**
*
* p = {
*     image: convertedPsd | {type: 'image', width: number, height: number, canvas: image | canvas},
*     maxSize: number,
*     target: htmlElement,
*     callback: func(
*         {
*             type: 'as-image',
*             image: image | canvas,
*         } | {
*             type: 'as-image-psd',
*             image: convertedPsd,
*             cropObj: {x: number, y: number, width: number, height: number}
*         } | {
*             type: 'as-layer',
*             image: image | canvas,
*         } | {
*             type: 'cancel',
*         }
*     )
* }
*
* @param p {}
*/
BV.showImportImageDialog = function(p) {
var div = BV.el({});

let croppedImage;
let resolutionEl;
let cropCopy = new BV.CropCopy({
width: 340,
height: 300,
canvas: p.image.canvas,
isNotCopy: true,
onChange: function(width, height) {
if (!resolutionEl) {
return;
}
resolutionEl.textContent = width + ' x ' + height;
updateResolution(width, height);
}
});
BV.css(cropCopy.getEl(), {
marginLeft: '-20px',
});
div.appendChild(cropCopy.getEl());


resolutionEl = BV.el({
parent: div,
textContent: p.image.width + ' x ' + p.image.height,
css: {
marginTop: '10px',
textAlign: 'center'
}
});
function updateResolution(w, h) {
let isTooLarge = w > p.maxSize || h > p.maxSize;
resolutionEl.style.color = isTooLarge ? '#f00' : '#888';
}
updateResolution(p.image.width, p.image.height);


let doFlatten = false;
function showWarnings(psdWarningArr) {
let contentArr = [];
let warningMap = {
'mask': 'Masks not supported. Mask was applied.',
'clipping': 'Clipping not supported. Clipping layers were merged.',
'group': 'Groups not supported. Layers were ungrouped.',
'adjustment': 'Adjustment layers not supported.',
'layer-effect': 'Layer effects not supported.',
'smart-object': 'Smart objects not supported.',
'blend-mode': 'Unsupported layer blend mode.',
'bits-per-channel': 'Unsupported color depth. Only 8bit per channel supported.',
};
for (let i = 0; i < psdWarningArr.length; i++) {
contentArr.push('- ' + warningMap[psdWarningArr[i]]);
}
alert(contentArr.join("\n"));
}

if (p.image.type === 'psd') {
let noteStyle = {
background: 'rgba(255,255,0,0.5)',
padding: '10px',
marginTop: '5px',
marginBottom: '5px',
border: '1px solid #e7d321',
borderRadius: '5px'
};
if (p.image.layerArr) {
let flattenCheckbox = BV.checkBox({
init: doFlatten,
label: 'Flatten image',
callback: function(b) {
doFlatten = b;
}
});
div.appendChild(flattenCheckbox);

if (p.image.warningArr) {
var noteEl = BV.el({
content: 'PSD support is limited. Flattened will more likely look correct. ',
css: noteStyle
});
noteEl.appendChild(BV.el({
tagName: 'a',
content: 'Details',
onClick: function() {
showWarnings(p.image.warningArr);
}
}));
div.appendChild(noteEl);
}
} else {
var noteEl = BV.el({
content: 'Unsupported features. PSD had to be flattened. ',
css: noteStyle
});
div.appendChild(noteEl);
}
}

function callback(result) {
if (result === "As Layer") {
p.callback({
type: 'as-layer',
image: cropCopy.getCroppedImage()
});

} else if (result === "As Image") {
if (p.image.type === 'psd') {
if (doFlatten) {
p.image.layerArr = null;
}
p.callback({
type: 'as-image-psd',
image: p.image,
cropObj: cropCopy.getRect()
});
} else if (p.image.type === 'image') {
p.callback({
type: 'as-image',
image: cropCopy.getCroppedImage()
});
}
} else {
p.callback({
type: 'cancel'
});
}
}

BV.popup({
target: p.target,
message: "<b>Import Image</b>",
div: div,
buttons: ["As Layer", "As Image", "Cancel"],
callback: callback,
autoFocus: 'As Image'
});
};

}());
