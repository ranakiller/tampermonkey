// ==UserScript==
// @name         Find How Many Seats Left
// @namespace    http://tampermonkey.net/
// @version      2024-08-11
// @description  try to take over the world!
// @author       Furqan Rana
// @match        https://skypass.pk/agents/book-tickets
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skypass.pk
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Select all buttons with the specified class
    const buttons = Array.from(document.querySelectorAll('a.btn.bg-dark-4.btn_sm.text-white'));

    // Function to create a single iframe
    function createIframe() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        return iframe;
    }

    // Function to inject minimal styles into the iframe
    function injectMinimalStyles(iframe) {
        const style = document.createElement('style');
        style.innerHTML = `
            body, * {
                all: unset; /* Disable all styles */
                display: block !important;
                visibility: visible !important;
                font-size: 16px !important;
            }
            body {
                background: white !important;
                margin: 0;
                padding: 0;
            }
        `;
        iframe.contentDocument.head.appendChild(style);
    }

    // Function to simulate setting the number of adults
    function setAdults(iframe, num) {
        return new Promise((resolve) => {
            const adultInput = iframe.contentDocument.querySelector('#adults');

            if (adultInput) {
                adultInput.value = num;
                let event = new Event('input', { bubbles: true });
                adultInput.dispatchEvent(event);

                setTimeout(() => {
                    let error = iframe.contentDocument.querySelector('#top-alert-message.alert.alert-danger');
                    if (error && error.innerText.includes("Seats not available")) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }, 50); // Small delay to ensure event handling
            } else {
                resolve(false);
            }
        });
    }

    async function findMaxAdults(iframe, url) {
        return new Promise((resolve) => {
            iframe.src = url;
            iframe.onload = async () => {
                // Inject minimal styles after the iframe loads
                injectMinimalStyles(iframe);

                let maxAdults = 0;
                let maxSeatsReached = false;

                for (let i = 1; i <= 6; i++) {
                    let isValid = await setAdults(iframe, i);
                    if (!isValid) {
                        maxAdults = i - 1;
                        maxSeatsReached = true;
                        break;
                    } else if (i === 6) {
                        maxAdults = 5;
                        maxSeatsReached = false;
                    } else {
                        maxAdults = i;
                    }
                }

                // Prepare the text to display
                let seatText = maxSeatsReached && maxAdults === 5 ? `${maxAdults}` : "5+";

                // Find the corresponding button and append the result below it
                const button = buttons.find(btn => btn.href === url);
                if (button) {
                    // Update the text inside the button
                    button.textContent = `Seats: ${seatText}`;
                }

                resolve();
            };
        });
    }

    async function processAllUrls(buttons) {
        const iframe = createIframe();

        for (let i = 0; i < buttons.length; i++) {
            const sectorURL = buttons[i].href;
            // console.log(`Processing ${i + 1}/${buttons.length}: ${sectorURL}`);

            await findMaxAdults(iframe, sectorURL);

            // Slight delay between each URL to allow browser to catch up
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        document.body.removeChild(iframe); // Clean up after processing all URLs
    }

    // Start processing all URLs
    processAllUrls(buttons);

})();