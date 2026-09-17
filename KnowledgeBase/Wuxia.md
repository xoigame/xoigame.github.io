# VÕ LÂM — QUY TRÌNH: sửa gì thì mở file nào

Luật của thể loại nằm ở [`Docs/AgentRules/Wuxia.md`](../AgentRules/Wuxia.md). File này chỉ trả
lời một câu: **muốn làm X thì mở file nào, bấm nút nào, đo lại bằng gì.**

Viết cho cả AI ít ngữ cảnh (xem [CheapAI](../AgentRules/CheapAI.md)): mỗi việc là một hàng,
mỗi hàng chỉ một chỗ sửa.

---

## 1. BẢNG TRA NHANH

| Muốn làm | Sửa ở | Rồi bấm | Đo lại bằng |
|---|---|---|---|
| Đổi **số của một chiêu** (khí, nguội, tầm, sát thương, trạng thái) | `Assets/Scripts/Core/Wuxia/MartialArts.cs` → `Specs` | — (runtime) | chơi thử Demo_61 |
| Thêm **chiêu thứ sáu** | `MartialSkill` enum + `MartialArts.Specs` + một `case` ở `MartialArtist.Strike` nếu cần hình vùng mới | — | mục 3 dưới đây |
| Đổi **bể nội lực / tốc độ hồi / khí tán** | `Assets/Scripts/Combat/Wuxia/MartialQi.cs` (field `[SerializeField]`) | — | chơi thử |
| Đổi **nội lực của một phái** | `WuxiaSects.Table` → `maxQi` | — | chơi thử |
| Đổi **bộ chiêu của một phái** | `WuxiaSects.Table` → `skills` | — | chơi thử |
| Đổi **bài quyền của một phái** | `WuxiaSects.Table` → `kataStyle` (phải trùng tên style trong bộ động tác) | «Build Action Sets» nếu thêm bài mới | nhìn lính rảnh 20–45 s |
| Đổi **khinh công** (cao bao nhiêu, mấy bước, tốn bao nhiêu) | `MartialArts.Qinggong*` (hằng số ở cuối file) | — | chơi thử |
| Đổi **trận pháp môn phái** | `WuxiaSects.KindOf` + `IntentOf` | dựng lại Demo_61 | HUD trận pháp phải thấy đổi lớp trước/sau |
| Đổi **số phái trên sân / bố cục** | `StickmanWuxiaBuilder.GateX` | «Võ lâm đại hội — Demo_61» | mở scene |
| Sửa **hình một môn phái** | `CivilizationHelmetArt.Wuxia.cs` (đầu) · `CivilizationArtGenerator.Wuxia.cs` (áo) | «★ 15 nền văn minh» | mục 2 |
| Sửa **một bài quyền** (bài dài 10–16 s) | `StickmanActionSetBuilder.WuxiaForms.cs` — sửa danh sách «thức + thời điểm» của bài đó | **«Build Action Sets»** (bắt buộc) | `python .claude/skills/stickman-assets/scripts/kata_preview.py <ra>` rồi NHÌN dải hình |
| Thêm một **thức mới** (đá, xoay, quét…) | `WuxiaForms.cs` → bộ thức ở đầu file; nhớ chép sang `kata_preview.py` | «Build Action Sets» | ảnh xem trước; |ikArm| ≤ 1.35, |bodyAngle| ≤ 41 |
| Đổi **AI múa thưa hay dày** | `Assets/Scripts/Core/Wuxia/KataPacing.cs` (mặc định), hoặc đặt `WuxiaPracticeGround` vào scene | — | Demo_66 |
| **AI không múa bài nào** | bốn cửa "đang rảnh" ở `AIKataModule.IsIdle` — thường là còn `Target` | — | thử ở Demo_66 (không có địch) |
| Sửa **một dáng ra chiêu** (`AttackBody`) | `StickmanActionSetBuilder.Wuxia.cs` · `.WuxiaAdvanced.cs` | **«Build Action Sets»** (bắt buộc) | mục 4 |
| Đổi **NHỊP ĐÁNH của một phái** (gồng sớm/muộn, lui tụ khí, sợ áp sát…) | `WuxiaSects.Table` → `style`; bảng số ở `AIMartialArtsModule.TuningOf` | — | chơi thử, nhìn phái đó đánh |
| Đổi **TUYỆT KỸ của một phái** | `WuxiaSects.Table` → `ultimate` | — | đoạt bí kíp rồi xem nút CHIÊU 3 |
| Đổi **nhịp BÍ KÍP** (hiện lúc nào, ở đâu, đọc bao lâu) | `StickmanWuxiaBuilder.ScriptureX` + tham số `WuxiaScripture.Ensure`; các field khác ở `WuxiaScripture` | dựng lại Demo_61 | chơi thử: dòng trạng thái phải hiện «★ BÍ KÍP …s» |
| Đổi/thêm **tiếng của một chiêu** | `.claude/skills/stickman-assets/scripts/sfx_martial.py` (hàm cùng tên chiêu) | chạy script → Audio › «Dựng bảng tiếng» | mục 6 |
| Thêm/sửa **map võ lâm** (kiểu chơi, bề rộng, số bục) | `StickmanMapSystemBuilder.Blueprints` → khoá `Wux_*` | Maps › «1. Build Map System» | mở kho map (F2), tab **Võ lâm** |
| **Bí kíp không hiện trên map** | đúng hành vi ở kiểu chơi có mục tiêu BIẾT ĐI hoặc có chỗ phải giữ — xem `MapAssembler.Wuxia.cs` | — | đổi sang map dàn trận / chiếm điểm / cướp cờ |
| Sửa **ba bài test thể loại** | `StickmanGenreSceneBuilder.Wuxia.cs` | Genres › «Build ALL Genre Scenes» | mở scene, đọc hint ở ô chọn scene |
| Sửa **hình quyển bí kíp** | `.claude/skills/stickman-assets/scripts/mark_scripture.py` **trước** (nhìn được ngay), rồi dán số sang `GameplayMarkArt.Scripture` | — | chạy script, nhìn tấm PNG ba cỡ |
| Thêm **binh khí võ lâm thứ năm** | 12 điểm nối ở [WeaponIntake](../AgentRules/WeaponIntake.md) | «Art · vũ khí …» | «★ Soát hồ sơ vũ khí» |
| Đổi **HÌNH hiệu ứng của một chiêu** (quạt · vệt bay · vòng…) | `Assets/Editor/Effects/StickmanEffectBuilder.Wuxia.cs` (vẽ + prefab + dòng bảng); chiêu → sự kiện ở `MartialVfx.CastEventOf` | nhìn trước: `python .claude/skills/stickman-assets/scripts/fx_martial.py <ra>` → **«Dựng bộ EFFECT (1 nút)»** (bắt buộc) | Doctor «mỗi chiêu một HÌNH» |
| Đổi **NGŨ HÀNH của một phái** / hệ số khắc | `WuxiaSects.Table` → `element`; hằng 1.25/0.85 và MÀU ở `Assets/Scripts/Core/Wuxia/MartialElements.cs` | — | nhãn hệ cạnh thanh nội lực đổi; chiêu đổi màu |
| Đổi **skin vũ khí của một phái** (kiếm tua, đao vành, côn…) | `Assets/Editor/Art/CivilizationArtGenerator.WuxiaWeapons.cs` (khung PHẢI trùng bảng `Frame`) | «★ 15 nền văn minh» | Doctor «sáu phái có … skin vũ khí»; nhìn lính ở 40 px |
| Đổi **tên chiêu bay trên đầu** (tầm hiện, thời gian, tắt) | `Assets/Scripts/Combat/Wuxia/MartialSkillCallout.cs` (hằng `ShowRadius` · `Lifetime`) | — | chơi thử |
| Đổi **khựng hình / rung camera** khi chiêu trúng | `MartialArtist.ReportImpactFeel` | — | chơi thử BẰNG người chơi (AI đánh nhau không khựng — cố ý) |
| Đổi **thanh chiêu** (cỡ ô, phím hiện) | `WuxiaPlayerControls.DrawSkillBar` | — | chơi thử |
| Thêm **môn phái thứ bảy** | mục 5 |
| Đổi **cấp nào mở mấy chiêu / nội lực bao nhiêu** | `Assets/Scripts/Core/Wuxia/MartialGrowth.cs` → bảng `Ranks` | — | Doctor «cây chiêu theo cấp đủ bốn nhánh» |
| Đổi **cây chiêu của một phái** (chiêu nào mở ở bậc nào) | `WuxiaSects.Table` → `skills` (thứ tự = thứ tự mở khoá) | — | chơi Demo_64, lên cấp xem tên chiêu báo ra |
| Thêm **chiêu thứ 16** | `MartialSkill` enum + `MartialArts.Specs` + một phái MANG nó + một nhánh `AIMartialArtsModule` + `case` ở `MartialVfx.CastEventOf` + dáng ở `StickmanActionSetBuilder.WuxiaAdvanced.cs` | «Build Action Sets» | Doctor «chiêu thức nối đủ chỗ» + «mỗi chiêu một HÌNH» |
| Đổi **đích của màn luyện công** (lên bậc nào là thắng) | `WuxiaTrainingMode._targetLevel` (builder truyền vào) | dựng lại Demo_64 | chơi thử |
| Đổi **nhịp giải đấu** (chuẩn bị, nghỉ, hồi máu người thủ đài) | `WuxiaTournamentMode` các field `[SerializeField]` | — | chơi Demo_65 |
| Đổi **THẾ TẤN của một phái** (dáng đứng nền) | `StickmanActionSetBuilder.WuxiaStance.cs` → `Stance("stance_x", …)`; tên ở `WuxiaSects.Table.stanceStyle` | **«Build Action Sets»** | Doctor «bài quyền và dáng ra chiêu» (nay soi cả thế tấn); nhìn lính đứng yên |
| Đổi **dáng vung kiếm/đao** của võ sư | `WuxiaStance.cs` → `BladeForm("jian_x"/"dao_x", …)`; ánh xạ ở `MeleeWeapon.BladeFormForSwing` | «Build Action Sets» | vung thử ở Demo_64 |
| **Võ sư đứng/chém y hệt lính trung cổ** | thiếu `MartialArtist` trên người đó (binder chưa quét tới) hoặc `stanceStyle` rỗng | — | xem mục 15 luật |
| **Dựng màn xong mà menu KHÔNG có** | builder quên `RegisterInCatalog` — menu sinh từ `DemoSceneCatalog`, `category` phải là `Gameplay` | dựng lại màn | Doctor «mọi màn võ lâm đều vào được menu» |
| Đổi **tiếng của một chiêu** | `.claude/skills/stickman-assets/scripts/sfx_martial.py` (hàm cùng tên) + `MartialArtist.SoundKeyOf` | chạy script → Audio › «Dựng bảng tiếng» | bảng đo in ra cuối script: đỉnh dBFS · vỡ · phổ Hz |
| Thêm **ô chiêu trên cụm nút cảm ứng** | KHÔNG còn khe — vòng 2 đã kín, xem `StickmanTouchInput.MartialSkillSlots` | — | — |
| **Vào game thấy ĐÚNG MỘT màn võ lâm** | không phải lỗi code — còn 4/8 nút chưa bấm | **«★ VÕ LÂM — dựng TẤT CẢ (1 nút)»** | bảng đo cuối phải đủ 9/9; kho map (F2) tab Võ lâm có 9 map |
| **AI không ra chiêu nào cả ván** (người chơi bấm Q/E thì vẫn có) | `AIMartialArtsModule.Resolve` nhớ `null` vĩnh viễn — xem [Wuxia mục 11](../AgentRules/Wuxia.md) | — | Doctor «AI hỏi lại võ công sau khi binder cắm» |
| Đổi **số sát thương bay lên** (tắt, đổi cỡ, đổi màu khắc hệ) | `MartialSkillCallout.ShowDamage` | — | chơi thử BẰNG người chơi (số chỉ hiện khi mình dính vào) |
| **Không chắc mình quên chỗ nào** | — | «★ KHÁM SỨC KHOẺ DỰ ÁN» | nhóm «Võ lâm» trong bảng phải XANH |

