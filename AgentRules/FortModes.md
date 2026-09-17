### TOÀ THÀNH CÓ CỔNG + CÔNG/THỦ THÀNH + cờ hiệu "THEO TÔI"

`StickmanFortBuilder.CreateGatedCastle` là **chỗ duy nhất dựng một toà thành**:
`[TƯỜNG + sàn gỗ + cầu thang] — sân — [CỔNG] — [THÁP] — sân trong`. Trước đó mỗi builder ghép
tay và đã lệch thật: `Demo_14_Siege` chỉ có **hai khối vuông xám** không `StructureSkin`, nên
13 nền văn minh có đủ art tường/cổng/tháp mà đúng màn công thành vẫn xám ngoét.
Chi tiết: `Docs/KnowledgeBase/Fortifications.md` mục 8. Bốn luật:

1. **TƯỜNG ĐỨNG NGOÀI CÙNG, KHÔNG PHẢI CỔNG** — thang tựa vào mặt ngoài TƯỜNG; để cổng ra
   ngoài là thang nằm sau cổng và `AIBehavior.Escalade` phải phá cổng mới trèo được.
2. **Không "khoét cổng giữa tường"** — một làn thì các lớp là vật cản NỐI TIẾP.
3. **Khoảng sân sau chân cầu thang** — kẻ trèo tường rơi xuống phải có ĐẤT/BẬC để tiếp đất;
   rơi trúng nóc cổng (`walkableTop: false`) là "rơi mãi" tại chỗ, không lỗi nào báo.
4. **Tường phải `passableForOwner` y như cổng** — không thì quân thủ bị nhốt trong thành của
   chính mình.

### CHỌN PHE — người chơi ngồi ghế nào (`GameSession.SwitchSide`)

Nút chọn phe nằm trên **màn hình bắt đầu** của `GameSession`, tức MỌI màn chơi được đều có mà
không builder nào phải nhớ thêm dòng nào — `AddGameSessionShared` vốn đã có ở tất cả. Mode chỉ
trả lời hai câu: `AllowsSideChoice` và `SideName(teamId)`.

⚠⚠ **ĐỔI GHẾ NGƯỜI CHƠI ≠ ĐỔI LUẬT CỦA MÀN.** Mode có luật BẤT ĐỐI XỨNG (làng cầm chân · cướp
đua giờ) phải giữ luật ấy trong một trường RIÊNG chốt lúc dựng scene — xem
`VillageRaid._villageTeam`. Đọc `_playerTeam` để biết "phe nào là làng" thì chọn phe cướp xong
là *"đốt đủ 3 nóc"* lại tính cho làng: **kết quả ngược, không lỗi nào báo**. Cùng lý do,
`Win()`/`Lose()` (dịch qua `_playerTeam`) phải đổi thành `Finish(teamThắng, …)`.

**Năm thứ phải dời theo, thiếu cái nào cũng hỏng trong im lặng:** `_playerTeam`/`_enemyTeam`
của session (không thì bậc khó buff cho phe cũ = người chơi tự buff cho mình) · `SetPlayerTeam`
(không thì thắng hiện ra "BẠN THUA") · `TeamMember.TeamId` · **CHỖ ĐỨNG** (đứng nguyên chỗ cũ =
sinh ra giữa quân địch, đọc ra thành *"chọn phe xong là chết"*) · **NỀN VĂN MINH**
(`CivilizationTeamAssigner.Dress` — không thì mặc áo địch).

⚠⚠ **VÀ VẾ THỨ SÁU NẰM Ở HỆ HỒI SINH.** `RespawnDirector` chụp KHUÔN ở `Start`, nên khuôn mang
phe của LÚC ĐÓ; `pending.teamId` mới là phe lúc ngã xuống. Bản cũ không áp lại phe lên bản sao
⇒ **chết một lần là sống lại với cờ phe CŨ**, thành địch của chính quân mình. Nay `SpawnOne`
ghi lại `TeamId` + khoác lại áo khi hai số lệch nhau.

⚠ `AllowsSideChoice = false` cho màn mà "phe" không có nghĩa: **loạn chiến** (mỗi người một phe
riêng) và **đấu boss** (một bên là con boss).

⚠ Chạm vào TẤM THẺ bắt đầu KHÔNG còn tính là "vào trận" (`StickmanUI.ClaimPanel` +
`PointerOnCard`): từ ngày có nút chọn phe, một cú bấm nút vừa đổi phe vừa kích `AnyStartKey` ⇒
vào trận ngay, không kịp đổi lại. Chạm ra ngoài thẻ thì vẫn vào trận như cũ.

