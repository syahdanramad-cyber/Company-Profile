
const form = document.getElementById("form-auth");
const tombol = document.getElementById("tombol-kirim");
const status = document.getElementById("status-form");
const mode = form.dataset.mode;

// Tentukan halaman berdasarkan role akun.
function arahkanBerdasarkanRole(user) {
  if (user.role === "admin") {
    location.replace("/admin");
  } else {
    location.replace("/");
  }
}

// Periksa apakah sudah login.
fetch("/api/auth/me")
  .then(async (res) => {
    if (!res.ok) return;

    const data = await res.json();
    arahkanBerdasarkanRole(data.user);
  })
  .catch(() => {});

// Proses login dan registrasi.
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  status.className = "";
  status.textContent = "";
  tombol.disabled = true;

  try {
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(form))
      ),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.pesan || "Terjadi kesalahan, coba lagi."
      );
    }

    status.className = "berhasil";
    status.textContent = data.pesan;

    // Ambil role terbaru dari server.
    const cek = await fetch("/api/auth/me");
    const hasil = await cek.json();

    if (!cek.ok || !hasil.user) {
      throw new Error("Gagal memeriksa akun.");
    }

    arahkanBerdasarkanRole(hasil.user);

  } catch (err) {
    status.className = "gagal";
    status.textContent = err.message;
    tombol.disabled = false;
  }
});
