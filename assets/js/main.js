/* =============================================================
   ‹ ชื่อของคุณ › — สคริปต์ของหน้าเดียวจบ ไม่มีไลบรารีใด ๆ
   ทำ 4 อย่าง: ค่อย ๆ แสดงเนื้อหาตอนเลื่อน, ย่อหัวเว็บ, กดดูภาพขยาย, ใส่ปีปัจจุบัน
   ============================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // บอก CSS ว่า JavaScript ทำงานอยู่ — สไตล์ที่ซ่อนเนื้อหาจะมีผลก็ต่อเมื่อมีคลาสนี้
  root.classList.add("js");

  /* ---- 1. ปีปัจจุบันในท้ายเว็บ (พ.ศ.) ------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear() + 543);

  /* ---- 2. ค่อย ๆ แสดงเนื้อหาตอนเลื่อนถึง --------------------- */
  var targets = document.querySelectorAll("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    // ผู้ใช้ขอให้ลดการเคลื่อนไหว หรือเบราว์เซอร์เก่า — แสดงทันทีทั้งหมด
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      // เรียงตามตำแหน่งบนหน้าจอ เพื่อให้หน่วงเวลาไล่จากบนลงล่างเสมอ
      entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        })
        .forEach(function (entry, i) {
          // จำกัดการหน่วงไว้ที่ 5 ลำดับ — ถ้าเลื่อนเร็วแล้วโผล่พร้อมกันหลายชิ้น
          // จะได้ไม่ต้องรอนานจนรู้สึกว่าหน้าเว็บค้าง
          var delay = Math.min(i, 5) * 60;
          entry.target.style.setProperty("--reveal-delay", delay + "ms");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // แสดงครั้งเดียวพอ ไม่วิ่งซ้ำตอนเลื่อนกลับ
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---- 3. ย่อหัวเว็บเมื่อเลื่อนลง ----------------------------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 4. กดที่ภาพเพื่อดูขนาดเต็ม ----------------------------
     ทำเฉพาะช่องที่มีไฟล์ภาพจริงแล้วเท่านั้น — ช่องที่ยังว่างจะกดไม่ได้ */
  var dialog = document.getElementById("lightbox");
  var dialogImg = document.getElementById("lightboxImg");

  if (dialog && dialogImg && typeof dialog.showModal === "function") {
    document.querySelectorAll(".gallery .frame > img").forEach(function (img) {
      var frame = img.parentElement;
      frame.classList.add("frame--zoomable");
      frame.addEventListener("click", function () {
        dialogImg.src = img.currentSrc || img.src;
        dialogImg.alt = img.alt;
        dialog.showModal();
      });
    });

    dialog.querySelector(".lightbox__close").addEventListener("click", function () {
      dialog.close();
    });

    // กดพื้นที่ว่างรอบ ๆ ภาพเพื่อปิด (ปุ่ม Esc เบราว์เซอร์จัดการให้เองอยู่แล้ว)
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", function () {
      dialogImg.removeAttribute("src");
    });
  }
})();
