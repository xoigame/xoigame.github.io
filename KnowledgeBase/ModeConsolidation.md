# Rà soát 50 chế độ chơi — cái nào sáp nhập được, cái nào KHÔNG (2026-09-16)

> User: *"tổng hợp lại tất cả chế độ chơi đang có xem cái nào xác nhập được thì xác nhập lại"*.
> Đây là bản đo, không phải bản cảm giác. Ai định gộp mode lần sau: **đọc mục 3 trước** — ba
> phép gộp "hiển nhiên" ở đó đều SAI, và dự án đã từ chối chúng có lý do ghi sẵn trong code.

## 1. Kiểm kê (đo 2026-09-16)

**50 mode · 20 091 dòng** (`class … : MatchModeBase` hoặc `: ArcadeModeBase`).

| Cỡ | Mode |
|---|---|
| > 700 dòng | `CampaignBattleMode` 1304 · `VillageRaid` 1270 · `PrisonerRescue` 1085 · `ThreeKingdomsMode` 943 · `MobaLaneMode` 795 · `ArenaMode` 784 |
| 400–700 | `BombDefusalMode` · `ChampionshipCupMode` · `CaptureTheFlag` · `CaptureScoreMode` · `NavalBattle` · `ZombieWaveMode` · `TimeSlipDefenseMode` · `HostageRescueMode` · `EscortMissionMode` · `HuntMode` |
| 200–400 | `RaceMode` · `BattlefieldMode` · `ChampionDuel` · `ZombieLastManMode` · `DeployPhaseMode` · `WuxiaTournamentMode` · `StealthEscapeMode` · `ZombieOutbreakMode` · `ArtilleryDuelMode` · `EconomyRaceMode` · `SurvivorMode` · `SiegeCamp` · `TimingStrikeMode` · `BossRampageMode` · `TugOfWarLine` · `GunGameMode` · `EndlessRunMode` · `ArcheryTrialMode` · `WorldWarTwoMode` · `SkirmishMode` · `RagdollStackMode` · `SurviveNightsMode` · `WuxiaTrainingMode` |
| < 200 | `LastStandingMode` · `AppleShotMode` · `RagdollLaunchMode` · `TeamDeathmatchMode` · `TowerHoldMode` · `RanchMode` · `BossFightMode` · `HoldoutMission` · `AssassinationMode` · `FantasyInvasionMode` |

## 2. Chi phí sáp nhập — đo bằng số scene tham chiếu

Một mode bị xoá thì mọi scene gắn nó thành `Missing (Mono Script)` cho tới khi bấm lại builder.

| Mode | Scene tham chiếu | Chỗ gọi trong code |
|---|---:|---:|
| `HoldoutMission` · `BattlefieldMode` · `DeployPhaseMode` | **0** (gắn lúc chạy qua `ModeKind`) | 6–7 |
| `TowerHoldMode` · `SurviveNightsMode` · `FantasyInvasionMode` · `HostageRescueMode` · `PrisonerRescue` · `ZombieOutbreakMode` · `ZombieLastManMode` · `WuxiaTournamentMode` | 1 mỗi cái | 5–19 |
| `ZombieWaveMode` | 2 | 10 |
| `SkirmishMode` | **12** | 24 |
| `ChampionDuel` | 1 | **83** |

⚠ `SkirmishMode` và `ChampionDuel` là hai mode **không được đụng**: cái đầu là trọng tài mặc
định của 12 scene, cái sau bị 83 chỗ trong code gọi tên.

## 3. ⚠⚠ BA PHÉP GỘP "HIỂN NHIÊN" ĐỀU SAI

Nhóm theo *tín hiệu* (mode nào dùng `Win`/`Lose`/đồng hồ/sóng địch) cho ra ba cặp trông như
trùng nhau. Đọc kỹ thì cả ba đều có một cơ chế mà cái kia không có — và **dự án đã ghi sẵn lý
do từ chối ngay trong chú thích đầu lớp**.

