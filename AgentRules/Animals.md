# THÚ VẬT — gia súc · thú hoang · chim · vật cưỡi thú dữ (2026-09-07)

User: *"thêm chế độ chăn nuôi… thêm các loài động vật tự nhiên đi lang thang, chim chóc bay…
thêm nhiều loại thú cưỡi, skin thú cưỡi khác nhau và cấp độ thú cưỡi"*.

## Luật 1 — MỌI CON VẬT BỐN CHÂN DÙNG CHUNG RIG CỦA VẬT CƯỠI

`StickmanHorse` là rig 4 chân IK hai khúc, sải chân tự tính theo tốc độ. Gia súc, thú hoang và
vật cưỡi mới **đều đổ vào `StickmanHorse.Build`**.

Hệ quả cần nhớ: **thêm một loài bốn chân KHÔNG phải vẽ một frame animation nào** — chỉ cần 3
tấm tĩnh (thân · đùi · ống chân) là có sẵn dáng đi/chạy đúng tốc độ.

⚠ Đừng viết rig thứ hai cho "con vật nhỏ". Con gà và con voi khác nhau đúng ba con số
(`withersHeight`, `legLength`, `bodyLength`), không khác về cơ chế.

## Luật 2 — HAI ASSET, KHÔNG PHẢI MỘT

| | `MountDefinition` | `AnimalDefinition` |
|---|---|---|
| Trả lời | "cưỡi nó thì được gì" | "nó sống thế nào" |
| Có riêng | yên · tư thế ngồi · `minMeleeReach` · giáp theo cấp · skin | vai (`AnimalRole`) · tốc độ chạy · bán kính sợ · sát thương đớp |

Gộp lại thì hoặc con gà mang bảy ô chỉ có nghĩa khi có người trên lưng, hoặc tám con ngựa chiến
mang bốn ô của cái chuồng bò. **Hình thì dùng chung, bảng số thì tách.**

## Luật 3 — `AnimalRole` quyết định hành vi, và ba vai KHÔNG đối xứng

- `Livestock` — kệ người, quanh quẩn trong chuồng. **Không** `TeamMember`.
- `Wild` — thấy người trong `fleeRadius` là chạy NGƯỢC hướng người. **Không** `TeamMember`.
- `Predator` — lao vào người, đớp qua `DamageInfo` chung. **CÓ** `TeamMember` phe
  `WildAnimal.BeastTeam` (= 4), cùng khuôn zombie (phe 3).
- `Territorial` — **vai thứ tư, thêm 2026-09-09.** Kệ người như gia súc CHO TỚI KHI bị đụng
  vào, rồi húc. Phe bật/tắt được. Xem Luật 26.

⚠⚠ **Chỉ Predator mới được gắn phe**, và đây là đánh đổi có chủ ý:

- gắn phe = lính hai bên NHÌN THẤY và đánh trả. Bắt buộc với con sói (một con thú cắn người mà
  không ai đánh lại được là lỗi, không phải thiết kế);
- không gắn phe = `AreEnemies` trả true cho mọi phe (ai cũng chém được) nhưng `TeamMember.All`
  không chứa nó nên `FindNearestEnemy` không bao giờ nhắm vào. Đúng cái muốn cho đàn cừu:
  **giết được nhưng không ai đi săn** — nếu không, một trận đánh biến thành cảnh hai bên bỏ nhau
  ra để rượt gà.

## Luật 4 — CON VẬT BÁM MẶT ĐẤT, KHÁC HẲN NGỰA HOANG

`RiderlessHorse` giữ nguyên `y` lúc sinh ra (nó luôn được thả ngay dưới chân kỵ sĩ vừa ngã, trên
nền phẳng thì không ai thấy sai). Thú hoang đi cả map, mà map **lượn sóng** (`TerrainGround`), nên
`WildAnimal.StickToGround` ghi thẳng `SurfaceYAt(x)` mỗi frame.

⚠ Ghi thẳng chứ KHÔNG thả rơi bằng vật lý: con vật là "công trình" (`ConfigureAsStructure`) nên
không có gì kéo nó xuống, mà kể cả có thì thả rơi trên nền dốc là nảy lên nảy xuống — đúng cái
bẫy `StickmanLocomotion` đã phải chữa. Ngoài vùng có `TerrainGround` thì **giữ nguyên `y`**.

## Luật 5 — LỚN LÊN = DỰNG LẠI RIG, KHÔNG PHẢI `localScale`

`StickmanHorse.Build` **bake** `_hipLocal` và `_legLength` theo `rootScale` lúc dựng. Co
`transform.localScale` sau đó thì khớp hông không còn nằm ở đúng chiều cao chân → móng lún xuống
đất hoặc treo lơ lửng, **và không có gì báo**.

Nên `Build` đã được làm **DỰNG LẠI ĐƯỢC** (2026-09-07, xem `ClearRig`) và
`WildAnimal.RebuildRigAtScale` là đường duy nhất để đổi cỡ. Trước đó gọi `Build` lần hai là chồng
nguyên một bộ rig thứ hai lên bộ cũ — bốn chân thừa vẫn chạy solver, vẫn được vẽ, không lỗi nào báo.

⚠ `ClearRig` xoá theo **danh sách mảnh đã dựng**, không xoá mọi con của `transform`:
`StickmanHorse` nằm ngay trên root của `WildAnimal`, mà root đó còn treo thứ khác.

## Luật 6 — CHIM KHÔNG DÙNG IK, VÀ KHÔNG PHẢI ĐƠN VỊ

`StickmanBird` = thân + 2 cánh, cánh chỉ là **phép xoay quanh khớp vai**. Cánh không chạm gì cả,
nên giải IK cho nó là giải một bài toán không ai hỏi mà vẫn phải tự viết phần nhịp.

⚠⚠ **Sprite cánh phải chĩa về −X (RA SAU), pivot ở MÉP PHẢI.** `StickmanBird` xoay cánh bằng
`Sin(pha) × flapAngle`, tức **góc 0 = cánh nằm đúng theo sprite**. Vẽ cánh chĩa ra TRƯỚC thì ở góc
0 cánh đè lên đầu và cả nhịp vỗ hoá thành cái chong chóng quay trước mặt con chim — đã dựng thử
một chu kỳ và nhìn thấy đúng như vậy trước khi sửa.

⚠ Chim **không** là `StickmanController`: không máu, không ăn đòn, không phe. Cho nó máu là mọi
cung thủ trong tầm quay ra bắn chim. Nó là KHÔNG KHÍ của bản đồ, không phải một đơn vị.

`flapsPerSecond` là dấu hiệu số một để mắt đọc ra chim to hay bé — **hơn cả kích thước**, vì trên
nền trời không có gì để so cỡ. Sẻ 8 nhịp/giây, đại bàng 2.2.

## Luật 7 — CẤP VẬT CƯỠI ĐỔI BA CON SỐ, KHÔNG CHỈ ĐỔI TẤM GIÁP

Trước 2026-09-07 cấp ngựa **chỉ** đổi `bardingSprites`. Con cấp 5 khoác giáp kín mít nhưng **gục
đúng bằng số đòn** với con cấp 0 trần truồng: người chơi đọc đường bao ra "con này khoẻ hơn" rồi
lao vào và chết, mà không gì trong game nói cho họ biết là họ đọc sai.

Nay `MountDefinition` có `healthPerTier` · `speedPerTier` · `damageSharePerTier`, và
`HealthAtTier` / `SpeedAtTier` / `DamageShareAtTier` là **một chỗ trả lời** cho ba nơi gọi trong
`StickmanMount`. `DamageShareAtTier` vẫn kẹp 0.9 — để 1.0 là kỵ sĩ **bất tử** chừng nào ngựa còn sống.

⚠ `SetGearTier` gọi được GIỮA TRẬN, và nó **cộng phần chênh** máu chứ không đặt lại về đầy: đặt
lại là mỗi lần lên cấp đều hồi máu ngựa miễn phí — một cái nút hồi máu ẩn không ai gọi tên.

## Luật 8 — SKIN CÓ TÊN ≠ `coatColors`. HAI TRỤC, ĐỪNG GỘP

| | `coatColors` | `skins` (`MountSkin`) |
|---|---|---|
| Là gì | ĐÀN KHÔNG ĐỀU | MỘT BỘ MẶT CÓ TÊN |
| Ai chọn | bốc ngẫu nhiên | người chơi / builder |
| Vì sao có | 4 kỵ binh mà ra 4 con y hệt là lộ hàng nhân bản | HUD gọi được tên, khoá được sau một cấp |

Bốc ngẫu nhiên `skins` là hỏng luôn ý nghĩa "chọn". Đúng khuôn hai trục của vũ khí (chất liệu
theo cấp × kiểu rèn) — trộn hai trục vào một kênh thì trục nào cũng xoá mất trục kia.

⚠ Skin **không cộng chỉ số nào**: skin đẹp mà còn mạnh hơn thì không còn ai chọn theo sở thích.
Nó chỉ nối với cấp qua `unlockTier`.

⚠ `TryGetSkin` **đếm trước rồi mới bốc** trong danh sách đã mở khoá. Lọc bằng cách nhảy cóc chỉ số
thì một skin khoá ở giữa làm lệch hết chỉ số phía sau, và cùng một `index` ra hai con khác nhau
tuỳ cấp — con ngựa "tự đổi màu" lúc lên cấp là thứ cực khó lần ra.

