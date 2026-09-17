# PHỐ MỞ — GTA 2D: cách chơi, cách sửa, cách kiểm (2026-09-09)

Luật ở [`Docs/AgentRules/OpenWorld.md`](../AgentRules/OpenWorld.md). File này là **quy trình**:
bấm nút nào, sửa số ở đâu, và đo bằng gì.

---

## 1. Dựng và chơi thử

```powershell
# 1. Trong Unity: Tools > Stickman > ★ Bảng điều khiển  (Ctrl+Alt+S)
# 2. Bấm  ★ PHỐ MỞ — GTA 2D
#    (hoặc Tools > Stickman > Nâng cao > Maps > 8)
# 3. Mở MỘT trong hai:
#      Assets/_Scenes/Demo_70_CityOpenWorld.unity   (thành phố HIỆN ĐẠI)
#      Assets/_Scenes/Demo_71_TownOpenWorld.unity   (thị trấn TRUNG CỔ)
#    →  Play
```

Nút này làm bốn việc, theo thứ tự:

1. Dựng lại **kho map** (`MapLibrary`) — cần `lootWeapons` (hàng tiệm súng) và `structureParts` (nhà cửa).
2. Ghi **công thức** `Recipe_City_Modern` + **map mẫu** `Mod_City`.
3. Dựng **scene** `Demo_70_CityOpenWorld` — camera, trời, `MapArena`, cảm ứng, **kho xe mẫu**.
4. Dựng lại **vỏ game** để menu chính có nút vào sân mới.

## 2. Bảng phím

| Phím | Việc |
|---|---|
| **A / D** hoặc trái/phải | đi · lái xe |
| **F** | ô hỏi ngữ cảnh: lên/xuống xe · nhận việc ở mốc ❢ · mua ở tiệm |
| **E** | nhặt vũ khí rơi dưới đất |
| **Chuột trái** | đánh / bắn |
| **Y** | **CƯỚP TIỆM** — phải đang đứng ở tiệm VÀ cầm vũ khí |
| **M** | mở/đóng BẢN ĐỒ toàn cảnh (cả vòng, có tên quận) |
| **Chân ga** | lái xe vào người = xe TÔNG: chậm thì xô, nhanh thì văng (ragdoll) — người lái chịu tội |
| **F5** | chơi lại (thành phố **giữ nguyên**, chỉ dựng lại ván) |

## 2b. Hai bản khác nhau ở đâu

**CÙNG một bộ máy**, khác lớp da (`CityEra` — xem luật mục 1b):

| | Hiện đại (Demo_70) | Trung cổ (Demo_71) |
|---|---|---|
| Đi lại | ô tô, xe tải | **xe ngựa** |
| Truy nã | cảnh sát · đặc nhiệm, **còi hụ** | lính tuần · kỵ binh, **chuông làng + tù và** |
| Mua vũ khí | 🔫 TIỆM SÚNG | ⚒ LÒ RÈN |
| Xoá truy nã | 🎨 GARA SƠN XE | ✝ **NHÀ THỜ** (mua ơn xá) |
| Lưu game | 🏠 NHÀ AN TOÀN | 🛏 NHÀ TRỌ |

Mọi luật chơi (nhiệt, streaming, việc thuê, giá, phím) **giống hệt nhau** — sửa một chỗ là cả
hai bản đổi theo. Đó là chủ ý; xem luật mục 1b nếu định tách.

## 3. Vòng chơi mong muốn (kiểm bằng mắt)

> Ra sân **tay trắng** ở trung tâm, $250 → đi bộ tới mốc ❢ nhận việc giao hàng → thấy đường xa,
> **cướp một chiếc xe** đang chạy qua → lên **1 sao** → chạy xe tới đích, +$150 → đi sang khu
> công nghiệp mua khẩu súng ở tiệm 🔫 → bắn nhau với ai đó, lên **3 sao** → chạy vào một căn nhà
> hoặc lên mái cho cảnh sát **mất dấu** (hoặc lái xe vào 🎨 gara trả $120 để xoá sạch) → về
> 🏠 nhà an toàn ở khu ổ chuột **ngủ = LƯU GAME**, sang ngày 2.

Vòng thứ hai — **đường tội phạm** (thêm 2026-09-09):

> Đợi **TỐI** (cảnh sát chỉ còn 55% tầm nhìn) → **trấn lột** vài người đi đường bằng [F], mỗi
> người một lần → lên 2 sao → hạ một cảnh sát, nhặt **$45–90 rơi ra** → lên 3 sao, **XE CẢNH SÁT**
> xuất hiện và đuổi kịp cả khi mình đang lái → cướp một chiếc xe khác chạy → lái vào 🎨 gara
> $120 xoá sạch sao → mua khẩu súng ở 🔫.

Vòng thứ ba — **một vụ lớn**:

