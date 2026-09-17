# Gemini Audio Orders — prompt → file → Unity

Tài liệu bàn giao prompt âm thanh cho dự án `Xoi_AssetStickMan`.

Mục tiêu: chọn đúng loại âm thanh, dán prompt vào Gemini/Google AI Studio, lưu file
đúng tên và đúng thư mục để game hoặc Trường quay tự nhận.

Ngày đối chiếu key: **2026-09-10**.

## 1. Chọn đúng cách sinh

| Loại | Dùng | Model/cách đề nghị | Kết quả |
|---|---|---|---|
| Lời thoại thật | Nhân vật, announcer, thoại phim | Gemini TTS | WAV đọc đúng câu |
| Nhạc nền, stinger, loop | Menu, giao chiến, phim | Lyria | MP3/WAV, thường 44.1 kHz stereo |
| SFX ngắn | Chém, va chạm, bước chân, cửa | Ưu tiên gói SFX hoặc bộ sinh SFX chuyên dụng | WAV mono |

Tài liệu API hiện công bố rõ TTS và Lyria; không coi Lyria là model SFX. Nếu Gemini
không tạo được một tiếng động ngắn theo prompt, dùng clip trong gói SFX hoặc tool
tổng hợp sẵn của dự án. Không sửa key chỉ vì nguồn âm thanh khác nhau.

Gemini TTS có thể điều khiển chất giọng, cảm xúc, tốc độ và nhiều người nói.
Lyria Clip tạo clip nhạc 30 giây; Lyria 3.5 dùng cho bài dài hơn. Kiểm tra điều khoản
và quyền sử dụng trước khi phát hành thương mại; nhạc Lyria có watermark SynthID
không nghe thấy bằng tai thường.

