# ⚠⚠ VÕ LÂM — THỂ LOẠI THỨ TƯ: MÔN PHÁI · NỘI CÔNG · KHINH CÔNG · CHIÊU THỨC (2026-09-08)

> **ĐỢT HAI (cùng ngày)** — bốn chiêu mới (chín tổng), **BÍ KÍP VÕ CÔNG** giữa sân,
> **NHỊP PHÁI** cho AI, AI biết **ĐỌC CHIÊU** địch, hai bài quyền mới (đủ sáu phái sáu bài),
> bốn dáng ra chiêu mới, nút **CHIÊU 3** (phím `T`) và mười file tiếng riêng.
>
> **ĐỢT BA (2026-09-09)** — võ lâm vào **HỆ MAP** (chín map mẫu + sân `Demo_63_MapWuxia` + tab
> Võ lâm ở kho map và AI Lab), **BA BÀI TEST** `Genre_Wuxia_*`, và quyển bí kíp có hình riêng.
>
> **ĐỢT BỐN (2026-09-09, cùng ngày)** — làm cho GIỐNG VÕ LÂM TRUYỀN KỲ ở tầng NHÌN + CẢM GIÁC:
> **NGŨ HÀNH** (trục thứ bảy: màu chiêu + khắc hệ), **MỖI CHIÊU MỘT HÌNH** hiệu ứng, **TÊN CHIÊU**
> bay trên đầu, **KHỰNG HÌNH / RUNG** khi chiêu trúng, **THANH CHIÊU** kiểu VLTK, và **SKIN VŨ KHÍ**
> cho sáu phái (trước đó kiếm/đao/côn võ lâm là hình hiệp sĩ Âu). Xem mục 10.
>
> **ĐỢT NĂM (2026-09-09)** — user báo *"KHÔNG thấy effect, không thấy chưởng võ công gì cả,
> cũng không thấy nhiều chế độ chơi"*. Rà ra **một lỗi thật đã giết cả tầng chiêu thức của AI**
> (mục 11) cộng bảy nút chưa ai bấm; sửa lỗi, thêm **MỘT NÚT dựng tất cả**, và **số sát thương
> bay lên**.
>
> **ĐỢT SÁU (2026-09-09)** — user: *"làm giống thể loại võ lâm là đi ĐÁNH QUÁI LÊN LEVEL, và
> TỈ THÍ giữa các môn phái, NHIỀU LOẠI VÕ CÔNG và animation phức tạp"*. Ba việc: **cấp võ công**
> (`MartialGrowth` — lên cấp mở chiêu), **sáu chiêu mới** (15 tổng, mỗi cái một trục mới),
> **sáu dáng ra chiêu nhiều khung**, và **hai màn chơi mới** (luyện công · tỉ võ đại hội).
>
> **ĐỢT BẢY (2026-09-09)** — user: *"AI trong võ lâm đứng MÚA VÕ, animation DÀI, nhiều động tác
> phức tạp"*. Sáu bài quyền viết lại hẳn: **10.6–16 giây, 25–35 khung** (trước 2.4–4.4 s, 7–12
> khung), dựng từ một **bộ THỨC** dùng chung, cộng **sân luyện võ trường** để xem trọn. Xem mục 13.
>
> **ĐỢT TÁM (2026-09-09)** — user: *"kiểm tra xem đã đầy đủ chưa, thêm tính năng và sửa lỗi"*.
> Rà bằng phép đo: tìm ra **ba màn mới không vào được menu**, sáu chiêu mới **phát chung một
> tiếng**, cụm nút cảm ứng **thiếu ô**, và một **lỗi dọn cờ** có sẵn. Xem mục 14.
>
> **ĐỢT CHÍN (2026-09-09)** — user: *"không thấy có animation, không có gì đặc trưng là võ lâm"*
> (lần thứ ba). Đo lại thì asset ĐÃ dựng đúng; lỗi là **thứ nhìn thấy 95% thời gian — đứng, vung
> binh khí — vẫn y hệt lính trung cổ**. Thêm **THẾ TẤN sáu phái** (dáng đứng nền), **KIẾM PHÁP /
> ĐAO PHÁP** cho nhát vung thường, **CHÀO QUYỀN** trước khi lên đài, và sửa hai ô không lưu được.
> Xem mục 15. Mọi mục dưới đây đã gộp cả chín đợt.

User: *"làm 1 loại game khác là game kiếm hiệp, các loại môn phái đấu với nhau, dàn trận giống
map của chế độ threeKingdom, nhưng animation các bài quyền võ công phức tạp hơn… AI, Animation,
hệ thống vũ khí và gameplay phù hợp với võ lâm"*.

Code: `Assets/Scripts/Core/Wuxia/MartialArts.cs` (bảng chiêu thức) ·
`Assets/Scripts/Combat/Wuxia/MartialQi.cs` · `MartialArtist.cs` · `MartialQinggong.cs` ·
`WuxiaPlayerControls.cs` · `Assets/Scripts/AI/Modules/AIMartialArtsModule.cs` ·
`Assets/Scripts/Gameplay/Wuxia/WuxiaSects.cs` (sáu phái + trận pháp) · `WuxiaMode.cs` (trọng tài) ·
`WuxiaSectBinder.cs` · `Assets/Editor/Modes/StickmanWuxiaBuilder.cs` (`Demo_61_WuxiaSects`) ·
`StickmanWuxiaWeaponBuilder.cs` + `StickmanWuxiaArt.cs` (bốn binh khí) ·
`StickmanActionSetBuilder.Wuxia.cs` (16 clip) ·
`CivilizationHelmetArt.Wuxia.cs` + `CivilizationArtGenerator.Wuxia.cs` (sáu bộ đồ) ·
`Assets/Scripts/Gameplay/Wuxia/WuxiaScripture.cs` (bí kíp) ·
`Assets/Editor/Doctor/StickmanDoctor.Wuxia.cs` (năm phép đo) ·
`.claude/skills/stickman-assets/scripts/sfx_martial.py` (mười tiếng) ·
**đợt bốn:** `Assets/Scripts/Core/Wuxia/MartialElements.cs` (ngũ hành) · `Combat/MartialVfx.cs` (hình
theo chiêu) · `Combat/MartialSkillCallout.cs` (tên chiêu) · `Assets/Editor/Effects/StickmanEffectBuilder.Wuxia.cs`
(13 sprite/prefab/dòng bảng) · `CivilizationArtGenerator.WuxiaWeapons.cs` (17 skin vũ khí) ·
`.claude/skills/stickman-assets/scripts/fx_martial.py` (xem trước hiệu ứng).

Bảng điều khiển: «★ 15 nền văn minh» → «Build Action Sets» → «Võ lâm đại hội — Demo_61».

---

## 1. VÌ SAO LÀ THỂ LOẠI, KHÔNG PHẢI MỘT BỘ NỀN VĂN MINH TRUNG CỔ

Ba câu hỏi của võ lâm không tồn tại ở trung cổ, và mỗi câu là một tài nguyên/luật riêng:

| Câu hỏi | Hệ trả lời | Trung cổ có không |
|---|---|---|
| *"còn bao nhiêu nội lực"* | `MartialQi` — bể khí của NGƯỜI, hồi nhanh khi **vận công** tại chỗ | không |
| *"lên được cái mái kia không"* | `MartialQinggong` — hai bước đạp gió giữa trời + rơi chậm | không |
| *"ra chiêu bây giờ hay giữ"* | `MartialArtist` — CHÍN chiêu, mỗi chiêu một HÌNH VÙNG ĐÁNH khác | không |
| *"quyển sách kia ai đoạt được"* | `WuxiaScripture` — bí kíp giữa sân, đọc xong CẢ PHÁI học tuyệt kỹ | không |

Nhồi vào Trung cổ thì mọi lính giáp sắt phải mang theo một thanh nội lực vô dụng — đúng lý do
`MagicWeapon` không nhồi vào `RangedWeapon`.

⚠ **Nội lực KHÁC mana ở chỗ nó là của NGƯỜI, không của cây.** Mana nằm trên `MagicWeapon` (đổi
trượng là đổi bể mana, và phải chạy về `ManaFont` nạp). Buông đao ra vẫn phát chưởng được, và
cách hồi chính là NGỒI XUỐNG VẬN CÔNG giữa trận. Đó là vòng lặp riêng của thể loại: **đánh →
cạn → lui ra tụ khí → vào lại**. Không có nó thì nội lực chỉ là một cái cooldown đội tên khác.

---

## 2. SÁU MÔN PHÁI = SÁU NỀN VĂN MINH, khác nhau ở SÁU trục

Nguồn sự thật: `WuxiaSects.Table`. Phe **1 Thiếu Lâm · 2 Võ Đang · 4 Nga Mi · 5 Cái Bang ·
6 Ma giáo · 7 Đường Môn**.

⚠ **KHÔNG dùng số 3** — `TeamMember.ColorOf(3)` là XANH BỆNH của zombie (cùng lý do Tam Quốc
bỏ số 3). Phe **6 (tím)** và **7 (cam)** là hai `case` MỚI thêm vào `ColorOf`; cố ý không mượn
dải `SquadTeamBase` (≥ 100) vì hai số đầu của dải đó rơi đúng vùng cam (sát đỏ của phe 2) và
tím-lam (sát xanh của phe 1). Thứ tự tăng dần 1 · 2 · 4 · 5 · 6 · 7 chính là thứ tự
`CivilizationTeamAssigner._fixedByTeam` ghim nền — đổi số là đổi luôn ai mặc áo gì.

Sáu phái phải khác nhau ở **SÁU trục cùng lúc** (đợt hai thêm hai trục cuối), thiếu trục nào
thì phái đó chỉ là một bộ đồ khác màu:

| Phái · **Hệ** (đợt bốn) | Hình (44 px) | Binh khí | Bộ chiêu | Tuyệt kỹ (bí kíp) | Bài quyền | Nhịp (`MartialStyle`) |
|---|---|---|---|---|---|---|
| THIẾU LÂM · **KIM** | ĐẦU TRỌC + chín chấm hương, cà sa vắt chéo vai | côn · quyền cước · giới đao | Hộ thể + Cước lốc | Thiên ngoại phi tiên | `dragon` | `IronBody` — gồng ở 62% máu, khí 120 |
| VÕ ĐANG · **THỔ** | BÚI TÓC + trâm ngang, đạo bào cổ V + thái cực đồ | kiếm · nhuyễn tiên | Kiếm khí + Điểm huyệt | Hấp tinh đại pháp | `taichi` | `Yielding` — ĐỌC CHIÊU, tụ tới 92%, khí 135 |
| NGA MI · **THUỶ** | KHĂN NI CÔ + vạt rủ, áo trắng đai lụa CAO | song kiếm · thích | Kiếm khí + Chưởng lực | Thiên ngoại phi tiên | `sword` | `Swift` — tụ 70% là vào lại, khí 105 |
| CÁI BANG · **HOẢ** | TÓC RỐI lởm chởm, áo vá lệch + bầu rượu | đả cẩu bổng · gậy | Cước lốc + Chưởng lực | Đả cẩu hiệu lệnh | `drunk` | `Swarm` — bị vây thì HÔ, khí 95 |
| MA GIÁO · **HOẢ** | KHĂN ĐỎ + hai sừng, áo đen viền lửa + nhật nguyệt | đao · nhuyễn tiên | Chưởng lực + Hộ thể | Hấp tinh đại pháp | `demon` | `Reckless` — dốc tới 18% mới lui, khí 110 |
| ĐƯỜNG MÔN · **MỘC** | NÓN LÁ rộng vành, bao ám khí sáu ống chéo ngực | phi tiêu · nỏ liên châu | Điểm huyệt + Chưởng lực | Mãn thiên hoa vũ | `dart` | `Ranged` — bị áp sát thì ĐẠP RA, khí 100 |

⚠ **NHỊP nằm ở Core, không ở `WuxiaSects`.** Kẻ ĐỌC nó là `AIMartialArtsModule` (tầng AI 2),
còn bảng phái ở Gameplay (tầng 4) — AI không được nhìn lên. Đường đi đúng:
`MartialStyle` (Core) → ô `MartialArtist.Style` (Combat 1) ← `WuxiaSectBinder` ghi (Gameplay 4)
→ AI đọc. Cùng cách thoát mà `WorldMarkers` và `ContestedZones` đã dùng.

