# Sổ tay Luna — đẻ ra GAME HOÀN CHỈNH, và phát triển tiếp bộ khung

> Dành cho AI rẻ / ít ngữ cảnh. Skill `.claude/skills/stickman-luna/SKILL.md` dạy **năm việc
> vặt** (thêm màn · sửa số · thả art · thêm thứ mới · kiểm). File này dạy hai việc LỚN hơn mà
> skill ấy không có: **§1–§3 làm một con game hoàn chỉnh**, và **§4–§6 thêm khả năng mới cho
> bộ khung mà không làm hỏng 900 file đang chạy**.
>
> Luật nền: [CheapAI.md](../AgentRules/CheapAI.md) (chín luật giữ cho AI yếu vẫn dùng được) ·
> [GameFactory.md](../AgentRules/GameFactory.md) (xưởng game) ·
> [BlastRadius.md](../AgentRules/BlastRadius.md) (đo trước khi sửa).

---

## §0 — PHÂN LOẠI VIỆC TRƯỚC. Sai loại là sai hết

Đọc yêu cầu của user, chọn ĐÚNG MỘT dòng. Mỗi dòng là một con đường khác hẳn.

| User muốn | Đây là loại | Đi đâu |
|---|---|---|
| "địch mạnh quá", "cung yếu quá", "AI ngu" | đổi SỐ | skill Luna §B — sửa bảng, bấm lại nút |
| "thêm một màn kiểu chiếm điểm" | thêm MÀN | skill Luna §A — một file JSON công thức |
| **"làm cho tôi một con game"**, "game sinh tồn thời trung cổ", "game 5 màn có cốt truyện" | thêm **GAME** | **§1 dưới đây** — một khối JSON trong `GamePacks.json` |
| "game chơi mãi không hết", "mỗi lần chơi một kịch bản khác" | game TỰ SOẠN | **§2** — không viết gì cả, bật Chiến dịch vô tận |
| "thêm luật chơi lạ", "thêm thử thách", "cho chơi vai chỉ huy" | nhân NỘI DUNG | **§3** — thêm một dòng vào bảng, ăn cho cả 37 kiểu chơi |
| "thêm cơ chế chưa từng có" (bơi, xây, câu cá…) | thêm KHẢ NĂNG | **§4** — file mới + một điểm nối, mặc định TẮT |
| "game giật/lag khi đông quân" | PERFORMANCE | **§5** |

⚠ Bốn dòng đầu **không cần viết một dòng C# nào**. Nếu bạn đang định viết C# cho một trong
bốn dòng ấy thì bạn đang đi sai đường — quay lại đọc lại bảng.

---

## §1 — LÀM MỘT CON GAME HOÀN CHỈNH (một khối JSON, không mở Unity)

**Một game = một `GamePack`.** Nó khai: thể loại · vai người chơi · chuỗi chặng · luật · quỹ
mạng. Chạy trên map và kiểu chơi ĐÃ CÓ, nên bạn không phải dựng scene nào.

### Bước 1 — chép khối mẫu

File đích: `Assets/Resources/GamePacks.json`.

```json
{
  "packs": [
    {
      "id": "biengioi",
      "name": "Giữ biên",
      "brief": "Ba chặng: chặn quân do thám, giữ trại, rồi phá đại doanh của chúng.",
      "genre": "Medieval",
      "plane": "Side",
      "role": "Hero",
      "mutators": "veterans",
      "lives": 3,
      "rewards": true,
      "stages": [
        { "mission": "Annihilation", "title": "Quân do thám",
          "brief": "Chặn toán thám mã trước khi chúng về báo.", "mutators": "", "tier": -1 },
        { "mission": "DefendCamp",  "title": "Giữ trại",
          "brief": "Chúng biết đường rồi. Giữ trại tới khi trời sáng.",
          "mutators": "ironman", "tier": -1 },
        { "mission": "AssaultCamp", "title": "Đại doanh",
          "brief": "Tới lượt ta gõ cửa.", "mutators": "", "tier": 3 }
      ]
    }
  ]
}
```

### Bước 2 — điền năm ô, theo đúng bảng dưới

