game.module(
    'bamboo.editor.toolbar'
)
.body(function() {
    
bamboo.ToolBar = game.Class.extend({
    height: 37,

    init: function(editor) {
        this.editor = editor;

        this.windowElem = bamboo.ui.addWindow(0, 0, 'window', this.height);
        this.update();
        this.windowElem.show();
    },

    update: function() {
        this.windowElem.clear();
        this.windowElem.addText('Scene: ' + this.editor.name);
    },

    hide: function() {
        this.windowElem.hide();
    },

    show: function() {
        this.windowElem.show();
    }
});

});