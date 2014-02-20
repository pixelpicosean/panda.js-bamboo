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
        this.window = bamboo.ui.addWindow(0,game.system.height-40, 'window',40);
        this.window.show();
    }

});

});