game.module(
    'editor.window'
)
.require(
    'editor.core'
)
.body(function() {
   
game.Editor.Window = game.Class.extend({
    x: 'center',
    y: 'center',
    width: 400,
    height: 100,
    borderSize: 1,
    inputs: {},
    visible: false,

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
        else this.windowDiv.style.width = (this.width - this.borderSize * 2) + 'px';

        if(this.height === 'window') this.windowDiv.style.height = window.innerHeight - this.borderSize * 2 + 'px';
        else this.windowDiv.style.height = (this.height - this.borderSize * 2) + 'px';

        if(this.x === 'center') this.windowDiv.style.left = window.innerWidth / 2 - this.width / 2 + 'px';
        else this.windowDiv.style.left = this.x + 'px';

        if(this.y === 'center') this.windowDiv.style.top = window.innerHeight / 2 - this.height / 2 + 'px';
        // if(this.y === 'bottom') this.windowDiv.style.top = window.innerHeight - this.height - this.borderSize * 2 + 'px';
        else this.windowDiv.style.top = this.y + 'px';
    },

    show: function() {
        this.visible = true;
        document.body.appendChild(this.windowDiv);
        return this;
    },

    hide: function() {
        this.visible = false;
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

    addImageButton: function(url, callback) {
        var img = new Image();
        img.src = game.Editor.mediaFolder + url;
        var buttonDiv = document.createElement('div');
        buttonDiv.appendChild(img);
        buttonDiv.className = 'imageButton';
        if(callback) buttonDiv.addEventListener('click', callback.bind(this), false);
        this.contentDiv.appendChild(buttonDiv);
        return this;
    },

    addInput: function(name, type, label, value, callback, description) {
        var inputDiv = document.createElement('div');
        var labelElem = document.createElement('label');
        var inputElem;

        inputDiv.className = 'input';
        labelElem.innerHTML = label || name + ':';
        type = type || 'text';

        if(type === 'text' || type === 'checkbox') {
            inputElem = document.createElement('input');
            inputElem.type = type;
            inputElem.name = name;
            if(typeof(value) === 'number' || typeof(value) === 'string') inputElem.value = value;
            if(type === 'checkbox') inputElem.checked = !!value;
        }
        else if(type === 'select') {
            inputElem = document.createElement('select');
            inputElem.name = name;
        }
        else throw 'Invalid input type';

        this.inputs[name] = inputElem;

        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);

        if(typeof(callback) === 'function') inputElem.addEventListener('change', callback.bind(this, name), false);

        this.contentDiv.appendChild(inputDiv);
        return this;
    },

    addInputText: function(name, value, label) {
        return this.addInput(name, 'text', label, value);
    },

    addInputCheckbox: function(name, value, label, callback) {
        return this.addInput(name, 'checkbox', label, value, callback);
    },

    addInputSelect: function(name, label, callback) {
        return this.addInput(name, 'select', label, null, callback);
    },

    addInputSelectOption: function(name, value, label, selected) {
        var elem = document.createElement('option');
        elem.value = value;
        elem.innerHTML = label;
        elem.selected = !!selected;

        this.inputs[name].appendChild(elem);
        return this;
    },

    setInputSelectValue: function(name, value) {
        this.inputs[name].value = value;
        return this;
    }
});

});