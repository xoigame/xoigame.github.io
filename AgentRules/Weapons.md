## Hệ thống vũ khí (Assets/Scripts/Combat/)

### ⚠⚠ CẤP VẬT LIỆU 0–5 · KIỂU RÈN · TÊN LỬA · ĐIỂM NỐI ROSTER (2026-09-07, user: *"mỗi loại vũ khí có nhiều cấp độ theo nguyên liệu từ thô sơ đến vàng; mỗi loại có nhiều skin, hiện ngẫu nhiên; vũ khí mới thêm vào cũng phải bỏ vào game; cung nỏ bắn nhà được nhưng phải là cung lửa"*)

Bốn việc, mỗi việc một nguồn sự thật:

| Trục | Nguồn sự thật | Chạy ở đâu |
|---|---|---|
| **CẤP = VẬT LIỆU** (0–5) | `WeaponTierLook.For` (Combat, runtime) | `WeaponArtGenerator.GenerateTierVariants` VẼ ra `Sprites/Weapons/Tier0..Tier5`; `StickmanWeaponTierArt.WireAll` đổ vào `WeaponBase._tierSprites`; `WeaponSkinSet.SpriteTierFor` tra lúc chạy |
| **KIỂU RÈN** (0–4) | `WeaponForgeStyle.Styles` (Combat, runtime) | `WeaponArtGenerator.GenerateForgeVariants` (file `StickmanWeaponForgeArt.cs`) đóng hoa văn trong `Save`; `StickmanWeaponSkinVariantBuilder` quét thành `Resources/WeaponSkins_Default`; mỗi lính bốc theo `holder.SkinSeed` |
| **TÊN LỬA** | `StickmanWeaponBuilder.CanLightArrows` (bảng theo LOẠI) | `RangedWeapon.SetArrowsLit` gắn `StatusEffectType.Burn` vào `ProjectileLaunch.status`; `AIFireArrowModule` tự châm khi mục tiêu `IFlammable` |
| **ĐIỂM NỐI ROSTER** | `StickmanWeaponRosterCheck` | phép đo: cây nào trong `LeafWeaponPaths` mà KHÔNG roster nào phát |

**Sáu bậc vật liệu** — đá & xương → gỗ cứng → đồng → **sắt** → thép tinh luyện → vàng huyền thoại. Cấp 3 (Sắt) là `WeaponArtGenerator.BaseTier`, tức mốc cân bằng và cũng là bộ sprite GỐC: đổi bảng vật liệu KHÔNG được đụng cấp 3, không thì mọi tấm art gốc đổi theo.

⚠⚠ **TRỤC VẬT LIỆU LÀ THỨ ĐÃ BỊ GỠ NGÀY 2026-09-02 RỒI QUAY LẠI — ĐỌC KỸ KHÁC BIỆT.** Bản bị gỡ **nhân `SpriteRenderer.color`** của cả cây theo màu cấp: cán gỗ, lưỡi thép, dây da đều hoá cùng một màu, và mắt đọc ra "cây kiếm bị nhuộm" chứ không ra "cây kiếm tốt hơn". Thứ quay lại là **bộ ART RIÊNG cho từng cấp** — bốn màu `Steel`/`DarkSteel`/`Wood`/`accent` được đọc từ `WeaponTierLook` NGAY LÚC VẼ, nên mỗi bộ phận đổi đúng chất của nó. **Đừng dựng lại đường nhuộm màu**; nếu thấy code nhân `renderer.color` theo cấp thì đó là hồi quy.

⚠⚠ **`WeaponTierLook.Count = 5` ĐÃ BỊ XOÁ TÊN, KHÔNG PHẢI ĐỔI GIÁ TRỊ.** Hằng số đó vừa mang nghĩa "cấp cao nhất" (`for tier = 1; tier <= Count`) vừa mang nghĩa "số bậc", và hai nghĩa lệch nhau đúng 1 từ ngày `GearTiers` chạy 0–5. Hậu quả đo được: **`Tier0/` chưa bao giờ được sinh**, nên cấp 0 (thô sơ) tra không thấy art rồi rơi về tấm gốc — tức cấp 0 và cấp 3 hiện **cùng một cây sắt**, một bậc của hệ cấp biến mất khỏi trận đánh mà không lỗi nào báo. Nay hỏi cấp cao nhất → `GearTiers.Max`, hỏi số bậc → `GearTiers.Count`.

⚠ **NÓN/GIÁP BẮT ĐẦU TỪ CẤP 1, VŨ KHÍ TỪ CẤP 0.** `GearTiers.WearsGear(0)` = false (đầu trần, thân trần) nhưng vũ khí cấp 0 VẪN CÓ đồ (rìu đá). `CivilizationArtGenerator.GenerateGearTiers` vì vậy chạy `1..Max` còn `GenerateWeaponSkinTiers` chạy `Min..Max` — hai vòng lặp KHÁC NHAU trong cùng một file, đừng "dọn cho đều".

**Năm kiểu rèn** — Trơn (bản gốc) · Rãnh máu · Quấn dây · Răng cưa · Khảm. Kiểu rèn KHÔNG đổi sức mạnh và KHÔNG đổi cỡ: nó chỉ đổi hoa văn BÊN TRONG khối + độ phình/thót của phần lưỡi, còn chiều dài · pivot · `Tip` giữ nguyên tuyệt đối, nên bốc ngẫu nhiên mà cân bằng không xê dịch một số nào. Sinh đủ **5 kiểu × 6 cấp = 30 hình mỗi cây**.

⚠⚠ **KIỂU RÈN PHẢI CÓ BẢN THEO CẤP, KHÔNG CHỈ MỘT TẤM.** `WeaponSkinSet.SpriteTierFor` cho **biến thể thắng cấp** — bốc trúng biến thể là dùng nguyên tấm đó ở MỌI cấp. Luật ấy đúng khi biến thể là art NGƯỜI vẽ (chỉ có một tấm), nhưng bộ code-gen mà cũng một tấm thì lính nào bốc trúng kiểu khác bản gốc sẽ **mất sạch hệ cấp**: lên cấp 5 vẫn cầm cây sắt, không lỗi nào báo. Vì vậy có `WeaponSkinSet.Entry.variantTiers` (mảng lồng phải bọc trong lớp `[Serializable]` — Unity không serialize `Sprite[][]`), art nằm ở `Sprites/Weapons/Variants/TierN/<Loại>_<n>.png`.

⚠ **NHẬN DIỆN BỘ PHẬN BẰNG MÀU, KHÔNG BẰNG TOẠ ĐỘ** (`StickmanWeaponForgeArt`): mỗi cây một hình dạng nên không công thức toạ độ nào đúng cho cả 53 cây — nhưng mọi hàm vẽ đều tô lưỡi bằng `Steel`, phần tối bằng `DarkSteel`, cán bằng `Wood`. Hỏi "pixel này có phải kim loại không" thì trả lời được cho mọi cây, kể cả quả bom (không có lưỡi ⇒ không có gì xảy ra).

⚠ **HOA VĂN PHẢI TỰ ĐỦ TƯƠNG PHẢN, ĐỪNG MƯỢN MÀU CỦA CẤP.** Ba lỗi đã bắt được bằng cách RENDER RA NHÌN (bản mô phỏng Python của `PixelCanvas`, xem `AssetGeneration.md`), không lỗi nào lộ ra khi đọc code:
* rãnh máu tô đúng `metalDark` → **biến mất**, vì phần lớn hàm vẽ đã có sẵn một đường SỐNG bằng `metalDark` chạy đúng giữa lưỡi ⇒ phải sẫm thêm 40% về phía đen;
* đinh tán tô đúng `accent` → **tàng hình ở cấp 0 và 1**, vì ở hai cấp đó `accent` gần trùng `metal` ⇒ phải có vành sẫm quanh chấm;
* vệt "mài sáng" tô đúng hàng mép → **bị `Polish` vẽ viền đè mất** ⇒ phải bắt đầu từ `bottom - 1`.

⚠ **ĐINH TÁN và HẠT KHẢM KHÁC NHAU BẰNG MẬT ĐỘ, không bằng cường độ**: dày+nhỏ (11 px, lõi 2×2) là đinh thợ đóng, thưa+to (20 px, lõi 3×3) là ngọc đặt riêng. Dùng chung một cỡ thì hai kiểu ra hai cây gần y hệt — mà cả hai đều "đúng", nên chỉ nhìn bản render mới thấy.

**TÊN LỬA / NỎ LỬA** — cửa hẹp DUY NHẤT đi xuyên luật *"công trình miễn sát thương tầm xa"*:
* `IFlammable` (Core) là một câu hỏi **RIÊNG**, không gộp vào `IRangedDamageImmune`. Hai câu khác nhau và đáp án không trùng: *"mũi tên có TRỪ MÁU nó không"* → nhà · tường · tháp · cổng đều KHÔNG (giữ nguyên, không thì một tuyến cung hạ được thành mà chẳng cần máy công thành); *"nó có BẮT LỬA không"* → nhà tranh và cổng gỗ CÓ, tường đá KHÔNG.
* Mũi tên lửa **không trừ máu — nó CHÂM LỬA**, và lửa trừ máu theo ĐỒNG HỒ của chính công trình. Bắn dồn 20 mũi cũng chỉ **GIA HẠN** một đám cháy (`Mathf.Max`, không `+=`), nên "đốt làng" là chiến thuật thật mà cân bằng công thành không xê dịch.
* `Fortification` quyết cháy được hay không theo **LOẠI**: rào chắn và thang công thành CHÁY; tường · tháp là ĐÁ nên không; **CỔNG cũng KHÔNG** dù làm bằng gỗ — nó là MỤC TIÊU của trận công thành, cho cháy từ xa là một tuyến cung thắng trọn màn (xem [Fortifications.md](Fortifications.md)). Mặc định nằm trong CODE (`FlammableRule.Auto`) chứ không bắt mỗi builder khai tay — khai tay thì builder nào quên là công trình đó không bao giờ cháy, mà nhìn vào không phân biệt được với "cố ý làm bằng đá".
* `ProjectileController.IsIncendiary` **SUY RA** từ `_statusRuntime` có `Burn`, không thêm một cờ riêng: hai nguồn sự thật cho một câu hỏi thì chúng sẽ lệch ngay lần sửa kế tiếp.
* `CanIgnite` phải hỏi TRƯỚC `Ignite`: tường đá trả false, và lúc đó mũi tên lửa phải cư xử **y hệt mũi tên thường**. Cho nó bốc hơi ở chân tường mà tường chẳng sao thì người chơi đọc ra là LỖI, không đọc ra luật.
* Cây nào châm được lửa khai ở MỘT chỗ — `StickmanWeaponBuilder.CanLightArrows`, gọi trong `SetIdentity` (nút thắt mọi cây đi qua). Cung · trường cung · cung kỵ · nỏ · nỏ liên châu · nỏ giàn. **Súng thì KHÔNG**: mở cho súng là mọi tay súng hiện đại đốt được nhà từ 14 đơn vị, tức xoá lý do tồn tại của súng phun lửa · Molotov · bình lửa.

⚠⚠ **ĐIỂM NỐI CUỐI: DỰNG XONG ≠ CÓ AI CẦM.** `Pollaxe` và `Arbalest` đi trọn dây chuyền nhận vũ khí — enum, `LeafWeaponPaths`, prefab, art 6 cấp, tiếng, bộ lọc thể loại — và `StickmanWeaponIntakeCheck` báo **xanh cả 6 câu**. Nhưng không `CivSpec` nào phát chúng cho ai, nên chúng **chưa từng ra trận một lần**. Mọi mắt xích đều đúng, chỉ là cái xích không nối vào đâu. Cùng bệnh, đo được cùng lúc: búa ném (nền Viking hứa trong chính ghi chú của nó), **trượng lửa** (cây phép chủ lực của cả thể loại Fantasy), và trọn tuyến dân binh (gậy gộc · côn dài · chuỳ xích · ná dây).

⚠ Phép đo là `StickmanWeaponRosterCheck` (Doctor + nút riêng). Nó hỏi **đủ ba nguồn phát**: 15 nền trung cổ (`Specs`) · 4 lực lượng hiện đại (`ModernSpecs`) · 3 phe fantasy (`FantasyCivilizationArena.Factions`). Thiếu nguồn nào là bảng réo nhầm 20 dòng — mà bảng đã bị học cách bỏ qua thì lần sau nó đỏ thật cũng không ai nhìn. Cây CỐ Ý không thuộc roster nào khai vào `RosterlessByDesign` **kèm lý do**.

⚠ **Ô trong `LeafWeaponPaths` ≠ giá trị enum.** Hai thang đã tách nhau (Sword enum 2 mà ô 1; Pollaxe enum 66 mà ô 65) vì enum còn chứa khí tài chỉ gắn trên xe. Hằng số `W*` trong `StickmanCivilizationBuilder` là **VỊ TRÍ TRONG SỔ**; chép giá trị enum vào đó là lính cầm nhầm cây, và không lỗi nào báo vì ô nào cũng có một cây hợp lệ.

**Cần chạy lại tool** sau khi đổi `WeaponTierLook` hoặc `WeaponForgeStyle`: Bảng điều khiển › Vũ khí › «★ Sinh sprite theo KIỂU RÈN» → «Quét BIẾN THỂ skin vũ khí» → «★ Gắn bộ hình theo CẤP vào prefab», rồi «Bảng cân bằng vũ khí» nếu có đụng số.


### ⚠⚠ ĐỘ NẶNG · SỞ TRƯỜNG · NHIỀU HÌNH · 10 CÂY MỚI (2026-09-05, user: *"trung cổ còn thiếu vũ khí nào; độ nặng · tốc độ đánh · cầm nặng đi chậm · một loại nhiều skin · sở trường sở đoản; áp cho cả hiện đại"*)

Bốn trục mới, mỗi trục MỘT nguồn sự thật, đều áp ở nút thắt `SaveVariant` nên 53 cây cùng đi qua:

| Trục | Nguồn sự thật | Chạy ở đâu |
|---|---|---|
| **ĐỘ NẶNG** (kg đời thật) | `StickmanWeaponBuilder.WeaponWeight` → `WeaponBase._weight` | `WeaponHandling.MoveScaleFor` (Core): mỗi kg lấy 3% tốc độ, đáy 72%. `StickmanFighterController.ApplyAttackSlowdown` ghi `Locomotion.SetWeaponLoad` **MỖI FRAME** — ô thứ tám, riêng |
| **SỞ TRƯỜNG** | `StickmanWeaponBuilder.WeaponTraitsFor` → `_armorPierce` · `_guardBreak` · `_mountedDamageBonus` | đi theo `DamageInfo.armorPierce/guardBreak` (Core) + `ProjectileLaunch`; xuyên giáp tách ở `StickmanController.TakeDamage` TRƯỚC khi hỏi giáp; phá thế thủ bào `GuardDrain` ở `MeleeWeapon`/`ShieldWeapon.TryBlock` + ăn nhiều LƯỢT ở `StickmanEquipment.ConsumeBlock`; chống kỵ ở `WeaponBase.ScaleForTarget` (cả cận chiến lẫn đạn) |
| **NHIỀU HÌNH** | `WeaponSkinSet.Entry.variants` | nền: `Weapon_Sword_2.png` cạnh tấm gốc trong folder nền · mặc định: `Sprites/Weapons/Variants/Sword_2.png` → `Resources/WeaponSkins_Default` (`StickmanWeaponSkinVariantBuilder`, tự chạy trong bước dựng vũ khí) → sổ Core `WeaponSkinRegistry.Default` → `StickmanWeaponHolder.ApplyDefaultSkins`. Hạt giống = `holder.SkinSeed + type×31` — theo NHÂN VẬT, không `Random` |
| **TỐC ĐỘ ĐÁNH** | đã có: `_cooldown` + windup/strike/recover từng nhát + `TierData.SpeedScaleFor` | không thêm trục — dải mới trải từ dao găm 0.19 s tới rìu hai tay 0.86 s |

