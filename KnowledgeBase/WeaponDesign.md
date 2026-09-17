# Hệ thống hoá vũ khí — bảng lớp & chỉ số chuẩn

> Code: `WeaponClass` (`Assets/Scripts/Core/Combat/WeaponTypes.cs`),
> bảng số: `StickmanWeaponBuilder.PresetFor()`
> Tài liệu kỹ thuật hệ vũ khí: [WeaponSystem.md](WeaponSystem.md)

Tài liệu này trả lời: **một vũ khí trong game này gồm những gì, phân lớp ra sao, và
mỗi lớp phải khác nhau ở chỗ nào** — để thêm vũ khí thứ 8, 9, 20 vẫn cân bằng và khác biệt.

## 1. Ba tầng phân loại (đừng lẫn lộn)

| Tầng | Kiểu | Dùng để | Ai đọc |
|---|---|---|---|
| `WeaponCategory` | Ranged · Melee · Throwable | quyết định **class code** nào xử lý (`RangedWeapon`/`MeleeWeapon`/`ThrowableWeapon`) | lập trình |
| **`WeaponClass`** | 9 lớp (bảng dưới) | quyết định **bộ chỉ số + tính cách AI** | thiết kế |
| `WeaponType` | Bow, Sword, Spear... | định danh từng món cụ thể | UI, save game |

Một `WeaponClass` có thể trải trên nhiều `WeaponCategory` (búa ném là `Thrown` nhưng nếu làm
búa cận chiến thì cùng lớp `HeavyMelee`), và nhiều `WeaponType` chung một lớp
(lao và rìu ném đều là `Thrown`).

## 2. Bốn trục thiết kế

Tổng hợp từ cách các game hành động/RPG phân loại vũ khí (nguồn ở cuối trang), mỗi vũ khí
là một "hợp đồng" với người chơi trên 4 trục:

1. **Tầm giao chiến** — gần / trung / xa, và quan trọng không kém: **tầm gần tối thiểu**
   (giáo dài mạnh ở xa nhưng bất lực khi bị áp sát — đây là cái làm nó KHÁC kiếm, không phải damage).
2. **Nhịp ra đòn** — cooldown + windup/recover. Nhanh yếu ↔ chậm mạnh.
3. **Sức đẩy (stagger)** — cảm giác "nặng tay" nằm ở đây nhiều hơn ở con số sát thương.
4. **Tài nguyên** — vô hạn (kiếm), tiêu hao (lao/bom), hay đổi lấy an toàn (đứng xa bắn).

Trong dự án này còn trục thứ 5 vì có AI: **tính cách khi AI cầm** — xem mục 4.

## 2b. Công thức cân bằng — "mạnh yếu khác nhau" nhưng vẫn ngang giá

Cân bằng **KHÔNG** phải là mọi cây damage bằng nhau. Nguyên tắc của dự án:

> **ĐIỂM SỨC MẠNH của mọi vũ khí phải xấp xỉ nhau; khác biệt nằm ở HÌNH DẠNG của sức mạnh đó.**

```
Điểm = DPS × HệSốTầm × HệSốTiệnÍch

DPS          = sát thương ÷ nhịp đòn   (vũ khí nổ: lấy sát thương vụ nổ)

HệSốTầm      = 1.00 + tầm × 0.10 + sốĐònĂnMiễnPhí × 0.30

             sốĐònĂnMiễnPhí = (tầm − 0.55) ÷ tốcĐộÁpSát ÷ nhịpĐòn
             tốcĐộÁpSát     = 3.9 × SpeedTuning(0.82) × sứcNặngGiáp(0.89) = 2.85 u/s

             ⚠ KHÔNG còn là số cố định theo loại vũ khí. Bản cũ cho cung/nỏ 1.30 và súng
               1.45 bất kể tầm bao nhiêu, nên cung tầm 6 được chấm gần ngang kiếm tầm 0.55.
             ⚠ Và bản sau đó vẫn sai một lần nữa: `ClosingSpeed` gõ 3.9 = `_runSpeed` THÔ,
               trong khi không ai chạy 3.9 (xem công thức trên) — rút ngắn quãng áp sát ~27%,
               tức đếm THIẾU số đòn tầm xa ăn được miễn phí.

HệSốTiệnÍch  đẩy văng      : × (1 + (đẩy − 1) × 0.10)
             nổ diện rộng  : × 1.35
             đỡ được đòn   : × 1.15
             vùng chết     : × (1 − vùngChết × 0.30)      ← giáo dài bị phạt ở đây
             phải tích lực : × 0.92
```

**Mốc chuẩn ≈ 3.5.** Lệch quá ±20% là cần xem lại — không phải lỗi, nhưng phải trả lời được
câu "nó mạnh hơn thì nó yếu ở chỗ nào".

Chạy `Tools > Stickman > Weapons > Balance Report` để tool tự đo lại toàn bộ (nó **mount thật**
từng cây lên nhân vật để lấy tầm với chính xác) và chỉ mặt cây nào lệch. Thêm vũ khí mới xong
thì chạy lại — đó là cách duy nhất biết cây mới có phá cân bằng không.

**KHIÊN được miễn** khỏi phép đo này: ngân sách sức mạnh của nó nằm ở ĐỠ ĐÒN, không ở sát thương.

### ⚠⚠ Chỗ mù còn lại: XOÁ SỔ MỘT PHÁT

`DPS = sát thương ÷ nhịp` ngầm giả định sát thương THỪA vẫn có ích. **Nó không.** Một cây giết
mục tiêu bằng ĐÚNG MỘT phát thì không có nạn nhân bị thương nào đứng dậy đánh trả, không kịp
hồi máu, và người bị bắn không bao giờ biết mình sắp chết. Cái đó đắt hơn nhiều so với phần
DPS mà công thức nhìn thấy.

Đo được (máu chuẩn: cận chiến **3.0**, cung thủ/lính khiên **2.0**):

| Cây | sát thương cũ | Điểm cũ | Sự thật |
|---|---|---|---|
| Trường cung | 3.4 | **−1% ("cân bằng")** | one-shot MỌI lính không giáp |
| Nỏ | 2.5 | **+7%** | one-shot cả tuyến sau |

Balance Report nay in riêng khối **XOÁ SỔ MỘT PHÁT**, và **chỉ réo TẦM XA**: một nhát búa 2.0
vào mặt thì đáng phải đau, vì để vung được nhát đó nó đã phải xáp mặt và tự đặt mình vào tầm
đòn. One-shot từ ngoài tầm với là đòn không có giá.

