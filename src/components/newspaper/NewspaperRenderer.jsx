import Link from "next/link";
import { buildPagePlan } from "@/lib/newsroom/layoutEngine";
import { buildEditorialBlock } from "@/lib/newsroom/editorialBlocks";
import { isSchemeStory, storyRole } from "@/lib/newspaperSupplement";
import {
  Libre_Franklin,
  Noto_Sans_Devanagari,
  Noto_Serif_Devanagari,
  Playfair_Display,
} from "next/font/google";



const hindiSerif = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const hindiSans = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const englishSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const mastheadSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const englishSans = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const PAGE_TITLES = {
  1: "Front Page",
  2: "National & Governance",
  3: "International Affairs",
  4: "Economy, Banking & Agriculture",
  5: "Polity, Judiciary, Science & Technology",
  6: "Environment, Defence & Disaster Management",
  7: "Exam Desk · Scheme of the Day",
  8: "Editorial & Analysis",
};

const PAGE_TITLES_HINDI = {
  1: "मुखपृष्ठ",
  2: "देश की खबरें और सरकार",
  3: "दुनिया की खबरें",
  4: "अर्थव्यवस्था, बैंकिंग और खेती",
  5: "संविधान, अदालत, विज्ञान और टेक्नोलॉजी",
  6: "पर्यावरण, रक्षा और आपदा",
  7: "एग्ज़ाम डेस्क · आज की योजना",
  8: "एडिटोरियल और विश्लेषण",
};

function trimText(value = "", limit = 300) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > limit * 0.72 ? lastSpace : limit).trim()}…`;
}


function composeArticleText(article, language) {
  if (!article) return "";
  const parts = [];
  const seen = new Set();
  const add = (label, value) => {
    const clean = String(value || "").replace(/\s+/g, " " ).trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(label ? `${label} ${clean}` : clean);
  };

  add("", article.body);
  add(language === "HINDI" ? "बैकग्राउंड:" : "Background:", article.fact_box);
  add(language === "HINDI" ? "एग्ज़ाम में क्यों जरूरी:" : "Exam relevance:", article.exam_connection);
  add(language === "HINDI" ? "मुख्य बात:" : "Key context:", article.deck);
  return parts.join(" " );
}


function simplifyHindiDisplayText(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/उपलब्ध सत्यापित जानकारी के अनुसार/g, "आधिकारिक जानकारी के अनुसार")
    .replace(/सूचीबद्ध की गई/g, "जारी की गई")
    .replace(/सूचीबद्ध/g, "जारी")
    .replace(/उपर्युक्त/g, "इस")
    .replace(/उक्त/g, "इस")
    .trim();
}



function composeDenseStoryText(article, language) {
  if (!article) return "";
  const isHindi = language === "HINDI";
  const candidates = [
    article.body,
    article.deck,
    article.fact_box,
    article.exam_connection,
    article.caption,
  ];
  const parts = [];
  const seen = new Set();
  for (const value of candidates) {
    let clean = String(value || "").replace(/\s+/g, " ").trim();
    if (!clean) continue;
    if (isHindi) clean = simplifyHindiDisplayText(clean);
    const key = clean.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    const duplicate = parts.some((part) => {
      const a = part.toLowerCase();
      const b = clean.toLowerCase();
      return a.includes(b.slice(0, Math.min(90, b.length))) || b.includes(a.slice(0, Math.min(90, a.length)));
    });
    if (duplicate) continue;
    seen.add(key);
    parts.push(clean);
  }
  return parts.join(" ");
}

function buildHindiLeadStory(article) {
  const headline = simplifyHindiDisplayText(article?.headline || "");
  const body = simplifyHindiDisplayText(article?.body || article?.deck || "");

  // The imported copy often begins with a date or source attribution. For the
  // newspaper preview, open with the development and move attribution later.
  if (/Public Examinations|अनुचित साधनों|सार्वजनिक परीक्षाओं/i.test(`${headline} ${body}`)) {
    const remainder = body
      .replace(/^लोकसभा ने\s*29\s*जुलाई\s*2026\s*को\s*/i, "")
      .replace(/^Public Examinations[^।.]*[।.]?\s*/i, "")
      .replace(/^PIB[^।.]*[।.]?\s*/i, "")
      .trim();

    return [
      "सरकारी भर्ती और शिक्षा से जुड़ी परीक्षाओं में नकल तथा अनुचित साधनों पर रोक को मजबूत करने के लिए लोकसभा ने Public Examinations (Prevention of Unfair Means) Amendment Bill, 2026 पारित किया है।",
      "यह बदलाव परीक्षा व्यवस्था की निष्पक्षता, उम्मीदवारों के भरोसे और सार्वजनिक संस्थानों की जवाबदेही से सीधे जुड़ा है।",
      remainder,
    ].filter(Boolean).join(" ");
  }

  // Prefer a natural deck when available; otherwise keep the verified body.
  const deck = simplifyHindiDisplayText(article?.deck || "");
  if (deck && !/^PIB|^प्रेस सूचना ब्यूरो|^\d{1,2}\s*जुलाई/i.test(deck)) {
    return `${deck} ${body}`.trim();
  }
  return body;
}

function trimStoryText(value = "", limit = 300, isHindi = false) {
  const source = isHindi ? simplifyHindiDisplayText(value) : String(value || "").replace(/\s+/g, " ").trim();
  if (!source || source.length <= limit) return source;

  const window = source.slice(0, limit + 1);
  const marks = isHindi ? ["।", "?", "!", "."] : [".", "?", "!"];
  let sentenceEnd = -1;
  for (const mark of marks) sentenceEnd = Math.max(sentenceEnd, window.lastIndexOf(mark));

  // Prefer a complete sentence when it uses most of the available space.
  if (sentenceEnd >= Math.floor(limit * 0.62)) {
    return window.slice(0, sentenceEnd + 1).trim();
  }

  const cut = source.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > limit * 0.72 ? lastSpace : limit).trim()}…`;
}

