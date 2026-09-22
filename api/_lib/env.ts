/** Reads a required environment variable, failing loudly at the first request rather than deep in a handler. */
export function env(name:string){const v=process.env[name];if(!v)throw new Error(`${name} is not set`);return v;}
/** The site's origin, for redirect URLs. Never taken from the request, which anyone can forge. */
export const origin=()=>env('APP_ORIGIN').replace(/\/$/,'');
export const json=(body:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
