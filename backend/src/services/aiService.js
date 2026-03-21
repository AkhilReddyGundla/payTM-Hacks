const API_KEY = process.env.PAYTM_API_KEY || process.env.OPENAI_API_KEY;
const BASE_URL = "https://api.inference.paytm.com/v1";

async function callPaytmAI(messages, temperature = 0.7) {
  if (!API_KEY) {
    throw new Error("Missing AI API Key");
  }

  const payload = {
      model: "openai/gpt-oss-20b",
      messages: messages,
      temperature: temperature,
      max_tokens: 1024,
      top_p: 0.95,
      top_k: 50,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      stream: false // Changed to false to get full JSON response easily
  };

  const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
  };

  const response = await fetch(`${BASE_URL}/ai/playground`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Paytm API Error:", errorText);
    throw new Error(`Paytm API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}

/**
 * Parses natural language transaction text into structured data.
 */
const parseTransactionText = async (text) => {
  const prompt = `
You are an AI assistant helping a small merchant record transactions from natural language.
Extract the following information from this text: "${text}"

Return a JSON object ONLY with strictly these keys:
- customerName (string, optional, null if not found)
- customerPhone (string, generate a fake 10-digit number like "9999999999" if not found so we have an ID)
- itemText (string, what was bought)
- amount (number, extract the price/amount, guess a reasonable number if not found based on items, default 0)
- status (string, strictly "PAID" or "PENDING". If it says "will pay tomorrow" or "credit", it's PENDING. Ask is not payment.)
- dueDate (ISO 8601 string, if it mentions tomorrow or next week, calculate the date. Otherwise string null)

Example Output:
{
  "customerName": "Ravi",
  "customerPhone": "9876543210",
  "itemText": "5 chai",
  "amount": 50,
  "status": "PENDING",
  "dueDate": "2023-11-20T00:00:00.000Z"
}
`;

  try {
    const messages = [
      { role: 'system', content: 'You parse transaction text to strictly formatted JSON. Do not return any extra text, only a valid JSON.' }, 
      { role: 'user', content: prompt }
    ];
    let content = await callPaytmAI(messages, 0.2);
    
    // Clean up markdown formatting if the AI wraps it in codeblocks
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Parsing Error:', error);
    // Fallback if no API key or API fails
    return {
      customerName: 'Unknown',
      customerPhone: '9999999999',
      itemText: text,
      amount: 0,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    };
  }
};

/**
 * Generates a reminder message for a customer.
 */
const generateReminderMessage = async (customerName, amount, itemName, dueDate) => {
  const prompt = `Write a polite SMS reminder for a customer named ${customerName || 'Friend'} regarding an unpaid amount of ₹${amount} for ${itemName}. dueDate was ${dueDate ? new Date(dueDate).toDateString() : 'recently'}. Keep it under 160 characters.`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    return await callPaytmAI(messages, 0.7);
  } catch (error) {
    return `Friendly reminder: You have a pending amount of ₹${amount} for ${itemName}. Please pay soon!`;
  }
};

/**
 * Generates an offer message for regular/inactive customers.
 */
const generateOfferMessage = async (customerName, isInactive, favoriteItem) => {
  const prompt = isInactive 
    ? `Write a short, engaging SMS offer to win back an inactive customer named ${customerName || 'friend'} who likes buying ${favoriteItem || 'our products'}. Offer a 10% discount. Under 160 characters.`
    : `Write a short, engaging VIP SMS offer to a loyal customer named ${customerName || 'friend'} who often buys ${favoriteItem || 'our products'}. Offer a free extra item. Under 160 characters.`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    return await callPaytmAI(messages, 0.7);
  } catch (error) {
    return `Hi ${customerName || 'friend'}! We have a special offer for you on ${favoriteItem || 'your next purchase'}!`;
  }
};

/**
 * Generates a Daily AI Store Digest
 */
const generateStoreDigest = async (salesData) => {
  const prompt = `
You are an expert AI business analyst for a small offline retail store.
Analyze the following list of items sold today: ${salesData}

Identify:
1. The "Hero Product" (the item that seems most popular or profitable).
2. The "Zero Product" (an item that was rarely mentioned or logically implies low demand, or just a known slow-mover mentioned).
3. One short, actionable tip (1-2 sentences) to improve profits tomorrow based on this data.

Return strictly as JSON with exactly these keys:
{
  "heroProduct": "...",
  "zeroProduct": "...",
  "improvementTip": "..."
}
`;

  try {
    const messages = [
      { role: 'system', content: 'You are a data-driven retail analyst. Only return valid JSON.' }, 
      { role: 'user', content: prompt }
    ];
    let content = await callPaytmAI(messages);
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Digest error:', error);
    // Fallback Mock for Demo
    return {
      heroProduct: "Chai (High Volume)",
      zeroProduct: "Premium Coffee (Low Sales)",
      improvementTip: "Bundle Chai with snacks during your 4 PM peak hour to increase your average order value!"
    };
  }
};

module.exports = {
  parseTransactionText,
  generateReminderMessage,
  generateOfferMessage,
  generateStoreDigest
};