function formatDate(value, language) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(language === "HINDI" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function hasImage(url) {
  return Boolean(url && (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")));
}

function uniqueStories(articles = []) {
  const seen = new Set();
  return articles.filter((article) => {
    if (!article?.id || seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

function priorityScore(article) {
  const slot = String(article?.slot || "").toLowerCase();
  const headline = String(article?.headline || "");
  let score = Number(article?.display_order || 999) * -1;
  if (/hero|lead/.test(slot)) score += 10000;
  if (/major|secondary/.test(slot)) score += 5000;
  if (/medium/.test(slot)) score += 2000;
  if (hasImage(article?.image_url)) score += 400;
  score += Math.min(headline.length, 100);
  return score;
}

function arrangeStories(articles = []) {
  return uniqueStories(articles)
    .filter((a) => a?.headline && a?.body)
    .sort((a, b) => priorityScore(b) - priorityScore(a));
}


function pickImageLead(primary = [], fallback = []) {
  const primaryImage = primary.find((article) => hasImage(article?.image_url));
  if (primaryImage) return primaryImage;
  const fallbackImage = fallback.find((article) => hasImage(article?.image_url));
  return fallbackImage || primary[0] || fallback[0] || null;
}

function QuotePortraitIcon({ initials = "AN" }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 52,
        height: 52,
        minWidth: 52,
        minHeight: 52,
        borderRadius: "9999px",
        border: "2px solid rgba(255,255,255,0.72)",
        background: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: initials.length > 2 ? 14 : 16,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "0.02em",
          color: "#ffffff",
        }}
      >
        {initials}
      </span>
    </div>
  );
}

function VisualFallback({ article, language, height = 150, className = "" }) {
  const isHindi = language === "HINDI";
  const fact = isHindi ? (article?.headline || article?.deck || article?.body) : (article?.fact_box || article?.exam_connection || article?.deck || article?.body);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-red-900 px-5 py-4 text-white shadow-sm ${className}`}
      style={{ height }}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
      <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-red-600/20" />
      <div className="absolute right-5 top-5 grid grid-cols-3 gap-1 opacity-35">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-white" />
        ))}
      </div>

      <div className="relative flex h-full flex-col justify-between py-1">
        <div className="min-h-0 pt-1">
          <p className={`${isHindi ? hindiSans.className : englishSans.className} ${isHindi ? "text-[9px] leading-[1.45] tracking-normal" : "text-[8px] uppercase tracking-[0.2em]"} font-black text-red-200`}>
            {isHindi ? "विषय का विजुअल सार" : "EDITORIAL VISUAL SUMMARY"}
          </p>
        </div>

        <p
          className={`${isHindi ? hindiSerif.className : englishSerif.className} max-w-[82%] ${isHindi ? "text-[17px] leading-[1.42]" : "text-[18px] leading-[1.12]"} font-black text-white`}
          style={isHindi ? { paddingTop: "6px", paddingBottom: "8px", overflow: "hidden" } : { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {trimStoryText(fact, isHindi ? 118 : 230, isHindi)}
        </p>

        <p className={`${isHindi ? hindiSans.className : englishSans.className} ${isHindi ? "text-[7.5px] leading-[1.4] tracking-normal" : "text-[7px] uppercase tracking-[0.14em]"} font-bold text-white/60`}>
          {isHindi ? "मुख्य तथ्य · संदर्भ · परीक्षा उपयोगिता" : "Key facts · context · exam relevance"}
        </p>
      </div>
    </div>
  );
}

function splitInfographicFacts(article, language) {
  const source = composeArticleText(article, language) || article?.deck || article?.body || "";
  const pieces = source
    .split(/(?<=[.!?।])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return [
    trimText(pieces[0] || article?.fact_box || article?.headline || "", 88),
    trimText(pieces[1] || article?.exam_connection || article?.deck || "", 88),
    trimText(pieces[2] || article?.body || article?.caption || "", 88),
  ].filter(Boolean);
}

function DataInfographic({ editionId, article, language, className = "" }) {
  const isHindi = language === "HINDI";
  const gold = process.env.NEXT_PUBLIC_NEWSPAPER_GOLD_PRICE || "--";
  const silver = process.env.NEXT_PUBLIC_NEWSPAPER_SILVER_PRICE || "--";
  const usd = process.env.NEXT_PUBLIC_NEWSPAPER_USD_INR || "--";
  const crude = process.env.NEXT_PUBLIC_NEWSPAPER_CRUDE_PRICE || "--";
  const hasMarket = [gold, silver, usd, crude].some((value) => value !== "--");
  const facts = splitInfographicFacts(article, language);

  return (
    <aside className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-3 text-white shadow-sm ${className}`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[14px] border-white/10" />
      <div className="relative h-full">
        <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black uppercase tracking-[0.16em] text-red-200`}>
          {hasMarket ? (isHindi ? "बाजार एवं कमोडिटी" : "Market & Commodities") : (isHindi ? "विषय इन्फोग्राफिक" : "Topic Infographic")}
        </p>
        {hasMarket ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              [isHindi ? "सोना" : "Gold", gold],
              [isHindi ? "चांदी" : "Silver", silver],
              ["USD/INR", usd],
              [isHindi ? "कच्चा तेल" : "Crude", crude],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 px-2 py-2">
                <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] font-bold uppercase tracking-wide text-white/65`}>{label}</p>
                <p className={`${englishSans.className} mt-1 text-[14px] font-black text-white`}>{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 space-y-2 pb-7">
            {facts.slice(0, 2).map((fact, index) => (
              <div key={`${fact}-${index}`} className="grid grid-cols-[22px_1fr] gap-2 rounded-lg bg-white/10 p-2">
                <span className={`${englishSans.className} flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-[9px] font-black`}>{index + 1}</span>
                <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] leading-[1.35] text-white/95`}>{trimStoryText(fact, isHindi ? 150 : 165, isHindi)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2">
          <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[6px] text-white/55`}>
            {hasMarket ? (isHindi ? "प्रकाशन से पहले दरें अपडेट करें" : "Update rates before publication") : (isHindi ? "लेख के सत्यापित तथ्यों से तैयार" : "Built from verified article facts")}
          </p>
          <ReadLink editionId={editionId} article={article} language={language} className="bg-white px-2 py-0.5 text-[6.5px] text-blue-950 hover:bg-amber-100" />
        </div>
      </div>
    </aside>
  );
}


function EditorialBlock({ editionId, article, language, pageNumber = 1, className = "" }) {
  if (!article) return null;
  const isHindi = language === "HINDI";
  const block = article.__blockPayload || buildEditorialBlock(article, pageNumber);
  const type = article.__editorialBlock || block.type || "exam-snapshot";
  const labels = {
    "data-watch": isHindi ? "डेटा वॉच" : "Data Watch",
    numbers: isHindi ? "आज के आंकड़े" : "Numbers",
    timeline: isHindi ? "टाइमलाइन" : "Timeline",
    "map-focus": isHindi ? "मैप फोकस" : "Map Focus",
    explained: isHindi ? "समझिए" : "Explained",
    "quick-revision": isHindi ? "क्विक रिवीजन" : "Quick Revision",
    "exam-snapshot": isHindi ? "एग्ज़ाम स्नैपशॉट" : "Exam Snapshot",
  };
  const tone = type === "timeline" ? "border-amber-500" : type === "map-focus" ? "border-emerald-700" : type === "data-watch" || type === "numbers" ? "border-blue-900" : "border-red-800";
  const facts = (block.facts || []).slice(0, 3);
  const numbers = (block.numbers || []).slice(0, 4);
  const timeline = (block.timeline || []).slice(0, 4);

  return (
    <aside className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-t-4 ${tone} bg-white p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black uppercase tracking-[0.16em] text-blue-950`}>
          {labels[type] || labels["exam-snapshot"]}
        </p>
        <span className={`${englishSans.className} text-[6px] font-bold uppercase tracking-wide text-slate-400`}>THE ASPIRE NATION</span>
      </div>

      {(type === "data-watch" || type === "numbers") && numbers.length > 0 ? (
        <div className="mt-2 grid flex-1 grid-cols-2 gap-2">
          {numbers.map((value, index) => (
            <div key={`${value}-${index}`} className="rounded-lg bg-slate-50 px-2 py-2">
              <p className={`${englishSans.className} text-[14px] font-black leading-none text-blue-950`}>{value}</p>
              <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 text-[6.5px] leading-[1.2] text-slate-600`}>
                {trimStoryText(facts[index] || article.deck || article.headline, isHindi ? 70 : 82, isHindi)}
              </p>
            </div>
          ))}
        </div>
      ) : type === "timeline" && timeline.length > 0 ? (
        <div className="mt-2 flex flex-1 flex-col justify-between gap-1.5">
          {timeline.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid grid-cols-[38px_1fr] items-start gap-2">
              <span className={`${englishSans.className} rounded bg-amber-100 px-1 py-0.5 text-center text-[7px] font-black text-amber-900`}>{item.label}</span>
              <p className={`${isHindi ? hindiSans.className : englishSans.className} border-l border-slate-300 pl-2 text-[7px] leading-[1.25] text-slate-700`}>
                {trimStoryText(item.text, isHindi ? 90 : 105, isHindi)}
              </p>
            </div>
          ))}
        </div>
      ) : type === "map-focus" ? (
        <div className="mt-2 grid flex-1 grid-cols-[0.82fr_1.18fr] gap-2">
          <div className="relative overflow-hidden rounded-lg bg-emerald-50">
            <div className="absolute inset-2 rounded-[45%_55%_52%_48%] border-2 border-emerald-700/50 bg-emerald-200/40" />
            <div className="absolute left-[52%] top-[42%] h-2.5 w-2.5 rounded-full bg-red-700 ring-4 ring-red-200" />
            <p className={`${englishSans.className} absolute bottom-2 left-2 text-[6px] font-black uppercase tracking-wide text-emerald-900`}>Locator</p>
          </div>
          <div className="min-h-0 overflow-hidden">
            <p className={`${isHindi ? hindiSerif.className : englishSerif.className} text-[11px] font-black leading-[1.12] text-blue-950`}>{trimStoryText(article.headline, isHindi ? 82 : 96, isHindi)}</p>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 text-[7px] leading-[1.3] text-slate-700`}>{trimStoryText(article.deck || article.body, isHindi ? 190 : 220, isHindi)}</p>
          </div>
        </div>
      ) : (
        <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-hidden">
          {(facts.length ? facts : [article.deck || article.body]).slice(0, 3).map((fact, index) => (
            <div key={`${index}-${fact}`} className="grid grid-cols-[18px_1fr] gap-2">
              <span className={`${englishSans.className} flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-800 text-[7px] font-black text-white`}>{index + 1}</span>
              <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] leading-[1.3] text-slate-700`}>{trimStoryText(fact, isHindi ? 120 : 145, isHindi)}</p>
            </div>
          ))}
        </div>
      )}

      <ReadLink editionId={editionId} article={article} language={language} className="mt-2 text-[6.5px]" />
    </aside>
  );
}

