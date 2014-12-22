game.module(
    'bamboo.editor.state'
)
.body(function() {

game.bamboo.editor.State = game.Class.extend({    
    init: function(mode) {
        this.mode = mode;
        this.editor = mode.editor;
    },

    enter: function() {},
    exit: function() {},
    cancel: function() {},

    click: function() {},
    nodeClick: function() {},
    nodeMouseDown: function() {},
    mousedown: function() {},
    mousemove: function() {},
    mouseup: function() {},
    keydown: function() {},
    keyup: function() {}
});

game.bamboo.editor.createState = function(name, content) {
    game.bamboo.editor['State' + name] = game.bamboo.editor.State.extend(content);
};

});
