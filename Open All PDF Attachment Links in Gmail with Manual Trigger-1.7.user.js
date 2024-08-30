// ==UserScript==
// @name         Open All PDF Attachment Links in Gmail with Manual Trigger
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Manually open all PDF attachment links in new tabs in Gmail with a UI button for reliability
// @author       You
// @match        https://mail.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to find and open PDF links in new tabs
    function openPDFAttachmentsInNewTabs() {
        console.log("Looking for attachment links...");

        // Select all anchor elements that link to attachment downloads
        const attachmentLinks = document.querySelectorAll('a[href*="view=att"]');

        if (attachmentLinks.length === 0) {
            console.error("No attachment links found. Are the attachments loaded?");
            return;
        }

        attachmentLinks.forEach(link => {
            // Extract the filename by finding the nearest sibling or descendant that contains the name
            let fileName = '';

            // Check if link itself contains the file name
            if (link.textContent.trim().toLowerCase().endsWith('.pdf')) {
                fileName = link.textContent.trim();
            } else {
                // Check for the specific span that usually contains the filename
                const fileNameSpan = link.querySelector('span') || link.querySelector('.aQA');
                if (fileNameSpan) {
                    fileName = fileNameSpan.textContent.trim();
                }
            }

            // Log the extracted file name
            console.log(`Extracted file name: ${fileName}`);

            // Check if the link is for a PDF file
            if (fileName.toLowerCase().endsWith('.pdf')) {
                console.log(`Opening in new tab: ${fileName}`);

                // Open the link in a new tab
                window.open(link.href, '_blank');
            } else {
                console.log(`Skipping non-PDF file: ${fileName}`);
            }
        });
    }

    // Create a button in the UI to manually trigger the function
    function createTriggerButton() {
        const triggerButton = document.createElement('button');
        triggerButton.innerText = 'Download All PDFs';
        triggerButton.style.position = 'fixed';
        triggerButton.style.top = '10px';
        triggerButton.style.right = '10px';
        triggerButton.style.zIndex = 10000;
        triggerButton.style.padding = '10px';
        triggerButton.style.backgroundColor = '#4285f4';
        triggerButton.style.color = 'white';
        triggerButton.style.border = 'none';
        triggerButton.style.borderRadius = '5px';
        triggerButton.style.cursor = 'pointer';

        triggerButton.addEventListener('click', openPDFAttachmentsInNewTabs);

        document.body.appendChild(triggerButton);
        console.log("Manual trigger button added to UI.");
    }

    // Run the function to create the trigger button on load
    window.addEventListener('load', () => {
        // Wait for Gmail to load its content
        setTimeout(createTriggerButton, 5000);
    });
})();