const cache = await caches.open("pokemon");

/**
 * fetches fresh or cached data
 * 
 * @param {string} req
 * @returns {Promise}
 */
export async function getData(req) {
  const cached = await cache.match(req);
  if (cached) {
    return await cached.clone().json();
  }
  
  const fresh = await fetch(req);
  await cache.put(req, fresh.clone());
  return await fresh.json();
}


