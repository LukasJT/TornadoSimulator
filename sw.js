/* Cleanup worker: replaces the retired third-party advertising worker and
   unregisters itself after removing caches it may have created. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(key=>caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
