// ==UserScript==
// @name         TNT Enhanced Automation
// @namespace    tnt_enhancement
// @version      0.2
// @description  This script automates tasks on the Skypass ticket portal, including adding functionality to display days between dates, and streamlining user interaction.
// @downloadURL	 https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/tnt_enhancement.user.js
// @updateURL    https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/tnt_enhancement.user.js
// @author       Rana Furqan
// @match        https://travelnetwork.pk/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=travelnetwork.pk
// @grant        none
// ==/UserScript==

// Function to Redirects from Dashboard to Groups page
(function() {
    'use strict';

    // Check if the current URL is the dashboard URL
    if (window.location.href === "https://travelnetwork.pk/admin/new/booking") {
        // Redirect to the groups page
        window.location.href = "https://travelnetwork.pk/admin/booking/groups?type=0&airline_id=0";
    }
})();

// Replace airport city names with their IATA codes
(function() {
    'use strict';

    // Mapping of city names to IATA codes
    const cityToIATA = {
        " TO ": "-", "Dadu": "DDU", "Bhagatanwala": "BHW", "Bannu": "BNP", "Bahawalnagar": "WGB", "Bahawalpur": "BHV", "Chitral": "CJL", "Chilas": "CHB", "Dalbandin": "DBA", "Dera Ghazi Khan": "DEA", "Dera Ismael Khan": "DSK", "Faisalabad": "LYP", "Gwadar": "GWD", "Gilgit": "GIL", "Islamabad": "ISB", "Jacobabad": "JAG", "Karachi": "KHI", "Hyderabad": "HDD", "Khuzdar": "KDD", "Kohat": "OHT", "Lahore": "LHE", "Loralai": "LRG", "Mangla": "XJM", "Muzaffarabad": "MFG", "Mianwali": "MWD", "Moenjodaro": "MJD", "Sindhri": "MPD", "Kamra": "ATG", "Multan": "MUX", "Nawabashah": "WNS", "Ormara Raik": "ORW", "Parachinar": "PAJ", "Panjgur": "PJG", "Pasni": "PSI", "Peshawar": "PEW", "Quetta": "UET", "Rahim Yar Khan": "RYK", "Rawalakot": "RAZ", "Sibi": "SBQ", "Skardu": "KDU", "Mirpur Khas": "SKZ", "Sehwan Sharif": "SYW", "Sargodha": "SGI", "Saidu Sharif": "SDT", "Sialkot": "SKT", "Sui": "SUL", "Sawan Gas Field": "RZS", "Tarbela": "TLB", "Badin": "BDN", "Taftan": "TFT", "Turbat": "TUK", "Waana": "WAF", "Fort Sandeman": "PZH", "Bhurban": "BHC", "Campbellpore": "CWP", "Gujrat": "GRT", "Kadanwari": "KCF", "Chagai": "REQ", "Zamzama Gas Field": "ZIZ", "Abha": "AHB", "Hofuf": "HOF", "Al-Baha": "ABT", "Bisha": "BHH", "Dammam": "DMM", "Dawadmi": "DWD", "Dhahran": "DHA", "Jizan": "GIZ", "Buraidah": "ELQ", "Gurayat": "URY", "Ha'il": "HAS", "Jubail": "QJB", "Jeddah": "JED", "King Khaled Military City": "KMC", "Khamis Mushait": "KMX", "Medina": "MED", "Najran": "EAM", "Sharma": "NUM", "Qaisumah": "AQI", "Rafha": "RAH", "Riyadh": "RUH", "Arar": "RAE", "Sharurah": "SHW", "Al-Jawf": "AJF", "As-Sulayyil": "SLF", "Tabuk": "TUU", "Taif": "TIF", "Turaif": "TUI", "Wadi Al Dawasir": "WAE", "Al Wajh": "EJH", "Yanbu": "YNB", "Zilfi": "ZUL", "Hanak": "RSI", "Al Ula": "ULH", "Dubai": "DXB", "Muscat": "MCT", "SHARJAH": "SHJ",
    };

    // Function to replace city names with IATA codes
    function replaceCityNamesWithIATA() {
        // Iterate through all text nodes on the page
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while ((node = walker.nextNode())) {
            for (const [city, iata] of Object.entries(cityToIATA)) {
                const regex = new RegExp(`\\b${city}\\b`, "gi");
                if (regex.test(node.nodeValue)) {
                    node.nodeValue = node.nodeValue.replace(regex, iata);
                }
            }
        }
    }

    // Re-run the function whenever the DOM updates
    function observeDOMChanges() {
        const observer = new MutationObserver(() => replaceCityNamesWithIATA());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener("load", () => {
        replaceCityNamesWithIATA();
        observeDOMChanges();
    });
})();

// Function to calculate days between dates
(function() {
    'use strict';

    let spanCounter = 1; // Counter to generate unique IDs

    // Function to parse date in DD-MM-YYYY format
    function parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD format
    }

    // Function to calculate days between dates
    function calculateDays(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = parseDate(date1);
        const secondDate = parseDate(date2);
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
    }

    // Function to create a span element for days
    function createDaysSpan(textContent) {
        const span = document.createElement('span');
        span.className = 'fw-bold';
        span.style.fontSize = "0.8em";
        span.style.color = "rgb(35, 138, 237)";
        span.textContent = `${textContent}`;
        span.id = `days-span-${spanCounter++}`; // Assign a unique ID
        return span;
    }

    // Function to process each row and append the days span
    function processTableRows() {
        const rows = document.querySelectorAll('tr.main_click');
        for (const row of rows) {
            const dateCell = row.querySelector('td:first-child');
            if (!dateCell) continue;

            const dateMatches = dateCell.textContent.match(/\d{2}-\d{2}-\d{4}/g); // Match dates in DD-MM-YYYY format
            if (dateMatches && dateMatches.length >= 2) {
                const [date1, date2] = dateMatches;
                const days = calculateDays(date1, date2);

                // Check if a span with the ID already exists
                if (!dateCell.querySelector(`[id^="days-span-"]`)) {
                    const daysSpan = createDaysSpan(`${days}-DAYS`);
                    dateCell.appendChild(daysSpan); // Append the span to the cell
                }
            }
        }
    }

    // Observe DOM changes to dynamically handle new rows
    function observeDOM() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    processTableRows(); // Process new rows
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    processTableRows(); // Initial execution
    observeDOM(); // Start observing for changes
})();

