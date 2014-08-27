game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Layer = bamboo.Node.extend({
    displayObject: true,
    needUpdates: true,

    update: function() {
        this.displayObject.position.x = this.position.x + this.world.cameraPosition.x * -this.speedFactor;
        this.displayObject.position.y = this.position.y + this.world.cameraPosition.y * -this.speedFactor;
    }
});

bamboo.nodes.Layer.props = {
    speedFactor: new bamboo.Property(true, 'Speed', 'Speed relative to camera', bamboo.Property.TYPE.NUMBER, 1)
};

});
