game.module(
    'bamboo.runtime.nodes.triggerbox'
)
.require(
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

bamboo.nodes.TriggerBox = bamboo.nodes.Trigger.extend({
    hitTest: function(p) {
        return (p.x > -1 && p.x < 1 &&
                p.y > -1 && p.y < 1);
    }
});

bamboo.nodes.TriggerBox.desc = {
};

});