⚠ **Hạ sát thương thì phải hạ cả nhịp nạp.** Chỉ cắt damage là cây đó rơi xuống −21% và tool
réo `<<<` vĩnh viễn — cái đỏ nói dối cũng tệ như cái xanh nói dối. Mốc đã chốt cho bộ tầm xa
sau nerf: **−4%** cho cả cung · nỏ · trường cung.

⚠⚠ **HAI LOẠI LEVER, ĐỪNG LẪN.** Bảng điểm chỉ đo được loại thứ nhất:

| Loại | Ví dụ | Chỉnh bao nhiêu ra bấy nhiêu? |
|---|---|---|
| **Chỉnh sức mạnh** | sát thương · nhịp nạp · đẩy văng | ✔ tuyến tính, hiện trên bảng điểm |
| **ĐÓNG / MỞ khả năng ra sát thương** | `_minEffectiveRange` · `rangedSteadyAimTime` | ✘ quá ngưỡng là nhân vật **không đánh được nữa**, và bảng điểm KHÔNG thấy |

Đợt nerf đầu để vùng chết 2.0/2.2/2.6 + ngắm chắc tay 0.70s và người dùng đọc ra *"yếu và bắn
quá chậm"* — dù nhịp nạp đã được rút ngắn. Lý do: đồng hồ ngắm **reset về 0 mỗi lần nhúc
nhích**, còn vùng chết rộng hơn thì bị ép lùi thường xuyên hơn ⇒ **hai lever nhân nhau**. Nhịp
bắn THỰC TẾ (`cooldown + ngắm`) của cung đi từ 1.30 lên **1.65 s/phát**. Dồn nerf vào SÁT
THƯƠNG, chỉ nhích nhẹ hai lever kia.

⚠ **Tản đạn KHÔNG dùng được để nerf cung** — đã đo và loại. Bia là stickman cao 0.73, nên ở cự
ly 6–8 thì tản ≤ 2.5° vẫn **trúng 100%**; phải 4–9° mới đổi được gì, mà thế thì nhìn ra "bắn
bừa". Đừng thử lại.

### Vì sao súng từng phá vỡ cả bộ

Bản trước súng trường để `damage 1.2 / cooldown 0.14` → **8.6 DPS bắn từ 6 unit**, trong khi
kiếm chỉ 2.9 DPS mà phải xáp mặt. Điểm 12.05 so với mốc 3.5 — gấp 3.4 lần. Cầm súng là thắng,
mọi cây cận chiến thành đồ trang trí. Đó chính là thứ công thức trên bắt được.

### Trục ẩn: giáp và mũ

`_helmet.hitsBlocked = 1`, khiên đỡ 2 — chúng chặn **theo LƯỢT ĐÁNH, không theo sát thương**.
Nên vũ khí **ít nhát mà nặng** (búa, nỏ, bắn tỉa) phá giáp tốt hơn hẳn vũ khí **nhiều nhát mà nhẹ**
(song đao, tiểu liên) dù cùng DPS. Đây là ưu/khuyết điểm không nằm trong công thức — cố ý để vậy.

---

## 2c. Cấp độ vũ khí (WeaponTier)

Cùng một cây kiếm có bản thường, bản tinh luyện, bản huyền thoại — **cấp độ là trục DỌC,
lớp vũ khí là trục NGANG**:

| | Quyết định |
|---|---|
| `WeaponClass` | **hình dạng** sức mạnh (nhanh-nhẹ ↔ chậm-nặng, gần ↔ xa) |
| `WeaponTier` | **độ lớn** của sức mạnh đó |

Bẫy phải tránh: nếu cấp độ chỉ cộng damage thì búa 2 damage hưởng lợi gấp đôi đao ngắn
1 damage → cân bằng ngang giữa các lớp vỡ sạch sau vài cấp. Nên mỗi cấp có một **hệ số sức mạnh
`power`**, rồi chẻ ra:

```
damageScale = power^0.6      (phần lớn vào sát thương)
speedScale  = power^0.4      (phần còn lại vào nhịp đòn — cooldown chia cho số này)
```

DPS tăng đúng bằng `power`, còn vũ khí nặng lên cấp vẫn nặng, vũ khí nhanh lên cấp vẫn nhanh.

| Cấp | Tên | power | Damage ×| Tốc độ ×| Màu |
|---|---|---|---|---|---|
| 1 | *(không tên)* | 1.00 | 1.00 | 1.00 | trắng |
| 2 | Tinh luyện | 1.25 | 1.14 | 1.09 | lục |
| 3 | Cứng cáp | 1.55 | 1.30 | 1.19 | lam |
| 4 | Tinh xảo | 1.90 | 1.46 | 1.29 | tím |
| 5 | Huyền thoại | 2.30 | 1.63 | 1.39 | cam |

**Cấp 1 = đúng số gốc trên prefab**, nên mọi vũ khí cũ không đổi gì.

- Bảng hệ số: asset `WeaponTierTable` (`Tools > Stickman > Weapons > Tiers > 1. Create Tier Table`).
  Không có asset cũng chạy — code có bảng mặc định.
- Đổi cấp lúc chơi: `weapon.SetTier(3)` — tự nhuộm màu lại ngay.
- Làm sẵn một cây bản xịn: chọn prefab → `Tiers > 2. Set Tier on Selected`.
- Cấp cũng nhân **tốc độ đạn** và **sát thương vụ nổ** (hệ số đi theo `ProjectileLaunch.damageScale`),
  nên bom cấp huyền thoại nổ mạnh thật chứ không chỉ đổi màu.

⚠️ **Đừng buff bằng cách sửa `_damage` trên prefab** — đó là số gốc cấp 1, sửa nó là lệch cả
bảng cân bằng. Muốn mạnh hơn thì nâng cấp.

---

## 3. Bảng 9 lớp vũ khí

Đơn vị world (nhân vật cao ~1 unit). Damage 1 = hạ gục lính 1 máu.

