import axios from "axios"; 
// axios → API call karne ke liye use hota hai

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
// ye OpenRouter ka endpoint hai jaha request jayegi

// 🔥 main function
export const askAi = async (messages) => {
  try {
console.log("🔑 API KEY:", process.env.OPENROUTER_API_KEY);
    // ❗ check karo messages array empty ya undefined toh nahi hai
    if (!messages || messages.length === 0) {
      throw new Error("msg array is empty"); 
      // agar empty hai toh error throw kar do
    }

    // 🔥 API call kar rahe hai OpenRouter ko
    const response = await axios.post(
      OPENROUTER_API,
      {
        model: "openai/gpt-4o-mini", 
        // kaunsa AI model use karna hai

        messages: messages, 
        // jo user/system messages hai woh bhej rahe hai
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 
          // API key env se le rahe hai (secure way)

          "Content-Type": "application/json", 
          // data JSON format me bhejna hai
        },
      }
    );

    // 🔥 response se AI ka reply nikaal rahe hai (safe way me)
    const aiMessage = response?.data?.choices?.[0]?.message?.content;

    // ❗ check: agar message null/undefined/empty/space ho
    if (!aiMessage || aiMessage.trim() === "") {
      throw new Error("Invalid AI response: Empty or missing message");
      // agar valid reply nahi mila toh error throw
    }

    // ✅ final valid AI response return
    return aiMessage;

  } catch (error) {

    // ❗ error ko console me print kar rahe hai debugging ke liye
    console.error("OpenRouter Error:", error.response?.data || error.message);

    // ❗ generic error throw kar rahe hai frontend ya controller ke liye
    throw new Error("AI response failed");
  }
};











// Yeh file sirf AI se baat karti hai

// 🔥 Actual kaam:
// Messages receive karta hai
// controller se (system + user)
// OpenRouter API call karta hai
// model: gpt-4o-mini
// AI ka response nikaalta hai
// choices[0].message.content
// Validation karta hai
// empty ya invalid hua → error
// Final text return karta hai