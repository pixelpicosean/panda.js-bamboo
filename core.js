game.module(
    'editor.core'
)
.require(
    'engine.system',
    'engine.debug'
)
.body(function() {

game.Editor = game.Class.extend({
    windows: [],

    init: function() {
        document.body.className = 'notready';
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = 'src/editor/style.css';
        style.onload = this.ready.bind(this);
        document.getElementsByTagName('head')[0].appendChild(style);
    },

    ready: function() {
        document.body.className = '';
    },

    addWindow: function(x, y, width, height) {
        var obj = new game.Editor.Window(x, y, width, height);
        this.windows.push(obj);
        return obj;
    },

    hideAll: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].hide();
        };
    }
});

game.Editor.mediaFolder = 'src/editor/media/';

game.Debug.position.desktop = game.Debug.POSITION.TOPRIGHT;
game.System.resize = false;
game.System.center = false;
game.System.left = 54;
game.System.top = 0;

});