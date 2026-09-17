## ⚠⚠ MẶT TRẬN BA NƯỚC — CHIẾN TRANH HIỆN ĐẠI BA QUỐC GIA, MAP VÒNG, THUẬT TOÁN BẮN SÚNG (2026-09-08)

User: *"tham khảo chế độ chơi tam quốc camping làm chế độ chơi chiến tranh hiện đại giữa 3 nước
nhưng thuật toán phù hợp cho bắn súng và hiện đại"*.

Code: `Assets/Scripts/Gameplay/Modes/ModernNations.cs` (bảng ba nước + năm học thuyết) ·
`Assets/Scripts/Gameplay/Modes/ModernFrontMode.cs` (trọng tài, kế thừa `ThreeKingdomsCampMode`) ·
`Assets/Scripts/Gameplay/Vehicles/VehicleCatalog.cs` + `CampVehicleWorkshop.cs` (xưởng cơ giới) ·
`Assets/Editor/Modes/StickmanModernFrontBuilder.cs` (màn `Demo_55_ModernFront`) ·
ba nền `NorthPact` · `RedSand` · `GoldRidge` trong `StickmanCivilizationBuilder.ModernSpecs`,
art vẽ bù ở `Assets/Editor/Art/ModernNationArt.cs`.
Bảng điều khiển: «★ 15 nền văn minh» (sinh art + asset ba nước) rồi «Hiện đại — MẶT TRẬN BA NƯỚC».

Đọc kèm: [ThreeKingdoms.md](ThreeKingdoms.md) mục 6 (bản trung cổ của chính màn này) ·
[Shooter.md](Shooter.md) (AI bắn súng · bẫy `rangedImmune`) ·
[CivilizationIntake.md](CivilizationIntake.md) (tám điểm nối của một nền mới).

### 1. KHÔNG CHÉP TRỌNG TÀI — kế thừa nó

`ModernFrontMode : ThreeKingdomsCampMode : ThreeKingdomsMode`. Bộ khung BA PHE CÓ TƯỚNG (ba
đạo quân, ba cây chỉ huy, ba kinh đô, luật nhắm KẺ MẠNH NHẤT, quán tính `_retargetHold`, sinh
tử đột ngột, cánh vu hồi qua `RingPortal`) chỉ có MỘT bản trong dự án. Thể loại thứ hai mượn
lại qua các móc `protected virtual` thêm vào `ThreeKingdomsMode` ngày 2026-09-08:

| Móc | Đổi cái gì |
|---|---|
| `SideShortName` · `SideLongName` · `SidePickerTitle` | tên phe trên HUD và nút chọn nước |
| `PlanCount` · `PlanAt` · `PlanLabel` · `PlanHint` | năm ô thế trận đọc theo ngôn ngữ nào |
| `PlanKind` · `PlanIntent` | ô đó dịch ra `TeamFormationKind` + `CampaignIntent` nào |
| `OnPlanApplied` | **VẾ THỨ BA** — đổi luôn `CommandDoctrine` của tướng |
| `PowerOf` (nay `virtual`) | công thức đo sức |
| `WantsFlank` · `FlankLine` (ở `ThreeKingdomsCampMode`) | khi nào tách cánh đi vòng |
| `LastStandingLine` · `PlanSetLine` | câu kết ván, câu báo đổi thế trận |

⚠ Ô thế trận vẫn mang kiểu `ThreeKingdomsFormation` vì đó là kiểu của lớp cha — với mode con
nó CHỈ LÀ SỐ Ô 0..4. Inspector của `Demo_55` hiện chữ "HacDuc" cho ô 0 là BÌNH THƯỜNG; đọc tên
ô qua `PlanLabel`, đừng đọc tên enum.
⚠ Bảng nút chọn phe nay quét `_kingdoms` (phe THẬT SỰ có trong scene) chứ không quét
`ThreeKingdoms.Teams` — đó là điều kiện để mode con có bảng phe riêng.

### 2. BỐN CHỖ THUẬT TOÁN PHẢI ĐỔI VÌ ĐÂY LÀ TRẬN SÚNG

1. **SỨC ĐO CẢ THÉP VÀ ĐẤT.** `PowerOf` = (quân sống + máu sở chỉ huy × 4) **+ 2/điểm tiếp tế
   đang giữ + xe còn chạy** (bán tải 2 · thiết giáp 3 · xe tăng 5). Thiếu hai vế này thì "liên
   minh chống kẻ đang dẫn" nhắm sai người: nước mua ba chiếc xe và ôm cả ba điểm tiếp tế vẫn bị
   chấm là YẾU chỉ vì ít lính hơn. Ô trạng thái hiện thêm `◆n` = số điểm đang giữ.
