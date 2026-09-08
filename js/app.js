const VISUAL_ICONS = {
  "real-world": "📷",
  "ai-generated": "🎨"
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatRelativeOrDate(isoString) {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderVisual(visual) {
  const icon = VISUAL_ICONS[visual.type] || "🖼️";
  return `
    <div class="visual-block">
      <div class="visual-label"><span class="visual-icon">${icon}</span>${escapeHtml(visual.label)}</div>
      <div>${escapeHtml(visual.description)}</div>
    </div>
  `;
}

function renderPost(author, idea, draft) {
  const initials = escapeHtml(author.initials || "A");
  const name = escapeHtml(author.name || "Agnes");
  const headline = escapeHtml(author.headline || "");
  const timeLabel = formatRelativeOrDate(draft.createdAt);
  const draftLabel = `Idea ${idea.id}: Draft ${draft.draftNumber}`;

  const hashtagsHtml = draft.hashtags && draft.hashtags.length
    ? `<div class="post-hashtags">${draft.hashtags.map(h => `#${escapeHtml(h)}`).join(" ")}</div>`
    : "";

  const ctaHtml = draft.cta
    ? `<div class="post-cta"><strong>CTA:</strong> ${escapeHtml(draft.cta)}</div>`
    : "";

  const visualsHtml = draft.visuals && draft.visuals.length
    ? `<div class="visuals">${draft.visuals.map(renderVisual).join("")}</div>`
    : "";

  return `
    <article class="post-card" data-idea-id="${idea.id}" data-created-at="${draft.createdAt}">
      <div class="post-header">
        <div class="avatar">${initials}</div>
        <div class="post-author-block">
          <div class="post-author-name">${name}</div>
          <div class="post-author-headline">${headline}</div>
          <div class="post-meta">${timeLabel} &middot; 🌐</div>
        </div>
        <span class="draft-badge">${escapeHtml(draftLabel)}</span>
        <div class="post-more">&#8226;&#8226;&#8226;</div>
      </div>
      <div class="angle-tag">${escapeHtml(draft.angleName)} — ${escapeHtml(draft.angleSummary)}</div>
      <div class="post-body">${escapeHtml(draft.postText)}</div>
      ${hashtagsHtml}
      ${ctaHtml}
      ${visualsHtml}
      <div class="engagement-stats">
        <span>Draft — not yet published</span>
        <span></span>
      </div>
      <div class="engagement-actions">
        <button>👍 Like</button>
        <button>💬 Comment</button>
        <button>🔁 Repost</button>
        <button>✈️ Send</button>
      </div>
    </article>
  `;
}

function renderIdeaGroup(author, idea) {
  const sortedDrafts = [...idea.drafts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const postsHtml = sortedDrafts.map(d => renderPost(author, idea, d)).join("");
  return `
    <div class="idea-header">
      Idea ${idea.id}: ${escapeHtml(idea.title)}
      <span class="idea-core">${escapeHtml(idea.coreIdea)}</span>
    </div>
    ${postsHtml}
  `;
}

function ideaLatestTimestamp(idea) {
  return Math.max(...idea.drafts.map(d => new Date(d.createdAt).getTime()));
}

function renderFeed(data, activeIdeaId) {
  const feed = document.getElementById("feed");
  let ideasToRender = data.ideas;

  if (activeIdeaId !== "all") {
    ideasToRender = ideasToRender.filter(i => String(i.id) === String(activeIdeaId));
  } else {
    ideasToRender = [...ideasToRender].sort(
      (a, b) => ideaLatestTimestamp(b) - ideaLatestTimestamp(a)
    );
  }

  if (!ideasToRender.length) {
    feed.innerHTML = `<div class="empty-state">No drafts yet for this idea.</div>`;
    return;
  }

  feed.innerHTML = ideasToRender.map(idea => renderIdeaGroup(data.author, idea)).join("");
}

function renderTabs(data, activeIdeaId, onSelect) {
  const tabsEl = document.getElementById("idea-tabs");
  const tabs = [{ id: "all", label: "All Ideas" }].concat(
    data.ideas.map(i => ({ id: String(i.id), label: `Idea ${i.id}` }))
  );

  tabsEl.innerHTML = tabs
    .map(
      t => `<button class="idea-tab${String(activeIdeaId) === t.id ? " active" : ""}" data-id="${t.id}">${escapeHtml(t.label)}</button>`
    )
    .join("");

  tabsEl.querySelectorAll(".idea-tab").forEach(btn => {
    btn.addEventListener("click", () => onSelect(btn.dataset.id));
  });
}

async function init() {
  const feed = document.getElementById("feed");
  try {
    const res = await fetch("data/drafts.json");
    const data = await res.json();

    let activeIdeaId = "all";

    const rerender = () => {
      renderTabs(data, activeIdeaId, id => {
        activeIdeaId = id;
        rerender();
      });
      renderFeed(data, activeIdeaId);
    };

    rerender();
  } catch (err) {
    feed.innerHTML = `<div class="empty-state">Could not load drafts.json — ${escapeHtml(err.message)}</div>`;
  }
}

init();
