export default async function handler(req, res) {
    // 1. Security Check: Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { prompt, mode, language = 'en' } = req.body;

    // 2. Securely fetch API Keys from Vercel Environment Variables
    const keys = {
        groq: process.env.GROQ_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
        cohere: process.env.COHERE_API_KEY,
        huggingface: process.env.HUGGINGFACE_API_KEY
    };

    // 3. The God-Level "Brain-Hacking" System Prompt
    const systemPrompt = `You are OmniSovereign Neural Matrix, a world-class Harvard-trained copywriter, elite prompt engineer, and SEO mastermind. You have a multi-million dollar marketing brain.
    
    Current Task Mode: ${mode}
    Target Language: ${language}
    
    STRICT DIRECTIVES BASED ON MODE:
    - If Mode is "Viral Script & Sales Copy": Use neuro-marketing and psychological triggers (FOMO, urgency, authority). Apply frameworks like PAS (Problem-Agitate-Solve) or AIDA. Write hypnotic, high-retention hooks that force viewers/readers to consume the entire content and convert instantly.
    - If Mode is "God-Mode Prompt Generator": Reverse-engineer the user's request. Create a massive, highly detailed, master-level prompt for ChatGPT/Claude. Include context, strict constraints, tone definitions, and precise output formatting.
    - If Mode is "Programmatic SEO Blog": Write a highly engaging, fully SEO-optimized article. Use strategic H1/H2/H3 tags, bullet points, LSI keywords woven naturally, and a powerful conclusion. Ensure maximum readability and authority.
    
    CRITICAL RULE: Output ONLY the final generated masterpiece in the requested language (${language}). Do NOT include conversational filler, meta-text, or phrases like "Here is your script." Start immediately with the God-level output.`;

    // 4. The 5-Node Unbreakable Fallback Matrix
    const aiNodes = [
        // NODE 1: GROQ (Fastest - Priority 1)
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
            if (!response.ok) throw new Error("Groq Network Error");
            const data = await response.json();
            return data.choices[0].message.content;
        },
        // NODE 2: GEMINI (Google Power - Priority 2)
        async () => {
            if (!keys.gemini) throw new Error("Gemini key missing");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }]
                })
            });
            if (!response.ok) throw new Error("Gemini Network Error");
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        },
        // NODE 3: OPENROUTER (Dynamic Routing - Priority 3)
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
            if (!response.ok) throw new Error("OpenRouter Network Error");
            const data = await response.json();
            return data.choices[0].message.content;
        },
        // NODE 4: COHERE (Enterprise NLP - Priority 4)
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
            if (!response.ok) throw new Error("Cohere Network Error");
            const data = await response.json();
            return data.generations[0].text;
        },
        // NODE 5: HUGGING FACE (Final Safety Net - Priority 5)
        async () => {
            if (!keys.huggingface) throw new Error("Hugging Face key missing");
            const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${keys.huggingface}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nMasterpiece:` })
            });
            if (!response.ok) throw new Error("Hugging Face Network Error");
            const data = await response.json();
            return data[0].generated_text.replace(`${systemPrompt}\n\nUser: ${prompt}\n\nMasterpiece:`, '');
        }
    ];

    // 5. The Unbreakable Execution Engine (Set & Forget Logic)
    let finalResult = null;
    let fallbackLog = [];

    for (const node of aiNodes) {
        try {
            finalResult = await node();
            if (finalResult) {
                break; // Instantly breaks the loop the millisecond a valid response is received
            }
        } catch (error) {
            fallbackLog.push(error.message); // Silently logs the error and moves to the next AI engine seamlessly
        }
    }

    // 6. Deliver Output to Frontend
    if (finalResult) {
        return res.status(200).json({ success: true, data: finalResult });
    } else {
        // Only triggers if literally every API is down or keys are completely missing from Vercel
        return res.status(200).json({ 
            success: false, 
            data: "System Alert: All 5 Neural Nodes Failed. Please ensure API Keys are securely added in Vercel Environment Variables. Fallback Trace: " + fallbackLog.join(" | ") 
        });
    }
}