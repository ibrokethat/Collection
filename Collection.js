/**

  @module       Collection
  @description  A collection of objects

*/
var EventEmitter = require("events").EventEmitter;
var registry     = require("registry");
var system       = require("system");
var enforce      = require("is").enforce;
var indexOf      = require("iter").indexOf;

module.exports = EventEmitter.extend({


  __init__: {

    value: function (type) {

      Object.defineProperties(this, {

        "id": {
          value: ""//generateUuid()
        },

        "type": {
          value: type
        },

        "_data": {
          value:[]
        },

        "_dropSync": {
          value: false
        }

      });

      registry.add(this);

    }

  },

  items: {

    get: function () {
      return [].concat(this._data);
    }

  },

  add: {

    value: function (item) {

      enforce(this.type, item);

      Object.defineProperty(this, "_data", Object.create(this._data));

      this._data.push(item);

      this.emit("add", {
        item: item,
        items: this.items
      });

      if (this._dropSync) return;

      system.emit("sync", {
        id: this.id,
        method: "add",
        item: item//.serialise()
      });

    }

  },

  remove: {

    value: function (item) {

      var index = indexOf(this._data, item);

      if (index !== -1) {

        Object.defineProperty(this, "_data", Object.create(this._data));

        this._data.splice(index, 1);

        this.emit("remove", {
          item: item,
          items: this.items
        });

        if (this._dropSync) return;

        system.emit("sync", {
          id: this.id,
          method: "remove",
          itemId: item.id
        });

      }


    }

  },

  removeById: {

    value: function (id) {

      this.remove(registry.get(id));

    }
  },


  sync: {

    value: function (data) {

      this._dropSync = true;

      switch (data.method) {

        case "add":

          this.add(data.item);
          break;

        case "remove":

          this.removeById(data.itemId);
          break;

      }

      this._dropSync = false;

    }

  }


});
