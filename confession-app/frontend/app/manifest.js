export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "Confessly",
    short_name: "Confessly",
    description: "Anonymous confessions with fast mobile-first discovery.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe3",
    theme_color: "#c96442",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png"
      }
    ]
  };
}
