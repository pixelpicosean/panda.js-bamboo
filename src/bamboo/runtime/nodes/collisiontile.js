game.module(
    'bamboo.runtime.nodes.collisiontile'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    Tile with physics body.
    @class CollisionTile
    @namespace bamboo.Nodes
**/
bamboo.createNode('CollisionTile', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    ready: function() {
        this.body = new game.Body({
            position: {
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2
            }
        });
        this.body.collisionGroup = this.collisionGroup;

        var shape = new game.Rectangle(this.size.x, this.size.y);
        this.body.addShape(shape);

        this.world.physics.addBody(this.body);
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'frame' && value) this.displayObject.setTexture(game.TextureCache[value]);
    }
});

bamboo.addNodeProperty('CollisionTile', 'frame', 'string', '', true);
/**
    Collision group for tile's physics body.
    @property {Number} collisionGroup
**/
bamboo.addNodeProperty('CollisionTile', 'collisionGroup', 'number', 0);

});
