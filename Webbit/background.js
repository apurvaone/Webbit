// background.js

// Listen for incoming messages from the extension's popup or content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Handle message to open the summary popup
  if (message.openPopupSummary) {
    // Get the current window to determine positioning
    chrome.windows.getCurrent(function (currentWindow) {
      // Create a new popup window with specific dimensions and position
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 435,
        height: 1000,
        left: currentWindow.width - 435,
        top: 150,
      }, function (popupWindow) {
        // Listen for when the popup window is fully loaded
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
          // Check if the tab in the popup is fully loaded
          if (tabId === popupWindow.tabs[0].id && changeInfo.status === 'complete') {
            // Send a message to the popup script once it's fully loaded
            chrome.tabs.sendMessage(tabId, { action: 'webpageTextSentForSummary', text: message.text });
          }
        });
      });
    });
  }

  // Handle message to open the points popup
  if (message.openPopupPoints) {
    // Get the current window to determine positioning
    chrome.windows.getCurrent(function (currentWindow) {
      // Create a new popup window with specific dimensions and position
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 400,
        height: 1000,
        left: currentWindow.width - 400,
        top: 150,
      }, function (popupWindow) {
        // Listen for when the popup window is fully loaded
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
          // Check if the tab in the popup is fully loaded
          if (tabId === popupWindow.tabs[0].id && changeInfo.status === 'complete') {
            // Send a message to the popup script once it's fully loaded
            chrome.tabs.sendMessage(tabId, { action: 'webpageTextSentForPoints', text: message.text });
          }
        });
      });
    });
  }
});