| Cặp | Trông giống vì | Nhưng khác ở | Phán quyết |
|---|---|---|---|
| `TowerHoldMode` ↔ `HoldoutMission` | cùng "trụ N giây, mất mục tiêu là thua" | tháp có luật **một tên địch đặt chân lên sàn là THUA NGAY** — thứ duy nhất khiến CHIỀU CAO có giá. Bỏ luật đó thì mode xẹp thành holdout có thêm cái tháp | **KHÔNG gộp** |
| `ZombieLastManMode` ↔ `ZombieOutbreakMode` | verdict gần trùng, cùng đường lây | LastMan có **mùi máu gọi bầy** (`TickBloodScent` · `RallyHorde`); Outbreak có **tích hợp đợt** (`OnWaveCleared` · `BeginWave`). Gộp = một file mang hai hệ ngủ đông | **KHÔNG gộp** |
| `HostageRescueMode` ↔ `PrisonerRescue` | verdict trùng **từng chữ** | con tin có **nút cởi trói + đội cứu máy có thanh tiến độ**; tù binh có **lồng + truy sát** (`DriveManhunt` · `PickBlocker` · `UpdateCutoffPost`) | **KHÔNG gộp** |

`TimeSlipDefenseMode` cũng đã tự ghi một mục *"vì sao không dùng thẳng `HoldoutMission` hay
`SurviveNightsMode`"*: vạch đích của nó là **dọn hết số hồi**, mỗi hồi đổi ĐỀ BÀI (bộ binh →
cung thủ → tường khiên → máy bắn đá → xe phá cổng), không phải đổi số lượng.

**Kết luận:** ở tầng MODE, dự án gần như không có trùng lặp. Mỗi mode giữ được vì có ít nhất
một câu hỏi riêng cho người chơi.

## 4. Thứ TRÙNG THẬT: vạch đích — và nó đã lệch nhau

Cái lặp lại không phải mode mà là **câu thắng/thua**. Đo được một bất đồng thật:

> Chỉ tiêu 3 người, đã cứu 1, còn đúng 1 người sống.
> · `HostageRescueMode`: `rescued + alive < goal` ⇒ **THUA NGAY**.
> · `PrisonerRescue`: `stillAlive == 0` ⇒ **CHƠI TIẾP** tới khi người cuối chết hoặc hết giờ.

Cùng một vạch đích, hai kết quả. Đó là cái giá của việc chép vạch đích: nó không sai lúc viết,
nó **lệch dần**.

### Đã gom (2026-09-16)

`Assets/Scripts/Gameplay/Modes/MatchVerdicts.cs` — hai phép chấm dùng chung:

| Phép chấm | Ai dùng | Luật được giữ |
|---|---|---|
| `MatchVerdicts.Rescue` | `HostageRescueMode` · `PrisonerRescue` | **kết thúc sớm** khi số còn cứu được không đủ đạt mốc |
| `MatchVerdicts.Hold` | `HoldoutMission` · `SurviveNightsMode` | **xét THUA trước THẮNG** (đợt cuối có thể vào đúng giây cuối) |
| `MatchVerdicts.SpendLife` | `ArenaMode` · `BossFightMode` · `LastStandingMode` · `ZombieWaveMode` · `ZombieLastManMode` | hỏi **QUỸ MẠNG** chứ không hỏi `IsProducing`; `LivesLeft < 0` là vô hạn, không in số âm |

⚠⚠ **HAI THAY ĐỔI HÀNH VI, cả hai là bản sửa:**
1. `PrisonerRescue` nay thua sớm khi không còn đủ tù binh — trước đó bắt người chơi ngồi nhìn
   một ván đã hỏng cho tới hết giờ.
2. `HoldoutMission` / `SurviveNightsMode` nay xét thua trước thắng — trước đó có thể "thắng"
   trong lúc công trình đang đổ trên màn hình.

⚠ Và một **hồi quy suýt tạo ra**: bản gộp đầu tiên đếm "người còn cứu được" chỉ bằng số CÒN
TRONG LỒNG, bỏ sót người đã thoát đang chạy về — phá xong cái lồng cuối là ván tuyên bố thua
trong khi ba người vừa thoát đang chạy giữa sân. Nay đếm cả hai nhóm.

## 5. ⚠⚠ ĐỢT HAI: `MatchVerdicts.LastStanding` CŨNG SAI (đo 2026-09-16)

Đợt trước file này đề xuất gộp "còn ai đứng không" cho ba mode. Đọc code thì đề xuất đó rơi
đúng vào cái bẫy mà chính mục 3 cảnh báo — **ba mode hỏi ba câu khác nhau:**