2. **VU HỒI KHI BẾ TẮC, KHÔNG PHẢI THEO GIỜ.** Kỳ binh Tam Quốc tách mỗi 75 s vì trận cận
   chiến luôn tiến. Trận súng thì ngược lại — hai tuyến nấp sau vật che bắn nhau đứng yên vô
   hạn (`RangedCombatStrategy` cấm xông liều, `stalemateTimeout = 0`). Mode đo MŨI NHỌN của
   từng nước (người đứng xa nhất về phía nước bị nhắm): nhích < `_stallDistance` 3 đơn vị trong
   `_stallWindow` 14 s **và** hai bên đều còn ≥ 3 quân ⇒ tách tổ vu hồi.
   ⚠ Vế "hai bên còn quân" là bắt buộc: vừa bị quét sạch một tuyến thì mũi nhọn cũng đứng yên,
   nhưng lúc đó thứ cần là gom quân chứ không phải chia thêm một tổ đi vòng.
   ⚠ Lấy mẫu phải chạy TRƯỚC `base.TickMode()` — chính `TrySpawnWings` của lớp cha hỏi
   `WantsFlank`, đo sau là trả lời bằng số của nhịp trước.
3. **HỌC THUYẾT ĐỔI CẢ CÁCH ĐI.** Xem mục 3.
4. **XƯỞNG CƠ GIỚI THAY XƯỞNG CÔNG THÀNH.** Xem mục 5.

### 3. Năm học thuyết = ba vế, không phải một cái nhãn

`ModernDoctrine` (5 ô, `ModernNations`) dịch ra **đội hình + thế trận + học thuyết chỉ huy**:

| Học thuyết | `TeamFormationKind` | `CampaignIntent` | `CommandDoctrine` (khác bản gốc ở) |
|---|---|---|---|
| Phòng tuyến | `ShieldWall` | Hold — Press khi địch < 60 % sức mình | aggression 0.7 · defenseDepth 7 · homeDefenseRadius 18 · `keepReserve` · KHÔNG đi hầm |
| Tuyến hoả lực | `BattleLine` | Auto | focusFireRadius 11 · focusFireHold 4 |
| Thọc sâu | `AssaultColumn` | Press | aggression 1.4 · `Concentrate` một làn · pushDepth 4.5 · không dự bị |
| Gọng kìm cơ giới | `MarchColumn` | Press | `Split` hai làn · pincer 9 · đi hầm + đường trên · đi cùng xe |
| Tuỳ nghi | `Auto` | Auto | bản cân bằng của doanh trại |

- Vì sao cần vế thứ ba: trong trận cận chiến, "xếp ai trước ai sau" quyết gần hết trận đánh;
  trong trận súng ai cũng bắn được từ xa và ai cũng biết nấp, nên thứ quyết định là **ĐI ĐƯỜNG
  NÀO, DỪNG Ở ĐÂU, MẤY MŨI** — toàn số nằm trong `CommandDoctrine`, không nằm trong bảng đội hình.
- Năm asset `Doctrine_MatTran_<Tên>.asset` do builder dựng; mode giữ mảng 5 phần tử và gọi
  `TeamCommander.SetDoctrine` trong `OnPlanApplied`. Ô nào bỏ trống thì tướng giữ học thuyết cũ.
- ⚠ KHÔNG `Issue` lệnh tay (lệnh tay khoá tướng máy tới khi ai bấm «Tự động») — cùng luật Tam Quốc.

### 4. Ba điểm tiếp tế — một cho mỗi CẶP nước

`CapturePoint` + `SupplyPointIncome` 1.2 vàng/giây, `scorePerSecond = 0` (màn này thắng bằng
PHÁ SỞ CHỈ HUY; hai thang điểm cùng chạy là người chơi không biết mình đang thắng theo cái nào).

- Hai điểm ở HAI ĐÈO (±28 — đúng trung điểm hai cặp có chung mặt đất), một điểm ở CỬA VÒNG
  ĐÔNG (+78) cho cặp Kim Sơn ↔ Bắc Phong.
- ⚠ **Trung điểm của cặp đi vòng là CHỖ NỐI, mà chỗ nối thì không ai đứng được**: `RingPortal`
  dịch chuyển ngay người bước vào. Nên điểm thứ ba lùi vào trong cổng — Kim Sơn tới đó 22 đơn
  vị, Bắc Phong 28 (đi qua cổng Tây). Đừng "sửa" nó về đúng ±81.
