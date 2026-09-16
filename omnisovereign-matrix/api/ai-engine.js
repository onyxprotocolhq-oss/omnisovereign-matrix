// ==========================================
// OMNISOVEREIGN MATRIX - BACKEND MULTI-AI ENGINE
// ==========================================

export default async function handler(req, res) {
    // Only allow POST requests for secure AI generation
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { prompt, language } = req.body;

    // =========================================================================
    // 🔑 API KEYS CONFIGURATION (Connected securely to Vercel Environment Variables)
    // =========================================================================
    const GROQ_API_KEY = process.env.GROQ_API_KEY; // <-- Vercel automatically injects this here
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // <-- Vercel automatically injects this here

    let aiResponse = null;
    let successfulModel = '';

    // --- FALLBACK LAYER 1: GROQ API (Ultra-Fast Llama 3 Model) ---
    if (GROQ_API_KEY && !aiResponse) {
        try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [
                        { 
                            role: "system", 
                            content: `You are Sri OmniSovereign, the Supreme AI Spiritual Guru. Speak deeply and wisdom-driven in language code: ${language}. Provide profound karmic psychological counseling and a 21-day transformation roadmap.` 
                        },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (groqRes.ok) {
                const data = await groqRes.json();
                aiResponse = data.choices[0].message.content;
                successfulModel = 'Groq-Llama3-Core';
            }
        } catch (err) {
            console.warn('Groq fallback triggered next tier...');
        }
    }

    // --- FALLBACK LAYER 2: GOOGLE GEMINI API (Deep Contextual Engine) ---
    if (GEMINI_API_KEY && !aiResponse) {
        try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Act as Supreme AI Guru OmniSovereign in language ${language}. Give spiritual guidance and 21-day roadmap for: ${prompt}` }] }]
                })
            });

            if (geminiRes.ok) {
                const data = await geminiRes.json();
                aiResponse = data.candidates[0].content.parts[0].text;
                successfulModel = 'Google-Gemini-Fallback';
            }
        } catch (err) {
            console.warn('Gemini fallback triggered local core...');
        }
    }

    // --- ULTIMATE LOCAL FALLBACK (Zero Error Protection) ---
    if (!aiResponse) {
        aiResponse = "Namaste seeker. The cosmic network is realigning. Your soul's frequency is safely anchored. Breathe deep, meditate on the 8 sovereign tools, and your 21-day matrix will unfold.";
        successfulModel = 'OmniSovereign-Sovereign-Local';
    }

    // Return final processed data back to frontend
    return res.status(200).json({
        success: true,
        model: successfulModel,
        guidance: aiResponse,
        language: language,
        timestamp: new Date().toISOString()
    });
}