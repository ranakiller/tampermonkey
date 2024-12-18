// ==UserScript==
// @name         Skypass Copy Button
// @namespace    skypass_copybutton
// @version      0.1
// @description  This script put copy button to copy whatsapp formatted text of seat details
// @downloadURL	 https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/skypass_copybutton.user.js
// @updateURL    https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/skypass_copybutton.user.js
// @author       Rana Furqan
// @match        https://skypass.pk/agents/book-tickets/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skypass.pk
// @grant        none
// ==/UserScript==

// Function to calculate days between dates
(function() {
    'use strict';

    let spanCounter = 1; // Counter to generate unique IDs

    function calculateDays(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
    }

    function createDaysSpan(textContent) {
        const span = document.createElement('span');
        span.className = 'fw-bold';
        span.style.fontSize = "0.8em";
        span.style.color = "gray";
        span.textContent = textContent;
        span.id = `days-span-${spanCounter++}`; // Assign a unique ID
        return span;
    }

    function processFlightDates() {
        const flightInfo = document.querySelectorAll('.flight_search_sector_info span:nth-child(2)');
        if (!flightInfo || flightInfo.length < 2) return;

        // Collect all flight dates
        const flightDates = Array.from(flightInfo).map(span => span.textContent.trim());

        // Parse the dates
        const parsedDates = flightDates.map((dateStr) => {
            let [day, month, year] = dateStr.split(/\s+/);
            day = parseInt(day, 10);
            month = new Date(`${month} 1`).getMonth(); // Convert month name to index

            if (!year) {
                // Handle missing year by inferring it
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                const assumedYear = (month < currentMonth && month < 2) ? currentYear + 1 : currentYear;
                year = assumedYear;
            }

            return new Date(year, month, day);
        });

        // Sort dates in ascending order
        parsedDates.sort((a, b) => a - b);

        // Calculate differences between consecutive dates
        for (let i = 0; i < parsedDates.length - 1; i++) {
            const diff = Math.floor((parsedDates[i + 1] - parsedDates[i]) / (1000 * 60 * 60 * 24));

            if (diff > 1) {
                // Find the destination div and ensure no days span is already added
                const destinationDivs = document.querySelectorAll('.flight_search_destination');
                if (destinationDivs.length >= 2) {
                    const secondDestinationDiv = destinationDivs[1];

                    // Check if a span with the ID already exists
                    if (!secondDestinationDiv.querySelector(`[id^="days-span-"]`)) {
                        const daysSpan = createDaysSpan(`${diff}D`);
                        secondDestinationDiv.appendChild(daysSpan);
                    }
                }
            }
        }
    }

    function processDatesAndCalculateDays() {
        const cells = document.querySelectorAll("td.text-center span.fw-bold:first-of-type");

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-based index (0 = January)

        for (const cell of cells) {
            const text = cell.textContent.trim();
            const matches = text.match(/(\d{2}\s[A-Za-z]+)(\s\d{4})?/g); // Match dates with or without year

            if (matches && matches.length > 1) {
                // Parse dates and handle missing years
                const parsedDates = matches.map((dateStr) => {
                    let [day, month, year] = dateStr.split(/\s+/);
                    day = parseInt(day, 10);
                    month = new Date(`${month} 1`).getMonth(); // Convert month name to index

                    if (!year) {
                        // Handle missing year by inferring it
                        const assumedYear = (month < currentMonth && month < 2) ? currentYear + 1 : currentYear;
                        year = assumedYear;
                    }

                    return new Date(year, month, day);
                });

                // Sort dates
                parsedDates.sort((a, b) => a - b);

                // Calculate differences between consecutive dates
                for (let i = 0; i < parsedDates.length - 1; i++) {
                    const diff = Math.floor((parsedDates[i + 1] - parsedDates[i]) / (1000 * 60 * 60 * 24));

                    if (diff > 1 && !cell.parentNode.querySelector(`[id^="days-span-"]`)) {
                        const daysSpan = createDaysSpan(`${diff} Days`);
                        cell.parentNode.insertBefore(daysSpan, cell.nextSibling);
                    }
                }
            }
        }

        processFlightDates(); // Retain this to process flight-specific dates if needed
    }

    function observeDOM() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Re-run the function if any spans are missing
                    const missingSpans = document.querySelectorAll('[id^="days-span-"]').length === 0;
                    if (missingSpans) {
                        processDatesAndCalculateDays();
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    processDatesAndCalculateDays(); // Initial execution
    observeDOM(); // Start observing for changes
})();

// Putting copy button and creating Whatsapp Message text
(function () {
    'use strict';

    // Helper function to create and style a copy button
    function createCopyButton(parent, id, text) {
        let button = document.getElementById(id);
        if (!button) {
            button = document.createElement('button');
            button.id = id;
            button.innerText = 'Copy';
            button.className = 'button h-40 px-24 -dark-1 bg-blue-1 text-white"'; // Add your preferred styling classes
            button.style.marginLeft = '10px';
            button.style.color = 'white';
            parent.appendChild(button);

            // Add click event to copy text to clipboard
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(text).then(() => {
                    // Change button text and color to indicate success
                    button.textContent = 'Done';
                    button.style.color = 'black';

                    // Revert back to original state after 1 seconds
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.style.backgroundColor = '#007bff';
                    }, 1000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        } else {
            // Update the button's text if it already exists
            button.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                    // alert('Copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            };
        }
        return button;
    }

    // Header processing function
    function processHeaders(container, headerTexts) {
        const airlineHeaders = document.querySelectorAll('tr.airline td .d-flex');

        airlineHeaders.forEach((targetDiv) => {
            const h4Text = targetDiv.querySelector('h4') ? targetDiv.querySelector('h4').innerText.trim() : 'unknown';
            const nextRow = targetDiv.closest('tr').nextElementSibling;
            const airlineCode = nextRow?.querySelector('.flight-number')?.innerText.trim().substring(0, 2) || 'xx';

            const id = `${airlineCode}-${h4Text.replace(/\s+/g, '-')}-Head`;

            if (!(id in headerTexts)) {
                headerTexts[id] = ''; // Initialize text storage for this header
            }

            createCopyButton(targetDiv.parentElement, id, headerTexts[id]);
        });

        return headerTexts;
    }

    // Helper function to process individual rows
    function processRow(row, rowIndex, currentHeaderId, headerTexts, processedRows, prevRowDetails) {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 6) return;

        const durationElement = row.querySelector('span[id^="days-span"]');
        const duration = durationElement ? durationElement.innerText.trim() : '';

        const dates = cells[0].querySelector('span.fw-bold')?.innerText.trim().split('\n') || [];
        const flightNumbers = cells[1].querySelector('.flight-number')?.innerText.trim().split('\n') || [];
        const routes = cells[2].querySelector('span.fw-bold')?.innerText.trim().split('\n') || [];
        const times = cells[3].querySelector('span.fw-bold')?.innerText.trim().split('\n') || [];
        const price = cells[6].querySelector('.price-format span:nth-child(2)')?.innerText.trim().replace(/,/g, '') || '';

        // **Header Aggregation Logic** (unchanged)
        let headerMessageText = `*FARE ${price}*`;
        if (prevRowDetails?.prevFare === price && prevRowDetails?.prevDuration === duration) {
            headerMessageText = ''; // Skip fare and duration
        } else {
            headerMessageText = `\n*FARE ${price}* ${duration ? `\`${duration}\`` : '\n'}`;
        }

        // **Individual Row Message Logic** (always include fare and duration)
        let individualMessageText = `*FARE ${price}* ${duration ? `\`${duration}\`` : '\n'}`;
        if (flightNumbers.length > 0 && dates.length > 0 && routes.length > 0 && times.length > 0) {
            for (let i = 0; i < flightNumbers.length; i++) {
                const flight = flightNumbers[i]?.replace(/\s+/g, '') || '';
                const date = dates[i]?.replace(/\s+/g, '').replace(/\d{4}/g, '').toUpperCase() || '';
                const route = routes[i]?.replace(/\s+/g, '').replace(/-/g, '') || '';
                const time = times[i]?.replace(/:/g, '').replace(/-/g, ' ') || '';

                // Conditionally add '\n' only if there are multiple lines
                const prefix = flightNumbers.length > 1 ? '\n' : '';
                const flightInfo = `${prefix}\`\`\`${flight} ${date} ${route} ${time}\`\`\``;

                headerMessageText += flightInfo;
                individualMessageText += flightInfo;
            }
        }

        // Attach individual copy button with its specific message
        createCopyButton(cells[5], `${currentHeaderId}-r${rowIndex}`, individualMessageText);

        // Aggregate message text for headers
        if (currentHeaderId && headerTexts[currentHeaderId] !== undefined) {
            headerTexts[currentHeaderId] += headerMessageText + '\n';
        }

        processedRows.add(row);

        // Store current row details for comparison with the next row
        return {
            prevFare: price,
            prevDuration: duration
        };
    }


    window.addEventListener('load', function () {
        const container = document.getElementById('colcontent');
        if (!container) return;

        const processedRows = new Set();
        let headerTexts = {};
        let prevRowDetails = null;

        function processRows() {
            const rows = container.querySelectorAll('tr');
            let currentHeaderId = '';

            rows.forEach((row, index) => {
                const airlineHeader = Array.from(document.querySelectorAll('tr.airline td .d-flex')).find(
                    (div) => div.closest('tr') === row
                );

                if (airlineHeader) {
                    const h4Text = airlineHeader.querySelector('h4')?.innerText.trim() || 'unknown';
                    const nextRow = airlineHeader.closest('tr').nextElementSibling;
                    const airlineCode = nextRow?.querySelector('.flight-number')?.innerText.trim().substring(0, 2) || 'xx';
                    currentHeaderId = `${airlineCode}-${h4Text.replace(/\s+/g, '-')}-Head`;
                    prevRowDetails = null; // Correctly resets for a new header
                } else {
                    if (!processedRows.has(row)) {
                        prevRowDetails = processRow(row, index, currentHeaderId, headerTexts, processedRows, prevRowDetails);
                    }
                }
            });
        }

        const observer = new MutationObserver(() => {
            processHeaders(container, headerTexts);
            processRows();
        });

        observer.observe(container, { childList: true, subtree: true });
        headerTexts = processHeaders(container, headerTexts);
        processRows();
    });
})();

