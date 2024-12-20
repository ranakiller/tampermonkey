// ==UserScript==
// @name         Skypass Ticketing Portal Enhancements
// @namespace    skypass_enhancements
// @version      12.6.24
// @description  This script automates tasks on the Skypass ticket portal, including adding functionality to display days between dates, and streamlining user interaction.
// @downloadURL	 https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/skypass_enhancements.user.js
// @updateURL    https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/skypass_enhancements.user.js
// @author       Rana Furqan
// @match        https://skypass.pk/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skypass.pk
// @grant        none
// ==/UserScript==

// This script automatically fills in the login details and clicks the login button on the Skypass ticket portal login page.
(function() {
    'use strict';

    window.addEventListener('load', function() {
        const emailField = document.querySelector('input[name="email"]');
        const passwordField = document.querySelector('input[name="password"]');

        if (emailField && passwordField) {
            emailField.value = 'skypass.umrah@gmail.com';
            passwordField.value = 'gzG3FUTUVfsAsi@';

            const loginButton = document.querySelector('#main_author_form button[type="submit"]');

            if (loginButton) {
                loginButton.click();
            }
        }
    });
})();

// Re-enable right-click on websites that disable it
(function() {
    'use strict';

    // Function to enable right-click
    const enableRightClick = () => {
        // Remove event listeners blocking right-click
        document.addEventListener('contextmenu', event => event.stopPropagation(), true);
        document.addEventListener('contextmenu', event => event.stopImmediatePropagation(), true);
        document.addEventListener('contextmenu', event => event.preventDefault(), true);
    };

    // Run the function after the page has loaded
    window.addEventListener('load', enableRightClick);
})();

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

// Add Custom Filter Buttons for 15 Days and 21 Days
(function () {
    'use strict';

    window.addEventListener('load', function () {
        const filterGroup = document.querySelector('.filter-button-group');

        if (filterGroup) {
            createFilterButton(filterGroup, 'btnradio15Days', '15 Days', filter15Days);
            createFilterButton(filterGroup, 'btnradio21Days', '21 Days', filter21Days);
        }

        function createFilterButton(parent, id, label, clickHandler) {
            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'btn-check top-filter-btn';
            input.name = 'btnradio';
            input.id = id;

            const buttonLabel = document.createElement('label');
            buttonLabel.className = 'btn btn-outline-primary';
            buttonLabel.setAttribute('for', id);
            buttonLabel.textContent = label;

            parent.appendChild(input);
            parent.appendChild(buttonLabel);

            input.addEventListener('click', clickHandler);
        }

        function filter15Days() {
            filterRows(days => days > 15); // Exclude rows with 15 days or less
        }

        function filter21Days() {
            filterRows(days => days <= 15); // Exclude rows with more than 15 days
        }

        function filterRows(condition) {
            const tableRows = document.querySelectorAll('table tbody tr');

            tableRows.forEach(row => {
                const daysSpan = row.querySelector('span[id^="days-span-"]');
                if (daysSpan) {
                    const daysText = daysSpan.textContent.trim();
                    const daysMatch = daysText.match(/(\d+)/);

                    if (daysMatch) {
                        const days = parseInt(daysMatch[1], 10);
                        if (condition(days)) {
                            row.remove();
                        }
                    }
                }
            });
        }
    });
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
            // console.error('Target div not found.');
            return;
        }

        const formattedTextCallback = () => formatDivContent(targetDiv);
        createCopyButton(targetDiv, 'copy-button', formattedTextCallback);
        observeSeatsChange(targetDiv, 'copy-button', formattedTextCallback);
    });
})();


// ----------- Fucntion for removing Blurry Overlay on Cancelled Bookings -----------
(function() {
    'use strict';

   // Wait for the page to be fully loaded
    window.addEventListener('load', function() {
       // Find the div with the class 'cancelled-overlay'
        const cancelledOverlayDiv = document.querySelector('.cancelled-overlay');

       // Check if the div exists
        if (cancelledOverlayDiv) {
           // Remove the 'cancelled-overlay' class
            cancelledOverlayDiv.classList.remove('cancelled-overlay');
        }
    });
})();

