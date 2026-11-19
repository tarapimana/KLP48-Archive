export type RouteKey = 'home' | 'live' | 'jadwal' | 'member' | 'berita' | 'bday' | 'video';

export interface ReleaseItem {
  title: string;
  date?: string;
  type?: 'Album' | 'Single' | 'EP';
  artworkUrl?: string;
  video?: VideoItem;
}

export interface VideoItem {
  title: string;
  url: string;
  platform: 'youtube' | 'tiktok';
  youtubeId?: string;
  youtubePlaylistId?: string;
  tiktokId?: string;
  thumbnail?: string;
  publishedAt?: string;
}

export interface ScheduleRawItem {
  id?: string;
  tarikh_mula: string;
  tarikh_tamat: string;
  tajuk: string;
  tajuk_en?: string;
  lokasi: string;
  lokasi_en?: string;
  masa?: string;
  masa_en?: string;
  jenis: string;
  eksklusif: string;
  nota: string;
  nota_en?: string;
  members?: string;
  pautan?: string;
}

export type MemberStatusCategory = 'active' | 'graduated' | 'non-active';

export interface MemberItem {
  id: string;
  nama: string;
  nama_penuh: string;
  tarikh_lahir: string;
  tarikh_lahir_en?: string;
  tahun_lahir: string;
  gen: string;
  birthplace?: string;
  catchphrase?: string;
  status: string;
  statusCategory: MemberStatusCategory;
  nota_status: string;
  nota_status_en?: string;
  gambar: string;
  x: string;
  instagram: string;
  tiktok: string;
}

export const CANONICAL_ACTIVE_MEMBER_IDS = [
  'yi_shyan',
  'devi',
  'amanda',
  'ann_drea',
  'hillary',
  'khalies',
  'salwa',
  'tiffany',
  'maia',
  'mashiro',
  'sharleez',
  'shu_zhen',
  'tara',
  'aisha',
  'alice',
  'diva',
  'hana',
  'isabel',
  'joo',
  'kei',
] as const;

export type CanonicalActiveMemberId = typeof CANONICAL_ACTIVE_MEMBER_IDS[number];

export interface NewsItem {
  tajuk: string;
  tarikh: string;
  kategori: string;
  pautan: string;
}

export interface LivePostItem {
  masa: string;
  platform: 'tiktok' | 'instagram';
  member: string;
  teks: string;
  teks_en?: string;
  pautan: string;
  tiktokId?: string;
  thumbnail?: string;
}

export const OFFICIAL_SITE_URL = 'https://klp48.my';

export const RELEASES: ReleaseItem[] = [
  {
    title: 'Heavy Rotation',
    date: '2024.08.14',
    type: 'Single',
    artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e20d55b107705d2d134e42e4',
    video: {
      title: 'Heavy Rotation',
      url: 'https://music.youtube.com/watch?v=LhZxvaEkLAw',
      platform: 'youtube',
      youtubeId: 'LhZxvaEkLAw',
    },
  },
  {
    title: 'Alasanku Maybe',
    date: '2025.04.18',
    type: 'Single',
    artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02397615ff4016ec0a9eca7a0b',
    video: {
      title: 'Alasanku Maybe',
      url: 'https://music.youtube.com/watch?v=5UUrLmMuWoE',
      platform: 'youtube',
      youtubeId: '5UUrLmMuWoE',
    },
  },
  {
    title: 'Flying Get',
    date: '2025.05.31',
    type: 'Single',
    artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e022ee35c4b03821badec202300',
    video: {
      title: 'Flying Get',
      url: 'https://music.youtube.com/watch?v=u3vn8JIQ0mY',
      platform: 'youtube',
      youtubeId: 'u3vn8JIQ0mY',
    },
  },
  {
    title: 'First Cry',
    date: '2025.06.13',
    type: 'EP',
    artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d2a06fd9f46c0589e19f55e2',
    video: {
      title: 'First Cry',
      url: 'https://music.youtube.com/playlist?list=OLAK5uy_lLAigpr63fL7Vj6XuujY29MafXiwKz-UA',
      platform: 'youtube',
      youtubePlaylistId: 'OLAK5uy_lLAigpr63fL7Vj6XuujY29MafXiwKz-UA',
    },
  },
  {
    title: 'Oh my pumpkin!',
    date: '2025.08.13',
    type: 'Single',
    artworkUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02610eb27873fa0a9cdf655baa',
    video: {
      title: 'Oh my pumpkin!',
      url: 'https://music.youtube.com/watch?v=gbcM2A3aU34',
      platform: 'youtube',
      youtubeId: 'gbcM2A3aU34',
    },
  },
  {
    title: 'Green Flash',
    date: '2025.09.12',
    type: 'Album',
    artworkUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b56bb0f1fd0bba21afc5c9af',
    video: {
      title: 'Green Flash',
      url: 'https://music.youtube.com/watch?v=3SqbNRLUQtA',
      platform: 'youtube',
      youtubeId: '3SqbNRLUQtA',
    },
  },
  {
    title: 'Kerana Ku Suka',
    date: '2026.06.02',
    type: 'Single',
    artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e027827e60a33737fb444efaa26',
    video: {
      title: 'Kerana Ku Suka',
      url: 'https://music.youtube.com/watch?v=p73lJfaNphY',
      platform: 'youtube',
      youtubeId: 'p73lJfaNphY',
    },
  },
  {
    title: 'Full Power! Pokémon Mezastar! Gorgeous Star',
    date: '2026.10.31',
    type: 'Single',
    artworkUrl: 'https://i.ytimg.com/vi/o9CpUmbJKoo/hq720.jpg?sqp=-oaymwFFCNAFEJQDSFryq4qpAzcIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGEUgPCh_MA-4AvcY&rs=AOn4CLBlVIJJVnwQUQ-G03Mc9NbId6_pHA',
    video: {
      title: 'Full Power! Pokémon Mezastar! Gorgeous Star',
      url: 'https://www.youtube.com/watch?v=o9CpUmbJKoo',
      platform: 'youtube',
      youtubeId: 'o9CpUmbJKoo',
    },
  },
];

