const vapidPublicKey = "BNhGkh4NPQdL5-v97cIGWleXsEuVlZiW6YGu3866y33lZuMB_INQ-nJh0Ff-DECy-uIO-E2X4KdDvEw2oo0--Aw";
const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
const base64 = (vapidPublicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
console.log("Base64:", base64);
const rawData = Buffer.from(base64, 'base64').toString('binary');
const outputArray = new Uint8Array(rawData.length);
for (let i = 0; i < rawData.length; ++i) {
  outputArray[i] = rawData.charCodeAt(i);
}
console.log("Success, array length:", outputArray.length);