> Mua/nhặt một khẩu súng → vào 🔫 tiệm súng ở khu công nghiệp, bấm **[Y]** → +$380×, **3 sao
> ngay** → nghe **còi** hú (còi = chúng nó còn thấy mình; im = đã cắt được tầm nhìn) → xe cảnh
> sát đèn xanh đỏ tới → chui cống hoặc lên mái → còi tắt, sao nguội.

Vòng thứ tư — **thành phố tự có chuyện** (đợt bốn):

> Đang đi ở trung tâm, có **lính tuần** đi ngang → nhìn quanh trước khi trấn lột (lính thấy là
> +80% nhiệt, cảnh sát tới trong 1.5 s) → nghe *"Có người kêu cứu gần đây!"* → chạy tới, hạ tên
> cướp (không lên sao — hắn là băng đảng) → nạn nhân trả $25–60 → *"XE CHỞ TIỀN đang qua phố"*
> → cướp một chiếc xe, **tông** vào nó cho nổ → 5–7 xấp tiền văng ra, nhặt trước khi còi hụ →
> tối xuống: dân thưa, **kẻ rình** hiện ở xóm bần → leo mái nhặt **kho giấu** → ngủ; sáng mai quận
> trung tâm có ☠ (tai tiếng) — lính tuần dày hơn, cảnh sát tới nhanh hơn ở ĐÓ.

Bấm **M** bất cứ lúc nào để xem cả thành phố: bốn quận (có ☠ tai tiếng), mọi tiệm, mốc việc, chỗ mình đứng.

Nếu vòng này đứt ở bước nào thì đó là chỗ phải sửa. Ba chỗ hay đứt nhất:

| Triệu chứng | Nguyên nhân thường gặp | Sửa |
|---|---|---|
| Phố **không có xe nào** | scene thiếu `VehicleCatalog` | dựng lại bằng ★ PHỐ MỞ (Doctor báo ĐỎ) |
| Tiệm súng nói **"hết hàng"** | `MapLibrary.lootWeapons` rỗng | `Maps > 1` |
| Thành phố **chỉ có vỉa hè**, không nhà | `MapLibrary.structureParts` trống | «Bộ chi tiết CÔNG TRÌNH lắp ghép» rồi `Maps > 1` |
| Lên sao rồi **không cách nào trốn** | map thiếu ba tầng | `MapBlueprint.Validate` bắt được; dựng lại map |
| Dân **đánh trả cảnh sát như lính** | `MapLibrary.civilianProfile` trống | `Maps > 1` |
| **Không nghe còi cảnh sát** | bảng tiếng thiếu khoá `City/*` — `PlayKey` im lặng trả về | bấm lại ★ PHỐ MỞ (Doctor báo VÀNG) |
| Bấm [Y] không cướp được | đang tay không, hoặc tiệm còn đóng cửa | cầm vũ khí; ô hỏi ghi rõ còn bao nhiêu giây |

## 4. Sửa số — mỗi thứ đúng một chỗ

| Muốn đổi | Sửa ở |
|---|---|
| Quận nào đông dân / lắm xe / nhà cao / cảnh sát nhanh / việc trả cao | `CityDistricts.Table` (`Assets/Scripts/Map/City/CityDistricts.cs`) |
| Tội nào đáng mấy nhiệt · ngưỡng lên sao | `MapOpenWorld.Wanted.cs` → `HeatOf` · `StarHeat` |
| Sao nguội nhanh/chậm · trần cảnh sát · tầm cảnh sát nhìn | `CoolPerSecond` · `MaxCops` · `CopSightRange` |
| Giá cửa hàng | `MapOpenWorld.Shops.cs` → `PriceOf` · `PriceOfWeapon` |
| Tiền trấn lột / tiền rơi từ xác | `MapOpenWorld.Crime.cs` → `MugTake` · `DropLoot` |
| **Tên quận · tên tiệm · tên lính · loại xe** theo thời kỳ | `CityDistricts.cs` → `Name` · `ShopName` · `ShopIcon` · `GuardName` · `RideName` |
| Thể loại nào dùng bộ trung cổ | `CityDistricts.EraOf` |
| Từ mấy sao thì có XE cảnh sát | `MapOpenWorld.Wanted.cs` → `TickDispatch` (`stars >= 3`) |
| Đêm giấu được bao nhiêu | `MapOpenWorld.Wanted.cs` → `CopSightNow` (0.55 = còn 55% tầm nhìn) |
| Bao nhiêu lính tuần · băng đảng đêm · chuyện bao lâu một lần | `MapOpenWorld.Streets.cs` → `WantedPatrols` · `WantedGang` · `EventInterval` |
| Xe tông đau bao nhiêu, văng bao xa | `CityRammer.cs` → `MinSpeed` · `FullSpeed` · `MaxDamage` |
| Tai tiếng lên/xuống, trần | `MapOpenWorld.Notoriety.cs` → `Notorize` · `DecayNotoriety` · `MaxNotoriety` |
| Kho giấu bao nhiêu, ở đâu | `MapOpenWorld.Streets.cs` → `SpawnStashes` · `MaxStashes` |
| Đồ đạc trên phố vẽ đè lên nhà / chui vào tường | `MapOpenWorld.Block` (layer) + bậc `NearProp` trong `City.cs` — xem luật mục 8b |
| Két tiệm cướp được bao nhiêu · đóng cửa bao lâu | `MapOpenWorld.Shops.cs` → `RobShop` · `ShopClosedSeconds` |
| Còi hú dày hay thưa | `MapOpenWorld.Wanted.cs` → `TickSiren` |
| Tiếng nghe thế nào | `Assets/Editor/Audio/StickmanAudioSynth.City.cs`, rồi bấm lại ★ PHỐ MỞ |
| Tiền và hạn giờ của từng loại việc | `MapOpenWorld.Jobs.cs` → `StartJob` |
| Tiền mở màn · mật độ dân+xe của MỘT map | `MissionSettings.cityStartMoney` · `cityDensity` (Xưởng map, hoặc `Blueprints`) |
| Cỡ thành phố, số tầng, nối vòng | `MapBlueprint.For(OpenWorldCity)` + `Blueprints` › `Mod_City` |

