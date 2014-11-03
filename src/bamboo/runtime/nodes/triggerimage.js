game.module(
    'bamboo.runtime.nodes.triggerimage'
)
.require(
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

/**
    Trigger that uses image.
    @class TriggerImage
    @namespace bamboo.Nodes
**/
bamboo.createNode('TriggerImage', 'Trigger', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) {
            var path = this.image;
            if (game.config.mediaFolder) path = game.config.mediaFolder + '/' + path;
            this.displayObject.setTexture(path);
        }
    }
});

bamboo.addNodeProperty('TriggerImage', 'image', 'image');

});
