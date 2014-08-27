game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    getOrigin: function() {
        var a = this.node.anchor;
        return new game.Point(a.x * this.node.displayObject.texture.width, a.y * this.node.displayObject.texture.height);
    },

    setOrigin: function(p) {
        var a = new game.Point(p.x / this.node.displayObject.texture.width, p.y / this.node.displayObject.texture.height);
        this.setProperty('anchor', a);
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
