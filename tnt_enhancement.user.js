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
                    const daysSpan = createDaysSpan(`${days}Nts`);
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

    // Function to create or update a copy button in a cell
    function createOrUpdateCopyButton(parent, id, text = '', styles = {}) {
        let button = document.getElementById(id);
        if (!button) {
            // Create the button if it doesn't exist
            button = document.createElement('button');
            button.id = id;
            button.textContent = 'Copy';
            button.className = 'copy-button';
            parent.appendChild(button);
        }

        Object.assign(button.style, {
            padding: styles.padding || '5px 10px',
            fontSize: styles.fontSize || '12px',
            cursor: 'pointer',
            backgroundColor: styles.backgroundColor || '#007bff',
            color: styles.color || '#fff',
            border: styles.border || 'none',
            borderRadius: styles.borderRadius || '4px',
            ...styles,
        });

        // Attach the copy functionality
        button.onclick = () => {
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Change button text and color to indicate success
                    button.textContent = 'Done';
                    button.style.color = 'black';
                    button.style.backgroundColor = 'lightgreen';

                    // Revert back to original state after 1 seconds
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.style.backgroundColor = styles.backgroundColor || '#007bff';
                    }, 1000);
                })
                .catch(err => console.error('Failed to copy text: ', err));
        };

        return button;
    }

    // Function to generate the WhatsApp message text (preserved original logic)
    function generateWhatsAppMessage(row, rowIndex) {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 7) {
            return '';
        }

        // Helper to format the date (e.g., 26-11-2024 -> 26NOV)
        function formatDate(date) {
            const [day, month, year] = date.split('-');
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            return `${day}${monthNames[parseInt(month, 10) - 1]}`;
        }

        // Mapping of city names to IATA codes
        const cityToIATA = {
            "Dadu": "DDU", "Bhagatanwala": "BHW", "Bannu": "BNP", "Bahawalnagar": "WGB", "Bahawalpur": "BHV", "Chitral": "CJL", "Chilas": "CHB", "Dalbandin": "DBA", "Dera Ghazi Khan": "DEA", "Dera Ismael Khan": "DSK", "Faisalabad": "LYP", "Gwadar": "GWD", "Gilgit": "GIL", "Islamabad": "ISB", "Jacobabad": "JAG", "Karachi": "KHI", "Hyderabad": "HDD", "Khuzdar": "KDD", "Kohat": "OHT", "Lahore": "LHE", "Loralai": "LRG", "Mangla": "XJM", "Muzaffarabad": "MFG", "Mianwali": "MWD", "Moenjodaro": "MJD", "Sindhri": "MPD", "Kamra": "ATG", "Multan": "MUX", "Nawabashah": "WNS", "Ormara Raik": "ORW", "Parachinar": "PAJ", "Panjgur": "PJG", "Pasni": "PSI", "Peshawar": "PEW", "Quetta": "UET", "Rahim Yar Khan": "RYK", "Rawalakot": "RAZ", "Sibi": "SBQ", "Skardu": "KDU", "Mirpur Khas": "SKZ", "Sehwan Sharif": "SYW", "Sargodha": "SGI", "Saidu Sharif": "SDT", "Sialkot": "SKT", "Sui": "SUL", "Sawan Gas Field": "RZS", "Tarbela": "TLB", "Badin": "BDN", "Taftan": "TFT", "Turbat": "TUK", "Waana": "WAF", "Fort Sandeman": "PZH", "Bhurban": "BHC", "Campbellpore": "CWP", "Gujrat": "GRT", "Kadanwari": "KCF", "Chagai": "REQ", "Zamzama Gas Field": "ZIZ", "Abha": "AHB", "Hofuf": "HOF", "Al-Baha": "ABT", "Bisha": "BHH", "Dammam": "DMM", "Dawadmi": "DWD", "Dhahran": "DHA", "Jizan": "GIZ", "Buraidah": "ELQ", "Gurayat": "URY", "Ha'il": "HAS", "Jubail": "QJB", "Jeddah": "JED", "King Khaled Military City": "KMC", "Khamis Mushait": "KMX", "Medina": "MED", "Najran": "EAM", "Sharma": "NUM", "Qaisumah": "AQI", "Rafha": "RAH", "Riyadh": "RUH", "Arar": "RAE", "Sharurah": "SHW", "Al-Jawf": "AJF", "As-Sulayyil": "SLF", "Tabuk": "TUU", "Taif": "TIF", "Turaif": "TUI", "Wadi Al Dawasir": "WAE", "Al Wajh": "EJH", "Yanbu": "YNB", "Zilfi": "ZUL", "Hanak": "RSI", "Al Ula": "ULH", "Dubai": "DXB", "Muscat": "MCT", "SHARJAH": "SHJ",
        };

        // Function to replace city names with IATA codes
        function replaceCityNamesWithIATA(text) {
            let result = text;
            for (const [city, iata] of Object.entries(cityToIATA)) {
                const regex = new RegExp(`\\b${city}\\b`, "gi");
                result = result.replace(regex, iata);
            }
            return result;
        }

        const dateCell = cells[0].textContent.split('\n').map(item => item.trim());
        const flightCell = cells[1].textContent.split('\n').map(item => item.trim());
        const routeCell = cells[2].textContent.split('\n').map(item => item.trim());
        const timeCell = cells[3].textContent.split('\n').map(item => item.trim().replace(' ', ''));
        const priceCell = cells[6].textContent.trim();

        let firstDate = dateCell[1] || 'N/A';
        let secondDate = dateCell[2] || 'N/A';
        let duration = dateCell.find(item => item.toLowerCase().includes('nts')) || 'N/A';

        let firstFlight = flightCell[1] || 'N/A';
        let secondFlight = flightCell[2] || 'N/A';

        let firstRoute = routeCell[1] || 'N/A';
        let secondRoute = routeCell[2] || 'N/A';

        let firstTime = timeCell[1] || 'N/A';
        let secondTime = timeCell[2] || 'N/A';
        let thirdTime = timeCell[3] || 'N/A';
        let fourthTime = timeCell[4] || 'N/A';

        // WhatsApp message format
        let message = `*FARE ${priceCell}*`;

        if (duration !== 'N/A') {
            message += ` \`${duration}\``;
        }

        message += `\n\`\`\`${firstFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(firstRoute).replace(/\s+/g, '')} ${firstTime}${secondTime}\`\`\``;

        if (secondDate === 'N/A') {
            if (secondFlight !== 'N/A' || secondRoute !== 'N/A' || thirdTime !== 'N/A' || fourthTime !== 'N/A') {
                message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
            }
        } else {
            message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(secondDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
        }

        return message;
    }

    // Function to process and append a copy button to a row
    function processRow(row, rowIndex, isHeaderRow = false) {
        const message = generateWhatsAppMessage(row, rowIndex);
        if (!message) {
            return;
        }

        const cells = row.getElementsByTagName('td');
        const targetCell = isHeaderRow ? cells[-1] : cells[5]; // Adjust target cell for header rows
        createOrUpdateCopyButton(targetCell, `copy-button-${rowIndex + 1}`, message);
    }

    // Function to process the table rows and add copy buttons
    function processTableRows() {
        const rows = document.querySelectorAll('tr.main_click, thead tr'); // Include header rows as well
        if (rows.length === 0) {
            return;
        }

        rows.forEach((row, index) => {
            const isHeaderRow = row.classList.contains('thead tr');
            processRow(row, index, isHeaderRow);
        });
    }

    // Wait for the table rows to be available and then process them
    function waitForRows() {
        const observer = new MutationObserver((mutations, observer) => {
            const rows = document.querySelectorAll('tr.main_click, thead tr');
            if (rows.length > 0) {
                observer.disconnect();
                processTableRows();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start the observation process
    waitForRows();

})();

// Put Copy Buttons for header rows
(function () {
    'use strict';

    // Function to generate the WhatsApp message text (copied from your logic)
    function generateWhatsAppMessage(row, rowIndex) {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 7) {
            return '';
        }

        function formatDate(date) {
            const [day, month, year] = date.split('-');
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            return `${day}${monthNames[parseInt(month, 10) - 1]}`;
        }

        const cityToIATA = {
            // "Dadu": "DDU", "Bhagatanwala": "BHW", "Bannu": "BNP",
        };

        function replaceCityNamesWithIATA(text) {
            let result = text;
            for (const [city, iata] of Object.entries(cityToIATA)) {
                const regex = new RegExp(`\\b${city}\\b`, "gi");
                result = result.replace(regex, iata);
            }
            return result;
        }

        const dateCell = cells[0].textContent.split('\n').map(item => item.trim());
        const flightCell = cells[1].textContent.split('\n').map(item => item.trim());
        const routeCell = cells[2].textContent.split('\n').map(item => item.trim());
        const timeCell = cells[3].textContent.split('\n').map(item => item.trim().replace(' ', ''));
        const priceCell = cells[6].textContent.trim();

        let firstDate = dateCell[1] || 'N/A';
        let secondDate = dateCell[2] || 'N/A';
        let duration = dateCell.find(item => item.toLowerCase().includes('nts')) || 'N/A';
        let firstFlight = flightCell[1] || 'N/A';
        let secondFlight = flightCell[2] || 'N/A';
        let firstRoute = routeCell[1] || 'N/A';
        let secondRoute = routeCell[2] || 'N/A';
        let firstTime = timeCell[1] || 'N/A';
        let secondTime = timeCell[2] || 'N/A';
        let thirdTime = timeCell[3] || 'N/A';
        let fourthTime = timeCell[4] || 'N/A';

        let message = `*FARE ${priceCell}*`;
        if (duration !== 'N/A') {
            message += ` \`${duration}\``;
        }
        message += `\n\`\`\`${firstFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(firstRoute).replace(/\s+/g, '')} ${firstTime}${secondTime}\`\`\``;
        if (secondDate === 'N/A') {
            if (secondFlight !== 'N/A' || secondRoute !== 'N/A' || thirdTime !== 'N/A' || fourthTime !== 'N/A') {
                message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
            }
        } else {
            message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(secondDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
        }
        return message;
    }

    // Function for the header row copy button
    function createHeaderCopyButton(headerRow, headerIndex, rows) {
        const headerCell = headerRow.lastElementChild;
        const button = document.createElement('button');
        button.textContent = 'Copy All flights of this Sector';
        button.style.backgroundColor = 'white';
        button.style.color = 'blue';
        button.style.padding = '5px 10px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        button.onclick = () => {
            const messages = [];
            for (let i = headerIndex + 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.matches('.header-row tr')) break; // Stop at the next header
                const message = generateWhatsAppMessage(row, i);
                if (message) messages.push(message);
            }

            const fullMessage = messages.join('\n\n');
            navigator.clipboard.writeText(fullMessage).then(() => {
                button.style.color = 'black';
                button.style.backgroundColor = 'lightgreen';
                setTimeout(() => {
                    button.style.backgroundColor = 'white';
                }, 1000);
            }).catch(err => console.error('Failed to copy text: ', err));
        };

        headerCell.appendChild(button);
    }

    // Main function to initialize header and row buttons
    function processTable() {
        const rows = document.querySelectorAll('tr');
        let headerIndex = -1;

        rows.forEach((row, index) => {
            if (row.matches('.header-row tr')) {
                createHeaderCopyButton(row, index, rows);
                headerIndex = index;
            }
        });
    }

    // Wait for the table rows to be available and then process them
    function waitForRows() {
        const observer = new MutationObserver((mutations, observer) => {
            const rows = document.querySelectorAll('tr');
            if (rows.length > 0) {
                observer.disconnect();
                processTable();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
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
