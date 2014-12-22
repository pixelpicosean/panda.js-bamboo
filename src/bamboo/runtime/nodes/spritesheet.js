game.module(
    'bamboo.runtime.nodes.spritesheet'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

game.createNode('SpriteSheet', {
    _sprite: '',

    initDisplayObject: function() {
        this.displayObject = new game.Sprite(this._sprite);
    }
});

});
