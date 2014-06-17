game.module(
    'bamboo.editor.statusbar'
)
.require(
    'bamboo.editor.ui'
)
.body(function() {

bamboo.StatusBar = game.Class.extend({
    window: null,
    saveWindow: null,

    init: function() {
        this.window = new bamboo.UiWindow(80, game.system.height, game.system.width-80, 40);
        this.window.show();

        this.saveWindow = new bamboo.UiWindow(0,game.system.height, 80, 40);
        this.saveWindow.addButton('Save', function() { game.scene.save(); });
        this.saveWindow.show();
    },

    setStatus: function(status) {
        this.window.clear();
        this.window.addText(status);
    }

});


});