const RAW_VIDEOS: Array<[string, string, string?]> = [
  ["Heavy Rotation | 2026.11.15 KLP48 @ Jaguh Rakan Muda Musim ke-2 (Hextar World @ Empire City)", "https://www.youtube.com/watch?v=-L3sgYIx0g4"],
  ["Heavy Rotation KLP48 - Jaguh Rakan Muda Musim ke-2 available on our Official YouTube Channel #KLP48 #jaguhrakanmuda", "https://www.tiktok.com/@klp48_official/video/7709437828459007239", "/images/tiktok/7709437828459007239.jpg"],
  ["First time performing on national TV, and the energy was unreal!! 📺✨ Terima kasih sangat-sangat kepada semua fans yang turun padang support kami untuk Jaguh Rakan Muda Musim Ke-2. #JaguhRakanMuda #KLP48 #KBS #nationaltvdebut", "https://www.tiktok.com/@klp48_official/video/7709110759854230785", "/images/tiktok/7709110759854230785.jpg"],
  ["🎉 KLP48 IS COMING TO THE 2ND OUTLET OF 100 HOURS CURRY! 🎊 4 more days to go!!! 😋🏃🏻‍♂️🏃🏻‍♀️ Join us for a special Opening Ceremony featuring KLP48 members! 📅 21 November 2026 (Saturday) ⏰ 11:00 AM 〜 1:00PM 📍 100 Hours Curry, Plaza Mont Kiara 💚💚 #KLP48 #KLP48x100HoursCurry", "https://www.tiktok.com/@klp48_official/video/7708960929995689237", "/images/tiktok/7708960929995689237.jpg"],
  ["Coming soon👀 28th November 2026 #KLP48 #USJ", "https://www.tiktok.com/@klp48_official/video/7708615793566616884", "/images/tiktok/7708615793566616884.jpg"],
  ["Here is some bloopers when we are the promo~ Come watch us perform at Centre Court, Hextar World at Empire City, or catch us live on Saluran Okey or the RTM Klik app! 📺 #klp48 #jaguhrakanmuda2026 #jaguhrakanmudamusim2", "https://www.tiktok.com/@klp48_official/video/7707920824841293076", "/images/tiktok/7707920824841293076.jpg"],
  ["261107&08 ACG Matsuri Day 1 & Day 2 at ACG Matsuri—DONE! 🎉 Huge thank you to everyone who showed up, cheered us on, and brought the hype both days. 🔥✨ #ACGMatsuri #KLP48 #MaisondeQueen #Angevil", "https://www.tiktok.com/@klp48_official/video/7707580250334563604", "/images/tiktok/7707580250334563604.jpg"],
  ["Coming soon👀 28th November 2026 #KLP48 #USJ (Part 1)", "https://www.tiktok.com/@klp48_official/video/7707528112245951750", "/images/tiktok/7707528112245951750.jpg"],
  ["261031 & 261101 Pokémon Mezastar Event⚡️✨ A massive THANK YOU to everyone who came out to play and support us at the Pokémon Mezastar event over these past 2 days! 🌟🎮 #PokémonMezastar #KLP48", "https://www.tiktok.com/@klp48_official/video/7706864898130677012", "/images/tiktok/7706864898130677012.jpg"],
  ["AEON KL Midtown soft opening was one for the books! 💥 Shout-out to everyone who packed out on the performance. Thank you, Aeon, for inviting us! #KLP48 #AEONKLMidtown", "https://www.tiktok.com/@klp48_official/video/7706471308023909652", "/images/tiktok/7706471308023909652.jpg"],
  ["The countdown begins! 🏁🔥 We’re performing at the Jaguh Rakan Muda Musim Ke-2 Grand Finale Live Show at MYNISS, Hextar World at Empire City! 📺 #KLP48 #jaguhrakanmudaseason2 #rtmklik #saluranokey", "https://www.tiktok.com/@klp48_official/video/7704879177069251861", "/images/tiktok/7704879177069251861.jpg"],
  ["Borak²です! EP1: Search bar of Diva KLP48", "https://www.youtube.com/watch?v=bKD-ctOWOvQ"],
  ["Here Comes Pokémon MEZASTAR!! featuring KLP48", "https://www.youtube.com/watch?v=o9CpUmbJKoo"],
  ["Shu Zhen Birthday Party Highlight [28.08.2026]", "https://www.youtube.com/watch?v=WZ4dLkNjnyY"],
  ["[Official Performance video] KLP48 @ Bilibili World 2026 (10.07.2026)", "https://www.youtube.com/watch?v=VW23eKf9eqY"],
  ["Jeritan Permata Intan (Oogoe Diamond) Members Selection Announcement", "https://www.youtube.com/watch?v=C9M0jikyehE"],
  ["FIRST JAPAN EXPO!!! | a day in a life of an IDOL? 😳⁉️", "https://www.youtube.com/watch?v=feQ6ETgG2Ac"],
  ["Kerana Ku Suka | 2025.12.27 KLP48 1st Solo Concert \"SUPER BASH\" (MALAYSIA/JIO SPACE)", "https://www.youtube.com/watch?v=r_6QO_T92BU"],
  ["Single ke-6 KLP48 “Kerana Ku Suka” #KLP48", "https://www.tiktok.com/@klp48_official/video/7645993560872897812", "/images/tiktok/7645993560872897812.jpg"],
  ["[MV] Kerana Ku Suka - Kimino Kotoga Suki Dakara / KLP48", "https://www.youtube.com/watch?v=EDliuALaUm0"],
  ["[MV Teaser] Kerana Ku Suka - Kimino Kotoga Suki Dakara / KLP48", "https://www.youtube.com/watch?v=v1Qj2uiBSjA"],
  ["TIF concert Result Announcement", "https://www.youtube.com/watch?v=RlKbEa8pyHU"],
  ["260508 - 260511 Recap Video + Announcement?", "https://www.youtube.com/watch?v=LtMtG7l3YEQ"],
  ["A day with Kei! Too many random things in one day… Which part caught your attention? 👀 #Klp48", "https://www.youtube.com/watch?v=widKxaKg7Rk"],
  ["Penang Vlog with Amanda", "https://www.youtube.com/watch?v=zCfgyveDIQQ"],
  ["KLP48 Theatre Show Interview with Salwa #KLP48 #shorts", "https://www.youtube.com/watch?v=foIdCbntKL4"],
  ["KLP48 TIME EP3 - Green Flash Recording BTS -", "https://www.youtube.com/watch?v=Ys9RQ79b2GU"],
  ["KLP Play! ep.2 - Werewolf", "https://www.youtube.com/watch?v=bJq8w7sAQas"],
  ["Green Flash | 2025.08.16 KLP48 1st Anniversary Concert \"BLOOM\" (MALAYSIA/Zepp Kuala Lumpur)", "https://www.youtube.com/watch?v=-P5BfkU5yQo"],
  ["Oh my pumpkin! | 2025.08.16 KLP48 1st Anniversary Concert \"BLOOM\" (MALAYSIA/Zepp Kuala Lumpur)", "https://www.youtube.com/watch?v=cQEq-t0JT-s"],
  ["KLP Play! ep.1 - UNO!", "https://www.youtube.com/watch?v=Yvc21EpVdhs"],
  ["KLP48 - Alasanku Maybe Dance Practice", "https://www.youtube.com/watch?v=ptxiIdbQin8"],
  ["KLP48 Overture Fanchant Tutorial", "https://www.youtube.com/watch?v=0-Hz9HgAhGY"],
  ["KLP48 - Heavy Rotation Dance Practice", "https://www.youtube.com/watch?v=pzQlhroXtfc"],
  ["KLP48 - Shonichi Dance Practice", "https://www.youtube.com/watch?v=z9B3_P41qa4"],
  ["KLP48 1st Anniversary Concert BLOOM", "https://www.youtube.com/watch?v=tdVm-OufUFU"],
  ["KLP48 - Namida Surprise Dance Practice", "https://www.youtube.com/watch?v=OkJp0NQLbz8"],
  ["KLP48 - High Tension Dance Practice", "https://www.youtube.com/watch?v=u789_b-nq2Q"],
  ["KLP48 - Aitakatta Dance Practice", "https://www.youtube.com/watch?v=TwhxG-Ek0qg"],
  ["KLP48 AUDITION Member Interview【Amanda】#shorts", "https://www.youtube.com/watch?v=opq1or96lTo"],
  ["KLP48 AUDITION Member Interview【Devi】#shorts", "https://www.youtube.com/watch?v=kGNuC-Lt-R4"],
  ["KLP48 AUDITION Member Interview【Yi Shyan】#shorts", "https://www.youtube.com/watch?v=Q2SoJb5PGs0"],
  ["KLP48 AUDITION Member Interview【Yurina】#shorts", "https://www.youtube.com/watch?v=jnVycSYDv0k"],
  ["KLP48 2nd Generation Audition", "https://www.youtube.com/watch?v=NV-YXelftxw"],
  ["What made Suzuha join KLP48? Applications open 1 July 2025 klp48audition.com #KLP48 #KLP482ndGenAudition 📅", "https://www.tiktok.com/@klp48_official/video/7524651758690356487", "/images/tiktok/7524651758690356487.jpg"],
  ["KLP48 TIME EP2", "https://www.youtube.com/watch?v=PnIXsIMy9to"],
  ["#AlasankuMaybeKLP48", "https://www.youtube.com/watch?v=FAGf9VzkK7I"],
  ["Who Will Win?? Part 3", "https://www.youtube.com/watch?v=FlBBO6Iz-do"],
  ["Who Will Win?? Part 2", "https://www.youtube.com/watch?v=HrLLMlcSIyQ"],
  ["Who Will Win?? Part 1", "https://www.youtube.com/watch?v=mmqoKqBIMFA"],
  ["Battle Round 1 - Suzuha vs Tiffany", "https://www.youtube.com/watch?v=Hcvcbf1PsoI"],
  ["Battle Round 1 - Devi vs Amanda", "https://www.youtube.com/watch?v=eOwzd2fdbtU"],
  ["Battle Round 1 - Cocoa vs Lucine", "https://www.youtube.com/watch?v=aMoWXqkMjBs"],
  ["KLP TIME EP1", "https://www.youtube.com/watch?v=-Rcx1vTAncI"],
  ["Don’t Give Them New Ideas", "https://www.youtube.com/watch?v=SOPPRaz01jg"],
  ["WHAT SUPER POWER WOULD YOU WANT?", "https://www.youtube.com/watch?v=PbhQ1oYK_lo"],
  ["[KLP48 Debut Stage] Heavy Rotation Zepp Kuala Lumpur 2024", "https://www.youtube.com/watch?v=CnC8-E4d62o"],
  ["[MV] Heavy Rotation / KLP48", "https://www.youtube.com/watch?v=qxb0khjTLRU"],
  ["[MV TEASER] Heavy Rotation / KLP48", "https://www.youtube.com/watch?v=mcAN_q8zhww"],
  ["KLP48 1st Generation Members Introduction", "https://www.youtube.com/watch?v=BFi92onrWDI"],
];