⚠ **Hai phái dùng chung một tuyệt kỹ là CỐ Ý** (phi tiên: Thiếu Lâm + Nga Mi · hấp tinh: Võ
Đang + Ma giáo). Nặn thêm hai chiêu nữa chỉ để đủ đầu người là phạm đúng luật "chiêu mới phải
mở một TRỤC mới" ở mục 4.

⚠⚠ **KHÔNG PHÁI NÀO CÓ KHIÊN, VÀ ĐÓ LÀ RÀNG BUỘC THIẾT KẾ.** Ô khiên khoá tay trái ⇒ khoá luôn
mọi chiêu cần hai tay (chưởng lực · hộ thể). Cho một quân chủng đeo khiên là cả tầng
`MartialArtist` **tự tắt trong im lặng** ở đúng quân chủng đó. Tuyến đầu của thể loại cầm
**THIẾT PHIẾN** — cây tự đỡ bằng chính nó mà tay trái vẫn trống. `UnitRole.Shield` ở bảng phái
nghĩa là *"tuyến đầu chịu đòn"*, không phải *"người có khiên"*.

⚠ Art là **VẼ BÙ** (luật nguồn asset). Xem trước không cần Unity — bắt buộc trước khi bấm nút:

```
python .claude/skills/stickman-assets/scripts/helm_wuxia.py <thư-mục-ra>
```

Nó xuất sheet 256 px **và bản đặt lên đầu ở 44 px** — cỡ thật trong game. Ba lỗi đã bắt được ở
đúng bước này (2026-09-08), cả ba đều KHÔNG thấy được ở khổ lớn:
tóc Võ Đang `C(38,36,40)` gần như đen mà đầu stickman **vốn đã đen** ⇒ mất hẳn vào khối đầu ·
vạt khăn Nga Mi dài 76 px buông tới ngang hông ⇒ đọc ra tấm vải lết theo người ·
sừng Ma giáo dài-mảnh ⇒ đọc ra hai cái râu anten.

### 2b. ĐẶT ChatGPT vẽ bộ nhân vật — đơn hàng mở (2026-09-14)

`helm_wuxia.py` là **lưới an toàn**, không phải đích đến: art đẹp thì ĐẶT
([AssetGeneration.md](AssetGeneration.md)). Đơn hàng đầy đủ — khuôn đính kèm, prompt dán thẳng,
lệnh nhận về, phép đo nghiệm thu — ở
[KnowledgeBase/WuxiaArt-ChatGPT-Order.md](../KnowledgeBase/WuxiaArt-ChatGPT-Order.md).

Đo lại bất cứ lúc nào (ngưỡng **tự hiệu chuẩn** trên 34 cái nón của các nền khác, không lấy
từ chú thích — bẫy đã dính ở `helmet-anchor-nofid`):

```powershell
cd .claude/skills/stickman-assets/scripts
python check_gear_contract.py --wuxia     # rà 2026-09-14: 2/12 đạt, Byzantine/Rus/Europe 6/6
python wuxia_figure.py xem.png            # nguyên con + hàng CỠ THẬT ~44 px
```

Bốn chỗ hỏng đo được, cả bốn là **hình học chứ không phải nét vẽ**: sáu tấm giáp nằm ở khung
`60×80` thay vì `200×250` (ít hơn 9 lần pixel) · tỉ lệ giáp Võ Đang `0.745` và Cái Bang `0.778`
vượt trần `0.63` nên bị `ArmorMaxSquash` kẹp · neo nón Thiếu Lâm lệch ngang `0.70` đường kính
đầu (cao nhất dự án, p95 của bộ là `0.27`) · nón Cái Bang chỉ cao `0.43` lần đầu (sàn của bộ
là `0.99`). Chữa bằng cách **vẽ lại trên khuôn có đầu chuẩn** (`head_template_big_6.png`),
không phải vặn hằng số.

⚠⚠ Cả sáu tên nón đang nằm trong `StickmanRigMetrics.OpenHeadwearSprites`, tức
`TryMeasureHeadExposure` — cửa gác của Doctor và smoke trang bị — **bỏ qua chúng**. Đó là lý do
Doctor xanh mà cái đầu đen vẫn hở. Miễn trừ đó đúng khi chúng là *đồ đội hở* (trâm · đuôi khăn ·
dải thắt); lắp bộ mới trùm được chỏm và gáy thì phải **xoá năm tên khỏi danh sách** (giữ
`Helm_Shaolin` — đầu trọc), nếu không là vừa vẽ lại vừa tự tắt phép đo kiểm chính việc đó.

---

## 3. BỐN BINH KHÍ RIÊNG — mỗi cây lấp một khoảng trống CÓ TÊN

Đi đủ 12 điểm nối của [WeaponIntake.md](WeaponIntake.md). Enum `70 · 71 · 72 · 73`, ô sổ
`67 · 68 · 69 · 70`.

| Cây | Câu mà 68 cây kia không trả lời được | Sở trường | Sở đoản |
|---|---|---|---|
| **Quyền cước** (băng tay) | *"tay trắng thì đánh kiểu gì"* | nhịp **0.22 s** nhanh nhất dự án · combo **4 nhát** · không vướng tay ⇒ dồn khí vào chiêu | tầm 0.40 · sát thương 0.5 · không đỡ |
| **Nhuyễn tiên** (roi xích) | *"tầm cán dài mà KHÔNG có vùng chết"* | tầm 1.25 · `_minRangePercent = 0` · phá thế thủ ×1.7 | sức đẩy 0.4 · không đỡ · sát thương 0.95 |
| **Thiết phiến** (quạt sắt) | *"vừa đỡ vừa đánh mà KHÔNG mất ô khiên"* | `_canGuard` (bền 3.2) · tay trái vẫn trống | sát thương 0.8 · tầm 0.50 |
| **Phi tiêu** (ám khí) | *"ném NHANH và NHIỀU"* | nhịp 0.35 s · 8 cây · **không tích lực** · xuyên giáp 0.25 | 0.55/cây · tầm 5.0 (kém cung) |

⚠ **Nhuyễn tiên khai `LightMelee`, KHÔNG `Polearm`** dù tầm 1.25 dài hơn cả kiếm. `Polearm` là
một *hợp đồng với AI*: lính cầm nó tự CHÚC GIÁO chống kỵ và tự giữ khoảng cách
(`braceAgainstCavalry`). Dây mềm thì chúc vào đâu? Khai sai lớp là cả tuyến roi xích đứng chống
ngựa bằng một sợi dây, **không lỗi nào báo**.

⚠ **Quyền cước KHÁC `WeaponType.Fists`.** `Fists` là vũ khí DỰ PHÒNG (`_isFallback = true`) —
cả hệ đổi vũ khí của AI được viết để THOÁT KHỎI nó. Dùng lại `Fists` là mọi võ sư tay không
trên sân tự nhặt kiếm dưới đất trong mười giây.

⚠ **Bốn cây đều dưới mốc sát thương 2.0** (máu cung thủ/lính khiên) — luật "không one-shot" mà
`StickmanWeaponBalance.AppendOneShotTable` canh. Sức mạnh của bộ này nằm ở NHỊP và ở tầng
CHIÊU THỨC, không ở con số damage.

⚠ **Thang ENUM ≠ thang SỔ ĐƯỜNG DẪN** — ba khẩu khí tài (`TankCannon` · `BombBay` ·
`AntiAirGun`) có trong enum mà cố ý không có dòng nào trong `LeafWeaponPaths`, nên `Pollaxe` là
enum 66 mà đứng ô 65, `MartialFists` là enum 70 mà đứng ô 67. Tra sổ bằng `(int)type` là lấy
**nhầm cây** và không lỗi nào báo. Dùng `StickmanWeaponBuilder.IntakePathOf(type)` — nó bù đúng
số ô, suy ra từ chính `VehicleOnlyWeapons` chứ không kê bảng bù thứ hai.
(2026-09-08 sửa luôn `StickmanWeaponIntakeCheck`, vốn đang soi nhầm từ lúc khối khí tài ra đời.)

---

## 4. CHIÊU THỨC — CHÍN cái, khác nhau ở HÌNH VÙNG ĐÁNH

Bảng: `MartialArts.Specs`, hình khai thẳng bằng `MartialShape` (đợt hai — trước đó hình được
SUY từ `halfAngle`, mà suy ngầm thì thêm hình mới phải sửa một chuỗi `if` lồng nhau và nhìn bảng
không biết chiêu nào hình gì).

⚠⚠ **Chiêu phải khác nhau ở hình dạng vùng đánh, KHÔNG phải ở con số** — đúng bài học trận pháp
Tam Quốc: chín cái tên đắp lên cùng một hành vi thì người chơi bấm xong không thấy gì đổi.

| Chiêu | Hình | Vùng | Câu hỏi chiến thuật | Khí | Nguội |
|---|---|---|---|---|---|
| Chưởng lực | `Fan` | QUẠT 55°, tầm 2.7 | "ba đứa dí sát mặt, đẩy chúng ra" (đẩy 3.4 — mạnh nhất) | 22 | 3.2 s |
| Kiếm khí | `Line` | VỆT DÀI 7.2 xuyên nhiều người | "hàng địch thẳng trục, quét một đường" — **cần cây có LƯỠI** | 30 | 4.5 s |
| Cước lốc | `Circle` | VÒNG TRÒN bán kính 2.3 | "bị vây, quật ngã cả vòng để thoát" (Knockdown 1.5 s) | 26 | 6 s |
| Điểm huyệt | `Fan` 1 người | MỘT người, tầm 1.45 | "khoá đúng thằng nguy hiểm nhất" (Stun 2.1 s, damage 0.45) | 18 | 7 s |
| Hộ thể chân khí | `Self` | BẢN THÂN, 5 s | "biết sắp ăn đòn nặng mà không né kịp" (`DamageTakenScale` ×0.45) | đốt 9/giây | 11 s |
| **Mãn thiên hoa vũ** | `FarBox` | MẢNG 2.6…9.0, dày 3.4 | "địch túm tụm ở XA mà mình không muốn lại gần" (Độc 6 s) | 34 | 8.5 s |
| **Hấp tinh đại pháp** | `Fan` KÉO | QUẠT 45°, tầm 4.8 | "lôi tuyến sau địch ra khỏi chỗ đứng" (hút 10 khí/người, Slow 1.8 s) | 24 | 9 s |
| **Thiên ngoại phi tiên** | `Circle` sau khi LAO | LAO 14 trong 0.34 s rồi VÒNG 2.2 ở chỗ tiếp đất — **với tới 5.98** | "địch ở xa: tự lao vào giữa rồi nện" (Knockdown 1.1 s) | 30 | 9.5 s |
| **Đả cẩu hiệu lệnh** | `Ally` | ĐỒNG MÔN trong 9.0 | "một mình không lại — gọi cả bang xúm vào MỘT đứa" (+14 khí/người) | 18 | 15 s |

⚠⚠ **Bốn chiêu đợt hai mỗi cái mở một TRỤC MỚI**, không phải bốn bộ số khác:
**vùng chết** (`minRange` — Đường Môn vô dụng khi bị áp sát) · **lực NGƯỢC CHIỀU**
(`pullsIn` — chiêu duy nhất kéo địch lại gần) · **tự di chuyển** (`dashSpeed` + `windup`, quét
trúng ở chỗ TIẾP ĐẤT chứ không ở chỗ xuất phát) · **quét NGƯỜI CÙNG PHE** (`Ally`). Chiêu thứ
mười mà không mở được trục nào thì **đừng thêm**.

⚠ **`RallyCry` KHÔNG tự đẩy lệnh sang đồng đội.** Đổi mục tiêu là việc của `StickmanAgent` (tầng
AI 2) mà `MartialArtist` ở Combat (tầng 1) — gọi lên là phá luật module. Chiêu chỉ GHI ra ô
`RallyTarget` / `RallyUntil`; mỗi đồng môn tự hỏi ở nhịp nghĩ của nó và gọi `SuggestTarget`.
Lệnh tới chậm nửa nhịp, mà đó cũng đúng là "nghe tiếng hô rồi mới quay đầu".

⚠ **Chỉ ra được chiêu CÓ TRONG BỘ của phái mình** (`MartialArtist.HasSkill`, đợt hai). Bản đầu
thiếu cửa này: người chơi bị bó đúng hai nút, còn AI gọi thẳng `Use(skill)` nên MỌI lính biết
đủ chín chiêu — tức trục "mỗi phái một bộ chiêu" chỉ đúng với một người trên sân, và nhìn vào
thì sáu phái đánh y hệt nhau. Không lỗi nào báo.

