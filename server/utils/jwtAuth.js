// @flow
import JWT from 'jsonwebtoken';

const jwtAuthGenericPublicKey = process.env.JWT_AUTH_GENERIC_PUBLIC_KEY;

function isNonEmptyString(s){
  return typeof s==='string' && s.trim().length!==0;
}

function isUndefinedOrNonEmptyString(s){
  return typeof s === 'undefined' || isNonEmptyString(s);
}
function isValidURL(str){
  return typeof str === 'string' && str.length > 11 && str.indexOf("http://") === 0 || str.indexOf("https://") === 0;
}
function isUndefinedOrValidURL(s){
  return typeof s === 'undefined' || isValidURL(s);
}

function isValidEmail(str){
  if(typeof str!=='string'){
    return false;
  }
  const atIndex = str.indexOf("@");
  const dotIndex = str.lastIndexOf(".");
  
  return str.length > 4 && 
    atIndex > 0 && 
    dotIndex > atIndex && 
    dotIndex !== (str.length-1);
}
function assertTrue(condition, message){
  if(!condition){
    throw new Error(message);
  }
}

function verifyJWT(code, pubKey) {
  return new Promise((resolve,reject)=>{
    JWT.verify(code, pubKey, { algorithms: ['RS256'] }, function (err, payload) {
      if(err||!payload){
        return reject(err||new Error("Missing Payload!"));
      }else{
        return resolve(payload);
      }
    });
  })
}

export async function verifyGenericAuthJWT(jwtCode){
  const payload = await verifyJWT(jwtCode, jwtAuthGenericPublicKey);
  assertTrue(!!payload.exp, "JWT must have expiration!");
  assertTrue(typeof payload === 'object' && payload, "Invalid auth payload!");
  assertTrue(isValidEmail(payload.email), "Invalid email parameter!");
  assertTrue(isNonEmptyString(payload.name), "Invalid name parameter!");
  assertTrue(isNonEmptyString(payload.teamName), "Invalid teamName parameter!");
  assertTrue(isNonEmptyString(payload.userId), "Invalid userId parameter!");
  assertTrue(isNonEmptyString(payload.teamId), "Invalid teamId parameter!");
  assertTrue(typeof payload.role==='undefined' || isNonEmptyString(payload.role), "Invalid role!");
  assertTrue(typeof payload.avatar === 'undefined' || isValidURL(payload.avatar), "Invalid avatar!");

  return payload;
}
