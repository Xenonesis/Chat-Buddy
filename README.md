# Chat-Buddy

## Description

Chat-Buddy is a modern web application that allows users to interact with different AI models, including Claude, Gemini, and Mistral. The application provides a clean and intuitive user interface for chatting with the selected AI, with features like model selection, a settings modal for API key configuration, and theme switching.

## Features

- **Multiple AI Models:** Choose between Claude, Gemini, and Mistral for your chat interactions.
- **Real-time Chat:** Send messages and receive responses in real-time. Claude responses are streamed for a more interactive experience.
- **Settings Modal:** Configure API keys for each AI model.
- **Theme Toggle:** Switch between light and dark themes.
- **Responsive Design:** Works seamlessly on various screen sizes.
- **Message Timestamps:** Optionally display timestamps for each message.
- **Markdown Support:** AI responses are formatted with basic Markdown (code blocks, inline code, bold, italic, links).
- **Character Count:** Displays the number of characters in the input field.
- **Keyboard Shortcuts:** Press Enter to send a message, and Shift+Enter for a new line.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd [project_directory]
    ```
2.  **Open `index.html` in your browser.**

## API Key Configuration

1.  Open the settings modal by clicking the cog icon in the header.
2.  Enter your API keys for Claude, Gemini, and Mistral in the respective input fields.
    -   **Claude:** Obtain your API key from [Anthropic's website](https://www.anthropic.com/). Use it in the `puter.ai.chat` function call within the `streamClaudeResponse` function in the `index.html` file.
    -   **Gemini:** Obtain your API key from [Google AI Studio](https://ai.google.dev/). The key is used in the `fetchGeminiResponse` function.
    -   **Mistral:** Obtain your API key from [Mistral AI's website](https://mistral.ai/). The key is used in the `fetchMistralResponse` function.
3.  Click "Save Settings". The API keys are stored in your browser's local storage.

## Technologies Used

- HTML
- CSS (Tailwind CSS)
- JavaScript
- [Puter](https://puter.com/) (for Claude API)
- [Google Generative Language API](https://ai.google.dev/) (for Gemini)
- [Mistral API](https://mistral.ai/) (for Mistral)
- [Font Awesome](https://fontawesome.com/) (for icons)
- [Tailwind CDN](https://cdn.tailwindcss.com)
- [cdnjs](https://cdnjs.com/libraries/font-awesome)