---

## 2. NHÌN HÌNH TRƯỚC KHI MỞ UNITY

Art vẽ bằng code hỏng TRONG IM LẶNG. Trước khi bấm nút sinh art, chạy:

```
python .claude/skills/stickman-assets/scripts/helm_wuxia.py <thư-mục-ra>
```

Nó xuất hai tấm:

- `helm_wuxia_sheet.png` — sáu cái ở 256 px (xem chi tiết);
- `helm_wuxia_44px.png` — **sáu cái đặt lên đầu ở cỡ thật trong game**.

**Chỉ tấm thứ hai mới quyết định.** Ba lỗi bắt được ở đúng bước này (2026-09-08) đều KHÔNG thấy
được ở khổ lớn:

| Triệu chứng ở 44 px | Nguyên nhân | Sửa |
|---|---|---|
| Võ Đang thành "đầu trần có đai lam" | tóc `C(38,36,40)` gần như đen mà đầu stickman **vốn đã đen** | tóc sáng lên `C(92,96,112)` |
| Nga Mi có một tấm vải lết theo người | vạt khăn dài 76 px (tới ngang hông) | rút còn 44 px |
| Ma giáo mọc hai cái râu anten | sừng dài 30–42, dày 7 | ngắn lại 26–36, dày 13 |

