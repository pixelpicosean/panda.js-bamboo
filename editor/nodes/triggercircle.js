game.module(
    'bamboo.editor.nodes.triggercircle'
)
.require(
    'bamboo.editor.nodes.trigger',
    'bamboo.runtime.nodes.triggercircle'
)
.body(function() {

bamboo.nodes.TriggerCircle.editor = bamboo.nodes.Trigger.editor.extend({
    circle: null,
    color: 0xffaa00,

    init: function(node) {
        this._super(node);
        this.circle = new game.Graphics();
        this.circle.beginFill(this.color, 0.8);
        this.circle.drawCircle(0,0,1);
        this.circle.scale = this.node.scale;
        this.debugDisplayObject.addChild(this.circle);
    },

    sizeChanged: function() {
        this.circle.scale = this.node.scale;
        this._super();
    }
});

});
