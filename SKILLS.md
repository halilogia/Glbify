# 📜 SKILLS.md — Glbify Geliştirici & Ajan Standartları

Bu doküman, Glbify projesinde çalışan ajanlar ve geliştiriciler için mimari standartları, 3D render sınırlarını ve Definition of Done (DoD) kriterlerini tanımlar.

---

## 🎯 Temel İlkeler ve Sınırlar

- **Platform:** Modern WebGL2 tarayıcıları ve Three.js.
- **Sıfır Sunucu:** 3D dosyalar hiçbir koşulda harici bir API'ye yüklenemez.
- **200 Satır Kuralı:** Dokümantasyon 200 satırı aşamaz.

---

## 🛠️ Mimari Kurallar

- **WebGL Bellek Yönetimi:** Her yeni model yüklendiğinde eski `Geometry`, `Material` ve `Texture` nesneleri `dispose()` çağrısıyla GPU belleğinden temizlenmelidir.

---

## ✅ Tamamlanma Kriteri (Definition of Done)

1. Proje derlemesi hatasız olmalı.
2. `TASKS.md` güncellenmeli.
3. Pre-Push kapısı doğrulanarak commit alınıp GitHub'a push edilmeli.
