### ⚠⚠ THÀNH LẮP GHÉP — `FortKit` (2026-09-04, user: *"tool tự động xây thành ngẫu nhiên CHÍNH XÁC"*)

Toà thành của màn thủ/công làng và của mọi map thủ trại KHÔNG còn gõ tay toạ độ. Nó được
LẮP từ CHI TIẾT rời theo SEED, tự kiểm luật trước khi có một GameObject nào, và dùng CHUNG
cho scene bake lẫn map sinh lúc chạy. Chi tiết: `Docs/KnowledgeBase/FortKit.md`.

| Tầng | File (`Assets/Scripts/Map/`) | Vai |
|---|---|---|
| CHI TIẾT | `FortPieces.cs` | `FortPieceDef` — một dòng = một kiểu tường/tháp/cổng; `FortPieceSet` asset bake từ `DefaultPieces()` (**code là nguồn sự thật**) |
| KẾ HOẠCH | `FortPlan.cs` | chi tiết đã đặt chỗ theo trục `s` (quãng từ ĐÌNH theo hướng địch) + `Validate()` 9 luật |
| XẾP | `FortPlanner.cs` | `Generate(request)`: bốc theo seed · xếp NỐI TIẾP · tự BỎ BỚT cho vừa `maxReach` |
| LẮP | `FortAssembler.cs` | `Build(plan)` → `FortBuild` (mọi toạ độ màn cần) qua primitive `MapCastle.BuildCastleWall / BuildWatchtower / BuildVillageGate / BuildGate` |

**Bố cục LUÔN một thứ tự** (game một làn ⇒ vật cản nối tiếp):
`ĐÌNH → sân trong → [tháp trong] → CỔNG → sân ngoài (chân cầu thang) → TƯỜNG + sàn gỗ → [tháp ngoài] → … địch`.
Ba luật `Validate()` đo lại từng cái: **CỔNG là chốt chặn DUY NHẤT** (tường đi xuyên, tháp
thân trigger, cả hai KHÔNG PHÁ ĐƯỢC — chỉ cổng + đình) · **TƯỜNG đứng NGOÀI cổng** (thang
công thành tựa mặt ngoài; cầu thang trong đổ xuống sân ngoài, cách cổng ≥ 2.0) · **thang
tháp không lọt vào khối đặc nào**.

⚠ **Chi tiết là DỮ LIỆU, không phải prefab.** Mỗi lần đặt phải đo lại theo x · chiều cao ·
phe · art nền văn minh (`StructureSkin` khoác lúc chạy), prefab đông cứng vẫn phải chạy lại
đúng phần setup đó. Thêm kiểu = **thêm MỘT dòng** `DefaultPieces()` rồi bấm *Bộ chi tiết thành*;
planner bốc theo `kind` + `minSize` + `weight`, không sửa dòng nào khác. Tủ kính
`Demo_39_FortPieces` bày mọi chi tiết có nhãn + một toà thành mẫu.

⚠ **`Demo_26_Raid` đọc `Assets/Settings/Forts/FortLayout_VillageRaid.asset`** (seed · cỡ ·
chi tiết gọi đích danh · `hallX`) — asset nằm trong `extraSources` của màn nên đổi seed trong
**Xưởng dựng THÀNH lắp ghép** (`StickmanFortStudio`: xây thử → kiểm luật → 💾 lưu → Dựng lại)
là Bảng điều khiển báo màn cần dựng lại. Mọi toạ độ khác của màn (đình, nhà dân, quân thủ,
trại cướp, thang, máy) đọc từ `FortBuild` (`defendersNearGateX`, `BeyondOuterEdge`,
`LadderPlantX`, `LadderHeight`) — **đừng gõ toạ độ chết trở lại**. Mép ngoài không quá x = −14
(`RaidOuterLimitX`): trại cướp + hai thang + máy phá cổng cần ~12 đơn vị đất trống.

⚠ **Map runtime**: `MapCastle.Build(…, seed, maxReach, pieces)` — seed = seed ván ^ phe,
`maxReach = |tuyến địch − trại| − 8` (không vươn tới chỗ sinh quân địch), `pieces` từ
`MapLibrary.fortPieces` (null = bảng trong code). Cỡ thành chọn theo `maxReach` (<17 Small,
<24 Small/Medium, còn lại Medium/Large). Assembler `Reserve` khối tường/cổng/tháp và `AddRamp`
cầu thang vào `Layout` nên `SafeX`/`SurfaceY` biết thành.