function ReadLink({ editionId, article, language, className = "" }) {
  if (!article?.id || !["lead", "major"].includes(storyRole(article))) return null;
  return (
    <Link
      href={article.__readerMode === "public" ? `/newspaper/${article.edition_id || editionId}/article/${encodeURIComponent(article.id)}` : `/admin/newsroom-editions/${article.edition_id || editionId}/article/${encodeURIComponent(article.id)}` }
      className={`shrink-0 whitespace-nowrap rounded-sm bg-blue-950 px-2 py-0.5 font-black text-white hover:bg-red-800 ${className}`}
      style={{ minHeight: "18px", lineHeight: "14px", display: "inline-flex", alignItems: "center", width: "fit-content", zIndex: 5 }}
    >
      {language === "HINDI" ? "विस्तृत विश्लेषण →" : "Complete analysis →"}
    </Link>
  );
}

function Headline({ children, language, size = "medium", className = "" }) {
  const isHindi = language === "HINDI";
  const sizes = {
    hero: isHindi ? "text-[31px] leading-[1.42]" : "text-[40px] leading-[0.98]",
    large: isHindi ? "text-[21px] leading-[1.44]" : "text-[27px] leading-[1.02]",
    medium: isHindi ? "text-[15.5px] leading-[1.46]" : "text-[19px] leading-[1.06]",
    small: isHindi ? "text-[11.8px] leading-[1.48]" : "text-[14px] leading-[1.10]",
  };
  return (
    <h2
      className={`${isHindi ? hindiSans.className : englishSerif.className} ${sizes[size]} font-black text-[#071023] ${className}`}
      style={{ overflowWrap: "break-word", hyphens: "none", letterSpacing: 0, paddingTop: isHindi ? "0.28em" : 0, paddingBottom: isHindi ? "0.24em" : 0 }}
    >
      {children}
    </h2>
  );
}

