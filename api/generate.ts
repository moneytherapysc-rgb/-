import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    // 🔒 PRO 체크 (원한다면 여기 조건 추가)
    // if (!req.headers.get("x-user-pro")) {
    //   return res.status(403).json({ error: "PRO 전용 기능입니다." });
    // }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);

    return res.status(200).json({
      output: result.response.text()
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
