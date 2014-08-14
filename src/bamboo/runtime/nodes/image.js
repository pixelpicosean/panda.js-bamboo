game.module(
    'bamboo.runtime.nodes.image'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Image = bamboo.Node.extend({
    _image: null,

    init: function(world, properties) {
        this.displayObject = new game.Sprite(new game.PIXI.Texture(new game.PIXI.BaseTexture()), 0,0);
        this._super(world, properties);
    }
});

Object.defineProperty(bamboo.nodes.Image.prototype, 'image', {
    get: function() {
        return this._image;
    },
    set: function(value) {
        this._image = value;
        this.displayObject.setTexture(this._image);
    }
});

Object.defineProperty(bamboo.nodes.Image.prototype, 'anchor', {
    get: function() {
        return this.displayObject.anchor;
    },
    set: function(value) {
        this.displayObject.anchor = value;
    }
});

Object.defineProperty(bamboo.nodes.Image.prototype, 'tint', {
    get: function() {
        return this.displayObject.tint;
    },
    set: function(value) {
        this.displayObject.tint = value;
    }
});

Object.defineProperty(bamboo.nodes.Image.prototype, 'opacity', {
    get: function() {
        return this.displayObject.alpha;
    },
    set: function(value) {
        this.displayObject.alpha = value;
    }
});

bamboo.nodes.Image.props = {
    image: new bamboo.Property(true, 'Image', 'Filename of the image', bamboo.Property.TYPE.IMAGE),
    tint: new bamboo.Property(true, 'Tint', 'Color tint value', bamboo.Property.TYPE.COLOR),
    opacity: new bamboo.Property(true, 'Opacity', 'Opacity of the image', bamboo.Property.TYPE.NUMBER, { min: 0, max: 1 }),
    anchor: new bamboo.Property(false, '', '', bamboo.Property.TYPE.VECTOR)
};

});
