import './libs/weapp-adapter';

var a = require("/libs/xmldom/dom-parser");
window.DOMParser = a.DOMParser;

window.AV = require('./libs/av-weapp-min');
window.AV.init({
    appId: '7Nglu7jT4TzysGthatUYL8g7-gzGzoHsz',
    appKey: 'miNxbLGpIDquaDyrf1zCUTfv',
});
wx.originContext = canvas.getContext('2d');
require("./libs/aldwx/ald-game");
require("./src/game.min");
