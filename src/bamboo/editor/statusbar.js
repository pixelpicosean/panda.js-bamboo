game.module(
    'bamboo.editor.statusbar'
)
.body(function() {

bamboo.StatusBar = game.Class.extend({
    height: 59,

    init: function() {
        this.windowElem = bamboo.ui.addWindow({
            id: 'status',
            x: 0,
            y: window.innerHeight - this.height - bamboo.ui.menu.height,
            width: 'window',
            height: this.height,
        });
        this.windowElem.show();
        this.windowElem.onResize = this.onResize.bind(this);
    },

    onResize: function() {
        this.windowElem.y = window.innerHeight - this.height;
    },

    setStatus: function(status) {
        this.windowElem.clear();
        this.windowElem.addText(status);
    }
});

});
