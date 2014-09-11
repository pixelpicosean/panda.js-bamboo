game.module(
    'bamboo.runtime.nodes.tile'
)
.require(
    'bamboo.core',
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
            var i = 0;
            var json = game.json[game.config.mediaFolder + this.tileset];

            for (var key in json.frames) {
                if (i === value) {
                    this.displayObject.setTexture(game.TextureCache[key]);
                    break;
                }
                i++;
            }
        }
    }
});

bamboo.addNodeProperty('Tile', 'tileset', 'json');
bamboo.addNodeProperty('Tile', 'tile', 'number', 0);

});
