/* global Store:true */
/* global localStorage */

Store = {

  isAvailable: function checkLocalStorageStatus() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }

  },

  dataEncode: function keyEncode(data) {
      return JSON.stringify(data);
  },

  dataDecode: function keyDecode(data) {
    try {
      data = JSON.parse(data);
    }
    catch (error) {
      data = null;
    }
    return data;
  },

  set: function setStoreKey(key, data, type) {
    if (Store.isAvailable) {


      return localStorage.setItem(key, Store.dataEncode({
          type: type || 'settings',
          data: data
      }));

    }
  },

  get: function getStoreKey(key) {
    if (Store.isAvailable) {
      var lsValue = Store.dataDecode(localStorage.getItem(key));

      if (lsValue !== null && lsValue.hasOwnProperty('data')) {
          return lsValue.data;
      }

      return null;
    }
  },

  reset: function removeStoreKey(key) {
    if (Store.isAvailable) {
      return localStorage.removeItem(key);
    }
  }


};

Store.readSettings = function storeReadSettings(key) {
  return Store.get(key);
};

Store.writeSettings = function storeWriteSettings(key, data) {
  return Store.set(key, data);
};