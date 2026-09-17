# Âm thanh — bộ SFX và cách gắn vào game

Nguồn: **Ultimate SFX Bundle - HD Remaster** (gói mua sẵn, nằm ở dự án
`E:\Project\AssetGame\Assets\Sounds\Ultimate SFX Bundle - HD Remaster` — 9.739 file, 40+ pack con).
Dự án này **không** copy cả gói: chỉ 42 clip đã chọn nằm trong `Assets/Sounds/SFX/`.

> Copy clip thì copy **cả file `.meta`** — giữ nguyên GUID nên prefab đã gắn không bị mất
> tham chiếu. Tool `StickmanAudioBuilder` làm sẵn việc này.

## 1. Menu `Tools > Stickman > Audio`

| Menu | Việc |
|---|---|
| **0. Do Everything (1-3)** | chạy tuốt 3 mục dưới — **âm thanh chưa kêu thì bấm cái này** |
| 1. Import SFX from Asset Pack | copy clip theo bảng `Library` trong `StickmanAudioBuilder.cs` từ gói SFX ngoài vào `Assets/Sounds/SFX`, rồi ép mono + PCM (2D thì stereo chỉ tổ nặng) |
| 2. Wire SFX to Prefabs | gắn clip vào 16 vũ khí · 6 loại đạn · `Character.prefab` (mọi variant ăn theo) · 3 trang bị · bước chân · giọng nhân vật |
| 3. Wire SFX in Open Scene (nhặt đồ) | gắn tiếng nhặt cho vũ khí nằm dưới đất trong scene đang mở |
| Reset Auto-Wire Flag | cho phép `StickmanAudioAutoWire` tự gắn lại ở lần nạp script sau |

Dựng lại prefab vũ khí (`Weapons > 2`) là **tự gắn tiếng luôn** — `BuildPrefabs()` gọi
`WireToPrefabs` ở cuối, nếu không thì vũ khí mới sinh ra sẽ câm cho tới khi ai đó nhớ bấm menu Audio.

> **Copy clip vào `Assets/Sounds/SFX` KHÔNG tự làm game kêu** — phải gắn vào field của prefab.
> Bước này hay quên nhất, nên `StickmanAudioAutoWire` ([InitializeOnLoad], `Assets/Editor/`)
> chạy giúp **một lần** ngay lần Unity nạp lại script đầu tiên. Xong thì ghi cờ vào EditorPrefs,
> không chạy nữa. Đổi clip hay thêm vũ khí → bấm tay mục 2.

**KHÔNG có nhạc nền** — dự án cố ý không dùng (đã thử rồi bỏ). Chỉ có tiếng vũ khí, tiếng
nhân vật, tiếng bước chân. Muốn nhạc thì gói `OST Pro` / `Casual Music` vẫn nằm trong bundle.

**Bảng trong `StickmanAudioBuilder.cs` là nguồn sự thật.** Thêm vũ khí mới → thêm 1 dòng
trong `Weapons`, bấm lại nút 2. Đừng kéo tay từng ô AudioClip: 16 vũ khí × 2 ô là chỗ để quên.

Vì sao mục 3 tách riêng: `WeaponPickup` do `StickmanDemoBuilder` gắn **lúc dựng scene**
(không có sẵn trong prefab vũ khí) nên nút 2 không với tới được. Dựng lại scene demo thì
builder tự gắn tiếng nhặt, khỏi cần mục 3.

## 2. Clip nào kêu ở đâu

| Ô trong code | Clip | Ghi chú |
|---|---|---|
| `MeleeWeapon._swingClip` | `Melee/Swing_*` | vung hụt cũng kêu |
| `MeleeWeapon._hitClip` | `Melee/Hit_*` | chạm người mới kêu |
| `RangedWeapon._drawClip` / `_shootClip` | `Ranged/Bow_Draw`, `Bow_Shoot`, `Gun_Cock`, `Gun_Shoot` | draw phát lúc bắt đầu tích lực |
| — bộ súng hiện đại | `Ranged/Smg_Shoot`, `Rifle_Shoot`, `Shotgun_Shoot` + `Shotgun_Cock`, `Sniper_Shoot`, `Launcher_Shoot` | mỗi cây một tiếng đầu nòng riêng (Demo_7) |
| `ThrowableWeapon._throwClip` | `Throw/Throw_*` | |
| `ShieldWeapon._blockClip` / `WeaponBase._attackClip` | `Melee/Block_Shield` / `Melee/Bash_Shield` | |
| `ProjectileController._launchClip` / `_hitClip` | `Ranged/Arrow_*`, `Bullet_*`, `Throw/Explosion_*` | bom/lựu đạn: tiếng nổ nằm ở `_hitClip` |
| `StickmanCombatVoice` (giọng người) | `Voice/M_*`, `Voice/F_*` | xem mục 2b — **đừng gán thêm `StickmanController._hurtClip`/`_deathClip`**, kêu 2 tiếng chồng nhau |
| `EquipmentDefinition.blockClip` | `Melee/Block_Shield`, `Melee/Block_Armor` | khiên / nón + giáp đỡ đòn |
| `WeaponPickup._pickupClip` | `Item/Pickup_Weapon` | |
| `StickmanFootsteps._walkClips` / `_runClips` | `Footsteps/Walk_1..4`, `Run_1..4` | xem mục 3 |

