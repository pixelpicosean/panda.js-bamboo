game.module(
    'bamboo.editor.toolbar'
)
.body(function() {
    
bamboo.ToolBar = game.Class.extend({
    height: 50,

    init: function(editor) {
        this.editor = editor;

        this.windowElem = bamboo.ui.addWindow(0, 0, 'window', this.height);
        this.windowElem.addButton('Add node', this.editor.addNode.bind(this.editor));
        this.windowElem.addButton('Save', this.editor.save.bind(this.editor));
        this.windowElem.addButton('Download', this.editor.download.bind(this.editor));
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