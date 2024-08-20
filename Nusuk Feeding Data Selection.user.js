// ==UserScript==
// @name         Nusuk Feeding Data Selection
// @namespace    https://umrah.nusuk.sa/
// @version      1.0
// @description  Designed to automatically select specific data options in the Nusuk
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
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