⚠ **`DamageTakenScale` là MỘT Ô SỐ, không phải chồng buff** (xem `CampGeneralAura`): ai ghi sau
thì thắng. `MartialQi.GuardBody` CHỤP giá trị đang có lúc bật và TRẢ LẠI đúng nó lúc tắt — ghi
thẳng `1f` là mọi con tướng lì đòn mất buff của mình ngay lần đầu vận nội lực hộ thể.

⚠ **Trạng thái chỉ gắn khi đòn THẬT SỰ vào máu.** Đỡ được bằng khiên/thế thủ mà vẫn bị điểm
huyệt thì thế thủ vô nghĩa trước chiêu thức — cùng luật `Explosion.Detonate` áp cho cháy/độc.

⚠ **KHÍ TÁN**: trúng đòn CÓ LỰC (`forceScale > 0`) giữa lúc vận công thì mất 14 khí + 3.5 s
không tụ lại được. Chỉ đòn có lực — cháy/độc đi chung `TakeDamage` với `forceScale = 0`, mà
đứng trong vũng lửa thì đã mất máu rồi, cắt luôn đường tụ khí nữa là hai lần phạt cho một chuyện.

⚠ **Khinh công GHI THẲNG `linearVelocity`, KHÔNG sửa `StickmanLocomotion`.** File đó có nhiều
thứ dựa vào nhất dự án; thêm một ô "số lần nhảy giữa trời" vào đó là **mọi nhân vật của mọi thể
loại** đổi hành vi nhảy, mà cách hỏng thì im lặng (một con zombie nhảy hai lần không báo gì).
**VÂN ĐOẠN** (kẹp tốc rơi 7.5) là thứ giữ cho khinh công không tự giết mình: vọt lên 8 đơn vị
rồi rơi tự do là chạm đất ở ~12.5 u/s, vượt `StickmanFallDamage._safeSpeed` (11).

---

## 5. ANIMATION — 16 CLIP, KHÔNG MỘT LOẠI ĐỘNG TÁC NÀO MỚI

`StickmanActionSetBuilder.Wuxia.cs`. Cả chín đều là **STYLE** của loại đã có — đúng luật
[Animation.md](Animation.md), và `Kata` vẫn là ngoại lệ DUY NHẤT của dự án.

| Clip | Loại | Ghi chú |
|---|---|---|
| `Kata/dragon` (Hàng long) | Kata | Thiếu Lâm — NẶNG, dừng hẳn ở mỗi chưởng, tấn thấp nhất |
| `Kata/taichi` (Thái cực) | Kata | Võ Đang — CHẬM đều 4.4 s, không có khung lặng nào |
| `Kata/sword` (Kiếm quyết) | Kata | Nga Mi — NHANH, sáu nhát ngắn, tay trái giữ nguyên thế kiếm quyết |
| `Kata/drunk` (Tuý quyền) | Kata | Cái Bang — NHỊP KHÔNG ĐỀU: đổ 0.22 s, treo 0.6 s, bật lại |
| `Kata/demon` (Ma đao) | Kata | **đợt hai** · Ma giáo — GIẬT CỤC: bung ra trong 0.08 s rồi ĐỨNG SỮNG nửa giây |
| `Kata/dart` (Luyện tiêu) | Kata | **đợt hai** · Đường Môn — thân gần như đứng yên, tất cả ở CỔ TAY, bốn cú phất nhỏ |
| `AttackBody/palm` | AttackBody | dáng CHƯỞNG — trầm tấn, hai tay tống |
| `AttackBody/sweep` | AttackBody | QUÉT CHÂN — `bodyHeight −0.26`, cú hạ sâu nhất cả bộ |
| `AttackBody/whirl` | AttackBody | XOAY TRÒN — kiếm khí + roi xích |
| `AttackBody/rain` | AttackBody | **đợt hai** · QUÉT NGANG hết chiều thân (+0.44 → −0.52) — rải ám khí |
| `AttackBody/absorb` | AttackBody | **đợt hai** · VƯƠN RA rồi KÉO VỀ, thân ngả sau — hấp tinh |
| `AttackBody/dive` | AttackBody | **đợt hai** · khung duy nhất có `bodyHeight` DƯƠNG (+0.06) — bay tới rồi nện |
| `AttackBody/hail` | AttackBody | **đợt hai** · giơ gậy CAO, mặt ngẩng — dáng duy nhất KHÔNG hướng về địch |
| `Idle/qi` | Idle | **VẬN CÔNG** — loop, `StickmanBodyAnimator.RequestQiChannel()` xin mỗi frame |
| `Jump/qinggong` + `Fall/glide` | Jump/Fall | KHINH CÔNG + vân đoạn |

⚠⚠ **Hai bài quyền đợt hai sinh ra vì hai phái đang MƯỢN bài của phái khác** — Ma giáo khai
`spin` (bài chung) và Đường Môn khai `sword` (bài Nga Mi). Mượn thì KHÔNG có lỗi nào báo: hai
phái vẫn múa võ lúc rảnh, chỉ là múa bài của người khác, nên trục "bài quyền" chỉ đúng ở bốn
trên sáu phái. `StickmanDoctor.Wuxia.cs` nay canh đúng chỗ đó: style nào không có clip thì BÁO
ĐỎ, thay vì `Pick` lặng lẽ bốc ngẫu nhiên.

⚠⚠ **Vì sao vận công là `Idle/qi` chứ không phải một loại mới:** nó LẶP, GIỮ theo trạng thái, và
cắt được bởi mọi thứ của chiến đấu — đó chính là định nghĩa của `Idle`. Làm loại mới thì phải
nối lại `IsAmbientClip` + bảng ưu tiên + `DefaultOvershoot` + `DefaultLegWeightWhileMoving`, mà
`UpdateAmbientAction` **vẫn ép `Idle` đè lên mỗi frame** vì nhân vật đang đứng yên — tức tự
chuốc thêm bốn bảng để rồi vẫn hỏng. Thứ tự style của `Idle`: cầm lái > **vận công** > canh gác
> dáng nền của loài > thế tấn.

⚠ **Mọi clip `weight = 0` trừ bốn bài quyền.** `AttackBody` là dáng thân của MỌI cú đánh trong
game; để `> 0` là anh cầm rìu hai tay thỉnh thoảng lại trầm tấn phát chưởng.

⚠ **`MeleeWeapon.BodyStyleForSwing` hỏi theo LOẠI trước khi hỏi theo LỚP** cho ba cây võ lâm:
cả ba đều `LightMelee`, mà dáng quyền cước khác hẳn dáng dao găm. Thiếu nhánh đó thì chiêu bay
ra mà thân người vẫn đâm kiểu Tây.

⚠ **Bài quyền theo PHÁI** đi qua `StickmanBodyAnimator.SectKataStyle` (`WuxiaSectBinder` đặt,
`AIKataModule` hỏi MỖI LẦN múa chứ không nhớ sẵn — đổi phe giữa ván là đổi phái).

⚠ **PHẢI chạy lại «Build Action Sets»** sau khi sửa file clip: bộ động tác đã bake trên đĩa
không tự biết code đã đổi (file đã khai `extraSources`).

Hai trần không được vượt: **góc thân < 66°** thực dụng (`SpinThreshold` 110 ÷ scale 1.6 của bộ
Boss — vượt là clip bị coi là "xoay trọn vòng" và không bao giờ được bốc nữa) · **|ikArm| ≤ 1.35**
(tầm với 1.469, `ClampToReach` cắt ở 95%). Đỉnh trong file: 44° và 1.30.

---

## 6. AI — `AIMartialArtsModule`, trong BỘ MẶC ĐỊNH

⚠⚠ **Phải có CÙNG LÚC với `MartialArtist`, không phải sau** — đúng bài học `ManaFont` ↔
`AIManaWellModule`: chiêu thức mà chỉ người chơi biết dùng thì mọi trận võ lâm lệch về phía
người chơi, và nhìn vào không phân biệt được với "màn này cân bằng kém".

Thứ tự quyết định (ngắt ở cái đầu tiên đúng):
**nghe hiệu lệnh đồng môn** → **đọc chiêu địch** → **vận công** (rảnh + khí thấp) → thôi vận khi
thấy địch → **bị vây**: phái đông thì HÔ, phái khác thì cước lốc → **hộ thể** khi máu thấp và
địch < 4 → **dán mặt** (< 1.5): phái xa thì ĐẠP RA, phái khác thì điểm huyệt → **chưởng lực**
< 2.7 → **hấp tinh** 2.5…4.8 → **kiếm khí** 2.7…7 và |dy| < 1.5 → **phi tiên** 3.5…5.8 (phải
đang QUAY MẶT về phía đó) → **mãn thiên hoa vũ** 3.2…8.5 → **khinh công**.

⚠⚠ **Thang chỉ có MỘT bản cho cả sáu phái.** Nó gọi đủ chín chiêu, còn `CanUse` chặn chiêu không
có trong bộ của phái — nên Đường Môn rơi xuống mảng ám khí, Thiếu Lâm dừng ở cước lốc, Cái Bang
hô người. Khác biệt đến từ BẢNG PHÁI, không từ chín nhánh `if` chép ra sáu bản; thêm phái thứ
bảy không phải mở file AI.

**NHỊP PHÁI** (đợt hai) — `StyleTuning` trong chính module, tra theo `MartialArtist.Style`:

| Nhịp | Gồng khi máu | Lui tụ khí khi khí | Tụ tới | Riêng |
|---|---|---|---|---|
| `IronBody` Thiếu Lâm | 62% | 30% | 85% | — |
| `Yielding` Võ Đang | 45% | 40% | 92% | **đọc chiêu địch** |
| `Swift` Nga Mi | 35% | 28% | 70% | vào lại sân sớm nhất |
| `Swarm` Cái Bang | 40% | 35% | 80% | **bị vây thì HÔ trước** |
| `Reckless` Ma giáo | 30% | 18% | 60% | dốc khí, tụ qua loa |
| `Ranged` Đường Môn | 50% | 35% | 85% | **bị dán mặt thì ĐẠP RA** |

⚠ Không ô nào trong bảng đó cộng sát thương hay cộng máu — nó chỉ đổi *lúc nào* ra chiêu. Nhờ
thế bảng cân bằng vũ khí không phải biết tới môn phái.

**ĐỌC CHIÊU** (`ReadEnemyCast`): thấy địch đang gồng một chiêu CÓ SÁT THƯƠNG **và mình đang đứng
trong tầm của đúng chiêu đó** thì gồng hộ thể, không có hộ thể thì đạp khinh công ra.
⚠ Phải đo theo TẦM CỦA CHIÊU ĐỊCH — đúng bài học `DuelCombat.md` (đe doạ chỉ tính ở Windup +
Strike). "Cứ thấy gồng là né" thì quân đứng xa tám đơn vị cũng nhảy dựng lên vì một cú điểm
huyệt tầm 1.45, và cả sân trông như đang giật mình chứ không như đang đọc đòn.
⚠ Chiêu KHÔNG sát thương (hộ thể · hiệu lệnh) thì bỏ qua: lùi khỏi một người đang tự gồng là
tặng không cho họ quãng nghỉ họ đang cần.

**MỘT VÒNG QUÉT CHO HAI CÂU HỎI** (`ScanNeighbours`): đếm "bị vây" và nghe "hiệu lệnh" đi chung
một lượt đi qua sổ `TeamMember.All`. Tách thành hai vòng là nhân đôi một chi phí vốn đã là
O(quân số) cho mỗi người mỗi 0.4 giây.

- Nhịp nghĩ lấy theo `AIProfile.retargetInterval` (đã chia sẵn theo `thinkScale` của cấp AI) —
  **không thêm field thứ hai vào 34 asset profile**, xem bài học bốn field mới ở
  [DuelCombat.md](DuelCombat.md).
- **Cấp thấp không biết ra chiêu**: gate bằng `comboChance > 0` — cùng trục mà `AISmartsTable`
  dùng để tắt phản đòn / đòn nhử / nhấp nhả. Tân binh vẫn vận công và vẫn khinh công.
- Đếm "bị vây" bằng sổ `TeamMember.All`, **không** `Physics2D.OverlapCircle`: nhịp này chạy cho
  mọi lính võ lâm, một phép quét vật lý mỗi người mỗi 0.4 s trong trận 60 người là chi phí âm
  thầm bò lên.
- Khinh công **chỉ đạp khi có lý do đọc được** (địch cao hơn 2.2, hoặc đang trên không mà địch
  xa > 3.5). Không có cửa đó thì AI đốt sạch nội lực để nhún nhảy tại chỗ.