Vũ khí nào dùng clip nào (kiếm dài ≠ đoản đao ≠ giáo ≠ búa) xem bảng `Weapons` trong tool.

**`WeaponBase._attackClip` cố tình để trống** với vũ khí có tiếng riêng: nó là clip *cộng thêm*,
gắn vào là mỗi đòn kêu 2 tiếng chồng nhau. Chỉ khiên dùng nó (khiên không có clip "đánh" riêng).

## 2b. Tiếng NHÂN VẬT khi đánh nhau — `StickmanCombatVoice`

Một component trên `Character.prefab` (mọi variant ăn theo) lo hết bốn lúc lên tiếng:

| Lúc | Nghe từ | Clip | Chống ồn |
|---|---|---|---|
| **Gắng sức khi ra đòn** | `WeaponBase.AnyAttacked` (event tĩnh, mới thêm) | `Voice/*_Effort_1..3` | 30% số đòn, nghỉ 1,2 giây |
| **Trúng đòn** | `StickmanController.Damaged` | `Voice/*_Hurt_1..3` | 70%, nghỉ 0,5 giây |
| **Chết** | `StickmanController.Died` | `Voice/*_Death_1..3` | luôn kêu |
| **Hô xung trận** | `StickmanAgent` gọi `PlayBattlecry()` khi XÔNG LIỀU phá bế tắc | `Voice/M_Battlecry` | theo nhịp xông liều |

Ba thứ làm một đám lính nghe ra một đám người chứ không phải một người phát 10 loa:

1. **Hai giọng nam/nữ** (`Hero Voice Jack` + `Hero Voice Amy`), `VoiceGender.RandomPerCharacter`
   là mặc định — mỗi nhân vật bốc một giọng lúc sinh ra.
2. **Mỗi nhân vật một độ lệch cao độ cố định** (±7%) — cùng bộ clip mà nghe khác nhau.
3. **Mỗi tiếng random thêm cao độ** và không bốc trùng clip vừa phát.

Vì sao nghe event tĩnh `WeaponBase.AnyAttacked` chứ không nghe vũ khí đang cầm: đổi vũ khí
giữa trận là phải đăng ký lại, dễ quên. Event tĩnh + lọc theo `weapon.Owner` thì không bao giờ sai.

**Đòn kết liễu chỉ kêu tiếng CHẾT**, không kêu tiếng trúng đòn chồng lên (`OnDamaged` bỏ qua
khi `IsDie`) — thứ tự này do `StickmanController` bắn `Damaged` trước rồi mới `Died`.

## 3. Bước chân — `StickmanFootsteps`

Nghe event `StickmanLegWalker.Stepped` (bắn ra mỗi khi bàn chân chạm đất — `lift = max(0, cos(phase))`
nên cứ mỗi π radian là một bước) → tiếng **luôn khớp với chân đang vẽ**, không phải hẹn giờ đoán mò.

- Đi bộ dùng `_walkClips`, chạy dùng `_runClips` (hợp với hệ thể lực — xem
  [AI-NPC.md](AI-NPC.md) mục 5.33). Chạy còn được nhân âm lượng `_runVolumeScale`.
- Mỗi bước bốc clip ngẫu nhiên **không trùng clip vừa phát** + random cao độ → đi mãi không nghe máy móc.
- `_minInterval` chặn tiếng ré khi cadence vọt lên.
- Chưa gán `_runClips` thì tự lấy clip đi bộ, còn hơn im lặng.

Đổi mặt đất (cát, tuyết, gỗ, kim loại...): gói `Ultimate Footstep Sounds` có 14 chất liệu ×
(đi bộ / chạy nặng / chân trần). Đổi thư mục nguồn trong bảng `Library` rồi bấm nút 1 + 2.

## 4. Còn gì trong gói mà chưa dùng

| Pack | Dùng được vào |
|---|---|
| `OST Pro` (5 bài, có stem rời) · `Casual Music` (11 loop + 5 stinger) | nhạc nền — **cố ý chưa dùng** |
| `Battlefield Sounds Pro` · `Natural Ambiances Pro` · `Mediveal Ambiences` | tiếng nền trận đánh / rừng / thị trấn |
| `Hero Voice Jack` / `Amy` — còn ~480 câu mỗi giọng | lệnh đội hình, "Enemy spotted", "Retreat!", "Reloading" cho AI nói khi đổi state |
| `Ui & Item Sounds` (512 file) · `Modern UI Sounds` (152) | nút bấm, mua bán, coin, thắng/thua |
| `Casual Game Announcer` (400 câu tiếng Anh) · `Russian announcer pack` | giọng hô "Attack!", "Boss", "Win"... |
| `Gore Sounds Pro` | chém đứt lìa / máu me nếu muốn nặng đô hơn |
| `Fighting Sounds Pro` (220 file) | đấm đá tay không, `Body Fall` cho ragdoll tiếp đất |
| `Dragon` · `Monsters` · `Zombie` · `Alien` · `Ghost` Sounds Pro | quái vật về sau |
| `Real Recorded Guns` · `Gun Sounds Pro` (148) | thêm loại súng (shotgun, sniper, assault) |

