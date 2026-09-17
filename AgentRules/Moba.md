### ⚠⚠ MOBA HAI LÀN — `MobaLaneMode` (2026-09-08)

User: *"thêm game giống MOBA nhưng là game 2D"*.

Màn `Demo_63_Moba` («Đấu trường song tuyến»), dựng bằng Bảng điều khiển › **«★ MOBA hai làn»**
(`StickmanMobaBuilder`). Luật thắng: **hạ NHÀ CHÍNH của địch**; hết giờ (900 s) thì so số trụ
còn lại, bằng nhau thì so máu nhà — không có hoà.

Sáu file runtime, tất cả ở tầng Gameplay: `MobaLaneMode.cs` (trọng tài + lệnh theo làn) ·
`MobaLaneMode.Shop.cs` (ô hỏi [F] + cửa hàng + bảng tỉ số) · `MobaTower.cs` (trụ biết bắn) ·
`MobaHero.cs` (ví tướng) · `MobaBounty.cs` (bảng tiền thưởng) · `MobaMinionRank.cs` (lính siêu cấp).

## 1. LÀN = ĐỘ CAO, không phải chiều sâu

MOBA thật có ba đường song song trên MẶT BẰNG. Game này nhìn ngang nên chiều sâu **không tồn
tại** — chép y nguyên là ba đường đè lên nhau thành một. Thứ thay được nó là chiều CAO:

| | Làn dưới | Làn trên |
|---|---|---|
| mặt đi | đất (`y = −2`) | thềm đá (`y = 2.6`, chạy −36…36) |
| trụ ngoài · trong | ±14 · ±30 | ±10 · ±26 |
| lối lên | — | cầu thang hai đầu thềm; **thang leo giữa sân ±6** |

Nhờ vậy không phải viết hệ nào mới: `StickmanStairs` lo cầu thang, `PlatformEffector2D` (sàn
một chiều của `CreateTerrace`) lo mặt thềm, `StickmanClimbZone` lo thang giữa sân, và `LaneNav`
tự dựng đồ thị để AI biết đường lên xuống ([LaneNav.md](LaneNav.md)).

⚠ **Làn đọc từ `transform.position.y`** (`MobaLaneMode.LaneOf`, ngưỡng `_laneSplitY = 0.3`).
Đặt ngưỡng sát mặt thềm là người đang leo cầu thang bị đọc nhầm làn và đổi mục tiêu giữa chừng.

⚠ **Sân phải ĐỐI XỨNG TUYỆT ĐỐI.** Builder khai mỗi mốc bằng MỘT số dương rồi nhân `side`
(−1 xanh, +1 đỏ). Gõ tay hai bên là sớm muộn lệch một đơn vị — mà lệch một đơn vị ở màn đua đẩy
làn thì luôn có một phe tới trụ trước, và không có lỗi nào báo.

## 2. CHUỖI CHE CHỞ PHẢI NẰM TRONG `TakeDamage`

Trụ trong miễn thương khi trụ ngoài cùng làn còn đứng; nhà chính miễn thương khi **cả hai** trụ
trong còn đứng (tức phá thông MỘT làn là mở được nhà). Khai bằng `MobaTower._guards`, luật là
*"còn ĐỦ CẢ thì đóng"*.

⚠⚠ Chặn ở cửa `TakeDamage`, **không** chặn ở tầng AI ("dặn lính đừng đánh trụ đó"). Dặn AI thì
chỉ AI nghe lời, còn người chơi vẫn bổ thẳng vào trụ trong — luật lớn nhất của cả mode biến mất
mà nhìn vào không thấy gì sai. Đòn bị chặn phát `EffectEvent.Block` (có nhịp nghỉ 0.45 s) để
người chơi biết vì sao cái trụ không mất máu.

⚠ Đọc «đủ cả» thành «còn cái nào thì còn đóng» là bắt phá SẠCH mọi trụ trên sân mới vào được
nhà: không ai đẩy nổi và ván trôi tới hết giờ.

⚠ `BaseBuilding` mặc định **MIỄN đòn tầm xa**. `MobaTower.Awake` tự gọi
`SetSiegeRules(rangedImmune: false, …)` — quên vế đó thì cung thủ và pháp sư nã cả trận mà máu
trụ không nhúc nhích.

## 3. TRỤ BẮN LÍNH TRƯỚC, TƯỚNG SAU