⚠ **Kiểm**: vét cạn 1 800 tổ hợp chi tiết (bản mô phỏng Python cùng công thức) ra **0** vi phạm;
tool *Soi 90 tổ hợp* chạy `Validate()` trên 30 seed × 3 cỡ rồi dựng 9 toà vào scene tạm và
chạy `MapBuildRules`. Bấm nó sau mỗi lần sửa bảng chi tiết hay planner. Nhớ:
`StickmanStairs.All` KHÔNG điền trong edit mode nên `MapBuildRules` trong Editor không thấy cầu
thang qua registry — `FortPlan.Validate()` mới là chỗ kiểm chân cầu thang/khoảng cách tháp.

`StickmanFortBuilder` (Editor) vẫn dùng cho thang công thành · máy công thành · lồng treo ·
thềm · các scene KHÔNG phải làng (Demo_3 tuyến công sự, Demo_28, Demo_32). Toà thành thì đi
`FortAssembler`; đừng viết bản `CreateGatedCastle` thứ ba.

⚠⚠⚠ **ASSET GHI RA THIẾU `m_Script` = TOOL "CHẠY KHÔNG ĐƯỢC", VÀ BẢNG ĐỎ VĨNH VIỄN**
(dính 2026-09-05, người dùng báo *"tool chạy không được"*).

Bấm nút → asset **ghi ra file thật, đủ số liệu trong YAML** → nhưng `m_Script: {fileID: 0}`.
Hệ quả dây chuyền, không một dòng lỗi nào:
· `StickmanToolbox.Tool.IsDone` đo bằng **`AssetDatabase.LoadAssetAtPath`** (không phải
  `File.Exists`) ⇒ asset không nạp lại được ⇒ mục **ĐỎ VĨNH VIỄN**, bấm bao nhiêu lần cũng
  vậy — đọc ra đúng là *"bấm không ăn"*;
· `MapLibrary.lotSet` / `.fortPieces` giữ một tham chiếu RỖNG ⇒ planner lặng lẽ rơi về bảng
  mặc định trong code, tức sửa asset xong **không có gì đổi cả**.

