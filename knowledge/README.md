# Knowledge Base Directory

Taruh file-file sumber knowledge Anda di dalam folder ini (misalnya `.md`, `.txt`, `.pdf`, `.docx`).

> [!NOTE]
> Semua file di dalam folder ini **otomatis di-untracked dan di-ignore oleh Git** (kecuali `README.md` dan `.gitkeep`), sehingga data pribadi seperti CV, catatan personal, atau portofolio tidak akan bocor ke public repository.

### Format yang Didukung:
1. **Markdown (`.md`) / Teks (`.txt`)**: Langsung dibaca dan dipotong secara cerdas berdasarkan heading (`#`, `##`, `###`) dan paragraf.
2. **PDF (`.pdf`) / Word (`.docx`)**: Akan otomatis diproses via LlamaParse REST API v2 menjadi format Markdown bersih sebelum di-chunking dan di-embed ke Pinecone.

### Menjalankan Ingestion ke Pinecone:
```bash
bun run index-knowledge
```
