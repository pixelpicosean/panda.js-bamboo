game.module(
    'bamboo.runtime.nodes.image'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('Image', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) this.displayObject.setTexture(this.image);
        if (name === 'alpha') this.displayObject.alpha = this.alpha;
        if (name === 'anchor') this.displayObject.anchor.set(value.x, value.y);
    }
});

bamboo.setNodeProperties('Image', {
    image: new bamboo.Property(true, 'Image', 'Filename of the image', bamboo.Property.TYPE.IMAGE),
    alpha: new bamboo.Property(true, 'Alpha', 'Opacity of the image', bamboo.Property.TYPE.NUMBER, 1, { min: 0, max: 1 }),
    anchor: new bamboo.Property(false, '', '', bamboo.Property.TYPE.VECTOR)
});

});
