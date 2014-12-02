game.module(
    'bamboo.editor.nodes.tween'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.tween'
)
.body(function() {

game.createEditorNode('Tween', {
    tweenStartData: {},
    tweenData: {},

    propertyChanged: function(property, value, oldValue) {
        this._super(property, value, oldValue);
        if (property === 'parent') {
            if (oldValue) oldValue._editorNode.removePropertyChangeListener(this.updateTweenValues.bind(this));
            value._editorNode.addPropertyChangeListener(this.updateTweenValues.bind(this));
        }
    },

    updateTweenValues: function(property, value, oldValue) {
        if (property === 'position' && this.tweenData.position) {
            this.node.tweenData.position.x = value.x - this.tweenData.position.x;
            this.node.tweenData.position.y = value.y - this.tweenData.position.y;
        }
        if (property === 'size' && this.tweenData.size) {
            this.node.tweenData.size.x = value.x - this.tweenData.size.x;
            this.node.tweenData.size.y = value.y - this.tweenData.size.y;
        }
    },

    enableEditMode: function(enabled) {
        if (enabled) {
            this.tweenData.position = this.node.parent.position.clone();
            this.tweenData.size = this.node.parent.size.clone();
            this.node.tweenData.position = new game.Point();
            this.node.tweenData.size = new game.Point();

            this.editor.changeMode('Main');
            this.editor.controller.setActiveNode(this.node.parent);
            this.editor.setTempMessage('Tween saved');
        }
    },

    start: function() {
        this.node.tweens.length = 0;
        this.tweenStartData.position = this.node.parent.position.clone();
        this.tweenStartData.size = this.node.parent.size.clone();
        this.node.start();
    },

    stop: function() {
        for (var i = 0; i < this.node.tweens.length; i++) {
            this.node.tweens[i].stop();
        }
        this.node.parent.displayObject.position.set(this.tweenStartData.position.x, this.tweenStartData.position.y);
        this.node.parent.displayObject.width = this.tweenStartData.size.x;
        this.node.parent.displayObject.height = this.tweenStartData.size.y;
    }
});

});
