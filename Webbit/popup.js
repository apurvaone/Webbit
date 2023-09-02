document.addEventListener('DOMContentLoaded', function() {
    const getSummaryButton = document.getElementById('getSummaryButton');
    const summaryDiv = document.getElementById('summary');
  
    getSummaryButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              function: getWebpageText,
            },
            function(results) {
              const webpageText = results[0].result;
              console.log(webpageText)
              sendTextToAPI(webpageText);
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
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error fetching summary.");
            }
            return response.json();
          })
          .then((data) => {
            // Assuming the API response contains a 'choices' array with the summary in 'message' field
            const summary = data.choices[0].message.content;
            summaryDiv.innerText = summary;
          })
          .catch((error) => {
            summaryDiv.innerText = `Error: ${error.message}`;
          });
      }
      
  });
  