// Put Copy button in each row to copy whatsapp formatted text
(function () {
    'use strict';

    // Generate the WhatsApp message for a row
    function generateWhatsAppMessage(row, includeFareAndDuration = true) {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 7) {
            return '';
        }

        function formatDate(date) {
            const [day, month, year] = date.split('-');
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            return `${day}${monthNames[parseInt(month, 10) - 1]}`;
        }

        const dateCell = cells[0].textContent.split('\n').map(item => item.trim());
        const flightCell = cells[1].textContent.split('\n').map(item => item.trim());
        const routeCell = cells[2].textContent.split('\n').map(item => item.trim());
        const timeCell = cells[3].textContent.split('\n').map(item => item.trim().replace(/[:\- ]/g, ''));
        const priceCell = cells[6].textContent.trim().replace(' PKR/-', '');

        let firstDate = dateCell[1] || 'N/A';
        let secondDate = dateCell[2] || 'N/A';
        let duration = dateCell.find(item => item.includes('-DAYS')) || 'N/A';
        let firstFlight = flightCell[1] || 'N/A';
        let secondFlight = flightCell[2] || 'N/A';
        let firstRoute = routeCell[1] || 'N/A';
        let secondRoute = routeCell[2] || 'N/A';
        let firstTime = timeCell[1] || 'N/A';
        let secondTime = timeCell[2] || 'N/A';
        let thirdTime = timeCell[3] || 'N/A';
        let fourthTime = timeCell[4] || 'N/A';

        let message = '';
        if (includeFareAndDuration) {
            message = `\n*FARE ${priceCell}*`;
            if (duration !== 'N/A') {
                message += ` \`${duration}\``;
            }
        }
        message += `\n\`\`\`${firstFlight.split(' ')[0]} ${formatDate(firstDate)} ${firstRoute.replace(/\s+/g, '')} ${firstTime} ${secondTime}\`\`\``;
        if (secondDate === 'N/A') {
            if (secondFlight !== 'N/A' || secondRoute !== 'N/A' || thirdTime !== 'N/A' || fourthTime !== 'N/A') {
                message += `\n\`\`\`${secondFlight.split(' ')[0]} ${formatDate(firstDate)} ${secondRoute.replace(/\s+/g, '')} ${thirdTime} ${fourthTime}\`\`\``;
            }
        } else {
            message += `\n\`\`\`${secondFlight.split(' ')[0]} ${formatDate(secondDate)} ${secondRoute.replace(/\s+/g, '')} ${thirdTime} ${fourthTime}\`\`\``;
        }
        return message;
    }

    // Create or update a copy button
    function createCopyButton(parent, id, isHeader, rows, headerIndex) {
        let button = document.getElementById(id);
        if (!button) {
            button = document.createElement('button');
            button.id = id;
            button.className = 'copy-button';
            parent.appendChild(button);
        }

        button.textContent = isHeader ? 'Copy All' : 'Copy';
        button.style.padding = '5px 10px';
        button.style.fontSize = '12px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = isHeader ? 'white' : '#007bff';
        button.style.color = isHeader ? 'blue' : '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';

        button.onclick = () => {
            const messages = [];
            let lastFare = null;
            let lastDuration = null;

            if (isHeader) {
                for (let i = headerIndex + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.matches('.header-row tr')) break; // Stop at the next header
                    const cells = row.getElementsByTagName('td');
                    const currentFare = cells[6]?.textContent.trim().replace(' PKR/-', '') || null;
                    const currentDuration = cells[0]?.textContent.split('\n').find(item => item.includes('-DAYS')) || null;

                    const includeFareAndDuration = currentFare !== lastFare || currentDuration !== lastDuration;

                    const message = generateWhatsAppMessage(row, includeFareAndDuration);
                    if (message) messages.push(message);

                    lastFare = currentFare;
                    lastDuration = currentDuration;
                }
            } else {
                const message = generateWhatsAppMessage(parent.parentElement);
                if (message) messages.push(message);
            }

            const fullMessage = messages.join('\n');
            navigator.clipboard.writeText(fullMessage).then(() => {
                button.style.color = 'black';
                button.style.backgroundColor = 'lightgreen';
                setTimeout(() => {
                    button.style.backgroundColor = isHeader ? 'white' : '#007bff';
                }, 1000);
            }).catch(err => console.error('Failed to copy text:', err));
        };

        return button;
    }

    // Process all rows
    function processTable() {
        const rows = document.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const isHeader = row.matches('.header-row tr');
            const cells = row.getElementsByTagName('td');
            const targetCell = isHeader ? row.lastElementChild : cells[5]; // Adjust column for button
            if (targetCell) {
                createCopyButton(targetCell, `copy-button-${index}`, isHeader, rows, index);
            }
        });
    }

    // Wait for the table rows to be available and then process them
    function waitForRows() {
        const observer = new MutationObserver(() => {
            processTable();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        processTable(); // Initial processing
    }

    waitForRows();
})();

