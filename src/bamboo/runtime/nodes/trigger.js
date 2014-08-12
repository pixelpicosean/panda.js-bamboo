game.module(
    'bamboo.runtime.nodes.trigger'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Trigger = bamboo.Node.extend({
    init: function(world, properties) {
        if(this.displayObject === null)
            this.displayObject = new game.Container();
        this._super(world, properties);
    },

    trigger: function(activator) {
        return false;
    },

    hitTest: function(p) {
        return false;
    }
});

bamboo.nodes.Trigger.desc = {};

});
