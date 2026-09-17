# Thú vật — quy trình thêm loài, chỉnh đàn, dựng màn

Luật nằm ở [Docs/AgentRules/Animals.md](../AgentRules/Animals.md). File này là **các bước làm**
và **bảng số đang chạy**.

## Bấm gì để có

| Muốn | Bấm |
|---|---|
| Sinh asset thú vật + chim + 4 vật cưỡi mới | `Tools > Stickman > Nâng cao > Thú vật > 1` |
| Dựng màn chăn nuôi | `Tools > Stickman > Nâng cao > Thú vật > 2` (ra `Demo_50_Ranch`) |
| Dựng màn đi săn | `Tools > Stickman > Nâng cao > Thú vật > 3` (ra `Demo_51_Hunt`) |
| Vẽ bù hình còn thiếu | `★ Bảng điều khiển > Vẽ bù art còn thiếu bằng code` |
| **Sinh TIẾNG thú** (6 khoá `Animal/*`) | `Tools > Stickman > Nâng cao > Audio > 5` |

⚠⚠ **Sau khi kéo code mới về (2026-09-09) phải bấm HAI nút**, không chỉ một:

1. `Thú vật > 3` — dựng lại `Demo_51_Hunt`. **Bắt buộc**: `HuntWind` chỉ vào scene khi dựng
   lại, scene cũ vẫn chạy nhưng **không có gió** — và không gì báo thiếu.
2. `Audio > 5` — sinh 6 file tiếng thú. Thiếu thì `PlayKey` **im lặng trả về**: thú câm, không
   lỗi nào báo. Bảng khám «Thú vật không có tiếng» canh chỗ này.

Bảng số thú (`.asset`) thì **không cần bấm gì** — đã ghi sẵn giá trị mà `Thú vật > 1` sẽ ghi ra,
nên hai đường không lệch nhau.

Ba mục cũng nằm trên `★ Bảng điều khiển` (Ctrl+Alt+S): *"Trại CHĂN NUÔI + thú hoang (Demo_50)"* ·
*"Màn ĐI SĂN (Demo_51)"* · *"Vật cưỡi THÚ DỮ + skin có tên"*.

## Bốn phép đo của bảng khám (`StickmanDoctor.Animals.cs`)

| Phép đo | Bắt gì | Mức |
|---|---|---|
| Tốc độ loài vượt bộ chân | `runSpeed > 33.8 × legLength` | ĐỎ khi vượt >15% |
| Vòng cảnh giác nhỏ hơn vòng bỏ chạy | `alertRadius ≤ fleeRadius` | VÀNG |
| Thú săn mồi mất pha rình | `pounceRange ≥ stalkRange` | VÀNG |
| Thú vật không có tiếng | thiếu file `Animal/*.wav` | VÀNG |

⚠ Ba phép đầu dùng **chung công thức với runtime** qua `StickmanHorse.TopBelievableSpeed` —
không chép lại hằng số, kẻo hôm nào ai đó chỉnh `GallopDuty` thì bảng khám chấm theo số cũ và
nói dối một cách rất tự tin.

## Bảng số đang chạy

Cỡ khai theo **tỉ lệ chiều cao nhân vật** (`StickmanRigMetrics.Measure()`, ~0.65 world), không
phải world unit. `legRatio` = chân dài bao nhiêu phần chiều cao lưng; `bodyRatio` = thân dài bao
nhiêu **lần** chiều cao lưng.

### Mười loài không cưỡi được — `StickmanRanchBuilder.Animals`