// Find the maximum number of adults allowed for booking seats
(function () {
    'use strict';

    // Check if the current URL matches the desired pattern
    const currentURL = window.location.href;
    if (!currentURL.startsWith('https://travelnetwork.pk/admin/booking/create/')) {
        return; // Exit the function if the URL doesn't match
    }

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

    // Function to set adults to 500, click "Confirm Seats," and extract popup text
    async function checkSeats(iframe) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const adultInput = iframe.contentDocument.querySelector('#adults');
        const confirmButton = iframe.contentDocument.querySelector('.btn.cust_btnn.bg_blue.rounded.text-white.btn-block');

        if (!adultInput || !confirmButton) {
            return "Input fields or button not found";
        }

        adultInput.value = 500;
        const inputEvent = new Event('input', { bubbles: true });
        adultInput.dispatchEvent(inputEvent);

        confirmButton.click();

        return new Promise((resolve) => {
            setTimeout(() => {
                const popup = iframe.contentDocument.querySelector('#swal2-content');
                if (popup) {
                    const match = popup.innerText.match(/\d+/); // Extract the first number
                    resolve(match ? match[0] : '0');
                } else {
                    resolve("Popup not found");
                }
            }, 1000); // Adjust delay as necessary
        });
    }

    async function findSeats(url) {
        const iframe = await createIframe(url);
        const extractedNumber = await checkSeats(iframe);

        document.body.removeChild(iframe); // Clean up

        // Append the extracted number to the specified h4 element
        const heading = document.querySelector('h4.text-black.pl-2.font-weight-bold');
        if (heading) {
            const span = document.createElement('span');
            span.style.color = 'red';
            span.style.marginLeft = '10px';
            span.textContent = `(${extractedNumber} Seats Available)`;
            heading.appendChild(span);
        }
    }

    // Run the function if the URL matches the pattern
    findSeats(currentURL);
})();

