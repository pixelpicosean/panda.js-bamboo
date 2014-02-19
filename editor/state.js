game.module(
    'bamboo.editor.state'
)
.require(
)
.body(function() {

bamboo.editor.State = game.Class.extend({
    editor: null,

    init: function(editor) {
        this.editor = editor;
    },

    cancel: function() {
    },

    apply: function() {
    },

    onmousemove: function(p) {
    },
    onkeydown: function(keycode) {
    },
    onkeyup: function(keycode) {
    }
});

});