function tiktokTimestampIso(tiktokId?: string): string | undefined {
  if (!tiktokId) return undefined;
  try {
    const unixSec = Number(BigInt(tiktokId) >> 32n);
    if (!Number.isFinite(unixSec) || unixSec <= 0) return undefined;
    return new Date(unixSec * 1000).toISOString();
  } catch {
    return undefined;
  }
}

export const VIDEOS: VideoItem[] = RAW_VIDEOS.map(([title, url, thumbnail]) => {
  const isTikTok = /tiktok\.com/.test(url);
  const ytMatch = url.match(/[?&]v=([\w-]{6,})/);
  const ttMatch = url.match(/\/video\/(\d+)/);
  const tiktokId = ttMatch ? ttMatch[1] : undefined;
  return {
    title,
    url,
    platform: isTikTok ? 'tiktok' : 'youtube',
    youtubeId: ytMatch ? ytMatch[1] : undefined,
    tiktokId,
    thumbnail,
    publishedAt: tiktokTimestampIso(tiktokId),
  };
});

export const SCHEDULE_DATA: ScheduleRawItem[] = [
  { tarikh_mula: "2026-11-01", tarikh_tamat: "", tajuk: "Mini Live Show", lokasi: "KLP48 Theatre, LaLaport BBCC Level 2", masa: "1:00 petang – 2:00 petang", masa_en: "1:00 PM – 2:00 PM", jenis: "show", eksklusif: "", nota: "", members: "Amanda, Devi, Hillary, Khalies, Salwa, Yi Shyan, Aisha, Diva, Maia, Mashiro, Sharleez & Shu Zhen", pautan: "https://www.instagram.com/p/DfEvkSviQhr/?bqrl=cHB6MTVtcHM1bGlt" },
  { tarikh_mula: "2026-11-01", tarikh_tamat: "", tajuk: "Pokemon Mezastar Festival", lokasi: "Wow Plaza, GF, Lalaport BBCC", masa: "4:00 petang – 8:00 malam", masa_en: "4:00 PM – 8:00 PM", jenis: "event", eksklusif: "", nota: "", members: "Hana, Alice, Isabel, Joo & Tara", pautan: "https://www.instagram.com/p/De_iJ3PEu2J/?img_index=3&gwpx=MTBmdnNwbXQwanExcw==" },
  { tarikh_mula: "2026-11-01", tarikh_tamat: "", tajuk: "Spook-tacle Halloween Weekend Meet & Greet", lokasi: "KLP48 M&G Venue, West Atrium Walkway, GF, LaLaport BBCC", masa: "5:00 petang – 6:00 petang", masa_en: "5:00 PM – 6:00 PM", jenis: "event", eksklusif: "", nota: "", nota_en: "", members: "Salwa, Kei, Maia & Yi Shyan", pautan: "https://www.instagram.com/p/De_abAKJWIy/?jplx=MTNnOTh4em5iamQ2cQ==" },
  { tarikh_mula: "2026-11-01", tarikh_tamat: "", tajuk: "Meet & Creep: The Spooky Cheki", tajuk_en: "Meet & Creep: The Spooky Cheki", lokasi: "KLP48 Theatre, LaLaport BBCC Level 2", lokasi_en: "KLP48 Theatre, LaLaport BBCC Level 2", masa: "6:30 petang – 7:45 malam", masa_en: "6:30 PM – 7:45 PM", jenis: "event", eksklusif: "", nota: "", nota_en: "", members: "Kei, Salwa, Maia & Yi Shyan", pautan: "https://www.instagram.com/p/DfGxgVZJWyj/?gwpx=MW1leXEwdzQ1dzl5eQ==" },
  { tarikh_mula: "2026-11-05", tarikh_tamat: "", tajuk: "Discord Radio", lokasi: "Eksklusif Fan Club", lokasi_en: "Fan Club Exclusive", jenis: "event", eksklusif: "ya", nota: "" },
  { tarikh_mula: "2026-11-05", tarikh_tamat: "", tajuk: "AEON MALL KL Midtown Grand Opening", lokasi: "AEON MALL KL Midtown", masa: "6:00 petang – 6:15 petang", masa_en: "6:00 PM – 6:15 PM", jenis: "event", eksklusif: "", nota: "", members: "Hana, Isabel, Diva, Amanda, Devi & Salwa", pautan: "https://www.instagram.com/p/DfTaFcfj-ni/?jplx=MWFiMWpidWltOHZteg==" },
  { tarikh_mula: "2026-11-06", tarikh_tamat: "", tajuk: "AEON MALL KL Midtown Grand Opening", lokasi: "AEON MALL KL Midtown", masa: "6:00 petang – 6:15 petang", masa_en: "6:00 PM – 6:15 PM", jenis: "event", eksklusif: "", nota: "", members: "Alice, Khalies, Mashiro, Yi Shyan, Ann Drea & Hillary", pautan: "https://www.instagram.com/p/DfTaFcfj-ni/?jplx=MWFiMWpidWltOHZteg==" },
  { tarikh_mula: "2026-11-07", tarikh_tamat: "", tajuk: "KLP Time: Talk Show", lokasi: "KLP48 Theatre, LaLaport BBCC Level 2", lokasi_en: "KLP48 Theatre, LaLaport BBCC Level 2", masa: "18:00 – 19:00", masa_en: "6:00 PM – 7:00 PM", jenis: "show", eksklusif: "", nota: "", nota_en: "", members: "Ann Drea, Hillary, Khalies, Aisha, Alice, Kei, Maia, Mashiro, Shu Zhen & Tara", pautan: "https://www.instagram.com/p/DfW4CHJCaYc/?img_index=2" },
  { tarikh_mula: "2026-11-07", tarikh_tamat: "", tajuk: "ACG Matsuri", lokasi: "Main Atrium, GF, LaLaport BBCC", lokasi_en: "Main Atrium, GF, LaLaport BBCC", masa: "3:30 petang – 4:00 petang", masa_en: "3:30 PM – 4:00 PM", jenis: "event", eksklusif: "", nota: "", members: "Hana, Isabel, Diva, Amanda, Devi & Salwa", pautan: "https://www.instagram.com/p/DezBNYNAchD/?hvrq=cjNiczNrZTZuNW1w" },
  { tarikh_mula: "2026-11-08", tarikh_tamat: "", tajuk: "ACG Matsuri", lokasi: "Main Atrium, GF, LaLaport BBCC", lokasi_en: "Main Atrium, GF, LaLaport BBCC", masa: "6:00 petang – 6:30 petang", masa_en: "6:00 PM – 6:30 PM", jenis: "event", eksklusif: "", nota: "", members: "Tara, Mashiro, Aisha, Khalies, Ann Drea & Hillary", pautan: "https://www.instagram.com/p/De1ZnyZD0kq/?knvt=MW41anVpbjhqaXJydg==" },
  { tarikh_mula: "2026-11-08", tarikh_tamat: "", tajuk: "Oshi Battle: Meet & Taiketsu!", lokasi: "KLP48 Theatre, LaLaport BBCC Level 2", lokasi_en: "KLP48 Theatre, LaLaport BBCC Level 2", masa: "12:00 tengah hari – 4:45 petang", masa_en: "12:00 PM – 4:45 PM", jenis: "show", eksklusif: "", nota: "", nota_en: "", members: "Salwa, Sharleez, Ann Drea, Aisha, Khalies, Hillary, Mashiro, Tara, Amanda, Kei, Maia, Hana, Shu Zhen, Diva, Alice, Devi & Isabel", pautan: "https://www.instagram.com/p/DfW4CHJCaYc/?img_index=4" },
  { tarikh_mula: "2026-11-11", tarikh_tamat: "", tajuk: "Discord Radio", lokasi: "Eksklusif Fan Club", lokasi_en: "Fan Club Exclusive", jenis: "event", eksklusif: "ya", nota: "" },
  { tarikh_mula: "2026-11-15", tarikh_tamat: "", tajuk: "Meet & Greet: Talk Session", lokasi: "KLP48 Theatre, LaLaport BBCC Level 2", lokasi_en: "KLP48 Theatre, LaLaport BBCC Level 2", masa: "12:00 tengah hari – 4:30 petang", masa_en: "12:00 PM – 4:30 PM", jenis: "event", eksklusif: "", nota: "", nota_en: "", members: "Aisha, Alice, Amanda, Ann Drea, Devi, Hana, Hillary, Isabel, Joo, Kei, Khalies, Maia, Mashiro, Salwa, Sharleez, Shu Zhen, Tara & Tiffany", pautan: "https://www.instagram.com/p/DfrsFv5ifbg/?img_index=1" },
  { tarikh_mula: "2026-11-15", tarikh_tamat: "", tajuk: "Jaguh Rakan Muda Musim Ke-2 Final Live Show", lokasi: "Centre Court, Hextar World, Empire City", lokasi_en: "Centre Court, Hextar World, Empire City", masa: "9:00 malam – 10:30 malam", masa_en: "9:00 PM – 10:30 PM", jenis: "show", eksklusif: "", nota: "", nota_en: "", members: "Alice, Mashiro, Joo, Tara, Maia, Khalies, Amanda, Isabel, Devi, Yi Shyan, Hillary & Ann Drea", pautan: "https://www.instagram.com/p/DfrLO-cJBbG/?knvt=djVpc3VhMGduNmYy" },
  { tarikh_mula: "2026-11-21", tarikh_tamat: "", tajuk: "KLP Time: Devi’s Birthday Party", tajuk_en: "KLP Time: Devi’s Birthday Party", lokasi: "KLP48 Theatre, Lalaport BBCC Level 2", lokasi_en: "KLP48 Theatre, Lalaport BBCC Level 2", masa: "14:00 – 15:00", masa_en: "14:00 – 15:00", jenis: "show", eksklusif: "", nota: "", members: "Amanda, Ann Drea, Devi, Hillary, Khalies, Aisha, Diva, Hana, Isabel, Joo, Maia, Shu Zhen & Tara", pautan: "https://www.instagram.com/p/Df1qsjWiaWN/?img_index=1" },
  { tarikh_mula: "2026-11-21", tarikh_tamat: "", tajuk: "100 Hours Curry Opening Ceremony with KLP48", tajuk_en: "100 Hours Curry Opening Ceremony with KLP48", lokasi: "Lot B/0G/03, Courtyard Level, Block B, Plaza Mont Kiara", lokasi_en: "Lot B/0G/03, Courtyard Level, Block B, Plaza Mont Kiara", masa: "11:00 pagi – 1:00 petang", masa_en: "11:00 AM – 1:00 PM", jenis: "event", eksklusif: "", nota: "", members: "Yi Shyan, Salwa, Alice & Mashiro.", pautan: "https://www.instagram.com/p/DfsQDd4IpPq/?psln=dXgxeTIyaXk5ZXZl" },
  { tarikh_mula: "2026-11-21", tarikh_tamat: "", tajuk: "Fiesta Rakan Muda Kebangsaan 2026", tajuk_en: "Fiesta Rakan Muda Kebangsaan 2026", lokasi: "Level 4, Rooftop Garden, LaLaport BBCC", lokasi_en: "Level 4, Rooftop Garden, LaLaport BBCC", masa: "4:00 petang – 10:00 malam", masa_en: "4:00 PM – 10:00 PM", jenis: "show", eksklusif: "", nota: "", members: "Diva, Joo, Shu Zhen, Tara, Khalies, Hillary, Amanda & Aisha", pautan: "https://www.instagram.com/p/Df33B4YJBH8/" },
  { tarikh_mula: "2026-11-22", tarikh_tamat: "", tajuk: "KLP Time: Variety Show", tajuk_en: "KLP Time: Variety Show", lokasi: "KLP48 Theatre, Lalaport BBCC Level 2", lokasi_en: "KLP48 Theatre, Lalaport BBCC Level 2", masa: "15:00 – 16:00", masa_en: "15:00 – 16:00", jenis: "show", eksklusif: "", nota: "", nota_en: "", members: "Khalies, Salwa, Aisha, Alice, Diva, Hana, Isabel, Joo, Maia, Mashiro, Shu Zhen", pautan: "https://www.instagram.com/p/Df60RcoCRtw/?img_index=1" },
  { tarikh_mula: "2026-11-23", tarikh_tamat: "", tajuk: "Discord 1-on-1 Video Call (Generasi ke-1)", tajuk_en: "Discord 1-on-1 Video Call (1st Generation)", lokasi: "Eksklusif Fan Club Premium", lokasi_en: "Fan Club Premium Exclusive", jenis: "event", eksklusif: "ya", nota: "", members: "Amanda, Ann Drea, Devi, Hillary, Khalies, Salwa, Tiffany & Yi Shyan" },
  { tarikh_mula: "2026-11-24", tarikh_tamat: "", tajuk: "Discord 1-on-1 Video Call (Generasi ke-2)", tajuk_en: "Discord 1-on-1 Video Call (2nd Generation)", lokasi: "Eksklusif Fan Club Premium", lokasi_en: "Fan Club Premium Exclusive", jenis: "event", eksklusif: "ya", nota: "", members: "Aisha, Alice, Diva, Hana, Isabel, Joo, Kei, Maia, Mashiro, Sharleez, Shu Zhen & Tara" },
  { tarikh_mula: "2026-11-28", tarikh_tamat: "", tajuk: "KLP Time: Hillary Birthday Party", lokasi: "KLP48 Theatre, Lalaport BBCC", jenis: "show", eksklusif: "", nota: "" },
  { tarikh_mula: "2026-11-28", tarikh_tamat: "2026-11-29", tajuk: "Osaka Talk Show Featuring KLP48", tajuk_en: "Osaka Talk Show Featuring KLP48", lokasi: "Lalaport Main Atrium, GF", masa: "2:00 petang", masa_en: "2:00 PM", jenis: "show", eksklusif: "", nota: "", members: "Devi & Yi Shyan", pautan: "https://www.instagram.com/p/DfreW-ikkUz/?img_index=5&dmpr=MWI5OW12dmQ0bjhiYQ==" },
  { tarikh_mula: "2026-11-29", tarikh_tamat: "", tajuk: "Mini Live Show", lokasi: "KLP48 Theatre, Lalaport BBCC", jenis: "show", eksklusif: "", nota: "" },
];

