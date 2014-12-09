bambooConfig = bambooConfig || {};

game.bamboo.editor = {};

game.createEditorNode = function(node, content) {
    game.nodes[node].editor = game.Node.editor.extend(content);
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
    'bamboo.editor.menubar',
    'bamboo.editor.ui',
    'bamboo.editor.scene',
    'bamboo.editor.modes.edit',
    'bamboo.editor.modes.main',
    'bamboo.editor.states.boxselect',
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

game.bambooPool.get = function() {
    return new game.Point();
};

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

        if (!game.bamboo.editor.currentScene && bambooConfig.loadLastScene) {
            var lastScene = game.storage.get('lastScene');
            if (lastScene) game.bamboo.editor.currentScene = lastScene;
            bambooConfig.loadLastScene = false;
        }

        var data = game.bamboo.editor.currentScene ? game.getSceneData(game.bamboo.editor.currentScene) : null;
        this.editor = new game.bamboo.Editor(data);
        this.stage.addChild(this.editor.displayObject);
        this.addObject(this.editor);
    },

    loadScene: function(name) {
        if (game.bamboo.editor.currentScene) game.removeBambooAssets(game.bamboo.editor.currentScene);
        
        if (name) game.addBambooAssets(name);

        game.bamboo.editor.currentScene = name;

        game.bamboo.ui.removeAll();

        var loader = new game.Loader('BambooEditor');
        loader.start();
    },

    click: function(event) {
        if (this.editor) this.editor.click(event);
    },

    nodeClick: function(node, event) {
        if (this.editor) this.editor.nodeClick(node, event);
    },

    nodeMouseDown: function(node, event) {
        if (this.editor) this.editor.nodeMouseDown(node, event);
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
    // Panda config
    game.System.scale = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;
    game.Storage.id = 'net.pandajs.bamboo';
    game.System.startScene = 'BambooEditor';

    // Default config
    bambooConfig.moduleFolder = bambooConfig.moduleFolder || 'scenes';
    bambooConfig.JSONSaveDir = bambooConfig.JSONSaveDir || '../../../media/';
    bambooConfig.mainModule = bambooConfig.mainModule || 'scenes';
    bambooConfig.customSort = typeof bambooConfig.customSort === 'boolean' ? bambooConfig.customSort : false;

    game.nodes = game.ksort(game.nodes);
    if (!bambooConfig.customSort) game.scenes = game.ksort(game.scenes);

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    style.onload = function() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        // Force dimension to odd
        if (width % 2 === 0) width++;
        if (height % 2 === 0) height++;
        game._start(null, width, height);
        game.bamboo.ui = new game.bamboo.Ui();
    };
    document.getElementsByTagName('head')[0].appendChild(style);
};

window.addEventListener('resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    // Force dimension to odd
    if (width % 2 === 0) width++;
    if (height % 2 === 0) height++;
    
    if (game.system) game.system.resize(width, height);
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
