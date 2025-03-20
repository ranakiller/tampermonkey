// ==UserScript==
// @name         Bulk Image Uploader for Nusuk (Perfected)
// @namespace    bulk_image_uploader_for_nusuk
// @version      6.10
// @description  Automates the sequential upload of multiple passport images on Nusuk, ensuring images are processed correctly across page reloads.
// @author       Furqan
// @match        https://umrahmasar.nusuk.sa/bsp/ExternalAgencies/Groups/createMutamerIntoGroup/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nusuk.sa
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("🚀 Initializing bulk image uploader...");

    if (window.__bulkUploaderInitialized) {
        console.warn("⚠️ Bulk uploader already initialized.");
        return;
    }
    window.__bulkUploaderInitialized = true;

    let filesQueue = JSON.parse(localStorage.getItem('imageQueue') || "[]");
    let processedIndex = parseInt(localStorage.getItem('processedIndex') || "0", 10);

    console.log(`📂 Loaded queue (${filesQueue.length} images), Processed index: ${processedIndex}`);

    const fileInput = document.querySelector('#PassportPictureUploader');
    if (!fileInput) {
        console.error("❌ File input element not found.");
        return;
    }
    fileInput.setAttribute('multiple', true);

    function dataURLtoFile(dataurl, filename) {
        try {
            if (!dataurl.startsWith('data:image')) {
                throw new Error("Invalid Data URL format");
            }

            let arr = dataurl.split(',');
            let mimeMatch = arr[0].match(/:(.*?);/);
            if (!mimeMatch) throw new Error("MIME type not found");

            let mime = mimeMatch[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new File([u8arr], filename, { type: mime });
        } catch (error) {
            console.error("❌ Error in dataURLtoFile:", error.message);
            return null;
        }
    }

    function uploadNextImage() {
        let storedProcessedIndex = parseInt(localStorage.getItem('processedIndex') || "0", 10);

        if (storedProcessedIndex >= filesQueue.length) {
            console.log("✅ All images processed. Clearing queue.");
            localStorage.removeItem('imageQueue');
            localStorage.removeItem('processedIndex');
            return;
        }

        const currentFile = filesQueue[storedProcessedIndex];
        console.log(`🚀 Uploading image (${storedProcessedIndex + 1}/${filesQueue.length}): ${currentFile.name}`);

        const file = dataURLtoFile(currentFile.data, currentFile.name);
        if (!file) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        setTimeout(() => {
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }, 100);

        storedProcessedIndex++;
        localStorage.setItem('processedIndex', storedProcessedIndex);
        console.log(`📂 Updated processedIndex: ${storedProcessedIndex}`);
    }

    fileInput.addEventListener('change', (event) => {
        console.log("📸 File selection event triggered.");
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length === 0) return;

        let newFilesAdded = false;
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (!filesQueue.some(f => f.name === file.name)) {
                    filesQueue.push({
                        name: file.name,
                        type: file.type,
                        data: e.target.result
                    });

                    newFilesAdded = true;
                }

                if (newFilesAdded) {
                    localStorage.setItem('imageQueue', JSON.stringify(filesQueue));
                    console.log(`📂 Updated queue (${filesQueue.length} images):`, filesQueue);

                    if (processedIndex === 0) {
                        processedIndex = 1; // ✅ FIX: Ensure processedIndex starts correctly
                        localStorage.setItem('processedIndex', processedIndex);
                        console.log(`📂 Updated processedIndex immediately: ${processedIndex}`);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    });

    window.addEventListener('load', () => {
        console.log("🔄 Page reloaded. Checking queue...");
        filesQueue = JSON.parse(localStorage.getItem('imageQueue')) || [];
        let storedProcessedIndex = parseInt(localStorage.getItem('processedIndex') || "0", 10);

        console.log(`🔍 Current Queue: ${filesQueue.length} images, Processed: ${storedProcessedIndex}`);

        if (filesQueue.length > 0 && storedProcessedIndex < filesQueue.length) {
            uploadNextImage();
        } else if (storedProcessedIndex >= filesQueue.length) {
            console.log("✅ Resetting queue after full processing.");
            localStorage.removeItem('imageQueue');
            localStorage.removeItem('processedIndex');
            filesQueue = [];
            processedIndex = 0;
        } else {
            console.log("🎉 No images left to upload.");
        }
    });

    console.log("✅ Bulk image uploader initialized.");
})();

// This script ensures a single selected passport image is continuously placed into the uploader on page reload until gets resets manually.
// (function () {
//     'use strict';

//     console.log("🚀 Initializing persistent single passport uploader...");

//     // Prevent duplicate execution
//     if (window.__passportUploaderInitialized) {
//         console.warn("⚠️ Passport uploader already initialized.");
//         return;
//     }
//     window.__passportUploaderInitialized = true;

//     // Get file input
//     const fileInput = document.querySelector('#PassportPictureUploader');
//     if (!fileInput) {
//         console.error("❌ File input element not found.");
//         return;
//     }

//     // Convert Data URL to File
//     function dataURLtoFile(dataurl, filename) {
//         if (!dataurl.startsWith('data:image')) {
//             console.error("❌ Invalid data URL:", dataurl);
//             return null;
//         }

//         let arr = dataurl.split(',');
//         let mime = arr[0].match(/:(.*?);/)[1];
//         let bstr = atob(arr[1]);
//         let n = bstr.length;
//         let u8arr = new Uint8Array(n);

//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }

//         return new File([u8arr], filename, { type: mime });
//     }

//     // Function to place stored passport image into the uploader
//     function placeStoredPassport() {
//         let storedPassport = JSON.parse(localStorage.getItem('passportImage'));
//         if (!storedPassport) {
//             console.log("📂 No stored passport found.");
//             return;
//         }

//         console.log(`🚀 Placing stored passport: ${storedPassport.name}`);

//         const file = dataURLtoFile(storedPassport.data, storedPassport.name);
//         if (!file) {
//             console.error("❌ Failed to convert stored data to file.");
//             return;
//         }

//         // **New Fix:** Create a new DataTransfer and wait for DOM to be ready
//         setTimeout(() => {
//             const dataTransfer = new DataTransfer();
//             dataTransfer.items.add(file);
//             fileInput.files = dataTransfer.files;

//             // Ensure event fires correctly
//             fileInput.dispatchEvent(new Event('change', { bubbles: true }));
//             console.log("✅ Stored passport placed in uploader.");
//         }, 100); // Small delay to ensure DOM is ready
//     }

//     // File selection event (store only one passport)
//     fileInput.addEventListener('change', (event) => {
//         console.log("📸 File selection event triggered.");

//         const selectedFile = event.target.files[0]; // Only one file
//         if (!selectedFile) {
//             console.warn("⚠️ No file selected.");
//             return;
//         }

//         const reader = new FileReader();
//         reader.onload = function (e) {
//             // Store only one passport image in localStorage
//             const passportData = {
//                 name: selectedFile.name,
//                 type: selectedFile.type,
//                 data: e.target.result
//             };

//             localStorage.setItem('passportImage', JSON.stringify(passportData));
//             console.log("📂 Stored passport:", passportData);
//         };
//         reader.readAsDataURL(selectedFile);
//     });

//     // Ensure stored passport is placed on page load
//     window.addEventListener('load', () => {
//         console.log("🔄 Page reloaded. Placing stored passport...");
//         placeStoredPassport();
//     });

//     console.log("✅ Persistent single passport uploader initialized.");
// })();