### ⚠⚠ TƯỚNG PHE CÔNG KHÔNG ĐÁNH — BA CHÂN, THIẾU CHÂN NÀO CŨNG ĐỨNG IM

Đã dính đủ cả ba ở màn công/thủ làng (`VillageRaid`), và cả ba đều câm lặng:

| Chân | Hỏng thế nào |
|---|---|
| **`DecideCampaign`** | không khai thì `CommandDoctrine` chỉ hỏi `PowerRatio`. Quân cướp đánh vào một cái làng có tường + cổng + tháp + nhà đẻ lính ⇒ cán cân luôn nghiêng về làng ⇒ tướng chấm "yếu hơn" ⇒ **lùi về giữ tuyến** ⇒ cả toán đứng ngoài đồng tới hết giờ |
| **`doctrine.pushToEnemyBase`** | `Doctrine_Aggressive` **KHÔNG** bật cờ này. Thiếu nó thì mốc tiến quân lúc Attack là *"áp sâu hơn tiền tuyến địch"*, nên toán cướp dừng ngay chỗ gặp lính đầu tiên và cái làng phía sau không ai đụng tới (`Doctrine_Raid` mới lo vế này) |
| **quyền điều khiển** | cho CẢ toán `AIBehavior.Escalade` là tướng **không còn ai để điều**: `Escalade` (và `Garrison`) được MIỄN lệnh tuyến ở cả `CommandNode.ApplyToAgent` lẫn `MatchModeBase.ApplyOrders`, vì vác-dựng-trèo là nhiệm vụ nhiều pha |

⚠⚠ **HAI TẦNG ĐIỀU PHỐI KHÔNG ĐƯỢC CÙNG GHI `SetBehavior` LÊN MỘT PHE.** Phe nào có
`TeamCommander` thì cây chỉ huy ĐÃ LÀ tầng điều phối của phe đó; mode mà cũng phát behavior cho
chính phe ấy là hai hệ giằng nhau mỗi 2 giây (§5c). Nhưng mode vẫn còn MỘT thứ phải nói —
`targetsStructures`, vì `structureTargetBonus` mặc định là −6 (NÉ công trình). Chốt bằng
**`TeamOrder.tuneOnly`**: chỉ chỉnh tính cách rồi trả tay lái cho tướng.

⚠ Trong `Demo_26_Raid`: **CƯỚP** có tướng + `DecideCampaign` (Press liên tục — đồng hồ chạy về
phía làng, đứng yên là thua chậm); **LÀNG** không có tướng, đội hình do `TeamOrder.share` chia
(45% giữ cổng · còn lại giữ nhà). Nhánh `Hold`/`Fallback` của làng chỉ chạy khi có scene nào
gắn tướng cho phe thủ.

### GỘP CHẾ ĐỘ CHƠI (2026-09-03) — BẢY MÀN THÀNH BỐN

Menu chế độ chơi phình tới mức có **ba màn dùng chung một trọng tài** mà người chơi không có
cách nào biết chúng khác nhau ở đâu. Luật *"MỘT KIỂU CHƠI = MỘT DÒNG"* vốn đã ghi ở mục ô chọn
scene, nhưng nó chỉ chặn được dòng TRÙNG TÊN — không chặn được ba màn khác tên mà cùng một trò.

| Màn còn lại | Hút vào những màn nào | Vì sao chúng là MỘT trò |
|---|---|---|
| **`Demo_26_Raid`** — CÔNG / THỦ LÀNG | `Demo_6_BaseDefense` · `Demo_14_Siege` · `Demo_25_CastleDefense` | công và thủ là HAI PHE CỦA MỘT TRẬN, không phải bốn trò |
| **`Demo_15_Escort`** — HỘ TỐNG · BẢO VỆ VIP | `Demo_4_Guard` | đã chạy chung `EscortMissionMode` + `IEscortJourney`, chỉ khác cái skin |
| **`Demo_3_AiBattle`** — GIAO CHIẾN | `Demo_21_Fortress` · `Demo_34_Escalade` | cả ba là `SkirmishMode` (diệt sạch), chỉ khác địa hình |
| **`Demo_20_WarCamp`** — KINH TẾ · DOANH TRẠI | `Demo_17_Economy` | cả hai là khai thác tài nguyên rồi phá nhà chính |

