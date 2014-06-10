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
        this._super(world, properties);
        this.needUpdates = true;
    },

    update: function() {
         this.position = this.world.cameraPosition.multiplyc(-this.speedFactor);
    },

    toJSON: function() {
        var o = this._super();
        o.properties.position.x = 0;
        o.properties.position.y = 0;
        return o;
    }
});

bamboo.nodes.Layer.desc = {
    speedFactor: new bamboo.Property(true, 'Parallax multipliel', 'Speed relative to camera', bamboo.Property.TYPE.NUMBER)
};

});
