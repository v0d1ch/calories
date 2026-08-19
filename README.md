# Dnevnik kalorija

Dnevni tracker kalorija i makronutrijenata. Stranicu ažurira Claude — vlasnik mu opiše šta je jeo, Claude izračuna kalorije i makroe i upiše ih u `data.json`.

Stranica: https://v0d1ch.github.io/calories/ — zaključana lozinkom.

Podaci se čuvaju šifrovano u `data.enc.json` (AES-256-GCM, ključ iz lozinke preko PBKDF2-SHA256).
Stranica traži lozinku i dešifruje ih u browseru; ništa se ne šalje na server.
Lokalno šifrovanje/dešifrovanje: `node tools/crypt.js encrypt|decrypt <ulaz> <izlaz>` (lozinka iz `CAL_PASS`).
