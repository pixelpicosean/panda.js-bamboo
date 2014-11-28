game.bamboo.editor = {
    config: {
        moduleSaveDir: '../../game/scenes/',
        JSONSaveDir: '../../../media/'
    }
};

game.createEditorNode = function(node, content) {
    game.bamboo.nodes[node].editor = game.bamboo.Node.editor.extend(content);
};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.editor.boundarylayer',
    'bamboo.editor.editor',
    'bamboo.editor.console',
    'bamboo.editor.controller',
    'bamboo.editor.filesaver',
    'bamboo.editor.mode',
    'bamboo.editor.node',
    'bamboo.editor.propertypanel',
    'bamboo.editor.state',
    'bamboo.editor.menubar',
    'bamboo.editor.ui',
    'bamboo.editor.scene',
    'bamboo.editor.modes.edit',
    'bamboo.editor.modes.main',
    'bamboo.editor.states.boxselect',
    'bamboo.editor.states.add',
    'bamboo.editor.states.move',
    'bamboo.editor.states.resize',
    'bamboo.editor.states.select',
    'bamboo.editor.nodes.animation',
    'bamboo.editor.nodes.image',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.nodes.path',
    'bamboo.editor.nodes.pathfollower',
    'bamboo.editor.nodes.rotator',
    'bamboo.editor.nodes.tile',
    'bamboo.editor.nodes.spine',
    'bamboo.editor.nodes.collisiontile',
    'bamboo.editor.nodes.triggerimage',
    'bamboo.editor.nodes.tween',
    'bamboo.runtime.nodes.trigger',
    'bamboo.runtime.nodes.audio',
    'bamboo.runtime.nodes.physics',
    'bamboo.runtime.nodes.button',
    'bamboo.runtime.nodes.mousetrigger'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/hourglass.png');

game.createScene('BambooEditor', {
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

        var data = game.bamboo.editor.currentScene ? game.bamboo.getSceneData(game.bamboo.editor.currentScene) : null;
        this.editor = new game.bamboo.Editor(data);
        this.stage.addChild(this.editor.displayObject);
        this.addObject(this.editor);
    },

    loadScene: function(name) {
        if (game.bamboo.editor.currentScene) game.removeBambooAssets(game.bamboo.editor.currentScene);
        game.addBambooAssets(name);
        game.bamboo.editor.currentScene = name;

        game.bamboo.ui.removeAll();

        var loader = new game.Loader('BambooEditor');
        loader.start();
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
    game.Storage.id = 'net.pandajs.bamboo';
    game.System.startScene = 'BambooEditor';

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';

    game.bamboo.nodes = game.ksort(game.bamboo.nodes);
    game.bamboo.scenes = game.ksort(game.bamboo.scenes);

    style.onload = function() {
        game._start(null, window.innerWidth, window.innerHeight);
        game.bamboo.ui = new game.bamboo.Ui();
    };
    document.getElementsByTagName('head')[0].appendChild(style);
};

window.addEventListener('resize', function() {
    if (game.system) game.system.resize(window.innerWidth, window.innerHeight);
    if (game.scene && game.scene.editor) game.scene.editor.onResize();
    if (game.bamboo.ui) game.bamboo.ui.onResize();
});

window.addEventListener('keydown', function(event) {
    // Disable backspace
    if (event.keyCode === 8 && document.activeElement.type !== 'text') {
        event.preventDefault();
    }
});

});