// Function to generate the MRZ and insert it into the row only on Cancelled Booking page
(function() {
    'use strict';

    // Select all rows with the class 'accordion-toggle'
    const rows = document.querySelectorAll('.accordion-toggle');

    rows.forEach(row => {
        // Extract the relevant details from each row
        const title = row.children[1].textContent.trim();
        const givenName = row.children[2].textContent.trim();
        const surName = row.children[3].textContent.trim();
        const passportNumber = row.children[4].textContent.trim();
        const dob = row.children[5].textContent.trim();
        const expiryDate = row.children[6].textContent.trim();
        const nationality = `PAK`;

        // MRZ Line 1: P<Nationality<<Surname<<Givenname<<<<<<<<<<<<<<<<< (Total 44 characters)
        let mrzLine1 = `P<${nationality}${givenName}<<${surName}`;
        mrzLine1 = padWithPlaceholders(mrzLine1, 44); // Pad to 44 characters

        // Determine gender based on the title
        const gender = (title === "Mr") ? "M" : "F";

        // Format DOB and Expiry Date to YYMMDD
        const dobFormatted = formatDateForMRZ(dob);
        const expiryFormatted = formatDateForMRZ(expiryDate);

        // MRZ Line 2: PassportNumber<CheckDigit<Nationality<DOB<CheckDigit<Gender<ExpiryDate<CheckDigit<<<<<<<<<<<<<<00 (Total 44 characters)
        let mrzLine2 = `${passportNumber}0${nationality}${dobFormatted}0${gender}${expiryFormatted}0<<<<<<<<<<<<<<00`;

        // Create a text input box for MRZ
        const mrzInput = document.createElement('input');
        mrzInput.type = 'text';
        mrzInput.value = `${mrzLine1}${mrzLine2}`; // MRZ lines combined into one string
        mrzInput.className = 'form-control';

        // Append the input box to the last cell of the row
        const lastTd = row.lastElementChild;
        lastTd.appendChild(mrzInput); // Append the MRZ input to the last <td>
    });

    // Helper function to format date to YYMMDD for MRZ
    function formatDateForMRZ(dateStr) {
        const months = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05',
            'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const [day, month, year] = dateStr.split(' ');
        return `${year.slice(2)}${months[month]}${day.padStart(2, '0')}`;
    }

    // Helper function to pad with '<' to reach the required length (44 characters for MRZ)
    function padWithPlaceholders(str, length) {
        return str.padEnd(length, '<');
    }

})();

// ----------- Function for putting Edit Booking Link -----------
(function() {
    'use strict';

   // Get the current URL
    let currentUrl = window.location.href;

   // Replace 'view-booking' with 'agent_ticket'
    let updatedUrl = currentUrl.replace("view-booking", "agent_ticket");

   // Find the target <td> element by its class
    let targetTd = document.querySelector("td.text-center.text-success");

   // If the element is found, update its content
    if (targetTd) {
        targetTd.innerHTML = `<a href="${updatedUrl}" class="text-success">Confirm</a>`;
    }
})();

// ----------- Function for Formatting DOB & DOE -----------
(function() {
    'use strict';

   // Function to format date from d/m/yy to dd mmm yyyy
    function formatDate(dateStr) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
        const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assuming 50 as the cutoff for year 2000 and above
        return `${('0' + day).slice(-2)} ${months[month - 1]} ${fullYear}`;
    }

   // Function to update date fields on blur
    function updateDateFields(event) {
        const target = event.target;
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2}$/;
        if (datePattern.test(target.value) && /^adult_(dob|passport_expiry)_\d+$/.test(target.id)) {
            target.value = formatDate(target.value);
        }
    }

   // Function to observe changes in the DOM
    function observeDOMChanges() {
        const target = document.querySelector('body');

        const observer = new MutationObserver(function(mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    document.querySelectorAll('[id^="adult_dob_"], [id^="adult_passport_expiry_"]').forEach(element => {
                        element.addEventListener('blur', updateDateFields);
                    });
                }
            }
        });

        observer.observe(target, { childList: true, subtree: true });
    }

   // Initial setup
    window.addEventListener('load', function() {
        document.querySelectorAll('[id^="adult_dob_"], [id^="adult_passport_expiry_"]').forEach(element => {
            element.addEventListener('blur', updateDateFields);
        });
        observeDOMChanges();
    });
})();

