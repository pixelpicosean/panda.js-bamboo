bamboo.editor = {};
bamboo.config = typeof bambooConfig !== 'undefined' ? bambooConfig : {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.editor.boundarylayer',
    'bamboo.editor.editor',
    'bamboo.editor.controller',
    'bamboo.editor.filesaver',
    'bamboo.editor.jszip',
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

    'bamboo.editor.nodes.image',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.nodes.manualtrigger',
    'bamboo.editor.nodes.movingimage',
    'bamboo.editor.nodes.path',
    'bamboo.editor.nodes.pathfollower',
    'bamboo.editor.nodes.rotator',
    'bamboo.editor.nodes.trigger',
    'bamboo.editor.nodes.triggerbox',
    'bamboo.editor.nodes.triggercircle',
    
    'bamboo.editor.states.boxselect',
    'bamboo.editor.states.add',
    'bamboo.editor.states.move',
    'bamboo.editor.states.rotate',
    'bamboo.editor.states.scale',
    'bamboo.editor.states.select'
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
        this.scenesWindow.addButton('New scene', this.loadEditor.bind(this));

        this.scenesWindow.addText('<br><br><br>Load scene:<br>');
        
        bamboo.scenes = game.ksort(bamboo.scenes);
        for (var name in bamboo.scenes) {
            this.scenesWindow.addButton(name, this.loadEditor.bind(this, name));
        }
        this.scenesWindow.show();
    },

    loadEditor: function(name) {
        bamboo.ui.removeWindow(this.scenesWindow);

        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
            this.removeObject(this.editor);
        }

        this.editor = bamboo.Editor.createFromJSON(bamboo.scenes[name]);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.stage.addChild(this.editor.displayObject);

        this.addObject(this.editor);
    },

    save: function() {
        if (!this.editor) return;

        var name = this.editor.name.toLowerCase();

        var zip = new JSZip();

        var json = this.editor.world.toJSON();

        var jsonText = JSON.stringify(json, null, '    ');
        var js = 'game.module(\n    \'game.scenes.' + name + '\'\n)\n.require(\n    \'bamboo.core\'\n)\n.body(function() {\n\n';

        js += 'bamboo.scenes.' + name + ' = '+jsonText+';\n';

        if (json.images.length > 0) js += '\n';

        for (var i = 0; i < json.images.length; i++) {
            js += 'game.addAsset(\'' + name + '/' + json.images[i] + '\');\n';
        }
        
        js += '\n});\n';

        zip.file(name + '.js', js);

        var blob = zip.generate({type: 'blob'});

        var filename = name + '.zip';
        if (game.config.name) filename = game.config.name + '_' + filename;
        game.saveAs(blob, filename);
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

    game._start(bamboo.EditorScene, window.innerWidth, window.innerHeight);
};

});
