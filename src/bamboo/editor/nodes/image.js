game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    propertyChanged: function(key, value, oldValue) {
        if (key === 'image') {
            this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
        }
        
        this._super(key, value, oldValue);
    }
});

});
