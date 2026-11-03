
document.addEventListener("DOMContentLoaded", function () {
  // ========================================
  // 1. ELEMENT WEBSITE
  // ========================================

  const form = document.querySelector(".search-form");
  const nameInput = document.getElementById("participantName");
  const message = document.getElementById("searchMessage");
  const resultCard = document.getElementById("resultCard");

  const heroButton = document.querySelector(".hero button");
  const hasilSection = document.querySelector("#hasil");

  // ========================================
  // 2. NAVIGASI DAN SCROLL
  // ========================================

  if (heroButton && hasilSection) {
    heroButton.addEventListener("click", function () {
      hasilSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  // ========================================
  // 3. PENGAMAN TEKS HTML
  // ========================================

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  // ========================================
  // 4. MEMBACA DATABASE JSON
  // ========================================

  async function cariDatabase(nama) {
    const response = await fetch("./database.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Database gagal dimuat. HTTP " + response.status
      );
    }

    const database = await response.json();

    if (!Array.isArray(database)) {
      throw new Error("Format database tidak valid.");
    }

    const peserta = database.find(function (item) {
      return (
        String(item.nama || "").trim().toLowerCase() ===
        nama.trim().toLowerCase()
      );
    });

    if (!peserta) {
      return {
        success: false,
        message: "Nama tidak ditemukan. Periksa kembali penulisan nama."
      };
    }

    return {
      success: true,
      nama: peserta.nama,
      status: peserta.status,
      rekomendasi: peserta.rekomendasi
    };
  }

  // ========================================
  // 5. MENAMPILKAN HASIL SELEKSI
  // ========================================

  function tampilkanHasil(data) {
    const status = String(data.status || "")
      .trim()
      .toUpperCase();

    let jenis = "";
    let judul = "";
    let deskripsi = "";

    if (status === "LULUS") {
      jenis = "result-lulus";
      judul = "SELAMAT!";
      deskripsi =
        "Kamu dinyatakan LULUS seleksi calon anggota MPK.";

    } else if (status === "TIDAK LULUS") {
      jenis = "result-tidak-lulus";
      judul = "TERIMA KASIH!";
      deskripsi =
        "Kamu belum dinyatakan lulus seleksi MPK. Terima kasih atas usaha, waktu, dan partisipasimu dalam proses seleksi ASTERIA 2026.";

    } else {
      message.textContent =
        "Status peserta belum valid. Hubungi panitia.";
      return;
    }

    // Rekomendasi OSIS
    let rekomendasi = "";

    if (
      String(data.rekomendasi || "")
        .trim()
        .toUpperCase() === "YA"
    ) {
      rekomendasi = `
        <div class="recommendation">
          <p><strong>REKOMENDASI OSIS</strong></p>
          <p>
            Kamu mendapatkan rekomendasi untuk mengikuti
            seleksi OSIS. Informasi selanjutnya akan
            disampaikan oleh panitia.
          </p>
        </div>
      `;
    }

    // Kartu hasil
    resultCard.innerHTML = `
      <div class="result-content ${jenis}">
        <p class="result-label">HASIL SELEKSI RESMI</p>
        <p class="result-label">ASTERIA 2026</p>
        <h2>${judul}</h2>
        <p class="participant-name">
          ${escapeHTML(data.nama)}
        </p>
        <h3>${escapeHTML(status)}</h3>
        <p class="result-description">${deskripsi}</p>
        ${rekomendasi}
        <p class="result-footer">MPK SMAN 1 LEMBANG</p>
      </div>
    `;

    message.textContent = "";

    resultCard.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  // ========================================
  // 6. PROSES PENCARIAN PESERTA
  // ========================================

  if (form && nameInput && message && resultCard) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nama = nameInput.value.trim();

      resultCard.innerHTML = "";
      message.textContent = "";

      if (!nama) {
        message.textContent =
          "Masukkan nama lengkap terlebih dahulu.";
        return;
      }

      message.textContent =
        "Sedang mencari hasil seleksi...";

      try {
        const data = await cariDatabase(nama);

        if (!data.success) {
          message.textContent =
            data.message || "Nama tidak ditemukan.";
          return;
        }

        tampilkanHasil(data);

      } catch (error) {
        console.error("ASTERIA ERROR:", error);

        message.textContent =
          "Gagal memuat hasil: " + error.message;
      }
    });
  }
});
