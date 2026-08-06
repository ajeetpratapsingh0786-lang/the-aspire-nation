function text(value) {
  return String(value || "").trim();
}

function words(value) {
  const clean = text(value);
  return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
}

function normalizedHeadline(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildEditionQualityReport(edition, rawArticles = []) {
  const articles = (rawArticles || []).filter((item) => item?.is_deleted !== true);
  const pageCounts = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i + 1, 0]));
  const critical = [];
  const warnings = [];
  const info = [];
  const seen = new Map();

  for (const article of articles) {
    const page = Number(article?.page || 0);
    if (pageCounts[page] !== undefined) pageCounts[page] += 1;

    const headline = text(article?.headline);
    const body = text(article?.body || article?.content || article?.article_body);
    const sourceUrl = text(article?.source_url);
    const imageUrl = text(article?.image_url);
    const wordCount = words(body);
    const combinedText = `${headline} ${body} ${article?.deck || ""} ${article?.caption || ""}`.toLowerCase();

    if (/ai editorial visual|use create ai images|generate the final visual|placeholder/.test(combinedText)) {
      critical.push(`Page ${page || "?"}: “${headline || "Untitled story"}” contains an internal production placeholder.`);
    }

    if (!headline) critical.push(`Page ${page || "?"}: a story has no headline.`);
    if (!body) critical.push(`Page ${page || "?"}: “${headline || "Untitled story"}” has no article body.`);
    if (!sourceUrl) warnings.push(`Page ${page || "?"}: “${headline || "Untitled story"}” has no source URL.`);
    if (!imageUrl && Number(article?.rank || 99) <= 3) {
      warnings.push(`Page ${page || "?"}: major story “${headline || "Untitled story"}” has no image.`);
    }
    if (wordCount > 750) warnings.push(`Page ${page || "?"}: “${headline}” is long (${wordCount} words).`);
    if (wordCount > 0 && wordCount < 55 && Number(article?.rank || 99) <= 3) {
      warnings.push(`Page ${page || "?"}: major story “${headline}” is very short (${wordCount} words).`);
    }

    const key = normalizedHeadline(headline);
    if (key) {
      if (seen.has(key)) {
        warnings.push(`Possible duplicate headline: “${headline}” (Pages ${seen.get(key)} and ${page || "?"}).`);
      } else {
        seen.set(key, page || "?");
      }
    }
  }

  const missingPages = Object.entries(pageCounts)
    .filter(([, count]) => count === 0)
    .map(([page]) => Number(page));

  if (missingPages.length) critical.push(`Missing content on Page(s): ${missingPages.join(", ")}.`);

  for (const [page, count] of Object.entries(pageCounts)) {
    if (count > 0 && count < (Number(page) === 8 ? 5 : 6)) warnings.push(`Page ${page} has only ${count} active stories.`);
    if (count > (Number(page) === 1 ? 14 : 10)) warnings.push(`Page ${page} has ${count} stories and may look overcrowded.`);
  }


  const pageSeven = articles.filter((item) => Number(item?.page) === 7);
  const hasScheme = pageSeven.some((item) => /\bscheme\b|\bmission\b|\byojana\b|programme|beneficiar|welfare|योजना|मिशन|लाभार्थी|कल्याण/i.test(`${item?.headline || ""} ${item?.body || ""} ${item?.section || ""}`));
  if (!hasScheme) warnings.push("Page 7 does not contain a clear Scheme of the Day unit.");

  const language = text(edition?.language).toUpperCase();
  if (!language) warnings.push("Edition language is not set.");
  if (!text(edition?.publication_date || edition?.edition_date)) warnings.push("Edition date is not set.");

  const imageCount = articles.filter((item) => text(item?.image_url)).length;
  const sourceCount = articles.filter((item) => text(item?.source_url)).length;
  const totalWords = articles.reduce((sum, item) => sum + words(item?.body || item?.content || item?.article_body), 0);

  info.push(`${articles.length} active stories across 8 pages.`);
  info.push(`${imageCount} stories have images.`);
  info.push(`${sourceCount} stories have source links.`);
  info.push(`${totalWords.toLocaleString("en-IN")} total article words.`);

  const score = Math.max(0, Math.min(100, 100 - critical.length * 25 - Math.min(30, warnings.length * 2)));

  return {
    ready: critical.length === 0,
    score,
    critical,
    warnings,
    info,
    pageCounts,
    totals: {
      articles: articles.length,
      images: imageCount,
      sources: sourceCount,
      words: totalWords,
    },
  };
}
