// Untrusted Types DevTools - Content Script
// This script runs on all web pages and monitors for DOM XSS vulnerabilities

console.log('Untrusted Types DevTools content script loaded');

// Initialize message passing with background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'content-script-active' });
  }
});

// Monitor for Trusted Types policy creation
const originalCreatePolicy = window.trustedTypes?.createPolicy;
if (originalCreatePolicy) {
  window.trustedTypes.createPolicy = function(policyName, policyOptions) {
    console.log('[Untrusted Types] Trusted Types policy created:', policyName);
    return originalCreatePolicy.call(this, policyName, policyOptions);
  };
}

// Log innerHTML assignments (potential XSS sink)
const elementProto = Element.prototype;
const originalInnerHTML = Object.getOwnPropertyDescriptor(elementProto, 'innerHTML');

if (originalInnerHTML) {
  Object.defineProperty(elementProto, 'innerHTML', {
    set: function(value) {
      console.log('[Untrusted Types] innerHTML assignment detected:', {
        element: this.tagName,
        value: typeof value,
        stack: new Error().stack
      });
      return originalInnerHTML.set.call(this, value);
    },
    get: originalInnerHTML.get,
    configurable: true
  });
}