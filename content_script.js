// // Listen for messages from the background script or popup
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if(request.action === "get_product_specs") {
//         // Attempt to scrape key product details from a Walmart product page.
//         // (This is a basic example; adjust selectors as needed based on page structure.)
//         let titleElem = document.querySelector('h1');
//         let title = titleElem ? titleElem.innerText.trim() : '';
        
//         // Try to find manufacturer details via known selectors.
//         let manufacturer = '';
//         let manufacturerElem = document.querySelector('[itemprop="name"]');
//         if(manufacturerElem) {
//             manufacturer = manufacturerElem.innerText.trim();
//         }
        
//         // You can add more specifications as needed.
//         sendResponse({ title: title, manufacturer: manufacturer });
//     }
// });

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === "get_product_specs") {
//         // Attempt to find the product name in the Walmart page DOM
//         // Adjust the selector as needed based on the actual structure
//         let productNameElem = document.querySelector('[data-automation="product-title"] h1 span');
//         let productName = productNameElem ? productNameElem.textContent.trim() : '';
        
//         if (productName) {
//             sendResponse({ productName });
//         } else {
//             sendResponse({ error: "No product name found." });
//         }
//     }
// });

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === "get_product_specs") {
//         // Find the product name using the identified selector
//         let productNameElem = document.querySelector('h1#main-title');
//         let productName = productNameElem ? productNameElem.textContent.trim() : '';

//         if (productName) {
//             sendResponse({ productName });
//         } else {
//             sendResponse({ error: "No product name found." });
//         }
//     }
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "get_product_specs") {
        let productName = '';
        let url = window.location.hostname;

        if (url.includes("walmart.com")) {
            // Walmart Selector
            let productNameElem = document.querySelector('h1#main-title');
            productName = productNameElem ? productNameElem.textContent.trim() : '';

        } else if (url.includes("amazon.com")) {
            // Amazon Selector
            let productNameElem = document.querySelector('#productTitle');
            productName = productNameElem ? productNameElem.textContent.trim() : '';

        } else if (url.includes("target.com")) {
            // Target Selector
            let productNameElem = document.querySelector('h1#pdp-product-title-id');
            productName = productNameElem ? productNameElem.textContent.trim() : '';

        } else if (url.includes("bestbuy.com")) {
            // Best Buy Selector
            let productNameElem = document.querySelector('.sku-title h1');
            productName = productNameElem ? productNameElem.textContent.trim() : '';

        } else {
            sendResponse({ error: "Retailer not supported." });
            return;
        }

        if (productName) {
            sendResponse({ productName });
        } else {
            sendResponse({ error: "No product name found." });
        }
    }
});
