window.bamboo = window.bamboo || {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.runtime.core',
    'bamboo.editor.ui',
    'bamboo.editor.object'
)
.body(function() {

bamboo.start = function() {
    game.Debug.position.desktop = game.Debug.POSITION.TOPRIGHT;
    game.System.resize = false;
    game.System.center = false;
    game.System.left = 54;
    game.System.top = 0;

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    this.ui = new bamboo.Ui();
};

});