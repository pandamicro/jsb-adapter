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

(function(){
    if (window.sp === undefined || window.spine === undefined || window.middleware === undefined) return;
    
    // spine global time scale
    Object.defineProperty(sp, 'timeScale', {
        get () {
            return this._timeScale;
        },
        set (value) {
            this._timeScale = value;
            spine.SpineAnimation.setGlobalTimeScale(value);
        },
        configurable: true,
    });
    
    let RenderFlow = cc.RenderFlow;
    let _slotColor = cc.color(0, 0, 255, 255);
    let _boneColor = cc.color(255, 0, 0, 255);
    let _originColor = cc.color(0, 255, 0, 255);
    
    let skeletonDataProto = sp.SkeletonData.prototype;
    skeletonDataProto.destroy = function () {
        this._jsbTextures = null;
        spine.disposeSkeletonData(this._uuid);
        cc.Asset.prototype.destroy.call(this);
    };

    skeletonDataProto.init = function () {
        if (this._inited) return;

        let uuid = this._uuid;
        if (!uuid) {
            cc.errorID(7504);
            return;
        }
        let atlasText = this.atlasText;
        if (!atlasText) {
            cc.errorID(7508, this.name);
            return;
        }
        let texValues = this.textures;
        let texKeys = this.textureNames;
        if (!(texValues && texValues.length > 0 && texKeys && texKeys.length > 0)) {
            cc.errorID(7507, this.name);
            return;
        }
        let jsbTextures = this._jsbTextures = {};
        for (let i = 0; i < texValues.length; ++i) {
            let spTex = new middleware.Texture2D();
            let ccTex = texValues[i];
            spTex.setRealTextureIndex(i);
            spTex.setPixelsWide(ccTex.width);
            spTex.setPixelsHigh(ccTex.height);
            spTex.setTexParamCallback(function(texIdx,minFilter,magFilter,wrapS,warpT){
                texValues[texIdx].setFilters(minFilter, magFilter);
                texValues[texIdx].setWrapMode(wrapS, warpT);
            }.bind(this));
            spTex.setNativeTexture(ccTex.getImpl());
            jsbTextures[texKeys[i]] = spTex;
        }
        spine.initSkeletonData(uuid, this.skeletonJsonStr, atlasText, jsbTextures, this.scale);

        this._inited = true;
    };

    let animation = spine.SpineAnimation.prototype;
    // The methods are added to be compatibility with old versions.
    animation.setCompleteListener = function (listener) {
        this._compeleteListener = listener;
        this.setCompleteListenerNative(function (trackEntry) {
            let loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
            this._compeleteListener(trackEntry, loopCount);
        });
    };

    // Temporary solution before upgrade the Spine API
    animation.setAnimationListener = function (target, callback) {
        this._target = target;
        this._callback = callback;

        this.setStartListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.START, null, 0);
            }
        });

        this.setInterruptListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.INTERRUPT, null, 0);
            }
        });

        this.setEndListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.END, null, 0);
            }
        });

        this.setDisposeListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.DISPOSE, null, 0);
            }
        });

        this.setCompleteListener(function (trackEntry, loopCount) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.COMPLETE, null, loopCount);
            }
        });

        this.setEventListener(function (trackEntry, event) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.EVENT, event, 0);
            }
        });
    };

    sp.Skeleton._assembler = null;
    let skeleton = sp.Skeleton.prototype;
    Object.defineProperty(skeleton, 'paused', {
        get () {
            return this._paused || false;
        },
        set (value) {
            this._paused = value;
            if (this._skeleton) {
                this._skeleton.paused(value);
            }
        }
    });

    Object.defineProperty(skeleton, 'debugSlots', {
        get () {
            return this._debugSlots || false;
        },
        set (value) {
            this._debugSlots = value;
            this._updateDebugDraw();
            if (this._skeleton) {
                this._skeleton.setDebugSlotsEnabled(this._debugSlots);
            }
        }
    });

    Object.defineProperty(skeleton, 'debugBones', {
        get () {
            return this._debugBones || false;
        },
        set (value) {
            this._debugBones = value;
            this._updateDebugDraw();
            if (this._skeleton) {
                this._skeleton.setDebugBonesEnabled(this._debugBones);
            }
        }
    });

    Object.defineProperty(skeleton, "premultipliedAlpha", {
        get () {
            if (this._premultipliedAlpha === undefined){
                return true;
            }
            return this._premultipliedAlpha;
        },
        set (value) {
            this._premultipliedAlpha = value;
            if (this._skeleton) {
                this._skeleton.setOpacityModifyRGB(this._premultipliedAlpha);
            }
        }
    });

    Object.defineProperty(skeleton, "timeScale", {
        get () {
            if (this._timeScale === undefined) return 1.0;
            return this._timeScale;
        },
        set (value) {
            this._timeScale = value;
            if (this._skeleton) {
                this._skeleton.setTimeScale(this._timeScale);
            }
        }
    });

    Object.defineProperty(skeleton, "useTint", {
        get () {
            return this._useTint || false;
        },
        set (value) {
            this._useTint = value;
            // Update cache material useTint property
            let cache = this._materialCache;
            for (let mKey in cache) {
                let material = cache[mKey];
                if (material) {
                    material.useTint = this._useTint;
                }
            }
            if (this._skeleton) {
                this._skeleton.setUseTint(this._useTint);
            }
        }
    });

    let _onLoad = skeleton.onLoad;
    skeleton.onLoad = function () {
        if (_onLoad) {
            _onLoad.call(this);
        }
    };

    // Shield use batch in native
    skeleton._updateBatch = function () {};

    skeleton.initNativeHandle = function () {
        this._assembler = undefined;
        this._renderHandle = new middleware.MiddlewareRenderHandle();
        this._renderHandle.bind(this);
    };

    let _updateMaterial = skeleton._updateMaterial;
    skeleton._updateMaterial = function(material) {
        _updateMaterial.call(this, material);
        let nativeEffect = material.effect._nativeObj;
        this._skeleton.setNativeEffect(nativeEffect);
        this._renderHandle.clearNativeEffect();
    };

    skeleton.setSkeletonData = function (skeletonData) {
        null != skeletonData.width && null != skeletonData.height && this.node.setContentSize(skeletonData.width, skeletonData.height);

        let uuid = skeletonData._uuid;
        if (!uuid) {
            cc.errorID(7504);
            return;
        }

        let skeletonAni = new spine.SpineAnimation();
        try {
            spine.initSkeletonRenderer(skeletonAni, uuid);
        } catch (e) {
            cc._throw(e);
            return;
        }
        this._skeleton = skeletonAni;
        this._skeleton._comp = this;
        
        this._skeleton.setOpacityModifyRGB(this.premultipliedAlpha);
        this._skeleton.setDebugSlotsEnabled(this.debugSlots);
        this._skeleton.setDebugBonesEnabled(this.debugBones);
        this._skeleton.setTimeScale(this.timeScale);
        this._skeleton.bindNodeProxy(this.node._proxy);

        this._material.useModel = true;
        this._updateMaterial(this._material);

        // init skeleton listener
        this._startListener && this.setStartListener(this._startListener);
        this._endListener && this.setEndListener(this._endListener);
        this._completeListener && this.setCompleteListener(this._completeListener);
        this._eventListener && this.setEventListener(this._eventListener);
        this._interruptListener && this.setInterruptListener(this._interruptListener);
        this._disposeListener && this.setDisposeListener(this._disposeListener);
    };

    skeleton.setAnimationStateData = function (stateData) {
        if (this._skeleton) {
            return this._skeleton.setAnimationStateData(stateData);
        }
    };

    let _onEnable = skeleton.onEnable;
    skeleton.onEnable = function () {
        _onEnable.call(this);
        if (this._skeleton) {
            this._skeleton.onEnable();
        }
        this.node._renderFlag &= ~RenderFlow.FLAG_UPDATE_RENDER_DATA;
        this.node._renderFlag &= ~RenderFlow.FLAG_RENDER;
        this.node._renderFlag &= ~RenderFlow.FLAG_CUSTOM_IA_RENDER;
    };

    let _onDisable = skeleton.onDisable;
    skeleton.onDisable = function () {
        _onDisable.call(this);
        if (this._skeleton) {
            this._skeleton.onDisable();
        }
    };

    skeleton.update = function (dt) {
        if (this.paused) return;
        let skeleton = this._skeleton;
        if (!skeleton) return;
        let node = this.node;
        if (!node) return;

        if (this.__preColor__ === undefined || !node.color.equals(this.__preColor__)) {
            skeleton.setColor(node.color);
            this.__preColor__ = node.color;
        }

        if (this.debugBones || this.debugSlots) {
            let debugData = this._debugData || this._skeleton.getDebugData();
            if (!debugData) return;

            let graphics = this._debugRenderer;
            graphics.clear();
    
            let debugIdx = 0;
    
            if (this.debugSlots) {
                // Debug Slot
                graphics.strokeColor = _slotColor;
                graphics.lineWidth = 5;
    
                let debugSlotsLen = debugData[debugIdx++];
                for(let i=0;i<debugSlotsLen;i+=8){
                    graphics.moveTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.close();
                    graphics.stroke();
                }
            }
    
            if (this.debugBones) {
    
                graphics.lineWidth = 5;
                graphics.strokeColor = _boneColor;
                graphics.fillColor = _slotColor; // Root bone color is same as slot color.
    
                let debugBonesLen = debugData[debugIdx++];
                for (let i = 0; i < debugBonesLen; i += 4) {
                    let bx = debugData[debugIdx++];
                    let by = debugData[debugIdx++];
                    let x = debugData[debugIdx++];
                    let y = debugData[debugIdx++];
    
                    // Bone lengths.
                    graphics.moveTo(bx, by);
                    graphics.lineTo(x, y);
                    graphics.stroke();
    
                    // Bone origins.
                    graphics.circle(bx, by, Math.PI * 2);
                    graphics.fill();
                    if (i === 0) {
                        graphics.fillColor = _originColor;
                    }
                }
            }
        }
    }

    skeleton.updateWorldTransform = function () {
        this._skeleton && this._skeleton.updateWorldTransform();
    };

    skeleton.setToSetupPose = function () {
        this._skeleton && this._skeleton.setToSetupPose();
    };

    skeleton.setBonesToSetupPose = function () {
        this._skeleton && this._skeleton.setBonesToSetupPose();
    };

    skeleton.setSlotsToSetupPose = function () {
        this._skeleton && this._skeleton.setSlotsToSetupPose();
    };

    skeleton.setSlotsRange = function (startSlotIndex, endSlotIndex) {
        this._skeleton && this._skeleton.setSlotsRange(startSlotIndex, endSlotIndex);
    };

    skeleton.findBone = function (boneName) {
        if (this._skeleton) return this._skeleton.findBone(boneName);
        return null;
    };

    skeleton.findSlot = function (slotName) {
        if (this._skeleton) return this._skeleton.findSlot(slotName);
        return null;
    };

    skeleton.setSkin = function (skinName) {
        if (this._skeleton) return this._skeleton.setSkin(skinName);
        return null;
    };

    skeleton.getAttachment = function (slotName, attachmentName) {
        if (this._skeleton) return this._skeleton.getAttachment(slotName, attachmentName);
        return null;
    };

    skeleton.setAttachment = function (slotName, attachmentName) {
        this._skeleton && this._skeleton.setAttachment(slotName, attachmentName);
    };

    skeleton.getTextureAtlas = function (regionAttachment) {
        cc.warn("sp.Skeleton getTextureAtlas not support in native");
        return null;
    };

    skeleton.setMix = function (fromAnimation, toAnimation, duration) {
        if (this._skeleton) {
            this._skeleton.setMix(fromAnimation, toAnimation, duration);
        }
    };

    skeleton.setAnimation = function (trackIndex, name, loop) {
        if (this._skeleton) {
            return this._skeleton.setAnimation(trackIndex, name, loop);
        }
        return null;
    };

    skeleton.addAnimation = function (trackIndex, name, loop, delay) {
        if (this._skeleton) {
            delay = delay || 0;
            return this._skeleton.addAnimation(trackIndex, name, loop, delay);
        }
        return null;
    };

    skeleton.findAnimation = function (name) {
        if (this._skeleton) return this._skeleton.findAnimation(name);
        return null;
    };

    skeleton.getCurrent = function (trackIndex) {
        if (this._skeleton) {
            return this._skeleton.getCurrent(trackIndex);
        }
        return null;
    };

    skeleton.clearTracks = function () {
        if (this._skeleton) {
            this._skeleton.clearTracks();
        }
    };

    skeleton.clearTrack = function (trackIndex) {
        if (this._skeleton) {
            this._skeleton.clearTrack(trackIndex);
        }
    };

    skeleton.setStartListener = function (listener) {
        this._startListener = listener;
        if (this._skeleton) {
            this._skeleton.setStartListener(listener);
        }
    };

    skeleton.setInterruptListener = function (listener) {
        this._interruptListener = listener;
        if (this._skeleton) {
            this._skeleton.setInterruptListener(listener);
        }
    };

    skeleton.setEndListener = function (listener) {
        this._endListener = listener;
        if (this._skeleton) {
            this._skeleton.setEndListener(listener);
        }
    };

    skeleton.setDisposeListener = function (listener) {
        this._disposeListener = listener;
        if (this._skeleton) {
            this._skeleton.setDisposeListener(listener);
        }
    };

    skeleton.setCompleteListener = function (listener) {
        this._completeListener = listener;
        if (this._skeleton) {
            this._skeleton.setCompleteListener(listener);
        }
    };

    skeleton.setEventListener = function (listener) {
        this._eventListener = listener;
        if (this._skeleton) {
            this._skeleton.setEventListener(listener);
        }
    };

    skeleton.setTrackStartListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackStartListener(entry, listener);
        }
    };

    skeleton.setTrackInterruptListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackInterruptListener(entry, listener);
        }
    };

    skeleton.setTrackEndListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackEndListener(entry, listener);
        }
    };

    skeleton.setTrackDisposeListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackDisposeListener(entry, listener);
        }
    };

    skeleton.setTrackCompleteListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackCompleteListener(entry, listener);
        }
    };

    skeleton.setTrackEventListener = function (entry, listener) {
        if (this._skeleton) {
            this._skeleton.setTrackEventListener(entry, listener);
        }
    };

    skeleton.getState = function () {
        if (this._skeleton) {
            return this._skeleton.getState();
        }
    };

    skeleton._ensureListener = function () {
        cc.warn("sp.Skeleton _ensureListener not need in native");
    };

    skeleton._updateSkeletonData = function () {
        if (this.skeletonData) {
            this.skeletonData.init();
            this.setSkeletonData(this.skeletonData);
            this.defaultSkin && this._skeleton.setSkin(this.defaultSkin);
            this.animation = this.defaultAnimation;
        }
    };

    let _onDestroy = skeleton.onDestroy;
    skeleton.onDestroy = function(){
        _onDestroy.call(this);
        if (this._skeleton) {
            this._skeleton.stopSchedule();
            this._skeleton._comp = undefined;
            this._skeleton = undefined;
        }
        this._materialCache = undefined;
    };

})();