| Lớp | Ví dụ | Tầm | Nhịp (cooldown) | Damage | Đẩy | Điểm mạnh / yếu |
|---|---|---|---|---|---|---|
| `LightMelee` | **đao ngắn**, dao găm | ~0.45 | **0.22** | 0.65 | 0.8 | ra đòn dồn dập, gần như không lùi · tầm cực ngắn |
| `Melee` | **kiếm**, **đao**, **song đao**, **song kiếm** | ~0.55 | 0.35 | 1 | 1.2 | **thước đo chuẩn** — mọi lớp khác so với nó |
| `HeavyMelee` | **đao dài**, **búa cận chiến** | ~0.6 | **0.7** | **2** | **2.5** | một đòn đổi mạng · hụt là ăn đòn |
| `Polearm` | **giáo**, **thương**, **kích** | **~1.0–1.15** (min 50–62%) | 0.48 | **1.6** | 1.0 | tầm cận chiến dài nhất · **bị áp sát là vô dụng** |
| `Bow` | **cung** (1.5/0.95), **nỏ** (1.9/1.30), **trường cung** (2.8/1.90) | 5 – 8 | 0.95 – 1.9 | 1.5 – 2.8 | 1.0 – 1.6 | đứng ngoài tầm với · **vùng chết 2.0–2.6 rộng nhất bộ**, bị áp sát là hết bài |
| `Firearm` | **súng**, súng lục, tiểu liên, súng trường, bắn tỉa, **hoả mai** (2.9/2.10) | 2.2 – 14 | **0.09 – 2.1** | **0.35 – 3.5** | 0.4 – 2.2 | đạn thẳng, không bù độ rơi · tản đạn, đẩy yếu (trừ hoả mai/bắn tỉa) |
| `Thrown` | **lao** (5.5), **búa ném** (4.2) | 4.2 – 5.5 | 0.68 – 0.85 | **2.0 – 2.4** | 1.4 – 2.0 | đẩy mạnh, cắm vào xác · mỗi lần ném mất một cây |
| `Explosive` | **bom** (4.0), **lựu đạn** (4.5) | 4.0 – 4.5 | **1.35 – 1.55** | nổ **3 – 3.5** (AoE) | 2.0 – 2.5 | diện rộng · nguy hiểm cho chính mình |
| `Shield` | **khiên** | ~0.35 | 0.9 | 0.5 | **2.6** | đỡ đòn trước mặt + đập văng · damage thấp nhất bộ |

⚠⚠ **TẦM CỦA CÂY NÉM KHÔNG GÕ TAY — nó là kết quả của `StickmanWeaponBuilder.SetThrowRange`.**
Khai TẦM + DÁNG CUNG, tool giải `_minSpeed`/`_maxSpeed` sao cho vật đi qua ngực nạn nhân ở đúng
tầm đó. Gõ tay hai bên là chúng trôi khỏi nhau **trong im lặng**: trước 2026-09-04 cả bốn cây
ném đều bay qua đầu mục tiêu rồi rơi ở 1.2–1.8 lần bề ngang khung nhìn (búa ném: khai 4.5, bay
13.8, ở đúng 4.5 nó cao 1.45 trên một mục tiêu cao 0.73). Chi tiết + bảng số: `AGENTS.md` §7b-tambay.
Soi bằng khối **TẦM BAY THẬT** trong `Weapons > Balance Report`.

⚠⚠ **CÁN VŨ KHÍ CŨNG GÂY DAMAGE, NHẸ HƠN ĐẦU** (`MeleeWeapon._haftDamageScale` /
`_headLengthPercent`, đặt theo LỚP trong `PresetFor`). Trước 2026-09-04 chỉ hình tròn quanh MŨI
mới ăn, nên **53% cán của cây thương · 50% của kích · 40% của giáo** đi xuyên qua người mà
không có gì xảy ra. Nay Polearm 0.35 (đầu 22% chiều dài) · HeavyMelee 0.35 (đầu 40%) · còn lại 0.
· Vòng quét cán CỐ Ý không áp `_minRangePercent` — luật *"giáo bị áp sát là VÔ DỤNG"* thành
  *"bị áp sát thì chỉ còn khúc gỗ"*. `_haftDamageScale` vì vậy là một LEVER CÂN BẰNG: nới cao là
  xoá luôn điểm yếu duy nhất của họ vũ khí dài.
· `Balance Report` đã nhân phần phạt vùng chết với `(1 − haftDamage)` cho khỏi nói dối.
· Cây NGẮN tự động không đổi gì: bán kính quét mũi (0.25) vốn đã phủ trọn cây, phép cắt hình học
  trong `SweepHaft` thoát ngay. Chi tiết + bảng đo: `AGENTS.md` §2b-can.

⚠⚠ **ĐẠN CÓ HẠN (2026-09-04).** Cung 10 · nỏ 8 · trường cung 6 · hoả mai 6 · ná 14 · lao 5 ·
búa ném 4 · lựu đạn 3 · bom 2. Hết đạn thì cây vũ khí **ẨN HÌNH (tay không)**; nạp lại ở
`AmmoCache` (giỏ tiếp tế đặt cạnh điểm hồi sinh của từng phe). Cái giá của một phát bắn từ nay
là QUÃNG ĐƯỜNG đi lấy phát tiếp theo, không phải một con số damage thấp hơn — §7b-nerf đã nerf
bằng sát thương một lượt và vẫn bị báo "quá mạnh".
· Súng HIỆN ĐẠI cố ý để vô hạn (nhịp 0.175 s thì một băng hết trong 3.5 giây — đòi cơ chế băng
  đạn, một hệ khác hẳn). Hoả mai có hạn vì nó là cây trung cổ.
· AI đi nạp bằng `AIResupplyModule`; không có giỏ thì bỏ cây rỗng cho `AIWeaponScavengeModule`.
· Bảng cân bằng CHƯA tính vế này (`Điểm` vẫn là DPS × tầm × tiện ích) — số đạn là trục thứ tư,
  đo bằng "bắn được bao lâu trước khi phải rời tuyến". Chi tiết: `AGENTS.md` §2b-dan.

**Cùng lớp thì khác nhau ở ĐÂU** — vài ví dụ trong bộ hiện tại:

| Cặp cùng lớp | Cái làm chúng khác nhau |
|---|---|
| kiếm ↔ đao | kiếm có nhát **đâm** kết combo; đao **toàn chém**, hitbox to hơn (0.11 vs 0.10) |
| đao ↔ song đao | song đao đổi tay mỗi nhát (`Swing.useOffHand`) → nhịp dày gấp đôi, mỗi nhát nhẹ hơn (0.8) |
| song đao ↔ song kiếm | song đao thiên chém, song kiếm thiên **đâm** (nhát kết ×1.7) |
| giáo ↔ thương | thương dài hơn (~3.6 vs ~2.8) và vùng chết rộng hơn (62% vs 55%) |
| đao dài ↔ búa cận chiến | đao dài chém nhanh hơn (0.72s); búa chậm hơn (0.8s) nhưng đẩy 3.0 |
| bom ↔ lựu đạn | bom nổ khi chạm, bán kính 2.2; lựu đạn **nảy rồi mới nổ** theo ngòi 1.2s, bán kính 1.6 |