| Ô | Điền gì | ⚠ |
|---|---|---|
| `id` | chữ thường, không dấu, không cách | **THỨ NÀY ĐƯỢC LƯU.** Đổi `id` của game đã phát hành = xoá sạch tiến trình của mọi người chơi. Đổi `name`/`brief`/`stages` thì an toàn |
| `genre` | `Medieval` · `Modern` · `Fantasy` · `Wuxia` | lọc vũ khí, ngoại hình, nhạc. Kho map phải CÓ màn cho (thể loại × kiểu chơi) — xem bước 4 |
| `plane` | `Side` (màn ngang) hoặc `Ground` (mặt đất 3/4) | `Ground` chỉ chạy sau khi ai đó bấm «Maps › 8. Build SÂN MẶT ĐẤT». Không chắc thì để `Side` |
| `role` | `Hero` (cầm một nhân vật) · `Commander` (dàn trận) · `Observer` (ngồi xem) | **cùng chuỗi chặng, đổi vai là một GAME KHÁC.** Rẻ nhất để có game thứ hai |
| `lives` | thua mấy lần thì hết gói. `0` = thua thoải mái | |

### Bước 3 — chọn chặng: `mission` phải là một giá trị CÓ THẬT

Gõ sai một chữ (`"Seige"` thay vì `"SiegeStarve"`) thì **không có lỗi nào báo** — trận vẫn
chạy, chỉ là bốc một map ngẫu nhiên. Danh sách thật nằm ở `Assets/Scripts/Map/Build/MapTypes.cs`
(enum `MissionType`), **27 giá trị** (đo 2026-09-09):

```
Annihilation · DefendCamp · AssaultCamp · ProtectVip · Escort · CapturePoints · Survival
CaptureFlag · TugOfWar · RaidVillage · SiegeStarve · RescuePrisoners · ChampionDuel
FreeForAll · WarEconomy · ZombieHorde · ZombieConvoy · BattleRoyale · DragonHunt · ArcaneRift
OpenWorldCity · TeamDeathmatch · DungeonDelve · BossLair · Encircle · MobaLanes
ThreeKingdomsClash
```

⚠ **Ba giá trị KHÔNG dùng làm chặng.** `OpenWorldCity` là một thành phố để sống trong đó,
không có vạch đích — nhét vào giữa một chuỗi chặng thì người chơi đứng giữa phố không biết
bao giờ mới xong. `DragonHunt` và `ArcaneRift` (đo 2026-09-09) **chưa có map nào trong kho**,
nên mọi lời xin rơi về map ngẫu nhiên. «★ Xưởng game» ở bước 5 nói đúng cái nào còn thiếu.

Một chuỗi chặng hay có **hình dáng**: mở đầu nhỏ → giữa có biến → cao trào. Đừng xếp ba chặng
giống nhau.

### Bước 4 — chọn luật biến thể (`mutators`), nếu muốn

Mã cách nhau bởi dấu phẩy. Gói và chặng **cộng dồn**. Bảng thật ở
`Assets/Scripts/Core/Run/MatchMutators.cs`:

| Mã | Nghĩa | | Mã | Nghĩa |
|---|---|---|---|---|
| `moon` | trọng lực mặt trăng | | `glass` | ai cũng một máu |
| `heavy` | đất nặng | | `glassfoe` | **chỉ địch** một máu |
| `fastmatch` | trận tua nhanh | | `tough` | mình da trâu |
| `slowmo` | chậm như phim | | `boss` | địch dày máu |
| `berserk` | mình đánh đau hơn | | `blunt` | vũ khí cùn |
| `glasscannon` | mình chịu đòn kém | | `flurry` | loạn đả (đánh nhanh) |
| `naked` | tay trắng (trang bị cấp 0) | | `royal` | kho hoàng gia (cấp cao) |
| `veterans` | địch thiện chiến | | `rabble` | địch ô hợp |
| `greenhorns` | lính mới | | `ironman` | một mạng, không hồi sinh |

⚠ **Đổi PHE là một game khác.** `glass` (mọi người một máu) và `glassfoe` (chỉ địch một máu)
dùng chung một hiệu lực nhưng là hai trải nghiệm hoàn toàn khác nhau. Đây là trục rẻ nhất dự án.

### Bước 5 — ĐO trước khi nói xong

⚠⚠ **BẪY LỚN NHẤT CỦA FILE NÀY: `GamePacks.json` THAY THẾ, KHÔNG CỘNG THÊM.**
Có file thì kho game = **đúng những gói trong file**; ba gói gốc viết trong C#
(`nhanmon` · `demthu7` · `chinhnam`) **biến mất**. Muốn giữ chúng thì bấm nút
**«Ghi GamePacks.json»** trong ★ Xưởng game TRƯỚC — file sinh ra đã có sẵn cả ba, bạn chỉ
việc thêm gói của mình vào mảng `packs`. Đừng tự gõ một file chỉ có một gói rồi tưởng là đã thêm.

