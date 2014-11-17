game.module(
    'bamboo.editor.nodes.spine'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.spine'
)
.body(function() {
'use strict';

game.bamboo.nodes.Spine.editor = game.bamboo.Node.editor.extend({
    setProperty: function(property, value) {
        if (property === 'animation' && this.node.spineObject) {
            if (this.node.spineObject.parent) {
                this.node.spineObject.parent.removeChild(this.node.spineObject);
            }
        }
        this._super(property, value);
    },

    propertyChanged: function(key, value, oldValue) {
        this._super(key, value, oldValue);
    },

    start: function() {
        this.node.play();
    },

    stop: function() {
        this.node.spineObject.state.clearAnimation();
    }
});

});
