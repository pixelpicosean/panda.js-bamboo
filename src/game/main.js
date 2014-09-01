game.module(
    'game.main'
)
.require(
    'bamboo.core'
)
.body(function() {

game.addAsset('game.json');

bamboo.createScene('Game');

game.start();

});