`MobaTower.PickTarget`: lính luôn hơn tướng, cùng hạng thì gần hơn. Đây là luật bắt người chơi
ĐI CÙNG ĐỢT LÍNH của mình thay vì lao lên trước — đảo thứ tự (hay bắn đứa gần nhất) là cái trụ
không dạy được gì cả. Bắn mãi một người thì mỗi phát nặng thêm `_streakStep` (trần `_streakMax`):
đó là hình phạt cho việc dí trụ.

⚠ Chỉ bắn mục tiêu lệch cao độ trong `_laneBand` (3.2). Thiếu vế đó thì trụ làn dưới bắn cả
người đang đi làn trên ngay trên đầu nó — hai làn nhập làm một.

## 4. VÍ CỦA TƯỚNG KHÔNG NẰM TRÊN THÂN

`RespawnDirector` không hồi sinh cái xác: nó `Instantiate` một bản mới từ khuôn chụp lúc đầu
trận. Mọi thứ kiếm được trong trận mà nằm trên thân đều bốc hơi ở lần chết đầu — XP (về cấp 1,
mất luôn cấp vũ khí), đồ đã mua, vàng đang cầm. Mà MOBA thì "chết rồi vẫn giữ cấp và đồ" chính
là đường cong của cả ván.

Cách xử: `MobaHero.Sheet` — sổ TĨNH khoá theo `_slotId` (field serialized nên bản hồi sinh mang
theo đúng số). Thân mới tìm lại phiếu ở `Start` rồi đắp lại: tiêm XP (`GainXp` → mốc lên cấp tự
nổ), lên lại cấp vũ khí, cộng lại máu, đi lại tốc độ giày.

⚠ Đắp ở `Start`, KHÔNG ở `Awake`: thứ tự `Awake` giữa các component không hứa hẹn gì, tiêm XP
vào một `StickmanExperience` chưa nạp bảng cấp thì mốc im lặng không nổ.
⚠ **Số slot phải DUY NHẤT.** Hai tướng cùng số là hai người xài chung một ví.
⚠ Bảng tỉ số và vàng chảy đều đọc PHIẾU, không đọc thân — đọc thân thì mỗi cái chết là bảng mất
một dòng, đúng lúc người chơi cần nhìn nhất.

## 5. GIỜ CHỜ HỒI SINH THEO CẤP — `IRespawnDelay` (hợp đồng ở Core)

`RespawnDirector` vốn chỉ có hai con số cho cả sân (chờ của người chơi · chờ của NPC). Ở đây giờ
chờ CHÍNH LÀ luật: cấp 1 chết mất 6 s, cấp 6 mất gần 20 s — đó là thứ khiến một pha giao tranh
cuối trận đáng giá cả ván. Nhét luật ấy vào `RespawnDirector` là bắt một lớp dùng chung phải
biết về một mode, nên đảo ngược bằng interface ở Core: tầng thấp chỉ HỎI, ai muốn trả lời khác
thì tự khai. Trả `false` (hoặc ≤ 0) = dùng số mặc định.

## 6. TRỌNG TÀI TỰ PHÁT LỆNH THEO LÀN — và scene KHÔNG có `TeamCommander`

`MatchModeBase.TickOrders` phát lệnh theo PHE: một phe một cột mốc, chia được theo `share` nhưng
chia theo thứ tự id chứ không theo CHỖ ĐỨNG. Với mode này là sai ngay — nửa số lính làn trên
nhận cột mốc của làn dưới, cả trận là một dòng người leo lên tụt xuống. Nên `MobaLaneMode` tự
quét `TeamMember.All` mỗi 1.5 s và tự phát: cột mốc là hàm của (PHE, LÀN, TRỤ NÀO CÒN ĐỨNG).

⚠ Cùng lý do đó, **đừng thêm `TeamCommander` vào scene này**: `CommandNode.ApplyToAgent` ghi đè
`SetBehavior` mỗi nhịp, hai hệ giằng nhau thì lính bị kéo qua kéo lại giữa hai làn (§5c).
⚠ Chuỗi trụ xếp từ HÌNH HỌC (`BuildChains`: xa nhà mình nhất = trụ ngoài), không từ mảng gõ tay.
Đổi bố cục map thì chuỗi tự đi theo.
⚠ Chỉ LÍNH ĐỢT bị đổi tính cách (`ApplyMinionProfile`: đảo dấu `structureTargetBonus`,
`retreatHealthPercent = 0`) — và phải làm trên BẢN SAO runtime, `AIProfile` là asset dùng chung.
Tướng giữ profile riêng: tướng biết rút lui mới là tướng.

