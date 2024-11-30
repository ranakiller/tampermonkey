// ==UserScript==
// @name         TNT Enhanced Automation
// @namespace    tnt_enhancement
// @version      0.1
// @description  This script automates tasks on the Skypass ticket portal, including adding functionality to display days between dates, and streamlining user interaction.
// @downloadURL	 https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/tnt_enhancement.js
// @updateURL    https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/tnt_enhancement.js
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

// Putting TextAreas and creating Whatsapp Message text
(function () {
    'use strict';

    // Function to create or update a textarea in a cell
    function createOrUpdateTextarea(parent, id, text = '', styles = {}) {
        let textarea = document.getElementById(id);
        if (!textarea) {
            // Create the textarea if it doesn't exist
            textarea = document.createElement('textarea');
            textarea.id = id;
            parent.appendChild(textarea);
        }
        Object.assign(textarea.style, {
            width: styles.width || '70px',
            height: styles.height || '20px',
            fontSize: styles.fontSize || '10px',
            overFlow: styles.overflow = 'hidden',
            margin: styles.padding = '2px',
            reSize: styles.resize = 'none',
            ...styles,
        });
        textarea.className = 'form-control';
        textarea.value = text; // Insert the text (this could be the WhatsApp message or any other text)
        return textarea;
    }

    // Function to generate the WhatsApp message text
    function generateWhatsAppMessage(row, rowIndex) {
        const cells = row.getElementsByTagName('td');
        // Ensure the row has enough cells
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
        // Initialize the message with price
        let message = `*FARE ${priceCell}*`;

        // Add duration only if available
        if (duration !== 'N/A') {
            message += ` \`${duration}\``;
        }

        // Add the first line (always include the first date details)
        message += `\n\`\`\`${firstFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(firstRoute).replace(/\s+/g, '')} ${firstTime}${secondTime}\`\`\``;

        // Handle the second line logic
        if (secondDate === 'N/A') {
            // If second date is missing, use first date for second line details
            // Ensure second flight, route, and times are valid before adding the second line
            if (secondFlight !== 'N/A' || secondRoute !== 'N/A' || thirdTime !== 'N/A' || fourthTime !== 'N/A') {
                message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(firstDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
            }
        } else {
            // If second date is available, add the second line normally
            message += `\n\`\`\`${secondFlight.replace(' ', '')} ${formatDate(secondDate)} ${replaceCityNamesWithIATA(secondRoute).replace(/\s+/g, '')} ${thirdTime}${fourthTime}\`\`\``;
        }

        return message;
    }

    // Function to process and append WhatsApp message to a row
    function processRow(row, rowIndex, isHeaderRow = false) {
        const message = generateWhatsAppMessage(row, rowIndex);
        if (!message) {
            return;
        }

        const cells = row.getElementsByTagName('td');
        const targetCell = isHeaderRow ? cells[-1] : cells[5]; // Adjust target cell for header rows
        createOrUpdateTextarea(targetCell, `textarea-${rowIndex + 1}`, message);
    }

    // Function to process the table rows and add textareas
    function processTableRows() {
        const rows = document.querySelectorAll('tr.main_click, thead tr'); // Include header rows as well
        if (rows.length === 0) {
            return;
        }

        rows.forEach((row, index) => {
            // Check if the row is a header (assuming a specific class or identifier)
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

// put text areas in header rows
(function () {
    'use strict';

    // Function to add a single textarea at the end of each header row
    function addTextareasToHeaderRows() {
        // Select all header rows within the thead
        const headerRows = document.querySelectorAll('.header-row tr');

        if (headerRows.length > 0) {
            headerRows.forEach(row => {
                // Add a single textarea at the end of the row if not already present
                const lastCell = row.lastElementChild; // Get the last cell in the row
                if (lastCell && !lastCell.querySelector('textarea')) {
                    const textarea = document.createElement('textarea');
                    textarea.style.height = '30px';
                    textarea.style.overflow = 'hidden';
                    textarea.style.resize = 'none';
                    textarea.style.padding = '2px';
                    textarea.className = 'form-control';

                    // Append the textarea at the end of the row
                    lastCell.appendChild(textarea);
                }
            });
        } else {
            console.error('No header rows found.');
        }
    }

    // Function to merge seat text into header textareas
    function mergeSeatTextsIntoHeaders() {
        const headerRows = document.querySelectorAll('.header-row tr');
        const allRows = document.querySelectorAll('tr'); // Select all rows in the table

        if (headerRows.length > 0) {
            let headerIndex = 0;

            // Iterate through all rows
            for (let i = 0; i < allRows.length; i++) {
                const row = allRows[i];

                // Check if the row is a header row
                if (row.matches('.header-row tr')) {
                    headerIndex = i; // Mark the current header row index
                } else if (i > headerIndex) {
                    // It's a seat detail row
                    const seatTextarea = row.querySelector('textarea'); // Seat row textarea
                    const headerTextarea = allRows[headerIndex].querySelector('textarea'); // Header row textarea

                    if (seatTextarea && headerTextarea) {
                        // Merge the seat text into the header textarea
                        const seatText = seatTextarea.value.trim();
                        if (seatText) {
                            const currentHeaderText = headerTextarea.value.trim();
                            headerTextarea.value = currentHeaderText
                                ? `${currentHeaderText}\n\n${seatText}`
                                : seatText;
                        }
                    }
                }
            }
        }
    }

    // Wait for the header rows to be available
    function waitForHeaderRows() {
        const observer = new MutationObserver(() => {
            const headerRows = document.querySelectorAll('.header-row tr');
            if (headerRows.length > 0) {
                observer.disconnect();
                addTextareasToHeaderRows();
                mergeSeatTextsIntoHeaders();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start observing the DOM
    waitForHeaderRows();
})();
