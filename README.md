# volgayildiz.com

Volga Yıldız portfolyo sitesi ve yönetim paneli.

## Klasörler

- `content/` — sitedeki tüm içerik (galeriler, fotoğraf yazıları, sayfa metinleri). Yönetim paneli bu dosyaları düzenler.
- `images/` — fotoğraflar. Panelden yüklenen yeni fotoğraflar `images/uploads/` klasörüne gider.
- `admin/` — yönetim paneli (`www.volgayildiz.com/admin`).
- `assets/` — sitenin görünümü ve çalışma kodu.

## Yayın (GitHub Pages)

Site bu depodan GitHub Pages ile yayınlanır. `main` dalına gelen her değişiklik
(panelden Publish dahil) 1-2 dakika içinde siteye yansır.

- Alan adı: `CNAME` dosyasında (`www.volgayildiz.com`).
- GoDaddy DNS: `@` için 4 adet A kaydı (185.199.108.153, 185.199.109.153,
  185.199.110.153, 185.199.111.153), `www` için CNAME → `neyseo.github.io`.
- Panel girişi GitHub hesabıyla yapılır. Giriş için Cloudflare Workers üzerinde
  çalışan küçük bir yardımcı servis (sveltia-cms-auth) kullanılır;
  adresi `admin/config.yml` içindeki `base_url` satırındadır.

## İçerik güncelleme

`www.volgayildiz.com/admin` adresine gidip **Login with GitHub** ile girin.

- **Galeriler**: fotoğraf ekleyin, silin, sürükleyerek sıralayın. Her fotoğrafın **Açıklama** kutusu sitede sol altta görünür; Enter ile alt satıra geçilir.
- **Sayfalar**: About ve Exhibits sayfalarının metinleri ve fotoğrafları.
- **Açılış ve Ayarlar**: açılış slaytı fotoğrafları, e-posta, Behance ve Instagram adresleri.

Kaydettikten sonra site 1–2 dakika içinde kendini günceller.

Yüklemeden önce fotoğrafları uzun kenarı en fazla 2000 piksel olacak şekilde küçültmek siteyi hızlı tutar.
