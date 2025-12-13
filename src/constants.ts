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
    "Frontend Engineer from Indonesia building Android and iOS applications with React Native. Explore projects, technical writings, and professional experience.",
};

export const POSTS: Metadata = {
  TITLE: "Posts",
  DESCRIPTION:
    "Technical articles and insights on React Native, mobile app development, best practices, security, and modern development patterns.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION:
    "Professional experience, roles, and impact from Naandalist’s past and current work.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "Portfolio of web and mobile projects built with React Native, Laravel, WordPress, and modern technologies. Includes source code and live demonstrations.",
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
