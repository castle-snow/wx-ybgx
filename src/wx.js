import {
    game
} from "../libs/pixi-wx";

window.weixin = {
    DOMAIN: 'https://uf2.zingfront.com/playable/wx/ybgx',
    MAX_REPEAT: 3,
    REPEAT_INTERVAL: 1000,
    repeatTimes: 0,
    user: null,
    fonts: {},
    init() {
        this.openDataContext = wx.getOpenDataContext();
        this.sharedCanvas = this.openDataContext.canvas;
        this.login();
        this.setupFonts();
    },
    login() {
        AV.User.loginWithWeapp().then(userInfo => {
            const user = AV.User.current();
            user.save();
            this.user = user.toJSON();
            this.setupShare();
            //this.getUserInfo();
        }).catch(console.error);
    },
    setupShare() {
        wx.updateShareMenu({
            withShareTicket: true
        });
        wx.showShareMenu({
            withShareTicket: true,
        });
        wx.aldOnShareAppMessage(() => {
            return {
                title: '一起来，画一画',
                imageUrl: 'assets/images/shareImage.jpg',
                query: 'shareUserId=' + this.user.objectId,
            }
        });
        wx.onNetworkStatusChange(res => {
            if (res.isConnected && this.status === -1) {
                this.resumeGame();
            }
        });
    },
    share(cb) {
        wx.aldShareAppMessage({
            title: '一起来，画一画',
            imageUrl: 'assets/images/shareImage.jpg',
            query: 'shareUserId=' + this.user.objectId,
            success: cb
        });
    },
    setupFonts() {
        this.fonts.bmjz = 'Arial';
        var url = this.DOMAIN + '/assets/fonts/本墨剪字.ttf';
        this.loadFont('bmjz', url);
    },
    resumeGame() {
        this.status = 0;
        wx.hideToast();
        game.state.start('MainMenu');
    },
    getUserInfo() {
        wx.getUserInfo({
            success: userInfo => {
                AV.User.current().set(userInfo).save().then(user => {
                    this.user = user.toJSON();
                }).catch(console.error);
            },
            fail: () => {
                this.showUserButton();
            }
        });
    },
    showUserButton() {
        let button = wx.createUserInfoButton({
            type: 'text',
            text: '获取用户信息',
            style: {
                left: 10,
                top: 76,
                width: 200,
                height: 40,
                lineHeight: 40,
                backgroundColor: '#ff0000',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            },
            withCredentials: false,
        });
        button.onTap((res) => {
            button.hide();
            AV.User.current().set(res).save().then(user => {
                this.user = user.toJSON();
            }).catch(console.error);
        });
    },
    getLevelData(level) {
        try {
            var file = level === 0 ? 'src/data/level.0.json' : wx.env.USER_DATA_PATH + '/levels/' + level + '.json';
            var data = wx.getFileSystemManager().readFileSync(file, 'utf-8');
            data = JSON.parse(data);
            if (!Array.isArray(data)) {
                return null;
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    readFile(url, type) {
        type = type || url.substring(url.lastIndexOf('.') + 1, url.length);
        try {
            var data = wx.getFileSystemManager().readFileSync(url, 'utf-8');
            switch (type) {
                case 'json':
                    data = JSON.parse(data);
                    break;
                case 'xml':
                    data = (new DOMParser()).parseFromString(data);
                    break;
                case 'txt':
                default:
            };
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    getGameInfo() {
        try {
            var data = wx.getFileSystemManager().readFileSync(wx.env.USER_DATA_PATH + '/game.json', 'utf-8');
            data = JSON.parse(data);
            return data;
        } catch (e) {
            return null;
        }
    },
    saveGameInfo(data) {
        wx.getFileSystemManager().writeFile({
            filePath: wx.env.USER_DATA_PATH + '/game.json',
            data: JSON.stringify(data),
            encoding: 'utf-8',
            success: function () {
                console.log('saved')
            },
            fail: function (e) {
                console.log(e)
            }
        });
    },
    isLevelLoaded(level) {
        if (level === 0) {
            return true;
        }
        var path = wx.env.USER_DATA_PATH + '/levels/' + level + '.json';
        try {
            wx.getFileSystemManager().accessSync(path);
            return true;
        } catch (e) {
            return false;
        }
    },
    downloadLevel(level, cb, explicit = false) {
        var dir = wx.env.USER_DATA_PATH + '/levels/';
        try {
            wx.getFileSystemManager().accessSync(dir);
        } catch (e) {
            wx.getFileSystemManager().mkdirSync(dir);
        }
        var path = dir + level + '.json';
        var url = this.DOMAIN + '/levels/' + level + '.json?v=' + Math.random();
        this.downloadFile(url, path, cb, explicit);
    },
    loadFont(key, url) {
        var dir = wx.env.USER_DATA_PATH + '/fonts/';
        try {
            wx.getFileSystemManager().accessSync(dir);
        } catch (e) {
            wx.getFileSystemManager().mkdirSync(dir);
        }
        var path = dir + key;
        try {
            wx.getFileSystemManager().accessSync(path);
            weixin.fonts[key] = wx.loadFont(path);
        } catch (e) {
            this.downloadFile(url, path, function () {
                weixin.fonts[key] = wx.loadFont(path);
            });
        }
    },
    downloadFile(url, path, cb, explicit = false) {
        if (explicit) {
            wx.showLoading();
        }
        wx.downloadFile({
            url: url,
            header: {},
            filePath: path,
            success: () => {
                this.repeatTimes = 0;
                typeof cb === 'function' && cb();
            },
            fail: e => {
                if (explicit) {
                    this.status = -1;
                    if (e.errMsg.indexOf('network') > -1) {
                        wx.showToast({
                            title: '网络连接失败',
                            icon: 'loading',
                            duration: 100000,
                        });
                    }
                }
            },
            complete: () => {
                if (explicit) {
                    wx.hideLoading();
                }
            }
        });
    },
    setUserScore () {
        let gameScoreData = {
            wxgame: {
                score: 16,
                update_time: new Date().getTime(),
            },
            cost_ms: 36500
        };
        let kvData = [{
            key: "score",
            value: JSON.stringify(gameScoreData),
        }];
        wx.setUserCloudStorage({
            KVDataList: kvData,
            success: () => {
                console.log('success')
            }
        });
    },
    postMessage(m) {
        this.openDataContext.postMessage({
            action: m,
        });
    },
};