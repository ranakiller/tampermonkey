// ==UserScript==
// @name         Nusuk on Steroids
// @namespace    https://umrah.nusuk.sa/
// @version      210824
// @description  Reload Nusuk Tab, Select 50Rows, Putting Custom Buttons, Clicking Add Mutamer Repetedly, Extracting Mutamers & Groups Details, Groups Creations & Feeding Functions
// @author       Furqan Rana
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
// @grant        none
// ==/UserScript==

// Function to select option value 50 from the drop-down
(function() {
    'use strict';

    function selectOption50(selectName) {
        const selectElement = document.querySelector(`select[name="${selectName}_length"]`);
        if (selectElement) {
            const option50 = selectElement.querySelector('option[value="50"]');
            if (option50) {
                option50.selected = true;
                selectElement.dispatchEvent(new Event('change'));
            }
        }
    }

    // Run the script for both GroupsList and MuatamerList initially and after page load
    function runSelectOption50() {
        selectOption50('GroupsList');
        selectOption50('MuatamerList');
    }

    runSelectOption50();
    window.addEventListener('load', runSelectOption50);
})();

// Function to reload the Nusuk Tab
(function() {
    function reloadSecondURL() {
        const urlToReload = window.location.href //"https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/Index";
        window.location.href = urlToReload;
    }

    // Set the interval to reload every (360000 milliseconds / 6 minutes)
    setInterval(reloadSecondURL, 360000);
})();

// Adding new Mutamer Button outside of popup menu
(function() {
    'use strict';

    function addNewButtons() {
        const targetButtons = Array.from(document.querySelectorAll('td a[href*="/bsp/ExternalAgencies/Groups/GetMuatamerListDetails/"].kt-badge--primary.kt-badge--inline.kt-badge--pill.kt-font-md'));

        targetButtons.forEach(originalButton => {
            if (!originalButton.dataset.duplicated) {

                // Extract the dynamic part from the original button's href
                const dynamicPart = originalButton.href.split('/').pop();
                const newButtonHref = `https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/${dynamicPart}`;

                // Clone the original button
                const newButton = originalButton.cloneNode(true);
                newButton.href = newButtonHref;

                // Change the text of the new button to an icon with a plus sign
                newButton.innerHTML = `<i class="fas fa-plus" style="color: black;"></i>`;
                // Add padding, remove background color, and add border to the new button
                newButton.style.padding = "2px 10px"; // Adjust the padding as needed
                newButton.style.display = "inline-block"; // Ensure the button displays properly
                newButton.style.backgroundColor = "transparent"; // Remove background color
                newButton.style.border = "1px solid black"; // Add 1px black border

                // Insert the new button in the next <td> element
                const parentTd = originalButton.closest('td');
                const nextTd = parentTd.nextElementSibling;

                if (nextTd) {
                    nextTd.appendChild(newButton);
                }

                // Mark the original button as processed
                originalButton.dataset.duplicated = 'true';
            }
        });
    }

    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                addNewButtons();
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Wait for the page to fully load
    window.addEventListener('load', function() {
        setTimeout(() => {
            addNewButtons();
            observeChanges();
        }, 500); // Add a delay to ensure the target elements are loaded
    });
})();

