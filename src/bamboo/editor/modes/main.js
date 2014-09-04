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

    init: function(editor) {
        this._super(editor);

        this.state = new bamboo.editor.StateSelect(this);

        // this.timeDisplay = new game.BitmapText('', { font: 'Buu' });
        // this.timeDisplay.position.set(20, 20);
        // this.timeDisplay.visible = false;
        // this.editor.overlay.addChild(this.timeDisplay);

        // this.zoomDisplay = new game.BitmapText('', { font: 'Buu' });
        // this.zoomDisplay.position.set(20, 50);
        // this.zoomDisplay.visible = false;
        // this.editor.overlay.addChild(this.zoomDisplay);
    },

    exit: function() {
        // if (this.animationRunning) this.stopAnimation();

        // this.editor.overlay.removeChild(this.timeDisplay);
        // this.editor.overlay.removeChild(this.zoomDisplay);
        // this.state.cancel();
    },

    zoomChanged: function(newZoom) {
        this.zoomDisplay.visible = true;
        this.zoomDisplay.alpha = 1.0;
        this.zoomDisplay.setText((newZoom*100.0).toFixed(2)+'%');
        if (this.zoomTween) this.zoomTween.stop();
        this.zoomTween = new game.Tween(this.zoomDisplay).to({alpha:0.0}, 300).easing(game.Tween.Easing.Quadratic.In);
        var self = this;
        this.zoomTween.onComplete(function() {
            self.zoomTween = null;
        });
        this.zoomTween.start();
    },

    startAnimation: function() {
        this.animationRunning = true;
        this.editor.world.time = 0;
        for (var i = 0; i < this.editor.world.updateableNodes.length; i++) {
            this.editor.world.updateableNodes[i].node.start();
        }
        // this.timeDisplay.visible = true;
    },
    
    stopAnimation: function() {
        this.animationRunning = false;
        this.editor.world.time = 0;
        this.editor.world.update();
        for (var i = 0; i < this.editor.world.updateableNodes.length; i++) {
            this.editor.world.updateableNodes[i].node.stop();
        }
        // this.timeDisplay.visible = false;
    },

    click: function(event) {
        this.state.apply(event);
    },

    mousedown: function(event) {
        if (this.state.mousedown) this.state.mousedown(event);
    },

    mousemove: function(event) {
        this.state.mousemove(event);
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
        // if (key === 'NUM_PLUS') return this.editor.onmousewheel(0.5);
        // if (key === 'NUM_MINUS') return this.editor.onmousewheel(-0.5);
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
            return this.editor.boundaryLayer.screenDim.visible = !this.editor.boundaryLayer.screenDim.visible;
        }
        if (key === 'B') {
            return this.editor.boundaryLayer.boundaries.visible = !this.editor.boundaryLayer.boundaries.visible;
        }
        if (key === 'ESC') {
            if (this.animationRunning) this.stopAnimation();
            this.state.cancel();
            this.editor.changeState('Select');
            return;
        }
        if (key === 'P') {
            if (this.animationRunning) this.stopAnimation();
            else this.startAnimation();
            return;
        }

        this.state.keydown(key);
    },

    keyup: function(key) {
        if (key === 'SHIFT') this.shiftDown = false;
        if (key === 'ALT') this.altDown = false;
        if (key === 'CTRL') this.ctrlDown = false;
        
        if (key === 'SPACE') {
            this.editor.cameraOffset = null;
            return;
        }

        this.state.keyup(key);
    },

    filedrop: function(event) {
        if (this.state.filedrop) this.state.filedrop(event);
    },

    changeState: function(newState) {
        this.state = newState;
    },

    update: function() {
        if (this.animationRunning) {
            this.editor.world.update();
            // this.timeDisplay.setText(this.editor.world.time.toFixed(1) + 's');
        }
    }
});

});
