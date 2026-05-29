import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SIMULATED_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-placeholder";

export async function chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
  if (SIMULATED_MODE) {
    return simulateResponse(messages);
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content ?? "";
}

function simulateResponse(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): string {
  const lastMsg = messages[messages.length - 1]?.content;
  if (typeof lastMsg !== "string") return "[Simulated: no input]";
  
  if (lastMsg.includes("humanize")) {
    return "The integration of artificial intelligence in education shows real promise for improving how students learn through personalized instruction and responsive feedback systems.";
  }
  if (lastMsg.includes("enhance") || lastMsg.includes("academic")) {
    return "The implementation of artificial intelligence within educational contexts demonstrates considerable potential for the enhancement of student learning outcomes through the utilisation of personalised instructional methodologies and adaptive feedback mechanisms.";
  }
  if (lastMsg.includes("plagiarism")) {
    return JSON.stringify({ score: 12, flagged: [] });
  }
  return lastMsg;
}