// Add new Mutamer Button inside of popup menu
(function() {
    'use strict';

    function addNewButton() {
        // Locate all "Edit Group Information" buttons
        const editGroupInfoButtons = Array.from(document.querySelectorAll('a[id="qa-edit-group"]'));

        editGroupInfoButtons.forEach((editGroupInfoButton, index) => {
            // Generate a unique ID for each new button
            const buttonId = `qa-new-button-${index}`;

            if (editGroupInfoButton.innerText.includes("Edit Group Information")) {
                // Extract the dynamic part from the "Edit Group Information" button's href
                const dynamicPart = editGroupInfoButton.href.split('/').pop();
                const newButtonHref = `https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/${dynamicPart}`;

                // Check if the new button with the unique ID already exists
                if (!document.querySelector(`#${buttonId}`)) {
                    // Create the new button element
                    const newButton = document.createElement('a');
                    newButton.href = newButtonHref;
                    newButton.className = "kt-nav__item";
                    newButton.id = buttonId;
                    newButton.innerHTML = `
                        <span class="kt-nav__link">
                            <i class="kt-nav__link-icon fas fa-plus"></i>
                            <span class="kt-nav__link-text">Add Mutamers</span>
                        </span>
                    `;

                    // Insert the new button after the "Edit Group Information" button
                    editGroupInfoButton.insertAdjacentElement('afterend', newButton);
                }
            }
        });
    }

    function observeDOMChanges() {
        let timeout;
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const observer = new MutationObserver(mutationsList => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                addNewButton();
            }, 100); // Throttle function calls
        });

        observer.observe(targetNode, config);
    }

    // Wait for the page to fully load
    window.addEventListener('load', function() {
        setTimeout(() => {
            addNewButton();
            observeDOMChanges();
        }, 100); // Add a delay to ensure the dropdown menu is loaded
    });
})();

// Feeding List Button inside popup menu
(function() {
    'use strict';

    function addFeedingListButton() {
        // Locate all "Edit Group Information" buttons
        const editGroupInfoButtons = Array.from(document.querySelectorAll('a[id="qa-edit-group"]'));

        editGroupInfoButtons.forEach((editGroupInfoButton, index) => {
            // Generate a unique ID for each new button
            const buttonId = `qa-new-feeding-button-${index}`;

            if (editGroupInfoButton.innerText.includes("Edit Group Information")) {
                console.log(`Processing button with href: ${editGroupInfoButton.href}`); // Debug log

                // Extract the dynamic part from the "Edit Group Information" button's href
                const dynamicPart = editGroupInfoButton.href.split('/').pop();
                const newButtonHref = `https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/EditMuatamerList/${dynamicPart}`;

                // Check if the new button with the unique ID already exists
                if (!document.querySelector(`#${buttonId}`)) {
                    // Create the new button element
                    const newButton = document.createElement('a');
                    newButton.href = newButtonHref;
                    newButton.className = "kt-nav__item";
                    newButton.id = buttonId;
                    newButton.innerHTML = `
                        <span class="kt-nav__link">
                            <i class="kt-nav__link-icon fas fa-list"></i>
                            <span class="kt-nav__link-text">Feeding List</span>
                        </span>
                    `;

                    // Insert the new button after the "Edit Group Information" button
                    editGroupInfoButton.insertAdjacentElement('afterend', newButton);
                } else {
                    console.log(`Button with ID ${buttonId} already exists`); // Debug log
                }
            }
        });
    }

    function observeDOMChanges() {
        let timeout;
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const observer = new MutationObserver(mutationsList => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                addFeedingListButton();
            }, 100); // Throttle function calls
        });

        observer.observe(targetNode, config);
    }

    // Wait for the page to fully load
    window.addEventListener('load', function() {
        setTimeout(() => {
            addFeedingListButton();
            observeDOMChanges();
        }, 100); // Add a delay to ensure the dropdown menu is loaded
    });
})();

// Mutamer List Button in Feeding List page
(function() {
    'use strict';

    function duplicateAndModifyLink() {
        // Find the original link element
        const originalLink = document.querySelector('a[href*="createMutamerIntoGroup"]');

        if (originalLink) {
            // Clone the original link
            const newLink = originalLink.cloneNode(true);

            // Modify the href attribute
            const originalHref = newLink.getAttribute('href');
            const newHref = originalHref.replace('createMutamerIntoGroup', 'GetMuatamerListDetails');
            newLink.setAttribute('href', newHref);

            // Change the text to a list icon
            const spanElement = newLink.querySelector('span.kt-hidden-mobile');
            if (spanElement) {
                spanElement.innerHTML = '<i class="fa fa-list"></i>';
            }

            // Change the classes of the link
            newLink.className = 'kt-badge kt-badge--primary kt-badge--inline kt-badge--pill kt-font-md';

            // Change the classes of the <i> element
            const iElement = newLink.querySelector('i.la.la-plus-circle');
            if (iElement) {
                iElement.className = 'fa-list';
            }

            // Insert the new link before the original link
            originalLink.parentNode.appendChild(newLink, originalLink);
        }
    }

    // Run the function
    duplicateAndModifyLink();
})();

