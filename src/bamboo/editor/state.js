game.module(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.State = game.Class.extend({
    helpText: '',
    
    init: function(mode) {
        this.mode = mode;
    },

    apply: function() {},
    cancel: function() {},
    keydown: function() {},
    keyup: function() {},
    mousemove: function() {}
});

});
