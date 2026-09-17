**ZOMBIE TRUNG CỔ** (`ZombieUnit` · `ZombieInfection` · `ZombieDirector`): zombie KHÔNG phải
loại nhân vật riêng — vẫn `StickmanNPC` + 1 component + đổi `AIProfile`/`ActionSet`, nên mọi hệ
sẵn có chạy nguyên, không có nhánh `if (isZombie)`. **Lính bị zombie giết đứng dậy thành zombie**
(chỉ khi kẻ kết liễu là zombie — chết vì tên lạc/ngã vực thì thôi). Sinh CON MỚI chứ không hồi
sinh cái xác (flow chết đã tắt physics + tháo ragdoll + dọn xác, đảo ngược lại là hỏng).
`_maxAlive` là van BẮT BUỘC: lây nhiễm là vòng lặp tự nhân.

**TÁM LOẠI ZOMBIE** (bảng `Breeds` trong `StickmanZombieBuilder` = nguồn sự thật duy nhất, mỗi
loại một VARIANT của `StickmanZombie.prefab`): **Xác gầy** (số đông, lây) · **Xác chạy** (nhanh
hơn người, lây) · **Xác lết** (1 máu, nhanh gần bằng người — số rất đông; nhận ra bằng cái ĐẦU NHỎ NHẤT bộ,
KHÔNG đổi cỡ người: variant tuyệt đối không đụng `localScale`) · **Xác phồng** (`ZombieBurst` —
chết là NỔ + khí ĐỘC) · **Xác giáp** (6 máu, chậm) · **Xác hú** (`ZombieScream` — HÔ THÚC cả bầy
quanh nó nhanh hơn 1.5× trong 4.5s) · **Quái biến dị** (14 máu, QUẬT NGÃ qua `_onHitStatus`) ·
**Chúa tể xác sống** (26 máu, quật ngã, chỉ ra từ đợt 5 — trùm cuối của bầy).
Tám loại cố ý hỏi TÁM CÂU HỎI khác nhau chứ không phải tám mức máu — xem chú thích ở bảng.
Riêng **Xác hú** là mục tiêu ƯU TIÊN đầu tiên mà bầy zombie có: nó vô hại một mình, nhưng để
yên thì một đợt thường hoá thành một đợt dồn dập.
⚠ Chỉ hai loại đầu LÂY ĐƯỢC: cho cả tám loại lây thì mỗi lính ngã xuống lại thêm một con nữa
và cán cân lật trong vài giây. Thứ đáng sợ phải HIẾM thì mới đáng sợ.
⚠ **`AIProfile` là ASSET DÙNG CHUNG.** Xác chạy phải có bản sao riêng (`ApplyBreedProfile`):
`canRun = false` nằm trên profile chung, nên chỉ mở `_disableStamina` trên prefab là chưa đủ —
`UpdateRun` đọc `Profile.canRun` TRƯỚC và con "xác chạy" sẽ lê chân y hệt xác gầy, **không có
lỗi nào báo**, chỉ là cái tên nói dối.
⚠⚠ **BỘ AI CỦA MÀN KHÔNG ĐƯỢC ÁP LÊN BẦY — `INoPlaybook` (Core), `ZombieUnit` khai nó.**
`AIPlaybookBinder` không khai phe nào thì quét CẢ SCENE và áp LẠI theo nhịp 3 giây. Nghĩa là
cứ vài giây một lần zombie bị gán `SetProfile(profile của LÍNH)` + `SetSmartsLevel` +
`SetModules(bộ mặc định)` — tức mọi thứ `EnsureZombieProfile` và `ZombieUnit.StripModules` vừa
tắt (đỡ đòn · né tên · nhử · combo · sĩ khí · đổi vũ khí · nhặt vũ khí) **được bật lại hết**, và
con zombie đánh y hệt một anh lính chính quy đi chậm. Không lỗi nào báo. Chữa bằng một interface
RỖNG ở Core (tầng AI không được nhìn lên tầng Zombie) chứ KHÔNG bằng cách bắt từng builder nhớ
khai playbook THEO PHE — quên một scene là scene đó hỏng câm.
Thêm loại = 1 phần tử `Breeds` + 1 nhánh vẽ mặt trong `HeadArtGenerator.EnsureBreedFace`.
Bảng trộn của máy sinh đợt SINH THẲNG từ `Breeds` (`BuildWaveSlots`) — đừng gõ tay bảng trọng
số thứ hai trong builder scene, quên nối là loại mới **không bao giờ ra trận**.
⚠ Phân biệt bằng **MẶT + DÁNG**, KHÔNG nhuộm thân — thân đen là chất stickman của cả dự án.
Dáng là dấu hiệu đọc được XA HƠN mặt: ở cỡ nhìn chuẩn cái mặt 34 px chỉ còn là một mảng màu,
còn "con này chìa hai tay ra trước" thì thấy từ đầu kia màn hình. Ba style trong `ActionSet_Zombie`
(`ZombieUnit._idleStyle`): `shamble` lê chân · `reach` vươn hai tay · `lurch` lếch nặng.