Đã xoá hẳn: 7 file `.unity`, `StickmanSiegeAssaultBuilder.cs`, `CastleAssault.cs`,
`CastleDefense.cs`, và mọi mục menu / dòng catalog / job dây chuyền của chúng.

⚠⚠ **GỘP MÀN THÌ PHẢI HÚT HẾT CƠ CHẾ, KHÔNG ĐƯỢC XOÁ TRẮNG.** Mỗi màn bị gộp là **chỗ thử
DUY NHẤT** của một vài hệ; xoá mà không hút là hệ đó mất chỗ nhìn, và theo đúng luật đã ghi ở
bài 26 của AI Lab thì *"hệ nào không có chỗ để nhìn thì lỗi của nó sống bao lâu cũng được"*.
Bảng đối chiếu — mỗi dòng là một hệ đã được dời sang màn mới, đừng để rơi lần sau:

| Cơ chế | Trước ở | Nay ở |
|---|---|---|
| nhà chính ĐẺ LÍNH (`BaseBuilding._stopOnDestroyed`) | Demo_6 | Demo_26 (đình làng) |
| toà thành có cổng + `AIStateEscalade` + `SiegeLadder` | Demo_14 / Demo_34 | Demo_26 |
| `SiegeEngine` (máy công thành cần TỔ vận hành) | Demo_34 | Demo_26 |
| viện binh theo ĐỢT có hạn (`maxWaves`) | Demo_25 | Demo_26 |
| `AIStateTravel` (VIP ĐI BỘ) | Demo_4 | Demo_15 (giáo sĩ dẫn đường) |
| `GarrisonPost` + thợ VÁ công sự (`AIStateWork` pha sửa) | Demo_21 | Demo_3 (tuyến công sự giữa sân) |
| `TeamEconomy` + `autoSpend` (tướng máy tự tiêu tiền) | Demo_17 | Demo_20 |

⚠⚠ **GỘP MÀN CÒN ĐỂ LẠI HAI LOẠI RÁC, VÀ CẢ HAI ĐỀU KHÔNG LÀM COMPILE ĐỎ** (dọn 2026-09-03):
· **MODE MỒ CÔI** — trọng tài của màn bị gộp không còn scene nào dùng: `BaseWarMode` (mất chỗ
  khi `Demo_17_Economy` sang `Demo_20_WarCamp` với `EconomyRaceMode`) và `ZombieSupplyMission`
  (mất chỗ khi màn tiếp tế đổi sang `EscortMissionMode`). Đã XOÁ cả hai kèm `.meta`. Cách tự
  kiểm trước khi xoá: lấy GUID trong `.meta` rồi `grep` trong `Assets/_Scenes` — không scene
  nào tham chiếu, và không dòng CODE nào gọi (chỉ còn tên trong chú thích) thì mới xoá được.
· **CHÚ THÍCH TRỎ VÀO SCENE KHÔNG CÒN** — header của `StickmanModeBuilder`/`StickmanDemoBuilder`
  vẫn liệt kê `Demo_14_Siege` · `Demo_17_Economy` · `Demo_4_Guard` như bài đang dựng, và
  `Debug.Log` vẫn khoe *"đã dựng 7 scene"* trong khi hàm chỉ gọi 4. Vô hại với máy, nhưng đó
  chính là thứ người (và AI) đọc để biết dự án có gì — để nguyên là lần sau có người đi dựng
  lại một màn đã cố ý gộp đi.
⚠ Giữ CHÚ THÍCH GHI SỬ (*"`Demo_14_Siege` từng chỉ có hai khối vuông xám"*) — đó là bài học,
không phải rác. Chỉ sửa chỗ nói SAI VỀ HIỆN TẠI, và khi cần nêu ví dụ thì ghi kèm "(đã gộp
vào …)" để người đọc khỏi đi tìm một file không tồn tại.

⚠ **BẢNG `CoveredByScene` PHẢI ĐƯỢC TRỎ LẠI** (`StickmanGenreMissionCatalogBuilder`): nó khai
"kiểu chơi này đã có màn dựng tay rồi" theo TÊN SCENE, và kiểm bằng file có thật. Xoá màn mà
quên trỏ lại thì bản MAP của nhiệm vụ đó lặng lẽ hiện lại trong menu — đúng cái dòng thừa vừa
đi dọn. `DefendCamp` · `AssaultCamp` → `Demo_26_Raid`; `ProtectVip` → `Demo_15_Escort`.

