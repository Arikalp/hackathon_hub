import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hackathon Hub",
    short_name: "HackathonHub",
    description:
      "Your team's home for every hackathon. Track deadlines, bring your builders together, and turn every sprint into your next big achievement.",
    start_url: "/",
    display: "standalone",
    background_color: "#131316",
    theme_color: "#a078ff",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["productivity", "developer tools", "collaboration"],
  };
}
