import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Naandalist",
  EMAIL: "listiananda.apriliawan@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Naandalist is frontend developer.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics naandalist passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where naandalist have worked and what naandalist have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of naandalist projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "twitter-x",
    HREF: "https://x.com/nawndalist",
  },
  { 
    NAME: "github",
    HREF: "https://github.com/naandalist",
  },
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/naandalist",
  }
];
