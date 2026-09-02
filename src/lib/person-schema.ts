export function createPersonSchema({
  siteUrl,
  image,
}: {
  siteUrl: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Listiananda Apriliawan",
    alternateName: "Naandalist",
    url: siteUrl,
    image,
    jobTitle: "Frontend Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Dicoding Indonesia",
    },
    sameAs: [
      "https://github.com/Naandalist",
      "https://www.linkedin.com/in/naandalist",
      "https://x.com/nawndalist",
    ],
    knowsAbout: [
      "React Native",
      "TypeScript",
      "JavaScript",
      "Bun",
      "Node.js",
      "Web Development",
      "Mobile Development",
      "Frontend Development",
      "Coding",
      "Personal Portfolio",
    ],
  };
}
