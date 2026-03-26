"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addComment,
  addPost,
  getActivity,
  getComments,
  getFeed,
  getSettings,
  reactToPost,
  reportPost,
  searchPosts,
  uploadPostImage,
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
  TRENDING_TOPICS,
  classifyConfession,
  formatCompactNumber,
  getPostSignal,
  getScore,
  getTopTags,
  shouldBlur
} from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "search" },
  { href: "/hearts", label: "Hearts", icon: "heart" }
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
  const [selectedCategory, setSelectedCategory] = useState(mode === "home" ? "" : "trending");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeImageUrl, setComposeImageUrl] = useState("");
  const [composeImagePreview, setComposeImagePreview] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [activePostId, setActivePostId] = useState("");
  const [commentSort, setCommentSort] = useState("top");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [navHidden, setNavHidden] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastScrollRef = useRef(0);
  const previewUrlRef = useRef("");

  const activePost = useMemo(
    () => posts.find((post) => post._id === activePostId) || null,
    [activePostId, posts]
  );

  const [activeComments, setActiveComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const sortedComments = useMemo(() => {
    if (!activeComments.length) {
      return [];
    }

    const clone = [...activeComments];
    if (commentSort === "newest") {
      return clone.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return clone.sort(
      (a, b) => (b.likes || 0) - (b.dislikes || 0) - ((a.likes || 0) - (a.dislikes || 0))
    );
  }, [activeComments, commentSort]);

  const metrics = useMemo(() => {
    const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
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
    applyUiSettings(uiSettings, resolveTheme(settings.theme));
  }, [settings.theme, uiSettings]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 420);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    setError("");

    if (mode === "explore" && debouncedSearch) {
      setLoading(true);
      searchPosts(debouncedSearch)
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
  }, [debouncedSearch, deviceId, mode, page, selectedCategory]);

  const pageTitle =
    mode === "explore" ? "Explore" : mode === "hearts" ? "Hearts" : "Feed";
  const pageCopy =
    mode === "explore"
      ? "Find active topics, search confessions, and track what people are talking about."
      : mode === "hearts"
        ? "See your own confessions, saved posts, and the conversations around them."
        : "Fresh anonymous confessions, with reactions and discussion flowing in real time.";

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

    try {
      const updatedPost = await votePost(postId, voteType, deviceId);
      setPosts((current) =>
        current.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch {
      setError("Vote failed. Please try again.");
    }
  }

  async function handleCommentVote(commentId, isLike) {
    if (!deviceId || !activePostId) {
      return;
    }

    try {
      const updatedPost = await voteComment(activePostId, commentId, isLike, deviceId);
      setActiveComments((current) =>
        current.map((c) => {
          if (c._id === commentId) {
            const up = updatedPost.comments?.find((xc) => xc._id === commentId);
            return up || c;
          }
          return c;
        })
      );
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
      // Refresh comments from API or just prepend if easy. Backend returns full post with new comment on top.
      if (updatedPost.comments) {
        setActiveComments(updatedPost.comments);
      }
      setCommentDraft("");
    } catch (submissionError) {
      setError(submissionError.message || "Comment failed.");
    }
  }

  async function submitConfession() {
    if (composeText.trim().length < 8 || isImageUploading) {
      return;
    }

    const payload = {
      imageUrl: composeImageUrl.trim(),
      text: composeText.trim(),
      type: classifyConfession(composeText),
      blurred: shouldBlur(composeText)
    };

    try {
      const created = await addPost(payload);
      saveMyPost(created._id);
      setComposeText("");
      setComposeImageUrl("");
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setComposeImagePreview("");
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
      const updatedPost = await reactToPost(postId, reactionType);
      setPosts((current) =>
        current.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch {
      setError("Reaction failed.");
    }
  }

  async function handleImageFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = localPreviewUrl;
    setComposeImagePreview(localPreviewUrl);
    setIsImageUploading(true);
    setError("");

    try {
      const uploadedUrl = await uploadPostImage(file);
      setComposeImageUrl(uploadedUrl);
    } catch (uploadError) {
      setComposeImagePreview("");
      setComposeImageUrl("");
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
  }

  async function handleReport(postId) {
    const reason = window.confirm("Report this post for inappropriate content?") ? "OTHER" : null;
    if (!reason) return;

    try {
      const updatedPost = await reportPost(postId, reason);
      if (updatedPost?.isReported) {
        setPosts((current) => current.filter((post) => post._id !== postId));
      } else if (updatedPost?._id) {
        setPosts((current) => current.map((post) => (post._id === postId ? updatedPost : post)));
      }
      setError("Thanks. That confession has been flagged for review.");
    } catch {
      setError("Reporting failed.");
    }
  }

  function openDiscussion(postId) {
    setActivePostId(postId);
    setActiveComments([]);
    setCommentsLoading(true);
    getComments(postId)
      .then((data) => setActiveComments(data))
      .catch(() => setError("Failed to load comments."))
      .finally(() => setCommentsLoading(false));
  }

  return (
    <div className="shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="frame">
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark">C</span>
          </div>
          <div className="hero-quick-actions">
            <button className="icon-button" onClick={toggleReveal} aria-label="Toggle blur">
              <ActionIcon type={settings.revealEnabled ? "blur" : "eye"} />
            </button>
            <button className="icon-button" onClick={cycleTheme} aria-label="Toggle theme">
              <GearIcon icon="theme" />
            </button>
            <Link href="/settings" className="icon-button" aria-label="Open settings">
              <GearIcon icon="settings" />
            </Link>
          </div>
        </header>

        <section className="page-intro">
          <div>
            <p className="eyebrow">{pageTitle}</p>
            <h2>{pageCopy}</h2>
          </div>
          <div className="page-intro-actions">
            <StatCard label="Confessions" value={formatCompactNumber(metrics.confessions)} />
            <StatCard label="Replies" value={formatCompactNumber(metrics.replies)} />
            <StatCard label="Pulse" value={formatCompactNumber(metrics.pulse)} />
          </div>
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
                    <span className="post-type">{getPostSignal(post)}</span>
                    <span>{post.timeAgo || "Just now"}</span>
                  </div>

                  {post.imageUrl ? (
                    <button
                      type="button"
                      className="post-media-shell post-media-button"
                      onClick={() => setActiveImageUrl(post.imageUrl)}
                      aria-label="Open full image"
                    >
                      <img src={post.imageUrl} alt="" className="post-media" loading="lazy" />
                    </button>
                  ) : null}

                  <p className={post.blurred && settings.revealEnabled ? "post-text blurred" : "post-text"}>
                    {post.text}
                  </p>

                  <div className="post-stats">
                    <button
                      className={post.userVote === "like" ? "stat-button icon-only active" : "stat-button icon-only"}
                      aria-label="Like post"
                      onClick={() => handleVote(post._id, "like")}
                    >
                      <ActionIcon type="like" />
                      <span>{formatCompactNumber(post.likes || 0)}</span>
                    </button>
                    <button
                      className={post.userVote === "dislike" ? "stat-button icon-only active" : "stat-button icon-only"}
                      aria-label="Dislike post"
                      onClick={() => handleVote(post._id, "dislike")}
                    >
                      <ActionIcon type="dislike" />
                      <span>{formatCompactNumber(post.dislikes || 0)}</span>
                    </button>
                    <button className="stat-button accent icon-only" aria-label="Open discussion" onClick={() => openDiscussion(post._id)}>
                      <ActionIcon type="comment" />
                      <span>{formatCompactNumber(post.commentCount || 0)}</span>
                    </button>
                  </div>

                  <div className="post-actions">
                    <button className="mini-action icon-only" aria-label="Save post" onClick={() => handleBookmark(post._id)}>
                      <ActionIcon type={bookmarks.includes(post._id) ? "saved" : "save"} />
                    </button>
                    {EMOTION_REACTIONS.map((reaction) => (
                      <button
                        key={reaction.value}
                        className={post.userReaction === reaction.value ? "mini-action icon-only active" : "mini-action icon-only"}
                        aria-label={`React ${reaction.label}`}
                        onClick={() => handleReaction(post._id, reaction.value)}
                      >
                        <ActionIcon type={reaction.value} />
                        <span>{formatCompactNumber(post.reactions?.[reaction.value] || 0)}</span>
                      </button>
                    ))}
                    <button className="mini-action subtle icon-only" aria-label="Report post" onClick={() => handleReport(post._id)}>
                      <ActionIcon type="report" />
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
                <button key={post._id} className="bookmark-card" onClick={() => openDiscussion(post._id)}>
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

      <nav className={navHidden || isComposeOpen || !!activeImageUrl ? "bottom-nav hidden" : "bottom-nav"}>
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={modePath(mode) === item.href ? "bottom-link active" : "bottom-link"}
          >
            <ActionIcon type={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button className="bottom-compose" aria-label="Create confession" onClick={() => setIsComposeOpen(true)}>
          <ActionIcon type="compose" />
          <span>Post</span>
        </button>
        {NAV_ITEMS.slice(2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={modePath(mode) === item.href ? "bottom-link active" : "bottom-link"}
          >
            <ActionIcon type={item.icon} />
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

            <label className="compose-url-shell">
              <span className="settings-label">Image URL (optional)</span>
              <input
                type="url"
                value={composeImageUrl}
                onChange={(event) => {
                  if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = "";
                  }
                  setComposeImagePreview("");
                  setComposeImageUrl(event.target.value);
                }}
                placeholder="https://example.com/image.jpg"
              />
            </label>

            <label className="compose-upload-shell">
              <span className="settings-label">Upload image</span>
              <input type="file" accept="image/*" onChange={handleImageFileChange} />
              <span className="upload-help">
                {isImageUploading ? "Uploading image..." : "Pick JPG, PNG, WEBP, or GIF up to 5MB."}
              </span>
            </label>

            {composeImagePreview || composeImageUrl.trim() ? (
              <div className="compose-preview-shell">
                <img
                  src={composeImagePreview || composeImageUrl.trim()}
                  alt=""
                  className="compose-preview-image"
                />
              </div>
            ) : null}

            <div className="compose-footer">
              <span>{composeText.trim().length}/1000</span>
              <button
                className="primary-button"
                disabled={composeText.trim().length < 8 || isImageUploading}
                onClick={submitConfession}
              >
                {isImageUploading ? "Uploading..." : "Post anonymously"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeImageUrl ? (
        <div className="overlay media-overlay" onClick={() => setActiveImageUrl("")}>
          <section className="image-viewer-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Image</p>
                <h2>Full view</h2>
              </div>
              <button className="close-button" onClick={() => setActiveImageUrl("")}>
                Close
              </button>
            </div>
            <div className="image-viewer-shell">
              <img src={activeImageUrl} alt="" className="image-viewer-media" />
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

function ActionIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };

  if (type === "home") {
    return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V21h14V9.8" /></svg>;
  }
  if (type === "search") {
    return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></svg>;
  }
  if (type === "heart") {
    return <svg {...common}><path d="M12 20s-7-4.5-9.2-8.7C1 7.6 3.3 4 7.1 4c2 0 3.3 1 4.9 2.9C13.6 5 14.9 4 16.9 4c3.8 0 6.1 3.6 4.3 7.3C19 15.5 12 20 12 20Z" /></svg>;
  }
  if (type === "compose") {
    return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  }
  if (type === "like") {
    return <svg {...common}><path d="M7 10v10M3 11h4v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" /><path d="M7 20h7.2a2 2 0 0 0 1.9-1.4l1.7-5.6A2 2 0 0 0 16 10h-3V6.8A1.8 1.8 0 0 0 11.2 5L7 10Z" /></svg>;
  }
  if (type === "dislike") {
    return <svg {...common}><path d="M7 4v10M3 5h4v9H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /><path d="M7 4h7.2a2 2 0 0 1 1.9 1.4l1.7 5.6A2 2 0 0 1 16 14h-3v3.2A1.8 1.8 0 0 1 11.2 19L7 14Z" /></svg>;
  }
  if (type === "comment") {
    return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>;
  }
  if (type === "blur") {
    return <svg {...common}><path d="M2 12s3.5-6 10-6s10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><path d="M12 9.5A2.5 2.5 0 1 0 12 14.5A2.5 2.5 0 1 0 12 9.5Z" /><path d="M4 20 20 4" /></svg>;
  }
  if (type === "eye") {
    return <svg {...common}><path d="M2 12s3.5-6 10-6s10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  }
  if (type === "save" || type === "saved") {
    return <svg {...common} fill={type === "saved" ? "currentColor" : "none"}><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" /></svg>;
  }
  if (type === "funny") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 14h8" /><path d="M9 9h.01M15 9h.01" /></svg>;
  }
  if (type === "sad") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9 15c.8-1 2-1.5 3-1.5s2.2.5 3 1.5" /><path d="M9 9h.01M15 9h.01" /></svg>;
  }
  if (type === "relatable") {
    return <svg {...common}><path d="M12 21s-6.7-4.4-9-8.5C1 8.7 3.3 5 7 5c2 0 3.3 1 5 3c1.7-2 3-3 5-3c3.7 0 6 3.7 4 7.5c-2.3 4.1-9 8.5-9 8.5Z" /></svg>;
  }
  return <svg {...common}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /></svg>;
}
