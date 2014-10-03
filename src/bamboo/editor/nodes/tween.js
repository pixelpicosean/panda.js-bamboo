game.module(
    'bamboo.editor.nodes.tween'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.tween'
)
.body(function() {

bamboo.nodes.Tween.editor = bamboo.Node.editor.extend({
    tweenData: {},

    enableEditMode: function(enabled) {
        if (enabled) {
            // Save tween data
            this.node.tweenData.position = this.node.parent.position.clone();
            this.node.tweenData.size = this.node.parent.size.clone();

            this.editor.changeMode('Main');
            this.editor.controller.setActiveNode(this.node.parent);
            this.editor.setTempMessage('Tween saved');
        }
    },

    start: function() {
        this.node.tweens.length = 0;
        this.tweenData.position = this.node.parent.position.clone();
        this.tweenData.size = this.node.parent.size.clone();
        this.node.start();
    },

    stop: function() {
        for (var i = 0; i < this.node.tweens.length; i++) {
            this.node.tweens[i].stop();
        }
        this.node.parent._editorNode.setProperty('position', this.tweenData.position);
        this.node.parent._editorNode.setProperty('size', this.tweenData.size);
    }
});

});
