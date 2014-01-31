game.module(
    'editor.window',
    '1.0.0'
)
.require(
)
.body(function() {
   
game.Window = game.Class.extend({
    title: 'Untitled',
    inputs: {},

    init: function(title, content, show) {
        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.className = 'window_wrapper';

        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window';

        this.titleDiv = document.createElement('div');
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = title || this.title;

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'content';

        this.windowDiv.appendChild(this.titleDiv);
        this.windowDiv.appendChild(this.contentDiv);
        this.wrapperDiv.appendChild(this.windowDiv);

        if(content) this.addContent(content);
        if(show) this.show();
    },

    show: function() {
        document.body.appendChild(this.wrapperDiv);
    },

    remove: function() {
        document.body.removeChild(this.wrapperDiv);
    },

    clear: function() {
        this.contentDiv.innerHTML = '';
    },

    setTitle: function(title) {
        this.titleDiv.innerHTML = title;
    },

    addContent: function(content) {
        var div = document.createElement('div');
        div.innerHTML = content;
        this.contentDiv.appendChild(div);
    },

    addButton: function(title, callback) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'button confirm';
        buttonDiv.innerHTML = title;
        buttonDiv.addEventListener('click', callback.bind(this), false);

        this.contentDiv.appendChild(buttonDiv);
    },

    addInput: function(name, type, label, value) {
        var inputDiv = document.createElement('div');
        var labelElem = document.createElement('label');
        var inputElem;

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
    },

    addInputText: function(name, value, label) {
        this.addInput(name, 'text', label, value);
    } 
});

});