
const accountNav = document.getElementById("account-nav");

async function tampilkanProfil() {
  try {
    const res = await fetch("/api/auth/me");

    if (!res.ok) {
      accountNav.innerHTML =
        '<a class="launch" href="/login.html">Login</a>';
      return;
    }

    const data = await res.json();
    const user = data.user;

    const details = document.createElement("details");
    details.className = "account-menu";

    const summary = document.createElement("summary");
    summary.className = "account-trigger";

    const avatar = document.createElement("span");
    avatar.className = "account-avatar";
    avatar.textContent = user.nama.charAt(0).toUpperCase();

    const nama = document.createElement("span");
    nama.textContent = user.nama;

    summary.append(avatar, nama);

    const dropdown = document.createElement("div");
    dropdown.className = "account-dropdown";

    const namaProfil = document.createElement("strong");
    namaProfil.textContent = user.nama;

    const email = document.createElement("p");
    email.textContent = user.email;

    const role = document.createElement("span");
    role.className = "account-role";
    role.textContent = user.role === "admin" ? "Administrator" : "Pengguna";

    dropdown.append(namaProfil, email, role);

    if (user.role === "admin") {
      const dashboard = document.createElement("a");
      dashboard.href = "/admin";
      dashboard.textContent = "Dashboard Admin";
      dropdown.append(dashboard);
    }

    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "account-logout";
    logout.textContent = "Logout";

    logout.addEventListener("click", async () => {
      logout.disabled = true;

      try {
        const hasil = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!hasil.ok) throw new Error("Logout gagal");

        location.reload();
      } catch {
        logout.disabled = false;
        alert("Tidak dapat logout. Silakan coba lagi.");
      }
    });

    dropdown.append(logout);
    details.append(summary, dropdown);

    accountNav.replaceChildren(details);
  } catch (err) {
    console.error("Gagal memuat profil:", err);
    accountNav.innerHTML =
      '<a class="launch" href="/login.html">Login</a>';
  }
}

tampilkanProfil();
