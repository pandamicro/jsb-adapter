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

"use strict";

cc.js.mixin(renderer.CustomRenderHandle.prototype, {
    _ctor () {
      
    },
    bind (component) {
        if (this._comp !== component && component instanceof cc.RenderComponent) {
            this._comp = component;
    
            if (component._assembler) {
                this.setUseModel(!!component._assembler.useModel);
            }
        }
    },
    updateEnabled (enabled) {
        if (enabled) {
            if (!this._enabled) {
                this._enabled = true;
                let node = this._comp.node;
                if (node) {
                    node._proxy.addHandle(this);
                }
            }
        }
        else {
            if (this._enabled) {
                this._enabled = false;
                let node = this._comp.node;
                if (node) {
                    node._proxy.removeHandle(this);
                }
            }
        }
    },
});