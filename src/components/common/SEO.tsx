import React, { useEffect } from "react";
import { siteConfig } from "@/src/config/site";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  schema?: Record<string, any>;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  type = "website",
  schema,
  noIndex = false,
}) => {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title
      ? `${title} | ${siteConfig.brand.name}`
      : `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`;
    document.title = formattedTitle;

    // 2. Meta description
    const metaDesc = description || siteConfig.brand.description;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", metaDesc);

    // 3. Robots meta (noindex for admin/account pages)
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement("meta");
        robotsTag.setAttribute("name", "robots");
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute("content", "noindex, nofollow");
    } else if (robotsTag) {
      robotsTag.remove();
    }

    // 4. OpenGraph Tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setOgTag("og:title", formattedTitle);
    setOgTag("og:description", metaDesc);
    setOgTag("og:type", type);
    if (url || typeof window !== "undefined") {
      setOgTag("og:url", url || window.location.href);
    }
    if (image) {
      setOgTag("og:image", image);
    }

    // 5. Schema.org JSON-LD structured data
    let scriptTag = document.getElementById("structured-data-jsonld") as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "structured-data-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup custom JSON-LD on unmount
      const existingScript = document.getElementById("structured-data-jsonld");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, image, url, type, schema, noIndex]);

  return null;
};
