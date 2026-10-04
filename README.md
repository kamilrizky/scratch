# Backend Belajar Scratch

Backend Node.js + Express untuk platform belajar coding berbasis Scratch.
Data disimpan di `db.json` (dibuat otomatis) supaya mudah dipelajari. Untuk produksi, ganti ke SQLite/PostgreSQL.

## Menjalankan

```bash
npm install
npm start          # http://localhost:3000
# atau: npm run dev  (auto-restart)
```

Sebelum deploy, set `JWT_SECRET`:

```bash
JWT_SECRET=rahasia-panjang-acak npm start
```

## Struktur

| File | Fungsi |
|---|---|
| `server.js` | Semua route API |
| `lessons.js` | Data pelajaran (edit sesuka kamu) |
| `public/scratch-extension.js` | Extension TurboWarp untuk memanggil backend dari blok Scratch |

## Endpoint

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/register` | - | `{username, password}` |
| POST | `/api/login` | - | Mengembalikan `token` |
| GET | `/api/projects` | ✔ | Daftar project milik sendiri |
| POST | `/api/projects` | ✔ | `{title, data}` – `data` = isi project.json |
| GET/PUT/DELETE | `/api/projects/:id` | ✔ | Muat / ubah / hapus |
| GET | `/api/lessons`, `/api/lessons/:id` | - | Daftar & detail pelajaran |
| POST | `/api/lessons/:id/complete` | ✔ | Tandai selesai |
| GET | `/api/progress` | ✔ | Progres belajar |
| GET/PUT | `/api/cloud/:room/:name` | - | Cloud variable (skor tertinggi, dll.) |

Header auth: `Authorization: Bearer <token>`

## Contoh curl

```bash
curl -X POST localhost:3000/api/register -H 'Content-Type: application/json' \
  -d '{"username":"budi","password":"rahasia1"}'

curl -X POST localhost:3000/api/login -H 'Content-Type: application/json' \
  -d '{"username":"budi","password":"rahasia1"}'
```

## Memakai dari Scratch (TurboWarp)

Scratch resmi tidak bisa memuat extension custom, jadi pakai [TurboWarp](https://turbowarp.org):

1. Jalankan server.
2. Di TurboWarp: **Add Extension → Custom Extension → File**, pilih `public/scratch-extension.js`
   (atau URL `http://localhost:3000/scratch-extension.js`), lalu pilih **Run unsandboxed**.
3. Pakai blok:
   - `simpan [skor] = [100] di kelas [kelas1]`
   - `ambil [skor] dari kelas [kelas1]`

## Ide pengembangan

- Role guru/murid dan kode kelas
- Leaderboard dari cloud variable
- Upload file `.sb3` asli dengan `multer`
- Pindah ke SQLite (`better-sqlite3`)
- Frontend: embed editor Scratch GUI atau TurboWarp
