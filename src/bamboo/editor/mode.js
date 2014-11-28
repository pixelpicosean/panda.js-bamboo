game.module(
    'bamboo.editor.mode'
)
.body(function() {

game.bamboo.editor.Mode = game.Class.extend({
    staticInit: function(editor) {
        this.editor = editor;
        this.editor.mode = this;
    },

    init: function() {
        this.editor.changeState('Select');
    },

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

    keyup: function() {}
});

game.bamboo.editor.createMode = function(name, content) {
    game.bamboo.editor['Mode' + name] = game.bamboo.editor.Mode.extend(content);
};

});
