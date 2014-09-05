game.module(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.State = game.Class.extend({
    helpText: '',
    
    init: function(mode) {
        this.mode = mode;
    },

    enter: function() {},
    exit: function() {},
    cancel: function() {},

    click: function() {},
    mousedown: function() {},
    mousemove: function() {},
    mouseup: function() {},
    keydown: function() {},
    keyup: function() {}
});

});
