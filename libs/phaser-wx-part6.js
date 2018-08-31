import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
Phaser.Cache = function (game) {
    this.game = game;
    this.autoResolveURL = false;
    this._cache = {
        canvas: {},
        image: {},
        texture: {},
        sound: {},
        video: {},
        text: {},
        json: {},
        xml: {},
        physics: {},
        tilemap: {},
        binary: {},
        bitmapData: {},
        bitmapFont: {},
        shader: {},
        renderTexture: {}
    };
    this._urlMap = {};
    this._urlResolver = new Image();
    this._urlTemp = null;
    this.onSoundUnlock = new Phaser.Signal();
    this._cacheMap = [];
    this._cacheMap[Phaser.Cache.CANVAS] = this._cache.canvas;
    this._cacheMap[Phaser.Cache.IMAGE] = this._cache.image;
    this._cacheMap[Phaser.Cache.TEXTURE] = this._cache.texture;
    this._cacheMap[Phaser.Cache.SOUND] = this._cache.sound;
    this._cacheMap[Phaser.Cache.TEXT] = this._cache.text;
    this._cacheMap[Phaser.Cache.PHYSICS] = this._cache.physics;
    this._cacheMap[Phaser.Cache.TILEMAP] = this._cache.tilemap;
    this._cacheMap[Phaser.Cache.BINARY] = this._cache.binary;
    this._cacheMap[Phaser.Cache.BITMAPDATA] = this._cache.bitmapData;
    this._cacheMap[Phaser.Cache.BITMAPFONT] = this._cache.bitmapFont;
    this._cacheMap[Phaser.Cache.JSON] = this._cache.json;
    this._cacheMap[Phaser.Cache.XML] = this._cache.xml;
    this._cacheMap[Phaser.Cache.VIDEO] = this._cache.video;
    this._cacheMap[Phaser.Cache.SHADER] = this._cache.shader;
    this._cacheMap[Phaser.Cache.RENDER_TEXTURE] = this._cache.renderTexture;
    this.addDefaultImage();
    this.addMissingImage();
};
Phaser.Cache.CANVAS = 1;
Phaser.Cache.IMAGE = 2;
Phaser.Cache.TEXTURE = 3;
Phaser.Cache.SOUND = 4;
Phaser.Cache.TEXT = 5;
Phaser.Cache.PHYSICS = 6;
Phaser.Cache.TILEMAP = 7;
Phaser.Cache.BINARY = 8;
Phaser.Cache.BITMAPDATA = 9;
Phaser.Cache.BITMAPFONT = 10;
Phaser.Cache.JSON = 11;
Phaser.Cache.XML = 12;
Phaser.Cache.VIDEO = 13;
Phaser.Cache.SHADER = 14;
Phaser.Cache.RENDER_TEXTURE = 15;
Phaser.Cache.DEFAULT = null;
Phaser.Cache.MISSING = null;
Phaser.Cache.prototype = {
    addCanvas: function (key, canvas, context) {
        if (context === undefined) {
            context = canvas.getContext('2d');
        }
        this._cache.canvas[key] = {
            canvas: canvas,
            context: context
        };
    },
    addImage: function (key, url, data) {
        if (this.checkImageKey(key)) {
            this.removeImage(key);
        }
        var img = {
            key: key,
            url: url,
            data: data,
            base: new PIXI.BaseTexture(data),
            frame: new Phaser.Frame(0, 0, 0, data.width, data.height, key),
            frameData: new Phaser.FrameData()
        };
        img.frameData.addFrame(new Phaser.Frame(0, 0, 0, data.width, data.height, url));
        this._cache.image[key] = img;
        this._resolveURL(url, img);
        if (key === '__default') {
            Phaser.Cache.DEFAULT = new PIXI.Texture(img.base);
        } else if (key === '__missing') {
            Phaser.Cache.MISSING = new PIXI.Texture(img.base);
        }
        return img;
    },
    addDefaultImage: function () {
        var img = new Image();
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABVJREFUeF7NwIEAAAAAgKD9qdeocAMAoAABm3DkcAAAAABJRU5ErkJggg==";
        var obj = this.addImage('__default', null, img);
        obj.base.skipRender = true;
        Phaser.Cache.DEFAULT = new PIXI.Texture(obj.base);
    },
    addMissingImage: function () {
        var img = new Image();
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJ9JREFUeNq01ssOwyAMRFG46v//Mt1ESmgh+DFmE2GPOBARKb2NVjo+17PXLD8a1+pl5+A+wSgFygymWYHBb0FtsKhJDdZlncG2IzJ4ayoMDv20wTmSMzClEgbWYNTAkQ0Z+OJ+A/eWnAaR9+oxCF4Os0H8htsMUp+pwcgBBiMNnAwF8GqIgL2hAzaGFFgZauDPKABmowZ4GL369/0rwACp2yA/ttmvsQAAAABJRU5ErkJggg==";
        var obj = this.addImage('__missing', null, img);
        Phaser.Cache.MISSING = new PIXI.Texture(obj.base);
    },
    addSound: function (key, url, data, webAudio, audioTag) {
        if (webAudio === undefined) {
            webAudio = true;
            audioTag = false;
        }
        if (audioTag === undefined) {
            webAudio = false;
            audioTag = true;
        }
        var decoded = false;
        if (audioTag) {
            decoded = true;
        }
        this._cache.sound[key] = {
            url: url,
            data: data,
            isDecoding: false,
            decoded: decoded,
            webAudio: webAudio,
            audioTag: audioTag,
            locked: this.game.sound.touchLocked
        };
        this._resolveURL(url, this._cache.sound[key]);
    },
    addText: function (key, url, data) {
        this._cache.text[key] = {
            url: url,
            data: data
        };
        this._resolveURL(url, this._cache.text[key]);
    },
    addPhysicsData: function (key, url, JSONData, format) {
        this._cache.physics[key] = {
            url: url,
            data: JSONData,
            format: format
        };
        this._resolveURL(url, this._cache.physics[key]);
    },
    addTilemap: function (key, url, mapData, format) {
        this._cache.tilemap[key] = {
            url: url,
            data: mapData,
            format: format
        };
        this._resolveURL(url, this._cache.tilemap[key]);
    },
    addBinary: function (key, binaryData) {
        this._cache.binary[key] = binaryData;
    },
    addBitmapData: function (key, bitmapData, frameData) {
        bitmapData.key = key;
        if (frameData === undefined) {
            frameData = new Phaser.FrameData();
            frameData.addFrame(bitmapData.textureFrame);
        }
        this._cache.bitmapData[key] = {
            data: bitmapData,
            frameData: frameData
        };
        return bitmapData;
    },
    addBitmapFont: function (key, url, data, atlasData, atlasType, xSpacing, ySpacing) {
        var obj = {
            url: url,
            data: data,
            font: null,
            base: new PIXI.BaseTexture(data)
        };
        if (xSpacing === undefined) {
            xSpacing = 0;
        }
        if (ySpacing === undefined) {
            ySpacing = 0;
        }
        if (atlasType === 'json') {
            obj.font = Phaser.LoaderParser.jsonBitmapFont(atlasData, obj.base, xSpacing, ySpacing);
        } else {
            obj.font = Phaser.LoaderParser.xmlBitmapFont(atlasData, obj.base, xSpacing, ySpacing);
        }
        this._cache.bitmapFont[key] = obj;
        this._resolveURL(url, obj);
    },
    addJSON: function (key, url, data) {
        this._cache.json[key] = {
            url: url,
            data: data
        };
        this._resolveURL(url, this._cache.json[key]);
    },
    addXML: function (key, url, data) {
        this._cache.xml[key] = {
            url: url,
            data: data
        };
        this._resolveURL(url, this._cache.xml[key]);
    },
    addVideo: function (key, url, data, isBlob) {
        this._cache.video[key] = {
            url: url,
            data: data,
            isBlob: isBlob,
            locked: true
        };
        this._resolveURL(url, this._cache.video[key]);
    },
    addShader: function (key, url, data) {
        this._cache.shader[key] = {
            url: url,
            data: data
        };
        this._resolveURL(url, this._cache.shader[key]);
    },
    addRenderTexture: function (key, texture) {
        this._cache.renderTexture[key] = {
            texture: texture,
            frame: new Phaser.Frame(0, 0, 0, texture.width, texture.height, '', '')
        };
    },
    addSpriteSheet: function (key, url, data, frameWidth, frameHeight, frameMax, margin, spacing) {
        if (frameMax === undefined) {
            frameMax = -1;
        }
        if (margin === undefined) {
            margin = 0;
        }
        if (spacing === undefined) {
            spacing = 0;
        }
        var obj = {
            key: key,
            url: url,
            data: data,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            margin: margin,
            spacing: spacing,
            base: new PIXI.BaseTexture(data),
            frameData: Phaser.AnimationParser.spriteSheet(this.game, data, frameWidth, frameHeight, frameMax, margin, spacing)
        };
        this._cache.image[key] = obj;
        this._resolveURL(url, obj);
    },
    addTextureAtlas: function (key, url, data, atlasData, format) {
        var obj = {
            key: key,
            url: url,
            data: data,
            base: new PIXI.BaseTexture(data)
        };
        if (format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING) {
            obj.frameData = Phaser.AnimationParser.XMLData(this.game, atlasData, key);
        } else if (format === Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL) {
            obj.frameData = Phaser.AnimationParser.JSONDataPyxel(this.game, atlasData, key);
        } else {
            if (Array.isArray(atlasData.frames)) {
                obj.frameData = Phaser.AnimationParser.JSONData(this.game, atlasData, key);
            } else {
                obj.frameData = Phaser.AnimationParser.JSONDataHash(this.game, atlasData, key);
            }
        }
        this._cache.image[key] = obj;
        this._resolveURL(url, obj);
    },
    reloadSound: function (key) {
        var _this = this;
        var sound = this.getSound(key);
        if (sound) {
            sound.data.src = sound.url;
            sound.data.addEventListener('canplaythrough', function () {
                return _this.reloadSoundComplete(key);
            }, false);
            sound.data.load();
        }
    },
    reloadSoundComplete: function (key) {
        var sound = this.getSound(key);
        if (sound) {
            sound.locked = false;
            this.onSoundUnlock.dispatch(key);
        }
    },
    updateSound: function (key, property, value) {
        var sound = this.getSound(key);
        if (sound) {
            sound[property] = value;
        }
    },
    decodedSound: function (key, data) {
        var sound = this.getSound(key);
        sound.data = data;
        sound.decoded = true;
        sound.isDecoding = false;
    },
    isSoundDecoded: function (key) {
        var sound = this.getItem(key, Phaser.Cache.SOUND, 'isSoundDecoded');
        if (sound) {
            return sound.decoded;
        }
    },
    isSoundReady: function (key) {
        var sound = this.getItem(key, Phaser.Cache.SOUND, 'isSoundDecoded');
        if (sound) {
            return (sound.decoded && !this.game.sound.touchLocked);
        }
    },
    checkKey: function (cache, key) {
        if (this._cacheMap[cache][key]) {
            return true;
        }
        return false;
    },
    checkURL: function (url) {
        if (this._urlMap[this._resolveURL(url)]) {
            return true;
        }
        return false;
    },
    checkCanvasKey: function (key) {
        return this.checkKey(Phaser.Cache.CANVAS, key);
    },
    checkImageKey: function (key) {
        return this.checkKey(Phaser.Cache.IMAGE, key);
    },
    checkTextureKey: function (key) {
        return this.checkKey(Phaser.Cache.TEXTURE, key);
    },
    checkSoundKey: function (key) {
        return this.checkKey(Phaser.Cache.SOUND, key);
    },
    checkTextKey: function (key) {
        return this.checkKey(Phaser.Cache.TEXT, key);
    },
    checkPhysicsKey: function (key) {
        return this.checkKey(Phaser.Cache.PHYSICS, key);
    },
    checkTilemapKey: function (key) {
        return this.checkKey(Phaser.Cache.TILEMAP, key);
    },
    checkBinaryKey: function (key) {
        return this.checkKey(Phaser.Cache.BINARY, key);
    },
    checkBitmapDataKey: function (key) {
        return this.checkKey(Phaser.Cache.BITMAPDATA, key);
    },
    checkBitmapFontKey: function (key) {
        return this.checkKey(Phaser.Cache.BITMAPFONT, key);
    },
    checkJSONKey: function (key) {
        return this.checkKey(Phaser.Cache.JSON, key);
    },
    checkXMLKey: function (key) {
        return this.checkKey(Phaser.Cache.XML, key);
    },
    checkVideoKey: function (key) {
        return this.checkKey(Phaser.Cache.VIDEO, key);
    },
    checkShaderKey: function (key) {
        return this.checkKey(Phaser.Cache.SHADER, key);
    },
    checkRenderTextureKey: function (key) {
        return this.checkKey(Phaser.Cache.RENDER_TEXTURE, key);
    },
    getItem: function (key, cache, method, property) {
        if (!this.checkKey(cache, key)) {
            if (method) {
                console.warn('Phaser.Cache.' + method + ': Key "' + key + '" not found in Cache.');
            }
        } else {
            if (property === undefined) {
                return this._cacheMap[cache][key];
            } else {
                return this._cacheMap[cache][key][property];
            }
        }
        return null;
    },
    getCanvas: function (key) {
        return this.getItem(key, Phaser.Cache.CANVAS, 'getCanvas', 'canvas');
    },
    getImage: function (key, full) {
        if (key === undefined || key === null) {
            key = '__default';
        }
        if (full === undefined) {
            full = false;
        }
        var img = this.getItem(key, Phaser.Cache.IMAGE, 'getImage');
        if (img === null) {
            img = this.getItem('__missing', Phaser.Cache.IMAGE, 'getImage');
        }
        if (full) {
            return img;
        } else {
            return img.data;
        }
    },
    getTextureFrame: function (key) {
        return this.getItem(key, Phaser.Cache.TEXTURE, 'getTextureFrame', 'frame');
    },
    getSound: function (key) {
        return this.getItem(key, Phaser.Cache.SOUND, 'getSound');
    },
    getSoundData: function (key) {
        return this.getItem(key, Phaser.Cache.SOUND, 'getSoundData', 'data');
    },
    getText: function (key) {
        return this.getItem(key, Phaser.Cache.TEXT, 'getText', 'data');
    },
    getPhysicsData: function (key, object, fixtureKey) {
        var data = this.getItem(key, Phaser.Cache.PHYSICS, 'getPhysicsData', 'data');
        if (data === null || object === undefined || object === null) {
            return data;
        } else {
            if (data[object]) {
                var fixtures = data[object];
                if (fixtures && fixtureKey) {
                    for (var fixture in fixtures) {
                        fixture = fixtures[fixture];
                        if (fixture.fixtureKey === fixtureKey) {
                            return fixture;
                        }
                    }
                    console.warn('Phaser.Cache.getPhysicsData: Could not find given fixtureKey: "' + fixtureKey + ' in ' + key + '"');
                } else {
                    return fixtures;
                }
            } else {
                console.warn('Phaser.Cache.getPhysicsData: Invalid key/object: "' + key + ' / ' + object + '"');
            }
        }
        return null;
    },
    getTilemapData: function (key) {
        return this.getItem(key, Phaser.Cache.TILEMAP, 'getTilemapData');
    },
    getBinary: function (key) {
        return this.getItem(key, Phaser.Cache.BINARY, 'getBinary');
    },
    getBitmapData: function (key) {
        return this.getItem(key, Phaser.Cache.BITMAPDATA, 'getBitmapData', 'data');
    },
    getBitmapFont: function (key) {
        return this.getItem(key, Phaser.Cache.BITMAPFONT, 'getBitmapFont');
    },
    getJSON: function (key, clone) {
        var data = this.getItem(key, Phaser.Cache.JSON, 'getJSON', 'data');
        if (data) {
            if (clone) {
                return Phaser.Utils.extend(true, Array.isArray(data) ? [] : {}, data);
            } else {
                return data;
            }
        } else {
            return null;
        }
    },
    getXML: function (key) {
        return this.getItem(key, Phaser.Cache.XML, 'getXML', 'data');
    },
    getVideo: function (key) {
        return this.getItem(key, Phaser.Cache.VIDEO, 'getVideo');
    },
    getShader: function (key) {
        return this.getItem(key, Phaser.Cache.SHADER, 'getShader', 'data');
    },
    getRenderTexture: function (key) {
        return this.getItem(key, Phaser.Cache.RENDER_TEXTURE, 'getRenderTexture');
    },
    getBaseTexture: function (key, cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        return this.getItem(key, cache, 'getBaseTexture', 'base');
    },
    getFrame: function (key, cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        return this.getItem(key, cache, 'getFrame', 'frame');
    },
    getFrameCount: function (key, cache) {
        var data = this.getFrameData(key, cache);
        if (data) {
            return data.total;
        } else {
            return 0;
        }
    },
    getFrameData: function (key, cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        return this.getItem(key, cache, 'getFrameData', 'frameData');
    },
    hasFrameData: function (key, cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        return (this.getItem(key, cache, '', 'frameData') !== null);
    },
    updateFrameData: function (key, frameData, cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        if (this._cacheMap[cache][key]) {
            this._cacheMap[cache][key].frameData = frameData;
        }
    },
    getFrameByIndex: function (key, index, cache) {
        var data = this.getFrameData(key, cache);
        if (data) {
            return data.getFrame(index);
        } else {
            return null;
        }
    },
    getFrameByName: function (key, name, cache) {
        var data = this.getFrameData(key, cache);
        if (data) {
            return data.getFrameByName(name);
        } else {
            return null;
        }
    },
    getURL: function (url) {
        var url = this._resolveURL(url);
        if (url) {
            return this._urlMap[url];
        } else {
            console.warn('Phaser.Cache.getUrl: Invalid url: "' + url + '" or Cache.autoResolveURL was false');
            return null;
        }
    },
    getKeys: function (cache) {
        if (cache === undefined) {
            cache = Phaser.Cache.IMAGE;
        }
        var out = [];
        if (this._cacheMap[cache]) {
            for (var key in this._cacheMap[cache]) {
                if (key !== '__default' && key !== '__missing') {
                    out.push(key);
                }
            }
        }
        return out;
    },
    removeCanvas: function (key) {
        delete this._cache.canvas[key];
    },
    removeImage: function (key, destroyBaseTexture) {
        if (destroyBaseTexture === undefined) {
            destroyBaseTexture = true;
        }
        var img = this.getImage(key, true);
        if (destroyBaseTexture && img.base) {
            img.base.destroy();
        }
        delete this._cache.image[key];
    },
    removeSound: function (key) {
        delete this._cache.sound[key];
    },
    removeText: function (key) {
        delete this._cache.text[key];
    },
    removePhysics: function (key) {
        delete this._cache.physics[key];
    },
    removeTilemap: function (key) {
        delete this._cache.tilemap[key];
    },
    removeBinary: function (key) {
        delete this._cache.binary[key];
    },
    removeBitmapData: function (key) {
        delete this._cache.bitmapData[key];
    },
    removeBitmapFont: function (key) {
        delete this._cache.bitmapFont[key];
    },
    removeJSON: function (key) {
        delete this._cache.json[key];
    },
    removeXML: function (key) {
        delete this._cache.xml[key];
    },
    removeVideo: function (key) {
        delete this._cache.video[key];
    },
    removeShader: function (key) {
        delete this._cache.shader[key];
    },
    removeRenderTexture: function (key) {
        delete this._cache.renderTexture[key];
    },
    removeSpriteSheet: function (key) {
        delete this._cache.spriteSheet[key];
    },
    removeTextureAtlas: function (key) {
        delete this._cache.atlas[key];
    },
    clearGLTextures: function () {
        for (var key in this._cache.image) {
            this._cache.image[key].base._glTextures = [];
        }
    },
    _resolveURL: function (url, data) {
        if (!this.autoResolveURL) {
            return null;
        }
        this._urlResolver.src = this.game.load.baseURL + url;
        this._urlTemp = this._urlResolver.src;
        this._urlResolver.src = '';
        if (data) {
            this._urlMap[this._urlTemp] = data;
        }
        return this._urlTemp;
    },
    destroy: function () {
        for (var i = 0; i < this._cacheMap.length; i++) {
            var cache = this._cacheMap[i];
            for (var key in cache) {
                if (key !== '__default' && key !== '__missing') {
                    if (cache[key]['destroy']) {
                        cache[key].destroy();
                    }
                    delete cache[key];
                }
            }
        }
        this._urlMap = null;
        this._urlResolver = null;
        this._urlTemp = null;
    }
};
Phaser.Cache.prototype.constructor = Phaser.Cache;
Phaser.Loader = function (game) {
    this.game = game;
    this.cache = game.cache;
    this.resetLocked = false;
    this.isLoading = false;
    this.hasLoaded = false;
    this.preloadSprite = null;
    this.crossOrigin = false;
    this.baseURL = '';
    this.path = '';
    this.headers = {
        "requestedWith": false,
        "json": "application/json",
        "xml": "application/xml"
    };
    this.onLoadStart = new Phaser.Signal();
    this.onLoadComplete = new Phaser.Signal();
    this.onPackComplete = new Phaser.Signal();
    this.onFileStart = new Phaser.Signal();
    this.onFileComplete = new Phaser.Signal();
    this.onFileError = new Phaser.Signal();
    this.useXDomainRequest = false;
    this._warnedAboutXDomainRequest = false;
    this.enableParallel = true;
    this.maxParallelDownloads = 4;
    this._withSyncPointDepth = 0;
    this._fileList = [];
    this._flightQueue = [];
    this._processingHead = 0;
    this._fileLoadStarted = false;
    this._totalPackCount = 0;
    this._totalFileCount = 0;
    this._loadedPackCount = 0;
    this._loadedFileCount = 0;
};
Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY = 0;
Phaser.Loader.TEXTURE_ATLAS_JSON_HASH = 1;
Phaser.Loader.TEXTURE_ATLAS_XML_STARLING = 2;
Phaser.Loader.PHYSICS_LIME_CORONA_JSON = 3;
Phaser.Loader.PHYSICS_PHASER_JSON = 4;
Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL = 5;
Phaser.Loader.prototype = {
    setPreloadSprite: function (sprite, direction) {
        direction = direction || 0;
        this.preloadSprite = {
            sprite: sprite,
            direction: direction,
            width: sprite.width,
            height: sprite.height,
            rect: null
        };
        if (direction === 0) {
            this.preloadSprite.rect = new Phaser.Rectangle(0, 0, 1, sprite.height);
        } else {
            this.preloadSprite.rect = new Phaser.Rectangle(0, 0, sprite.width, 1);
        }
        sprite.crop(this.preloadSprite.rect);
        sprite.visible = true;
    },
    resize: function () {
        if (this.preloadSprite && this.preloadSprite.height !== this.preloadSprite.sprite.height) {
            this.preloadSprite.rect.height = this.preloadSprite.sprite.height;
        }
    },
    checkKeyExists: function (type, key) {
        return this.getAssetIndex(type, key) > -1;
    },
    getAssetIndex: function (type, key) {
        var bestFound = -1;
        for (var i = 0; i < this._fileList.length; i++) {
            var file = this._fileList[i];
            if (file.type === type && file.key === key) {
                bestFound = i;
                if (!file.loaded && !file.loading) {
                    break;
                }
            }
        }
        return bestFound;
    },
    getAsset: function (type, key) {
        var fileIndex = this.getAssetIndex(type, key);
        if (fileIndex > -1) {
            return {
                index: fileIndex,
                file: this._fileList[fileIndex]
            };
        }
        return false;
    },
    reset: function (hard, clearEvents) {
        if (clearEvents === undefined) {
            clearEvents = false;
        }
        if (this.resetLocked) {
            return;
        }
        if (hard) {
            this.preloadSprite = null;
        }
        this.isLoading = false;
        this._processingHead = 0;
        this._fileList.length = 0;
        this._flightQueue.length = 0;
        this._fileLoadStarted = false;
        this._totalFileCount = 0;
        this._totalPackCount = 0;
        this._loadedPackCount = 0;
        this._loadedFileCount = 0;
        if (clearEvents) {
            this.onLoadStart.removeAll();
            this.onLoadComplete.removeAll();
            this.onPackComplete.removeAll();
            this.onFileStart.removeAll();
            this.onFileComplete.removeAll();
            this.onFileError.removeAll();
        }
    },
    addToFileList: function (type, key, url, properties, overwrite, extension) {
        if (overwrite === undefined) {
            overwrite = false;
        }
        if (key === undefined || key === '') {
            console.warn("Phaser.Loader: Invalid or no key given of type " + type);
            return this;
        }
        if (url === undefined || url === null) {
            if (extension) {
                url = key + extension;
            } else {
                console.warn("Phaser.Loader: No URL given for file type: " + type + " key: " + key);
                return this;
            }
        }
        var file = {
            type: type,
            key: key,
            path: this.path,
            url: url,
            syncPoint: this._withSyncPointDepth > 0,
            data: null,
            loading: false,
            loaded: false,
            error: false
        };
        if (properties) {
            for (var prop in properties) {
                file[prop] = properties[prop];
            }
        }
        var fileIndex = this.getAssetIndex(type, key);
        if (overwrite && fileIndex > -1) {
            var currentFile = this._fileList[fileIndex];
            if (!currentFile.loading && !currentFile.loaded) {
                this._fileList[fileIndex] = file;
            } else {
                this._fileList.push(file);
                this._totalFileCount++;
            }
        } else if (fileIndex === -1) {
            this._fileList.push(file);
            this._totalFileCount++;
        }
        return this;
    },
    replaceInFileList: function (type, key, url, properties) {
        return this.addToFileList(type, key, url, properties, true);
    },
    pack: function (key, url, data, callbackContext) {
        if (url === undefined) {
            url = null;
        }
        if (data === undefined) {
            data = null;
        }
        if (callbackContext === undefined) {
            callbackContext = null;
        }
        if (!url && !data) {
            console.warn('Phaser.Loader.pack - Both url and data are null. One must be set.');
            return this;
        }
        var pack = {
            type: 'packfile',
            key: key,
            url: url,
            path: this.path,
            syncPoint: true,
            data: null,
            loading: false,
            loaded: false,
            error: false,
            callbackContext: callbackContext
        };
        if (data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            pack.data = data || {};
            pack.loaded = true;
        }
        for (var i = 0; i < this._fileList.length + 1; i++) {
            var file = this._fileList[i];
            if (!file || (!file.loaded && !file.loading && file.type !== 'packfile')) {
                this._fileList.splice(i, 0, pack);
                this._totalPackCount++;
                break;
            }
        }
        return this;
    },
    image: function (key, url, overwrite) {
        return this.addToFileList('image', key, url, undefined, overwrite, '.png');
    },
    images: function (keys, urls) {
        if (Array.isArray(urls)) {
            for (var i = 0; i < keys.length; i++) {
                this.image(keys[i], urls[i]);
            }
        } else {
            for (var i = 0; i < keys.length; i++) {
                this.image(keys[i]);
            }
        }
        return this;
    },
    text: function (key, url, overwrite) {
        return this.addToFileList('text', key, url, undefined, overwrite, '.txt');
    },
    json: function (key, url, overwrite) {
        return this.addToFileList('json', key, url, undefined, overwrite, '.json');
    },
    shader: function (key, url, overwrite) {
        return this.addToFileList('shader', key, url, undefined, overwrite, '.frag');
    },
    xml: function (key, url, overwrite) {
        return this.addToFileList('xml', key, url, undefined, overwrite, '.xml');
    },
    script: function (key, url, callback, callbackContext) {
        if (callback === undefined) {
            callback = false;
        }
        if (callback !== false && callbackContext === undefined) {
            callbackContext = this;
        }
        return this.addToFileList('script', key, url, {
            syncPoint: true,
            callback: callback,
            callbackContext: callbackContext
        }, false, '.js');
    },
    binary: function (key, url, callback, callbackContext) {
        if (callback === undefined) {
            callback = false;
        }
        if (callback !== false && callbackContext === undefined) {
            callbackContext = callback;
        }
        return this.addToFileList('binary', key, url, {
            callback: callback,
            callbackContext: callbackContext
        }, false, '.bin');
    },
    spritesheet: function (key, url, frameWidth, frameHeight, frameMax, margin, spacing) {
        if (frameMax === undefined) {
            frameMax = -1;
        }
        if (margin === undefined) {
            margin = 0;
        }
        if (spacing === undefined) {
            spacing = 0;
        }
        return this.addToFileList('spritesheet', key, url, {
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            frameMax: frameMax,
            margin: margin,
            spacing: spacing
        }, false, '.png');
    },
    audio: function (key, urls, autoDecode) {
        if (this.game.sound.noAudio) {
            return this;
        }
        if (autoDecode === undefined) {
            autoDecode = true;
        }
        if (typeof urls === 'string') {
            urls = [urls];
        }
        return this.addToFileList('audio', key, urls, {
            buffer: null,
            autoDecode: autoDecode
        });
    },
    audioSprite: function (key, urls, jsonURL, jsonData, autoDecode) {
        if (this.game.sound.noAudio) {
            return this;
        }
        if (jsonURL === undefined) {
            jsonURL = null;
        }
        if (jsonData === undefined) {
            jsonData = null;
        }
        if (autoDecode === undefined) {
            autoDecode = true;
        }
        this.audio(key, urls, autoDecode);
        if (jsonURL) {
            this.json(key + '-audioatlas', jsonURL);
        } else if (jsonData) {
            if (typeof jsonData === 'string') {
                jsonData = JSON.parse(jsonData);
            }
            this.cache.addJSON(key + '-audioatlas', '', jsonData);
        } else {
            console.warn('Phaser.Loader.audiosprite - You must specify either a jsonURL or provide a jsonData object');
        }
        return this;
    },
    audiosprite: function (key, urls, jsonURL, jsonData, autoDecode) {
        return this.audioSprite(key, urls, jsonURL, jsonData, autoDecode);
    },
    video: function (key, urls, loadEvent, asBlob) {
        if (loadEvent === undefined) {
            if (this.game.device.firefox) {
                loadEvent = 'loadeddata';
            } else {
                loadEvent = 'canplaythrough';
            }
        }
        if (asBlob === undefined) {
            asBlob = false;
        }
        if (typeof urls === 'string') {
            urls = [urls];
        }
        return this.addToFileList('video', key, urls, {
            buffer: null,
            asBlob: asBlob,
            loadEvent: loadEvent
        });
    },
    tilemap: function (key, url, data, format) {
        if (url === undefined) {
            url = null;
        }
        if (data === undefined) {
            data = null;
        }
        if (format === undefined) {
            format = Phaser.Tilemap.CSV;
        }
        if (!url && !data) {
            if (format === Phaser.Tilemap.CSV) {
                url = key + '.csv';
            } else {
                url = key + '.json';
            }
        }
        if (data) {
            switch (format) {
                case Phaser.Tilemap.CSV:
                    break;
                case Phaser.Tilemap.TILED_JSON:
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                    break;
            }
            this.cache.addTilemap(key, null, data, format);
        } else {
            this.addToFileList('tilemap', key, url, {
                format: format
            });
        }
        return this;
    },
    physics: function (key, url, data, format) {
        if (url === undefined) {
            url = null;
        }
        if (data === undefined) {
            data = null;
        }
        if (format === undefined) {
            format = Phaser.Physics.LIME_CORONA_JSON;
        }
        if (!url && !data) {
            url = key + '.json';
        }
        if (data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            this.cache.addPhysicsData(key, null, data, format);
        } else {
            this.addToFileList('physics', key, url, {
                format: format
            });
        }
        return this;
    },
    bitmapFont: function (key, textureURL, atlasURL, atlasData, xSpacing, ySpacing) {
        if (textureURL === undefined || textureURL === null) {
            textureURL = key + '.png';
        }
        if (atlasURL === undefined) {
            atlasURL = null;
        }
        if (atlasData === undefined) {
            atlasData = null;
        }
        if (atlasURL === null && atlasData === null) {
            atlasURL = key + '.xml';
        }
        if (xSpacing === undefined) {
            xSpacing = 0;
        }
        if (ySpacing === undefined) {
            ySpacing = 0;
        }
        if (atlasURL) {
            this.addToFileList('bitmapfont', key, textureURL, {
                atlasURL: atlasURL,
                xSpacing: xSpacing,
                ySpacing: ySpacing
            });
        } else {
            if (typeof atlasData === 'string') {
                var json, xml;
                try {
                    json = JSON.parse(atlasData);
                } catch (e) {
                    xml = this.parseXml(atlasData);
                }
                if (!xml && !json) {
                    throw new Error("Phaser.Loader. Invalid Bitmap Font atlas given");
                }
                this.addToFileList('bitmapfont', key, textureURL, {
                    atlasURL: null,
                    atlasData: json || xml,
                    atlasType: (!!json ? 'json' : 'xml'),
                    xSpacing: xSpacing,
                    ySpacing: ySpacing
                });
            } else {
                this.addToFileList('bitmapfont', key, textureURL, {
                    atlasURL: null,
                    atlasData: atlasData,
                    atlasType: 'json',
                    xSpacing: xSpacing,
                    ySpacing: ySpacing
                });
            }
        }
        return this;
    },
    atlasJSONArray: function (key, textureURL, atlasURL, atlasData) {
        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
    },
    atlasJSONHash: function (key, textureURL, atlasURL, atlasData) {
        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    },
    atlasXML: function (key, textureURL, atlasURL, atlasData) {
        if (atlasURL === undefined) {
            atlasURL = null;
        }
        if (atlasData === undefined) {
            atlasData = null;
        }
        if (!atlasURL && !atlasData) {
            atlasURL = key + '.xml';
        }
        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_XML_STARLING);
    },
    atlas: function (key, textureURL, atlasURL, atlasData, format) {
        if (textureURL === undefined || textureURL === null) {
            textureURL = key + '.png';
        }
        if (atlasURL === undefined) {
            atlasURL = null;
        }
        if (atlasData === undefined) {
            atlasData = null;
        }
        if (format === undefined) {
            format = Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY;
        }
        if (!atlasURL && !atlasData) {
            if (format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING) {
                atlasURL = key + '.xml';
            } else {
                atlasURL = key + '.json';
            }
        }
        if (atlasURL) {
            this.addToFileList('textureatlas', key, textureURL, {
                atlasURL: atlasURL,
                format: format
            });
        } else {
            switch (format) {
                case Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY:
                    if (typeof atlasData === 'string') {
                        atlasData = JSON.parse(atlasData);
                    }
                    break;
                case Phaser.Loader.TEXTURE_ATLAS_XML_STARLING:
                    if (typeof atlasData === 'string') {
                        var xml = this.parseXml(atlasData);
                        if (!xml) {
                            throw new Error("Phaser.Loader. Invalid Texture Atlas XML given");
                        }
                        atlasData = xml;
                    }
                    break;
            }
            this.addToFileList('textureatlas', key, textureURL, {
                atlasURL: null,
                atlasData: atlasData,
                format: format
            });
        }
        return this;
    },
    withSyncPoint: function (callback, callbackContext) {
        this._withSyncPointDepth++;
        try {
            callback.call(callbackContext || this, this);
        } finally {
            this._withSyncPointDepth--;
        }
        return this;
    },
    addSyncPoint: function (type, key) {
        var asset = this.getAsset(type, key);
        if (asset) {
            asset.file.syncPoint = true;
        }
        return this;
    },
    removeFile: function (type, key) {
        var asset = this.getAsset(type, key);
        if (asset) {
            if (!asset.loaded && !asset.loading) {
                this._fileList.splice(asset.index, 1);
            }
        }
    },
    removeAll: function () {
        this._fileList.length = 0;
        this._flightQueue.length = 0;
    },
    start: function () {
        if (this.isLoading) {
            return;
        }
        this.hasLoaded = false;
        this.isLoading = true;
        this.updateProgress();
        this.processLoadQueue();
    },
    processLoadQueue: function () {
        if (!this.isLoading) {
            console.warn('Phaser.Loader - active loading canceled / reset');
            this.finishedLoading(true);
            return;
        }
        for (var i = 0; i < this._flightQueue.length; i++) {
            var file = this._flightQueue[i];
            if (file.loaded || file.error) {
                this._flightQueue.splice(i, 1);
                i--;
                file.loading = false;
                file.requestUrl = null;
                file.requestObject = null;
                if (file.error) {
                    this.onFileError.dispatch(file.key, file);
                }
                if (file.type !== 'packfile') {
                    this._loadedFileCount++;
                    this.onFileComplete.dispatch(this.progress, file.key, !file.error, this._loadedFileCount, this._totalFileCount);
                } else if (file.type === 'packfile' && file.error) {
                    this._loadedPackCount++;
                    this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount);
                }
            }
        }
        var syncblock = false;
        var inflightLimit = this.enableParallel ? Phaser.Math.clamp(this.maxParallelDownloads, 1, 12) : 1;
        for (var i = this._processingHead; i < this._fileList.length; i++) {
            var file = this._fileList[i];
            if (file.type === 'packfile' && !file.error && file.loaded && i === this._processingHead) {
                this.processPack(file);
                this._loadedPackCount++;
                this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount);
            }
            if (file.loaded || file.error) {
                if (i === this._processingHead) {
                    this._processingHead = i + 1;
                }
            } else if (!file.loading && this._flightQueue.length < inflightLimit) {
                if (file.type === 'packfile' && !file.data) {
                    this._flightQueue.push(file);
                    file.loading = true;
                    this.loadFile(file);
                } else if (!syncblock) {
                    if (!this._fileLoadStarted) {
                        this._fileLoadStarted = true;
                        this.onLoadStart.dispatch();
                    }
                    this._flightQueue.push(file);
                    file.loading = true;
                    this.onFileStart.dispatch(this.progress, file.key, file.url);
                    this.loadFile(file);
                }
            }
            if (!file.loaded && file.syncPoint) {
                syncblock = true;
            }
            if (this._flightQueue.length >= inflightLimit || (syncblock && this._loadedPackCount === this._totalPackCount)) {
                break;
            }
        }
        this.updateProgress();
        if (this._processingHead >= this._fileList.length) {
            this.finishedLoading();
        } else if (!this._flightQueue.length) {
            console.warn("Phaser.Loader - aborting: processing queue empty, loading may have stalled");
            var _this = this;
            setTimeout(function () {
                _this.finishedLoading(true);
            }, 2000);
        }
    },
    finishedLoading: function (abnormal) {
        if (this.hasLoaded) {
            return;
        }
        this.hasLoaded = true;
        this.isLoading = false;
        if (!abnormal && !this._fileLoadStarted) {
            this._fileLoadStarted = true;
            this.onLoadStart.dispatch();
        }
        this.onLoadComplete.dispatch();
        this.game.state.loadComplete();
        this.reset();
    },
    asyncComplete: function (file, errorMessage) {
        if (errorMessage === undefined) {
            errorMessage = '';
        }
        file.loaded = true;
        file.error = !!errorMessage;
        if (errorMessage) {
            file.errorMessage = errorMessage;
            console.warn('Phaser.Loader - ' + file.type + '[' + file.key + ']' + ': ' + errorMessage);
        }
        this.processLoadQueue();
    },
    processPack: function (pack) {
        var packData = pack.data[pack.key];
        if (!packData) {
            console.warn('Phaser.Loader - ' + pack.key + ': pack has data, but not for pack key');
            return;
        }
        for (var i = 0; i < packData.length; i++) {
            var file = packData[i];
            switch (file.type) {
                case "image":
                    this.image(file.key, file.url, file.overwrite);
                    break;
                case "text":
                    this.text(file.key, file.url, file.overwrite);
                    break;
                case "json":
                    this.json(file.key, file.url, file.overwrite);
                    break;
                case "xml":
                    this.xml(file.key, file.url, file.overwrite);
                    break;
                case "script":
                    this.script(file.key, file.url, file.callback, pack.callbackContext || this);
                    break;
                case "binary":
                    this.binary(file.key, file.url, file.callback, pack.callbackContext || this);
                    break;
                case "spritesheet":
                    this.spritesheet(file.key, file.url, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                    break;
                case "video":
                    this.video(file.key, file.urls);
                    break;
                case "audio":
                    this.audio(file.key, file.urls, file.autoDecode);
                    break;
                case "audiosprite":
                    this.audiosprite(file.key, file.urls, file.jsonURL, file.jsonData, file.autoDecode);
                    break;
                case "tilemap":
                    this.tilemap(file.key, file.url, file.data, Phaser.Tilemap[file.format]);
                    break;
                case "physics":
                    this.physics(file.key, file.url, file.data, Phaser.Loader[file.format]);
                    break;
                case "bitmapFont":
                    this.bitmapFont(file.key, file.textureURL, file.atlasURL, file.atlasData, file.xSpacing, file.ySpacing);
                    break;
                case "atlasJSONArray":
                    this.atlasJSONArray(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;
                case "atlasJSONHash":
                    this.atlasJSONHash(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;
                case "atlasXML":
                    this.atlasXML(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;
                case "atlas":
                    this.atlas(file.key, file.textureURL, file.atlasURL, file.atlasData, Phaser.Loader[file.format]);
                    break;
                case "shader":
                    this.shader(file.key, file.url, file.overwrite);
                    break;
            }
        }
    },
    transformUrl: function (url, file) {
        if (!url) {
            return false;
        }
        if (url.match(/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/)) {
            return url;
        } else {
            return this.baseURL + file.path + url;
        }
    },
    loadFile: function (file) {
        switch (file.type) {
            case 'packfile':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.fileComplete);
                break;
            case 'image':
            case 'spritesheet':
            case 'textureatlas':
            case 'bitmapfont':
                this.loadImageTag(file);
                break;
            case 'audio':
                file.url = this.getAudioURL(file.url);
                if (file.url) {
                    if (this.game.sound.usingWebAudio) {
                        this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
                    } else if (this.game.sound.usingAudioTag) {
                        this.loadAudioTag(file);
                    }
                } else {
                    this.fileError(file, null, 'No supported audio URL specified or device does not have audio playback support');
                }
                break;
            case 'video':
                file.url = this.getVideoURL(file.url);
                if (file.url) {
                    if (file.asBlob) {
                        this.xhrLoad(file, this.transformUrl(file.url, file), 'blob', this.fileComplete);
                    } else {
                        this.loadVideoTag(file);
                    }
                } else {
                    this.fileError(file, null, 'No supported video URL specified or device does not have video playback support');
                }
                break;
            case 'json':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
                break;
            case 'xml':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.xmlLoadComplete);
                break;
            case 'tilemap':
                if (file.format === Phaser.Tilemap.TILED_JSON) {
                    this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
                } else if (file.format === Phaser.Tilemap.CSV) {
                    this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.csvLoadComplete);
                } else {
                    this.asyncComplete(file, "invalid Tilemap format: " + file.format);
                }
                break;
            case 'text':
            case 'script':
            case 'shader':
            case 'physics':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.fileComplete);
                break;
            case 'binary':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
                break;
        }
    },
    loadImageTag: function (file) {
        var _this = this;
        file.data = new Image();
        file.data.name = file.key;
        if (this.crossOrigin) {
            file.data.crossOrigin = this.crossOrigin;
        }
        file.data.onload = function () {
            if (file.data.onload) {
                file.data.onload = null;
                file.data.onerror = null;
                _this.fileComplete(file);
            }
        };
        file.data.onerror = function () {
            if (file.data.onload) {
                file.data.onload = null;
                file.data.onerror = null;
                _this.fileError(file);
            }
        };
        file.data.src = this.transformUrl(file.url, file);
        if (file.data.complete && file.data.width && file.data.height) {
            file.data.onload = null;
            file.data.onerror = null;
            this.fileComplete(file);
        }
    },
    loadVideoTag: function (file) {
        var _this = this;
        file.data = document.createElement("video");
        file.data.name = file.key;
        file.data.controls = false;
        file.data.autoplay = false;
        var videoLoadEvent = function () {
            file.data.removeEventListener(file.loadEvent, videoLoadEvent, false);
            file.data.onerror = null;
            file.data.canplay = true;
            Phaser.GAMES[_this.game.id].load.fileComplete(file);
        };
        file.data.onerror = function () {
            file.data.removeEventListener(file.loadEvent, videoLoadEvent, false);
            file.data.onerror = null;
            file.data.canplay = false;
            _this.fileError(file);
        };
        file.data.addEventListener(file.loadEvent, videoLoadEvent, false);
        file.data.src = this.transformUrl(file.url, file);
        file.data.load();
    },
    loadAudioTag: function (file) {
        var _this = this;
        if (this.game.sound.touchLocked) {
            file.data = new Audio();
            file.data.name = file.key;
            file.data.preload = 'auto';
            file.data.src = this.transformUrl(file.url, file);
            this.fileComplete(file);
        } else {
            file.data = new Audio();
            file.data.name = file.key;
            var playThroughEvent = function () {
                file.data.removeEventListener('canplaythrough', playThroughEvent, false);
                file.data.onerror = null;
                _this.fileComplete(file);
            };
            file.data.onerror = function () {
                file.data.removeEventListener('canplaythrough', playThroughEvent, false);
                file.data.onerror = null;
                _this.fileError(file);
            };
            file.data.preload = 'auto';
            file.data.src = this.transformUrl(file.url, file);
            file.data.addEventListener('canplaythrough', playThroughEvent, false);
            file.data.load();
        }
    },
    xhrLoad: function (file, url, type, onload, onerror) {
        if (this.useXDomainRequest && window.XDomainRequest) {
            this.xhrLoadWithXDR(file, url, type, onload, onerror);
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = type;
        if (this.headers['requestedWith'] !== false) {
            xhr.setRequestHeader('X-Requested-With', this.headers['requestedWith']);
        }
        if (this.headers[file.type]) {
            xhr.setRequestHeader('Accept', this.headers[file.type]);
        }
        onerror = onerror || this.fileError;
        var _this = this;
        xhr.onload = function () {
            try {
                if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599) {
                    return onerror.call(_this, file, xhr);
                } else {
                    return onload.call(_this, file, xhr);
                }
            } catch (e) {
                if (!_this.hasLoaded) {
                    _this.asyncComplete(file, e.message || 'Exception');
                } else {
                    if (window['console']) {
                        console.error(e);
                    }
                }
            }
        };
        xhr.onerror = function () {
            try {
                return onerror.call(_this, file, xhr);
            } catch (e) {
                if (!_this.hasLoaded) {
                    _this.asyncComplete(file, e.message || 'Exception');
                } else {
                    if (window['console']) {
                        console.error(e);
                    }
                }
            }
        };
        file.requestObject = xhr;
        file.requestUrl = url;
        xhr.send();
    },
    xhrLoadWithXDR: function (file, url, type, onload, onerror) {
        if (!this._warnedAboutXDomainRequest && (!this.game.device.ie || this.game.device.ieVersion >= 10)) {
            this._warnedAboutXDomainRequest = true;
            console.warn("Phaser.Loader - using XDomainRequest outside of IE 9");
        }
        var xhr = new window.XDomainRequest();
        xhr.open('GET', url, true);
        xhr.responseType = type;
        xhr.timeout = 3000;
        onerror = onerror || this.fileError;
        var _this = this;
        xhr.onerror = function () {
            try {
                return onerror.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };
        xhr.ontimeout = function () {
            try {
                return onerror.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };
        xhr.onprogress = function () {};
        xhr.onload = function () {
            try {
                if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599) {
                    return onerror.call(_this, file, xhr);
                } else {
                    return onload.call(_this, file, xhr);
                }
                return onload.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };
        file.requestObject = xhr;
        file.requestUrl = url;
        setTimeout(function () {
            xhr.send();
        }, 0);
    },
    getVideoURL: function (urls) {
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            var videoType;
            if (url.uri) {
                videoType = url.type;
                url = url.uri;
                if (this.game.device.canPlayVideo(videoType)) {
                    return url;
                }
            } else {
                if (url.indexOf("blob:") === 0 || url.indexOf("data:") === 0) {
                    return url;
                }
                if (url.indexOf("?") >= 0) {
                    url = url.substr(0, url.indexOf("?"));
                }
                var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || Infinity) + 1);
                videoType = extension.toLowerCase();
                if (this.game.device.canPlayVideo(videoType)) {
                    return urls[i];
                }
            }
        }
        return null;
    },
    getAudioURL: function (urls) {
        if (this.game.sound.noAudio) {
            return null;
        }
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            var audioType;
            if (url.uri) {
                audioType = url.type;
                url = url.uri;
                if (this.game.device.canPlayAudio(audioType)) {
                    return url;
                }
            } else {
                if (url.indexOf("blob:") === 0 || url.indexOf("data:") === 0) {
                    return url;
                }
                if (url.indexOf("?") >= 0) {
                    url = url.substr(0, url.indexOf("?"));
                }
                var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || Infinity) + 1);
                audioType = extension.toLowerCase();
                if (this.game.device.canPlayAudio(audioType)) {
                    return urls[i];
                }
            }
        }
        return null;
    },
    fileError: function (file, xhr, reason) {
        var url = file.requestUrl || this.transformUrl(file.url, file);
        var message = 'error loading asset from URL ' + url;
        if (!reason && xhr) {
            reason = xhr.status;
        }
        if (reason) {
            message = message + ' (' + reason + ')';
        }
        this.asyncComplete(file, message);
    },
    fileComplete: function (file, xhr) {
        var loadNext = true;
        switch (file.type) {
            case 'packfile':
                var data = JSON.parse(xhr.responseText);
                file.data = data || {};
                break;
            case 'image':
                this.cache.addImage(file.key, file.url, file.data);
                break;
            case 'spritesheet':
                this.cache.addSpriteSheet(file.key, file.url, file.data, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                break;
            case 'textureatlas':
                if (file.atlasURL == null) {
                    this.cache.addTextureAtlas(file.key, file.url, file.data, file.atlasData, file.format);
                } else {
                    loadNext = false;
                    if (file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY || file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_HASH || file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL) {
                        this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', this.jsonLoadComplete);
                    } else if (file.format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING) {
                        this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', this.xmlLoadComplete);
                    } else {
                        throw new Error("Phaser.Loader. Invalid Texture Atlas format: " + file.format);
                    }
                }
                break;
            case 'bitmapfont':
                if (!file.atlasURL) {
                    this.cache.addBitmapFont(file.key, file.url, file.data, file.atlasData, file.atlasType, file.xSpacing, file.ySpacing);
                } else {
                    loadNext = false;
                    this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', function (file, xhr) {
                        var json;
                        try {
                            json = JSON.parse(xhr.responseText);
                        } catch (e) {}
                        if (!!json) {
                            file.atlasType = 'json';
                            this.jsonLoadComplete(file, xhr);
                        } else {
                            file.atlasType = 'xml';
                            this.xmlLoadComplete(file, xhr);
                        }
                    });
                }
                break;
            case 'video':
                if (file.asBlob) {
                    try {
                        file.data = xhr.response;
                    } catch (e) {
                        throw new Error("Phaser.Loader. Unable to parse video file as Blob: " + file.key);
                    }
                }
                this.cache.addVideo(file.key, file.url, file.data, file.asBlob);
                break;
            case 'audio':
                if (this.game.sound.usingWebAudio) {
                    file.data = xhr.response;
                    this.cache.addSound(file.key, file.url, file.data, true, false);
                    if (file.autoDecode) {
                        this.game.sound.decode(file.key);
                    }
                } else {
                    this.cache.addSound(file.key, file.url, file.data, false, true);
                }
                break;
            case 'text':
                file.data = xhr.responseText;
                this.cache.addText(file.key, file.url, file.data);
                break;
            case 'shader':
                file.data = xhr.responseText;
                this.cache.addShader(file.key, file.url, file.data);
                break;
            case 'physics':
                var data = JSON.parse(xhr.responseText);
                this.cache.addPhysicsData(file.key, file.url, data, file.format);
                break;
            case 'script':
                file.data = document.createElement('script');
                file.data.language = 'javascript';
                file.data.type = 'text/javascript';
                file.data.defer = false;
                file.data.text = xhr.responseText;
                document.head.appendChild(file.data);
                if (file.callback) {
                    file.data = file.callback.call(file.callbackContext, file.key, xhr.responseText);
                }
                break;
            case 'binary':
                if (file.callback) {
                    file.data = file.callback.call(file.callbackContext, file.key, xhr.response);
                } else {
                    file.data = xhr.response;
                }
                this.cache.addBinary(file.key, file.data);
                break;
        }
        if (loadNext) {
            this.asyncComplete(file);
        }
    },
    jsonLoadComplete: function (file, xhr) {
        var data = JSON.parse(xhr.responseText);
        if (file.type === 'tilemap') {
            this.cache.addTilemap(file.key, file.url, data, file.format);
        } else if (file.type === 'bitmapfont') {
            this.cache.addBitmapFont(file.key, file.url, file.data, data, file.atlasType, file.xSpacing, file.ySpacing);
        } else if (file.type === 'json') {
            this.cache.addJSON(file.key, file.url, data);
        } else {
            this.cache.addTextureAtlas(file.key, file.url, file.data, data, file.format);
        }
        this.asyncComplete(file);
    },
    csvLoadComplete: function (file, xhr) {
        var data = xhr.responseText;
        this.cache.addTilemap(file.key, file.url, data, file.format);
        this.asyncComplete(file);
    },
    xmlLoadComplete: function (file, xhr) {
        var data = xhr.responseText;
        var xml = this.parseXml(data);
        if (!xml) {
            var responseType = xhr.responseType || xhr.contentType;
            console.warn('Phaser.Loader - ' + file.key + ': invalid XML (' + responseType + ')');
            this.asyncComplete(file, "invalid XML");
            return;
        }
        if (file.type === 'bitmapfont') {
            this.cache.addBitmapFont(file.key, file.url, file.data, xml, file.atlasType, file.xSpacing, file.ySpacing);
        } else if (file.type === 'textureatlas') {
            this.cache.addTextureAtlas(file.key, file.url, file.data, xml, file.format);
        } else if (file.type === 'xml') {
            this.cache.addXML(file.key, file.url, xml);
        }
        this.asyncComplete(file);
    },
    parseXml: function (data) {
        var xml;
        try {
            if (window['DOMParser']) {
                var domparser = new DOMParser();
                xml = domparser.parseFromString(data, "text/xml");
            } else {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = 'false';
                xml.loadXML(data);
            }
        } catch (e) {
            xml = null;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
            return null;
        } else {
            return xml;
        }
    },
    updateProgress: function () {
        if (this.preloadSprite) {
            if (this.preloadSprite.direction === 0) {
                this.preloadSprite.rect.width = Math.floor((this.preloadSprite.width / 100) * this.progress);
            } else {
                this.preloadSprite.rect.height = Math.floor((this.preloadSprite.height / 100) * this.progress);
            }
            if (this.preloadSprite.sprite) {
                this.preloadSprite.sprite.updateCrop();
            } else {
                this.preloadSprite = null;
            }
        }
    },
    totalLoadedFiles: function () {
        return this._loadedFileCount;
    },
    totalQueuedFiles: function () {
        return this._totalFileCount - this._loadedFileCount;
    },
    totalLoadedPacks: function () {
        return this._totalPackCount;
    },
    totalQueuedPacks: function () {
        return this._totalPackCount - this._loadedPackCount;
    }
};
Object.defineProperty(Phaser.Loader.prototype, "progressFloat", {
    get: function () {
        var progress = (this._loadedFileCount / this._totalFileCount) * 100;
        return Phaser.Math.clamp(progress || 0, 0, 100);
    }
});
Object.defineProperty(Phaser.Loader.prototype, "progress", {
    get: function () {
        return Math.round(this.progressFloat);
    }
});
Phaser.Loader.prototype.constructor = Phaser.Loader;
Phaser.LoaderParser = {
    bitmapFont: function (xml, baseTexture, xSpacing, ySpacing) {
        return this.xmlBitmapFont(xml, baseTexture, xSpacing, ySpacing);
    },
    xmlBitmapFont: function (xml, baseTexture, xSpacing, ySpacing) {
        var data = {};
        var info = xml.getElementsByTagName('info')[0];
        var common = xml.getElementsByTagName('common')[0];
        data.font = info.getAttribute('face');
        data.size = parseInt(info.getAttribute('size'), 10);
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10) + ySpacing;
        data.chars = {};
        var letters = xml.getElementsByTagName('char');
        for (var i = 0; i < letters.length; i++) {
            var charCode = parseInt(letters[i].getAttribute('id'), 10);
            data.chars[charCode] = {
                x: parseInt(letters[i].getAttribute('x'), 10),
                y: parseInt(letters[i].getAttribute('y'), 10),
                width: parseInt(letters[i].getAttribute('width'), 10),
                height: parseInt(letters[i].getAttribute('height'), 10),
                xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
                yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
                xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10) + xSpacing,
                kerning: {}
            };
        }
        var kernings = xml.getElementsByTagName('kerning');
        for (i = 0; i < kernings.length; i++) {
            var first = parseInt(kernings[i].getAttribute('first'), 10);
            var second = parseInt(kernings[i].getAttribute('second'), 10);
            var amount = parseInt(kernings[i].getAttribute('amount'), 10);
            data.chars[second].kerning[first] = amount;
        }
        return this.finalizeBitmapFont(baseTexture, data);
    },
    jsonBitmapFont: function (json, baseTexture, xSpacing, ySpacing) {
        var data = {
            font: json.font.info._face,
            size: parseInt(json.font.info._size, 10),
            lineHeight: parseInt(json.font.common._lineHeight, 10) + ySpacing,
            chars: {}
        };
        json.font.chars["char"].forEach(function parseChar(letter) {
            var charCode = parseInt(letter._id, 10);
            data.chars[charCode] = {
                x: parseInt(letter._x, 10),
                y: parseInt(letter._y, 10),
                width: parseInt(letter._width, 10),
                height: parseInt(letter._height, 10),
                xOffset: parseInt(letter._xoffset, 10),
                yOffset: parseInt(letter._yoffset, 10),
                xAdvance: parseInt(letter._xadvance, 10) + xSpacing,
                kerning: {}
            };
        });
        if (json.font.kernings && json.font.kernings.kerning) {
            json.font.kernings.kerning.forEach(function parseKerning(kerning) {
                data.chars[kerning._second].kerning[kerning._first] = parseInt(kerning._amount, 10);
            });
        }
        return this.finalizeBitmapFont(baseTexture, data);
    },
    finalizeBitmapFont: function (baseTexture, bitmapFontData) {
        Object.keys(bitmapFontData.chars).forEach(function addTexture(charCode) {
            var letter = bitmapFontData.chars[charCode];
            letter.texture = new PIXI.Texture(baseTexture, new Phaser.Rectangle(letter.x, letter.y, letter.width, letter.height));
        });
        return bitmapFontData;
    }
};
Phaser.AudioSprite = function (game, key) {
    this.game = game;
    this.key = key;
    this.config = this.game.cache.getJSON(key + '-audioatlas');
    this.autoplayKey = null;
    this.autoplay = false;
    this.sounds = {};
    for (var k in this.config.spritemap) {
        var marker = this.config.spritemap[k];
        var sound = this.game.add.sound(this.key);
        sound.addMarker(k, marker.start, (marker.end - marker.start), null, marker.loop);
        this.sounds[k] = sound;
    }
    if (this.config.autoplay) {
        this.autoplayKey = this.config.autoplay;
        this.play(this.autoplayKey);
        this.autoplay = this.sounds[this.autoplayKey];
    }
};
Phaser.AudioSprite.prototype = {
    play: function (marker, volume) {
        if (volume === undefined) {
            volume = 1;
        }
        return this.sounds[marker].play(marker, null, volume);
    },
    stop: function (marker) {
        if (!marker) {
            for (var key in this.sounds) {
                this.sounds[key].stop();
            }
        } else {
            this.sounds[marker].stop();
        }
    },
    get: function (marker) {
        return this.sounds[marker];
    }
};
Phaser.AudioSprite.prototype.constructor = Phaser.AudioSprite;
Phaser.Sound = function (game, key, volume, loop, connect) {
    if (volume === undefined) {
        volume = 1;
    }
    if (loop === undefined) {
        loop = false;
    }
    if (connect === undefined) {
        connect = game.sound.connectToMaster;
    }
    this.game = game;
    this.name = key;
    this.key = key;
    this.loop = loop;
    this.markers = {};
    this.context = null;
    this.autoplay = false;
    this.totalDuration = 0;
    this.startTime = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.durationMS = 0;
    this.position = 0;
    this.stopTime = 0;
    this.paused = false;
    this.pausedPosition = 0;
    this.pausedTime = 0;
    this.isPlaying = false;
    this.currentMarker = '';
    this.fadeTween = null;
    this.pendingPlayback = false;
    this.override = false;
    this.allowMultiple = false;
    this.usingWebAudio = this.game.sound.usingWebAudio;
    this.usingAudioTag = this.game.sound.usingAudioTag;
    this.externalNode = null;
    this.masterGainNode = null;
    this.gainNode = null;
    this._sound = null;
    if (this.usingWebAudio) {
        this.context = this.game.sound.context;
        this.masterGainNode = this.game.sound.masterGain;
        if (this.context.createGain === undefined) {
            this.gainNode = this.context.createGainNode();
        } else {
            this.gainNode = this.context.createGain();
        }
        this.gainNode.gain.value = volume * this.game.sound.volume;
        if (connect) {
            this.gainNode.connect(this.masterGainNode);
        }
    } else if (this.usingAudioTag) {
        if (this.game.cache.getSound(key) && this.game.cache.isSoundReady(key)) {
            this._sound = this.game.cache.getSoundData(key);
            this.totalDuration = 0;
            if (this._sound.duration) {
                this.totalDuration = this._sound.duration;
            } else {
                if (typeof (loop) === "object") {
                    this.totalDuration = loop.totalDuration;
                }
            }
        } else {
            this.game.cache.onSoundUnlock.add(this.soundHasUnlocked, this);
        }
    }
    this.onDecoded = new Phaser.Signal();
    this.onPlay = new Phaser.Signal();
    this.onPause = new Phaser.Signal();
    this.onResume = new Phaser.Signal();
    this.onLoop = new Phaser.Signal();
    this.onStop = new Phaser.Signal();
    this.onMute = new Phaser.Signal();
    this.onMarkerComplete = new Phaser.Signal();
    this.onFadeComplete = new Phaser.Signal();
    this._volume = volume;
    this._buffer = null;
    this._muted = false;
    this._tempMarker = 0;
    this._tempPosition = 0;
    this._tempVolume = 0;
    this._tempPause = 0;
    this._muteVolume = 0;
    this._tempLoop = 0;
    this._paused = false;
    this._onDecodedEventDispatched = false;
};
Phaser.Sound.prototype = {
    soundHasUnlocked: function (key) {
        if (key === this.key) {
            this._sound = this.game.cache.getSoundData(this.key);
            this.totalDuration = this._sound.duration;
        }
    },
    addMarker: function (name, start, duration, volume, loop) {
        if (duration === undefined || duration === null) {
            duration = 1;
        }
        if (volume === undefined || volume === null) {
            volume = 1;
        }
        if (loop === undefined) {
            loop = false;
        }
        this.markers[name] = {
            name: name,
            start: start,
            stop: start + duration,
            volume: volume,
            duration: duration,
            durationMS: duration * 1000,
            loop: loop
        };
    },
    removeMarker: function (name) {
        delete this.markers[name];
    },
    onEndedHandler: function () {
        this._sound.onended = null;
        this.isPlaying = false;
        this.currentTime = this.durationMS;
        this.stop();
    },
    update: function () {
        if (!this.game.cache.checkSoundKey(this.key)) {
            this.destroy();
            return;
        }
        if (this.isDecoded && !this._onDecodedEventDispatched) {
            this.onDecoded.dispatch(this);
            this._onDecodedEventDispatched = true;
        }
        if (this.pendingPlayback && this.game.cache.isSoundReady(this.key)) {
            this.pendingPlayback = false;
            this.play(this._tempMarker, this._tempPosition, this._tempVolume, this._tempLoop);
        }
        if (this.isPlaying) {
            this.currentTime = this.game.time.time - this.startTime;
            if (this.currentTime >= this.durationMS) {
                if (this.usingWebAudio) {
                    if (this.loop) {
                        this.onLoop.dispatch(this);
                        this.isPlaying = false;
                        if (this.currentMarker === '') {
                            this.currentTime = 0;
                            this.startTime = this.game.time.time;
                            this.isPlaying = true;
                        } else {
                            this.onMarkerComplete.dispatch(this.currentMarker, this);
                            this.play(this.currentMarker, 0, this.volume, true, true);
                        }
                    } else {
                        if (this.currentMarker !== '') {
                            this.stop();
                        }
                    }
                } else {
                    if (this.loop) {
                        this.onLoop.dispatch(this);
                        if (this.currentMarker === '') {
                            this.currentTime = 0;
                            this.startTime = this.game.time.time;
                        }
                        this.isPlaying = false;
                        this.play(this.currentMarker, 0, this.volume, true, true);
                    } else {
                        this.stop();
                    }
                }
            }
        }
    },
    loopFull: function (volume) {
        return this.play(null, 0, volume, true);
    },
    play: function (marker, position, volume, loop, forceRestart) {
        if (marker === undefined || marker === false || marker === null) {
            marker = '';
        }
        if (forceRestart === undefined) {
            forceRestart = true;
        }
        if (this.isPlaying && !this.allowMultiple && !forceRestart && !this.override) {
            return this;
        }
        if (this._sound && this.isPlaying && !this.allowMultiple && (this.override || forceRestart)) {
            if (this.usingWebAudio) {
                if (this._sound.stop === undefined) {
                    this._sound.noteOff(0);
                } else {
                    try {
                        this._sound.stop(0);
                    } catch (e) {}
                }
                if (this.externalNode) {
                    this._sound.disconnect(this.externalNode);
                } else if (this.gainNode) {
                    this._sound.disconnect(this.gainNode);
                }
            } else if (this.usingAudioTag) {
                this._sound.pause();
                this._sound.currentTime = 0;
            }
            this.isPlaying = false;
        }
        if (marker === '' && Object.keys(this.markers).length > 0) {
            return this;
        }
        if (marker !== '') {
            if (this.markers[marker]) {
                this.currentMarker = marker;
                this.position = this.markers[marker].start;
                this.volume = this.markers[marker].volume;
                this.loop = this.markers[marker].loop;
                this.duration = this.markers[marker].duration;
                this.durationMS = this.markers[marker].durationMS;
                if (typeof volume !== 'undefined') {
                    this.volume = volume;
                }
                if (typeof loop !== 'undefined') {
                    this.loop = loop;
                }
                this._tempMarker = marker;
                this._tempPosition = this.position;
                this._tempVolume = this.volume;
                this._tempLoop = this.loop;
            } else {
                console.warn("Phaser.Sound.play: audio marker " + marker + " doesn't exist");
                return this;
            }
        } else {
            position = position || 0;
            if (volume === undefined) {
                volume = this._volume;
            }
            if (loop === undefined) {
                loop = this.loop;
            }
            this.position = Math.max(0, position);
            this.volume = volume;
            this.loop = loop;
            this.duration = 0;
            this.durationMS = 0;
            this._tempMarker = marker;
            this._tempPosition = position;
            this._tempVolume = volume;
            this._tempLoop = loop;
        }
        if (this.usingWebAudio) {
            if (this.game.cache.isSoundDecoded(this.key)) {
                this._sound = this.context.createBufferSource();
                if (this.externalNode) {
                    this._sound.connect(this.externalNode);
                } else {
                    this._sound.connect(this.gainNode);
                }
                this._buffer = this.game.cache.getSoundData(this.key);
                this._sound.buffer = this._buffer;
                if (this.loop && marker === '') {
                    this._sound.loop = true;
                }
                if (!this.loop && marker === '') {
                    this._sound.onended = this.onEndedHandler.bind(this);
                }
                this.totalDuration = this._sound.buffer.duration;
                if (this.duration === 0) {
                    this.duration = this.totalDuration;
                    this.durationMS = Math.ceil(this.totalDuration * 1000);
                }
                if (this._sound.start === undefined) {
                    this._sound.noteGrainOn(0, this.position, this.duration);
                } else {
                    if (this.loop && marker === '') {
                        this._sound.start(0, 0);
                    } else {
                        this._sound.start(0, this.position, this.duration);
                    }
                }
                this.isPlaying = true;
                this.startTime = this.game.time.time;
                this.currentTime = 0;
                this.stopTime = this.startTime + this.durationMS;
                this.onPlay.dispatch(this);
            } else {
                this.pendingPlayback = true;
                if (this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).isDecoding === false) {
                    this.game.sound.decode(this.key, this);
                }
            }
        } else {
            if (this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).locked) {
                this.game.cache.getSound(this.key).locked = false;
                this.game.cache.onSoundUnlock.dispatch(this.key);
                this.pendingPlayback = true;
            } {
                if (this._sound && !this.paused) {
                    this._sound.play();
                    this.totalDuration = this._sound.duration || this.totalDuration || undefined;
                    if (this.duration === 0) {
                        this.duration = this.totalDuration;
                        this.durationMS = this.totalDuration * 1000;
                    }
                    this._sound.currentTime = this.position;
                    this._sound.muted = this._muted;
                    if (this._muted || this.game.sound.mute) {
                        this._sound.volume = 0;
                    } else {
                        this._sound.volume = this._volume;
                    }
                    this.isPlaying = true;
                    this.startTime = this.game.time.time;
                    this.currentTime = 0;
                    this.stopTime = this.startTime + this.durationMS;
                    this.onPlay.dispatch(this);
                } else {
                    this.pendingPlayback = true;
                }
            }
        }
        return this;
    },
    restart: function (marker, position, volume, loop) {
        marker = marker || '';
        position = position || 0;
        volume = volume || 1;
        if (loop === undefined) {
            loop = false;
        }
        this.play(marker, position, volume, loop, true);
    },
    pause: function () {
        if (this.isPlaying && this._sound) {
            this.paused = true;
            this.pausedPosition = this.currentTime;
            this.pausedTime = this.game.time.time;
            this._tempPause = this._sound.currentTime;
            this.onPause.dispatch(this);
            this.stop();
        }
    },
    resume: function () {
        if (this.paused && this._sound) {
            if (this.usingWebAudio) {
                var p = Math.max(0, this.position + (this.pausedPosition / 1000));
                this._sound = this.context.createBufferSource();
                this._sound.buffer = this._buffer;
                if (this.externalNode) {
                    this._sound.connect(this.externalNode);
                } else {
                    this._sound.connect(this.gainNode);
                }
                if (this.loop) {
                    this._sound.loop = true;
                }
                if (!this.loop && this.currentMarker === '') {
                    this._sound.onended = this.onEndedHandler.bind(this);
                }
                var duration = this.duration - (this.pausedPosition / 1000);
                if (this._sound.start === undefined) {
                    this._sound.noteGrainOn(0, p, duration);
                } else {
                    if (this.loop && this.game.device.chrome) {
                        if (this.game.device.chromeVersion === 42) {
                            this._sound.start(0);
                        } else {
                            this._sound.start(0, p);
                        }
                    } else {
                        this._sound.start(0, p, duration);
                    }
                }
            } else {
                this._sound.currentTime = this._tempPause;
                this._sound.play();
            }
            this.isPlaying = true;
            this.paused = false;
            this.startTime += (this.game.time.time - this.pausedTime);
            this.onResume.dispatch(this);
        }
    },
    stop: function () {
        if (this.isPlaying && this._sound) {
            if (this.usingWebAudio) {
                if (this._sound.stop === undefined) {
                    this._sound.noteOff(0);
                } else {
                    try {
                        this._sound.stop(0);
                    } catch (e) {}
                }
                if (this.externalNode) {
                    this._sound.disconnect(this.externalNode);
                } else if (this.gainNode) {
                    this._sound.disconnect(this.gainNode);
                }
            } else if (this.usingAudioTag) {
                this._sound.pause();
                this._sound.currentTime = 0;
            }
        }
        this.pendingPlayback = false;
        this.isPlaying = false;
        if (!this.paused) {
            var prevMarker = this.currentMarker;
            if (this.currentMarker !== '') {
                this.onMarkerComplete.dispatch(this.currentMarker, this);
            }
            this.currentMarker = '';
            if (this.fadeTween !== null) {
                this.fadeTween.stop();
            }
            this.onStop.dispatch(this, prevMarker);
        }
    },
    fadeIn: function (duration, loop, marker) {
        if (loop === undefined) {
            loop = false;
        }
        if (marker === undefined) {
            marker = this.currentMarker;
        }
        if (this.paused) {
            return;
        }
        this.play(marker, 0, 0, loop);
        this.fadeTo(duration, 1);
    },
    fadeOut: function (duration) {
        this.fadeTo(duration, 0);
    },
    fadeTo: function (duration, volume) {
        if (!this.isPlaying || this.paused || volume === this.volume) {
            return;
        }
        if (duration === undefined) {
            duration = 1000;
        }
        if (volume === undefined) {
            console.warn("Phaser.Sound.fadeTo: No Volume Specified.");
            return;
        }
        this.fadeTween = this.game.add.tween(this).to({
            volume: volume
        }, duration, Phaser.Easing.Linear.None, true);
        this.fadeTween.onComplete.add(this.fadeComplete, this);
    },
    fadeComplete: function () {
        this.onFadeComplete.dispatch(this, this.volume);
        if (this.volume === 0) {
            this.stop();
        }
    },
    updateGlobalVolume: function (globalVolume) {
        if (this.usingAudioTag && this._sound) {
            this._sound.volume = globalVolume * this._volume;
        }
    },
    destroy: function (remove) {
        if (remove === undefined) {
            remove = true;
        }
        this.stop();
        if (remove) {
            this.game.sound.remove(this);
        } else {
            this.markers = {};
            this.context = null;
            this._buffer = null;
            this.externalNode = null;
            this.onDecoded.dispose();
            this.onPlay.dispose();
            this.onPause.dispose();
            this.onResume.dispose();
            this.onLoop.dispose();
            this.onStop.dispose();
            this.onMute.dispose();
            this.onMarkerComplete.dispose();
        }
    }
};
Phaser.Sound.prototype.constructor = Phaser.Sound;
Object.defineProperty(Phaser.Sound.prototype, "isDecoding", {
    get: function () {
        return this.game.cache.getSound(this.key).isDecoding;
    }
});
Object.defineProperty(Phaser.Sound.prototype, "isDecoded", {
    get: function () {
        return this.game.cache.isSoundDecoded(this.key);
    }
});
Object.defineProperty(Phaser.Sound.prototype, "mute", {
    get: function () {
        return (this._muted || this.game.sound.mute);
    },
    set: function (value) {
        value = value || false;
        if (value === this._muted) {
            return;
        }
        if (value) {
            this._muted = true;
            this._muteVolume = this._tempVolume;
            if (this.usingWebAudio) {
                this.gainNode.gain.value = 0;
            } else if (this.usingAudioTag && this._sound) {
                this._sound.volume = 0;
            }
        } else {
            this._muted = false;
            if (this.usingWebAudio) {
                this.gainNode.gain.value = this._muteVolume;
            } else if (this.usingAudioTag && this._sound) {
                this._sound.volume = this._muteVolume;
            }
        }
        this.onMute.dispatch(this);
    }
});
Object.defineProperty(Phaser.Sound.prototype, "volume", {
    get: function () {
        return this._volume;
    },
    set: function (value) {
        if (this.game.device.firefox && this.usingAudioTag) {
            value = this.game.math.clamp(value, 0, 1);
        }
        if (this._muted) {
            this._muteVolume = value;
            return;
        }
        this._tempVolume = value;
        this._volume = value;
        if (this.usingWebAudio) {
            this.gainNode.gain.value = value;
        } else if (this.usingAudioTag && this._sound) {
            this._sound.volume = value;
        }
    }
});
Phaser.SoundManager = function (game) {
    this.game = game;
    this.onSoundDecode = new Phaser.Signal();
    this.onVolumeChange = new Phaser.Signal();
    this.onMute = new Phaser.Signal();
    this.onUnMute = new Phaser.Signal();
    this.context = null;
    this.usingWebAudio = false;
    this.usingAudioTag = false;
    this.noAudio = false;
    this.connectToMaster = true;
    this.touchLocked = false;
    this.channels = 32;
    this.muteOnPause = true;
    this._codeMuted = false;
    this._muted = false;
    this._unlockSource = null;
    this._volume = 1;
    this._sounds = [];
    this._watchList = new Phaser.ArraySet();
    this._watching = false;
    this._watchCallback = null;
    this._watchContext = null;
};
Phaser.SoundManager.prototype = {
    boot: function () {
        if (this.game.device.iOS && this.game.device.webAudio === false) {
            this.channels = 1;
        }
        if (window['PhaserGlobal']) {
            if (window['PhaserGlobal'].disableAudio === true) {
                this.noAudio = true;
                this.touchLocked = false;
                return;
            }
            if (window['PhaserGlobal'].disableWebAudio === true) {
                this.usingAudioTag = true;
                this.touchLocked = false;
                return;
            }
        }
        if (window['PhaserGlobal'] && window['PhaserGlobal'].audioContext) {
            this.context = window['PhaserGlobal'].audioContext;
        } else {
            if (!!window['AudioContext']) {
                try {
                    this.context = new window['AudioContext']();
                } catch (error) {
                    this.context = null;
                    this.usingWebAudio = false;
                    this.touchLocked = false;
                }
            } else if (!!window['webkitAudioContext']) {
                try {
                    this.context = new window['webkitAudioContext']();
                } catch (error) {
                    this.context = null;
                    this.usingWebAudio = false;
                    this.touchLocked = false;
                }
            }
        }
        if (this.context === null) {
            if (window['Audio'] === undefined) {
                this.noAudio = true;
                return;
            } else {
                this.usingAudioTag = true;
            }
        } else {
            this.usingWebAudio = true;
            if (this.context.createGain === undefined) {
                this.masterGain = this.context.createGainNode();
            } else {
                this.masterGain = this.context.createGain();
            }
            this.masterGain.gain.value = 1;
            this.masterGain.connect(this.context.destination);
        }
        if (!this.noAudio) {
            if (!this.game.device.cocoonJS && this.game.device.iOS || (window['PhaserGlobal'] && window['PhaserGlobal'].fakeiOSTouchLock)) {
                this.setTouchLock();
            }
        }
    },
    setTouchLock: function () {
        if (this.noAudio || (window['PhaserGlobal'] && window['PhaserGlobal'].disableAudio === true)) {
            return;
        }
        if (this.game.device.iOSVersion > 8) {
            this.game.input.touch.addTouchLockCallback(this.unlock, this, true);
        } else {
            this.game.input.touch.addTouchLockCallback(this.unlock, this);
        }
        this.touchLocked = true;
    },
    unlock: function () {
        if (this.noAudio || !this.touchLocked || this._unlockSource !== null) {
            return true;
        }
        if (this.usingAudioTag) {
            this.touchLocked = false;
            this._unlockSource = null;
        } else if (this.usingWebAudio) {
            var buffer = this.context.createBuffer(1, 1, 22050);
            this._unlockSource = this.context.createBufferSource();
            this._unlockSource.buffer = buffer;
            this._unlockSource.connect(this.context.destination);
            if (this._unlockSource.start === undefined) {
                this._unlockSource.noteOn(0);
            } else {
                this._unlockSource.start(0);
            }
        }
        return true;
    },
    stopAll: function () {
        if (this.noAudio) {
            return;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i]) {
                this._sounds[i].stop();
            }
        }
    },
    pauseAll: function () {
        if (this.noAudio) {
            return;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i]) {
                this._sounds[i].pause();
            }
        }
    },
    resumeAll: function () {
        if (this.noAudio) {
            return;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i]) {
                this._sounds[i].resume();
            }
        }
    },
    decode: function (key, sound) {
        sound = sound || null;
        var soundData = this.game.cache.getSoundData(key);
        if (soundData) {
            if (this.game.cache.isSoundDecoded(key) === false) {
                this.game.cache.updateSound(key, 'isDecoding', true);
                var _this = this;
                try {
                    this.context.decodeAudioData(soundData, function (buffer) {
                        if (buffer) {
                            _this.game.cache.decodedSound(key, buffer);
                            _this.onSoundDecode.dispatch(key, sound);
                        }
                    });
                } catch (e) {}
            }
        }
    },
    setDecodedCallback: function (files, callback, callbackContext) {
        if (typeof files === 'string') {
            files = [files];
        }
        this._watchList.reset();
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof Phaser.Sound) {
                if (!this.game.cache.isSoundDecoded(files[i].key)) {
                    this._watchList.add(files[i].key);
                }
            } else if (!this.game.cache.isSoundDecoded(files[i])) {
                this._watchList.add(files[i]);
            }
        }
        if (this._watchList.total === 0) {
            this._watching = false;
            callback.call(callbackContext);
        } else {
            this._watching = true;
            this._watchCallback = callback;
            this._watchContext = callbackContext;
        }
    },
    update: function () {
        if (this.noAudio) {
            return;
        }
        if (this.touchLocked && this._unlockSource !== null && (this._unlockSource.playbackState === this._unlockSource.PLAYING_STATE || this._unlockSource.playbackState === this._unlockSource.FINISHED_STATE)) {
            this.touchLocked = false;
            this._unlockSource = null;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            this._sounds[i].update();
        }
        if (this._watching) {
            var key = this._watchList.first;
            while (key) {
                if (this.game.cache.isSoundDecoded(key)) {
                    this._watchList.remove(key);
                }
                key = this._watchList.next;
            }
            if (this._watchList.total === 0) {
                this._watching = false;
                this._watchCallback.call(this._watchContext);
            }
        }
    },
    add: function (key, volume, loop, connect) {
        if (volume === undefined) {
            volume = 1;
        }
        if (loop === undefined) {
            loop = false;
        }
        if (connect === undefined) {
            connect = this.connectToMaster;
        }
        var sound = new Phaser.Sound(this.game, key, volume, loop, connect);
        this._sounds.push(sound);
        return sound;
    },
    addSprite: function (key) {
        var audioSprite = new Phaser.AudioSprite(this.game, key);
        return audioSprite;
    },
    remove: function (sound) {
        var i = this._sounds.length;
        while (i--) {
            if (this._sounds[i] === sound) {
                this._sounds[i].destroy(false);
                this._sounds.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    removeByKey: function (key) {
        var i = this._sounds.length;
        var removed = 0;
        while (i--) {
            if (this._sounds[i].key === key) {
                this._sounds[i].destroy(false);
                this._sounds.splice(i, 1);
                removed++;
            }
        }
        return removed;
    },
    play: function (key, volume, loop) {
        if (this.noAudio) {
            return;
        }
        var sound = this.add(key, volume, loop);
        sound.play();
        return sound;
    },
    setMute: function () {
        if (this._muted) {
            return;
        }
        this._muted = true;
        if (this.usingWebAudio) {
            this._muteVolume = this.masterGain.gain.value;
            this.masterGain.gain.value = 0;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i].usingAudioTag) {
                this._sounds[i].mute = true;
            }
        }
        this.onMute.dispatch();
    },
    unsetMute: function () {
        if (!this._muted || this._codeMuted) {
            return;
        }
        this._muted = false;
        if (this.usingWebAudio) {
            this.masterGain.gain.value = this._muteVolume;
        }
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i].usingAudioTag) {
                this._sounds[i].mute = false;
            }
        }
        this.onUnMute.dispatch();
    },
    destroy: function () {
        this.stopAll();
        for (var i = 0; i < this._sounds.length; i++) {
            if (this._sounds[i]) {
                this._sounds[i].destroy();
            }
        }
        this._sounds = [];
        this.onSoundDecode.dispose();
        if (this.context) {
            if (window['PhaserGlobal']) {
                window['PhaserGlobal'].audioContext = this.context;
            } else {
                if (this.context.close) {
                    this.context.close();
                }
            }
        }
    }
};
Phaser.SoundManager.prototype.constructor = Phaser.SoundManager;
Object.defineProperty(Phaser.SoundManager.prototype, "mute", {
    get: function () {
        return this._muted;
    },
    set: function (value) {
        value = value || false;
        if (value) {
            if (this._muted) {
                return;
            }
            this._codeMuted = true;
            this.setMute();
        } else {
            if (!this._muted) {
                return;
            }
            this._codeMuted = false;
            this.unsetMute();
        }
    }
});
Object.defineProperty(Phaser.SoundManager.prototype, "volume", {
    get: function () {
        return this._volume;
    },
    set: function (value) {
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        if (this._volume !== value) {
            this._volume = value;
            if (this.usingWebAudio) {
                this.masterGain.gain.value = value;
            } else {
                for (var i = 0; i < this._sounds.length; i++) {
                    if (this._sounds[i].usingAudioTag) {
                        this._sounds[i].updateGlobalVolume(value);
                    }
                }
            }
            this.onVolumeChange.dispatch(value);
        }
    }
});
Phaser.ScaleManager = function (game, width, height) {
    this.game = game;
    this.dom = Phaser.DOM;
    this.grid = null;
    this.width = 0;
    this.height = 0;
    this.minWidth = null;
    this.maxWidth = null;
    this.minHeight = null;
    this.maxHeight = null;
    this.offset = new Phaser.Point();
    this.forceLandscape = false;
    this.forcePortrait = false;
    this.incorrectOrientation = false;
    this._pageAlignHorizontally = false;
    this._pageAlignVertically = false;
    this.onOrientationChange = new Phaser.Signal();
    this.enterIncorrectOrientation = new Phaser.Signal();
    this.leaveIncorrectOrientation = new Phaser.Signal();
    this.hasPhaserSetFullScreen = false;
    this.fullScreenTarget = null;
    this._createdFullScreenTarget = null;
    this.onFullScreenInit = new Phaser.Signal();
    this.onFullScreenChange = new Phaser.Signal();
    this.onFullScreenError = new Phaser.Signal();
    this.screenOrientation = this.dom.getScreenOrientation();
    this.scaleFactor = new Phaser.Point(1, 1);
    this.scaleFactorInversed = new Phaser.Point(1, 1);
    this.margin = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0
    };
    this.bounds = new Phaser.Rectangle();
    this.aspectRatio = 0;
    this.sourceAspectRatio = 0;
    this.event = null;
    this.windowConstraints = {
        right: 'layout',
        bottom: ''
    };
    this.compatibility = {
        supportsFullScreen: false,
        orientationFallback: null,
        noMargins: false,
        scrollTo: null,
        forceMinimumDocumentHeight: false,
        canExpandParent: true,
        clickTrampoline: ''
    };
    this._scaleMode = Phaser.ScaleManager.NO_SCALE;
    this._fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
    this.parentIsWindow = false;
    this.parentNode = null;
    this.parentScaleFactor = new Phaser.Point(1, 1);
    this.trackParentInterval = 2000;
    this.onSizeChange = new Phaser.Signal();
    this.onResize = null;
    this.onResizeContext = null;
    this._pendingScaleMode = null;
    this._fullScreenRestore = null;
    this._gameSize = new Phaser.Rectangle();
    this._userScaleFactor = new Phaser.Point(1, 1);
    this._userScaleTrim = new Phaser.Point(0, 0);
    this._lastUpdate = 0;
    this._updateThrottle = 0;
    this._updateThrottleReset = 100;
    this._parentBounds = new Phaser.Rectangle();
    this._tempBounds = new Phaser.Rectangle();
    this._lastReportedCanvasSize = new Phaser.Rectangle();
    this._lastReportedGameSize = new Phaser.Rectangle();
    this._booted = false;
    if (game.config) {
        this.parseConfig(game.config);
    }
    this.setupScale(width, height);
};
Phaser.ScaleManager.EXACT_FIT = 0;
Phaser.ScaleManager.NO_SCALE = 1;
Phaser.ScaleManager.SHOW_ALL = 2;
Phaser.ScaleManager.RESIZE = 3;
Phaser.ScaleManager.USER_SCALE = 4;
Phaser.ScaleManager.prototype = {
    boot: function () {
        var compat = this.compatibility;
        compat.supportsFullScreen = this.game.device.fullscreen && !this.game.device.cocoonJS;
        if (!this.game.device.iPad && !this.game.device.webApp && !this.game.device.desktop) {
            if (this.game.device.android && !this.game.device.chrome) {
                compat.scrollTo = new Phaser.Point(0, 1);
            } else {
                compat.scrollTo = new Phaser.Point(0, 0);
            }
        }
        if (this.game.device.desktop) {
            compat.orientationFallback = 'screen';
            compat.clickTrampoline = 'when-not-mouse';
        } else {
            compat.orientationFallback = '';
            compat.clickTrampoline = '';
        }
        var _this = this;
        this._orientationChange = function (event) {
            return _this.orientationChange(event);
        };
        this._windowResize = function (event) {
            return _this.windowResize(event);
        };
        window.addEventListener('orientationchange', this._orientationChange, false);
        window.addEventListener('resize', this._windowResize, false);
        if (this.compatibility.supportsFullScreen) {
            this._fullScreenChange = function (event) {
                return _this.fullScreenChange(event);
            };
            this._fullScreenError = function (event) {
                return _this.fullScreenError(event);
            };
            document.addEventListener('webkitfullscreenchange', this._fullScreenChange, false);
            document.addEventListener('mozfullscreenchange', this._fullScreenChange, false);
            document.addEventListener('MSFullscreenChange', this._fullScreenChange, false);
            document.addEventListener('fullscreenchange', this._fullScreenChange, false);
            document.addEventListener('webkitfullscreenerror', this._fullScreenError, false);
            document.addEventListener('mozfullscreenerror', this._fullScreenError, false);
            document.addEventListener('MSFullscreenError', this._fullScreenError, false);
            document.addEventListener('fullscreenerror', this._fullScreenError, false);
        }
        this.game.onResume.add(this._gameResumed, this);
        this.dom.getOffset(this.game.canvas, this.offset);
        this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);
        this.setGameSize(this.game.width, this.game.height);
        this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);
        if (Phaser.FlexGrid) {
            this.grid = new Phaser.FlexGrid(this, this.width, this.height);
        }
        this._booted = true;
        if (this._pendingScaleMode !== null) {
            this.scaleMode = this._pendingScaleMode;
            this._pendingScaleMode = null;
        }
    },
    parseConfig: function (config) {
        if (config['scaleMode'] !== undefined) {
            if (this._booted) {
                this.scaleMode = config['scaleMode'];
            } else {
                this._pendingScaleMode = config['scaleMode'];
            }
        }
        if (config['fullScreenScaleMode'] !== undefined) {
            this.fullScreenScaleMode = config['fullScreenScaleMode'];
        }
        if (config['fullScreenTarget']) {
            this.fullScreenTarget = config['fullScreenTarget'];
        }
    },
    setupScale: function (width, height) {
        var target;
        var rect = new Phaser.Rectangle();
        if (this.game.parent !== '') {
            if (typeof this.game.parent === 'string') {
                target = document.getElementById(this.game.parent);
            } else if (this.game.parent && this.game.parent.nodeType === 1) {
                target = this.game.parent;
            }
        }
        if (!target) {
            this.parentNode = null;
            this.parentIsWindow = true;
            rect.width = this.dom.visualBounds.width;
            rect.height = this.dom.visualBounds.height;
            this.offset.set(0, 0);
        } else {
            this.parentNode = target;
            this.parentIsWindow = false;
            this.getParentBounds(this._parentBounds);
            rect.width = this._parentBounds.width;
            rect.height = this._parentBounds.height;
            this.offset.set(this._parentBounds.x, this._parentBounds.y);
        }
        var newWidth = 0;
        var newHeight = 0;
        if (typeof width === 'number') {
            newWidth = width;
        } else {
            this.parentScaleFactor.x = parseInt(width, 10) / 100;
            newWidth = rect.width * this.parentScaleFactor.x;
        }
        if (typeof height === 'number') {
            newHeight = height;
        } else {
            this.parentScaleFactor.y = parseInt(height, 10) / 100;
            newHeight = rect.height * this.parentScaleFactor.y;
        }
        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);
        this._gameSize.setTo(0, 0, newWidth, newHeight);
        this.updateDimensions(newWidth, newHeight, false);
    },
    _gameResumed: function () {
        this.queueUpdate(true);
    },
    setGameSize: function (width, height) {
        this._gameSize.setTo(0, 0, width, height);
        if (this.currentScaleMode !== Phaser.ScaleManager.RESIZE) {
            this.updateDimensions(width, height, true);
        }
        this.queueUpdate(true);
    },
    setUserScale: function (hScale, vScale, hTrim, vTrim) {
        this._userScaleFactor.setTo(hScale, vScale);
        this._userScaleTrim.setTo(hTrim | 0, vTrim | 0);
        this.queueUpdate(true);
    },
    setResizeCallback: function (callback, context) {
        this.onResize = callback;
        this.onResizeContext = context;
    },
    signalSizeChange: function () {
        if (!Phaser.Rectangle.sameDimensions(this, this._lastReportedCanvasSize) || !Phaser.Rectangle.sameDimensions(this.game, this._lastReportedGameSize)) {
            var width = this.width;
            var height = this.height;
            this._lastReportedCanvasSize.setTo(0, 0, width, height);
            this._lastReportedGameSize.setTo(0, 0, this.game.width, this.game.height);
            if (this.grid) {
                this.grid.onResize(width, height);
            }
            this.onSizeChange.dispatch(this, width, height);
            if (this.currentScaleMode === Phaser.ScaleManager.RESIZE) {
                this.game.state.resize(width, height);
                this.game.load.resize(width, height);
            }
        }
    },
    setMinMax: function (minWidth, minHeight, maxWidth, maxHeight) {
        this.minWidth = minWidth;
        this.minHeight = minHeight;
        if (typeof maxWidth !== 'undefined') {
            this.maxWidth = maxWidth;
        }
        if (typeof maxHeight !== 'undefined') {
            this.maxHeight = maxHeight;
        }
    },
    preUpdate: function () {
        if (this.game.time.time < (this._lastUpdate + this._updateThrottle)) {
            return;
        }
        var prevThrottle = this._updateThrottle;
        this._updateThrottleReset = prevThrottle >= 400 ? 0 : 100;
        this.dom.getOffset(this.game.canvas, this.offset);
        var prevWidth = this._parentBounds.width;
        var prevHeight = this._parentBounds.height;
        var bounds = this.getParentBounds(this._parentBounds);
        var boundsChanged = bounds.width !== prevWidth || bounds.height !== prevHeight;
        var orientationChanged = this.updateOrientationState();
        if (boundsChanged || orientationChanged) {
            if (this.onResize) {
                this.onResize.call(this.onResizeContext, this, bounds);
            }
            this.updateLayout();
            this.signalSizeChange();
        }
        var throttle = this._updateThrottle * 2;
        if (this._updateThrottle < prevThrottle) {
            throttle = Math.min(prevThrottle, this._updateThrottleReset);
        }
        this._updateThrottle = Phaser.Math.clamp(throttle, 25, this.trackParentInterval);
        this._lastUpdate = this.game.time.time;
    },
    pauseUpdate: function () {
        this.preUpdate();
        this._updateThrottle = this.trackParentInterval;
    },
    updateDimensions: function (width, height, resize) {
        this.width = width * this.parentScaleFactor.x;
        this.height = height * this.parentScaleFactor.y;
        this.game.width = this.width;
        this.game.height = this.height;
        this.sourceAspectRatio = this.width / this.height;
        this.updateScalingAndBounds();
        if (resize) {
            this.game.renderer.resize(this.width, this.height);
            this.game.camera.setSize(this.width, this.height);
            this.game.world.resize(this.width, this.height);
        }
    },
    updateScalingAndBounds: function () {
        this.scaleFactor.x = this.game.width / this.width;
        this.scaleFactor.y = this.game.height / this.height;
        this.scaleFactorInversed.x = this.width / this.game.width;
        this.scaleFactorInversed.y = this.height / this.game.height;
        this.aspectRatio = this.width / this.height;
        if (this.game.canvas) {
            this.dom.getOffset(this.game.canvas, this.offset);
        }
        this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);
        if (this.game.input && this.game.input.scale) {
            this.game.input.scale.setTo(this.scaleFactor.x, this.scaleFactor.y);
        }
    },
    forceOrientation: function (forceLandscape, forcePortrait) {
        if (forcePortrait === undefined) {
            forcePortrait = false;
        }
        this.forceLandscape = forceLandscape;
        this.forcePortrait = forcePortrait;
        this.queueUpdate(true);
    },
    classifyOrientation: function (orientation) {
        if (orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
            return 'portrait';
        } else if (orientation === 'landscape-primary' || orientation === 'landscape-secondary') {
            return 'landscape';
        } else {
            return null;
        }
    },
    updateOrientationState: function () {
        var previousOrientation = this.screenOrientation;
        var previouslyIncorrect = this.incorrectOrientation;
        this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);
        this.incorrectOrientation = (this.forceLandscape && !this.isLandscape) || (this.forcePortrait && !this.isPortrait);
        var changed = previousOrientation !== this.screenOrientation;
        var correctnessChanged = previouslyIncorrect !== this.incorrectOrientation;
        if (correctnessChanged) {
            if (this.incorrectOrientation) {
                this.enterIncorrectOrientation.dispatch();
            } else {
                this.leaveIncorrectOrientation.dispatch();
            }
        }
        if (changed || correctnessChanged) {
            this.onOrientationChange.dispatch(this, previousOrientation, previouslyIncorrect);
        }
        return changed || correctnessChanged;
    },
    orientationChange: function (event) {
        this.event = event;
        this.queueUpdate(true);
    },
    windowResize: function (event) {
        this.event = event;
        this.queueUpdate(true);
    },
    scrollTop: function () {
        var scrollTo = this.compatibility.scrollTo;
        if (scrollTo) {
            console.warn("window.scrollTo not available in wxgame");
        }
    },
    refresh: function () {
        this.scrollTop();
        this.queueUpdate(true);
    },
    updateLayout: function () {
        var scaleMode = this.currentScaleMode;
        if (scaleMode === Phaser.ScaleManager.RESIZE) {
            this.reflowGame();
            return;
        }
        this.scrollTop();
        if (this.compatibility.forceMinimumDocumentHeight) {
            document.documentElement.style.minHeight = window.innerHeight + 'px';
        }
        if (this.incorrectOrientation) {
            this.setMaximum();
        } else {
            if (scaleMode === Phaser.ScaleManager.EXACT_FIT) {
                this.setExactFit();
            } else if (scaleMode === Phaser.ScaleManager.SHOW_ALL) {
                if (!this.isFullScreen && this.boundingParent && this.compatibility.canExpandParent) {
                    this.setShowAll(true);
                    this.resetCanvas();
                    this.setShowAll();
                } else {
                    this.setShowAll();
                }
            } else if (scaleMode === Phaser.ScaleManager.NO_SCALE) {
                this.width = this.game.width;
                this.height = this.game.height;
            } else if (scaleMode === Phaser.ScaleManager.USER_SCALE) {
                this.width = (this.game.width * this._userScaleFactor.x) - this._userScaleTrim.x;
                this.height = (this.game.height * this._userScaleFactor.y) - this._userScaleTrim.y;
            }
        }
        if (!this.compatibility.canExpandParent && (scaleMode === Phaser.ScaleManager.SHOW_ALL || scaleMode === Phaser.ScaleManager.USER_SCALE)) {
            var bounds = this.getParentBounds(this._tempBounds);
            this.width = Math.min(this.width, bounds.width);
            this.height = Math.min(this.height, bounds.height);
        }
        this.width = this.width | 0;
        this.height = this.height | 0;
        this.reflowCanvas();
    },
    getParentBounds: function (target) {
        var bounds = target || new Phaser.Rectangle();
        var parentNode = this.boundingParent;
        var visualBounds = this.dom.visualBounds;
        var layoutBounds = this.dom.layoutBounds;
        if (!parentNode) {
            bounds.setTo(0, 0, visualBounds.width, visualBounds.height);
        } else {
            var clientRect = parentNode.getBoundingClientRect();
            var parentRect = (parentNode.offsetParent) ? parentNode.offsetParent.getBoundingClientRect() : parentNode.getBoundingClientRect();
            bounds.setTo(clientRect.left - parentRect.left, clientRect.top - parentRect.top, clientRect.width, clientRect.height);
            var wc = this.windowConstraints;
            if (wc.right) {
                var windowBounds = wc.right === 'layout' ? layoutBounds : visualBounds;
                bounds.right = Math.min(bounds.right, windowBounds.width);
            }
            if (wc.bottom) {
                var windowBounds = wc.bottom === 'layout' ? layoutBounds : visualBounds;
                bounds.bottom = Math.min(bounds.bottom, windowBounds.height);
            }
        }
        bounds.setTo(Math.round(bounds.x), Math.round(bounds.y), Math.round(bounds.width), Math.round(bounds.height));
        return bounds;
    },
    alignCanvas: function (horizontal, vertical) {
        var parentBounds = this.getParentBounds(this._tempBounds);
        var canvas = this.game.canvas;
        var margin = this.margin;
        if (horizontal) {
            margin.left = margin.right = 0;
            var canvasBounds = canvas.getBoundingClientRect();
            if (this.width < parentBounds.width && !this.incorrectOrientation) {
                var currentEdge = canvasBounds.left - parentBounds.x;
                var targetEdge = (parentBounds.width / 2) - (this.width / 2);
                targetEdge = Math.max(targetEdge, 0);
                var offset = targetEdge - currentEdge;
                margin.left = Math.round(offset);
            }
            canvas.style.marginLeft = margin.left + 'px';
            if (margin.left !== 0) {
                margin.right = -(parentBounds.width - canvasBounds.width - margin.left);
                canvas.style.marginRight = margin.right + 'px';
            }
        }
        if (vertical) {
            margin.top = margin.bottom = 0;
            var canvasBounds = canvas.getBoundingClientRect();
            if (this.height < parentBounds.height && !this.incorrectOrientation) {
                var currentEdge = canvasBounds.top - parentBounds.y;
                var targetEdge = (parentBounds.height / 2) - (this.height / 2);
                targetEdge = Math.max(targetEdge, 0);
                var offset = targetEdge - currentEdge;
                margin.top = Math.round(offset);
            }
            canvas.style.marginTop = margin.top + 'px';
            if (margin.top !== 0) {
                margin.bottom = -(parentBounds.height - canvasBounds.height - margin.top);
                canvas.style.marginBottom = margin.bottom + 'px';
            }
        }
        margin.x = margin.left;
        margin.y = margin.top;
    },
    reflowGame: function () {
        this.resetCanvas('', '');
        var bounds = this.getParentBounds(this._tempBounds);
        this.updateDimensions(bounds.width, bounds.height, true);
    },
    reflowCanvas: function () {
        if (!this.incorrectOrientation) {
            this.width = Phaser.Math.clamp(this.width, this.minWidth || 0, this.maxWidth || this.width);
            this.height = Phaser.Math.clamp(this.height, this.minHeight || 0, this.maxHeight || this.height);
        }
        this.resetCanvas();
        if (!this.compatibility.noMargins) {
            if (this.isFullScreen && this._createdFullScreenTarget) {
                this.alignCanvas(true, true);
            } else {
                this.alignCanvas(this.pageAlignHorizontally, this.pageAlignVertically);
            }
        }
        this.updateScalingAndBounds();
    },
    resetCanvas: function (cssWidth, cssHeight) {
        if (cssWidth === undefined) {
            cssWidth = this.width + 'px';
        }
        if (cssHeight === undefined) {
            cssHeight = this.height + 'px';
        }
        var canvas = this.game.canvas;
        if (!this.compatibility.noMargins) {
            canvas.style.marginLeft = '';
            canvas.style.marginTop = '';
            canvas.style.marginRight = '';
            canvas.style.marginBottom = '';
        }
        canvas.style.width = cssWidth;
        canvas.style.height = cssHeight;
    },
    queueUpdate: function (force) {
        if (force) {
            this._parentBounds.width = 0;
            this._parentBounds.height = 0;
        }
        this._updateThrottle = this._updateThrottleReset;
    },
    reset: function (clearWorld) {
        if (clearWorld && this.grid) {
            this.grid.reset();
        }
    },
    setMaximum: function () {
        this.width = this.dom.visualBounds.width;
        this.height = this.dom.visualBounds.height;
    },
    setShowAll: function (expanding) {
        var bounds = this.getParentBounds(this._tempBounds);
        var width = bounds.width;
        var height = bounds.height;
        var multiplier;
        if (expanding) {
            multiplier = Math.max((height / this.game.height), (width / this.game.width));
        } else {
            multiplier = Math.min((height / this.game.height), (width / this.game.width));
        }
        this.width = Math.round(this.game.width * multiplier);
        this.height = Math.round(this.game.height * multiplier);
    },
    setExactFit: function () {
        var bounds = this.getParentBounds(this._tempBounds);
        this.width = bounds.width;
        this.height = bounds.height;
        if (this.isFullScreen) {
            return;
        }
        if (this.maxWidth) {
            this.width = Math.min(this.width, this.maxWidth);
        }
        if (this.maxHeight) {
            this.height = Math.min(this.height, this.maxHeight);
        }
    },
    createFullScreenTarget: function () {
        var fsTarget = document.createElement('div');
        fsTarget.style.margin = '0';
        fsTarget.style.padding = '0';
        fsTarget.style.background = '#000';
        return fsTarget;
    },
    startFullScreen: function (antialias, allowTrampoline) {
        if (this.isFullScreen) {
            return false;
        }
        if (!this.compatibility.supportsFullScreen) {
            var _this = this;
            setTimeout(function () {
                _this.fullScreenError();
            }, 10);
            return;
        }
        if (this.compatibility.clickTrampoline === 'when-not-mouse') {
            var input = this.game.input;
            if (input.activePointer && input.activePointer !== input.mousePointer && (allowTrampoline || allowTrampoline !== false)) {
                input.activePointer.addClickTrampoline("startFullScreen", this.startFullScreen, this, [antialias, false]);
                return;
            }
        }
        if (antialias !== undefined && this.game.renderType === Phaser.CANVAS) {
            this.game.stage.smoothed = antialias;
        }
        var fsTarget = this.fullScreenTarget;
        if (!fsTarget) {
            this.cleanupCreatedTarget();
            this._createdFullScreenTarget = this.createFullScreenTarget();
            fsTarget = this._createdFullScreenTarget;
        }
        var initData = {
            targetElement: fsTarget
        };
        this.hasPhaserSetFullScreen = true;
        this.onFullScreenInit.dispatch(this, initData);
        if (this._createdFullScreenTarget) {
            var canvas = this.game.canvas;
            var parent = canvas.parentNode;
            parent.insertBefore(fsTarget, canvas);
            fsTarget.appendChild(canvas);
        }
        if (this.game.device.fullscreenKeyboard) {
            fsTarget[this.game.device.requestFullscreen](Element.ALLOW_KEYBOARD_INPUT);
        } else {
            fsTarget[this.game.device.requestFullscreen]();
        }
        return true;
    },
    stopFullScreen: function () {
        if (!this.isFullScreen || !this.compatibility.supportsFullScreen) {
            return false;
        }
        this.hasPhaserSetFullScreen = false;
        document[this.game.device.cancelFullscreen]();
        return true;
    },
    cleanupCreatedTarget: function () {
        var fsTarget = this._createdFullScreenTarget;
        if (fsTarget && fsTarget.parentNode) {
            var parent = fsTarget.parentNode;
            parent.insertBefore(this.game.canvas, fsTarget);
            parent.removeChild(fsTarget);
        }
        this._createdFullScreenTarget = null;
    },
    prepScreenMode: function (enteringFullscreen) {
        var createdTarget = !!this._createdFullScreenTarget;
        var fsTarget = this._createdFullScreenTarget || this.fullScreenTarget;
        if (enteringFullscreen) {
            if (createdTarget || this.fullScreenScaleMode === Phaser.ScaleManager.EXACT_FIT) {
                if (fsTarget !== this.game.canvas) {
                    this._fullScreenRestore = {
                        targetWidth: fsTarget.style.width,
                        targetHeight: fsTarget.style.height
                    };
                    fsTarget.style.width = '100%';
                    fsTarget.style.height = '100%';
                }
            }
        } else {
            if (this._fullScreenRestore) {
                fsTarget.style.width = this._fullScreenRestore.targetWidth;
                fsTarget.style.height = this._fullScreenRestore.targetHeight;
                this._fullScreenRestore = null;
            }
            this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
            this.resetCanvas();
        }
    },
    fullScreenChange: function (event) {
        this.event = event;
        if (this.isFullScreen) {
            this.prepScreenMode(true);
            this.updateLayout();
            this.queueUpdate(true);
        } else {
            this.prepScreenMode(false);
            this.cleanupCreatedTarget();
            this.updateLayout();
            this.queueUpdate(true);
        }
        this.onFullScreenChange.dispatch(this, this.width, this.height);
    },
    fullScreenError: function (event) {
        this.event = event;
        this.cleanupCreatedTarget();
        console.warn('Phaser.ScaleManager: requestFullscreen failed or device does not support the Fullscreen API');
        this.onFullScreenError.dispatch(this);
    },
    scaleSprite: function (sprite, width, height, letterBox) {
        if (width === undefined) {
            width = this.width;
        }
        if (height === undefined) {
            height = this.height;
        }
        if (letterBox === undefined) {
            letterBox = false;
        }
        if (!sprite || !sprite['scale']) {
            return sprite;
        }
        sprite.scale.x = 1;
        sprite.scale.y = 1;
        if ((sprite.width <= 0) || (sprite.height <= 0) || (width <= 0) || (height <= 0)) {
            return sprite;
        }
        var scaleX1 = width;
        var scaleY1 = (sprite.height * width) / sprite.width;
        var scaleX2 = (sprite.width * height) / sprite.height;
        var scaleY2 = height;
        var scaleOnWidth = (scaleX2 > width);
        if (scaleOnWidth) {
            scaleOnWidth = letterBox;
        } else {
            scaleOnWidth = !letterBox;
        }
        if (scaleOnWidth) {
            sprite.width = Math.floor(scaleX1);
            sprite.height = Math.floor(scaleY1);
        } else {
            sprite.width = Math.floor(scaleX2);
            sprite.height = Math.floor(scaleY2);
        }
        return sprite;
    },
    destroy: function () {
        this.game.onResume.remove(this._gameResumed, this);
        window.removeEventListener('orientationchange', this._orientationChange, false);
        window.removeEventListener('resize', this._windowResize, false);
        if (this.compatibility.supportsFullScreen) {
            document.removeEventListener('webkitfullscreenchange', this._fullScreenChange, false);
            document.removeEventListener('mozfullscreenchange', this._fullScreenChange, false);
            document.removeEventListener('MSFullscreenChange', this._fullScreenChange, false);
            document.removeEventListener('fullscreenchange', this._fullScreenChange, false);
            document.removeEventListener('webkitfullscreenerror', this._fullScreenError, false);
            document.removeEventListener('mozfullscreenerror', this._fullScreenError, false);
            document.removeEventListener('MSFullscreenError', this._fullScreenError, false);
            document.removeEventListener('fullscreenerror', this._fullScreenError, false);
        }
    }
};
Phaser.ScaleManager.prototype.constructor = Phaser.ScaleManager;
Object.defineProperty(Phaser.ScaleManager.prototype, "boundingParent", {
    get: function () {
        if (this.parentIsWindow || (this.isFullScreen && this.hasPhaserSetFullScreen && !this._createdFullScreenTarget)) {
            return null;
        }
        var parentNode = this.game.canvas && this.game.canvas.parentNode;
        return parentNode || null;
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "scaleMode", {
    get: function () {
        return this._scaleMode;
    },
    set: function (value) {
        if (value !== this._scaleMode) {
            if (!this.isFullScreen) {
                this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
                this.queueUpdate(true);
            }
            this._scaleMode = value;
        }
        return this._scaleMode;
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "fullScreenScaleMode", {
    get: function () {
        return this._fullScreenScaleMode;
    },
    set: function (value) {
        if (value !== this._fullScreenScaleMode) {
            if (this.isFullScreen) {
                this.prepScreenMode(false);
                this._fullScreenScaleMode = value;
                this.prepScreenMode(true);
                this.queueUpdate(true);
            } else {
                this._fullScreenScaleMode = value;
            }
        }
        return this._fullScreenScaleMode;
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "currentScaleMode", {
    get: function () {
        return this.isFullScreen ? this._fullScreenScaleMode : this._scaleMode;
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignHorizontally", {
    get: function () {
        return this._pageAlignHorizontally;
    },
    set: function (value) {
        if (value !== this._pageAlignHorizontally) {
            this._pageAlignHorizontally = value;
            this.queueUpdate(true);
        }
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignVertically", {
    get: function () {
        return this._pageAlignVertically;
    },
    set: function (value) {
        if (value !== this._pageAlignVertically) {
            this._pageAlignVertically = value;
            this.queueUpdate(true);
        }
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "isFullScreen", {
    get: function () {
        return !!(document['fullscreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['msFullscreenElement']);
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "isPortrait", {
    get: function () {
        return this.classifyOrientation(this.screenOrientation) === 'portrait';
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "isLandscape", {
    get: function () {
        return this.classifyOrientation(this.screenOrientation) === 'landscape';
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "isGamePortrait", {
    get: function () {
        return (this.height > this.width);
    }
});
Object.defineProperty(Phaser.ScaleManager.prototype, "isGameLandscape", {
    get: function () {
        return (this.width > this.height);
    }
});