⚠ Số trong file Python **trùng công thức** với file C#; sửa một bên phải sửa bên kia. Sửa Python
trước (nhìn được ngay), rồi dán số sang C#.

---

## 3. THÊM MỘT CHIÊU THỨC

SÁU chỗ, theo đúng thứ tự (đợt hai thêm hai chỗ cuối):

1. `MartialSkill` (enum, `Assets/Scripts/Core/Wuxia/MartialArts.cs`) — thêm giá trị vào **CUỐI**.
2. `MartialArts.Specs` — thêm một phần tử **cùng thứ tự với enum** (`SpecOf` tra bằng chỉ số).
   Cập nhật `SkillCount`. Khai `shape` (`MartialShape`) và `bodyStyle`.
3. Nếu chiêu dùng một **hình vùng đánh MỚI** (không phải `Fan` / `Line` / `Circle` / `FarBox` /
   `Self` / `Ally`) thì thêm giá trị vào `MartialShape` và một nhánh ở `MartialArtist.Strike`.
4. Cho phái nào dùng: `WuxiaSects.Table` → `skills` (chiêu nền) hoặc `ultimate` (tuyệt kỹ).
5. **Một nhánh trong thang của `AIMartialArtsModule`** — không có thì chỉ người chơi biết dùng.
6. **Một dáng `AttackBody/<bodyStyle>`** trong `StickmanActionSetBuilder.Wuxia.cs`, rồi bấm
   «Build Action Sets». Thiếu thì `Pick` bốc ngẫu nhiên một dáng khác, im lặng.

