game.bamboo.editor = {};

game.createEditorNode = function(node, content) {
    game.nodes[node].editor = game.Node.editor.extend(content);
};

game.setConfig = function(name, defaultValue) {
    if (typeof this.bamboo.config[name] === 'undefined') this.bamboo.config[name] = defaultValue;
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
    console.log('Bamboo ' + this.bamboo.version);

    // Bamboo config
    this.setConfig('moduleFolder', 'scenes');
    this.setConfig('mainModule', 'scenes');
    this.setConfig('JSONSaveDir', '../../../media/');
    this.setConfig('customSort', false);
    this.setConfig('systemWidth', this.System.width);
    this.setConfig('systemHeight', this.System.height);
    this.setConfig('gridSize', 32);
    this.setConfig('viewNodes', true);
    this.setConfig('saveSettings', true);

    // Panda config
    this.System.scale = false;
    this.System.center = false;
    this.System.left = 0;
    this.System.top = 0;
    this.System.startScene = 'BambooEditor';
    this.System.width = window.innerWidth;
    this.System.height = window.innerHeight;
    this.Storage.id = 'net.pandajs.bamboo';
    this.Loader.time = 0;

    // Init nodes
    this.nodes = this.ksort(this.nodes);
    for (var name in this.nodes) {
        if (!this.nodes[name].editor) {
            // Get editor node
            var proto = this.nodes[name].prototype;
            while (true) {
                if (proto.constructor.editor) break;
                proto = Object.getPrototypeOf(proto);
                if (proto === this.Class.prototype) break;
            }
            this.nodes[name].editor = proto.constructor.editor;
        }
    }

    // Sort scenes
    if (!this.bamboo.config.customSort) this.scenes = this.ksort(this.scenes);

    this.start();
};

game.bamboo.resize = function() {
    var width = window.innerWidth;
    var height = window.innerHeight - game.scene.menuBar.height;

    game.system.canvas.style.position = 'absolute';
    game.system.canvas.style.top = game.scene.menuBar.height + 'px';

    if (game.scene.sideBar.visible) width -= game.scene.sideBar.width;
    
    game.system.resize(width, height);
    game.scene.onResize();
    game.bamboo.ui.onResize();
};

window.addEventListener('resize', function() {
    if (game.editor) game.bamboo.resize();
});

window.addEventListener('keydown', function(event) {
    // Disable backspace
    if (event.keyCode === 8 && document.activeElement.type !== 'text') {
        event.preventDefault();
    }
});

window.ondrop = window.ondragleave = window.ondragover = function(event) {
    // Disable default drag drop
    event.preventDefault();
};

document.oncontextmenu = document.body.oncontextmenu = function() {
    // Disable right click menu
    return false;
};

});