⚠ **BỐN MÀN CÒN LẠI ĐỀU PHẢI DỰNG LẠI.** Đã tự kiểm theo LUẬT VÀNG: cả bốn mục hiện
*◐ CÓ THỂ CẦN CHẠY LẠI* trên `★ Bảng điều khiển`.

### ⚠⚠⚠ TƯỜNG: NGANG THÌ XUYÊN QUA, DỌC THÌ ĐI CẦU THANG

Luật do user chốt 2026-09-04: *"tôi muốn bức tường không đặc, có thể đi xuyên qua; còn leo cầu
thang lên thì có thể đi trên tường thành"*. Hai chiều, hai luật khác nhau:

| Chiều | Luật | Vì sao |
|---|---|---|
| NGANG | **đi xuyên qua** (`passableForEveryone`) | game đi ngang chỉ có MỘT LÀN; một khối đặc 3.74 rộng × 110 máu là nút chai nuốt trọn trận đánh |
| DỌC | **phải đi cầu thang** | mặt trên vẫn ĐẶC (`WouldLetThrough` hỏi `AtFootOf`), nên ai đứng trên nóc có đá dưới chân |

⚠⚠ **TÔI ĐÃ HIỂU NHẦM MỘT LƯỢT, GHI LẠI ĐỂ ĐỪNG LẶP.** Câu *"đâu thể di chuyển qua GIỮA bức
tường được"* nói về việc AI đòi đi **LÊN/XUỐNG** xuyên thân tường — KHÔNG phải về việc đi bộ
ngang qua. Tôi sửa nhầm chỗ (cho tường đặc lại) và cả toán kẹt lại ngay, đúng cái bẫy ghi ở
bảng bố cục đầu mục này. **Khi người dùng nói "không đi xuyên được", hỏi rõ CHIỀU NÀO.**

**Vế DỌC là phần code:** cận chiến không với tới mục tiêu ở tầng khác thì phải **đi tìm LỐI**,
theo thứ tự ưu tiên:
1. `FindStairsBetweenLevels` — cầu thang nối hai tầng. Đi bộ lên an toàn hơn trèo, và ở toà
   thành thì cầu thang mới là đường chính thức. `RequestStairsIfNeeded` đã có sẵn cả bộ lái
   (tới đầu thấp → `RequestStairs` → `TryStepUp` cõng lên từng bậc), chỉ thiếu người CHỌN.
   ⚠ Hàm này **KHÔNG** hỏi *"cầu thang có ở bên phía mình không"* như `FindStairsOver` — câu đó
   đúng cho bức tường ĐẶC; ở đây tường xuyên ngang được nên cầu thang bên kia vẫn tới được.
2. `FindClimbBetweenLevels` — thang trèo bắc qua trọn khoảng cao độ.
3. Không có lối nào thì mới **bỏ cả tầng** `UnreachableMemory` giây.

**Vế ĐỘI HÌNH: `useHighRoad` bật cho CẢ HAI học thuyết của màn** (user chốt 2026-09-04:
*"AI có thể đi cầu thang, đi đường dưới tuỳ ý"*). Toà thành có đủ hai thứ `UpdateHighRoad`
cần — một dải đất TẦNG 2 (mặt tường) và CẦU THANG nối lên. Nhưng **từng người lính chỉ leo khi
MỤC TIÊU ở trên**, nên nếu không ai nói gì thì cả phe dồn vào MỘT LÀN và mặt tường thành đồ
trang trí. Đó là quyết định ĐÚNG của từng cá nhân (leo lên rồi xuống là đường vòng vô ích)
nhưng SAI ở tầm đại cục: *"đi đường nào"* là câu hỏi của NGƯỜI CHỈ HUY, không phải của người
lính.
⚠ Cách ra lệnh vẫn là **DỜI CỘT MỐC** — đặt mốc của một cánh lên ĐỈNH cầu thang, rồi
`RequestStairsIfNeeded` của từng lính tự thấy *"mục tiêu ở tầng khác"* và tự leo. Không state
mới, không pathfinding, không sửa một dòng nào trong `AIStates`.
⚠ `UpdateHighRoad` **chỉ chạy ở thế TẤN CÔNG**, nên phe thủ lúc co về vẫn ở dưới hết — đúng ý.


### CỔNG LÀNG BIẾT ĐÓNG MỞ — `VillageGate` + `StickmanFortBuilder.CreateVillageGate`

