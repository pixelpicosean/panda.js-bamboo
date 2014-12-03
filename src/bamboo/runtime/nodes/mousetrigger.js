game.module(
    'bamboo.runtime.nodes.mousetrigger'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

game.createNode('MouseTrigger', {
    ready: function() {
        this.displayObject.interactive = true;
        this.displayObject.buttonMode = !!this.buttonMode;
        if (this.useMouseDown) {
            this.displayObject.mousedown = this.displayObject.touchstart = this.click.bind(this);
        }
        else {
            this.displayObject.click = this.displayObject.tap = this.click.bind(this);
        }
        this.displayObject.hitArea = new game.HitRectangle(0, 0, this.size.x, this.size.y);
    },

    click: function() {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].trigger(this);
        }
        if (this.onetime) this.displayObject.interactive = false;
    }
});

// game.addNodeProperty('MouseTrigger', 'onetime', 'boolean');
// game.addNodeProperty('MouseTrigger', 'buttonMode', 'boolean');
// game.addNodeProperty('MouseTrigger', 'useMouseDown', 'boolean');

});
