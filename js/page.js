/* Jednoduché textové stránky (napr. Ochrana osobných údajov) – hlavička, pätička, efekty */
(async function () {
  await LunaStore.load();
  LunaUI.header("");
  LunaUI.footer();
  LunaUI.reveal && LunaUI.reveal();
  document.querySelectorAll("[data-cookie-settings]").forEach((b) => (b.onclick = (e) => { e.preventDefault(); LunaConsent.open(true); }));
})();
