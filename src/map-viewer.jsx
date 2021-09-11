import Resolver from '@forge/resolver';
import { fetch } from '@forge/api';
import config from "../config";

const resolver = new Resolver();
const apikey = config.GOOGLE_MAP_API_KEY;

resolver.define('searchAddress', async ({payload}) => {
    let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${payload.address}&key=${apikey}`)
    res = await res.json()

    if (res['status'] === "OK") {
        return res['results']
    }

    return Promise.reject(res)
});

resolver.define('getAddress', async ({ payload }) => {
    let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${payload.lat},${payload.lng}&key=${apikey}`)
    res = await res.json()

    if (res['status'] === "OK") {
        return res['results'][0] ? res['results'][0] : null
    }

    return Promise.reject(res)
});

export const handler = resolver.getDefinitions();

