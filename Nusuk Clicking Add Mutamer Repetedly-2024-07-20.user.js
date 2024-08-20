// ==UserScript==
// @name         Nusuk Clicking Add Mutamer Repetedly
// @namespace    https://umrah.nusuk.sa/bsp/
// @version      2024-07-20
// @description  This Script will keep clicking on Add Mutamer button so you dont have to do it manually
// @author       Furqan
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/EditMuatamerList/*
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/GetMuatamerListDetails/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Clicking Add Mutamer Button again&again on feedlig list page
    function clickAddMuatamerLink() {
        const addMuatamerLink = document.querySelector('a.btn.btn-outline-black1.ml-auto[href*="/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/"]');
        if (addMuatamerLink) {
            addMuatamerLink.click();
        }
    }
    clickAddMuatamerLink();

    // Function to Change heading to Add Mutamer Link in Mutamer list page
    function addMtmrLnk() {
        const MtmrLstElement = document.querySelector('.kt-portlet__head-label h3.kt-portlet__head-title');
        if (MtmrLstElement) {
            const xxURL = window.location.href;
            const newURL = xxURL.replace('GetMuatamerListDetails', 'createMutamerIntoGroup');
            MtmrLstElement.innerHTML = `<a href="${newURL}">Add</a>`;
        }
    }
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