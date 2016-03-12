function servicePlayer(options){
	
  this.sendMessage = function(message) {
    
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      if(navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage(message,[messageChannel.port2]);
      }
    });
  }

  this.sendMessage(options);

  return this;
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('service-worker.js', {scope: './'});
}