- Module nằm trong `AIModuleLibrary.DefaultKinds` và **tự tắt ở dòng đầu** khi không có
  `MartialArtist` — bắt từng playbook khai tay là playbook nào quên thì cả phái đó đánh như dân
  thường mà nhìn vào không phân biệt được với "màn này cố ý cho quân tạp".

---

## 7. TRỌNG TÀI + MÀN — `Demo_61_WuxiaSects`

`WuxiaMode : ThreeKingdomsMode`. ⚠ `ThreeKingdomsMode` là bộ khung **N đạo quân có tướng** duy
nhất của dự án (cột mốc địch riêng · nhắm KẺ MẠNH NHẤT · quán tính đổi mục tiêu · quỹ hồi sinh ·
sinh tử đột ngột); `ModernFrontMode` đã mượn một lần, đây là lần thứ hai. **Chép trọng tài ra
bản thứ ba là ba chỗ phải nhớ cùng một luật, và một trong ba sẽ lệch.** Mọi CHỮ và mọi phép dịch
"ô thứ i → đội hình/thế trận" đi qua các móc `protected virtual`; `ThreeKingdomsFormation` với
lớp con **chỉ còn là Ô SỐ 0..4** (Inspector vẫn hiện "HacDuc" cho ô 0 — đọc theo `PlanLabel`).

BA cơ chế võ lâm có mà Tam Quốc không:
- **★ MINH CHỦ** — phái đang mạnh nhất được GỌI TÊN trên dòng trạng thái. Luật "đánh kẻ mạnh
  nhất" vốn đã có ở lớp cha; ở đây nó được ĐẶT TÊN nên người chơi đọc ra được vì sao cả sân đang
  xúm vào mình. Đo lại bằng CHÍNH `PowerOf` của lớp cha — kê công thức thứ hai là ★ chỉ vào một
  phái mà cả sân đang đánh phái khác.
- **KHÍ THẾ BI PHẪN** — sơn môn thất thủ thì tàn quân hồi ĐẦY nội lực một lần. Chỉ nạp khí,
  không nạp máu, không buff sát thương: phái này vẫn phải thua. Cái mua được là mấy chục giây
  cuối có chiêu bay ra thay vì một hàng người lê bước tới chỗ chết.
- **BÍ KÍP VÕ CÔNG** (`WuxiaScripture`, đợt hai) — quyển sách hiện ra theo CƠN ở một trong năm
  chỗ `−52 · −26 · 0 · +26 · +52`, ở lại 45 s rồi rút, nghỉ 60 s mới ra lại. Đứng trong bán kính
  2.6 là đọc (một người ~8 s, ba người thì nhanh gấp ba, **đang VẬN CÔNG thì nhanh gấp đôi nữa**);
  hai phái cùng đứng là **GIẰNG CO**, tiến độ đứng im. Đọc xong: CẢ PHÁI học TUYỆT KỸ (chiêu thứ
  ba, hiện thêm nút CHIÊU 3). Phái đã học rồi mà đọc lại thì cả phái HỒI ĐẦY nội lực.

### Bí kíp — bốn chỗ dễ làm hỏng

⚠⚠ **NÓ PHẢI BIẾN MẤT.** Đây là bài học đã trả giá ở `CapturePoint._isCampaignObjective`: một
mục tiêu giữa sân tồn tại vĩnh viễn thì cả sáu phe lấy nó làm đích thay vì sơn môn địch, quyền
sở hữu lật qua lật lại, và **VÁN KHÔNG BAO GIỜ KẾT THÚC** trong khi luật thắng ghi trên HUD vẫn
là "hạ sơn môn". Bí kíp là một CƠN, không phải một chốt.

⚠⚠ **AI TÌM TỚI BẰNG SỔ `ContestedZones`, KHÔNG BẰNG MODULE MỚI.** Sách tự ghi tên vào sổ ở Core
lúc hiện và rút tên lúc biến; `CommandNode` vốn ĐÃ hỏi sổ đó để dời mốc tiến quân (cùng đường mà
`CapturePoint` đi). Tầng AI (2) không được nhìn lên Gameplay (4) — đây là cách thoát duy nhất
đúng luật module, và rẻ hơn một module quét map.

⚠ **`OwnedBy` trả TRUE cho phái ĐÃ học xong.** Không có vế đó thì phái đã có tuyệt kỹ vẫn đổ về
giữa sân mỗi lần sách hiện ra, và trận đứng lại. Đọc lại chỉ được hồi khí — đủ để còn đáng
tranh (và đáng tranh để PHỦ ĐẦU phái khác), không đủ để thành mỏ tài nguyên.

⚠ **Năm chỗ rơi do BUILDER đưa xuống, không bốc ngẫu nhiên trên trục x.** Mỗi sơn môn có thềm
cao chiếm dải `[gate + 5, gate + 11]`; thả sách vào đó là quyển sách nằm DƯỚI sàn một chiều —
vẫn nhìn thấy mà không ai đọc được. Và phải có nhiều chỗ chứ không chỉ mỗi số 0: phái đang bày
THÁI CỰC TRẬN ở thế `Hold` thì chỉ huy KHÔNG dời mốc đi tranh, nên sách luôn ở giữa sân đồng
nghĩa phái đó không có đường học tuyệt kỹ cả ván.

⚠ Sổ "phái nào đã học" nằm ở `WuxiaSectBinder` (tĩnh, dọn ở `SubsystemRegistration`), KHÔNG nằm
trên từng người: quân hồi sinh giữa trận là người MỚI và phải biết luôn tuyệt kỹ của phái mình.
Quên dọn sổ là chơi lại màn thứ hai trong cùng phiên Editor đã có sẵn tuyệt kỹ từ đầu.

**Trận pháp môn phái** (`WuxiaSects`): La Hán `BattleLine`/Auto · Thái Cực `ShieldWall`/Hold
(Press khi địch đã mòn) · Ngũ Hành `AssaultColumn`/Press · Thiên La Địa Võng `MarchColumn`/Press ·
Đả Cẩu `Auto`/Auto. ⚠ Thái Cực **phải** rời thế thủ khi `enemyWeakened`, không thì "lấy nhu chế
cương" là ngồi thủ tới hết giờ (đúng bẫy Phương Viên).

**Bố cục**: sơn môn ở −65 · −39 · −13 · +13 · +39 · +65, sân ±72.
⚠⚠ **Sáu phái thì KHÔNG phái nào được "ở giữa"** — Tam Quốc bù cho Thục bằng hai thềm địa hình,
nhưng ở sáu phái thì BỐN phái ở tình cảnh đó và không có cách nào bù cho bốn chỗ khác nhau mà
vẫn công bằng. Cách giải: **SƠN MÔN AI CŨNG CÓ** — mỗi phái một thềm cao 1.50 (= 10 bậc × 0.15,
sàn một chiều nên làn đất không bị bịt) + cầu thang quay VÀO phía nhà + `GarrisonPost` cho tuyến
ám khí. Ưu ái của Thục thành LUẬT của sân.

**Võ công cho cả sân**: `WuxiaSectBinder` quét lại mỗi 2 s (khuôn `AIPlaybookBinder`). ⚠ Không
cắm một lần ở builder: quân **hồi sinh** giữa trận là người MỚI (cắm một lần ⇒ từ đợt hai cả sân
đánh như dân thường), và người chơi **đổi phái** là phải đổi bộ chiêu.

Quỹ 3 mạng/phái · 420 s rồi sinh tử · 10 người + 1 chưởng môn mỗi phái.

---

## 8. NGƯỜI CHƠI — phím và nút

`WuxiaPlayerControls` (trên nhân vật người chơi, `WuxiaSectBinder` cắm).

`Q` chiêu 1 · `E` chiêu 2 · `T` **TUYỆT KỸ** (chỉ có sau khi đoạt bí kíp) · `R` **giữ** để vận
công · phím NHẢY **khi đang trên không** = khinh công. ⚠ Chỉ mượn phím nhảy khi ĐANG TRÊN KHÔNG
— nuốt cả trên mặt đất thì mỗi lần bước qua bậc thềm là đốt 12 nội lực.

⚠ Phím `T` dùng chung với `GameSession.HandleResultKeys` ("chơi lại"), nhưng bảng kết quả chỉ
sống khi ván đã xong và nhân vật không còn điều khiển được — hai chỗ không bao giờ cùng đúng.
Đó là điều kiện DUY NHẤT cho phép chung phím.

Cảm ứng: bốn nút ở `StickmanTouchControls` — KHINH CÔNG (vòng 1, góc 117°, nút cứu mạng nên
phải gần ngón nhất) + CHIÊU 1 (vòng 2, 68°) + CHIÊU 2 (vòng 2, 45°) + **CHIÊU 3** (vòng 2, 23°,
đợt hai). ⚠ Góc RIÊNG, không chung ô với nút nào: chung ô chỉ an toàn khi hai câu hỏi không bao
giờ cùng đúng (ĐỠ ↔ NẠP, NGỰA ↔ LỰU ĐẠN), mà bốn nút này có thể cùng đúng với ĐỠ (thiết phiến đỡ
được). Ở 60 màn không phải võ lâm, `MartialSkillCount = 0` nên chúng KHÔNG tồn tại và không ăn
ô nào.

⚠ Nút CHIÊU 3 được DỰNG SẴN từ đầu ván và tự ẩn theo `visible`, dù tuyệt kỹ chỉ có giữa ván:
`_buttons` chỉ dựng MỘT LẦN, dựng lại cụm nút giữa trận là nuốt mất ngón tay đang giữ cần ảo.

⚠ Nhãn hai nút chiêu đọc **động** (`Button.labelSource`): `_buttons` chỉ dựng MỘT LẦN, mà tên
chiêu đổi theo môn phái — không có cửa đó thì nút mãi mang tên chiêu của phái mở màn.

Thanh **NỘI LỰC** vẽ dưới dải trên, mép trái, màu LAM NGỌC — cố ý khác hẳn đỏ (máu) và vàng
(thể lực): ba thanh cùng chỗ mà cùng gam thì liếc một cái không biết mình đang thiếu gì.

---

## 8b. VÕ LÂM TRONG HỆ MAP (đợt ba)

`Demo_61` là MỘT sân dựng tay. Hệ `MapSystem` là chỗ mà mọi thể loại khác có **kho map + kiểu
chơi + map ngẫu nhiên**; trước đợt ba, chọn thể loại Võ lâm ở kho map là một tab RỖNG.

**Chín map mẫu** (`StickmanMapSystemBuilder.Blueprints`, khoá `Wux_*`): Tỉ võ đại hội (dàn
trận) · Giữ sơn môn · Đánh lên sơn môn · Hộ tống chưởng môn · Áp tiêu xe · Tranh ba đài tỉ võ ·
Cầm cự trước ma giáo · **Đoạt bí kíp** (cướp cờ) · Quần hùng loạn đấu (ba tầng).

⚠⚠ **MAP VÕ LÂM CAO HƠN MỌI THỂ LOẠI KHÁC — ĐÓ LÀ LUẬT, KHÔNG PHẢI THẨM MỸ.** Ba thể loại kia
phải kẹp số `platforms` vì bục cao là chỗ AI leo lên rồi kẹt, hoặc chỗ chỉ cung thủ dùng được.
Võ lâm thì **ai cũng có khinh công** (`WuxiaSectBinder` phát `MartialQinggong` cho cả sân), và
`AIMartialArtsModule` đã có sẵn nhánh *"địch cao hơn 2.2 thì đạp lên"*. Nên `platforms` 4–5 ở
đây là ĐƯỜNG ĐI THẬT cho mọi quân chủng.

⚠⚠ **HAI THỨ PHẢI CẮM THÊM, KHÔNG THỨ NÀO TỰ MỌC TỪ `MapDefinition`** —
`MapAssembler.Wuxia.cs`, gọi ngay sau `EnsureGenreWeaponPolicy` ở **CẢ HAI** đường dựng (map
sinh lúc chạy và map đã bake):
1. `WuxiaSectBinder` — thiếu nó thì ván "võ lâm" chạy ra một trận trung cổ đổi màu trời: lính
   vẫn cầm đao kiếm (bộ lọc vũ khí CÓ làm việc) mà **không ai có một điểm nội lực nào**.
2. `WuxiaScripture` — **chỉ ở kiểu chơi `bothPush && !objectiveMoves`**. Sách ghi tên vào sổ
   `ContestedZones`, mà đó là MỐC TIẾN QUÂN của `CommandNode`: bật ở màn HỘ TỐNG là cả đoàn bỏ
   xe hàng chạy về giữa sân, tức bí kíp phá chính luật thắng. Cửa đọc từ bảng `MissionPlan` sẵn
   có — **đừng kê một danh sách `MissionType` thứ hai**, nó sẽ lệch.

