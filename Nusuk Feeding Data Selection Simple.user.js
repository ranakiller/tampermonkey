// ==UserScript==
// @name         Nusuk Feeding Data Selection
// @namespace    https://umrah.nusuk.sa/
// @version      1.0
// @description  Designed to automatically select specific data options in the Nusuk
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/*
// @grant        none
// ==/UserScript==


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
            "#Email": "abc@gmail.com",
            "#Job": "NILL",
            "#BirthCity": "PAKISTAN",
            "#IssueCity": "PAKISTAN"
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

    // Create a new MutationObserver
    const observer = new MutationObserver(handleDOMChanges);

    // Observe changes in the body and subtree
    observer.observe(document.body, { childList: true, subtree: true });

    // Run the script initially
    selectOptionOnce();
})();
