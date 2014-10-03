game.module(
    'bamboo.editor.states.resize'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateResize = bamboo.editor.State.extend({
    helpText: 'Resize state: SHIFT lock ratio',

    enter: function() {
        this.node = this.mode.editor.activeNode;
        this.startSize = this.node.size.clone();
        document.body.style.cursor = 'nwse-resize';
    },

    exit: function() {
        document.body.style.cursor = 'default';
    },

    cancel: function() {
        this.node._editorNode.setProperty('size', this.startSize);
    },

    mousemove: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);
        mousePos = this.mode.editor.toWorldSpace(mousePos);
        mousePos = this.node.toLocalSpace(mousePos);

        mousePos.x += this.node.size.x * this.node.anchor.x;
        mousePos.y += this.node.size.y * this.node.anchor.y;

        if (this.mode.editor.gridSize > 0) {
            mousePos.x = Math.round(mousePos.x / this.mode.editor.gridSize) * this.mode.editor.gridSize;
            mousePos.y = Math.round(mousePos.y / this.mode.editor.gridSize) * this.mode.editor.gridSize;
        }
        else if (this.mode.shiftDown) {
            var ratio = this.startSize.x / this.startSize.y;
            mousePos.x = mousePos.y * ratio;
        }
        
        this.node._editorNode.setProperty('size', mousePos);
    },

    click: function(event) {
        this.mode.editor.changeState('Select');
    }
});

});
