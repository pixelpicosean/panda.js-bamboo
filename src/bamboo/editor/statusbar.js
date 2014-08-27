game.module(
    'bamboo.editor.statusbar'
)
.body(function() {

bamboo.StatusBar = game.Class.extend({
    height: 50,

    init: function() {
        this.windowElem = bamboo.ui.addWindow(0, this.height, 'window', this.height, 'bottom');
        this.windowElem.show();
    },

    setStatus: function(status) {
        this.windowElem.clear();
        this.windowElem.addText(status);
    }
});

});