Bấm «★ KHÁM SỨC KHOẺ DỰ ÁN» xong: nhóm «Võ lâm» canh đúng ba cửa 2 · 4 · 5 và cả cửa 6.

⚠⚠ **Chiêu mới phải mở một TRỤC MỚI, không chỉ khác con số.** Bốn chiêu đợt hai mỗi cái mở một
trục: vùng chết · lực ngược chiều · tự di chuyển · quét người cùng phe. Không nói được nó trả
lời câu hỏi chiến thuật nào mà tám chiêu kia không trả lời được thì **đừng thêm**.

⚠ `_readyAt` là mảng cỡ `MartialArts.SkillCount` — quên cập nhật hằng số đó là `IndexOutOfRange`
ngay lần đầu ra chiêu mới. (Doctor nay bắt được chỗ này trước khi chạy.)

---

## 4. SỬA MỘT BÀI QUYỀN / DÁNG RA CHIÊU

File: `Assets/Editor/Rig/StickmanActionSetBuilder.Wuxia.cs`. Sau khi sửa **phải bấm
«Build Action Sets»** — bộ động tác đã bake trên đĩa không tự biết code đã đổi.

Hai trần không được vượt (vượt là clip nằm trong asset mà **không bao giờ xuất hiện**, không lỗi
nào báo):