## Luật 9 — CHĂN NUÔI NỐI VÀO HỆ ĐÃ CÓ, KHÔNG ĐẺ NỀN KINH TẾ THỨ HAI

- **Của cải** → `LivestockPen` đổ vào một `ResourceNode` kiểu Crop của phe; nông dân gặt bằng
  vòng làm việc sẵn có. **Không một dòng AI nào mới.**
- **Phòng thủ** → `CampHomeGuard` vốn đã biết đánh thứ có `TeamMember` phe lạ.
  ⚠ Nhưng **sói KHÔNG đụng được đàn** — xem Luật 9b.
- **Con vật** → `LivestockAnimal` : `WildAnimal` : rig `StickmanHorse`.

Phần MỚI thật sự chỉ có hai con số: **KHO CỎ** và **SỨC CHỨA**.

⚠⚠ **KHÔNG cộng thẳng vàng khi con bò cho sữa.** Cộng thẳng là thu nhập thụ động: người chơi xây
chuồng rồi đi chỗ khác, tiền tự chảy, và cả mode rút gọn thành một cái đồng hồ đếm. Đổ vào
`ResourceNode.Restock` thì sữa vẫn phải **có người đi lấy** — nó tranh nông dân với mỏ vàng và bãi
gỗ, nên nuôi nhiều bò là một quyết định phải trả giá.

⚠ `Restock` nâng **cả `_amount`** (trần mà `_remaining` hồi về sau mỗi lần mọc lại), và mở lại
`_done`: chỉ cộng `_remaining` thì lần mọc lại kế tiếp kéo tụt kho về số cũ, còn quên mở `_done` là
đàn bò cho sữa vào một cái thùng không ai tới lấy.

### Ba cái van của mode

- **Đói thì không lớn, không đẻ, không cho sữa** — nếu không, bỏ đói lại là cách nuôi rẻ nhất,
  ngược hẳn ý đồ.
- **`RanchMode` chấm trên SẢN LƯỢNG, không trên số con** — chấm số con thì cách chơi tối ưu là mua
  thật nhiều con non rồi đứng nhìn. Sản lượng đòi phải có con trưởng thành (con non không cho
  sữa) VÀ phải cho ăn, tức chỉ tiêu tự gói trọn cả ba việc của nghề chăn nuôi.
- **`_graceTime` đầu ván** — mode thua khi đàn trống, mà chuồng cần vài frame mới thả xong lứa
  đầu. Thiếu ân hạn là ván tự thua sau 6 giây, trông y như "mode hỏng" chứ không như một luật.

⚠ Scene dựng ra phải **thả sẵn con TRƯỞNG THÀNH**: `TryBreed` đòi ≥2 con lớn, nên thả toàn con non
là cái chuồng vĩnh viễn không sinh sản cho tới khi lứa đầu lớn.

## Luật 9a — KHO CỎ PHẢI CÓ **VÒI NẠP**, VÀ CỎ MUA BẰNG LÚA (2026-09-09)

⚠⚠ **Lỗi gốc:** `LivestockPen._feed` chỉ có đường RA (`TakeFeed`, mỗi con 0.09/giây). Đường VÀO
`AddFeed` **không một dòng nào gọi** — kho 12 đơn vị cạn sau ~33 giây (đàn 4 con), đàn đói ở giây
87 và **chết sạch ở giây 146**, trong khi `_timeLimit` là 300. Tức mode chăn nuôi **thua 100% số
ván** bất kể người chơi làm gì; mà `GameModeHud` còn giục *"⚠ ĐANG ĐÓI — đổ thêm cỏ!"* trong khi
không một nút nào đổ được. Biên dịch xanh, Doctor xanh.

**Luật:** kho cỏ nạp lại bằng **`ResourceType.Crop` của phe** (`ResourceDepot.TrySpend`), không
bằng vàng và không tự đầy.

- Nuôi đàn và nuôi quân **ăn CHUNG một kho lúa** — đó là chỗ người chơi phải chọn. Lấy vàng thì
  chăn nuôi thành nhánh chi tiêu rời, không đụng ai, và mất luôn quyết định.
- **Tỉ giá neo vào lính:** một con ăn 0.09 cỏ/giây × `_cropPerFeed` 0.5 = 0.045 lúa/giây ≈
  `EconomyProfile.cropPerSoldierPerSecond` (0.05). **Một con đáng một lính ăn.** Đổi số đó là đổi
  tỉ giá ấy, không phải chỉnh một hằng số rời.
- **Phe không có `ResourceDepot` thì tiếp cỏ MIỄN PHÍ** (`_freeRestock`, mặc định bật): rất nhiều
  scene chăn nuôi không dựng kinh tế, và với chúng "không có kho" phải nghĩa là "không tính tiền
  cỏ", chứ không phải "đàn chết đói".
- **Tiếp cỏ phải nằm TRÊN cái `return` của nhịp đẻ** trong `Update`. Đặt dưới thì kho chỉ nạp mỗi
  `_breedInterval` giây, mà `TryBreed` lại đòi `_feed ≥ _breedFeedFloor` ⇒ chuồng tự khoá mình.

**Phép đo giữ luật:** «Kho chỉ có vòi ra: đường nạp có ai gọi không» (`StickmanDoctor.Wiring.cs`) —
trường bị TRỪ mà mọi chỗ CỘNG đều nằm trong hàm không ai gọi. Hiệu chuẩn: **1 findings trên cây
trước khi sửa (đúng `_feed`), 0 trên cây sau khi sửa.**
⚠ Bản đầu của check chỉ bắt `+=`/`++` nên **im re trên chính file hỏng** (`AddFeed` nạp bằng
`Mathf.Min(_feed + amount, cap)`); phải bắt cả dạng **gán lại từ chính nó**.

## Luật 9b — THÚ DỮ **KHÔNG** ĐỤNG ĐƯỢC GIA SÚC (mâu thuẫn còn treo, 2026-09-09)

