game.module(
    'bamboo.editor.nodes.animation'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.animation'
)
.body(function() {
'use strict';

game.createEditorNode('Animation', {
    ready: function() {
        this._super();
        this.node.displayObject.gotoAndStop(0);
    },

    propertyChanged: function(key, value, oldValue) {
        if (key === 'spritesheet') {
            this.node.displayObject.gotoAndStop(0);
            this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
        }
        if (key === 'frameCount' || key === 'startFrame') {
            if (this.node.spritesheet) this.setProperty('spritesheet', this.node.spritesheet);
        }

        this._super(key, value, oldValue);
    },

    start: function() {
        this.node.displayObject.gotoAndPlay(0);
    },

    stop: function() {
        this.node.displayObject.gotoAndStop(0);
    }
});

});