| Trần | Số | Vì sao |
|---|---|---|
| Góc thân | **< 66°** thực dụng | `StickmanActionSet.SpinThreshold` là 110°, nhưng bộ Boss có `scale 1.6` ⇒ 66 × 1.6 = 105.6. Vượt là clip bị coi là "xoay trọn vòng" và bị loại khỏi bảng bốc. |
| Độ dài `ikArm` | **≤ 1.35** | tầm với hai khúc xương tay là 1.469; `ClampToReach` cắt ở 95%. Vượt là tay DUỖI ĐƠ — đọc ra "cánh tay gãy". |

Bốn bài quyền khác nhau ở **NHỊP**, không ở toạ độ — đó mới là thứ mắt đọc ra "môn phái":

| Bài | Nhịp | Thủ pháp |
|---|---|---|
| `dragon` Hàng long | nặng, **dừng hẳn** ở mỗi chưởng | hai khung cách nhau 0.14 s ngay sau mỗi nhát |
| `taichi` Thái cực | chậm đều 4.4 s, **không có khung lặng nào** | mỗi khung là một điểm trên một đường liên tục |
| `sword` Kiếm quyết | nhanh, sáu nhát ngắn | tay TRÁI giữ nguyên thế kiếm quyết suốt bài |
| `drunk` Tuý quyền | **không đều** | đổ 0.22 s → treo 0.6 s → bật lại |

⚠ Mọi clip trong file này để `weight = 0` **trừ bốn bài quyền**. `AttackBody` là dáng thân của
MỌI cú đánh trong game; để `> 0` là anh cầm rìu hai tay thỉnh thoảng lại trầm tấn phát chưởng.

---

## 5. THÊM MỘT MÔN PHÁI (phái thứ bảy)

TÁM điểm nối, thiếu điểm nào cũng **không có lỗi nào báo**:

| # | Nối ở đâu | Quên thì hỏng thế nào |
|---|---|---|
| 1 | `TeamMember.ColorOf` — thêm một `case` màu mới | phái mới ra màu XÁM trung lập, nhìn như NPC không phe |
| 2 | `WuxiaSects` — hằng số phe + `Teams` + một phần tử `Table` (nối **CUỐI**) | không có bộ chiêu, không có bài quyền, không có nền |
| 3 | `StickmanCivilizationBuilder.Specs` — một `CivSpec` với `genre = GameGenre.Wuxia`, nối **CUỐI** | không có `Civ_<Khoá>.asset` ⇒ builder DỪNG |
| 4 | `CivilizationHelmetArt.Wuxia.cs` + `CivilizationArtGenerator.Wuxia.cs` + gọi trong `WuxiaGear()` | mục «Vẽ bù art» đỏ; lính mặc đồ nền khác |
| 5 | `helm_wuxia.py` — bản Python để nhìn ở 44 px | không kiểm được hình trước khi mở Unity |
| 6 | `StickmanWuxiaBuilder.GateX` — thêm một toạ độ sơn môn, nới `NewSceneShared` | phái mới không có chỗ đứng trên sân |
| 7 | `Sect.style` (`MartialStyle`) — nhịp đánh của phái | phái mới đánh theo nhịp mặc định, nhìn không phân biệt được với phái nào |
| 8 | `Sect.ultimate` + `Sect.kataStyle` (bài quyền PHẢI có clip thật) | không có tuyệt kỹ để đoạt; bài quyền rơi về bốc ngẫu nhiên |

