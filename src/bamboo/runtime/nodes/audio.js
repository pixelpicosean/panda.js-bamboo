game.module(
    'bamboo.runtime.nodes.audio'
)
.require(
    'bamboo.core'
)
.body(function() {
    
bamboo.createNode('Audio', {
    trigger: function() {
        game.audio.playSound(this.audio, !!this.loop);
    }
});

bamboo.addNodeProperty('Audio', 'audio', 'audio');
bamboo.addNodeProperty('Audio', 'loop', 'boolean');

});