const MEMBER_BIRTHPLACES: Record<string, string> = {
  yi_shyan: "Perak, Malaysia",
  yurina: "Kagawa Prefecture, Japan",
  haruka: "Saitama Prefecture, Japan",
  suzuha: "Hyogo Prefecture, Japan",
  cocoa: "Hiroshima Prefecture, Japan",
  devi: "Denpasar, Bali, Indonesia",
  amanda: "Kuala Lumpur, Malaysia",
  ann_drea: "Selangor, Malaysia",
  hillary: "Hong Kong",
  khalies: "Kuala Lumpur, Malaysia",
  salwa: "Kuala Lumpur, Malaysia",
  tiffany: "Sarawak, Malaysia",
  lucine: "Kuala Lumpur, Malaysia",
  maia: "Selangor, Malaysia",
  mashiro: "Nara, Japan",
  sharleez: "Kuala Lumpur, Malaysia",
  shu_zhen: "Perak, Malaysia",
  tara: "Selangor, Malaysia",
  aisha: "Almaty, Kazakhstan",
  alice: "Selangor, Malaysia",
  cindy: "Tangerang Selatan, Indonesia",
  diva: "Jawa Barat, Indonesia",
  hana: "Jawa Tengah, Indonesia",
  isabel: "Kuala Lumpur, Malaysia",
  joo: "Sabah, Malaysia",
  kei: "Selangor, Malaysia",
};