**VÒNG CHƠI THEO ĐỢT — `ZombieWaveDirector` · `ZombieSquadUpgrades` · `ZombieWaveMode`**
(2026-09-05, user: *"trên đường chỉ có vài lính, zombie tấn công từ 2 phía theo đợt như đấu
trường, mỗi đợt có bảng upgrade team, có giáo sĩ hồi máu, zombie không được xuất hiện ngay chỗ
team đang đứng, tới làng là thắng, tôi chết là thua, chết hết là thua"*).

Cả hai màn nay chạy CÙNG một vòng: **mở ĐỢT → bầy ập vào TỪ HAI PHÍA → dọn sạch → BẢNG NÂNG CẤP
ĐỘI → đợt sau đông hơn và LÊN CẤP**. `ZombieWaveMode` là MỘT mode HAI SKIN (đúng khuôn
`EscortMissionMode`): có `IEscortJourney` thì thắng bằng TỚI NƠI, không có thì thắng bằng TRỤ
ĐỦ SỐ ĐỢT. Ba vế THUA giống hệt nhau: mất thứ đang hộ tống · **người chơi chết** · **cả đội chết**.

| Mảnh | Ở đâu | Việc |
|---|---|---|
| `ZombieWaveDirector` | Zombie | tung quân HAI BÊN cột mốc, bảng trộn theo đợt, CẤP theo đợt |
| `ZombieSquadUpgrades` | Zombie | 3 lá bài giữa hai đợt, áp cho CẢ ĐỘI |
| `ZombieWaveMode` | Zombie | trọng tài: lúc nào mở đợt, lúc nào ván xong |
| `ZombieWaveMood` | Zombie | SẮC THÁI của đợt (đêm tối · cuồng nộ · một phía · tràn ngập · trùm) |

⚠⚠ **KHÔNG SINH ZOMBIE NGAY CHỖ NGƯỜI ĐANG ĐỨNG** (`_safeRadius` 9–10). Cột mốc DI CHUYỂN nên
"cách cột mốc 15 đơn vị" KHÔNG có nghĩa là "cách người chơi 15 đơn vị" — người chơi hoàn toàn
có thể đang chạy trước đoàn xe đúng ngần ấy. Chỗ sinh phải đo lại với **TỪNG người còn sống**,
và phải có ĐƯỜNG LÙI cuối (điểm trong map xa người nhất): trả false là đợt đó không bao giờ tung
hết quân ⇒ `WaveCleared` không bao giờ bắn ⇒ đoàn xe đứng mãi.
⚠⚠ **VAN CHỐNG KẸT CỦA ĐỢT** (`_waveTimeLimit` 70s): loại chậm nhất đi ~0.7 u/s còn xe hàng bò
0.85 — một con sinh PHÍA SAU đoàn có thể đuổi mãi không kịp, `AliveCount` không bao giờ về 0 và
**từ đó không còn đợt nào nữa**, trận thành một chuyến đi bộ yên bình. Hết giờ thì đóng đợt, mấy
con sót nhập vào đợt sau.
⚠ **CẤP ZOMBIE đi qua hai trục SẴN CÓ** — `WeaponBase.SetTier` (sát thương · nhịp · lực đẩy) và
`SetMaxHealth`. Không đẻ trục cân bằng thứ ba, và Balance Report không lệch. KHÔNG nhân tốc độ
theo cấp: tốc độ là dấu hiệu nhận dạng LOẠI, nhân vào là tới đợt 5 mọi loại nhanh như nhau.
Cấp chỉ đọc được ở DÒNG TRẠNG THÁI (`zombie CẤP 3`) — trục chất liệu theo cấp của vũ khí đã bỏ
hẳn (§7b-look-BỎ), đừng đi nhuộm màu thân để bù.
⚠⚠ **KHÔNG AI HỒI SINH** (`RespawnDirector.SetLivesPerTeam(0)`), NHƯNG VẪN PHẢI CÓ
`RespawnDirector`: `PlayerRespawnBootstrap` gắn `PlayerRespawn` vào MỌI scene và nó chỉ tự tắt
khi thấy scene ĐÃ CÓ director. Bỏ hẳn director là người chơi vẫn sống lại sau vài giây ⇒ luật
"bạn chết là THUA" thành code chết, không lỗi nào báo. Quỹ 0 cũng là thứ làm lá bài «MẠNG SỐNG»
có nghĩa. Director còn là chỗ đặt GIỎ TIẾP TẾ ĐẠN.
⚠⚠ **BẦY PHẢI ĐẬP ĐƯỢC CÔNG TRÌNH, NHƯNG KHAI Ở *PROFILE* CHỨ KHÔNG Ở `TeamOrder`.**
`structureTargetBonus` mặc định là −6 (NÉ công trình) — không đảo dấu thì zombie đi ngang cái
xe / cái nhà mà không bao giờ đụng vào, và cả hai vế THUA (xe nát · làng sập) thành code chết.
Nhưng đảo bằng `TeamOrder.targetsStructures` thì `MatchModeBase.TuneForMission` phải NHÂN BẢN
profile, và bản sao đó **dùng chung cho cả phe** ⇒ bầy tám loại bị gộp về một profile, XÁC CHẠY
(bản sao riêng `canRun = true`) lặng lẽ lê chân y hệt xác gầy. Nên `EnsureZombieProfile` đặt
thẳng `structureTargetBonus = +4`: đập được công trình là TÍNH CHẤT CỦA ZOMBIE, không phải mệnh
lệnh của một màn. Người vẫn được xử trước nhờ `LivingFirstPenalty` (200).
⚠ Kèm theo, đã chữa ở gốc: khoá bản sao của `TuneForMission` nay gồm CẢ PROFILE GỐC, không chỉ
`TeamId`. Khoá cũ làm mọi lệnh `noRetreat`/`targetsStructures` gộp cả phe về profile của con
được chỉnh ĐẦU TIÊN — tức `AIPlaybook` phát profile theo VAI (khiên/cung/hỗ trợ) bị dẹp sạch ở
mọi màn hộ tống. Không lỗi nào báo.
⚠ **Đoàn áp tải CỐ Ý toàn CẬN CHIẾN.** Cung thủ cần `AmmoCache`, mà giỏ đứng YÊN ở mép map còn
đoàn xe thì ĐI — giữa đường là cung thủ hoặc bỏ đoàn chạy ngược về giỏ, hoặc lặng lẽ hết đạn
(§2b-dan). Màn THỦ LÀNG thì có cung thủ vì cột mốc đứng yên.
⚠ Bảng nâng cấp KHÔNG dừng `Time.timeScale` (dừng giờ là việc của `GameSession` — hai chủ ghi
một biến là kiểu gì cũng lệch), nên skin áp tải phải GIỮ XE bằng `WaypointMover.Held` trong lúc
bảng mở, không thì xe bò tiếp lúc người chơi đang đọc ba lá bài.

**SẮC THÁI ĐỢT — `ZombieWaveMood`** (2026-09-08). Vòng cũ chỉ leo thang bằng SỐ CON và CẤP,
tức "nhiều hơn của cùng một thứ": tới đợt 4 người chơi biết trước mọi chuyện và bảng nâng cấp
cũng loãng theo (lá nào cũng đúng vì đợt nào cũng như nhau). Sắc thái KHÔNG đổi độ khó — nó đổi
CÂU HỎI của đợt. Bảng `Moods` trong `ZombieWaveMood` là nguồn sự thật duy nhất:

| Sắc thái | Số con | Nó đổi cái gì | Câu hỏi mới |
|---|---|---|---|
| **ĐÊM TỐI** | ×1 | `WorldLighting` (tầm nhìn CẢ HAI phe còn 55%) + nền trời + tiếng nền | tách khỏi đội nữa không? |
| **CUỒNG NỘ** | ×0.8 | `ZombieUnit.SetPaceScale` 1.35 cho từng con | giữ cửa hay lùi lấy nhịp? |
| **TRIỀU MỘT PHÍA** | ×1.25 | `WaveShape.sideBias` — cả đợt dồn về MỘT bên | có dám bỏ trống bên kia? |
| **TRÀN NGẬP** | ×1.75 | ép `Crawler` (1 máu) cả đợt | quét ngang hay đấu tay đôi? |
| **ĐỢT TRÙM** | ×0.8 | ép 1 `Warlord` (thiếu thì `Brute`) + hộ vệ | dồn đòn hay giữ vòng ngoài? |

Nhịp: đợt 1 CỐ Ý luôn là đợt thường (phải biết "bình thường" trông thế nào rồi mới đọc ra được
cái khác thường); từ đợt 2 có 60% ra một sắc thái, KHÔNG lặp lại sắc thái vừa xong.

⚠⚠ **BỐC TRƯỚC MỘT ĐỢT.** `Preview(đợt+1)` chạy lúc DỌN XONG đợt trước, và bảng nâng cấp in
dòng «ĐỢT SAU: …» (`ZombieSquadUpgrades.SetNextWaveNote`). Thiếu vế báo trước thì sắc thái chỉ
là một dòng chữ đỏ hiện lên lúc đã quá muộn để làm gì với nó — và ba lá bài vẫn là ba lá bốc mù.
⚠⚠ **`Apply` PHẢI GỌI TRƯỚC `ZombieWaveDirector.BeginWave`.** `WaveShape` bị `BeginWave` TIÊU
THỤ MỘT LẦN rồi ô đó trả về trung tính ngay — cố ý, để một sắc thái quên xoá không chạy tiếp ở
mọi đợt sau (bầy cuồng nộ vĩnh viễn). Đảo thứ tự hai dòng là đợt này chạy trung tính còn sắc
thái rơi sang đợt sau: băng-rôn nói một đằng, bầy làm một nẻo, **không lỗi nào báo**.
⚠⚠ **ÁNH SÁNG CHỈ CÓ MỘT CHỦ.** `DayNightCycle` ghi `WorldLighting.Set` MỖI FRAME, nên scene đã
có chu kỳ ngày/đêm thì ĐÊM TỐI bị loại khỏi bộ bốc ngay từ đầu (`_canDarken`), không phải "ghi
đè rồi trả lại". Kèm theo: `EndWave` (hết đợt), `Clear` (`OnFinished`) và `OnDisable` đều trả
sáng — ván kết thúc giữa một đợt ĐÊM TỐI mà không dọn thì màn SAU chạy với AI mù nửa tầm nhìn.
⚠ Ép loại hỏi bằng **TÊN PREFAB** (`StickmanZombie_<key>`, `ZombieWaveDirector.HasBreed`) chứ
không thêm field `key` vào `BreedSlot`: field mới thì mọi scene ĐÃ BAKE mang giá trị rỗng cho
tới khi dựng lại, và ĐỢT TRÙM lặng lẽ ra toàn xác gầy. Doctor canh hai chiều enum ↔ bảng `Breeds`
bằng phép đo «Sắc thái đợt zombie nối đúng bảng loại».
⚠ Sắc thái làm bầy MẠNH lên phải trả lại bằng SỐ CON (`countScale` < 1) — không thì "sắc thái"
chỉ là cách nói khác của "đợt này khó hơn", và đường cong độ khó bị nhân thêm một tầng ở chỗ
không ai đo. Trần `_maxCount` được nới THEO ĐÚNG hệ số (không thì TRÀN NGẬP bị trần cắt phẳng
thành đợt thường); van thật vẫn là `_maxAlive`. Kèm theo, VAN CHỐNG KẸT nay với tới cả đoạn
ĐANG TUNG QUÂN: đợt đông hơn `_maxAlive` mà bầy không chết bớt thì máy đứng chờ chỗ trống,
`_pending` không bao giờ về 0 và nhánh đóng đợt KHÔNG BAO GIỜ chạy — hết giờ thì bỏ nốt phần
chưa tung.

**BẪY CHÔNG — lá bài về CHỖ ĐỨNG** (`ZombieSquadUpgrades.Kind.Traps`, 2026-09-08). Mọi lá cũ đều
là "cả đội mạnh lên n%", chọn xong thì trận đánh diễn ra y như cũ; lá này đổi cái SÂN: 3 quả
`Landmine` rải xen kẽ HAI BÊN cột mốc, và việc của người chơi đổi từ "chém cho nhanh" thành
"nhử bầy qua đó".
⚠ Mua thì GHI SỔ, rải lúc ĐỢT SAU MỞ (`DeployTraps`): skin áp tải có cột mốc ĐANG ĐI, rải lúc
bấm là bãi bẫy nằm lại chỗ đoàn xe vừa dừng còn trận đánh diễn ra cách đó cả chục đơn vị.
⚠⚠ Quả bẫy phải mang `TeamMember` của phe người chơi. `Landmine._ownerTeam` chỉ lo vế DẪM PHẢI;
cú NỔ đi qua `Explosion.Detonate` → `TeamMember.CanDamage`, mà hàm đó đọc `TeamMember` TRÊN
NGUỒN NỔ — không có là "không rõ phe" = sát thương cho tất cả, tức bãi bẫy vừa mua thổi bay
chính đội mình ở một màn mà đồng đội không hồi sinh.
⚠ Bẫy này CỐ Ý nhìn thấy được (`GameplayMarkArt.Disc` vẽ lúc chạy) — ngược với mìn của bản đồ.
Không thấy nó nằm đâu thì không nhử được, và lá bài tụt xuống thành "sát thương miễn phí".
⚠ `Landmine.Configure` là hàm RUNTIME riêng, không dùng lại `EditorSetup` (nằm trong
`#if UNITY_EDITOR` → gọi vẫn biên dịch xanh trong Editor và chỉ vỡ lúc BUILD).

⚠ **Ô hệ số tốc độ của zombie nay có BA VẾ NHÂN NHAU**, mỗi vế một người ghi và ba vế kết thúc
khác nhau: `_speedMultiplier` (LOẠI, cả ván) × `_paceScale` (SẮC THÁI, một đợt) × `_rallyScale`
(CÚ HÔ của `ZombieScream`, vài giây). `ZombieUnit.ApplySpeed` là chỗ DUY NHẤT ghi ô đó. Gộp vế
là hết giờ hô, con xác giáp trả về tốc độ của KẺ HÔ chứ không về tốc độ của chính nó — và một
con sinh trong đợt cuồng nộ bị hô một cái là lặng lẽ chậm lại giữa đợt cuồng nộ.

**HAI SCENE**:
· `ZombieSupply` — **ÁP TẢI XE HÀNG TỪ RỪNG VỀ LÀNG**: rừng ở mép trái, làng ở mép phải; xe tự
  bò theo waypoint, đội **3 lính cận chiến + 1 GIÁO SĨ + người chơi** bám XE (`GuardTarget` vào
  Transform ĐANG DI CHUYỂN — bám vào đích là cả đội đứng ở làng chờ còn xe đi một mình).
  Về tới làng = THẮNG.
  ⚠ Vẫn phải gắn `ZombieDirector` dù màn này không đẻ quân theo đợt kiểu cũ — `ZombieInfection`
  gọi `ZombieDirector.Instance`, thiếu nó là **lây nhiễm chết lặng**, không con nào đứng dậy và
  không có lỗi nào báo.
  ⚠ Rừng chỉ là SPRITE, KHÔNG collider: rừng mà chắn đường thì `UpdateBlockedPath` bắt cả đội
  đứng lại đập từng gốc cây.
· `ZombieDefense` — **GIỮ LÀNG**: làng ở giữa, hai cổng dồn bầy lại ở cửa, cũng chỉ **3 người +
  1 giáo sĩ + người chơi**. Trụ đủ 8 đợt = THẮNG; nhà chính sập = THUA.

**HAI MÀN ZOMBIE CỦA THỂ LOẠI BẮN SÚNG** (`Docs/AgentRules/Shooter.md`): `Demo_44` BÙNG PHÁT
(`ZombieOutbreakMode`) và `Demo_47` **NGƯỜI CUỐI CÙNG** (`ZombieLastManMode`, 2026-09-07, user:
*"10 nhân vật, hết 5s đếm ngược 1 người hoá zombie… ai bị đánh chết cũng thành zombie… zombie
máu trâu và bắn bị lùi ra xa"*). Cả hai dùng CHUNG `ZombieOutbreakKit` cho hai luật *ai được
phép hoá bệnh nhân số 0* (người chơi + chủ tướng miễn) và *đếm người còn sống*, và chung
`ZombieDirector.TurnByPlague` cho cú chết-vì-bệnh.
⚠⚠ Demo_47 là SÂN ĐÓNG (không `ZombieWaveDirector`): "người + zombie" luôn = 10, nên MÁU TRÂU
(`_riseHealth` 30 ≈ hơn một băng súng trường) phải đi kèm ĐẠN ĐẨY LÙI (`_risePush` 0.36 →
`ZombieFlinch`) — thiếu vế đẩy thì súng thành vô dụng, thiếu vế máu thì bầy tan trong mười giây.
⚠⚠ **Demo_44 hỏng câm hai chỗ, chữa 2026-09-07**: scene có `ZombieWaveDirector` nhưng `BeginWave`
CHỈ được gọi từ mode ⇒ bầy tám loại không bao giờ ra trận (nay `ZombieOutbreakMode` cầm nhịp đợt,
đóng máy ở `OnFinished`, và vế thắng "dập được ổ dịch" tự tắt khi màn có bầy theo đợt); và scene
thiếu `RespawnDirector` ⇒ người chơi vẫn hồi sinh (nay có director quỹ mạng 0).
⚠ Prefab của director phải là VARIANT (`StickmanZombie_Shambler`): `StickmanZombie.prefab` GỐC
không mang `ZombieFlinch` (chỉ tám variant có) ⇒ "bắn bị lùi" mất trong im lặng. Director gắn bù
khi `_risePush > 0`, nhưng đừng dựa vào đường vá đó.

**BỊ LÂY THÌ CHƠI TIẾP BẰNG THÂN XÁC SỐNG — `ZombiePossession`** (2026-09-08, chỉ Demo_44).
Demo_44 lấy khuôn CS «Zombie Mod» / Đột Kích «Biệt đội thợ săn», mà ở hai trò đó **bị cắn KHÔNG
phải hết ván**: người bị lây đứng dậy ở phe kia và đi săn đồng đội cũ. Bản đầu bỏ mất đúng vế
ấy — bị cắn ở giây 40 rồi NGỒI XEM máy đánh nốt hai phút.

Trao thân là ĐỦ BA việc, thiếu cái nào cũng ra "nửa người chơi nửa máy" mà không lỗi nào báo:
tắt `StickmanAgent` · mở `UseInput`+`UseMoveInput` (prefab NPC tắt sẵn) · thêm nhãn
`PlayerCharacter` (camera · HUD · prompt bám theo `Changed`). Nhãn được THÊM chứ không dời —
`OnDisable` của xác cũ chỉ buông khi nó vẫn là `Current`, nên thứ tự tự đúng.

| Mảnh | Việc |
|---|---|
| `ZombiePossession.HandTo` | ba việc trao thân, không đụng phe và không đụng ghế người chơi |
| `ZombieDirector._playerJoinsHorde` | LUẬT CỦA MÀN — mode bật lúc chạy (`SetPlayerJoinsHorde`), không bake vào scene |
| `ZombieInfection` | trả lời "xác này của người chơi không" (nhãn `PlayerCharacter`) |
| `ZombieOutbreakMode._humanTeam` | PHE NGƯỜI chốt lúc `Start`, KHÔNG đọc `_playerTeam` nữa |

⚠⚠ **Người chơi ở màn nhập bầy thì CHẾT KIỂU GÌ cũng đứng dậy** — bỏ qua cả hai cửa lọc của
`ZombieInfection` (chỉ 2/8 loại lây được · xúc xắc `_infectChance`). Hai cửa đó là luật cho
LÍNH; áp lên người chơi thì chết vì XÁC PHỒNG nổ, vì QUÁI BIẾN DỊ, hay vì trượt xúc xắc là ngồi
xem tới hết ván — luật của màn thành trò hên xui.
⚠⚠ **Xác người chơi KHÔNG bị `_maxAlive` chặn.** Trần là van giữ khung hình cho BẦY; áp lên cái
xác đang giữ tay cầm thì đúng lúc sân đông nhất (tức lúc hay bị cắn nhất) người chơi mất luôn
thân mới. `ScheduleRise(handToPlayer: true)` → `Rise(ignoreCap: true)`.
⚠⚠ **PHE NGƯỜI phải là trường RIÊNG (`_humanTeam`), không được đọc `_playerTeam`** — đúng khuôn
`VillageRaid._villageTeam`. Từ khi ghế người chơi đổi được giữa ván, trộn hai khái niệm là ngay
lúc bị cắn `CountHumans` đi đếm phe bầy, ra 0, và mode tuyên THUA tức khắc.
⚠ Kết ván bằng `Finish(phe)` chứ KHÔNG `Win`/`Lose`: hai hàm đó chấm theo `_playerTeam` (đổi
được), và `EnemyTeamOf` chỉ biết đảo 1↔2 — gặp phe bầy (3) là trả số sai.
⚠ Demo_47 CỐ Ý **không** có luật này: "bị cắn là THUA ngay" chính là câu hỏi của màn đó. Hai
mode dùng chung `ZombieDirector`, nên luật bật ở MODE chứ không ở director/prefab.

**MÙI MÁU — `ZombieLastManMode`** (2026-09-08): mỗi người ngã xuống thúc CẢ BẦY nhanh hơn 1.45×
trong 5s (người cuối cùng: ×1.1 và dài ×1.4, kèm rung máy). Sân ĐÓNG nên không có máy sinh đợt
để leo thang — nhìn thì bầy đông dần, nhưng CẢM GIÁC phẳng, và nửa sau của ván thành cuộc đi bộ.
Cú thúc đặt đỉnh áp lực đúng vào khoảnh khắc tuyến vừa vỡ.
⚠ Đi qua `ZombieUnit.Rally` (ô tốc độ một chủ, tự hết giờ), duyệt `TeamMember.All` chứ không
`FindObjectsByType` (khỏi đẻ mảng rác). Con bò dậy SAU cú thúc thì không được thúc — cố ý, không
thì nó chỉ là tăng tốc độ nền của cả màn.

⚠ `ForestAmbush` (ổ phục kích nổ theo khoảng cách) KHÔNG còn scene nào dùng sau đợt này — giữ
file lại vì scene đã bake còn tham chiếu tới lúc dựng lại, nhưng nó là ứng viên xoá nếu vẫn
không ai gọi. Tương tự `HoldoutMission` (trụ N giây) sau khi màn thủ làng chuyển sang `ZombieWaveMode`.

⚠ **"DÙNG LẠI MỌI HỆ SẴN CÓ" KHÔNG CÓ NGHĨA LÀ "KHÔNG PHẢI TẮT GÌ".** Đây là chỗ bản đầu sai
cả bốn mặt, và cả bốn đều hỏng TRONG IM LẶNG — không log, không lỗi, chỉ là nhìn vào thấy
một ông lính đi chậm:

| Mặt | Vì sao hỏng | Chốt chặn |
|---|---|---|
| **Vũ khí** | prefab là variant của `StickmanNPC` → mang sẵn **cả BẢNG vũ khí**; `EquipIndex(vuốt)` lúc sinh KHÔNG đủ vì `AIWeaponSwapModule` (bộ mặc định) rút cung/búa ra ngay nhịp quét đầu | `StripToClaws` rút sạch kho còn 1 cây + `_dropWeaponOnDeath = false` (vuốt là móng tay, không phải đồ nhặt) |
| **Module AI** | `AIModuleLibrary.DefaultKinds` lắp sẵn đổi-vũ-khí · nhặt-vũ-khí · hô · hồi máu · báo địch cho MỌI agent | `ZombieUnit.StripModules()` → `SetModules(mảng RỖNG)`. ⚠ `null` = lấy bộ mặc định, phải là mảng rỗng |
| **Tính cách** | profile cũ chỉ chỉnh tầm nhìn + rút lui → zombie vẫn ĐỠ ĐÒN, NÉ TÊN, NHỬ ĐÒN, đánh combo, xếp hàng thay phiên vào đánh | `EnsureZombieProfile` tắt block/dodge/feint/combo/cover/aoe-avoid + bỏ trần `maxAttackersPerTarget` (bầy XÚM vào, không chia mục tiêu) |
| **Dáng** | `Zombie()` chỉ `AddRange` style riêng vào bộ chuẩn, mà `Play(type)` không kèm tên style thì **bốc NGẪU NHIÊN** → phần lớn cú đánh ra dáng lính | `RemoveAll` style `Idle`+`AttackBody` của lính TRƯỚC khi nối — chỉ còn một dáng để bốc thì luôn đúng, khỏi thêm API "style mặc định theo loại" |
| **Tinh thần** | `moraleRadius`/`shakenDuration` làm nhân vật KHỰNG khi đồng đội gục cạnh mình — `AIStateSeek` cắt tốc độ còn **45%** và strategy bắt lùi ra lấy nhịp. Trong BẦY thì lúc nào cũng có con vừa chết trong bán kính 4, nên gần như MỌI con luôn sốc: cả bầy lê chân ở nửa tốc độ và chực lùi — hết ra "bầy xác không biết sợ", thành "đám lính nhát gan đi chậm" | đặt `moraleRadius = 0` (tắt TRỌN thanh sĩ khí) + `shakenDuration = 0`; chỉ tắt shaken là zombie vẫn có thể vỡ sĩ khí |

Hai vế nữa cùng loại "code có sẵn mà không ai gọi": mặt zombie phải là **bộ AppearanceSet
RIÊNG** (`AppearanceSet_Zombie`, 1 mặt + KHÔNG nón) — nhét vào bộ chung là lính để
`_decoIndex = -1` sẽ bốc trúng mặt thối; và clip `Land/"rise"` nằm trong ActionSet từ đầu
nhưng **chưa ai gọi**, nay `ZombieDirector.Rise` → `ZombieUnit.PlayRise()`.

⚠ **Vật chắn trong scene zombie phải là `Fortification` thật.** Bản cũ dựng hai khối
`SpriteRenderer + BoxCollider2D` bằng tay: game đi ngang chỉ có MỘT làn, mà zombie không leo
được (không `StickmanClimbZone`) và không đập được (`UpdateBlockedPath` chỉ nhận công trình)
→ cả bầy dồn ở mép tường tới hết trận, không bao giờ tới trại. Nay dùng
`StickmanFortBuilder.CreateGate(teamId: -1)` — trung lập nên cả hai phe đều phá được.

⚠ `StickmanActionSetBuilder.EnsureAll(false)` chỉ sinh khi FILE CHƯA CÓ. Tool zombie phải gọi
`BuildZombieSet()` (ghi đè) — không thì sửa dáng trong code xong bấm tool vẫn ra bộ CŨ.

Chi tiết: `Docs/KnowledgeBase/Genres.md`.

