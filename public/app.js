const icons = ["◈", "✳", "⌘", "◇", "✦", "⚙"];
async function muatLayanan() {
  const wadah = document.querySelector("#daftar-layanan");
  try {
    const res = await fetch("/api/services");
    if (!res.ok) throw new Error("Gagal memuat resources");
    const data = await res.json();
    wadah.replaceChildren();
    if (!data.length) {
      const p = document.createElement("p");
      p.className = "status";
      p.textContent = "Resources will appear here soon.";
      wadah.append(p);
      return;
    }
    data.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "service-card";
      const icon = document.createElement("div");
      icon.className = "service-icon";
      icon.textContent = icons[i % icons.length];
      const title = document.createElement("h3");
      title.textContent = item.nama;
      const desc = document.createElement("p");
      desc.textContent = item.deskripsi || "";
      card.append(icon, title, desc);
      wadah.append(card);
    });
  } catch {
    wadah.textContent = "Resources are temporarily unavailable.";
  }
}
const toggle = document.querySelector("#nav-toggle");
const nav = document.querySelector("#main-nav");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Tutup navigasi" : "Buka navigasi");
});
nav?.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});
document.querySelector("#tahun").textContent = new Date().getFullYear();
const contact = document.querySelector("#form-kontak");

contact?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.querySelector("#status-kontak");
  const tombol = contact.querySelector('[type="submit"]');

  try {
    status.className = "status";
    status.textContent = "Mengirim pesan...";

    if (tombol) tombol.disabled = true;

    const formData = new FormData(contact);

    const data = {
      nama: formData.get("nama"),
      email: formData.get("email"),
      isi: formData.get("isi")
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.pesan || "Gagal mengirim pesan.");
    }

    status.className = "status success";
    status.textContent = hasil.pesan;

    contact.reset();

  } catch (error) {
    console.error("Kesalahan formulir:", error);

    status.className = "status";
    status.textContent = error.message || "Terjadi kesalahan.";
  } finally {
    if (tombol) tombol.disabled = false;
  }
})
muatLayanan();