Muốn thêm: thêm dòng vào `Library` trong `StickmanAudioBuilder.cs` (đích · thư mục pack ·
mẫu tên file · số biến thể) rồi bấm nút 1.

## 5. Cách phát tiếng — và cái bẫy `PlayClipAtPoint`

**Dùng `StickmanAudio.Play` / `PlayVaried`, ĐỪNG dùng `AudioSource.PlayClipAtPoint`.**

`PlayClipAtPoint` tạo AudioSource **3D** (`spatialBlend = 1`). Game này 2D, camera đứng ở
**z = -10**, nên mọi tiếng đều cách người nghe 10 unit → rolloff logarit bóp còn khoảng **1/10
âm lượng**. Triệu chứng: cắm clip đủ chỗ mà chơi vẫn "không nghe thấy gì", vặn loa hết cỡ mới
nghe văng vẳng. Toàn bộ 11 chỗ phát tiếng trong dự án (vũ khí · đạn · khiên · trang bị · nhân
vật · nhặt đồ) đã chuyển sang `StickmanAudio` — `spatialBlend = 0`, nghe đều khắp màn.

`StickmanAudio.PlayVaried` còn lệch cao độ ngẫu nhiên ±7% — đòn đánh liên tục mà đúng một cao
độ nghe rất máy móc. `PlayClipAtPoint` không chỉnh pitch được, đó là lý do thứ hai để bỏ nó.

`StickmanFootsteps` giữ AudioSource riêng (bước chân dày, không nên sinh/huỷ GameObject mỗi bước).

Chưa có AudioMixer / bus âm lượng. Khi cần chỉnh to nhỏ theo nhóm thì dựng mixer rồi trỏ
AudioSource vào group tương ứng — sửa một chỗ trong `StickmanAudio` là xong, vì mọi tiếng
đều đi qua đó.

---

## 6. BẢNG TRA THEO KHOÁ — cho chỗ KHÔNG có prefab (2026-09-06)

### Vấn đề đã đo được

Cách gắn tiếng của dự án tới 2026-09-06 là **đổ `AudioClip` vào field của prefab**
(`WireToPrefabs`). Cách đó chỉ chạy được với thứ CÓ prefab. Kết quả đo trên đĩa:
**19 / 354 script có `AudioClip`** — tức cả trò chơi chỉ kêu lúc đánh nhau. Nút bấm, tiếng gió
của map, thắng/thua, búa lúc xây, cổng mở, xác sống, công trình sập: **im hoàn toàn**.

### Cách chữa

| Mảnh | Ở đâu | Việc |
|---|---|---|
| `StickmanSoundBank` | `Assets/Resources/StickmanSoundBank.asset` | bảng `khoá → clip[]` + âm lượng theo nhóm |
| `StickmanAudio.PlayKey / PlayUi` | Core | phát theo khoá, có `maxDistance` |
| `StickmanAmbience` | Core, tự dựng lúc vào màn | ba lớp NỀN · THỜI TIẾT · TRẬN XA, chạy vòng lặp |
| `Audio > 4. Dựng bảng tiếng` | `StickmanAudioBuilder.BuildSoundBank` | quét `Assets/Sounds/SFX` sinh bảng |

**Khoá = đường dẫn dưới `Assets/Sounds/SFX`, bỏ đuôi và bỏ hậu tố biến thể.**
`Footsteps/Walk_1..4.wav` → một khoá `Footsteps/Walk` có 4 biến thể. Quét thư mục chứ không kê
tay theo bảng import, nên clip người dùng tự thả vào cũng vào bảng.

⚠ Cắt hậu tố `_N` **chỉ khi đuôi là số thuần** — `Melee/Hit_Sword` cũng có gạch dưới.

### Đã nối vào đâu

| Khoá | Chỗ gọi |
|---|---|
| `Ui/Click` | `StickmanUI.Begin()` — 41 màn HUD cùng lúc, xem `AgentRules/UI.md` |
| `Ambience/*` | `StickmanAmbience`; `DayNightCycle.BeginPhase` → `SetNight`, `WeatherAmbience.Rebuild` → `SetWeather` |
| `Match/Victory` · `Match/Defeat` | `MatchDirector.Finish` — dùng ĐÚNG phép so phe của `DrawResult` |
| `Character/Jump` · `Character/Land` | `StickmanLocomotion.DoJump` / `UpdateGroundState` |
| `Build/Hammer` · `Build/Saw` · `Build/Done` | `ResourceNode.FinishTrip` / `FinishConstruction` |
| `Build/Collapse` | `DestructibleTarget.OnDeath` |
| `Gate/Open` · `Gate/Close` · `Gate/Break` | `VillageGate` |
| `Zombie/Idle` · `Zombie/Death` | `ZombieUnit` |
| `General/Hire` · `General/Down` · `General/Fall` | `CampGeneral` — mua tướng · tướng gục · tướng ngã |

