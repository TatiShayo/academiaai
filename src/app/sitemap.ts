import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://academiaai.com";

  // Static routes
  const routes = ["", "/blog", "/login", "/signup", "/tools/humanizer", "/tools/enhancer", "/tools/plagiarism", "/tools/citations"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  // Dynamic blog routes
  const postsDirectory = path.join(process.cwd(), "src/app/blog/posts");
  let blogRoutes: any[] = [];
  
  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory);
    blogRoutes = filenames.map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      return {
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });
  }

  return [...routes, ...blogRoutes];
}
