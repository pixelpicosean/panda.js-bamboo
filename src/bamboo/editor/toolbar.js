game.module(
    'bamboo.editor.toolbar'
)
.body(function() {
    
bamboo.ToolBar = game.Class.extend({
    height: 51,

    init: function(editor) {
        this.editor = editor;

        this.windowElem = bamboo.ui.addWindow(0, 0, 'window', this.height);

        this.windowElem.addButton('Add node', this.editor.addNode.bind(this.editor));

        this.windowElem.addButton('Assets', this.editor.showAssets.bind(this.editor));

        this.windowElem.addButton('Save JSON', this.editor.saveAsJSON.bind(this.editor));
        this.windowElem.addButton('Save module', this.editor.saveAsModule.bind(this.editor));
        
        this.windowElem.addButton('Download JSON', this.editor.downloadAsJSON.bind(this.editor));
        this.windowElem.addButton('Download module', this.editor.downloadAsModule.bind(this.editor));
        this.show();
    },

    hide: function() {
        this.windowElem.hide();
    },

    show: function() {
        this.windowElem.show();
    }
});

});