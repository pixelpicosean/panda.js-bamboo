game.module(
    'bamboo.editor.console'
)
.body(function() {
    
game.bamboo.Console = game.Class.extend({
    messages: [],

    init: function() {
        this.consoleWindow = game.bamboo.ui.addWindow({
            id: 'console',
            resizable: true,
            closeable: true,
            snappable: true
        });
        this.consoleWindow.setTitle('Console');
    },

    log: function(message) {
        this.messages.unshift(this.getTime() + ' - ' + message);
        this.update();
    },

    getTime: function() {
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();

        if (hours === 0) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
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
