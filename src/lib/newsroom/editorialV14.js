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

function editorRole(section = "", hindi = false) {
  const value = String(section || "").toLowerCase();
  if (/econom|bank|agric|infra|वित्त|अर्थ|बैंक|कृषि/.test(value)) return hindi ? "वरिष्ठ बिजनेस और अर्थव्यवस्था संपादक" : "senior business and economy editor";
  if (/science|tech|space|isro|विज्ञान|टेक|अंतरिक्ष/.test(value)) return hindi ? "वरिष्ठ विज्ञान और टेक्नोलॉजी संपादक" : "senior science and technology editor";
  if (/environment|climate|defence|disaster|पर्यावरण|रक्षा|आपदा/.test(value)) return hindi ? "वरिष्ठ पर्यावरण, रक्षा और आपदा संपादक" : "senior environment, defence and disaster editor";
  if (/international|world|foreign|अंतरराष्ट्रीय|दुनिया|विदेश/.test(value)) return hindi ? "वरिष्ठ अंतरराष्ट्रीय मामलों के संपादक" : "senior foreign affairs editor";
  if (/polity|judiciary|parliament|governance|संविधान|अदालत|संसद|शासन/.test(value)) return hindi ? "वरिष्ठ राजनीति और शासन संपादक" : "senior political and governance editor";
  return hindi ? "राष्ट्रीय अखबार के वरिष्ठ समाचार संपादक" : "senior national news editor";
}

export async function rewriteArticleV14({ article, language }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing.");
  const hindi = String(language || "").toUpperCase() === "HINDI";
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const role = editorRole(article.section, hindi);

  const sourceMaterial = {
    headline: article.headline,
    deck: article.deck,
    body: article.body,
    fact_box: article.fact_box,
    exam_connection: article.exam_connection,
    caption: article.caption,
    source_name: article.source_name,
    source_url: article.source_url,
    section: article.section,
  };

  const instructions = hindi
    ? `आप THE ASPIRE NATION के ${role} हैं। आप किसी सरकारी विज्ञप्ति का अनुवाद या सारांश नहीं लिख रहे हैं। उपलब्ध तथ्यों के आधार पर नई, स्वाभाविक और पढ़ने में रुचिकर अखबारी कहानी लिखें। भाषा रोजमर्रा की, साफ और गंभीर हो; कठिन शुद्ध हिंदी, सरकारी नोटिस जैसी भाषा और मशीन-जैसी पंक्तियां न हों। शुरुआत तारीख, PIB, मंत्रालय, “जानकारी दी गई”, “विज्ञप्ति में कहा गया”, “लोकसभा ने 29 जुलाई” जैसी पंक्तियों से न करें। पहली पंक्ति खबर का असर या असली महत्व बताए, फिर घटना समझाए। अंग्रेजी के प्रचलित policy/exam terms जहां साफ हों वहां रख सकते हैं। कोई नया तथ्य, आंकड़ा, नाम, उद्धरण, तारीख, कानूनी निष्कर्ष या अनुमान न जोड़ें।`
    : `You are the ${role} of THE ASPIRE NATION. You are not summarising or paraphrasing a press release. Write a fresh, engaging newspaper story from the supplied verified material. Use a confident but restrained Indian newsroom voice. Never begin with a date, PIB, a ministry, “according to”, “the Lok Sabha on…”, or bureaucratic attribution. Open with the consequence, public importance or central development, then explain what happened. Vary sentence length and paragraph rhythm. Avoid generic AI phrases, repetition and press-release language. Do not invent any fact, statistic, quote, date, name, legal claim, outcome or forecast.`;

  const prompt = `${instructions}

EDITORIAL RULEBOOK — MANDATORY:
1. Headline: active, specific, accurate and reader-focused. 8–14 words where possible. No clickbait.
2. Deck: one crisp sentence explaining why the story matters.
3. Body: 7–10 connected newspaper paragraphs, normally 450–750 words when source material supports it.
   • Paragraph 1: significance or consequence — why a reader should care.
   • Paragraph 2: what happened.
   • Paragraphs 3–5: verified detail and context.
   • Paragraphs 6–8: impact, limitations and what remains unclear.
   • Final paragraph: what to watch next, only when supported.
   • Attribution should appear naturally after the lead, not dominate the opening.
   • Do not use subheadings inside body.
   • Do not repeat the headline or deck.
4. fact_box: 5–8 short, one-line, exam-useful facts. Every line begins “- ”. Use only facts supported by the supplied material.
5. exam_connection: exactly three concise lines labelled Prelims, Mains and Watch Next (or प्रारंभिक परीक्षा, मुख्य परीक्षा, आगे क्या देखें in Hindi). Do not invent PYQs.
6. caption: one useful, factual visual caption.
7. visual_prompt: a precise editorial image/infographic brief grounded only in verified details.
8. If the source material is too thin for a long article, write a shorter honest article; never pad with invented content.

Return ONLY one valid JSON object with exactly these string keys:
headline, deck, body, fact_box, exam_connection, caption, visual_prompt

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
    caption: normalize(parsed.caption, article.caption),
    visual_prompt: normalize(parsed.visual_prompt, article.visual_prompt),
  };
}
