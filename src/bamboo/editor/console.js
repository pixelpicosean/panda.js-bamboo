game.module(
    'bamboo.editor.console'
)
.body(function() {
    
bamboo.Console = game.Class.extend({
    messages: [],

    init: function() {
        this.consoleWindow = bamboo.ui.addWindow({
            id: 'console',
            resizable: true,
            closeable: true,
            snappable: true
        });
        this.consoleWindow.setTitle('Console');
    },

    log: function(message) {
        this.messages.unshift(message);
        this.update();
    },

    update: function() {
        this.clear();
        for (var i = 0; i < this.messages.length; i++) {
            this.consoleWindow.addText(this.messages[i]);
        }
    },

    clear: function() {
        this.consoleWindow.clear();
    }
});

});