| Mode | Đếm gì | Vạch đích |
|---|---|---|
| `LastStandingMode` | đối thủ (`TeamMember` khác phe, lọc `StickmanFighterController`) | rủi = 0 ⇒ **Thắng** |
| `ZombieLastManMode` | NGƯỜI còn sống | người = 0 ⇒ Thua; zombie = 0 **và hàng chờ trỗi dậy rỗng** ⇒ Thắng; hết giờ ⇒ Thắng |
| `ZombieOutbreakMode` | NGƯỜI còn sống | gọi `Finish(phe)` chứ **không** `Win`/`Lose` |

⚠⚠ Cái thứ ba là chặn đứng: ghế người chơi ở `ZombieOutbreakMode` **ĐỔI ĐƯỢC giữa ván** (bị lây
là sang phe bầy), nên mọi phép chấm trả về Win/Lose đều chấm theo `_playerTeam` — sai cho đúng
một nửa số đường đi của màn. Chú thích tại chỗ đã ghi sẵn điều này. **Kết luận: KHÔNG gộp.**

### Thứ đo được thay vào đó: **QUỸ MẠNG**

Cùng lượt đọc ấy lộ ra một đoạn chép thật: **5 mode** viết lại y nguyên ba bước "người chơi
gục → hỏi quỹ mạng → báo số mạng còn lại, hết thì `Lose`". Và nó có **bằng chứng lệch dần
mạnh nhất từ trước tới nay**: chú thích trong `ArenaMode` ghi rằng **cả ba** bản đầu
(`ArenaMode` · `BossFightMode` · `LastStandingMode`) cùng hỏi nhầm `IsProducing` — thứ bằng
`!IsOver` nên **luôn true** ⇒ dòng `Lose` là code chết ⇒ ba mode đó **không thể thua**.
Ba chỗ hỏng cùng một kiểu vì ba chỗ chép cùng một đoạn.

Nay cả năm đi qua `MatchVerdicts.SpendLife`. Câu chữ vẫn của từng mode (`opening` + `suffix`),
thứ dùng chung là phép hỏi và luật `LivesLeft < 0` = vô hạn (không in số âm ra màn hình).

## 5b. Còn gộp được gì nữa (chưa làm)

| Ứng viên | Lợi | Rủi ro |
|---|---|---|
| `MatchVerdicts.Escort` cho `EscortMissionMode` · `ZombieWaveMode` (skin áp tải) · `VillageRaid` | cùng "đưa một thứ biết đi tới đích" | trung bình |
| Gộp **bộ dựng scene**, không gộp mode | 4 builder arcade đang chép cùng một `Finish`/`RegisterCatalog` | thấp — thuần Editor, không đụng scene |

## 6. Luật rút ra

1. **Đừng gộp mode vì verdict giống nhau.** Verdict là phần dễ thấy; cơ chế mới là phần định
   nghĩa kiểu chơi. Hỏi: *"bỏ mode này đi thì người chơi mất câu hỏi nào?"*
2. **Gộp VẠCH ĐÍCH thì luôn đáng** — nó không đụng scene, không xoá class, và nó chặn đúng cái
   lệch dần đã đo được ở mục 4.
3. **Đo số scene tham chiếu TRƯỚC khi hứa gộp.** 0 scene (gắn lúc chạy) rẻ; 12 scene thì không.
4. Chú thích *"vì sao KHÔNG gộp X"* trong đầu lớp là tài sản: nó đã cứu đợt này hai lần.
5. ⚠⚠ **Một ứng viên gộp do chính tài liệu này đề xuất vẫn phải đo lại trước khi làm.**
   Mục 5 từng ghi `MatchVerdicts.LastStanding` là "rủi ro trung bình"; đọc code thì nó SAI
   đúng kiểu mà mục 3 cảnh báo. **Dấu hiệu phải tìm: mode nào gọi `Finish(phe)` chứ không
   `Win`/`Lose`** — đó là mode có ghế người chơi đổi được giữa ván, và nó không dùng chung
   được bất kỳ phép chấm nào trả về Win/Lose.
6. Đoạn chép đáng gộp nhất là đoạn đã từng **cùng hỏng ở nhiều chỗ** — đó là bằng chứng đã
   đo được rằng nó sẽ lệch tiếp (ví dụ: quỹ mạng, 3/5 mode cùng hỏi nhầm `IsProducing`).
