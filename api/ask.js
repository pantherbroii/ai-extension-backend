export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const { text } = req.body;

    const prompt = `
You are an answer extractor.

Rules:
- Give ONLY the final answers.
- NO explanations.
- If there are multiple questions, answer ALL of them.
- Keep the same order as the questions.
- For MCQs, output only the correct option text.
- For checkbox questions, list all correct answers separated by commas.

Text:

${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      answer: answer || "No answer generated."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
