import type { Lang } from '../i18n/translations';

interface NewsTranslation {
  title?: Partial<Record<Lang, string>>;
  body?: Partial<Record<Lang, string>>;
}

export const NEWS_TRANSLATIONS: Record<number, NewsTranslation> = {
  1: { title: { ms: 'PEMBAHARUAN LAMAN RASMI' } },
  4: { title: { ms: 'KELAB PEMINAT RASMI KLP48 BERMULA' } },
  7: {
    title: { ms: 'Konsert Ulang Tahun Pertama KLP48 “BLOOM”' },
    body: {
      ms: `Bagi meraikan setahun kenangan indah, usaha gigih dan perkembangan, kami dengan bangganya mempersembahkan konsert ulang tahun pertama kami, 「BLOOM」.
◼︎Tarikh: Sabtu, 16 Ogos 2025◼︎Tempat: Zepp Kuala Lumpur◼︎Pintu dibuka: 16:30◼︎Konsert bermula: 17:30◼︎Artis jemputan: JKT48・Ismail Izzani・COËX.◼︎Tempoh jualan tiket: 3 Julai 2025, 12:00 tengah hari hingga 15 Ogos 2025, 11:59 malam◼︎Pembelian tiket: https://www.excitix.com.my/event/90/KLP48-1st-Anniversary-concert-BLOOM
Mari kita raikan pencapaian istimewa ini dan perjalanan menarik yang menanti kita.`,
    },
  },
  8: {
    title: { ms: 'Single ke-4 KLP48, “Oh my pumpkin!”' },
    body: { ms: 'Single ke-4 KLP48, “Oh my pumpkin!”, akan tersedia di semua platform penstriman pada 13 Ogos 2025.' },
  },
  9: {
    title: { ms: 'Maklumat siaran radio di Discord Fan Club KLP48' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48! 🎙
【KLP secret room】
Siaran radio #3 🗓️ 8 September, 7:00 malam (MYT) 🎙️ Bersama: YURINA・DEVI・TIFFANY
Siaran radio #4 🗓️ 16 September, 7:00 malam (MYT) 🎙️ Bersama: YI SHYAN・LUCINE・HILLARY`,
    },
  },
  11: {
    title: { ms: 'Eksklusif untuk Ahli Premium: TALK 1-on-1 Dalam Talian' },
    body: {
      ms: `Eksklusif untuk Ahli Premium: TALK 1-on-1 Dalam Talian
Permohonan kini dibuka untuk “TALK 1-on-1 Dalam Talian Eksklusif Ahli Premium” yang dijadualkan pada Ahad, 21 September. Semua ahli Premium layak memohon.
Jika anda belum menjadi ahli fan club atau kini merupakan ahli Basic, rebutlah peluang ini untuk menaik taraf keahlian kepada Premium!
…
Permohonan untuk “TALK 1-on-1 Dalam Talian Eksklusif Ahli Premium” yang akan diadakan pada Ahad, 21 September kini dibuka.
Semua ahli Premium layak memohon. Jika anda belum menjadi ahli fan club atau merupakan ahli Basic, kami menggalakkan anda menaik taraf kepada keahlian Premium.`,
      en: `Exclusive to Premium Members: Online 1-on-1 TALK
Applications are now open for the “Premium Members Only Online 1-on-1 TALK” scheduled for Sunday, September 21. All Premium members are eligible to apply.
If you are not yet a fan club member or are currently a Basic member, we encourage you to take this opportunity to upgrade to Premium membership!`,
    },
  },
  15: {
    title: { ms: 'Konsert Solo Pertama KLP48, Super Bash' },
    body: {
      ms: 'Pada 27 Disember, kami akan mengadakan konsert solo pertama kami, Super Bash!!\nTiket kini dijual: https://www.excitix.com.my/event/124/KLP48-First-Solo-Concert--SUPER-BASH-',
    },
  },
  16: {
    title: { ms: 'KENYATAAN RASMI' },
    body: {
      ms: `Terima kasih atas sokongan berterusan anda terhadap KLP48.
Selepas semakan dalaman, pihak Pengurusan KLP48 mengesahkan bahawa enam ahli Generasi Pertama KLP48 telah melanggar peraturan kumpulan berkenaan tingkah laku ahli. Pihak Pengurusan memandang perkara ini dengan serius dan maklum bahawa ia telah menimbulkan kebimbangan serta kekecewaan.
Ahli yang terlibat ialah: 1. Yi Shyan 2. Amanda 3. Ann Drea 4. Hillary 5. Khalies 6. Salwa
Selepas mempertimbangkan perkara ini dengan teliti, pihak Pengurusan telah mengeluarkan amaran rasmi yang tegas kepada ahli-ahli tersebut. Amaran ini akan direkodkan. Jika berlaku pelanggaran seterusnya, pihak Pengurusan akan mengambil tindakan disiplin yang lebih tegas dengan segera, termasuk kemungkinan penggantungan aktiviti, penurunan pangkat atau penamatan.
KLP48 mengharapkan semua ahli menilai tindakan masing-masing dengan ikhlas dan menunjukkan perubahan melalui tingkah laku pada masa hadapan. Para peminat diminta agar tidak membuat spekulasi dan terus memberikan sokongan kepada mereka.
Terima kasih atas pengertian dan sokongan berterusan anda terhadap KLP48.
Pihak Pengurusan KLP48`,
    },
  },
  17: {
    title: {
      ms: 'Makluman Cuti Akhir Tahun Kaunter Sokongan',
      en: 'Support Desk Year-End Holiday Notice',
    },
    body: {
      ms: `Terima kasih kerana menggunakan KLP48 Fan Club.
Kaunter sokongan kami akan ditutup sepanjang tempoh cuti akhir tahun berikut:

【Tempoh cuti akhir tahun】
27 Disember 2025 (Sabtu) hingga 4 Januari 2026 (Ahad)

Pertanyaan yang diterima dalam tempoh ini akan dijawab mengikut turutan mulai Isnin, 5 Januari 2026.
Masa pemprosesan mungkin lebih lama daripada biasa. Terima kasih atas kesabaran dan pengertian anda.

Kami memohon maaf atas sebarang kesulitan dan menghargai kerjasama anda.`,
      en: `Thank you for using the KLP48 Fan Club.
Our support desk will be closed for the year-end holiday during the following period:

【Year-end holiday period】
Saturday, 27 December 2025 to Sunday, 4 January 2026

Inquiries received during this period will be handled in the order received from Monday, 5 January 2026.
Responses may take longer than usual. Thank you for your understanding and patience.

We apologize for any inconvenience and appreciate your cooperation.`,
    },
  },
  19: {
    title: { ms: 'KENYATAAN RASMI' },
    body: {
      ms: `Kepada para peminat yang dihargai,
Kami memohon maaf dengan ikhlas atas kekeliruan dan kebimbangan yang timbul susulan pengumuman yang dikeluarkan oleh pihak Pengurusan KLP48 pada 19 Disember 2025.
Sepanjang tempoh ini, pihak Pengurusan dan semua ahli telah mengadakan beberapa perbincangan bagi memastikan persefahaman dan keselarasan. Melalui perbincangan tersebut, kami mengukuhkan semula kepercayaan dan perpaduan yang erat antara semua ahli dan kakitangan.
Baru-baru ini, pihak Pengurusan telah mengeluarkan amaran rasmi kepada enam ahli atas pelanggaran garis panduan media sosial dalaman KLP48. Selepas itu, beberapa mesej yang tersebar dalam talian telah menggambarkan keadaan dan niat ahli-ahli terlibat secara tidak tepat. Kami ingin menjelaskan bahawa siasatan dalaman yang menyeluruh telah dijalankan sebelum tindakan disiplin diambil dan pihak Pengurusan mengesahkan bahawa langsung tiada niat perkauman atau buli.
Kami juga mengakui bahawa keadaan ini sebahagiannya berpunca daripada kelemahan pihak Pengurusan sendiri. Sejak peringkat awal KLP48, sesetengah amalan Pengurusan mungkin dianggap memihak kepada ahli yang lebih berpengalaman. Kami bertanggungjawab sepenuhnya atas perkara ini dan memohon maaf dengan ikhlas atas sebarang salah faham yang timbul.
Bagi mengelakkan kejadian serupa, pihak Pengurusan komited untuk memperkukuh komunikasi, bimbingan dan sokongan kepada semua ahli KLP48. Kami akan terus menambah baik proses dalaman demi memastikan keadilan, kejelasan dan sikap saling menghormati dalam kumpulan.
Pada masa yang sama, pihak Pengurusan ingin menegaskan bahawa kami akan mengambil tindakan tegas bagi melindungi ahli, kakitangan dan organisasi. Tindakan undang-undang akan diambil terhadap mana-mana individu yang didapati:

Membuat atau menyebarkan kenyataan palsu, mengelirukan atau berunsur fitnah tentang KLP48 atau ahlinya;
Menghasut gangguan atau permusuhan terhadap KLP48 atau ahlinya; atau
Mendedahkan secara tidak sah atau menyumbang kepada kebocoran maklumat sulit atau peribadi milik KLP48 atau ahlinya.

Perbuatan tersebut merupakan pelanggaran serius terhadap undang-undang dan kewajipan kontrak, dan akan ditangani sewajarnya tanpa teragak-agak.
Kami akan terus menyemak struktur organisasi serta memperkukuh operasi bagi memastikan KLP48 berkembang dalam persekitaran yang sihat, positif dan telus.
Kami amat menghargai pengertian, kesabaran dan sokongan berterusan para peminat.

YIP JUN HUEI
Pengarah Urusan`,
    },
  },
  20: {
    title: { ms: 'Pemulangan Wang Sesi Cocoa Meet & Greet' },
    body: {
      ms: `Kami ingin memaklumkan kepada semua peminat yang memohon bayaran balik untuk sesi Cocoa Meet & Greet dan membuat pembayaran menggunakan kad kredit atau debit bahawa pembatalan transaksi kad tidak dapat diproses kerana had masa yang ditetapkan oleh penyedia perkhidmatan gerbang pembayaran.
Oleh itu, semua bayaran balik yang layak akan dibuat melalui pindahan bank terus.
Sesetengah peminat masih belum memberikan maklumat hubungan atau akaun bank. Jika anda salah seorang daripada mereka, sila e-mel stephany@48ent.my dengan maklumat berikut:
1. Nama (seperti dalam NRIC/Pasport)
2. Nombor telefon bimbit
3. Nama bank dan nombor akaun
4. Jumlah bayaran balik
5. Salinan digital resit jualan dan slip pembayaran kad
Peminat yang tidak lagi mempunyai resit jualan atau slip pembayaran juga digalakkan untuk menghubungi kami supaya kami dapat membantu.
Kami memohon maaf atas kesulitan ini dan berterima kasih atas pengertian serta sokongan berterusan anda terhadap KLP48.
Pihak Pengurusan KLP48`,
    },
  },
  21: {
    title: { ms: 'Maklumat siaran radio KLP48 Fan Club' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48! 🎙
【KLP secret room】
Siaran radio 🗓️ 16 Januari, 7:00 malam (MYT) 🎙️ Bersama: ANN DREA・AMANDA・SALWA
Siaran radio 🗓️ 26 Januari, 7:00 malam (MYT) 🎙️ Bersama: DEVI・SUZUHA・COCOA`,
    },
  },
  22: {
    title: { ms: 'KANDUNGAN JANAAN AI YANG MEMUDARATKAN' },
    body: {
      ms: `KLP48 telah mengenal pasti penciptaan, penerbitan dan penyebaran hantaran media sosial tanpa kebenaran yang mengandungi kandungan dan/atau imej janaan AI melibatkan ahli KLP48. Kandungan sedemikian telah menyebabkan kemudaratan, tekanan dan kerosakan reputasi yang serius kepada ahli yang terlibat.
KLP48 mengecam sekeras-kerasnya tindakan ini. Penciptaan dan penyebaran kandungan sedemikian boleh dianggap sebagai fitnah, gangguan, penyamaran identiti dan penyalahgunaan teknologi, serta mungkin melanggar undang-undang Malaysia yang berkenaan.
Tindakan ini menjejaskan reputasi, maruah dan kepentingan ahli yang terlibat, KLP48 sebagai sebuah organisasi serta kumpulan 48 secara keseluruhan.
Kami menggesa pihak yang bertanggungjawab supaya segera memadam semua hantaran tersebut dan menghentikan penyebaran kandungan yang memudaratkan atau mengelirukan.
KLP48 memandang serius perkara ini dan berhak mengambil tindakan undang-undang untuk melindungi ahli, kakitangan dan organisasi. Ini termasuk, tetapi tidak terhad kepada, membuat aduan rasmi kepada Suruhanjaya Komunikasi dan Multimedia Malaysia (MCMC) serta mendapatkan remedi lain yang dibenarkan undang-undang.
KLP48 komited untuk menjaga maruah, keselamatan dan hak semua ahli serta kakitangannya.
Pihak Pengurusan KLP48`,
    },
  },
  24: {
    title: { ms: 'PENGUMUMAN RASMI PENAMATAN AKTIVITI COCOA, SUZUHA, HARUKA DAN YURINA' },
    body: {
      ms: `KLP48 dengan ini mengumumkan bahawa empat ahli — Cocoa (Kokoa Kai), Suzuha (Suzuha Yamane), Haruka (Haruka Kurosu) dan Yurina (Yurina Gyoten) — akan menamatkan aktiviti mereka bersama KLP48 berkuat kuasa 28 Februari 2026.
Pada 28 Disember 2025, KLP48 berjaya membuka teater khususnya. Dengan pencapaian penting ini, kumpulan akan memasuki fasa baharu yang berteraskan persembahan teater berkala, antara aktiviti paling penting dan menjadi identiti Kumpulan AKB48.
Dalam persediaan KLP48 untuk melangkah ke fasa seterusnya dengan persembahan teater sebagai teras hala tuju seni, empat ahli ini telah memainkan peranan yang amat penting dalam menyokong dan membangunkan kumpulan sebelum teater siap. Usaha mereka menjadi asas kukuh yang membolehkan KLP48 berkembang seperti hari ini.
Sejak kemunculan sulung KLP48 pada 18 Ogos 2024, Cocoa, Suzuha, Haruka dan Yurina telah bersama kumpulan sepanjang tahun-tahun awal penubuhannya. Di atas pentas mahupun di belakang tabir, mereka telah membimbing dan menyokong ahli Generasi Pertama dan Kedua, serta banyak menyumbang kepada pembentukan semangat, disiplin dan nilai KLP48. Dedikasi dan kehadiran mereka merupakan bab yang tidak dapat digantikan dalam sejarah kumpulan.
Dengan berakhirnya bab penting ini dan KLP48 melangkah ke fasa seterusnya, kumpulan kini tiba di titik perubahan semula jadi yang membolehkan setiap ahli memulakan perjalanan baharu masing-masing.
Selepas menamatkan aktiviti bersama KLP48, Cocoa akan kembali ke STU48, manakala Suzuha, Haruka dan Yurina akan kembali ke AKB48 untuk meneruskan kerjaya masing-masing.
Kami ingin merakamkan setinggi-tinggi penghargaan kepada semua peminat yang telah menyokong KLP48 dan ahli-ahli ini sepanjang perjalanan mereka. Kami memohon agar anda terus memberikan sokongan dan dorongan ketika mereka melangkah ke fasa seterusnya.
Pihak Pengurusan KLP48
31 Januari 2026`,
    },
  },
  25: {
    title: { ms: 'Notis Penangguhan Pelancaran “Kerana Ku Suka”' },
    body: {
      ms: `Terima kasih atas sokongan berterusan anda terhadap KLP48.
Dimaklumkan bahawa pelancaran “Kerana Kusuka”, yang pada asalnya dijadualkan pada 14 Februari 2026 dan diumumkan semasa Konsert Solo Pertama kami pada 27 Disember, telah ditangguhkan atas sebab berkaitan produksi.
Kami memohon maaf dengan ikhlas atas kesulitan yang mungkin dialami oleh peminat yang menantikan pelancaran ini. Maklumat tentang jadual pelancaran baharu akan diumumkan kemudian.
Terima kasih atas pengertian dan sokongan berterusan anda terhadap KLP48.
Pihak Pengurusan KLP48`,
    },
  },
  28: {
    title: { ms: 'Blog Semua Ahli Generasi Kedua Kini Tersedia di Discord' },
    body: {
      ms: `Dengan sukacitanya kami mengumumkan bahawa blog semua ahli Generasi Kedua kini tersedia di Discord rasmi kami!

Kandungan eksklusif ini dilancarkan pada 15 April dan boleh dinikmati oleh ahli fan club.

Sertai fan club KLP48 hari ini untuk mengikuti semua perkembangan terkini!`,
    },
  },
  29: {
    title: { ms: 'Maklumat siaran radio KLP48 Fan Club' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48! 🎙
【KLP secret room】
Siaran radio 🗓️ 13 April, 7:00–7:30 malam (MYT) 🎙️ Bersama: DEVI・ANN DREA・YI SHYAN
Siaran radio 🗓️ 25 April, 7:00–7:30 malam (MYT) 🎙️ Bersama: TIFFANY・KHALIES・AMANDA`,
    },
  },
  31: {
    title: { ms: 'Penangguhan Pembukaan Teater KLP48' },
    body: {
      ms: `Disebabkan keadaan yang tidak dijangka, kami dukacita memaklumkan bahawa pembukaan Teater KLP48, yang pada asalnya dijadualkan pada penghujung April 2026, ditangguhkan sehingga diberitahu kelak.
Keputusan ini dibuat bagi memastikan kami dapat memberikan pengalaman terbaik kepada para peminat. Kami memohon maaf atas kesulitan yang timbul dan amat menghargai kesabaran serta sokongan berterusan anda.
Pihak Pengurusan sedang mengutamakan pembukaan secepat mungkin. Ikuti saluran media sosial kami untuk pengumuman tarikh pembukaan baharu. Kami tidak sabar untuk menyambut kedatangan anda!
Pihak Pengurusan KLP48`,
    },
  },
  32: {
    title: { ms: 'Permohonan TALK 1-on-1 Eksklusif Ahli Premium Bulan Mei Dibuka' },
    body: {
      ms: `Dengan sukacitanya kami mengumumkan bahawa jadual dan tempoh permohonan untuk “TALK 1-on-1 Eksklusif Ahli Premium” bulan Mei telah disahkan.
Permohonan untuk acara ini kini dibuka! Semua ahli Premium layak memohon. Jika anda belum menjadi ahli fan club atau kini merupakan ahli Basic, rebutlah peluang ini untuk menaik taraf keahlian kepada Premium.
[Tempoh Permohonan]
1 Mei, 12:00 tengah hari (MYT) – 10 Mei, 11:59 malam (MYT)

ーーーーーーーーーーーーーーーー
Ahad, 17 Mei
12:00 – 1:30 tengah hari
Ann Drea, Salwa, Devi, Hillary
1:30 – 3:00 petang
Khalies, Tiffany, Yi Shyan, Amanda

ーーーーーーーーーーーーーーーー
Sabtu, 23 Mei
6:00 – 7:00 malam
Maia, Tara, Kei, Sharleez, Isabel
7:00 – 8:00 malam
Aisha, Cindy, Joo, Diva
8:00 – 9:00 malam
Alice, Hana, Shu Zhen, Mashiro`,
    },
  },
  33: {
    title: { ms: 'Maklumat siaran radio KLP48 Fan Club' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48!

【KLP secret room】 Siaran radio

5 Mei, 7:00 malam (MYT)
Bersama: Devi, Mashiro, Isabel

28 Mei, 7:00 malam (MYT)
Bersama: Yi Shyan, Kei, Alice`,
    },
  },
  34: {
    title: { ms: 'Kenyataan Rasmi: Isu Tempahan Dalam Talian Acara “520 Dinner”' },
    body: {
      ms: `Kami ingin memohon maaf dengan ikhlas kepada semua peminat atas masalah yang berlaku semasa proses tempahan dalam talian untuk acara “520 Dinner with KLP48 Members”.

Kami menganjurkan acara eksklusif ini sebagai tanda penghargaan kepada peminat, terutamanya selepas menerima maklum balas yang sangat positif daripada acara Buka Puasa Dinner pada bulan Mac. Kami amat kesal kerana kesilapan dalam mengendalikan proses tempahan dalam talian telah menyebabkan kesulitan, kekecewaan dan rasa hampa kepada mereka yang ingin kami raikan.

Perkara yang berlaku
Kami ingin menjelaskan sepenuhnya apa yang berlaku:
• Kod QR dikeluarkan terlalu awal: Kami tersilap menyiarkan kod QR Google Form sebelum waktu tempahan rasmi, iaitu 15 Mei 2026 pada 11:00 pagi. Demi memastikan keadilan kepada semua yang menunggu waktu pelancaran rasmi, kami meminta mereka yang membuat tempahan lebih awal untuk menghantar semula tempahan.

• Kod QR berbeza pada hari pelancaran: Apabila waktu rasmi tiba, kami sekali lagi tersilap memaparkan kod QR yang berbeza. Akibatnya, peminat yang menyimpan pautan terdahulu menghadapi ralat dan tidak dapat melengkapkan tempahan.

Komitmen kami
Kami memandang perkara ini dengan serius. Semakan dalaman yang menyeluruh telah dijalankan untuk mengenal pasti kelemahan penyelarasan kami. Kami sedang memperbaiki proses dalaman supaya perkara ini tidak berulang.

Proses bayaran balik untuk peminat terjejas
Bagi mereka yang telah membuat pembayaran tetapi tidak berjaya mendapatkan tempat, kami akan menguruskan bayaran balik penuh dengan segera. Sila e-mel stephany@48ent.my.

Kami amat menghargai sokongan anda terhadap KLP48 dan kesal kerana kali ini kami tidak memenuhi jangkaan anda. Kami akan berusaha melakukan yang lebih baik.

Salam hormat,
Pasukan Pengurusan KLP48`,
    },
  },
  35: {
    title: { ms: 'KLP48 Akan Membuat Persembahan di TOKYO IDOL FESTIVAL 2026' },
    body: {
      ms: `Terima kasih atas sokongan anda yang berterusan dan penuh kehangatan.
Dengan sukacitanya kami mengumumkan bahawa KLP48 akan membuat persembahan di “TOKYO IDOL FESTIVAL 2026 supported by Nishitan Clinic”, festival idola terbesar di dunia yang berlangsung dari 31 Julai hingga 2 Ogos 2026!

◼︎ Maklumat Acara

Nama acara: TOKYO IDOL FESTIVAL 2026 supported by Nishitan Clinic
Tarikh: Jumaat, 31 Julai – Ahad, 2 Ogos 2026
Tempat: Kawasan Odaiba / Aomi

*Maklumat lanjut tentang pentas persembahan, jadual waktu dan acara bertemu peminat akan diumumkan kemudian.

◼︎ Maklumat Tiket
Untuk jadual jualan tiket dan maklumat lanjut, sila rujuk laman web rasmi TIF2026.

Laman web rasmi “TOKYO IDOL FESTIVAL 2026”: https://official.idolfes.com/s/tif2026/

Kami menantikan kehadiran anda semua!`,
    },
  },
  36: {
    title: { ms: 'Kemas Kini Pelancaran Digital “Kerana Ku Suka”' },
    body: {
      ms: `Terima kasih atas sokongan luar biasa terhadap MV baharu KLP48, “Kerana Ku Suka”!
Ahli-ahli kami amat terharu dengan setiap peminat yang menonton MV tersebut dan menyertai parti sambutan MV. Anda semua sangat bermakna buat kami!
Kami ingin berkongsi satu kemas kini kecil. Pelancaran “Kerana Ku Suka” di platform muzik digital, yang pada asalnya dijadualkan pada 1 Jun, akan ditangguhkan sedikit kerana beberapa masalah teknikal.
Berita baiknya, kami menjangkakan penangguhan ini tidak lama — mungkin hanya beberapa hari. Kami akan membuat pengumuman sebaik sahaja lagu ini tersedia di semua platform utama. Ikuti kami supaya anda mengetahuinya terlebih dahulu.
Kami memohon maaf atas kesulitan ini dan menghargai kesabaran anda.
Sementara itu, terus nikmati “Kerana Ku Suka” dengan menonton dan mendengar MV di YouTube!

Pihak Pengurusan KLP48
1 Jun 2026`,
    },
  },
  37: {
    title: { ms: 'Single Baharu KLP48 “Kerana Ku Suka” Kini Tersedia' },
    body: {
      ms: `Single baharu KLP48, “Kerana Ku Suka”, kini rasmi tersedia di semua platform penstriman muzik digital utama!
Terima kasih atas kesabaran anda. Kini anda boleh menambahkan lagu ini ke senarai main dan mendengarnya pada bila-bila masa, di mana-mana sahaja.
Dengarkan sekarang: Spotify • Apple Music • YouTube Music • platform penstriman utama yang lain
Terima kasih atas sokongan anda yang tidak berbelah bahagi. Teruskan mendengar!
Pihak Pengurusan KLP48
3 Jun 2026`,
    },
  },
  38: {
    title: { ms: 'Permohonan TALK 1-on-1 Eksklusif Ahli Premium Bulan Jun Dibuka' },
    body: {
      ms: `Dengan sukacitanya kami mengumumkan bahawa jadual dan tempoh permohonan untuk “TALK 1-on-1 Eksklusif Ahli Premium” bulan Jun telah disahkan.
Permohonan untuk acara ini kini dibuka! Semua ahli Premium layak memohon. Jika anda belum menjadi ahli fan club atau kini merupakan ahli Basic, rebutlah peluang ini untuk menaik taraf keahlian kepada Premium.

[Tempoh Permohonan]
6 Jun, 12:00 tengah hari – 12 Jun, 11:59 malam (MYT)
⸻
20 Jun | TALK 1-on-1 Discord (Generasi Pertama)
6:00 – 7:30 malam: Ann Drea, Salwa, Devi, Tiffany
7:30 – 9:00 malam: Khalies, Hillary, Yi Shyan, Amanda
⸻
21 Jun | TALK 1-on-1 Discord (Generasi Kedua)
6:00 – 7:00 malam: Maia, Tara, Kei, Sharleez, Isabel
7:00 – 8:00 malam: Aisha, Cindy, Joo, Diva
8:00 – 9:00 malam: Alice, Hana, Shu Zhen, Mashiro`,
    },
  },
  39: {
    title: { ms: 'Isu Borang Permohonan TALK 1-on-1 Telah Diselesaikan' },
    body: {
      ms: `Disebabkan masalah teknikal pada borang permohonan, permohonan untuk TALK 1-on-1 tidak dapat dihantar buat sementara waktu.
Borang tersebut kini telah dibaiki dan berfungsi seperti biasa. Jika anda tidak dapat memohon dalam tempoh tersebut, sila hantar semula permohonan melalui borang.
Selepas log masuk ke fan club, ahli Premium boleh menghantar permohonan melalui halaman “Premium Members-Only 1on1 Talk”.
Kami memohon maaf dengan ikhlas atas sebarang kesulitan.`,
    },
  },
  40: { title: { ms: 'Kenyataan Rasmi: Penjelasan Logo “AKT38”' } },
  41: {
    title: { ms: 'Maklumat siaran radio KLP48 Fan Club' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48! 🎙
【KLP secret room】
Siaran radio 🗓️ 5 Ogos, 7:00–7:30 malam 🎙️ Bersama: Tiffany, Hana, Mashiro
Siaran radio 🗓️ 18 Ogos, 7:00–7:30 malam 🎙️ Bersama: Hillary, Ann Drea, Salwa`,
    },
  },
  42: {
    title: { ms: 'PENGUMUMAN RASMI: Cindy Berehat daripada Aktiviti KLP48' },
    body: {
      ms: `PENGUMUMAN RASMI
Cindy Berehat daripada Aktiviti KLP48
Pihak Pengurusan KLP48 ingin memaklumkan kepada para peminat, rakan kongsi dan orang awam bahawa Cindy (KLP48, Generasi Kedua) akan berehat daripada semua aktiviti KLP48 berkuat kuasa serta-merta.
Keputusan ini dibuat atas urusan keluarga yang mendesak dan berlaku secara tiba-tiba. Cindy akan pulang ke Indonesia untuk menjaga ahli keluarga terdekat yang sedang tidak sihat.
Pihak Pengurusan KLP48, kakitangan dan rakan-rakan ahli Cindy memahami sepenuhnya serta menyokong keputusannya untuk mengutamakan keluarga dalam masa yang sukar ini. Kami mendoakan agar ahli keluarganya segera pulih sepenuhnya dan akan terus memberikan perhatian serta sokongan kepada Cindy sepanjang tempoh ini.
Disebabkan tempoh rehat ini, Cindy tidak akan menyertai acara ulang tahun kedua KLP48. Kami memahami berita ini mungkin mengecewakan peminat yang menantikan kehadirannya dan amat menghargai pengertian serta sokongan anda.
Peminat yang telah membeli sesi Meet & Greet bersama Cindy boleh mengunjungi Teater KLP48 untuk memohon salah satu pilihan berikut:

Bayaran balik penuh untuk pas Meet & Greet; atau
Pertukaran pas kepada sesi Meet & Greet bersama ahli KLP48 lain pilihan anda.

Kami memohon agar semua peminat dan orang awam menghormati privasi Cindy dan keluarganya serta memberikan ruang dan masa yang diperlukan untuk bersama keluarga.
Terima kasih atas kasih sayang, pengertian dan sokongan berterusan anda terhadap Cindy dan KLP48.

Pihak Pengurusan KLP48
11 Ogos 2026`,
    },
  },
  43: {
    title: { ms: 'PENGUMUMAN RASMI: Pelantikan Penerbit Baharu' },
    body: {
      ms: `PENGUMUMAN RASMI
Pelantikan Penerbit Baharu
Pihak Pengurusan KLP48 dengan sukacitanya mengumumkan pelantikan Cik Chiaki sebagai Penerbit KLP48.
Dalam peranan ini, Cik Chiaki akan menyelia hala tuju kreatif kumpulan secara keseluruhan dan bekerjasama rapat dengan pihak Pengurusan dalam aktiviti seni, persembahan serta pembangunan ahli KLP48. Pelantikan beliau merupakan langkah penting untuk memperkukuh kepimpinan KLP48 ketika kumpulan memasuki fasa pertumbuhan seterusnya.
Bagi menandakan pelantikan ini, keputusan telah dibuat untuk menghasilkan lagu asli pertama kumpulan. Cik Chiaki akan menulis lirik, manakala Encik Pappara Kawai akan menggubah muzik.
Pihak Pengurusan KLP48 menyambut baik pelantikan Cik Chiaki dan menantikan sumbangan beliau kepada perkembangan serta kejayaan KLP48. Lagu yang dicipta oleh gandingan yang telah mencipta sejarah dalam muzik Jepun ini akan membawa impian ke seluruh Asia. Versi bahasa Jepun akan dipersembahkan buat kali pertama di konsert ulang tahun kedua pada 16 Ogos. Persiapan untuk pelancaran lagu dan tayangan MV pada penghujung Oktober sedang dijalankan. Pada masa hadapan, lagu ini akan dikeluarkan dalam pelbagai bahasa, terutamanya bahasa Melayu.
Pihak Pengurusan KLP48 mengalu-alukan Cik Chiaki dan menantikan sumbangan beliau kepada pertumbuhan serta kejayaan KLP48.

Pihak Pengurusan KLP48
2 Ogos 2026

KENYATAAN
Pesanan daripada Chiaki – Penerbit KLP48
Saya berbesar hati untuk mengumumkan bahawa, melalui beberapa kebetulan yang begitu bermakna, saya telah dilantik sebagai Penerbit KLP48.
Lagu asli pertama kumpulan akan digubah oleh Pappara Kawai dengan lirik oleh saya. Saya juga akan mengurus aspek visual, termasuk kostum, rambut dan solekan, serta konsep keseluruhan.
Lagu-lagu akan datang akan dikeluarkan dalam pelbagai bahasa, terutamanya bahasa Melayu.
Setiap ahli berasal dari negara, bahasa dan latar belakang yang berbeza, namun impian mereka sama di seluruh dunia.
Saya akan menyokong gadis-gadis ini yang bekerja keras. Saya amat menghargai sokongan anda. Terima kasih atas sokongan berterusan anda.

Chiaki
Penerbit KLP48
2 Ogos 2026`,
    },
  },
  44: {
    title: {
      ms: 'PENGUMUMAN RASMI: Pelantikan Penerbit Baharu',
      en: 'OFFICIAL ANNOUNCEMENT: Appointment of New Producer',
    },
    body: {
      en: `OFFICIAL ANNOUNCEMENT
Appointment of New Producer
KLP48 Management is pleased to announce the appointment of Ms. Chiaki as Producer of KLP48.
In this role, Ms. Chiaki will oversee the group’s overall creative direction, working closely with Management on KLP48’s artistic activities, performances, and member development. Her appointment marks an important step in strengthening KLP48’s leadership as the group enters its next phase of growth.
To mark this occasion, the production of the group's first original song has been decided. Ms. Chiaki will write the lyrics, and Mr. Pappara Kawai will compose the music.
KLP48 Management wholeheartedly welcomes Ms. Chiaki and looks forward to her contribution to KLP48's further growth and success. This song, created by a duo that has made history in Japanese music, will carry dreams to Asia. The Japanese version will be premiered at the 2nd Anniversary Live on August 16th, and preparations are underway for the release and MV unveiling at the end of October. The song will be released in multiple languages, primarily Malay, in the future.
KLP48 Management warmly welcomes Ms. Chiaki and looks forward to her contributions to the further growth and success of KLP48.

KLP48 Management
2 August, 2026

STATEMENT
A Message from Chiaki – KLP48 Producer
I am pleased to announce that, through a series of fortunate circumstances, I have been appointed as the producer of KLP48.
The group's first original song will be composed by Pappara Kawai, with lyrics by me. I will also be in charge of the visual aspects, including costumes, hair and makeup, as well as the overall concept.
Future songs will be released in multiple languages, primarily Malay.
Each member comes from a different country, speaks a different language, and has different roots, but their dreams are the same all over the world.
I will support these girls who are working hard. I would be grateful for your support. Thank you for your continued support.

Chiaki
KLP48 Producer
2 August, 2026`,
    },
  },
  45: {
    title: { ms: 'Maklumat siaran radio KLP48 Fan Club' },
    body: {
      ms: `Berikut ialah jadual siaran radio akan datang di Discord Fan Club KLP48! 🎙
【KLP secret room】
Siaran radio 🗓️ 4 September, 7:00–7:30 malam 🎙️ Bersama: Devi, Hillary, Yi Shyan
Siaran radio 🗓️ 14 September, 7:00–7:30 malam 🎙️ Bersama: Joo, Isabel, Alice`,
    },
  },
  46: {
    title: { ms: 'Permohonan TALK 1-on-1 Eksklusif Ahli Premium Bulan September Dibuka' },
    body: {
      ms: `Dengan sukacitanya kami mengumumkan bahawa jadual dan tempoh permohonan untuk “TALK 1-on-1 Eksklusif Ahli Premium” bulan September telah disahkan.

Tempoh Permohonan: 10 September, 12:00 tengah hari – 17 September, 11:59 malam (MYT)

⸻

26 September | TALK 1-on-1 Discord (Generasi Kedua)
6:00 – 7:00 malam: Aisha, Joo, Diva, Shu Zhen
7:00 – 8:00 malam: Hana, Tara, Kei, Sharleez, Isabel
8:00 – 9:00 malam: Alice, Maia, Mashiro

⸻

27 September | TALK 1-on-1 Discord (Generasi Pertama)
6:00 – 7:00 malam: Khalies, Hillary, Yi Shyan, Amanda
7:00 – 8:00 malam: Ann Drea, Salwa, Devi, Tiffany`,
    },
  },
  47: {
    title: { ms: 'Pengumuman: KLP48 di Nihon Live, Nihon Matsuri' },
    body: {
      ms: `Pengumuman
KLP48 di Nihon Live, Nihon Matsuri
Kami dukacita memaklumkan bahawa Devi tidak dapat menyertai Nihon Live pada 24 Oktober 2026. Atas urusan peribadi, beliau telah pulang ke Indonesia dan tidak dapat kembali tepat pada masanya untuk acara tersebut.
Amanda akan menggantikan Devi dalam acara ini.
Kami memohon maaf kepada semua peminat Devi atas perubahan ini dan sebarang kekecewaan yang mungkin timbul. Terima kasih atas pengertian dan sokongan berterusan anda terhadap KLP48.

Pihak Pengurusan KLP48
22 Oktober 2026`,
    },
  },
  48: {
    title: { ms: 'Pengumuman: KLP48 di Nihon Live, Nihon Matsuri' },
    body: {
      ms: `Pengumuman
KLP48 di Nihon Live, Nihon Matsuri
Kami dukacita memaklumkan bahawa Tara kurang sihat dan tidak dapat menyertai Nihon Live pada 24 Oktober 2026.
Alice akan menggantikan Tara dalam acara ini.
Kami memohon maaf kepada semua peminat Tara atas perubahan ini dan sebarang kekecewaan yang mungkin timbul. Terima kasih atas pengertian dan sokongan berterusan anda terhadap KLP48.

Pihak Pengurusan KLP48
24 Oktober 2026`,
    },
  },
};

export function getNewsArticleId(link: string) {
  const match = link.match(/\/detail\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

export function getLocalizedNewsTitle(
  link: string,
  originalTitle: string,
  lang: Lang
) {
  const id = getNewsArticleId(link);
  return (id && NEWS_TRANSLATIONS[id]?.title?.[lang]) || originalTitle;
}

export function getLocalizedNewsCategory(category: string, lang: Lang) {
  if (lang === 'en') return category;

  const categories: Record<string, string> = {
    News: 'Berita',
    Fanclub: 'Kelab Peminat',
    Store: 'Kedai',
    LIVE: 'LIVE',
  };

  return categories[category] ?? category;
}

export function getLocalizedNewsBody(
  id: number,
  originalBody: string,
  lang: Lang
) {
  return NEWS_TRANSLATIONS[id]?.body?.[lang] ?? originalBody;
}
