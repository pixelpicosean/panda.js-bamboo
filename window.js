game.module(
    'editor.window',
    '1.0.0'
)
.body(function() {
   
game.Window = game.Class.extend({
    x: 'center',
    y: 'center',
    width: 400,
    height: 100,
    borderSize: 1,
    inputs: {},

    init: function(x, y, width, height) {
        if(typeof(x) !== 'undefined') this.x = x;
        if(typeof(y) !== 'undefined') this.y = y;
        if(typeof(width) !== 'undefined') this.width = width;
        if(typeof(height) !== 'undefined') this.height = height;

        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window';

        this.titleDiv = document.createElement('div');
        this.titleDiv.className = 'title';

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'content';

        this.windowDiv.appendChild(this.titleDiv);
        this.windowDiv.appendChild(this.contentDiv);

        window.addEventListener('resize', this.update.bind(this), false);
        this.update();
    },

    update: function() {
        if(this.width === 'window') this.windowDiv.style.width = window.innerWidth - this.borderSize * 2 + 'px';
        else this.windowDiv.style.width = this.width + 'px';

        if(this.height === 'window') this.windowDiv.style.height = window.innerHeight - this.borderSize * 2 + 'px';
        else this.windowDiv.style.width = this.width + 'px';

        this.windowDiv.style.height = this.height + 'px';
        if(this.x === 'center') this.windowDiv.style.left = window.innerWidth / 2 - this.width / 2 + 'px';
        else this.windowDiv.style.left = this.x + 'px';

        if(this.y === 'center') this.windowDiv.style.top = window.innerHeight / 2 - this.height / 2 + 'px';
        // if(this.y === 'bottom') this.windowDiv.style.top = window.innerHeight - this.height - this.borderSize * 2 + 'px';
        else this.windowDiv.style.top = this.y + 'px';
    },

    show: function() {
        document.body.appendChild(this.windowDiv);
    },

    hide: function() {
        document.body.removeChild(this.windowDiv);
    },

    clear: function() {
        this.contentDiv.innerHTML = '';
    },

    addTitle: function(title) {
        this.titleDiv.innerHTML = title;
        this.titleDiv.style.display = 'block';
        return this;
    },

    addText: function(content) {
        var div = document.createElement('div');
        div.className = 'text';
        div.innerHTML = content;
        this.contentDiv.appendChild(div);
        return this;
    },

    addButton: function(title, callback) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'button';
        buttonDiv.innerHTML = title;
        if(callback) buttonDiv.addEventListener('click', callback.bind(this), false);
        this.contentDiv.appendChild(buttonDiv);
        return this;
    },

    addInput: function(name, type, label, value) {
        var inputDiv = document.createElement('div');
        var labelElem = document.createElement('label');
        var inputElem;

        inputDiv.className = 'input';
        labelElem.innerHTML = label || name + ':';
        type = type || 'text';

        if(type === 'text') {
            inputElem = document.createElement('input');
            inputElem.type = type;
            inputElem.name = name;
            if(typeof(value) === 'number' || typeof(value) === 'string') inputElem.value = value;
        }
        else if(type === 'select') {
            inputElem = document.createElement('select');
            inputElem.name = name;
        }
        else throw 'Invalid input type';

        this.inputs[name] = inputElem;

        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);

        this.contentDiv.appendChild(inputDiv);
        return this;
    },

    addInputText: function(name, value, label) {
        return this.addInput(name, 'text', label, value);
    } 
});

});