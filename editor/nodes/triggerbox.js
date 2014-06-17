game.module(
    'bamboo.editor.nodes.triggerbox'
)
.require(
    'bamboo.editor.nodes.manualtrigger',
    'bamboo.runtime.nodes.triggerbox'
)
.body(function() {

bamboo.nodes.TriggerBox.editor = bamboo.nodes.ManualTrigger.editor.extend({
    box: null,
    color: 0xffaa00,

    init: function(node) {
        this._super(node);
        this.box = new game.Graphics();
        this.box.beginFill(this.color, 0.8);
        this.box.drawRect(-1,-1,2,2);
        this.box.scale = this.node.scale;
        this.debugDisplayObject.addChild(this.box);
    },

    sizeChanged: function() {
        this.box.scale = this.node.scale;
        this._super();
    }
});

});
