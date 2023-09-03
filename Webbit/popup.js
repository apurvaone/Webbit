document.addEventListener('DOMContentLoaded', function () {
  // Get references to various elements in the HTML
  const getSummaryButton = document.getElementById('getSummaryButton');
  const getImportantPointsButton = document.getElementById('getImportantPointsButton');
  const summaryDiv = document.getElementById('summary');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  var webPageRawText = null;

  // Listener for receiving webpage text for summary
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'webpageTextSentForSummary') {
      // Hide buttons, get summary, and update the heading
      getSummaryButton.style.display = 'none';
      getImportantPointsButton.style.display = 'none';
      getSummary(message.text);
      const headingDiv = document.getElementById('summaryHeading');
      headingDiv.style.display = 'block';
      headingDiv.innerHTML = `<h5>${"Summary"}</h5>`;
    }
  });

  // Listener for receiving webpage text for important points
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'webpageTextSentForPoints') {
      // Hide buttons, get important points, and update the heading
      getSummaryButton.style.display = 'none';
      getImportantPointsButton.style.display = 'none';
      getPoints(message.text);
      const headingDiv = document.getElementById('summaryHeading');
      headingDiv.style.display = 'block';
      headingDiv.innerHTML = `<h5>${"Important Points"}</h5>`;
    }
  });

  // Listener for the "Get Summary" button click
  getSummaryButton.addEventListener('click', function () {
    getSummary(webPageRawText);
  });

  // Listener for the "Get Important Points" button click
  getImportantPointsButton.addEventListener('click', function () {
    getPoints(webPageRawText);
  });

  // Function to extract important points from webpage text
  function getPoints(webPageText) {
    showProgressBar();

    if (webPageText == null) {
      // If webPageText is not available, fetch it from the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              function: getWebpageText,
            },
            function (results) {
              const webpageText = results[0].result;

              // Update the heading and send text to API for extraction
              const headingDiv = document.getElementById('summaryHeading');
              headingDiv.style.display = 'block';
              headingDiv.innerHTML = `<h5>${"Important Points"}</h5>`;
              sendTextToAPI("Here is raw text from a webpage; Extract important points: " + webpageText.slice(0, 2500));
            }
          );
        } else {
          summaryDiv.innerText = 'No active tab found.';
        }
      });
    } else {
      // If webPageText is already available, send it to API for extraction
      sendTextToAPI("Here is raw text from a webpage; Extract important points: " + webPageText);
    }
  }

  // Function to get webpage text using a content script
  function getSummary(webPageText) {
    console.log("Here in getsumm" + webPageText);
    showProgressBar();

    if (webPageText == null) {
      // If webPageText is not available, fetch it from the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              function: getWebpageText,
            },
            function (results) {
              var webpageText = results[0].result;

              // Update the heading and send text to API for summarization
              const headingDiv = document.getElementById('summaryHeading');
              headingDiv.style.display = 'block';
              headingDiv.innerHTML = `<h5>${"Summary"}</h5>`;
              sendTextToAPI("Here is raw text from a webpage; Summarize it: " + webpageText);
            }
          );
        } else {
          summaryDiv.innerText = 'No active tab found.';
        }
      });
    } else {
      // If webPageText is already available, send it to API for summarization
      sendTextToAPI("Here is raw text from a webpage; Summarize it: " + webPageText);
    }
  }

  // Function to extract text from the webpage's body
  function getWebpageText() {
    return document.body.innerText;
  }

  // Function to display progress bar
  function showProgressBar() {
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.innerText = 'Request in progress...';
  }

  // Function to hide the progress bar
  function hideProgressBar() {
    progressContainer.style.display = 'none';
  }

  // Listener for the "Copy Summary" button click
  document.getElementById("copySummaryButton").addEventListener("click", function () {
    var copyButton = document.getElementById("copySummaryButton");
    var summaryText = document.getElementById("summary").textContent;
    var textArea = document.createElement("textarea");
    textArea.style.fontSize = "12px";
    textArea.value = summaryText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    copyButton.textContent = "Copied";
    copyButton.style.backgroundColor = "gray";
    setTimeout(function () {
      copyButton.textContent = "Copy";
      copyButton.style.backgroundColor = "#2c3e50";
    }, 5000);
  });

  // Function to send text to the OpenAI API for processing
  function sendTextToAPI(text) {
    const apiKey = "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";
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }],
      temperature: 0.7,
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        hideProgressBar();
        if (!response.ok) {
          throw {
            message: "Error fetching summary.",
            response: response,
          };
        }
        return response.json();
      })
      .then((data) => {
        const summary = data.choices[0].message.content;
        summaryDiv.innerText = summary;
      })
      .catch(async (error) => {
        let errorMessage = `Error: ${error.message}`;
        if (error.response && error.response.body) {
          try {
            const responseBody = await error.response.json();
            errorMessage += `\nResponse Body: ${JSON.stringify(responseBody, null, 2)}`;
          } catch (parseError) {
            console.error("Error parsing response body:", parseError);
          }
        }
        summaryDiv.innerText = errorMessage;
        console.error(error);
      });
  }
});
