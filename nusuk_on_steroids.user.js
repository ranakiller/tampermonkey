// ==UserScript==
// @name         Nusuk on Steroids
// @namespace    nusuk_on_steroids
// @version      291124
// @description  Reload Nusuk Tab, Select 50Rows, Putting Custom Buttons, Clicking Add Mutamer Repetedly, Extracting Mutamers & Groups Details, Groups Creations & Feeding Functions
// @downloadURL	 https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/nusuk_on_steroids.user.js
// @updateURL    https://github.com/ranakiller/tampermonkey/raw/refs/heads/main/nusuk_on_steroids.user.js
// @author       Furqan Rana
// @match        https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
// @grant        none
// ==/UserScript==

// Function to reload the Nusuk Tab
(function() {
    function reloadSecondURL() {
        const urlToReload = window.location.href //"https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/Index";
        window.location.href = urlToReload;
    }

    // Set the interval to reload every (360000 milliseconds / 6 minutes)
    setInterval(reloadSecondURL, 360000);
})();

// Function to Redirects from Dashboard to Groups page
(function() {
    'use strict';

    // Check if the current URL is the dashboard URL
    if (window.location.href === "https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Dashboard") {
        // Redirect to the groups page
        window.location.href = "https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/Index";
    }
})();

// Function to select option value 50 from the drop-down
(function() {
    'use strict';

    function selectOption50(selectName) {
        const selectElement = document.querySelector(`select[name="${selectName}_length"]`);
        if (selectElement) {
            const option50 = selectElement.querySelector('option[value="50"]');
            if (option50 && selectElement.value !== "50") {
                option50.selected = true;
                selectElement.dispatchEvent(new Event('change'));
            }
        }
    }

    // Run the script for both GroupsList and MuatamerList initially
    function runSelectOption50() {
        selectOption50('GroupsList');
        selectOption50('MuatamerList');
    }

    runSelectOption50();
    window.addEventListener('load', runSelectOption50);

    // Check periodically if the value is not 50
    setInterval(runSelectOption50, 1000); // Check every 1000 milliseconds (1 second)
})();


