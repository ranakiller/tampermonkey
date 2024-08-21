// ==UserScript==
// @name         SPTJetFueled
// @namespace    https://skypass.pk/
// @version      2024-01-10
// @description  Add a new td tag that displays the days between departure dates
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
            passwordField.value = 'Umradp@spt2024';

            const loginButton = document.querySelector('#main_author_form button[type="submit"]');

            if (loginButton) {
                loginButton.click();
            }
        }
    });
})();


// Function to calculate days between two dates
(function() {
    'use strict';

    let spanCounter = 1; // Counter to generate unique IDs

    function calculateDays(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
    }

    function createUniqueSpan(textContent) {
        const span = document.createElement('span');
        span.className = 'fw-bold';
        span.style.fontSize = "0.8em";
        span.style.color = "gray";
        span.textContent = textContent;
        span.id = `unique-span-${spanCounter++}`; // Assign a unique ID
        return span;
    }

    // Function to find and process the flight dates
    function processFlightDates() {
        const flightInfo = document.querySelectorAll('.flight_search_sector_info span:nth-child(2)'); // Selecting the third span in each .flight_search_sector_info
        if (!flightInfo || flightInfo.length < 2) return;

        // Extract departure and return dates
        const departureDate = flightInfo[0].textContent.trim();
        const returnDate = flightInfo[1].textContent.trim();

        // Calculate days between departure and return dates
        const days = calculateDays(departureDate, returnDate);

        // Create a new span with the calculated days
        if (days > 1) {
            const daysSpan = createUniqueSpan(`${days}D`);

            // Find the second occurrence of .flight_search_destination and append the new span
            const destinationDivs = document.querySelectorAll('.flight_search_destination');
            if (destinationDivs.length >= 2) {
                const secondDestinationDiv = destinationDivs[1];
                secondDestinationDiv.appendChild(daysSpan);
            }
        }
    }

    // Function to calculate days between two or four dates
    function processAllDates() {
        // Find all table cells with the dates
        const cells = document.querySelectorAll("td.text-center span.fw-bold:first-of-type");
        for (const cell of cells) {
            // Extract the dates from the cell
            const text = cell.textContent.trim();
            const matches = text.match(/(\d{2}\s[A-Za-z]+\s\d{4})/g);

            // If there are dates, calculate the difference
            if (matches && matches.length >= 2) {
                const date1 = new Date(matches[0]);
                const date2 = new Date(matches[1]);

                // If there are four dates, calculate the difference between the 2nd and 3rd dates
                if (matches.length >= 4) {
                    const date3 = new Date(matches[2]);
                    const date4 = new Date(matches[3]);
                    const diff = Math.floor((date3 - date2) / (1000 * 60 * 60 * 24));

                    // Create a new span element with the number of days if the difference is greater than 1
                    if (diff > 1) {
                        const days = createUniqueSpan(`${diff}Days`);
                        // Insert the new span element after the existing span
                        cell.parentNode.insertBefore(days, cell.nextSibling);
                    }
                } else {
                    // If there are only two dates, calculate the difference between them
                    const diff = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

                    // Create a new span element with the number of days if the difference is greater than 1
                    if (diff > 1) {
                        const days = createUniqueSpan(`${diff}Days`);
                        // Insert the new span element after the existing span
                        cell.parentNode.insertBefore(days, cell.nextSibling);
                    }
                }
            }
        }

        // Call the function to process the flight dates
        processFlightDates();
    }

    // Call the function to process all dates
    processAllDates();
})();


// This Function for making whatsapp message for all the dates for same sector in airline header
(function() {
    'use strict';

    // Wait for the page to fully load
    window.addEventListener('load', function() {
        // Select all target divs within tr elements with class 'airline' and a 'data-airline' attribute
        const targetDivs = document.querySelectorAll('tr.airline[data-airline] td .d-flex');

        // Loop through each target div and add a textarea
        targetDivs.forEach((targetDiv, index) => {
            // Create the textarea element
            const textarea = document.createElement('textarea');
            textarea.style.width = '50%'; // Adjust the width as needed
            textarea.style.marginLeft = '10px'; // Add some margin to the left

            // Get the parent element's background and text colors
            const parentStyles = window.getComputedStyle(targetDiv.parentElement);
            const backgroundColor = parentStyles.backgroundColor;
            const color = parentStyles.color;

            // Apply the colors to the textarea
            textarea.style.backgroundColor = backgroundColor; // Set the background color to match the parent
            textarea.style.color = color; // Set the text color to match the parent
            textarea.style.border = '1px solid #ccc'; // Optional: add a border similar to the page's design
            textarea.className = 'border-light text-dark-1 h-40 form-control';

            // Find the airline code from flight number from the next row
            const nextRow = targetDiv.closest('tr').nextElementSibling;
            let airlineCode = 'unknown-flight';
            if (nextRow) {
                const flightCell = nextRow.querySelector('.flight-number');
                if (flightCell) {
                    const flightNumbers = flightCell.innerText.trim().split('\n');
                    airlineCode = flightNumbers[0] ? flightNumbers[0].substring(0, 2) : 'xx';
                }
            }

            // Get the text from the h4 element within the target div and remove dashes
            const h4Text = targetDiv.querySelector('h4') ? targetDiv.querySelector('h4').innerText : 'unknown';

            // Create a unique ID for the textarea using the flight number and the h4 text
            textarea.id = `${airlineCode}-${h4Text.replace(/-/g, '')}-Head`;
            // textarea.value = `${h4Text} on ${flightNumber}\n\n`;

            // Insert the textarea after the target div
            targetDiv.parentElement.insertBefore(textarea, targetDiv.nextSibling);

            // Adjust the styling for alignment
            targetDiv.style.width = '100%'; // Ensure the div takes the full width
        });
    }, false);
})();


