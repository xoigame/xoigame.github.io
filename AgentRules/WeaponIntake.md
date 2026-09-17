# DÂY CHUYỀN NHẬN VŨ KHÍ TỪ ẢNH (2026-09-07)

User gửi **một tấm ảnh** một cây vũ khí hoặc một cỗ khí tài → nó vào game **chạy được**: có
hình, có số, có bộ đòn, có tiếng, và AI biết cầm/biết vận hành. Đây là luật của quy trình đó.

> Yêu cầu gốc (2026-09-07): *"tôi gửi 1 hình vũ khí mới thì AI thêm nó vào dự án… ngoài vũ khí
> còn khí tài như cây nỏ này… đầy đủ animation và thuật toán. Tự vẽ hình còn thiếu nhé"*.

⚠ **Đọc trước:** [Weapons.md](Weapons.md) (hệ vũ khí), [AssetGeneration.md](AssetGeneration.md)
(luật nguồn art), [ClimbingSiege.md](ClimbingSiege.md) + [SiegeTrain.md](SiegeTrain.md) (nhánh
khí tài). Đường dẫn tính từ gốc repo.

---

## 1. RẼ NHÁNH ĐẦU TIÊN: cây CẦM TAY hay cỗ KHÍ TÀI

Nhìn ảnh và hỏi **một câu duy nhất**: *thứ này có **giá đỡ / bánh xe / chân chống** không?*

| Trên ảnh có | Nó là | Đi đường nào | Lớp code |
|---|---|---|---|
| chỉ có cán / báng, người cầm là dùng được | **VŨ KHÍ** | mục 2 → 12 điểm nối | `MeleeWeapon` · `RangedWeapon` · `ThrowableWeapon` · `MagicWeapon` |
| có giá ba chân, bệ xoay, bánh xe, tay quay tời | **KHÍ TÀI** | mục 5 | `SiegeEngine` (`Fortification`) |

⚠ **ĐỪNG THÊM `SiegeEngineKind` THỨ BẢY KHI ĐÃ CÓ CÁI TRẢ LỜI CÙNG CÂU HỎI.** Sáu loại hiện có
(`Ram` · `Catapult` · `Ballista` · `Tower` · `Cannon` · `FixedBallista`) mỗi loại là **một câu
hỏi chiến thuật**, không phải một cái hình. Ảnh một khẩu nỏ trên giá ba chân = `FixedBallista`
đã có sẵn — việc đúng là **sửa HÌNH cho khớp ảnh**, không phải đẻ ra loại thứ bảy có cùng bộ số.

---

## 2. ĐỌC ẢNH RA SỐ — bảng tra

Mỗi nét trên ảnh phải ra **một con số**, và con số đó phải **nói cùng một điều** với cái nét ấy
(luật *«art không được nói ngược lại cơ chế»*).

| Nhìn thấy trên ảnh | Suy ra | Ghi vào đâu |
|---|---|---|
| cán dài hơn thân người | `WeaponClass.Polearm`, `WeaponHeightRatio` 1.00–1.15 | `StickmanWeaponBuilder.WeaponHeightRatio` |
| hai chỗ tay nắm trên cán | `HandGrip.TwoHanded` + `SetupOffHand(gripX)` | hàm dựng |
| đầu nặng, lưỡi bản to | nhịp chậm (`cooldown` ≥ 0.7), `knockback` ≥ 2.0, nhát 1 là BỔ DỌC | `SetIdentity` + `SetSwing` |
| lưỡi mỏng / ngắn | nhịp nhanh (≤ 0.3), sát thương thấp, `LightMelee` | `SetIdentity` |
| gai / mũi nhọn ở đỉnh | có một nhát `MeleeStyle.Thrust` trong combo | `SetSwing` |
| lưỡi cong móc ngược | một nhát quét từ dưới lên, `guardBreak` > 1 | `SetSwing` + `WeaponTraitsFor` |
| mũi nhọn ba cạnh / đầu búa nhọn | `armorPierce` 0.25–0.5 | `WeaponTraitsFor` |
| tay quay tời / cần lên dây | nạp CHẬM (`cooldown` ≥ 1.8) — cái tời tồn tại vì lực kéo quá lớn | `SetIdentity` |
| thép thay vì gỗ ở bộ phận chịu lực | nặng thêm 1.5–3 kg; `armorPierce` cao | `WeaponWeight` + `WeaponTraitsFor` |
| bàn đạp / chống chân | không vừa đi vừa nạp ⇒ `backoffScale` cao (≥ 1.5) | `SetAiPersonality` |
| ống ngắm / báng tì vai | `_effectiveRange` cao, `_spreadDegrees` thấp | hàm dựng |

