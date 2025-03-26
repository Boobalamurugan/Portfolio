document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const closeChat = document.getElementById('closeChat');
    const navChatButton = document.querySelector('.nav-chat-button');

    let isProcessing = false;

    // Predefined questions and responses
    const predefinedQuestions = {
        'background': 'Tell me about your background and experience',
        'skills': 'What are your main technical skills?',
        'projects': 'Can you tell me about your most interesting project?',
        'contact': 'How can I get in touch with you for collaboration?'
    };

    // Toggle chat window
    function toggleChat() {
        chatContainer.classList.toggle('active');
        if (chatContainer.classList.contains('active')) {
            chatInput.focus();
            // Reset position when opening
            chatContainer.style.transform = 'translate3d(0px, 0px, 0px)';
            xOffset = 0;
            yOffset = 0;
        }
    }

    navChatButton.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', toggleChat);

    // Handle sending messages
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isProcessing) return;

        try {
            isProcessing = true;
            
            // Disable input and show loading state
            chatInput.disabled = true;
            sendButton.disabled = true;
            sendButton.style.opacity = '0.7';
            
            // Add user message to chat
            addMessage(message, 'user');
            chatInput.value = '';

            // Add loading message with typing animation
            const loadingMessage = addMessage('Thinking...', 'bot loading');
            
            // Send message to backend
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove loading message and add response
            loadingMessage.remove();
            addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            // Re-enable input and restore button state
            isProcessing = false;
            chatInput.disabled = false;
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
            chatInput.focus();
        }
    }

    // Add message to chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timestamp);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Event listeners for sending messages
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Handle chat container drag
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    chatContainer.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.closest('.chat-header') && !e.target.closest('.close-chat')) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, chatContainer);
        }
    }

    function dragEnd() {
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0px)`;
    }

    // Add quick reply buttons for predefined questions
    function addQuickReplyButtons() {
        const quickReplies = document.createElement('div');
        quickReplies.className = 'quick-replies';
        
        Object.entries(predefinedQuestions).forEach(([key, question]) => {
            const button = document.createElement('button');
            button.className = 'quick-reply-button';
            button.textContent = question;
            button.addEventListener('click', () => {
                chatInput.value = question;
                sendMessage();
            });
            quickReplies.appendChild(button);
        });

        chatMessages.appendChild(quickReplies);
    }

    // Add quick reply buttons after initial message
    setTimeout(addQuickReplyButtons, 1000);
}); 