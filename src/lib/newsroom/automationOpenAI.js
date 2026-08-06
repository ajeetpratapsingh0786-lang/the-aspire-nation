import OpenAI from "openai";
import { normalizeAssignments, prepareEditorialCandidates } from "./editorialIntelligence";

function client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function cleanJson(text = "") {
  const value = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const firstObject = value.indexOf("{");
  const firstArray = value.indexOf("[");
  const start =
    firstArray >= 0 && (firstObject < 0 || firstArray < firstObject)
      ? firstArray
      : firstObject;
  const end = Math.max(value.lastIndexOf("]"), value.lastIndexOf("}"));

  return start >= 0 && end > start ? value.slice(start, end + 1) : value;
}

async function jsonResponse({ prompt, model, webSearch = false }) {
  const openai = client();
  const selectedModel =
    model ||
    process.env.OPENAI_AUTOMATION_MODEL ||
    process.env.OPENAI_TEXT_MODEL ||
    "gpt-5-mini";

  const rules = `\n\nEXECUTION RULES:\n- Complete the task immediately.\n- Never ask for permission or confirmation.\n- Never ask a follow-up question.\n- Return only valid JSON.\n- Do not use markdown fences.\n- Do not add commentary before or after the JSON.\n- The first character must be [ or {.\n- The last character must be ] or }.\n- If evidence is insufficient, return fewer items rather than inventing facts.`;

  let input = `${prompt}${rules}`;
  let lastText = "";
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const request = { model: selectedModel, input };
    if (webSearch) {
      request.tools = [{ type: "web_search" }];
      request.tool_choice = "auto";
    }

    const response = await openai.responses.create(request);
    lastText = response.output_text || "";

    try {
      const cleaned = cleanJson(lastText);
      if (!cleaned) throw new Error("Empty AI response.");
      return JSON.parse(cleaned);
    } catch (error) {
      lastError = error;
      input = `${prompt}${rules}\n\nYour previous answer was invalid JSON. Repeat the task and return only valid JSON. Previous answer:\n${lastText.slice(0, 1200)}`;
    }
  }

  throw new Error(
    `AI returned invalid JSON after 3 attempts: ${lastError?.message || "unknown error"}. Output: ${lastText.slice(0, 800)}`
  );
}

const SEARCH_GROUPS = [
  "Union government, Parliament, Cabinet, ministries, public administration and welfare schemes",
  "Supreme Court, High Courts, Election Commission, constitutional bodies, law and polity",
  "RBI, SEBI, banking, markets, inflation, taxation, public finance and financial inclusion",
  "agriculture, rural development, food security, infrastructure, transport, energy and industry",
  "science, technology, digital policy, cybersecurity, space, health and biotechnology",
  "environment, climate, biodiversity, geography, disasters and conservation",
  "defence, internal security, strategic affairs and India's international relations",
  "United Nations, multilateral institutions, major world developments and India-linked global affairs",
];

function normalizeCandidate(item, newsDate) {
  return {
    headline: String(item?.headline || "").trim(),
    verified_summary: String(item?.verified_summary || "").trim(),
    why_it_matters: String(item?.why_it_matters || "").trim(),
    section: String(item?.section || "General").trim(),
    source_name: String(item?.source_name || "").trim(),
    source_url: String(item?.source_url || "").trim(),
    event_date: newsDate,
    visual_type: String(item?.visual_type || "institutional scene").trim(),
  };
}

