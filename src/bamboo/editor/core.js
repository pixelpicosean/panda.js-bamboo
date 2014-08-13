var bamboo = bamboo || {};
bamboo.editor = bamboo.editor || {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.runtime.core',
    'bamboo.editor.editor',
    'bamboo.editor.ui',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.node',
    'bamboo.editor.filesaver',
    'bamboo.editor.jszip',
    'bamboo.editor.world'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    editor: null,

    init: function() {
        this.installEventListeners();
        this.loadEditor(game.level);
    },

    installEventListeners: function() {
        var canvas = game.system.canvas;
        window.addEventListener('keydown', this.onkeydown.bind(this), false);
        window.addEventListener('keyup', this.onkeyup.bind(this), false);

        canvas.ondragover = function() { return false; };
        canvas.ondragend = function() { return false; };
        canvas.ondrop = this.filedrop.bind(this);
    },

    loadEditor: function(json) {
        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
            this.removeObject(this.editor);
        }

        this.editor = bamboo.Editor.createFromJSON(json);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.stage.addChild(this.editor.displayObject);

        this.addObject(this.editor);
    },

    save: function() {
        var json = this.editor.world.toJSON();
        var zip = new JSZip();
        var jsonText = JSON.stringify(json, null, '    ');
        var js = 'game.module(\n    \'level\'\n)\n.require(\n    \'bamboo.runtime.core\'\n)\n.body(function() {\n\n';
        js += 'bamboo.loadLevel('+jsonText+');\n';
        js += '\n});\n';

        zip.file('level.js', js);

        var blob = zip.generate({type: 'blob'});

        var filename = 'level.zip';
        if (game.config.name) filename = game.config.name + '_' + filename;
        game.saveAs(blob, filename);
    },

    click: function(event) {
        this.editor.click(event);
    },

    mousedown: function(event) {
        this.editor.mousedown(event);
    },

    mousemove: function(event) {
        this.editor.mousemove(event);
    },

    mouseup: function(event) {
        this.editor.mouseup(event);
    },

    mouseout: function(event) {
        this.editor.mouseout(event);
    },

    onkeydown: function(e) {
        if (!this.editor) return;

        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.type !== 'keydown') return;

        var code = e.keyCode;
        if (code === 82) return;
        var handled = this.editor.onkeydown(code);
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onkeyup: function(e) {
        if (!this.editor) return;

        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.type !== 'keyup') return;

        var code = e.keyCode;
        var handled = this.editor.onkeyup(code);
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    keydown: function(key) {
        if (key === 'W') {
            this.windowsHidden = !this.windowsHidden;
            if (this.windowsHidden) bamboo.ui.hideAll();
            else bamboo.ui.showAll();
        }

        this.editor.keydown(key);
    },

    keyup: function(key) {
        this.editor.keyup(key);
    },

    filedrop: function(event) {
        this.editor.filedrop(event);
    }
});

bamboo.start = function() {
    game.System.scale = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    this.ui = new bamboo.Ui();

    game.start(bamboo.EditorScene, window.innerWidth, window.innerHeight);
};

});
