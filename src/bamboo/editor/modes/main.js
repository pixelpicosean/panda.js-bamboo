game.module(
    'bamboo.editor.modes.main'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.ModeMain = bamboo.editor.Mode.extend({
    helpText: 'Main mode: (W)indows, (B)oundaries, (L)ights, (P)lay, (G)rid, (V)iew nodes, (R)eset view, SPACE pan view, ESC cancel',
    animationRunning: false,
    shiftDown: false,
    altDown: false,
    ctrlDown: false,

    enter: function() {
        this.editor.changeState('Select');
    },

    startAnimation: function() {
        this.editor.setTempMessage('Playing');

        this.animationRunning = true;
        this.editor.world.time = 0;
        
        for (var i = 0; i < this.editor.world.updateableNodes.length; i++) {
            this.editor.world.updateableNodes[i].start();
        }
    },
    
    stopAnimation: function() {
        this.editor.setTempMessage('Stopped');

        this.animationRunning = false;
        this.editor.world.time = 0;
        this.editor.world.update();

        for (var i = 0; i < this.editor.world.updateableNodes.length; i++) {
            this.editor.world.updateableNodes[i].stop();
        }
    },

    keydown: function(key) {
        if (key === 'SHIFT') this.shiftDown = true;
        if (key === 'ALT') this.altDown = true;
        if (key === 'CTRL') this.ctrlDown = true;

        if (key === 'V') {
            this.editor.toggleViewNodes();
            return;
        }
        if (key === 'A') {
            if (this.editor.mode.state instanceof bamboo.editor.StateAdd) return;
            this.editor.changeState('Add');
            return;
        }
        if (key === 'G') {
            if (this.shiftDown) {
                this.editor.gridSize /= 2;
                if (this.editor.gridSize === 0) this.editor.gridSize = 128;
                if (this.editor.gridSize === 4) this.editor.gridSize = 0;
            }
            else {
                this.editor.gridSize *= 2;
                if (this.editor.gridSize === 0) this.editor.gridSize = 8;
                if (this.editor.gridSize > 128) this.editor.gridSize = 0;
            }
            game.storage.set('gridSize', this.editor.gridSize);

            if (this.editor.gridSize > 0) this.editor.setTempMessage('Grid ' + this.editor.gridSize + ' x ' + this.editor.gridSize);
            else this.editor.setTempMessage('Grid disabled');

            this.editor.boundaryLayer.resetGraphics();
            return;
        }
        if (key === 'R') {
            this.editor.cameraWorldPosition = new game.Point(this.editor.worldTargetPos.x, this.editor.worldTargetPos.y);
            return;
        }
        if (key === 'S') {
            this.editor.saveAsModule();
            return;
        }
        if (key === 'W') {
            this.editor.windowsHidden = !this.editor.windowsHidden;
            if (this.editor.windowsHidden) bamboo.ui.hideAll();
            else bamboo.ui.showAll();
            return;
        }
        if (key === 'SPACE') {
            this.editor.cameraOffset = this.editor.prevMousePos.subtractc(this.editor.cameraWorldPosition);
            return;
        }
        if (key === 'L') {
            this.editor.boundaryLayer.toggleScreenDim();
            return;
        }
        if (key === 'B') {
            this.editor.boundaryLayer.boundaries.visible = !this.editor.boundaryLayer.boundaries.visible;
            this.editor.setTempMessage('Boundaries ' + (this.editor.boundaryLayer.boundaries.visible ? 'on' : 'off'));
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
            this.editor.cameraOffset = null;
            game.storage.set('lastCameraPosX', this.editor.cameraWorldPosition.x);
            game.storage.set('lastCameraPosY', this.editor.cameraWorldPosition.y);
            return;
        }
    },

    update: function() {
        if (this.animationRunning) this.editor.world.update();
    }
});

});