function Body({ article, language, limit = 420, columns = 1, lines = null, expanded = false, className = "" }) {
  const isHindi = language === "HINDI";

  // Hindi must read like one continuous newspaper story. Do not merge fact boxes,
  // labels and exam notes into the paragraph because that creates broken copy.
  const rawText = isHindi
    ? (article?.__useNaturalLead
        ? `${buildHindiLeadStory(article)} ${composeDenseStoryText({ ...article, body: "", deck: "" }, language)}`.trim()
        : (expanded ? composeDenseStoryText(article, language) : (article?.body || article?.deck || article?.fact_box || article?.exam_connection || "")))
    : (expanded ? composeDenseStoryText(article, language) : (article?.body || article?.deck || ""));

  // For Hindi, shorten the copy before rendering rather than visually clipping a
  // Devanagari line. This prevents half-visible matras and cut final lines.
  const safeLimit = isHindi && lines
    ? Math.min(limit, Math.max(80, lines * (columns > 1 ? 30 : 22)))
    : limit;
  const renderedText = trimStoryText(rawText, safeLimit, isHindi);

  return (
    <p
      className={`${isHindi ? hindiSans.className : englishSans.className} ${isHindi ? "text-[8.7px] leading-[1.56]" : "text-[10.5px] leading-[1.36]"} text-slate-950 ${className}`}
      style={{
        columnCount: columns,
        columnGap: columns > 1 ? "20px" : "0px",
        columnRule: "none",
        textAlign: "left",
        overflowWrap: "break-word",
        wordSpacing: "normal",
        lineBreak: isHindi ? "auto" : "auto",
        paddingTop: isHindi ? "4px" : 0,
        paddingBottom: isHindi ? "8px" : "1px",
        ...(lines && !isHindi
          ? {
              display: "-webkit-box",
              WebkitLineClamp: lines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
          : {}),
      }}
    >
      {renderedText}
    </p>
  );
}

function SmartImage({ article, height = 180, className = "" }) {
  if (!hasImage(article?.image_url)) return null;
  return (
    <figure className={`overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={article.image_url}
        alt={article.caption || article.headline || "News visual"}
        className="w-full object-cover"
        style={{ height }}
      />
      {(article.caption || article.image_credit) && (
        <figcaption className={`${englishSans.className} border-t border-slate-300 px-1.5 py-1 text-[8px] leading-[1.25] text-slate-600`}>
          {trimText(article.caption || "", 95)}
          {article.image_credit ? ` — ${trimText(article.image_credit, 45)}` : ""}
        </figcaption>
      )}
    </figure>
  );
}

function SectionLabel() {
  // V14: card-level category labels are intentionally hidden.
  // The page heading, headline and story hierarchy already provide context,
  // while long labels such as “Environment, Defence & Disaster Management”
  // consumed valuable newspaper space.
  return null;
}

function Masthead({ edition, currentPage, leadHeadline }) {
  const isHindi = edition.language === "HINDI";
  const city = process.env.NEXT_PUBLIC_NEWSPAPER_WEATHER_CITY || "New Delhi";
  const temp = process.env.NEXT_PUBLIC_NEWSPAPER_WEATHER_TEMP || "--°C";
  const condition = process.env.NEXT_PUBLIC_NEWSPAPER_WEATHER_CONDITION || "Weather update";

  return (
    <header className="h-[178px] overflow-hidden bg-white shadow-[inset_0_3px_0_#172554,inset_0_-3px_0_#172554]">
      <div className="grid h-[122px] grid-cols-[92px_minmax(0,1fr)_164px] items-center gap-2 px-3">
        <div className="text-center">
          <img
            src={edition.logo_url || "/images/logo/aspire-nation-logo-header.png"}
            alt="The Aspire Nation"
            className="mx-auto h-[86px] w-[86px] object-contain"
          />
          <p className={`${englishSans.className} -mt-1 text-[6.5px] font-black uppercase tracking-[0.14em] text-blue-950`}>
            Aspirations Drive Nation
          </p>
        </div>

        <div className="min-w-0 overflow-hidden text-center">
          <div className="mb-1 flex items-center justify-center gap-3">
            <span className="h-[3px] w-14 rounded-full bg-red-700" />
            <p className={`${englishSans.className} text-[7.5px] font-black uppercase tracking-[0.34em] text-red-800`}>
              Aspirants’ Current Affairs Study Edition
            </p>
            <span className="h-[3px] w-14 rounded-full bg-red-700" />
          </div>

          <h1
            className={`${mastheadSerif.className} flex min-w-0 items-center justify-center gap-[14px] whitespace-nowrap text-[55px] font-black leading-[0.84] tracking-[-0.025em] text-blue-950`}
            style={{ textShadow: "0 1px 0 rgba(15,23,42,0.15)" }}
            aria-label="THE ASPIRE NATION"
          >
            <span className="shrink-0">THE</span>
            <span className="shrink-0">ASPIRE</span>
            <span className="shrink-0">NATION</span>
          </h1>

          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-[2px] w-14 bg-blue-950" />
            <p className={`${englishSerif.className} text-[14px] font-semibold italic text-red-800`}>
              Every Aspirant’s Morning Starts Here
            </p>
            <span className="h-[2px] w-14 bg-blue-950" />
          </div>

          <p className={`${englishSans.className} mt-1 text-[6.8px] font-black uppercase tracking-[0.25em] text-slate-600`}>
            Current Affairs · Explanations · Exam Relevance · Official Sources
          </p>
        </div>

        <div className={`${isHindi ? hindiSans.className : englishSans.className} h-[104px] min-w-0 overflow-hidden rounded-xl bg-slate-50 px-2.5 py-2 shadow-sm`}>
          <div className="grid h-full min-w-0 grid-cols-[minmax(0,1fr)_46px] items-start gap-2">
            <div className="min-w-0 overflow-hidden">
              <p className="max-w-full text-[7px] font-black uppercase leading-[1.2] tracking-[0.13em] text-blue-950">
                {isHindi ? "आज का मौसम" : "Today’s Weather"}
              </p>
              <p className="mt-1 truncate text-[9px] font-bold text-slate-700">{city}</p>
              <div className="mt-2 flex min-w-0 items-end gap-1.5">
                <p className="shrink-0 text-[23px] font-black leading-none text-red-800">{temp}</p>
                <p className="min-w-0 pb-0.5 text-[6.2px] leading-[1.25] text-slate-600">{trimText(condition, 24)}</p>
              </div>
            </div>
            <div className="min-w-0 text-center">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-md bg-blue-950 text-[6.5px] font-black leading-[1.2] text-white">
                QR<br />CODE
              </div>
              <p className="mt-1 whitespace-nowrap text-[5.6px] font-bold text-blue-950">SCAN TO READ</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isHindi ? hindiSans.className : englishSans.className} grid h-[26px] grid-cols-[1.05fr_0.8fr_1.35fr_0.5fr] bg-blue-950 text-[9px] font-extrabold text-white`}>
        <div className="px-3 py-1.5">{isHindi ? "संस्करण" : "Edition"}: {edition.publication_date}</div>
        <div className="bg-blue-900 px-3 py-1.5 text-center">{formatDate(edition.publication_date, edition.language).split(",")[0]}</div>
        <div className="bg-red-800 px-3 py-1.5 text-center">{isHindi ? "समसामयिकी अध्ययन संस्करण" : "Current Affairs Study Edition"}</div>
        <div className="px-3 py-1.5 text-right">{isHindi ? "पृष्ठ" : "Page"} {currentPage}</div>
      </div>

      <div className={`${isHindi ? hindiSans.className : englishSans.className} grid h-[30px] grid-cols-[132px_1fr] overflow-hidden bg-amber-50 text-[9px] font-black shadow-[inset_0_-2px_0_#991b1b]`}>
        <div className="bg-red-800 px-3 py-2 text-white">{isHindi ? "शीर्ष समाचार" : "TOP STORY"}</div>
        <div className="px-4 py-2 text-slate-950">{trimText(leadHeadline || PAGE_TITLES[currentPage], 180)}</div>
      </div>
    </header>
  );
}
function LeadStory({ editionId, article, language }) {
  if (!article) return null;
  const image = hasImage(article.image_url);
  return (
    <section className="h-full overflow-hidden pb-3">
      <div className="mb-2 inline-block bg-red-800 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
        {language === "HINDI" ? "सबसे बड़ी खबर" : "Lead Story"}
      </div>
      <Headline language={language} size="hero">{article.headline}</Headline>
      {article.deck && (
        <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-2 border-l-4 border-red-800 pl-3 text-[12px] font-bold leading-[1.28] text-slate-700`} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {trimText(article.deck, 250)}
        </p>
      )}
      <div className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="overflow-hidden">
          <Body article={article} language={language} limit={760} columns={1} lines={12} />
          <ReadLink editionId={editionId} article={article} language={language} className="mt-2 inline-block text-[10px]" />
        </div>
        {image ? <SmartImage article={article} height={270} /> : <VisualFallback article={article} language={language} height={270} />}
      </div>
    </section>
  );
}

function RailItem({ editionId, article, language, index }) {
  if (!article) return null;
  const image = hasImage(article.image_url);
  return (
    <article className="rounded-lg bg-slate-50/70 p-2 shadow-sm">
      <SectionLabel language={language} tone={index === 0 ? "red" : "blue"}>{article.section || (language === "HINDI" ? "समाचार" : "News")}</SectionLabel>
      <Headline language={language} size={index === 0 ? "medium" : "small"} className="mt-1">{article.headline}</Headline>
      {image && index < 2 && <SmartImage article={article} height={index === 0 ? 96 : 72} className="mt-2" />}
      <Body article={article} language={language} limit={index === 0 ? 250 : 170} lines={index === 0 ? 7 : 5} className="mt-1.5" />
      <ReadLink editionId={editionId} article={article} language={language} className="mt-1 inline-block text-[9px]" />
    </article>
  );
}

function FeatureStory({ editionId, article, language, index }) {
  if (!article) return null;
  const image = hasImage(article.image_url);
  return (
    <article className="h-full overflow-hidden rounded-lg bg-white px-3 py-2 shadow-sm">
      <SectionLabel language={language} tone={index % 3 === 1 ? "green" : "blue"}>{article.section || (language === "HINDI" ? "विशेष" : "Front Page")}</SectionLabel>
      <Headline language={language} size="medium" className="mt-1">{article.headline}</Headline>
      {image && index < 3 && <SmartImage article={article} height={92} className="mt-2" />}
      <Body article={article} language={language} limit={image && index < 3 ? 170 : 260} lines={image && index < 3 ? 5 : 8} className="mt-2" />
      <ReadLink editionId={editionId} article={article} language={language} className="mt-1 inline-block text-[9px]" />
    </article>
  );
}

function NewsDesk({ editionId, articles, language }) {
  const items = articles.slice(0, 4);
  if (!items.length) return null;

  return (
    <section className="rounded-xl bg-slate-50 p-3 shadow-sm">
      <div className="grid grid-cols-[132px_1fr] gap-3">
        <h3 className={`${language === "HINDI" ? hindiSans.className : englishSans.className} bg-red-800 px-3 py-2 text-[11px] font-black uppercase leading-4 text-white`}>
          {language === "HINDI" ? "अतिरिक्त महत्वपूर्ण समाचार" : "More Important News"}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {items.map((article) => (
            <article key={article.id} className="px-3">
              <p className={`${language === "HINDI" ? hindiSerif.className : englishSerif.className} text-[11px] font-black leading-[1.08] text-blue-950`}>
                {trimText(article.headline, 82)}
              </p>
              <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-1 text-[8px] leading-[1.3] text-slate-700`}>
                {trimText(article.deck || article.body, 105)}
              </p>
              <ReadLink editionId={editionId} article={article} language={language} className="mt-1 inline-block text-[8px]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContextDesk({ articles, language }) {
  const items = articles.slice(0, 6);
  if (!items.length) return null;

  return (
    <section className="rounded-xl bg-blue-50/50 shadow-sm">
      <div className={`${language === "HINDI" ? hindiSans.className : englishSans.className} bg-blue-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white`}>
        {language === "HINDI" ? "जरूरी फैक्ट्स और एग्ज़ाम कनेक्शन" : "Facts, Context & Exam Relevance"}
      </div>
      <div className="grid grid-cols-3 gap-2 p-2">
        {items.map((article) => (
          <div key={article.id} className="min-h-[42px] rounded-lg bg-white px-3 py-2 shadow-sm">
            <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} text-[8px] font-black uppercase tracking-wide text-red-800`}>
              {trimText(article.section || article.headline, 48)}
            </p>
            <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-1 text-[8px] leading-3 text-slate-800`}>
              {trimText(article.fact_box || article.exam_connection || article.deck || article.body, 105)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


function FrontPage({ editionId, pageArticles, allArticles, language }) {
  const isHindi = language === "HINDI";
  const pagePool = arrangeStories(pageArticles);
  const crossPage = arrangeStories(allArticles).filter((a) => !pagePool.some((p) => p.id === a.id));
  const lead = pickImageLead(pagePool, crossPage);
  const pool = uniqueStories([...pagePool, ...crossPage]).filter((article) => article.id !== lead?.id);
  const withImages = pool.filter((article) => hasImage(article.image_url));
  const withoutImages = pool.filter((article) => !hasImage(article.image_url));
  const ordered = uniqueStories([...withImages, ...withoutImages]);

  const visualMajor = ordered[0];
  const rightStories = ordered.slice(1, 4);
  const lowerLead = ordered[4];
  const lowerSide = ordered.slice(5, 7);
  const briefs = ordered.slice(7, 13);
  const finalStories = ordered.slice(13, 17);

  return (
    <div className="h-full overflow-hidden">
      <section className="grid h-[500px] min-h-0 grid-cols-[1.72fr_0.88fr] gap-5 pb-3">
        <div className="overflow-hidden">
          <div className="mb-2 inline-block bg-red-800 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            {language === "HINDI" ? "सबसे बड़ी खबर" : "Lead Story"}
          </div>
          <Headline language={language} size="hero">{lead?.headline}</Headline>
          {lead?.deck && <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-2 border-l-4 border-red-800 pl-3 text-[12px] font-bold leading-[1.26] text-slate-700`}>{trimText(lead.deck, 245)}</p>}
          <div className="mt-3 grid h-[278px] grid-cols-[1.14fr_0.86fr] gap-3 overflow-hidden">
            <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-7">
              <div className="min-h-0 flex-1 overflow-hidden">
                <Body
                  article={isHindi ? { ...lead, __useNaturalLead: true } : lead}
                  language={language}
                  limit={isHindi ? 2350 : 1900}
                  columns={2}
                  expanded
                  className="h-full"
                />
              </div>
              <ReadLink
                editionId={editionId}
                article={lead}
                language={language}
                className="absolute bottom-1 left-0 text-[7px]"
              />
            </div>
            {hasImage(lead?.image_url) ? (
              <SmartImage article={lead} height={278} />
            ) : (
              <VisualFallback article={lead} language={language} height={278} />
            )}
          </div>
        </div>

        <aside className="grid h-full min-h-0 grid-rows-[236px_repeat(3,minmax(0,1fr))] gap-2 overflow-hidden rounded-xl bg-slate-50/80 p-3 shadow-sm">
          {visualMajor && (
            <article className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white p-2 pb-7 shadow-sm">
              <SectionLabel language={language} tone="red">{visualMajor.section || "Top Development"}</SectionLabel>
              <Headline language={language} size="medium" className="mt-1">{visualMajor.headline}</Headline>
              {hasImage(visualMajor.image_url) ? (
                <SmartImage article={visualMajor} height={92} className="mt-1 shrink-0" />
              ) : (
                <VisualFallback article={visualMajor} language={language} height={92} className="mt-1 shrink-0" />
              )}
              <div className="min-h-0 flex-1 overflow-hidden">
                <Body article={visualMajor} language={language} limit={isHindi ? 360 : 230} lines={isHindi ? 6 : 5} expanded={isHindi} className="mt-1" />
              </div>
              <ReadLink editionId={editionId} article={visualMajor} language={language} className="absolute bottom-2 left-2 text-[7px]" />
            </article>
          )}
          {rightStories.map((article, index) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white px-2 pb-6 pt-1.5 shadow-sm">
              <Headline language={language} size="small">{article.headline}</Headline>
              <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-0.5 min-h-0 flex-1 overflow-hidden text-[7px] leading-[1.25] text-slate-700`}>
                {trimStoryText(article.deck || article.body || "", isHindi ? 150 : 125, isHindi)}
              </p>
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2 text-[6.5px]" />
            </article>
          ))}
        </aside>
      </section>

      <section className="grid h-[365px] min-h-0 grid-cols-[1.35fr_0.75fr_0.9fr] gap-4 py-3">
        {lowerLead && (
          <article className="relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-50/70 p-4 pb-10 shadow-sm">
            <SectionLabel language={language} tone="blue">{lowerLead.section || "National Focus"}</SectionLabel>
            <Headline language={language} size="large" className="mt-1">{lowerLead.headline}</Headline>
            {hasImage(lowerLead.image_url) ? (
              <SmartImage article={lowerLead} height={118} className="mt-2" />
            ) : (
              <VisualFallback article={lowerLead} language={language} height={118} className="mt-2" />
            )}
            <div className="min-h-0 flex-1 overflow-hidden">
              <Body article={lowerLead} language={language} limit={isHindi ? 1450 : 860} lines={isHindi ? 22 : 17} expanded={isHindi} className="mt-2" />
            </div>
            <ReadLink editionId={editionId} article={lowerLead} language={language} className="absolute bottom-3 left-4 text-[7px]" />
          </article>
        )}
        <div className="grid min-h-0 grid-rows-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-3 overflow-hidden">
          {lowerSide.slice(0, 1).map((article) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white/70 px-2 pb-7 pt-2 shadow-sm">
              <SectionLabel language={language} tone="green">{article.section || "Explained"}</SectionLabel>
              <Headline language={language} size="medium" className="mt-1">{article.headline}</Headline>
              <div className="min-h-0 flex-1 overflow-hidden">
                <Body article={article} language={language} limit={isHindi ? 560 : 340} lines={isHindi ? 10 : 8} expanded={isHindi} className="mt-2" />
              </div>
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-2 left-2 text-[7px]" />
            </article>
          ))}
          <EditorialBlock editionId={editionId} article={lowerSide[1] || visualMajor || lead} language={language} pageNumber={1} />
        </div>
        <div className="min-h-0 overflow-hidden rounded-xl bg-slate-50/70 p-3 shadow-sm">
          <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} text-[10px] font-black ${isHindi ? "tracking-normal" : "uppercase tracking-[0.13em]"} text-blue-950`}>{isHindi ? "और जरूरी खबरें" : "More Important Stories"}</p>
          <div className="mt-2 grid h-[322px] min-h-0 grid-rows-3 gap-2">
            {briefs.slice(0, 3).map((article, index) => (
              <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white px-2.5 pb-7 pt-2 shadow-sm">
                <SectionLabel language={language} tone={index === 1 ? "green" : "blue"}>{article.section || (isHindi ? "जरूरी खबर" : "News")}</SectionLabel>
                <p className={`${language === "HINDI" ? hindiSerif.className : englishSerif.className} mt-0.5 text-[12.5px] font-black leading-[1.12] text-[#071023]`}>{trimStoryText(article.headline, isHindi ? 82 : 96, isHindi)}</p>
                <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-1 min-h-0 flex-1 overflow-hidden text-[7.8px] leading-[1.34] text-slate-700`}>{trimStoryText(composeDenseStoryText(article, language), isHindi ? 310 : 290, isHindi)}</p>
                <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-2 left-2.5 text-[6.5px]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid h-[230px] min-h-0 grid-cols-[1.2fr_0.8fr] gap-4 py-3">
        <div className="grid min-h-0 grid-cols-3 gap-3 overflow-hidden">
          {briefs.slice(5, 8).concat(finalStories.slice(0, 3)).slice(0, 3).map((article, index) => (
            <article key={article.id} className="relative flex h-full flex-col overflow-hidden rounded-lg bg-slate-50 px-3 pb-8 pt-2 shadow-sm">
              <SectionLabel language={language} tone={index === 1 ? "green" : "red"}>{article.section || "In Focus"}</SectionLabel>
              <Headline language={language} size="small" className="mt-1">{article.headline}</Headline>
              {hasImage(article.image_url) && <SmartImage article={article} height={58} className="mt-2 rounded-md" />}
              <div className="min-h-0 flex-1 overflow-hidden">
                <Body article={article} language={language} limit={isHindi ? 620 : 430} lines={isHindi ? 12 : 11} expanded={isHindi} className="mt-2" />
              </div>
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-2 left-3 text-[7px]" />
            </article>
          ))}
        </div>
        <aside className="relative flex h-full flex-col rounded-xl bg-blue-50/60 p-4 pb-10 shadow-sm">
          <p className={`${language === "HINDI" ? hindiSans.className : englishSans.className} text-[10px] font-black uppercase tracking-[0.15em] text-red-800`}>{language === "HINDI" ? "आज का समझाइए" : "Today’s Explainer"}</p>
          <p className={`${language === "HINDI" ? hindiSerif.className : englishSerif.className} mt-2 ${isHindi ? "text-[16px] leading-[1.18]" : "text-[18px] leading-[1.12]"} font-black text-blue-950`}>{trimText((finalStories[3] || briefs[0])?.headline, 120)}</p>
          <p
            className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-2 min-h-0 flex-1 overflow-hidden text-[9px] leading-[1.35] text-slate-700`}
            style={isHindi ? { overflow: "hidden" } : { display: "-webkit-box", WebkitLineClamp: 8, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {trimText(composeDenseStoryText((finalStories[3] || briefs[0]), language), isHindi ? 500 : 480)}
          </p>
          <ReadLink editionId={editionId} article={(finalStories[3] || briefs[0])} language={language} className="absolute bottom-3 left-4 text-[7px]" />
        </aside>
      </section>

      <section className="grid h-[160px] min-h-0 grid-cols-4 gap-3 overflow-hidden pt-3">
        {finalStories.slice(0, 4).map((article) => (
          <article key={article.id} className="relative flex h-full flex-col overflow-hidden rounded-lg bg-slate-50 px-3 pb-7 pt-2 shadow-sm">
            <p className={`${language === "HINDI" ? hindiSans.className : englishSerif.className} mt-1 shrink-0 ${isHindi ? "text-[9.4px] leading-[1.38]" : "text-[10.5px] leading-[1.08]"} font-black text-blue-950`} style={isHindi ? { paddingTop: "2px", paddingBottom: "2px" } : undefined}>{trimText(article.headline, isHindi ? 72 : 82)}</p>
            {hasImage(article.image_url) && <SmartImage article={article} height={30} className="mt-1 shrink-0 rounded" />}
            <p
              className={`${language === "HINDI" ? hindiSans.className : englishSans.className} mt-1 overflow-hidden text-[7px] text-slate-700`}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: hasImage(article.image_url) ? 2 : (isHindi ? 3 : 4),
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: isHindi ? "1.48" : "1.22",
                paddingBottom: isHindi ? "2px" : 0,
              }}
            >
              {trimStoryText(isHindi ? (article.body || article.deck || "") : (article.deck || article.body), isHindi ? 180 : 220, isHindi)}
            </p>
            <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-2 left-3 text-[7px]" />
          </article>
        ))}
      </section>
    </div>
  );
}

function StandardPage({ editionId, articles, language, pageNumber }) {
  const pool = arrangeStories(articles);
  const lead = pickImageLead(pool, pool);
  const rest = pool.filter((a) => a.id !== lead?.id);
  const title = language === "HINDI" ? PAGE_TITLES_HINDI[pageNumber] : PAGE_TITLES[pageNumber];
  const isHindi = language === "HINDI";
  const visualStory = rest.find((article) => hasImage(article.image_url)) || rest[0] || lead;
  const infographicStory = rest[4] || rest[2] || lead;
  const shortStories = rest.slice(10, 16);

  return (
    <div className="h-[1204px] overflow-hidden">
      <div className="mb-2 flex h-[44px] items-center justify-between bg-blue-950 px-4 text-white">
        <h2 className={`${isHindi ? hindiSerif.className : englishSerif.className} text-[26px] font-black leading-none text-white`}>{title}</h2>
        <p className={`${englishSans.className} text-[7.5px] font-black uppercase tracking-[0.16em] text-amber-200`}>THE ASPIRE NATION</p>
      </div>

      {lead && (
        <section className="grid h-[326px] grid-cols-[1.33fr_0.67fr] gap-3 overflow-hidden border-b-2 border-blue-950 pb-2">
          <div className="flex min-h-0 flex-col overflow-hidden">
            <Headline language={language} size="large">{lead.headline}</Headline>
            {lead.deck && (
              <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 border-l-4 border-red-800 pl-3 text-[9.5px] font-bold leading-[1.32] text-slate-700`}>
                {trimText(lead.deck, isHindi ? 250 : 290)}
              </p>
            )}
            <Body article={lead} language={language} limit={isHindi ? 1750 : 2050} columns={2} expanded className="mt-2 flex-1 overflow-hidden" />
            <ReadLink editionId={editionId} article={lead} language={language} className="mt-1 text-[7.5px]" />
          </div>
          <div className="grid min-h-0 grid-rows-[206px_1fr] gap-2 overflow-hidden">
            {hasImage(lead.image_url)
              ? <SmartImage article={lead} height={206} />
              : <VisualFallback article={lead} language={language} height={206} />}
            <div className="grid grid-cols-2 gap-2 overflow-hidden">
              <div className="rounded-lg bg-blue-50 p-2 shadow-sm">
                <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] font-black uppercase tracking-wide text-red-800`}>{isHindi ? "क्यों जरूरी" : "Why it matters"}</p>
                <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 text-[7.3px] leading-[1.28] text-slate-700`}>{trimText(lead.exam_connection || lead.fact_box || lead.deck || lead.body, isHindi ? 205 : 225)}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 shadow-sm">
                <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] font-black uppercase tracking-wide text-blue-950`}>{isHindi ? "एक नज़र में" : "At a glance"}</p>
                <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 text-[7.3px] leading-[1.28] text-slate-700`}>{trimText(lead.fact_box || lead.caption || lead.body, isHindi ? 205 : 225)}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid h-[406px] grid-cols-[1.08fr_0.92fr_0.92fr] gap-2.5 overflow-hidden py-2.5">
        {rest[0] && (
          <article className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 p-3 pb-8 shadow-sm">
            <Headline language={language} size="large">{rest[0].headline}</Headline>
            {hasImage(rest[0].image_url)
              ? <SmartImage article={rest[0]} height={112} className="mt-1.5" />
              : <VisualFallback article={rest[0]} language={language} height={112} className="mt-1.5" />}
            <Body article={rest[0]} language={language} limit={isHindi ? 850 : 980} expanded className="mt-1.5 flex-1 overflow-hidden" />
            <ReadLink editionId={editionId} article={rest[0]} language={language} className="absolute bottom-2 left-3 text-[7px]" />
          </article>
        )}

        <div className="grid h-full min-h-0 grid-rows-[1fr_1fr] gap-2 overflow-hidden">
          {rest.slice(1, 3).map((article, index) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white px-2.5 pb-7 pt-2 shadow-sm">
              <Headline language={language} size="medium">{article.headline}</Headline>
              {index === 0 && hasImage(article.image_url) && <SmartImage article={article} height={58} className="mt-1" />}
              <Body article={article} language={language} limit={isHindi ? 570 : 650} expanded className="mt-1 flex-1 overflow-hidden" />
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-2 left-2.5 text-[7px]" />
            </article>
          ))}
        </div>

        <div className="grid h-full min-h-0 grid-rows-[1fr_1fr_1fr] gap-2 overflow-hidden">
          {rest.slice(3, 6).map((article, index) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50/80 px-2.5 pb-6 pt-2 shadow-sm">
              <Headline language={language} size="small">{article.headline}</Headline>
              <Body article={article} language={language} limit={isHindi ? 390 : 430} expanded className="mt-1 flex-1 overflow-hidden" />
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2.5 text-[6.5px]" />
            </article>
          ))}
        </div>
      </section>

      <section className="grid h-[222px] grid-cols-[1.05fr_0.95fr_1fr] gap-2.5 overflow-hidden border-t-2 border-blue-950 pt-2.5">
        <article className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 p-2.5 pb-7 shadow-sm">
          <Headline language={language} size="medium">{rest[6]?.headline || visualStory?.headline}</Headline>
          {visualStory && (hasImage(visualStory.image_url)
            ? <SmartImage article={visualStory} height={78} className="mt-1" />
            : <VisualFallback article={visualStory} language={language} height={78} className="mt-1" />)}
          <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 flex-1 overflow-hidden text-[7px] leading-[1.3] text-slate-700`}>{trimText(composeDenseStoryText(rest[6] || visualStory, language), isHindi ? 300 : 340)}</p>
          <ReadLink editionId={editionId} article={rest[6] || visualStory} language={language} className="absolute bottom-1.5 left-2.5 text-[6.5px]" />
        </article>

        <EditorialBlock editionId={editionId} article={infographicStory} language={language} pageNumber={pageNumber} />

        <div className="grid min-h-0 grid-rows-2 gap-2 overflow-hidden">
          {rest.slice(7, 9).map((article) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-white px-2.5 pb-6 pt-2 shadow-sm">
              <Headline language={language} size="small">{article.headline}</Headline>
              <Body article={article} language={language} limit={isHindi ? 310 : 350} expanded className="mt-1 flex-1 overflow-hidden" />
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2.5 text-[6.5px]" />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 grid h-[154px] grid-cols-3 gap-2 overflow-hidden">
        {shortStories.slice(0, 3).map((article, index) => (
          <article key={article.id} className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 px-2.5 pb-6 pt-2 shadow-sm">
            <Headline language={language} size="small">{article.headline}</Headline>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 flex-1 overflow-hidden text-[6.8px] leading-[1.27] text-slate-700`}>{trimText(article.deck || article.body, isHindi ? 230 : 260)}</p>
            <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2.5 text-[6.5px]" />
          </article>
        ))}
      </section>

      <section className="mt-2 grid h-[42px] grid-cols-3 gap-2 overflow-hidden bg-blue-50 px-2 py-1">
        {shortStories.slice(3, 6).map((article) => (
          <div key={article.id} className={`${isHindi ? hindiSans.className : englishSerif.className} overflow-hidden text-[7.5px] font-black leading-[1.15] text-blue-950`}>
            {trimText(article.headline, isHindi ? 72 : 88)}
          </div>
        ))}
      </section>
    </div>
  );
}

function SchemePanel({ editionId, article, language }) {
  const isHindi = language === "HINDI";
  if (!article) return null;
  const facts = String(article.fact_box || "")
    .split(/\s+-\s+|(?<=[.!?।])\s+/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
  const body = trimStoryText(article.body || article.deck || "", isHindi ? 1150 : 1350, isHindi);
  return (
    <section className="grid h-[570px] grid-cols-[1.12fr_0.88fr] gap-3 overflow-hidden border-t-4 border-blue-950 bg-amber-50/40 pt-3">
      <article className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between border-b-2 border-red-800 pb-2">
          <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black uppercase tracking-[0.18em] text-red-800`}>
            {isHindi ? "आज की सरकारी योजना" : "Scheme of the Day"}
          </p>
          <span className={`${isHindi ? hindiSans.className : englishSans.className} rounded bg-blue-950 px-2 py-1 text-[7px] font-black text-white`}>
            {isHindi ? "केंद्र / राज्य" : "Centre / State"}
          </span>
        </div>
        <Headline language={language} size="large">{article.headline}</Headline>
        {article.deck && <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 border-l-4 border-red-800 pl-3 text-[9px] font-bold leading-[1.35] text-slate-700`}>{trimStoryText(article.deck, isHindi ? 260 : 300, isHindi)}</p>}
        <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-3 text-[8.3px] leading-[1.47] text-slate-900`}>{body}</p>
        <ReadLink editionId={editionId} article={{ ...article, editorial_role: "major" }} language={language} className="mt-auto text-[7px]" />
      </article>
      <aside className="grid min-h-0 grid-rows-[1fr_1fr_0.8fr] gap-2 overflow-hidden">
        <div className="rounded-lg bg-blue-950 p-3 text-white">
          <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black uppercase tracking-wide text-amber-200`}>{isHindi ? "मुख्य जानकारी" : "Exam Snapshot"}</p>
          <div className="mt-2 space-y-1.5">
            {(facts.length ? facts : [article.exam_connection, article.caption]).filter(Boolean).slice(0, 5).map((fact, index) => (
              <p key={index} className={`${isHindi ? hindiSans.className : englishSans.className} text-[7.2px] leading-[1.35] text-white/95`}>• {trimStoryText(fact, isHindi ? 130 : 155, isHindi)}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-hidden">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black text-emerald-900`}>{isHindi ? "लाभ / सकारात्मक पक्ष" : "Benefits"}</p>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-2 text-[7.2px] leading-[1.38] text-slate-700`}>{trimStoryText(article.why_it_matters || article.deck || article.body, isHindi ? 270 : 310, isHindi)}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black text-red-900`}>{isHindi ? "चिंताएं / चुनौतियां" : "Concerns"}</p>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-2 text-[7.2px] leading-[1.38] text-slate-700`}>{trimStoryText(article.exam_connection || article.fact_box || article.body, isHindi ? 270 : 310, isHindi)}</p>
          </div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3">
          <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[8px] font-black text-blue-950`}>{isHindi ? "आगे का रास्ता" : "Way Forward"}</p>
          <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 text-[7.3px] leading-[1.35] text-slate-700`}>{trimStoryText(article.caption || article.exam_connection || article.deck, isHindi ? 230 : 270, isHindi)}</p>
        </div>
      </aside>
    </section>
  );
}

function ExamDeskPage({ editionId, articles, language }) {
  const isHindi = language === "HINDI";
  const scheme = articles.find(isSchemeStory) || articles[0];
  const misc = articles.filter((item) => item?.id !== scheme?.id).slice(0, 6);
  return (
    <div className="h-[1204px] overflow-hidden">
      <div className="mb-2 flex h-[44px] items-center justify-between bg-blue-950 px-4 text-white">
        <h2 className={`${isHindi ? hindiSerif.className : englishSerif.className} text-[26px] font-black leading-none text-white`}>{isHindi ? "एग्ज़ाम डेस्क" : "Exam Desk"}</h2>
        <p className={`${englishSans.className} text-[7.5px] font-black uppercase tracking-[0.16em] text-amber-200`}>{isHindi ? "क्विक रिवीजन · सरकारी योजना" : "Quick revision · Government scheme"}</p>
      </div>
      <section className="grid h-[570px] grid-cols-3 grid-rows-2 gap-2.5 overflow-hidden pb-3">
        {misc.map((article, index) => (
          <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 p-3 shadow-sm">
            <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] font-black uppercase tracking-wide text-red-800`}>{["Facts in News","Reports & Indices","Appointments & Awards","Places & Organisations","Science & Environment","Economy & Data"][index] || (isHindi ? "क्विक रिवीजन" : "Quick Revision")}</p>
            <Headline language={language} size="small">{article.headline}</Headline>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 flex-1 overflow-hidden text-[7.4px] leading-[1.42] text-slate-700`}>{trimStoryText(article.body || article.deck || article.fact_box, isHindi ? 360 : 410, isHindi)}</p>
            <ReadLink editionId={editionId} article={article} language={language} className="mt-1 text-[6.5px]" />
          </article>
        ))}
      </section>
      <SchemePanel editionId={editionId} article={scheme} language={language} />
    </div>
  );
}

function EditorialPage({ editionId, articles, language }) {
  const pool = arrangeStories(articles);
  const lead = pool[0];
  const rest = pool.slice(1);
  const isHindi = language === "HINDI";
  const visualLead = rest.find((article) => hasImage(article.image_url)) || lead;
  return (
    <div className="h-[1204px] overflow-hidden">
      <div className="mb-2 flex h-[46px] items-center justify-between bg-blue-950 px-4 text-white">
        <div>
          <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7px] font-black uppercase tracking-[0.2em] text-amber-200`}>{isHindi ? "राय, विश्लेषण और संदर्भ" : "Opinion, Analysis & Context"}</p>
          <h2 className={`${isHindi ? hindiSerif.className : englishSerif.className} text-[24px] font-black leading-none text-white`}>{isHindi ? PAGE_TITLES_HINDI[8] : PAGE_TITLES[8]}</h2>
        </div>
        <p className={`${englishSans.className} text-[7px] font-black uppercase tracking-[0.15em] text-red-200`}>PAGE 8</p>
      </div>

      {lead && (
        <section className="grid h-[360px] grid-cols-[1.35fr_0.65fr] gap-3 overflow-hidden border-b-2 border-blue-950 pb-2">
          <div className="flex min-h-0 flex-col overflow-hidden">
            <Headline language={language} size="hero">{lead.headline}</Headline>
            {lead.deck && <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 border-l-4 border-red-800 pl-3 text-[10px] font-bold leading-[1.3] text-slate-700`}>{trimText(lead.deck, isHindi ? 280 : 320)}</p>}
            <Body article={lead} language={language} limit={isHindi ? 1900 : 2250} columns={3} expanded className="mt-2 flex-1 overflow-hidden first-letter:float-left first-letter:mr-2 first-letter:text-[38px] first-letter:font-black first-letter:leading-[0.8]" />
            <ReadLink editionId={editionId} article={lead} language={language} className="mt-1 text-[8px]" />
          </div>
          <div className="grid min-h-0 grid-rows-[205px_1fr] gap-2 overflow-hidden">
            {visualLead && (hasImage(visualLead.image_url)
              ? <SmartImage article={visualLead} height={205} />
              : <VisualFallback article={visualLead} language={language} height={205} />)}
            <div className="rounded-lg bg-amber-50 p-3 shadow-sm">
              <p className={`${isHindi ? hindiSans.className : englishSans.className} text-[7.5px] font-black uppercase tracking-wide text-red-800`}>{isHindi ? "मुख्य तर्क" : "Key Arguments"}</p>
              <p className={`${isHindi ? hindiSerif.className : englishSerif.className} mt-1 text-[12px] font-bold italic leading-[1.2] text-blue-950`}>“{trimText(lead.fact_box || lead.exam_connection || lead.deck || lead.body, isHindi ? 320 : 350)}”</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid h-[420px] grid-cols-3 gap-2.5 overflow-hidden py-2.5">
        {rest.slice(0, 6).map((article, index) => (
          <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 p-3 pb-7 shadow-sm">
            <Headline language={language} size={index < 3 ? "medium" : "small"}>{article.headline}</Headline>
            {index < 3 && (hasImage(article.image_url)
              ? <SmartImage article={article} height={70} className="mt-1" />
              : index === 1 ? <VisualFallback article={article} language={language} height={70} className="mt-1" /> : null)}
            <Body article={article} language={language} limit={isHindi ? 560 : 650} expanded className="mt-1 flex-1 overflow-hidden" />
            <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-3 text-[6.8px]" />
          </article>
        ))}
      </section>

      <section className="grid h-[220px] grid-cols-[1fr_0.9fr_1fr] gap-2.5 overflow-hidden border-t-2 border-blue-950 pt-2.5">
        {rest[6] && (
          <article className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-blue-50 p-3 pb-7 shadow-sm">
            <Headline language={language} size="medium">{rest[6].headline}</Headline>
            <Body article={rest[6]} language={language} limit={isHindi ? 650 : 720} expanded className="mt-1 flex-1 overflow-hidden" />
            <ReadLink editionId={editionId} article={rest[6]} language={language} className="absolute bottom-1.5 left-3 text-[6.8px]" />
          </article>
        )}
        <EditorialBlock editionId={editionId} article={rest[7] || lead} language={language} pageNumber={8} />
        <div className="grid min-h-0 grid-rows-2 gap-2 overflow-hidden">
          {rest.slice(8, 10).map((article) => (
            <article key={article.id} className="relative flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-50 px-2.5 pb-6 pt-2 shadow-sm">
              <Headline language={language} size="small">{article.headline}</Headline>
              <Body article={article} language={language} limit={isHindi ? 360 : 420} expanded className="mt-1 flex-1 overflow-hidden" />
              <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2.5 text-[6.5px]" />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 grid h-[115px] grid-cols-4 gap-2 overflow-hidden">
        {rest.slice(10, 14).map((article) => (
          <article key={article.id} className="relative flex h-full flex-col overflow-hidden rounded-lg bg-slate-50 px-2.5 pb-6 pt-2 shadow-sm">
            <Headline language={language} size="small">{article.headline}</Headline>
            <p className={`${isHindi ? hindiSans.className : englishSans.className} mt-1 flex-1 overflow-hidden text-[6.7px] leading-[1.25] text-slate-700`}>{trimText(article.deck || article.body, isHindi ? 180 : 210)}</p>
            <ReadLink editionId={editionId} article={article} language={language} className="absolute bottom-1.5 left-2.5 text-[6.4px]" />
          </article>
        ))}
      </section>
    </div>
  );
}

const PAGE_QUOTES = [
  {
    initials: "APJ",
    name: "Dr. A. P. J. Abdul Kalam",
    nameHi: "डॉ. ए. पी. जे. अब्दुल कलाम",
    quote: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.",
    quoteHi: "सपने देखिए। सपने विचार बनते हैं और विचार काम में बदलते हैं।",
  },
  {
    initials: "SV",
    name: "Swami Vivekananda",
    nameHi: "स्वामी विवेकानंद",
    quote: "Arise, awake and stop not till the goal is reached.",
    quoteHi: "उठो, जागो और लक्ष्य हासिल होने तक मत रुको।",
  },
  {
    initials: "BRA",
    name: "Dr. B. R. Ambedkar",
    nameHi: "डॉ. बी. आर. आंबेडकर",
    quote: "Cultivation of mind should be the ultimate aim of human existence.",
    quoteHi: "दिमाग को विकसित करना इंसान का सबसे बड़ा लक्ष्य होना चाहिए।",
  },
  {
    initials: "NM",
    name: "Nelson Mandela",
    nameHi: "नेल्सन मंडेला",
    quote: "It always seems impossible until it is done.",
    quoteHi: "जब तक काम पूरा नहीं होता, वह अक्सर नामुमकिन लगता है।",
  },
  {
    initials: "AE",
    name: "Albert Einstein",
    nameHi: "अल्बर्ट आइंस्टीन",
    quote: "In the middle of difficulty lies opportunity.",
    quoteHi: "मुश्किल के बीच ही नया मौका छिपा होता है।",
  },
  {
    initials: "RT",
    name: "Rabindranath Tagore",
    nameHi: "रवींद्रनाथ टैगोर",
    quote: "You cannot cross the sea merely by standing and staring at the water.",
    quoteHi: "सिर्फ किनारे खड़े होकर देखने से समंदर पार नहीं होता।",
  },
  {
    initials: "MG",
    name: "Mahatma Gandhi",
    nameHi: "महात्मा गांधी",
    quote: "The future depends on what you do today.",
    quoteHi: "आपका भविष्य इस बात पर निर्भर है कि आप आज क्या करते हैं।",
  },
  {
    initials: "SP",
    name: "Sardar Vallabhbhai Patel",
    nameHi: "सरदार वल्लभभाई पटेल",
    quote: "Every citizen of India must remember that he is an Indian and he has every right in this country but with certain duties.",
    quoteHi: "हर नागरिक को अपने अधिकारों के साथ अपनी जिम्मेदारियां भी याद रखनी चाहिए।",
  },
];

function EducationalFooter({ language, pageNumber = 1 }) {
  const isHindi = language === "HINDI";
  const item = PAGE_QUOTES[(Math.max(1, Number(pageNumber)) - 1) % PAGE_QUOTES.length];

  return (
    <footer
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 8,
        height: 104,
        overflow: "hidden",
        borderRadius: 12,
        background: "linear-gradient(90deg, #172554 0%, #111827 55%, #7f1d1d 100%)",
        color: "white",
        boxShadow: "0 4px 12px rgba(15,23,42,0.18)",
        zIndex: 5,
      }}
    >
      <div
        style={{
          height: 78,
          display: "grid",
          gridTemplateColumns: "64px minmax(0,1fr) 58px",
          alignItems: "center",
          columnGap: 14,
          padding: "10px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QuotePortraitIcon initials={item.initials} />
        </div>

        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <p
            className={isHindi ? hindiSans.className : englishSerif.className}
            style={{
              margin: 0,
              fontSize: isHindi ? 13.5 : 13.5,
              lineHeight: isHindi ? 1.42 : 1.32,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#ffffff",
              whiteSpace: "normal",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            “{isHindi ? item.quoteHi : item.quote}”
          </p>
          <p
            className={isHindi ? hindiSans.className : englishSans.className}
            style={{
              margin: "5px 0 0",
              fontSize: 8.5,
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: isHindi ? 0 : "0.08em",
              textTransform: isHindi ? "none" : "uppercase",
              color: "#fde68a",
            }}
          >
            — {isHindi ? item.nameHi : item.name}
          </p>
        </div>

        <div
          className={englishSans.className}
          style={{
            justifySelf: "end",
            borderRadius: 6,
            background: "rgba(255,255,255,0.12)",
            padding: "7px 8px",
            fontSize: 8,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          Page {pageNumber}
        </div>
      </div>

      <div
        className={isHindi ? hindiSans.className : englishSans.className}
        style={{
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 14px",
          boxSizing: "border-box",
          background: "#ffffff",
          color: "#64748b",
          textAlign: "center",
          fontSize: 6.4,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {isHindi
          ? "* यह करंट अफेयर्स स्टडी मटेरियल एग्ज़ाम की तैयारी के लिए अखबार जैसी लेआउट में तैयार किया गया है। यह रजिस्टर्ड अखबार नहीं है। जरूरी फैक्ट्स को ऑफिशियल सोर्स से जरूर चेक करें।"
          : "* THE ASPIRE NATION is an educational current-affairs study compilation in a newspaper-style layout for examination preparation. It is not a registered newspaper or news periodical. Verify important facts through cited official sources."}
      </div>
    </footer>
  );
}



export default function NewspaperRenderer({ edition, articles = [], currentPage = 1, mode = "admin" }) {
  const preparedArticles = (articles || []).map((article) => ({ ...article, __readerMode: mode }));
    const storyList = buildPagePlan(
    arrangeStories(preparedArticles.filter((article) => Number(article.page) === currentPage)),
    currentPage
  );
  const isHindi = String(edition?.language || "ENGLISH").toUpperCase() === "HINDI";

  return (
    <article className={`newspaper-page newspaper-print-root relative mx-auto h-[1536px] w-[1024px] overflow-hidden bg-white px-4 py-3 text-slate-950 shadow-2xl ${isHindi ? hindiSerif.className : englishSerif.className}`}>
      <Masthead edition={edition} currentPage={currentPage} leadHeadline={storyList[0]?.headline} />
      <div className="mt-3 h-[1208px] overflow-hidden">
        {currentPage === 1 ? (
          <FrontPage editionId={edition.id} pageArticles={storyList} allArticles={storyList} language={edition.language} />
        ) : currentPage === 8 ? (
          <EditorialPage
            editionId={edition.id}
            articles={storyList}
            language={edition.language}
          />
        ) : currentPage === 7 ? (
          <ExamDeskPage editionId={edition.id} articles={storyList} language={edition.language} />
        ) : (
          <StandardPage
            editionId={edition.id}
            articles={storyList}
            language={edition.language}
            pageNumber={currentPage}
          />
        )}
      </div>
      <EducationalFooter language={edition.language} pageNumber={currentPage} />
    </article>
  );
}
