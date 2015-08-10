export class Common{
    constructor(){}

    getErrorMessages(){
        return fetch('../config/error-messages.json');
    }

    getConfig(){
        return fetch('../config/config.json');
    }
    
    isPrivateBrowsing() {
      var testKey = 'test', storage = window.sessionStorage;
      try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return false;
      } catch (error) {
            return true;
      }
    }

}