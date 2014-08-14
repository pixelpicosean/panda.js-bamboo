bamboo.editor = {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.editor.boundarylayer',
    'bamboo.editor.editor',
    'bamboo.editor.editorcontroller',
    'bamboo.editor.filesaver',
    'bamboo.editor.jszip',
    'bamboo.editor.mode',
    'bamboo.editor.node',
    'bamboo.editor.propertypanel',
    'bamboo.editor.state',
    'bamboo.editor.statusbar',
    'bamboo.editor.ui',
    'bamboo.editor.world',
    
    'bamboo.editor.modes.editnodemode',
    'bamboo.editor.modes.gamemode',
    'bamboo.editor.modes.nodemode',

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
    
    'bamboo.editor.states.boxselectstate',
    'bamboo.editor.states.createnodestate',
    'bamboo.editor.states.movenodestate',
    'bamboo.editor.states.newnodestate',
    'bamboo.editor.states.rotatenodestate',
    'bamboo.editor.states.scalenodestate',
    'bamboo.editor.states.selectionstate'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    init: function() {
        var canvas = game.system.canvas;
        canvas.ondragover = function() { return false; };
        canvas.ondragend = function() { return false; };
        canvas.ondrop = this.filedrop.bind(this);

        this.levelsWindow = bamboo.ui.addWindow('center', 'center', 500, 200);
        this.levelsWindow.addTitle('Bamboo editor ' + bamboo.version);
        this.levelsWindow.addButton('New level', this.loadEditor.bind(this));
        
        bamboo.levels = game.ksort(bamboo.levels);
        for (var name in bamboo.levels) {
            this.levelsWindow.addButton(name, this.loadEditor.bind(this, name));
        }
        this.levelsWindow.show();
    },

    loadEditor: function(name) {
        bamboo.ui.removeWindow(this.levelsWindow);

        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
            this.removeObject(this.editor);
        }

        this.editor = bamboo.Editor.createFromJSON(bamboo.levels[name]);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.addTo(this.stage);

        this.addObject(this.editor);
    },

    save: function() {
        if (!this.editor) return;

        var name = this.editor.name.toLowerCase();

        var json = this.editor.world.toJSON();
        var zip = new JSZip();
        var jsonText = JSON.stringify(json, null, '    ');
        var js = 'game.module(\n    \'game.levels.' + name + '\'\n)\n.require(\n    \'bamboo.runtime.core\'\n)\n.body(function() {\n\n';
        js += 'bamboo.loadLevel('+jsonText+');\n';
        js += '\n});\n';

        zip.file(this.editor.name.toLowerCase() + '.js', js);

        var blob = zip.generate({type: 'blob'});

        var filename = name + '.zip';
        if (game.config.name) filename = game.config.name + '_' + filename;
        game.saveAs(blob, filename);
    },

    click: function(event) {
        if (this.editor) this.editor.click(event);
    },

    mousedown: function(event) {
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
        if (this.editor) this.editor.keydown(key);
    },

    keyup: function(key) {
        if (this.editor) this.editor.keyup(key);
    },

    filedrop: function(event) {
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

    bamboo.ui = new bamboo.Ui();

    game._start(bamboo.EditorScene, window.innerWidth, window.innerHeight);
};

});
