/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

if (CC_RUNTIME) {
    require('jsb-adapter/engine/rt-sys.js');
    require('jsb-adapter/engine/rt_input.js');
    require('jsb-adapter/engine/rt-loadSubpackage.js');
    require('jsb-adapter/engine/rt-game.js');
    require('jsb-adapter/engine/rt-jsb.js');
} else {
    require('jsb-adapter/engine/jsb-sys.js');
    require('jsb-adapter/engine/jsb-game.js');
    require('jsb-adapter/engine/jsb-videoplayer.js');
    require('jsb-adapter/engine/jsb-webview.js');
}
require('jsb-adapter/engine/jsb-audio.js');
require('jsb-adapter/engine/jsb-loader.js');
require('jsb-adapter/engine/jsb-editbox.js');
require('jsb-adapter/engine/jsb-reflection.js');
require('jsb-adapter/engine/jsb-cocosanalytics.js');
require('jsb-adapter/engine/jsb-assets-manager.js');

if (CC_JSB && CC_NATIVERENDERER) {
    require('jsb-adapter/engine/scene/camera.js');
    require('jsb-adapter/engine/scene/node-proxy.js');
    require('jsb-adapter/engine/scene/render-flow.js');
    // must be required after render flow
    require('jsb-adapter/engine/scene/node.js');
    require('jsb-adapter/engine/scene/render-handle.js');

    require('jsb-adapter/engine/scene/custom-render-handle.js');
    require('jsb-adapter/engine/jsb-dragonbones.js');
    require('jsb-adapter/engine/jsb-spine-skeleton.js');
    require('jsb-adapter/engine/jsb-particle.js');

    cc.game.on(cc.game.EVENT_ENGINE_INITED, function () {
        require('jsb-adapter/engine/assemblers/flex-buffer.js');
        // Assemblers
        require('jsb-adapter/engine/assemblers/sprite/index.js');
        require('jsb-adapter/engine/assemblers/sprite/simple.js');
        require('jsb-adapter/engine/assemblers/sprite/sliced.js');
        require('jsb-adapter/engine/assemblers/label/index.js');
        require('jsb-adapter/engine/assemblers/label/ttf.js');
        require('jsb-adapter/engine/assemblers/label/bmfont.js');
    });
}