**Bốn ràng buộc cân bằng KHÔNG được phá:**

1. **Không one-shot từ ngoài tầm với.** Cây `Bow`/`Firearm`/`Arcane` có `damage ≥ 2.0` là xoá sổ
   cung thủ/lính khiên một phát; `≥ 3.0` là xoá sổ mọi lính không giáp.
   `StickmanWeaponBalance.AppendOneShotTable` réo tên — muốn mạnh thì mạnh bằng
   `armorPierce` / tầm / nhịp, đừng bằng con số `damage`.
2. **Lệch điểm ±20%.** Chạy `Weapons > Bảng cân bằng vũ khí` sau khi dựng; lệch quá thì chỉnh
   `cooldown` trước, `damage` sau.
3. **Sở trường phải HIẾM.** Ba trục (`armorPierce` · `guardBreak` · `mountedDamageBonus`) —
   cây mới KHÔNG được vượt cây đang giữ đỉnh của trục đó trừ khi cố ý soán ngôi và ghi rõ vì sao.
4. **Cây mới phải lấp một KHOẢNG TRỐNG CÓ TÊN.** Không nói được nó trả lời câu hỏi nào mà 65
   cây kia không trả lời được thì đừng thêm — thêm cho đông là làm loãng cả bảng.

---

## 3. MƯỜI HAI ĐIỂM NỐI (bỏ sót điểm nào cũng KHÔNG có lỗi nào báo)

| # | Nối ở đâu | Quên thì hỏng thế nào |
|---|---|---|
| 1 | `Assets/Scripts/Core/Combat/WeaponTypes.cs` — thêm giá trị vào **CUỐI** enum, số = **số lớn nhất đang có + 1** (đếm qua CẢ khối khí tài `TankCannon`/`BombBay`) | chèn GIỮA là mọi `UnitLoadout.weaponIndex` đã lưu lệch một bậc; TRÙNG SỐ thì khai báo enum vẫn hợp lệ (thành bí danh) nhưng mọi `switch` bảng số vỡ CS0152 và prefab bake nhầm cây |
| 2 | `StickmanWeaponBuilder.LeafWeaponPaths` — thêm dòng vào **CUỐI**, đúng thứ tự enum | cây dựng ra đĩa nhưng vĩnh viễn không ai cầm được |
| 3 | `WeaponArtGenerator.AllSpriteNames` + một hàm `Generate<Tên>()` | mục «Vẽ bù art» đỏ; `Visual` không có sprite |
| 4 | Gọi hàm vẽ trong `GenerateAll` **và** `GenerateWeaponsOnly` | có bản gốc mà không có bản theo CẤP |
| 5 | Hàm `Build<Tên>` trong `StickmanIntakeWeaponBuilder.cs` (partial) | không có prefab |
| 6 | Gọi hàm dựng trong `BuildIntakeWeapons` | dựng cả bộ mà thiếu đúng cây này |
| 7 | `StickmanWeaponBuilder.WeaponHeightRatio` | `ApplyWeaponFit` return trong im lặng ⇒ cây to bằng khổ ảnh |
| 8 | `StickmanWeaponBuilder.WeaponWeight` (kg đời thật) | cầm lên đi nhanh như tay không |
| 9 | `StickmanWeaponBuilder.WeaponTraitsFor` (nếu có sở trường) | cây "phá giáp" mà không phá gì cả |
| 10 | `StickmanAudioBuilder.Weapons` — một dòng `WeaponSfx` | cây CÂM giữa trận đông người |
| 11 | `StickmanGenreBuilder.Specs[].weapons` | `GenreWeaponPolicy` lọc mất ⇒ không lính nào rút ra |
| 12 | Luật (file này + [Weapons.md](Weapons.md)) + `Docs/ProjectMap/index.html` mục 17 | hôm sau không ai tra lại được |