// Adding new Mutamer Button outside of popup menu
(function() {
    'use strict';

    function addOrReplaceButtons() {
        const targetButtons = Array.from(document.querySelectorAll('td a[href*="/bsp/ExternalAgencies/Groups/GetMuatamerListDetails/"].kt-badge--primary.kt-badge--inline.kt-badge--pill.kt-font-md'));

        targetButtons.forEach(originalButton => {
            if (!originalButton.dataset.duplicated) {
                // Extract the dynamic part from the original button's href
                const dynamicPart = originalButton.href.split('/').pop();

                // Find the row containing the button
                const parentTr = originalButton.closest('tr');

                // Check if the state "NEW" is present in the row
                const stateCells = parentTr.querySelectorAll('td');
                const hasNewState = Array.from(stateCells).some(cell => cell.textContent.trim() === 'New');

                // Create and insert the appropriate button based on state
                const parentTd = originalButton.closest('td');
                const nextTd = parentTd.nextElementSibling;

                if (nextTd) {
                    let newButton;

                    if (hasNewState) {
                        // Add button
                        const newButtonHref = `https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/${dynamicPart}`;
                        newButton = originalButton.cloneNode(true);
                        newButton.href = newButtonHref;
                        newButton.innerHTML = `<i class="fas fa-plus" style="color: black;"></i>`;
                    } else {
                        // Delete button
                        newButton = document.createElement('a');
                        newButton.href = `javascript:RemoveItem('${dynamicPart}')`;
                        newButton.className = 'kt-nav__item';
                        newButton.id = 'qa-delete-group';
                        newButton.innerHTML = `<i class="kt-nav__link-icon flaticon2-trash" style="color: red;"></i>`;
                    }

                    // Style the button
                    newButton.style.padding = "2px 10px";
                    newButton.style.display = "inline-block";
                    newButton.style.backgroundColor = "transparent";

                    nextTd.appendChild(newButton);

                    // Mark the original button as processed
                    originalButton.dataset.duplicated = 'true';
                }
            }
        });
    }

    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                addOrReplaceButtons();
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Wait for the page to fully load
    window.addEventListener('load', function() {
        setTimeout(() => {
            addOrReplaceButtons();
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
                const newButtonHref = `https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/${dynamicPart}`;

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
                // Extract the dynamic part from the "Edit Group Information" button's href
                const dynamicPart = editGroupInfoButton.href.split('/').pop();
                const newButtonHref = `https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/EditMuatamerList/${dynamicPart}`;

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

    // Function to add the "Add" and "Edit" links
    function addMtmrLnk() {
        const MtmrLstElement = document.querySelector('.kt-portlet__head-label h3.kt-portlet__head-title');
        if (MtmrLstElement && targetUrlPattern.test(window.location.href)) {
            const xxURL = window.location.href;
            const addURL = xxURL.replace('GetMuatamerListDetails', 'createMutamerIntoGroup');
            const editURL = xxURL.replace('GetMuatamerListDetails', 'EditMuatamerList');
            MtmrLstElement.innerHTML = `
                <a href="${addURL}">Add</a> |
                <a href="${editURL}">Edit</a>
            `;
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
    const targetUrl = 'https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/CreateGroup'; // Change this to your target URL

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
            } else if (spanContent === 'SAFREIBADAT ISB') { // AMT KUTBI
                const GroupName = document.getElementById('GroupNameEn');
                const Notes = document.getElementById('Notes');
                if (GroupName) {
                    GroupName.value = 'SEI-ALMADNI-SKY-' + getTodayDate();
                    Notes.value = 'Only Visa';
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
    if (window.location.href.startsWith("https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/")) {

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
            magnifierContainer.style.width = '600px'; // Adjust width as needed
            magnifierContainer.style.height = '600px'; // Adjust height as needed
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

// Inserting Delete Row Button in Mutamer List
(function() {
    'use strict';

    // Check if the current URL starts with the specified URL
    const baseUrl = "https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/GetMuatamerListDetails/";
    if (!window.location.href.startsWith(baseUrl)) {
        return; // Exit the function if the URL doesn't match
    }

    let debounceTimeout;

    // Function to add delete buttons and text areas to the specified cells
    function addButtons() {
        const rows = document.querySelectorAll('table tbody tr'); // Select rows in tbody

        rows.forEach((row, index) => {
            // Skip rows with header cells
            if (row.querySelector('th')) return;

            // Get the 10th & 12th cell 0-based index
            const tenthCell = row.cells[9];
            const twelfthCell = row.cells[11];

            // Check if the text area already exists in the 10th cell
            if (tenthCell && !tenthCell.querySelector('textarea')) {
                // Clear existing content in the 10th cell
                tenthCell.innerHTML = '';

                // Create the text area
                const textArea = document.createElement('textarea');
                textArea.style.backgroundColor = 'transparent'; // Set transparent background
                textArea.style.height = '40px'; // Make the text area take full width
                textArea.style.overflow = 'hidden'; // Hide scrollbar
                textArea.style.resize = 'none'; // Prevent resizing
                textArea.id = `MRZ${index}`; // Unique ID based on row index
                textArea.className = 'form-control';

                // Add the text area to the 10th cell
                tenthCell.appendChild(textArea);
            }

            // Check if the delete button already exists in the 12th cell
            if (twelfthCell && !twelfthCell.querySelector('.kt-nav__item')) {
                // Clear existing content in the 12th cell
                // twelfthCell.innerHTML = '';

                // Create the delete button
                const delButton = document.createElement('a');
                delButton.className = 'kt-nav__item';
                delButton.innerHTML = `<i class="kt-nav__link-icon flaticon2-cross" style="color: black;"></i>`;

                // Add event listener to delete the row
                delButton.addEventListener('click', function() {
                    row.remove(); // Removes the row
                });

                // Add the delete button to the 12th cell
                twelfthCell.appendChild(delButton);
            }
        });
    }

    // Use event delegation for delete button clicks
    document.addEventListener('click', function(event) {
        const delButton = event.target.closest('.kt-nav__item');
        if (delButton) {
            const row = delButton.closest('tr');
            if (row) {
                row.remove(); // Removes the row
            }
        }
    });

    // Run when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        addButtons(); // Run the function initially
    });

    // Debounced observer
    const observer = new MutationObserver(function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            addButtons(); // Add buttons and text areas again after changes
        }, 200); // Adjust the delay as needed
    });

    // Start observing a more specific part of the document (like the table body)
    const targetNode = document.querySelector('table tbody'); // Observe tbody for changes
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }
})();

// Function to update the mutamer details based on MRZ input
(function() {
    'use strict';

    function extractMRZData(mrz) {
        if (mrz.length !== 88) return null;

        const mrzPattern = /^.{5}([A-Z]{1,39})<<([A-Z< ]+)([A-Z0-9]{9}).{4}(\d{6}).{1}([MF])/;
        const match = mrz.match(mrzPattern);
        if (!match) return null;

        const surname = match[1].replace(/</g, ' ').trim();
        const givenNames = match[2].replace(/</g, ' ').trim();
        const passportNumber = match[3];
        const dob = match[4];
        const gender = match[5] === 'M' ? 'Male' : match[5] === 'F' ? 'Female' : 'Unknown';

        let year = parseInt(`20${dob.substring(0, 2)}`, 10);
        if (year > new Date().getFullYear()) year -= 100;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dobFormatted = `${year}-${monthNames[parseInt(dob.substring(2, 4), 10) - 1]}-${dob.substring(4, 6)}`;

        const dobDate = new Date(`${year}-${dob.substring(2, 4)}-${dob.substring(4, 6)}`);
        let age = new Date().getFullYear() - dobDate.getFullYear();
        if (new Date() < new Date(new Date().getFullYear(), dobDate.getMonth(), dobDate.getDate())) age--;

        return {
            name: `${givenNames} ${surname}`,
            passportNumber: passportNumber,
            dateOfBirth: dobFormatted,
            gender: gender,
            age: age
        };
    }

    function updateRowWithData(rowIndex, data) {
        const rows = document.querySelectorAll('tbody tr');
        if (rows[rowIndex]) {
            rows[rowIndex].cells[3].innerText = data.name;
            rows[rowIndex].cells[5].innerText = data.passportNumber;
            rows[rowIndex].cells[6].innerText = data.gender;
            rows[rowIndex].cells[7].innerText = data.dateOfBirth;
            rows[rowIndex].cells[8].innerText = data.age;
        }
    }

    const loggedTextareas = new Set();

    function findMRZTextAreas() {
        document.querySelectorAll('textarea[id^="MRZ"]').forEach((textarea) => {
            const rowIndex = parseInt(textarea.id.replace("MRZ", ""), 10);
            if (!loggedTextareas.has(textarea.id)) {
                loggedTextareas.add(textarea.id);
                textarea.addEventListener('input', () => {
                    const mrzData = extractMRZData(textarea.value);
                    if (mrzData) updateRowWithData(rowIndex, mrzData);
                });
            }
        });
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) findMRZTextAreas();
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    findMRZTextAreas();

})();

// Automatically clicks the confirm button when it appears.
(function () {
    'use strict';

    // Function to click buttons if they exist
    function clickButtons() {
        // Button with div inside
        const buttonWithDiv = document.querySelector('button.swal2-confirm.swal2-styled #confirmBtn');
        if (buttonWithDiv) {
            buttonWithDiv.click();
        }

        // Button with direct text "OK"
        const buttonWithTextOK = Array.from(document.querySelectorAll('button.swal2-confirm.swal2-styled')).find(
            btn => btn.textContent.trim() === "OK"
        );
        if (buttonWithTextOK) {
            buttonWithTextOK.click();
        }

        // Button with direct text "Ok"
        const buttonWithTextOk = Array.from(document.querySelectorAll('button.swal2-confirm.swal2-styled')).find(
            btn => btn.textContent.trim() === "Ok"
        );
        if (buttonWithTextOk) {
            buttonWithTextOk.click();
        }
    }

    // Observe changes to the DOM
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                clickButtons();
            }
        }
    });

    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check in case the buttons are already present
    clickButtons();
})();