⚠ Bí kíp trên map đồi phải **hỏi `TerrainGround.SurfaceYAt`** mỗi lần đổi chỗ. `Demo_61` là sân
phẳng nên giữ nguyên `y` là đúng; map có đồi thì giữ nguyên `y` là quyển sách chôn trong sườn
đồi hoặc treo giữa trời — vẫn đọc được (vùng đọc đo theo khoảng cách) nên **không có gì báo**.

Phe: map dùng `armyA/armyB` = **1 và 2**, tức Thiếu Lâm ↔ Võ Đang. Không phải trùng hợp mà
tiện: sáu số phe của `WuxiaSects` bắt đầu từ 1 · 2 nên hệ map chạy được ngay không phải đổi gì.

---

## 8c. BA BÀI TEST THỂ LOẠI (đợt ba)

`StickmanGenreSceneBuilder.Wuxia.cs` — bộ thứ tư, cùng khuôn ba bộ kia. Mỗi bài đo MỘT thứ:

| Scene | Đo cái gì | Mấu chốt |
|---|---|---|
| `Genre_Wuxia_Skills` | **chín chiêu, chín hình vùng đánh** | bia đặt ở ĐÚNG cự ly của bảng (1.4 · 2.6 · 7.0); thềm 2.6 **không có cầu thang** (chỉ khinh công lên được); một kẻ chuyên xông vào lúc đang vận công (KHÍ TÁN); ba cặp tỉ võ của ba phái khác để bảy chiêu còn lại thật sự bay ra |
| `Genre_Wuxia_Sects` | **sáu phái đánh khác nhau** | sân TRỐNG: không sơn môn, không thềm, không hồi sinh — bỏ hết để thứ duy nhất còn phân biệt sáu phái là NHỊP; bí kíp hiện phút thứ nửa để xem sáu đạo quân có đổ về giữa không |
| `Genre_Wuxia_Duel` | **đọc chiêu** | Võ Đang (phái duy nhất `readsSwing`) đấu Ma giáo (ra chiêu hung nhất, có chưởng lực để mà đọc); playbook `Duel` cấp IQ cao nhất — cấp thấp thì `comboChance` = 0 và không có chiêu nào để đọc |

⚠ Cả ba bài đều phải có `WuxiaSectBinder` — cùng cái bẫy ở mục 8b.

---

## 10. ĐỢT BỐN — GIỐNG VÕ LÂM TRUYỀN KỲ Ở TẦNG NHÌN VÀ CẢM GIÁC (2026-09-09)

User: *"vũ khí và võ công trong võ lâm không thấy đúng và giống với võ lâm, thêm animation và
effect, đánh đấm hấp dẫn hơn, làm giống Võ Lâm Truyền Kỳ"*. Rà lại thì ba đợt trước đã đúng ở
tầng CƠ CHẾ (chín hình vùng đánh, sáu nhịp phái) nhưng **tầng NHÌN chưa hề có**: cả chín chiêu
nổ chung `EffectEvent.Attack` (một vệt chém trắng), sáu phái không có skin vũ khí nào, không
có chữ, không có khựng/rung. Đợt bốn lấp đúng năm chỗ đó, mỗi chỗ một luật:

| Thứ VLTK có | Ở đây | Nguồn sự thật |
|---|---|---|
| **Ngũ hành** — mỗi phái một hệ, năm hệ khắc vòng | `MartialElement` (Core) · ô `MartialArtist.Element` · `WuxiaSects.Table.element` | `MartialElements` |
| **Chiêu có hình, có màu phái** | 13 `EffectEvent.Martial*`, sprite trắng, NHUỘM màu hệ lúc phát | `StickmanEffectBuilder.Wuxia.cs` + `MartialVfx.CastEventOf` |
| **Tên chiêu bay trên đầu** | `MartialSkillCallout` (IMGUI, mảng vòng 16, chỉ trong 15 u quanh người chơi) | hằng ở đầu file |
| **Đòn có sức nặng** | `MartialArtist.ReportImpactFeel`: khựng 0.045 s (+ theo số người trúng) · rung 0.24+ | cùng luật `WeaponBase` |
| **Thanh chiêu** | `WuxiaPlayerControls.DrawSkillBar`: phím · tên · dải nguội · viền màu hệ / lam khi thiếu khí | — |
| **Vũ khí trông Trung Hoa** | 17 skin `Weapon_*.png` cho sáu phái (kiếm TUA, đao VÀNH ĐỒNG, côn sơn son, bổng TRÚC, thương tua, yển nguyệt, thích) | `CivilizationArtGenerator.WuxiaWeapons.cs` |

Ngũ hành theo đúng VLTK: **Thiếu Lâm KIM · Võ Đang THỔ · Nga Mi THUỶ · Cái Bang HOẢ · Ma giáo
HOẢ · Đường Môn MỘC**; vòng khắc Kim→Mộc→Thổ→Thuỷ→Hoả→Kim; khắc ×1.25, bị khắc ×0.85.

⚠⚠ **KHẮC HỆ CHỈ ÁP LÊN CHIÊU THỨC, KHÔNG LÊN ĐÒN VŨ KHÍ.** Cùng lý do `MartialStyle` không cộng
sát thương: bảng cân bằng vũ khí (Balance Report, luật không one-shot) không được biết tới môn
phái. Muốn "phái này mạnh hơn phái kia" thì đổi CHIÊU, không đổi cây. Người không có
`MartialArtist` là hệ None: ×1 cả hai chiều.

⚠⚠ **SPRITE HIỆU ỨNG PHẢI VẼ TRẮNG.** Màu là của phái và được nhân lúc phát
(`EffectManager.PlayTinted` × `MartialElements.ColorOf`). Vẽ màu sẵn vào PNG là sáu phái ra
cùng một màu và trục ngũ hành biến mất khỏi mắt mà không lỗi nào báo. Xem trước bằng
`python .claude/skills/stickman-assets/scripts/fx_martial.py <ra>` — sheet thu về 60 px, nhuộm
năm màu; hình nào ra một vệt xám là sửa trước khi bấm nút.

⚠⚠ **HÌNH PHẢI KHỚP HÌNH VÙNG ĐÁNH** (luật «art không nói ngược cơ chế»): chưởng = QUẠT mở về
+X · kiếm khí = LƯỜI LIỀM **BAY** (`_driftAlongDirection`, 16 u/s × 0.45 s = 7.2 = đúng tầm) ·
cước lốc = VÒNG nở · hấp tinh = XOÁY **CO VÀO** (`startScale > endScale`, xoay ngược) · hiệu lệnh
= vòng toả · phi tiên = vệt lao rồi SÓNG ĐẤT ở chỗ tiếp đất (`MartialImpact`, phát ở `Strike`
sau `windup`, không ở chỗ xuất phát). Đổi vùng đánh của chiêu là phải đổi hình cùng lúc.

⚠ **`_driftAlongDirection` và `_followSpawner` là hai ô MỚI của `EffectInstance`** — bộ effect
chung không dùng nên `FxSetup` cũ không có; bộ võ lâm có cấu trúc `WuxiaFx` riêng. Không nhồi
hai ô vào `FxSetup` để rồi tám prefab cũ phải khai lại.

⚠ **KHỰNG HÌNH GOM CẢ LƯỢT QUÉT, BÁO MỘT LẦN** — cước lốc quật năm người mà `HitStop` năm lần là
game đứng hình. Và vẫn **CHỈ khi người chơi dính vào** (ra chiêu hoặc trúng chiêu) — sáu phái
AI ra chiêu liên tục, cho tất cả khựng là người chơi đọc ra "máy yếu". Cùng luật
[CombatFeel](CombatFeel.md).

⚠ **TÊN CHIÊU CHỈ HIỆN TRONG 15 ĐƠN VỊ QUANH NGƯỜI CHƠI** (không có người chơi thì quanh camera).
Trận 60 người hiện hết là một trang chữ bay. Cùng người ra chiêu liên tiếp thì chữ cũ bị DỜI
lên, không chồng.

⚠⚠ **SKIN VŨ KHÍ PHẢI TRÙNG KHUNG + PIVOT HÌNH GỐC** (luật sống còn của `WeaponSkinSet`): bốn
khung mới chép đúng số — côn 380×26/120 · gậy 150×56/26 · yển nguyệt 380×70/100 · chuỷ thủ
90×34/20. Chỉ vẽ cây phái đó THẬT cầm (bảng `StickmanCivilizationBuilder.Wuxia`); vẽ đủ 70 cây
× 6 phái là 420 tấm không ai nhìn. Vẫn là VẼ BÙ: thả art ChatGPT vào `Sprites/Civilizations/<Phái>/`
là `Save` giữ nguyên.

⚠ **Đòn vũ khí thường của võ sư cũng loé một tia màu hệ** (`MartialVfx.OnDealtHit`, cỡ 0.6 — nhỏ
hơn tia của chiêu) để "đao có nội lực". Chỉ hình, không đổi số; nghe `StickmanController.DealtHit`
nên chiêu thức (không gọi `NotifyDealtHit`) không bị loé hai lần.

⚠⚠ **BA NÚT BẮT BUỘC SAU ĐỢT BỐN**: «Dựng bộ EFFECT (1 nút)» (bảng `EffectLibrary.asset` đã bake
không có dòng `stage: 13…25` — chiêu ra CÂM HÌNH) · «★ 15 nền văn minh» (17 skin vũ khí mới nằm
trong code, chưa có PNG) · rồi Doctor. `StickmanDoctor.Wuxia` có hai phép đo mới đọc đúng hai
thứ đó: dòng `stage:` trong asset và file `Weapon_*.png` trong thư mục phái.

---

## 15. ⚠⚠ BẢN SẮC THỂ LOẠI NẰM Ở 95% THỜI GIAN, KHÔNG Ở PHẦN TRÌNH DIỄN (đợt chín)

User báo lần thứ ba: *"không thấy có animation, không có gì đặc trưng là võ lâm"*. Đo lại: bộ động
tác bake lúc 17:52 (sau code 16:34), `Kata/dragon` có đủ 28 khung, ba màn mới có file, catalog
có dòng. **Asset không sai.** Sai ở chỗ TÔI đã đặt bản sắc võ lâm vào những thứ HIẾM KHI thấy:

| Thứ | Thấy khi nào | Chiếm bao nhiêu thời gian trận |
|---|---|---|
| Bài quyền dài 10–16 s | rảnh ≥ 4 s **và** trúng nhịp 20–45 s — trong trận là KHÔNG BAO GIỜ | ~0% |
| Dáng ra chiêu | 0.3–0.6 s mỗi lần bấm chiêu | ~3% |
| Hiệu ứng chiêu | lúc chiêu bung | ~2% |
| **Đứng chờ · vung binh khí thường · chạy** | **mọi lúc còn lại** | **~95%** — và giống HỆT trung cổ |

Người xem nhìn 95% ấy và nói "không thấy võ lâm". Họ đúng. Bài học: **bản sắc của một thể loại
phải nằm ở DÁNG NỀN (idle) và ĐÒN THƯỜNG, không ở phần trình diễn.** Ba đợt trước làm phần trình
diễn; đợt này làm phần nền.

### 15a. THẾ TẤN SÁU PHÁI — `Idle/stance_*` (`StickmanActionSetBuilder.WuxiaStance.cs`)

Mỗi phái một dáng đứng LẶP, `WuxiaSectBinder` đặt làm dáng nền qua `SetDefaultIdleStyle` (móc
sẵn có của zombie — "dáng nền của LOÀI đứng trên thế tấn"). Từ đó hễ đứng yên là ra phái:

| Phái | Hình bóng (đọc được ở 40 px) |
|---|---|
| Thiếu Lâm | MÃ BỘ thấp, hai quyền thu hông — khối vuông, thấp |
| Võ Đang | HƯ BỘ, một tay vẽ vòng chậm — nghiêng, mềm |
| Nga Mi | KIẾM QUYẾT chỉ thẳng — một đường chĩa ra |
| Cái Bang | LẢO ĐẢO nhẹ, không bao giờ về giữa |
| Ma giáo | NGẠO: ngửa người, hất cằm, tay chống hông |
| Đường Môn | TAY GIẤU sát thân, người cúi — giấu ám khí |

