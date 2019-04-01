LoadState = function (url, callback, loader) {
    var this_ = this;
    this_.request = new XMLHttpRequest();
    this_.url = url;
    this_.callback = callback;
    this_.request.open("GET", url);
    this_.request.onreadystatechange = function() {
        if (this_.request.readyState == 4) {
            this_.loader.remove(this_);
            this_.callback.call(undefined, this_.request.responseText);
        }
    };
    this_.loader = loader;
};

LoadState.prototype = {
    constructor: LoadState,
    start: function() {
        this.request.send();
    }
};

LoadImage = function (url, callback, loader) {
    var this_ = this;
    this_.image = new Image();
    this_.url = url;
    this_.callback = callback;
    
    this_.image.onload = function() {
        this_.loader.remove(this_);
        this_.callback.call(undefined, this_.image);
    };
    this_.loader = loader;
};

LoadImage.prototype = {
    constructor: LoadState,
    start: function() {
        this.image.src = this.url;
    }
};

Loader = function () {
    this.pending = [];
};

Loader.prototype = {
    constructor: Loader,
    loadImage: function (url, callback) {
        var obj = new LoadImage(url, callback, this);
        obj.index = this.pending.length;
        this.pending.push(obj);
        obj.start();
    },
    load: function (url, callback) {
        var obj = new LoadState(url, callback, this);
        obj.index = this.pending.length;
        this.pending.push(obj);
        obj.start();
    },
    remove: function (obj) {
        if (this.pending.length > 1)
            this.pending[obj.index] = this.pending[this.pending.length-1];
        this.pending.pop();
    }
};