`Fortification._passableForOwner` đã cho quân nhà đi xuyên cổng từ lâu, nhưng cái quyền đó
**VÔ HÌNH**: người chơi nhìn vào chỉ thấy quân mình lướt qua một khối gỗ đặc còn quân địch thì
đứng đập — đọc ra "va chạm hỏng", không đọc ra "đây là cổng". `VillageGate` ngồi TRÊN
`Fortification` sẵn có và chỉ trả lời MỘT câu (*"lúc này cửa đã hé chưa"*); máu · sát thương ·
thợ vá · AI đập cổng vẫn đi nguyên đường cũ.

**Luật, ba dòng:** quân nhà vào `_openRadius` → MỞ · người cuối rời đi thì giữ mở thêm
`_holdOpen` rồi khép · **cửa chưa hé đủ (`_passThreshold`) thì chưa qua được** — đó là phần
CƠ CHẾ, cái cổng có TRỌNG LƯỢNG, rút vào trong mất mấy nhịp ở cửa. Địch không bao giờ được cấp
quyền, đóng hay mở cũng vậy: muốn vào phải PHÁ.

⚠⚠⚠ **BA DÒNG TRÊN LÀ BẢN TỰ ĐỘNG, NAY MẶC ĐỊNH TẮT — CỬA CHẠY THEO LỆNH**
(`VillageGate._commandedOnly = true`, user chốt 2026-09-04).

Bản tự động an toàn nhưng nó **không phải quyết định của ai cả**: cái cổng chỉ là một cánh cửa
tự động, và người chơi bên thủ không có gì để chọn. Bản LỆNH biến nó thành một cần gạt có giá:

| Trạng thái | Nghĩa |
|---|---|
| **ĐÓNG** (mặc định) | KHÔNG AI ra vào được, kể cả quân nhà. Toán cướp phải xáp mặt mà phá — cổng miễn sát thương tầm xa (`IRangedDamageImmune`) nên **chỉ cận chiến hạ được** |
| **MỞ** | quân thủ **TRÀN RA** đánh (`VillageRaid.DecideCampaign` trả `CampaignIntent.Press`) — đổi lại địch cũng vào được |

Ba chỗ nối, mỗi chỗ đúng một tầng:
· **Combat** — `VillageGate.SetCommandedOpen/ToggleCommandedOpen` + sổ `All` + `FindFor(team, x)`
  (lọc PHE ngay tại nguồn). Cổng KHÔNG tự đọc tình hình trận đánh: nó ở tầng Combat, không được
  biết màn chơi đang thắng hay thua.
· **Người chơi** — `VillageGatePrompt`: ô `GUI.Button` + tự hit-test `Input.touches`, phím `F`.
  **CHỈ PHE CHỦ CỔNG THẤY** — người chơi bên tấn công bấm được nút "mở cổng" thì cả cơ chế phá
  cổng thành vô nghĩa.
· **Máy** — `VillageRaid.UpdateGateOrder`: phe thủ do MÁY cầm thì máy tự quyết, luật một dòng
  *"đông hơn địch ở trước cổng thì bung cửa mà dọn"*, có vùng chết + `SortieHold` 6 s.
  ⚠ Người chơi đang ngồi ghế làng thì hàm này KHÔNG ĐỘNG VÀO — giành cái cần gạt của họ là
  đúng thứ bực nhất (bấm mở xong hai giây sau máy đóng lại).

⚠⚠ **ĐÂY LÀ CHỖ CỐ Ý ĐẢO NGƯỢC LUẬT "không bao giờ nhốt được ai" ghi ngay dưới.** Bản tự động
bị cấm nhốt vì cái nhốt đó là TÌNH CỜ và câm lặng; ở bản lệnh thì bị nhốt là thứ NGƯỜI RA LỆNH
TỰ CHỌN, và mở ra chỉ tốn một cú bấm — khác hẳn về bản chất.

⚠⚠ **ĐỔI CỔNG TỰ ĐỘNG THÀNH CỔNG CÓ KHOÁ THÌ PHẢI RÀ LẠI MỌI CHỖ ĐỨNG CỦA PHE CHỦ.** Đã dính
ngay: ba lính `GiuCong_*` của `Demo_26_Raid` spawn ở `stairsFoot + 0.8` (x ≈ 4.3) trong khi cổng
ở x 6.7 — tức **NGOÀI cổng**. Đúng khi cửa tự hé cho quân nhà; từ ngày cửa mặc định đóng thì ba
người đó bị KHOÁ NGOÀI cùng phe địch ngay giây đầu, ba chọi một, chết sạch, **không lỗi nào
báo**. Nay họ đứng ở `gateX + 0.9 + i`.