**Bảng này là NGUỒN DUY NHẤT của số cân bằng** — nằm trong `StickmanWeaponBuilder.PresetFor()`.
Mỗi vũ khí gọi `ApplyClass(props, WeaponClass.X)` để lấy đủ bộ số, rồi mới override cái riêng
(sprite, pose, tầm, đặc tính). Sửa cân bằng cả lớp = sửa 1 chỗ.

## 3b. Bộ SÚNG HIỆN ĐẠI — cùng lớp `Firearm`, khác nhau ở nhịp bắn và tản đạn

Tách hẳn khỏi bộ trung cổ, có scene thử riêng `Demo_7_ModernWeapons`. Cả 6 cây đều là
`RangedWeapon` bắn đạn `bullet` (riêng phóng lựu bắn `grenade`) — không thêm dòng code nào,
chỉ khác số.

| Cây | Sát thương | Nhịp (giây) | Tốc độ đạn | Viên/phát | Tản (°) | Liên thanh | Tầm ăn | Tay |
|---|---|---|---|---|---|---|---|---|
| Súng lục | 1 | 0.30 | 26 | 1 | 1.5 | không | 5 | **1 tay** |
| Tiểu liên | **0.6** | **0.09** | 24 | 1 | **5** | có | 4 | 2 |
| Súng trường | 1.2 | 0.14 | 30 | 1 | 2.5 | có | 8 | 2 |
| Súng săn | 0.5 **×6** | 0.85 | 20 | **6** | **9** | không | **3** | 2 |
| Bắn tỉa | **4** | **1.6** | **45** | 1 | 0.2 | không | **14** | 2 |
| Phóng lựu | 0 (nổ) | 1.5 | 16 | 1 | 1 | không | 7 | 2 |

Đọc bảng theo hai trục đánh đổi, không phải "cây nào mạnh nhất":

- **Nhịp bắn ↔ sát thương mỗi phát**: tiểu liên 0.6 sát thương mỗi 0.09 giây, bắn tỉa 4 sát
  thương mỗi 1.6 giây. Tính ra sát thương/giây gần nhau — khác nhau ở chỗ *hụt một phát thì mất gì*.
- **Tản đạn ↔ tầm ăn**: súng săn tản 9° nên xa 5 unit là đạn bay hết ra ngoài, đổi lại gần thì
  6 viên dính hết = 3 sát thương một phát. Bắn tỉa ngược lại.

Súng săn cố tình để `damage` là của **mỗi viên**, không phải cả phát — `RangedWeapon` truyền
`_damage` xuống từng viên đạn lúc bắn, nên muốn chỉnh sức mạnh thì nhớ nhân với `_projectilesPerShot`.

Súng lục là cây súng **1 tay** duy nhất (`HandGrip.RightHand`) — để dành chỗ cho lối chơi
súng-kèm-khiên sau này; các cây còn lại 2 tay, tay phụ bám `_offHandGrip` trên thân súng.

AI cầm súng nào thì cư xử theo `SetAiPersonality` của cây đó: tiểu liên/súng săn dí sát mặt
(preferred 0.5 / 0.35, gần như không lùi), bắn tỉa đứng xa nhất và bắn xong lùi ngay
(preferred 1.0, backoff 1.6) vì nạp 1.6 giây.

## 4. Tính cách AI theo lớp

Ba số trên `WeaponBase` quyết định NPC cầm vũ khí đó cư xử ra sao — cùng một bộ não FSM
nhưng cầm giáo và cầm súng đánh khác hẳn nhau:

| Lớp | `aiPreferredRangePercent` | `aiBackoffScale` | `aiAggression` | Đọc thành lời |
|---|---|---|---|---|
| LightMelee | 0.75 | 0.6 | 1.4 | bám sát, chém liên tục |
| Melee | 0.80 | 0.8 | 1.25 | áp sát, chém rồi lùi nhẹ |
| HeavyMelee | 0.70 | 1.2 | 0.9 | vào tầm, nện một phát rồi lùi hẳn |
| Polearm | **0.95** | **1.5** | 0.85 | thọc từ đầu mũi giáo, thọc xong rút ngay |
| Bow | 0.92 | 1.2 | 0.8 | đứng xa nhất có thể, bị áp sát là lùi |
| Firearm | **0.60** | **0.35** | 1.3 | bám riết ở tầm trung, nhả đạn không nghỉ |
| Thrown | 0.90 | 1.3 | 0.9 | ném từ xa rồi lùi rút cây mới |
| Explosive | **1.00** | 1.6 | 0.7 | ném ở tầm xa nhất, tránh vạ lây |
| Shield | **0.65** | **0.40** | 1.1 | đứng sát, **không lùi** — chắn tuyến rồi đập văng địch ra |

`preferredRangePercent` = đứng ở đâu trong dải `[MinRange .. MaxRange]`.
`backoffScale` nhân với `AIProfile.meleeBackoffTime`. `aggression` chia vào `attackHesitation`
(cao = ra đòn dồn dập hơn).

## 4b. CÂN BẰNG TẦM XA ↔ TẦM GẦN (ba vế, không phải hạ damage)

Triệu chứng: *"vũ khí tầm xa đang áp chế vũ khí tầm gần"*. Nguyên nhân KHÔNG nằm ở sát thương —
cung mạnh vì **đứng ngoài tầm với**. Cứ hạ damage thì cung thành vô dụng mà vẫn không sửa
được cái gốc. Ba vế phải làm cùng lúc:

### Vế 1 — VŨ KHÍ TẦM XA CÓ VÙNG CHẾT (`RangedWeapon._minEffectiveRange`)

Đối xứng với `MeleeWeapon._minRangePercent` mà giáo dài đã có: địch lọt vào trong khoảng này
là **không giương cung lên được**. Đây là chỗ biến "cận chiến vs tầm xa" thành kéo-búa-bao
thật: cung thắng ở xa, kiếm thắng khi áp được vào.

| Cây | Vùng chết |
|---|---|
| Cung | 1.3 |
| Nỏ | 1.6 |
| Trường cung | 2.0 |