// Clicking Add Mutamer Button again N again on feedlig list page
(function() {
    'use strict';

    function clickAddMuatamerLink() {
        const addMuatamerLink = document.querySelector('a.btn.btn-outline-black1.ml-auto[href*="/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/"]');
        if (addMuatamerLink) {
            addMuatamerLink.click();
        }
    }
    clickAddMuatamerLink();
})();

// Function to Change heading to Add Mutamer Link in Mutamer list page
(function() {
    'use strict';

    const targetUrlPattern = /GetMuatamerListDetails/; // Specify the URL pattern to check

    // Function to add the "Add" link
    function addMtmrLnk() {
        const MtmrLstElement = document.querySelector('.kt-portlet__head-label h3.kt-portlet__head-title');
        if (MtmrLstElement && targetUrlPattern.test(window.location.href)) {
            const xxURL = window.location.href;
            const newURL = xxURL.replace('GetMuatamerListDetails', 'createMutamerIntoGroup');
            MtmrLstElement.innerHTML = `<a href="${newURL}">Add</a>`;
        }
    }

    // Run the function only when the window loads
    window.addEventListener('load', addMtmrLnk);
})();

// Function to extract PPNo and PaxName from Mutamer List and put in text area at the bottom
(function() {
    'use strict';

    let isTextAreaAdded = false;

    function addTextArea() {
        if (isTextAreaAdded) return;

        const wrapper = document.querySelector('#MuatamerList_wrapper');
        if (!wrapper) return;

        const newDiv = document.createElement('div');
        newDiv.style.marginTop = '20px';

        const textArea = document.createElement('textarea');
        textArea.id = 'tableDataTextArea';
        textArea.style.width = '100%';
        textArea.style.height = '50px';
        textArea.setAttribute('readonly', true);

        newDiv.appendChild(textArea);
        wrapper.parentNode.insertBefore(newDiv, wrapper.nextSibling);

        isTextAreaAdded = true;
    }

    function extractTableData() {
        const table = document.querySelector('#MuatamerList');

        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return;

        const rowData = Array.from(rows).map((row, index) => {
            const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            const fifthValue = cells[5] || '';
            const thirdValue = cells[3] || '';
            return `${fifthValue}\t${thirdValue}`;
            // return `${index + 1}. ${fifthValue}\t${thirdValue}`;
        }).join('\n');

        const textArea = document.querySelector('#tableDataTextArea');
        if (textArea) {
            textArea.value = rowData;
        }
    }

    function observeDOM() {
        const observer = new MutationObserver(() => {
            if (!isTextAreaAdded) addTextArea();
            extractTableData();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (isTextAreaAdded) observer.disconnect();
    }

    observeDOM();
    document.addEventListener('DOMContentLoaded', () => {
        addTextArea();
        extractTableData();
    });
})();

// Function to extract Group Code,Name And Pax Count from Groups Management List and put in text area at the bottom
(function() {
    'use strict';

    let isTextAreaAdded = false;

    function addTextArea() {
        if (isTextAreaAdded) return;

        const wrapper = document.querySelector('#GroupsList_wrapper');
        if (!wrapper) return;

        const newDiv = document.createElement('div');
        newDiv.style.marginTop = '20px';

        const textArea = document.createElement('textarea');
        textArea.id = 'tableDataTextArea';
        textArea.style.width = '100%';
        textArea.style.height = '50px';
        textArea.setAttribute('readonly', true);

        newDiv.appendChild(textArea);
        wrapper.parentNode.insertBefore(newDiv, wrapper.nextSibling);

        isTextAreaAdded = true;
    }

    function extractTableData() {
        const table = document.querySelector('#GroupsList');

        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return;

        const rowData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');

            // Extract the group code from the 2nd <td>
            const groupCode = cells[1]?.innerText.trim() || '';

            // Extract the group name from the first <div> inside the 3rd <td>
            const groupName = cells[2]?.querySelector('div:first-child')?.innerText.trim() || '';

            // Extract the pax count from the <span> with class "muatamers" inside the 6th <td>
            const paxCount = cells[5]?.querySelector('span.muatamers')?.innerText.trim() || '';

            return `${groupCode}\t${groupName}\t${paxCount}Px`;
        }).join('\n');

        const textArea = document.querySelector('#tableDataTextArea');
        if (textArea) {
            textArea.value = rowData;
        }
    }

    function observeDOM() {
        const observer = new MutationObserver(() => {
            if (!isTextAreaAdded) addTextArea();
            extractTableData();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (isTextAreaAdded) observer.disconnect();
    }

    observeDOM();
    document.addEventListener('DOMContentLoaded', () => {
        addTextArea();
        extractTableData();
    });
})();

// Groups Creation Functions
(function() {
    'use strict';

    // Specify the URL to check
    const targetUrl = 'https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/CreateGroup'; // Change this to your target URL

    // Function to check if the current URL matches the target URL
    function isTargetUrl() {
        return window.location.href === targetUrl;
    }

    // Function to select the Islamabad Embassy
    function selectIslamabadEmbassy() {
        const optionValue = "210"; // Islamabad option value

        const selectElement = document.querySelector('select[name="EmbassyId"]');
        if (selectElement) {
            const option = selectElement.querySelector(`option[value="${optionValue}"]`);
            if (option) {
                option.selected = true;
                selectElement.dispatchEvent(new Event('change')); // Trigger change event
            }
        }
    }

    // Function to get today's date in the format "DDMONYY"
    function getTodayDate() {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const now = new Date();
        const day = ('0' + now.getDate()).slice(-2);
        const month = months[now.getMonth()];
        const year = now.getFullYear().toString().slice(-2);
        return day + month + year;
    }

    // Function for adding transport type in group name
    let xTPT = '';
    let xTPTNotes = '';
    let xxTPTType = '';

    function CreateGroupName() {
        const spanElement = document.querySelector('.kt-header__topbar-user span');
        if (spanElement) {
            const spanContent = spanElement.textContent.trim();

            if (spanContent === 'Karam Al Hejaz 1') { // AMT BASMA
                const GroupName = document.getElementById('GroupNameEn');
                if (GroupName) {
                    GroupName.value = 'KH-AMD-SKY-' + getTodayDate();
                }
                return;
            } else if (spanContent === 'sky pass') { // NOOR KAKI
                const GroupName = document.getElementById('GroupNameEn');
                const Notes = document.getElementById('Notes');
                if (GroupName) {
                    GroupName.value = 'SKYPASS-' + getTodayDate() + '-WITHOUT(TPT)';
                    Notes.value = 'Without Transport';
                }
                return;
            } else {
                const inputContent = prompt('Please Type Transport Type (e.g., WT)').toUpperCase();
                if (inputContent) {
                    xxTPTType = inputContent;

                    if (xxTPTType === 'WT') {
                        xTPT = '-WITH(TPT)';
                        xTPTNotes = 'With Full Transport';
                    } else if (xxTPTType === 'TE') {
                        xTPT = '-WITHOUT(TPT)';
                        xTPTNotes = 'Without Transport';
                    } else if (xxTPTType === 'WW') {
                        xTPT = '-1WAY(TPT)';
                        xTPTNotes = 'Only JED-MAK Transport';
                    }
                }
            }
        }

        // Set the input field's value if xxTPTType is not empty
        if (xxTPTType) {
            const GroupName = document.getElementById('GroupNameEn');
            const Notes = document.getElementById('Notes');

            if (GroupName) {
                GroupName.value = 'SKYPASS-' + getTodayDate() + xTPT;
                if (Notes) {
                    Notes.value = xTPTNotes;
                }
            }
        }
    }

    // Function to click the "Next Step" button
    function clickNextStepButton() {
        const nextStepButton = document.querySelector('#qa-next');
        if (nextStepButton) {
            nextStepButton.click();
        }
    }

    function clickAddMuatamerLink() {
        const addMuatamerLink = document.querySelector('a.btn.btn-outline-black1.ml-auto[href*="/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/"]');
        if (addMuatamerLink) {
            addMuatamerLink.click();
        }
    }

    // Run the script only if the URL matches
    if (isTargetUrl()) {
        selectIslamabadEmbassy();
        CreateGroupName();
        clickNextStepButton();
        clickAddMuatamerLink();
    }

})();

// Feeding Functions
(function() {
    'use strict';

    // Check if the current URL matches the desired pattern
    if (window.location.href.startsWith("https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/")) {

        (function() {
            'use strict';

            // Function to trigger file upload in the second div
            function syncFileUploads(event) {
                const fileInput1 = document.getElementById('PassportPictureUploader');
                const fileInput2 = document.getElementById('VaccinationPictureUploader');

                if (fileInput1 && fileInput2) {
                    const file = fileInput1.files[0];
                    if (file) {
                        // Create a new DataTransfer object to copy the file
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);

                        // Set the files property of the second file input
                        fileInput2.files = dataTransfer.files;

                        // Manually trigger the change event for the second file input
                        const event = new Event('change', { bubbles: true });
                        fileInput2.dispatchEvent(event);
                    }
                }
            }

            // Add an event listener to the first file input
            const fileInput1 = document.getElementById('PassportPictureUploader');
            if (fileInput1) {
                fileInput1.addEventListener('change', syncFileUploads);
            }
        })();


        (function() {
            'use strict';

            let alreadySelected = false;

            // Select Mobile Country Key
            function selectOptionOnce() {
                const optionValue = "92"; // Replace with the desired option value

                const selectElement = document.querySelector('select[name="MobileCountryKey"]');
                if (selectElement && !alreadySelected) {
                    const option = selectElement.querySelector(`option[value="${optionValue}"]`);
                    if (option) {
                        option.selected = true;
                        selectElement.dispatchEvent(new Event('change')); // Trigger change event
                        alreadySelected = true;
                    }
                }
            }

            // Function to handle DOM changes and execute the script once
            function handleDOMChanges(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        selectOptionOnce();
                    }
                }
            }

            // Create a new MutationObserver
            const observer = new MutationObserver(handleDOMChanges);

            // Observe changes in the body and subtree
            observer.observe(document.body, { childList: true, subtree: true });

            // Run the script initially
            selectOptionOnce();
        })();

        (function() {
            'use strict';

            let alreadySelected = false;

            // Select Marital Status
            function selectOptionOnce() {
                const optionValue = "99"; // Replace with the desired option value

                const selectElement = document.querySelector('select[name="MartialStatus"]');
                if (selectElement && !alreadySelected) {
                    const option = selectElement.querySelector(`option[value="${optionValue}"]`);
                    if (option) {
                        option.selected = true;
                        selectElement.dispatchEvent(new Event('change')); // Trigger change event
                        alreadySelected = true;
                    }
                }
            }

            // Function to handle DOM changes and execute the script once
            function handleDOMChanges(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        selectOptionOnce();
                    }
                }
            }

            // Create a new MutationObserver
            const observer = new MutationObserver(handleDOMChanges);

            // Observe changes in the body and subtree
            observer.observe(document.body, { childList: true, subtree: true });

            // Run the script initially
            selectOptionOnce();
        })();

        (function() {
            'use strict';

            // Fill form fields
            function fillFormFieldsOnce() {
                const valuesToFill = {
                    "#MobileNo": "03001234567",
                    "#Email": "skypass.umrah@gmail.com",
                    "#Job": "NILL",
                    "#BirthCity": "PAKISTAN",
                    "#IssueCity": "PAKISTAN",
                    // "#IqamaId": "000000000000000",
                };

                for (const selector in valuesToFill) {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.value = valuesToFill[selector];
                    }
                }
            }

            // Run the script when the page content changes
            const observer = new MutationObserver(fillFormFieldsOnce);
            observer.observe(document, { childList: true, subtree: true });
        })();

        (function() {
            'use strict';

            // Select Birth Country
            function selectOptionOnce() {
                const optionValue = "92"; // Replace with the desired option value

                const selectElement = document.querySelector('select[name="BirthCountry"]');
                if (selectElement) {
                    const option = selectElement.querySelector(`option[value="${optionValue}"]`);
                    if (option && !option.selected) {
                        option.selected = true;
                        selectElement.dispatchEvent(new Event('change')); // Trigger change event

                        // Add your code here to update the page without reloading

                        // Example: Update a specific element's content
                        const updateElement = document.getElementById('updateElementId'); // Replace with the actual element ID
                        if (updateElement) {
                            updateElement.textContent = 'Page Updated!';
                        }
                    }
                }
            }

            // Function to handle DOM changes and execute the script once
            function handleDOMChanges(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        selectOptionOnce();
                    }
                }
            }

            // Create a new MutationObserver
            const observer = new MutationObserver(handleDOMChanges);

            // Observe changes in the body and subtree
            observer.observe(document.body, { childList: true, subtree: true });

            // Run the script initially
            selectOptionOnce();
        })();

        (function() {
            'use strict';

            let updateDone = false; // Flag to prevent repeated updates

            function updateIssueDate() {
                if (updateDone) return; // Prevent repeated execution

                const expiryInput = document.getElementById('PassportExpiryDateAsText');
                const issueInput = document.getElementById('PassportIssueDate');

                if (expiryInput && issueInput) {
                    const expiryDate = new Date(expiryInput.value);

                    // Calculate one month later date
                    const oneMonthLater = new Date();
                    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

                    // Compare expiry date with one month later date
                    if (expiryDate > oneMonthLater) {
                        const yearsToMinus = parseInt(prompt('Enter number of years to Subtract:', '5'));
                        const daysToAdd = parseInt(prompt('Enter number of days to Add:', '1'));

                        if (isNaN(yearsToMinus) || isNaN(daysToAdd)) {
                            alert('Invalid input. Please enter valid numbers.');
                            return;
                        }

                        expiryDate.setFullYear(expiryDate.getFullYear() - yearsToMinus);
                        expiryDate.setDate(expiryDate.getDate() + daysToAdd);

                        const formattedIssueDate = expiryDate.toISOString().split('T')[0];
                        issueInput.value = formattedIssueDate;

                        // Set flag to prevent repeated updates
                        updateDone = true;

                        // Stop the MutationObserver after the update
                        observer.disconnect();
                    }
                }
            }

            // Run the function initially
            updateIssueDate();

            // Use MutationObserver for dynamic content updates
            const observer = new MutationObserver((mutations) => {
                // Check for specific mutations if needed
                updateIssueDate();
            });

            observer.observe(document.body, { childList: true, subtree: true });
        })();

        (function() {
            'use strict';

            // Select Passport Type
            function selectOptionOnce() {
                const optionValue = "1"; // Replace with the desired option value

                const selectElement = document.querySelector('select[name="PassportType"]');
                if (selectElement) {
                    const option = selectElement.querySelector(`option[value="${optionValue}"]`);
                    if (option && !option.selected) {
                        option.selected = true;
                        selectElement.dispatchEvent(new Event('change')); // Trigger change event

                        // Add your code here to update the page without reloading

                        // Example: Update a specific element's content
                        const updateElement = document.getElementById('updateElementId'); // Replace with the actual element ID
                        if (updateElement) {
                            updateElement.textContent = 'Page Updated!';
                        }
                    }
                }
            }

            // Function to handle DOM changes and execute the script once
            function handleDOMChanges(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        selectOptionOnce();
                    }
                }
            }

            // Function to add [Mutamer List]'s Link
            function MtmrLstLnk() {
                // Finding the Add Mutamer Text's div
                const addMtmrElement = document.querySelector('.kt-portlet__head-label h3.kt-portlet__head-title');

                if (addMtmrElement) {
                    const xxURL = window.location.href;
                    const newURL = xxURL.replace('createMutamerIntoGroup', 'GetMuatamerListDetails');

                    // Change the text and make it clickable
                    addMtmrElement.innerHTML = `<a href="${newURL}">List</a>`; //style="color: blue; text-decoration: underline;"
                }
            }

            // Run addMtmrElement function when the page is fully loaded
            window.addEventListener('load', MtmrLstLnk);

            // Create a new MutationObserver
            const observer = new MutationObserver(handleDOMChanges);

            // Observe changes in the body and subtree
            observer.observe(document.body, { childList: true, subtree: true });

            // Run the script initially
            selectOptionOnce();
        })();

        // Function to magnify the Passporte image so I can read clearly while feeding
        (function() {
            'use strict';

            // Create magnifier container
            const magnifierContainer = document.createElement('div');
            magnifierContainer.style.position = 'fixed';
            magnifierContainer.style.top = '1px';
            magnifierContainer.style.right = '1px';
            magnifierContainer.style.zIndex = '1000';
            magnifierContainer.style.overflow = 'hidden';
            magnifierContainer.style.width = '500px'; // Adjust width as needed
            magnifierContainer.style.height = '500px'; // Adjust height as needed
            magnifierContainer.style.display = 'none'; // Hide initially
            document.body.appendChild(magnifierContainer);

            // Create magnifier image
            const magnifierImage = document.createElement('img');
            magnifierImage.style.width = '100%';
            magnifierImage.style.height = 'auto';
            magnifierContainer.appendChild(magnifierImage);

            // Function to update magnifier image
            function updateMagnifierImage() {
                const originalImage = document.querySelector('#imageview img');
                if (originalImage && originalImage.src) {
                    magnifierImage.src = originalImage.src;
                    magnifierContainer.style.display = 'block';
                }
            }

            // Observe changes in the #imageview div
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        updateMagnifierImage();
                    }
                }
            });

            const imageviewDiv = document.querySelector('#imageview');
            if (imageviewDiv) {
                const imgElement = imageviewDiv.querySelector('img');
                if (imgElement) {
                    observer.observe(imgElement, { attributes: true });
                }
            }
        })();

        // Move the Captcha div before questionare form
        (function() {
            'use strict';

            // Wait for the DOM to fully load
            window.addEventListener('load', function() {
                // Find the div with id CaptchaCode
                var captchaInput = document.getElementById('CaptchaCode');

                if (captchaInput) {
                    // Find the parent div of the captcha input
                    var captchaParentDiv = captchaInput.closest('div');

                    // Find the h4 element containing the text "Disclosure Form"
                    var disclosureFormH4 = Array.from(document.getElementsByTagName('h4')).find(h4 => h4.textContent.includes('Disclosure Form'));

                    if (captchaParentDiv && disclosureFormH4) {
                        // Move the captchaParentDiv before the disclosureFormH4
                        disclosureFormH4.parentNode.insertBefore(captchaParentDiv, disclosureFormH4);
                    }
                }
            });
        })();
    }
})();
