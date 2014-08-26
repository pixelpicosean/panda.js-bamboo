game.module(
    'bamboo.editor.states.move'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateMove = bamboo.editor.State.extend({
    helpText: 'Move state: (G)rid, X/Y lock axis, MOUSE apply',
    nodes: [],
    startValues: [],
    snapToGrid: false,

    init: function(mode) {
        this._super(mode);

        for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
            var node = this.mode.editor.selectedNodes[i];
            var found = false;
            // var _parent = n.parent;
            // while (!(_parent instanceof bamboo.nodes.Layer)) {
            //     if (this.mode.editor.selectedNodes.indexOf(_parent) !== -1) {
            //         found = true;
            //         break;
            //     }
            //     _parent = _parent.parent;
            // }
            if (!found) {
                this.nodes.push(node);
                this.startValues.push(node.position.clone());
            }
        }

        this.offset = this.mode.editor.prevMousePos.clone();
    },

    apply: function(event) {
        this.mousemove(event);
        this.mode.editor.changeState('Select');
    },

    cancel: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            node._editorNode.setProperty('position', this.startValues[i]);
        }
    },

    mousemove: function(event) {
        var x = event.global.x;
        var y = event.global.y;

        if (this.snapToGrid) {
            x = Math.round(x / 10) * 10;
            y = Math.round(y / 10) * 10;
        }

        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var newPos = new game.Point(x - this.offset.x + this.startValues[i].x, y - this.offset.y + this.startValues[i].y);
            if (this.lockToAxis === 'X') newPos.y = this.startValues[i].y;
            else if (this.lockToAxis === 'Y') newPos.x = this.startValues[i].x;
            node._editorNode.setProperty('position', newPos);
        }
    },

    keydown: function(key) {
        if (key === 'G') {
            this.snapToGrid = !this.snapToGrid;
            return;
        }
        if (key === 'X') {
            if (this.lockToAxis === 'X') this.lockToAxis = null;
            else this.lockToAxis = 'X';
            return;
        }
        if (key === 'Y') {
            if (this.lockToAxis === 'Y') this.lockToAxis = null;
            else this.lockToAxis = 'Y';
            return;
        }
    }
});

});
