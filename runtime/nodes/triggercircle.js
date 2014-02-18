game.module(
    'bamboo.runtime.nodes.triggercircle'
)
.require(
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

bamboo.nodes.TriggerCircle = bamboo.nodes.Trigger.extend({
    hitTest: function(p) {
        return p.length() < 1;
    }
});

bamboo.nodes.TriggerCircle.desc = {
};

});
