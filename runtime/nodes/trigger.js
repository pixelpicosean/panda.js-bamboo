game.module(
    'bamboo.runtime.nodes.trigger'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Trigger = bamboo.Node.extend({
    target: null,

    init: function(world, properties) {
        this.displayObject = new game.Container();
        this.super(world, properties);
    },

    hitTest: function(p) {
        return false;
    }
});
bamboo.nodes.Trigger.desc = {
    target: new bamboo.Property(true, 'Target', 'Target', bamboo.Property.TYPE.TRIGGER)
};

});
