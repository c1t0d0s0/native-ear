// Example configuration file for NativeEar
// Copy this file to config.js or public/config.js and set your Measurement ID / GTM ID.
const GTM_ID = 'G-XXXXXXXXXX'; // or 'GTM-XXXXXXX'

if (typeof window !== 'undefined') {
  window.GTM_ID = GTM_ID;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GTM_ID };
}