const MEMBER_CATCHPHRASES: Record<string, string> = {
  devi: "Bersinar terang dan senantiasa menjadi cahaya bintang untuk korang semua, panggil saya Devi.",
  amanda: "Si gadis idol yang mempunyai jiwa rocker! Hai semua saya Amanda.",
  salwa: "Hai semua nama saya Salwa, You'll always meet me in your heart, Saya adalah happy vitamin kamu!",
  hillary: "Hai semua nama saya Hillary, Let's capture this moment and turn them into beautiful memories.",
  yi_shyan: "Hi everyone my name is Yi Shyan, Manis sepertimu simpan saya di dalam hatimu.",
  ann_drea: "A N Squared D R E A thats my name, hello everybody im Ann Drea!",
  yurina: "Hai semua. Nama saya Yurina Gyoten, panggil saya Yurina. Everyone say Bikkuri (Gyoten) I’m surprise, I’m make everyone smile.",
  tiffany: "Knock, knock! (Who’s there?) It’s your one and only, Cha Cha Cha! (Tiffany.) Hello, my name is Tiffany!",
  mashiro: "Hello everyone, I'm Mashiro, the pure white angel of KLP48. Please call me, Se-no, (Mashiro!)",
  maia: "I spy with my little eye, Maia with an i!",
  sharleez: "Hi all! I'll steal your heart and your fries. I'm a myth and a legend that everyone buys. I'm Princess Sharleez!",
  aisha: "Shining bright! Hi, I'm Aisha!",
  alice: "Tell me, who is your favorite Wonder Girl? (Alice!) And I'm here to bring you guys? (Wonder!) And the one who brings wonder is? (Alice!)",
  cindy: "Cute, cheerful, full power. Hi everyone, call me Cindy!",
  diva: "Hi hi (Hello!) Shy like a cat, sweet like candy. I'm gonna twinkle twinkle on the stage because I'm? (Diva!)",
  hana: "Tut tut, dancing and singing is my hobby, but you all is my lovely. Shine shine, it's me ha ha ha (Hana!)",
  isabel: "Saya di sini untuk mengembalikan senyuman awak. Hai semua, I'm Isabel!",
  joo: "Manis macam jus, energy takkan lose. Hi semua, it's Joo!",
  shu_zhen: "Seperti harta karun dasar laut, sayalah mutiara di hatimu!",
  tara: "Hello everyone, my name is Tara! Just like a shooting sTar-a! And whenever you look up at the night sky, don't forget to remember me, the cutest shooting sTar-a!",
  kei: "A playful jester whose sweetness will give you a Keeiivity. Hello everyone, Kei is here!",
};