// -------------- Put Text Box for Bulk MRZs --------------
(function() {
    'use strict';

    function addMRZDiv() {
       // Select the first and second divs
        const firstDiv = document.querySelector('.custom_shadow.scrollsets');
        const secondDiv = document.querySelector('.table-responsive.no-data.settable-view');

        if (firstDiv && secondDiv) {
           // Create the new div
            const newDiv = document.createElement('div');
            newDiv.className = 'py-30 px-30 rounded-4 bg-white custom_shadow';
            newDiv.style.marginBottom = '30px'; // Add some space between the divs if needed

           // Create the text area
            const textArea = document.createElement('textarea');
            textArea.id = 'bulkMRZInput';
            textArea.placeholder = 'Paste MRZs here in Bulk';
            textArea.style.width = '100%';
            textArea.style.resize = 'both';
            textArea.style.fontFamily = 'Consolas, monospace'; // Set font to Consolas

           // Append the text area to the new div
            newDiv.appendChild(textArea);

           // Insert the new div after the first div and before the second div
            firstDiv.parentNode.insertBefore(newDiv, secondDiv);
        }
    }

   // Wait for the DOM to be fully loaded
    window.addEventListener('load', addMRZDiv);
})();

// -------------- Extract MRZs from raw passports OCRed data --------------
(function() {
    'use strict';

    function filterMRZData() {
        var textBox = document.getElementById('bulkMRZInput');
        if (!textBox) return;

        var rawData = textBox.value;
        var lines = rawData.split('\n');

       // MRZ format regex for full valid MRZ lines
        var mrzFullFormatRegex = /^P<.{43,44}[A-Z0-9<]{30,}$/;

       // Step 1: Process lines
        var filteredLines = lines.map(line => {
           // If the line matches the full MRZ format, leave it unchanged
            if (mrzFullFormatRegex.test(line)) {
                return line;
            }

           // Otherwise, apply the regular filtering logic
            if (!(/^P<.*$/.test(line) || /<\d{2}$/.test(line))) {
                return ''; // Filter out invalid lines
            }

           // Remove spaces from the line
            line = line.replace(/\s+/g, '');

           // Pad or trim the line to 44 characters if it starts with 'P<'
            if (line.startsWith('P<')) {
                if (line.length < 44) {
                    return line.padEnd(44, '<'); // Pad the line with '<' to 44 characters
                } else if (line.length > 44) {
                    return line.slice(0, 44); // Trim the line to 44 characters
                }
            }

            return line;
        }).filter(line => line); // Remove any empty lines after processing

       // Step 2: Merge lines in pairs if they are exactly 44 characters long
        var mergedLines = [];
        var tempLine = '';

        for (var i = 0; i < filteredLines.length; i++) {
            var currentLine = filteredLines[i];

            if (currentLine.length === 44) {
                if (tempLine) {
                   // Merge with the previous tempLine if it also has 44 characters
                    mergedLines.push(tempLine + currentLine);
                    tempLine = '';
                } else {
                   // Store the current line in tempLine for potential merging
                    tempLine = currentLine;
                }
            } else {
               // If current line is not 44 characters, push the tempLine as is (if any)
                if (tempLine) {
                    mergedLines.push(tempLine);
                    tempLine = '';
                }
               // Push the current line as is (since it’s not 44 characters long)
                mergedLines.push(currentLine);
            }
        }

       // Push any remaining tempLine that wasn’t merged
        if (tempLine) {
            mergedLines.push(tempLine);
        }

        var filteredData = mergedLines.join('\n');
        textBox.value = filteredData;

       // Update adults number after filtering
        updateAdultsNumber();
    }

    function updateAdultsNumber() {
        const bulkMRZInput = document.getElementById('bulkMRZInput');
        if (bulkMRZInput) {
            const mrzLines = bulkMRZInput.value.trim().split('\n').filter(line => line.trim() !== '');
            const adultsInput = document.getElementById('adults');
            if (adultsInput) {
                adultsInput.value = mrzLines.length;

               // Create and dispatch the 'change' event
                const changeEvent = new Event('change', { bubbles: true });
                adultsInput.dispatchEvent(changeEvent);

               // Create and dispatch the 'input' event
                const inputEvent = new Event('input', { bubbles: true });
                adultsInput.dispatchEvent(inputEvent);
            }
        }
    }

    function setupEventListener() {
        var textBox = document.getElementById('bulkMRZInput');
        if (!textBox) return;

        textBox.addEventListener('input', filterMRZData);
    }

    window.addEventListener('load', function() {
        setupEventListener();
        filterMRZData(); // Initial run to set up the adults number
    });

})();