⚠⚠ `weight: 0` — không được bốc ngẫu nhiên cho lính trung cổ. ⚠ `Blend 0.55`, không `Override`:
`Override` là cây đao rời khỏi tay lúc đứng yên. ⚠ Phải THỞ (ba khung lệch vài độ, chu kỳ
2.4–3.6 s): đứng bất động 20 giây nhìn ra tượng.
⚠ Dáng nền ăn trên `WoundedStyle` — võ sư bị thương không lộ dáng lết; chấp nhận, zombie đã chấp
nhận điều y hệt.

### 15b. KIẾM PHÁP · ĐAO PHÁP — `AttackBody/jian_* · dao_*`

`MeleeWeapon.BodyStyleForSwing` hỏi **`_owner` có `MartialArtist` không** (không hỏi thể loại —
lính trung cổ lạc vào sân vẫn chém kiểu của mình; hỏi mỗi nhát vì binder cắm sau). Kiếm / song
kiếm / chuỷ thủ: `jian_open` (bước tới cung bộ) → `jian_turn` (xoay hông) → `jian_close` (thu về
hư bộ). Đao các loại + yển nguyệt: `dao_open` (hạ tấn) → `dao_close` (bổ rồi giật lùi).
⚠ Biên độ ≤ 20° / hạ ≤ 0.16 — nhỏ hơn dáng chiêu. Nhát thường ra mỗi 0.4 s; biên độ như chiêu
thì cả trận là một đám nhào lộn. **Cái làm nó ra kiếm pháp là BƯỚC CHÂN, không phải góc thân.**
Quyền cước · roi · quạt giữ nhánh riêng đã có; côn/gậy dùng dáng chung.

### 15c. CHÀO QUYỀN TRƯỚC KHI LÊN ĐÀI

`WuxiaTournamentMode.BeginPrepare` cho hai người `Kata/salute` (clip có sẵn bộ chung) — lễ của
tỉ võ, và là 3 giây báo "trận sắp bắt đầu" thay vì hai người bỗng lao vào nhau.

### 15d. HAI Ô KHÔNG LƯU ĐƯỢC — lỗi thật ở đúng sân dựng ra để xem

`SectKataStyle` là auto-property `{ get; private set; }` và `_ambientIdleStyle` không có
`[SerializeField]` ⇒ builder đặt lúc dựng `Demo_66`, lưu scene xong là MẤT. Mở lên chơi: bài
quyền rỗng → `Pick` bốc bài chung, sáu chưởng môn múa ba bài của lính thường và đứng dáng lính.
Đúng lời phàn nàn, ở đúng sân làm ra để xem. Nay cả hai là field serialize.

### 15e. Đường bài quyền của AI đã KIỂM là thông

Nghi vấn `agent.Fighter == null` trên NPC ⇒ `PlayAction` không bao giờ gọi. Kiểm: `StickmanNPC`
là **variant** của `StickmanFighter` (0 component ở file variant chỉ vì kế thừa), và
`StickmanAgent.Owner = Fighter` — AI đang chạy tức `Fighter` có. Ghi lại để lần sau không ai
đi "sửa" chỗ này.

---

## 14. RÀ SOÁT BẰNG PHÉP ĐO — BỐN LỖI IM LẶNG (2026-09-09, đợt tám)

Chạy lại bảy phép đo của `StickmanDoctor.Wuxia` cộng ba phép kiểm riêng (tiếng · nút cảm ứng ·
trần dòng). Bốn thứ lộ ra, không cái nào làm biên dịch đỏ:

### 14a. ⚠⚠ BA MÀN MỚI KHÔNG VÀO ĐƯỢC MENU

`Demo_64/65/66` dựng xong, có file, có trong Build Settings — mà menu chính vẫn trống chỗ đó.
Lý do: `StickmanShellBuilder.BuildConfig` sinh menu **từ `DemoSceneCatalog`**, và catalog chỉ
nhận scene nào **TỰ ĐĂNG KÝ** (`EditorAddOrUpdate`). `Demo_61` có `RegisterInCatalog`; builder
mới thì quên. `PruneCatalogToExistingScenes` chỉ XOÁ mục thừa, **không bao giờ thêm mục thiếu**,
nên không có đường tự chữa.

Đây đúng lời phàn nàn *"không thấy nhiều chế độ chơi"* ở đợt năm, tái diễn ở một chỗ khác.
Phép đo thứ TÁM của Doctor nay soi mọi `*Wuxia*.unity` có thật mà thiếu dòng trong catalog.

⚠ `category` phải là **`Gameplay`** — `BuildConfig` bỏ qua mọi mục khác. Đặt `Demo` là scene chỉ
hiện ở ô chọn của người làm game, người chơi không bao giờ thấy.
⚠ `hint` là chỗ DUY NHẤT người chơi đọc luật màn trước khi vào: phải nói rõ phím và cơ chế.

### 14b. SÁU CHIÊU MỚI PHÁT CHUNG MỘT TIẾNG

`SoundKeyOf` chỉ có nhánh cho chín chiêu cũ ⇒ cả sáu chiêu đợt sáu rơi về `Martial/Palm`. Chiêu
**chữa thương** và chiêu **phản đòn** phát ra cùng một tiếng đấm — tai mất hẳn một nửa phản hồi,
người chơi chỉ còn nhận ra chiêu qua CHỮ. Đã thêm sáu khoá và sinh sáu file bằng
`sfx_martial.py` (nay 16 tiếng). Đo lại: không file nào vỡ, trọng tâm phổ trải **201 Hz → 11 kHz**
nên không hai tiếng nào lẫn nhau.
⚠ Ba lớp của `WhirlBlade` lệch đúng `hitInterval` (0.13 s) của bảng chiêu — lệch số khác thì tai
nghe ba tiếng ở một nhịp còn máu trừ ở nhịp khác.

### 14c. CỤM NÚT CẢM ỨNG THIẾU Ô — VÀ CHỈ THÊM ĐƯỢC MỘT

Một phái đủ bậc + bí kíp có **5 chiêu**, mà cụm nút chỉ có 3 ô. Đo hình học mới thấy vì sao khó:
vòng 2 đã kín ở 180 · 146 · 112 · 90 · 68 · 45 · 23 độ, mỗi nút chiếm ~22° ⇒ **chỉ còn đúng một
khe ở 0°**; khe kế (−23°) tụt xuống dưới đường ngang của tâm cụm và bị `Place` kẹp vào sàn HUD.

Nên: thêm **CHIÊU 4** ở 0° (bốn ô). Với 5 chiêu thì ô cuối luôn giữ **TUYỆT KỸ**, và cái bị bỏ là
chiêu mở ở **Xuất sư** — chọn thế vì tuyệt kỹ là phần thưởng của cả cuộc tranh bí kíp, còn hai
chiêu Nhập môn là bộ xương dùng suốt ván. **Bàn phím không mất gì** (Q · E · T · F · G).

⚠ KHÔNG đẩy chiêu vào KHAY (`trayItem`): khay chứa nút CHỈNH, nó tự đóng sau vài giây và đòi
thêm một cú chạm — thứ không được có trên đường ra chiêu.

### 14d. LỖI DỌN CỜ CÓ SẴN — VÀ VÌ SAO ĐỔI SANG MẢNG

`StickmanTouchInput.ResetStatics` viết `_skill1Pressed = _skill2Pressed = _qinggongPressed = false;`
— **quên `_skill3Pressed`**, nên một cú bấm CHIÊU 3 chưa kịp tiêu sống sót qua lần nạp scene và
bung ra ở màn sau. Đó là giá của việc kê tay từng ô: thêm ô thứ tư là thêm bốn chỗ phải nhớ, và
một trong bốn sẽ rơi. Nay ba ô rời thành **MẢNG** (`MartialSkillLabels` · `MartialSkillReady` ·
`_skillPressed`), dọn bằng một vòng lặp — không quên được.

### 14e. HAI THỨ KIỂM RA LÀ KHÔNG PHẢI LỖI

· `StickmanParticleEffectBuilder.cs` 892 dòng — đã nằm trong sổ nợ `FileSizeBaseline.txt`.
· «AI bấm `IronShirt` ở cự ly 4.0 mà tầm 0» — báo động giả của script rà: Doctor thật dùng
  `distance <=` (có dấu `=`) và **bỏ qua chiêu `range <= 0`** (Self/Ally). Script rà đã sửa
  cho khớp; ghi lại đây để lần sau không ai đi "chữa" một thứ không hỏng.

---

## 13. BÀI QUYỀN DÀI — «AI ĐỨNG MÚA VÕ» (2026-09-09, đợt bảy)

`StickmanActionSetBuilder.WuxiaForms.cs` thay hẳn sáu bài ngắn của đợt hai.

| Bài | Phái | Dài | Khung | Nhịp riêng |
|---|---|---|---|---|
| Hàng long | Thiếu Lâm | 15.3 s | 28 | mỗi chưởng tới đích rồi **DỪNG HẲN** ~0.5 s |
| Thái cực | Võ Đang | 16.0 s | 25 | chậm **ĐỀU**, không một điểm dừng; hai vòng vân thủ |
| Kiếm quyết | Nga Mi | 11.2 s | 35 | khung cách 0.2–0.3 s, nhiều nhát ngắn |
| Tuý quyền | Cái Bang | 13.2 s | 27 | **KHÔNG ĐỀU**: đổ 0.2 s, treo 0.7 s, bật lại |
| Ma đao | Ma giáo | 12.1 s | 27 | **GIẬT CỤC**: bung 0.08 s rồi đứng sững 0.6–0.9 s |
| Luyện tiêu | Đường Môn | 10.6 s | 35 | thân bất động, tất cả ở **CỔ TAY**, khung dày 0.15 s |

### 13a. DỰNG TỪ MỘT BỘ «THỨC», KHÔNG GÕ TAY 200 TOẠ ĐỘ

17 thức có tên (mã bộ · cung bộ · hư bộ · độc lập bộ · đá · xoay lưng · phách chưởng · vân thủ
· vẩy cổ tay …), mỗi bài chỉ còn là danh sách «thức + thời điểm». Ba cái lợi: file dưới trần 800
dòng · đọc từ trên xuống là thấy bài đi những đâu · sửa một tư thế thì sáu bài cùng đổi.

⚠⚠ **CÁI PHÂN BIỆT SÁU BÀI LÀ NHỊP, KHÔNG PHẢI TOẠ ĐỘ.** Sáu phái dùng chung bộ thức; khác nhau
ở khoảng cách giữa các khung (bảng trên). Bỏ nhịp đi là sáu bài thành một bài đổi màu áo.

### 13b. HAI THỨ ẢNH XEM TRƯỚC BẮT ĐƯỢC MÀ ĐỌC CODE KHÔNG BẮT ĐƯỢC

Dựng xong sáu bài, chạy `python .claude/skills/stickman-assets/scripts/kata_preview.py <ra>` —
script **đọc thẳng chuỗi khung từ file C#** rồi vẽ dải hình. Hai lỗi lộ ra ngay:

1. ⚠⚠ **KHÔNG CÓ MỘT CÚ ĐÁ NÀO** trong cả sáu bài — toàn tay. Võ mà thiếu cước pháp thì nhìn ra
   thể dục tay không. Thêm thức `Kick` (và `Twist` làm bản lề đổi hướng), chèn vào bốn bài.
2. ⚠⚠ **BỘ PHÁP ĐỌC KHÔNG RA.** Tấn ±0.24 trên cẳng chân 0.95 chỉ mở **14°** — mắt thấy "đứng
   thẳng", không thấy "xuống tấn". Nới mã bộ ±0.32, cung bộ 0.36/−0.26, quét 0.40/−0.30, độc lập
   bộ nhấc 0.46. Bộ pháp là **nửa bài quyền**; tay múa mà chân đứng im thì nhìn ra người đang
   khoát tay.

Đo lại sau khi sửa: |ikArm| xa nhất **1.316** (trần 1.35) · |bodyAngle| lớn nhất **38** ×1.6 =
**60.8** (trần 66).

### 13c. BÀI DÀI ĐẺ RA HAI VIỆC MỚI PHẢI LÀM

⚠⚠ **PHẢI HUỶ BÀI KHI HẾT RẢNH.** Với bài 2.4 s thì "đi bộ giữa bài" không ai thấy; với bài 16 s
thì thấy rõ. Động tác chiến đấu tự cắt được (priority cao hơn), nhưng **ĐI BỘ thì KHÔNG** —
`Idle`/`Walk` ưu tiên thấp hơn `Kata` nên bị chặn, và người đó vừa đi vừa múa cho hết mười sáu
giây. `AIKataModule` nay gọi `StickmanBodyAnimator.Release()` khi rời trạng thái rảnh.
⚠ Chỉ nhả khi bài đang chạy ĐÚNG LÀ của mình (cờ `_performing` + `CurrentAction == Kata`): gọi
`Release()` vô điều kiện là cắt luôn cú đánh mà tầng khác vừa mở.

