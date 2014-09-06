game.module(
    'bamboo.runtime.nodes.tile'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('Tile', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'tile' && this.tileset) {
            // Find tile from tileset
            var tile, i = 0;
            for (var key in game.TextureCache) {
                if (game.TextureCache[key].baseTexture.imageUrl.indexOf(this.tileset) !== -1) {
                    if (i === value) {
                        tile = game.TextureCache[key];
                        break;
                    }
                    i++;
                }
            }
            if (tile) this.displayObject.setTexture(tile);
        }
    }
});

bamboo.addNodeProperty('Tile', 'tileset', 'string');
bamboo.addNodeProperty('Tile', 'tile', 'number', 0);

});
