game.module(
    'bamboo.runtime.nodes.rotator'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Rotator = bamboo.Node.extend({
    initialAngle: 0,
    angleVelocity: 0,

    init: function(world, properties) {
        this.displayObject = new game.Container();
        this.super(world, properties);
        this.needUpdates = true;
    },

    update: function(worldTime) {
        // TODO: add easings
        this.rotation = this.initialAngle + this.angleVelocity*worldTime;
    }
});

bamboo.nodes.Rotator.desc = {
    initialAngle: new bamboo.Property(true, 'Starting angle', bamboo.Property.TYPE.NUMBER),
    angleVelocity: new bamboo.Property(true, 'Angle velocity (can be negative)', bamboo.Property.TYPE.NUMBER)
};

});
