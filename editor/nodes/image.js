game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

game.addAsset('src/bamboo/editor/media/image_placeholder.png');

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this.super(node);
        if(!node.image)
            this.setProperty('image', 'src/bamboo/editor/media/image_placeholder.png');
    },

    getBounds: function() {
        return {x: 0, y: 0, width: this.node.displayObject.texture.width, height: this.node.displayObject.texture.height };
    },

    propertyChanged: function(key, value, oldValue) {
        if(key === 'image')
            this.sizeChanged();
        this.super(key, value, oldValue);
    }
});

});
