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
        this.node = this.editor.activeNode._editorNode;
        this.editor.controller.enableEditMode(this.node, true);
    },
    
    exit: function() {
        this.editor.controller.enableEditMode(this.node, false);
    },

    click: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.node.click(pos);
    },

    mousedown: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.node.mousedown(pos);
    },

    mousemove: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.node.mousemove(pos);
    },

    mouseup: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.node.mouseup(pos);
    },

    keydown: function(key) {
        if (key === 'ESC') return this.editor.changeMode('Main');
        
        this.node.keydown(key);
    }
});

});
