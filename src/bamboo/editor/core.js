game.bamboo.editor = {};

game.createEditorNode = function(node, content) {
    game.nodes[node].editor = game.Node.editor.extend(content);
};

game.bamboo.setConfig = function(name, defaultValue) {
    if (typeof game.bamboo.config[name] === 'undefined') game.bamboo.config[name] = defaultValue;
};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.editor.boundary',
    'bamboo.editor.editor',
    'bamboo.editor.camera',
    'bamboo.editor.controller',
    'bamboo.editor.filesaver',
    'bamboo.editor.menubar',
    'bamboo.editor.mode',
    'bamboo.editor.node',
    'bamboo.editor.scene',
    'bamboo.editor.sidebar',
    'bamboo.editor.state',
    'bamboo.editor.ui',

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
    'bamboo.editor.nodes.spine',
    'bamboo.editor.nodes.triggerimage',
    'bamboo.editor.nodes.tween',
    'bamboo.editor.nodes.spritesheet',

    'bamboo.runtime.nodes.trigger',
    'bamboo.runtime.nodes.audio',
    'bamboo.runtime.nodes.physics',
    'bamboo.runtime.nodes.button',
    'bamboo.runtime.nodes.mousetrigger'
)
.body(function() {

// Unlimited pool
game.bambooPool.get = function() { return new game.Point(); };

game.config.autoStart = false;
game.ready = function() {
    console.log('Bamboo ' + game.bamboo.version);

    // Bamboo config
    game.bamboo.setConfig('moduleFolder', 'scenes');
    game.bamboo.setConfig('mainModule', 'scenes');
    game.bamboo.setConfig('JSONSaveDir', '../../../media/');
    game.bamboo.setConfig('customSort', false);
    game.bamboo.setConfig('systemWidth', game.System.width);
    game.bamboo.setConfig('systemHeight', game.System.height);
    game.bamboo.setConfig('gridSize', 32);
    game.bamboo.setConfig('viewNodes', true);
    game.bamboo.setConfig('saveSettings', true);
    game.bamboo.setConfig('sideBarWidth', 220);
    game.bamboo.setConfig('sideBarVisible', true);
    game.bamboo.setConfig('menuBarHeight', 26);

    // Panda config
    game.System.scale = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = game.bamboo.config.menuBarHeight;
    game.System.startScene = 'BambooEditor';
    game.System.width = window.innerWidth;
    if (game.bamboo.config.sideBarVisible) game.System.width -= game.bamboo.config.sideBarWidth;
    game.System.height = window.innerHeight - game.bamboo.config.menuBarHeight;
    game.Storage.id = 'net.pandajs.bamboo';
    game.Loader.barBgColor = 0x393939;
    game.Loader.barColor = 0x6b6b6b;
    game.Loader.time = 0;

    // Force dimensions to odd ???
    // if (game.System.width % 2 === 0) game.System.width++;
    // if (game.System.height % 2 === 0) game.System.height++;

    // Init nodes
    game.nodes = game.ksort(game.nodes);
    for (var name in game.nodes) {
        if (!game.nodes[name].editor) {
            // Get editor node
            var proto = game.nodes[name].prototype;
            while (true) {
                if (proto.constructor.editor) break;
                proto = Object.getPrototypeOf(proto);
                if (proto === game.Class.prototype) break;
            }
            game.nodes[name].editor = proto.constructor.editor;
        }
    }

    // Sort scenes
    if (!game.bamboo.config.customSort) game.scenes = game.ksort(game.scenes);

    game.start();
    game.bamboo.ui = new game.BambooUi();
};

game.bamboo.resize = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (game.scene.sideBar.visible) width -= game.bamboo.config.sideBarWidth;
    if (game.scene.menuBar.visible) {
        height -= game.bamboo.config.menuBarHeight;
        game.system.canvas.style.top = game.bamboo.config.menuBarHeight + 'px';
    }
    else {
        game.system.canvas.style.top = '0px';
    }

    // Force dimensions to odd ???
    // if (width % 2 === 0) width++;
    // if (height % 2 === 0) height++;
    
    game.system.resize(width, height);
    game.scene.onResize();
    game.bamboo.ui.onResize();
};

window.addEventListener('resize', function() {
    if (!game.system) return;

    game.bamboo.resize();
});

window.addEventListener('keydown', function(event) {
    // Disable backspace
    if (event.keyCode === 8 && document.activeElement.type !== 'text') {
        event.preventDefault();
    }
});

window.ondrop = window.ondragleave = window.ondragover = function(event) {
    // Disable default drag n drop
    event.preventDefault();
};

document.oncontextmenu = document.body.oncontextmenu = function() {
    // Disable right click
    return false;
};

});
