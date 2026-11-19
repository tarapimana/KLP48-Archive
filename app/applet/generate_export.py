import os
import zipfile
import json

output_zip = '/app/applet/public/arkib-klp48-export.zip'
output_json = '/app/applet/public/klp48-complete-dataset.json'

# Gather JSON dataset representation of KLP48 archive
members_data = [
    {"nama": "Yi Shyan", "nama_penuh": "Foo Yi Shyan", "tarikh_lahir": "28 Jun", "tahun_lahir": "2004", "gen": "1", "status": "aktif", "x": "Yishyan_klp48", "instagram": "yishyan_klp48", "tiktok": "https.shyan"},
    {"nama": "Yurina", "nama_penuh": "Yurina Gyoten", "tarikh_lahir": "14 Mac", "tahun_lahir": "1999", "gen": "1", "status": "graduated", "nota_status": "Kembali ke AKB48 (28 Feb 2026)", "x": "tenten_yurina", "instagram": "yurina.0314", "tiktok": "yurina_gyoten0314"},
    {"nama": "Haruka", "nama_penuh": "Haruka Kurosu", "tarikh_lahir": "28 Feb", "tahun_lahir": "2001", "gen": "1", "status": "graduated", "nota_status": "Kembali ke AKB48 (28 Feb 2026)", "x": "kurooosu_48_16", "instagram": "hachan_haruka", "tiktok": "haachan_xxx"},
    {"nama": "Suzuha", "nama_penuh": "Suzuha Yamane", "tarikh_lahir": "11 Ogos", "tahun_lahir": "2000", "gen": "1", "status": "graduated", "nota_status": "Kembali ke AKB48 (28 Feb 2026)", "x": "48Suzuha_16LOVE", "instagram": "suzuha48yamane16", "tiktok": "zunchan48"},
    {"nama": "Cocoa", "nama_penuh": "Kokoa Kai", "tarikh_lahir": "28 Nov", "tahun_lahir": "2003", "gen": "1", "status": "graduated", "nota_status": "Kembali ke STU48 (28 Feb 2026)", "x": "k_cocoa1128", "instagram": "k_cocoa1128", "tiktok": "k_cocoa1128"},
    {"nama": "Devi", "nama_penuh": "Made Devi Ranita Ningtara", "tarikh_lahir": "18 Nov", "tahun_lahir": "2000", "gen": "1", "status": "aktif", "x": "ningtaradevi", "instagram": "ningtaradevi", "tiktok": "ningtaradevi"},
    {"nama": "Amanda", "nama_penuh": "Elley Amanda Wong", "tarikh_lahir": "13 Feb", "tahun_lahir": "2007", "gen": "1", "status": "aktif", "x": "Amanda_Klp48", "instagram": "elleyamanda.klp48", "tiktok": "amand4ily"},
    {"nama": "Ann Drea", "nama_penuh": "Ann Drea Tey", "tarikh_lahir": "6 Ogos", "tahun_lahir": "2008", "gen": "1", "status": "aktif", "x": "anndrea_klp48", "instagram": "anndrea.klp48", "tiktok": "anndreaerdnnna"},
    {"nama": "Hillary", "nama_penuh": "Shuen Hiu Yau", "tarikh_lahir": "22 Nov", "tahun_lahir": "2008", "gen": "1", "status": "aktif", "x": "klp48hillary", "instagram": "hillary.klp48", "tiktok": "riririly"},
    {"nama": "Khalies", "nama_penuh": "Tan Zi Tong", "tarikh_lahir": "27 Ogos", "tahun_lahir": "2008", "gen": "1", "status": "aktif", "x": "khaliesklp48", "instagram": "khalies.klp48", "tiktok": "catlies_rawrr"},
    {"nama": "Salwa", "nama_penuh": "Salwa Sunanda", "tarikh_lahir": "17 Jul", "tahun_lahir": "2007", "gen": "1", "status": "aktif", "x": "Salwa__klp48", "instagram": "salwa_.klp48", "tiktok": "ruruwa._"},
    {"nama": "Tiffany", "nama_penuh": "Elvyone Tiffany Ticha Anak Donaldin", "tarikh_lahir": "23 Sep", "tahun_lahir": "2009", "gen": "1", "status": "aktif", "x": "tiffanyklp48", "instagram": "tiffany.klp48", "tiktok": "chuffany"},
    {"nama": "Lucine", "nama_penuh": "Mireille Chin Yi Ling", "tarikh_lahir": "11 Nov", "tahun_lahir": "2004", "gen": "1", "status": "graduated", "nota_status": "Graduasi 19 Okt 2025", "instagram": "lucine.klp48", "tiktok": "luvlucine"},
    {"nama": "Maia", "nama_penuh": "Maia Fae Chong", "tarikh_lahir": "6 Okt", "tahun_lahir": "2010", "gen": "2", "status": "aktif", "x": "maia_klp48", "instagram": "maia.klp48", "tiktok": "maia.klp48"},
    {"nama": "Mashiro", "nama_penuh": "Mashiro Ueda", "tarikh_lahir": "29 Jan", "tahun_lahir": "2003", "gen": "2", "status": "aktif", "x": "mashiro_klp48", "instagram": "mashiro_klp48", "tiktok": "mashiro.klp48"},
    {"nama": "Sharleez", "nama_penuh": "Sharifah Sharleez Binti Syed Affendi", "tarikh_lahir": "19 Feb", "tahun_lahir": "2009", "gen": "2", "status": "aktif", "x": "sharleez_klp48", "instagram": "sharleez.klp48", "tiktok": "sharleez.klp48"},
    {"nama": "Shu Zhen", "nama_penuh": "Kuak Shu Zhen", "tarikh_lahir": "20 Ogos", "tahun_lahir": "2001", "gen": "2", "status": "aktif", "x": "shuzhen_klp48", "instagram": "shuzhen.klp48", "tiktok": "shuzhen.klp48"},
    {"nama": "Tara", "nama_penuh": "Tara Tan", "tarikh_lahir": "2 Ogos", "tahun_lahir": "2010", "gen": "2", "status": "aktif", "x": "tara_klp48", "instagram": "tara.klp48", "tiktok": "tara.klp48"},
    {"nama": "Aisha", "nama_penuh": "Turysbek Aisha", "tarikh_lahir": "25 Mei", "tahun_lahir": "2008", "gen": "2", "status": "aktif", "x": "aisha_klp48", "instagram": "aisha.klp48", "tiktok": "aisha.klp48"},
    {"nama": "Alice", "nama_penuh": "Alice Wong Vei Yew", "tarikh_lahir": "30 Apr", "tahun_lahir": "2004", "gen": "2", "status": "aktif", "x": "alice_klp48", "instagram": "alice.klp48", "tiktok": "alice.klp48"},
    {"nama": "Cindy", "nama_penuh": "Cindy Alexandria", "tarikh_lahir": "17 Mei", "tahun_lahir": "2008", "gen": "2", "status": "non-active", "nota_status": "Hiatus sejak 11 Ogos 2026", "x": "cindy_klp48", "instagram": "cindy.klp48", "tiktok": "cindy.klp48"},
    {"nama": "Diva", "nama_penuh": "Diva Nurhaliza", "tarikh_lahir": "11 Mei", "tahun_lahir": "2004", "gen": "2", "status": "aktif", "x": "diva_klp48", "instagram": "diva.klp48", "tiktok": "diva.klp48"},
    {"nama": "Hana", "nama_penuh": "Sekar Wejayanti Mumtahanah", "tarikh_lahir": "24 Feb", "tahun_lahir": "2004", "gen": "2", "status": "aktif", "x": "hana_klp48", "instagram": "hana.klp48", "tiktok": "hana.klp48"},
    {"nama": "Isabel", "nama_penuh": "Wee Xi Ting", "tarikh_lahir": "11 Sep", "tahun_lahir": "2008", "gen": "2", "status": "aktif", "x": "isabel_klp48", "instagram": "isabel.klp48", "tiktok": "isabel.klp48"},
    {"nama": "Joo", "nama_penuh": "Jocelyna Marcelly", "tarikh_lahir": "27 Nov", "tahun_lahir": "2005", "gen": "2", "status": "aktif", "x": "jocelyna_klp48", "instagram": "jocelyna.klp48", "tiktok": "jocelyna.klp48"},
    {"nama": "Kei", "nama_penuh": "Kei Annisa Adnan", "tarikh_lahir": "16 Apr", "tahun_lahir": "2009", "gen": "2", "status": "aktif", "x": "kei_klp48", "instagram": "kei.klp48", "tiktok": "kei.klp48"}
]

dataset = {
    "project": "Arkib KLP48",
    "version": "1.0.0",
    "members": members_data
}

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

# Create ZIP archive
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add data and i18n
    for root, dirs, files in os.walk('/app/applet/src'):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, '/app/applet')
            zipf.write(full_path, rel_path)
            
    # Add public images
    for root, dirs, files in os.walk('/app/applet/public/images'):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, '/app/applet')
            zipf.write(full_path, rel_path)
            
    # Add dataset JSON
    zipf.write(output_json, 'public/klp48-complete-dataset.json')
    
    # Add metadata
    if os.path.exists('/app/applet/metadata.json'):
        zipf.write('/app/applet/metadata.json', 'metadata.json')
    if os.path.exists('/app/applet/package.json'):
        zipf.write('/app/applet/package.json', 'package.json')

print("Successfully generated export zip and JSON dataset.")
