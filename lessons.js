// Daftar pelajaran awal. Tambahkan sendiri sesuai kebutuhan kelas.
module.exports = [
  {
    id: 1,
    title: 'Kenalan dengan Sprite',
    level: 'pemula',
    summary: 'Gerakkan sprite kucing dan buat dia berbicara.',
    steps: [
      'Tarik blok "when green flag clicked" ke area kode.',
      'Tambahkan blok "move 10 steps".',
      'Tambahkan blok "say Halo!" selama 2 detik.',
    ],
    challenge: 'Buat kucing berjalan ke kanan lalu menyapa kamu.',
  },
  {
    id: 2,
    title: 'Perulangan (Loop)',
    level: 'pemula',
    summary: 'Gunakan blok "repeat" agar tidak mengulang kode manual.',
    steps: [
      'Pakai blok "repeat 10".',
      'Isi dengan "move 10 steps" dan "turn 15 degrees".',
      'Coba ganti angka perulangannya.',
    ],
    challenge: 'Gambar persegi memakai extension Pen dan loop.',
  },
  {
    id: 3,
    title: 'Variabel & Skor',
    level: 'menengah',
    summary: 'Simpan data di variabel dan buat sistem skor sederhana.',
    steps: [
      'Buat variabel "skor".',
      'Set skor ke 0 saat bendera hijau diklik.',
      'Tambah skor 1 setiap sprite menyentuh bintang.',
    ],
    challenge: 'Buat game tangkap bintang dengan skor tertinggi tersimpan di cloud.',
  },
  {
    id: 4,
    title: 'Percabangan (If/Else)',
    level: 'menengah',
    summary: 'Buat program yang mengambil keputusan.',
    steps: [
      'Pakai blok "if <key space pressed?> then".',
      'Tambahkan "else" untuk kondisi lainnya.',
      'Gabungkan dengan variabel skor.',
    ],
    challenge: 'Buat kuis 3 soal dan hitung nilai akhirnya.',
  },
];