**Tuỳ chọn (không bắt buộc):** `StickmanCivilizationBuilder` nếu muốn một nền văn minh có tuyến
lính cầm cây này; `WeaponArt-ChatGPT-Prompt.md` mục 2 nếu muốn đặt tấm art đẹp.

---

## 4. ĐO LẠI — bắt buộc, không được thay bằng lời

```
Tools > Stickman > ★ Bảng điều khiển > Vũ khí > «★ Soát hồ sơ vũ khí (nối đủ 12 điểm chưa)»
```

`StickmanWeaponIntakeCheck` hỏi cho **mọi** `WeaponType`: có trong sổ chưa · prefab đúng loại
chưa · có hình chưa · khai cỡ chưa · khai độ nặng chưa · có tiếng chưa · thuộc thể loại nào chưa.
Nó cũng nằm trong `StickmanDoctor` nên «Khám sức khoẻ dự án» tự chạy.

Sau đó, theo đúng thứ tự:

1. «Art · vũ khí · nhân vật · NPC · trang bị · âm thanh» (sinh art + dựng prefab + gắn tiếng);
2. «★ Soát hồ sơ vũ khí» — phải xanh;
3. «Bảng cân bằng vũ khí» — cây mới không được lệch quá ±20%;
4. Mở scene `Genre_Medieval_Weapons` (hoặc scene thể loại tương ứng) nhìn thật: cỡ cây so với
   người, chỗ hai tay nắm, bộ đòn.

⚠ **Nói "đã thêm" mà chưa bấm 4 bước trên là chưa bàn giao.** Prefab và PNG chỉ sinh ra khi có
người bấm nút trong Unity — sửa code xong thì cây vũ khí **chưa tồn tại trên đĩa**.

---

## 5. NHÁNH KHÍ TÀI (`SiegeEngine`)

Khí tài không đi qua bảng vũ khí. Nó là `Fortification` có máu, có tổ vận hành, và AI đã biết
dùng sẵn qua `AISiegeCrewModule` (ghế `TryReserveSeat` + đếm tổ `UpdateCrew`).

| # | Nối ở đâu |
|---|---|
| 1 | `SiegeEngineKind` — **chỉ khi** không loại nào đang trả lời cùng câu hỏi (xem mục 1) |
| 2 | `StickmanFortBuilder.CreateSiegeEngine` — một `case` khai bộ số riêng; thiếu là nó mượn số của `Ballista` và có `Debug.LogWarning` réo |
| 3 | `StickmanBuildingArt` — `Generate<Tên>()` + tên trong hai bảng `Siege_*` |
| 4 | `SiegeEngine.KindName` + `SiegeEnginePrompt` — chữ hiện trên nút "Dùng …" |
| 5 | `AttachEngineAudio` |
| 6 | Một builder màn nào đó đặt nó xuống (`StickmanMedievalModeBuilder` · `StickmanSiegeTrainBuilder`), không thì cả dự án không map nào có |

**Ba con số bắt buộc đọc ra được từ hình:** `crewNeeded` (mấy người), `fireInterval` (nhịp nã),
`range`. Hình phải nói cùng điều với ba số đó — bánh xe = di động, chân chống = cố định, tời
to = nạp chậm.

---

## 6. ĐÃ CHẠY QUA DÂY CHUYỀN NÀY

| Ảnh gửi | Kết quả | Ghi chú |
|---|---|---|
| rìu cán dài, lưỡi liềm bản to, gai đỉnh | `WeaponType.Pollaxe` = 66 — **Búa rìu cán dài** | cây `Polearm` đầu tiên biết ĐẬP VỠ: phá thế thủ ×2.2 + xuyên giáp 35% + chống kỵ 30% |
| nỏ nặng trên giá, tay quay tời, bàn đạp | `WeaponType.Arbalest` = 67 — **Nỏ giàn** (cầm tay) | xuyên giáp 70% cao nhất dự án; nạp 2.0 s chậm nhất bộ trung cổ |
| ↑ cùng tấm ảnh, vế KHÍ TÀI | `SiegeEngineKind.FixedBallista` **đã có sẵn** — vẽ lại hình cho khớp ảnh | thêm tời nan hoa + bàn đạp + cánh thép; **không** đẻ loại thứ bảy |