Ba nơi cùng tin sói ăn gia súc — lời dẫn `RanchMode`, chú thích đầu `LivestockPen`, và
`StickmanRanchBuilder.Scene` (thả sói XA chuồng vì *"thả cạnh chuồng là đàn bị ăn ngay trong ba
mươi giây đầu"*). **Nhưng code thì không:** `WildAnimal.Senses.NearestPrey` lọc bỏ mọi vai khác
`AnimalRole.Wild`, nên sói không bao giờ nhắm được gia súc; và gia súc **không mang `TeamMember`**
nên `FindNearestEnemy` của lính địch cũng không thấy chúng.

⇒ Sau khi sửa Luật 9a, **sức ép duy nhất của mode là cỏ/lúa** — đàn không có kẻ thù tự động nào.
Lời dẫn đã được sửa cho khớp code (không hứa thứ không có).

**Muốn có thú dữ thật** thì mở `NearestPrey` cho `Livestock` — nhưng chú thích ở đó từ chối *có lý
do*: "đàn cứ hụt dần mà người chơi không hiểu vì sao". Mở thì **bắt buộc kèm lời hô**
("SÓI ĐANG CẮN ĐÀN!") để mất mát luôn có nguyên nhân nhìn thấy được. Đây là **quyết định thiết kế
đang chờ chốt**, không phải lỗi để ai đó tiện tay sửa.

## Luật 11 — ĐI SĂN: BA CÁI VAN, BỎ CÁI NÀO CŨNG XẸP THÀNH BẮN BIA

`HuntMode` (2026-09-07). Bỏ bất kỳ vế nào dưới đây thì mode rút gọn thành trò bấm chuột:

1. **TẦM PHÁT HIỆN CO THEO ĐỘ ỒN** — `WildAnimal.Noticeability(TeamMember)`, nhân vào
   `fleeRadius`:

   | Người chơi đang | Hệ số |
   |---|---:|
   | ngồi thụp + đứng yên | **0.35** |
   | ngồi thụp + bò | 0.55 |
   | đi bộ | 0.80 |
   | chạy (`TravelSpeed` > 2.2) | **1.25** |

   ⚠⚠ **Đây là thứ biến "bắn thú" thành "đi săn".** Cự ly phát hiện CỐ ĐỊNH thì cây cung nào
   bắn xa hơn cự ly đó là thắng tuyệt đối — đứng ngoài tầm, bắn, xong, không có quyết định nào.
   Cho tầm ấy co lại khi người chơi ngồi thụp thì mỗi con mồi là một bài toán: *đi nhanh cho kịp
   giờ, hay bò từng bước cho tới khi đủ gần*.

   ⚠ `NearestPerson` phải quét ở tầm **rộng nhất có thể** (`fleeRadius × 1.25`) rồi lọc lại từng
   người theo hệ số của chính họ. Quét đúng `fleeRadius` là người đang CHẠY lọt lưới cho tới khi
   vào sát tầm cơ bản — tức rình hay không rình cũng như nhau.

   ⚠ Người không có `StickmanLocomotion` trả **1.0** (giữ nguyên hành vi cũ), không phải 0
   (thành vô hình) hay 2 (thành cái còi báo động).

2. **TÊN CÓ HẠN** — và bể đạn là `WeaponBase._ammo` SẴN CÓ, phát qua `SetAmmo`.
   ⚠⚠ Mode **không** được giữ bản đếm riêng: hai con số cùng nói "còn mấy mũi" thì chúng lệch
   nhau ngay lần đầu người chơi nhặt bó tên trên sân hoặc đổi sang cây cung thứ hai. Đi qua bể
   đạn có sẵn thì HUD vũ khí · `IsOutOfAmmo` · giỏ `AmmoCache` tự đúng theo.
   ⚠ `SetAmmo` phải nới cả `_maxAmmo`, nếu không `AddAmmo` kẹp ngay lượng vừa phát và bó tên
   nhặt được không nhúc nhích số — một phép kẹp hoàn toàn hợp lệ nên không gì báo.
   ⚠ Phát cho **mọi** cây bắn/ném mà người chơi mang, KHÔNG riêng cây đang cầm (đổi vũ khí là
   một bể vô hạn khác); và **không** phát cho `MeleeWeapon` (kiếm hết "đạn" thì vung không được,
   trông y như kiếm hỏng).

3. **CON MỒI NGUY HIỂM ĐÁNG ĐIỂM NHẤT** — lợn rừng · sói (`AnimalRole.Predator`) lao vào cắn.
   Không có rủi ro thì điểm cao chỉ là điểm *nhiều thời gian hơn*.

### Chấm điểm

- Chấm trên **ĐIỂM**, không trên số con — cùng lý do `RanchMode` chấm sản lượng: chấm số con thì
  bắn một đàn thỏ đứng yên là xong và phần rình mò thành đường vòng vô nghĩa.
- `gameValue` đi theo **ĐỘ KHÓ SĂN**, không theo cỡ con vật: thỏ 2 · cáo 4 · nai 6 · lợn rừng 7 ·
  sói 8. Cho điểm theo cỡ thì con lợn rừng (to, chậm, *lại còn tự lao vào tầm bắn*) thành mồi ngon
  nhất bảng và người chơi không bao giờ phải rình.
- ⚠ **CHỈ tính khi chính người chơi hạ nó** (`WildAnimal.AnyDied` mang theo `killer`; đi
  `GetComponentInParent<TeamMember>` vì `DamageInfo.source` của một mũi tên là *cái mũi tên*).
  Không lọc thì cách chơi tối ưu là thả sói vào rừng rồi ngồi đợi.
- `AnyDied` là sự kiện **TĨNH**: con vật sinh ra giữa ván (đàn tự đẻ, thả thêm) phải đếm được,
  mà nối dây từng con thì con nào lọt lưới là bắn hạ nó **không được điểm**.

### Bản đồ đi săn

Phải **DÀI và có gò che tầm nhìn** (`Demo_51_Hunt`: 96 đơn vị, `CreateRollingGround`). Sân phẳng
ngắn thì con nai chạy vài bước là đụng mép map rồi quay lại ngay tầm bắn — con mồi không có chỗ
trốn thì không có gì để rình. Đúng bài học đã ghi cho `Demo_21_Arena`.

Thú rải theo **ba vùng khó dần** (thỏ → nai/cáo → lợn rừng/sói): người chơi đi từ trái sang phải
là độ khó tự tăng, không cần một dòng luật "mở khoá" nào.

⚠ Người chơi **không cần được "phát" thêm vũ khí**: prefab vốn mang cả bộ, `_startIndex` chỉ chọn
cây cầm sẵn. Thêm một bước phát vũ khí trong builder là dựng đường thứ hai song song đường đã có.

## Luật 10 — ART LÀ BẢN VẼ BÙ, VÀ TỈ LỆ PHẢI LẮP THỬ MỚI BIẾT

`StickmanAnimalArt` (partial của `WeaponArtGenerator`) vẽ 28 tấm vào `Assets/Sprites/Animals/`.
Đây là **art vẽ bù** theo Luật số 0 — thả PNG đẹp đè lên là `StickmanArtSource.CanCodeWrite` tự
chừa ra vĩnh viễn.

⚠ **Dựng dáng bằng `Line` DÀY, không phải `Rect`.** `Rect` cho hình hộp mép trên/dưới thẳng băng
và dải bụng tối thành một CÁI THANH nổi giữa thân. `Line` vẽ capsule bo tròn hai đầu.

⚠ **Tai thú vẽ bằng TAM GIÁC (`AnimalWedge`), không bằng `Line`.** `Line` bo tròn đều hai đầu nên
tai ra hình que song song — tai THỎ dán trên đầu con sói.

⚠⚠ **Nhìn từng sprite rời KHÔNG thấy được lỗi tỉ lệ.** Bản đầu có thân đẹp mà lắp vào ra con hổ
đứng trên bốn sợi dây thép. Phải **lắp thử** thân + 4 chân theo đúng công thức `StickmanHorse`
(chân ở ±0.17/−0.15 × `bodyLength`, khớp ở độ cao `legLength`, mỗi khúc dài `legLength × 0.62`,
sprite chân co theo **CHIỀU CAO**, sprite thân co theo **BỀ NGANG**) rồi nhìn cạnh một nhân vật
cao 0.65. Script mô phỏng: `.claude/skills/stickman-assets/scripts/canvas.py`.

⚠ Cỡ trong `StickmanRanchBuilder` khai theo **TỈ LỆ chiều cao nhân vật đo từ rig**
(`StickmanRigMetrics.Measure`), không gõ world unit — gõ tay thì hôm nào rig đổi cỡ là cả đàn lệch
mà không gì báo.

## Luật 12 — KÉO & THẢ (Angry Birds) ĐÃ CÓ SẴN, ĐỪNG VIẾT LẠI

`AimMode.DragPull` (`WeaponTypes.cs`) + `StickmanFighterController.HandleDragPull/UpdateDrag`.
Từ 2026-09-07 nó là **mặc định** của `StickmanFighter.prefab` (`_aimMode: 0`); trước đó prefab
để `PointAim` nên hầu như không ai thấy chế độ này tồn tại.

Nó đã làm ĐÚNG toàn bộ hành vi kiểu Angry Birds — kiểm lại trước khi định viết thêm:

| Yêu cầu | Đã có ở đâu |
|---|---|
| Kéo phải → quay/bắn TRÁI | `pull = origin − pointer` trong `UpdateDrag` |
| Kéo lên → bắn XUỐNG | cùng phép trên (vectơ ngược, cả hai trục) |
| Kéo xa = mạnh hơn | `_charge = InverseLerp(_minPullWorld, _maxPullWorld, distance)` |
| Mũi tên GIẢ trên dây cung | `RangedWeapon._ammoVisual` + `SyncArrowToString` |
| Dây cung kéo căng theo lực | `RangedWeapon.OnChargeUpdate` → `SetBowStringPoint` |
| Thả ra: ẩn tên giả, bắn tên thật | `DoAttack` → `FireOne` (projectile riêng) |
| Tên có TRỌNG LỰC | `Arrow.prefab` `m_GravityScale: 1` |
| Vệt chấm chỉ hướng | `UpdateDragDots` |

⚠⚠ **GỐC CỦA VECTƠ KÉO LÀ CHỖ NGÓN CHẠM XUỐNG (mốc A), bắn theo hướng B→A.** Đo
`A − ngónHiệnTại` trong WORLD: kéo xuống-trái thì tên bay lên-phải, kéo càng dài càng mạnh.
⚠ Giữa chừng (2026-09-16) từng đổi sang neo ở NHÂN VẬT (`viTriNhanVat − ngón`, ánh xạ tuyệt
đối) để chữa câu *"kéo thì nó xoay lung tung"*; người dùng chơi thử rồi bác — ánh xạ tuyệt đối
biến cú kéo thành cú chỉ điểm. Mốc A vô hình nay chữa bằng HÌNH: chấm mốc đứng yên tại A
(`_startTouchIcon`) + vệt chấm A→B, xem `StickmanFighterController.UpdateDrag`.

⚠ Cây **không tích lực** (kiếm · giáo · súng lục — `WeaponBase.AttackOnPress`) KHÔNG đi đường
kéo-thả mà rẽ sang `HandleInstantSwing`. Không rẽ thì hai lỗi cùng lúc: đòn chỉ ra khi NHẢ chuột,
và ngắm bằng `origin − pointer` nghĩa là chỉ chuột vào địch lại vung ra hướng ĐỐI DIỆN.

⚠ `ArcherPlayerController` + `ArrowPoolManager` là **bản port cũ chưa nối vào đâu** (không
prefab/scene nào dùng). Nó có bể mũi tên RIÊNG, không đi qua `WeaponBase`/`DamageInfo` — nối nó
vào là dựng hệ đạn thứ hai song song. Sửa `StickmanFighterController`, đừng sửa nó.

## Luật 13 — HAI MÀN BẮN TẦM XA: MỘT CÁI DÙNG LẠI LUẬT, MỘT CÁI ĐÁNG CÓ LUẬT MỚI

**`Demo_52_Volley`** (hai phe cung thủ, hố ở giữa) — **KHÔNG có mode riêng**. Luật thắng của nó
(*phe nào chết sạch trước thì thua*) chính là `SkirmishMode`. Cái mới nằm ở HÌNH DÁNG SÂN, tức ở
builder. ⚠ Cái **HỐ** mới là thứ làm nên màn, không phải hai cái bệ: sân phẳng thì hai bên đi bộ
tới đánh giáp lá cà và cung tên thành thừa. ⚠ Chỉ phát vũ khí TẦM XA — một cây kiếm lọt vào là cả
hai bên bỏ bắn, nhảy xuống hố hỗn chiến.

**`Demo_53_TowerHold`** — **CÓ** `TowerHoldMode`, vì nó có một luật thật sự mới:
**địch đặt chân lên sàn là THUA NGAY**, kể cả khi người chơi còn đầy máu.

⚠⚠ Bỏ luật đó thì mode xẹp thành `HoldoutMission` có thêm cái tháp: cứ đứng trên cao mà nã, ai
leo lên thì đánh giáp lá cà cho tới hết giờ — và chiều CAO, thứ duy nhất khiến cái tháp có nghĩa,
không mua bán gì cả. Có nó thì mỗi tên bám thang là một ĐỒNG HỒ ĐẾM NGƯỢC, và người chơi phải
chọn: bắn tên đang trèo (gần, gấp) hay tên đang phá chân tháp (xa, nguy hiểm dài hạn).

⚠ Điều kiện "đã lên sàn" phải thoả **CẢ HAI**: đủ cao VÀ đủ gần tâm tháp. Chỉ xét chiều cao thì
một tên đứng trên gò đất ở tít đầu map cũng làm thua ván, và người chơi không đoán ra vì sao.

⚠⚠ **THÁP PHẢI CÓ THANG.** Không lối lên thì địch chỉ đứng dưới đấm chân tháp, luật trên KHÔNG
BAO GIỜ chạm tới, ván luôn kết thúc bằng hết giờ — và không gì báo lỗi, nhìn vào chỉ thấy "mode
hơi dễ". `StickmanClimbZone` là đường trèo mà `AIStateEscalade` sẵn có biết dùng.

⚠ `TowerHoldMode.PlayerDown` **tra lại người chơi mỗi lần chưa tìm ra**, không cache một lần:
người chơi hồi sinh thành `GameObject` khác, nên giữ tham chiếu cũ là mode chấm trên một cái xác
vĩnh viễn và ván thua ngay lần chết đầu dù luật hồi sinh vẫn bật.

## Luật 14 — BỐN MÀN THI BẮN CUNG: RANH GIỚI GỘP/TÁCH LÀ **LUẬT THẮNG THUA**

Thêm 2026-09-08. Bốn màn, nhưng chỉ **hai** mode:

| Scene | Mode | Cái gì đang ĐỘNG |
|---|---|---|
| `Demo_54_ArcheryRange` | `ArcheryTrialMode` skin `Range` | không ai — bài kiểm tra thuần về ngắm |
| `Demo_55_HorseArchery` | cùng mode, skin `Mounted` | **người bắn** (phi ngựa, không dừng được) |
| `Demo_57_Skeet` | cùng mode, skin `Skeet` | **mục tiêu** (bay theo vòng cung) |
| `Demo_56_AppleShot` | `AppleShotMode` — **riêng** | — |

⚠⚠ Ba cái đầu gộp vì **luật thắng giống hệt** (đủ điểm trước khi hết giờ/hết tên); khác nhau chỉ
ở scene. Tách ra ba mode là nuôi song song ba bản của cùng một luật, bản nào sửa trước thì hai
bản kia trôi đi — bài học `EconomyRaceMode` ba skin.

⚠⚠ `AppleShotMode` **KHÔNG** gộp vào, dù cũng là "bắn cung tính điểm": nó có điều kiện thua tức
thì *bắn trúng đồng đội* không liên quan gì tới điểm. **Cùng chủ đề không phải lý do để gộp —
ranh giới là luật thắng/thua.**

### `ScoringTarget` — thứ duy nhất quan tâm CHỖ trúng

Đọc `DamageInfo.point` (toạ độ va chạm THẬT mà đường sát thương chung vốn mang theo), so với tâm
bia, chia vòng 10→1. Bắt được mọi thứ đi qua `TakeDamage`: tên, lao, đạn, đá — không cần đường
va chạm thứ hai.

- **Bia không chết**: tự `Heal` đầy sau mỗi phát. Bia gục sau ba mũi thì trường bắn hết bia trước
  khi hết giờ và người chơi đứng nhìn. Bia một phát (đĩa bay) bật `oneShot`.
- ⚠ **Hồi máu TRƯỚC khi báo `Scored`**: bên nghe có thể huỷ tấm bia, và `Heal` trên object vừa
  `Destroy` là một dòng lỗi vô nghĩa mỗi lần ghi điểm.
- ⚠ `centerOffset` **không được để 0**: gốc transform nằm dưới chân bia, nên tâm bia sẽ rơi xuống
  mặt đất và mọi phát trúng thân đều tính là trượt.
- ⚠ Bia phải khác phe người chơi, nếu không `TeamMember.CanDamage` chặn và cả trường bắn thành
  một dãy cột không bắn thủng.

### `FlyingTarget` — bia bay, KHÁC với chim cảnh

Mượn hình + nhịp vỗ cánh của `StickmanBird` nhưng **có máu và ăn đòn**. Điều đó không mâu thuẫn
với Luật 6 ("chim không có máu"): luật đó nói về **chim cảnh** (`BirdFlock`), thứ tồn tại để bầu
trời có gì chuyển động. Cái này là **bia bắn** — có máu vì đó là lý do nó được thả ra. Phân biệt
bằng câu hỏi *ai thả nó ra, và để làm gì*.

⚠ Vẫn không gắn `TeamMember` — cung thủ NPC trong màn skeet không được bỏ bài tập để bắn đĩa hộ.

⚠ Hộp va chạm **rộng hơn hình ~1.35×**, và đó là quyết định về CẢM GIÁC: con chim ngang trời chỉ
cao chừng 20 pixel trên màn; hộp bám sát hình thì phát nào cũng "gần trúng" và người chơi đọc ra
là game ăn gian chứ không đọc ra là mình bắn trượt.

### Điều làm mỗi màn có QUYẾT ĐỊNH, không phải chỉ có mục tiêu

- **Range**: bia xa ăn gấp ba nhưng tên rơi nhiều hơn → *chắc hay to*. Một cự ly duy nhất thì
  không còn gì để chọn.
- **Mounted**: bia **cao thấp SO LE**. Cùng một tầm cao thì người chơi ngắm một lần rồi giữ
  nguyên suốt đường phi — cả màn thành một phát bắn lặp lại.
- **Skeet**: **hai** máy thả, nhịp lệch nhau. Một máy thì đợt nào cũng từ đúng một chỗ và người
  chơi học thuộc một phát bắn là xong màn. Thả **theo đợt** chứ không đều đặn: thả đều thì người
  chơi bắn theo nhịp máy, thả đợt thì mỗi đợt là một lựa chọn *bắn con nào trước*.
- **Apple**: sáu người ở cự ly xa dần, người chơi tự chọn thứ tự.

⚠ **Quả táo phải là VẬT RIÊNG có máu**, không phải một vòng điểm vẽ trên người: gộp vào người thì
mọi mũi tên đều qua cùng một `TakeDamage` và mode không phân biệt được "trúng táo" với "trúng
đầu" — mà đó chính xác là điều duy nhất mode ấy cần phân biệt.

⚠ `AppleShotMode` gỡ tay nghe `Damaged` khỏi **từng** đồng đội lúc `OnDisable`: đó là sự kiện của
object khác và nó sống lâu hơn mode; bỏ quên là mode đã tắt vẫn chấm thua.

⚠ Bản đầu của `AppleShotMode` có `_round`/`CurrentDistance`/`ReportMiss` để tự điều phối từng
lượt — **không ai gọi chúng cả**. Đã bỏ: một bộ máy đếm lượt không có người quay là ba nhánh chết
nằm chờ người sau tưởng nó đang chạy.


## Luật 15 — DÁNG ĐI: SẢI CHÂN PHẢI **SUY RA**, KHÔNG ĐƯỢC GÕ TAY (2026-09-09)

Người chơi báo *"thú hoang chạy qua nhanh, không tự nhiên"*. Đo ra **ba lỗi độc lập**, và
không lỗi nào làm gãy build hay báo một dòng cảnh báo nào.

### 15a. Pha chống đất bị NGƯỢC — móng trượt trọn một sải

Bản cũ (`StickmanHorse.PlaceTargets`):

```csharp
float x = _hipLocal[i].x + Mathf.Cos(phase) * stride;
float y = Mathf.Max(0f, Mathf.Sin(phase)) * lift;      // sin ≤ 0 → móng CHẠM ĐẤT
```

Móng chạm đất trong pha `π → 2π`, mà trong đúng khoảng đó `cos` đi từ **−1 lên +1**: móng đang
chống đất lại **tiến VỀ PHÍA TRƯỚC** so với hông, trong khi thân cũng tiến tới. Đo ra móng xê
dịch **trọn 0.55 đơn vị = 100% sải chân** trong lúc lẽ ra phải đứng yên. Không phải "trượt một
chút" — nó là **lướt băng**, và mọi loài bốn chân trong dự án đều lướt như thế từ ngày đầu.

⚠ Quỹ đạo đúng nằm ở `StickmanHorse.FootAt`: pha chống cho móng lùi **tuyến tính** từ `+biên độ`
về `−biên độ`, tốc độ móng so với thân bằng đúng tốc độ thân → vận tốc so với **mặt đất bằng 0**.
Đo lại: **0.0000, ở mọi loài, mọi tốc độ**.

⚠ Hình sin nghe thì "mượt hơn" nhưng vẫn sai kể cả khi đảo đúng chiều: nó cho móng lướt nhanh ở
giữa sải rồi chậm lại ở hai đầu, trong khi thân đi đều — hai đầu mỗi bước vẫn trượt.

### 15b. Sải chân gõ tay 0.55 cho MỌI loài → chân quay như chong chóng

Nhịp bước = tốc độ ÷ sải chân. Con nai 4.2 với sải 0.55 ra **7.6 bước/giây**; con thỏ ra 8.4.
Mắt không đọc được nữa, và cảnh đó ra "tua nhanh" chứ không ra "đang chạy".

Kèm theo, `StrideAmplitude` cũ kẹp biên độ vào tầm với của chân — **7 trên 10 loài bị kẹp**
(gà 57%, thỏ 62%, cáo 31%, lợn 32%, lợn rừng 16%, cừu 11%, dê 5%): pha bước vẫn chạy theo sải
0.55 trong khi móng chỉ đi được một phần. Phép kẹp hoàn toàn hợp lệ nên **không gì báo**.

**Luật:** sải chân **suy ra** từ hai thứ có thật, không gõ:

| | Đi bộ | Nước kiệu | Phi nước đại |
|---|---:|---:|---:|
| `duty` (móng chạm đất bao nhiêu phần chu kỳ) | 0.62 | ~0.45 | **0.28** |
| biên độ (phần `legLength × 0.73`) | 0.42 | ~0.7 | **1.00** |

```
sải = 2 × biênĐộ ÷ duty
```

⚠⚠ Vì **sải đi ra TỪ biên độ** chứ không ngược lại, phép kẹp không còn khả năng xảy ra:
**không thể trượt chân theo kiến tạo**. Con nai 4.2 giờ chạy **2.9 bước/giây** thay vì 7.6.

Ba dáng khác nhau ở đúng **bốn con số lệch pha** (`WalkOffsets` / `TrotOffsets` / `GallopOffsets`),
không phải ba bộ animation. Đi bộ 4 nhịp · kiệu 2 nhịp chéo · phi thì hai chân sau đạp cùng nhau.

### 15c. Bảng loài để tốc độ vượt bộ chân — và không có gì báo

Từ khi sải chân suy ra được, **mọi tốc độ đều chạy được mà không trượt chân**, nên hệ mất luôn
cách tự báo khi con số đã quá đà. Trần là trần của MẮT:

```
tốc độ tối đa còn "bán" được = 33.8 × legLength      (nhịp ≤ 6.5 bước/giây)
```

| | chân | run CŨ | nhịp | run MỚI |
|---|---:|---:|---:|---:|
| Thỏ | 0.071 | **4.6** | **12.4 b/s** | **2.4** |
| Cáo | 0.130 | 3.8 | 5.6 | 3.4 |
| Nai | 0.281 | 4.2 | 2.9 | 4.2 (giữ) |

⚠ Con thỏ chạy **nhanh hơn con nai** trong khi chân ngắn bằng 1/4 — đây là lỗi **DỮ LIỆU**, mà
triệu chứng của nó lại hiện ra ở chỗ khác hẳn ("animation xấu"). Bảng khám canh: **«Tốc độ loài
vượt bộ chân»** (`StickmanDoctor.Animals.cs`), ĐỎ khi vượt >15%.

⚠ Muốn con vật nhanh hơn thì cho nó **CHÂN DÀI HƠN** (`legRatio`), đừng tăng tốc độ suông.

## Luật 16 — NHỊP **NGHE → NHÌN → CHẠY**, và vì sao thiếu nó thì AI trông như bị giật

⚠⚠ `alertRadius` nằm trong `AnimalDefinition` từ đầu, builder ghi hẳn `flee × 1.6` vào từng
asset kèm chú thích *"con vật cảnh giác trước khi bỏ chạy"* — mà **không một dòng runtime nào
đọc nó**. Thiết kế đã có, dây chưa nối. Đây đúng bẫy «viết xong nhưng không ai gắn».

Nhịp đầy đủ (`WildAnimal.Mind.cs`, `AnimalMood`):

```
Graze ──nghe thấy──> Alert ──tới gần hơn──> Flee ──hết hoảng──> LookBack ──> Graze
          (đứng phắt,      (vọt hết sức,      (dừng, ngoái lại
       quay đầu nhìn)     rồi hụt hơi)         nhìn 1–1.8s)
```

- **`Alert`** — đứng im, quay MẶT về phía tiếng động, `alertHold` giây. Người chơi **đứng im
  ngay thì nó bình tĩnh lại**; nhích thêm một bước là mất con mồi. Đây là khoảnh khắc chơi hay
  nhất của mode đi săn, và bản cũ **không có nó**.
- **`Flee`** — vọt `runSpeed` trong `burstTime` giây rồi tụt xuống `runSpeed × trotFraction`.
  ⚠⚠ Bản cũ giữ nguyên đỉnh suốt `fleeTime`: con nai đi 9.2 đơn vị ≈ trọn bề ngang khung hình
  rồi **tắt phụt** về gặm cỏ. Giữ đỉnh, **cắt độ dài** — đừng hạ `runSpeed`, cú vọt đầu tiên
  mới là thứ đúng.
- **`LookBack`** — dừng ngoái nhìn. Đây là chỗ người chơi bắn được phát thứ hai.

⚠ **GIA TỐC**, `WildAnimal.Move`: tốc độ bò dần (`AccelUp` 15, `AccelDown` 7 đơn vị/giây²), không
nhảy thẳng. Bản cũ cộng thẳng `speed` vào vị trí nên frame này gặm cỏ 0.7, frame sau bay 4.2 —
mắt đọc cú nhảy đó ra "hình bị tua", không ra "giật mình". **Cùng con số `runSpeed`**, chỉ thêm
quãng tăng tốc, là cảnh chạy trốn đọc ra hoàn toàn khác.

⚠ `_rig.SetManualSpeed` phải nhận tốc độ **ĐANG ĐI THẬT**, không phải tốc độ MUỐN đi — không thì
lúc vừa giật mình chân đã quay ở nhịp phi trong khi thân chưa nhúc nhích.

⚠ Việc nền (sức bền · mất máu · tin báo đàn) chạy ở `Update` qua `TickBackgroundNeeds`, **ngoài**
`Think`: `Think` là `virtual` mà `LivestockAnimal` đã ghi đè và cố ý không gọi `base` — nhét vào
trong là lớp con nào quên gọi lên thì con vật ở đó không hồi sức, không nghe báo động, tất cả
đều im lặng.

## Luật 17 — ĐÀN: MỘT CON HOẢNG LÀ CẢ ĐÀN HOẢNG, NHƯNG **LỆCH NHỊP**

`WildAnimal.RaiseAlarm` báo cho **đồng loại** (`_definition` trùng nhau) trong `herdRadius`.

⚠⚠ Tin báo có **ĐỘ TRỄ THEO CỰ LY** (`AlarmSpread` = 11 đơn vị/giây). Cho cả đàn hoảng trong
cùng một frame thì sáu con nhảy dựng khớp nhau như một dàn đồng ca — **sai nặng hơn** cả việc
chúng không phản ứng gì, vì mắt bắt cái đồng bộ tuyệt đối ngay lập tức. Trễ theo cự ly thì tin
lan thành một **gợn sóng**.

⚠ Không lan đệ quy (`spreadToHerd: false` khi truyền tiếp): vùng đàn chồng lên nhau nên lan đệ
quy là báo động chạy vòng vô tận giữa hai con đứng cạnh nhau.

⚠ Con nghe tin thì **ngẩng đầu NGAY** (`Alert`), chạy thì đợi tới lượt — phản ứng đầu tiên của
thú nghe tiếng động là dừng nhai, không phải phóng đi.

⚠ Cùng lý do, `Awake` **lệch pha nhịp gặm cỏ** (`_moodUntil` + `_grazeStep` ngẫu nhiên): cả đàn
sinh ra trong một frame nên không lệch là sáu con cùng cúi đầu, cùng ngẩng lên.

## Luật 18 — GIÓ: VAN THỨ TƯ CỦA MODE ĐI SĂN

`HuntWind` (tuỳ chọn — không có trong scene thì mọi thứ chạy y như cũ).

⚠⚠ Ba van cũ (Luật 11) **đều hỏi cùng một câu**: *chậm lại hay không*. Người chơi học xong "cứ
bò từ từ" là hết quyết định. Gió hỏi câu về **KHÔNG GIAN**: *tiếp cận từ phía nào*. Hai câu độc
lập nên chúng **NHÂN LÊN**:

```
tầm phát hiện thật = fleeRadius × Noticeability(người) × ScentFactor(gió)
```

| Con vật đứng | Hệ số mùi |
|---|---:|
| CUỐI gió (hơi người bay tới nó) | 1 + sức × `scentSensitivity` (~**1.38**) |
| ngang gió / loài mũi kém / không có gió | **1.00** |
| ĐẦU gió | 1 − sức × `scentSensitivity` (~**0.62**) |

Bò từ từ ở đầu gió (0.35 × 0.62 = **0.22**) so với chạy ở cuối gió (1.25 × 1.38 = **1.73**) —
chênh nhau **gần 8 lần**.

⚠ Gió **tự đổi hướng** (~26s), và **lặng dần 4s trước khi quay** để báo trước. Không đổi thì
người chơi đọc hướng gió đúng một lần rồi quên — một luật chỉ phải nghĩ một lần thì không phải
là luật.

⚠ Vòng quét của `SenseThreat` phải nới theo `HuntWind.WidestScent()`, cùng lý do đã nới theo
`LoudestNoticeability`: quét đúng tầm cơ bản là con đứng cuối gió lọt lưới, tức gió có cũng như không.

⚠ HUD **phải in ĐẦU GIÓ / CUỐI GIÓ so với con mồi gần nhất**, không chỉ in hướng gió: bắt người
chơi tự tính thì họ tính sai một lần, mất con mồi, và kết luận là luật gió hỏng.

## Luật 19 — BỊ THƯƠNG: CON MỒI TRÚNG ĐÒN MÀ CHƯA GỤC

Máu tụt dưới `woundedThreshold` → cờ `IsWounded`: chạy còn 72% tốc độ, hụt hơi nhanh gấp 1.9 lần,
rỏ máu (`EffectEvent.Hurt` thưa), và **mất máu dần** `bleedPerSecond`.

⚠⚠ Sát thương mất máu phải mang theo `source` = **người đã bắn nó** (`_lastAttacker`). `HuntMode`
chỉ chấm điểm khi `killer` thuộc phe người chơi (Luật 11), nên để `null` là con mồi trúng tên rồi
chạy đi chết trong bụi **không được điểm** — trông y hệt "mode chấm sai", và người chơi sẽ đổ cho
phát bắn của mình.

⚠ Đi qua `TakeDamage` chung chứ không trừ thẳng `Health`: đi tắt là bỏ qua cả đường chết, effect
và sự kiện `AnyDied` — con vật "biến mất" thay vì gục.

⚠ CHỈ bật cho loài có `gameValue > 0`. Bật cho gia súc là đàn bò trúng một đòn lạc rồi tự chảy
máu tới chết, và mode chăn nuôi hụt đàn mà không ai hiểu vì sao.

⚠ **THƯỞNG hạ gọn, KHÔNG phạt bị thương** (`HuntMode._cleanKillBonus` = ×1.5 khi con mồi gục mà
chưa kịp bị thương). Trừ điểm con bị thương thì một phát bắn trúng lại tệ hơn một phát trượt.
Không có thưởng thì hai lối chơi ăn điểm y hệt nhau — mà lối "đứng xa nã cho nó chảy máu chết"
rẻ hơn hẳn, nên nó sẽ là lối duy nhất ai cũng chơi, và cả ba van rình mò thành trang trí.

## Luật 20 — THÚ SĂN MỒI: RÌNH RỒI MỚI LAO, VÀ SĂN CẢ THÚ HOANG

Bản cũ chỉ có một nhịp: thấy người trong `fleeRadius` là phóng hết tốc lực → mọi lần gặp sói
giống hệt nhau, và cách chơi tối ưu luôn là *lùi lại và bắn*.

```
xa hơn stalkRange → lang thang
stalkRange → pounceRange : STALK — bò tới (1.25 × walkSpeed, ép bụng)
gần hơn pounceRange      : CHASE — lao hết tốc lực
trong biteRange          : đứng lại mà đớp
```

⚠ `huntsWildlife` cho sói đuổi **nai**. Đây là thứ làm khu rừng sống khi người chơi không nhìn:
đàn nai giật mình vì con sói ở đầu kia thung lũng, người chơi bước tới đúng lúc bầy đang loạn.
Nó cũng thêm sức ép thật lên mode đi săn — **sói tranh mồi**, nấn ná rình lâu quá là mất con nai.

⚠ **Ưu tiên NGƯỜI trước, thú sau** — không phải "con nào gần hơn". Để con nào gần hơn thì con sói
quay lưng lại với người chơi đang chém nó để đi đuổi một con thỏ.

⚠ Con sói đớp **thú hoang** phải hỏi thẳng `StickmanController`, không hỏi `TeamMember`: thú hoang
hiền **không có** `TeamMember` (Luật 3), nên đi đường cũ là con sói đớp mà con nai không mất máu.

⚠ Chỉ săn `AnimalRole.Wild`, bỏ qua gia súc: cho sói vào chuồng cắn bò là mode chăn nuôi tự thua
mà người chơi không hiểu vì sao đàn cứ hụt dần.

## Luật 21 — CON VẬT NGHIÊNG THEO SƯỜN DỐC, VÀ CÓ TƯ THẾ

⚠ `StickToGround` (Luật 4) mới làm **một nửa** việc: con vật bám đúng độ cao sườn đồi nhưng vẫn
nằm ngang bằng, nên trên dốc 30° có hai móng thọc vào đất và hai móng treo lơ lửng. Map đi săn
lượn sóng (`CreateRollingGround`) nên đó là **hầu hết thời gian**. `WildAnimal.TiltToSlope` xoay
thân theo `TerrainGround.SlopeAt`.

⚠⚠ **MỘT góc duy nhất cho cả hai hướng quay** — đừng đổi dấu theo `_direction`. Hình lật bằng
`localScale.x` âm, mà ma trận `R(θ)·S(−1,1)` đã tự lo: mõm ở local `(+d,0)` ra world
`(−d·cosθ, −d·sinθ)`. Thêm một phép đổi dấu nữa là nghiêng **NGƯỢC**, và lỗi đó chỉ lộ khi con
vật quay đầu — tức đúng nửa số lần nhìn thấy nó.

⚠ Bò dần (`TiltRate` 150°/s), không đặt thẳng: mặt đất lấy mẫu theo bước lưới nên độ dốc có bậc.

**TƯ THẾ** (`StickmanHorse.SetPosturePitch`): gặm cỏ **−19°** (mõm chúi xuống bãi cỏ), cảnh giác
**+7°** (ngẩng đầu), rình **−8°** (ép bụng). Rẻ đến mức đáng ngờ: đầu + cổ nằm sẵn trong sprite
thân, pivot thân đúng ở giữa lưng, nên xoay thân là ra dáng — **không vẽ thêm frame nào**.

⚠ Đây là toàn bộ chỗ con vật ĐỨNG YÊN khác con vật BỊ TẠM DỪNG. Nhịp gặm cỏ có **ba** bước
(cúi gặm 2.2–4.6s → bước đi 1.4–3.0s → ngẩng nhìn 0.7–1.6s), không phải hai như bản cũ.

⚠ `PlayDeath` **không được chụp lại** `_bodyRestY` từ `_body.localPosition.y`: từ khi thân biết
nhún theo bước chân, chụp nhằm lúc thân ở đỉnh là cái xác nằm lơ lửng.


## Luật 22 — BA LỖI CỦA CHÍNH ĐỢT NÂNG CẤP, BẮT ĐƯỢC KHI RÀ SOÁT LẠI (2026-09-09)

Cả ba đều **biên dịch XANH** và **trông đúng khi đọc code**. Ghi lại vì cả ba thuộc cùng một họ:
*một cơ chế chạy đúng trong bộ nhớ nhưng không bao giờ tới được màn hình*.

### 22a. Báo động đàn KHÔNG BAO GIỜ NỔ

`ThinkSkittish` gọi `Panic(spreadToHerd: true)` **mỗi frame** khi người còn đứng trong vòng bỏ
chạy (cố ý — để `_alarmUntil` được gia hạn khi còn bị đuổi). Nhưng `RaiseAlarm` nằm ngoài khối
"vừa chuyển trạng thái", nên nó cũng chạy mỗi frame, mà `ReceiveAlarm` lại đặt lại
`_heardAlarmAt = Time.time + delay` mỗi lần → **đồng hồ đếm ngược bị đẩy lùi 60 lần một giây và
không bao giờ về tới 0**. Cả Luật 17 nằm im.

⚠ **Luật:** `RaiseAlarm` chỉ được gọi ở nhịp `_mood != Flee → Flee`. Và `ReceiveAlarm` chỉ nhận
tin **đến SỚM HƠN** tin đang chờ, không đặt đè vô điều kiện.

### 22b. Con vật quay đầu nhưng HÌNH KHÔNG LẬT

`Move` cố ý chỉ gọi `FaceDirection` khi đang đi đủ nhanh (không thì con vật đứng cạnh người chơi
nhấp nháy quay trái quay phải). Nhưng **hai nhịp quan trọng nhất — `Alert` và `LookBack` — đều
trả tốc độ 0**, và cú đớp của thú săn mồi cũng vậy. Kết quả: `_direction` đổi trong bộ nhớ,
con vật vẫn đứng nhìn hướng cũ. **Tín hiệu thị giác duy nhất báo "tôi thấy bạn rồi" là vô hình.**

⚠ **Luật:** nhịp nào trả tốc độ 0 mà cần quay mặt thì gọi `WildAnimal.FaceToward(x)` — nó đặt
`_direction` VÀ lật hình ngay. Đừng chỉ gán `_direction` rồi trông vào `Move`.

### 22c. Vết máu tự kích hoạt lại cơn hoảng, mỗi frame

`TickBleed` đi qua `TakeDamage` (đúng — để không bỏ qua đường chết / effect / `AnyDied`), nhưng
`TakeDamage` lại gọi `Panic`. Con bị thương vì thế **không bao giờ thôi chạy** (`_alarmUntil` gia
hạn vô tận) và quét cả đàn 60 lần/giây tới lúc chết.

⚠ **Luật:** cờ `_applyingBleed` bọc quanh lời gọi; `TakeDamage` thoát sớm khi thấy cờ. Bất cứ
sát thương nào do CHÍNH con vật tự gây cho mình đều phải đi qua cờ này.

⚠ Cùng chỗ: `_lastAttacker` phải leo lên `TeamMember` rồi mới nhớ. `DamageInfo.source` của một
phát cung là **cái mũi tên**, mà mũi tên bị huỷ vài giây sau khi cắm — trong khi con mồi mất máu
cả chục giây mới gục. Nhớ mũi tên là tới lúc đó `killer` thành fake-null, `HuntMode.IsPlayerKill`
trả false, và **phát bắn trúng không được điểm**.

## Luật 23 — ĐÀN CHIM VỤT LÊN LÀ BÁO ĐỘNG, VÀ NÓ PHẢI NGHE THEO ĐỘ ỒN

`BirdFlock.Startled` trước đây bay lên vì **bất kỳ ai còn sống** trong `startleRadius`, bất kể
đang chạy hay đang bò.

⚠⚠ Đó là một lỗ thủng ngay giữa Luật 11: người chơi ngồi thụp bò cả phút vẫn làm đàn chim vụt
lên. Nay đàn chim vụt lên **báo động cả khu** (`WildAnimal.AlarmArea`), nên một đàn sẻ vô hiệu
hoá cái van «ngồi thụp» — mà người chơi không có cách nào đoán ra vì sao con nai bỏ chạy.

⚠ **Luật:** tầm giật mình của chim nhân `WildAnimal.Noticeability(member)`, y như con thú, và
quét ở tầm rộng nhất (`× 1.25`) rồi lọc lại từng người.

⚠ Đàn chim chỉ hô khi bay **vì NGƯỜI** (`_flushedBy`), không hô khi bay vì hết giờ đậu — hô thì
cả rừng giật mình theo một cái đồng hồ vô hình.

⚠ `threatX` truyền cho `AlarmArea` là **vị trí NGƯỜI**, không phải vị trí đàn chim: đàn chim vụt
lên ngay trên đầu người săn, cho con nai chạy khỏi đàn chim là nó chạy thẳng vào người săn.

`AlarmArea` là cửa DÙNG CHUNG (`static`, báo cho **mọi loài**, bỏ qua gia súc) — nguồn tiếng động
mới (nổ, cây đổ) nối vào đây, đừng tự đi tìm `WildAnimal` mà gọi `Panic`.

## Luật 24 — RỪNG PHẢI TỰ HỒI ĐÀN, NẾU KHÔNG MÀN CHƠI TỰ CẠN

`WildlifeDirector` trước đây rải thú đúng **một lần** ở `Start`. Từ khi thú săn mồi biết săn cả
thú hoang (Luật 20), số con mồi **chỉ có giảm**: người chơi bắn một phần, sói ăn một phần. Một
buổi săn 240 giây hoàn toàn có thể hết sạch mồi trước khi hết giờ — và người chơi thua **không
phải vì chơi dở mà vì bản đồ trống**, mà không có gì trên màn hình nói ra điều đó.

⚠ Hồi đàn ở đây cố ý "câm": không sinh sản, không phả hệ, không đói. Chỉ **bù cho đủ số đã rải
lúc đầu** (`WildlifeEntry.count` là trần, không bao giờ vượt).

⚠ **MỘT con mỗi nhịp** (12 giây), không bù đầy một lượt: bù đầy thì người chơi quét sạch một vạt
rừng rồi quay lại sau mười giây thấy y nguyên — công sức của họ bị xoá, cảm giác đó tệ hơn hẳn
rừng thưa dần.

⚠⚠ **CHỈ SINH Ở CHỖ CÁCH NGƯỜI ≥ 22 ĐƠN VỊ** (`_restockClearance`). Nhỏ hơn nửa bề ngang khung
hình (~12.5 ở `cameraSize 7`) là con vật **hiện ra giữa màn hình** — thứ phá vỡ ảo giác mạnh hơn
hẳn so với bản đồ hơi thưa thú. Thử 6 chỗ rồi thôi; không thử mãi (người chơi đứng giữa vùng của
loài đó thì không có chỗ nào hợp lệ, mà vòng lặp vô hạn thì treo game).

⚠ Đếm từ `WildAnimal.All`, **không** từ `_spawned`: con chết bị `Destroy`, tham chiếu còn lại là
**fake-null** — đếm ở đó là đếm cả xác. (Đúng chỗ luật cấm `?.`/`??` với `UnityEngine.Object`.)

## Luật 25 — THÚ VẬT PHẢI CÓ TIẾNG

Trước 2026-09-09 **không một con vật nào trong dự án phát ra tiếng gì**, và một phần lời phàn nàn
*"không tự nhiên"* chính là sự im lặng đó: con nai ngẩng đầu cảnh giác là tín hiệu quan trọng
nhất của mode đi săn, mà nó diễn ra **câm**, ở rìa màn hình, trong một khung hình rưỡi.

Sáu khoá, sinh bù bằng `StickmanAudioSynth.Animals.cs`:

| Khoá | Khi nào | Ai nghe được gì |
|---|---|---|
| `Animal/Alert_Big` · `_Small` | vào nhịp `Alert` | *"tôi thấy bạn rồi"* — quay đầu lại kịp |
| `Animal/Growl` | thú săn mồi chuyển sang `Chase` | con sói **rình thì im, lao thì gầm** |
| `Animal/Bite` | mỗi cú đớp | |
| `Animal/Death_Big` · `_Small` | gục | |

⚠ **CHIA THEO CỠ, không dịch cao độ một file.** Con bé kêu bằng thanh quản (gần thuần sóng sin,
sắc, ngắn), con to khịt bằng lỗ mũi (gần thuần tiếng ồn, đục, có hơi). Kéo cao độ một file lên
cho con thỏ ra tiếng con nai bị tua nhanh. Ngưỡng: `withersHeight ≥ 0.30`.

⚠⚠ **Kêu ở nhịp VÀO trạng thái, không phải mỗi frame.** `EnterAlert` / `EnterChase` đã tự chặn
lặp; đặt tiếng trong `TickAlert` hay cạnh phép gán `_mood = Chase` là con vật kêu 60 lần một
giây — mà tiếng chồng lên nhau chỉ nghe như một tiếng ù, **không nghe ra là lỗi**.

⚠ `maxDistance` bắt buộc (đang 20): mọi voice của dự án là **2D**, nên con nai khịt mũi ở đầu kia
bản đồ dài 96 đơn vị sẽ kêu to đúng bằng con đứng cạnh người chơi.

⚠ `StickmanAudio.PlayKey` **im lặng trả về** khi thiếu khoá — gõ sai một chữ là câm mà không gì
báo. Bảng khám «Thú vật không có tiếng» canh chỗ này.

## Luật 26 — VAI THỨ TƯ: **KỆ NGƯỜI CHO TỚI KHI BỊ ĐỤNG VÀO** (2026-09-09)

User: *"thêm nhiều loại thú cưỡi như hổ,… và nhiều loại động vật hoang dã, có animation,
ai phù hợp nhé"*. Phần *"ai phù hợp"* không giải được bằng cách chỉnh số: **ba vai cũ ép mọi
loài vào hai cực, và với con nặng nửa tấn thì cả hai cực đều sai.**

| Để vai | Chuyện xảy ra | Vì sao sai |
|---|---|---|
| `Wild` | bắn một mũi tên → con bò rừng **bỏ chạy** | con vật to gấp ba người, có sừng, chạy trốn một cái gai |
| `Predator` | nó **đi săn người** từ giây đầu | một trận đánh biến thành trận đấu với con gấu |

Vế còn thiếu không phải "hung hơn" hay "hiền hơn" mà là **AI BẮT ĐẦU**. `Territorial` là vai
duy nhất mà người chơi **quyết định được**: đi vòng qua thì không có gì xảy ra.

### Ba chỗ phải nối, thiếu một chỗ là vai chết

1. **`TeamMember` GẮN SẴN NHƯNG TẮT** (`WildAnimal.Spawn` → `SetRageTeamVisible`).
   Phe tắt = `FindNearestEnemy` không nhắm vào → con vật đứng giữa hai đạo quân mà không ai bỏ
   tuyến. Phe bật = lính đánh trả được. ⚠ Bật bằng `enabled` chứ **không** `AddComponent`:
   `TeamMember` ghi sổ ở `OnEnable`/`OnDisable`, đó là đường đã có sẵn.
2. **`TakeDamage` phải rẽ nhánh TRƯỚC `Panic`** (`WildAnimal.Mind.cs`). Để nó chạy vào `Panic`
   rồi "chữa" ở `Think` là có một frame con gấu vẫn quay đuôi bỏ chạy — đọc ra "AI lưỡng lự".
3. **`AlarmArea` phải LỌC vai này ra** cùng với gia súc. Bỏ sót là một đàn quạ vụt lên cũng
   làm con gấu bỏ chạy: tin báo động đặt `Alert`, `TickHerdAlarm` nâng lên `Flee`, và **cả vai
   này hỏng trong im lặng** vì hai đường đều "đang chạy đúng phần việc của mình".

### Hai cái van bắt buộc

- ⚠⚠ **CHẠY ĐỦ XA LÀ THOÁT** (`ThinkTerritorial`, mốc `roamRadius`). Không có nó thì con thú
  đuổi hết bản đồ và người chơi chỉ còn đúng một cách chơi: quay lại giết nó — tức là ta vừa
  viết lại `Predator` bằng đường vòng.
- ⚠ **KHÔNG kéo cả đàn vào cơn giận.** Bắn một con bò rừng mà năm con còn lại cùng xông tới thì
  đó không phải một quyết định, đó là một bản án. Ai bị bắn, người ấy giận.

Và một loại trừ có chủ ý: `NearestPrey` **không** nhắm vai này (sói không săn tê giác). Thú lớn
ở đây là **địa hình sống**, không phải mồi của con khác.

Ba loài hiện mang vai này: bò rừng (20 máu, đớp 9) · gấu (22 máu, đớp 11) — và tê giác thì là
*vật cưỡi*, không phải thú hoang. `rageTime` suy từ `withersScale` (8–12 giây) nên thêm một
loài tính khí nữa là nó tự có cơn giận hợp cỡ.

⚠ Doctor «Thú tính khí không biết giận» báo **ĐỎ** khi `rageTime = 0` — vai đó khi ấy là một
vai CHẾT mà đọc code thì trông vẫn đủ.

## Luật 27 — DỰNG XONG ≠ CÓ TRONG GAME: **MƯỜI VẬT CƯỠI KHÔNG AI CƯỠI** (2026-09-09)

Dò GUID của từng `Mount_*.asset` trong toàn bộ `Assets` cho ra một con số không ai ngờ:
**sói chiến · hổ · hươu lớn · đà điểu không được MỘT asset nào tham chiếu tới.** Chúng có bảng
số đầy đủ, skin có tên, giáp theo cấp, ba ô "ngựa hoang" điền sẵn — và **chưa từng xuất hiện
trong một ván chơi nào** kể từ ngày dựng.

Nguyên nhân: vật cưỡi vào trận qua **đúng một cửa** — `UnitLoadout.mount` của một nền văn minh —
mà mỗi nền khai đúng MỘT giống ngựa, và không nền nào khai thú dữ. (Có cả một loadout tên
«Hổ Báo kỵ» của Ngụy, và nó cưỡi… chiến mã nặng.)

⚠⚠ **Mọi phép kiểm đều xanh** vì mỗi phép chỉ soi một đầu: asset tồn tại, builder chạy, Balance
Report liệt kê đủ. Không phép nào hỏi câu cuối cùng — **có đường nào dẫn từ ván chơi tới con
vật này không.** Nay có: Doctor «Vật cưỡi không ai cưỡi được» dò GUID trong `Assets/Settings`
và `Assets/_Scenes`.

### Cửa thứ ba: THẢ HOANG TRÊN BẢN ĐỒ

`WildlifeDirector` nay có bảng `WildMountEntry` — thả `RiderlessHorse` sẵn trên map. Đây không
phải hệ mới: `AIMountModule` đã viết sẵn cho đúng việc này (*"biến vật cưỡi thành một TÀI NGUYÊN
GIÀNH NHAU"*), nhưng nguồn duy nhất của nó là ngựa của kỵ sĩ **vừa ngã**, tức chỉ có sau khi kỵ
binh đã chết. Thả sẵn giữa map là cho module đó một lý do tồn tại ngay từ giây đầu, **không một
dòng AI nào mới**.

- Doanh trại (`Demo_20_WarCamp`): báo đen · tê giác · chó ngao ở **khúc giữa (±8)** — vùng không
  của phe nào, nên lấy nó là một quyết định (rời tuyến) chứ không phải quà phát tận nơi.
- Đi săn (`Demo_51_Hunt`): hươu lớn và hổ ở hai khúc xa nhất — phần thưởng cho người đi hết rừng.
- ⚠ **KHÔNG hồi lại** (`restockInterval: 0`). Bắt được con hổ rồi mà mười hai giây sau có con
  khác mọc ra ở chỗ cũ thì cả chuyến đi bắt nó mất nghĩa.

⚠ Kèm theo một lỗi phải chữa cùng lúc: `RiderlessHorse.UpdateRoam` chỉ cộng vào `x` và **giữ
nguyên `y`**. Vô hại suốt thời gian qua vì ngựa hoang luôn được thả dưới chân một người đứng
trên nền phẳng. Rải khắp map lượn sóng thì nó **treo lơ lửng trên thung lũng** — nay đã có
`RiderlessHorse.StickToGround`, cùng phép mà `WildAnimal` dùng (Luật 4).

## Luật 28 — TRẦN SẢI CHÂN CŨNG ÁP CHO **VẬT CƯỠI**, VÀ Ở ĐÓ NÓ KHÓ THẤY HƠN HẲN

Luật 15 đặt trần `v ≤ 33.8 × legLength` và Doctor đã đo nó cho `AnimalDefinition`. **Vật cưỡi
thì chưa** — và đó là chỗ nguy hơn, vì hai lý do:

1. tốc độ vật cưỡi là **hệ số NHÂN** (`3.9 × speedMultiplier`), nên con số trong asset trông
   nhỏ và vô hại (1.86) trong khi tốc độ thật là **7.25**;
2. nó còn **cộng theo cấp** (`speedPerTier`), nên một con hợp lệ ở cấp 0 vẫn có thể vượt trần ở
   cấp 5 — mà không ai ngồi thử con vật ở cấp 5.

Phép đo mới bắt được đúng một lỗi **ngay trong đợt thêm này**: chó ngao khai `legRatio 0.56` +
tốc 1.86 → **8.13 trên trần 6.74, vượt 21%**. Chữa bằng **chân dài hơn** (`legRatio` 0.66 —
cao nhất bảng, và đúng dáng chó săn thật) chứ không bằng hạ tốc: hạ tốc là mất luôn lý do người
ta chọn nó.

⚠ Với con **lưng thấp** thì luật này chặt hơn nhiều: lưng thấp ⇒ chân ngắn ⇒ trần thấp. Bất kỳ
vật cưỡi nào muốn vừa THẤP vừa NHANH đều phải trả bằng `legRatio` cao bất thường.

## Nơi sửa

| Việc | File |
|---|---|
| Thêm loài bốn chân | bảng `Animals` trong `StickmanRanchBuilder` + hàm vẽ thân trong `StickmanAnimalArt` |
| Thêm loài chim | bảng `Birds` + `GenerateBirdSet` |
| Thêm vật cưỡi thú dữ | bảng `Beasts` trong `StickmanBeastMountBuilder` + hàm vẽ ở `StickmanAnimalArt.Wild.cs` |
| Đổi skin có tên | `Beasts[].skins` / `LegacySkins` |
| Đổi luật chăn nuôi | `LivestockPen` · `LivestockAnimal` · `RanchMode` (module Gameplay) |
| Đổi hành vi con mồi (gặm cỏ · cảnh giác · chạy · đàn · bị thương) | `WildAnimal.Mind.cs` |
| Đổi hành vi thú săn mồi (rình · đuổi · đớp) | `WildAnimal.Predator.cs` |
| Đổi hành vi THÚ TÍNH KHÍ (nổi điên · nguôi · bật phe) | `WildAnimal.Predator.cs` (`ThinkTerritorial`) |
| Đổi con thú cưỡi HOANG thả trên map | bảng trong `StickmanWarCampBuilder.WildMounts.cs` · `StickmanHuntBuilder.BuildQuarry` |
| Đổi bộ chân của vật cưỡi thú dữ | `birdLegs` / `hoofLegs` trong `StickmanBeastMountBuilder.Beasts` |
| Đổi cách thú phát hiện người (ồn · gió) | `WildAnimal.Senses.cs` |
| Đổi DÁNG ĐI / bước chân / nhún thân | `StickmanHorse.Gait.cs` |
| Đổi gia tốc, nghiêng theo dốc | `WildAnimal.cs` (`Move` · `TiltToSlope`) |
| Đổi hướng/sức GIÓ của màn săn | `StickmanHuntBuilder.BuildWind` · `HuntWind` |
| Đổi nhịp/khoảng cách HỒI ĐÀN | `WildlifeDirector` (`_restockInterval` · `_restockClearance`) |
| Đổi tiếng kêu của thú | `StickmanAudioSynth.Animals.cs` + `WildAnimal.Say*` (khoá phải khớp) |
| Đổi luật đàn chim giật mình / hô báo động | `BirdFlock.Startled` · `WildAnimal.AlarmArea` |
| Đổi luật đi săn | `HuntMode` (module Gameplay) · `WildAnimal.Noticeability` |
| Đổi bộ số hành vi từng loài | `EnsureAnimal` trong `StickmanRanchBuilder` (suy từ `withersScale`) |
| Đổi điểm săn từng loài | cột `game` trong bảng `Animals` của `StickmanRanchBuilder` |
| Đổi cách ngắm kéo-thả | `StickmanFighterController.UpdateDrag` · `AimMode` mặc định ở `StickmanFighter.prefab` |
| Đổi luật cố thủ tháp | `TowerHoldMode` |
| Đổi vòng điểm / cỡ bia | `ScoringTarget` · `StickmanArcheryBuilder.SpawnTarget` |
| Đổi nhịp thả đĩa | `SkeetLauncher` |
| Thêm bản thi bắn cung | enum `ArcheryTrial` + 1 skin trong `ArcheryTrialMode` + 1 scene |

Tool: `Tools > Stickman > Nâng cao > Thú vật`, và hai mục trên `★ Bảng điều khiển`.
Scene: `Demo_50_Ranch` (chăn nuôi) · `Demo_51_Hunt` (đi săn) · `Demo_52_Volley` (đấu cung) ·
`Demo_53_TowerHold` (cố thủ tháp) · `Demo_54..57` (trường bắn · kỵ xạ · bắn táo · bắn đĩa).
