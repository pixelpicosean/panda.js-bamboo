game.module(
    'bamboo.runtime.nodes.spine'
)
.require(
    'bamboo.core'
)
.body(function() {

game.createNode('Spine', {
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

game.addNodeProperty('Spine', 'spineData', 'json');
game.addNodeProperty('Spine', 'spritesheet', 'json');
game.addNodeProperty('Spine', 'animation', 'string');
game.addNodeProperty('Spine', 'speed', 'number', 1);
game.addNodeProperty('Spine', 'loop', 'boolean', true);
game.addNodeProperty('Spine', 'triggered', 'boolean');

});
