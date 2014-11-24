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
        if (this.oneAtTime) this.stop();
        this.audioId = game.audio.playSound(this.audio, !!this.loop);
    },

    stop: function() {
        if (typeof this.audioId === 'number') game.audio.stopSound(this.audioId);
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
/**
    Should stop previous sound, before playing new.
    @property {Boolean} oneAtTime
**/
bamboo.addNodeProperty('Audio', 'oneAtTime', 'boolean');

});
