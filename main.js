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
    
});