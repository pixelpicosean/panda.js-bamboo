game.module(
    'bamboo.runtime.nodes.image'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    Basic image node.
    @class Image
    @namespace bamboo.Nodes
**/
bamboo.createNode('Image', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) {
            var path = this.image;
            if (game.config.mediaFolder) path = game.config.mediaFolder + '/' + path;
            this.displayObject.setTexture(path);
            this.displayObject.width = this.size.x;
            this.displayObject.height = this.size.y;
        }
        else if (name === 'alpha') this.displayObject.alpha = this.alpha;
        else if (name === 'flipX') {
            this.displayObject.width = value ? -this.size.x : this.size.x;
        }
        else if (name === 'flipY') {
            this.displayObject.height = value ? -this.size.y : this.size.y;
        }
        else if (name === 'anchor') this.displayObject.anchor.set(value.x, value.y);
    }
});

/**
    @property {Image} image
**/
bamboo.addNodeProperty('Image', 'image', 'image');
/**
    @property {Number} alpha
    @default 1
**/
bamboo.addNodeProperty('Image', 'alpha', 'number', 1);
/**
    @property {Boolean} flipX
**/
bamboo.addNodeProperty('Image', 'flipX', 'boolean');
/**
    @property {Boolean} flipY
**/
bamboo.addNodeProperty('Image', 'flipY', 'boolean');

});
