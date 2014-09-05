game.module(
    'bamboo.editor.states.resize'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateResize = bamboo.editor.State.extend({
    helpText: 'Resize state',

    enter: function() {
        this.node = this.mode.editor.activeNode;
        document.body.style.cursor = 'nwse-resize';
    },

    exit: function() {
        document.body.style.cursor = 'default';
    },

    mousemove: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);
        mousePos = this.mode.editor.toWorldSpace(mousePos);
        mousePos = this.node.toLocalSpace(mousePos);

        if (this.mode.editor.gridSize > 0) {
            mousePos.x = Math.round(mousePos.x / this.mode.editor.gridSize) * this.mode.editor.gridSize;
            mousePos.y = Math.round(mousePos.y / this.mode.editor.gridSize) * this.mode.editor.gridSize;
        }
        
        this.node._editorNode.setProperty('size', mousePos);
    },

    click: function(event) {
        this.mode.editor.changeState('Select');
    }
});

});
