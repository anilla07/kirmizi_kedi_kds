# 📚 Kırmızı Kedi Kitabevi - Karar Destek Sistemi (KDS)

Bu proje **MVC (Model-View-Controller)** mimarisine ve RESTful API standartlarına tam uyumlu bir Karar Destek Sistemi (DSS) uygulamasıdır.

Proje, yöneticilerin şube performanslarını izlemesi, stratejik pazarlama kararları alması ve yeni lokasyon analizleri yapması için veriye dayalı öngörüler sunar.

---

## 🚀 Projenin Temel Özellikleri

### 1. 📊 Şube Performans Analizi
* Şubelerin Ciro, Net Kar ve Müşteri Memnuniyeti verilerinin anlık takibi.
* **Sağlık Skoru:** Her şube için "Riskli", "İyi" veya "Mükemmel" durum tespiti.
* Geçmiş ve Gelecek (Tahmini) satış grafiklerinin karşılaştırılması.

### 2. 🗺️ Akıllı Lokasyon Analizi (MCDA)
* Türkiye haritası üzerinde interaktif analiz.
* İllerin potansiyel müşteri, rekabet ve kira giderlerine göre puanlanması.
* **What-If Senaryoları:** Ağırlık kriterleri değiştirilerek en uygun yeni şube lokasyonunun belirlenmesi.

### 3. 🎯 Pazarlama ve Müşteri Segmentasyonu
* Şube bazlı müşteri profili analizi (Öğrenci, Beyaz Yaka, Kitap Kurdu vb.).
* **Simülasyon Modu:** Pazarlama bütçesi (Slider) ile oynayarak tahmini ROI (Yatırım Getirisi) ve Ciro artışının hesaplanması.
* Yapay zeka destekli kampanya önerileri.

### 4. 📦 Envanter ve Stok Yönetimi (CRUD)
* Kritik stok seviyesine düşen kitapların tespiti.
* Kategori bazlı stok maliyeti ve satış hızı analizi.
* **Veritabanı İşlemleri:** Arayüz üzerinden anlık olarak **Yeni Stok Ekleme (Create)** ve **Ürün Silme (Delete)** işlemleri yapılabilir.
* Stok verileri veritabanı (`sube_stoklari`) ile tam senkronize çalışır.

---

## 🏗️ Mimari Yapı (MVC)

Proje katı **MVC** prensiplerine göre yapılandırılmıştır:

* **📂 /controllers:** Tüm iş mantığı (Business Logic) ve SQL sorguları burada işlenir (`kdsController.js`).
* **📂 /routers:** Sadece yönlendirme işlemlerini yapar, lojik içermez (`api.js`).
* **📂 /public:** Kullanıcı arayüzü (HTML, CSS, Client-side JS) ve harita verileri (`tr-cities.json`).
* **📂 /database:** Veritabanı bağlantı ayarları (`mysql_connect.js`).

---

## ⚙️ Kurulum Adımları

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone [https://github.com/anilla07/kirmizi_kedi_kds.git](https://github.com/anilla07/kirmizi_kedi_kds.git)
    cd kirmizi_kedi_kds
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Veritabanını Kurun:**
    * MySQL'de `kirmizi_kedi_kds` adında bir veritabanı oluşturun.
    * Ana dizindeki `.sql` uzantılı veritabanı dosyasını (Import) edin.

4.  **Çevresel Değişkenleri Ayarlayın:**
    * `.env` dosyasını oluşturun.
    * İçindeki DB bilgilerini (Kullanıcı adı, Şifre) kendi bilgisayarınıza göre düzenleyin.

5.  **Projeyi Başlatın:**
    ```bash
    npm start
    ```
    * Tarayıcıda: `http://localhost:3000`

---

## 📡 API Endpoint Listesi

Proje aşağıdaki RESTful uç noktaları sağlar:

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/iller` | Tüm illeri listeler. |
| `GET` | `/api/subeler` | Aktif şube listesini getirir. |
| `GET` | `/api/sube-analiz/:id` | Şube karnesi ve sağlık durumunu hesaplar. |
| `GET` | `/api/satis-grafik/:id` | 6 aylık satış projeksiyonu sunar. |
| `GET` | `/api/harita-verisi` | Lokasyon analizi için GeoJSON ve Puan verilerini birleştirir. |
| `GET` | `/api/pazarlama-analiz/:id` | Müşteri segmentasyonu ve kampanya simülasyon verisi. |
| `GET` | `/api/envanter` | Tüm stok listesini (Read) getirir. |
| `POST` | `/api/envanter-ekle` | Yeni stok kaydı oluşturur (Create). |
| `DELETE` | `/api/envanter-sil/:id` | Stok kaydını veritabanından siler (Delete). |

---

## 🗄️ Veritabanı Şeması (ER Diyagramı)

Projenin veritabanı ilişkilerini gösteren **ER Diyagramı**, proje ana dizininde `ER_Diyagrami.png` dosyası olarak mevcuttur.

---

### 👨‍💻 Geliştirici
**Ders:** Sunucu Tabanlı Programlama  
**Teknolojiler:** Node.js, Express, MySQL, Chart.js, TailwindCSS