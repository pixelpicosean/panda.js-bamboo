game.module(
    'bamboo.runtime.nodes.image'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('Image', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) this.displayObject.setTexture(game.config.mediaFolder + this.image);
        else if (name === 'alpha') this.displayObject.alpha = this.alpha;
        else if (name === 'flipX') this.displayObject.scale.x = value ? -1 : 1;
        else if (name === 'flipY') this.displayObject.scale.y = value ? -1 : 1;
        else if (name === 'anchor') this.displayObject.anchor.set(value.x, value.y);
    }
});

bamboo.addNodeProperty('Image', 'image', 'image');
bamboo.addNodeProperty('Image', 'alpha', 'number', 1);
bamboo.addNodeProperty('Image', 'anchor', 'vector');
bamboo.addNodeProperty('Image', 'flipX', 'boolean');
bamboo.addNodeProperty('Image', 'flipY', 'boolean');

});
