game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    enableEditMode: function(enabled) {
        console.log('kukkuu');
        console.log(enabled);
    },

    propertyChanged: function(key, value, oldValue) {
        if (key === 'image') {
            this.node.displayObject.setTexture(value);
            this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
            // this.sizeChanged();
        }
        if (key === 'anchor') this.updateRect();
        
        this._super(key, value, oldValue);
    }
});

});
