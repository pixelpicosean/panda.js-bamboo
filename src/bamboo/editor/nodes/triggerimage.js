game.module(
    'bamboo.editor.nodes.triggerimage'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.triggerimage'
)
.body(function() {

game.createEditorNode('TriggerImage', {
    propertyChanged: function(key, value, oldValue) {
        if (key === 'image') {
            this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
        }
        
        this._super(key, value, oldValue);
    }
});

});