Rồi trong Unity: `Tools > Stickman > Nâng cao > Gameplay > ★ Xưởng game (gói · luật biến thể)`.
Nó soi từng chặng và trả lời ba câu: *kiểu chơi có thật không · kho map có màn nào không ·
mã luật có thật không*. Còn dòng đỏ là chưa xong. Bấm **▶ Chơi thử** để chạy thật.

Không mở được Unity thì ít nhất chạy:

```bash
python Docs/Tools/CompileCheck.py --mine
```

và báo lại cho user rằng phần đo trong Unity chưa chạy.

### Bước 6 — người chơi vào game bằng đường nào

Gói mới tự hiện ở bảng **CHỌN GAME** ngoài menu chính (`GamePackPickerHook`), và ở ngăn kéo
`⚙` trong mọi scene. Bạn **không phải nối gì thêm**.

---

## §2 — GAME TỰ SOẠN: chiến dịch vô tận (không viết một chữ nào)

User muốn "chơi mãi không hết, mỗi lần một kịch bản khác" thì **đừng viết gói**. Dự án đã có
máy soạn (`SagaAutoWriter`): nó đọc kho map + kho nền văn minh + bảng luật rồi tự viết ra gói.

Cửa vào: ngăn kéo `⚙` trong bất kỳ scene nào → **∞ Chiến dịch vô tận**.

Cả một chiến dịch dài vô hạn được lưu bằng **hai con số** (`saga.seed`, `saga.chapter`), vì hàm
soạn là hàm THUẦN. Muốn thêm nội dung cho nó thì đừng sửa máy soạn — **thêm map, thêm nền văn
minh, thêm luật**, máy soạn tự đọc và số hồi soạn được tự lớn lên. Bảng «muốn thêm gì thì nối
đâu» ở [GameFactory.md](../AgentRules/GameFactory.md) mục *CHIẾN DỊCH VÔ TẬN §6*.

---

## §3 — NHÂN NỘI DUNG: một dòng dữ liệu ăn cho CẢ 37 KIỂU CHƠI

Đây là chỗ khác nhau giữa **cộng** và **nhân**. Viết một mode mới = +1 game. Thêm một dòng
vào bốn bảng dưới đây = thêm nội dung cho **mọi** kiểu chơi đang có, cùng lúc.

| Muốn | Thêm một dòng vào | Ăn ra sao |
|---|---|---|
| Luật chơi lạ | `MatchMutators.cs` bảng `MutatorTable` | × mọi kiểu nhiệm vụ |
| Thử thách phụ mỗi ván | `MatchChallenges.cs` bảng `MatchChallengeTable` | bám lên cả 37 mode |
| Phần thưởng giữa chặng | `RunPerks` | mọi gói game |
| Vai chơi được cho một mode | `SupportedRoles` trong mode đó | × 3 |

⚠⚠ **THÊM TÊN MÀ KHÔNG THÊM NGƯỜI ÁP = BẪY ĐẮT NHẤT DỰ ÁN.** Một luật biến thể chỉ có tên và
mô tả sẽ hiện lên HUD, người chơi ĐỌC ĐƯỢC lời hứa, rồi đánh một trận y hệt mọi trận khác.
Không lỗi nào báo. Nên: mỗi `MutatorKind` phải có chỗ ÁP trong `MutatorBinder`, mỗi
`ChallengeKind` phải có chỗ ĐO trong `MatchChallengeTracker`. Doctor canh đúng hai chuyện này —
đừng bỏ qua dòng vàng của nó.

⚠ Thêm giá trị enum thì thêm **ở CUỐI**. Chèn vào giữa là đổi chỉ số, mà chỉ số được trộn vào
hạt giống ⇒ mọi bản lưu đang có đổi nội dung.

---

## §4 — KHI THẬT SỰ PHẢI VIẾT C# (thêm khả năng chưa từng có)

Bốn luật, theo đúng thứ tự. Bỏ qua luật 1 là hỏng thứ khác mà không biết.

**1. ĐO TRƯỚC.**

```bash
python Docs/Tools/BlastRadius.py <file-bạn-định-sửa>
```

