import OpenAI from "openai";

function cleanJson(text = "") {
  const trimmed = String(text).trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const first = withoutFence.indexOf("{");
  const last = withoutFence.lastIndexOf("}");
  return first >= 0 && last > first ? withoutFence.slice(first, last + 1) : withoutFence;
}

function normalize(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function rewriteArticleV13({ article, language }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing.");
  const hindi = String(language || "").toUpperCase() === "HINDI";
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const sourceMaterial = {
    headline: article.headline,
    deck: article.deck,
    body: article.body,
    fact_box: article.fact_box,
    exam_connection: article.exam_connection,
    source_name: article.source_name,
    source_url: article.source_url,
    section: article.section,
  };

  const instructions = hindi
    ? `आप THE ASPIRE NATION के वरिष्ठ हिंदी समाचार संपादक हैं। उपलब्ध सामग्री को प्राकृतिक, आसान और स्थानीय अखबारी हिंदी में दोबारा लिखें। भाषा गंभीर हो लेकिन सरकारी विज्ञप्ति जैसी या कठिन शुद्ध हिंदी न हो। शुरुआत तारीख, PIB, मंत्रालय की विज्ञप्ति या “जानकारी दी गई” से न करें। पहले पाठक को साफ बताएं कि खबर क्या है और इसका असर क्यों महत्वपूर्ण है। अंग्रेजी के प्रचलित exam/policy terms को जरूरत पर सरल हिंदी के साथ रखें। कोई नया तथ्य, आंकड़ा, नाम, उद्धरण, तारीख या कानूनी दावा न जोड़ें।`
    : `You are a senior news editor at THE ASPIRE NATION. Rewrite the supplied material as engaging, restrained, professional newspaper copy for serious Indian competitive-exam aspirants. Do not begin with a date, PIB, a ministry release, “according to”, or bureaucratic attribution. Lead with the development and why it matters; move attribution naturally into a later paragraph. Do not invent any fact, statistic, quote, date, name, legal claim, or consequence.`;

  const prompt = `${instructions}

MANDATORY EDITORIAL STRUCTURE:
1. Headline: accurate, active, specific and interesting; never sensational.
2. Deck: one sentence explaining significance.
3. Body: 6–9 connected newspaper paragraphs. Paragraph 1 says what happened. Paragraph 2 explains why it matters. Then give verified detail, background, likely impact and what to watch next. Do not use headings inside body. Do not repeat the same fact.
4. Exam facts: 5–8 one-line, verifiable facts directly related to the topic. Each line must stand alone and begin with "- ". Never infer unsupported static facts.
5. Exam connection: 3 concise lines: Prelims, Mains and Watch Next. Use only supported themes; do not invent previous-year questions.
6. visual_prompt: a factual editorial visual brief with no unsupported details.

Return ONLY one valid JSON object with exactly these string keys:
headline, deck, body, fact_box, exam_connection, visual_prompt

SOURCE MATERIAL (the only factual basis):
${JSON.stringify(sourceMaterial, null, 2)}`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
    input: prompt,
  });

  const parsed = JSON.parse(cleanJson(response.output_text || ""));
  return {
    headline: normalize(parsed.headline, article.headline),
    deck: normalize(parsed.deck, article.deck),
    body: normalize(parsed.body, article.body),
    fact_box: normalize(parsed.fact_box, article.fact_box),
    exam_connection: normalize(parsed.exam_connection, article.exam_connection),
    visual_prompt: normalize(parsed.visual_prompt, article.visual_prompt),
  };
}
