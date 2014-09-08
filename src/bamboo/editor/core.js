bamboo.editor = {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.editor.boundarylayer',
    'bamboo.editor.editor',
    'bamboo.editor.controller',
    'bamboo.editor.filesaver',
    'bamboo.editor.mode',
    'bamboo.editor.node',
    'bamboo.editor.propertypanel',
    'bamboo.editor.state',
    'bamboo.editor.statusbar',
    'bamboo.editor.toolbar',
    'bamboo.editor.ui',
    'bamboo.editor.world',
    
    'bamboo.editor.modes.edit',
    'bamboo.editor.modes.game',
    'bamboo.editor.modes.main',

    'bamboo.editor.states.boxselect',
    'bamboo.editor.states.add',
    'bamboo.editor.states.move',
    'bamboo.editor.states.resize',
    'bamboo.editor.states.select',

    'bamboo.editor.nodes.null',
    'bamboo.editor.nodes.camera',
    'bamboo.editor.nodes.image',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.nodes.path',
    'bamboo.editor.nodes.pathfollower',
    'bamboo.editor.nodes.rotator',
    'bamboo.editor.nodes.emitter',
    'bamboo.editor.nodes.trigger',
    'bamboo.editor.nodes.tile'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    init: function() {
        var canvas = game.system.canvas;
        canvas.ondragover = function() { return false; };
        canvas.ondragend = function() { return false; };
        canvas.ondrop = this.filedrop.bind(this);

        this.scenesWindow = bamboo.ui.addWindow('center', 'center', 400, 150);
        this.scenesWindow.setTitle('Bamboo scene editor ' + bamboo.version);
        this.scenesWindow.addButton('New scene', this.loadEditor.bind(this, null));

        var scenes = [];
        for (key in game.json) {
            if (game.json[key].name) scenes.push(game.json[key]);
        }
        if (scenes.length > 0) {
            scenes.sort();
            this.scenesWindow.addText('<br><br>Load scene:<br>');
            for (var i = 0; i < scenes.length; i++) {
                this.scenesWindow.addButton(scenes[i].name, this.loadEditor.bind(this, scenes[i]));
            }
        }

        bamboo.nodes = game.ksort(bamboo.nodes);

        this.scenesWindow.show();
    },

    loadEditor: function(data) {
        bamboo.ui.removeWindow(this.scenesWindow);

        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
            this.removeObject(this.editor);
        }

        this.editor = new bamboo.Editor(data);
        this.stage.addChild(this.editor.displayObject);
        this.addObject(this.editor);
    },

    click: function(event) {
        if (this.editor) this.editor.click(event);
    },

    mousedown: function(event) {
        if (document.activeElement !== document.body) document.activeElement.blur();
        if (this.editor) this.editor.mousedown(event);
    },

    mousemove: function(event) {
        if (this.editor) this.editor.mousemove(event);
    },

    mouseup: function(event) {
        if (this.editor) this.editor.mouseup(event);
    },

    mouseout: function(event) {
        if (this.editor) this.editor.mouseout(event);
    },

    keydown: function(key) {
        if (key === 'ESC' && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
        if (key === 'ENTER' && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
        if (document.activeElement !== document.body) return;
        if (this.editor) this.editor.keydown(key);
        if (key === 'BACKSPACE') return true;
    },

    keyup: function(key) {
        if (document.activeElement !== document.body) return;
        if (this.editor) this.editor.keyup(key);
    },

    filedrop: function(event) {
        event.preventDefault();
        if (this.editor) this.editor.filedrop(event);
    }
});

game._start = game.start;
game.start = function() {
    game.System.scale = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;
    game.Storage.id = 'bamboo';

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    var favicon = document.createElement('link');
    favicon.type = 'image/x-icon';
    favicon.rel = 'shortcut icon';
    favicon.href = 'src/bamboo/editor/media/favicon.png';
    document.getElementsByTagName('head')[0].appendChild(favicon);

    bamboo.ui = new bamboo.Ui();

    var width = window.innerWidth;
    var height = window.innerHeight;
    width += width % 2 === 0 ? 1 : 0;
    height += height % 2 === 0 ? 1 : 0;
    game._start(bamboo.EditorScene, width, height);
};

window.addEventListener('resize', function() {
    if (game.system) game.system.resize(window.innerWidth, window.innerHeight);
    if (game.scene && game.scene.editor) game.scene.editor.propertyPanel.updateWindows();
    if (game.scene && game.scene.editor) game.scene.editor.onResize();
});

});
