(() => {
  const grid = document.getElementById("worksGrid");
  const empty = document.getElementById("worksEmpty");
  const modal = document.getElementById("worksModal");
  if (!grid || !modal) return;

  const imageEl = document.getElementById("worksModalImage");
  const titleEl = document.getElementById("worksModalTitle");
  const contentEl = document.getElementById("worksModalContent");
  const counterEl = document.getElementById("worksCounter");
  const stage = modal.querySelector(".works-modal__stage");

  let posts = [];
  let index = 0;
  let zoom = 1;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderGrid() {
    grid.innerHTML = "";

    if (!posts.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    posts.forEach((post, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "works-grid__item";
      button.setAttribute("aria-label", `${post.title} 상세 보기`);
      button.innerHTML = `<img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" />`;
      button.addEventListener("click", () => openModal(i));
      grid.appendChild(button);
    });
  }

  function setZoom(next) {
    zoom = Math.min(2.5, Math.max(1, next));
    imageEl.style.transform = `scale(${zoom})`;
  }

  function updateModal() {
    const post = posts[index];
    if (!post) return;
    imageEl.src = post.image;
    imageEl.alt = post.title || "공사 실적 이미지";
    titleEl.textContent = post.title || "제목";
    contentEl.textContent = post.content || "내용";
    counterEl.textContent = `${index + 1} / ${posts.length}`;
    setZoom(1);
  }

  function openModal(i) {
    index = i;
    updateModal();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setZoom(1);
  }

  function showPrev() {
    if (!posts.length) return;
    index = (index - 1 + posts.length) % posts.length;
    updateModal();
  }

  function showNext() {
    if (!posts.length) return;
    index = (index + 1) % posts.length;
    updateModal();
  }

  document.getElementById("worksClose")?.addEventListener("click", closeModal);
  document.getElementById("worksPrev")?.addEventListener("click", showPrev);
  document.getElementById("worksNext")?.addEventListener("click", showNext);
  document.getElementById("worksZoomIn")?.addEventListener("click", () => setZoom(zoom + 0.25));
  document.getElementById("worksZoomOut")?.addEventListener("click", () => setZoom(zoom - 0.25));

  modal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
  });

  stage?.addEventListener("dblclick", () => {
    setZoom(zoom > 1 ? 1 : 1.5);
  });

  async function loadPosts() {
    try {
      const res = await fetch("/api/works");
      const data = await res.json();
      posts = Array.isArray(data.posts) ? data.posts : [];
    } catch (error) {
      posts = [];
    }
    renderGrid();
  }

  loadPosts();
})();
