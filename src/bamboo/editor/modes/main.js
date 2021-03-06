game.module(
    'bamboo.editor.modes.main'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

game.bamboo.editor.ModeMain = game.bamboo.editor.Mode.extend({
    animationRunning: false,
    shiftDown: false,
    altDown: false,
    ctrlDown: false,

    startAnimation: function() {
        this.editor.setTempMessage('Playing');

        this.animationRunning = true;
        this.editor.world.time = 0;
        
        for (var i = 0; i < this.editor.nodes.length; i++) {
            if (typeof this.editor.nodes[i].start === 'function') this.editor.nodes[i].start();
        }
    },
    
    stopAnimation: function() {
        this.editor.setTempMessage('Stopped');

        this.animationRunning = false;
        this.editor.world.time = 0;
        this.editor.world.update();

        for (var i = 0; i < this.editor.nodes.length; i++) {
            if (typeof this.editor.nodes[i].stop === 'function') this.editor.nodes[i].stop();
        }
    },

    keydown: function(key) {
        if (key === 'SHIFT') this.shiftDown = true;
        if (key === 'ALT') this.altDown = true;
        if (key === 'CTRL') this.ctrlDown = true;

        if (key === 'C') {
            game.bamboo.ui.toggleWindow('console');
            return;
        }
        if (key === 'V') {
            this.editor.toggleViewNodes();
            return;
        }
        if (key === 'G') {
            this.editor.changeGrid();
            return;
        }
        if (key === 'R') {
            this.editor.camera.reset();
            return;
        }
        if (key === 'S') {
            this.editor.saveAsModule();
            return;
        }
        if (key === 'SPACE') {
            this.editor.spaceDown = true;
            this.editor.camera.offset.x = this.editor.prevMousePos.x - (this.editor.camera.center.x - this.editor.camera.position.x);
            this.editor.camera.offset.y = this.editor.prevMousePos.y - (this.editor.camera.center.y - this.editor.camera.position.y);
            return;
        }
        if (key === 'L') {
            this.editor.boundary.toggleScreenDim();
            return;
        }
        if (key === 'B') {
            this.editor.toggleBoundaries();
            return;
        }
        if (key === 'ESC') {
            this.state.cancel();
            this.editor.changeState('Select');
            return;
        }
        if (key === 'P') {
            if (this.animationRunning) this.stopAnimation();
            else this.startAnimation();
            return;
        }

        this._super(key);
    },

    keyup: function(key) {
        if (key === 'SHIFT') this.shiftDown = false;
        if (key === 'ALT') this.altDown = false;
        if (key === 'CTRL') this.ctrlDown = false;
        
        if (key === 'SPACE') {
            this.editor.spaceDown = false;
            // game.storage.set('lastCameraPosX', this.editor.cameraWorldPosition.x);
            // game.storage.set('lastCameraPosY', this.editor.cameraWorldPosition.y);
            return;
        }
    },

    update: function() {
        if (this.animationRunning) this.editor.world.update();
    }
});

});
