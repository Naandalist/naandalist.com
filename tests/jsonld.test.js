import { describe, expect, test } from "bun:test";

import {
  createBlogPostingSchema,
  createCreativeWorkSchema,
  createSoftwareApplicationSchema,
} from "../src/lib/jsonld";

function createPostFixture(slug, lang, date = new Date("2025-01-01T00:00:00.000Z")) {
  return {
    slug,
    body: "Post body",
    data: {
      title: "Test Post",
      subtitle: "Test Subtitle",
      description: "Test Description",
      date,
      lang,
      keywords: ["test"],
    },
  };
}

function createProjectFixture({ slug, lang, price, liveURL }) {
  return {
    slug,
    data: {
      title: "Test Project",
      description: "Project description",
      date: new Date("2025-01-01T00:00:00.000Z"),
      lang,
      price,
      category: "Utilities",
      platforms: ["Android", "iOS"],
      liveURL,
      imageUrl: undefined,
    },
  };
}

describe("jsonld helpers", () => {
  test("normalizes blog slug and keeps canonical URL style", () => {
    const schema = createBlogPostingSchema(
      createPostFixture("integrate-github-with-jira/index.id", "id"),
    );
    const pageId = schema.mainEntityOfPage["@id"];

    expect(pageId).toBe("https://naandalist.com/id/posts/integrate-github-with-jira/");
    expect(() => new URL(pageId)).not.toThrow();
  });

  test("normalizes project slug from indexid suffix", () => {
    const schema = createCreativeWorkSchema(
      createProjectFixture({
        slug: "mobile-app-airpaz/indexid",
        lang: "en",
      }),
    );

    expect(schema.url).toBe("https://naandalist.com/projects/mobile-app-airpaz/");
  });

  test("maps Free/Gratis to numeric SoftwareApplication price", () => {
    const freeSchema = createSoftwareApplicationSchema(
      createProjectFixture({
        slug: "my-app",
        lang: "en",
        price: "Free",
      }),
    );
    const gratisSchema = createSoftwareApplicationSchema(
      createProjectFixture({
        slug: "my-app-id",
        lang: "id",
        price: "Gratis",
      }),
    );

    expect(freeSchema.offers.price).toBe("0");
    expect(gratisSchema.offers.price).toBe("0");
  });

  test("omits offers for invalid software price", () => {
    const schema = createSoftwareApplicationSchema(
      createProjectFixture({
        slug: "my-app-invalid",
        lang: "en",
        price: "not-a-number",
      }),
    );

    expect("offers" in schema).toBe(false);
  });
});