| Loài | Vai | Chân | withers | legRatio | bodyRatio | Máu | Đi | Chạy |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Bò | Livestock | guốc | 0.68 | 0.55 | 1.82 | 10 | 0.55 | 1.4 |
| Lợn | Livestock | guốc | 0.43 | 0.46 | 1.86 | 7 | 0.62 | 1.7 |
| Cừu | Livestock | guốc | 0.49 | 0.53 | 1.63 | 7 | 0.58 | 1.9 |
| Dê | Livestock | guốc | 0.49 | 0.56 | 1.56 | 6 | 0.70 | 2.2 |
| Gà | Livestock | chim | 0.25 | 0.50 | 1.38 | 3 | 0.75 | 2.0 |
| Nai | Wild | guốc | 0.71 | 0.61 | 1.43 | 8 | 0.70 | 4.2 |
| Thỏ | Wild | vuốt | 0.22 | 0.50 | 1.71 | 2 | 0.60 | **2.4** |
| Cáo | Wild | vuốt | 0.37 | 0.54 | 1.92 | 4 | 0.75 | **3.4** |
| **Sói** | **Predator** | vuốt | 0.52 | 0.56 | 1.82 | 9 | 0.80 | 3.6 |
| **Lợn rừng** | **Predator** | guốc | 0.49 | 0.50 | 1.81 | 12 | 0.70 | 3.2 |

`runSpeed` phải nhanh hơn `walkSpeed` **rõ rệt**, nếu không cảnh con nai "chạy trốn" nhìn y hệt
lúc nó đang gặm cỏ.

⚠⚠ **NHƯNG CÓ TRẦN, VÀ TRẦN ĐI THEO CHIỀU DÀI CHÂN** (2026-09-09):

```
runSpeed tối đa còn nhìn được = 33.8 × legLength     (legLength = withers × legRatio × 0.65)
```

Trên trần thì bốn cái chân quay thành vệt mờ. Thỏ khai 4.6 với chân 0.071 ra **12.4 bước/giây** —
nó chạy **nhanh hơn con nai** trong khi chân ngắn bằng một phần tư, và đó chính là cái người chơi
gọi là *"chạy qua nhanh, không tự nhiên"*. Đã hạ 4.6 → 2.4 và 3.8 → 3.4 (2026-09-09).

| Loài | chân | trần | đang để |
|---|---:|---:|---:|
| Thỏ | 0.071 | 2.41 | 2.4 |
| Gà | 0.081 | 2.74 | 2.0 |
| Lợn | 0.128 | 4.34 | 1.7 |
| Cáo | 0.130 | 4.38 | 3.4 |
| Lợn rừng | 0.159 | 5.37 | 3.2 |
| Cừu | 0.169 | 5.70 | 1.9 |
| Dê | 0.178 | 6.02 | 2.2 |
| Sói | 0.189 | 6.39 | 3.6 |
| Bò | 0.243 | 8.20 | 1.4 |
| Nai | 0.281 | 9.50 | 4.2 |

⚠ **Muốn con vật nhanh hơn thì cho nó CHÂN DÀI HƠN** (`legRatio`), đừng tăng tốc độ suông.
Bảng khám «Tốc độ loài vượt bộ chân» canh chỗ này — xem `Docs/AgentRules/Animals.md` Luật 15.

### Bộ số hành vi — KHÔNG gõ tay, suy từ `withersScale`

`EnsureAnimal` suy tất cả từ `smallness = 1 − withersScale` (0 = con to, 1 = con bé xíu), nên
thêm một loài mới là nó **tự có** nhịp hợp với cỡ của nó:

| Ô | Con to (bò, nai) | Con bé (thỏ, gà) | Nghĩa |
|---|---:|---:|---|
| `alertHold` | 1.5s | 0.55s | đứng nhìn bao lâu trước khi chạy |
| `lookBackTime` | 1.8s | 0.9s | dừng ngoái nhìn sau khi chạy |
| `burstTime` | 1.5s | 0.8s | vọt hết sức được mấy giây |
| `recoverTime` | 7.5s | 4.0s | nghỉ bao lâu thì vọt lại được |
| `jitter` | 0.08 | 0.55 | vừa chạy vừa khựng lại (thỏ) |

