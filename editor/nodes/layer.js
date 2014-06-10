game.module(
    'bamboo.editor.nodes.layer'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

bamboo.nodes.Layer.editor = bamboo.Node.editor.extend({
    _visible: true,

    init: function(node) {
        this._super(node);
    },

    getBounds: function() {
        return {x: 0, y: 0, width: 0, height: 0};
    },

    propertyChanged: function(key, value, oldValue) {
        if(key === 'speedFactor')
            this.node.update(0);
    }
});

Object.defineProperty(bamboo.nodes.Layer.editor.prototype, 'visible', {
    get: function() {
        return this._visible;
    },
    set: function(value) {
        if(this._visible === value)
            return;

        this._visible = value;
        this.node.displayObject.visible = value;
    }
});

});