⚠⚠ **PHÉP ĐO DOCTOR PHẢI SỬA THEO CÁCH VIẾT NGUỒN.** `HasClipStyle` chỉ dò
«`StickmanActionType.Kata, "dragon"`», mà bài mới đi qua hàm gọn `Form("dragon", …)` — loại clip
nằm TRONG hàm đó. Không sửa thì Doctor báo **cả sáu phái** trỏ vào style không có thật: một báo
động GIẢ, tệ hơn im lặng vì nó dạy người đọc bỏ qua bảng Doctor. Đây là giá phải trả của việc đo
bằng regex trên văn bản nguồn — chấp nhận được, nhưng phải nhớ trả.

### 13d. NHỊP MÚA + SÂN LUYỆN VÕ

`KataPacing` (Core) giữ ba số: rảnh bao lâu thì tính · giãn cách min/max. `AIKataModule` đọc,
màn ghi — cùng khuôn cầu tầng của `MartialStyle` (AI không được nhìn lên Gameplay).
⚠⚠ **Biến TĨNH nên phải trả về mặc định ở `OnDisable`** của `WuxiaPracticeGround`, không thì rời
sân luyện võ xong mọi trận sau đó cũng ôn quyền dày đặc, và không lần ra được vì scene gây lỗi
đã đi từ lâu. (`KataPacing` còn tự dọn ở `SubsystemRegistration` — nhưng đó chỉ cứu lúc vào Play
mới, không cứu lúc đổi scene trong cùng lần chạy.)

**`Demo_66_WuxiaPractice`** — sáu chưởng môn đứng cách đều trên một thềm, nhịp 1.5–6 giây, người
chơi đứng dưới xem. Ở mọi màn khác bài quyền chỉ hiện khi ai đó tình cờ rảnh 4 giây và trúng nhịp
20–45 giây, tức phần lớn người chơi **không bao giờ xem trọn một bài**.
⚠⚠ **CẢ SÁU PHẢI CÙNG MỘT PHE.** Khác phe là họ tìm thấy nhau, có mục tiêu, và cửa "đang rảnh"
đóng lại vĩnh viễn — sân luyện võ hoá trận hỗn chiến và **không ai múa một nhát nào**.
⚠ Vì cùng phe nên `WuxiaSectBinder` (tra theo SỐ PHE) không phát đúng bài từng phái được:
builder ghi thẳng `SectKataStyle` cho từng người và **cố ý KHÔNG đặt binder vào scene** — có
binder thì nhịp quét 2 giây sẽ ghi đè cả sáu về Thiếu Lâm.

---

## 12. CẤP VÕ CÔNG · SÁU CHIÊU MỚI · HAI MÀN CHƠI (2026-09-09, đợt sáu)

### 12a. LÊN CẤP MỞ CHIÊU — trục hấp dẫn nhất của VLTK, và nó KHÔNG cần hệ XP thứ hai

Dự án đã có `StickmanExperience` + `ExperienceTable` (giết → XP → cấp → khôn hơn / vũ khí tinh
hơn / máu dày hơn), nghe `TeamMember.AnyDied` nên mọi nguồn sát thương tự tính đúng.
`MartialGrowth` (Core) chỉ trả lời phần mà bảng kia không trả lời được:

| Bậc | Cấp | Chiêu nền | Nội lực |
|---|---|---|---|
| Nhập môn | 1 | 2 | ×1.00 |
| Tiểu thành | 2 | 3 | ×1.15 |
| Đại thành | 3 | 3 | ×1.30 |
| Xuất sư | 4 | **4** | ×1.50 |
| Tông sư | 5 | 4 | ×1.75 |
| Võ thánh | 6 | 4 | ×2.00 |

⚠⚠ **SÁU BẬC PHẢI KHỚP `ExperienceTable.DefaultMilestones()`** (1 gốc + 5 mốc). Kê bậc thứ bảy là
bậc đó KHÔNG BAO GIỜ TỚI và chiêu ở đó bị khoá vĩnh viễn — nhìn vào đọc ra "chiêu cuối hỏng",
không đọc ra "hai bảng lệch nhau". `StickmanDoctor.Wuxia` có phép đo thứ bảy canh cả ba vế:
số chiêu mỗi phái = `MaxSkillsPerSect`, số bậc ≤ số mốc + 1, bậc cuối mở đủ chiêu.

⚠ **`MartialGrowth` KHÔNG cộng máu và KHÔNG cộng sát thương** — hai thứ đó đã là việc của
`ExperienceTable.Milestone`. Cộng ở cả hai chỗ là một người lên cấp được cộng máu HAI LẦN.

⚠ **Bể nội lực đổi qua `SetMaxQi`, KHÔNG qua `Ensure`.** `MartialQi.Ensure` nạp ĐẦY khí, mà
`WuxiaSectBinder` chạy lại mỗi 2 giây cho cả sân — nạp đầy ở đó là nội lực không bao giờ cạn và
cả vòng lặp «đánh → cạn → lui ra tụ khí» biến mất, im lặng.

⚠ Thứ tự trong `WuxiaSects.Sect.skills` **chính là thứ tự mở khoá**. `SkillsOf(index, level,
withUltimate)` cắt mảng theo bậc và **giữ lại kết quả** (khoá = số chiêu × 2 + có tuyệt kỹ):
binder gọi nó cho từng người mỗi 2 giây, cấp phát mảng mới ở đó là rác đều đặn suốt ván.

### 12b. SÁU CHIÊU MỚI — 15 tổng, mỗi cái vẫn mở một TRỤC MỚI

| Chiêu | Hình | Trục MỚI | Phái |
|---|---|---|---|
| **Loạn Hoàn Kích** | `Line` 5.4, **3 đợt** | `hitCount` — quét lại nhiều lần | Võ Đang · Nga Mi · Đường Môn |
| **Bách Bộ Thần Quyền** | `Fan` 1.9, **4 đợt** | (cùng trục, khác hình) | Thiếu Lâm · Cái Bang · Ma giáo |
| **Phổ Độ Chúng Sinh** | `Ally` 7.0 | `healAlly` — **chiêu duy nhất chữa thương** | Nga Mi |
| **Kim Chung Tráo** | `Self` 6 s | `reflectPercent` — dội đòn ngược | Thiếu Lâm |
| **Bài Vân Chưởng** | `Fan` 3.2 | `launchUp` — **hất thẳng lên trời** | Võ Đang · Ma giáo |
| **Lăng Ba Vi Bộ** | `Self` | `retreatDash` — **chiêu duy nhất LÙI RA** | Cái Bang · Đường Môn |

⚠⚠ **`damage` của chiêu nhiều đợt là sát thương MỖI ĐỢT, không phải tổng.** Kê 1.5 × 3 đợt là
một chiêu 4.5 — one-shot mọi cung thủ — và `StickmanWeaponBalance` **không soi chiêu thức** nên
không có gì báo.

⚠ **Một hẹn giờ lo cả hai việc**: `_pendingLeft` thay cờ `_pendingArmed` cũ, diễn được cả "chiêu
có quãng bay" (1 đợt sau `windup`) lẫn "ba đợt cách nhau `hitInterval`". Chết / bị choáng giữa
chừng là huỷ sạch đợt còn lại — hai đợt sau nổ ra từ một cái xác là thứ người chơi thấy ngay.

⚠⚠ **PHẢN ĐÒN PHẢI CÓ CHỐT CHỐNG DỘI VÔ HẠN.** Hai người cùng bật Kim Chung Tráo đánh nhau: A
dội sang B → `Damaged` của B nổ → B dội lại A → … **tràn ngăn xếp, treo game ngay khung hình đó**.
Cờ `_reflecting` là **tĩnh** vì chuỗi dội đi qua nhiều đối tượng; cờ trên từng người không cắt
được vòng.

⚠ **Sáu chiêu mới DÙNG LẠI sáu hình effect đã có** (`MartialVfx.CastEventOf`) — và đó là lựa
chọn đúng chứ không phải làm cho xong: mỗi cặp trùng nhau về HÌNH VÙNG ĐÁNH. Nhờ vậy đợt sáu
**không bắt bấm lại «Dựng bộ EFFECT»**.

⚠ `MartialArtist` chạm trần 800 dòng ⇒ tách `MartialArtist.Advanced.cs`. Ranh giới theo NGHĨA:
file chính giữ **đường sát thương**, file phần giữ những thứ đòn thường không có.

### 12c. ANIMATION PHỨC TẠP = KHỚP CƠ CHẾ, không phải nhiều khung cho đẹp

`StickmanActionSetBuilder.WuxiaAdvanced.cs` — sáu dáng, 4–10 khung mỗi dáng.

⚠⚠ **SỐ NHÁT TAY PHẢI KHỚP `hitCount`.** `flurry` có ba nhát vì chiêu quét ba đợt, và **giữa hai
nhát phải có một khung THU TAY VỀ** — ba đỉnh liền nhau không có đáy thì mắt đọc ra một cú vung
run tay, không đọc ra ba nhát. Sửa `hitCount` mà quên sửa clip là mắt đếm ba mà máu trừ hai lần,
**không gì báo**.

⚠ `rapid` đấm **LUÂN PHIÊN hai tay**: bốn cú cùng một tay đọc ra là tay bị giật.
⚠ `mercy` là dáng **duy nhất không hướng về địch** và có `bodyHeight` DƯƠNG — dấu hiệu duy nhất
ở xa để phân biệt "đang cứu người" với "đang đánh".
⚠ `bell` **giữ nguyên tư thế gần nửa clip**: chiêu không vung tay lần nào, vẽ nó động liên tục là
đối thủ đọc ra "đang đánh" và lùi — trong khi điều đúng phải làm là ĐỪNG đánh nó.
⚠ `uplift` phải để `ikArm.y` **âm NHỎ** (−0.34, tức tay CAO): đẩy tay xuống mà địch bay lên trời
là art nói ngược cơ chế.
⚠ Hai trần: |bodyAngle| < 66°, |ikArm| ≤ 1.35. Đỉnh trong file: **41°** và **1.31**.

### 12d. HAI MÀN CHƠI MỚI

`StickmanWuxiaModesBuilder` → `Demo_64_WuxiaTraining` · `Demo_65_WuxiaTournament`.

**LUYỆN CÔNG** (`WuxiaTrainingMode`): quái ra từ HAI đầu thung lũng, ba bục cao cho khinh công
và chỗ tụ khí; giết quái → XP → lên bậc → học chiêu; tới **Xuất sư** là thắng, ngã là thua.
⚠⚠ **PHẢI NÓI RÕ CHIÊU VỪA HỌC.** Bản nháp chỉ báo «LÊN CẤP 2» và khi thử thì không ai nhận ra
mình vừa có thêm gì — nút chiêu thứ ba lặng lẽ sáng lên ở góc màn hình. Trục hấp dẫn nhất của
thể loại chết vì thiếu một dòng chữ.
⚠ Quái ra **hai phía**: một phía thì người chơi lùi vào góc chém mọi thứ, và vòng lặp "lui ra tụ
khí" biến mất vì không bao giờ phải lui đi đâu.

**TỈ VÕ ĐẠI HỘI** (`WuxiaTournamentMode`): sáu chưởng môn thủ đài — thắng thì Ở LẠI đấu tiếp,
thua là bị loại; ai còn đứng trên đài khi hết lượt là **MINH CHỦ VÕ LÂM**.
⚠⚠ **THỦ ĐÀI chứ không phải SƠ ĐỒ NHÁNH**: sáu không phải luỹ thừa của hai, nên nhánh phải có
suất miễn đấu — thứ người xem KHÔNG đọc ra được (một phái tự nhiên bỏ qua một vòng, nhìn vào
tưởng lỗi). Thủ đài thì lúc nào cũng đúng hai người trên đài.
⚠ **Hồi MỘT PHẦN (60%), không hồi đầy**: hồi đầy thì người lên đài đầu tiên gần như chắc thắng cả
giải, và cái đáng xem — kẻ thủ đài mòn dần — biến mất.
⚠ **Cả hai cùng ngã ⇒ đài BỎ TRỐNG**, người kế lên thủ. Không có vế này thì `_holder` trỏ vào một
cái xác và mọi trận sau tự thắng.
⚠ Playbook **`Duel`** (IQ cao nhất) cho giải đấu: cấp thấp thì `comboChance` = 0 và cả sáu chưởng
môn đánh như dân thường — giải đấu không đo được gì.
⚠ Đài phải **CAO và HẸP**: sân rộng thì Đường Môn chỉ việc lùi và ném ám khí tới hết giờ.