Tài liệu chính thức: [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key),
[TTS](https://ai.google.dev/gemini-api/docs/speech-generation) và
[Lyria music generation](https://ai.google.dev/gemini-api/docs/music-generation).

## 2. Chuẩn file bắt buộc

### 2.1. SFX game và tiếng phim

- Định dạng: `.wav`, PCM 16-bit, mono, 44.1 kHz.
- Tiếng ngắn: khoảng 0.2–1.5 giây, trừ ambience/loop và một số tiếng phim.
- Không có khoảng lặng ở đầu hoặc cuối.
- Không fade mất phần đầu của cú đánh; nếu cần vuốt thì chỉ vuốt rất ngắn.
- Tiếng lặp nhiều lần phải có ít nhất 2–4 biến thể.
- Tên biến thể dùng hậu tố số: `_1.wav`, `_2.wav`, `_3.wav`.

### 2.2. Giọng TTS

- Đọc đúng transcript; không thêm nhạc, hiệu ứng hoặc lời dẫn.
- Thu gần, rõ, không reverb dài.
- Sau khi tải về phải chuyển về WAV mono 44.1 kHz nếu Gemini trả sample rate khác.
- Giọng chiến đấu nên có 3–6 biến thể khác nhau về người nói hoặc cách diễn.
- Không dùng giọng bắt chước người nổi tiếng hoặc nhân vật có bản quyền.

### 2.3. Nhạc nền

- Dùng 44.1 kHz; stereo phù hợp cho nhạc.
- Nhạc `Menu`, `Prepare`, `Battle`, `Danger` phải loop được.
- `Victory`, `Defeat` chơi một lần, không loop.
- Không có lời hát, trừ khi prompt nói rõ cần nhạc có lời.
- Lyria Clip luôn dài 30 giây; muốn loop ngắn thì cắt/kiểm tra vòng lặp sau khi nhận file.

## 3. Quy tắc tên và thư mục

Tên file chính là key. Key được lấy từ đường dẫn dưới `Assets/Sounds/SFX`, bỏ đuôi
`.wav` và gộp `_1`, `_2`... thành một nhóm biến thể.

| Muốn key | Tên file đúng | Thư mục đúng |
|---|---|---|
| `Melee/Swing_Sword` | `Swing_Sword.wav` hoặc `Swing_Sword_1.wav` | `Assets/Sounds/SFX/Melee/` |
| `Voice/Charge` | `Charge_1.wav` … `Charge_6.wav` | `Assets/Sounds/SFX/Voice/` |
| `Cine/Boom` | `Boom_1.wav`, `Boom_2.wav` | `Assets/Sounds/SFX/Cine/` |
| `ui_unlock` | `ui_unlock.wav` | ngay dưới `Assets/Sounds/SFX/` |
| `weapon_overheat` | `weapon_overheat_1.wav` … | ngay dưới `Assets/Sounds/SFX/` |

Không đặt `ui_unlock.wav` vào `Ui/`, vì như vậy key sẽ thành `Ui/ui_unlock` và code
không gọi được. Không tự đổi `Cine/Boom` thành `Cine/Explosion`.

## 4. Prompt nền dùng chung

Thêm khối này vào cuối mọi prompt SFX game:

```text
Deliver one clean sound effect only. No music, no voice, no ambience bed,
no room tone, no long reverb tail, no silence before or after the sound.
Make the transient clear and game-ready. WAV, mono, 44.1 kHz, 16-bit PCM.
Create a distinct variation if a variation number is specified.
```

Với tiếng phim, thay dòng cuối bằng:

```text
Deliver one clean cinematic sound effect only. Keep the transient readable in a
busy mix and leave a short natural tail. WAV, mono, 44.1 kHz, 16-bit PCM.
```

## 5. SFX chiến đấu và vũ khí

Đây là prompt mô tả âm thanh. Với SFX, dùng Gemini nếu giao diện/tài khoản của
anh/chị hỗ trợ tạo loại âm thanh đó; nếu không, dùng prompt này để tìm/thay clip
tương đương trong gói SFX.

| Key | File đích | Prompt |
|---|---|---|
| `Melee/Swing_Sword` | `Melee/Swing_Sword_1.wav` … | `Fast clean steel sword whoosh, light medieval sword, sharp transient, short air movement, close and dry.` |
| `Melee/Swing_SwordHeavy` | `Melee/Swing_SwordHeavy_1.wav` … | `Heavy two-handed sword swing, deep air displacement, thick steel movement, powerful but short, dry.` |
| `Melee/Swing_Dagger` | `Melee/Swing_Dagger_1.wav` … | `Very quick small dagger whoosh, narrow high-frequency air slice, agile and close, dry.` |
| `Melee/Swing_Spear` | `Melee/Swing_Spear_1.wav` … | `Long spear thrust through air, wooden shaft and metal tip movement, fast directional whoosh, dry.` |
| `Melee/Swing_Club` | `Melee/Swing_Club_1.wav` … | `Short heavy wooden club swing, thick low whoosh, blunt force, no impact, dry.` |
| `Melee/Hit_Sword` | `Melee/Hit_Sword_1.wav` … | `Sharp medieval sword hitting flesh and light cloth armor, brief metallic bite followed by a compact dull impact, no gore.` |
| `Melee/Hit_Dagger` | `Melee/Hit_Dagger_1.wav` … | `Small dagger stab into padded flesh, short close impact, restrained and game-safe, dry.` |
| `Melee/Hit_Spear` | `Melee/Hit_Spear_1.wav` … | `Heavy spear thrust hitting a target, wood shaft vibration and dull body impact, short and dry.` |
| `Melee/Hit_Blunt` | `Melee/Hit_Blunt_1.wav` … | `Heavy blunt punch or mace impact on padded armor, low thump, short body resonance, no metal ring.` |
| `Melee/Hit_Hammer` | `Melee/Hit_Hammer_1.wav` … | `Large warhammer impact on armor and flesh, deep compact thud with a small metal rattle, no long tail.` |
| `Melee/Block_Shield` | `Melee/Block_Shield_1.wav` … | `Shield blocks a heavy medieval weapon, thick wood and metal impact, strong short clank, dry.` |
| `Melee/Bash_Shield` | `Melee/Bash_Shield_1.wav` … | `Wood and iron shield bash into padded armor, blunt shove, short low impact, dry.` |
| `Melee/Block_Armor` | `Melee/Block_Armor_1.wav` … | `Steel weapon glances off plate armor, bright metallic clank with a compact body thud, short.` |
| `Melee/Clash_Sword` | `Melee/Clash_Sword_1.wav` … | `Two medieval swords collide edge to edge, bright steel ring and tiny sparks, short, no music.` |
| `Ranged/Bow_Draw` | `Ranged/Bow_Draw_1.wav` … | `Wooden bow being drawn under tension, creaking wood and taut string, intimate close-up, short.` |
| `Ranged/Bow_Shoot` | `Ranged/Bow_Shoot_1.wav` … | `Short realistic bow release, tight string snap with a light wooden resonance, dry.` |
| `Ranged/Arrow_Flyby` | `Ranged/Arrow_Flyby_1.wav` … | `Fast arrow passing very close to the listener, narrow high-pitched air whistle, extremely short.` |
| `Ranged/Arrow_HitFlesh` | `Ranged/Arrow_HitFlesh_1.wav` … | `Arrow striking padded flesh target, short wood-and-body impact, restrained, dry.` |
| `Ranged/Arrow_HitGround` | `Ranged/Arrow_HitGround_1.wav` … | `Arrow hitting dry dirt, wooden shaft thump and small grains of soil, short.` |
| `Ranged/Gun_Shoot` | `Ranged/Gun_Shoot_1.wav` … | `Single compact pistol shot, sharp muzzle crack with a short low body, no echo, game-ready.` |
| `Ranged/Smg_Shoot` | `Ranged/Smg_Shoot_1.wav` … | `Single compact submachine-gun shot, bright fast muzzle crack, short dry tail, no echo.` |
| `Ranged/Rifle_Shoot` | `Ranged/Rifle_Shoot_1.wav` … | `Single assault rifle shot, sharp crack with a controlled low punch, close and dry.` |
| `Ranged/Shotgun_Shoot` | `Ranged/Shotgun_Shoot_1.wav` … | `Single powerful shotgun blast, wide low boom with a crisp mechanical crack, no echo.` |
| `Ranged/Sniper_Shoot` | `Ranged/Sniper_Shoot_1.wav` … | `Single long-range rifle shot, very sharp transient and deep controlled punch, dry.` |
| `Ranged/Launcher_Shoot` | `Ranged/Launcher_Shoot_1.wav` … | `Single infantry rocket launcher firing, compressed blast and short exhaust burst, no explosion.` |
| `Ranged/Gun_Cock` | `Ranged/Gun_Cock_1.wav` … | `Short realistic firearm cocking action, metal slide and spring, dry close-up, no shot.` |
| `Throw/Throw_Light` | `Throw/Throw_Light_1.wav` … | `Small object thrown quickly through air, short light whoosh, no impact.` |
| `Throw/Throw_Spear` | `Throw/Throw_Spear_1.wav` … | `Heavy spear thrown through air, strong wooden shaft whoosh, short and directional.` |
| `Throw/Throw_Heavy` | `Throw/Throw_Heavy_1.wav` … | `Heavy object thrown, deep compact air movement, short and forceful.` |
| `Throw/Explosion_Small` | `Throw/Explosion_Small_1.wav` … | `Small game explosion, compact low boom, tiny debris ticks, no voice, no long reverb.` |
| `Throw/Explosion_Grenade` | `Throw/Explosion_Grenade_1.wav` … | `Hand grenade explosion, sharp blast followed by a brief low tail and small debris, dry.` |
| `Combat/Whiz` | `Combat/Whiz_1.wav`, `_2.wav` | `Very short bullet or projectile whiz passing near the camera, thin fast air slice, no impact.` |
| `Combat/Ricochet` | `Combat/Ricochet_1.wav`, `_2.wav` | `Metal bullet ricochet, bright ping that bends away quickly, very short, no echo.` |
| `Combat/Parry` | `Combat/Parry_1.wav`, `_2.wav` | `Successful weapon parry, bright steel snap with a compact forceful transient, dry.` |
| `Combat/Flashbang` | `Combat/Flashbang.wav` | `Non-realistic game flashbang pop, bright compressed burst with a brief high-frequency ring, no speech.` |

## 6. Phép thuật, vật thể và môi trường

| Key | File đích | Prompt |
|---|---|---|
| `Magic/Cast_Channel` | `Magic/Cast_Channel.wav` | `Arcane spell charging for a short moment, soft layered hum and tiny magical particles, no melody, dry.` |
| `Magic/Fire_Cast` | `Magic/Fire_Cast.wav` | `Short magical fire burst launching forward, hot flame whoosh with a bright crackle, no impact.` |
| `Magic/Frost_Cast` | `Magic/Frost_Cast.wav` | `Short ice spell release, crystalline frost shimmer and cold air burst, clean and dry.` |
| `Magic/Storm_Cast` | `Magic/Storm_Cast.wav` | `Short lightning spell launch, electric snap with a compact rising energy burst, no thunder tail.` |
| `Magic/Necro_Cast` | `Magic/Necro_Cast.wav` | `Short dark necromancy spell cast, low breathy shadow pulse and dry whispering texture, no words.` |
| `Magic/Arcane_Cast` | `Magic/Arcane_Cast.wav` | `Short blue arcane energy projectile launch, clean focused magical pulse, bright top end, dry.` |
| `Magic/Holy_Cast` | `Magic/Holy_Cast.wav` | `Short holy beam release, clear luminous chime blended with a warm energy burst, no melody.` |
| `Magic/Impact_Fire` | `Magic/Impact_Fire.wav` | `Fire spell hitting a target, compact flame impact with a short ember crackle, no voice.` |
| `Magic/Impact_Frost` | `Magic/Impact_Frost.wav` | `Ice spell impact, sharp crystal crack followed by a compact frozen thump, short.` |
| `Magic/Impact_Arcane` | `Magic/Impact_Arcane.wav` | `Arcane projectile impact, focused magical pop with a short glassy resonance, dry.` |
| `Magic/Impact_Storm` | `Magic/Impact_Storm.wav` | `Tiny lightning impact, bright electric snap and compact low pulse, short.` |
| `Character/Hit_Punch` | `Character/Hit_Punch.wav` | `Close heavy punch hitting padded clothing, compact body thump, no bone break, dry.` |
| `Character/BodyFall` | `Character/BodyFall.wav` | `Human body falling onto packed dirt, clothing and armor settling, heavy but safe, short.` |
| `Character/Jump` | `Character/Jump_1.wav`, `_2.wav` | `Short upward movement whoosh for a stylized 2D character jump, light and clean, no landing.` |
| `Character/Land` | `Character/Land_1.wav`, `_2.wav` | `Heavy character landing on packed dirt, short low thud with a tiny dust movement, dry.` |
| `Gate/Open` | `Gate/Open.wav` | `Old medieval wooden gate opening, short wood creak with iron hinge strain, no ambience.` |
| `Gate/Close` | `Gate/Close.wav` | `Heavy medieval wooden gate closing, compact wood slam and restrained iron rattle, dry.` |
| `Gate/Break` | `Gate/Break.wav` | `Wooden gate breaking apart under force, short crack, splinters and heavy impact, dry.` |
| `Build/Hammer` | `Build/Hammer_1.wav` … `_3.wav` | `Single carpenter hammer strike on a wooden nail or beam, crisp transient, close and dry.` |
| `Build/Saw` | `Build/Saw_1.wav`, `_2.wav` | `Short hand saw cutting rough wood, two or three gritty strokes, no ambience.` |
| `Build/Done` | `Build/Done.wav` | `Very short construction complete confirmation, warm two-note chime, clean, no melody.` |
| `Build/Collapse` | `Build/Collapse_1.wav`, `_2.wav` | `Small wooden structure collapsing, short timber crack and dusty low impact, no earthquake rumble.` |
| `Water/Splash` | `Water/Splash_1.wav`, `_2.wav` | `Medium character splash into shallow water, clean water burst and droplets, short.` |
| `Water/SplashBig` | `Water/SplashBig_1.wav`, `_2.wav` | `Large heavy splash into water, broad low water burst and falling droplets, short.` |
| `Fire/Ignite` | `Fire/Ignite.wav` | `Small flame igniting, quick spark followed by a compact warm fire burst, dry.` |
| `Fire/Crackle` | `Fire/Crackle_1.wav`, `_2.wav` | `Short isolated campfire crackle, one clean pop and tiny ember texture, no loop.` |
| `Weather/Thunder` | `Weather/Thunder_1.wav`, `_2.wav` | `Distant low thunder roll for a 2D game, compact and controlled, no rain or music.` |

## 7. Giao diện, kết trận, zombie, thú và thuỷ chiến

| Key | File đích | Prompt |
|---|---|---|
| `Ui/Click` | `Ui/Click.wav` hoặc biến thể | `Very short clean UI button click, soft mechanical tick, friendly, no reverb.` |
| `Ui/Hover` | `Ui/Hover_1.wav` … | `Very short subtle UI hover tick, lighter and quieter than a button click, clean.` |
| `Ui/Open` | `Ui/Open.wav` | `Short UI panel open sound, gentle upward digital tone, no melody.` |
| `Ui/Back` | `Ui/Back.wav` | `Short UI back or close sound, gentle downward digital tone, clean.` |
| `Ui/Error` | `Ui/Error.wav` | `Short UI error notification, restrained low two-tone buzzer, not harsh.` |
| `Ui/Success` | `Ui/Success.wav` | `Short UI success confirmation, bright compact two-note chime, no long tail.` |
| `Ui/Alert` | `Ui/Alert.wav` | `Short urgent UI alert, two quick bright pulses, clear at low volume.` |
| `ui_unlock` | `ui_unlock.wav` | `Short unlock confirmation, bright metallic click followed by a small ascending chime, clean.` |
| `weapon_overheat` | `weapon_overheat_1.wav`, `_2.wav` | `Short stylized weapon overheating warning, hot metal tick and a brief electrical pulse, no voice.` |
| `Item/Pickup_Weapon` | `Item/Pickup_Weapon.wav` | `Short item pickup sound for a weapon, light metal lift and bright confirmation, clean.` |
| `Item/Pickup_Coin` | `Item/Pickup_Coin.wav` | `Short coin pickup, two small bright metal coin ticks, no melody.` |
| `Match/Victory` | `Match/Victory.wav` | `Short victorious game result, compact brass fanfare and one drum hit, decisive ending.` |
| `Match/Defeat` | `Match/Defeat.wav` | `Short defeat result, low restrained chord and soft final fall, no long reverb.` |
| `Match/Objective` | `Match/Objective.wav` | `Short objective completed confirmation, bright game chime with a clean ending.` |
| `Match/WaveStart` | `Match/WaveStart.wav` | `Short incoming wave cue, two military drum hits with rising tension, no voice.` |
| `Match/Countdown` | `Match/Countdown.wav` | `Short game countdown tick, crisp neutral mechanical pulse, no number spoken.` |
| `General/Hire` | `General/Hire.wav` | `Medieval war camp hire confirmation: a short confident brass horn fanfare with one deep drum hit, ceremonial, dry outdoor acoustics, no reverb tail.` |
| `General/Down` | `General/Down_1.wav`, `_2.wav` | `Heavy armored commander falling to packed dirt, metal plates rattling and one low pained grunt, close and dry.` |
| `General/Fall` | `General/Fall.wav` | `Single slow tolling war drum with a low brass note fading out, funereal and heavy, medieval battlefield, no voice.` |
| `Zombie/Idle` | `Zombie/Idle_1.wav` … `_3.wav` | `Short unsettling zombie breath and throat groan, nonverbal, dry close-up, three distinct variations.` |
| `Zombie/Attack` | `Zombie/Attack_1.wav` … | `Short aggressive zombie attack grunt, nonverbal, rough breath and throat texture, no words.` |
| `Zombie/Bite` | `Zombie/Bite_1.wav` … | `Short stylized zombie bite snap with a wet restrained impact, no gore exaggeration, dry.` |
| `Zombie/Death` | `Zombie/Death_1.wav`, `_2.wav` | `Short zombie death groan descending into breath, nonverbal, dark and dry.` |
| `Zombie/Horde` | `Zombie/Horde.wav` | `Distant zombie horde murmur, low layered nonverbal groans, controlled loop-friendly ambience.` |
| `Animal/Alert_Big` | `Animal/Alert_Big_1.wav`, `_2.wav` | `Large animal alert call, deep short snort or bark, natural but stylized, no environment.` |
| `Animal/Alert_Small` | `Animal/Alert_Small_1.wav`, `_2.wav` | `Small animal alert squeak, short high-pitched natural call, clean and dry.` |
| `Animal/Growl` | `Animal/Growl_1.wav`, `_2.wav` | `Short threatening animal growl, nonverbal, low textured throat sound, dry.` |
| `Animal/Bite` | `Animal/Bite_1.wav`, `_2.wav` | `Short animal bite snap, light jaw movement and compact impact, no gore.` |
| `Animal/Death_Big` | `Animal/Death_Big_1.wav`, `_2.wav` | `Large animal dying breath, short low nonverbal exhale, restrained and dry.` |
| `Animal/Death_Small` | `Animal/Death_Small_1.wav`, `_2.wav` | `Small animal dying squeak, very short and restrained, no music.` |
| `Naval/Cannon` | `Naval/Cannon.wav` | `Single medieval ship cannon shot, deep powder blast with wood deck vibration, no ocean ambience.` |
| `Naval/CannonHit` | `Naval/CannonHit.wav` | `Cannonball hitting a wooden ship hull, heavy wood impact and splinters, short.` |
| `Naval/Sails` | `Naval/Sails.wav` | `Old sailing ship canvas and rope being hoisted, short rope strain and cloth movement, dry.` |
| `Naval/Deck` | `Naval/Deck_1.wav` … `_3` | `Heavy bootstep on wooden ship deck, one step, slight wood resonance, no ocean.` |

## 8. Bước chân, ambience và vật cưỡi

Các key sau phát lặp. Luôn tạo đủ biến thể, không dùng một file duy nhất cho cả trận.

| Key | File đích | Prompt |
|---|---|---|
| `Footsteps/Walk` | `Footsteps/Walk_1.wav` … `_4.wav` | `Four distinct single walking footsteps on packed dirt, medium weight, dry, no room tone. Export each variation separately.` |
| `Footsteps/Run` | `Footsteps/Run_1.wav` … `_4.wav` | `Four distinct single heavy running footsteps on packed dirt, stronger impact than walking, dry. Export each variation separately.` |
| `Footsteps/Grass` | `Footsteps/Grass_1.wav` … | `Single walking footstep on short dry grass over soil, close and dry, four distinct variations.` |
| `Footsteps/Stone` | `Footsteps/Stone_1.wav` … | `Single bootstep on rough stone, crisp hard impact, four distinct variations, no reverb.` |
| `Footsteps/Wood` | `Footsteps/Wood_1.wav` … | `Single bootstep on old wooden floor, compact wood resonance, four distinct variations.` |
| `Footsteps/Water` | `Footsteps/Water_1.wav` … | `Single footstep through shallow water, small splash and wet shoe movement, four variations.` |
| `Mount/Gallop` | `Mount/Gallop_1.wav` … `_4.wav` | `Single horse gallop hoofbeat on packed dirt, strong but short, four distinct variations.` |
| `Mount/Saddle` | `Mount/Saddle.wav` | `Leather saddle and metal buckle being equipped, short close-up, dry.` |
| `Ambience/Wind` | `Ambience/Wind.wav` | `Light medieval outdoor wind, sparse and loop-friendly, no music, no birds.` |
| `Ambience/WindHeavy` | `Ambience/WindHeavy.wav` | `Stronger cold wind across an open battlefield, loop-friendly, no music.` |
| `Ambience/ForestDay` | `Ambience/ForestDay.wav` | `Loop-friendly daytime forest ambience, light leaves and distant natural life, no music.` |
| `Ambience/ForestNight` | `Ambience/ForestNight.wav` | `Loop-friendly night forest ambience, sparse insects and distant leaves, no music.` |
| `Ambience/Crickets` | `Ambience/Crickets.wav` | `Loop-friendly night crickets, sparse and natural, no other ambience layer.` |
| `Ambience/Rain` | `Ambience/Rain.wav` | `Loop-friendly steady rain on an open medieval battlefield, no thunder, no music.` |
| `Ambience/Desert` | `Ambience/Desert.wav` | `Loop-friendly dry desert wind and fine sand movement, no music.` |
| `Ambience/Ocean` | `Ambience/Ocean.wav` | `Loop-friendly distant ocean waves, calm, no gulls, no music.` |
| `Ambience/Snow` | `Ambience/Snow.wav` | `Loop-friendly quiet snowy wind, sparse and cold, no music.` |
| `Ambience/BattleDay` | `Ambience/BattleDay.wav` | `Loop-friendly distant medieval battlefield, muffled drums, far shouts and impacts, never foreground.` |
| `Ambience/BattleNight` | `Ambience/BattleNight.wav` | `Loop-friendly distant night battle, muffled impacts and sparse horns, dark and restrained.` |
| `Ambience/Fire` | `Ambience/Fire.wav` | `Loop-friendly small campfire, soft flame and occasional crackle, no voices.` |

## 9. Thoại thật bằng Gemini TTS

### 9.1. Gắng sức, đau, chết, hô xung trận

Đặt file vào `Assets/Sounds/SFX/Voice/`:

| Nhóm key | Tên file | Nội dung nên đọc |
|---|---|---|
| `Voice/M_Effort` | `M_Effort_1.wav` … `_3.wav` | tiếng gắng sức ngắn, không từ: `Hah!`, `Hngh!`, `Ha!` |
| `Voice/M_Hurt` | `M_Hurt_1.wav` … `_3.wav` | tiếng bị đau ngắn: `Gah!`, `Argh!`, `Ugh!` |
| `Voice/M_Death` | `M_Death_1.wav` … `_3.wav` | hơi thở/groan cuối, không câu dài |
| `Voice/M_Battlecry` | `M_Battlecry.wav` | `Charge!`, `For the king!`, hoặc câu theo thể loại |
| `Voice/F_Effort` | `F_Effort_1.wav` … `_3.wav` | tiếng gắng sức ngắn, không từ |
| `Voice/F_Hurt` | `F_Hurt_1.wav` … `_3.wav` | tiếng bị đau ngắn, không câu dài |
| `Voice/F_Death` | `F_Death_1.wav` … `_3.wav` | hơi thở/groan cuối, không câu dài |

Prompt TTS mẫu:

```text
Generate one short game voice line in English.
Speaker: female battlefield scout, adult, clear alto voice, urgent but natural.
Performance: one breath, no music, no sound effects, no reverb, close microphone.
Read exactly: "Enemy ahead!"
Do not add any other words.
```

Với tiếng Việt:

```text
Generate one short Vietnamese game voice line.
Speaker: nữ chỉ huy chiến trường trưởng thành, giọng rõ, mạnh, khẩn trương nhưng tự nhiên.
Không nhạc, không hiệu ứng, không reverb dài, thu gần.
Đọc đúng một câu sau và không thêm chữ nào: "Giữ vững cổng thành!"
```

### 9.2. Bong bóng hô hào theo sự kiện

Hai mươi slot thật trong code là:

```text
Contact, Charge, Kill, Taunt, Hurt, LowHealth, AllyDown, Rally, Reload, Flank,
Breach, Capture, WaveIncoming, BossAppears, Victory, Defeat, Hide, Heal, Retreat, Idle
```

Đặt 6 biến thể cho mỗi slot:
`Assets/Sounds/SFX/Voice/<Slot>_1.wav` đến `<Slot>_6.wav`.

| Slot | Ví dụ transcript |
|---|---|
| `Contact` | `Enemy ahead!` |
| `Charge` | `Forward!` |
| `Kill` | `Down you go.` |
| `Taunt` | `You fight like a farmer.` |
| `Hurt` | `That one hurt!` |
| `LowHealth` | `I need a medic!` |
| `AllyDown` | `They cut him down!` |
| `Rally` | `Hold the line!` |
| `Reload` | `Reloading!` |
| `Flank` | `They're behind us!` |
| `Breach` | `The gate is open!` |
| `Capture` | `Objective secured!` |
| `WaveIncoming` | `Another wave!` |
| `BossAppears` | `Something huge is coming!` |
| `Victory` | `We won!` |
| `Defeat` | `Fall back!` |
| `Hide` | `Keep quiet.` |
| `Heal` | `I'm back in the fight.` |
| `Retreat` | `Retreat!` |
| `Idle` | `Stay sharp.` |

Prompt cho mỗi transcript:

```text
Generate exactly one short in-game voice line.
Speaker: adult medieval soldier, distinct from the other five variants.
Mood: urgent battlefield communication, natural breath, clear consonants.
No music, no ambience, no sound effects, no reverb tail.
Read exactly: "HOLD THE LINE!"
Do not add any words, narration, or silence before the line.
```

Không thay toàn bộ 120 file bằng cùng một giọng. Sáu biến thể phải có khác biệt thật
về chất giọng/cao độ/cách diễn để đám đông không nghe như một người lặp lại.

## 10. Nhạc nền cho game

Đặt đúng sáu file vào `Assets/Sounds/Music/`:

| Mood | File | Prompt Lyria |
|---|---|---|
| Menu | `Music_Menu.wav` | `Create a 30-second instrumental menu loop for a 2D stickman strategy game. Medieval battlefield mood, calm anticipation, sparse low strings, soft frame drum, subtle brass, 82 BPM, D minor. No vocals, no lyrics, loop-friendly ending.` |
| Prepare | `Music_Prepare.wav` | `Create a 30-second instrumental loop for travelling, building and preparing a medieval camp in a 2D game. Thin restrained texture, light plucked strings, distant wood percussion, almost no melody, 76 BPM, D minor. No vocals, loop-friendly.` |
| Battle | `Music_Battle.wav` | `Create a 30-second instrumental loop for an intense medieval battlefield in a 2D game. Driving war drums, urgent low strings, tense repeating ostinato, strong but readable mix, 118 BPM, D minor. No vocals, no lyrics, loop-friendly ending.` |
| Danger | `Music_Danger.wav` | `Create a 30-second instrumental loop for a desperate final stand. Darker and more unstable than the battle track, low strings, irregular war drums, restrained dissonance, rising pressure, 126 BPM, D minor. No vocals, loop-friendly.` |
| Victory | `Music_Victory.wav` | `Create a 5-second instrumental medieval victory sting. Confident brass fanfare, one deep drum hit, decisive final chord, bright but not comic, no vocals, no long reverb, do not loop.` |
| Defeat | `Music_Defeat.wav` | `Create a 5-second instrumental defeat sting for a medieval game. Low cello, muted horn, one soft drum hit, descending final chord, restrained and serious, no vocals, do not loop.` |

Sau khi sinh nhạc, kiểm tra đầu/cuối có nối mượt không. Nếu Lyria chỉ trả MP3 thì
đổi sang WAV trước khi đưa vào pipeline chuẩn của dự án. Điền clip vào
`Assets/Resources/StickmanMusicBank.asset` bằng tool/builder hiện có; không sửa code
`MusicDirector` chỉ để đổi tên file.

## 11. Tiếng Trường quay / Cinematic

`CinematicAudio` gọi các key dưới đây qua `Cine/`. File đặt trong
`Assets/Sounds/SFX/Cine/`. Tiếng phim phát 2D để không lệch khi camera lia.

| Enum/key | File đích | Prompt |
|---|---|---|
| `Whoosh` / `Cine/Whoosh` | `Whoosh_1.wav`, `_2.wav` | `Cinematic camera transition whoosh, fast clean air sweep, elegant and readable, short natural tail.` |
| `Boom` / `Cine/Boom` | `Boom_1.wav`, `_2.wav` | `Cinematic low impact boom for a title card or kill-cam, deep controlled sub hit, compact body, short tail, no music.` |
| `Riser` / `Cine/Riser` | `Riser.wav` | `Short cinematic tension riser, smooth upward tonal movement, ends cleanly before the reveal, no melody.` |
| `Horn` / `Cine/Horn` | `Horn_1.wav`, `_2.wav` | `Short medieval war horn signal for an army reveal, bold brass, dry outdoor attack, decisive ending.` |
| `Drum` / `Cine/Drum` | `Drum.wav` | `Short sequence of tense deep war drums, cinematic but dry, ending with one clear hit.` |
| `Sting` / `Cine/Sting` | `Sting.wav` | `Short cinematic ending sting, dark brass and strings resolving to one clean final chord, no long tail.` |
| `Heartbeat` / `Cine/Heartbeat` | `Heartbeat.wav` | `Two or three close low human heartbeats, tense and dry, no ambience, no voice.` |
| `SwordRing` / `Cine/SwordRing` | `SwordRing_1.wav`, `_2.wav` | `Two steel swords collide and ring, bright metallic resonance, cinematic close-up, short tail.` |
| `ArrowVolley` / `Cine/ArrowVolley` | `ArrowVolley_1.wav`, `_2.wav` | `Large volley of arrows leaving bows together, layered string snaps and fast air movement, no impacts.` |
| `Wind` / `Cine/Wind` | `Wind.wav` | `Cold lonely wind across an empty medieval landscape, cinematic short swell, no music, no birds.` |
| `Crowd` / `Cine/Crowd` | `Crowd_1.wav`, `_2.wav` | `Distant medieval crowd cheer and army murmur, no intelligible words, short controlled swell.` |
| `Bell` / `Cine/Bell` | `Bell.wav` | `Single cold medieval bell strike for a title card, clear tone, short controlled decay, no music.` |
| `Growl` / `Cine/Growl` | `Growl_1.wav`, `_2.wav` | `Large unseen creature growl for a zombie reveal, low nonverbal throat texture, short and threatening.` |
| `Siren` / `Cine/Siren` | `Siren.wav` | `Short low warning siren for an incoming threat, two rising pulses, cinematic and restrained, no voice.` |

Các key này phải giữ nguyên chính tả. Thêm enum tiếng phim mới thì phải nối cả
`CinematicAudio.KeyOf`, `StickmanAudioSynth`/recipe và Doctor; chỉ thả file mới không
đủ nếu code chưa gọi key đó.

## 12. Quy trình đưa file vào Unity

### SFX hoặc voice

1. Sinh/tải file và đặt vào đúng thư mục dưới `Assets/Sounds/SFX/`.
2. Đo file bằng `sfx.py report()`; voice có thể dùng thêm `voice_preview.py`.
3. Trong Unity chạy:
   `Tools > Stickman > Nâng cao > Audio > 4. Dựng bảng tiếng`.
4. Nếu key thuộc field của prefab/vũ khí, chạy thêm:
   `Tools > Stickman > Audio > 2. Wire SFX to Prefabs`.
5. Với vũ khí nhặt trong scene đang mở, chạy thêm mục wire scene nếu cần.
6. Chạy Doctor; sau đó người làm game phải nghe thử trong Unity.

### Nhạc

1. Đặt đúng sáu tên `Music_*.wav` trong `Assets/Sounds/Music/`.
2. Dùng tool `Vỏ game & Công thức > Bảng nhạc nền (+ sinh nhạc bù)` để cập nhật
   `Assets/Resources/StickmanMusicBank.asset`.
3. Kiểm tra `Menu`, `Prepare`, `Battle`, `Danger` loop; `Victory` và `Defeat` không loop.
4. Chạy màn chơi thật và kiểm tra chuyển khí sắc không bị chồng hai bản nhạc.

### Trường quay

1. Đặt file vào `Assets/Sounds/SFX/Cine/` theo bảng ở mục 11.
2. Chạy `Audio > 4. Dựng bảng tiếng`.
3. Mở/cập nhật Trường quay và chạy Doctor `Tiếng phim đã sinh chưa`.
4. Quay thử một phim có chuyển cảnh, boom, thoại và cúi nhạc; kiểm tra tiếng không
   lệch khỏi hình khi camera lia.

## 13. Không được làm

- Không đưa Gemini API key vào C# runtime, prefab, scene, Git hoặc file trong `Assets/`.
- Không gửi API key/mật khẩu vào chat.
- Không đổi tên file cho đẹp nếu key code đã cố định.
- Không dùng `AudioSource.PlayClipAtPoint`; hệ thống này phát qua `StickmanAudio`.
- Không ghi đè clip đang nghe tốt khi chưa lưu bản cũ.
- Không tuyên bố âm thanh “đã hay” chỉ dựa trên việc file tồn tại. Phải đo file và người
  làm game nghe thử.

## 14. Checklist bàn giao Git

```text
[ ] Prompt đã lưu hoặc cập nhật trong tài liệu này.
[ ] File đúng WAV/MP3 và đúng sample rate.
[ ] Tên file khớp key, biến thể dùng _1/_2/_3...
[ ] Không có silence đầu/cuối bất thường.
[ ] Đã chạy sfx.py report() hoặc voice_preview.py.
[ ] Đã chạy Audio > 4 để dựng SoundBank.
[ ] Đã chạy Audio > 2 nếu prefab cần AudioClip.
[ ] Đã cập nhật MusicBank nếu là nhạc.
[ ] Đã chạy Doctor liên quan.
[ ] Đã nghe thử trong Unity/Trường quay.
[ ] Không có API key, mật khẩu hoặc file cache trong commit.
```

## 15. Tài liệu và code nguồn sự thật

- `Docs/KnowledgeBase/Audio.md` — key âm thanh, SoundBank và các bẫy Unity.
- `Docs/AgentRules/AssetGeneration.md` — chuẩn asset và kiểm bằng số liệu.
- `Docs/AgentRules/Chatter.md` — 20 slot thoại và quy tắc chống spam.
- `Docs/AgentRules/Cinematic.md` — hệ Trường quay và tiếng phim.
- `Assets/Editor/Audio/StickmanAudioBuilder.cs` — bảng clip/prefab.
- `Assets/Editor/Audio/StickmanAudioSynth.cs` — bảng recipe tiếng bù.
- `Assets/Scripts/Map/Cinematic/CinematicAudio.cs` — key `Cine/*` thật.
- `Assets/Scripts/Core/Audio/MusicBank.cs` — sáu `MusicMood` thật.
