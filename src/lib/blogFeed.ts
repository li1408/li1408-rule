import type { CollectionEntry } from "astro:content";

export const MATH_MODELING_WORKFLOW_SERIES = "math-modeling-workflow";

export type BlogPost = CollectionEntry<"blog">;

export type BlogFeedItem =
  | { kind: "post"; post: BlogPost; publishedAt: number }
  | { kind: "workflow-collection"; posts: BlogPost[]; publishedAt: number };

export function getWorkflowPosts(posts: BlogPost[]) {
  return posts
    .filter((post) => post.data.series === MATH_MODELING_WORKFLOW_SERIES)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
}

export function createBlogFeed(posts: BlogPost[]): BlogFeedItem[] {
  const workflowPosts = getWorkflowPosts(posts);
  const standaloneItems: BlogFeedItem[] = posts
    .filter((post) => post.data.series !== MATH_MODELING_WORKFLOW_SERIES)
    .map((post) => ({
      kind: "post",
      post,
      publishedAt: post.data.pubDate.valueOf(),
    }));

  if (workflowPosts.length > 0) {
    standaloneItems.push({
      kind: "workflow-collection",
      posts: workflowPosts,
      publishedAt: workflowPosts.at(-1)!.data.pubDate.valueOf(),
    });
  }

  return standaloneItems.sort((a, b) => b.publishedAt - a.publishedAt);
}
