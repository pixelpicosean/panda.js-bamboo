bamboo.editor = {
    config: {}
};

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

    'bamboo.editor.nodes.animation',
    'bamboo.editor.nodes.null',
    'bamboo.editor.nodes.camera',
    'bamboo.editor.nodes.image',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.nodes.path',
    'bamboo.editor.nodes.pathfollower',
    'bamboo.editor.nodes.rotator',
    'bamboo.editor.nodes.emitter',
    'bamboo.editor.nodes.trigger',
    'bamboo.editor.nodes.tile',
    'bamboo.editor.nodes.spine',
    'bamboo.editor.nodes.collisiontile',
    'bamboo.editor.nodes.triggerimage',
    'bamboo.editor.nodes.tween',
    'bamboo.runtime.nodes.audio',
    'bamboo.runtime.nodes.physics',
    'bamboo.runtime.nodes.button'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/hourglass.png');

bamboo.EditorScene = game.Scene.extend({
    init: function() {
        // Disable right click
        document.oncontextmenu = document.body.oncontextmenu = function() {
            return false;
        };
        window.ondrop = window.ondragleave = window.ondragover = function(event) {
            event.preventDefault();
        };
        var canvas = game.system.canvas;
        canvas.ondragover = this.dragover.bind(this);
        canvas.ondragleave = this.dragleave.bind(this);
        canvas.ondrop = this.filedrop.bind(this);

        this.scenesWindow = bamboo.ui.addWindow({
            x: 'center',
            y: 'center',
            width: 310,
            height: 155
        });
        this.scenesWindow.setTitle('Welcome to Bamboo scene editor ' + bamboo.version);
        this.scenesWindow.addImageTextButton('New scene', 'polaroid.png', this.loadEditor.bind(this, null));
        this.scenesWindow.addImageTextButton('Load scene', 'stack.png', this.loadEditor.bind(this, bamboo.scenes[0]));
        this.scenesWindow.addImageTextButton('Settings', 'tools.png');
        this.scenesWindow.onResize = this.onResize.bind(this);

        bamboo.nodes = game.ksort(bamboo.nodes);

        this.scenesWindow.show();
    },

    onResize: function() {
        if (this.scenesWindow) {
            this.scenesWindow.x = window.innerWidth / 2 - this.scenesWindow.width / 2;
            this.scenesWindow.y = window.innerHeight / 2 - this.scenesWindow.height / 2;
            this.scenesWindow.updatePosition();
        }
    },

    loadEditor: function(data) {
        if (this.scenesWindow) {
            bamboo.ui.removeWindow(this.scenesWindow);
            this.scenesWindow = null;
        }

        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
            this.removeObject(this.editor);
        }

        this.loader = new game.Sprite('../src/bamboo/editor/media/hourglass.png');
        this.loader.center();
        this.loader.addTo(this.stage);

        this.addTimer(50, this.startLoading.bind(this, data));
    },

    startLoading: function(data) {
        this.loader.remove();
        this.editor = new bamboo.Editor(data);
        this.stage.addChild(this.editor.displayObject);
        this.addObject(this.editor);
    },

    click: function(event) {
        if (this.editor) this.editor.click(event);
    },

    mousedown: function(event) {
        if (event.originalEvent.button === 2) return;
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
        if (this.editor) {
            this.editor.hideShadow();
            this.editor.filedrop(event);
        }
    },

    dragover: function() {
        if (this.editor) {
            this.editor.setShadowText('Drop here to add asset');
            this.editor.showShadow();
        }
        return false;
    },

    dragleave: function() {
        if (this.editor) this.editor.hideShadow();
        return false;
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
    if (game.scene && game.scene.editor) game.scene.editor.onResize();
    if (bamboo.ui) bamboo.ui.onResize();
});

window.addEventListener('keydown', function(event) {
    if (event.keyCode === 8 && document.activeElement.type !== 'text') {
        event.preventDefault();
    }
});

});
