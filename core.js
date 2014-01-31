game.module(
    'editor.core',
    '1.0.0'
)
.require(
    'editor.window'
)
.body(function() {

game.Editor = game.Class.extend({
    windows: [],

    init: function() {
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = 'src/editor/style.css';
        style.onload = this.ready.bind(this);
        document.getElementsByTagName('head')[0].appendChild(style);
    },

    ready: function() {
    },

    addWindow: function(x, y, width, height) {
        var obj = new game.Window(x, y, width, height);
        this.windows.push(obj);
        return obj;
    },

    hideAll: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].hide();
        };
    }
});

game.editor = new game.Editor();

game.editor.addWindow(0, 0, 'window', 50).addButton('Test').show();
game.editor.addWindow('center', 120, 400, 110).addTitle('Hello').addText('Hello Panda.js').show();

var test = game.editor.addWindow('center', 'center', 380, 180);
test.addInputText('x', 100);
test.addInputText('y', 200);
test.addInputText('alpha', '1.0');
test.addInputText('rotation', Math.PI);
test.addButton('OK', function() {
    for(var i in this.inputs) {
        console.log(this.inputs[i].name + ': ' + this.inputs[i].value);
    }
    this.hide();
});
test.show();

});