// Function for making text for Whatsapp messaging.
(function() {
    'use strict';

    // Wait until the page is fully loaded
    window.addEventListener('load', function() {
        // Select the container with id "colcontent"
        const container = document.getElementById('colcontent');

        if (container) {
            // Select all the rows within the container
            const rows = container.querySelectorAll('tr');

            let currentSectorH = '';
            let rowIndex = 0;

            // Identify airline header rows
            const airlineHeaders = document.querySelectorAll('tr.airline td .d-flex');

            // Object to hold textarea content for each header
            const headerTextAreas = {};

            // Function to update the header textarea
            function updateHeaderTextArea(id, text) {
                let headerTextArea = document.getElementById(id);
                if (!headerTextArea) {
                    headerTextArea = document.createElement('textarea');
                    headerTextArea.className = 'border-light text-dark-1 h-40 form-control';
                    container.prepend(headerTextArea); // Add the header textarea at the top of the container
                }
                headerTextArea.style.width = '100%'; // Adjust width as needed
                headerTextArea.style.height = '200px'; // Adjust height as needed
                headerTextArea.style.backgroundColor = '#f5f5f5'; // Optional: set background color
                headerTextArea.style.color = '#333'; // Optional: set text color
                headerTextArea.style.border = '1px solid #ccc'; // Optional: add a border similar to the page's design
                headerTextArea.innerHTML = text;
            }

            // Loop through each row
            rows.forEach((row) => {
                // Check if the row is an airline header
                const airlineHeader = Array.from(airlineHeaders).find(div => div.closest('tr') === row);
                if (airlineHeader) {
                    const airlineHeaderText = airlineHeader.querySelector('h4') ? airlineHeader.querySelector('h4').innerText.trim() : 'unknown';
                    currentSectorH = airlineHeaderText.replace(/\s+/g, '-').replace(/-/g, '');
                    // console.log (currentSectorH)
                    rowIndex = 0; // Reset row index for the new airline header

                    // Reset the header text area for the new airline
                    headerTextAreas[currentSectorH] = '';
                }

                // Skip airline header rows when adding text areas
                if (!airlineHeader) {
                    // Increment the row index for the current airline
                    rowIndex++;

                    // Get the cells
                    const cells = row.getElementsByTagName('td');

                    if (cells.length >= 6) {
                        // Find the span with an ID starting with "unique-span"
                        const durationElement = row.querySelector('span[id^="unique-span"]');
                        const duration = durationElement ? durationElement.innerText.trim() : '';

                        // Extract the required data
                        const dates = cells[0].querySelector('span.fw-bold').innerText.trim().split('\n');
                        const flightNumbers = cells[1].querySelector('.flight-number').innerText.trim().split('\n');
                        const routes = cells[2].querySelector('span.fw-bold').innerText.trim().split('\n');
                        const times = cells[3].querySelector('span.fw-bold').innerText.trim().split('\n');
                        const price = cells[6].querySelector('.price-format span:nth-child(2)').innerText.trim();

                        // Construct the text area value
                        let textBoxValue = `*FARE ${price}*`;

                        // Add duration if there is more than one flight number
                        if (flightNumbers.length > 1) {
                            textBoxValue += ` \`${duration}\``;
                        }

                        // Ensure that the arrays have at least one element
                        if (flightNumbers.length > 0 && dates.length > 0 && routes.length > 0 && times.length > 0) {
                            // Loop through the arrays and add the formatted values
                            for (let i = 0; i < flightNumbers.length; i++) {
                                const flight = flightNumbers[i]?.replace(/\s+/g, '') || '';
                                const date = dates[i]?.replace(/\s+/g, '').replace(/2024/g, '').toUpperCase() || '';
                                const route = routes[i]?.replace(/\s+/g, '').replace(/-/g, '') || '';
                                const time = times[i]?.replace(/:/g, '').replace(/-/g, ' ') || '';

                                textBoxValue += `\n\`\`\`${flight} ${date} ${route} ${time}\`\`\``;
                            }
                        }

                        // Find or create a text area in the sixth cell
                        let textArea = cells[5].querySelector('textarea');
                        if (!textArea) {
                            textArea = document.createElement('textarea');
                            textArea.className = 'border-light text-dark-1 h-40 form-control';
                            cells[5].appendChild(textArea);
                        }
                        textArea.style.width = '100%'; // Adjust width as needed
                        textArea.style.height = '100px'; // Adjust height as needed
                        textArea.innerHTML = textBoxValue; // Set the formatted value

                        // Get the parent element's background and text colors
                        const parentStyles = window.getComputedStyle(cells[5]);
                        const backgroundColor = parentStyles.backgroundColor;
                        const color = parentStyles.color;

                        // Apply the colors to the textarea
                        textArea.style.backgroundColor = backgroundColor; // Set the background color to match the parent
                        textArea.style.color = color; // Set the text color to match the parent
                        textArea.style.border = '1px solid #ccc'; // Optional: add a border similar to the page's design

                        // Extract the first two characters from the first flight number
                        const flightPrefix = flightNumbers[0] ? flightNumbers[0].substring(0, 2) : 'xx';
                        // console.log (flightPrefix)

                        // Set the unique ID based on the airline header and row index
                        const textAreaId = `${flightPrefix}-${currentSectorH}-r${rowIndex}`;
                        textArea.id = textAreaId;

                        // Update the header textarea content
                        if (!headerTextAreas[currentSectorH]) {
                            headerTextAreas[currentSectorH] = '';
                        }
                        headerTextAreas[currentSectorH] += textBoxValue + '\n\n';

                        // Update the header textarea for the current airline
                        updateHeaderTextArea(`${flightPrefix}-${currentSectorH}-Head`, headerTextAreas[currentSectorH]);
                    }
                }
            });
        }
    });
})();