## 7. LÍNH ĐỢT RA THEO ĐỒNG HỒ

Bốn `EnemyWaveSpawner` (mỗi phe một cái cho mỗi làn), 3→6 lính mỗi 24 s, **vô hạn đợt**.

⚠ `nextWaveWhenAliveBelow = 0`. Để mặc số mặc định (2) thì hai bên cân nhau ở giữa làn là
**không đợt nào ra nữa** — cả trận đóng băng và không có gì báo.
⚠ Cửa quân của làn trên phải nằm SẴN trên thềm (`CreateSpawnGateShared(name, x, y)`). Cho cả hai
đợt ra dưới đất rồi mong chúng tự leo lên là làn trên trống mấy chục giây đầu, mà trụ trên đó
vẫn bắn — người chơi lên đó là chết một mình.
⚠ **Chỉ TƯỚNG đứng sẵn lúc mở màn.** `RespawnDirector.CaptureTemplates` chụp khuôn ở `Start` nên
chỉ ai có mặt lúc đó mới hồi sinh — đúng ý (tướng sống lại mãi, lính đợt thì không). Nhét sẵn
một tốp lính vào scene là chúng cũng bất tử.

## 8. CỬA HÀNG Ở TRONG NHÀ

Ba món, mỗi món 3 cấp, giá `gốc × (n+1)`: **rèn vũ khí** (lên cấp cây đang cầm + nón/giáp theo
cùng con số) · **giáp** (+28 máu tối đa) · **giày** (+11 % tốc độ).

⚠ Mua được **chỉ khi đứng trong nhà mình** (`_shopRadius` 6, đo cả hai trục), và luật này áp cho
CẢ TƯỚNG MÁY — quyền mua nằm ở trọng tài (`MobaLaneMode.TickHeroShopping` → `MobaHero.TickShopping`,
món rẻ nhất còn mua được, mỗi 2 s một lần) vì chỉ trọng tài biết quầy nằm đâu. Mua ở đâu cũng
được thì "về nhà" mất hết ý nghĩa, mà về nhà là quyết định đắt nhất của một ván MOBA; xem §10c–d.
⚠ Nó vá luôn lỗ *"mua giáp = hồi máu miễn phí"*: `SetMaxHealth` hồi đầy máu, nhưng trong nhà đã
có đài hồi máu nên không tặng thêm gì. **Bê luật này sang mode cho mua đồ giữa sân là bán một
bình máu vô hạn.**
⚠ Ô hỏi đi qua `ModePrompt` (phím F, chạm được) — luật MỘT Ô HỎI. Mode tự gọi
`ModePrompt.EnsureInScene` ở `Awake` nên scene đã bake không phải dựng lại.

## 9. BẢNG SỐ + PHẢI CHẠY LẠI GÌ

Trụ ngoài 260 máu / 8 sát thương · trụ trong 330 / 10 · nhà chính 700 / 14; tầm 9 (nhà 11).
Tiền thưởng ở `MobaBounty`: lính 13 · tướng 85 + 18/cấp **+ 26/mạng trong chuỗi (trần 6)** ·
trụ 150 (kẻ kết liễu ăn trọn, cả phe chia thêm một nửa) · chảy đều 3.2/giây cho mọi tướng kể cả
người đang chờ hồi sinh. Lính siêu cấp: +35 % máu gốc mỗi trụ địch đã hạ, mỗi 2 trụ lên 1 cấp đồ.

⚠ Đổi bất kỳ số nào trong năm file runtime hay trong builder thì **phải bấm lại «★ MOBA hai làn»**
— scene là thứ đã bake, sửa code xong mà không dựng lại thì trong game không đổi gì. Bảng điều
khiển đo bằng `StickmanMobaBuilder.Sources`.
⚠ Mode này **cố ý không dựng được bằng công thức JSON** (khai lý do ở `StickmanRefereeTable.
NotInRecipe`): sân của nó có tầng, có chuỗi trụ và có cửa quân trên thềm — công thức chỉ tả được
một sân phẳng với vài cột mốc rời. Xem [CheapAI.md](CheapAI.md).

## 10. BỐN LỖ ĐÃ VÁ (2026-09-09) — đọc trước khi sửa lại mấy chỗ này

Cả bốn đều CÂM: ván vẫn chạy, không dòng lỗi nào, và cái nhìn ra được thì không trỏ về nguyên nhân.

