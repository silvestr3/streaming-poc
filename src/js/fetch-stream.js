import { API_URL, GROQ_API_KEY } from "./config.js";

export const openChatStream = async (messages) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      model: "llama-3.3-70b-versatile",
      stream: true,
    }),
  });
  return response.body;
};
