# volgayildiz.com

Volga Yıldız portfolyo sitesi ve yönetim paneli.

## Klasörler

- `content/` — sitedeki tüm içerik (galeriler, fotoğraf yazıları, sayfa metinleri). Yönetim paneli bu dosyaları düzenler.
- `images/` — fotoğraflar. Panelden yüklenen yeni fotoğraflar `images/uploads/` klasörüne gider.
- `admin/` — yönetim paneli (`www.volgayildiz.com/admin`).
- `assets/` — sitenin görünümü ve çalışma kodu.

## Yayına alma (bir kez yapılır)

1. Bu klasörü GitHub'da yeni bir depoya yükleyin.
2. Netlify'da **Add new site → Import an existing project** ile bu depoyu seçin. Build ayarlarını boş bırakın.
3. Netlify'da **Site configuration → Identity** bölümünden Identity'yi açın.
   - **Registration**: *Invite only* seçin (sadece davet edilenler girebilir).
   - **Services → Git Gateway**: *Enable* deyin.
4. **Identity → Invite users** ile kendi e-posta adresinizi davet edin. Gelen e-postadaki bağlantıdan şifrenizi belirleyin.
5. **Domain management** bölümünden `volgayildiz.com` ve `www.volgayildiz.com` adreslerini ekleyin. Netlify'ın verdiği DNS kayıtlarını GoDaddy'de girin.

## İçerik güncelleme

`www.volgayildiz.com/admin` adresine gidip e-posta ve şifrenizle girin.

- **Galeriler**: fotoğraf ekleyin, silin, sürükleyerek sıralayın. Her fotoğrafın **Açıklama** kutusu sitede sol altta görünür; Enter ile alt satıra geçilir.
- **Sayfalar**: About ve Exhibits sayfalarının metinleri ve fotoğrafları.
- **Açılış ve Ayarlar**: açılış slaytı fotoğrafları, e-posta, Behance ve Instagram adresleri.

Kaydettikten sonra site 1–2 dakika içinde kendini günceller.

Yüklemeden önce fotoğrafları uzun kenarı en fazla 2000 piksel olacak şekilde küçültmek siteyi hızlı tutar.
