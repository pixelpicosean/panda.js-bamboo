game.module(
    'bamboo.runtime.nodes.audio'
)
.require(
    'bamboo.core'
)
.body(function() {

game.createNode('Audio', {
    trigger: function() {
        this.play();
    },

    play: function() {
        if (this.oneAtTime) this.stop();
        this.audioId = game.audio.playSound(this.audio, !!this.loop);
    },

    stop: function() {
        if (this.audioId) game.audio.stopSound(this.audioId);
    }
});

game.addNodeProperty('Audio', 'audio', 'audio');
game.addNodeProperty('Audio', 'loop', 'boolean');
game.addNodeProperty('Audio', 'oneAtTime', 'boolean');

});
