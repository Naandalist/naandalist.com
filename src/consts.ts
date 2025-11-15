import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Naandalist",
  EMAIL: "dev@naandalist.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "",
  DESCRIPTION:
    "Naandalist is a frontend developer based in Indonesia, specializing in React Native, JavaScript, and TypeScript. He has expertise in developing mobile and web solutions, with a focus on creating innovative user experiences.",
};

export const POSTS: Metadata = {
  TITLE: "Posts",
  DESCRIPTION:
    "A collection of articles on topics naandalist passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where naandalist have worked and what naandalist have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of naandalist projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "linkedin",
    ICON: "/icons/linkedin.svg",
    HREF: "https://www.linkedin.com/in/naandalist",
  },
  {
    NAME: "github",
    ICON: "/icons/github.svg",
    HREF: "https://github.com/naandalist",
  },
  {
    NAME: "telegram",
    ICON: "/icons/telegram.svg",
    HREF: "https://t.me/naandalist",
  },
  {
    NAME: "discord",
    ICON: "/icons/discord.svg",
    HREF: "https://discord.com/users/Naandalist#7977",
  },
];