### Ba cái bẫy

⚠ **`maxDistance` là bắt buộc cho tiếng của NHÂN VẬT.** Mọi voice của `StickmanAudio` là **2D**
(cố ý — camera ở z = −10 nên tiếng 3D còn ~1/10 âm lượng, đúng bẫy ở mục 5). 2D nghĩa là một
anh lính tiếp đất ở đầu kia bản đồ kêu to bằng anh đứng cạnh.

⚠ **Tiếng tiếp đất phải có NGƯỠNG tốc rơi** (3.5). Nhân vật đi trên địa hình lượn sóng rời-chạm
đất liên tục (`TerrainGround`), không có ngưỡng thì đi bộ trên đồi là nghe thình thịch từng bước.

⚠ **Thiếu khoá thì im lặng, không lỗi.** `PlayKey` bỏ qua khoá không có — đúng luật số 1 của làn
tiếng. Chỗ DUY NHẤT phát hiện được là bảng `Audio > 4` in ra: nó quét `PlayKey("…")`/`PlayUi("…")`
trong `Assets/Scripts` rồi réo tên khoá nào code có gọi mà bảng chưa có.

⚠ Đổi pha ngày/đêm phải HOÀ TIẾNG (hai `AudioSource` chéo nhau), đừng đổi `clip` rồi `Play()`:
cắt ngang một vòng lặp là nghe rõ tiếng "cạch", mà ngày/đêm thì đổi liên tục cả ván.

---

## 6b. ĐẶT TIẾNG CHO TƯỚNG — ba khoá còn trống (2026-09-08)

Mode Doanh trại nay bán TƯỚNG, và hai sự kiện đắt nhất của cả ván (mua tướng · tướng ngã) hiện
đang **im lặng**: `PlayKey` bỏ qua khoá chưa có, đúng luật số 1 của làn tiếng.

Theo luật bàn giao art/tiếng của dự án, **AI viết PROMPT, không tự sinh file** — tiếng nhờ Gemini.
Ba clip cần, mono 44.1 kHz, `.wav`, để vào bảng `StickmanSoundBank` đúng khoá:

| Khoá | Prompt gợi ý cho Gemini | Dài |
|---|---|---|
| `General/Hire` | *"Medieval war camp: a short brass horn fanfare with a single deep drum hit, confident and ceremonial, dry outdoor acoustics, no reverb tail, mono"* | ~1.2 s |
| `General/Down` | *"Heavy armored body falling to dirt, metal plates rattling, one low pained grunt, close and dry, mono"* | ~0.8 s |
| `General/Fall` | *"Single slow tolling war drum with a low brass note fading out, funereal and heavy, medieval battlefield, mono"* | ~2 s |

⚠ Ba khoá này sẽ hiện trong danh sách «CODE GỌI MÀ BẢNG KHÔNG CÓ» của `Audio > 4` cho tới khi có
clip — đó là bảng làm việc, không phải lỗi.

⚠ `General/Fall` gọi với `maxDistance: 48` (nghe được gần hết bản đồ, vì đó là sự kiện của cả
phe), hai khoá kia gần hơn. Xem cái bẫy «`maxDistance` là bắt buộc» ở mục 6.

---

## 7. TIẾNG BÙ — khi máy KHÔNG có gói SFX mua sẵn (2026-09-07)

User bấm *Dựng bảng tiếng* và thấy **«CODE GỌI MÀ BẢNG KHÔNG CÓ (12)»**: `Build/Collapse` ·
`Build/Done` · `Build/Hammer` · `Build/Saw` · `Character/Jump` · `Character/Land` ·
`Gate/Break` · `Gate/Close` · `Gate/Open` · `Ui/Click` · `Zombie/Death` · `Zombie/Idle`.

**Gốc thật:** bộ SFX của dự án đi MUA và nằm NGOÀI repo (`E:\Project\AssetGame\…`, 9.739 file).
Máy nào không có thư mục đó thì `Audio > 1. Import SFX` không copy được gì, mà
`StickmanAudio.PlayKey` **lặng lẽ bỏ qua** khoá không có trong bảng — nên mỗi khoá thiếu là một
tiếng động không bao giờ kêu, và không có lỗi nào báo. Chỗ DUY NHẤT phát hiện được là bảng báo
cáo của `Audio > 4`.

