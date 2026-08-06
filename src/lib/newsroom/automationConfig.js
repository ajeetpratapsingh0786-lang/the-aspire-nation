export const PAGE_PLAN = {
  1: { title: "Front Page", count: 12 },
  2: { title: "National & Governance", count: 8 },
  3: { title: "International Affairs", count: 7 },
  4: { title: "Economy, Banking, Agriculture & Infrastructure", count: 8 },
  5: { title: "Polity, Judiciary, Science & Technology", count: 8 },
  6: { title: "Environment, Defence & Disaster Management", count: 7 },
  7: { title: "Exam Desk & Scheme of the Day", count: 7 },
  8: { title: "Editorial & Analysis", count: 6 },
};

export const TOTAL_STORIES = Object.values(PAGE_PLAN).reduce((sum, page) => sum + page.count, 0);
export const IMAGE_TARGET = Math.max(6, Math.min(Number(process.env.NEWSROOM_DAILY_IMAGE_COUNT || 24), 32));
export const AUTO_PUBLISH = String(process.env.NEWSROOM_AUTO_PUBLISH || "true").toLowerCase() !== "false";

export function indiaDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = formatter.format(now);
  const [year, month, day] = today.split("-").map(Number);
  const publication = new Date(Date.UTC(year, month - 1, day));
  const news = new Date(publication);
  news.setUTCDate(news.getUTCDate() - 1);
  return {
    publicationDate: publication.toISOString().slice(0, 10),
    newsDate: news.toISOString().slice(0, 10),
  };
}

export function slotFor(page, index, editorialRole = "") {
  const role = String(editorialRole || "").toLowerCase();
  if (page === 1) {
    if (index === 0 || role === "lead") return "hero";
    if (role === "major") return `major${Math.min(index, 2) || 1}`;
    if (role === "brief") return `brief${Math.max(1, index - 6)}`;
    return ["hero", "major1", "major2", "secondary1", "secondary2", "medium1", "medium2", "brief1", "brief2", "brief3"][index] || `item${index + 1}`;
  }
  if (index === 0 || role === "lead") return "lead";
  if (role === "major") return `secondary${Math.min(index, 2) || 1}`;
  if (role === "brief") return `brief${Math.max(1, index - 4)}`;
  return ["lead", "secondary1", "secondary2", "medium1", "medium2", "brief1", "brief2", "brief3"][index] || `item${index + 1}`;
}
