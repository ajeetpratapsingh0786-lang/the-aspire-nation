export default function sitemap() {
  const baseUrl = "https://theaspirenation.com";
  const currentDate = new Date();

  const pages = [
    {
      path: "",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      path: "/epaper",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/current-affairs",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/editorial",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      path: "/jobs",
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      path: "/results",
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      path: "/about",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/contact",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/subscribe",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/search",
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      path: "/login",
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      path: "/register",
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}