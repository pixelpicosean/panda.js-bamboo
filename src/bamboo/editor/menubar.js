game.module(
    'bamboo.editor.menubar'
)
.body(function() {
    
bamboo.MenuBar = game.Class.extend({
    height: 26,

    init: function(editor) {
        this.editor = editor;

        this.menuElem = bamboo.ui.addMenu(this.height);
        this.menuElem.addMenu('File');
        this.menuElem.addMenuItem('File', 'New scene', function() {
            game.scene.loadEditor();
        });
        this.menuElem.addMenuItem('File', 'Load last scene', function() {
            game.scene.loadEditor(bamboo.scenes[0]);
        });
        this.menuElem.addMenuItem('File', 'Save module', this.editor.saveAsModule.bind(this.editor));
        this.menuElem.addMenuItem('File', 'Save JSON', this.editor.saveAsJSON.bind(this.editor));
        this.menuElem.addMenuItem('File', 'Download module', this.editor.downloadAsModule.bind(this.editor));
        this.menuElem.addMenuItem('File', 'Download JSON', this.editor.downloadAsJSON.bind(this.editor));

        this.menuElem.addMenu('Window');
        this.menuElem.addMenuItem('Window', 'Add node', this.editor.addNode.bind(this.editor));
        this.menuElem.addMenuItem('Window', 'Properties', function() {
            bamboo.ui.showWindow('properties');
        });
        this.menuElem.addMenuItem('Window', 'Layers', function() {
            bamboo.ui.showWindow('layers');
        });
        this.menuElem.addMenuItem('Window', 'Assets', function() {
            bamboo.ui.showWindow('assets');
        });

        this.menuElem.addMenu('Workspace');
        this.menuElem.addMenuItem('Workspace', 'Reset workspace');
        this.menuElem.addMenuItem('Workspace', 'Save workspace');
        this.menuElem.addMenu('Help');
        this.menuElem.addMenuItem('Help', 'About', this.editor.showAbout.bind(this.editor));
    },

    hide: function() {
        this.menuElem.hide();
    },

    show: function() {
        this.menuElem.show();
    }
});

});