### Vế 2 — NGẮM CHẮC TAY (`AIProfile.rangedSteadyAimTime`, mặc định 0.35s)

**Vế quan trọng nhất.** Cung thủ vừa lùi vừa bắn thì tầm xa vô đối: nó giữ khoảng cách vĩnh
viễn mà vẫn ra sát thương đều. Bắt phải **đứng yên** mới bắn nghĩa là "bị áp sát" mới thật sự
có giá — địch tới gần → phải lùi liên tục → không kịp ngắm → không ra được sát thương.

Đo bằng `TravelSpeed` (quãng đường THẬT) chứ không đo `Velocity`; xông liều / tử chiến thì bỏ
qua luật này.

### Vế 3 — CẬN CHIẾN ĐƯỢC TRANG BỊ ĐỂ ÁP SÁT

- `AIProfile.runReachMultiplier` (2.5): **chạy** khi còn xa hơn *tầm vũ khí của chính mình* ×
  2.5. Số tuyệt đối `runChaseDistance = 4` làm lính kiếm (tầm 0.55) **đi bộ** gần 4 unit dưới
  mưa tên; theo tầm với thì nó chạy từ 1.4 trở ra — gần như cả quãng áp sát. Cung tầm 6 thì
  gần như không bao giờ phải chạy, đúng vai.
- `AIProfile.rangedTargetBonus` (5): địch cầm vũ khí tầm xa được coi như **gần hơn 5 unit** lúc
  chấm điểm mục tiêu → luôn có vài đứa tách ra dọn tuyến sau, thay vì cả đám bu vào tuyến khiên
  cho cung hai bên bắn miễn phí.

### Đo lại cho đúng — `rangeFactor` cũ là số bịa

`StickmanWeaponBalance` từng chấm tầm xa bằng **hằng số 1.30 / 1.45** bất kể tầm bao nhiêu,
nên cung tầm 6 được chấm gần ngang kiếm tầm 0.55 → báo cáo bảo "cân bằng" trong khi thực tế
cung áp chế. Nay tính bằng **số đòn ăn miễn phí** trong lúc đối thủ chạy tới:

```
khoảng phải vượt = tầm của mình − 0.55 (tầm kiếm, thước đo chuẩn)
thời gian        = khoảng đó ÷ 3.9 (tốc độ CHẠY)
đòn miễn phí     = thời gian ÷ nhịp đòn
hệ số tầm        = 1 + tầm × 0.10 + đònMiễnPhí × 0.30
```

Cận chiến ra 0 đòn miễn phí → hệ số về đúng `1 + tầm × 0.1` như cũ.
**Thêm vũ khí tầm xa mới thì PHẢI chạy lại `Weapons > Balance Report`** — cột "đòn miễn phí"
là chỗ nhìn đầu tiên.

## 5. Tầm đánh KHÔNG phải số cứng

Cận chiến tự đo tầm với từ **chính hình dạng vũ khí**:

```
EffectiveRange = |Tip.x − thân người.x| × reachExtension + hitRadius
MinEffectiveRange = EffectiveRange × minRangePercent
```

- `Tip` là object con của prefab vũ khí → đổi sprite dài hơn là tầm tự tăng, không phải sửa số
- `reachExtension` (~1.15–1.3) bù cho việc tay duỗi ra lúc vung
- `minRangePercent`: **kiếm 0**, **giáo 0.55** → giáo đâm hụt khi địch lọt vào trong cán
  (áp dụng cả ở hitbox thật lẫn ở quyết định của AI)

Nhờ vậy `AIProfile.meleeRange` chỉ còn là số dự phòng khi vũ khí không tự đo được.

## 6. Thêm vũ khí mới — quy trình 5 bước

0. **Thêm định danh**: 1 giá trị vào cuối `enum WeaponType` (GIỮ NGUYÊN số cũ) + 1 dòng vào cuối
   `StickmanWeaponBuilder.LeafWeaponPaths` (nối vào CUỐI, đừng chèn giữa kẻo lệch `UnitLoadout.weaponIndex`)
1. **Chọn lớp** trong bảng mục 3 (thiếu lớp thì thêm giá trị vào `enum WeaponClass` +
   1 nhánh trong `PresetFor()`)
2. `Tools > Stickman > Weapons > New Weapon Variant from Selection` với base đúng nhóm code
   (Melee / Ranged / Throwable)
3. Đổi sprite ở con `Visual`, kéo `Tip` ra đúng mũi vũ khí → tầm đánh tự tính
4. Chọn `_weaponClass` trong Inspector; muốn khác chuẩn thì override `_cooldown`, `_damage`,
   `_knockbackScale`, hoặc 3 số tính cách AI
5. Vũ khí bắn/ném: tạo variant của `Proj_Base`, đặt `_projectileKey` riêng

**Nguyên tắc**: hai vũ khí cùng lớp phải khác nhau ở **hình dạng + pose + đặc tính riêng**
(cắm vào xác, xuyên, nổ, xoay tít), KHÔNG phải chỉ khác con số damage.
Khác nhau mỗi damage thì người chơi không cảm nhận được.

## 7. Ma trận đặc tính riêng (cái làm vũ khí "có hồn")

| Đặc tính | Ở đâu | Đang dùng cho |
|---|---|---|
| Tích lực đổi tốc độ đạn | `WeaponBase._useCharge` | cung, lao, búa, bom |
| Cắm vào mục tiêu | `ProjectileController._stickOnHit` | tên, lao |
| Xuyên nhiều mục tiêu | `_pierceCount` | đạn súng, lao |
| Xoay tít khi bay | `angularVelocity` khi ném | búa |
| Nổ diện rộng | `_explodeOnImpact` + `_fuseTime` | bom |
| Combo nhiều nhát | `MeleeWeapon._combo` | kiếm/đao/đao ngắn (3), song đao/song kiếm (4), giáo/thương/đao dài/búa (2) |
| **Đổi tay giữa combo** | `MeleeWeapon.Swing.useOffHand` + `_offHandHitPoint` | song đao, song kiếm |
| **Đỡ đòn có độ bền tự hồi** | `ShieldWeapon._blockCapacity` / `_regenPerSecond` | khiên cầm tay |
| Tầm gần vô dụng | `_minRangePercent` | giáo (55%), thương (62%), đao dài (20%) |
| Đỡ đòn rồi rơi | `EquipmentDefinition.blocksHits` | khiên TRANG BỊ (2 đòn), nón (1 đòn) |
| Tản đạn / liên thanh | `_spreadDegrees`, `_automatic` | cả 6 cây súng (xem mục 3b) |
| **Nhiều viên một phát** | `_projectilesPerShot` | súng săn (6 viên) |

