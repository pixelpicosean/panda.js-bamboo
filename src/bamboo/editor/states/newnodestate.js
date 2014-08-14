game.module(
    'bamboo.editor.states.newnodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.NewNodeState = bamboo.editor.State.extend({
    nodes: [],
    startValues: [],

    init: function(mode, nodes) {
        this._super(mode);

        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var found = false;
            var parent = n.connectedTo;
            while (!(parent instanceof bamboo.nodes.Layer)) {
                if (nodes.indexOf(parent) !== -1) {
                    found = true;
                    break;
                }
                parent = parent.connectedTo;
            }
            if (!found) {
                this.startValues.push(n.getWorldPosition());
                this.nodes.push(n);
                this.mode.editor.controller.selectNode(n);
            }
        }

        this.offset = new game.Point();

        this.mode.editor.statusbar.setStatus(this.mode.helpText + '<br>Add node: MOUSE confirm');
    },

    cancel: function() {
        this.mode.editor.controller.deselectAllNodes();
        for (var i = 0; i < this.nodes.length; i++) {
            this.mode.editor.controller.deleteNode(this.nodes[i]);
        }
    },

    mousemove: function(event) {
        var delta = new game.Point(event.global.x - this.offset.x, event.global.y - this.offset.y);

        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(delta.addc(this.startValues[i])));
        }
    },

    keydown: function(key) {
        if (key === 'S') {
            this.offset = new game.Vec2();
            for (var i = 0; i < this.startValues.length; i++) {
                this.offset.add(this.startValues[i]);
            }
            this.offset.x /= this.startValues.length;
            this.offset.y /= this.startValues.length;
            // this.mousemove();
        }
    }
});

});
