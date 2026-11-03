const API_URL = "https://script.google.com/macros/s/AKfycbybKnb5xc0Rv9TGYx8gx41eJqlBSbbFizLNiPJE61VmZjqdBsvUD3bfbWXJMnvWtobFOQ/exec";

const form = document.querySelector(".search-form");
const nameInput = document.getElementById("participantName");
const message = document.getElementById("searchMessage");
const resultCard = document.getElementById("resultCard");

const heroButton = document.querySelector(".hero button");
const hasilSection = document.querySelector("#hasil");

if (heroButton && hasilSection) {
  heroButton.addEventListener("click", function() {
    hasilSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

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

async function cariDatabase(nama) {
  const body = new URLSearchParams();
  body.append("nama", nama);

  const response = await fetch(API_URL, {
    method: "POST",
    body: body,
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error("Server memberikan respons HTTP " + response.status);
  }

  return await response.json();
}

function tampilkanHasil(data) {
  const status = String(data.status || "").trim().toUpperCase();

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
    message.textContent = "Status peserta belum valid. Hubungi panitia.";
    return;
  }

  let rekomendasi = "";

  if (
    String(data.rekomendasi || "").trim().toUpperCase() === "YA"
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
      <p class="participant-name">${escapeHTML(data.nama)}</p>
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

if (form) {
  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nama = nameInput.value.trim();

    resultCard.innerHTML = "";
    message.textContent = "";

    if (!nama) {
      message.textContent = "Masukkan nama lengkap terlebih dahulu.";
      return;
    }

    message.textContent = "Sedang mencari hasil seleksi...";

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
