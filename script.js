
const API_URL = "https://script.google.com/macros/s/AKfycbzIPKhx6VOdqrZ7TCO6pe7TJIQSYeuGpywBlcWe-NvsXYkatsmQOLDz3MF5G2c0vX1DGw/exec";

// =====================================
// 1. MENGAMBIL ELEMEN HTML
// =====================================

const form = document.querySelector(".search-form");
const nameInput = document.getElementById("participantName");
const message = document.getElementById("searchMessage");
const resultCard = document.getElementById("resultCard");

const heroButton = document.querySelector(".hero button");
const hasilSection = document.querySelector("#hasil");

// =====================================
// 2. TOMBOL MENUJU HASIL
// =====================================

if (heroButton && hasilSection) {
  heroButton.addEventListener("click", function() {
    hasilSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// =====================================
// 3. MENGAMANKAN TEKS HTML
// =====================================

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, function(char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[char];
  });
}

// =====================================
// 4. MENGAMBIL DATA DARI GOOGLE SHEETS
// =====================================

function cariDatabase(nama) {
  return new Promise(function(resolve, reject) {
    const callbackName =
      "asteriaCallback_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 10000);

    const script = document.createElement("script");

    let selesai = false;

    function bersihkan() {
      if (selesai) return;

      selesai = true;
      clearTimeout(timeout);

      script.remove();
      delete window[callbackName];
    }

    const timeout = setTimeout(function() {
      bersihkan();

      reject(
        new Error(
          "Waktu koneksi habis. Server tidak mengirim respons."
        )
      );
    }, 20000);

    // Callback menerima respons dari Apps Script
    window[callbackName] = function(data) {
      console.log("ASTERIA CALLBACK BERHASIL:", data);

      bersihkan();
      resolve(data);
    };

    // Jika file respons gagal dimuat
    script.onerror = function() {
      bersihkan();

      reject(
        new Error(
          "Script Google gagal dimuat oleh browser."
        )
      );
    };

    // Membuat URL permintaan
    script.src =
      API_URL +
      "?nama=" + encodeURIComponent(nama) +
      "&callback=" + callbackName +
      "&_=" + Date.now();

    script.async = true;

    document.body.appendChild(script);
  });
}

// =====================================
// 5. MENAMPILKAN HASIL SELEKSI
// =====================================

function tampilkanHasil(data) {
  console.log("DATA DITERIMA:", data);

  if (!data || !data.success) {
    message.textContent =
      "Data peserta tidak ditemukan.";

    return;
  }

  const status = String(data.status || "")
    .trim()
    .toUpperCase();

  let jenis;
  let judul;
  let deskripsi;

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

  // Membuat kartu hasil
  resultCard.innerHTML = `
    <div class="result-content ${jenis}">

      <p class="result-label">
        HASIL SELEKSI RESMI
      </p>

      <p class="result-label">
        ASTERIA 2026
      </p>

      <h2>${judul}</h2>

      <p class="participant-name">
        ${escapeHTML(data.nama)}
      </p>

      <h3>${escapeHTML(status)}</h3>

      <p class="result-description">
        ${deskripsi}
      </p>

      ${rekomendasi}

      <p class="result-footer">
        MPK SMAN 1 LEMBANG
      </p>

    </div>
  `;

  message.textContent = "";

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// =====================================
// 6. PROSES PENCARIAN PESERTA
// =====================================

if (form) {
  form.addEventListener("submit", async function(event) {
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

    console.log("Mencari peserta:", nama);

    try {
      const data = await cariDatabase(nama);

      console.log("Respons database diterima:", data);

      if (!data || !data.success) {
        message.textContent =
          data?.message ||
          "Nama tidak ditemukan. Periksa kembali penulisan nama.";

        return;
      }

      tampilkanHasil(data);

    } catch (error) {
      console.error("ASTERIA ERROR:", error);

      message.textContent =
        "Gagal memuat hasil: " + error.message;
    }
  });
} else {
  console.error(
    "ASTERIA ERROR: Form pencarian tidak ditemukan."
  );
}
