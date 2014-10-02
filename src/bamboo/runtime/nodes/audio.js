game.module(
    'bamboo.runtime.nodes.audio'
)
.require(
    'bamboo.core'
)
.body(function() {

/**
    Audio file, that is played from trigger.
    @class Audio
    @namespace bamboo.Nodes
**/
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

/**
    Audio file.
    @property {Audio} audio
**/
bamboo.addNodeProperty('Audio', 'audio', 'audio');
/**
    Is audio looping.
    @property {Boolean} loop
**/
bamboo.addNodeProperty('Audio', 'loop', 'boolean');

});
