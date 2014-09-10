game.module(
    'bamboo.runtime.nodes.animation'
)
.require(
    'bamboo.core'
)
.body(function() {

bamboo.createNode('Animation', {
    init: function() {
        this.displayObject = new game.Animation([new game.Texture(new game.BaseTexture())]);
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'spritesheet') {
            console.log(value);
            // this.displayObject.setTexture(game.config.mediaFolder + this.image);
        }
    }
});

bamboo.addNodeProperty('Animation', 'spritesheet', 'json');

});
