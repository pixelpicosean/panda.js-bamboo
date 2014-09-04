game.module(
    'game.main'
)
.require(
    'bamboo.core',
    'game.nodes.mynode',
    'game.scenes.main'
)
.body(function() {

bamboo.createScene('Main');

});
