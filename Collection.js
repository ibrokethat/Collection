/**

  @module       Collection
  @description  A collection of objects

*/
var EventEmitter = require("events").EventEmitter;
var registry     = require("registry");
var system       = require("system");
var enforce      = require("is").enforce;
var indexOf      = require("iter").indexOf;
var generateUuid = require("uuid").generate;

module.exports = EventEmitter.extend({


  __init__: {

    value: function (data) {

      Object.defineProperties(this, {

        "id": {
          value: data.id
        },

        "type": {
          value: data.type
        },

        "_data": {
          value:[]
        },

        "_dropsync": {
          value: false,
          writable: true
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
        collection: this
      });

      if (this._dropsync) return;

      system.emit("sync", {
        id: this.id,
        method: "add",
        item: item.serialise()
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
          collection: this
        });

        if (this._dropsync) return;

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

      this._dropsync = true;

      switch (data.method) {

        case "add":
          console.log("add: ", data.item.id)
          this.add(this.type.spawn(data.item));
          break;

        case "remove":
          console.log("remove: ", data.itemId)
          this.removeById(data.itemId);
          break;

      }

      this._dropsync = false;

    }

  }


});
