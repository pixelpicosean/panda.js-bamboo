game.module(
    'bamboo.runtime.nodes.tile'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

game.createNode('Tile', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'frame' && value) this.displayObject.setTexture(game.TextureCache[value]);
    }
});

game.addNodeProperty('Tile', 'frame', 'string', '', true);

});
