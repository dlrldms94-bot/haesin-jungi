(() => {
  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  const dotsWrap = document.getElementById("heroDots");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  let index = 0;
  let timer = null;
  const INTERVAL = 5000;

  function goTo(next) {
    if (!slides.length) return;
    slides[index].classList.remove("is-active");
    dotsWrap?.children[index]?.classList.remove("is-active");
    index = (next + slides.length) % slides.length;
    slides[index].classList.add("is-active");
    dotsWrap?.children[index]?.classList.add("is-active");
  }

  function startSlider() {
    stopSlider();
    timer = window.setInterval(() => goTo(index + 1), INTERVAL);
  }

  function stopSlider() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `${i + 1}번째 이미지`);
      dot.addEventListener("click", () => {
        goTo(i);
        startSlider();
      });
      dotsWrap.appendChild(dot);
    });
    startSlider();

    document.querySelector(".hero")?.addEventListener("mouseenter", stopSlider);
    document.querySelector(".hero")?.addEventListener("mouseleave", startSlider);
  }

  function closeNav() {
    nav?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "메뉴 열기");
  }

  function openNav() {
    nav?.classList.add("is-open");
    document.body.classList.add("nav-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "메뉴 닫기");
  }

  menuToggle?.addEventListener("click", () => {
    if (nav?.classList.contains("is-open")) closeNav();
    else openNav();
  });

  nav?.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => closeNav());
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeNav();
  });

  if (!document.querySelector(".kakao-float")) {
    const kakao = document.createElement("a");
    kakao.className = "kakao-float";
    kakao.href = "https://open.kakao.com/o/sflAvJLi";
    kakao.target = "_blank";
    kakao.rel = "noopener noreferrer";
    kakao.setAttribute("aria-label", "카카오 문의하기");
    kakao.innerHTML = `
      <span class="kakao-float__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7-.1.5-.6 2.2-.7 2.5 0 0-.1.3.2.2.2-.1 2.7-1.8 3.1-2.1.9.2 1.8.2 2.8.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/>
        </svg>
      </span>
      <span class="kakao-float__text">카카오 문의</span>
    `;
    document.body.appendChild(kakao);
  }
})();