**Chốt: `StickmanAudioSynth` — `Audio > 5. Sinh tiếng BÙ cho khoá còn câm`** (cũng có ở Bảng
điều khiển và ở dây chuyền nhóm 0). Nó tổng hợp 12 tiếng bằng DSP tay (nhiễu + sin + răng cưa +
lọc một cực + hai bộ cộng hưởng làm formant cho giọng zombie), ghi WAV 16-bit PCM mono 44.1 kHz
rồi **dựng lại bảng luôn** — bấm một nút là hết câm.

| Luật | Vì sao |
|---|---|
| **KHÔNG ghi đè file đã có** (`overwrite: false`) | Máy CÓ gói thật bấm nhầm cũng không mất clip mua sẵn. Đây là phương án DỰ PHÒNG, không phải nguồn chính |
| **Hạt giống theo TÊN KHOÁ** | Bấm lại ra ĐÚNG file cũ. Clip đổi mỗi lần dựng là thứ không ai kiểm được |
| **Nhiều biến thể cho tiếng LẶP** (rên 3 · búa 3 · cưa/sập/nhảy/tiếp đất 2) | Một clip phát mấy chục lần một phút nghe ra một cái máy, không ra một bầy — cùng lý do `ZombieUnit.TickGroan` giãn nhịp ngẫu nhiên |
| **Vuốt 4 ms hai đầu + chuẩn hoá đỉnh 0.89** | Mẫu đầu/cuối khác 0 là một cú "tách" nghe rõ, và với tiếng phát liên tục thì đó là tiếng khó chịu nhất |

⚠⚠ **TÊN FILE LÀ KHOÁ.** `StickmanAudioBuilder.KeyFor` bỏ đuôi rồi CẮT hậu tố `_1`/`_2`… nếu
phần đuôi là SỐ THUẦN. Nên `Zombie/Idle_1.wav` + `Zombie/Idle_2.wav` gộp về đúng một khoá
`Zombie/Idle`; còn `Zombie/Idle_Groan.wav` ra một khoá KHÁC và khoá code đang gọi vẫn câm.
⚠ Thay bằng tiếng thật: thả file vào đúng thư mục với đúng tên rồi bấm `Audio > 4`. Không phải
sửa dòng code nào — bảng đọc theo FILE CÓ THẬT.
### TỰ SINH TIẾNG CHO KHOÁ MỚI — KHÔNG HỎI NỮA (2026-09-09)

User: *"thiếu âm thanh nào thì cứ sinh ra không cần hỏi"*.

`Audio > 4. Dựng bảng tiếng` nay **tự sinh tiếng tạm** cho mọi khoá còn câm rồi dựng lại
bảng, thay vì chỉ in danh sách «CODE GỌI MÀ BẢNG KHÔNG CÓ» cho người đi báo. Từ nay
**bảng không bao giờ còn khoá câm**: thêm một dòng `PlayKey("Foo/Bar")` trong code, bấm
`Audio > 4`, là có tiếng.

`StickmanAudioSynth.EnsureKeys` đoán NHÓM từ tền tố của khoá rồi dùng lại công thức có sẵn:

| Tiền tố | Dùng công thức |
|---|---|
| `ui` · `menu` · `hud` | tiếng bấm nút |
| `weapon` · `gun` · `reload` | kim loại + hơi xì |
| `build` · `structure` | búa gõ |
| `fort` · `gate` · `door` | cổng vỡ |
| `zombie` · `beast` · `animal` | tiếng rên |
| `weather` · `storm` | sấm |
| `general` · `hero` · `character` · `unit` · `mount` · `vehicle` | thân người / hô / tiếp đất |
| còn lại | `PlaceholderBlip` — hai nốt khô, **cố ý nghe ra "chưa ai làm tiếng này"** |

⚠ Tiếng tạm KHÔNG thay công thức viết tay. Nâng cấp bằng một trong hai đường, cả hai đều
không phải sửa chỗ nào khác: thêm dòng vào `Recipes`, hoặc thả `.wav` trùng tên vào đúng
thư mục (tool không bao giờ đè file đã có).

⚠ Khoá có ký tự lạ (chuỗi nội suy `$"Fx/{name}"` chẳng hạn) thì KHÔNG tự sinh — `IsCleanKey`
chặn tại cửa, và báo cáo vẫn liệt kê chúng để người viết code sửa thành khoá tĩnh.

### ĐỢT HAI — bảy khoá câm mới (2026-09-09)

`Audio > 4` báo tiếp **«CODE GỌI MÀ BẢNG KHÔNG CÓ (7)»**; user: *"thiếu cái nào thì thêm
cái đó"*. Công thức nằm ở file phần `StickmanAudioSynth.Batch2.cs` (file gốc đã 600 dòng),
bảng `Recipes` vẫn là nơi duy nhất khai khoá.