function deduplicateCandidates(items, newsDate) {
  const unique = [];
  const seenUrls = new Set();
  const seenHeadlines = new Set();

  for (const raw of items) {
    const item = normalizeCandidate(raw, newsDate);
    if (!item.headline || !item.source_url || !item.verified_summary) continue;

    const urlKey = item.source_url.toLowerCase().replace(/[#?].*$/, "");
    const headlineKey = item.headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .slice(0, 110);

    if (seenUrls.has(urlKey) || seenHeadlines.has(headlineKey)) continue;
    seenUrls.add(urlKey);
    seenHeadlines.add(headlineKey);
    unique.push(item);
  }

  return unique;
}

async function collectGroup(newsDate, group) {
  return jsonResponse({
    webSearch: true,
    prompt: `You are the verification desk of THE ASPIRE NATION, an Indian current-affairs newspaper for competitive-exam aspirants.

Find up to 12 distinct and important developments that occurred, were officially announced, decided, released or credibly reported on ${newsDate} in India time within this desk:
${group}

SOURCE POLICY:
- Prefer primary sources: PIB, Parliament, ministries, regulators, courts, constitutional bodies, RBI, SEBI, ISRO, official government portals and official international organisations.
- When a primary source is unavailable, use a reputable established news organisation that clearly reports the development and date.
- Exclude rumours, anonymous social-media claims, opinion-only pieces and recycled old developments.
- Every item must include a working source_url and source_name.
- The development itself must belong to ${newsDate}; an older event merely republished that day must be excluded.
- Do not invent facts, quotations, figures, names or dates.
- Prioritise UPSC, SSC, Banking, Railway, Defence and State PCS relevance.

Return only a JSON array. Every object must contain exactly:
headline, verified_summary, why_it_matters, section, source_name, source_url, event_date, visual_type.
The event_date must be exactly "${newsDate}".`,
  });
}

export async function collectVerifiedCandidates(newsDate) {
  const settled = await Promise.allSettled(
    SEARCH_GROUPS.map((group) => collectGroup(newsDate, group))
  );

  const firstPass = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const value = result.value;
    return Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : [];
  });

  let unique = deduplicateCandidates(firstPass, newsDate);

  if (unique.length < 40) {
    const fallback = await jsonResponse({
      webSearch: true,
      prompt: `Find additional distinct exam-relevant developments from India and the world that occurred, were announced, decided, released or credibly reported on ${newsDate} in India time.

Search broadly across governance, economy, banking, agriculture, science, technology, environment, defence, courts, international relations, reports, indices, appointments, schemes and major policy developments.

Prefer official primary sources. Reputable established news organisations are acceptable where no primary source is directly available. Exclude rumours, opinion-only articles, recycled old events and duplicates of the supplied existing headlines.

Return up to 40 additional items. Do not invent facts. Every item must include a working source URL.

Existing headlines to avoid:
${JSON.stringify(unique.map((item) => item.headline))}

Return only a JSON array with exactly:
headline, verified_summary, why_it_matters, section, source_name, source_url, event_date, visual_type.
The event_date must be exactly "${newsDate}".`,
    });

    const extra = Array.isArray(fallback)
      ? fallback
      : Array.isArray(fallback?.items)
        ? fallback.items
        : [];
    unique = deduplicateCandidates([...unique, ...extra], newsDate);
  }

  return prepareEditorialCandidates(unique);
}

export async function assignCandidatesToPages(candidates, newsDate) {
  if (!Array.isArray(candidates) || candidates.length < 8) {
    throw new Error("At least 8 verified candidates are required for assignment.");
  }

  const prepared = prepareEditorialCandidates(candidates);
  const result = await jsonResponse({
    prompt: `You are the Editor-in-Chief of THE ASPIRE NATION. Build a balanced eight-page newspaper from the verified candidates below.

EDITORIAL OBJECTIVE:
Create a real newspaper, not coaching notes. Maximise useful information without extending articles unnecessarily. Prioritise what an aspirant must know today.

PAGE TARGETS:
Page 1 Front Page: exactly 12 units
Page 2 National and Governance: exactly 8 units
Page 3 International Affairs: exactly 7 units
Page 4 Economy, Banking, Agriculture and Infrastructure: exactly 8 units
Page 5 Polity, Judiciary, Science and Technology: exactly 8 units
Page 6 Environment, Defence and Disaster Management: exactly 7 units
Page 7 Exam Desk and Scheme of the Day: exactly 7 units
Page 8 Editorial and Analysis: exactly 6 units

EDITORIAL RULES:
- Use the supplied editorial_score and editorial_scores as guidance, but make a coherent editorial judgment.
- Page 1 must contain the strongest national-impact lead, two major stories, supporting reports and concise briefs.
- Page 7 must contain one verified government scheme as the Scheme of the Day whenever a suitable scheme is available. Prefer a Central Government scheme; use an important State Government scheme when it has stronger current and exam relevance. The scheme unit must be rank 1 and treatment_type "exam-analysis". The other Page 7 units should cover reports, indices, appointments, awards, places, organisations, science facts, environment facts or economy facts.
- Small and medium stories must be complete newspaper stories, not teasers. Only lead and major stories may justify optional deeper analysis online.
- Avoid duplicate angles. If several candidates cover the same event, keep the strongest source and combine only facts clearly supported by the supplied material.
- A major candidate may support one additional differentiated treatment: explainer, timeline, comparison, data-brief or editorial-analysis. Never repeat the same story in different words.
- Keep derived treatments tightly grounded in verified_summary and why_it_matters.
- Preserve source_name and source_url.
- editorial_role must be one of: lead, major, standard, brief.
- treatment_type must be one of: news, explainer, backgrounder, timeline, exam-analysis, editorial-analysis, comparison, data-brief.
- visual_type must be one of: photo illustration, map, chart, timeline, data infographic, institutional scene.
- Prefer chart for numeric/economic stories, map for geographic/international stories, timeline for legal/historical sequences, and data infographic for processes or schemes.
- Headlines must be short, specific, active and newspaper-like. Do not use vague headings such as “Important Development” or “Government Update”.
- Assign page as integer 1-8 and rank from 1 on each page.

Return only a JSON array. Each object must contain exactly:
story_id,page,rank,editorial_role,editorial_score,editorial_scores,treatment_type,headline,verified_summary,why_it_matters,section,source_name,source_url,event_date,visual_type.

News date: ${newsDate}
VERIFIED AND PRE-SCORED CANDIDATES:
${JSON.stringify(prepared)}`,
  });

  return normalizeAssignments(result);
}

