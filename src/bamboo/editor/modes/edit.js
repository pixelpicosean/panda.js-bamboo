game.module(
    'bamboo.editor.modes.edit'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.ModeEdit = bamboo.editor.Mode.extend({
    helpText: 'Edit mode: MOUSE confirm, ESC cancel',

    enter: function() {
        this.editor.controller.enableEditMode(this.editor.activeNode, true);
    },
    
    exit: function() {
        this.editor.controller.enableEditMode(this.editor.activeNode, false);
    },

    click: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.editor.activeNode._editorNode.click(pos);
    },

    mousemove: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.editor.activeNode._editorNode.mousemove(pos);
    },

    keydown: function(key) {
        if (key === 'ESC') return this.editor.changeMode('Main');
        
        this.editor.activeNode._editorNode.keydown(key);
    }
});

});