// Putting copy button in seats booking webpage
(function () {
    'use strict';

    // Function to create a "Copy" button
    function createCopyButton(div, id, formattedTextCallback) {
        let button = document.getElementById(id);
        if (!button) {
            // Find the first image in the div
            let imageElement = div.querySelector('.flight_logo img');
            if (imageElement) {
                button = document.createElement('button');
                button.id = id;
                button.innerText = 'Copy';
                button.className = 'btn bg-dark-4 btn_sm text-white';

                // Insert the button in place of the image
                imageElement.parentElement.replaceChild(button, imageElement);

                // Add the copy functionality
                button.addEventListener('click', () => {
                    const formattedText = formattedTextCallback();
                    navigator.clipboard.writeText(formattedText).then(() => {
                        button.textContent = 'Done';
                        setTimeout(() => {
                            button.textContent = 'Copy';
                        }, 1000);
                    }).catch(err => {
                        console.error('Failed to copy text:', err);
                    });
                });
            }
        }
    }

    // Function to extract and format the div content
    function formatDivContent(div) {
        let message = '';

        // Extract fare (Adult Price)
        let fareElement = div.querySelector('.flight_search_middel:nth-of-type(5) .fw-bold');
        let fare = fareElement ? fareElement.textContent.trim().replace(/PKR|,/g, '').trim() : '0';
        message += `*FARE ${fare}*`;

        // Extract days
        let daysElement = div.querySelector('#days-span-1');
        let days = daysElement ? daysElement.textContent.trim() : '';
        message += days !== '' ? ` \`${days}\`` : '';

        // Extract seats
        let seatsElement = div.querySelector('.flight_search_middel:nth-of-type(6) .text-white');
        let seats = seatsElement ? seatsElement.textContent.trim() : '0';
        message += ` 💺(${seats})\n`;

        // Extract sector information
        let sectors = div.querySelectorAll('.flight_search_sector_info');
        sectors.forEach((sector, index) => {
            let details = Array.from(sector.querySelectorAll('span.fw-bold')).map(el => el.textContent.trim());
            if (details.length >= 4) {
                let flight = details[0].replace(/\s/g, '');
                let date = details[1].toUpperCase().replace(/\s/g, '').replace(/\d{4}/, '');
                let route = details[2].replace(/-/g, '');
                let times = details[3].replace(/:/g, '');

                message += `\`\`\`${flight} ${date} ${route} ${times}\`\`\`\n`;
            }
        });

        return message.trim();
    }

    // Function to observe changes to the seats element
    function observeSeatsChange(div, buttonId, formattedTextCallback) {
        let seatsElement = div.querySelector('.flight_search_middel:nth-of-type(6) .text-white');
        if (seatsElement) {
            const observer = new MutationObserver(() => {
                // Update button with the latest formatted text
                const button = document.getElementById(buttonId);
                if (button) {
                    button.remove(); // Remove the old button to ensure updated data
                }
                createCopyButton(div, buttonId, formattedTextCallback);
            });

            observer.observe(seatsElement, { childList: true, subtree: true, characterData: true });
        } else {
            console.error('Seats element not found for observation.');
        }
    }

    // Main logic
    window.addEventListener('load', function () {
        let targetDiv = document.querySelector('.multi_city_flight_lists');
        if (!targetDiv) {
            console.error('Target div not found.');
            return;
        }

        // Define a callback to always get the latest formatted text
        const formattedTextCallback = () => formatDivContent(targetDiv);

        // Create the initial "Copy" button
        createCopyButton(targetDiv, 'copy-button', formattedTextCallback);

        // Observe changes to the seats value
        observeSeatsChange(targetDiv, 'copy-button', formattedTextCallback);
    });
})();