`THAP` → sửa bình thường. `VUA` → sửa xong chạy `CompileCheck.py --mine`.
`CAO` = **FILE TRỤC** (hàng trăm file dựa vào): chỉ được **THÊM**, tuyệt đối không ĐỔI NGHĨA
thứ đang có. `StickmanAgent.cs` (279 file dùng) và `TeamMember.cs` (296 file) đều là trục.

**2. LÀM BẰNG FILE MỚI, KHÔNG SỬA VÀO TRỤC.** File mới chưa ai dùng ⇒ không thể làm hỏng gì.
Khuôn có sẵn để chép:
- thêm hành vi cho quân → một file `Assets/Scripts/AI/Modules/AI<Tên>Module.cs`
- thêm trạng thái AI → một file `Assets/Scripts/AI/States/AIState<Tên>.cs`
- thêm thứ tồn tại mà **không đánh nhau** (ô đất, cần gạt, hòm đồ) → `WorldThing`, đừng kế
  thừa `StickmanController`
- thêm màn hình → `ScreenSpec` + `ScreenRenderer` (khai bằng dữ liệu), **đừng viết `OnGUI` mới**
- thêm chỉ số chồng lên nhau (buff, hào quang) → `UnitStats.Of(x).<Ô>.Set("nguồn", …)`,
  **đừng ghi đè thẳng**
- cất một con số cho game của bạn → `SaveBag.Best("tênGame.số", n)`, **đừng thêm trường vào
  `PlayerProfile`**

**3. THỨ THÊM VÀO PHẢI MẶC ĐỊNH TẮT.** 95 scene đã bake không được đổi hành vi vì bạn thêm
một tính năng. Bật bằng bảng/JSON của màn cần nó.

**4. VIẾT PHÉP ĐO TRƯỚC KHI VIẾT CODE CHẠY.** Hệ mới = một `Check` mới trong `StickmanDoctor`
(khai *sai ở đâu · vì sao nguy hiểm · SỬA BẰNG CÁCH NÀO*). Đặt ở file partial riêng
`StickmanDoctor.<Tên>.cs` rồi **nối vào `AllChecks`** — quên nối là cả nhóm nằm im mà bảng vẫn XANH.

⚠ Quá 3 file cho một yêu cầu nhỏ là dấu hiệu đi sai đường: dừng, đo lại bằng BlastRadius.

---

## §5 — PERFORMANCE: bốn khuôn được phép, một khuôn cấm

Dự án chậm khi **đông quân**, không phải khi nhiều art. Chi phí nhân theo SỐ QUÂN × SỐ KHUNG HÌNH,
nên đúng một loại code giết FPS: **vòng lặp duyệt cả sổ quân, chạy mỗi khung, cho mỗi người**.

**CẤM.** Duyệt `TeamMember.All` trong `Update`, hoặc trong một hàm mà một vòng duyệt sổ khác
đang gọi. Đo thật 2026-09-09 ở `SelectBestEnemy`: trận 100 quân là **~20 000 lượt
`GetComponent` cho MỘT người, MỘT nhịp quét**. Biên dịch xanh, Doctor xanh, không lỗi nào —
chỉ có FPS tụt, mà ai cũng tưởng "đông thì chậm là đương nhiên".

**ĐƯỢC PHÉP — bốn khuôn, chép nguyên:**

| Cần | Viết |
|---|---|
| Ai quanh đây? | `TeamMember.QueryNear(x, bánKính, bộĐệm)` — chỉ duyệt vài ô lưới |
| Ai quanh đây, map VÒNG? | `TeamMember.QueryNearWrapped(...)` — bắt buộc khi phép lọc dùng `MapWrap.Distance` |
| Địch gần nhất? | `agent.FindNearestEnemy(tầm)` — đã đi qua lưới sẵn |
| Agent của một `TeamMember`? | `StickmanAgent.AgentOf(member)` — **đừng** `GetComponent<StickmanAgent>()` trong vòng lặp |

**Hai luật nhỏ, cả hai đều là lỗi có thật:**
- **So toạ độ TRƯỚC, hỏi component SAU.** Hỏi `GetComponent` cho mọi người rồi mới so `x` là
  99 % số lượt tra bị vứt đi ngay dòng sau.
- **Bộ đệm dùng lại, khai `static readonly`** — `new List<>()` mỗi khung là rác cho GC.
  Và mỗi vòng quét một bộ đệm RIÊNG: dùng chung rồi gọi lồng nhau là vòng ngoài đọc phải kết
  quả của vòng trong.

