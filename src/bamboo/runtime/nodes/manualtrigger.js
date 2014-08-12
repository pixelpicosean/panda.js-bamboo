game.module(
    'bamboo.runtime.nodes.manualtrigger'
)
.require(
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

bamboo.nodes.ManualTrigger = bamboo.nodes.Trigger.extend({
    target: null,

    init: function(world, properties) {
        if(this.displayObject === null)
            this.displayObject = new game.Container();
        this._super(world, properties);
        this.displayObject.updateTransform();
    },

    trigger: function(activator) {
        if(this.target) {
            this.world.triggers[this.target](this, activator);
        }
    },
});

bamboo.nodes.ManualTrigger.desc = {
    target: new bamboo.Property(true, 'Target', 'Target', bamboo.Property.TYPE.TRIGGER)
};

});
