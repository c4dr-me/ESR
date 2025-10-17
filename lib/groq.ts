export async function getGroqSummary(
  report: any,
  apiKey: string
): Promise<string> {
  const prompt = `
You are an email deliverability expert.
Summarize the following test report for a non-technical user in clear, simple language.
The report shows the results of sending a test email to several addresses, indicating where the email landed (Inbox, Spam, Promotions, etc).
Avoid using markdown formatting, asterisk.
Present the information as short sentences or a concise paragraph.
Highlight:
- The sender email address
- Which test addresses/providers were used
- For each, where the email landed (Inbox, Spam, Promotions, etc)
- The score and any important timing or status notes.
Conclude with a brief statement about the overall deliverability and inference based on these results.
Here is the report data:
${JSON.stringify(report, null, 2)}
`;
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: `Report Data:\n${JSON.stringify(report, null, 2)}`,
            },
          ],
          temperature: 1,
          top_p: 1,
          stream: false,
          max_tokens: 256,
        }),
      }
    );
    const data = await response.json();
    if (data.error) {
      return `Groq error: ${data.error.message || "Unknown error"}`;
    }
    return (
      data.choices?.[0]?.message?.content ?? "Summary could not be generated."
    );
  } catch {
    return "Summary could not be generated.";
  }
}
