#!/usr/bin/env node
// Šifrovanje/dešifrovanje dnevnika. Bez zavisnosti — samo Node crypto.
//   node tools/crypt.js encrypt data.json data.enc.json
//   node tools/crypt.js decrypt data.enc.json data.json
// Lozinka: iz promenljive CAL_PASS ili sa stdin-a.
const crypto = require("crypto");
const fs = require("fs");

const ITER = 310000, KDF = "PBKDF2-SHA256";

function key(pass, salt) {
  return crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256");
}
function encrypt(pass, plain) {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(pass, salt), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final(), c.getAuthTag()]);
  return { v: 1, kdf: KDF, iter: ITER, salt: salt.toString("base64"),
           iv: iv.toString("base64"), ct: ct.toString("base64") };
}
function decrypt(pass, blob) {
  const salt = Buffer.from(blob.salt, "base64"), iv = Buffer.from(blob.iv, "base64");
  const raw = Buffer.from(blob.ct, "base64");
  const tag = raw.subarray(raw.length - 16), body = raw.subarray(0, raw.length - 16);
  const d = crypto.createDecipheriv("aes-256-gcm", key(pass, salt), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString("utf8");
}
function password() {
  if (process.env.CAL_PASS) return process.env.CAL_PASS;
  const s = fs.readFileSync(0, "utf8").trim();
  if (!s) { console.error("Nema lozinke (CAL_PASS ili stdin)."); process.exit(1); }
  return s;
}

const [mode, src, dst] = process.argv.slice(2);
if (!["encrypt", "decrypt"].includes(mode) || !src || !dst) {
  console.error("Upotreba: crypt.js encrypt|decrypt <ulaz> <izlaz>"); process.exit(1);
}
const pass = password();
if (mode === "encrypt") {
  const plain = fs.readFileSync(src, "utf8");
  JSON.parse(plain); // provera da je validan JSON pre šifrovanja
  fs.writeFileSync(dst, JSON.stringify(encrypt(pass, plain), null, 2) + "\n");
} else {
  let out;
  try { out = decrypt(pass, JSON.parse(fs.readFileSync(src, "utf8"))); }
  catch { console.error("Dešifrovanje nije uspelo — pogrešna lozinka ili oštećen fajl."); process.exit(1); }
  JSON.parse(out);
  fs.writeFileSync(dst, out);
}
console.log(mode + " → " + dst);
