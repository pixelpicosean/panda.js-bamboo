game.module(
    'bamboo.editor.states.move'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateMove = bamboo.editor.State.extend({
    helpText: 'Move state: X/Y lock axis, MOUSE apply',
    nodes: [],
    startValues: [],

    enter: function() {
        for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
            var node = this.mode.editor.selectedNodes[i];
            this.nodes.push(node);
            this.startValues.push(node.position.clone());
        }

        this.offset = this.mode.editor.prevMousePos.clone();
        this.offset.x += this.mode.editor.camera.position.x;
        this.offset.y += this.mode.editor.camera.position.y;

        document.body.style.cursor = 'move';
    },

    exit: function() {
        document.body.style.cursor = 'default';
    },

    cancel: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            node._editorNode.setProperty('position', this.startValues[i]);
        }
    },

    click: function(event) {
        this.mode.editor.changeState('Select');
    },

    keydown: function(key) {
        if (key === 'X') {
            if (this.lockToAxis === 'X') this.lockToAxis = null;
            else this.lockToAxis = 'X';
        }
        else if (key === 'Y') {
            if (this.lockToAxis === 'Y') this.lockToAxis = null;
            else this.lockToAxis = 'Y';
        }
    },

    mousemove: function(event) {
        var x = event.global.x;
        var y = event.global.y;
        this.update(x, y);
    },

    update: function(x, y) {
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var newPos = new game.Point(x - this.offset.x + this.startValues[i].x, y - this.offset.y + this.startValues[i].y);

            newPos.x += this.mode.editor.camera.position.x;
            newPos.y += this.mode.editor.camera.position.y;

            if (this.lockToAxis === 'X') newPos.y = this.startValues[i].y;
            else if (this.lockToAxis === 'Y') newPos.x = this.startValues[i].x;

            if (this.mode.editor.gridSize > 0) {
                newPos.x = Math.round(newPos.x / this.mode.editor.gridSize) * this.mode.editor.gridSize;
                newPos.y = Math.round(newPos.y / this.mode.editor.gridSize) * this.mode.editor.gridSize;
            }

            node._editorNode.setProperty('position', newPos);
        }
    }
});

});