⚠ **KHÔNG phải dựng lại scene** cho phần cơ chế: `_commandedOnly` là field MỚI nên scene đã bake
nhận giá trị khởi tạo trong code, và ô hỏi tự gắn ở `VillageGate.OnEnable` (khuôn
`StickmanStairsBootstrap`). Nhưng **CHỖ ĐỨNG của `GiuCong_*` thì đã bake** — phải dựng lại
`Demo_26_Raid` thì ba người đó mới về sau cánh cửa.

⚠⚠ **ĐÃ CÂN NHẮC VÀ LOẠI luật "có địch gần thì đóng chặt".** Nghe hợp lý, nhưng game đi ngang
chỉ có MỘT LÀN nên nó tự nhốt chính chủ nhà: quân thủ hồi sinh ở trong trại, địch cắm chốt
trước cổng ⇒ cổng không bao giờ mở ⇒ cả tuyến dồn cục sau cánh cửa của chính mình tới hết
trận, **không lỗi nào báo**, nhìn ra đúng câu *"AI đứng ngơ"*. Đây là §5c ở dạng khác: thêm
một luật nghe hợp lý mà nó đọc chính thứ luật kia vừa đổi.

⚠ **HỎI Ở `Fortification.WouldLetThrough`, ĐỪNG KÊ LẠI LUẬT Ở VÒNG CẤP QUYỀN.** `ScanPassableUnits`
bản cũ chép tay phần phe phái + phần "đứng trên nóc" vào chính nó, nên từ ngày có cánh cửa thì
nó thành chỗ THỨ HAI có thể nói ngược với luật thật (cửa khép mà quyền vẫn được cấp). Nay cả
vòng cấp lẫn `RevokeStalePasses` đều hỏi đúng một hàm.

⚠ **Ai đang ĐỨNG TRONG Ô CỬA thì luôn giữ quyền** — thu lại lúc thân còn chồng lên khối là
Box2D đẩy văng loạn xạ hoặc kẹp cứng tại chỗ (bẫy `StickmanStairs` đã trả giá một lần).

⚠⚠ **CỔNG LÀNG CỐ Ý KHÔNG ĐẮP `StructureSkin`**, khác hẳn `CreateGate`. Art cổng của 15 nền vẽ
SẴN hai cánh cửa vào trong tấm hình (380×380), nên mở cửa thật thì hai cánh VẼ SẴN ấy vẫn đứng
nguyên và nhìn ra y như đang đóng — cơ chế chạy đúng mà mắt đọc ra là hỏng. Đổi lại nó không
khoác được art nền văn minh; chấp nhận được, cổng làng là hàng rào gỗ chứ không phải cổng thành
đá. Ô cửa dùng nền TỐI để cửa hé ra là lộ lối đi phía sau — để nền cùng màu gỗ thì đóng hay mở
nhìn như nhau.

⚠ **Cánh cửa co `localScale.x`, KHÔNG quay quanh Z**: nhìn ngang thì quay quanh Z là cánh cửa
ĐỔ NGHIÊNG xuống đất, không phải mở ra. Pivot đặt ở MÉP NGOÀI, hình vẽ nằm ở object con.

⚠⚠ **VÀ MODE PHÁT LỆNH THÌ PHẢI MIỄN TRỪ QUÂN ĐỒN TRÚ — `MatchModeBase.ApplyOrders`.**
`CommandNode.ApplyToAgent` đã chữa đúng bẫy này ở tầng cây chỉ huy, nhưng tầng MODE thì tới nay
còn sót: nó ghi đè `SetBehavior` MỖI 2 GIÂY, nên cung thủ `Garrison` vừa bám được thang là bị
lệnh tuyến lôi xuống, nhịp sau lại leo — **leo lên tụt xuống tới hết trận, không lỗi nào báo**,
chỉ nhìn ra mặt tháp trống trơn. Bẫy chỉ lộ ra ở màn vừa phát lệnh vừa có tháp canh, nên nó
nằm im từ ngày có `BuildOrders`.
⚠ Miễn trừ phải ĐÒI CÒN POST DÙNG ĐƯỢC (`GarrisonPost.All`): miễn vô điều kiện thì tháp bị phá
xong mấy ông cung đứng chôn chân chờ một cái sàn đã biến mất (`AIStateGarrison.TickFind` đứng
tại chỗ khi không tìm ra post) — đổi một lỗi câm lấy một lỗi câm khác.

