game.module(
    'bamboo.runtime.nodes.audio'
)
.require(
    'bamboo.core'
)
.body(function() {
    
bamboo.createNode('Audio', {
    trigger: function() {
        this.play();
    },

    play: function() {
        this.audioId = game.audio.playSound(this.audio, !!this.loop);
    },

    stop: function() {
        if (this.audioId) game.audio.stopSound(this.audioId);
    }
});

bamboo.addNodeProperty('Audio', 'audio', 'audio');
bamboo.addNodeProperty('Audio', 'loop', 'boolean');

});