⚠ **Số phe theo thứ tự TĂNG DẦN chính là thứ tự `CivilizationTeamAssigner._fixedByTeam` ghim
nền** — chèn một số vào giữa là đổi luôn ai mặc áo gì của mọi phái sau nó.

⚠ **Đừng dùng số phe 3** — `TeamMember.ColorOf(3)` là xanh bệnh của zombie.

---

## 6. CHUỖI NÚT ĐẦY ĐỦ (từ project trắng)

```
Tools > Stickman > ★ Bảng điều khiển
  1. Nhân vật › «★ 15 nền văn minh»            → art + asset sáu môn phái
  2. Vũ khí   › «Art · vũ khí · nhân vật …»    → 4 binh khí + 4 tấm art
  3. Rig      › «Build Action Sets»            → 9 clip võ lâm
  4. «Võ lâm đại hội — Demo_61»                → dựng màn
  5. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»  → không thêm mục đỏ mới
```

Trong trận: `Q` chiêu 1 · `E` chiêu 2 · **giữ `R`** vận công · phím NHẢY **khi đang trên không**
= khinh công. Trên điện thoại: ba nút KHINH CÔNG · CHIÊU 1 · CHIÊU 2 trong cụm nút bên phải
(chỉ hiện ở màn võ lâm).

---

## 7. TRIỆU CHỨNG → CHỖ SỬA

| Thấy gì trên sân | Nguyên nhân hay gặp nhất |
|---|---|
| Cả sân đánh như dân thường, không ai ra chiêu | thiếu `WuxiaSectBinder` trong scene, hoặc `AIModuleKind.MartialArts` bị gỡ khỏi playbook |
| Đợt lính đầu biết võ, đợt hai thì không | binder đặt `_rescanInterval = 0` (chỉ cắm một lần) |
| Chọn Thiếu Lâm mà vẫn phóng kiếm khí | binder không chạy lại sau khi đổi phe — kiểm `_rescanInterval` |
| Ra chiêu mà không thấy gì xảy ra | hết nội lực (thanh lam ngọc), hoặc chiêu đang nguội, hoặc kiếm khí mà tay không cầm cây có lưỡi |
| AI đứng đơ một chỗ giữa trận | đang **vận công** — đúng hành vi; nó thôi ngay khi thấy địch |
| AI đốt sạch nội lực, không bao giờ ra chiêu | khinh công bị gọi quá dễ — kiểm hai cửa `targetIsHigh` / `airborneChase` ở `AIMartialArtsModule` |
| Lính võ lâm đứng chống ngựa bằng roi xích | `ChainWhip` bị khai nhầm `WeaponClass.Polearm` |
| Tuyến đầu không ra chiêu được | quân chủng đó bị cho `shield: true` ⇒ khoá tay trái |
| Bài quyền của cả sáu phái giống nhau | chưa bấm «Build Action Sets», hoặc `kataStyle` sai tên style |
| Nhân vật ăn sát thương rơi sau mỗi lần khinh công | `_glideSeconds` quá ngắn, hoặc `_glideFallSpeed` > 11 |
| **Bí kíp không bao giờ hiện** | scene dựng TRƯỚC đợt hai — dựng lại «Võ lâm đại hội — Demo_61» |
| **Bí kíp hiện mà không ai tới tranh** | phái đó đang ở thế `Hold` (Thái Cực trận), hoặc đã học tuyệt kỹ rồi (`OwnedBy` trả true — đúng hành vi) |
| **Đọc mãi không xong** | có hai phái cùng đứng trong vùng ⇒ GIẰNG CO; dòng trạng thái ghi rõ |
| **Đoạt bí kíp rồi mà không có nút CHIÊU 3** | `WuxiaSectBinder` không nghe được sự kiện — kiểm binder có trong scene và `WuxiaScripture.Learned` còn được đăng ký |
| **Ra chiêu vẫn câm** | chưa bấm Audio › «Dựng bảng tiếng» sau khi sinh `Assets/Sounds/SFX/Martial/*.wav` |
| **Sáu phái vẫn đánh giống nhau** | `Sect.style` chưa khai (rơi về `Balanced`), hoặc binder chưa quét lại |

