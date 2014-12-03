game.module(
    'bamboo.runtime.nodes.image'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

game.createNode('Image', {
    flipX: false,
    flipY: false,
    alpha: 1,

    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) {
            this.displayObject.setTexture(game.getMediaPath(this.image));
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

});
