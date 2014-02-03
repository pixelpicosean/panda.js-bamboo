game.module(
    'editor.core'
)
.require(
    'engine.system',
    'engine.debug'
)
.body(function() {

game.Editor = game.Class.extend({
    windows: [],

    init: function() {
        document.body.className = 'notready';
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = 'src/editor/style.css';
        style.onload = this.ready.bind(this);
        document.getElementsByTagName('head')[0].appendChild(style);
    },

    ready: function() {
        document.body.className = '';
    },

    addWindow: function(x, y, width, height) {
        var obj = new game.Editor.Window(x, y, width, height);
        this.windows.push(obj);
        return obj;
    },

    hideAll: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].hide();
        };
    }
});

game.Editor.mediaFolder = 'src/editor/media/';

game.Debug.position.desktop = game.Debug.POSITION.TOPRIGHT;
game.System.resize = false;
game.System.center = false;
game.System.left = 54;
game.System.top = 0;

// EXAMPLE
// game.editor = new game.Editor();

// game.editor.addWindow(0, 0, 54, 'window')
//     .addImageButton('src/editor/media/cursor.png')
//     .addImageButton('src/editor/media/pencil.png')
//     .addImageButton('src/editor/media/play.png')
//     .addImageButton('src/editor/media/gear.png')
//     .show();

// game.editor.addWindow(54+1024, 250, 200, 672-250).addTitle('Objects').show();
// game.editor.addWindow(54+1024, 0, 200, 250).addTitle('Layers').show();

// var test = game.editor.addWindow('center', 'center', 380, 180);
// test.addInputText('x', 100);
// test.addInputText('y', 200);
// test.addInputText('alpha', '1.0');
// test.addInputText('rotation', Math.PI);
// test.addButton('OK', function() {
//     for(var i in this.inputs) {
//         console.log(this.inputs[i].name + ': ' + this.inputs[i].value);
//     }
//     this.hide();
// });
// test.show();

});