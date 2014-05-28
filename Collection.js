/**

  @module       Collection
  @description  A collection of objects

*/
var Proto = require('super-proto');
var registry = require('super-registry');
var enforce = require('super-is').enforce;
var indexOf = require('super-iter').indexOf;

module.exports = Proto.extend({


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

      process.emit("sync", {
        id: this.id,
        method: "add",
        item: typeof item.serialise === 'function' ? item.serialise() : item
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

        process.emit("sync", {
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
