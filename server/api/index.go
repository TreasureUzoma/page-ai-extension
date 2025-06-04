package handler

import (
	"fmt"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)

	html := `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <title>AI Summarizer</title>
    <style>
      * {
        font-family: "Geist", sans-serif;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: #e6f0ff;
        color: #0a2540;
      }

      .container {
        max-width: 700px;
        margin: 40px auto;
        padding: 20px 15px;
        background-color: #ffffffcc;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 50, 100, 0.1);
      }

      h1,
      h2 {
        text-align: center;
      }

      textarea {
        width: 94%;
        height: 150px;
        padding: 12px;
        font-size: 1rem;
        border-radius: 8px;
        border: 1px solid #cce0ff;
        background: #f7fbff;
        resize: vertical;
        margin-bottom: 16px;
      }

      button {
        background-color: #1a73e8;
        color: white;
        padding: 12px 24px;
        font-size: 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: block;
        margin: 0 auto;
      }

      button:hover {
        background-color: #155ab6;
      }

      .output-box {
        margin-top: 20px;
        padding: 15px;
        background-color: #f0f7ff;
        border-left: 5px solid #1a73e8;
        border-radius: 6px;
        min-height: 80px;
      }

      .loader {
        border: 4px solid #cce0ff;
        border-top: 4px solid #1a73e8;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>AI Summarizer</h1>
      <textarea id="inputText" placeholder="Paste your text here..."></textarea>
      <button onclick="summarize()">Summarize</button>
      <div id="loader" class="loader" style="display: none"></div>
      <h2>Summary</h2>
      <div id="summaryOutput" class="output-box">
        Your summary will appear here.
      </div>
    </div>

    <script>
      async function summarize() {
        const inputText = document.getElementById("inputText").value.trim();
        const summaryOutput = document.getElementById("summaryOutput");
        const loader = document.getElementById("loader");

        if (!inputText) {
          summaryOutput.textContent = "Please enter some text to summarize.";
          return;
        }

        loader.style.display = "block";
        summaryOutput.textContent = "";

        try {
          const response = await fetch("https://treasurepageai.vercel.app/ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: inputText }),
          });

          if (!response.ok) {
            throw new Error("Failed to summarize.");
          }

          const data = await response.json();
          summaryOutput.textContent = data.content || "No summary returned.";
        } catch (err) {
          summaryOutput.textContent = "Error: " + err.message;
        } finally {
          loader.style.display = "none";
        }
      }
    </script>
  </body>
</html>

	`
	fmt.Fprint(w, html)
}
