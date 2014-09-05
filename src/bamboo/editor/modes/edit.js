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
        this.state = this.editor.activeNode._editorNode;
        this.editor.controller.enableEditMode(this.state, true);
    },
    
    exit: function() {
        this.editor.controller.enableEditMode(this.state, false);
    },

    click: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.state.click(pos);
    },

    mousedown: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.state.mousedown(pos);
    },

    mousemove: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.state.mousemove(pos);
    },

    mouseup: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.state.mouseup(pos);
    },

    keydown: function(key) {
        if (key === 'ESC') return this.editor.changeMode('Main');
        
        this.state.keydown(key);
    }
});

});
