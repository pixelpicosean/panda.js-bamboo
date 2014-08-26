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
    click: function() {},
    mousedown: function() {},
    mousemove: function() {},
    mouseup: function() {},
    keydown: function() {},
    keyup: function() {}
});

});
