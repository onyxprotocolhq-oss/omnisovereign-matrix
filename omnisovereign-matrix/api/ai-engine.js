export default async function handler(req, res) {
    // 1. केवल POST रिक्वेस्ट को अनुमति दें (सिक्योरिटी के लिए)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { prompt, language = 'en' } = req.body;

    // 2. Vercel Environment Variables से तुम्हारी 5 API Keys उठाना
    const keys = {
        groq: process.env.GROQ_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
        cohere: process.env.COHERE_API_KEY,
        huggingface: process.env.HUGGINGFACE_API_KEY
    };

    const systemPrompt = `You are OmniSovereign Neural Matrix, a god-level AI audio and script assistant. Provide highly professional, accurate, and premium results in the requested language: ${language}.`;

    // 3. The 5-Node Fallback Engine (एक फेल होगा तो दूसरा ऑटोमैटिक चलेगा)
    const aiNodes = [
        // Node 1: GROQ (Fastest - Llama 3)
        async () => {
            if (!keys.groq) throw new Error("Groq key missing");
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            if (!data.choices) throw new Error("Groq Failed");
            return { text: data.choices[0].message.content, engine: "Groq (Node 1)" };
        },

        // Node 2: GEMINI (Google's Powerhouse)
        async () => {
            if (!keys.gemini) throw new Error("Gemini key missing");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }]
                })
            });
            const data = await response.json();
            if (!data.candidates) throw new Error("Gemini Failed");
            return { text: data.candidates[0].content.parts[0].text, engine: "Gemini (Node 2)" };
        },

        // Node 3: OPENROUTER (Dynamic Router)
        async () => {
            if (!keys.openrouter) throw new Error("OpenRouter key missing");
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "mistralai/mixtral-8x7b-instruct",
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            if (!data.choices) throw new Error("OpenRouter Failed");
            return { text: data.choices[0].message.content, engine: "OpenRouter (Node 3)" };
        },

        // Node 4: COHERE (Enterprise NLP)
        async () => {
            if (!keys.cohere) throw new Error("Cohere key missing");
            const response = await fetch('https://api.cohere.ai/v1/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.cohere}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "command",
                    prompt: `${systemPrompt}\n\nUser Request: ${prompt}\n\nResponse:`,
                    max_tokens: 500
                })
            });
            const data = await response.json();
            if (!data.generations) throw new Error("Cohere Failed");
            return { text: data.generations[0].text, engine: "Cohere (Node 4)" };
        },

        // Node 5: HUGGING FACE (Open Source Fallback)
        async () => {
            if (!keys.huggingface) throw new Error("Hugging Face key missing");
            const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.huggingface}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nMatrix:` })
            });
            const data = await response.json();
            if (data.error) throw new Error("Hugging Face Failed");
            return { text: data[0].generated_text.replace(`${systemPrompt}\n\nUser: ${prompt}\n\nMatrix:`, ''), engine: "Hugging Face (Node 5)" };
        }
    ];

    // 4. The Bulletproof Execution Loop (बिना रुके काम करेगा)
    let finalResult = null;
    let fallbackLog = [];

    for (const node of aiNodes) {
        try {
            finalResult = await node();
            if (finalResult && finalResult.text) {
                break; // जैसे ही कोई इंजन सही जवाब देगा, लूप वहीं रुक जाएगा और जवाब दे देगा!
            }
        } catch (error) {
            fallbackLog.push(error.message);
            continue; // अगर फेल हुआ, तो बिना क्रैश हुए अगले इंजन पर चला जाएगा
        }
    }

    // 5. फ्रंटएंड को फाइनल रिस्पांस भेजना
    if (finalResult) {
        return res.status(200).json({ 
            success: true, 
            data: finalResult.text, 
            activeEngine: finalResult.engine 
        });
    } else {
        // अगर चमत्कारिक रूप से पांचों फेल हो जाएं (जो कि असंभव है)
        return res.status(500).json({ 
            success: false, 
            error: "All 5 Neural Nodes Failed. Vercel Matrix Overloaded.",
            log: fallbackLog
        });
    }
}