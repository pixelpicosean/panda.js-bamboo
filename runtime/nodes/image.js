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
        this.displayObject = new game.Sprite(0,0, new PIXI.Texture(new PIXI.BaseTexture()));
        this.super(world, properties);
    },
});

Object.defineProperty(bamboo.nodes.Image.prototype, 'image', {
    get: function() {
        return this._image;
    },
    set: function(value) {
        this._image = value;
        this.displayObject.setTexture(PIXI.Texture.fromFrame(this._image));
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


bamboo.nodes.Image.desc = {
    image: new bamboo.Property(true, 'Image', 'Filename of the image', bamboo.Property.TYPE.FILE),
    tint: new bamboo.Property(true, 'Tint', 'Color tint value', bamboo.Property.TYPE.COLOR),
    opacity: new bamboo.Property(true, 'Opacity', 'Opacity of the image', bamboo.Property.TYPE.NUMBER, {min:0,max:1})
};

});
