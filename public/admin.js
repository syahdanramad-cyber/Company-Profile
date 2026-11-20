const form = document.querySelector("#form-layanan");
const tabel = document.querySelector("#tabel-layanan");
const statusAdmin = document.querySelector("#status-admin");
const tombolSimpan = document.querySelector("#tombol-simpan");
const tombolBatal = document.querySelector("#tombol-batal");
const namaAdmin = document.querySelector("#nama-admin");
const tombolLogout = document.querySelector("#tombol-logout");

// ---------------------------------------------------------------------------
// Sesi login
// ---------------------------------------------------------------------------

// Kalau sesi sudah habis (server membalas 401), kembali ke halaman login.
function cekSesiHabis(res) {
  if (res.status === 401) {
    location.replace("/login.html");
    return true;
  }
  return false;
}

// Ambil pesan error dari respons server (services memakai "error", auth memakai "pesan").
async function pesanError(res, cadangan) {
  const data = await res.json().catch(() => ({}));
  return data.error || data.pesan || cadangan;
}

async function tampilkanNamaAdmin() {
  try {
    const res = await fetch("/api/auth/me");
    if (cekSesiHabis(res) || !res.ok) return;
    const { user } = await res.json();
    namaAdmin.textContent = user.nama;
  } catch {
    // biarkan tetap tertulis "Admin"
  }
}

tombolLogout.addEventListener("click", async () => {
  tombolLogout.disabled = true;
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  location.replace("/login.html");
});

// ---------------------------------------------------------------------------
// Kelola layanan
// ---------------------------------------------------------------------------

function modeTambah() {
  form.reset();
  form.elements.id.value = "";
  tombolSimpan.textContent = "Tambah";
  tombolBatal.hidden = true;
}

function modeUbah(item) {
  form.elements.id.value = item.id;
  form.elements.nama.value = item.nama;
  form.elements.deskripsi.value = item.deskripsi ?? "";
  tombolSimpan.textContent = "Simpan Perubahan";
  tombolBatal.hidden = false;
  form.elements.nama.focus();
}

async function muatLayanan() {
  try {
    const res = await fetch("/api/services");
    if (!res.ok) throw new Error("Gagal memuat layanan");
    const data = await res.json();

    tabel.innerHTML = "";
    data.forEach((item) => {
      const baris = document.createElement("tr");
      const nama = document.createElement("td");
      nama.textContent = item.nama;
      const deskripsi = document.createElement("td");
      deskripsi.textContent = item.deskripsi ?? "";

      const aksi = document.createElement("td");
      const ubah = document.createElement("button");
      ubah.textContent = "Ubah";
      ubah.addEventListener("click", () => modeUbah(item));
      const hapus = document.createElement("button");
      hapus.textContent = "Hapus";
      hapus.addEventListener("click", () => hapusLayanan(item));
      aksi.append(ubah, " ", hapus);

      baris.append(nama, deskripsi, aksi);
      tabel.append(baris);
    });
  } catch (err) {
    statusAdmin.textContent = "Maaf, daftar layanan belum bisa dimuat.";
  }
}

async function hapusLayanan(item) {
  if (!confirm(`Hapus layanan "${item.nama}"?`)) return;
  try {
    const res = await fetch(`/api/services/${item.id}`, { method: "DELETE" });
    if (cekSesiHabis(res)) return;
    if (!res.ok)
      throw new Error(await pesanError(res, "Gagal menghapus layanan."));
    statusAdmin.textContent = "Layanan dihapus.";
    modeTambah();
    muatLayanan();
  } catch (err) {
    statusAdmin.textContent = err.message || "Gagal menghapus layanan.";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { id, ...data } = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch(id ? `/api/services/${id}` : "/api/services", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (cekSesiHabis(res)) return;
    if (!res.ok)
      throw new Error(await pesanError(res, "Gagal menyimpan layanan."));
    statusAdmin.textContent = id
      ? "Layanan diperbarui."
      : "Layanan ditambahkan.";
    modeTambah();
    muatLayanan();
  } catch (err) {
    statusAdmin.textContent = err.message || "Gagal menyimpan layanan.";
  }
});

tombolBatal.addEventListener("click", modeTambah);

tampilkanNamaAdmin();
muatLayanan();
