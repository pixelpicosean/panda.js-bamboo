game.module(
    'bamboo.editor.nodes.spritesheet'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.spritesheet'
)
.body(function() {

game.createEditorNode('SpriteSheet', {
    customProperties: {
        spriteSheet: game.Property.spriteSheet
    },

    setProperty: function(property, value) {
        if (property === 'spriteSheet') {
            console.log('TODO');
        }
        else this._super(property, value);
    },

    initDisplayObject: function() {
        if (!this.node._properties.sprite) this.node.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture));
        else this.node.initDisplayObject();
    }
});

});