⚠ `burstTime` phải **rõ ràng ngắn hơn `fleeTime`** (đang 2.2s). Mốc cũ 2.1 phủ 81% cả lượt chạy
nên đoạn hụt hơi chỉ còn 0.43s — mắt không đọc ra, và cảnh chạy trốn lại thành một mạch đều đều.
Mốc 1.5 cho mọi loài **~1 giây ở nước kiệu** trước khi dừng ngoái nhìn.

Quãng đường một cú giật mình (so với bản cũ nhảy thẳng, giữ đỉnh suốt 2.2s):

| Loài | CŨ | MỚI | |
|---|---:|---:|---|
| Thỏ | 10.12 | **3.95** | −61% (kèm hạ `run` 4.6 → 2.4) |
| Cáo | 8.36 | **5.72** | −32% |
| Sói | 7.92 | **6.24** | −21% |
| Nai | 9.24 | **7.47** | −19% (nai **phải** chạy thoát được — người chơi chạy 3.9) |

Bề ngang khung hình ở `cameraSize 7` là ~24.9 đơn vị, nên con nai đi hết ~30% màn hình rồi
**dừng lại ngoái nhìn**, thay vì 37% rồi tắt phụt về gặm cỏ.

Ba ô còn lại đi theo **vai**: `scentSensitivity` = 0.6 (Wild) · 0.45 (Predator) · 0 (Livestock);
`woundedThreshold`/`bleedPerSecond` chỉ bật cho loài có `gameValue > 0`; `huntsWildlife` chỉ bật
cho Predator.

### Bốn loài chim — `StickmanRanchBuilder.Birds`

| Loài | Sải cánh | Nhịp vỗ/giây | Tốc độ | Cao | Đậu? |
|---|---:|---:|---:|---:|:--:|
| Chim sẻ | 0.20 | 8.0 | 3.4 | 2.6 | có |
| Bồ câu | 0.28 | 5.5 | 3.0 | 3.2 | có |
| Quạ | 0.38 | 3.6 | 2.8 | 4.0 | có |
| Đại bàng | 0.62 | 2.2 | 4.2 | 6.5 | **không** |

Đại bàng không đậu: cho một con chim săn to bằng nửa người đáp xuống cạnh bộ binh giữa trận thì
nhìn sai hẳn. Nhịp vỗ là dấu hiệu số một để đọc ra chim to hay bé — hơn cả kích thước.

### Bốn vật cưỡi mới — `StickmanBeastMountBuilder.Beasts`

Mỗi con phải trả lời được *"vì sao chọn nó thay vì ngựa"*; nếu không nó chỉ là ngựa đổi hình.

| Con | withers | Máu | damageShare | Tốc độ | Vai trò |
|---|---:|---:|---:|---:|---|
| Sói chiến | 0.77 | 7 | 0.32 | 1.78 | nhanh nhất, mỏng nhất — đánh du kích |
| Hổ chiến | 0.80 | 14 | 0.52 | 1.58 | dày nhất, hứng đòn thay nhiều nhất |
| Hươu lớn | 0.86 | 9 | 0.36 | 1.66 | cao nhất → tầm với từ yên rộng nhất |
| Đà điểu | 0.89 | 5 | 0.22 | 1.72 | rẻ, nhẹ, gần như không hứng đòn thay |

Ngựa chiến để so: tốc độ 1.55. `minMeleeReach` **tự tính** = `withersHeight × 1.3`, không gõ tay.

### Cấp vật cưỡi (áp cho cả 12 con)

    máu    = maxHealth   + healthPerTier × cấp        (healthPerTier = 28% máu gốc)
    tốc độ = speedMult   + 0.045 × cấp
    hứng   = damageShare + 0.04  × cấp                (kẹp trần 0.9)

Cấp 0–5, cùng thang với nón/giáp (`GearTiers`). Tấm giáp ngựa vẫn là thứ **nhìn thấy**; ba công
thức trên là thứ khiến cái nhìn thấy đó **đúng**.