- ⚠⚠ **BÁN KÍNH PHẢI NHỎ HƠN KHOẢNG HỞ DƯỚI CẦU.** `CapturePoint.ContainsPoint` là HÌNH TRÒN
  trong không gian 2D: hai điểm ở đèo nằm trên mặt đèo (cao 1.2) mà cầu đá ngay trên đầu
  (1.2 + 1.5 = 2.7) ⇒ bán kính **1.3 < 1.5** mới giữ được ý *"muốn tiền thì phải XUỐNG dưới mà
  giữ"*. Để 2.4 như Demo_48 là người đi trên cầu chiếm luôn cái điểm dưới chân mình.
- ⚠ `ZoneGarrisonDuty` cho CẢ BA nước + `SupplyPointCommand` cho hai nước máy (bài học Demo_48):
  cây chỉ huy lấy "vùng tranh chấp CHƯA thuộc về mình" làm mốc tuyến, nên đúng giây chiếm xong
  là cả cánh quân bỏ đi và nước kia thong thả quay lại lấy.

### 5. Xưởng cơ giới — MỘT loại công trình, HAI thứ bán

- `CampBuildKind.SiegeWorkshop` giữ nguyên. `CampBuildSite.RaiseSiegeWorkshop` hỏi
  `VehicleCatalog.Current`: có kho mẫu XE thì gắn `CampVehicleWorkshop`, không thì
  `CampSiegeWorkshop` như cũ. Thêm hẳn một `CampBuildKind` thứ hai là **sáu chỗ** phải nhớ
  (enum · tên · giá · ô đất · bảng HUD · nhánh dựng) trong khi luật công trình y hệt.
- Bảng bán: xe bán tải 22/12 · thiết giáp 36/26 · xe tăng 52/40 (vàng / vật tư), trần 2 xe
  còn sống mỗi phe. Tướng máy mua theo `CampAiStyle`: quấy rối → bán tải · tinh nhuệ → xe tăng ·
  gom quân → thiết giáp. Xe lăn về hướng nước ĐANG BỊ NHẮM (`SetTargetDirection`, trọng tài báo).
- ⚠ **Mẫu xe KHÔNG mang lính sẵn** (`troopWeapons` rỗng): `Vehicle._startingTroops` trỏ tới lính
  THẬT trong scene, nhân bản ra là nhiều xe cùng đòi nhét một anh vào ghế.
- ⚠ Xưởng phải có trong `EconomyProfile.buildings` — thiếu là `CampBuildYard` không bao giờ mọc
  ô đất cho nó, và cả `VehicleCatalog` lẫn xưởng nằm chơi tới hết trận, không lỗi nào báo.
- ⚠ Xe tăng MIỄN đạn thường (`_bulletResistance = 1`): câu trả lời là RPG — cả ba nước đều có
  quân chủng RPG trong `units`, đừng bỏ khi cân bằng lại.

### 6. Ba nước là BA NỀN VĂN MINH hiện đại

- Phe: **BẮC PHONG = 1 (xanh) · HỒNG SA = 2 (đỏ) · KIM SƠN = 4 (vàng)**. ⚠ KHÔNG dùng 3 —
  `TeamMember.ColorOf(3)` là xanh bệnh của zombie. Nguồn sự thật: `ModernNations.Teams`, thứ tự
  tăng dần chính là thứ tự `CivilizationTeamAssigner._fixedByTeam` ghim nền.
- Khoá + folder art: `NorthPact` · `RedSand` · `GoldRidge`, khai trong `ModernKeys` (art người +
  art công trình đều QUÉT bảng này) và `ModernNationKeys`. Không nền nào khai `mount`: bộ vật
  cưỡi của dự án toàn THÚ, cơ động ở đây nằm ở XE.
- Ba nón khác **ĐƯỜNG BAO**, không chỉ khác màu (sân đã có 4 nón hiện đại): Bắc Phong = vòm CAO
  hẹp + váy gáy dài + khe kính trên trán · Hồng Sa = MŨ NỒI chóp thấp bè + vạt rủ hẳn về sau ·
  Kim Sơn = MŨ TAI BÈO vành rộng bẹt. Giáp: tấm thép + ốp vai vuông · khoác cát + khăn đỏ quấn
  cổ · vest vàng rêu + dây đạn chéo. Không nền nào có KHIÊN (`shield: false` cả ba).
- Kiểm ở **44 px** trước khi mở Unity:
  `python .claude/skills/stickman-assets/scripts/helm_modern_nations.py <thư-mục-ra>` — vẽ ba nón
  mới cạnh `Army` · `Police`. Đã nhìn 2026-09-08: năm cái tách nhau (bản đầu bị "đầu máy" vì khe
  kính kéo hết bề ngang vòm, và mũ nồi cân đối chỉ còn là một vệt đỏ tròn — đã sửa bằng số).
- Art code-gen là **VẼ BÙ**. Thả PNG thật cùng tên vào `Sprites/Civilizations/NorthPact|RedSand|GoldRidge/`
  là `Save` tự chừa ra.

