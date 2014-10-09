game.module(
    'bamboo.editor.menubar'
)
.body(function() {
    
bamboo.MenuBar = game.Class.extend({
    height: 26,

    init: function(editor) {
        this.editor = editor;

        this.menuElem = bamboo.ui.addMenu(this.height);
        this.menuElem.addMenu('Scene');
        this.menuElem.addMenuItem('Scene', 'New scene', function() {
            game.scene.loadEditor();
        });
        this.menuElem.addMenuItem('Scene', 'Load last scene', function() {
            game.scene.loadEditor(bamboo.scenes[0]);
        });
        this.menuElem.addMenuItem('Scene', 'Save module', this.editor.saveAsModule.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Save JSON', this.editor.saveAsJSON.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Download module', this.editor.downloadAsModule.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Download JSON', this.editor.downloadAsJSON.bind(this.editor));

        this.menuElem.addMenu('Node');
        this.menuElem.addMenuItem('Node', 'Delete', this.editor.controller.deleteSelectedNodes.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Duplicate', this.editor.controller.duplicateSelectedNodes.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Parent/unparent', this.editor.controller.setNodeParent.bind(this.editor.controller));

        this.menuElem.addMenu('Window');
        this.menuElem.addMenuItem('Window', 'Nodes', function() {
            bamboo.ui.showWindow('nodes');
        });
        this.menuElem.addMenuItem('Window', 'Properties', function() {
            bamboo.ui.showWindow('properties');
        });
        this.menuElem.addMenuItem('Window', 'Layers', function() {
            bamboo.ui.showWindow('layers');
        });
        this.menuElem.addMenuItem('Window', 'Assets', function() {
            bamboo.ui.showWindow('assets');
        });
        this.menuElem.addMenuItem('Window', 'Camera', function() {
            bamboo.ui.showWindow('camera');
        });
        this.menuElem.addMenuItem('Window', 'Console', function() {
            bamboo.ui.showWindow('console');
        });

        this.menuElem.addMenu('Workspace');
        this.menuElem.addMenuItem('Workspace', 'Grid', this.editor.changeGrid.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Boundaries', this.editor.toggleBoundaries.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Nodes', this.editor.toggleViewNodes.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Lights', this.editor.boundaryLayer.toggleScreenDim.bind(this.editor.boundaryLayer));
        this.menuElem.addMenuItemSpacer('Workspace');
        this.menuElem.addMenuItem('Workspace', 'Reset workspace', function() {
            bamboo.ui.resetWorkspace();
        });
        this.menuElem.addMenuItem('Workspace', 'Save workspace', this.saveWorkspace.bind(this));
        this.menuElem.addMenu('Help');
        this.menuElem.addMenuItem('Help', 'API documentation', function() {
            window.open('http://www.pandajs.net/bamboo/docs');
        });
        this.menuElem.addMenuItem('Help', 'View homepage', function() {
            window.open('http://www.pandajs.net/bamboo');
        });
        this.menuElem.addMenuItem('Help', 'View on GitHub', function() {
            window.open('http://github.com/ekelokorpi/panda.js-bamboo');
        });
        this.menuElem.addMenuItemSpacer('Help');
        this.menuElem.addMenuItem('Help', 'About...', this.editor.showAbout.bind(this.editor));

        var version = document.createElement('div');
        version.innerHTML = bamboo.version;
        version.style.position = 'absolute';
        version.style.right = '10px';
        version.style.top = '5px';
        this.menuElem.windowDiv.appendChild(version);
    },

    saveWorkspace: function() {
        game.storage.set('workspace', bamboo.ui.getWorkspace());
        this.editor.setTempMessage('Workspace saved');
    },

    hide: function() {
        this.menuElem.hide();
    },

    show: function() {
        this.menuElem.show();
    }
});

});
