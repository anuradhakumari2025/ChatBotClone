const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");
const sendBtn = document.getElementById("sendBtn");

openBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
});
closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

// sendBtn.addEventListener("click", () => {
//   const input = document.getElementById("messageInput");
//   const message = input.value.trim();
//   if (message) {
//     const chatMessages = document.getElementById("chatMessages");
//     const msgDiv = document.createElement("div");
//     msgDiv.className = "message user";
//     msgDiv.textContent = message;
//     chatMessages.appendChild(msgDiv);
//     input.value = "";
//     chatMessages.scrollTop = chatMessages.scrollHeight;
//   }
// });

// Conversation history array

// Conversation history array
let conversationHistory = [];

// Send button click handler
sendBtn.addEventListener("click", sendMessage);

// Also send on Enter key
document
  .getElementById("messageInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

// Listen for AI reply only once
socket.on("ai-reply", (aiMessage) => {
  removeTypingIndicator();
  const replyTime = getCurrentTime();
  conversationHistory.push({ sender: "bot", text: aiMessage, time: replyTime });
  displayMessage("bot", aiMessage, replyTime);
});

// Send message
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  const time = getCurrentTime();

  // Add user message
  conversationHistory.push({ sender: "user", text: message, time });
  displayMessage("user", message, time);
  input.value = "";

  // Show AI typing
  showTypingIndicator();

  // Send to backend
  socket.emit("ai-message", message);
}

// Display message
function displayMessage(sender, text, time) {
  const chatMessages = document.getElementById("chatMessages");

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;

  const textSpan = document.createElement("div");
  textSpan.textContent = text;

  const timeSpan = document.createElement("div");
  timeSpan.className = "time";
  timeSpan.textContent = time;

  msgDiv.appendChild(textSpan);
  msgDiv.appendChild(timeSpan);

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing-indicator";
  typingDiv.textContent = "AI is typing...";
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingDiv = document.querySelector(".typing-indicator");
  if (typingDiv) typingDiv.remove();
}

// Time format
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
