

var Options = {
  OfflineURL:'offline.html',
  OfflineCache:'offlineV1',
  OfflineAvailablePages:[]
};

importScripts('serviceplayer/serviceworker-cache-polyfill.js');

self.addEventListener('message',function(event){

  var newOptions = event.data;

  for(key in Options){
    if(newOptions[key]){
      Options[key] = newOptions[key];
    }
  }

  cacheOfflinePage();
  cachePages();
  console.log(event.data);

});

self.addEventListener('install',function(event) {
 event.waitUntil(cacheOfflinePage());

 event.waitUntil(cachePages());

});

self.addEventListener('fetch',function(event) {
  /*
  var response;
    event.respondWith(caches.match(event.request).catch(function() {
      return fetch(event.request);
    }).then(function(r) {
      response = r;
      caches.open(Options.OfflineCache).then(function(cache) {
        cache.put(event.request, response);
      });
      return response.clone();
    }).catch(function() {
      return caches.match(Options.OfflineURL);
    }));
*/


  // We only want to call event.respondWith() if this is a GET request for an HTML document.
  if (event.request.method === 'GET' &&
      event.request.headers.get('accept').indexOf('text/html') !== -1) {
    console.log('Handling fetch event for', event.request.url);
    event.respondWith(
      fetch(event.request).then(function(response){
        
        if (!response.ok) {
          // An HTTP error response code (40x, 50x) won't cause the fetch() promise to reject.
          // We need to explicitly throw an exception to trigger the catch() clause.
          throw Error('response status ' + response.status);
        }

        return response;

      }).catch(function(e) {
        
        
       console.error('Fetch failed; returning offline page instead.', e);
        return caches.open(Options.OfflineCache).then(function(cache) {
          return cache.match(Options.OfflineURL);
        });

        //return new Response('<strong>Generic Not Found</strong>', {
        //  headers: {'Content-Type': 'text/html'}
        //});

      })
    );
  }

});


function cacheOfflinePage(){
  var offlineRequest = new Request(Options.OfflineURL);
  fetch(offlineRequest).then(function(response) {
      return caches.open(Options.OfflineCache).then(function(cache) {
        return cache.put(offlineRequest, response);
    });
  })
}

function cachePages(){
  caches.open(Options.OfflineCache).then(function(cache) {
    return cache.addAll(Options.OfflineAvailablePages);
  });
}