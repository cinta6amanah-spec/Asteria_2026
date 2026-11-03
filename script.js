
const API_URL = "https://script.google.com/macros/s/AKfycbzIPKhx6VOdqrZ7TCO6pe7TJIQSYeuGpywBlcWe-NvsXYkatsmQOLDz3MF5G2c0vX1DGw/exec";

// Mengambil elemen HTML
const form = document.querySelector(".search-form");
const nameInput = document.getElementById("participantName");
const message = document.getElementById("searchMessage");
const resultCard = document.getElementById("resultCard");

const heroButton = document.querySelector(".hero button");
const hasilSection = document.querySelector("#hasil");

// Tombol utama menuju bagian hasil
if (heroButton && hasilSection) {
  heroButton.addEventListener("click", function() {
    hasilSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// Mencegah teks dari database dianggap sebagai HTML
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

// Mengambil data dari Google Sheets melalui JSONP
function cariDatabase(nama) {
  return new Promise(function(resolve, reject) {
    const callbackName =
      "asteriaCallback_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 10000);

    const script = document.createElement("script");

    let selesai = false;

    const timeout = setTimeout(function() {
      bersihkan();
      reject(new Error("Waktu koneksi habis."));
    }, 15000);

    function bersihkan() {
      if (selesai) return;

      selesai = true;
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = function(data) {
      bersihkan();
      resolve(data);
    };

    script.onerror = function() {
      bersihkan();
      reject(new Error("Koneksi gagal."));
    };

    script.src =
      API_URL +
      "?nama=" + encodeURIComponent(nama) +
      "&callback=" + callbackName +
      "&_=" + Date.now();

    script.async = true;
    document.body.appendChild(script);
  });
}

// Menampilkan hasil seleksi
function tampilkanHasil(data) {
  const status = String(data.status).trim().toUpperCase();

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
      "Status peserta belum valid. Silakan hubungi panitia.";
    return;
  }

  let rekomendasi = "";

  if (
    String(data.rekomendasi).trim().toUpperCase() === "YA"
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

  resultCard.innerHTML = `
    <div class="result-content ${jenis}">
      <p class="result-label">HASIL SELEKSI RESMI</p>
      <p class="result-label">ASTERIA 2026</p>

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

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// Proses pencarian ketika formulir dikirim
if (form) {
  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nama = nameInput.value.trim();

    resultCard.innerHTML = "";
    message.textContent = "";

    if (!nama) {
      message.textContent =
        "Masukkan nama lengkap terlebih dahulu.";

      message.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      return;
    }

    message.textContent =
      "Sedang mencari hasil seleksi...";

    try {
      const data = await cariDatabase(nama);

      if (!data.success) {
        message.textContent =
          data.message || "Nama tidak ditemukan.";

        message.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        return;
      }

      tampilkanHasil(data);

    } catch (error) {
      console.error("ASTERIA Error:", error);

      message.textContent =
        "Error: " + error.message;

      message.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
}