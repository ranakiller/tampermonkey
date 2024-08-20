// ==UserScript==
// @name         Nusuk Select Embassy and Type GroupName
// @namespace    https://umrah.nusuk.sa/
// @version      0.1
// @description  Selects the Islamabad Embassy from the drop-down list and sets GroupName and Notes
// @author       Furqan
// @match        https://umrah.nusuk.sa/bsp/ExternalAgencies/Groups/CreateGroup
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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

    // Run the script initially
    selectIslamabadEmbassy();

    // Call the function to detect span content and set xTPT and xTPTNotes
    CreateGroupName();

    // Run the functions to click the buttons
    clickNextStepButton();
    clickAddMuatamerLink();

})();