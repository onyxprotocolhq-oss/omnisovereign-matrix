export default async function handler(req, res) {
    // 1. CORS & Method Security (केवल सुरक्षित POST रिक्वेस्ट अलाउ करें)
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    const { prompt, mode, language = 'en' } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    // 2. Load API Keys from Vercel Environment Variables
    const keys = {
        groq: process.env.GROQ_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
        cohere: process.env.COHERE_API_KEY,
        huggingface: process.env.HUGGINGFACE_API_KEY
    };

    // 3. Dynamic System Prompts (The "God-Level" Logic)
    let systemInstruction = "";
    
    if (mode === "Sales Copy & Script") {
        systemInstruction = `You are a legendary neuro-marketing copywriter and YouTube scriptwriter. Your goal is to write high-converting, psychologically engaging, and viral content. Use hooks, emotional triggers, and strong CTAs. You MUST generate the entire output strictly in this language code: ${language}.`;
    } else if (mode === "God-Mode Prompt") {
        systemInstruction = `You are a Master Prompt Engineer. The user will give you a basic idea. Your job is to reverse-engineer it and create an incredibly detailed, "God-Mode" prompt that the user can copy-paste into ChatGPT or Claude. Include context, role, constraints, formatting, and tone. You MUST write the explanation and the prompt strictly in this language code: ${language}.`;
    } else if (mode === "SEO Blog") {
        systemInstruction = `You are an elite Programmatic SEO Expert. Write a comprehensive, highly-ranked SEO blog post based on the user's input. Include a catchy H1, multiple H2s, bullet points, keyword-rich paragraphs, and a compelling conclusion. You MUST write the entire blog strictly in this language code: ${language}.`;
    } else {
        systemInstruction = `You are OmniSovereign Neural Matrix, a highly advanced AI. Provide professional, accurate, and premium results. Output language strictly: ${language}.`;
    }

    // 4. The 5-Node Redundant Architecture (Zero-Downtime Loop)
    const aiNodes = [
        // Node 1: GROQ (Llama-3 - Lightning Fast)
        async () => {
            if (!keys.groq) throw new Error("Groq key missing");
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });
            const data = await response.json();
            if (!data.choices || !data.choices[0]) throw new Error("Groq API Failed");
            return data.choices[0].message.content;
        },

        // Node 2: GEMINI (Google's Powerhouse - High Context)
        async () => {
            if (!keys.gemini) throw new Error("Gemini key missing");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: `${systemInstruction}\n\nUser Request: ${prompt}` }] }
                    ]
                })
            });
            const data = await response.json();
            if (!data.candidates || !data.candidates[0]) throw new Error("Gemini API Failed");
            return data.candidates[0].content.parts[0].text;
        },

        // Node 3: OPENROUTER (Dynamic Mistral/Claude Routing)
        async () => {
            if (!keys.openrouter) throw new Error("OpenRouter key missing");
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "mistralai/mixtral-8x7b-instruct",
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const data = await response.json();
            if (!data.choices || !data.choices[0]) throw new Error("OpenRouter API Failed");
            return data.choices[0].message.content;
        },

        // Node 4: COHERE (Enterprise NLP & Structuring)
        async () => {
            if (!keys.cohere) throw new Error("Cohere key missing");
            const response = await fetch('https://api.cohere.com/v1/chat', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${keys.cohere}`, 
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    model: "command",
                    message: prompt,
                    preamble: systemInstruction
                })
            });
            const data = await response.json();
            if (!data.text) throw new Error("Cohere API Failed");
            return data.text;
        },

        // Node 5: HUGGING FACE (Open Source Ultimate Fallback)
        async () => {
            if (!keys.huggingface) throw new Error("Hugging Face key missing");
            const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.huggingface}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    inputs: `<s>[INST] ${systemInstruction} \n\n User Request: ${prompt} [/INST]`,
                    parameters: { max_new_tokens: 1000 }
                })
            });
            const data = await response.json();
            if (data.error || !data[0]) throw new Error("Hugging Face API Failed");
            return data[0].generated_text.split('[/INST]')[1].trim(); // Extract only the generated response
        }
    ];

    // 5. The Bulletproof Execution Matrix
    let finalResult = null;
    let fallbackLogs = [];

    // Loop through the AI nodes sequentially until one succeeds
    for (let i = 0; i < aiNodes.length; i++) {
        try {
            const resultText = await aiNodes[i]();
            if (resultText && resultText.trim().length > 0) {
                finalResult = resultText;
                break; // 🚀 Success! Exit the fallback loop.
            }
        } catch (error) {
            fallbackLogs.push(`Node ${i + 1} Failed: ${error.message}`);
            continue; // 🛡️ Seamlessly fallback to the next AI engine
        }
    }

    // 6. Return the Matrix Output to the Frontend
    if (finalResult) {
        return res.status(200).json({ 
            success: true, 
            data: finalResult
        });
    } else {
        // This block only executes if ALL 5 God-Level AIs go down simultaneously (virtually impossible)
        return res.status(500).json({ 
            success: false, 
            error: "All 5 Neural Nodes Failed. Please check API Keys in Vercel.",
            logs: fallbackLogs
        });
    }
}