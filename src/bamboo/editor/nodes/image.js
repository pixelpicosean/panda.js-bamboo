game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

game.createEditorNode('Image', {
    propertyChanged: function(key, value, oldValue) {
        this._super(key, value, oldValue);

        if (key === 'image') {
            this.setProperty('size', new game.Point(this.node.displayObject.texture.width, this.node.displayObject.texture.height));
        }
        if (key === 'size' && this.node.image) {
            this.node.displayObject.width = this.node.flipX ? -value.x : value.x;
            this.node.displayObject.height = this.node.flipY ? -value.y : value.y;
        }
    },

    keydown: function(key) {
        if (key === 'R') {
            this.setProperty('size', new game.Point(this.node.displayObject.texture.width, this.node.displayObject.texture.height));
        }
        if (key === 'D') {
            this.setProperty('size', new game.Point(this.node.displayObject.texture.width * 2, this.node.displayObject.texture.height * 2));
        }
    }
});

});
