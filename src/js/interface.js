import { openChatStream } from "./fetch-stream.js";

const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const threadContainer = document.querySelector("#container #thread");

const createUserMessageElement = (message) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("user-message");
  messageElement.textContent = message;
  threadContainer.appendChild(messageElement);
};

const createAssistantMessageElement = () => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("assistant-message");
  threadContainer.appendChild(messageElement);
};

const getCurrentAssistantMessage = () => {
  const lastMessage = threadContainer.querySelector(
    ".assistant-message:last-child",
  );

  return lastMessage;
};

async function* parseStream(messages) {
  const stream = await openChatStream(messages);

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        const parsedData = JSON.parse(data);
        yield parsedData.choices[0].delta.content ?? "";
      }
    }
  }
}

let streamedMessage = "";
let messages = [];

const handleSendMessage = async () => {
  const message = messageInput.value;
  if (message) {
    messageInput.value = "";
    messages.push({
      role: "user",
      content: message,
    });

    createUserMessageElement(message);
    createAssistantMessageElement();

    const messageChunks = parseStream(messages);
    const lastAssistantMessage = getCurrentAssistantMessage();

    for await (const chunk of messageChunks) {
      streamedMessage += chunk;
      lastAssistantMessage.textContent = streamedMessage;
      threadContainer.scrollTop = threadContainer.scrollHeight;
    }

    streamedMessage = "";
    messages.push({
      role: "assistant",
      content: lastAssistantMessage.textContent,
    });
  }
};

sendButton.addEventListener("click", handleSendMessage);
