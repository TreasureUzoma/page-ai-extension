// Get DOM elements
const summaryDiv = document.getElementById("summary");
const loadingDiv = document.getElementById("loading");
const titleDiv = document.getElementById("title");
const summaryContainer = document.getElementById("summary-container");
const statusText = document.getElementById("status-text");
const timeEstimate = document.getElementById("time-estimate");
const summaryStatusDot = document.getElementById("summary-status-dot");
const summaryStatusText = document.getElementById("summary-status-text");

async function summarizePage() {
  // Reset UI state
  summaryDiv.textContent = "";
  summaryContainer.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
  titleDiv.textContent = "Summarizing page content...";
  statusText.textContent = "Analyzing content...";
  timeEstimate.textContent = "~30s";

  // Disable buttons during processing
  const copyBtn = document.getElementById("copy-btn");
  const refreshBtn = document.getElementById("refresh-btn");

  if (copyBtn) copyBtn.disabled = true;
  if (refreshBtn) refreshBtn.disabled = true;

  try {
    // Inject content script to get page text
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getPageText,
    });

    const pageText = result[0].result;

    if (!pageText || pageText.trim().length === 0) {
      showError("No text found on this page.");
      return;
    }

    statusText.textContent = "Sending to AI...";
    timeEstimate.textContent = "~15s";

    // Call your API with the page text
    const response = await fetch("https://treasurepageai.vercel.app/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: pageText }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Show success state
    titleDiv.textContent = "Summary";
    summaryDiv.textContent = data.content || "No summary returned.";
    summaryStatusDot.classList.remove("error");
    summaryStatusText.textContent = "Summary Ready";
    statusText.textContent = "Complete";
    timeEstimate.textContent = "Done";

    loadingDiv.classList.add("hidden");
    summaryContainer.classList.remove("hidden");
  } catch (err) {
    console.error("Error in summarizePage:", err);
    showError(err.message);
  } finally {
    // Re-enable buttons
    if (copyBtn) copyBtn.disabled = false;
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function showError(message) {
  titleDiv.textContent = "Error";
  summaryDiv.textContent = message;
  summaryStatusDot.classList.add("error");
  summaryStatusText.textContent = "Error Occurred";
  statusText.textContent = "Failed";
  timeEstimate.textContent = "Error";

  loadingDiv.classList.add("hidden");
  summaryContainer.classList.remove("hidden");
}

function getPageText() {
  function getVisibleText(node) {
    let text = "";
    if (node.nodeType === Node.TEXT_NODE) {
      if (
        node.parentNode &&
        window.getComputedStyle(node.parentNode).display !== "none"
      ) {
        text += node.textContent + " ";
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)
    ) {
      for (const child of node.childNodes) {
        text += getVisibleText(child);
      }
    }
    return text;
  }
  return getVisibleText(document.body).trim();
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Copy button functionality
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const text = summaryDiv.textContent;
      if (text) {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(function () {
              copyBtn.textContent = originalText;
            }, 2000);
          })
          .catch(function () {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);

            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(function () {
              copyBtn.textContent = originalText;
            }, 2000);
          });
      }
    });
  }

  // Refresh button functionality
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      summarizePage();
    });
  }

  // Start summarization on load
  summarizePage();
});