//Find Max Seats in each flight
// (function () {
//     'use strict';

//     function createIframe() {
//         const iframe = document.createElement('iframe');
//         iframe.style.display = 'none';
//         document.body.appendChild(iframe);
//         return iframe;
//     }

//     async function checkSeats(iframe) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         const adultInput = iframe.contentDocument.querySelector('#adults');
//         const confirmButton = iframe.contentDocument.querySelector('.btn.cust_btnn.bg_blue.rounded.text-white.btn-block');

//         if (!adultInput || !confirmButton) {
//             return "Input fields or button not found";
//         }

//         adultInput.value = 500;
//         adultInput.dispatchEvent(new Event('input', { bubbles: true }));

//         confirmButton.click();

//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 const popup = iframe.contentDocument.querySelector('#swal2-content');
//                 const match = popup ? popup.innerText.match(/\d+/) : null;
//                 resolve(match ? match[0] : '0');
//             }, 1000);
//         });
//     }

//     async function findMaxAdults(iframe, url) {
//         return new Promise((resolve) => {
//             iframe.src = url;
//             iframe.onload = async () => {
//                 const extractedNumber = await checkSeats(iframe);
//                 const pathOnly = url.replace(window.location.origin, '');
//                 const button = document.querySelector(`a[href="${pathOnly}"].btn-book`);

//                 if (button) {
//                     const seatText = extractedNumber;
//                     button.textContent = `HK${seatText}`;
//                 }

//                 resolve();
//             };
//         });
//     }

//     async function processAllUrls(buttons) {
//         const iframe = createIframe();

//         for (let i = 0; i < buttons.length; i++) {
//             const sectorURL = buttons[i].href;
//             await findMaxAdults(iframe, sectorURL);
//             await new Promise((resolve) => setTimeout(resolve, 50));
//         }

//         document.body.removeChild(iframe);
//     }

//     function waitForButtons() {
//         const observer = new MutationObserver((mutationsList, observer) => {
//             const buttons = document.querySelectorAll('a.btn-book');
//             if (buttons.length > 0) {
//                 processAllUrls(buttons);
//                 observer.disconnect();
//             }
//         });

//         observer.observe(document.body, { childList: true, subtree: true });
//     }

//     waitForButtons();
// })();