| Khoá | Ai gọi | Tiếng gì |
|---|---|---|
| `Character/Shout` ×2 | `ThreeKingdomsDuel`, `ThreeKingdomsHeroSkill` | hô xung trận — răng cưa qua hai formant, cao độ nhích LÊN |
| `General/Hire` | `CampGeneral` | cồng nhỏ + hai nốt ĐI LÊN (được thêm người) |
| `General/Down` ×2 | `CampGeneral`, `ThreeKingdomsDuel` | thịch + giáp loảng xoảng + rên tụt cao độ |
| `General/Fall` | `CampGeneral`, `ThreeKingdomsStandard` | trống trầm + cán cờ gãy + đuôi ngân tụt (to hơn `Down`) |
| `ui_unlock` | `NoticeBoard` | ba nốt chuông đi lên — sáng hơn `Ui/Click` |
| `weapon_overheat` ×2 | `RangedWeapon` | hơi xì + ba tiếng "tách" kim loại lệch nhịp |
| `Weather/Thunder` ×2 | `WeatherAmbience` | cú nứt sắc + tiếng ầm trầm cuộn ~1,9 giây |

⚠⚠ **`ui_unlock` và `weapon_overheat` KHÔNG CÓ THƯ MỤC.** Code gọi đúng chuỗi đó, mà `KeyFor`
lấy đường dẫn dưới `Assets/Sounds/SFX` làm khoá ⇒ file phải nằm THẲNG ở `SFX/`. Đổi thành
`Ui/Unlock.wav` cho gọn mắt là khoá lệch và tiếng lại câm — không lỗi nào báo.

⚠ **`Generate` cũ ghép thư mục bằng `$"{SfxRoot}/{Path.GetDirectoryName(key)}"`**, khoá không có
thư mục ra `…/SFX/` thừa dấu `/` ⇒ tạo một thư mục tên rỗng. Đã vá cùng đợt.

⚠ **Chứng của tool trước đây chỉ là MỘT file** (`Ui/Click.wav`) — thêm khoá mới thì chấm
trên Bảng điều khiển vẫn XANH vì file cũ đã có. Nay `ProofPaths()` kể ĐỦ 19 file và
`requiresAll` ⇒ thiếu một tiếng là ĐỎR.

**Đo trước khi port** (`.claude/skills/stickman-assets/scripts/sfx_check.py`, cùng thói quen với art vẽ bằng Python): dựng lại bảy
công thức bằng Python rồi in RMS theo sáu đoạn. Bắt được một lỗi thật: **tiếng sấm bản đầu
chỉ còn MỘT CÚ CLICK** — nhiễu lọc xuống 150 Hz chỉ còn biên độ ~0,03 trong khi cú nứt là 0,85,
mà `Normalize` chia theo ĐỈNH nên thân tiếng bị dìm xuống RMS 0,06 (sáu tiếng kia đều ~0,30).
Chỉnh hệ số cuộn 1.6 → 6.0 và hạ cú nứt 0.85 → 0.45 thì RMS lên 0,26/0,19/0,22 mà cú nứt
vẫn là đỉnh. **Luật rút ra: sau khi chuẩn hoá theo đỉnh, hãy đo RMS THÂN tiếng — một transient
to có thể ăn hết phần còn lại mà nhìn dạng sóng không thấy.**

⚠ Muốn tiếng ĐẸP thì đặt hàng ngoài (bản thu thật / công cụ sinh tiếng), đừng nâng cấp mấy công
thức DSP này: chúng cố ý ngắn và khô, đủ để ĐỌC RA chuyện gì đang xảy ra, không cố giả bản thu.


---

## ĐỢT BA — TÁM KHOẢNH KHẮC TRƯỚC NAY HOÀN TOÀN CÂM (2026-09-09)

Công thức ở `StickmanAudioSynth.Juice.cs`; bảng `Recipes` (file gốc) vẫn là nơi DUY NHẤT khai khoá.

| Khoá | Biến thể | Ai gọi | Trước đây |
|---|:-:|---|---|
| `Combat/Whiz` | 2 | `ShotFeedback.TryWhiz` | đạn bay sát tai người chơi: **im** |
| `Combat/Ricochet` | 2 | `ShotFeedback.Ricochet` | đạn đập vào tường đá: im |
| `Combat/Parry` | 2 | `MeleeWeapon.PlayGuardBlockFeedback` (nhánh `else`) | máy KHÔNG có gói SFX thì cú đỡ — khoảnh khắc quyết định của cả pha cận chiến — hoàn toàn câm |
| `Combat/Flashbang` | 1 | `AreaHazard.Begin` | quả choáng làm CHOÁNG người chơi mà không phát ra tiếng nào |
| `Water/Splash` | 2 | `WaterZone.OnTriggerEnter2D` | cả trận thuỷ chiến không một tiếng nước |
| `Fire/Crackle` | 2 | `AreaHazard.Update` (ba nhịp một lần ≈ 1,2 s) | vũng lửa cháy giữa sân: im |
| `Fire/Ignite` | 1 | `AreaHazard.Begin` | — |
| `Character/Heartbeat` | 1 | `StickmanScreenFx` | sắp chết chỉ có một thanh máu ở góc màn |