// ----------- 2nd Fucntion for removing Blurry Overlay on Cancelled Bookings -----------
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


// ----------- 3rd Function for Formatting DOB & DOE -----------
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


// -------------- Put Text Box for Bulk MRZs and Fill All MRZs Box --------------
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

        // Step 1: Remove lines that do not contain "<"
        var filteredLines = lines.filter(line => {
            return /^P<.*$/.test(line) || /<\d{2}$/.test(line);
        });

        // Step 2: Remove spaces from remaining lines
        filteredLines = filteredLines.map(line => line.replace(/\s+/g, ''));

        // Step 3: Pad lines as needed
        filteredLines = filteredLines.map(line => {
            if (line.startsWith('P<')) {
                if (line.length < 44) {
                    return line.padEnd(44, '<'); // Pad lines with '<' if needed
                } else if (line.length > 44) {
                    return line.slice(0, 44); // Trim lines to 44 characters if they are too long
                }
            }
            return line;
        });

        // Step 4: Merge lines in pairs if they are exactly 44 characters long
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

        return data;
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
                        surname: `XYZ ${String(i).padStart(2, '0')}`,
                        givenname: `ABC ${String(i).padStart(2, '0')}`,
                        passportNumber: `AB1234567`,
                        dateOfBirth: formatDate(minusYears),
                        dateOfExpiry: formatDate(plus5Years),
                        nationality: 'C/O '
                    };
                }

                document.getElementById(`${table.prefix}_sur_name_${i}`).value = data.surname;
                document.getElementById(`${table.prefix}_given_name_${i}`).value = data.givenname;
                document.getElementById(`${table.prefix}_passport_number_${i}`).value = data.passportNumber;
                document.getElementById(`${table.prefix}_dob_${i}`).value = data.dateOfBirth;
                document.getElementById(`${table.prefix}_passport_expiry_${i}`).value = data.dateOfExpiry;
                document.getElementById(`${table.prefix}_nationality_${i}`).value = data.nationality;
            }
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

    function setupNationalityListener() {
        const firstNationality = document.getElementById('adult_nationality_1');
        if (firstNationality) {
            firstNationality.addEventListener('input', () => {
                const newNationality = firstNationality.value;
                updateNationalities(newNationality);
            });
        }
    }

    function setupMRZListeners() {
        document.querySelectorAll('[id^="adult_mrz_"], [id^="child_mrz_"], [id^="infants_mrz_"]').forEach((input) => {
            input.addEventListener('input', () => {
                autofillForm();
                setupNationalityListener();
            });
        });
    }

    function checkRowsAndAutofill() {
        const observer = new MutationObserver(() => {
            addMRZInputs();
            autofillForm();
            setupMRZListeners();
        });
        const config = { childList: true };
        const targetNodes = document.querySelectorAll('#dynamic-table-adult, #dynamic-table-child, #dynamic-table-infants');
        targetNodes.forEach(targetNode => observer.observe(targetNode, config));
    }

    // Monitor the input field for the number of adults
    document.getElementById('adults').addEventListener('change', () => {
        setTimeout(() => {
            addMRZInputs();
            autofillForm();
            setupNationalityListener();
            setupMRZListeners();
        }, 500);
    });

    // Initial setup
    checkRowsAndAutofill();

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