### 7. Bố cục Demo_55 và những cái bẫy im lặng của nó

```
CỬA VÒNG Tây −81 ══ BẮC PHONG (−56) ── đèo −28 ── HỒNG SA (0) ── đèo +28 ── KIM SƠN (+56) ══ CỬA VÒNG Đông +81
```

- Ba căn cứ cách nhau 56, đi vòng ≈ 50 ⇒ nước nào cũng phải giữ CẢ HAI mặt. Mỗi căn cứ: sở chỉ
  huy 40 máu · tường + cổng hai mặt (`_commandedOnly = false` để tướng máy tự xuất quân) · sàn
  tường có `GarrisonPost` + bao cát · hòm tiếp tế / bãi vật tư ở mặt sau · giỏ đạn · hai giếng
  xuống hầm (một trong, một ngoài cổng).
- ⚠⚠ **`SetSiegeRules(rangedImmune: false)` cho sở chỉ huy.** Mặc định `BaseBuilding` MIỄN sát
  thương tầm xa, mà map này chỉ có súng ⇒ nhà bất tử, không nước nào diệt vong, trận không có
  hồi kết và KHÔNG LỖI NÀO BÁO (đã trả giá ở `Demo_48_ModernCamp`).
- ⚠ **`GarrisonPost` phải KHAI PHE**: post trung lập bị `GarrisonDirector` bỏ qua có chủ ý ⇒ sàn
  cao thành đồ trang trí với AI bắn súng (`FindCover` loại thẳng vật che lệch tầng > 1.2).
- ⚠ **Vật che KHÔNG đặt trên hai đèo**: `StickmanShooterModeBuilder.CoverShared` neo theo
  `GroundTop` cứng, mà mặt đèo cao 1.2 — đặt lên là bao cát chìm nửa dưới đất mà AI vẫn tưởng
  mình đang nấp. Builder chỉ rải ở các quãng phẳng (±16, ±20, ±36, ±40) và ở cửa vòng.
- ⚠ **Nguồn tài nguyên phải CÓ CHỦ** (`_teamId`): tầm quét của thợ là 60 đơn vị — trên map này
  nó với sang tận hậu cứ nước bên cạnh.
- ⚠ `CivilizationLibrary` không tham số = TRUNG CỔ: builder truyền `GameGenre.Modern` cho
  `AddCivilizationAssignerShared`, thiếu là một nước ra trận mặc giáp Viking.
- Nút «Chuồng ngựa» vẫn hiện trong bảng xây (mảng `CampGameUi.BuildKinds` là TĨNH) nhưng
  `cavalryCost`/`horseCost` 9999 + `fallbackCavalryMount = null` ⇒ không mua nổi con nào.
- Mọi số luật (giờ sinh tử 900 s · ngưỡng bế tắc · trọng số sức · năm học thuyết) là field
  SERIALIZED bake vào scene — đổi mặc định trong code là **phải dựng lại Demo_55** (đã khai
  `extraSources` ở job nhóm 3 và ở tool).

### 8. Đo lại

```
Tools > Stickman > ★ Bảng điều khiển
  1. Art › «★ Vẽ bù art còn thiếu»              → nón/giáp/che mặt + FOLDER ba nền + art công trình
  2. Nhân vật › «★ 15 nền văn minh»             → QUÉT folder, dựng Civ_NorthPact/RedSand/GoldRidge
  3. Nhân vật › «★ Soát hồ sơ nền văn minh»     → phải XANH 25/25 (18 trung cổ + 4 lực lượng + 3 quốc gia)
  4. «Hiện đại — MẶT TRẬN BA NƯỚC»               → dựng Demo_55; mở, chọn nước, chọn học thuyết
  5. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»   → không thêm mục đỏ mới
```

⚠ **Thứ tự 1 → 2 là bắt buộc**: `StickmanCivilizationBuilder.BuildAssets` cố ý KHÔNG gọi
generator nào, nó chỉ QUÉT folder — chưa bù art thì folder chưa tồn tại và nền bị bỏ qua trong
im lặng. Builder của màn tự chạy đúng thứ tự này nên bấm thẳng bước 4 cũng ra, nhưng bấm tay
sai thứ tự thì «★ Soát hồ sơ» ra 22/25 mà không ai nói vì sao.

Trạng thái 2026-09-08: code biên dịch sạch (Roslyn của Unity, `Assets/Scripts` + `Assets/Editor`,
0 lỗi); ba nón đã nhìn ở 44 px bằng script Python. **CHƯA bấm các nút trên** (Unity đang mở ở
phiên khác lúc làm) — PNG · asset · scene chưa tồn tại trên đĩa cho tới khi bấm.
