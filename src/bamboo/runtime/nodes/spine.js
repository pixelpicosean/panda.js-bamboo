game.module(
    'bamboo.runtime.nodes.spine'
)
.require(
    'bamboo.core'
)
.body(function() {

/**
    Spine animation.
    @class Spine
    @namespace bamboo.Nodes
**/
bamboo.createNode('Spine', {
    ready: function() {
        if (!this.triggered) this.play();
    },

    play: function() {
        this.spineObject.state.animationSpeed = this.speed;
        this.spineObject.state.setAnimationByName(this.animation, !!this.loop);
    },

    trigger: function() {
        this.play();
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'animation' && this.spineData && this.spritesheet) {
            this.spineObject = new game.Spine(this.spineData);
            this.displayObject.addChild(this.spineObject);
        }
    }
});

/**
    Spine animation data.
    @property {JSON} spineData
**/
bamboo.addNodeProperty('Spine', 'spineData', 'json');
/**
    Spritesheet for animation.
    @property {JSON} spritesheet
**/
bamboo.addNodeProperty('Spine', 'spritesheet', 'json');
/**
    Name of animation.
    @property {String} animation
**/
bamboo.addNodeProperty('Spine', 'animation', 'string');
/**
    Speed of animation.
    @property {Number} speed
    @default 1
**/
bamboo.addNodeProperty('Spine', 'speed', 'number', 1);
/**
    Is animation looping.
    @property {Boolean} loop
    @default true
**/
bamboo.addNodeProperty('Spine', 'loop', 'boolean', true);
/**
    Is animation started from trigger.
    @property {Boolean} triggered
**/
bamboo.addNodeProperty('Spine', 'triggered', 'boolean');

});