export const MEMBERS_DATA: MemberItem[] = ([
  { id: "yi_shyan", nama: "Yi Shyan", nama_penuh: "Foo Yi Shyan", tarikh_lahir: "28 Jun", tarikh_lahir_en: "28 Jun", tahun_lahir: "2004", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Yi_Shyan.jpg", x: "Yishyan_klp48", instagram: "yishyan_klp48", tiktok: "https.shyan" },
  { id: "yurina", nama: "Yurina", nama_penuh: "Yurina Gyoten", tarikh_lahir: "14 Mac", tarikh_lahir_en: "14 Mar", tahun_lahir: "1999", gen: "1", status: "graduated", statusCategory: "graduated", nota_status: "Kembali ke AKB48 (28 Feb 2026)", nota_status_en: "Returned to AKB48 (28 Feb 2026)", gambar: "/images/members/Yurina.png", x: "tenten_yurina", instagram: "yurina.0314", tiktok: "yurina_gyoten0314" },
  { id: "haruka", nama: "Haruka", nama_penuh: "Haruka Kurosu", tarikh_lahir: "28 Feb", tarikh_lahir_en: "28 Feb", tahun_lahir: "2001", gen: "1", status: "graduated", statusCategory: "graduated", nota_status: "Kembali ke AKB48 (28 Feb 2026)", nota_status_en: "Returned to AKB48 (28 Feb 2026)", gambar: "/images/members/Haruka.png", x: "kurooosu_48_16", instagram: "hachan_haruka", tiktok: "haachan_xxx" },
  { id: "suzuha", nama: "Suzuha", nama_penuh: "Suzuha Yamane", tarikh_lahir: "11 Ogos", tarikh_lahir_en: "11 Aug", tahun_lahir: "2000", gen: "1", status: "graduated", statusCategory: "graduated", nota_status: "Kembali ke AKB48 (28 Feb 2026)", nota_status_en: "Returned to AKB48 (28 Feb 2026)", gambar: "/images/members/Suzuha.png", x: "48Suzuha_16LOVE", instagram: "suzuha48yamane16", tiktok: "zunchan48" },
  { id: "cocoa", nama: "Cocoa", nama_penuh: "Kokoa Kai", tarikh_lahir: "28 Nov", tarikh_lahir_en: "28 Nov", tahun_lahir: "2003", gen: "1", status: "graduated", statusCategory: "graduated", nota_status: "Kembali ke STU48 (28 Feb 2026)", nota_status_en: "Returned to STU48 (28 Feb 2026)", gambar: "/images/members/Cocoa.png", x: "k_cocoa1128", instagram: "k_cocoa1128", tiktok: "k_cocoa1128" },
  { id: "devi", nama: "Devi", nama_penuh: "Made Devi Ranita Ningtara", tarikh_lahir: "18 Nov", tarikh_lahir_en: "18 Nov", tahun_lahir: "2000", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Devi.jpg", x: "ningtaradevi", instagram: "ningtaradevi", tiktok: "ningtaradevi" },
  { id: "amanda", nama: "Amanda", nama_penuh: "Elley Amanda Wong", tarikh_lahir: "13 Feb", tarikh_lahir_en: "13 Feb", tahun_lahir: "2007", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Amanda.jpg", x: "Amanda_Klp48", instagram: "elleyamanda.klp48", tiktok: "amand4ily" },
  { id: "ann_drea", nama: "Ann Drea", nama_penuh: "Ann Drea Tey", tarikh_lahir: "6 Ogos", tarikh_lahir_en: "6 Aug", tahun_lahir: "2008", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Ann_Drea.jpg", x: "anndrea_klp48", instagram: "anndrea.klp48", tiktok: "anndreaerdnnna" },
  { id: "hillary", nama: "Hillary", nama_penuh: "Shuen Hiu Yau", tarikh_lahir: "22 Nov", tarikh_lahir_en: "22 Nov", tahun_lahir: "2008", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Hillary.jpg", x: "klp48hillary", instagram: "hillary.klp48", tiktok: "riririly" },
  { id: "khalies", nama: "Khalies", nama_penuh: "Tan Zi Tong", tarikh_lahir: "27 Ogos", tarikh_lahir_en: "27 Aug", tahun_lahir: "2008", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Khalies.jpg", x: "khaliesklp48", instagram: "khalies.klp48", tiktok: "catlies_rawrr" },
  { id: "salwa", nama: "Salwa", nama_penuh: "Salwa Sunanda", tarikh_lahir: "17 Jul", tarikh_lahir_en: "17 Jul", tahun_lahir: "2007", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Salwa.jpg", x: "Salwa__klp48", instagram: "salwa_.klp48", tiktok: "ruruwa._" },
  { id: "tiffany", nama: "Tiffany", nama_penuh: "Elvyone Tiffany Ticha Anak Donaldin", tarikh_lahir: "23 Sep", tarikh_lahir_en: "23 Sep", tahun_lahir: "2009", gen: "1", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Tiffany.jpg", x: "tiffanyklp48", instagram: "tiffany.klp48", tiktok: "chuffany" },
  { id: "lucine", nama: "Lucine", nama_penuh: "Mireille Chin Yi Ling", tarikh_lahir: "11 Nov", tarikh_lahir_en: "11 Nov", tahun_lahir: "2004", gen: "1", status: "graduated", statusCategory: "graduated", nota_status: "Graduasi 19 Okt 2025", nota_status_en: "Graduated 19 Oct 2025", gambar: "/images/members/Lucine.png", instagram: "lucine.klp48", tiktok: "luvlucine", x: "" },
  { id: "maia", nama: "Maia", nama_penuh: "Maia Fae Chong", tarikh_lahir: "6 Okt", tarikh_lahir_en: "6 Oct", tahun_lahir: "2010", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Maia.jpg", x: "maia_klp48", instagram: "maia.klp48", tiktok: "maia.klp48" },
  { id: "mashiro", nama: "Mashiro", nama_penuh: "Mashiro Ueda", tarikh_lahir: "29 Jan", tarikh_lahir_en: "29 Jan", tahun_lahir: "2003", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Mashiro.jpg", x: "mashiro_klp48", instagram: "mashiro_klp48", tiktok: "mashiro.klp48" },
  { id: "sharleez", nama: "Sharleez", nama_penuh: "Sharifah Sharleez Binti Syed Affendi", tarikh_lahir: "19 Feb", tarikh_lahir_en: "19 Feb", tahun_lahir: "2009", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Sharleez.jpg", x: "sharleez_klp48", instagram: "sharleez.klp48", tiktok: "sharleez.klp48" },
  { id: "shu_zhen", nama: "Shu Zhen", nama_penuh: "Kuak Shu Zhen", tarikh_lahir: "20 Ogos", tarikh_lahir_en: "20 Aug", tahun_lahir: "2001", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Shu_Zhen.jpg", x: "shuzhen_klp48", instagram: "shuzhen.klp48", tiktok: "shuzhen.klp48" },
  { id: "tara", nama: "Tara", nama_penuh: "Tara Tan", tarikh_lahir: "2 Ogos", tarikh_lahir_en: "2 Aug", tahun_lahir: "2010", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Tara.jpg", x: "tara_klp48", instagram: "tara.klp48", tiktok: "tara.klp48" },
  { id: "aisha", nama: "Aisha", nama_penuh: "Turysbek Aisha", tarikh_lahir: "25 Mei", tarikh_lahir_en: "25 May", tahun_lahir: "2008", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Aisha.jpg", x: "aisha_klp48", instagram: "aisha.klp48", tiktok: "aisha.klp48" },
  { id: "alice", nama: "Alice", nama_penuh: "Alice Wong Vei Yew", tarikh_lahir: "30 Apr", tarikh_lahir_en: "30 Apr", tahun_lahir: "2004", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Alice.jpg", x: "alice_klp48", instagram: "alice.klp48", tiktok: "alice.klp48" },
  { id: "cindy", nama: "Cindy", nama_penuh: "Cindy Alexandria", tarikh_lahir: "17 Mei", tarikh_lahir_en: "17 May", tahun_lahir: "2008", gen: "2", status: "non-active", statusCategory: "non-active", nota_status: "Hiatus sejak 11 Ogos 2026", nota_status_en: "On hiatus since 11 Aug 2026", gambar: "/images/members/Cindy.jpg", x: "cindy_klp48", instagram: "cindy.klp48", tiktok: "cindy.klp48" },
  { id: "diva", nama: "Diva", nama_penuh: "Diva Nurhaliza", tarikh_lahir: "11 Mei", tarikh_lahir_en: "11 May", tahun_lahir: "2004", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Diva.jpg", x: "diva_klp48", instagram: "diva.klp48", tiktok: "diva.klp48" },
  { id: "hana", nama: "Hana", nama_penuh: "Sekar Wejayanti Mumtahanah", tarikh_lahir: "24 Feb", tarikh_lahir_en: "24 Feb", tahun_lahir: "2004", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Hana.jpg", x: "hana_klp48", instagram: "hana.klp48", tiktok: "hana.klp48" },
  { id: "isabel", nama: "Isabel", nama_penuh: "Wee Xi Ting", tarikh_lahir: "11 Sep", tarikh_lahir_en: "11 Sep", tahun_lahir: "2008", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Isabel.jpg", x: "isabel_klp48", instagram: "isabel.klp48", tiktok: "isabel.klp48" },
  { id: "joo", nama: "Joo", nama_penuh: "Jocelyna Marcelly", tarikh_lahir: "27 Nov", tarikh_lahir_en: "27 Nov", tahun_lahir: "2005", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Joo.jpg", x: "jocelyna_klp48", instagram: "jocelyna.klp48", tiktok: "jocelyna.klp48" },
  { id: "kei", nama: "Kei", nama_penuh: "Kei Annisa Adnan", tarikh_lahir: "16 Apr", tarikh_lahir_en: "16 Apr", tahun_lahir: "2009", gen: "2", status: "aktif", statusCategory: "active", nota_status: "", gambar: "/images/members/Kei.jpg", x: "kei_klp48", instagram: "kei.klp48", tiktok: "kei.klp48" },
] satisfies MemberItem[]).map((member) => ({
  ...member,
  birthplace: MEMBER_BIRTHPLACES[member.id] ?? "",
  catchphrase: MEMBER_CATCHPHRASES[member.id],
}));

export const NEWS_DATA: NewsItem[] = [
  { tajuk: "Announcement KLP48 at Nihon Live, Nihon Matsuri", tarikh: "2026.10.24", kategori: "News", pautan: "https://klp48.my/news/detail/48" },
  { tajuk: "Announcement KLP48 at Nihon Live, Nihon Matsuri", tarikh: "2026.10.22", kategori: "News", pautan: "https://klp48.my/news/detail/47" },
  { tajuk: "Start of 1 on 1 TALK applications", tarikh: "2026.09.08", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/46" },
  { tajuk: "Discord Radio Talk Info", tarikh: "2026.09.01", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/45" },
  { tajuk: "PENGUMUMAN RASMI Pelantikan Penerbit Baharu [BM]", tarikh: "2026.08.12", kategori: "News", pautan: "https://klp48.my/news/detail/44" },
  { tajuk: "OFFICIAL ANNOUNCEMENT Appointment of New Producer [EN]", tarikh: "2026.08.12", kategori: "News", pautan: "https://klp48.my/news/detail/43" },
  { tajuk: "[Official Announcement Regarding Cindy Hiatus]", tarikh: "2026.08.11", kategori: "News", pautan: "https://klp48.my/news/detail/42" },
  { tajuk: "Discord radio talk info", tarikh: "2026.08.04", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/41" },
  { tajuk: "OFFICIAL STATEMENT - CLARIFICATION REGARDING THE LOGO OF \"AKT38\"", tarikh: "2026.07.07", kategori: "News", pautan: "https://klp48.my/news/detail/40" },
  { tajuk: "Notice Regarding 1 on 1 TALK Applications", tarikh: "2026.06.10", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/39" },
  { tajuk: "Start of 1 on 1 TALK applications", tarikh: "2026.06.05", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/38" },
  { tajuk: "KLP48 6th Single “KERANA KU SUKA” (KIMI NO KOTO GA SUKI DAKARA) Is Now Available for Streaming", tarikh: "2026.06.03", kategori: "News", pautan: "https://klp48.my/news/detail/37" },
  { tajuk: "OFFICIAL ANNOUNCEMENT FOR THE RELEASE OF “KERANA KU SUKA” ON DIGITAL MUSIC PLATFORMS", tarikh: "2026.06.01", kategori: "News", pautan: "https://klp48.my/news/detail/36" },
  { tajuk: "[Appearance Confirmed] TOKYO IDOL FESTIVAL 2026", tarikh: "2026.05.20", kategori: "News", pautan: "https://klp48.my/news/detail/35" },
  { tajuk: "Official Announcement for Online Booking Issue of “520 Dinner with KLP48 Members” Event.", tarikh: "2026.05.17", kategori: "News", pautan: "https://klp48.my/news/detail/34" },
  { tajuk: "Discord radio talk info", tarikh: "2026.05.03", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/33" },
  { tajuk: "Start of 1 on 1 TALK applications", tarikh: "2026.05.02", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/32" },
  { tajuk: "Announcement - Postponement of KLP48 Theatre Opening", tarikh: "2026.04.20", kategori: "News", pautan: "https://klp48.my/news/detail/31" },
  { tajuk: "Discord Radio talk info", tarikh: "2026.04.17", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/29" },
  { tajuk: "Update: 2nd Generation Members' Blogs Now on Discord", tarikh: "2026.04.17", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/28" },
  { tajuk: "Notice : Postponement for the Release of “Kerana Kusuka\"", tarikh: "2026.02.07", kategori: "News", pautan: "https://klp48.my/news/detail/25" },
  { tajuk: "OFFICIAL ANNOUNCEMENT REGARDING CONCLUSION OF KLP48 ACTIVITIES BY COCOA, SUZUHA, HARUKA, AND YURINA", tarikh: "2026.01.31", kategori: "News", pautan: "https://klp48.my/news/detail/24" },
  { tajuk: "HARMFUL AI-GENERATED CONTENT", tarikh: "2026.01.12", kategori: "News", pautan: "https://klp48.my/news/detail/22" },
  { tajuk: "Discord Radio talk info", tarikh: "2026.01.06", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/21" },
  { tajuk: "Refund for Cocoa Meet & Greet Session – KLP48 SUPERBASH (27 December 2025)", tarikh: "2025.12.29", kategori: "Store", pautan: "https://klp48.my/news/detail/20" },
  { tajuk: "OFFICIAL STATEMENT", tarikh: "2025.12.26", kategori: "News", pautan: "https://klp48.my/news/detail/19" },
  { tajuk: "サポート窓口 年末年始休業のお知らせ", tarikh: "2025.12.26", kategori: "News", pautan: "https://klp48.my/news/detail/17" },
  { tajuk: "OFFICIAL STATEMENT REGARDING YI SHYAN, AMANDA, ANN DREA, HILLARY, KHALIES AND SALWA", tarikh: "2025.12.19", kategori: "News", pautan: "https://klp48.my/news/detail/16" },
  { tajuk: "KLP48 1st Solo Concert Super Bash 「TICKET」", tarikh: "2025.11.10", kategori: "LIVE", pautan: "https://klp48.my/news/detail/15" },
  { tajuk: "Start of 1 on 1 TALK applications", tarikh: "2025.09.01", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/11" },
  { tajuk: "Discord radio talk info", tarikh: "2025.09.01", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/9" },
  { tajuk: "KLP48 4th Single「Oh my pumpkin!」", tarikh: "2025.08.03", kategori: "News", pautan: "https://klp48.my/news/detail/8" },
  { tajuk: "KLP48 1st Anniversary Concert「BLOOM」", tarikh: "2025.08.02", kategori: "LIVE", pautan: "https://klp48.my/news/detail/7" },
  { tajuk: "KLP48 OFFICIAL FANCLUB START", tarikh: "2025.08.01", kategori: "Fanclub", pautan: "https://klp48.my/news/detail/4" },
  { tajuk: "OFFICIAL SITE RENEWAL", tarikh: "2025.05.29", kategori: "News", pautan: "https://klp48.my/news/detail/1" },
];

const INSTAGRAM_LIVE_POSTS: LivePostItem[] = [
  {
    masa: "2026-11-17T18:30:00+08:00",
    platform: "instagram",
    member: "KLP48 (@klp48_official)",
    teks: "Behind the scenes rehearsal at KLP48 Theatre! Siapa rindu kami? 💚✨ #KLP48 #LalaportBBCC",
    teks_en: "Behind the scenes rehearsal at KLP48 Theatre! Who missed us? 💚✨ #KLP48 #LalaportBBCC",
    pautan: "https://www.instagram.com/p/DfsQDd4IpPq/",
  },
  {
    masa: "2026-11-10T14:15:00+08:00",
    platform: "instagram",
    member: "KLP48 (@klp48_official)",
    teks: "Thank you for coming to our weekend events! See you all again very soon. 🌟💖",
    teks_en: "Thank you for coming to our weekend events! See you all again very soon. 🌟💖",
    pautan: "https://www.instagram.com/p/DflwX89pQxz/",
  },
  {
    masa: "2026-11-01T11:00:00+08:00",
    platform: "instagram",
    member: "KLP48 (@klp48_official)",
    teks: "Spook-tacle Halloween Weekend Meet & Greet is happening now at LaLaport BBCC! 🎃👻",
    teks_en: "Spook-tacle Halloween Weekend Meet & Greet is happening now at LaLaport BBCC! 🎃👻",
    pautan: "https://www.instagram.com/p/Dfbc781LmNq/",
  },
];

const TIKTOK_LIVE_POSTS: LivePostItem[] = VIDEOS.filter(
  (v) => v.platform === 'tiktok' && v.publishedAt
).map((v) => ({
  masa: v.publishedAt as string,
  platform: 'tiktok',
  member: 'KLP48 (@klp48_official)',
  teks: v.title,
  pautan: v.url,
  tiktokId: v.tiktokId,
  thumbnail: v.thumbnail,
}));

export const LIVE_FEED_DATA: LivePostItem[] = [...TIKTOK_LIVE_POSTS, ...INSTAGRAM_LIVE_POSTS].sort(
  (a, b) => new Date(b.masa).getTime() - new Date(a.masa).getTime()
);

export type MemberCategory = 'aktif' | 'non' | 'grad';

export function getMemberCategory(statusOrMember: string | MemberItem): MemberCategory {
  if (typeof statusOrMember === 'object' && statusOrMember !== null) {
    if (statusOrMember.statusCategory === 'graduated') return 'grad';
    if (statusOrMember.statusCategory === 'non-active') return 'non';
    return 'aktif';
  }
  if (/grad|lulus/i.test(statusOrMember)) return 'grad';
  if (/non|tidak/i.test(statusOrMember)) return 'non';
  return 'aktif';
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export interface ParsedEvent {
  id: string;
  startDate: Date;
  endDate: Date;
  title: string;
  titleEn?: string;
  venue: string;
  venueEn?: string;
  type: 'show' | 'event';
  exclusive: boolean;
  notes: string;
  notesEn?: string;
  members?: string;
  time: string;
  timeEn?: string;
  link: string;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = (s || '').split('-').map(Number);
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d);
}

export function parseEventMemberNames(members?: string): string[] {
  const seen = new Set<string>();
  return (members || '')
    .split(/[,;&]|\band\b/i)
    .map((name) => name.trim().replace(/[.]+$/, '').trim())
    .filter((name) => {
      const normalized = name.toLowerCase();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

export function parseScheduleItems(items: ScheduleRawItem[]): ParsedEvent[] {
  return items.map((item, idx): ParsedEvent => {
    const startDate = parseIsoDate(item.tarikh_mula);
    const endDate = item.tarikh_tamat ? parseIsoDate(item.tarikh_tamat) : startDate;
    const type: 'show' | 'event' =
      item.jenis.toLowerCase() === 'show' ? 'show' : 'event';
    return {
      id: item.id || `${item.tarikh_mula}-${idx}`,
      startDate,
      endDate,
      title: item.tajuk,
      titleEn: item.tajuk_en,
      venue: item.lokasi,
      venueEn: item.lokasi_en,
      type,
      exclusive: /^(ya|yes|y|1)$/i.test(item.eksklusif),
      notes: item.nota,
      notesEn: item.nota_en,
      members: item.members,
      time: item.masa || '',
      timeEn: item.masa_en,
      link: item.pautan || '',
    };
  })
    .filter((ev) => !Number.isNaN(ev.startDate.getTime()))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function getParsedEvents(): ParsedEvent[] {
  return parseScheduleItems(SCHEDULE_DATA);
}

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  mac: 2,
  apr: 3,
  mei: 4,
  may: 4,
  jun: 5,
  jul: 6,
  ogo: 7,
  aug: 7,
  sep: 8,
  okt: 9,
  oct: 9,
  nov: 10,
  dis: 11,
  dec: 11,
};

export interface UpcomingBirthday {
  member: MemberItem;
  originalIndex: number;
  date: Date;
  daysLeft: number;
  isToday: boolean;
  ageTurning: number | null;
}

export function getTodayMidnight(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseMemberBirthday(
  member: MemberItem
): { day: number; monthIndex: number; birthYear: number | null } | null {
  const parts = (member.tarikh_lahir || '').trim().split(/\s+/);
  const day = parseInt(parts[0], 10);
  const monthIndex = MONTH_MAP[(parts[1] || '').slice(0, 3).toLowerCase()];
  if (!day || monthIndex === undefined) return null;
  const parsedYear = parseInt(member.tahun_lahir, 10);
  return {
    day,
    monthIndex,
    birthYear: Number.isNaN(parsedYear) ? null : parsedYear,
  };
}

export function getUpcomingBirthdays(now = new Date()): UpcomingBirthday[] {
  const today = getTodayMidnight(now);
  return MEMBERS_DATA.map((member, originalIndex) => ({ member, originalIndex }))
    .filter(({ member }) => getMemberCategory(member.status) !== 'grad')
    .map(({ member, originalIndex }) => {
      const parsed = parseMemberBirthday(member);
      if (!parsed) return null;

      let target = new Date(now.getFullYear(), parsed.monthIndex, parsed.day);
      if (target < today) {
        target = new Date(now.getFullYear() + 1, parsed.monthIndex, parsed.day);
      }
      const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
      const ageTurning =
        parsed.birthYear === null ? null : target.getFullYear() - parsed.birthYear;

      return {
        member,
        originalIndex,
        date: target,
        daysLeft,
        isToday: daysLeft === 0,
        ageTurning,
      };
    })
    .filter((item): item is UpcomingBirthday => item !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.member.nama.localeCompare(b.member.nama));
}
