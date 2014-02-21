game.module(
    'bamboo.editor.statusbar'
)
.require(
    'bamboo.editor.ui'
)
.body(function() {

bamboo.StatusBar = game.Class.extend({
    window: null,

    init: function() {
        this.window = new bamboo.UiWindow(0,game.system.height, 'window',40);
        this.window.show();
    }

});

});
