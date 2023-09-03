// content.js


function createOverlayButtons() {
    // Create a container for the overlay buttons
    const overlayButtonContainer = document.createElement('div');
    overlayButtonContainer.className = 'overlay-button-container';
    overlayButtonContainer.style.position = 'fixed';
    overlayButtonContainer.style.bottom = '20px';
    overlayButtonContainer.style.right = '20px';
    overlayButtonContainer.style.zIndex = '1000';
  
    // Create "Get Summary" button
    const getSummaryButton = document.createElement('button');
    getSummaryButton.id = 'overlayGetSummaryButton';
    getSummaryButton.className = 'btn btn-overlay-summary';
    getSummaryButton.textContent = 'Summary';
    getSummaryButton.addEventListener('click', function () {

        const popupWidth = 400; // Set the width of your popup window
        const popupHeight = 300; // Set the height of your popup window
        const popupLeft = window.innerWidth - popupWidth - 20; // Adjust the offset as needed
        const popupOptions = `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=20`;


        const webpageText = getWebpageText();

        chrome.runtime.sendMessage({ openPopupSummary: true ,  text: webpageText});


    });
  
    // Create "Give Important Points" button
    const getImportantPointsButton = document.createElement('button');
    getImportantPointsButton.id = 'overlayGetImportantPointsButton';
    getImportantPointsButton.className = 'btn btn-overlay-important';
    getImportantPointsButton.textContent = 'Important Points';
    getImportantPointsButton.addEventListener('click', function () {
      // Handle the click event for "Give Important Points" button
      // You can perform actions like sending a message to your background script to initiate important points retrieval
      const webpageText = getWebpageText();
      chrome.runtime.sendMessage({ openPopupPoints: true ,  text: webpageText});


    });
  
    // Append buttons to the container
    overlayButtonContainer.appendChild(getSummaryButton);
    overlayButtonContainer.appendChild(getImportantPointsButton);
  
    // Append the container to the document body
    document.body.appendChild(overlayButtonContainer);

    const customStylesheet = document.createElement('link');
    customStylesheet.rel = 'stylesheet';
    customStylesheet.href = chrome.runtime.getURL('overlay-styles.css'); // Use the correct path to your CSS file
    document.head.appendChild(customStylesheet);
  }

  function getWebpageText() {
    return document.body.innerText;
  }
  
  
  
  // Inject the overlay buttons into the webpage
  createOverlayButtons();
  