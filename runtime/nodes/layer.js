game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Layer = bamboo.Node.extend({
    speedFactor: 1,

    init: function(world, properties) {
        this.displayObject = new game.Container();
        this.super(world, properties);
        this.needUpdates = true;
    },

    update: function() {
         this.position = this.world.cameraPosition.clone().multiply(-this.speedFactor);
    },
});

bamboo.nodes.Layer.desc = {
    speedFactor: new bamboo.Property(true, 'Parallax multipliel', 'Speed relative to camera', bamboo.Property.TYPE.NUMBER)
};

});