Đã cân nhắc và vẫn rẻ thì viết chú thích `per-frame-ok:` **kèm lý do** trong thân vòng —
Doctor đọc dấu ấy và thôi réo. Khai mà không đảo thứ tự là tự lừa mình.

Muốn SỐ THẬT chứ không phải suy đoán: «Rig & Kiểm tra › Đo FPS + RAM (30 giây)», đọc
`Logs/StickmanPerformance.csv`. Chi tiết ở [Performance.md](Performance.md).

---

## §6 — KIỂM TRƯỚC KHI NÓI "XONG"

```bash
python Docs/Tools/BlastRadius.py
```
```bash
python Docs/Tools/CompileCheck.py --mine
```

Dòng có «<<< CỦA BẠN» là lỗi bạn phải sửa. ⚠ Cờ ấy đánh theo `git status`, mà dự án này
thường có **nhiều phiên làm cùng lúc** — lỗi ở file bạn không hề mở là của phiên khác. Đối
chiếu tên file với thứ bạn thật sự sửa; đừng sửa file của người khác.

Chỉ sửa tài liệu (không đụng `.cs`) thì khỏi biên dịch, chạy:

```bash
powershell -File Docs/Tools/AgentContext.ps1 -Check
```

Rồi trong Unity: «★ Tự kiểm luật chơi» → «★ KHÁM SỨC KHOẺ DỰ ÁN». Chỉ sửa dòng liên quan tới
việc bạn vừa làm; dòng đỏ có sẵn từ trước thì **báo lại cho user**, đừng tự ôm.

**Báo cáo cuối gồm đúng bốn ý:** (1) sửa file nào · (2) bấm nút nào · (3) lệnh kiểm ra gì ·
(4) còn vướng gì. Không chép diff, không chép nhật ký tool.

---

## §7 — MƯỜI CÂU "KHÔNG BAO GIỜ"

1. Không sửa `Character.prefab`, không unpack prefab, không đổi PPU `stickman.png` (100).
2. Không dùng `??` / `?.` với thứ kế thừa `UnityEngine.Object` (fake-null — đã giết cả lượt dựng map).
3. Không dời class `MonoBehaviour`/`ScriptableObject` sang file khác tên (script guid rỗng, `GetComponent` trả null, **không log gì cả**).
4. Không đổi tên field `[SerializeField]` mà thiếu `[FormerlySerializedAs]` — asset mất giá trị trong im lặng.
5. Không thêm `using` tầng cao vào tầng thấp (Core → Combat → AI → Units → Gameplay → Naval → Map → Zombie → Demo). Cần hỏi ngược thì đăng ký vào sổ ở Core.
6. Không viết `OnGUI` mới cho thứ người chơi nhìn thấy — dùng `ScreenSpec` hoặc `CampUiKit`.
7. Không gõ toạ độ HUD bằng tay — xin ô qua `ScreenZones.Request(zone, "TênClass")`.
8. Không để chữ tiếng Việt lọt ra game (mặc định TIẾNG ANH) — bọc `Loc.T("khoá", "chữ tiếng Việt")`, **luôn có tham số thứ hai**.
9. Không hardcode số vào thân hàm — số vào bảng / asset / JSON.
10. Không xoá lỗi bằng cách xoá code réo lỗi. Không đoán tên hàm (`rg -n "tên" Assets/Scripts`). Không biết thì **hỏi user một câu ngắn** — đoán sai đắt hơn hỏi.

---

## §8 — SỬA XONG PHẢI BẤM LẠI NÚT, KHÔNG THÌ GAME Y HỆT LÚC CHƯA SỬA

Số nằm trong prefab/scene **đã bake** không tự đổi khi bạn sửa code. Không có lỗi nào báo.

| Sửa gì | Bấm lại |
|---|---|
| Bảng `Specs` vũ khí | `Vũ khí › Build Weapon + Projectile Prefabs` → `Bảng cân bằng` |
| JSON công thức màn | `★ Dựng MỌI màn từ công thức` |
| Bảng ngoại hình | `★ Ngoại hình nhân vật` |
| Bảng tiếng / nhạc | `Audio › 5. Sinh tiếng BÙ cho khoá còn câm` |
| `GamePacks.json` | không cần bấm gì — đọc lúc chạy |

Bảng điều khiển (`Ctrl+Alt+S`) hiện «⚠ N việc cần chạy lại» — bấm đúng những mục đỏ đó.
Thấy dòng `⚠ ĐÃ BAKE` khi chạy `BlastRadius.py` là **bắt buộc** bấm lại nút nó ghi.
