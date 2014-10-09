game.module(
    'bamboo.runtime.nodes.mousetrigger'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    Calls children's trigger function, when trigger is clicked.
    @class Trigger
    @namespace bamboo.Nodes
**/
bamboo.createNode('MouseTrigger', {
    ready: function() {
        this.displayObject.interactive = true;
        this.displayObject.buttonMode = !!this.buttonMode;
        this.displayObject.click = this.displayObject.tap = this.click.bind(this);
        this.displayObject.hitArea = new game.HitRectangle(0, 0, this.size.x, this.size.y);
    },

    click: function() {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].trigger(this);
        }
        if (this.onetime) this.displayObject.interactive = false;
    }
});

/**
    Disable trigger, after clicked.
    @property {Boolean} onetime
**/
bamboo.addNodeProperty('MouseTrigger', 'onetime', 'boolean');
bamboo.addNodeProperty('MouseTrigger', 'buttonMode', 'boolean');

});