**a. TRẦN QUÂN SỐ NUỐT TƯỚNG MÁY.** Builder khai `maxAlivePerTeam: 4`, mà hàng đợi hồi sinh của
màn này CHỈ có bốn tướng — lính đợt không được `CaptureTemplates` chụp khuôn nên không bao giờ
xếp hàng. Nhưng `RespawnDirector.AliveOf` thì **đếm cả chúng**, và mỗi phe nuôi tới 24 lính sống.
Hệ quả: tướng chết → chờ chỗ 20 s (`_npcSlotWaitLimit`) → **bị bỏ lượt vĩnh viễn**. Sau vài phút
phe máy không còn tướng, bảng tỉ số hiện ☠ tới hết trận.
Nay: builder để `maxAlivePerTeam: 0`, **và** `MobaHero` khai `IRespawnPriority` (Core) để scene đã
bake trước bản này cũng tự lành. Đo bằng `StickmanMobaCheck.CheckRespawnCap`.
⚠ Bài học chung: **màn nào có nguồn đẻ quân thứ hai thì trần của `RespawnDirector` là trần CHUNG
của cả hai nguồn** — cùng bẫy đã ghi ở [Respawn.md](Respawn.md) §7b cho `Demo_20_WarCamp`.

**b. MÁU TỐI ĐA CÓ HAI CHỦ.** `MobaHero.ApplyArmor` ghi `SetMaxHealth(máu gốc + giáp)` còn
`StickmanExperience.ApplyMilestone` ghi `SetMaxHealth(máu gốc + thưởng cấp)`. Ai ghi sau thắng:
mua giáp rồi lên cấp là **mất sạch giáp**, lên cấp rồi mua giáp là **mất sạch thưởng cấp**. Nhìn
ra được chỉ là *"tướng sao mỏng máu thế"*.
Nay `ApplyArmor` **đo lại nền** thay vì nhớ một con số chụp lúc `Awake`: `_healthStamp` là giá trị
chính nó vừa ghi — còn khớp thì trừ phần giáp cũ ra (khỏi cộng đúp), khác đi thì chủ kia vừa ghi
một con số mới và ta cộng giáp lên trên. Vế thứ hai: nghe `StickmanExperience.LeveledUp` để đắp
lại ngay sau mỗi lần lên cấp.
⚠ Chưa mua giáp lần nào thì **đừng gọi `SetMaxHealth`** — nó hồi đầy máu, gọi bừa là tặng một
lần hồi máu mỗi lần lên cấp giữa giao tranh.

**c. TƯỚNG MÁY MUA ĐỒ Ở GIỮA SÂN.** `MobaHero.Update` tự mua mà không hỏi chỗ đứng, nên luật
«cửa hàng ở trong nhà» (§8) chỉ áp cho người chơi. Hai hậu quả: bất đối xứng (một nửa số người
trên sân không phải trả cái giá đắt nhất của ván MOBA), và **bình máu vô hạn** — `ApplyArmor` gọi
`SetMaxHealth` mà hàm đó hồi đầy máu; ràng cửa hàng vào trong nhà chính là để chỗ hồi đầy ấy
trùng với đài hồi máu. Đúng cái lỗ mà §8 sinh ra để bịt.
Nay quyền mua nằm ở TRỌNG TÀI (`MobaLaneMode.TickHeroShopping` → `MobaHero.TickShopping`): chỉ
nó biết quầy ở đâu, nên chỉ có một chỗ áp luật cho cả hai loại người.

**d. TƯỚNG MÁY KHÔNG BAO GIỜ VỀ NHÀ.** Vá (c) xong thì lộ ra vế còn thiếu: `HeroObjective` chỉ
biết «cứu nhà» và «đẩy làn», nên bot ôm túi vàng suốt trận và càng về cuối càng yếu hơn người
chơi một cách vô lý. `MobaLaneMode.HomeErrand` thêm đúng hai lý do về nhà — **máu dưới 40 %**
hoặc **đủ tiền mua món kế tiếp** — và quầy hàng đứng cùng chỗ đài hồi máu nên một chuyến lo cả
hai việc, y như người chơi làm.
⚠ Thứ tự trong `HeroObjective` là LUẬT: cứu nhà › về nhà › đẩy làn. Đảo hai vế đầu là tướng đi
mua đồ trong lúc nhà đang sập.

