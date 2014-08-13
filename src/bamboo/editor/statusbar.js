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
    height: 50,

    init: function() {
        this.window = bamboo.ui.addWindow(80, game.system.height - this.height, game.system.width - 80, this.height);
        this.window.show();

        this.saveWindow = bamboo.ui.addWindow(0, game.system.height - this.height, 80, this.height);
        this.saveWindow.addButton('Save', function() {
            game.scene.save();
        });
        this.saveWindow.show();
    },

    setStatus: function(status) {
        this.window.clear();
        this.window.addText(status);
    }
});

});
