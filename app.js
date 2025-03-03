document.addEventListener('DOMContentLoaded', function() {
    // Main application state
    const state = {
        currentModel: 'claude',
        currentMode: 'standard',
        isTyping: false,
        isRequestPending: false,
        themeMode: 'light',
        showTimestamps: false,
        enableAnimations: true,
        compactMode: false,
        streamingEnabled: true,
        messageHistory: [],
        messageCount: 0,
        fontSizeClass: 'text-base',
        currentCodeTheme: 'github',
        memoryEnabled: true,
        memoryLimit: 20,
        temperature: 0.7,
        maxTokens: 1000,
        selectedMessageId: null, // For feedback and other actions
        welcomeScreenShown: true,
    };

    // DOM elements
    const elements = {
        chatContainer: document.getElementById('chat-container'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        modelBtns: document.querySelectorAll('.model-btn'),
        charCount: document.getElementById('char-count'),
        themeToggle: document.getElementById('theme-toggle'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettings: document.getElementById('close-settings'),
        saveSettings: document.getElementById('save-settings'),
        showTimestampsCheck: document.getElementById('show-timestamps'),
        claudeApiKey: document.getElementById('claude-api-key'),
        geminiApiKey: document.getElementById('gemini-api-key'),
        mistralApiKey: document.getElementById('mistral-api-key'),
        openaiApiKey: document.getElementById('openai-api-key'),
        clearChat: document.getElementById('clear-chat'),
        exportChat: document.getElementById('export-chat'),
        conversationMode: document.getElementById('conversation-mode'),
        currentModelDisplay: document.getElementById('current-model-display'),
        messageCountDisplay: document.getElementById('message-count'),
        autoScroll: document.getElementById('auto-scroll'),
        scrollToBottom: document.getElementById('scroll-to-bottom'),
        enableAnimationsCheck: document.getElementById('enable-animations'),
        compactModeCheck: document.getElementById('compact-mode'),
        temperatureSlider: document.getElementById('temperature'),
        temperatureValue: document.getElementById('temperature-value'),
        maxTokensInput: document.getElementById('max-tokens'),
        memoryEnabledCheck: document.getElementById('memory-enabled'),
        memoryLimitSelect: document.getElementById('memory-limit'),
        streamingEnabledCheck: document.getElementById('streaming-enabled'),
        fontSizeSm: document.getElementById('font-size-sm'),
        fontSizeMd: document.getElementById('font-size-md'),
        fontSizeLg: document.getElementById('font-size-lg'),
        codeThemeSelect: document.getElementById('code-theme'),
        clearInput: document.getElementById('clear-input'),
        tabApiKeys: document.getElementById('tab-api-keys'),
        tabDisplay: document.getElementById('tab-display'),
        tabAdvanced: document.getElementById('tab-advanced'),
        contentApiKeys: document.getElementById('content-api-keys'),
        contentDisplay: document.getElementById('content-display'),
        contentAdvanced: document.getElementById('content-advanced'),
        toggleClaudeKeyBtn: document.getElementById('toggle-claude-key-visibility'),
        toggleGeminiKeyBtn: document.getElementById('toggle-gemini-key-visibility'),
        toggleMistralKeyBtn: document.getElementById('toggle-mistral-key-visibility'),
        toggleOpenaiKeyBtn: document.getElementById('toggle-openai-key-visibility'),
        clearAllDataBtn: document.getElementById('clear-all-data'),
        exportAllChatsBtn: document.getElementById('export-all-chats'),
        conversationInfo: document.getElementById('conversation-info'),
        responseActionsTemplate: document.getElementById('response-actions-template'),
        attachFile: document.getElementById('attach-file'),
        feedbackModal: document.getElementById('feedback-modal'),
        closeFeedback: document.getElementById('close-feedback'),
        feedbackText: document.getElementById('feedback-text'),
        submitFeedback: document.getElementById('submit-feedback'),
        commandsModal: document.getElementById('commands-modal'),
        closeCommands: document.getElementById('close-commands'),
        commandBtns: document.querySelectorAll('.command-btn'),
        quickPrompts: document.querySelectorAll('.quick-prompt'),
        quickCommands: document.getElementById('quick-commands'),
        welcomeScreen: document.querySelector('.welcome-screen'),
    };

    // Initialize application
    function init() {
        loadSettings();
        setActiveModelBtn(state.currentModel);
        loadHistoryFromLocalStorage();
        setupEventListeners();
        
        // Hide welcome screen if there are messages
        if (state.messageHistory.length > 0) {
            hideWelcomeScreen();
        }
    }

    // Hide welcome screen
    function hideWelcomeScreen() {
        if (elements.welcomeScreen) {
            elements.welcomeScreen.classList.add('hidden');
            state.welcomeScreenShown = false;
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Send message
        elements.sendBtn.addEventListener('click', handleSend);
        elements.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
        elements.userInput.addEventListener('input', () => {
            elements.charCount.textContent = elements.userInput.value.length;
        });
        
        // Focus on textarea when clicking anywhere in chat container
        elements.chatContainer.addEventListener('click', (e) => {
            // Don't focus if clicking on a button or link
            if (!e.target.closest('button') && !e.target.closest('a')) {
                elements.userInput.focus();
            }
        });

        // Model selection
        elements.modelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentModel = btn.dataset.model;
                setActiveModelBtn(state.currentModel);
            });
        });

        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Settings modal
        elements.settingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.remove('hidden');
        });
        elements.closeSettings.addEventListener('click', () => {
            elements.settingsModal.classList.add('hidden');
        });
        elements.saveSettings.addEventListener('click', saveSettingsToStorage);
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.classList.add('hidden');
            }
        });

        // Settings tabs
        elements.tabApiKeys.addEventListener('click', () => switchTab('api-keys'));
        elements.tabDisplay.addEventListener('click', () => switchTab('display'));
        elements.tabAdvanced.addEventListener('click', () => switchTab('advanced'));

        // Clear chat
        elements.clearChat.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear this conversation?')) {
                elements.chatContainer.innerHTML = '';
                state.messageHistory = [];
                localStorage.removeItem('messageHistory');
                state.messageCount = 0;
                updateMessageCount();
                
                // Show welcome screen again
                if (elements.welcomeScreen && state.welcomeScreenShown === false) {
                    elements.chatContainer.appendChild(elements.welcomeScreen);
                    elements.welcomeScreen.classList.remove('hidden');
                    state.welcomeScreenShown = true;
                }
            }
        });

        // Export chat
        elements.exportChat.addEventListener('click', exportCurrentChat);

        // Scroll to bottom
        elements.scrollToBottom.addEventListener('click', () => {
            elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
        });

        // Font size buttons
        elements.fontSizeSm.addEventListener('click', () => {
            state.fontSizeClass = 'text-sm';
            updateFontSizeUI();
        });
        elements.fontSizeMd.addEventListener('click', () => {
            state.fontSizeClass = 'text-base';
            updateFontSizeUI();
        });
        elements.fontSizeLg.addEventListener('click', () => {
            state.fontSizeClass = 'text-lg';
            updateFontSizeUI();
        });

        // Temperature slider
        elements.temperatureSlider.addEventListener('input', () => {
            elements.temperatureValue.textContent = elements.temperatureSlider.value;
        });

        // Clear input button
        elements.clearInput.addEventListener('click', () => {
            elements.userInput.value = '';
            elements.charCount.textContent = '0';
            elements.userInput.focus();
        });

        // Toggle API key visibility
        elements.toggleClaudeKeyBtn.addEventListener('click', () => {
            togglePasswordVisibility(elements.claudeApiKey, elements.toggleClaudeKeyBtn);
        });
        elements.toggleGeminiKeyBtn.addEventListener('click', () => {
            togglePasswordVisibility(elements.geminiApiKey, elements.toggleGeminiKeyBtn);
        });
        elements.toggleMistralKeyBtn.addEventListener('click', () => {
            togglePasswordVisibility(elements.mistralApiKey, elements.toggleMistralKeyBtn);
        });
        elements.toggleOpenaiKeyBtn.addEventListener('click', () => {
            togglePasswordVisibility(elements.openaiApiKey, elements.toggleOpenaiKeyBtn);
        });

        // Conversation mode change
        elements.conversationMode.addEventListener('change', () => {
            state.currentMode = elements.conversationMode.value;
            localStorage.setItem('conversationMode', state.currentMode);
        });

        // Data management
        elements.clearAllDataBtn.addEventListener('click', clearAllChatData);
        elements.exportAllChatsBtn.addEventListener('click', exportCurrentChat);

        // File attachment (placeholder)
        elements.attachFile.addEventListener('click', () => {
            showToast('File uploads coming soon!');
        });

        // Feedback modal
        elements.closeFeedback.addEventListener('click', () => {
            elements.feedbackModal.classList.add('hidden');
        });
        elements.submitFeedback.addEventListener('click', () => {
            submitFeedback();
        });
        elements.feedbackModal.addEventListener('click', (e) => {
            if (e.target === elements.feedbackModal) {
                elements.feedbackModal.classList.add('hidden');
            }
        });

        // Commands modal
        elements.quickCommands.addEventListener('click', () => {
            elements.commandsModal.classList.remove('hidden');
        });
        
        elements.closeCommands.addEventListener('click', () => {
            elements.commandsModal.classList.add('hidden');
        });
        elements.commandsModal.addEventListener('click', (e) => {
            if (e.target === elements.commandsModal) {
                elements.commandsModal.classList.add('hidden');
            }
        });
        elements.commandBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const templateText = btn.querySelector('.text-xs').textContent;
                elements.userInput.value = templateText;
                elements.charCount.textContent = templateText.length;
                elements.commandsModal.classList.add('hidden');
                elements.userInput.focus();
            });
        });
        
        // Quick prompts on welcome screen
        if (elements.quickPrompts) {
            elements.quickPrompts.forEach(prompt => {
                prompt.addEventListener('click', () => {
                    const promptTitle = prompt.querySelector('.font-medium').textContent;
                    let promptText = '';
                    
                    switch (promptTitle) {
                        case 'Explain a concept':
                            promptText = 'Explain quantum computing in simple terms';
                            break;
                        case 'Creative writing':
                            promptText = 'Write a short story about a robot who discovers emotions';
                            break;
                        case 'Code assistance':
                            promptText = 'How do I implement a binary search algorithm in JavaScript?';
                            break;
                        case 'Brainstorm ideas':
                            promptText = 'Give me 5 innovative app ideas for improving remote work productivity';
                            break;
                        default:
                            promptText = 'Hello, can you help me with something?';
                    }
                    
                    elements.userInput.value = promptText;
                    elements.charCount.textContent = promptText.length;
                    elements.userInput.focus();
                    
                    // Auto-send after a short delay for UX
                    setTimeout(() => {
                        handleSend();
                    }, 500);
                });
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to open commands
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                elements.commandsModal.classList.remove('hidden');
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                elements.settingsModal.classList.add('hidden');
                elements.commandsModal.classList.add('hidden');
                elements.feedbackModal.classList.add('hidden');
            }
        });
    }

    // Settings tabs handling
    function switchTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Deactivate all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('border-primary-500', 'text-primary-600');
            btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        });
        
        // Activate selected tab content and button
        document.getElementById(`content-${tabId}`).classList.remove('hidden');
        const activeBtn = document.getElementById(`tab-${tabId}`);
        activeBtn.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        activeBtn.classList.add('border-primary-500', 'text-primary-600');
    }

    // Load settings from localStorage
    function loadSettings() {
        // API Keys
        if (localStorage.getItem('claudeApiKey')) {
            elements.claudeApiKey.value = localStorage.getItem('claudeApiKey');
        }
        if (localStorage.getItem('geminiApiKey')) {
            elements.geminiApiKey.value = localStorage.getItem('geminiApiKey');
        }
        if (localStorage.getItem('mistralApiKey')) {
            elements.mistralApiKey.value = localStorage.getItem('mistralApiKey');
        }
        if (localStorage.getItem('openaiApiKey')) {
            elements.openaiApiKey.value = localStorage.getItem('openaiApiKey');
        }
        
        // Display settings
        state.showTimestamps = localStorage.getItem('showTimestamps') === 'true';
        elements.showTimestampsCheck.checked = state.showTimestamps;
        
        state.enableAnimations = localStorage.getItem('enableAnimations') !== 'false';
        elements.enableAnimationsCheck.checked = state.enableAnimations;
        
        state.compactMode = localStorage.getItem('compactMode') === 'true';
        elements.compactModeCheck.checked = state.compactMode;
        if (state.compactMode) {
            document.body.classList.add('compact-mode');
        }
        
        state.fontSizeClass = localStorage.getItem('fontSize') || 'text-base';
        updateFontSizeUI();
        
        state.currentCodeTheme = localStorage.getItem('codeTheme') || 'github';
        elements.codeThemeSelect.value = state.currentCodeTheme;
        loadCodeTheme(state.currentCodeTheme);
        
        // Model settings
        state.currentModel = localStorage.getItem('currentModel') || 'claude';
        setActiveModelBtn(state.currentModel);
        elements.currentModelDisplay.textContent = capitalizeFirstLetter(state.currentModel);
        
        state.currentMode = localStorage.getItem('conversationMode') || 'standard';
        elements.conversationMode.value = state.currentMode;
        
        // Advanced settings
        state.temperature = parseFloat(localStorage.getItem('temperature')) || 0.7;
        elements.temperatureSlider.value = state.temperature;
        elements.temperatureValue.textContent = state.temperature;
        
        state.maxTokens = parseInt(localStorage.getItem('maxTokens')) || 1000;
        elements.maxTokensInput.value = state.maxTokens;
        
        state.memoryEnabled = localStorage.getItem('memoryEnabled') !== 'false';
        elements.memoryEnabledCheck.checked = state.memoryEnabled;
        
        state.memoryLimit = parseInt(localStorage.getItem('memoryLimit')) || 20;
        elements.memoryLimitSelect.value = state.memoryLimit.toString();
        
        state.streamingEnabled = localStorage.getItem('streamingEnabled') !== 'false';
        elements.streamingEnabledCheck.checked = state.streamingEnabled;
        
        // Theme settings
        state.themeMode = localStorage.getItem('themeMode') || 'light';
        applyTheme();
    }

    // Save settings to localStorage
    function saveSettingsToStorage() {
        // API Keys
        localStorage.setItem('claudeApiKey', elements.claudeApiKey.value);
        localStorage.setItem('geminiApiKey', elements.geminiApiKey.value);
        localStorage.setItem('mistralApiKey', elements.mistralApiKey.value);
        localStorage.setItem('openaiApiKey', elements.openaiApiKey.value);
        
        // Display settings
        localStorage.setItem('showTimestamps', elements.showTimestampsCheck.checked);
        state.showTimestamps = elements.showTimestampsCheck.checked;
        
        localStorage.setItem('enableAnimations', elements.enableAnimationsCheck.checked);
        state.enableAnimations = elements.enableAnimationsCheck.checked;
        
        localStorage.setItem('compactMode', elements.compactModeCheck.checked);
        state.compactMode = elements.compactModeCheck.checked;
        if (state.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        
        localStorage.setItem('fontSize', state.fontSizeClass);
        document.querySelectorAll('.markdown').forEach(el => {
            updateElementFontSize(el);
        });
        
        localStorage.setItem('codeTheme', elements.codeThemeSelect.value);
        state.currentCodeTheme = elements.codeThemeSelect.value;
        loadCodeTheme(state.currentCodeTheme);
        
        // Advanced settings
        localStorage.setItem('temperature', elements.temperatureSlider.value);
        state.temperature = parseFloat(elements.temperatureSlider.value);
        
        localStorage.setItem('maxTokens', elements.maxTokensInput.value);
        state.maxTokens = parseInt(elements.maxTokensInput.value);
        
        localStorage.setItem('memoryEnabled', elements.memoryEnabledCheck.checked);
        state.memoryEnabled = elements.memoryEnabledCheck.checked;
        
        localStorage.setItem('memoryLimit', elements.memoryLimitSelect.value);
        state.memoryLimit = parseInt(elements.memoryLimitSelect.value);
        
        localStorage.setItem('streamingEnabled', elements.streamingEnabledCheck.checked);
        state.streamingEnabled = elements.streamingEnabledCheck.checked;
        
        elements.settingsModal.classList.add('hidden');
        
        // Update conversation display based on new settings
        refreshMessageDisplay();
        
        // Show confirmation
        showToast('Settings saved successfully!');
    }
    
    // Apply font size to an element
    function updateElementFontSize(element) {
        element.classList.remove('text-sm', 'text-base', 'text-lg');
        element.classList.add(state.fontSizeClass);
    }
    
    // Update font size UI buttons
    function updateFontSizeUI() {
        const allButtons = [elements.fontSizeSm, elements.fontSizeMd, elements.fontSizeLg];
        allButtons.forEach(btn => {
            btn.classList.remove('border-primary-600', 'bg-primary-50', 'text-primary-600');
            btn.classList.add('border-gray-300', 'text-gray-700');
        });
        
        if (state.fontSizeClass === 'text-sm') {
            elements.fontSizeSm.classList.remove('border-gray-300', 'text-gray-700');
            elements.fontSizeSm.classList.add('border-primary-600', 'bg-primary-50', 'text-primary-600');
        } else if (state.fontSizeClass === 'text-base') {
            elements.fontSizeMd.classList.remove('border-gray-300', 'text-gray-700');
            elements.fontSizeMd.classList.add('border-primary-600', 'bg-primary-50', 'text-primary-600');
        } else if (state.fontSizeClass === 'text-lg') {
            elements.fontSizeLg.classList.remove('border-gray-300', 'text-gray-700');
            elements.fontSizeLg.classList.add('border-primary-600', 'bg-primary-50', 'text-primary-600');
        }
    }
    
    // Load Code Theme CSS
    function loadCodeTheme(theme) {
        // Remove any existing theme
        const existingTheme = document.querySelector('link[data-highlight-theme]');
        if (existingTheme) {
            existingTheme.remove();
        }
        
        // Add new theme
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`;
        link.setAttribute('data-highlight-theme', '');
        document.head.appendChild(link);
        
        // Re-highlight code blocks
        if (window.hljs) {
            document.querySelectorAll('pre code').forEach(block => {
                window.hljs.highlightElement(block);
            });
        }
    }

    // Apply theme mode
    function applyTheme() {
        if (state.themeMode === 'dark') {
            document.documentElement.classList.add('dark');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
        } else {
            document.documentElement.classList.remove('dark');
            elements.themeToggle.innerHTML = '<i class="fas fa-moon text-gray-600"></i>';
        }
    }

    // Toggle theme
    function toggleTheme() {
        state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', state.themeMode);
        applyTheme();
        
        // Show a toast notification
        showToast(`${capitalizeFirstLetter(state.themeMode)} mode activated`);
    }

    // Set active model button
    function setActiveModelBtn(model) {
        elements.modelBtns.forEach(btn => {
            if (btn.dataset.model === model) {
                btn.classList.remove('text-gray-700', 'hover:bg-gray-100');
                btn.classList.add('bg-primary-600', 'text-white');
            } else {
                btn.classList.remove('bg-primary-600', 'text-white');
                btn.classList.add('text-gray-700', 'hover:bg-gray-100');
            }
        });
        
        localStorage.setItem('currentModel', model);
        elements.currentModelDisplay.textContent = capitalizeFirstLetter(model);
    }
    
    // Toggle password field visibility
    function togglePasswordVisibility(inputField, toggleBtn) {
        if (inputField.type === 'password') {
            inputField.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            inputField.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    // Format markdown in response
    function formatMarkdown(text) {
        // Use marked library for markdown parsing
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code, language) {
                if (language && hljs.getLanguage(language)) {
                    return hljs.highlight(code, { language }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            pedantic: false,
            gfm: true,
            breaks: true,
            sanitize: false,
            smartypants: true,
            xhtml: false
        });
        
        return marked.parse(text);
    }

    // Add message to chat
    function addMessage(content, isUser = false, animate = true) {
        // Hide welcome screen if visible
        if (state.welcomeScreenShown) {
            hideWelcomeScreen();
        }
        
        state.messageCount++;
        updateMessageCount();
        
        const messageContainer = document.createElement('div');
        messageContainer.className = isUser ? 'message-container user' : 'message-container assistant';
        if (animate && state.enableAnimations) {
            messageContainer.classList.add('message-animation');
        }
        
        const timestamp = new Date();
        const timestampStr = state.showTimestamps ? 
            `<div class="message-timestamp">${timestamp.toLocaleTimeString()}</div>` : '';
        
        // Generate a unique ID for this message
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        messageContainer.id = messageId;
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        // Create message bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = isUser ? 'user-message-bubble' : 'assistant-message-bubble';
        
        if (isUser) {
            // Store in message history
            state.messageHistory.push({
                id: messageId,
                role: 'user',
                content: content,
                timestamp: timestamp
            });
            
            bubbleDiv.textContent = content;
            messageContainer.appendChild(avatarDiv);
            messageContainer.appendChild(bubbleDiv);
            
            // Add timestamp if enabled
            if (state.showTimestamps) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-timestamp';
                timeDiv.textContent = timestamp.toLocaleTimeString();
                messageContainer.appendChild(timeDiv);
            }
        } else {
            // Store in message history
            state.messageHistory.push({
                id: messageId,
                role: 'assistant',
                content: content,
                timestamp: timestamp
            });
            
            // For assistant messages, use markdown formatting
            bubbleDiv.innerHTML = `<div class="markdown ${state.fontSizeClass}">${formatMarkdown(content)}</div>`;
            messageContainer.appendChild(avatarDiv);
            messageContainer.appendChild(bubbleDiv);
            
            // Add timestamp if enabled
            if (state.showTimestamps) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-timestamp';
                timeDiv.textContent = timestamp.toLocaleTimeString();
                messageContainer.appendChild(timeDiv);
            }
            
            // Add response actions
            const actionsDiv = elements.responseActionsTemplate.querySelector('.response-actions').cloneNode(true);
            messageContainer.appendChild(actionsDiv);
            
            // Attach event listeners to action buttons
            const copyBtn = actionsDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(content)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
                        }, 2000);
                    });
            });
            
            const regenerateBtn = actionsDiv.querySelector('.regenerate-btn');
            regenerateBtn.addEventListener('click', () => {
                const lastUserMessage = state.messageHistory.findLast(msg => msg.role === 'user');
                if (lastUserMessage) {
                    // Remove the last assistant message
                    state.messageHistory.pop();
                    messageContainer.remove();
                    state.messageCount--;
                    updateMessageCount();
                    
                    // Add typing indicator and send to AI
                    addTypingIndicator();
                    sendToAI(lastUserMessage.content);
                }
            });
            
            // Feedback buttons
            const positiveBtn = actionsDiv.querySelector('.feedback-positive-btn');
            positiveBtn.addEventListener('click', () => {
                showFeedbackModal(messageId, 'positive');
            });
            
            const negativeBtn = actionsDiv.querySelector('.feedback-negative-btn');
            negativeBtn.addEventListener('click', () => {
                showFeedbackModal(messageId, 'negative');
            });
            
            // Highlight code blocks
            setTimeout(() => {
                if (window.hljs) {
                    bubbleDiv.querySelectorAll('pre code').forEach(block => {
                        hljs.highlightElement(block);
                    });
                }
            }, 0);
        }
        
        elements.chatContainer.appendChild(messageContainer);
        if (elements.autoScroll.checked) {
            elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
        }
        
        // Save history to localStorage
        saveHistoryToLocalStorage();
    }
    
    // Show feedback modal
    function showFeedbackModal(messageId, feedbackType) {
        state.selectedMessageId = messageId;
        elements.feedbackText.value = '';
        elements.feedbackModal.classList.remove('hidden');
        elements.feedbackText.focus();
    }
    
    // Submit feedback
    function submitFeedback() {
        const feedbackText = elements.feedbackText.value.trim();
        const messageId = state.selectedMessageId;
        
        if (messageId) {
            // Here you would typically send this to your server
            console.log(`Feedback for message ${messageId}: ${feedbackText}`);
            
            // For now just show a confirmation
            elements.feedbackModal.classList.add('hidden');
            showToast('Thank you for your feedback!');
        }
    }
    
    // Show toast notification
    function showToast(message, duration = 3000) {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => {
            document.body.removeChild(toast);
        });
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification feedback-confirmation';
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.add('hidden');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }
    
    // Save message history to localStorage
    function saveHistoryToLocalStorage() {
        try {
            const historyToSave = state.memoryEnabled && state.memoryLimit > 0 ? 
                state.messageHistory.slice(-state.memoryLimit * 2) : state.messageHistory;
            localStorage.setItem('messageHistory', JSON.stringify(historyToSave));
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }
    
    // Load message history from localStorage
    function loadHistoryFromLocalStorage() {
        try {
            const savedHistory = localStorage.getItem('messageHistory');
            if (savedHistory) {
                state.messageHistory = JSON.parse(savedHistory);
                refreshMessageDisplay();
            }
        } catch (e) {
            console.error('Error loading chat history:', e);
        }
    }
    
    // Refresh all messages in the display
    function refreshMessageDisplay() {
        // Clear current display
        elements.chatContainer.innerHTML = '';
        state.messageCount = 0;
        
        // Re-add all messages
        state.messageHistory.forEach(msg => {
            addMessage(msg.content, msg.role === 'user', false);
        });
    }
    
    // Update message count display
    function updateMessageCount() {
        elements.messageCountDisplay.textContent = `${state.messageCount} message${state.messageCount !== 1 ? 's' : ''}`;
        
        // Update conversation info
        if (state.messageCount > 0) {
            const date = new Date();
            elements.conversationInfo.textContent = `${date.toLocaleDateString()} · ${state.messageCount} message${state.messageCount !== 1 ? 's' : ''}`;
        } else {
            elements.conversationInfo.textContent = 'New conversation';
        }
    }

    // Add typing indicator
    function addTypingIndicator() {
        const messageContainer = document.createElement('div');
        messageContainer.id = 'typing-indicator';
        messageContainer.className = 'message-container assistant';
        if (state.enableAnimations) {
            messageContainer.classList.add('message-animation');
        }
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        
        // Create typing bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'assistant-message-bubble';
        bubbleDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messageContainer.appendChild(avatarDiv);
        messageContainer.appendChild(bubbleDiv);
        
        elements.chatContainer.appendChild(messageContainer);
        if (elements.autoScroll.checked) {
            elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
        }
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Send message to selected AI model
    async function sendToAI(message) {
        state.isRequestPending = true;
        
        try {
            let response = '';
            
            // Add prompt based on conversation mode
            let promptedMessage = message;
            if (state.currentMode === 'creative') {
                promptedMessage = `[Creative Mode] Please provide a creative and imaginative response to this: ${message}`;
            } else if (state.currentMode === 'precise') {
                promptedMessage = `[Precise Mode] Please provide a factual, concise and accurate response to this: ${message}`;
            } else if (state.currentMode === 'coding') {
                promptedMessage = `[Coding Assistant] Please help with this programming question or task: ${message}`;
            }
            
            if (state.currentModel === 'claude') {
                if (state.streamingEnabled) {
                    await streamClaudeResponse(promptedMessage);
                } else {
                    response = await fetchClaudeResponse(promptedMessage);
                    removeTypingIndicator();
                    addMessage(response);
                }
            } else if (state.currentModel === 'gemini') {
                response = await fetchGeminiResponse(promptedMessage);
                removeTypingIndicator();
                addMessage(response);
            } else if (state.currentModel === 'mistral') {
                response = await fetchMistralResponse(promptedMessage);
                removeTypingIndicator();
                addMessage(response);
            } else if (state.currentModel === 'gpt') {
                response = await fetchOpenAIResponse(promptedMessage);
                removeTypingIndicator();
                addMessage(response);
            }
        } catch (error) {
            console.error('Error sending message to AI:', error);
            removeTypingIndicator();
            addMessage(`Error: ${error.message || 'There was an error processing your request. Please check your API key and try again.'}`);
            
            // Show toast notification for error
            showToast('Error connecting to AI service. Please check your settings.', 4000);
        } finally {
            state.isRequestPending = false;
        }
    }
    
    // Non-streaming Claude response
    async function fetchClaudeResponse(message) {
        try {
            const apiKey = elements.claudeApiKey.value;
            if (!apiKey) throw new Error('Claude API key is required');
            
            const response = await puter.ai.chat(
                message, 
                {
                    model: 'claude-3-5-sonnet', 
                    apiKey: apiKey,
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                }
            );
            
            return response.text;
        } catch (error) {
            console.error('Error fetching Claude response:', error);
            throw error;
        }
    }

    // Stream Claude response
    async function streamClaudeResponse(message) {
        try {
            let responseText = '';
            let responseDiv = null;
            let timestamp = new Date();
            
            removeTypingIndicator();
            
            // Create message container
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container assistant';
            if (state.enableAnimations) {
                messageContainer.classList.add('message-animation');
            }
            
            // Generate a unique ID for this message
            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            messageContainer.id = messageId;
            
            // Create avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
            
            // Create message bubble with an empty response div
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'assistant-message-bubble';
            
            // Unique ID for the response content
            const responseId = 'response-' + Date.now();
            bubbleDiv.innerHTML = `<div id="${responseId}" class="markdown ${state.fontSizeClass}"></div>`;
            
            messageContainer.appendChild(avatarDiv);
            messageContainer.appendChild(bubbleDiv);
            
            // Add timestamp if enabled
            if (state.showTimestamps) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-timestamp';
                timeDiv.textContent = timestamp.toLocaleTimeString();
                messageContainer.appendChild(timeDiv);
            }
            
            // Add actions div but hide it until response is complete
            const actionsDiv = elements.responseActionsTemplate.querySelector('.response-actions').cloneNode(true);
            actionsDiv.style.display = 'none';
            messageContainer.appendChild(actionsDiv);
            
            // Add to container
            elements.chatContainer.appendChild(messageContainer);
            responseDiv = document.getElementById(responseId);
            
            state.messageCount++;
            updateMessageCount();
            
            const response = await puter.ai.chat(
                message, 
                {
                    model: 'claude-3-5-sonnet', 
                    stream: true,
                    apiKey: elements.claudeApiKey.value,
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                }
            );
            
            for await (const part of response) {
                if (part?.text) {
                    responseText += part.text;
                    responseDiv.innerHTML = formatMarkdown(responseText);
                    
                    // Re-highlight code blocks
                    if (window.hljs) {
                        responseDiv.querySelectorAll('pre code').forEach(block => {
                            hljs.highlightElement(block);
                        });
                    }
                    
                    if (elements.autoScroll.checked) {
                        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
                    }
                }
            }
            
            // Store in message history
            state.messageHistory.push({
                id: messageId,
                role: 'assistant',
                content: responseText,
                timestamp: timestamp
            });
            
            // Save chat history
            saveHistoryToLocalStorage();
            
            // Show action buttons
            actionsDiv.style.display = 'flex';
            
            // Attach event listeners to action buttons
            const copyBtn = actionsDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(responseText)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
                        }, 2000);
                    });
            });
            
            const regenerateBtn = actionsDiv.querySelector('.regenerate-btn');
            regenerateBtn.addEventListener('click', () => {
                const lastUserMessage = state.messageHistory.findLast(msg => msg.role === 'user');
                if (lastUserMessage) {
                    // Remove the last assistant message
                    state.messageHistory.pop();
                    messageContainer.remove();
                    state.messageCount--;
                    updateMessageCount();
                    
                    // Add typing indicator and send to AI
                    addTypingIndicator();
                    sendToAI(lastUserMessage.content);
                }
            });
            
            // Feedback buttons
            const positiveBtn = actionsDiv.querySelector('.feedback-positive-btn');
            positiveBtn.addEventListener('click', () => {
                showFeedbackModal(messageId, 'positive');
                
                // Visual feedback
                positiveBtn.classList.add('text-green-600');
                actionsDiv.querySelector('.feedback-negative-btn').classList.remove('text-red-600');
            });
            
            const negativeBtn = actionsDiv.querySelector('.feedback-negative-btn');
            negativeBtn.addEventListener('click', () => {
                showFeedbackModal(messageId, 'negative');
                
                // Visual feedback
                negativeBtn.classList.add('text-red-600');
                actionsDiv.querySelector('.feedback-positive-btn').classList.remove('text-green-600');
            });
            
        } catch (error) {
            console.error('Error streaming Claude response:', error);
            throw error;
        }
    }

    // Fetch Gemini response
    async function fetchGeminiResponse(message) {
        try {
            const apiKey = elements.geminiApiKey.value;
            if (!apiKey) throw new Error('Gemini API key is required');
            
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: message
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: state.temperature,
                        maxOutputTokens: state.maxTokens
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error fetching Gemini response:', error);
            throw error;
        }
    }

    // Fetch Mistral response
    async function fetchMistralResponse(message) {
        try {
            const apiKey = elements.mistralApiKey.value;
            if (!apiKey) throw new Error('Mistral API key is required');
            
            const url = 'https://api.mistral.ai/v1/chat/completions';
            
            // Create chat history for context if memory is enabled
            let messages = [];
            if (state.memoryEnabled && state.memoryLimit > 0) {
                const contextMessages = state.messageHistory
                    .slice(-Math.min(state.memoryLimit * 2, state.messageHistory.length));
                
                messages = contextMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
            }
            
            // Add the current message
            messages.push({
                role: "user",
                content: message
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "mistral-small",
                    messages: messages,
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error fetching Mistral response:', error);
            throw error;
        }
    }
    
    // Fetch OpenAI response
    async function fetchOpenAIResponse(message) {
        try {
            const apiKey = elements.openaiApiKey.value;
            if (!apiKey) throw new Error('OpenAI API key is required');
            
            const url = 'https://api.openai.com/v1/chat/completions';
            
            // Create chat history for context if memory is enabled
            let messages = [];
            if (state.memoryEnabled && state.memoryLimit > 0) {
                const contextMessages = state.messageHistory
                    .slice(-Math.min(state.memoryLimit * 2, state.messageHistory.length));
                
                messages = contextMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
            }
            
            // Add the current message
            messages.push({
                role: "user",
                content: message
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: messages,
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || data.error);
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error fetching OpenAI response:', error);
            throw error;
        }
    }

    // Clear all chat data
    function clearAllChatData() {
        if (confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
            state.messageHistory = [];
            localStorage.removeItem('messageHistory');
            elements.chatContainer.innerHTML = '';
            state.messageCount = 0;
            updateMessageCount();
            elements.conversationInfo.textContent = 'New conversation';
            
            // Show welcome screen again
            if (elements.welcomeScreen && state.welcomeScreenShown === false) {
                elements.chatContainer.appendChild(elements.welcomeScreen);
                elements.welcomeScreen.classList.remove('hidden');
                state.welcomeScreenShown = true;
            }
            
            // Show confirmation
            showToast('All conversations cleared');
        }
    }
    
    // Export chat history
    function exportCurrentChat() {
        if (state.messageHistory.length === 0) {
            showToast('There is no conversation to export.');
            return;
        }
        
        let exportText = '# Chat Export\n\n';
        exportText += `Date: ${new Date().toLocaleString()}\n`;
        exportText += `Model: ${state.currentModel}\n\n`;
        
        state.messageHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'User' : 'AI';
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
            
            exportText += `## ${role} ${time ? `(${time})` : ''}\n\n`;
            exportText += `${msg.content}\n\n`;
            
            if (index < state.messageHistory.length - 1) {
                exportText += '---\n\n';
            }
        });
        
        const blob = new Blob([exportText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Chat exported successfully');
    }

    // Handle send button click
    function handleSend() {
        const message = elements.userInput.value.trim();
        
        if (message && !state.isRequestPending) {
            // Add user message to chat
            addMessage(message, true);
            
            // Clear input
            elements.userInput.value = '';
            elements.charCount.textContent = '0';
            
            // Show typing indicator
            addTypingIndicator();
            
            // Send to AI
            sendToAI(message);
        }
    }
    
    // Helper function: Capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initialize application
    init();
});