### Skin có tên

Ô `MountDefinition.skins`, mở theo `unlockTier`. Ví dụ: Ngựa Nâu (0) → Bạch Mã (2) → Ô Truy (4);
Hổ Vàng (0) → Bạch Hổ (3) → Hắc Hổ (5); Voi Xám (0) → Bạch Tượng (5).

Skin **không cộng chỉ số** — xem Luật 8 ở AgentRules.

## Thêm MỘT loài bốn chân — 3 bước

1. **Vẽ thân** — thêm `GenerateXxxBody()` vào `StickmanAnimalArt` và một dòng vào
   `AnimalSpriteNames` (thiếu dòng này thì bảng «Vẽ bù art» không bao giờ báo đỏ dù tấm không tồn
   tại). Chân thì dùng lại một trong ba bộ có sẵn (guốc / vuốt / chim).
2. **Thêm một dòng** vào bảng `Animals` của `StickmanRanchBuilder`.
3. **Bấm tool** `Thú vật > 1`, rồi `Vẽ bù art`.

Không phải làm animation — rig `StickmanHorse` lo hết (xem Luật 1).

### Kiểm tỉ lệ TRƯỚC khi chốt số

Nhìn từng sprite rời **không** thấy được lỗi tỉ lệ. Lắp thử bằng
`.claude/skills/stickman-assets/scripts/canvas.py`, theo đúng công thức rig:

- chân trước ở `+0.17 × bodyLength`, chân sau ở `−0.15 × bodyLength` so với pivot thân;
- khớp vai/hông ở độ cao `legLength`; mỗi khúc chân dài `legLength × 0.62`;
- sprite **chân** co theo **CHIỀU CAO**, sprite **thân** co theo **BỀ NGANG**;
- dựng cạnh một hình người cao 0.65 để so.

Bản đầu của bộ này có thân đẹp mà lắp vào ra con hổ đứng trên bốn sợi dây thép — chỉ lộ ra ở bước
lắp thử.

## Đặt art đẹp thay bản vẽ bù

28 tấm ở `Assets/Sprites/Animals/` là **art vẽ bù bằng code**. Đặt ChatGPT theo
[WeaponArt-ChatGPT-Prompt.md](WeaponArt-ChatGPT-Prompt.md), yêu cầu:

- nền TRONG SUỐT, nhìn NGANG, **mõm quay +X**;
- **THANG XÁM** (màu lông do `SetCoat` tint lúc chạy — vẽ màu thật là cả bảng `coatColors` thành
  vô nghĩa); vệt trắng phải là trắng **thuần 255**;
- thân **không có chân**; pivot thân ở **giữa lưng**, pivot chân ở **đầu trên**;
- cánh chim: **pivot mép phải**, cánh xoè về **−X** (xem Luật 6 — vẽ ngược là con chim có chong
  chóng trước mặt).

Thả PNG đè lên là xong; `StickmanArtSource` tự chừa tấm đó ra vĩnh viễn.

## Chuồng trong mode kinh tế doanh trại

`CampBuildKind.Pasture` («Chuồng gia súc») nay dựng **đàn thật** nếu
`EconomyProfile.pastureSpecies` có khai loài — `StickmanWarCampBuilder` đã trỏ sẵn vào
`Animal_Cow`. Để trống thì chuồng giữ nguyên bản cũ (nguồn lúa gần như vô hạn), nên scene cũ trên
đĩa không đổi hành vi.

## Vòng chơi của `Demo_51_Hunt`

    đọc hướng GIÓ → vòng sang phía ĐẦU GIÓ → NGỒI THỤP bò tới
                                                    ↓
                             con mồi NGẨNG ĐẦU cảnh giác → ĐỨNG IM, nó bình tĩnh lại
                                                    ↓
                                       vào tầm cây đang cầm → bắn
                                                    ↓
              hạ gọn: +điểm ×1.5   ·   bị thương: nó chạy chậm, rỏ máu → ĐUỔI THEO
                                                    ↓
                                     trượt: −1 mũi → hết tên thì đi nhặt lại

