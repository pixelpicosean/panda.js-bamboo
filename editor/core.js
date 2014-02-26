window.bamboo = window.bamboo || {};
window.bamboo.editor = window.bamboo.editor || {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.runtime.core',
    'bamboo.editor.editor',
    'bamboo.editor.ui',
    'bamboo.editor.node'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    editor: null,

    init: function() {
        this.installEventListeners();
        this.editor = bamboo.Editor.createFromJSON(bamboo.levelJSON);
        this.stage.addChild(this.editor.displayObject);
    },

    update: function() {
        this.editor.update(game.system.delta);
        this.super();
    },

    click: function(me) {
        if(me.originalEvent.button === 0)
            this.editor.onclick();
    },
    onmousedown: function(e) {
        this.editor.onmousedown(e.button);
    },
    onmousemove: function(e) {
        this.editor.onmousemove(new game.Vector(e.clientX, e.clientY));
    },
    onmouseup: function(e) {
        this.editor.onmouseup(e.button);
    },
    onmouseout: function(e) {
        this.editor.onmouseout();
    },
    onkeydown: function(e) {
        var tag = e.target.tagName;
        if(tag === 'INPUT' || tag === 'TEXTAREA')
            return;

        if(e.type !== 'keydown')
            return;

        var code = e.keyCode;
        var handled = this.editor.onkeydown(code);
        if(handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },
    onkeyup: function(e) {
        var tag = e.target.tagName;
        if(tag === 'INPUT' || tag === 'TEXTAREA')
            return;

        if(e.type !== 'keyup')
            return;

        var code = e.keyCode;
        var handled = this.editor.onkeyup(code);
        if(handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },


    installEventListeners: function() {
        var canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', this.onmousedown.bind(this), false);
        canvas.addEventListener('mousemove', this.onmousemove.bind(this), false);
        canvas.addEventListener('mouseup', this.onmouseup.bind(this), false);
        canvas.addEventListener('mouseout', this.onmouseout.bind(this), false);
        window.addEventListener('keydown', this.onkeydown.bind(this), false);
        window.addEventListener('keyup', this.onkeyup.bind(this), false);
    }
});


bamboo.start = function(levelJSON) {
    game.Debug.position.desktop = game.Debug.POSITION.TOPRIGHT;
    game.System.resize = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    this.ui = new bamboo.Ui();

    bamboo.levelJSON = levelJSON;

    // load level images
    var images = JSON.parse(levelJSON).images;
    for(var name in images) {
        PIXI.TextureCache[name] = PIXI.Texture.fromImage(images[name], true);
    }

    // TODO: read from json?
    game.System.orientation = game.System.LANDSCAPE;
    game.start(bamboo.EditorScene, window.innerWidth, window.innerHeight-40);
};

});
