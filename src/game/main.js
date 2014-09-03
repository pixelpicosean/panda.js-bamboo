game.module(
    'game.main'
)
.require(
    'bamboo.core',
    'game.scenes.main'
)
.body(function() {

bamboo.createScene('Main');

});
