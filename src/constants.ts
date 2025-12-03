import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Naandalist",
  URL: "https://naandalist.com",
  EMAIL: "dev@naandalist.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Naandalist – Frontend Engineer",
  DESCRIPTION:
    "Listiananda Apriliawan is a frontend engineer in Indonesia building Android and iOS apps with React Native and TypeScript.",
};

export const POSTS: Metadata = {
  TITLE: "Posts",
  DESCRIPTION:
    "Articles written by Naandalist on React Native, mobile, and related topics.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION:
    "Professional experience, roles, and impact from Naandalist’s past and current work.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "Selected projects by Naandalist, with links to code and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "linkedin",
    ICON: "/icons/linkedin.svg",
    HREF: "https://www.linkedin.com/in/naandalist",
  },
  {
    NAME: "telegram",
    ICON: "/icons/telegram.svg",
    HREF: "https://t.me/naandalist",
  },
  {
    NAME: "gmail",
    ICON: "/icons/gmail.svg",
    HREF: "mailto:listiananda.apriliawan@gmail.com",
  },
  {
    NAME: "facebook",
    ICON: "/icons/facebook.svg",
    HREF: "https://www.facebook.com/naandalist/",
  },
  {
    NAME: "twitter",
    ICON: "/icons/twitter.svg",
    HREF: "https://x.com/nawndalist",
  },
  {
    NAME: "medium",
    ICON: "/icons/medium.svg",
    HREF: "https://medium.com/@naandalist",
  },
  {
    NAME: "github",
    ICON: "/icons/github.svg",
    HREF: "https://github.com/naandalist",
  },
  {
    NAME: "gitlab",
    ICON: "/icons/gitlab.svg",
    HREF: "https://gitlab.com/Naandalist",
  },
  {
    NAME: "stackoverflow",
    ICON: "/icons/stackoverflow.svg",
    HREF: "https://stackoverflow.com/users/13633973/naandalist",
  },
];
