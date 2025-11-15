import { getCollection } from "astro:content";

import rss from "@astrojs/rss";

import { HOME } from "@constants";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const posts = (await getCollection("posts")).filter(
    (post) => !post.data.draft
  );
  const projects = (await getCollection("projects")).filter(
    (project) => !project.data.draft
  );

  const items = [...posts, ...projects].sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );

  return rss({
    title: HOME.TITLE,
    description: HOME.DESCRIPTION,
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      link: `/${item.collection}/${item.slug}/`,
    })),
  });
}
