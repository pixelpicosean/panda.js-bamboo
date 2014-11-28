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

/**
    Audio file.
    @property {Audio} audio
**/
game.addNodeProperty('Audio', 'audio', 'audio');
/**
    Is audio looping.
    @property {Boolean} loop
**/
game.addNodeProperty('Audio', 'loop', 'boolean');
/**
    Should stop previous sound, before playing new.
    @property {Boolean} oneAtTime
**/
game.addNodeProperty('Audio', 'oneAtTime', 'boolean');

});