⚠⚠ **Tiếng phát LIÊN TỤC phải NGẮN và phải có BIẾN THỂ.** `Whiz` và `Parry` nổ hàng chục lần
một phút; một clip duy nhất thì tai bắt được vòng lặp ngay (cùng lý do `Zombie/Idle` có ba biến thể).

⚠⚠ **`Character/Heartbeat` KHÔNG dùng lại `Cine/Heartbeat`** dù "cùng là tiếng tim":
bản trường quay dài 1,25 s, mà `StickmanScreenFx` gọi lại mỗi **0,52 s** lúc gần chết ⇒ ba lớp
chồng lên nhau thành tiếng ù liên tục. Bản mới gọn trong 0,55 s.

⚠ **Ánh sáng đi trước tiếng** cho sét: `WeatherAmbience` hoãn `Weather/Thunder` 0,2–1,6 s sau cú
loé và hạ âm lượng theo độ trễ — tai tự đo tia sét ở gần hay xa.

**Đo trước khi port** (`.claude/skills/stickman-assets/scripts/sfx_juice.py <thư-mục-ra>`): dựng
lại tám công thức bằng Python, in RMS theo sáu đoạn **và GHI RA .wav để nghe thật**. Cả tám đều
có thân tiếng RMS 0,1–0,3 (không dính bẫy "một transient to ăn hết phần còn lại" như tiếng sấm
đợt hai).

## ĐỢT BỐN — MỘT TIẾNG CHO MỖI LOẠI (2026-09-13)

User báo: *"hiện tại tôi thấy có 1 âm thanh cho mỗi loại"*. Đo ra thì đúng, và đó là **ba cái
hỏng khác nhau chồng lên nhau** — cả ba đều biên dịch XANH và không có một dòng cảnh báo nào.

### 1. Bảng `Library` khai số biến thể, ai không gõ thì bằng 1

`new SfxEntry(đích, gói, mẫu, count)` — tham số `count` mặc định là **1**. Đo trên đĩa:
**101/159 khoá chỉ có đúng một file**, trong khi gói SFX mua sẵn có tới 15 bản
`Light Sword Swing`, 30 bản `Pistol Shot`, 20 bản `Heavy sword woosh`. Không ai thiếu gì cả —
chỉ là không ai gõ con số.

Nay 126 khoá đã khai số thật (3–6 bản tùy gói có bao nhiêu). Thêm vũ khí mới thì **nhớ gõ số
cuối**; xem thư mục gói đếm có mấy file khớp mẫu rồi lấy 3–5.

⚠ **Khoá vắt từ 1 lên nhiều bản phải ĐỔI TÊN bản cũ, không để đó.** `X.wav` cũ nằm lại cạnh
`X_1.wav` với đúng nội dung đó ⇒ `KeyFor` gộp cả hai về một khoá nên họ có một bản đôi, và
`Pick` buộc nó kêu gấp đôi mấy bản kia. `ImportFromAssetPack.PromotePlainToVariant` lo việc này
bằng **`AssetDatabase.MoveAsset`** chứ KHÔNG `File.Move`/`File.Delete`: clip đó đã nằm trong
field của hàng chục prefab vũ khí, mà prefab trỏ bằng **GUID trong `.meta`**. Xóa rồi chép mới
là sinh GUID khác ⇒ toàn bộ vũ khí CÂM, không lỗi nào báo.

### 2. Nhiều bản trên đĩa KHÔNG tự đến tai — prefab giữ **một** clip

Đây là nửa còn lại, và là nửa dễ bỏ sót nhất. `MeleeWeapon._swingClip`,
`RangedWeapon._shootClip`, `MagicWeapon._castClip`… đều là **field một `AudioClip`**, do
`WireToPrefabs` đổ vào. Dù trên đĩa có `Swing_Sword_1..5.wav` và bảng có đủ 5 biến thể, cây
kiếm vẫn phát **đúng file _1** suốt trận.

Cách chữa KHÔNG phải đổi field thành mảng (phải sờ 9 component + mọi prefab đã lưu + phải
`[FormerlySerializedAs]`). Thêm **cửa tra ngược**:

| Cửa | Làm gì |
|---|---|
| `StickmanSoundBank.PickSiblingOf(clip)` | clip này thuộc họ nào ⇒ bốc ngẫu nhiên trong họ |
| `StickmanAudio.PlayVariant(clip, …)` | phát một bản bất kỳ cùng họ; không tra được thì phát chính clip đó |
| `StickmanAudio.PlayClipOrKey(clip, key, …)` | field rỗng thì tra thẳng khoá trong bảng |

Mọi chỗ phát clip-cắm-sẵn nay đi qua `PlayVariant`: `MeleeWeapon` · `RangedWeapon` ·
`MagicWeapon` · `ProjectileController` · `ThrowableWeapon` · `ShieldWeapon` · `WeaponBase`.
**Prefab không phải gắn lại**, và clip thêm vào sau tự động vào họ.

### 3. 38 dòng khai rồi mà chưa bao giờ được chép về đĩa

