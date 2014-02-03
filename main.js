game.module(
    'editor.main',
    '1.0.0'
)
.require(
    'editor.core',
    'editor.window'
)
.body(function() {

game.editor = new game.Editor();

game.editor.addWindow(0, 0, 54, 'window')
    .addImageButton('cursor.png')
    .addImageButton('pencil.png')
    .addImageButton('play.png')
    .addImageButton('gear.png')
    .show();
    
});