⚠ Sửa `MapBlueprint` xong **phải bấm `Maps > 1`** — map mẫu là asset đã bake, sửa bảng luật không
tự đụng tới nó. (Đây đúng là lỗi người dùng từng báo với mode Kinh tế: *"không thấy 3 tầng"*.)

## 5. Thêm một loại việc thuê mới

Hai nhánh, không hơn:

```csharp
// MapOpenWorld.Jobs.cs
case CityJobKind.MyNewJob:            // 1. trong StartJob
    job.title = "TÊN VIỆC";
    job.hint  = "một câu bảo người chơi phải làm gì";
    job.pay   = Mathf.RoundToInt(180 * profile.payScale);
    job.deadline = Time.time + 90f;   // ⚠ BẮT BUỘC — việc phải có đường thất bại
    job.target = DestinationFar(board.x, 25f);
    break;

case CityJobKind.MyNewJob:            // 2. trong CheckDone
    return /* điều kiện xong */;
```

Rồi nối vào `PickJobKind` để một quận nào đó ra được nó. HUD, tiền, mốc trên la bàn **tự chạy**.

## 6. Kiểm

```powershell
powershell -File Docs/Tools/Verify.ps1 -Changed Assets/Scripts/Map/Maps/MapOpenWorld.cs
```

Trong Unity:
- **★ KHÁM SỨC KHOẺ DỰ ÁN** → mục «Phố mở». Nó canh **bảy** thứ mà kiểu chơi này không tự báo:
  sân có kho xe · hàng trong tiệm · bộ chi tiết nhà · tính cách dân · **năm tiếng `City/*`** ·
  **mọi giá trị enum đã được GẮN chưa** · map mẫu còn hợp luật không.
- **Soát chuỗi điểm nối của kiểu chơi** (`Nâng cao > Rig & Kiểm tra`) — canh 8 điểm nối của
  `MissionType.OpenWorldCity`.

⚠⚠ Kiểu chơi này **hỏng mà vẫn chạy** — nó không có điều kiện kết thúc nào để mà sai. Nên
"bấm Play thấy chạy" **không phải** một phép kiểm. Phải đi hết vòng chơi ở mục 3.

## 7. Vì sao một số quyết định trông lạ

**Vì sao thành phố nối vòng thay vì có hai đầu?** Bộ khung này là 2D nhìn ngang, thế giới là một
trục x. Một trục có hai đầu thì "thế giới mở" chỉ là một hành lang có tường ở hai bên. Nối vòng
biến nó thành một **vòng tròn đi mãi không hết** — thứ gần nhất với "bản đồ mở" mà một trục làm được.

**Vì sao dân/xe chỉ tồn tại quanh người chơi?** Map rộng 156–192 world unit, người chơi nhìn thấy
~17 unit một lúc. Rải kín là 120 `StickmanAgent` chạy FSM cho thứ không ai thấy — trên điện thoại
thì ván không chạy nổi.

**Vì sao tài xế chỉ sinh ra lúc bị cướp xe?** Góc nhìn ngang: người ngồi trong xe bị thân xe che
kín. Một anh tài xế ngồi suốt ván là một FSM chạy mà không ai từng nhìn thấy.

**Vì sao chỉ lưu ở nhà an toàn?** Lưu liên tục thì cái chết không còn giá nào. Điểm lưu là một
CHỖ trong thế giới — về được tới nhà thì mới giữ được, đúng khuôn GTA.

## 8. Còn thiếu

Xem mục 11 của [`OpenWorld.md`](../AgentRules/OpenWorld.md): **chưa chơi thử thật**, chưa có art
riêng cho phố, chưa có tiếng (còi cảnh sát, còi xe), chưa có radio, chưa có xe máy.