Thêm một dòng vào `Library` **mới chỉ là khai báo**. Ai đó thêm `Ambience/*`, `Match/Victory`,
`Footsteps/Grass`, `Mount/*`, `Naval/*`, `Zombie/Attack`, `Ui/Hover`… rồi không bấm lại
`Audio > 1`. Hậu quả: **cả mảng tiếng nền của map và tiếng thắng/thua của ván chơi im suốt** —
`StickmanAmbience` và `MatchDirector` gọi đúng khoá, bảng không có, `PlayKey` lặng lẽ trả về.

⚠ `BuildSoundBank` có tự sinh tiếng bù cho khoá câm, nhưng `FindSilentKeys` **chỉ quét chuỗi
`PlayKey("…")` / `PlayUi("…")` viết thẳng trong code**. Khoá đi qua biến (`ambienceKey` của
`MapBiome`) hay qua `bank.Pick(…)` thì nó không thấy — đó là lý do 12 khoá `Ambience/*` nằm
ngoài mọi phép đo suốt mấy mẻ trước.

### 4. Chín field `AudioClip` code CÓ GỌI mà không tool nào đổ clip vào

`WireToPrefabs` chỉ với tới thứ **có prefab**. Component do builder dựng thẳng trong scene thì
field `AudioClip` của nó vĩnh viễn `null`:

| Field | Việc | Khoá mặc định nay dùng |
|---|---|---|
| `RangedWeapon._reloadClip` | nạp đạn | `Ranged/Reload` · `Ranged/Shotgun_Cock` (nạp từng viên) |
| `RangedWeapon._spinClip` | quay nòng | `Ranged/Spin` |
| `AmmoCache._refillClip` | tiếp đạn | `Item/Refill_Ammo` |
| `ManaFont._refillClip` | tiếp mana | `Magic/Mana_Refill` |
| `ResourceNode._workClip` | mỗi nhịp làm | theo `ResourceType`: `Resource/Chop` · `Mine` · `Harvest` · `Water/Splash` · `Build/Hammer` |
| `ResourceNode._finishClip` | xây xong | `Build/Done` |
| `ResourceDepot._storeClip` | cất kho | `Resource/Store` |
| `WarCamp._craftClip` | rèn đồ | `Build/Craft` |
| `SiegeEngine._fireClip` · `_dockClip` | bắn · cập bến | theo `SiegeEngineKind`: `Naval/Cannon` · `Ranged/Crossbow_Shoot` · `Siege/Catapult` · `Siege/Ram`; `Siege/Dock` |

⚠ **Hai field CỐ Ý để trống**: `StickmanController._hurtClip` / `_deathClip`. Giọng người đã
chuyển hẳn sang `StickmanCombatVoice`; gắn lại là mỗi lần trúng đòn kêu hai tiếng chồng nhau.

### 5. Ba phép đo canh lại — `StickmanDoctor.Audio.cs`

Cả ba cái trên đều là **bẫy im lặng**: triệu chứng giống hệt nhau ("game nghe nghèo nàn") nên
không lần ngược ra nguyên nhân nào. Theo luật `AGENTS.md` — viết phép đo trước, ghi luật sau:

1. **Tiếng lặp nhiều mà chỉ có một bản** — ĐỎ khi khoá trong nhóm nghe-lặp-nhiều có 1 bản,
   VÀNG khi có 2. Không chấm `Ambience/*` và `Match/*`: chúng **phải** giống nhau mỗi lần.
   Bốn khoá một-phát-đúng-nghĩa miễn trong `OneShotByDesign` — **mỗi dòng phải nêu lý do**,
   không thì bảng có dòng đỏ vĩnh viễn không ai dọn được.
2. **Dòng bảng tiếng chưa được import** — đọc mọi `new SfxEntry("…"` trong file nguồn rồi hỏi đĩa.
3. **Field `AudioClip` không ai đổ clip vào** — tên field không xuất hiện trong `Assets/Editor`
   **và** chỗ phát không dùng `PlayClipOrKey`.

### 6. Bấm gì

`Tools > Stickman > Nâng cao > Audio > 0. Do Everything (1-4)`. Đo trước khi bấm
(dựng lại bằng Python trên gói SFX thật): **309 file / 159 khoá → 646 file / 209 khoá**,
64 file tên trần được đổi thành `_1`, số khoá chỉ-có-1-bản rớt **101 → 55** (55 còn lại gần như
toàn bộ là `Ambience/*`, `Match/*`, `City/*`, `Cine/*`, `Martial/*` — đúng loại một-phát).

Máy **không có gói SFX** thì `Audio > 5` sinh tiếng bù; 15 công thức tự sinh nghe-lặp-nhiều
đã nâng từ 2 lên 3 bản. ⚠ Chỉ nâng công thức đang ở **≥ 2**: đường synth không có
`PromotePlainToVariant`, nâng từ 1 lên là sinh ra đúng cái bản đôi nói ở mục 1.
