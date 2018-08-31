(function() {
    function a(a, b) {
        var c = cc.LoadingItems.getQueue(a);
        c.addListener(a.id, function(a) {
            a.error && j.unlink({
                filePath: a.url,
                success: function() {
                    cc.log("Load failed, removed local file " + a.url + " successfully!");
                }
            });
        }), b(null, null);
    }
    function b(a, b) {
        var c = a.url;
        j.readFile({
            filePath: c,
            encoding: "utf8",
            success: function(c) {
                a.states[cc.loader.downloader.id] = cc.Pipeline.ItemState.COMPLETE, b(null, c.data);
            },
            fail: function(a) {
                cc.warn("Read file failed: " + c), j.unlink({
                    filePath: c,
                    success: function() {
                        cc.log("Read file failed, removed local file " + c + " successfully!");
                    }
                }), b({
                    status: 0,
                    errorMessage: a && a.errMsg ? a.errMsg : "Read text file failed: " + c
                });
            }
        });
    }
    function c(c, d) {
        var f = wx.env.USER_DATA_PATH + "/" + c.url;
        j.access({
            path: f,
            success: function() {
                c.url = f, c.type && -1 !== g.indexOf(c.type) ? a(c, d) : b(c, d);
            },
            fail: function() {
                return k.REMOTE_SERVER_ROOT ? void e(c, d) : void d(null, null);
            }
        });
    }
    function d(a, b) {
        var c = cc.path.dirname(a);
        return "wxfile://usr" === c || "http://usr" === c ? void b() : void j.access({
            path: c,
            success: b,
            fail: function() {
                d(c, function() {
                    j.mkdir({
                        dirPath: c,
                        complete: b
                    });
                });
            }
        });
    }
    function e(c, e) {
        var f = c.url;
        if (h.test(f)) return void e(null, null);
        var i = k.REMOTE_SERVER_ROOT + "/" + f;
        c.url = i, wx.downloadFile({
            url: i,
            success: function(h) {
                if (404 === h.statusCode) cc.warn("Download file failed: " + i), e({
                    status: 0,
                    errorMessage: h && h.errMsg ? h.errMsg : "Download file failed: " + i
                }); else if (h.tempFilePath) {
                    var j = wx.env.USER_DATA_PATH + "/" + f;
                    d(j, function() {
                        wx.saveFile({
                            tempFilePath: h.tempFilePath,
                            filePath: j,
                            success: function(d) {
                                c.url = d.savedFilePath, c.type && -1 !== g.indexOf(c.type) ? a(c, e) : b(c, e);
                            },
                            fail: function() {
                                e(null, null);
                            }
                        });
                    });
                }
            },
            fail: function() {
                e(null, null);
            }
        });
    }
    var f = "WXDownloader", g = [ "js", "png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp", "image", "mp3", "ogg", "wav", "m4a", "font", "eot", "ttf", "woff", "svg", "ttc" ];
    const h = /^\w+:\/\/.*/;
    var j = wx.getFileSystemManager(), i = window.WXDownloader = function() {
        this.id = f, this.async = !0, this.pipeline = null, this.REMOTE_SERVER_ROOT = "";
    };
    i.ID = f, i.prototype.handle = function(d, e) {
        if ("js" === d.type) return void e(null, null);
        if ("uuid" === d.type) {
            var f = cc.Pipeline.Downloader.PackDownloader.load(d, e);
            if (void 0 !== f) return f ? f : void 0;
        }
        var h = d.url;
        j.access({
            path: h,
            success: function() {
                d.type && -1 !== g.indexOf(d.type) ? a(d, e) : b(d, e);
            },
            fail: function() {
                c(d, e);
            }
        });
    }, i.prototype.cleanOldAssets = function() {
        j.getSavedFileList({
            success: function(a) {
                var b = a.fileList;
                if (b) for (var c, d = 0; d < b.length; d++) c = b[d].filePath, j.unlink({
                    filePath: b[d].filePath,
                    success: function() {
                        cc.log("Removed local file " + c + " successfully!");
                    },
                    fail: function(a) {
                        cc.warn("Failed to remove file(" + c + "): " + a ? a.errMsg : "unknown error");
                    }
                });
            },
            fail: function(a) {
                cc.warn("Failed to list all saved files: " + a ? a.errMsg : "unknown error");
            }
        });
    }, i.prototype.cleanAllAssets = function() {
        j.getSavedFileList({
            success: function(a) {
                var b = a.fileList;
                if (b) for (var c, d = 0; d < b.length; d++) c = b[d].filePath, j.unlink({
                    filePath: b[d].filePath,
                    success: function() {
                        cc.log("Removed local file " + c + " successfully!");
                    },
                    fail: function(a) {
                        cc.warn("Failed to remove file(" + c + "): " + a ? a.errMsg : "unknown error");
                    }
                });
            },
            fail: function(a) {
                cc.warn("Failed to list all saved files: " + a ? a.errMsg : "unknown error");
            }
        });
    };
    var k = window.wxDownloader = new i();
})();