// -------------- Put MRZ Text Box and fill data from it or fill dummy data --------------
(function() {
    'use strict';

   // Function to Format date as (dd mmm yyyy) from "yymmdd"(the output of MRZ)
    function formatMRZDateOutput(dateStr) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

       // Extract year, month, and day from the date string
        const year = dateStr.slice(0, 2); // Extract the first two characters for year
        const month = dateStr.slice(2, 4); // Extract the next two characters for month
        const day = dateStr.slice(4, 6); // Extract the last two characters for day

       // Determine the full year
        const fullYear = parseInt(year, 10) < 35 ? 2000 + parseInt(year, 10) : 1900 + parseInt(year, 10);

       // Format and return the date as dd MMM yyyy
        return `${('0' + day).slice(-2)} ${months[parseInt(month, 10) - 1]} ${fullYear}`;
    }

   // Function to Format date as (dd mmm yyyy)
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

   // Calculate Age
    function calculateAge(dobStr) {
        const [day, month, year] = dobStr.split(' ');
        const dob = new Date(`${month} ${day}, ${year}`);
        const diff = new Date() - dob;
        const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)); // Convert to years
        return age;
    }

    function parseMRZ(mrzCode) {
        let data = {};

       // Extracting Data from MRZ
        const nameSection = mrzCode.slice(5, 44);
        const [surname, givenname] = nameSection.split('<<');
        data.surname = surname.replace(/<+/g, ' ').trim();
        data.givenname = (givenname || '').replace(/<+/g, ' ').trim();
        data.passportNumber = mrzCode.slice(44, 53).trim();
        data.nationality = mrzCode.slice(54, 57).trim();
        let dob = mrzCode.slice(57, 63);
        data.dateOfBirth = formatMRZDateOutput(dob);
        let doe = mrzCode.slice(65, 71);
        data.dateOfExpiry = formatMRZDateOutput(doe);
        data.gender = mrzCode.charAt(64) === 'F' ? 'Female' : 'Male'; // Extract gender based on MRZ character

        return data;
    }

    function autofillForm() {
        const today = new Date();
        const tables = [
            { selector: '#dynamic-table-adult', prefix: 'adult', ageOffset: 18 },
            { selector: '#dynamic-table-child', prefix: 'child', ageOffset: 11 },
            { selector: '#dynamic-table-infants', prefix: 'infants', ageOffset: 1 }
        ];

        tables.forEach(table => {
            const minusYears = new Date(today.getFullYear() - table.ageOffset, today.getMonth(), today.getDate());
            const plus5Years = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());
            const numRows = document.querySelectorAll(`${table.selector} tr`).length;

            for (let i = 1; i <= numRows; i++) {
                const mrzInput = document.getElementById(`${table.prefix}_mrz_${i}`);
                const mrzCode = mrzInput ? mrzInput.value : '';

                let data = {};

                if (mrzCode) {
                    data = parseMRZ(mrzCode);
                } else {
                    data = {
                        surname: `${String(i).padStart(2, '0')}`,
                        givenname: `${table.prefix}`.toUpperCase(),
                        passportNumber: `PP1234567`,
                        dateOfBirth: formatDate(minusYears),
                        dateOfExpiry: formatDate(plus5Years),
                        nationality: 'C/O ',
                        gender: 'Male' // Default gender if not using MRZ
                    };
                }

                const age = calculateAge(data.dateOfBirth);

                document.getElementById(`${table.prefix}_sur_name_${i}`).value = data.surname;
                document.getElementById(`${table.prefix}_given_name_${i}`).value = data.givenname;
                document.getElementById(`${table.prefix}_passport_number_${i}`).value = data.passportNumber;
                document.getElementById(`${table.prefix}_dob_${i}`).value = data.dateOfBirth;
                document.getElementById(`${table.prefix}_passport_expiry_${i}`).value = data.dateOfExpiry;
                document.getElementById(`${table.prefix}_nationality_${i}`).value = data.nationality;

               // Update the title based on gender and age
                const titleElement = document.getElementById(`${table.prefix}_title_${i}`);
                if (data.gender === 'Female') {
                    if (age < 2) {
                        titleElement.value = 'INF'; // Female infant
                    } else if (age < 18) {
                        titleElement.value = 'Ms'; // Female under 18
                    } else {
                        titleElement.value = 'Mrs'; // Female 18 or older
                    }
                } else {
                    if (age < 2) {
                        titleElement.value = 'INF'; // Male infant
                    } else {
                        titleElement.value = 'Mr'; // Default for Male
                    }
                }
            }
        });
    }

    function addMRZInputs() {
        const tables = [
            { selector: '#dynamic-table-adult', prefix: 'adult' },
            { selector: '#dynamic-table-child', prefix: 'child' },
            { selector: '#dynamic-table-infants', prefix: 'infants' }
        ];

       // Get MRZ values from bulk input box
        const bulkMRZInput = document.getElementById('bulkMRZInput');
        const mrzCodes = bulkMRZInput ? bulkMRZInput.value.split('\n').map(code => code.trim()) : [];

        tables.forEach(table => {
            const rows = document.querySelectorAll(`${table.selector} tr`);
            rows.forEach((row, index) => {
                const mrzInputExists = row.querySelector(`input[id^="${table.prefix}_mrz_"]`);
                if (!mrzInputExists) {
                   // Add MRZ Input Field
                    const titleCell = row.cells[1];

                   // Insert MRZ input field after title cell
                    const mrzInput = document.createElement('input');
                    mrzInput.type = 'text';
                    mrzInput.className = 'form-control';
                    mrzInput.id = `${table.prefix}_mrz_${index + 1}`;
                    mrzInput.placeholder = 'Enter MRZ code';

                   // Set the MRZ value from the bulk input
                    if (mrzCodes[index]) {
                        mrzInput.value = mrzCodes[index];
                    }

                    titleCell.appendChild(mrzInput);

                   // Add event listener to MRZ input field
                    mrzInput.addEventListener('input', () => {
                        mrzInput.value = mrzInput.value.replace(/\s+/g, '').replace(/\n/g, ''); // Remove all spaces and newlines on input
                        autofillForm();
                    });
                }
            });
        });
    }

    function setupNationalityListener() {
        const firstNationality = document.getElementById('adult_nationality_1');
        if (firstNationality) {
            firstNationality.addEventListener('input', () => {
                const newNationality = firstNationality.value;
                updateNationalities(newNationality);
            });
        }
    }

   // Initial setup
    const adultsElement = document.getElementById('adults');
    if (adultsElement) {
        adultsElement.addEventListener('change', () => {
            setTimeout(() => {
                addMRZInputs();
                autofillForm();
                setupNationalityListener();
            }, 500);
        });
    }

    function updateNationalities(newNationality) {
        const tables = [
            { selector: '#dynamic-table-adult', prefix: 'adult' },
            { selector: '#dynamic-table-child', prefix: 'child' },
            { selector: '#dynamic-table-infants', prefix: 'infants' }
        ];

        tables.forEach(table => {
            const numRows = document.querySelectorAll(`${table.selector} tr`).length;
            for (let i = 1; i <= numRows; i++) {
                const nationalityElement = document.getElementById(`${table.prefix}_nationality_${i}`);
                if (nationalityElement) {
                    nationalityElement.value = newNationality.toUpperCase();
                }
            }
        });
    }

   // Monitor changes and autofill form
    const observer = new MutationObserver(() => {
        addMRZInputs();
        autofillForm();
        setupNationalityListener();
    });
    const config = { childList: true };
    const targetNodes = document.querySelectorAll('#dynamic-table-adult, #dynamic-table-child, #dynamic-table-infants');
    targetNodes.forEach(node => observer.observe(node, config));

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

// auto check review checkbox
(function () {
    'use strict';

    // Wait for the page to fully load
    window.addEventListener('load', function () {
        // Function to check and click the checkbox
        function autoClickCheckbox() {
            // Find the checkbox by its ID
            const checkbox = document.getElementById('confirm-cehckbox');
            if (checkbox && !checkbox.checked) {
                checkbox.click(); // Click the checkbox if it's not already checked

                // Stop observing once the checkbox is checked
                observer.disconnect();
            }
        }

        // Create a MutationObserver
        const observer = new MutationObserver(() => {
            autoClickCheckbox();
        });

        // Start observing changes in the DOM
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial call in case the checkbox is already present
        autoClickCheckbox();
    });
})();
