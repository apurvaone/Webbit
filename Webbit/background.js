// background.js

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.openPopupSummary) {
    // Open the extension's default popup as an overlay
    chrome.windows.getCurrent(function (currentWindow) {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 435, // Set the width of your popup window
        height: 1000, // Set the height of your popup window
        left: currentWindow.width - 435, // Adjust the offset as needed
        top: 150, // Adjust the offset as needed
      }, function (popupWindow) {
        // Listen for when the popup window is fully loaded
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
          if (tabId === popupWindow.tabs[0].id && changeInfo.status === 'complete') {
            // Send the message to the popup script once it's fully loaded
            chrome.tabs.sendMessage(tabId, { action: 'webpageTextSentForSummary', text: message.text });
          }
        });
      });
    });
  }

  if (message.openPopupPoints) {
    // Open the extension's default popup as an overlay
    chrome.windows.getCurrent(function (currentWindow) {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 400, // Set the width of your popup window
        height: 1000, // Set the height of your popup window
        left: currentWindow.width - 400, // Adjust the offset as needed
        top: 150, // Adjust the offset as needed
      }, function (popupWindow) {
        // Listen for when the popup window is fully loaded
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
          if (tabId === popupWindow.tabs[0].id && changeInfo.status === 'complete') {
            // Send the message to the popup script once it's fully loaded
            chrome.tabs.sendMessage(tabId, { action: 'webpageTextSentForPoints', text: message.text });
          }
        });
      });
    });
  }

});