## 11. BẬC KHÓ ĐANG NHÂN BẢN TƯỚNG (2026-09-09) — lỗ thứ năm

`GameSession.ApplyTroopCount` nhân/bớt quân theo BẬC KHÓ bằng cách nhân bản chính nhân vật có
sẵn trong scene. Nó chạy ở `Start`, và **lúc đó trên sân MỚI CHỈ CÓ TƯỚNG** — lính đợt phải 10
giây nữa mới ra. Nên danh sách nó nhặt được đúng là bốn ông tướng:

| Bậc khó | Chuyện xảy ra |
|---|---|
| cao (`enemyCountScale > 1`) | tướng bị **NHÂN BẢN**, bản sao mang theo `_slotId` của bản gốc ⇒ hai người xài chung một ví (§4): người này mua đồ thì người kia có đồ |
| dễ (`< 1`) | tướng bị **XOÁ BỚT** ⇒ phe đó vào trận thiếu người |

Bậc Thường thì `scale = 1` và hàm thoát ngay, nên lỗi chỉ lộ ra ở hai đầu — đúng kiểu chỉ gặp
"tuỳ lúc" và không ai truy ra.

Vá bằng nhãn `ScriptedUnit` (*"đừng nhân bản tôi"*) trên từng tướng, `Respawns = true` (tướng
MOBA sống lại mãi — hai câu hỏi khác nhau trên cùng một nhãn, xem chú thích của chính
`ScriptedUnit`). Builder bake sẵn, và `MobaLaneMode.EnsureHeroesAreScripted` dán ở `Awake` cho
scene dựng trước bản vá — kịp vì `GameSession` đọc nhãn ở `Start`.
⚠ Mode cũng khai `TroopCountIsRule = true`: số tướng LÀ luật chơi ở đây. Cờ đó chỉ chặn vế
*"phe địch đông hơn khi bên mình có tướng"*, **không** chặn vế nhân theo bậc khó — nên cần cả hai.

## 12. HAI THỨ GIỮ CHO VÁN KHÔNG ĐỨNG (2026-09-09)

**a. LÍNH SIÊU CẤP — `MobaMinionRank`.** Đợt lính của phe đã hạ được trụ thì dày thêm
`0.35 × số trụ` phần máu gốc, và cứ hai trụ thì lên một cấp đồ. Trước đó phá xong một cái trụ,
phần thưởng duy nhất là *"cái trụ hết bắn"* — đợt lính vẫn y hệt phút đầu, hai làn khoá nhau ở
giữa và ván trôi tới hết 900 giây để `CheckTimeout` chấm theo số trụ. Có ĐÀ thì phe thua buộc
phải ra giao tranh để chặn thay vì ngồi thủ chờ tiếng còi.
⚠ **Mức là mức LÚC RA LÒ, không nâng cho đợt đang đứng trên sân.** `SetMaxHealth` hồi đầy máu,
nên nâng cả đợt là ngay sau khi trụ đổ mọi người lính của phe đó cùng đầy máu giữa giao tranh —
người chơi đang đánh dở đọc ra là game hỏng. MOBA thật cũng vậy: siêu binh đến từ ĐỢT SAU.
⚠ Nhãn nằm trên chính người lính (chết theo lính) chứ không phải một cái sổ ở trọng tài: một ván
15 phút sinh gần nghìn lính đợt.
⚠ Phải HÔ ra khi đợt lính mạnh lên (câu «HẠ TRỤ…» có thêm vế đó), không thì người chơi chỉ thấy
*"sao lính địch tự nhiên trâu thế"*.

**b. TREO THƯỞNG THEO CHUỖI HẠ GỤC — `Sheet.spree` + `MobaBounty.HeroPerSpree` (26/mạng, trần 6).**
Đây là đường LẬT KÈO của cả mode. Không có nó thì một pha ăn may ở phút 3 nở thành cả ván không
gỡ được: đứa dẫn trước mua đồ sớm hơn, giết dễ hơn, lại mua tiếp. Có nó thì chặn đúng một người
là lấy lại cả khoản chênh.
⚠ Chuỗi **về 0 khi chết** — tiền treo chỉ đáng giá chừng nào nó còn CÓ THỂ MẤT.
⚠ Luật lật kèo mà không ai nhìn thấy thì không phải luật: `TickSpreeNews` hô ở mốc 3 mạng và hô
lúc bị chặn, còn bảng tỉ số hiện thẳng số tiền treo trên dòng của người đang gánh.
