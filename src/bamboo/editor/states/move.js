game.module(
    'bamboo.editor.states.move'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

game.bamboo.editor.createState('Move', {
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
        this.offset.x /= this.mode.editor.camera.zoom;
        this.offset.y /= this.mode.editor.camera.zoom;

        document.body.style.cursor = 'move';
        document.body.style.pointerEvents = 'none';
    },

    exit: function() {
        document.body.style.cursor = 'default';
        document.body.style.pointerEvents = 'auto';
    },

    cancel: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            node.editorNode.setProperty('position', this.startValues[i]);
        }
    },

    click: function(event) {
        this.mode.editor.changeState('Select');
    },

    keydown: function(key) {
        if (key === 'D') {
            this.click();
            this.mode.editor.controller.duplicateSelectedNodes();
        }
        else if (key === 'X') {
            if (this.lockToAxis === 'X') this.lockToAxis = null;
            else this.lockToAxis = 'X';
        }
        else if (key === 'Y') {
            if (this.lockToAxis === 'Y') this.lockToAxis = null;
            else this.lockToAxis = 'Y';
        }
    },

    mousemove: function(event) {
        this.update(event.global.x / this.mode.editor.camera.zoom, event.global.y / this.mode.editor.camera.zoom);
    },

    update: function(x, y) {
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var newPos = new game.Point(x - this.offset.x + this.startValues[i].x, y - this.offset.y + this.startValues[i].y);

            newPos.x += this.mode.editor.camera.position.x;
            newPos.y += this.mode.editor.camera.position.y;
            newPos.x = newPos.x.round();
            newPos.y = newPos.y.round();

            if (this.lockToAxis === 'X') newPos.y = this.startValues[i].y;
            else if (this.lockToAxis === 'Y') newPos.x = this.startValues[i].x;

            if (this.mode.editor.config.gridSize > 0) {
                newPos.x = Math.round(newPos.x / this.mode.editor.config.gridSize) * this.mode.editor.config.gridSize;
                newPos.y = Math.round(newPos.y / this.mode.editor.config.gridSize) * this.mode.editor.config.gridSize;
            }

            node.editorNode.setProperty('position', newPos);
        }
    }
});

});
