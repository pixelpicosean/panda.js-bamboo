game.module(
    'bamboo.runtime.nodes.button'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.image'
)
.body(function() {

/**
    @class Button
    @namespace bamboo.Nodes
**/
bamboo.createNode('Button', 'Image', {
    init: function() {
        this.displayObject = new game.Sprite(new game.Texture(new game.BaseTexture()));
    },

    ready: function() {
        if (!this.activateFromTrigger) this.activate();
    },

    trigger: function() {
        this.activate();
    },

    activate: function() {
        if (!this.active) return;
        this.displayObject.interactive = true;
        this.displayObject.buttonMode = !!this.buttonMode;
        this.displayObject.mousedown = this.displayObject.touchstart = this.mousedown.bind(this);
        this.displayObject.mouseup = this.displayObject.touchend = this.mouseup.bind(this);
        this.displayObject.mouseover = this.mouseover.bind(this);
        this.displayObject.mouseout = this.displayObject.touchendoutside = this.mouseout.bind(this);
        this.displayObject.click = this.displayObject.tap = this.click.bind(this);
    },

    mousedown: function() {
        if (this.downImage) this.displayObject.setTexture(game.config.mediaFolder + this.downImage);
    },

    mouseover: function() {
        if (this.overImage) this.displayObject.setTexture(game.config.mediaFolder + this.overImage);
    },

    mouseup: function() {
        this.displayObject.setTexture(game.config.mediaFolder + this.image);
    },

    mouseout: function() {
        this.displayObject.setTexture(game.config.mediaFolder + this.image);
    },

    click: function() {
        if (this.callback) this.world.scene[this.callback](this);
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'image' && this.image) this.displayObject.setTexture(game.config.mediaFolder + this.image);
    }
});

bamboo.addNodeProperty('Button', 'downImage', 'image');
bamboo.addNodeProperty('Button', 'overImage', 'image');
bamboo.addNodeProperty('Button', 'callback', 'string');
bamboo.addNodeProperty('Button', 'buttonMode', 'boolean');
bamboo.addNodeProperty('Button', 'activateFromTrigger', 'boolean');

});
