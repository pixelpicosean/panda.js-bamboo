game.module(
    'bamboo.editor.state'
)
.require(
)
.body(function() {

bamboo.editor.State = game.Class.extend({
    mode: null,

    init: function(mode) {
        this.mode = mode;
    },

    cancel: function() {
    },

    apply: function() {
    },

    onmousemove: function(p) {
    },

    onkeydown: function(keycode, p) {
    },
    
    onkeyup: function(keycode, p) {
    }
});

});