**Mười cây mới** (`StickmanArsenalWeaponBuilder`, chỉ số 43..52 — bảng sở trường/sở đoản ở đầu file): trung cổ **dao găm** (xuyên giáp 50%, nhẹ nhất) · **đại kiếm** (2 tay, quét rộng) · **rìu hai tay** (phá thế thủ ×2.5 — khiên trang bị 2 lượt bay trong MỘT nhát) · **rìu ném** · **cung kỵ** (giương 0.45 s, tầm 5) · **nỏ liên châu** (`_automatic`, không tích lực) · **đại đao cán dài** (Polearm mà CHÉM) · **bình lửa** (thứ NỔ duy nhất của trung cổ, vụ nổ mang CHÁY qua `Explosion.Detonate(status:)`) — hiện đại **trung liên** (7.5 kg → 78% tốc độ, đạn vô hạn) · **súng phun lửa** (tia `Proj_Flame` sống 0.34 s xuyên 3 người + cháy) · dao chiến = chính cây `Dagger`.

⚠ **`DamageInfo.armorPierce/guardBreak` để `default` = 0 CÓ CHỦ Ý** — mọi chỗ tạo `DamageInfo` tay (nổ, cháy/độc, đòn cũ) giữ nguyên hành vi; chỗ đọc quy 0 về "thường" (`GuardDrain`, `PiercingAmount`). Thêm trục sở trường mới thì theo đúng khuôn: field mặc định trung tính + property quy đổi.
⚠ **Đạn về pool phải XOÁ ba số sở trường** (`ResetProjectile`) — cùng bẫy `_statusRuntime`: viên đạn thường lấy từ pool vẫn mang xuyên giáp của phát trước.
⚠ **Sở trường phải HIẾM** — `WeaponTraitsFor` chỉ có 16/53 cây, mỗi cây một trục. Cho cả bộ xuyên giáp là giáp mất nghĩa. Đổi bảng này là đổi sát thương THỰC TẾ ⇒ chạy lại Balance Report (bảng nay có cột **Nặng · Đi%** và chấm sở trường vào tiện ích).
⚠ **Cây chưa khai cân nặng = 0 = Doctor ĐỎ** («Vũ khí chưa khai ĐỘ NẶNG»). Đừng cho rơi về mặc định trong im lặng — đúng bẫy `WeaponHeightRatio` đã dính với sáu khẩu súng.
⚠ **Rìu ném KHÔNG có nhánh "hết rìu thì cầm cận chiến"** — `ThrowableWeapon` không có cơ chế đó; hết rìu = tay không → `AIWeaponScavengeModule`. Cái giá "chỉ 3 cây" là cố ý.
⚠ **Biến thể THẮNG cấp** (`WeaponSkinSet.SpriteTierFor`): tấm biến thể là cây KHÁC HÌNH do người vẽ, chưa có bản theo cấp — chọn trúng biến thể thì dùng nguyên tấm ở mọi cấp. Muốn biến thể có cấp thì đặt art `TierN/Weapon_Sword_2.png` và nối `LoadTierSkins` cho biến thể — chưa làm.
⚠ **Roster đã đổi theo**: Europe/Crusader thêm đại kiếm · Viking rìu hai tay + rìu ném (thay búa ném) · China nỏ liên châu thật + đại đao Quan · Japan naginata = `Glaive` (trước mượn kích) · Mông Cổ kỵ xạ cầm cung kỵ · Byzantine "Lửa Hy Lạp" (bình lửa, thay ném đá) · Rus rìu hai tay · Hải tặc dao găm · hiện đại: Liên quân trung liên · Đột kích phun lửa · Dân quân dao chiến.
⚠ **PHẢI BẤM LẠI TOOL** — số nằm trong prefab/asset đã bake: `★ Bảng điều khiển` → *Art · vũ khí · nhân vật · NPC · trang bị · âm thanh* (VÀNG — `StickmanWeaponBuilder.cs` + hai file mới nằm trong `extraSources`) → *★ Vẽ bù art còn thiếu* (ĐỎ — 11 tấm mới trong `AllSpriteNames`/`ProjectileSpriteNames`) → *★ 15 nền văn minh* → *Thể loại* (bộ lọc mới) → scene hiện đại. Art đẹp của 10 cây: đặt ChatGPT theo `WeaponArt-ChatGPT-Prompt.md` §2 (đã thêm dòng) và §2c (biến thể).

**Bộ FANTASY** gồm hai nhánh: **pháp sư** (`MagicWeapon` — trượng lửa/băng/sét/thánh/tử linh +
đũa phép; có mana, niệm chú bị cắt khi trúng đòn, `CasterCombatStrategy` lo lối đánh) và
**cận chiến quái dị** (`MeleeWeapon` như bộ trung cổ, chỉ khác LỚP + bộ đòn):
đinh ba `Trident` (Polearm — tự biết chúc giáo chống kỵ) · lưỡi hái `Scythe` (HeavyMelee,
quét cụm rộng nhất) · kiếm rune `Runeblade` (HeavyMelee 2 tay) · vuốt quỷ `Claws`
(LightMelee + DualWield, nhanh nhất bộ). **Không có code AI riêng cho nhánh cận chiến này** —
chọn đúng `WeaponClass` là mọi cơ chế sẵn có tự áp (chống kỵ, đổi vũ khí khi địch rùa,
áp sát của song thủ).

Nhân vật cầm được **20 cây**: cung, súng, kiếm, giáo, lao, búa ném, bom + bộ trung cổ
(đao, đao ngắn, đao dài, song đao, song kiếm, thương, búa cận chiến, khiên cầm tay, lựu đạn,
rìu chiến, chùy, nỏ, kích).

**VŨ KHÍ DỰ PHÒNG — NẮM ĐẤM** (`Weapon_Fists`, `WeaponBase._isFallback`): trước đây
`holder.Attack` trả về false ngay khi `Current == null` nên **tay không KHÔNG đánh được gì**.
Nắm đấm làm thành một `MeleeWeapon` bình thường (không sprite, `LightMelee`, damage 0.35,
tầm ngắn nhất bộ, combo 2 nhát đấm trái/phải qua `Swing.useOffHand`) nên hitbox · combo ·
cooldown · pose · effect · âm thanh · cân bằng · cấp độ đều dùng lại nguyên bộ — đúng bài học
của bộ fantasy: chọn đúng LỚP là mọi cơ chế tự áp, đừng viết nhánh "đánh tay không" riêng.
Cờ `IsFallback` được đọc ở **ba chỗ**, thiếu chỗ nào cũng hỏng: `DropCurrentWeapon` (không
rớt xuống đất — nắm đấm nằm lăn lóc chờ nhặt là vô lý) · `AIWeaponScavengeModule` (vẫn coi là
TAY KHÔNG nên tiếp tục đi tìm vũ khí thật) · `WeaponPickup.HandleInRange` (`emptyHanded` tính
cả nắm đấm → vồ lấy cây đầu tiên gặp, không lắc xúc xắc).
⚠ Muốn ai đó CHỈ có nắm đấm thì phải **RÚT SẠCH KHO** (`_sceneWeapons` = 0 + `_weaponPrefabs`
= [Fists]), KHÔNG chỉ đổi `_startIndex` — prefab NPC mang sẵn cả bộ vũ khí, để nguyên là
module `AIWeaponSwap` rút kiếm ra ngay nhịp đầu. Xem `StickmanMedievalModeBuilder.MakePrisoner`.

⚠⚠ **"TRUNG CỔ MÀ CÓ NÉM BOM" — MỘT LỖI, HAI NỬA, KHÔNG NỬA NÀO BÁO LỖI.**
· Nửa DỮ LIỆU: nền **Hải tặc** nằm trong kho TRUNG CỔ (nên được bốc ra ở mọi màn trung cổ) mà
  roster của nó có quân chủng *"Ném lựu đạn"* — trong khi `GenreDefinition` của Trung cổ KHÔNG
  khai `Grenade`. Đã bỏ quân chủng đó; súng hoả mai giữ lại (hải tặc không có súng thì mất chất).
· Nửa KHO VŨ KHÍ, nặng hơn nhiều: `StickmanWeaponHolder.Awake` Instantiate **cả BẢNG vũ khí** vào
  xương tay, còn `AIWeaponSwapModule` thì **quét thẳng `Weapons`** để tìm "cây NỔ" mỗi khi địch
  túm tụm ≥3, hoặc "cây tầm xa" khi đuổi mãi không tới. Nghĩa là **bất kỳ anh lính nào ở bất kỳ
  màn nào cũng móc được lựu đạn hoặc súng ra** — cả hai hệ đều đang làm đúng phần việc của mình.
  Chốt bằng `StickmanWeaponHolder.SetSwapPool(int[])`: `CivilizationDefinition.ApplyTo` nạp
  **đúng bộ vũ khí của nền** (`RosterWeaponIndices`, có kèm cây khiên), `FindWeaponIndex` /
  `FindBestMeleeIndex` hỏi `CanAutoSwapTo`.
  ⚠ Chốt ở KHO chứ không ở module — mai có module thứ hai đi tìm vũ khí trong kho thì nó vẫn
  phải đi qua đó. ⚠ CHỈ chặn đường TỰ ĐỔI: `EquipIndex` gọi thẳng (loadout, kịch bản, người
  chơi bấm số) và đồ NHẶT dưới đất không bị đụng — nhặt được cây gì thì dùng cây đó.
  ⚠ Chỉ đường `ApplyTo` (FullRoster) nạp pool; `ApplyLookTo` (AI Lab) thì KHÔNG — ở đó vũ khí
  do bài test phát, giới hạn lại là đổi luôn điều kiện thí nghiệm.

⚠⚠ **VÀ BẢN VÁ ĐÓ MỚI BỊT ĐƯỢC MỘT NỬA — nửa còn lại là MÀN KHÔNG CÓ NỀN VĂN MINH.**
`SetSwapPool` có **đúng một người gọi**: `CivilizationDefinition.ApplyTo`. Nên bất kỳ màn
trung cổ nào không khoác nền lên quân thì kho vẫn mở toang, và `AIWeaponSwapModule` nhánh
"địch túm tụm ≥3 → rút cây NỔ" lấy **cây ĐẦU TIÊN khớp trong kho = `Weapon_Bomb` (chỉ số 6)**.
Cùng lúc đó `GenreDefinition.weapons` — thứ tự nhận là "bộ lọc vũ khí của thể loại" — có hàm
`Uses()` **KHÔNG MỘT NGƯỜI GỌI NÀO**: một lời khai suông suốt từ ngày dựng hệ thể loại.

Nay lời khai đó được THI HÀNH, qua ba mảnh (mỗi mảnh ở đúng tầng của nó):

| Mảnh | Ở đâu | Việc |
|---|---|---|
| `GenreWeaponPolicy` | **Core** | sổ đăng ký tĩnh: "thể loại này cho phép những `WeaponType` nào". **Mặc định MỞ** |
| `GenreWeaponPolicyBinder` | **Units** | đọc `GenreDefinition` rồi nạp vào sổ; `OnEnable` bật, `OnDisable` dọn |
| `StickmanWeaponHolder.CanAutoSwapTo` | **Combat** | hỏi sổ TRƯỚC, rồi mới hỏi kho của nền |

⚠ **Tầng thấp chỉ HỎI MỘT CÂU, tầng cao ĐĂNG KÝ** — `GenreDefinition` nằm ở Units mà
`StickmanWeaponHolder` ở Combat (tầng dưới), nên sổ phải ở Core với kiểu `WeaponType` thuần.
Đúng khuôn `ContestedZones`/`MovingPlatforms`.

⚠⚠ **BINDER GẮN KÈM `AddCivilizationAssignerShared(FullRoster)`, KHÔNG ĐỂ TỪNG BUILDER TỰ NHỚ.**
15 nền văn minh là đồ CHỈ CÓ Ở TRUNG CỔ, nên "scene này có assigner FullRoster" chính là câu
trả lời cho "scene này có phải trung cổ không" — gắn kèm ở đó thì **hơn 20 builder được bọc
trong một lần sửa**, và builder thứ 21 cũng tự được bọc. Bắt từng builder nhớ thêm một dòng
là kiểu gì cũng sót một cái, mà sót thì lính màn đó ném bom TRONG IM LẶNG.
⚠ CHỈ cho `FullRoster`; `LookOnly` (AI Lab) vẫn không lọc — cùng lý do `ApplyLookTo` cố ý
không gọi `SetSwapPool`.
⚠ **MẶC ĐỊNH LÀ MỞ, CÓ CHỦ Ý**: không ai đăng ký thì `Allows` trả true cho tất cả. Một bộ lọc
bật nhầm sẽ khoá vũ khí của cả màn mà không lỗi nào báo; một bộ lọc quên bật thì chỉ quay về
đúng hành vi cũ.
⚠⚠ **VÀ NỬA CÒN LẠI: BỘ LỌC PHẢI CHẶN CẢ LÚC *PHÁT* VŨ KHÍ, KHÔNG CHỈ LÚC *TỰ ĐỔI*.**
Bản đầu chỉ đứng ở `CanAutoSwapTo`, nên loadout · kịch bản màn · người chơi bấm số vẫn phát
được quả lựu đạn: **lính trung cổ SINH RA với bom trong tay ngay giây đầu** — bộ lọc có mà
nhìn vào game vẫn thấy y như chưa có. Nay `StickmanWeaponHolder.CanEquip` hỏi CÙNG một câu và
`EquipIndex` đi qua nó, nên hai đường vũ khí vào tay chung một luật.
· ⚠ **Trả FALSE thì bên gọi phải LÙI sang cây hợp lệ**, đừng bỏ qua giá trị trả về:
  `UnitLoadout.ApplyTo` nay gọi `EquipFirstUsableWeapon(weaponIndex)` khi bị chặn. Bỏ qua là
  lính ra trận TAY KHÔNG — đổi một lỗi lấy một lỗi khác, và cái sau khó thấy hơn.
· ⚠ Đồ **NHẶT dưới đất** vẫn không bị đụng (luật của hệ nhặt đồ), và **nắm đấm dự phòng luôn
  được phép** — chặn nó là kẻ mất vũ khí đứng chịu trận.

⚠⚠ **BA NGOẠI LỆ, VÀ CHÚNG PHẢI ĐƯỢC KHAI RÕ** (`StickmanWeaponHolder.AllowRestrictedWeapons`
/ cờ `_ignoreGenreFilter`). Danh sách trung cổ CỐ Ý không có trượng phép và vuốt quỷ, nhưng ba
nhân vật sau lấy CHÍNH cây ngoài danh sách làm nghề của mình — không miễn thì chúng mất vũ khí
TRONG IM LẶNG (`EquipIndex` trả false, `EquipFirstUsable` nhét cho cây khác):

| Ai | Cây | Vì sao miễn |
|---|---|---|
| **Giáo sĩ** (`SpawnPriestShared`, AI Lab bài 3) | `HolyStaff` | trượng thánh là NGHỀ của nó — mất trượng là mất dáng ban phước và mất lý do phải bảo vệ |
| **Zombie** (`StripToClaws`) | `Claws` | vuốt là MÓNG TAY, không phải món trang bị; kho chỉ có đúng một cây nên chặn = cả bầy tay không |
| **Hai lính ném lựu đạn** (AI Lab bài "Né bom") | `Grenade` | quả lựu đạn CHÍNH LÀ đề bài — không có nó thì "né vùng nổ" không có gì để né |

⚠ Miễn cho ĐÚNG NHÂN VẬT, đừng nới danh sách của thể loại: nới ra là `AIWeaponSwapModule` cho
CẢ SÂN rút trượng phép / vuốt quỷ ra dùng.