Thêm vũ khí mới nên lấy **ít nhất một** đặc tính chưa ai dùng, hoặc kết hợp mới
(VD: nỏ = `Bow` + xuyên + không tích lực; rìu ném = `Thrown` + combo cận chiến khi cầm).

## 7b. Độ nặng · Sở trường · Nhiều hình (2026-09-05)

Ba trục thêm sau, cùng áp ở `SaveVariant` cho cả 53 cây:

| Trục | Nguồn sự thật | Ăn vào đâu |
|---|---|---|
| **Độ nặng** (kg đời thật) | `StickmanWeaponBuilder.WeaponWeight` | `WeaponHandling.MoveScaleFor`: `max(0.72, 1 − 0.03·kg)` → `StickmanLocomotion.SetWeaponLoad` (ghi mỗi frame từ `StickmanFighterController`) |
| **Xuyên giáp** 0..1 | `WeaponTraitsFor` → `_armorPierce` | phần đó bỏ qua bể điểm giáp ở `TakeDamage` (dao găm 0.5 · bắn tỉa 0.5 · hoả mai 0.4 · chuỳ 0.35 · nỏ 0.3 · búa 0.25) |
| **Phá thế thủ** ≥1 | `_guardBreak` | bào độ bền khiên/thế thủ ×N (`DamageInfo.GuardDrain`); ≥2 ăn nhiều LƯỢT chặn của nón/khiên trang bị (rìu hai tay 2.5 · chuỳ xích 2 · rìu ném 1.8 · rìu 1.6 · búa 1.5 · chuỳ 1.3) |
| **Chống kỵ** ≥0 | `_mountedDamageBonus` | +N% sát thương khi mục tiêu đang cưỡi (`WeaponBase.ScaleForTarget`): thương 0.6 · giáo/kích 0.5 · đinh ba/đại đao 0.4 · lao 0.3 |
| **Nhiều hình** | `WeaponSkinSet.Entry.variants` | mỗi nhân vật bốc một hình theo `holder.SkinSeed`; chỉ đổi sprite, không đổi số |

Bảng cân nặng (kg) → % tốc độ đi:

| kg | cây | đi |
|---|---|---|
| 0.4 | dao găm, đũa phép | 99% |
| 1.0–1.2 | cung, đao, kiếm, gậy, lao, bom, bình lửa | 96–97% |
| 2.0–2.6 | giáo, trượng, song kiếm, chuỳ xích, nỏ, đao dài | 92–94% |
| 3.0–3.6 | kích, đại kiếm, rìu hai tay, thương, búa, khiên, súng trường | 89–91% |
| 4.5–5.5 | hoả mai, phóng lựu, bắn tỉa | 84–87% |
| 6.0 / 7.5 | súng phun lửa / trung liên | 82% / 78% |

Chênh nhẹ nhất/nặng nhất ≈ 1.27 lần — cố ý nhỏ hơn bộ giáp (bài học 62% → 82%).
Balance Report chấm độ nặng vào tiện ích với trọng số 0.35 (trung liên mất ~8% điểm) và
cộng nhẹ cho sở trường (xuyên giáp ×(1+0.16p) · phá thế thủ ×(1+0.05(g−1)) · chống kỵ
×(1+0.08m) · trạng thái ×1.12) — nhẹ tay vì tình huống của sở trường không phải lúc nào cũng có.

## 7c. Mười cây mới (2026-09-05) — mỗi cây lấp một khoảng trống có tên

| # | Cây | Lớp | Lấp gì | Sở trường | Sở đoản |
|---|---|---|---|---|---|
| 43 | Dao găm | LightMelee | cây nhẹ nhất | xuyên giáp 50%, 0.19 s/nhát | tầm 0.64 ngắn nhất, 0.55 dmg |
| 44 | Đại kiếm | HeavyMelee | kiếm hai tay | hitRadius 0.19 quét cụm, 6 mẫu quét | 3.2 kg, 0.66 s, không khiên |
| 45 | Rìu hai tay | HeavyMelee | phá khiên | guardBreak 2.5 | 0.86 s chậm nhất cận chiến, 3.4 kg |
| 46 | Rìu ném | Thrown | mở màn Viking | guardBreak 1.8 khi ném | 3 cây, tầm 3.6 |
| 47 | Cung kỵ | Bow | kỵ xạ | giương 0.45 s, 0.8 kg, vùng chết 1.0 | tầm 5, 1.15 dmg |
| 48 | Nỏ liên châu | Bow | Trung Hoa | `_automatic`, không tích lực, 15 tên | 0.72 dmg, tầm 5.5, tản 2.5° |
| 49 | Đại đao cán dài | Polearm | Polearm mà chém | quét cụm hitRadius 0.17, chống kỵ 0.4 | vùng chết 45%, 2.9 kg |
| 50 | Bình lửa | Explosive | trung cổ không có gì nổ | nổ 1.2 bán kính 1.6 + CHÁY 4 s × 0.5 | 2 bình, tầm 4, tự thiêu nếu gần |
| 51 | Trung liên | Firearm | súng giữ tuyến | 0.15 s liên thanh, đạn vô hạn, xuyên 1 | 7.5 kg → 78%, tản 4.5°, vùng chết 0.9 |
| 52 | Súng phun lửa | Firearm | súng áp sát | tia xuyên 3 người + CHÁY 3 s × 0.6 | tầm 3, 6 kg |

## Nguồn tham khảo

