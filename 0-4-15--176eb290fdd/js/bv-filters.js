(function () {
"use strict";

BV.FilterLib = {
glBrightnessContrast: {
name: "Brightness / Contrast",
buttonLabel: "Bright/Contrast",
webgl: true,
updateContext: true,
icon: "ui/edit-brightness-contrast.png",
updatePos: false
},
cropExtend: {
name: "Crop / Extend",
buttonLabel: "Crop/Extend",
icon: "ui/edit-crop.png",
webgl: false,
neededWithWebGL: true,
updateContext: true,
updatePos: true
},
glCurves: {
name: "Curves",
icon: "ui/edit-curves.png",
webgl: true,
updateContext: true,
updatePos: false
},
flip: {
name: "Flip",
icon: "ui/edit-flip.png",
webgl: false,
neededWithWebGL: true,
updateContext: true,
updatePos: false
},
glHueSaturation: {
name: "Hue / Saturation",
buttonLabel: "Hue/Saturation",
icon: "ui/edit-hue-saturation.png",
webgl: true,
updateContext: true,
updatePos: false
},
invert: {
name: "Invert",
icon: "ui/edit-invert.png",
webgl: true,
updateContext: true,
updatePos: false,
isInstant: true
},
glPerspective: {
name: "Perspective",
icon: "ui/edit-perspective.png",
webgl: true,
updateContext: true,
updatePos: false
},
resize: {
name: "Resize",
icon: "ui/edit-resize.png",
webgl: false,
neededWithWebGL: true,
updateContext: true,
updatePos: true
},
rotate: {
name: "Rotate",
icon: "ui/edit-rotate.png",
webgl: false,
neededWithWebGL: true,
updateContext: true,
updatePos: true
},
glTiltShift: {
name: "Tilt Shift",
icon: "ui/edit-tilt-shift.png",
webgl: true,
updateContext: true,
updatePos: false
},
toAlpha: {
name: "To Alpha",
icon: "ui/edit-to-alpha.png",
webgl: true,
updateContext: false,
updatePos: false
},
transform: {
name: "Transform",
icon: "ui/edit-transform.png",
webgl: false,
neededWithWebGL: true,
updateContext: true,
updatePos: false,
ieFails: true
},
glBlur: {
name: "Triangle Blur",
icon: "ui/edit-triangle-blur.png",
webgl: true,
updateContext: true,
updatePos: false
},
glUnsharpMask: {
name: "Unsharp Mask",
icon: "ui/edit-unsharp-mask.png",
webgl: true,
updateContext: true,
updatePos: false
}
};
})();