**Màn dùng nó: `Demo_26_Raid`** (cướp/giữ làng) — [tháp ngoài] → [CỔNG] → [tháp trong] → làng,
lớp nối tiếp nhau vì game đi ngang không có lớp nào đứng cạnh lớp nào. Cổng là vật chắn DUY
NHẤT trong làn (đắp thêm khúc tường đặc cạnh nó là hai nút cổ chai nối tiếp mà cái thứ hai
chẳng thêm quyết định nào); hai tháp để `passable: true` để cột đá rộng 1 đơn vị khỏi bịt kín
đường. Một tháp nằm NGOÀI cổng có chủ ý: nó bắn được từ xa, đổi lại toán cướp trèo thang lên
giết cung thủ trên đó.

⚠⚠ **VAI TRÒ (`UnitRole`) KHÔNG CHỈ LÀ CÁI NHÃN — quên khai là hỏng ba hệ TRONG IM LẶNG.**
`StickmanAgent` khoá hai cơ chế sau nó: **đội hình tuyến** (`TryGetFormationLimitX` chỉ giữ
`Ranged`/`Support` ở lại sau) và **tường khiên** (`shieldWallReactTime` chỉ chạy cho `Shield`);
cộng thêm `AIPlaybook.ProfileFor(role)` phát tính cách theo vai. Mặc định là `Melee`, nên
builder nào không khai thì **cung thủ đứng lẫn vào tuyến đầu, tường khiên KHÔNG BAO GIỜ hình
thành, và cả ba vai dùng chung một tính cách** — không lỗi nào báo, chỉ là mọi bài test đội
hình đều nói dối. Đã dính TOÀN BỘ `Demo_8_AILab` (21 vùng, mọi NPC đều `Melee`).
Nay `SpawnNpc`/`SpawnNpcShared` **TỰ SUY VAI TRÒ TỪ VŨ KHÍ** (`RoleForWeaponShared`: cung/nỏ/
súng → `Ranged` · trượng phép → `Support` · khiên → `Shield` · còn lại → `Melee`) khi không
khai `role:`. Muốn PHÁ luật (kỵ xạ, thầy thuốc cầm chuỳ) thì vẫn khai tay như cũ.

⚠ **CẢ SÂN MẶC GIÁP GIỐNG NHAU CŨNG LÀ BÀI TEST NÓI DỐI.** `ApplyArchetypeShared` phát đồ
theo VAI, nên nếu không ai nói gì thêm thì mọi lính đều có nón + giáp — mà cấp lính
(`UnitRank`) là một trong những trục cân bằng rõ nhất của dự án: `Levy` đầu trần chạy **100%**
tốc độ, `Elite` đủ nón + giáp nhưng chỉ còn **62%** (`EquipmentDefinition.weight` →
`SetEncumbrance`). Giống hệt nhau thì KHÔNG SO ĐƯỢC VỚI CÁI GÌ, và mất luôn phần đáng xem
nhất: đám dân binh nhanh chân có vòng được ra sau lưng mấy ông giáp nặng không.
`StickmanDemoBuilder.ApplyRankShared(npc, rank)` là chỗ DUY NHẤT phát đồ theo cấp (gọi SAU
archetype/loadout — cấp nói lời cuối), và `ApplyWeaponTierShared` gắn `WeaponTierSetter` cho
cấp vũ khí. AI Lab nay trộn **3 tinh nhuệ : 4 chính quy : 3 dân binh** (`MixedRanks`).
⚠ **ĐỪNG sửa `_tier` trên prefab vũ khí để nâng cấp cho một người** — `_weaponPrefabs` là
tham chiếu DÙNG CHUNG, sửa ở đó là cả dự án cầm đồ cấp 3. Dùng `WeaponTierSetter` (áp lúc
`Start`, và áp lại khi NHẶT vũ khí mới).

⚠ **Bài test AI mà ÍT QUÂN là bài test NÓI DỐI.** Gần như mọi cơ chế đội hình chỉ nổi lên khi
đông: chia mục tiêu (`maxAttackersPerTarget` 3) · vây đánh thay phiên · tường khiên · đội hình
tuyến · quân dự bị. Với 3 lính thì KHÔNG cơ chế nào trong số đó có cơ hội chạy — nhìn vào thấy
"AI đánh nhau bình thường" trong khi phần đang muốn xem chưa hề được kích hoạt lần nào.
`Demo_8_AILab` nay dùng `Squad(...)` / `SpawnLabSquad(count: 10)`: 8–10 lính mỗi phe.
⚠ Đặt tổ thì nhớ **lính CUỐI phải còn trên mặt đất** — `BeginZone` chỉ trải đất trong
`halfWidth`, tràn ra là rơi khỏi map.

