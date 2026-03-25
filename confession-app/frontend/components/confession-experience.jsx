"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addComment,
  addPost,
  getActivity,
  getFeed,
  getSettings,
  reactToPost,
  reportPost,
  searchPosts,
  updateSettings,
  voteComment,
  votePost
} from "@/lib/api";
import { applyUiSettings } from "@/lib/customization";
import {
  getBookmarks,
  getDeviceId,
  getMyPosts,
  getUiSettings,
  saveMyPost,
  toggleBookmark
} from "@/lib/storage";
import {
  CATEGORY_OPTIONS,
  EMOTION_REACTIONS,
  QUOTES,
  TRENDING_TOPICS,
  classifyConfession,
  formatCompactNumber,
  getScore,
  getTopTags,
  shouldBlur
} from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/hearts", label: "Hearts" }
];

const REACTION_OPTIONS = [
  { label: "Quiet", value: "deep" },
  { label: "Unfiltered", value: "secret" },
  { label: "Chaotic", value: "funny" }
];

export function ConfessionExperience({ mode }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [settings, setSettings] = useState({ theme: "system", revealEnabled: true });
  const [uiSettings, setUiSettings] = useState(getUiSettings());
  const [postVotes, setPostVotes] = useState({});
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(mode === "home" ? "" : "trending");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [activePostId, setActivePostId] = useState("");
  const [commentSort, setCommentSort] = useState("top");
  const [searchInput, setSearchInput] = useState("");
  const [navHidden, setNavHidden] = useState(false);
  const deferredSearch = useDeferredValue(searchInput);
  const [isPending, startTransition] = useTransition();
  const lastScrollRef = useRef(0);

  const activePost = useMemo(
    () => posts.find((post) => post._id === activePostId) || null,
    [activePostId, posts]
  );

  const sortedComments = useMemo(() => {
    if (!activePost?.comments) {
      return [];
    }

    const clone = [...activePost.comments];
    if (commentSort === "newest") {
      return clone.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return clone.sort(
      (a, b) => (b.likes || 0) - (b.dislikes || 0) - ((a.likes || 0) - (a.dislikes || 0))
    );
  }, [activePost, commentSort]);

  const metrics = useMemo(() => {
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    const totalReactions = posts.reduce(
      (sum, post) => sum + (post.likes || 0) + (post.dislikes || 0),
      0
    );

    return {
      confessions: posts.length,
      replies: totalComments,
      pulse: totalReactions
    };
  }, [posts]);

  const topTags = useMemo(() => getTopTags(posts), [posts]);
  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarks.includes(post._id)),
    [bookmarks, posts]
  );

  const visiblePosts = useMemo(() => {
    if (mode === "home") {
      return posts;
    }

    return [...posts].sort((a, b) => getScore(b) - getScore(a));
  }, [mode, posts]);

  function resolveTheme(theme) {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return theme;
  }

  function applyTheme(theme) {
    if (typeof document === "undefined") {
      return;
    }

    const resolvedTheme = resolveTheme(theme);
    document.documentElement.dataset.theme = resolvedTheme;
    applyUiSettings(uiSettings, resolvedTheme);
  }

  useEffect(() => {
    const nextDeviceId = getDeviceId();
    const nextUi = getUiSettings();
    setDeviceId(nextDeviceId);
    setBookmarks(getBookmarks());
    setUiSettings(nextUi);

    getSettings(nextDeviceId)
      .then((data) => {
        setSettings(data);
        document.documentElement.dataset.theme = resolveTheme(data.theme);
        applyUiSettings(nextUi, resolveTheme(data.theme));
      })
      .catch(() => {
        document.documentElement.dataset.theme = resolveTheme("system");
        applyUiSettings(nextUi, resolveTheme("system"));
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleScroll() {
      const current = window.scrollY;
      const previous = lastScrollRef.current;
      if (current > previous && current > 96) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollRef.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % QUOTES.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    applyUiSettings(uiSettings, resolveTheme(settings.theme));
  }, [settings.theme, uiSettings]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    setError("");

    if (mode === "explore" && deferredSearch.trim()) {
      setLoading(true);
      searchPosts(deferredSearch)
        .then((data) => {
          setPosts(data);
          setIsEnd(true);
        })
        .catch(() => {
          setError("Search is unavailable right now.");
          setPosts([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    if (mode === "hearts") {
      const myPosts = getMyPosts();

      if (!myPosts.length) {
        setPosts([]);
        setLoading(false);
        setIsEnd(true);
        return;
      }

      setLoading(true);
      getActivity(myPosts)
        .then((data) => {
          setPosts(data);
          setIsEnd(true);
        })
        .catch(() => {
          setError("We couldn't load your activity.");
          setPosts([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    setLoading(true);
    getFeed({ category: selectedCategory, page, limit: 10 })
      .then((data) => {
        setPosts((current) => (page === 1 ? data : [...current, ...data]));
        setIsEnd(data.length < 10 || selectedCategory === "trending");
      })
      .catch(() => {
        setError("The feed is having a quiet moment. Try again shortly.");
        if (page === 1) {
          setPosts([]);
        }
      })
      .finally(() => setLoading(false));
  }, [deferredSearch, deviceId, mode, page, selectedCategory]);

  const heroText =
    mode === "explore"
      ? "Search the confessions people cannot say out loud."
      : mode === "hearts"
        ? "Track the confessions you posted and how people responded."
        : "A fast, anonymous social feed for thoughts that need room to breathe.";

  async function persistSettings(nextSettings) {
    setSettings(nextSettings);
    applyTheme(nextSettings.theme);

    if (!deviceId) {
      return;
    }

    try {
      await updateSettings(deviceId, nextSettings);
    } catch {
      setError("Your preferences changed locally, but syncing failed.");
    }
  }

  async function handleVote(postId, voteType) {
    if (!deviceId) {
      return;
    }

    const previousVote = postVotes[postId];
    if (previousVote === voteType) {
      return;
    }

    setPostVotes((current) => ({ ...current, [postId]: voteType }));
    setPosts((current) =>
      current.map((post) => applyOptimisticVote(post, postId, previousVote, voteType))
    );

    try {
      await votePost(postId, voteType, deviceId);
    } catch {
      setPostVotes((current) => ({ ...current, [postId]: previousVote }));
      setPosts((current) =>
        current.map((post) => applyOptimisticVote(post, postId, voteType, previousVote))
      );
      setError("Vote failed. Please try again.");
    }
  }

  async function handleCommentVote(commentId, isLike) {
    if (!deviceId || !activePostId) {
      return;
    }

    try {
      const updatedPost = await voteComment(activePostId, commentId, isLike, deviceId);
      setPosts((current) =>
        current.map((post) => (post._id === activePostId ? updatedPost : post))
      );
    } catch {
      setError("Comment vote failed.");
    }
  }

  async function submitComment() {
    if (!commentDraft.trim() || !activePostId) {
      return;
    }

    try {
      const updatedPost = await addComment(activePostId, commentDraft.trim());
      setPosts((current) =>
        current.map((post) => (post._id === activePostId ? updatedPost : post))
      );
      setCommentDraft("");
    } catch (submissionError) {
      setError(submissionError.message || "Comment failed.");
    }
  }

  async function submitConfession() {
    if (composeText.trim().length < 8) {
      return;
    }

    const payload = {
      text: composeText.trim(),
      type: classifyConfession(composeText),
      blurred: shouldBlur(composeText)
    };

    try {
      const created = await addPost(payload);
      saveMyPost(created._id);
      setComposeText("");
      setIsComposeOpen(false);
      setSelectedCategory("");
      setPage(1);
      setPosts((current) => [created, ...current]);
    } catch (submissionError) {
      setError(submissionError.message || "Posting failed.");
    }
  }

  function cycleTheme() {
    const nextTheme =
      settings.theme === "light" ? "dark" : settings.theme === "dark" ? "system" : "light";
    void persistSettings({ ...settings, theme: nextTheme });
  }

  function toggleReveal() {
    void persistSettings({ ...settings, revealEnabled: !settings.revealEnabled });
  }

  function refreshCategory(nextCategory) {
    setSelectedCategory(nextCategory);
    setPage(1);
    setIsEnd(false);
  }

  function loadMore() {
    startTransition(() => {
      setPage((current) => current + 1);
    });
  }

  function handleBookmark(postId) {
    setBookmarks(toggleBookmark(postId));
  }

  async function handleReaction(postId, reactionType) {
    try {
      await reactToPost(postId, reactionType);
      setPosts((current) =>
        current.map((post) =>
          post._id === postId
            ? {
                ...post,
                reactions: {
                  ...post.reactions,
                  [reactionType]: (post.reactions?.[reactionType] || 0) + 1
                }
              }
            : post
        )
      );
    } catch {
      setError("Reaction failed.");
    }
  }

  async function handleReport(postId) {
    try {
      await reportPost(postId);
      setError("Thanks. That confession has been flagged for review.");
    } catch {
      setError("Reporting failed.");
    }
  }

  return (
    <div className="shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="frame">
        <section className="hero-card">
          <div className="hero-header">
            <div className="hero-topline">
              <span className="brand-mark">C</span>
              <div>
                <p className="eyebrow">Confessly</p>
                <h1>Anonymous honesty, redesigned for speed.</h1>
              </div>
            </div>
            <div className="hero-quick-actions">
              <button className="icon-button" onClick={cycleTheme} aria-label="Toggle theme">
                <GearIcon icon="theme" />
              </button>
              <Link href="/settings" className="icon-button" aria-label="Open settings">
                <GearIcon icon="settings" />
              </Link>
            </div>
          </div>

          <p className="hero-copy">{heroText}</p>

          <div className="hero-actions">
            <button className="primary-button" onClick={() => setIsComposeOpen(true)}>
              Write a confession
            </button>
            <button className="secondary-button" onClick={toggleReveal}>
              Blur {settings.revealEnabled ? "on" : "off"}
            </button>
            <Link href="/settings" className="ghost-button text-link-button">
              Personalize
            </Link>
          </div>

          <div className="metrics-grid">
            <StatCard label="Confessions" value={formatCompactNumber(metrics.confessions)} />
            <StatCard label="Replies" value={formatCompactNumber(metrics.replies)} />
            <StatCard label="Pulse" value={formatCompactNumber(metrics.pulse)} />
          </div>

          <p className="quote-line">{QUOTES[quoteIndex]}</p>
        </section>

        <nav className="tab-nav desktop-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={modePath(mode) === item.href ? "tab-link active" : "tab-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {mode !== "hearts" ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Filters</p>
                <h2>{mode === "explore" ? "Search and discover" : "Live confession stream"}</h2>
              </div>
              <div className="status-pill">{isPending ? "Loading" : "Realtime"}</div>
            </div>

            {mode === "explore" ? (
              <>
                <label className="search-shell">
                  <span>Search</span>
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Try heartbreak, exams, secrets..."
                  />
                </label>

                <div className="chip-row">
                  {TRENDING_TOPICS.map((topic) => (
                    <button key={topic} className="topic-chip" onClick={() => setSearchInput(topic)}>
                      #{topic}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="chip-row">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category.label}
                    className={selectedCategory === category.value ? "topic-chip active" : "topic-chip"}
                    onClick={() => refreshCategory(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {mode === "explore" ? (
          <section className="insight-grid">
            <div className="metric-card">
              <span>Top tags</span>
              <strong>{topTags.length ? topTags[0].tag : "waiting"}</strong>
              <p className="insight-copy">
                {topTags.length
                  ? `${topTags[0].count} active mentions in the current result set.`
                  : "Search or browse to surface live patterns."}
              </p>
            </div>
            <div className="metric-card">
              <span>Saved posts</span>
              <strong>{formatCompactNumber(bookmarkedPosts.length)}</strong>
              <p className="insight-copy">
                Keep meaningful confessions close without losing anonymity.
              </p>
            </div>
            <div className="metric-card">
              <span>Search volume</span>
              <strong>{formatCompactNumber(visiblePosts.length)}</strong>
              <p className="insight-copy">Live result count from the backend search index.</p>
            </div>
          </section>
        ) : null}

        {mode === "hearts" && !visiblePosts.length && !loading ? (
          <section className="empty-state">
            <p className="eyebrow">No activity yet</p>
            <h2>Your hearts dashboard wakes up after your first confession.</h2>
            <button className="primary-button" onClick={() => setIsComposeOpen(true)}>
              Post now
            </button>
          </section>
        ) : null}

        {error ? <p className="inline-error">{error}</p> : null}

        <section className="feed-grid">
          {loading && page === 1 ? (
            <SkeletonCards />
          ) : (
            visiblePosts.map((post) => (
              <article key={post._id} className="post-card">
                <div className="swipe-hint">
                  <div className="post-meta">
                    <span className="post-type">{post.type || "deep"}</span>
                    <span>{post.timeAgo || "Just now"}</span>
                  </div>

                  <p className={post.blurred && settings.revealEnabled ? "post-text blurred" : "post-text"}>
                    {post.text}
                  </p>

                  <div className="post-stats">
                    <button className="stat-button" onClick={() => handleVote(post._id, "like")}>
                      Appreciate {formatCompactNumber(post.likes || 0)}
                    </button>
                    <button className="stat-button" onClick={() => handleVote(post._id, "dislike")}>
                      Skip {formatCompactNumber(post.dislikes || 0)}
                    </button>
                    <button className="stat-button accent" onClick={() => setActivePostId(post._id)}>
                      Discuss {formatCompactNumber(post.comments?.length || 0)}
                    </button>
                  </div>

                  <div className="post-actions">
                    <button className="mini-action" onClick={() => handleBookmark(post._id)}>
                      {bookmarks.includes(post._id) ? "Saved" : "Save"}
                    </button>
                    {EMOTION_REACTIONS.map((reaction) => (
                      <button
                        key={reaction.value}
                        className="mini-action"
                        onClick={() => handleReaction(post._id, reaction.value)}
                      >
                        {reaction.label} {formatCompactNumber(post.reactions?.[reaction.value] || 0)}
                      </button>
                    ))}
                    <button className="mini-action subtle" onClick={() => handleReport(post._id)}>
                      Report
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {mode === "hearts" && bookmarkedPosts.length ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Saved collection</p>
                <h2>Bookmarked confessions</h2>
              </div>
            </div>
            <div className="bookmark-list">
              {bookmarkedPosts.map((post) => (
                <button key={post._id} className="bookmark-card" onClick={() => setActivePostId(post._id)}>
                  <span>{post.type || "deep"}</span>
                  <p>{post.text}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && !visiblePosts.length && mode !== "hearts" ? (
          <section className="empty-state">
            <p className="eyebrow">Nothing matched</p>
            <h2>Try a different keyword or category and we&apos;ll surface more confessions.</h2>
          </section>
        ) : null}

        {!isEnd && mode === "home" ? (
          <button className="load-more" onClick={loadMore} disabled={isPending}>
            {isPending ? "Pulling more stories..." : "Load more confessions"}
          </button>
        ) : null}
      </main>

      <button className={navHidden ? "floating-compose hidden" : "floating-compose"} onClick={() => setIsComposeOpen(true)}>
        +
      </button>

      <nav className={navHidden ? "bottom-nav hidden" : "bottom-nav"}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={modePath(mode) === item.href ? "bottom-link active" : "bottom-link"}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {isComposeOpen ? (
        <div className="overlay" onClick={() => setIsComposeOpen(false)}>
          <section className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Compose</p>
                <h2>Say it exactly how it feels.</h2>
              </div>
              <button className="close-button" onClick={() => setIsComposeOpen(false)}>
                Close
              </button>
            </div>

            <div className="reaction-row">
              {REACTION_OPTIONS.map((item) => (
                <span key={item.value} className="mini-chip">
                  {item.label}
                </span>
              ))}
            </div>

            <textarea
              className="compose-input"
              value={composeText}
              onChange={(event) => setComposeText(event.target.value)}
              placeholder="No name. No profile. Just the truth."
            />

            <div className="compose-footer">
              <span>{composeText.trim().length}/1000</span>
              <button
                className="primary-button"
                disabled={composeText.trim().length < 8}
                onClick={submitConfession}
              >
                Post anonymously
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activePost ? (
        <div className="overlay" onClick={() => setActivePostId("")}>
          <section className="drawer-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Discussion</p>
                <h2>Community replies</h2>
              </div>
              <button className="close-button" onClick={() => setActivePostId("")}>
                Close
              </button>
            </div>

            <div className="sort-row">
              <button
                className={commentSort === "top" ? "topic-chip active" : "topic-chip"}
                onClick={() => setCommentSort("top")}
              >
                Top
              </button>
              <button
                className={commentSort === "newest" ? "topic-chip active" : "topic-chip"}
                onClick={() => setCommentSort("newest")}
              >
                Newest
              </button>
            </div>

            <div className="comment-list">
              {sortedComments.length ? (
                sortedComments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <p>{comment.text}</p>
                    <div className="comment-footer">
                      <span>{comment.timeAgo || "Just now"}</span>
                      <div className="comment-actions">
                        <button onClick={() => handleCommentVote(comment._id, true)}>
                          Up {formatCompactNumber(comment.likes || 0)}
                        </button>
                        <button onClick={() => handleCommentVote(comment._id, false)}>
                          Down {formatCompactNumber(comment.dislikes || 0)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state compact">
                  <h2>No replies yet.</h2>
                </div>
              )}
            </div>

            <div className="comment-input-row">
              <input
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Respond gently, honestly, anonymously..."
              />
              <button className="primary-button" onClick={submitComment}>
                Reply
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SkeletonCards() {
  return Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton-card" />);
}

function modePath(mode) {
  if (mode === "explore") {
    return "/explore";
  }

  if (mode === "hearts") {
    return "/hearts";
  }

  return "/";
}

function applyOptimisticVote(post, postId, previousVote, nextVote) {
  if (post._id !== postId) {
    return post;
  }

  const likes = Math.max(
    0,
    (post.likes || 0) - (previousVote === "like" ? 1 : 0) + (nextVote === "like" ? 1 : 0)
  );
  const dislikes = Math.max(
    0,
    (post.dislikes || 0) - (previousVote === "dislike" ? 1 : 0) + (nextVote === "dislike" ? 1 : 0)
  );

  return { ...post, likes, dislikes };
}

function GearIcon({ icon }) {
  if (icon === "theme") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v2.5M12 18.5V21M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3 12h2.5M18.5 12H21M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        <circle cx="12" cy="12" r="4.2" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.8a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9a1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.2-1.2a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.8a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6a1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2a1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.8a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1a1 1 0 0 0 .9.6H20a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}
