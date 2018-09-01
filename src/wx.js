window.weixin = {
    DOMAIN: 'https://uf2.zingfront.com/playable/wx/ybgx',
    MAX_REPEAT: 3,
    REPEAT_INTERVAL: 1000,
    repeatTimes: 0,
    data: {
        user: null,
        repeated: false,
    },
    init() {
        this.login();
        wx.showShareMenu();
        wx.onShareAppMessage(() => {
            return {
                title: '一起来，画一画',
                imageUrl: 'assets/images/shareImage.jpg',
            }
        });
    },
    login() {
        AV.User.loginWithWeapp().then(user => {
            this.data.user = user.toJSON();
            this.getUserInfo();
        }).catch(console.error);
    },
    getUserInfo() {
        const user = AV.User.current();
        wx.getUserInfo({
            success: ({userInfo}) => {
              // 更新当前用户的信息
                user.set(userInfo).save().then(user => {
                    // 成功，此时可在控制台中看到更新后的用户信息
                    this.data.user = user.toJSON();
                }).catch(console.error);
            }
        });
    },
    share() {
        wx.shareAppMessage({
            title: '一起来，画一画',
            imageUrl: 'assets/images/shareImage.jpg',
        });
    },
    getLevelData(level) {
        try {
            var file = level === 0 ? 'src/data/level.0.json' : wx.env.USER_DATA_PATH + '/levels/' + level + '.json';
            var data = wx.getFileSystemManager().readFileSync(file, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    readFile(url, type) {
        try {
            var data = wx.getFileSystemManager().readFileSync(url, 'utf-8');
            switch (type) {
                case 'json':
                    data = JSON.parse(data);
                    break;
                case 'xml':
                    data = (new DOMParser()).parseFromString(data);
                    break;
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
    downloadLevel(level, cb) {
        var url = this.DOMAIN + '/levels/' + level + '.json?v=' + Math.random();
        var dir = wx.env.USER_DATA_PATH + '/levels/';
        try {
            wx.getFileSystemManager().accessSync(dir);
        } catch (e) {
            wx.getFileSystemManager().mkdirSync(dir);
        }
        var path = dir + level + '.json';
        try {
            wx.getFileSystemManager().accessSync(path);
        } catch (e) {
            this.downloadFile(url, path, cb);
        }
    },
    downloadFile(url, path, cb, repeat = true) {
        wx.downloadFile({
            url: url,
            header: {},
            filePath: path,
            success: function () {
                this.repeatTimes = 0;
                typeof cb === 'function' && cb();
            },
            fail: function (e) {
                this.repeatTimes++;
                if (repeat && this.repeatTimes <= this.MAX_REPEAT) {
                    setTimeout(this.downloadFiles, this.REPEAT_INTERVAL, url, path, cb);
                } else {
                    //TODO alert network error
                    console.error('failed to download ' + url, e);
                }
            }
        });
    }
};