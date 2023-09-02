document.addEventListener('DOMContentLoaded', function () {
  const getSummaryButton = document.getElementById('getSummaryButton');
  const getImportantPointsButton = document.getElementById('getImportantPointsButton');
  const summaryDiv = document.getElementById('summary');

  getSummaryButton.addEventListener('click', function () {
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
            sendTextToAPI("Here is raw text from a webpage; Summarize it: " +webpageText.slice(0, 2500));
          }
        );
      } else {
        summaryDiv.innerText = 'No active tab found.';
      }
    });
  });


  getImportantPointsButton.addEventListener('click', function () {
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
            sendTextToAPI("Here is raw text from a webpage; Extract important points: " + webpageText.slice(0, 2500));
          }
        );
      } else {
        summaryDiv.innerText = 'No active tab found.';
      }
    });
  });

  function getWebpageText() {
    return document.body.innerText;
  }

  function sendTextToAPI(text) {
    const apiKey = "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";
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // Prepare the request data
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
        if (!response.ok) {
          throw {
            message: "Error fetching summary.",
            response: response, // Include the response object
          };
        }
        return response.json();
      })
      .then((data) => {
        // Assuming the API response contains a 'choices' array with the summary in 'message' field
        const summary = data.choices[0].message.content;
        summaryDiv.innerText = summary;
      })
      .catch(async (error) => {
        let errorMessage = `Error: ${error.message}`;

        // Check if there's a response body to log
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
