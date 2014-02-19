game.module(
    'bamboo.editor.nodes.triggerbox'
)
.require(
    'bamboo.editor.nodes.trigger',
    'bamboo.runtime.nodes.triggerbox'
)
.body(function() {

bamboo.nodes.TriggerBox.editor = bamboo.nodes.Trigger.editor.extend({
    box: null,
    init: function(node) {
        this.super(node);
        this.box = new game.Graphics();
        this.box.beginFill(0xffaa00, 0.8);
        this.box.drawRect(-1,-1,2,2);
        this.box.scale = this.node.scale;
        this.displayObject.addChild(this.box);
    },

    sizeChanged: function() {
        this.box.scale = this.node.scale;
        this.super();
    }
});

});