function languageRule(language) {
  if (language === "HINDI") {
    return `Write natural, clear Hindi used by a serious Hindi newspaper. Avoid literal translation, unnecessarily difficult Sanskritised vocabulary and government-notice language. Familiar English policy terms may remain where clearer. Do not start with PIB, a ministry, a date or “जानकारी दी गई”.`;
  }
  return `Write in a confident, restrained Indian newspaper voice. Do not start with PIB, a ministry, a date, “according to”, or bureaucratic attribution.`;
}

export async function writePagePackage({ assignedStories, page, language, newsDate, publicationDate }) {
  if (!Array.isArray(assignedStories) || assignedStories.length === 0) {
    throw new Error(`No assigned stories were supplied for Page ${page}.`);
  }

  const isHindi = language === "HINDI";
  const label = isHindi ? "Hindi" : "English";

  return jsonResponse({
    prompt: `You are the ${label} editorial desk of THE ASPIRE NATION preparing Page ${page} for publication on ${publicationDate} from verified developments dated ${newsDate}.

${languageRule(language)}

For every supplied unit, write a complete original newspaper package grounded only in verified_summary, why_it_matters, treatment_type and the cited source. Never invent facts, figures, names, quotations, legal effects or forecasts. A backgrounder or analysis must explain only what can safely be inferred from the supplied verified material. If evidence is thin, write a shorter accurate piece.

OUTPUT RULES:
- Keep story_id, page, rank, editorial_role, treatment_type, section, source_name and source_url unchanged.
- headline: active, clear and specific.
- deck: one sentence explaining significance.
- body: concise connected newspaper prose with no filler. Lead: 450-650 words maximum; major: 300-450; standard: 180-300; brief: 90-150. Use less when the verified material is limited. Never lengthen a story merely to fill space.
- fact_box: 4-8 one-line exam facts, each beginning “- ”. For a Page 7 scheme unit, cover why in news, objective, beneficiaries, implementing ministry, verified funding pattern when available, key features, benefits, concerns, implementation challenges, way forward and exam snapshot. Present benefits and concerns in a balanced, evidence-grounded manner.
- exam_connection: exactly three lines: ${isHindi ? "प्रारंभिक परीक्षा:, मुख्य परीक्षा:, आगे क्या देखें:" : "Prelims:, Mains:, Watch Next:"}
- caption: factual visual caption.
- visual_prompt: precise language-neutral editorial image or infographic brief with no readable text or unsupported details.
- visual_type: photo illustration, map, chart, timeline, data infographic or institutional scene.
- No markdown.

Return only a JSON array of objects containing exactly:
story_id,page,rank,editorial_role,treatment_type,section,headline,deck,body,fact_box,exam_connection,caption,visual_prompt,visual_type,source_name,source_url.

VERIFIED UNITS:
${JSON.stringify(assignedStories)}`,
  });
}

export async function generateEditorialImage({ article, language }) {
  if (!article) throw new Error("Article data is required for image generation.");

  const openai = client();
  const prompt = `${article.visual_prompt || article.headline}

Create a serious landscape editorial visual for an Indian competitive-exam current-affairs newspaper. Use a 3:2 composition, print clarity, a strong focal subject and restrained professional colours. Use only the supplied verified concept. Do not add readable text, labels, logos, watermarks, official emblems, fabricated documents, unsupported statistics or identifiable public figures. Do not present a fabricated event as documentary photography. Language context: ${language}. The image itself must contain no text.`;

  const result = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    prompt,
    size: "1536x1024",
    quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
    output_format: "png",
  });

  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error("Image API returned no image data.");
  return Buffer.from(base64, "base64");
}