⚠⚠ **`LookOnly` KHÔNG kèm bộ lọc — màn nào dùng nó phải TỰ GẮN.**
`AddCivilizationAssignerShared` chỉ gắn kèm cho `FullRoster`. Sáu màn trung cổ đi đường khác
nên đã hở suốt: **AI Lab · Đấu tướng · Sân đấu văn minh · Đột nhập · hai màn Zombie** — cộng
thêm **ba SÂN MAP** (`Demo_29/30/31`) vốn không bake được vì một scene dùng chung cho ba thời
kỳ. Sân map nay gắn LÚC CHẠY theo `map.genre` (`MapAssembler.EnsureGenreWeaponPolicy`), nên
mỗi thời kỳ tự có bộ lọc của mình.
⚠ Bàn thử vũ khí (`Demo_1` · `Demo_5` · `Demo_7` · `Genre_*_Weapons`) CỐ Ý không gắn: ở đó
người chơi bấm số để thử từng cây, lọc vào là không thử được bom nữa.

⚠⚠ **KHÔNG SINH LÍNH TAY KHÔNG.** `WarCamp` (Demo_20) từng cho lính ra lò TAY KHÔNG rồi trông
vào module `AIWeaponScavenge` dắt ra giá vũ khí. Ý đồ hay, nhưng trên màn hình nó đọc ra là
LỖI: cả hàng lính trung cổ đứng đấm suông chờ tới lượt lượm đồ — và playbook của màn mà quên
lắp module đó thì chúng tay không tới hết trận. Nay có `WarCamp._recruitWeaponIndex` (mặc định
cầm sẵn một cây cơ bản; đặt −1 để quay lại kiểu cũ). Xưởng rèn KHÔNG mất việc: đồ nó đúc là đồ
TỐT HƠN, và `WeaponPickup` vẫn cho người đang cầm vũ khí lượm đồ dưới đất.
⚠ Tù binh trong lồng (`MakePrisoner`, Demo_32) thì GIỮ tay không — đó là tù binh, không phải
lính vừa được tạo ra, và cả mode xoay quanh việc thả họ ra rồi để họ chạy tới giá vũ khí.

