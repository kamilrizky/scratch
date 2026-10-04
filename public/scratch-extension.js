// Extension Scratch untuk TurboWarp (harus dimuat sebagai "unsandboxed").
// Memberi blok untuk menyimpan & mengambil data dari backend.
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Extension ini harus dimuat sebagai unsandboxed');
  }

  // Ganti dengan alamat server kamu saat sudah deploy
  let SERVER = 'http://localhost:3000';

  class BackendBelajar {
    getInfo() {
      return {
        id: 'backendbelajar',
        name: 'Backend Belajar',
        blocks: [
          {
            opcode: 'setServer',
            blockType: Scratch.BlockType.COMMAND,
            text: 'atur server ke [URL]',
            arguments: { URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'http://localhost:3000' } },
          },
          {
            opcode: 'save',
            blockType: Scratch.BlockType.COMMAND,
            text: 'simpan [NAME] = [VALUE] di kelas [ROOM]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'skor' },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '100' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'kelas1' },
            },
          },
          {
            opcode: 'load',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ambil [NAME] dari kelas [ROOM]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'skor' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'kelas1' },
            },
          },
        ],
      };
    }

    setServer({ URL }) {
      SERVER = String(URL).replace(/\/$/, '');
    }

    async save({ NAME, VALUE, ROOM }) {
      try {
        await Scratch.fetch(`${SERVER}/api/cloud/${encodeURIComponent(ROOM)}/${encodeURIComponent(NAME)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: String(VALUE) }),
        });
      } catch (e) {
        console.error('Gagal menyimpan:', e);
      }
    }

    async load({ NAME, ROOM }) {
      try {
        const res = await Scratch.fetch(
          `${SERVER}/api/cloud/${encodeURIComponent(ROOM)}/${encodeURIComponent(NAME)}`
        );
        const json = await res.json();
        return json.value;
      } catch (e) {
        console.error('Gagal mengambil:', e);
        return '';
      }
    }
  }

  Scratch.extensions.register(new BackendBelajar());
})(Scratch);
