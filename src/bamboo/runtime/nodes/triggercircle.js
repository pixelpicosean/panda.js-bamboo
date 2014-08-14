game.module(
    'bamboo.runtime.nodes.triggercircle'
)
.require(
    'bamboo.runtime.nodes.manualtrigger'
)
.body(function() {

bamboo.nodes.TriggerCircle = bamboo.nodes.ManualTrigger.extend({
    hitTest: function(p) {
        return p.length() < 1;
    }
});

bamboo.nodes.TriggerCircle.props = {};

});
