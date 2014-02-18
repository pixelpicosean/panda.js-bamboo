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

bamboo.nodes.Image.desc = {
    image: new bamboo.Property(true, 'Filename of the image', bamboo.Property.TYPE.FILE)
};

});