---

## 8. TIẾNG CỦA CHIÊU THỨC

Mười khoá `Martial/*` — sinh bằng code vì gói SFX ngoài không có tiếng nào cho chưởng lực, hấp
tinh hay tiếng hô hiệu lệnh.

```
python .claude/skills/stickman-assets/scripts/sfx_martial.py               # ghi vào Assets
python .claude/skills/stickman-assets/scripts/sfx_martial.py <thư-mục-tạm> # nghe thử + xuất PNG
```

Rồi bấm `Tools > Stickman > Nâng cao > Audio > «Dựng bảng tiếng (Sound Bank)»`.
Khoá = đường dẫn dưới `Assets/Sounds/SFX` bỏ đuôi, nên `Martial/Palm.wav` thành khoá
`Martial/Palm` — đúng khoá `MartialArtist.SoundKeyOf` gọi.

⚠⚠ **AI KHÔNG NGHE ĐƯỢC.** Script in bảng ĐO và (khi xuất ra ngoài `Assets/`) vẽ dạng sóng ra
PNG để NHÌN, nhưng chốt "nghe được chưa" vẫn phải là tai người. Số đo lần dựng đầu:

| Khoá | Dài | Đỉnh dBFS | Trọng tâm phổ |
|---|---|---|---|
| `Martial/IronShirt` | 1.00 s | −1.94 | 201 Hz (ù trầm) |
| `Martial/Palm` | 0.42 s | −1.31 | 336 Hz (khối khí) |
| `Martial/RallyCry` | 1.10 s | −1.41 | 1.4 kHz (cồng) |
| `Martial/StarPull` | 0.75 s | −1.51 | 1.5 kHz (hút, trượt LÊN) |
| `Martial/SkyDive` | 0.80 s | −1.11 | 2.3 kHz (rít + nện) |
| `Martial/WhirlKick` | 0.82 s | −1.51 | 3.3 kHz |
| `Martial/SwordAura` | 0.55 s | −1.41 | 3.7 kHz |
| `Martial/Scripture` | 1.50 s | −1.94 | 9.5 kHz (chuông) |
| `Martial/DartRain` | 0.36 s | −1.72 | 10.2 kHz (nhiều mũi) |
| `Martial/Acupoint` | 0.12 s | −1.94 | 11.1 kHz (tách) |

⚠ Trọng tâm phổ trải từ 201 Hz tới 11 kHz là CỐ Ý: chín chiêu bay ra cùng lúc trong một trận 60
người mà cùng một dải thì tai không tách ra được cái nào là cái nào. Đo lại bằng chính script.

⚠ `lowpass` / `bandpass` của `sfx.py` là bộ lọc MỘT CỰC — cắt ở 900 Hz mà trọng tâm vẫn ra
4.2 kHz. Muốn tiếng ĐỤC thật thì phải `order=2..3`. Đây đúng là chỗ mà phép đo cứu được cái tai
không có: nghe thì "hình như hơi xì", đo thì thấy ngay.