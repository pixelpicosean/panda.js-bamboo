game.module(
    'bamboo.runtime.nodes.trigger'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    Calls targets trigger function, when activator touches trigger.
    @class Trigger
    @namespace bamboo.Nodes
**/
bamboo.createNode('Trigger', {
    activated: false,

    /**
        @method hitTest
        @return {Boolean}
    **/
    hitTest: function() {
        var result = false;
        if (this.activator) {
            var targetPos = this.activator.getWorldPosition();
            targetPos.x -= this.activator.size.x * this.activator.anchor.x;
            targetPos.y -= this.activator.size.y * this.activator.anchor.y;

            var thisPos = this.getWorldPosition();
            thisPos.x -= this.size.x * this.anchor.x;
            thisPos.y -= this.size.y * this.anchor.y;

            if (targetPos.x + this.activator.size.x >= thisPos.x &&
                targetPos.x <= thisPos.x + this.size.x &&
                targetPos.y + this.activator.size.y >= thisPos.y &&
                targetPos.y <= thisPos.y + this.size.y) {
                result = true;
            }

            bamboo.pool.put(targetPos);
            bamboo.pool.put(thisPos);
        }
        return result;
    },

    update: function() {
        if (this.activator && this.target) {
            if (this.hitTest()) {
                if (!this.activated) {
                    if (typeof this.target.trigger === 'function') {
                        this.target.trigger(this);
                        if (this.onetime) this.target = null;
                    }
                }
                this.activated = true;
            }
            else this.activated = false;
        }
    }
});

/**
    @property {Node} activator
**/
bamboo.addNodeProperty('Trigger', 'activator', 'node');
/**
    @property {Node} target
**/
bamboo.addNodeProperty('Trigger', 'target', 'node');
/**
    Disable trigger, after activated.
    @property {Boolean} onetime
**/
bamboo.addNodeProperty('Trigger', 'onetime', 'boolean');

});
