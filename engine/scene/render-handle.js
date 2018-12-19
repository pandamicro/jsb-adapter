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

const RenderFlow = cc.RenderFlow;
const BEFORE_RENDER = RenderFlow.EventType.BEFORE_RENDER;

cc.js.mixin(renderer.RenderHandle.prototype, {
    _ctor () {
        this.vDatas = [];
        this.uintVDatas = [];
        this.iDatas = [];
        this.effects = [];
        this.meshCount = 0;
        this._material = null;
        this._delayed = false;
    },

    bind (component) {
        if (this._comp !== component && component instanceof cc.RenderComponent) {
            this._comp = component;
            if (component._assembler) {
                this.setUseModel(!!component._assembler.useModel);
            }
            if (component._vertexFormat) {
                this.setVertexFormat(component._vertexFormat._nativeObj);
            }
        }
    },

    reserveMeshCount (count) {
        if (this.meshCount < count) {
            this.vDatas.length = count;
            this.uintVDatas.length = count;
            this.iDatas.length = count;
            this.effects.length = count;
            this.setMeshCount(count);
        }
    },
    
    updateMesh (index, vertices, indices) {
        this.reserveMeshCount(index+1);

        this.vDatas[index] = vertices;
        this.uintVDatas[index] = new Uint32Array(vertices.buffer);
        this.iDatas[index] = indices;
        this.meshCount = this.vDatas.length;

        this.updateNativeMesh(index, vertices, indices);
    },

    updateMaterial (index, material) {
        this.reserveMeshCount(index + 1);
        let oldEffect = this.effects[index];
        let newEffect;

        if (material) {
            newEffect = this.effects[index] = material.effect;
        } else {
            newEffect = this.effects[index] = null;
        }
        if (newEffect !== oldEffect) {
            this.updateNativeEffect(index, newEffect ? newEffect._nativeObj : null);
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

    delayUpdateRenderData () {
        if (this._comp) {
            RenderFlow.on(BEFORE_RENDER, this.updateRenderData, this);
            this._delayed = true;
        }
    },

    updateRenderData () {
        if (this._comp && this._comp._assembler) {
            this._comp._assembler.updateRenderData(this._comp);
            this._delayed = false;
        }
    },
});