⚠ **Bốn tín hiệu trên bảng trái**, và bỏ cái nào thì cơ chế tương ứng thành vô hình: số tên còn
lại · hướng gió + bạn đang đầu hay cuối gió · số con đang bị thương · hệ số thưởng hạ gọn.

### Điểm săn từng loài

| Loài | Điểm | Vì sao |
|---|---:|---|
| Thỏ | 2 | nhỏ, phát hiện muộn (3.2); khó bắn vì **giật cục** (`jitter` 0.55), không vì nhanh |
| Cáo | 4 | nhanh, đi xa |
| Nai | 6 | phát hiện từ 4.5 và chạy 4.2 — phải rình thật |
| Lợn rừng | 7 | **lao vào húc** |
| Sói | 8 | phát hiện từ 6.5 và **lao vào cắn** |

Gia súc (bò/lợn/cừu/dê/gà) để `gameValue = 0` — trong chuồng người ta không phải chiến lợi phẩm.

### Ba tầm vũ khí

| Cây | Tầm | Vai trò |
|---|---|---|
| Cung | xa | phải tích lực; bắn được từ ngoài tầm phát hiện của thỏ, chưa đủ cho nai |
| Lao | trung | sát thương cao, phải bò gần hơn |
| Rìu ném | gần | hạ một phát, nhưng vào tầm đó thì con mồi thường đã chạy |

Ba tầm khác nhau là chủ ý: có ba tầm thì **cự ly tiếp cận trở thành một quyết định**. Phát mỗi
cung thì mọi con mồi đều giải bằng cùng một cách.

### Chỉnh khó/dễ

| Muốn | Sửa |
|---|---|
| Dễ hơn | `HuntMode._quiver` ↑ · `_pointGoal` ↓ · `_timeLimit` ↑ |
| Rình khó hơn | `AnimalDefinition.fleeRadius` ↑ (bảng `Animals`, cột `flee`) |
| Rình dễ hơn | hệ số ngồi thụp trong `WildAnimal.Noticeability` ↓ (đang 0.35) |
| Gió khắc nghiệt hơn | `StickmanHuntBuilder.BuildWind` → `strength` ↑ (đang 0.7) |
| Gió đổi hướng dồn dập hơn | cùng chỗ → `shiftInterval` ↓ (đang 26s) |
| Con mồi đứng cảnh giác lâu hơn (dễ bắn) | `alertHold` trong `EnsureAnimal` ↑ |
| Con mồi chạy xa hơn | `burstTime` ↑ / `trotFraction` ↑ |
| Thưởng hạ gọn nhiều/ít hơn | `HuntMode._cleanKillBonus` (đang ×1.5) |
| Đổi điểm một loài | cột `game` trong bảng `Animals` của `StickmanRanchBuilder` |

⚠ `_quiver` là con số cân bằng quan trọng nhất: đặt rộng rãi thì van "tên có hạn" biến mất và
người chơi không bao giờ phải rình — cứ đứng xa nã cho tới khi trúng. Mốc hiện tại ~1.6 mũi cho
mỗi điểm chỉ tiêu (48 mũi / 30 điểm).

## Vòng chơi của `Demo_50_Ranch`

    cho ăn → con non LỚN → con lớn cho SỮA vào kho chuồng
                              ↓
                     nông dân GẶT → vàng
                              ↓
              đủ 2 con lớn + còn cỏ + còn chỗ → đàn TỰ ĐẺ

Đói thì **ngừng cả ba**: không lớn, không sữa, không đẻ; đói lâu thì chết. Sói từ rìa phải bản đồ
vào ăn thịt đàn. Thắng khi đủ chỉ tiêu **sản lượng**; thua khi mất sạch đàn hoặc hết giờ.
