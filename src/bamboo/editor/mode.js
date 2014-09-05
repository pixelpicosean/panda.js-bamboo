game.module(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.Mode = game.Class.extend({
    helpText: '',
    
    init: function(editor) {
        this.editor = editor;
    },

    enter: function() {},
    exit: function() {},
    update: function() {},

    click: function(event) {
        this.state.click(event);
    },

    mousedown: function(event) {
        this.state.mousedown(event);
    },

    mousemove: function(event) {
        this.state.mousemove(event);
    },

    mouseup: function(event) {
        this.state.mouseup(event);
    },

    keydown: function(key) {
        this.state.keydown(key);
    },

    keyup: function() {
    }
});

});
