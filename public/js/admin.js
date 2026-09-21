(() => {
  const loginBox = document.getElementById("adminLogin");
  const panel = document.getElementById("adminPanel");
  const logoutBtn = document.getElementById("adminLogout");
  const list = document.getElementById("adminList");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const postForm = document.getElementById("postForm");

  let posts = [];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderAuth(isAdmin) {
    loginBox.hidden = isAdmin;
    panel.hidden = !isAdmin;
    logoutBtn.hidden = !isAdmin;
    if (isAdmin) renderList();
  }

  function renderList() {
    list.innerHTML = "";

    if (!posts.length) {
      list.innerHTML = '<p class="admin-empty">등록된 게시글이 없습니다.</p>';
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement("article");
      item.className = "admin-item";
      item.innerHTML = `
        <div class="admin-item__thumb"><img src="${post.image}" alt="" /></div>
        <div class="admin-item__body">
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(post.content)}</p>
        </div>
        <button type="button" class="admin-item__delete" data-id="${post.id}">삭제</button>
      `;
      list.appendChild(item);
    });
  }

  async function loadPosts() {
    const res = await fetch("/api/works");
    const data = await res.json();
    posts = Array.isArray(data.posts) ? data.posts : [];
    renderList();
  }

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();
      renderAuth(Boolean(data.isAdmin));
      if (data.isAdmin) await loadPosts();
    } catch (error) {
      renderAuth(false);
    }
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("adminPassword").value.trim();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        loginError.hidden = false;
        return;
      }
      loginError.hidden = true;
      renderAuth(true);
      await loadPosts();
    } catch (error) {
      loginError.hidden = false;
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    renderAuth(false);
  });

  postForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = document.getElementById("postImage").files[0];
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    if (!file || !title || !content) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert("이미지 용량은 2.5MB 이하로 등록해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", file);

    try {
      const res = await fetch("/api/works", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      postForm.reset();
      await loadPosts();
      alert("게시글이 등록되었습니다.");
    } catch (error) {
      alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
    }
  });

  list?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    const id = button.getAttribute("data-id");
    if (!confirm("이 게시글을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "삭제에 실패했습니다.");
        return;
      }
      await loadPosts();
    } catch (error) {
      alert("삭제에 실패했습니다.");
    }
  });

  document.getElementById("resetPosts")?.addEventListener("click", async () => {
    if (!confirm("기본 실적 데이터로 초기화할까요? 직접 등록한 글은 삭제됩니다.")) return;
    try {
      const res = await fetch("/api/works/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "초기화에 실패했습니다.");
        return;
      }
      posts = Array.isArray(data.posts) ? data.posts : [];
      renderList();
    } catch (error) {
      alert("초기화에 실패했습니다.");
    }
  });

  checkAuth();
})();