⚠⚠ **NỬA DỮ LIỆU: HAI NỀN TRUNG CỔ ĐANG CẦM SÚNG LỤC HIỆN ĐẠI.** `Ottoman` (*"Cấm vệ hoả
mai"*) và `Pirate` (*"Súng hoả mai"*) khai `WPistol = 20` = **`Weapon_Pistol` của bộ HIỆN
ĐẠI**. Cái TÊN hợp thời, cây trong tay thì là khẩu bán tự động — biên dịch sạch, chạy sạch,
không lỗi nào báo. Nay có **`WeaponType.Matchlock` (súng hoả mai)** thay chỗ, và
`StickmanCivilizationBuilder` không còn hằng số `WPistol` để ai đó lỡ tay dùng lại.

**SÚNG HOẢ MAI** — khẩu súng DUY NHẤT được phép ở trung cổ. Vẫn là `RangedWeapon` lớp
`Firearm`, **không thêm dòng code chạy nào**, chỉ khác số: nạp **1.95s (chậm nhất bộ trung
cổ)** · một phát **2.9 (nặng nhất)** nhưng **KHÔNG one-shot lính 3 máu**, đúng luật vừa áp
cho trường cung · đạn **bay thẳng** (không bù độ rơi — lợi thế thật của thuốc súng) · đổi lại
**tản đạn 3°**, tầm 7 (ngắn hơn trường cung), vùng chết 2.4.
⚠ **KHÔNG khai "xuyên giáp" thành cơ chế mới**: giáp của dự án là BỂ ĐIỂM nên damage cao
không xuyên nhanh hơn. Thứ thực sự thưởng cho đòn nặng đã có sẵn — `blocksHits`/`hitsBlocked`
chặn theo LƯỢT ĐÁNH chứ không theo sát thương, nên "ít nhát mà nặng" vốn đã phá nón/khiên tốt
hơn (xem `WeaponDesign.md`, *Trục ẩn: giáp và mũ*).
⚠ Nối vào **CUỐI** `LeafWeaponPaths` (chỉ số **42**) — thứ tự bảng đó CHÍNH LÀ
`UnitLoadout.weaponIndex`, chèn giữa là mọi loadout đã lưu trỏ sai cây. Và nhớ **nối 1 dòng
vào `StickmanAudioBuilder.Library`**, quên là cây đó câm lặng không lỗi nào báo.

⚠⚠ **THÊM VŨ KHÍ MỚI = CÂY ĐÓ VÔ HÌNH, VÀ TRƯỚC ĐÂY KHÔNG MỘT DÒNG NÀO BÁO.**
`StickmanSceneUtils.EnsureAllAssets` bước 1 nói rõ *"ART KHÔNG nằm trong dây chuyền dựng"* —
**cố ý**, để dây chuyền không bao giờ ghi đè art đặt vẽ (LUẬT NGUỒN ASSET). Hệ quả là dựng
prefab thì chạy, còn tấm PNG gốc thì KHÔNG ai sinh: `Visual` đơn giản là không có `sprite`,
prefab vẫn hợp lệ, **cầm lên không thấy gì**.
Đo được ngay ở cây hoả mai: `Tier1..5/Matchlock.png` sinh đủ (vì `GenerateTierVariants` NẰM
trong dây chuyền) trong khi `Sprites/Weapons/Matchlock.png` **không có** — một cây súng có 5
bản đổi chất liệu mà không có bản để hiện.
**Chốt:** mục `Art > ★ Vẽ bù art còn thiếu bằng code` nay khai `proofResolver =
StickmanArtSource.ExpectedArtProof` + `proofResolverRequiresAll: true` ⇒ **thiếu MỘT tấm là
mục đó ĐỎ trên Bảng điều khiển**. Trước đó nó không khai `proof` nào nên bảng không vẽ nổi một
cái chấm — đúng thứ LUẬT VÀNG cấm.
⚠ Danh sách chứng chỉ gồm art mà generator BIẾT vẽ theo TÊN (`WeaponArtGenerator` +
`StickmanEnvironmentArt`). Art nền văn minh dò theo THƯ MỤC nên cố ý để ngoài — kê tay vào đó
là danh sách lỗi thời ngay lần thêm nền sau.

Chi tiết trong `Docs/KnowledgeBase/WeaponSystem.md`. Năm điều cần nhớ:

1. **Dáng cầm = `WeaponHoldPose`, không phải AnimationClip.** Một pose gồm
   `ikArmL`, `ikArmR`, `weaponAngle`, `headAngleOffset` (+ `offHandWeaponAngle` cho song đao);
   `StickmanProceduralAnimator` lerp giữa các pose ở `LateUpdate`. Thêm vũ khí mới = thêm pose.
   Local space của IK tay: **-Y là hướng ngắm**, +X là lên/ra sau.
   **`weaponAngle` = KHÔNG GIAN NGẮM: 0 = mũi chỉ thẳng mục tiêu** (neo vào boneHead,
   KHÔNG phải góc local theo bàn tay — bàn tay xoay theo IK). Cách cầm chuẩn từng loại
   (đối trọng chéo, giáo kẹp hông, lao ngang vai): `Docs/KnowledgeBase/WeaponHolding-Reference.md`.
   Vũ khí 2 tay (giáo, thương, súng...) gán `_offHandGrip` → IK tay phụ tự bám cán.
   Vũ khí ngắn 1 tay (kiếm/đao/đao ngắn, cờ `_allowOffHandShield`) tự cầm KÈM KHIÊN
   tay trái nếu kho có khiên (`_pairShieldWithOneHanded` trên holder).
   **Vũ khí 1 tay phải có ĐỐI TRỌNG CHÉO**: tay không cầm vung NGƯỢC chiều tay cầm
   (lấy đà thì tay kia ra trước, đánh thì tay kia giật về sau). Cùng chiều = trông như
   búp bê bị đẩy. Chi tiết + bảng từng vũ khí: `Docs/KnowledgeBase/WeaponHolding-Reference.md`.
   **ĐẶT DÁNG CẦM MỚI → đọc `WeaponHolding-Reference.md` MỤC 5 trước** (rút từ 14 bộ sprite
   tham chiếu + ảnh chụp Stick War). Bốn luật hay sai nhất:
   · **Vũ khí VUNG nghỉ ở thế CHÉO LÊN 40–60°**, chỉ cây ĐÂM/NGẮM mới nằm ngang — để ngang là
   cú vung phải nhấc lên trước, mất một nhịp và trông như vừa tỉnh dậy;
   · **Khoảng cách HAI TAY trên cán là dấu hiệu nhận dạng LOẠI** — sai là cây vũ khí đọc thành
   loại khác dù hình vẽ đúng (kiếm 2 tay: hai tay SÁT nhau · giáo/súng: cách ~35–40% cán ·
   **côn: ĐỐI XỨNG QUA TÂM**, đó là thứ làm nó ra "côn" chứ không ra "giáo cụt mũi");
   · **Tay rảnh chỉ có BA việc** — ra sau lấy thăng bằng · trước mặt che · nắm cán. Buông thõng
   nghĩa là đang KHÔNG chiến đấu;
   · **Cú vung phải đủ BA vế ở khung kết**: cung 150–180° + thân ngả tới + chân sau duỗi. Thiếu
   hai vế sau là đòn không có sức nặng dù cung vung đủ vòng.
   ⚠ Cách kiểm rẻ nhất: **thu hình xuống 40 px rồi nhìn**. Thân stickman là khối ĐEN ĐẶC nên vũ
   khí chỉ đọc được khi nằm NGOÀI khối thân — thành cục đen thì kéo vũ khí RA XA THÂN, đừng vẽ
   lại art.
2. **Năm nhánh vũ khí**: `RangedWeapon` (cung/súng) — `MeleeWeapon` (kiếm/đao/thương/búa) —
   `ThrowableWeapon` (lao/búa ném/bom/lựu đạn) — `ShieldWeapon` (khiên, kế thừa `MeleeWeapon`) —
   **`MagicWeapon`** (trượng/đũa phép: MANA + NIỆM CHÚ thay cho đạn+cooldown; niệm dở mà
   trúng đòn là VỠ BÀI — đó là cách cận chiến khắc chế pháp sư). Xem `Genres.md` mục 3.
   Đều kế thừa `WeaponBase`, gắn vào `handR`/`handL` qua `StickmanWeaponHolder`. Mọi vật bay dùng
   chung `ProjectileController` + `ProjectilePoolManager` (key: arrow/bullet/javelin/hammer/bomb/grenade).
3. **Asset theo kiểu 1 base + variant** — sửa base là cả nhóm ăn theo:
   `Weapon_Base` → `Weapon_MeleeBase|RangedBase|ThrowableBase` → 7 variant vũ khí;
   `Proj_Base` → 5 variant đạn; `Character.prefab` → `StickmanFighter` + `StickmanDummy`.
   Field nào variant override sẽ tô xanh trong Inspector, chuột phải Revert là về base.
   KHÔNG sửa `Character.prefab` để làm nhân vật mới — tạo variant.
4. **Song đao / song kiếm** (`HandGrip.DualWield`): lưỡi thứ hai nằm sẵn trong prefab
   (`OffHandBlade`), holder **mượn** sang xương `handL` lúc cầm và trả về lúc cất — nhờ vậy
   rớt/nhặt luôn đi NGUYÊN ĐÔI. Góc lưỡi trái = `WeaponHoldPose.offHandWeaponAngle`,
   nhát nào đánh bằng tay trái thì bật `Swing.useOffHand`.
4c. **"HAI TAY BẬN CẢ" LÀ MỘT CÂU HỎI, KHÔNG PHẢI MỘT DANH SÁCH ENUM** (`WeaponBase.UsesBothHands`).
   `HandGrip` chỉ nói vũ khí GẮN vào xương nào, không nói nó CHIẾM mấy tay. Cây cung khai
   `LeftHand` (tay trái giữ thân cung) nhưng tay phải phải kéo dây — bận cả hai. Nên luật
   "hai tay bận thì ẩn khiên trang bị" mà đi hỏi `Grip == TwoHanded || DualWield` là **trượt
   sạch bộ tầm xa**: cung thủ · nỏ · súng đều ra trận với một cái khiên trên tay, và không có
   lỗi nào báo. `RangedWeapon` override `UsesBothHands => true`. Hỏi ở LỚP GỐC thay vì kê lại
   danh sách ở từng chỗ dùng — kê lại là mai thêm lớp vũ khí mới lại sót một chỗ.

4d. ⚠⚠ **CLONE MỘT NHÂN VẬT ĐANG SỐNG = CLONE CẢ KHO VŨ KHÍ ĐANG TREO TRONG TAY.**
   `StickmanWeaponHolder.Awake` Instantiate **cả BẢNG vũ khí** vào xương tay, nên một nhân
   vật đang sống LUÔN có 42 GameObject vũ khí con, trong đó **cây đang cầm ĐANG BẬT**. Mà dự
   án có ba chỗ nhân bản người đang sống — `RespawnDirector.CaptureTemplates` (chụp khuôn hồi
   sinh) · `GameSession.ApplyTroopCount` (nhân quân theo bậc khó) · `PlayerRespawn.BuildTemplate`
   — và cả ba đều CỐ Ý làm vậy (chép lại từ prefab thì sót loadout/archetype/cờ phe).
   Bản sao mang theo nguyên BỘ CŨ, rồi `Awake` của nó dựng thêm **một bộ MỚI** ⇒ trên
   tay có **GẤP ĐÔI số cây**. Bộ cũ KHÔNG nằm trong `_weapons`, mà `BuildWeaponList` lẫn `EquipIndex`
   đều chỉ tắt **theo DANH SÁCH** — nên cây cũ đang bật thì **không đường nào tắt được nữa**.
   Triệu chứng: *"đang cầm kiếm ngắn, nhặt cây giáo thì cầm cả hai"*, và đổi vũ khí bao nhiêu
   lần cũng không mất cây thừa. **Không lỗi nào báo.**
   · Chữa ở `BuildWeaponList` (`DiscardStrayWeapons`) — **NÚT THẮT**: mọi đường clone đều đi
     qua `Awake` của holder. Vá ở ba chỗ clone thì mai có chỗ thứ tư lại dính.
   · **Quét theo XƯƠNG TAY, không theo danh sách.** Câu hỏi đúng là *"có cây nào đang treo
     trên tay mà kho không biết không"* — hỏi vậy thì bắt luôn cái bẫy anh em: `Character.prefab`
     có sẵn object `Bow` trong rig, `StickmanFighter` phải vá tay bằng override `m_IsActive: 0`,
     nên prefab/scene nào mất override đó là có ngay hai vũ khí trên tay vĩnh viễn.
   · **ĐỪNG "nhận nuôi" chúng vào `_weapons`** — thứ tự kho CHÍNH LÀ `UnitLoadout.weaponIndex`,
     nhét thêm phần tử là mọi loadout của cả dự án trỏ sai cây.
   · Nhớ `DetachOffHandWeapon` trước khi huỷ (lưỡi song đao đang mượn sang `handL`, huỷ mỗi
     thân là còn một lưỡi lơ lửng), và **TẮT TRƯỚC HUỶ SAU** (`Destroy` hoãn tới cuối frame).
   ⚠ Bài học chung: **gỡ phần tử khỏi `_weapons` thì phải chỉnh `_currentIndex` theo.**
   `DropOffHandShield` từng `Remove(shield)` trơn — bỏ một phần tử nằm TRƯỚC cây đang cầm là
   mọi cây phía sau dịch xuống một ô và `Current` lặng lẽ trỏ sang CÂY KHÁC (rồi `Unequip` tắt
   nhầm cây, `DropCurrentWeapon` rớt nhầm cây). `DropCurrentWeapon` vốn làm đúng; chỗ kia sót.

4d-bis. ⚠⚠ **VÀ NÓ KHÔNG CHỈ LÀ KHO VŨ KHÍ: CLONE NGƯỜI SỐNG CÒN CLONE CẢ ĐỒ ĐANG ĐEO VÀ
   CẢ CON NGỰA DƯỚI MÔNG.** Mục 4d chỉ chữa cho VŨ KHÍ, nên hai hệ anh em nằm lại nguyên
   vẹn — người dùng đọc ra đúng câu *"lính hồi sinh mang theo nhiều giáp hoặc nón"*.

   Cùng một khuôn: visual được **dựng LÚC CHẠY rồi treo thẳng vào xương**, tức nằm trong cây
   con của nhân vật ⇒ `Instantiate` bê theo nguyên xi; còn sổ ghi nợ thì KHÔNG theo được vì
   nó là field `readonly`/null dựng mới ở `Awake` ⇒ bản sao không biết mình đang đeo gì và
   dựng thêm một bộ NỮA, chồng khít lên bộ cũ.

   | Hệ | Sổ ghi nợ mất theo bản sao | Triệu chứng |
   |---|---|---|
   | `StickmanEquipment` | `_equippedVisuals`/`_equippedDefs` ⇒ `Unequip` đầu `Equip` không có gì để huỷ | **HAI nón, HAI giáp** chồng lên nhau; bộ cũ còn cả `EquipmentHitbox` đỡ đòn hộ |
   | `StickmanMount` | `_mountObject` = null ⇒ `Dismount(destroyMount: true)` đầu `Mount` không có gì để huỷ | **HAI con ngựa**; chủ chết chỉ con MỚI thành ngựa hoang, con cũ đứng tới hết trận |

   Chốt bằng `DiscardStrayGear()` / `DiscardStrayMount()` gọi ở **`Awake`, TRƯỚC** vòng mặc
   đồ / `Mount` — đúng khuôn `DiscardStrayWeapons`, và vì đúng lý do đó: `Awake` là NÚT THẮT
   mà cả **ba** đường nhân bản người sống đều đi qua (`RespawnDirector.CaptureTemplates` ·
   `GameSession.ApplyTroopCount` · `PlayerRespawn.BuildTemplate`). Vá ở ba chỗ clone thì mai
   có chỗ thứ tư lại dính.
   ⚠ **Nhận diện bằng LỚP/NHÃN, không bằng TÊN OBJECT**: `StickmanHorse` cho ngựa, và nhãn
   mới `EquipmentVisual` cho trang bị (trước đó chỉ có mỗi cái tên `Equip_<slot>`). Kê tên là
   mai ai đổi chuỗi định dạng đó thì dính lại y hệt, không lỗi nào báo.
   ⚠ **TẮT TRƯỚC, HUỶ SAU** — `Destroy` hoãn tới cuối frame.
   ⚠ **KHÔNG phải dựng lại scene**: đây là code runtime, không phải dữ liệu bake.

   ⚠ Ba hệ khác cùng dựng object con lúc chạy thì ĐÃ ĐÚNG SẴN vì hỏi `Find(<tên>)` trước:
   `StickmanAppearance` (tóc/râu/nón overlay) · `DemoTeamFlag` (thanh máu) ·
   `FantasyCreatureLook`. Thêm hệ thứ tư kiểu này thì phải chọn MỘT trong hai khuôn — hỏi
   trước khi dựng, hoặc dọn đồ lạc ở `Awake`.

5b. **LUẬT MỘT KHIÊN — không bao giờ hai tay hai khiên.** Có HAI hệ khiên:
   khiên CẦM TAY (`ShieldWeapon`) và khiên TRANG BỊ (`EquipmentDefinition` slot Shield).
   ⚠ **CẢ HAI ĐỀU BÁM `handR` = TAY GẦN, cả hai đều bậc `NearShield` (11).** Khiên trang bị
   từng bám `handL` (tay XA) ở bậc `FarWeapon` (6) — và đó chính là lỗi *"order khiên sai"*:
   quay mặt sang phải thì cái khiên nằm ở tay KHUẤT sau lưng, bị thân (5) · cẳng tay gần (8) ·
   vũ khí tay gần (9) · nắm tay gần (10) lần lượt đè lên. Khiên là thứ ĐƯA RA CHE nên phải ở
   tay người xem nhìn thấy và vẽ TRÊN CÙNG. Hai hệ để lệch nhau thì lính có khiên loại nào là
   nhìn ra kiểu đó, mà không lỗi nào báo.
   ⚠ **"Tay gần có bận không" phải hỏi MỘT chỗ**: `StickmanWeaponHolder.ShieldOnNearHand`
   (gộp cả hai hệ). Hỏi riêng `_offHandShield != null` như bản cũ thì lính chỉ có khiên
   TRANG BỊ vẫn để vũ khí ở tay gần → **khiên và vũ khí chung một tay**.
   ⚠ **Thứ tự là hợp đồng** (`RefreshHandLayout`): `SyncEquipmentShield` (khiên trang bị có
   HIỆN không) chạy TRƯỚC `ApplyMainHandState` (vũ khí né sang tay nào) — cái sau đọc kết quả
   của cái trước. Đảo lại là chậm một nhịp và trong nhịp đó hai thứ chồng lên nhau.
   Ba chốt chặn trong `StickmanWeaponHolder`:
   · `_oneShieldOnly` — đang giơ khiên cầm tay (hoặc vũ khí chính LÀ khiên) thì tự ẩn
   khiên trang bị (`StickmanEquipment.SetSlotVisible`);
   · `_shieldIsOffHandOnly` — NHẶT được khiên thì cất kho + giơ lên che, KHÔNG cầm làm
   vũ khí chính (trừ khi tay không) → luôn ra "1 tay khiên + 1 tay vũ khí ngắn";
   · `Start()` + `RefreshShieldPolicy()` — Awake của holder/equipment không xác định thứ tự
   và `UnitLoadout.ApplyTo` gắn trang bị SAU vũ khí, nên phải chấm lại luật ở Start và mỗi
   lần mặc khiên lúc chạy.
   · **HAI TAY BẬN CẢ = KHÔNG ĐEO KHIÊN**: vũ khí `TwoHanded`/`DualWield` kéo chính `handL`
   xuống nắm cán qua `_offHandGrip` (hoặc mượn hẳn xương cho lưỡi thứ hai), mà khiên TRANG BỊ
   cũng bám `handL` → tay trái vừa nắm cán vừa ôm khiên = "khiên và vũ khí chung một tay".
   `SyncEquipmentShield` ẩn khiên trang bị khi đang cầm 2 tay (đời thật cũng không ai vừa
   cầm giáo 2 tay vừa đeo khiên tay).
   **KHIÊN CHIẾM TAY GẦN, VŨ KHÍ NHƯỜNG CHỖ**: giơ khiên là khiên bám `handR` (tay thuận
   theo hướng nhìn — quay phải đọc là "tay phải cầm khiên", quay trái tự thành tay trái nhờ
   rig lật gương), còn VŨ KHÍ CHÍNH chuyển sang `handL` = tay xa
   (`StickmanWeaponHolder.ApplyMainHandState` + `StickmanProceduralAnimator.SetMainHandLeft`
   đảo routing IK: dữ liệu pose `ikArmR` luôn là "tay cầm vũ khí", animator tự rót đúng bone).
   **Bậc vẽ khiên cầm tay**: `NearShield` (11) — TRÊN CÙNG, che kín cả nắm tay
   (tham khảo Stick War: khiên là mảng liền che nguyên bàn tay; pivot sprite khiên ở TÂM
   nên nắm tay nằm ngay sau tâm khiên). **Khiên TRANG BỊ dùng CHÍNH bậc đó** — xem mục 5b.
   ⚠⚠ **`EquipmentDefinition.sortingOrder` KHÔNG được phép đè bậc của khiên**
   (`StickmanEquipment.Equip` loại riêng slot Shield). 15 asset `Equip_<Nền>_Shield` đã BAKE
   `sortingOrder: 6` — số CŨ, do chính builder ghi vào lúc dựng — mà field serialized thì
   Unity nạp GIÁ TRỊ ĐÃ LƯU, nên sửa bảng `StickmanSorting.EquipmentOrder` mà quên vế này là
   **không có gì đổi cả**. Bậc vẽ của khiên là LUẬT CỦA RIG (phải nằm trên nắm tay), không
   phải lựa chọn của người làm art. Cùng họ với bẫy "sửa bug bằng đổi mặc định".

5e. ⚠⚠ **CỠ KHIÊN CŨNG PHẢI CÓ MỘT CHỦ, KHÔNG CHỈ RIÊNG "MỘT KHIÊN"**
   (`StickmanRigMetrics.ShieldHeightRatio` = **0.44** × chiều cao nhân vật).

   Hai hệ khiên từng tự tính cỡ riêng, và cả hai số đều "hợp lý" khi nhìn riêng:
   · khiên **CẦM TAY**: `WeaponHeightRatio(Shield)` = 0.50 ⇒ **50%** chiều cao người;
   · khiên **TRANG BỊ**: `FitOpaqueHeight(…, bodyHalfHeight × 1.3)` ⇒ **37%**.
   Chênh **1.37 lần** trên CÙNG MỘT CÁI KHIÊN: trong một trận, lính cầm khiên và lính đeo
   khiên ra hai cỡ khác hẳn nhau — đọc ra đúng câu *"khiên to nhỏ kỳ cục"*, và **không có
   lỗi nào báo**. Nay cả hai hỏi cùng một hằng số.
   0.44 = 77 cm trên người 175 cm, giữa dải thật (khiên 60–90 cm = 34–51%).
   ⚠ Cùng họ với luật "hỏi MỘT chỗ" ở `ShieldOnNearHand` và với bậc vẽ `NearShield` (11):
   **mọi thuộc tính của khiên — tay nào, bậc vẽ nào, CỠ BAO NHIÊU — đều phải chung một
   nguồn**, vì người chơi không phân biệt được hai hệ đó.

5. **Khiên cầm tay** (`ShieldWeapon`) khác khiên trang bị: đỡ đòn trong cung trước mặt,
   độ bền **tự hồi** thay vì rơi mất. Đường damage:
   `TakeDamage` → `StickmanEquipment.TryAbsorb` → `StickmanWeaponHolder.TryBlock` → trừ máu.
   Vũ khí cận chiến còn có **THẾ THỦ** (`MeleeWeapon._canGuard`): đỡ CHỦ ĐỘNG — player
   giữ CHUỘT PHẢI, AI tự giơ khi địch vung (tuning `AIProfile.block*`); dáng thủ là
   `_guardPose` (WeaponHoldPose, có nút Capture), vỡ thế là tự hạ vũ khí chờ hồi.
   Xem `Docs/KnowledgeBase/WeaponSystem.md` mục 4.3.
6. **Dựng bằng tool**: `Tools > Stickman > Weapons > Build Everything (1-4)`.
   Thêm vũ khí sau này: `New Weapon Variant from Selection` (nhớ nối tên vào CUỐI
   `StickmanWeaponBuilder.LeafWeaponPaths` — thứ tự đó chính là `UnitLoadout.weaponIndex`).
   Chỉnh pose: `Mount Selected Weapon on Character` → kéo IK trong scene → **Capture** ở
   Inspector vũ khí → Overrides > Apply All.
7. **CẤP ĐỘ vũ khí** (`WeaponBase._tier` + asset `WeaponTierTable`): cùng một cây có bản thường
   → tinh luyện → cứng cáp → tinh xảo → huyền thoại. Cấp là trục DỌC, lớp vũ khí là trục NGANG:
   mỗi cấp có hệ số `power`, chẻ ra `damage = power^0.6` và `tốc độ = power^0.4` nên vũ khí nặng
   lên cấp vẫn nặng, nhanh vẫn nhanh — cân bằng ngang giữa các lớp không vỡ.
   **Cấp 1 = đúng số gốc trên prefab.** Buff thì NÂNG CẤP, đừng sửa `_damage`.
   Đổi lúc chạy: `weapon.SetTier(n)`. Mọi chỗ gây damage phải dùng `Damage`/`Cooldown`/`Knockback`
   (đã nhân cấp), KHÔNG dùng thẳng `_damage`/`_cooldown`.
7b-look-BỎ. ⚠⚠ **TRỤC CHẤT LIỆU CỦA VŨ KHÍ ĐÃ BỎ HẲN (2026-09-02).** Mục `7b-look` và
`7b-skin` ngay dưới GIỮ LẠI LÀM SỬ — đừng dựng lại thứ chúng mô tả.

Cây vũ khí nay chỉ có MỘT hình cho mỗi nền văn minh. Cấp vũ khí (`WeaponBase.Tier`) còn
nguyên nhưng **chỉ còn là CHỈ SỐ** (damage · cooldown · knockback), không đổi vẻ ngoài nữa.

| Đã gỡ | Còn lại |
|---|---|
| `WeaponBase._tierSprites` · `TierSprite()` · nhánh nhuộm màu theo cấp | `_tier`, `TierData`, `WeaponTierTable` — thuần chỉ số |
| `ApplyTierLook` → đổi tên thành **`ApplySkinLook`** | chính nó, nhưng chỉ khoác SKIN nền văn minh |
| `IWeaponSkinSource.SkinFor(type, **tier**, out f)` | `SkinFor(type, out f)` — bỏ tham số cấp |
| 3 tool: *Sinh sprite theo CẤP* · *Gắn sprite theo CẤP* · *Sinh skin vũ khí theo CẤP cho 15 nền* | — |
| 2 job cùng tên trong dây chuyền dựng | — |

⚠⚠ **`ApplySkinLook` PHẢI Ở LẠI, ĐỪNG GỠ CẢ HÀM.** Đây là chỗ DUY NHẤT khoác skin nền văn
minh lên vũ khí (`SetSkinSet` gọi thẳng vào đây). Gỡ cả hàm là 15 nền mất sạch skin vũ khí mà
**không lỗi nào báo** — chỉ nhìn ra "cả sân cầm chung một cây kiếm xám". Đây là cái bẫy chính
của việc bỏ trục này: hai việc khác hẳn nhau (khoác skin · đổi chất liệu) từng nằm chung một
hàm vì hệ cấp phải hỏi skin trước (xem `7b-skin`).

⚠ **BỘ ĐỒ TRÊN NGƯỜI VẪN CÓ CHẤT LIỆU** (`EquipmentDefinition.tierSprites` ·
`StickmanEquipment.SetGearTier` · tool *Sinh nón · giáp · khiên theo CẤP*). Đó là trục riêng
và không bị đụng tới. Nhưng nhớ: nó vốn được thiết kế để **đi CHUNG một thang với vũ khí** cho
người chơi chỉ phải học một bảng màu — nay vũ khí không còn thang đó nữa, nên bộ đồ là trục
chất liệu DUY NHẤT còn lại. Muốn bỏ nốt thì gỡ đúng ba thứ trong ngoặc trên.

⚠ **ART CŨ CÒN NẰM TRÊN ĐĨA, CỐ Ý KHÔNG XOÁ**: `Sprites/Weapons/Tier1..5/` (195 tấm) và
`<nền>/TierN/Weapon_*.png` (~400 tấm). Không code nào đọc chúng nữa. Giữ lại để việc này ĐẢO
NGƯỢC ĐƯỢC — xoá là mất hẳn. Chắc chắn không quay lại thì xoá tay hai đường dẫn đó.

7b-look. **CẤP = ĐỔI CHẤT LIỆU, KHÔNG PHẢI NHUỘM MÀU** (`WeaponTierLook` — bảng vật liệu,
   nguồn sự thật cho cả generator lẫn runtime): **gỗ đá → đồng → sắt → thép tinh luyện → vàng
   huyền thoại**, kèm hoa văn dày dần (trơn → đai → đinh tán → ngọc → hào quang) và cấp 4–5
   đổi luôn CÁN từ gỗ trần sang da sẫm.
   Bản cũ nhân `SpriteRenderer.color` cho CẢ CÂY nên cán gỗ · lưỡi thép · dây da hoá cùng một
   màu — mắt đọc ra *"cây kiếm bị nhuộm"*, không đọc ra *"cây kiếm tốt hơn"*, và màu xanh lá
   thì chẳng gợi ra chất liệu gì.
   · **Đòn bẩy**: 53 hàm vẽ đều chỉ dùng `Steel`/`DarkSteel`/`Wood`/`Dark`; đổi bốn hằng số đó
   thành thuộc tính đọc từ bảng là **cả bộ đổi vật liệu mà không sửa hàm vẽ nào**. `Dark`
   (viền) CỐ Ý không đổi theo cấp — cây vàng có viền vàng là mất hết đường nét.
   · **HAI BƯỚC, quên bước hai là hỏng TRONG IM LẶNG**: `Weapons > Sinh sprite theo CẤP` (vẽ ra
   `Sprites/Weapons/Tier1..Tier5`) rồi `Weapons > Gắn sprite theo CẤP` (đổ vào
   `WeaponBase._tierSprites`). Thiếu bước hai thì `ApplyTierLook` thấy mảng rỗng và **lặng lẽ
   rơi về nhuộm màu** — nhìn vào chỉ thấy "lên cấp vẫn chỉ đổi màu". Tool réo tên cây thiếu bản.
   · ⚠ **Hoa văn CHỈ đóng lên cây CÓ CÁN** và phải **CẮT theo vật liệu đã có** — chi tiết ba
   chốt chặn ở `.claude/skills/stickman-assets/SKILL.md` mục *Luật số 2*.

7b-skin. ⚠⚠ **SKIN VĂN MINH VÀ CẤP VŨ KHÍ TỪNG GIẪM CHÂN NHAU — VÀ CẤP LÀ BÊN THUA.**

`WeaponBase.SetVisualSprite` (khoác skin nền) và `WeaponBase.ApplyTierLook` (đổi hình theo
cấp) **cùng ghi `renderer.sprite`**. Skin được khoác SAU loadout nên nó luôn ghi sau ⇒ mọi
lính có nền văn minh — tức gần như CẢ SÂN ở mọi màn trung cổ — thì **cả 5 cấp vũ khí nhìn y
hệt nhau**. Toàn bộ hệ cấp biến mất khỏi trận đánh, **không lỗi nào báo**: cả hai hệ đều đang
làm đúng phần việc của mình. Người chơi đọc ra đúng câu *"lên cấp mà chỉ đổi màu"*.

Chữa bằng cách cho SKIN cũng có bản theo cấp, **không bắt bên nào nhường** — nhường cho cấp là
mất bản sắc nền, nhường cho skin là mất hệ cấp:
· art: `<nền>/Tier1..Tier5/Weapon_*.png` (`CivilizationArtGenerator.GenerateWeaponSkinTiers`);
· dữ liệu: `WeaponSkinSet.Entry.tierSprites` **đi cùng `tierFractions`** (và
  `VariantTiers.fractions` cho biến thể) — `SkinFor(type, tier, seed, out fraction)` phải trả
  **tấm nào thì đúng tỉ lệ phần vẽ của tấm đó**, không được dùng số của skin gốc;
· runtime: `WeaponBase.SetSkinSet` giữ CẢ BỘ (không giữ một tấm — giữ một tấm thì lên cấp là
  rụng mất bản sắc nền), rồi `ApplyTierLook` hỏi skin TRƯỚC.
⚠ Đi qua `SetVisualSprite` chứ đừng gán thẳng `renderer.sprite`: tấm skin phải được BÙ CỠ theo
phần vẽ được (`FitSkin`), gán thẳng là cây vũ khí đổi cỡ mỗi lần lên cấp.
`★ Soát hồ sơ vũ khí` và Doctor đo lại mọi `WeaponSkinSet`; lệch quá 1% thì chạy lại bước dựng
skin tương ứng, không chỉnh scale cảm tính trên prefab.

⚠ **ĐÒN BẨY LÀ BẢNG MÀU, KHÔNG PHẢI 53 HÀM VẼ.** `CivilizationArtGenerator` gõ cứng
`Steel`/`DarkSteel`/`Blade1`/`Blade2`/`Haft`; đổi năm hằng số đó thành THUỘC TÍNH đọc
`WeaponTierLook` là **cả bộ art 15 nền đổi được vật liệu mà không sửa một hàm vẽ nào** — y hệt
điều `WeaponArtGenerator` đã làm cho bộ gốc. `_tierLook` để TRỐNG khi vẽ bản gốc nên art hiện
tại ra đúng như cũ.

⚠ **`AssetDatabase.FindAssets` QUÉT ĐỆ QUY.** Từ khi có thư mục `TierN`, `LoadSpritesByPrefix`
không lọc thì mỗi cây vũ khí lọt vào bảng skin **SÁU LẦN** (gốc + 5 cấp), ra sáu entry cùng
`WeaponType` và `SpriteFor` trả về tấm nào là tuỳ thứ tự quét. Lọc bằng `path.LastIndexOf('/')
!= folder.Length` — đường dẫn asset của Unity luôn dùng dấu `/`.

7b-gear. **NÓN · GIÁP · KHIÊN CŨNG CÓ CẤP, VÀ ĐI CHUNG MỘT THANG VỚI VŨ KHÍ.**
`EquipmentDefinition.tierSprites` + `SpriteForTier(tier)`; `StickmanEquipment.SetGearTier`
mặc lại đồ đang đeo; `WeaponTierSetter` ghi **MỘT con số** cho cả người.
· Vì sao chung thang: người chơi chỉ nên phải học MỘT bảng chất liệu. Bộ giáp đồng đứng cạnh
  cây kiếm đồng thì đọc ra ngay *"lính này còn nghèo"*; mỗi hệ một thang màu riêng là hai bảng
  phải học và chẳng bảng nào nhớ được. Một ông đội nón vàng cầm kiếm gỗ thì không đọc ra gì.
· ⚠ **CHỈ ĐỔI HÌNH, KHÔNG ĐỔI SỐ** — `armor`/`weight` giữ nguyên theo cấp. Muốn giáp cấp cao
  che tốt hơn thì đó là một trục cân bằng khác, phải đo lại cả bộ chứ không cộng lén ở đây
  (đúng luật `GameDifficulty`: đừng đụng máu/giáp).
· ⚠ **CHỈ PHẦN KIM LOẠI ĐỔI THEO CẤP.** Vải · lông · da · sơn mài · tua đỏ giữ nguyên chất của
  nó — cùng bài học bộ lông ngựa: nhuộm cả tấm thì nón vàng ra khăn vàng và mất luôn thứ phân
  biệt nền này với nền kia. Bộ nón 256 px bọc màu qua `CivilizationHelmetArt.Metal(...)`.
· ⚠ **CỠ VÀ CHỖ ĐẶT KHÔNG ĐO LẠI THEO TỪNG CẤP** — mọi cấp cùng khổ canvas, cùng khối hình.
  Đo lại từng cấp thì cái nón NHÍCH một chút mỗi lần lên cấp, vì phép đo vành nón nhạy tới
  từng pixel.

7b-thang05. ⚠⚠ **THANG CẤP LÀ 0–5, MỘT TRỤC, NGUỒN Ở `Core/GearTiers.cs`** (user chốt 2026-09-02).
· **Cấp 0 có nghĩa KHÁC NHAU theo hệ**: nón/giáp = KHÔNG đội/mặc gì (`WearsGear(0)=false`,
  `SetGearTier(0)` CỞI THẬT qua `Unequip` — ẩn hình là cái nón vô hình vẫn đỡ đòn hộ);
  vũ khí/khiên = đồ THÔ (gậy gỗ, khiên ván) — vẫn có đồ, `power 0.78`.
· **CHỈ SỐ MẢNG = CHÍNH CẤP ĐÓ** (`GearTiers.IndexOf`), KHÔNG phải `tier-1` — giữ phép trừ cũ
  là mọi món lệch đúng một bậc mà nhìn vẫn "có hình".
  ⚠⚠ **VÀ BÊN GHI CŨNG PHẢI ĐỔI THEO — ĐÃ SÓT ĐÚNG MỘT CHỖ** (dính tới 2026-09-02).
  `StickmanCivilizationBuilder.LoadTierSkins` vẫn dựng mảng `WeaponTierLook.Count` (**5** ô)
  rồi ghi `tiers[tier - 1]`. Bên ĐỌC đã sang thang 0–5, bên GHI còn ở 1–5 ⇒ **mọi cấp hiện
  hình của cấp KẾ TIẾP**: cấp 1 ra art Tier2, cấp 4 ra Tier5, cấp 5 kẹp về 4 nên đúng do may.
  Không lỗi nào báo — cấp nào cũng có một cái nón. Người dùng đọc ra thành *"vẫn đang sai
  asset"*. Nay mảng dài `GearTiers.Count` và đánh chỉ số bằng CHÍNH cấp đó; ô 0 để trống là
  bình thường (nón/giáp cấp 0 = không đội gì).
  ⚠ **Cách tự bắt:** đếm phần tử `tierSprites` trong asset. Bằng **5** là bên ghi còn ở thang
  cũ; phải là **6**.
  ⚠⚠ **VÀ CHÍNH `WeaponTiers.asset` ĐÃ DÍNH ĐÚNG VẬY — phát hiện 2026-09-03.** Asset lưu
  26/08 còn **5 bậc** thang cũ trong khi `WeaponTierTable._tiers` trong code đã sang **6 bậc**
  thang 0–5. `Get()` đánh chỉ số bằng CHÍNH CẤP (`GearTiers.IndexOf`), nên **mọi cấp lệch một
  bậc**: cấp 0 (đồ thô) nhận `power` 1.0 thay vì 0.78, cấp 1 nhận 1.25, cấp 4 nhận 2.3 — chỉ
  cấp 5 đúng do bị kẹp. Không lỗi nào báo, cây nào cũng vẫn "có số".
  ⚠ Gốc rễ: `StickmanWeaponTierTools.CreateTierTable` chỉ TẠO asset khi chưa có rồi đi gán
  tham chiếu cho prefab — **không bao giờ ghi bảng số từ code xuống asset**. Mà `_tiers` là
  `[SerializeField]`, Unity nạp giá trị ĐÃ LƯU chứ không nạp field initializer ⇒ sửa bảng số
  trong `WeaponTierTable.cs` xong bấm nút là **không có gì đổi cả**. Nay tool ghi đè bằng
  `EditorSetTiers(defaults.EditorTiers)`, đúng khuôn `AISmartsTable`/`ExperienceTable`: **code
  là nguồn sự thật, asset là bản bake, đừng sửa tay asset.**
  ⚠ Hệ quả thứ hai và là thứ NGƯỜI DÙNG NHÌN THẤY: tool không ghi gì nên dấu thời gian asset
  đứng im ⇒ mục *CÓ THỂ CẦN CHẠY LẠI* **bấm bao nhiêu lần vẫn vàng**, đọc ra thành *"nút không
  chạy được"*. Đây là luật 2e-0k2 lặp lại: **tool nào bị đo bằng mtime thì mỗi lần chạy PHẢI
  để lại dấu trên đĩa.** Thêm một `Tool` có `proof` là asset ⇒ tự hỏi ngay: "bấm lần thứ hai
  thì file đó có đổi mtime không?"
· **Cấp = MÓN ĐỒ KHÁC, không phải màu**: bộ recolor chất liệu đã xoá (165 tấm kho chung +
  `DeleteWeaponSkinTiers` dọn `<nền>/TierN`). `WeaponBase._tierSprites` đã bị xoá rồi TRẢ LẠI
  cùng ngày với nghĩa mới (gậy → đại kiếm) — đừng đọc log cũ rồi xoá lại lần nữa.
· Art theo cấp nhận về qua `intake_fid --tier` (nón) · `intake_row` (giáp) · `intake_wep --tier`
  (vũ khí, kho CHUNG `Sprites/Weapons/TierN/`). Tất cả tự đóng nhãn `stickman:hand`.
· Lên cấp kinh nghiệm kéo CẢ gear (`StickmanExperience` → `SetGearTier`) — một con số cả người.

7b-thang05-cuoi. ⚠⚠ **CẤP CỦA VẬT CƯỠI LÀ GIÁP NGỰA, KHÔNG PHẢI CON NGỰA KHÁC**
(`MountDefinition.bardingSprites` · `StickmanHorse.SetBarding` · `StickmanMount.SetGearTier`).

Hai cách "hiển nhiên" đã cân nhắc và LOẠI, mỗi cách hỏng một kiểu:

| Cách | Hỏng ở đâu |
|---|---|
| đổi CẢ BỘ 4 sprite theo cấp | 5 loài × 6 cấp × 4 tấm = **120 tấm**; và `legLength`/`bodyLength` đo theo từng tấm nên lệch một chút là **MÓNG LÚN XUỐNG ĐẤT** — đúng bẫy `GroundOffset` đã trả giá một lần |
| cấp = GIỐNG ngựa khác | giống ngựa ĐÃ LÀ một trục riêng (mỗi nền một giống); trộn vào là hai thông tin dùng chung một kênh, y như luật cấm nhuộm thân theo phe |

Giáp ngựa thì đúng khuôn nón/giáp của người: **cấp 0 KHÔNG KHOÁC GÌ**, cấp cao trùm kín — đọc
được bằng ĐƯỜNG BAO ở cỡ thật, và chỉ tốn **MỘT tấm mỗi cấp** (5 loài × 5 = 25).
⚠ Dùng lại y nguyên khuôn `saddleSprite` đã có: một sprite con của thân, **KHÔNG** nằm trong
`_coatRenderers` — vải/thép thì con ngựa nào cũng ra đúng màu ấy, nhuộm theo lông là con ngựa
hồng khoác tấm giáp hồng.

⚠⚠ **KHỐI NGỰA PHẢI CHẠY XUỐNG SỐ ÂM.** Nó cần FIVE bậc (chân xa · thân · **giáp** · chân gần ·
**yên**) mà phải nằm trọn DƯỚI bậc thấp nhất của rig (`FarExtremity` = 3). Nay là
**−2 · −1 · 0 · 1 · 2**; số âm hoàn toàn hợp lệ vì mỗi nhân vật là một `SortingGroup` riêng.
⚠ Cái yên trước đây viết `MountBody + 1`, tức **TRÙNG BẬC với chân gần** — bẫy "trùng bậc thì
Unity xếp theo khoảng cách camera, đảo qua đảo lại tuỳ frame" ghi ngay ở đầu `StickmanSorting`.
Nay là hằng số riêng `MountSaddle`.

⚠ **CO GIÁP BẰNG `rộngThân / rộngGiáp`, đừng đi vòng qua world unit.** Giáp là CON của thân nên
đã ăn sẵn phép co của thân; rút gọn ra thì `bodyLength` và `rootScale` triệt tiêu hết. Tính vòng
cho cùng kết quả nhưng nhân chia bốn số, quên một số nào cũng ra tấm giáp sai cỡ mà không lỗi
nào báo. Hệ quả cho ART: **tấm giáp phải cùng KHỔ CANVAS và cùng PIVOT với `<loài>_Body.png`**.

⚠ `StickmanMount` **NHỚ con số** kể cả lúc chưa cưỡi gì: `WeaponTierSetter` chạy ở `Start` còn
kỵ sĩ có thể bắt ngựa hoang mãi sau (`AIMountModule`). Không nhớ thì con ngựa nhặt được luôn trần.

⚠ Thiếu art cấp nào thì `LoadBarding` **RÉO TÊN cấp đó** — nó hỏng theo kiểu khó thấy nhất:
ngựa ở cấp thiếu art chỉ đơn giản là TRẦN, vẫn chạy vẫn đánh, hệ cấp biến mất trong im lặng.
Chưa có tấm nào thì trả `null` (không phải mảng rỗng) ⇒ mọi con ngựa hiện có giữ nguyên hành vi cũ.

⚠⚠ **VÀ ĐỢT NÀY LÒI RA MỘT LỖI CÂM CÓ SẴN: `WeaponTierSetter` CHẶN MẤT CẤP 0.**
Cả `ApplyToGear` lẫn `ApplyTo` viết `if (_tier <= 1) return;` — đúng khi thang còn bắt đầu từ 1,
nhưng từ ngày có thang 0–5 thì **cấp 0 KHÔNG BAO GIỜ được áp**: lính đáng lẽ đầu trần, không
giáp, cầm gậy gộc lại ra trận đủ bộ, và không lỗi nào báo vì ai cũng vẫn có một cái nón. Nay so
`== 1` (cấp 1 CHÍNH LÀ số gốc trên prefab nên đúng là không phải làm gì).

7b-gear-hinh. ⚠⚠ **CẤP TRANG BỊ ĐỔI CÁI NÓN, KHÔNG ĐỔI NƯỚC SƠN** (luật user chốt 2026-09-02).

Mục 7b-gear ngay trên nói "chỉ phần kim loại đổi theo cấp" — đúng khi `<nền>/TierN/` còn là phép
ĐỔI BẢNG MÀU trên chính tấm gốc. Nhưng **ở cỡ thật (~44 px) thì MÀU là thứ MẤT TRƯỚC TIÊN**: có
khói, có đêm, có thanh máu chồng lên là năm cấp đọc ra như nhau — tức cả hệ cấp trang bị
biến mất khỏi trận đánh **trong im lặng** (mỗi cấp vẫn đủ 5 tấm, vẫn hiện lên đầu, không lỗi
nào báo). Đây đúng bài học đã trả giá ở bộ nón 15 nền: **ở cỡ thật chỉ còn ĐƯỜNG BAO**.

Nay cấp phải đổi **CẤU TẠO**, theo một thang duy nhất cho cả 15 nền: mũ vải/da → chỏm sắt +
đai → nón chữ ký của nền → + che má/diềm gáy → nón kín + mào. Hai trục đọc được ở 44 px:
**nhỏ → lớn** và **hở → kín**. Chất liệu vẫn đi kèm nhưng là trục PHỤ (bỏ nó là mất liên kết với
thang vật liệu của vũ khí). Đơn đặt hàng + prompt: `WeaponArt-ChatGPT-Prompt.md` mục **3h**.

⚠⚠ **VẾ CODE BẮT BUỘC ĐI KÈM — MỘT `localScale` KHÔNG ĐỦ CHO NĂM CÁI NÓN KHÁC NHAU.**
`EquipmentDefinition` trước đây chỉ có **MỘT** `localScale` + **MỘT** `localPosition`, đo từ tấm
gốc, còn cấp thì **chỉ đổi `renderer.sprite`**. Đúng khi năm cấp trùng khít nhau; **sai cho bốn
trong năm cấp** ngay khi cấp 1 là mũ da còn cấp 5 là mũ trụ kín — và sai trong im lặng: cấp nào
cũng có một cái nón, chỉ là cái trùm quá cằm, cái bé hơn cái đầu.
Nay có `tierScales[]` / `tierOffsets[]` + `ScaleForTier` / `OffsetForTier`:
· `StickmanCivilizationBuilder.BakeTierTransforms` ĐO từng cấp bằng điểm neo đầu của chính tấm
  đó, nhưng **chỉ bake khi các cấp THẬT SỰ khác hình** (lệch > 2% cỡ hoặc > 2% bán kính đầu).
  Bản đổi màu để mảng RỖNG ⇒ hành vi cũ y nguyên, không nhích một pixel — giữ đúng vế
  *"cỡ và chỗ đặt không đo lại theo từng cấp"* của 7b-gear.
· `StickmanEquipment` áp số theo cấp ở **CẢ HAI ĐƯỜNG**: lúc `Equip` và lúc `SetGearTier` đổi cấp
  GIỮA TRẬN. Thiếu đường thứ hai thì lính lên cấp giữa trận đổi hình mà giữ cỡ cũ.
· `EquipmentStabilizer.SetWorldOffset` — đổi độ lệch mà **KHÔNG** đo lại tư thế nghỉ. Gọi `Setup`
  lại thì nó chụp `_restAngle` ngay giữa một cú vung, và từ đó món đồ nghiêng lệch vĩnh viễn.

⚠ **NHẬN ART CẤP PHẢI ĐÓNG NHÃN `stickman:hand`.** `StickmanArtSource` cho code ghi đè tự do
trong `TierN/` (bộ đó vốn 100% là bản đổi màu của code), **trừ** tấm mang nhãn này. Quên nhãn =
lần bấm tool kế tiếp vẽ đè hết. `intake_fid.py <sheet> <nền> --tier <tên>` tự đóng.

⚠ **ĐO ĐƯỢC**: `Các nền văn minh > 6. Soi bộ nón` nay in khối **CẤP TRANG BỊ** — mỗi món là
"ĐỔI MÀU" hay "KHÁC HÌNH THẬT", và réo tên món nào thiếu nhãn / chưa đo lại.

7b-variant. **MỖI NỀN NHIỀU KIỂU NÓN** (`CivilizationDefinition.helmetVariants`/`armorVariants`).
Cả tiểu đội đội y hệt nhau thì nhìn ra ĐỒNG PHỤC, không nhìn ra đội quân.
· ⚠⚠ **BÓNG NGOÀI PHẢI KHÁC NHAU GIỮA CÁC NỀN — "màu phân biệt nền" LÀ KHÔNG ĐỦ.**
  Bản cũ dùng HAI họ dáng chung cho cả 15 nền (`LightCap` chóp nhọn · `HeavyDome` vòm che má)
  và chỉ đổi màu, với lập luận "bóng ngoài phân biệt KIỂU, màu phân biệt NỀN — hai trục vuông
  góc". Đo ra thì hỏng: **`Helm_*_Cap` của cả 15 nền có alpha GIỐNG HỆT NHAU tới từng pixel**
  (băm ra đúng 1 mã), `_Guard` cũng vậy ⇒ **30 trong 45 cái nón của dự án chỉ là 2 đường bao
  tô lại màu**. Hai trục ấy KHÔNG cân nhau: đường bao đọc được từ xa, còn màu thì lẫn ngay khi
  có khói, có đêm, có thanh máu chồng lên.
  Bản vá sau đó cho `CivTone` thêm **số đo dáng riêng từng nền** (đỉnh chóp · nửa bề rộng ·
  chỏm đỉnh · độ dài vạt · bán trục vòm · có che má không · độ dài diềm · mào đỉnh) — vẫn hai
  HỌ dùng chung bộ khối `Dome`/`Band`/`Skirt`/`SideTail`.
· ⚠⚠ **VÀ BẢN VÁ ĐÓ KHÔNG CHỮA ĐƯỢC GÌ — "30/30 bóng ngoài khác nhau" LÀ MỘT PHÉP ĐO NÓI DỐI**
  (rà lại 2026-09-01, sau khi người dùng vẫn báo *"nón các nền giống nhau"*). Con số ấy đo bằng
  `StickmanCivilizationArtAudit.SilhouetteKey` — một CHUỖI 24 ký tự đem so BẰNG NHAU, nên lệch
  đúng một bậc ở đúng một hàng là đã thành "hai hình khác nhau".
  Đo bằng **CHỒNG KHỚP (IoU)** thì ra sự thật: họ `_Guard` IoU trung bình **0.85** với
  **53/105 cặp ≥ 0.85**, họ `_Cap` **0.80** với 40/105 cặp, `Helm_Crusader_Cap` ~
  `Helm_Viking_Cap` chồng khít **0.97**. Vặn con số trong một hàm vẽ KHÔNG đẻ ra được cái nón
  thứ hai: 30 tấm đó vẫn là một cái nón chóp và một cái nón vòm.
  ⚠ Đây là AGENTS mục 2c-septies lặp lại sâu hơn một tầng: **khoá CHÍNH XÁC nào cũng nói dối
  như nhau, kể cả khoá tính trên đường bao.** Thứ phân biệt "hai hình" với "một hình vặn vài
  con số" là KHOẢNG CÁCH. `Civilizations > 7` nay in cột **GẦN GIỐNG** và cột đó có quyền phủ
  quyết chữ `OK`.
  ⚠ Cách chữa ĐÚNG không nằm trong code: mỗi nền phải là một **KIỂU NÓN CÓ THẬT** (kettle hat ·
  great helm · bascinet · spangenhelm · kabuto · shishak · morion…), tức khác nhau ở CẤU TẠO
  chứ không ở tham số. Đơn đặt hàng 45 dòng đã viết sẵn ở
  `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md` mục **3d** — theo LUẬT NGUỒN ASSET thì đó
  là việc của ChatGPT, đừng thêm hàm vẽ thứ ba.
  Vẫn đúng vế cũ: **đừng vẽ 30 cái nón TỰ DO** — ở ~44 px chi tiết bên trong biến mất hết,
  chỉ còn đường bao và mảng màu lớn nhất.
· ⚠ **BỐC THEO NHÂN VẬT, ĐỪNG `Random` MỖI LẦN GỌI.** `ApplyLookTo` được gọi LẠI nhiều lần
  trong một ván (đổi phe · người chơi hồi sinh · quân mới ra lò). Bốc tự do thì cùng một anh
  lính cứ vài giây lại đổi nón — *"đồ nhấp nháy"*, không lỗi nào báo. Dùng mã băm của object
  làm hạt giống, kèm `salt` tách nón khỏi giáp (thiếu salt thì ai bốc nón kiểu 2 cũng luôn mặc
  giáp kiểu 2, số tổ hợp tụt từ N×M xuống N).
· ⚠⚠ **NHIỀU NÓN THÌ PHẢI CÓ `helmetScales[]`/`helmetOffsets[]`.** `StickmanCivilizationBuilder`
  trước đây chỉ đặt MỘT `helmetScale` tính từ `helmets[0]` — vô hại khi mỗi nền đúng một nón,
  nhưng thêm kiểu thứ hai là nó ra nón bé hơn đầu hoặc trùm quá cằm (đúng lỗi ở mục 2b), mà
  **không lỗi nào báo** vì lính nào cũng vẫn có một cái nón.

7c. **TAY NGHỀ VŨ KHÍ** (`WeaponMastery`): thang 5 bậc, **yêu cầu = NỀN THEO LỚP + THƯỞNG
   THEO CẤP** (không gõ tay từng cây). NPC đọc `SmartsLevel`, người chơi đọc
   `StickmanExperience.Level`. Ba chốt chặn: `WeaponPickup.HandleInRange` (AI khỏi nhặt) ·
   `WeaponPickup.GiveTo` (chốt thật) · `StickmanWeaponHolder.EquipIndex` (chặn cả loadout).
   ⚠ `EquipIndex` GIỜ CÓ THỂ TRẢ VỀ FALSE — mọi chỗ "cầm vũ khí mặc định" phải gọi
   `EquipFirstUsable()`, không thì lính mới phát trượng phép đứng TAY KHÔNG cả trận.
   `smarts = 0` = TẮT hệ cấp → KHÔNG chặn; nhân vật không có cả hai component cũng không chặn.
   Cấp độ còn **chia sức mạnh theo LỚP** (`DamageShareOf`): búa lên cấp càng nặng, đao ngắn
   lên cấp càng nhanh — DPS vẫn tăng đúng bằng `power` nên cân bằng ngang không đổi.
   Chi tiết: `Docs/KnowledgeBase/WeaponDesign.md`.
7b. **CÂN BẰNG TẦM XA ↔ TẦM GẦN — ba vế, đừng chỉ hạ damage.** Cung mạnh không phải vì
   sát thương mà vì **đứng ngoài tầm với**. Ba chốt (số nằm trong `AIProfile`/prefab vũ khí):
   · `RangedWeapon._minEffectiveRange` — **VÙNG CHẾT tầm gần**, bị dí sát mặt là không giương
   cung lên được (đối xứng với `MeleeWeapon._minRangePercent` của giáo);
   · `AIProfile.rangedSteadyAimTime` — **NGẮM CHẮC TAY**: phải đứng yên mới bắn, nên bị áp sát
   = phải lùi liên tục = không ra được sát thương. Đây là vế quan trọng nhất, không có nó thì
   cung vừa lùi vừa bắn là vô đối;
   · `AIProfile.runReachMultiplier` + `rangedTargetBonus` — cận chiến **chạy** suốt quãng áp
   sát (mốc theo tầm vũ khí CỦA MÌNH, không phải số cố định) và **ưu tiên đi dọn cung thủ**.
   ⚠ `StickmanWeaponBalance` từng chấm tầm xa bằng SỐ CỐ ĐỊNH (1.30/1.45) nên báo "cân bằng"
   trong khi thực tế cung áp chế — nay tính bằng **số đòn ăn miễn phí lúc địch chạy tới**.

7b-nerf. ⚠⚠ **VÀ NÓ VẪN NÓI DỐI THÊM HAI LẦN NỮA — cả hai đều là lỗi của DỤNG CỤ ĐO, không
   phải của bảng số.** Người dùng báo *"cung tên, nỏ hiện tại quá mạnh"* trong khi Balance
   Report chấm cung **−6%**, nỏ **+1%**, trường cung **−5%** — tức "cân bằng tuyệt đối".
   Hai chỗ mù, sửa cả hai ở `StickmanWeaponBalance`:

   | Chỗ mù | Sai thế nào | Đo được |
   |---|---|---|
   | **Tốc độ áp sát** | `ClosingSpeed` gõ `3.9` = `_runSpeed` THÔ, nhưng không ai chạy 3.9: `SpeedScale` còn nhân `SpeedTuning` (0.82) và sức nặng giáp | thật là **3.20** (dân binh) · **2.85** (chính quy) · **2.62** (tinh nhuệ) ⇒ rút ngắn quãng áp sát ~27% ⇒ đếm THIẾU số đòn tầm xa ăn miễn phí |
   | **XOÁ SỔ MỘT PHÁT** | `DPS = sát thương ÷ nhịp` ngầm giả định sát thương THỪA vẫn có ích. Nó không | trường cung `damage 3.4` ≥ **máu lính cận chiến 3.0** ⇒ one-shot MỌI lính không giáp, mà DPS chỉ 1.62 nên bảng chấm −1%. Nỏ `2.5` ≥ **máu cung thủ 2.0** ⇒ one-shot tuyến sau |

   ⚠ **One-shot đắt hơn nhiều so với phần DPS công thức nhìn thấy**: không có nạn nhân bị
   thương nào đứng dậy đánh trả, không kịp hồi máu, và người bị bắn không bao giờ biết mình
   sắp chết. Nay báo cáo in riêng khối **XOÁ SỔ MỘT PHÁT** và **chỉ réo TẦM XA** — một nhát
   búa 2.0 vào mặt thì đáng đau, vì để vung được nó đã phải xáp mặt.

   **Bảng nerf đã áp** (`StickmanWeaponBuilder`, chấm lại bằng tốc độ áp sát THẬT 2.85):

   | Cây | sát thương | nhịp nạp | vùng chết | điểm | one-shot |
   |---|---|---|---|---|---|
   | Cung | 1.6 → **1.5** | 0.95 → **0.94** | 1.3 → **1.4** | +2% → **−4%** | không → không |
   | Nỏ | 2.5 → **1.9** | 1.45 → **1.26** | 1.6 → **1.7** | +7% → **−4%** | cung thủ → **không** |
   | Trường cung | 3.4 → **2.8** | 2.10 → **1.83** | 2.0 → **2.1** | −1% → **−4%** | **mọi lính** → cung thủ |

   ⚠ **HẠ SÁT THƯƠNG THÌ PHẢI HẠ CẢ NHỊP NẠP** — chỉ cắt damage là cây đó rơi xuống **−21%**
   và Balance Report réo `<<<` vĩnh viễn (*"cái đỏ nói dối cũng tệ như cái xanh nói dối"*).

   ⚠⚠ **VÀ ĐỢT NERF ĐẦU ĐÃ QUÁ TAY THEO ĐÚNG KIỂU KHÓ THẤY NHẤT — ghi lại để đừng lặp.**
   Bản đầu để vùng chết **2.0 / 2.2 / 2.6** + `SteadyAimTuning = 2.0` (0.70 giây). Nhìn từng
   số thì đều "hợp lý", nhưng người dùng đọc ra ngay: *"cung tên và nỏ yếu và bắn quá chậm"* —
   dù nhịp nạp lúc đó đã được **rút NGẮN**. Vì sao:

   > **`rangedSteadyAimTime` KHÔNG cộng thêm 0.35 giây một lần — nó NHÂN với SỐ LẦN bị ép lùi.**
   > Đồng hồ reset về 0 mỗi lần nhân vật nhúc nhích (`_steadySince = -1`). Mà **vùng chết rộng
   > hơn nghĩa là bị ép lùi SỚM hơn và THƯỜNG XUYÊN hơn** ⇒ hai lever **NHÂN NHAU**, và có lúc
   > cung thủ không nhả nổi một phát nào cả trận.

   Đo được: nhịp bắn THỰC TẾ của cung (`cooldown + ngắm`) đi từ 1.30 lên **1.65 s/phát (+27%)**,
   nỏ 1.80 → 2.00, dù cả hai đều đã được cho nạp nhanh hơn. Đó là chỗ chữ *"chậm"* tới từ.

   **Bài học, hai dòng:**
   1. **Phân biệt lever CHỈNH SỨC MẠNH với lever ĐÓNG/MỞ khả năng ra sát thương.** Sát thương
      và nhịp nạp là loại 1 — chỉnh bao nhiêu ra bấy nhiêu. Vùng chết và ngắm-chắc-tay là loại
      2: quá ngưỡng là nhân vật **không đánh được nữa**, và cái đó không hiện lên bảng cân bằng.
   2. **Dồn phần nerf vào SÁT THƯƠNG (phá one-shot)**, chỉ nhích nhẹ hai lever kia. Nay vùng
      chết chỉ hơn bản gốc ~0.1 và `SteadyAimTuning = 1.15` (**0.40 giây**) — nhịp bắn thực tế
      còn **1.34 / 1.66 / 2.23 s/phát**, tức NHANH HƠN cả bản gốc ở nỏ (−8%) và trường cung (−9%).

   ⚠ **`rangedSteadyAimTime` KHÔNG sửa được bằng cách đổi giá trị mặc định** — 0.35 đã bake
   vào **34 asset `AIProfile`**. Hệ số nhân LÚC ĐỌC nằm ở `AIProfile.SteadyAimTuning`, đọc qua
   `AIProfile.SteadyAimTime`; đúng khuôn `StickmanLocomotion.SpeedTuning` và
   `StickmanController.ImpactTuning`. **Đừng đọc thẳng `rangedSteadyAimTime` ở chỗ nào nữa.**

   ⚠ **TẢN ĐẠN KHÔNG PHẢI LEVER — đã đo và LOẠI.** Bộ cung/nỏ là họ tầm xa duy nhất để
   `_spreadDegrees = 0` (mọi khẩu súng đều có tản), nhìn rất giống chỗ để nerf. Nhưng bia là
   một stickman cao 0.73, nên ở cự ly 6–8 thì tản **≤ 2.5° trúng 100%** — hoàn toàn vô tác
   dụng; phải 4–9° mới đổi được gì, mà thế thì nhìn ra "bắn bừa". Đừng thử lại.

7b-tambay. ⚠⚠⚠ **TẦM KHAI ≠ TẦM BAY — VÀ CẢ BỘ NÉM ĐANG BAY QUA ĐẦU MỤC TIÊU** (2026-09-04,
   từ báo cáo *"búa ném đang ném quá xa"*).

   `_effectiveRange` là chỗ AI ĐỨNG; `_minSpeed`/`_maxSpeed` + `_throwArcDegrees` là chỗ vật
   ném RƠI XUỐNG. Hai vế đó nói về cùng một thứ mà **được gõ tay riêng, không ai đối chiếu** —
   và bảng cân bằng thì đọc `EffectiveRange` như một sự thật, không bao giờ hỏi *"vật bắn ra
   có tới được chỗ đó không, và tới ở độ cao nào"*. Đo ra:

   | Cây | tầm KHAI | tầm BAY | so khung nhìn | cao tại tầm khai (mục tiêu cao 0.73) |
   |---|---|---|---|---|
   | Lao | 4.5 | 10.9 | 1.2× | 0.95 **qua đầu** |
   | **Búa ném** | 4.5 | **13.8** | **1.55×** | **1.45 — cao GẤP ĐÔI cái đầu** |
   | Lựu đạn | 4.5 | 16.2 | 1.8× | 1.70 qua đầu |
   | Bom | 4.5 | 16.2 | 1.8× | 2.38 qua đầu |
   | Ná dây | 5.0 | **3.9** | 0.4× | −0.28 — **RƠI NGẮN, không với tới** |

   ⚠ Cả bốn cây ném KHÔNG cây nào khai `_effectiveRange` — chúng mượn số **4.5 của prefab
   BASE**, một con số không nói gì về cây đang dựng. Cung và nỏ cũng vậy (mượn 6 của base).

   **NĂM GỐC, và không gốc nào làm compile đỏ:**
   1. **Tốc độ ném gõ tay, không giải theo tầm.** Nay `StickmanWeaponBuilder.SetThrowRange(tầm,
      dáng cung)` là NGUỒN SỰ THẬT: khai TẦM, nó giải `_minSpeed`/`_maxSpeed` sao cho vật đi
      qua **NGỰC** (0.40) ở đúng tầm đó. `_minSpeed` giải cho `tầm × 0.35` = mốc AI ngừng lùi,
      nên dải tích lực trải đúng lên dải khoảng cách CÓ THẬT của cây đó.
   2. **BÙ ĐỘ RƠI HAI LẦN.** `ThrowableCombatStrategy.ComputeAimPoint` nhân thêm **1.6** với lý
      do *"ném vòng cung nên bù cao hơn cung"* — nhưng cây ném ĐÃ chếch sẵn 10–25° rồi, nên đó
      là lớp bù THỨ HAI chồng lên lớp thứ nhất. Nay `_throwArcDegrees` là **toàn bộ** phần bù,
      còn AI chỉ giữ lớp nhỏ giống hệt cung (×1.0) để kéo điểm ngắm từ `aimHeightOffset` (thấp
      hơn tay) lên ngang tầm.
   3. **CẤP VŨ KHÍ LÀM CÂY NÉM TỆ ĐI Ở CẢ HAI ĐẦU.** `TierProjectileSpeed` đúng cho cây BẮN
      (đạn nhanh = quỹ đạo căng = dễ trúng) nhưng SAI cho cây NÉM: góc phóng cố định nên nhanh
      hơn = **bay qua đầu**. Đo được: lựu đạn/bom cấp 4–5 lên tới 0.79–0.99, còn cấp 0 thì rơi
      xuống chân (−0.10). `ThrowableWeapon` nay bỏ hẳn hệ số đó; cấp vẫn thưởng qua `Damage` ·
      `Cooldown` · `Knockback`.
   4. **NÁ DÂY — CA NGƯỢC CHIỀU, CÙNG MỘT GỐC.** Khai tầm 5 nhưng viên đá `gravityScale` 1.4
      ở tốc độ 15 chỉ tới được **3.9**: AI đứng ở một tầm mà hòn đá KHÔNG VỚI TỚI, rơi trước
      mặt nạn nhân suốt trận. Nay **8/20, tầm 4.0** — vẫn chậm nhất nhóm tầm xa (cung 24, nỏ
      30) và vẫn rơi nhiều nhất (`gravityScale` 1.4 giữ nguyên), nhưng hòn đá tới ngang ĐÙI
      (0.16) ở đúng tầm khai. ⚠ Hạ tầm mà giữ tốc độ 15 thì tầm dùng được của nó chỉ còn ~3.0
      — ngắn hơn cả quả bom; một cây "tầm xa" như vậy không còn là tầm xa nữa.
   5. **SÚNG PHÓNG LỰU — cùng bệnh với ná dây, và khó thấy hơn.** Nó là `RangedWeapon` (KHÔNG
      có `_throwArcDegrees`) mà lại bắn quả đạn CÓ TRỌNG LỰC, nên ở tốc độ 16 quả đạn chạm đất
      ở **5.4** trong khi cây khai tầm **7**: bắn cả trận không tới nổi chỗ AI đang đứng. Nay
      **24** (tới tầm 7 ở độ cao 0.18 — vẫn thấy rõ độ rơi). ⚠ Nhớ bài này khi thêm cây BẮN
      nào dùng đạn có trọng lực: không có dáng cung thì tốc độ phải gánh hết.

   **Số đã chốt** — chỉ khai TẦM và DÁNG CUNG, hai cột tốc độ là kết quả `SetThrowRange` giải
   ra. Đã kiểm ở **cả 5 mức tích lực × cả người chơi lẫn AI**: vật đi qua thân nạn nhân ở độ
   cao 0.32–0.56 tại MỌI khoảng cách trong dải dùng.

   | Cây | tầm | dáng cung | minSpeed | maxSpeed | tầm bay | cao tại tầm khai |
   |---|---|---|---|---|---|---|
   | Lao | 5.5 | 4° | 9.9 | 18.5 | 9.09 (1.65× tầm) | 0.46 |
   | Búa ném | 4.2 | 10° | 5.9 | 10.6 | 5.65 (1.34× tầm) | 0.39 |
   | Lựu đạn | 4.5 | 15° | 5.3 | 9.2 | 5.63 (1.25× tầm) | 0.41 |
   | Bom | 4.0 | 25° | 4.1 | 7.1 | 4.71 (1.18× tầm) | 0.41 |

   Ba cây BẮN được khai tầm rõ ràng thay vì mượn số của prefab BASE: **cung 6 · nỏ 7 · súng 6**
   (trường cung 8 và hoả mai 7 vốn đã khai). Sau đợt này **15/15 cây có đạn đều khai tầm**, và
   9 cây có quỹ đạo (6 cây kia bắn đạn `gravityScale` 0 nên không có gì để giải) đều `ok`, tầm
   bay nằm trong **1.18–1.71× tầm khai**.

   ⚠ **`_throwArcDegrees` từ nay là DÁNG NÉM, KHÔNG phải cần chỉnh tầm** — đổi nó thì
   `SetThrowRange` tự giải lại tốc độ và điểm rơi đứng yên. Đừng gõ tay `_minSpeed`/`_maxSpeed`
   cho cây ném nữa.

   ⚠ **PHÉP ĐO ĐÃ ĐƯỢC ĐƯA VÀO BẢNG CÂN BẰNG** (`Weapons > Balance Report`, khối **TẦM BAY
   THẬT**): nó giải quỹ đạo từ chính prefab (tốc độ · dáng cung · `gravityScale` của đạn) rồi
   réo ba kiểu sai — *BAY QUA ĐẦU* · *RƠI NGẮN* · *BAY QUÁ XA*. Không có khối này thì cả bộ ném
   hỏng mà cột "Tầm" vẫn in ra những con số rất đẹp, đúng bài học §7b-nerf: **chỗ mù nằm ở DỤNG
   CỤ ĐO, không ở bảng số.**
   · ⚠ *BAY QUÁ XA* so với **TẦM KHAI** (gấp > 2 lần), KHÔNG so với bề ngang khung nhìn: mũi
     tên trượt rồi bay tiếp là bình thường (trường cung bay 1.54× khung hình và không sao cả),
     còn quả bom rơi cách chỗ nó nhắm gấp ba lần thì không. Mốc 2× tách sạch — sau khi sửa cả
     8 cây nằm trong 1.18–1.71×, còn bản cũ là 2.46–3.63×.
   · ⚠ **Góc ngắm của AI KHÔNG phải hằng số** (`AimAngle`): phần bù độ rơi cộng theo khoảng
     cách còn phần điểm ngắm-thấp-hơn-tay thì chia cho khoảng cách, nên gần thì góc ÂM, xa
     thì DƯƠNG. Quy về một số cố định là đo sai theo hai chiều ngược nhau ở hai đầu bảng
     (đã thử một lần: nó réo oan cả ba cây cung).

   ⚠ Vẫn còn một vế CHƯA làm, ghi lại để đừng quên: bom/lựu đạn không có `MinEffectiveRange`
   nên AI vẫn có thể lia quả bom vào trong bán kính nổ 2.2 của chính nó (`MinRange` = tầm ×
   0.35 = 1.4). Hiện `AIProfile.aoeAvoidEnabled` đỡ hộ, nhưng đó là chữa triệu chứng.

   ⚠ **PHẢI BẤM LẠI TOOL**: số nằm trong prefab đã bake. `★ Bảng điều khiển` → *Art · vũ khí ·
   nhân vật · NPC · trang bị · âm thanh* (đã tự kiểm: mục đó chuyển VÀNG sau lần sửa này, vì
   cả `StickmanWeaponBuilder.cs` lẫn `StickmanPeasantWeaponBuilder.cs` đều nằm trong
   `extraSources` của nó).

8. **Cân bằng đo được, không đoán**: `Điểm = DPS × HệSốTầm × HệSốTiệnÍch`, mốc ≈ 3.5, lệch quá
   ±20% là phải xem lại. Chạy `Tools > Stickman > Weapons > Balance Report` — tool mount thật
   từng cây lên nhân vật để đo tầm với rồi chỉ mặt cây lệch. Thêm vũ khí mới xong PHẢI chạy lại.
   Bảng số + công thức: `Docs/KnowledgeBase/WeaponDesign.md` mục 2b.
9. **Bốn kiểu bắn cho NGƯỜI CHƠI** (`AimMode` trên `StickmanFighterController`, phím **M**
   đổi lúc chơi, hoặc gán `Aiming` từ code):
   `DragPull` kéo ngược & thả · `PointAim` ngắm theo con trỏ, giữ để tích lực ·
   `ClickShot` click phát ăn ngay theo đúng điểm click · `AutoFire` tự khoá địch gần nhất,
   tự bù độ rơi của tên, tự bắn khi vũ khí hồi xong.
   Cả bốn đều chốt `_aimDirection` rồi gọi `_holder.Attack(charge, dir)` — thêm kiểu mới chỉ
   là thêm 1 hàm `Handle*`, KHÔNG đụng vào vũ khí. AI đi đường khác (tắt `_useInput` rồi gọi
   thẳng `AimAt` + `AttackNow`) nên đổi kiểu bắn không ảnh hưởng NPC.
   ⚠ **MẶC ĐỊNH CỦA `StickmanFighter.prefab` LÀ `DragPull`** — kiểu bắn cung của dự án. Số này
   do `StickmanWeaponBuilder.CreateFighterVariant` GHI; sửa giá trị mặc định trong code C# thì
   prefab đã bake KHÔNG đổi theo. Từng lệch đúng chỗ này: builder ghi `PointAim` trong khi hai
   bộ dựng màn (`StickmanArcheryBuilder` · `StickmanRangedModeBuilder`) chú thích "kéo & thả là
   mặc định, không phải đặt lại" ⇒ cả 5 màn bắn cung chạy kiểu ngắm-giữ, ngược hẳn chú thích.
   ⚠ **KÉO-THẢ PHẢI CÓ HÌNH**: `_startTouchIcon` (chấm ở đầu ngón) + `_dragDotsLineRenderer`
   (vệt chấm từ người tới ngón) do `StickmanAimFeedbackBuilder` dựng và nối. Để trống hai cái
   này thì người chơi kéo trong bóng tối — kéo bao xa, ngắm hướng nào đều không hiện gì, mà
   kéo-thả là kiểu ngắm ĐO BẰNG MẮT. Vệt chấm chạy `useWorldSpace` (toạ độ truyền vào là WORLD).
10. **CUNG: MŨI TÊN GHIM VÀO ĐIỂM NỐC TRÊN DÂY.** `_ammoVisual` là con của THÂN CUNG còn
   điểm nốc chạy dọc dây theo lực kéo — không nối lại thì kéo căng cỡ nào tên cũng đứng im
   giữa cung, dây tụt về sau một mình. `RangedWeapon.SyncArrowToString()` được gọi ngay trong
   `SetBowStringPoint` — CHỖ DUY NHẤT dời dây — nên mọi đường đều dính (kéo căng, thả về,
   rung dây sau phát bắn). Đuôi tên đặt lên dây, phần bù pivot→đuôi ĐO TỪ SPRITE
   (`bounds.min.x`) chứ không gõ số, `localRotation` để identity cho tên thừa hưởng hướng
   ngắm + mirror của cây cung.
   ⚠ **HƯỚNG CÂY CUNG: BỤNG quay về MỤC TIÊU, DÂY nằm phía SAU.** Quy ước chung của mọi vũ
   khí là **+X = hướng ngắm**, nên thứ gần địch nhất phải là chỗ bàn tay bóp vào; hai đầu cánh
   và sợi dây ở −X, và kéo dây là kéo về −X (ra xa thân cung). Đo trên `Bow.png`: đầu cánh ở
   px 20, bụng ở px 130 — dây ở −X. **`Longbow.png` từng vẽ NGƯỢC** (bụng px 28, dây px 76):
   sợi dây chắn giữa cây cung và mục tiêu, kéo căng là dây chạy XUYÊN QUA thân gỗ. Không lỗi
   nào báo — chỉ nhìn ra một cây cung lắp ngược. Vẽ lại hình thì **không phải sửa số nữa** (xem ⚠⚠ ngay dưới): hình học dây ĐO TỪ ART.
   Nhưng hướng vẽ vẫn phải đúng — đo sai hướng thì dây đúng khổ mà lắp ngược.
   ⚠⚠ **SỢI DÂY KHÔNG NẰM TRONG ART — NÓ LÀ `LineRenderer`.** `BowString` trong rig, dời bởi
   `RangedWeapon.SetBowStringPoint` để làm hiệu ứng KÉO CĂNG theo lực tích; builder dựng nó
   bằng `MakeBowString` (`StickmanWeaponBuilder.DayCung.cs`) — **ĐO TỪ CHÍNH TẤM ART**
   (`StickmanRigMetrics.TryMeasureBowString`): hai đầu cánh cho mặt phẳng dây + nửa sải, tâm
   khối cho CHIỀU kéo, bề dày cánh cho bề dày dây (0.45 lần). Số gõ tay chỉ còn là DỰ PHÒNG
   khi tấm art không đo được. Ba cái bẫy đã dọn ở đây, cả ba đều câm:
   · dây chép nguyên cả `localPosition`/`localScale` của rig sang cây cung khác khổ ⇒
     `Weapon_Longbow` có sợi dây nằm cách thân cung **2.20 unit**, dài 3.64 trên cây nửa sải 2.02;
   · bề dày chép cứng 0.0127 (đơn vị thân cung) ⇒ quy ra thế giới **0.00095** trên nhân vật cao
     0.71, tức 0.13% chiều cao người — dưới một pixel, dây coi như vô hình;
   · bậc vẽ chép cứng 0 ⇒ dây chìm sau thân người (xem `WeaponSystem.md` mục 5).
   ⚠⚠ **ĐỔI HÌNH CÂY CUNG THÌ PHẢI ĐỔI CẢ SỐ ĐO DÂY.** Cung dùng CHUNG một prefab cho 15 nền ×
   6 cấp × biến thể kiểu rèn — skin chỉ thay `Visual.sprite`, mà sợi dây nằm NGOÀI tấm art nên
   nó giữ nguyên số của tấm gốc. Đo 2026-09-16 trên 24 tấm: **10 tấm** đặt hai đầu cánh lệch quá
   5% cạnh dài, tệ nhất **0.111** (`Centaur/Weapon_HorseBow`) — gần bằng cả bề ngang cây cung;
   nửa sải thì gần như không lệch, sai chỉ ở MẶT PHẲNG DÂY. Nay `BowStringLibrary`
   (`Assets/Settings/BowStrings.asset`, dựng bằng `StickmanBowStringLibraryBuilder` =
   «Weapons > Đo lại dây cung cho mọi tấm art»)
   giữ số đo của **từng tấm**, và `RangedWeapon.SetVisualSprite` tra lại mỗi lần đổi hình.
   Thêm art cung mới ⇒ bấm lại tool đó; tấm chưa có trong bảng thì dây giữ số cũ và phép đo
   «Soi hướng cây cung trong art» réo tên.
   ⚠ **PHÉP SOI HƯỚNG NAY DÙNG CHUNG THƯỚC VỚI BUILDER** (`TryMeasureBowString`) thay cho phép
   "cột đặc dày nhất = bụng" — phép cũ, theo chính chú thích ở trên, báo cả 7 tấm skin lắp ngược
   là OK. Mốc so là **TAY NẮM (= pivot)**: mặt phẳng dây phải nằm SAU tay nắm. Chạy trên 77 tấm
   cung của dự án: **0 tấm vẽ ngược**.
   ⚠⚠ **ĐỪNG LẤY TÂM KHỐI LÀM MỐC** (đã sai một lần, cùng ngày): cung QUẶP ĐẦU có cánh cong hẳn
   về sau rồi đầu cánh quặp ngược ra trước, nên tâm khối nằm SAU cả hai đầu cánh — lấy nó làm
   mốc thì 7 tấm cung tổng hợp bình thường (Mông Cổ · Ả Rập · Trung Hoa · Thục · Troy · Nguỵ ·
   Ngô) bị kết luận là "vẽ ngược". Mốc đúng là chỗ BÀN TAY, thứ mà quy ước pivot đã chốt sẵn.
   ⚠⚠ **ART KHÔNG ĐƯỢC TỰ VẼ SỢI DÂY — 15/77 TẤM ĐANG VI PHẠM.** Đo 2026-09-16: 12 tấm
   `Weapon_Bow` nền văn minh + `Weapons/Longbow.png` + cung Elf + cung kỵ Centaur đều có một vệt
   mỏng CÁCH BIỆT chạy dọc giữa hai đầu cánh. Trong game là HAI sợi dây (sợi vẽ cứng đứng im,
   sợi thật kéo căng). Nguồn: `CivilizationArtGenerator.BowVertical` vẽ thẳng
   `canvas.Line(gx - belly, …)` — nay đã bỏ; `Longbow.png` thì code đã bỏ từ trước, PNG trên
   đĩa mới là bản cũ. Chạy lại tool sinh art là hết. Phép đo: `BowStringMetrics.hasPaintedString`,
   in ra trong «Soi hướng cây cung trong art».
   ⚠ `BowVertical` nay kẹp `recurve ≤ belly − 12`: `recurve == belly` đẩy hai đầu cánh về đúng
   vạch tay nắm (Mông Cổ 30/30), tức **sợi dây chạy xuyên qua bàn tay** — và cũng làm dấu của
   phép so hướng thành số nhiễu. Vẽ dây vào PNG là trong game có **HAI SỢI**: sợi
   trong ảnh đứng im, sợi thật kéo ra sau — không lỗi nào báo, chỉ nhìn ra một cây cung hỏng.
   Art chỉ vẽ **THÂN + HAI ĐẦU CÁNH**, giữa hai đầu cánh phải TRONG SUỐT (vẽ rãnh/khấc mắc
   dây thì được).
   ⚠ Đã đặt nhầm một lần: 12 tấm cung nhận về đều có dây vẽ sẵn. Nay `intake_bow.py` ĐO được
   (`has_painted_string` — ở khúc giữa thân, cung không dây chỉ có MỘT khối; có dây thì thêm
   một vệt mỏng bên trái CÁCH BIỆT khối thân) và réo tên cấp nào dính, tỉ lệ bao nhiêu.
   ⚠ Khuôn `bow_template.py` vẫn vẽ một VẠCH HỒNG MỜ ở chỗ dây sẽ chạy — đó là dấu canh hướng
   hai đầu cánh, KHÔNG phải sợi dây, và bị xoá sạch lúc nhận art.

   ⚠ **ART SINH BẰNG CODE KHÔNG TỰ VẼ LẠI KHI CODE ĐỔI** — `Longbow.png` đã dính đúng vậy:
   code sửa đúng rồi (xGrip 72 / xString 24) mà file trên đĩa vẫn là bản CŨ ngược (28 / 76),
   vì generator chỉ BÙ file thiếu chứ không đè file đã có. Sửa code thôi là CHƯA ĐỦ: phải
   XOÁ file `.png` (giữ `.meta` cho khỏi mất GUID) rồi chạy lại tool sinh art.
   ⚠ **BỘ SKIN CUNG CỦA 7 NỀN VĂN MINH ĐÃ DÍNH ĐÚNG LỖI ĐÓ LẦN THỨ HAI.**
   `CivilizationArtGenerator.BowVertical` viết `x = gx + belly` nên hai đầu cánh VÀ sợi dây
   chạy ra phía **+X = phía mục tiêu** — cả Âu · Nhật · Trung Hoa · Ả Rập · Đại Việt · Ấn Độ ·
   Mông Cổ đều lắp ngược, không lỗi nào báo. Nay hàm tự lo dấu (`gx - belly`), chỗ gọi vẫn
   truyền số DƯƠNG.
   ⚠ **Phép soi "cột dày nhất" KHÔNG đủ để bắt lỗi này** — nó báo cả 7 tấm là OK. Bụng cung
   và đầu cánh gần bằng bề dày nhau, nên phải so **TÂM HÀNG ở GIỮA thân cung với TÂM HÀNG ở
   HAI ĐẦU CÁNH**: bụng phải nằm ở x LỚN HƠN. Phép cũ chỉ bắt được ca `Longbow` vẽ lệch hẳn.
   ⚠ Nỏ (`Crossbow`) KHÔNG áp phép đo này — cánh nỏ vốn nằm ở MŨI (phía +X), đo kiểu cung là
   báo nhầm cả bộ.
   Soi bằng `Tools > Stickman > Nâng cao > Weapons > Soi hướng cây cung trong art`
   (`StickmanWeaponArtCheck`) — nó đọc thẳng PNG, tìm cột DÀY NHẤT (bụng cung) rồi so với tâm
   phần vẽ, nên biến "phải nhìn mới thấy" thành một con số. Soi cả skin của từng nền văn minh.
   ⚠ ĐỪNG đổi sang "dây bám thẳng nắm tay kéo": dải `_stringRestLocalPos`→`_stringPulledLocalPos`
   là số ART trong không gian cây cung (đã nhân `_gripLocalScale` 0.5 và rig 0.25), lệch hẳn
   thang đo với quãng tay đi thật — kẹp lại là dây căng hết cỡ ngay từ nhịp đầu.

Damage đi qua `StickmanController.TakeDamage(DamageInfo)` (có máu, điểm trúng, nguồn bắn);
`TakeDamage(Vector2)` bản cũ vẫn chí mạng như trước. Class con override **`OnDeath(DamageInfo)`**,
KHÔNG override `TakeDamage` nữa.



### ⚠⚠ DÂY CHUYỀN NHẬN VŨ KHÍ TỪ ẢNH (2026-09-07, user: *"tôi gửi 1 hình vũ khí mới thì AI thêm nó vào dự án… ngoài vũ khí còn khí tài như cây nỏ này… đầy đủ animation và thuật toán"*)

Từ nay **thêm một cây vũ khí là một QUY TRÌNH có đo được**, không phải một lần nhớ đủ.
Luật đầy đủ: [WeaponIntake.md](WeaponIntake.md) — 12 điểm nối, bảng đọc ảnh ra số, nhánh khí
tài, và bốn ràng buộc cân bằng. Skill làm việc: `.claude/skills/stickman-intake/`.

**Phép đo:** `StickmanWeaponIntakeCheck` (`Vũ khí > ★ Soát hồ sơ vũ khí`, và cũng nằm trong
Doctor) hỏi cho MỌI `WeaponType`: có trong `LeafWeaponPaths` chưa · prefab đúng loại chưa · có
hình chưa · khai `WeaponHeightRatio` chưa · khai `WeaponWeight` chưa · có dòng trong
`StickmanAudioBuilder.Weapons` chưa · thuộc thể loại nào chưa. Sáu thứ đó quên cái nào cũng
biên dịch sạch và **không có lỗi nào báo**.

**Hai cây đầu tiên đi qua dây chuyền** (`StickmanIntakeWeaponBuilder` + `StickmanIntakeArt`):

| Cây | Lấp khoảng trống nào | Số riêng | Sở đoản |
|---|---|---|---|
| **Búa rìu cán dài** (`Pollaxe` = 66) | họ `Polearm` chỉ biết ĐÂM (giáo/thương/kích/đinh ba) hoặc CHÉM (đại đao cán dài) — không cây nào ĐẬP VỠ; ngược lại hai cây phá khiên mạnh nhất (rìu hai tay 0.78 · búa cận chiến) đều tầm ngắn | dmg 1.95 · nhịp 0.80 · đẩy 2.2 · cỡ 1.05 · 3.6 kg · **xuyên giáp 35% + phá thế thủ ×2.2 + chống kỵ 30%** (cây DUY NHẤT có cả ba trục) | nặng → đi 89%, nhịp chậm thứ nhì nhóm cán dài, vùng chết 45% như giáo |
| **Nỏ giàn** (`Arbalest` = 67) | trung cổ không có câu trả lời cho GIÁP ở tầm xa: nỏ thường xuyên giáp 30%, trường cung 0% | dmg 1.95 · nhịp **2.00 (chậm nhất bộ trung cổ)** · tầm **9 (xa nhất)** · đạn 34 · 6.5 kg · **xuyên giáp 70% (cao nhất dự án)** · 5 mũi | đi 81%, vùng chết 2.6 rộng nhất họ tầm xa, `backoffScale 1.6` — bị áp sát là 2 giây đứng làm bia |

⚠ **Sát thương CỐ Ý giữ 1.95 cho nỏ giàn** — dưới mốc 2.0 máu của cung thủ/lính khiên, đúng
luật `AppendOneShotTable`. Cây tầm xa mạnh lên bằng **xuyên giáp và tầm**, không bằng `damage`.

⚠ **Vế KHÍ TÀI của cùng tấm ảnh KHÔNG sinh ra loại máy thứ bảy.** `SiegeEngineKind.FixedBallista`
("nỏ cố định", 1 người, nạp 5.5 s, dmg 16, tầm 24) đã trả lời đúng câu hỏi đó từ trước; việc
đúng là **vẽ lại `Siege_FixedBallista`** cho khớp ảnh — tời bánh nan hoa + bàn đạp + cánh thép,
ba chi tiết nói đúng ba con số của nó (nạp chậm · phải chống chân · một phát rất nặng). Bản cũ
chỉ có một cái đĩa 15 px làm tay quay, ở cỡ thật đọc ra là "bánh xe" — tức nói ngược lại chữ
CỐ ĐỊNH trong chính tên cỗ máy.

## ⚠⚠ QUÁ NHIỆT — CÁI PHANH CHO SÚNG ĐẠN VÔ HẠN (2026-09-08)

`Lmg` (trung liên) khai **đạn vô hạn**, `Minigun` 150 viên/băng, `Flamethrower` không dùng
băng. Với nhóm này thì băng đạn không chặn được gì: giữ cò là bắn tới hết trận. Không lỗi nào
báo — cây súng đang làm đúng từng dòng code của nó.

Quá nhiệt là cái phanh ĐÚNG CHẤT: nó không lấy đi hoả lực, nó lấy đi **quyền giữ cò mãi**.

Ba số trên `RangedWeapon`:

| Field | Nghĩa | Ghi chú |
|---|---|---|
| `_shotsToOverheat` | bắn liên tiếp ngần này phát thì kẹt nòng | **0 = TẮT, và đó là mặc định** |
| `_coolSeconds` | giây để nguội từ nóng hết về 0 | nguội KỂ CẢ lúc đang kẹt |
| `_ventSeconds` | kẹt nòng đứng im bao lâu | |

⚠ **Mặc định phải là TẮT.** 70 cây đã bake trong prefab; bật mặc định là cả kho đột nhiên có
phanh mà không ai khai — đúng khuôn bẫy «đổi mặc định trong code không cứu được asset cũ»,
chỉ là chiều ngược lại.

⚠ **Nguội kể cả lúc đang kẹt.** Không thế thì hết thời gian kẹt nòng vẫn đầy nhiệt, bắn một
phát lại kẹt ngay — người chơi thấy cây súng "hỏng hẳn".

⚠ **`IsOverheated` nằm trong `IsBusy`** nên AI tự biết nhả cò; và `DoAttack` thoát TRƯỚC khi
trừ đạn — chặn sau khi trừ là người chơi mất viên đạn vì một lỗi họ không nhìn thấy.

Đọc `Heat` (0..1) để vẽ thanh nhiệt trên HUD.
