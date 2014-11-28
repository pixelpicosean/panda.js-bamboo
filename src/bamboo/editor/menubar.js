game.module(
    'bamboo.editor.menubar'
)
.body(function() {
    
game.bamboo.MenuBar = game.Class.extend({
    height: 26,

    init: function(editor) {
        this.editor = editor;

        this.menuElem = game.bamboo.ui.addMenu(this.height);
        this.menuElem.addMenu('Scene');
        this.menuElem.addMenuItem('Scene', 'New scene', function() {
            // game.scene.loadScene();
        });
        this.menuElem.addMenuItem('Scene', 'Load scene...', this.editor.loadScene.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Save module', this.editor.saveAsModule.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Save JSON', this.editor.saveAsJSON.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Download module', this.editor.downloadAsModule.bind(this.editor));
        this.menuElem.addMenuItem('Scene', 'Download JSON', this.editor.downloadAsJSON.bind(this.editor));

        this.menuElem.addMenu('Node');
        this.menuElem.addMenuItem('Node', 'Delete', this.editor.controller.deleteSelectedNodes.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Duplicate', this.editor.controller.duplicateSelectedNodes.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Parent/unparent', this.editor.controller.setNodeParent.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Move to top', this.editor.controller.moveNodeTop.bind(this.editor.controller));
        this.menuElem.addMenuItem('Node', 'Move to bottom', this.editor.controller.moveNodeBottom.bind(this.editor.controller));

        this.menuElem.addMenu('Window');
        this.menuElem.addMenuItem('Window', 'Assets', function() {
            game.bamboo.ui.toggleWindow('assets');
        });
        this.menuElem.addMenuItem('Window', 'Camera', function() {
            game.bamboo.ui.toggleWindow('camera');
        });
        this.menuElem.addMenuItem('Window', 'Console', function() {
            game.bamboo.ui.toggleWindow('console');
        });
        this.menuElem.addMenuItem('Window', 'Layers', function() {
            game.bamboo.ui.toggleWindow('layers');
        });
        this.menuElem.addMenuItem('Window', 'Layer settings', function() {
            game.bamboo.ui.toggleWindow('layerSettings');
        });
        this.menuElem.addMenuItem('Window', 'Nodes', function() {
            game.bamboo.ui.toggleWindow('nodes');
        });
        this.menuElem.addMenuItem('Window', 'Properties', function() {
            game.bamboo.ui.toggleWindow('properties');
        });

        this.menuElem.addMenu('Workspace');
        this.menuElem.addMenuItem('Workspace', 'Grid', this.editor.changeGrid.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Boundaries', this.editor.toggleBoundaries.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Nodes', this.editor.toggleViewNodes.bind(this.editor));
        this.menuElem.addMenuItem('Workspace', 'Lights', this.editor.boundaryLayer.toggleScreenDim.bind(this.editor.boundaryLayer));
        this.menuElem.addMenuItemSpacer('Workspace');
        this.menuElem.addMenuItem('Workspace', 'Reset workspace', function() {
            game.bamboo.ui.resetWorkspace();
        });
        this.menuElem.addMenuItem('Workspace', 'Save workspace', this.saveWorkspace.bind(this));
        this.menuElem.addMenu('Help');
        this.menuElem.addMenuItem('Help', 'Documentation', function() {
            window.open('http://www.pandajs.net/bamboo/docs');
        });
        this.menuElem.addMenuItem('Help', 'View homepage', function() {
            window.open('http://www.pandajs.net/bamboo');
        });
        this.menuElem.addMenuItem('Help', 'View on GitHub', function() {
            window.open('http://github.com/ekelokorpi/panda.js-bamboo');
        });

        var version = document.createElement('div');
        version.innerHTML = game.bamboo.version;
        version.style.position = 'absolute';
        version.style.right = '10px';
        version.style.top = '5px';
        this.menuElem.windowDiv.appendChild(version);
    },

    saveWorkspace: function() {
        game.storage.set('workspace', game.bamboo.ui.getWorkspace());
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
