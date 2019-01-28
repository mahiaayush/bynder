

class APIS {
    constructor(name) {
        var _name = name
        this.setName = function(name) { _name = name; }
        this.getName = function() { return _name; }
    }
}