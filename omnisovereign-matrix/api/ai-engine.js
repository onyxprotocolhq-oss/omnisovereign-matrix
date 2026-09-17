export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { prompt, mode, language = 'en' } = req.body;

    // Vercel Environment Variables से सुरक्षित तरीके से कीज़ उठाना
    const keys = {
        groq: process.env.GROQ_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
        cohere: process.env.COHERE_API_KEY,
        huggingface: process.env.HUGGINGFACE_API_KEY
    };

    const systemPrompt = `You are OmniSovereign Neural Matrix, a world-class Harvard-level copywriter, prompt engineer, and marketing genius.
    Task Mode Selected: ${mode}
    Language Requested: ${language}
    
    Instructions: 
    - If Mode is 'Viral Script & Sales Copy', write a high-converting, psychologically triggering script/copy.
    - If Mode is 'God-Mode Prompt Generator', write an advanced, highly detailed ChatGPT/Claude prompt for the user's topic.
    - If Mode is 'Programmatic SEO Blog', write a fully SEO-optimized, engaging blog post with headings and bullet points.
    - Output ONLY the final masterpiece. No extra conversational fluff.`;

    const aiNodes = [
        // Node 1: GROQ
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
            if (!data.choices) throw new Error("Groq API Failed");
            return data.choices[0].message.content;
        },
        // Node 2: GEMINI
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
            if (!data.candidates) throw new Error("Gemini API Failed");
            return data.candidates[0].content.parts[0].text;
        },
        // Node 3: OPENROUTER
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
            if (!data.choices) throw new Data(); // safe fallback
            return data.choices[0].message.content;
        },
        // Node 4: COHERE
        async () => {
            if (!keys.cohere) throw new Error("Cohere key missing");
            const response = await fetch('https://api.cohere.ai/v1/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.cohere}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "command",
                    prompt: `${systemPrompt}\n\nUser Request: ${prompt}\n\nMasterpiece:`,
                    max_tokens: 1500
                })
            });
            const data = await response.json();
            if (!data.generations) throw new Error("Cohere API Failed");
            return data.generations[0].text;
        },
        // Node 5: HUGGING FACE
        async () => {
            if (!keys.huggingface) throw new Error("Hugging Face key missing");
            const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.huggingface}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nMasterpiece:` })
            });
            const data = await response.json();
            if (data.error) throw new Error("Hugging Face API Failed");
            return data[0].generated_text.replace(`${systemPrompt}\n\nUser: ${prompt}\n\nMasterpiece:`, '');
        }
    ];

    let finalResult = null;
    let fallbackLog = [];

    for (const node of aiNodes) {
        try {
            finalResult = await node();
            if (finalResult) break;
        } catch (error) {
            fallbackLog.push(error.message);
        }
    }

    if (finalResult) {
        return res.status(200).json({ success: true, data: finalResult });
    } else {
        return res.status(200).json({ 
            success: false, 
            data: "Error: Matrix Failed. Please check Vercel Environment Variables. Logs: " + fallbackLog.join(", ") 
        });
    }
}