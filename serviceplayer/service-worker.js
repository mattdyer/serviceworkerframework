/*
 Copyright 2015 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

var OFFLINE_CACHE = 'offline';
var FALLBACK_URL = 'notfound.html';

var Options = {
  OfflineURL:'offline.html'
};

importScripts('serviceplayer/serviceworker-cache-polyfill.js');

self.addEventListener('message',function(event){

  var newOptions = event.data;

  for(key in Options){
    if(newOptions[key]){
      Options[key] = newOptions[key];
    }
  }

  cacheOfflinePage(event);

  console.log(event.data);
});

self.addEventListener('install',function(event) {
 cacheOfflinePage(event);
});

self.addEventListener('fetch',function(event) {
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
        return caches.open(OFFLINE_CACHE).then(function(cache) {
          return cache.match(Options.OfflineURL);
        });

        //return new Response('<strong>Generic Not Found</strong>', {
        //  headers: {'Content-Type': 'text/html'}
        //});

      })
    );
  }

});


function cacheOfflinePage(event){
   var offlineRequest = new Request(Options.OfflineURL);
  event.waitUntil(
    fetch(offlineRequest).then(function(response) {
      return caches.open(OFFLINE_CACHE).then(function(cache) {
        return cache.put(offlineRequest, response);
      });
    })
  );
}