- [Types of RPG Weapons: Design and Production Guide — Stepico](https://stepico.com/blog/types-of-rpg-weapons/)
  — khung phân loại theo tầm giao chiến / loại sát thương / vai trò chiến đấu
- [RPG Weapons Guide: Types, Design & Lore — Kevuru Games](https://kevurugames.com/blog/a-comprehensive-guide-for-rpg-weapons-different-types-tips-for-creation-examples/)
- [Weapons — d20 SRD](https://www.d20srd.org/srd/equipment/weapons.htm) — bảng vũ khí kinh điển
  (simple/martial/exotic, light/one-handed/two-handed, reach weapon)
- [Combat Design, Mechanics and Systems — Game Design Skills](https://gamedesignskills.com/game-design/combat-design/)
- [Video Game Weapon Stats — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/VideoGameWeaponStats)
  — các trục chỉ số thường dùng và bẫy cân bằng (tốc độ đánh vs sức mạnh)

## Bậc DÂN BINH — tuyến rẻ nhất của trung cổ

Bảng vũ khí trung cổ vốn TOÀN ĐỒ NHÀ NGHỀ: cây rẻ nhất cũng là kiếm thợ rèn. Thiếu hẳn tuyến
dân binh — mà đó lại là quân ĐÔNG NHẤT trong mọi trận trung cổ thật.

| Cây | Lớp | Nét riêng |
|---|---|---|
| **Gậy gộc** | Melee | rẻ nhất bảng, 1 tay, cầm kèm khiên được, KHÔNG có đâm (gậy không có mũi) |
| **Côn dài** | Polearm | 2 tay, ra đòn NHANH nhất nhóm, sát thương thấp nhất; cây duy nhất trong bộ có đâm |
| **Chuỳ xích** | HeavyMelee | đẩy văng mạnh nhất bộ, phá thế thủ nhanh — đổi lại **KHÔNG đỡ được** (`_canGuard = false`: quả cầu lủng lẳng, giơ lên chắn là cuốn vào tay mình) |
| **Ná dây** | Bow | tầm xa rẻ nhất; đạn CHẬM và rơi nhiều (`gravityScale` 1.4 so với 1.0 của mũi tên) nên luôn thua cung |

Cả bốn cây **cố ý dưới mốc chuẩn** (điểm ≈ 3.5 ở mục 2b) — chúng là bậc THẤP NHẤT của thang.
Đừng "buff cho công bằng": muốn dân binh mạnh lên thì **NÂNG CẤP** (`WeaponBase._tier`),
đừng sửa số gốc, vì cấp 1 phải luôn là đúng số trên prefab.

**Đinh ba và lưỡi hái** vốn là ĐỒ NGHỀ NHÀ NÔNG trước khi là vũ khí fantasy, nên hai cây đó
dùng chung prefab cho cả hai thể loại — muốn cây đinh ba của nông dân trông mộc hơn cây của
pháp sư thì làm **SKIN theo nền văn minh** (`Civilizations.md` mục 3b), KHÔNG tạo prefab thứ hai:
hai prefab riêng là hai bộ số riêng, cân bằng lệch lúc nào không biết.

## Tay nghề vũ khí — ai được cầm cây gì

> Code: `WeaponMastery` (một chỗ duy nhất) · chốt chặn ở `WeaponPickup.GiveTo` +
> `StickmanWeaponHolder.EquipIndex`

Thang **5 bậc**, dùng chung cho cả người chơi lẫn NPC:

| Bậc | Tên | Cầm được gì |
|---|---|---|
| 1 | Tân binh | kiếm · rìu · chùy · khiên · gậy gộc |
| 2 | Thạo việc | + cung · giáo · lao · côn (phải canh tầm, bù độ rơi) |
| 3 | Nhà nghề | + búa lớn · súng (chậm/giật, dùng sai là hở sườn) |
| 4 | Cao thủ | + bom · trượng phép (sai một nhịp là tự sát hoặc phí cả bài) |
| 5 | Bậc thầy | + song đao/song kiếm cấp cao |

**YÊU CẦU = NỀN THEO LỚP + THƯỞNG THEO CẤP** — không gõ tay từng cây. Thêm vũ khí mới chỉ
cần chọn `WeaponClass` là nó tự có yêu cầu hợp lý; nâng cấp một cây thì yêu cầu tự tăng
(cấp 3–4 cộng 1 bậc, cấp 5 cộng 2). Song đao/song kiếm cộng thêm 1 vì hai tay hai đường vung.

### Hai nguồn tay nghề, quy về một thang

| Ai | Đọc từ | Quy đổi |
|---|---|---|
| NPC | `StickmanAgent.SmartsLevel` (0..3) | 1→2 · 2→3 · 3→5 · **0 = TẮT hệ cấp → không chặn** |
| Người chơi | `StickmanExperience.Level` | cấp 1 = bậc 1, cứ 2 cấp lên 1 bậc → cấp 9 mở hết |

`smarts = 0` nghĩa là "tắt hệ cấp AI", KHÔNG phải "ngu nhất" — chặn ở đó là cả sân NPC mặc
định đứng tay không. Nhân vật không có cả hai component (bia tập, quái dựng tay) cũng
**không bị chặn**: chặn nhầm thì nó đứng trơ cả trận, tệ hơn nhiều so với cho dùng thoải mái.

### Ba chốt chặn, không nơi nào tự chế luật riêng

1. `WeaponPickup.HandleInRange` — **AI** không thèm nhặt cây quá tay nghề (nhặt là cầm luôn,
   rồi đứng đơ giữa trận)
2. `WeaponPickup.GiveTo` — chốt THẬT SỰ: mọi đường nhặt (bấm nút, AI lượm, script gọi tay)
   đều đi qua đây
3. `StickmanWeaponHolder.EquipIndex` — chặn cả đường loadout/spawn/bấm số đổi vũ khí

⚠ **`EquipIndex` giờ CÓ THỂ trả về false.** Mọi chỗ "cầm vũ khí mặc định" phải gọi
`EquipFirstUsable()` — không thì lính mới được phát trượng phép sẽ đứng TAY KHÔNG cả trận.

Người chơi bị chặn thì ô nhắc nhặt vẫn hiện nhưng đổi chữ thành *"Trượng lửa — Cần Cao thủ,
bạn mới Thạo việc"*. Im lặng không cho nhặt là người chơi tưởng game hỏng.

## Cấp độ chia sức mạnh THEO LỚP

`WeaponTierTable` vốn chẻ `power` thành `damage^0.6 × speed^0.4` cho MỌI lớp. Vấn đề: dùng
chung một tỉ lệ thì lên cấp búa nhanh dần lên còn đao ngắn nặng dần lên — hai cây **cùng tiến
về giữa**, tới cấp cao thì na ná nhau và mất hết cái "chất" của từng lớp.

Nay mỗi lớp một tỉ lệ (`WeaponMastery.DamageShareOf`):

| Lớp | Phần vào sát thương | Nghĩa là |
|---|---|---|
| LightMelee | 0.42 | lên cấp chủ yếu để ra đòn dồn dập hơn |
| Firearm | 0.45 | bắn nhanh hơn, mỗi viên vẫn nhẹ |
| (mặc định) | 0.60 | |
| Bow | 0.70 | mỗi phát nặng hơn, nhịp bắn giữ nguyên |
| Arcane | 0.72 | mana giới hạn số lần niệm nên bắn nhanh cũng vô ích |
| HeavyMelee | 0.78 | mỗi nhát càng chí mạng, KHÔNG nhanh thêm mấy |
| Explosive | 0.80 | |
| Support | 0.85 | |

**DPS vẫn tăng đúng bằng `power` với mọi lớp** (vì `power^a × power^(1−a) = power`), nên cân
bằng ngang giữa các lớp KHÔNG đổi — chỉ có tính cách từng lớp rõ nét hơn khi lên cấp.

## Kỵ binh — tầm với từ trên yên, và cú NGẢ NGƯỜI

> Code: `MountDefinition.minMeleeReach` / `leanReach` · `StickmanMount.ReachesGroundFrom` +
> `NeedsLean` · chốt chặn ở `StickmanWeaponHolder.CanUse` (chung cổng với luật tay nghề)

Ngồi trên yên là người cầm vũ khí cao hơn mặt đất đúng `withersHeight`, nên vũ khí quá ngắn
vung ở ngang đầu bộ binh trở lên — chém cả buổi không trúng ai.

**Nhưng kỵ sĩ còn NGẢ NGƯỜI xuống được.** Bản đầu của luật này so thẳng tầm vũ khí với mốc
và cấm sạch mọi thứ trừ thương — sai, vì kỵ binh thật vẫn chém bộ binh bằng đao/rìu bằng cách
ngả hẳn người qua sườn ngựa mà bổ xuống. Nay:

```
với tới  ⟺  tầm vũ khí + leanReach  ≥  minMeleeReach
phải ngả ⟺  tầm vũ khí              <  minMeleeReach
```

`minMeleeReach = withersHeight × 1.3` (builder tự tính từng con) · `leanReach = 0.28`.

| Cây | Tầm | +ngả | Kết quả |
|---|---|---|---|
| Thương | 0.94 | 1.22 | ngồi thẳng mà đâm |
| Kích | 0.90 | 1.18 | ngồi thẳng |
| Giáo | 0.79 | 1.07 | ngồi thẳng |
| Kiếm | 0.57 | 0.85 | **phải ngả người** |
| Đao | 0.56 | 0.84 | **phải ngả người** |
| Rìu | 0.54 | 0.82 | **phải ngả người** |
| Búa | 0.49 | 0.77 | **phải ngả người** |
| Gậy gộc | 0.48 | 0.76 | quá ngắn |
| Chùy | 0.38 | 0.66 | quá ngắn |

**Cái giá của cây ngắn vẫn còn và tự nhiên:** kỵ sĩ cầm đao phải áp SÁT hơn nhiều so với cầm
thương — tức là chui vào đúng tầm đánh của bộ binh. Không cần phạt thêm gì.

Động tác: `StickmanMount` nghe `WeaponBase.AnyAttacked` (lọc lấy cây của chính mình), nếu
`NeedsLean` thì cộng `leanBodyAngle` (26°) vào góc ngồi trong `leanTime` (0.45s) rồi ngồi
thẳng lại. Đổi góc **qua `StickmanLegWalker.SetMounted`** chứ không ghi thẳng — component đó
là chủ sở hữu duy nhất của góc `body_1`, hai chỗ cùng ghi trong LateUpdate là thân giật lia lịa.

Tầm xa (cung/nỏ/súng/phép) KHÔNG bị chặn — kỵ xạ bắn từ trên lưng vẫn trúng. Khiên cũng không.

Lên yên mà cây đang cầm không với tới thì `SwitchToReachingWeapon()` tự đổi sang cây dùng
được; không có cây nào hợp thì GIỮ NGUYÊN — thà cầm kiếm ngắn còn hơn tay không.

### ⚠ BẪY: nâng kỵ sĩ lên yên là nâng luôn CHÂN ĐẾ VẬT LÝ

Chuỗi cha con của chân đế: `Character → Sprite → Collider → groundCollider`.
Mà `StickmanMount.RaiseRider` nâng chính nhóm **`Sprite`** để kỵ sĩ ngồi lên lưng ngựa.

Hệ quả dây chuyền:

1. `Sprite` lên `_riderLift` → `groundCollider` lên theo (nó là con)
2. Nhân vật thành LƠ LỬNG → trọng lực kéo cả root TỤT XUỐNG đúng `_riderLift`
3. Con ngựa cũng là con của `Sprite` → **chìm theo đúng ngần ấy**

Đo từ prefab (`withersHeight` 0.584, hông cao hơn mặt đất 0.273):
`_riderLift = 0.311`, chân ngựa dài `0.321` → **lún 97% chiều dài chân**. Đúng triệu chứng
"ngựa thấp hơn mặt đường" nhìn thấy trong game.

**Cách chữa:** nâng phần NHÌN bao nhiêu thì HẠ COLLIDER xuống đúng ngần ấy —
`StickmanLocomotion.SetVisualLift(_riderLift)` lúc lên ngựa, `SetVisualLift(0)` lúc xuống.
Vật lý không đổi một ly, chỉ có hình lên yên.

Bài học chung: **đừng nâng một nhóm có chứa collider mà không bù lại.** Trước khi nâng bất
kỳ nhóm nào của rig, hỏi "trong đó có collider vật lý không?" — `Sprite` chứa cả
`groundCollider` lẫn `Skin` lẫn `Bone`, nâng nó là đụng vào vật lý.

### Soi ngựa lún/lơ lửng

Chọn con ngựa trong Hierarchy (gizmo của `StickmanHorse`):
**vạch VÀNG** = vạch móng (`y = 0` không gian ngựa, chỗ móng phải chạm) ·
**vạch LỤC** = đường yên (`withersHeight`) · **chấm LAM** = 4 IK target.

Vạch vàng nằm DƯỚI mặt đất = lỗi ĐẶT VỊ TRÍ (`StickmanMount.BuildMountVisual`), KHÔNG phải
lỗi IK chân — chân chỉ với tới đúng vạch vàng đó thôi. Chỗ hay sai nhất trong phép đặt là
quên vế `StickmanLocomotion.GroundOffset` (gốc transform nằm thấp hơn mặt đất ~0.089,
bằng gần 40% chiều dài chân ngựa nên nhìn ra ngay).
