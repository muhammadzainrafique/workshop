document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessages = document.getElementById('chatMessages');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Handle Enter key
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && userInput.value.trim()) {
      sendMessage();
    }
  });

  // Send message function
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add human message to chat
    addMessage(message, 'human');
    userInput.value = '';
    loadingIndicator.style.display = 'flex';

    try {
      // Call backend
      const response = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });

      if (!response.ok) throw new Error('AI response failed');

      const data = await response.json();
      addMessage(data.reply, 'ai');
    } catch (error) {
      addMessage("Sorry, I couldn't process your request. Please try again.", 'ai');
      console.error('Error:', error);
    } finally {
      loadingIndicator.style.display = 'none';
      scrollToBottom();
    }
  }

  // Add message to chat UI
  function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageElement.innerHTML = `
      ${text}
      <span class="message-time">${time}</span>
    `;

    chatMessages.appendChild(messageElement);
    scrollToBottom();
  }

  // Auto-scroll to latest message
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Expose to global scope for button onclick
  window.sendMessage = sendMessage;
});