⚠⚠ **BÀI TEST AI TRÊN MẶT ĐẤT PHẲNG LÀ BÀI TEST MÙ MỘT NỬA.** Đo được (rà 2026-09-02): **25/25
zone của `Demo_8_AILab` chỉ có đúng một dải `CreateGround`** — không bậc, không tường, không
tháp, không khe vực. Nghĩa là cả mảng AI theo chiều DỌC **chưa từng có chỗ để nhìn**:

| Không có bench | Dùng thật ở |
|---|---|
| `AIBehavior.Garrison` · `Escalade` | 5–8 scene |
| `TargetOnAnotherLevel` · `CanEngageAcrossLevel` · `crossLevelPenalty` | mọi màn có tường |
| `StickmanStairs` (xuyên hay leo) · `RequestStairsIfNeeded` · `FindStairsOver` | mọi map sinh |
| `CommandNode.UpdateHighRoad` (đi hai tuyến) | mọi học thuyết |

Và **cả hai lỗi nặng nhất từng phải đi sửa đều nằm gọn trong nhóm đó** — quân dồn cục dưới
chân tường (mọi phép đo khoảng cách của AI là khoảng cách NGANG, nên địch đứng trên mặt tường
ngay trên đầu đọc ra "cách 0 mét"), và kẹt ở chân cầu thang. Không bài nào bắt được, vì không
bài nào có cái tường.
Nay có **bài 26 «Địa hình cao»**: tường của ĐỎ + **cầu thang CẢ HAI BÊN** + cung đỏ `Garrison`
trên mặt tường, xanh phải tự xoay (cung bắn LÊN, cận chiến ĐI VÒNG sang thang bên mình mà trèo).
⚠ Tường để `hp` CAO (400) có chủ ý: bài này xem quân có biết TRÈO QUA không — tường mỏng máu
thì xanh đục thủng trong 10 giây và chẳng còn gì để xem.
⚠ **Thang phải có CẢ HAI BÊN** (`CreateWall` chỉ dựng một bên, bên kia gọi `CreateStairs` tay).
Thiếu bên nào thì bức tường là VÁCH CỤT với phe đó, `FindStairsOver` không tìm được gì và cả
cánh quân đứng đục tường — đúng luật `MapScenery.BuildPlatforms` đã ghi ở mục 7d-buc.
⚠ Bài học chung, cùng họ với *"bài test AI mà ÍT QUÂN là bài test nói dối"*: **hệ nào không có
chỗ để nhìn thì lỗi của nó sống bao lâu cũng được.** Thêm một mảng AI mới (địa hình, nước, bay)
thì phải thêm một zone có ĐÚNG loại địa hình đó, không thì nó chỉ được thử bằng cách chơi thật.

⚠ **Cung thủ trấn thủ phải khai `UnitRole.Ranged` lúc spawn** (`SpawnNpcShared(..., role)`):
`CivilizationTeamAssigner` phát LẠI vũ khí theo `agent.Role` lúc vào trận, để mặc định `Melee`
là cung thủ bị nhét kiếm vào tay rồi trèo lên tháp đứng nhìn — không log nào báo.

**Hai màn**: `Demo_14_Siege` công thành (`CastleAssault` — hạ CỔNG + THÁP + NHÀ CHÍNH) ·
`Demo_25_CastleDefense` thủ thành (`CastleDefense` — giữ nhà chính qua 5 đợt). Hai class rời,
KHÔNG một class có cờ `isAttacker` (bài học `AIStateEscalade` vs `AIStateGarrison`).

**CỜ HIỆU "THEO TÔI"** (`RallyBanner`, phím **G** + nút mép phải màn hình): bị vây thì cả cánh
quân theo người chơi đánh ra. Nó **DỜI CỘT MỐC** chứ không gọi `SetBehavior` — ra lệnh tay
"tấn công" cho `TeamCommander` rồi công bố chỗ đứng qua `RallyBanner.PointFor`, còn
`CommandNode.ComputeLineAnchor` lấy đó làm mốc tuyến (đúng khuôn `CapturePoint`).
⚠ Đừng đổi từng lính sang `AIBehavior.Follow`: `ApplyToAgent` ghi đè behavior mỗi nhịp.
⚠ Giương cờ là **dốc toàn quân** (`UpdateReserve` thoát sớm) và **chủ cờ ngã là hạ cờ**.


