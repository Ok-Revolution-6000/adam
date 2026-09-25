import {handleInquiry} from './_lib/institution-inquiry.js';
/** Public institution form; mail credentials stay on the server. */
export function POST(req:Request){
 return handleInquiry(req,{apiKey:process.env.RESEND_API_KEY,from:process.env.INQUIRY_FROM_EMAIL,origin:process.env.APP_ORIGIN});
}