⚠ **CÁCH NHẬN RA TRONG MỘT BƯỚC — đọc thẳng YAML, đừng đoán:**
`grep m_Script <asset>` ⇒ `{fileID: 0}` là hỏng, có `guid:` là lành. Đối chiếu GUID đó với
`<Class>.cs.meta`. Ở đợt này `FortLayout_VillageRaid.asset` (tạo hôm trước) có GUID đúng còn
hai asset tạo cùng phiên thì `0` — chính chỗ lệch đó chỉ ra vấn đề nằm ở LÚC TẠO, không ở code.
⚠ Đã LOẠI TRỪ được: assembly cũ (mọi nguồn cũ hơn DLL), `StartAssetEditing` còn sót (không còn
chỗ nào gọi), `.cs.meta` cụt (cả dự án đều 2 dòng, kể cả file đang chạy tốt).
⚠ **KHÔNG kết luận chắc được nguyên nhân phía Unity** — luật "class phải trùng tên FILE" là
nghi phạm số một, nhưng `GenreDefinition` nằm trong `GameGenre.cs` (cũng lệch tên) lại có GUID
đúng, nên nó không giải thích được hết. Đã làm cả hai vế an toàn: **tách class ra file trùng
tên** (`MapLotSet.cs`, `FortPieceSet.cs` — đúng luật §Modules "ĐỪNG dời class
MonoBehaviour/ScriptableObject sang FILE khác") và **xoá asset hỏng cho tool sinh lại**.

⚠⚠ **CHỐT CHẶN, để lần sau nó không im lặng nữa** (`StickmanFortKitBuilder.VerifyLoadable`
+ nhánh tương ứng trong `StickmanMapKitBuilder.BuildLotSet`): ghi asset xong thì **HỎI LẠI
`LoadAssetAtPath`**, null thì `LogError` kèm tên file và cách sửa. Đây đúng luật đã ghi ở
`StickmanDoctor`: *gặp một bẫy hỏng-trong-im-lặng thì VIẾT MỘT PHÉP ĐO trước, viết đoạn ⚠ sau*.
**Tool nào `CreateAsset` một `ScriptableObject` thì phải có chốt này** — không thì nó lại rơi
vào đúng vòng "bấm mãi vẫn đỏ".


## Tường thành có BA kiểu lối lên — thẳng · chữ chi · thang đứng (2026-09-07)

`MapCastle.BuildCastleWall(…, access: WallAccess)` · `FortPieceDef.access` (`WallAccessPick`, mặc
định `Any` = 45% thẳng · 35% chữ chi · 20% thang đứng, tất định theo seed toà thành). Số đo chữ
chi là MỘT nguồn `MapCastle.PlanZigZag` — tường thành và công trình lắp ghép (`StructureKit`
V11c) cùng đọc, chiếu nghỉ 1.9 rộng, sàn một chiều (`BuildLanding`).

- Chữ chi: chân chặng dưới (`stairsFootX`) nằm GIỮA cụm, mép xa (`stairsFarX`) mới là hết dốc —
  `FortAssembler` dùng `stairsFarX` cho `AddRamp`/`Reserve`; `GarrisonPost.accessOffsetX` vẫn
  trỏ chân chặng dưới, `AIStateGarrison.FollowStairsRoute` lo phần đi hai chặng.
- Thang đứng: trục cách mặt trong 0.3 + SÀN GỖ MỘT CHIỀU nhô 0.9 phủ qua trục (1b-TER); post
  nhận `ladder` nên cung thủ trèo như tháp canh. `CastleWallInfo.ladder/access/stairsFarX` mới.
- Thang thẳng không đổi một số nào — toà thành cũ cùng seed vẫn ra như cũ **trừ** kiểu lối lên
  (seed bốc lại). Muốn giữ y nguyên thì ép `access = Straight` trong `FortPieceSet`.


## ⚠⚠ BỘ CHI TIẾT RỖNG = HAI PHE SINH CÙNG MỘT CHỖ (2026-09-08)

User: *"chế độ công và thủ làng 2 team đang sinh ra cùng 1 chỗ"*. Chuỗi nhân quả, không một
dòng lỗi nào ở giữa:

```
FortPieceSet_Medieval.asset trên đĩa có 0 chi tiết
  → FortPlanner không xếp được gì (plan.placed rỗng)
  → FortAssembler.Build chỉ tạo nút gốc `Lang_LapGhep_seed2026`
  → FortBuild.gateX GIỮ MẶC ĐỊNH 0  ← chỗ hỏng thật sự
  → builder đặt tổ giữ cổng ở gateX + 0.9…2.9 và NGƯỜI CHƠI ở gateX + 1.5
  → cả phe thủ sinh ở x ≈ 1–3, đúng chỗ trại cướp (x = 1) và toán cướp (x = 2…11)
```

Đo trên scene hỏng: `Demo_26_Raid.unity` có nút gốc `*_LapGhep_seed*` mà **không một
`Fortification` nào** — trong khi `DinhLang` vẫn ở x = 16, `HoiSinh_Phe1` ở 18, `HoiSinh_Phe2`
ở 4. Tức hai điểm HỒI SINH vẫn đúng; chỉ quân ĐỨNG SẴN lúc mở màn là chồng nhau.

**Bốn chốt chặn đã thêm** (cái đầu là chỗ SÂU NHẤT, ba cái sau là lưới đỡ):

0. **`FortPlanner.Generate` rơi về bảng mặc định khi bộ chi tiết RỖNG, không chỉ khi NULL**
   (`Usable(set)`). Đây mới là chỗ sửa thật: mọi đường dựng thành đều đi qua nó — scene bake,
   Xưởng dựng thành, và **map sinh lúc chạy** (`MapCastle`, nơi không có tool nào canh giúp).
   Đúng luật đã ghi ở `FortPieceSet`: *code là nguồn sự thật, asset chỉ là bản bake*.
1. **Hỏi NỘI DUNG, đừng hỏi tham chiếu.** `StickmanFortKitBuilder.HasPieces(set)` (`pieces != null
   && Count > 0`) thay cho `pieces == null` ở `EnsureRaidLayout` và `PlanRaid`. Asset rỗng vẫn
   khác `null`, nên `EnsurePieceSet()` — vốn đã kiểm đúng — chưa bao giờ được gọi.
2. **Ghi xong phải HỎI LẠI ĐĨA** (`VerifyPiecesLanded`): `LoadOrCreate` ghi ra asset RỖNG trước,
   `ResetToDefaults` + `SetDirty` mới điền sau — một lần domain-reload chen vào giữa (phiên khác
   đang sửa code) là phần điền bay mất. Nay nạp lại từ đĩa, rỗng thì ghi lại rồi mới kêu đỏ.
   Cùng họ với `VerifyLoadable` ở trên: **tool nào `CreateAsset` thì phải hỏi lại cái vừa ghi**.
3. **KHÔNG BAKE TIẾP khi thành không có cổng.** `StickmanMedievalModeBuilder.BuildRaid` dừng và
   `LogError` nếu `fort.gate == null` — bản cũ chỉ log `plan.Validate()` rồi **đi tiếp**, nên một
   scene hỏng vẫn được ghi đè lên scene lành. Dừng thì scene cũ còn nguyên trên đĩa.

**Phép đo tự động:** `StickmanDoctor` mục *«Toà thành lắp ghép bake ra RỖNG»* — quét YAML mọi
scene, có nút gốc `_LapGhep_seed` mà không có GUID của `Fortification` là ĐỎ.

**Dựng lại toà thành LÚC CHẠY** (`VillageLayoutShuffle`, 2026-09-08): `FortPlanner` +
`FortAssembler` chạy được ngoài Editor, nên `Demo_26_Raid` bốc bố cục thành mới mỗi ván theo
seed `GameRun`. Luật bắt buộc của kiểu dùng này: **ghim một cái neo và dịch cả toà thành về
neo đó** (ở đây là CỔNG), vì scene bake đo mọi chỗ đứng từ `FortBuild.gateX`. Và **thà giữ bản
bake còn hơn dựng ra một toà thành hỏng** — `Validate()` có lỗi, thiếu `MapLibrary`, hay lắp
xong không có cổng thì bỏ qua, mỗi trường hợp một `LogWarning`. Chi tiết: `Gameplay.md` §4a-lang.

**Chữa scene đang hỏng:** bấm «Cổng + tháp vào scene gameplay Trung cổ» (hoặc menu
*Demo Scenes › 13. Village Raid*) — nay nó tự dựng lại bộ chi tiết trước khi xếp thành.
`FortPieceSet_Medieval.asset` cũng đã được khai vào `extraSources` của tool đó, nên lần sau
asset đổi/hỏng là bảng điều khiển báo phải dựng lại.

## ⚠⚠ NGUYÊN NHÂN THẬT của "bộ chi tiết rỗng": MẤT `[System.Serializable]` (2026-09-09)

Bốn chốt chặn ở trên là lưới đỡ — chúng che triệu chứng nhưng không chạm tới chỗ hỏng.
Đo lại ngày 2026-09-09: `FortPieceSet_Medieval.asset` **vẫn rỗng** (19 dòng, KHÔNG CÓ cả
trường `pieces`), dù nút «Bộ chi tiết thành lắp ghép» báo đã ghi 12 chi tiết.

Chỗ hỏng nằm trong `Assets/Scripts/Map/Fort/FortPieces.cs`: có lần sửa chèn `enum WallAccessPick`
**vào giữa** khối chú thích của `FortPieceDef` và dòng `public class FortPieceDef`, nên thuộc
tính `[System.Serializable]` rơi sang cái enum. C# chấp nhận (enum gắn attribute là hợp lệ)
⇒ **biên dịch XANH**, nhưng Unity không serialize lớp thường ⇒ `List<FortPieceDef> pieces`
không bao giờ xuống đĩa.

```
[System.Serializable] rơi sang enum
  → pieces không được serialize → asset luôn RỖNG sau mỗi domain-reload
  → FortPlanner dùng FallbackPieces (lưới đỡ số 0) — thành vẫn mọc, không ai kêu
  → mỗi lượt dựng scene lại EnsurePieceSet → ghi lại asset SAU khi scene đã lưu
  → Bảng điều khiển: «Cổng + tháp vào scene gameplay Trung cổ» VÀNG VĨNH VIỄN
     (nguồn `FortPieceSet_Medieval.asset` luôn mới hơn 4 file scene) — bấm bao nhiêu lần cũng vậy
```

**LUẬT:** lớp dữ liệu nằm trong asset phải có `[System.Serializable]` **dính liền dòng
`public class`**. Chèn type mới thì chèn TRÊN khối chú thích, đừng chèn giữa chú thích và lớp.

**Vì sao phiên gác 2026-09-08 không bắt được:** `VerifyPiecesLanded` hỏi
`AssetDatabase.LoadAssetAtPath` — trả đúng đối tượng đang nằm trong bộ nhớ, cái vừa
`ResetToDefaults()` xong nên luôn đủ 12 chi tiết. Nay nó đọc **văn bản file `.asset`**
(`PiecesOnDisk`): bắt được cả `pieces: []` lẫn "không có trường `pieces`", và câu báo đỏ chỉ
thẳng vào thuộc tính thiếu. **Tool `CreateAsset` xong phải hỏi ĐĨA, không hỏi BỘ NHỚ.**
