import { getCollection, type CollectionKey } from "astro:content";

import { normalizeSlug } from "./utils";

type ContentLang = "en" | "id";

export async function getLocalizedStaticPaths(
  collection: CollectionKey,
  lang: ContentLang,
) {
  const entries = (await getCollection(collection)).filter((entry) => {
    const data = entry.data as {
      draft?: boolean;
      lang?: ContentLang;
    };

    return !data.draft && data.lang === lang;
  });

  entries.sort((a, b) => {
    const aData = a.data as { date?: Date; dateStart?: Date };
    const bData = b.data as { date?: Date; dateStart?: Date };
    const aDate = aData.date ?? aData.dateStart ?? new Date(0);
    const bDate = bData.date ?? bData.dateStart ?? new Date(0);

    return bDate.valueOf() - aDate.valueOf();
  });

  return entries.map((entry) => ({
    params: { slug: normalizeSlug(entry.id) },
    props: entry,
  }));
}