⚠ Số màn **64 · 65** vì `Demo_63` đã bị hai phiên song song lấy (`Demo_63_Moba`,
`Demo_63_MapWuxia`). Kiểm `Assets/_Scenes` trước khi đặt số mới.

⚠ **Chiêu 4 · 5 chỉ có trên BÀN PHÍM** (`F` · `G`). Cụm nút cảm ứng dựng đúng ba ô và `_buttons`
chỉ dựng MỘT LẦN — thêm ô là việc của `StickmanTouchControls`. Giới hạn ĐÃ BIẾT, không phải lỗi im lặng.

---

## 11. ⚠⚠ LỖI ĐÃ GIẾT CẢ TẦNG CHIÊU THỨC CỦA AI — VÀ VÌ SAO KHÔNG AI THẤY (2026-09-09, đợt năm)

User bấm đủ nút của đợt bốn, vào game, và báo: *"không thấy effect, có chưởng có võ công gì cả"*.
Không phải chuyện thẩm mỹ, cũng không phải quên bấm nút: **`AIMartialArtsModule` chưa từng ra
một chiêu nào, ở mọi màn võ lâm, kể từ ngày nó ra đời.**

```csharp
private bool Resolve(StickmanAgent agent)      // ← BẢN CŨ
{
    if (_resolved) return _artist != null;
    _resolved = true;                          // ⚠ đặt NGAY CẢ KHI không tìm thấy
    _artist = owner.GetComponent<MartialArtist>();
    ...
}
```

⚠⚠ **`MartialArtist` KHÔNG NẰM SẴN TRÊN PREFAB.** `WuxiaSectBinder` cắm nó ở `Start()` và ở
nhịp quét 2 giây. Thứ tự `Start()` giữa binder và agent là **không xác định**, còn quân **hồi
sinh giữa trận** thì *chắc chắn* tick trước khi binder quét tới. Module hỏi đúng một lần, trúng
lúc chưa có, rồi ghi nhớ *"người này không biết võ"* cho tới hết ván.

**Vì sao không có gì báo — bốn lớp nguỵ trang cùng lúc:**

| Nhìn vào thấy | Thực tế |
|---|---|
| Sáu phái vẫn chém nhau, vẫn có bài quyền, vẫn có nội lực trên HUD | chỉ tầng CHIÊU chết |
| Người chơi bấm `Q`/`E` vẫn ra chiêu, vẫn có hình | `WuxiaPlayerControls` không đi qua module |
| Doctor XANH cả năm phép đo | cả năm đều đọc VĂN BẢN NGUỒN, không đo hành vi lúc chạy |
| Biên dịch sạch, không một dòng log | `Resolve` trả `false` ở dòng đầu, im lặng theo thiết kế |

**Cách chữa — hai vế, thiếu vế nào lỗi quay lại y nguyên:**
- `MartialArtist.Generation` (Core-ish, tĩnh) tăng một nấc mỗi lần **có thêm** một `MartialArtist`
  ra đời; dọn về 0 ở `SubsystemRegistration`.
- `Resolve` thoát sớm khi đã có; còn `null` thì **chỉ hỏi lại khi đồng hồ đã nhích**.

⚠ **KHÔNG chữa bằng "cứ null thì hỏi lại mỗi nhịp"**: lính trung cổ / hiện đại / fantasy (số đông
tuyệt đối của dự án) sẽ trả một `GetComponent` mỗi nhịp nghĩ suốt ván cho một câu trả lời không
bao giờ đổi. So một `int` là O(1) và màn không phải võ lâm giữ nguyên chi phí cũ.

⚠ **`OnAttach` phải XOÁ tham chiếu, không chỉ hạ cờ.** `Resolve` nay thoát sớm khi `_artist != null`,
nên agent lấy từ pool cho người khác mà giữ tham chiếu cũ là **module điều khiển chiêu thức của
người trước** — người này ra chiêu thì người kia bay khí.

⚠⚠ **LUẬT CHUNG RÚT RA — «CẮM SAU» ĐÁNH BẠI «HỎI MỘT LẦN».** Mọi component do một *binder* cắm
lúc chạy (`WuxiaSectBinder`, `AIPlaybookBinder`, `CivilizationTeamAssigner`…) đều tới **sau** lần
tick đầu của kẻ đi hỏi. Kẻ hỏi chỉ được nhớ kết quả **DƯƠNG**; nhớ kết quả **ÂM** là tự khoá mình
vĩnh viễn. `MartialVfx.Update` cũng đã sửa theo đúng vế này. `StickmanDoctor.Wuxia` có phép đo
thứ sáu canh cả hai vế.

**Vế thứ hai — «không thấy nhiều chế độ chơi»:** cũng là lỗi thật, nhưng của cái BẢNG NÚT. Võ lâm
có **13 màn** (Demo_61 · ba bài `Genre_Wuxia_*` · chín map `Wux_*`), rải ở **tám nút thuộc năm
nhóm menu**. User bấm bốn nút đầu ⇒ menu 88 mục có đúng **một** mục võ lâm, và nhìn vào đọc ra
*"thể loại này chỉ có một chế độ chơi"*. Nay có **★ VÕ LÂM — DỰNG TẤT CẢ (1 nút)**
(`StickmanWuxiaAllBuilder`): tám bước đúng thứ tự, mỗi bước bọc `try/catch` riêng, cuối cùng in
bảng **đếm file thật trên đĩa** và nêu đích danh thứ còn thiếu.

⚠ Thứ tự tám bước là bắt buộc: nền văn minh **trước** scene (builder Demo_61 dừng nếu thiếu), kho
map **trước** sân map (sân đọc kho).

**Số sát thương bay lên** (`MartialSkillCallout.ShowDamage`) — dấu hiệu VLTK còn thiếu: khắc hệ ra
màu hệ mình + to + dấu `!`, bị khắc ra xám nhỏ. ⚠ Chỉ hiện khi **người chơi dính vào**, cùng luật
với khựng hình; và in **một chữ số thập phân** chứ không làm tròn — làm tròn thì điểm huyệt (0.45)
và hấp tinh (0.3) đều ra «0».

---

## 9. ĐO LẠI

**CÁCH NHANH (khuyên dùng từ đợt năm):** `Tools > Stickman > ★ VÕ LÂM — dựng TẤT CẢ (1 nút)`
— chạy đúng tám bước dưới đây theo thứ tự rồi in bảng đo. Danh sách dài bên dưới giữ lại để biết
nút nào làm gì khi cần chạy lẻ.

```
Tools > Stickman > ★ Bảng điều khiển
  1. Nhân vật › «★ 15 nền văn minh»            → sinh art + asset sáu môn phái
  2. Nhân vật › «★ Soát hồ sơ nền văn minh»    → phải thấy đủ 6 nền võ lâm
  3. Vũ khí   › «Art · vũ khí · nhân vật …»    → dựng 4 binh khí + 4 tấm art
  4. Vũ khí   › «★ Soát hồ sơ vũ khí»          → 4 cây mới phải XANH đủ 12 điểm
  5. Vũ khí   › «Bảng cân bằng vũ khí»         → lệch ±20%, không cây nào one-shot
  6. Rig      › «Build Action Sets»            → bake 16 clip võ lâm (BẮT BUỘC sau đợt hai)
  7. Audio    › «Dựng bảng tiếng (Sound Bank)» → 10 khoá `Martial/*` (BẮT BUỘC sau đợt hai)
  7b. Effect  › «Dựng bộ EFFECT (1 nút)»        → 13 dòng `Martial*` + 13 prefab (BẮT BUỘC sau đợt bốn)
  8. «Võ lâm đại hội — Demo_61»                → dựng lại màn (đợt hai thêm BÍ KÍP vào scene)
  9. Genres  › «Build ALL Genre Scenes»        → 14 bài, gồm 3 bài Genre_Wuxia_* (đợt ba)
  9b. «Võ lâm — LUYỆN CÔNG · TỈ VÕ · LUYỆN VÕ TRƯỜNG» → Demo_64 · 65 · 66 (đợt sáu + bảy)
 10. Maps    › «1. Build Map System»           → sinh 9 map mẫu Wux_* vào kho
 11. Maps    › «2. Create Map Arenas (4 sân)»  → dựng Demo_63_MapWuxia (đợt ba)
 12. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»  → không thêm mục đỏ mới; nhóm «Võ lâm» phải XANH
```

⚠ **Bước 6 · 7 · 8 là BẮT BUỘC sau đợt hai, không phải tuỳ chọn.** Bộ động tác đã bake không tự
biết code đã đổi (hai bài quyền + bốn dáng mới sẽ KHÔNG có, và `Pick` lặng lẽ bốc bài khác);
bảng tiếng cũ không có khoá `Martial/*` nào (`PlayKey` bỏ qua trong im lặng); scene `Demo_61` cũ
không có `WuxiaScripture` nào (bí kíp không bao giờ hiện, và không có gì báo).

**Trạng thái 2026-09-08 (đợt hai)**: code biên dịch sạch (`Docs/Tools/CompileCheck.py` — XANH,
0 lỗi của mình); hai trần của clip đã đo lại bằng máy (góc thân lớn nhất **44°** / trần 66, tay
với xa nhất **1.306** / trần 1.35); ba cửa của cả chín chiêu đã đo (mỗi chiêu đều có dòng trong
`Specs`, có phái mang, có nhánh AI bấm); mười file tiếng đã đo (không file nào vỡ, trọng tâm phổ
trải từ 201 Hz «hộ thể» tới 11 kHz «điểm huyệt» nên không hai tiếng nào lẫn nhau).
**CHƯA bấm các nút trên** (Unity đang mở ở phiên khác lúc làm) và **CHƯA chơi thử** — cân bằng
chiêu thức, nhịp bí kíp (45 s hiện / 60 s nghỉ) và độ đọc được của sáu bài quyền đều là số ĐẶT
RA, chưa phải số ĐO ĐƯỢC. Tiếng thì AI **không nghe được**: phải nghe bằng tai người mới chốt.

**Trạng thái 2026-09-09 (đợt ba)**: chín map mẫu + sân map + ba bài test + hình bí kíp đã có
trong code, biên dịch sạch. Hình bí kíp đã **nhìn trước** ở cả ba cỡ bằng
`.claude/skills/stickman-assets/scripts/mark_scripture.py` (bản Python trùng công thức với
`GameplayMarkArt.Scripture`). **CHƯA bấm** các nút 9 · 10 · 11 ở trên, nên map/scene chưa có
file thật; và **chưa chơi thử** map võ lâm nào.

**Trạng thái 2026-09-09 (đợt bốn)**: ngũ hành · 13 hình chiêu · tên chiêu · khựng/rung · thanh
chiêu · 17 skin vũ khí đã có trong code, biên dịch sạch (Runtime + Editor riêng). Mười ba sprite
đã **nhìn trước** ở 60 px nhuộm năm màu bằng `fx_martial.py`. **CHƯA bấm** «Dựng bộ EFFECT»,
«★ 15 nền văn minh» (Unity mở ở phiên khác) và **chưa chơi thử**: hệ số khắc 1.25/0.85, nhịp lặp
hào quang 0.85 s, thời gian chữ 1.15 s đều là số ĐẶT RA.

**Còn nợ (cố ý chưa làm)**: chưa có doanh trại / chiến dịch theo lượt cho võ lâm (khuôn
`ThreeKingdomsCampaign` — việc lớn, và phiên khác đang sửa chính file đó); bí kíp vẫn là art
VẼ BÙ bằng code, muốn đẹp thì đặt ChatGPT một tấm `Scripture.png` thang xám rồi thay ở
`GameplayMarkArt.Scripture`; skin vũ khí sáu phái cũng là vẽ bù — đơn hàng ChatGPT xem
`WeaponArt-ChatGPT-Prompt.md` (khổ theo bảng `Frame`); chưa có bài quyền/động tác MỚI ở đợt bốn
(16 clip đợt hai đủ dùng, chỗ thiếu là HÌNH chứ không phải DÁNG); khắc hệ chưa hiện thành số
sát thương bay lên (VLTK có), có thể thêm vào `MartialSkillCallout` nếu muốn.
