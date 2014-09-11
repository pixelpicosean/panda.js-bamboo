game.module(
    'bamboo.runtime.nodes.spine'
)
.require(
    'bamboo.core'
)
.body(function() {
    
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

bamboo.addNodeProperty('Spine', 'spineData', 'json');
bamboo.addNodeProperty('Spine', 'spritesheet', 'json');
bamboo.addNodeProperty('Spine', 'animation', 'string');
bamboo.addNodeProperty('Spine', 'speed', 'number', 1);
bamboo.addNodeProperty('Spine', 'loop', 'boolean', true);
bamboo.addNodeProperty('Spine', 'triggered', 'boolean');

});
