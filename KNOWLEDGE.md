# 🧠 Glbify Mühendislik Hafızası (KNOWLEDGE.md)

Bu dosya, Glbify web tabanlı 3D model dönüştürücü ve görüntüleyici projesinin mimari karar kayıtlarını (ADR) ve Three.js teknik tuzaklarını (Gotchas) belgeler.

---

## 🏛️ Mimari Karar Kayıtları (ADR)

### [ADR-01] Three.js GLTFExporter ile İstemci Tarafı Dönüştürme
- **Karar:** 3D model dosyaları (FBX, OBJ, glTF) sunucuya gönderilmeksizin doğrudan tarayıcıda `three/addons/loaders/FBXLoader` ile yüklenir ve `GLTFExporter` ile ikili GLB formatına dönüştürülür.
- **Gerekçe:** Yüksek bant genişliği tasarrufu, sıfır sunucu GPU/CPU maliyeti ve kullanıcı dosyalarının tam gizliliği.

### [ADR-02] Web Worker / Blobs Desteği
- **Karar:** Yüksek boyutlu dokular ve animasyon kanalları Blob URL'leri üzerinden işlenir.

---

## ⚠️ Kritik Teknik Tuzaklar (Gotchas)

### [GOTCHA-01] FBX İskelet / Animasyon ve Eksik Dokular
- **Tuzak:** FBX dosyaları gömülü doku içermediğinde siyah materyal render edilmesi.
- **Çözüm:** Dokuların sürükle-bırak sırasında çoklu dosya seçimiyle yüklenmesine izin verilir ve isim eşleşmesiyle materyallere bağlanır.
