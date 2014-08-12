game.module(
    'bamboo.editor.nodes.manualtrigger'
)
.require(
    'bamboo.editor.nodes.trigger',
    'bamboo.runtime.nodes.manualtrigger'
)
.body(function() {

bamboo.nodes.ManualTrigger.editor = bamboo.nodes.Trigger.editor.extend({
    init: function(node) {
        this._super(node);
    }
});

});
