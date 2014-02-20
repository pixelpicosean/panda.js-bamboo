game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this.super(node);
    },

    getBounds: function() {
        return {x: 0, y: 0, width: this.node.displayObject.width, height: this.node.displayObject.height };
    },

    propertyChanged: function(key) {
        if(key === 'image')
            this.sizeChanged();
    }
});

});