// Find the maximum number of adults allowed for booking seats
(function() {
    'use strict';

   // Function to create an iframe and load the target page
    function createIframe(url) {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => resolve(iframe);
        });
    }

   // Function to simulate setting the number of adults
    async function setAdults(iframe, num) {
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
                }, 0); // Adjust delay as necessary
            } else {
                resolve(false);
            }
        });
    }

    async function findMaxAdults(url) {
        const iframe = await createIframe(url);
        let maxAdults = 0;

        for (let i = 1; i <= 200; i++) {
            let isValid = await setAdults(iframe, i);
            if (!isValid) {
                maxAdults = i - 1;
                break;
            } else {
                maxAdults = i; // Update maxAdults to the current valid number
            }
        }

        document.body.removeChild(iframe); // Clean up

       // Find the parent div and replace the 5th flight_search_middel div
        const parentDiv = document.querySelector('.flight_multis_area_wrapper');
        if (parentDiv) {
            const flightSearchMiddles = parentDiv.querySelectorAll('.flight_search_middel');
            if (flightSearchMiddles.length >= 5) {
               // Create and insert the new div
                const newDiv = document.createElement('div');
                newDiv.className = 'flight_search_middel';
                newDiv.style.justifyContent = 'center';
                newDiv.innerHTML = `
                    <div class="flight_search_destination">
                        <p class="text-center">Seats</p>
                        <span class="text-white rounded-100 py-4 px-10 text-center text-14 fw-500 bg-danger">${maxAdults}</span>
                    </div>
                `;

               // Insert the new div before the 5th flight_search_middel
                const referenceDiv = flightSearchMiddles[4]; // 0-based index for 5th element
                parentDiv.insertBefore(newDiv, referenceDiv);

               // Remove the old 5th flight_search_middel div
                referenceDiv.parentElement.removeChild(referenceDiv);
            }
        }
    }

   // Run the function with the current page's URL
    const currentURL = window.location.href;
    findMaxAdults(currentURL);
})();