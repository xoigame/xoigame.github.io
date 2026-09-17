### ⚠⚠ ĐÈN 2D THẬT (URP) — BẬT BẰNG TOOL, BA BƯỚC, MỖI BƯỚC CÓ NÚT QUAY LUI (2026-09-08)

`Core/LightingProfile` (bảng: loại đèn + ngân sách) · `Core/StickmanLight` (cửa DUY NHẤT xin
ánh sáng) · `Core/StickmanLightBudget` (trần đèn cho điện thoại) · `Core/StickmanLightFlash`
(đèn chớp có pool) · `Core/StickmanGlobalLight` (ngày/đêm → đèn nền) · `Core/StickmanLitSprites`
(đổi sprite nền sang Lit lúc chạy) · `Editor/StickmanRenderPipelineInstaller` (bước 1) ·
`Editor/StickmanLightingBuilder` (bước 2–3) · `Shaders/StickmanSpriteFx.shader` +
`Combat/SpriteFxDriver` (chớp đòn · tan biến · viền).

**Trước ngày này dự án chạy Built-in RP và KHÔNG có hệ đèn 2D nào** — `NightGlow` chỉ dán một
sprite quầng lên ô cửa (chú thích của chính nó ghi *"game không có hệ đèn 2D"*), còn
`WorldLighting` chỉ là sổ LOGIC (đêm thu tầm nhìn AI), không đổi một pixel.

#### Ba bước và vì sao không được gộp

| Bước | Nút | Sau bước này |
|---|---|---|
| 1 | «★ 1 — BẬT hệ đèn 2D (cài URP)» | có package + define; **diện mạo không đổi** |
| 2 | «★ 2 — Dựng asset ánh sáng» | có đèn thật + pipeline; **diện mạo vẫn không đổi** |
| 3 | «3 — Đổi material NỀN sang Lit» | nền/công trình bắt đầu ăn đèn |

⚠⚠ **KHÔNG gõ tay `com.unity.render-pipelines.universal` vào `Packages/manifest.json`.** Bản URP
phải khớp editor (Unity 6000.5 ↔ URP 17.x); gõ sai một số version là Package Manager không
resolve được và **dự án kẹt trước khi kịp mở**. `Client.Add` KHÔNG kèm version thì Unity tự
chọn đúng bản của chính editor đang chạy — đó là toàn bộ lý do bước 1 là một tool.

⚠⚠ **asmdef được VÁ ở bước 1, không khai sẵn.** asmdef trỏ tới assembly không tồn tại thì cả
assembly đó tạch ⇒ khai sẵn `Unity.RenderPipelines.Universal.Runtime` là dự án chưa cài URP sẽ
ĐỎ TOÀN BỘ. Vá đúng 2 file: `Xoi.Stickman.Core` và `Xoi.Stickman.Editor`. Hệ quả có chủ ý: ai
tự cài URP bằng Package Manager mà không bấm nút thì **không hỏng gì** — define không bật, code
đèn nằm im trong `#if STICKMAN_URP`.

#### Bốn cái bẫy im lặng (Doctor đo cả bốn)

⚠⚠ **Sprite `Sprites/Default` là UNLIT — đèn đi qua nó như không có.** Cài xong URP, dựng xong
đèn, chạy game và thấy KHÔNG KHÁC GÌ là trạng thái *đúng* của bước 2, không phải hỏng. Bước 3
mới là bước làm ánh sáng nhìn thấy được.

⚠⚠ **`Light2D` chọn sorting layer bằng field private `m_ApplyToSortingLayers`** — runtime không
đặt được, mặc định chỉ có `Default`. Dự án có 3 layer (`Default` · `character` · `foreground`),
nên `AddComponent<Light2D>()` lúc chạy sẽ **không chiếu vào nhân vật**. Vì thế đèn thật phải ĐẺ
TỪ PREFAB do `StickmanLightingBuilder` ghi sẵn đủ layer bằng `SerializedObject`.

⚠⚠ **Material Lit mà scene không có đèn nào ⇒ vẽ ra MÀU ĐEN**, không phải "hơi tối".
`StickmanGlobalLight.Bootstrap` tự dựng đèn nền sau MỖI lần nạp scene để không scene nào rơi vào
cảnh đó. Ban ngày nó để trắng/intensity 1 ⇒ sprite Lit trông y hệt lúc còn Unlit.

⚠ **Pipeline phải gán ở CẢ `GraphicsSettings` VÀ từng mức Quality.** Mức Quality bỏ trống thì
máy chạy mức đó rơi về Built-in ⇒ mọi sprite Lit hiện HỒNG. Build điện thoại thường chạy mức
thấp nhất — quên nửa dưới là lỗi chỉ lộ ra trên thiết bị thật.

#### Ai được Lit, ai không

- **Nền · công trình (`Default`, `foreground`) → Lit.** Đây là chỗ mắt nhìn thấy ánh sáng.
- **Nhân vật (`character`) → Unlit + `Stickman/Sprite Fx`.** Chúng cần shader Fx để chớp trắng
  lúc dính đòn, và màu đêm trên người đã do `SkyBackdrop.UpdateWorldWash` phủ sẵn từ trước.
  Hai thứ loại trừ nhau — chọn Lit cho nhân vật là mất cú chớp.

⚠ **Cửa sổ hẹp đã biết:** trang bị/vũ khí sinh LÚC CHẠY rơi vào layer `Default` rồi mới được
`StickmanAppearance`/`StickmanSorting` kéo về `character`. Lượt quét rơi đúng vào khe đó sẽ đổi
một cái nón sang Lit và nó **ở lại Lit** (quét sau bỏ qua vì material đã khác `Sprites/Default`)
⇒ nón sáng theo đèn còn thân thì không. Hiếm, vì nhân vật thường sinh sau giây 2.5. Gặp thì đặt
lại material của renderer đó về `Sprites/Default` — đừng nới luật của `StickmanLitSprites`.

⚠ Việc đổi diễn ra **LÚC CHẠY** (`StickmanLitSprites`, quét ở giây 0.1 · 0.8 · 2.5 sau khi nạp
scene), không phải lúc build. Vì map của dự án này DỰNG LÚC CHẠY — sửa asset lúc build thì không
với tới chúng. Hệ quả: không scene/prefab nào bị sửa, và **quay lui = xoá đúng một file**
(`Assets/Resources/StickmanSpriteLit.mat`). Map dựng SAU giây 2.5 phải tự gọi
`StickmanLitSprites.Apply(root)`.

#### Ngân sách — điều kiện sống trên điện thoại

`Light2D` không miễn phí: mỗi đèn điểm đang bật là một lượt vẽ MỖI FRAME, kể cả ngoài màn hình.
Một map thành trì có ~120 ô cửa sổ + đuốc; bật hết là GPU điện thoại chết, mà ~110 cái người chơi
KHÔNG nhìn thấy. `StickmanLightBudget` giữ **12 đèn** gần camera nhất (mặc định), xét lại mỗi
**0.15 s**, lề ngoài khung **6 unit**. Ba điều cố ý: không xét mỗi frame · không cấp phát (mảng
dùng lại + `Array.Sort`) · dưới trần thì KHÔNG sắp xếp. Đèn chớp (`lifetime ≤ 0.5 s`) được MIỄN
ngân sách nhưng có trần riêng `StickmanLightFlash.MaxLive = 24`.

⚠ Chạm trần thì **bỏ bớt ÁNH SÁNG MỚI**, tuyệt đối không đụng đường tính sát thương/đạn — cùng
luật với `EffectManager` và `TransientVfxPool` (xem `Docs/KnowledgeBase/Performance.md`).

⚠ `Attach` lại một `StickmanLight` phải đặt cả nhánh `else` của `_deathTime`: object từng mang
đèn CHỚP rồi được gắn đèn SỐNG MÃI sẽ giữ `_deathTime` cũ (đã ở quá khứ) ⇒ ngọn đuốc **tắt ngay
frame đầu**, im lặng.

#### Shader hiệu ứng

`Stickman/Sprite Fx` cố ý viết kiểu **Unlit (CGPROGRAM, không include gì của URP)** để chạy được
ở CẢ Built-in lẫn URP — tức là chớp đòn dùng được *trước* khi ai bấm nút cài URP. Ba hiệu ứng
nằm sau `shader_feature_local` (`SFX_FLASH` · `SFX_DISSOLVE` · `SFX_OUTLINE`): material không bật
thì biến thể đó không được biên dịch và không tốn lệnh nào.

⚠ Đổi giá trị lúc chạy **phải** qua `MaterialPropertyBlock` (`SpriteFxDriver`), KHÔNG đặt thẳng
vào `renderer.material` — chạm vào nó là Unity nhân bản material cho từng renderer: sân 40 lính
≈ 480 material rời, vỡ sạch batching.

⚠ `SpriteFxDriver` và `StickmanLitSprites` **chỉ nhận renderer đang dùng `Sprites/Default`**. Art
đã có material riêng (alpha-tint của Fantasy, hạt, nước) giữ nguyên.

⚠ Keyword `SFX_FLASH` tắt trên material thì `SetFloat` vẫn chạy, vẫn không lỗi, và vẫn **không
đổi một pixel nào** — Doctor đo riêng trường hợp này.

#### ⚠⚠ ÁNH SÁNG PHẢI ĐỔI ĐƯỢC QUYẾT ĐỊNH, KHÔNG CHỈ ĐỔI MÀU (2026-09-08)

`Core/StickmanLightField` · `StickmanLightBudget.LightAmountAt` · `StickmanAgent.VisionRange` ·
`StickmanAgent.Notice` · `StickmanStealth.Expose` · `StickmanBodyAnimator.PeerStyle`.

`WorldLighting.VisionScale` là hệ số **TOÀN CỤC**: đêm xuống thì mọi người nhìn gần lại đúng
bằng nhau. Ngọn đuốc trong tay không giúp gì, đứng giữa vũng sáng không nguy hiểm hơn đứng
trong tối ⇒ đêm chỉ là một cái **núm vặn độ khó**, không đẻ ra quyết định nào về CHỖ ĐỨNG.
Đây đúng là lỗi mà [DayNight.md](DayNight.md) từng bắt ở tầng dưới ("một cái đồng hồ trang trí"),
chỉ là lên cao một bậc.

Ba điểm nối, **mỗi cái đúng MỘT chỗ trong code**:

| Vế | Chỗ nối | Nghĩa |
|---|---|---|
| Cầm đuốc thì **NHÌN được** | `StickmanAgent.VisionRange` | đứng trong sáng ⇒ lấy lại tầm nhìn ban ngày (không hơn) |
| Đứng sáng thì **BỊ NHÌN** | `StickmanAgent.Notice` | mọi đường quét địch đều qua đây; đo ở chỗ **ĐỊCH** đứng |
| Bóng tối là chỗ nấp **THẬT** | `StickmanStealth.Expose` | mức lộ chia cho độ tối |

⚠⚠ **`StickmanStealth` tên là "đi trong bóng tối" nhưng tới hôm nay ánh sáng không đóng vai trò
nào** — đứng giữa vũng đuốc và nấp sau nhà lúc nửa đêm bị soi ra nhanh y như nhau. Nay né vùng
sáng là một nước đi thật, và **đốt đuốc quanh trại là một cách phòng thủ thật**.

⚠ Tặng kèm miễn phí: đèn chớp nằm trong sổ đèn đang sáng ⇒ **chớp đầu nòng lúc nửa đêm tự khai
ra vị trí người bắn**.

⚠⚠ **Ban ngày mọi hàm trả về số trung tính**, và không phải để "an toàn" mà vì nó ĐÚNG: một
ngọn đuốc giữa trưa không soi thêm gì. Hệ quả: 62 scene không có chu kỳ ngày/đêm
(`WorldLighting.HasCycle == false`) **không đổi một hành vi nào**.

⚠ `LightAmountAt` chỉ đọc đèn **đã qua ngân sách**, không phải mọi đèn đã đăng ký. Hai lý do,
lý do đầu quan trọng hơn: AI chỉ được phản ứng với thứ **người chơi nhìn thấy** — đèn bị tắt vì
ngoài màn hình mà vẫn soi sáng địch trong tính toán là luật chơi phụ thuộc vào độ mạnh của máy,
không ai gỡ nổi lỗi kiểu đó. (Lý do thứ hai: 120 đèn × 40 lính × 2 lần/frame ≈ 9600 phép đo.)

⚠ **Đo ở chỗ ĐỊCH đứng** trong `Notice`, không phải chỗ mình đứng — đo nhầm là thành "đứng
trong tối thì mình chậm hiểu", ngược hẳn ý nghĩa.

**Animation đi kèm:** `Idle` style `peer` (che ngang mày, chồm tới, đảo mắt chậm) — vì luật chơi
đã đổi mà **nhìn vào thì không thấy gì khác**, người lính vẫn thở đều như giữa trưa. Là STYLE
chứ không phải LOẠI (đúng luật ở [Animation.md](Animation.md)), `weight = 0`, bị TRẠNG THÁI lái
đúng khuôn `WoundedStyle`. Ưu tiên **thấp nhất** trong chuỗi idle: đặt cao hơn là lính đứng che
mắt trong lúc địch xông tới.

⚠⚠ Thêm style rồi **quên bấm «Dựng bộ ĐỘNG TÁC»** thì animator xin một tên không tồn tại, `Pick`
lặng lẽ rơi về bốc ngẫu nhiên — nhân vật vẫn có dáng nên không ai ngờ. Doctor «Animator XIN một
style mà bộ động tác BAKE không có» canh cả bốn style bị trạng thái lái (`sentry` · `duel` ·
`peer` · `tired`), trừ `duel` ở bộ zombie (cố ý không có).

#### Effect mới đi kèm

`EffectEvent.Build` · `BuildComplete` · `Burn` (2026-09-08). Cả ba dùng LẠI prefab bụi/lấp lánh,
chỉ đổi cỡ và màu nhuộm — xem `EffectLibrary.Entry.tint`. Chúng lấp ba chỗ trước đây im lặng
hoặc nổ nhầm:

- `ResourceNode.FinishTrip` — nhát búa/nhát rìu **chỉ có TIẾNG**, không một hạt bụi nào.
- `BaseBuilding.Die` — nhà đá bị phá nổ ra `Explosion` (y hệt một quả bom); nay là `Collapse`,
  đúng thứ `DestructibleTarget` đã dùng từ lâu. Hai đường phá công trình từng ra hai hiệu ứng
  khác hẳn nhau tuỳ script nào dựng nó.
- `BaseBuilding.OnHitForFire` — nhà BẮT LỬA cũng nổ ra `Explosion`; nay là `Burn` (khói xám) và
  kèm một `StickmanLight` kiểu `Campfire` tắt cùng lúc lửa tắt.

⚠ Thêm giá trị vào `EffectEvent` mà quên bấm «Dựng bộ EFFECT (1 nút)» thì `Resolve` trả null và
chỗ gọi **im lặng bỏ qua** — Doctor «Sự kiện effect MỚI chưa có dòng trong bảng» canh đúng bẫy này.

#### ⚠⚠ ĐUỐC · SÉT · ĐỒ HIẾM — BA CHỖ ĐẦU TIÊN THẬT SỰ DÙNG HỆ ĐÈN (2026-09-09)

`Combat/NightTorches` · `WorldLighting.Flash`/`FlashAmount` · `StickmanLightField.LitAmountAt` ·
`Combat/WeatherAmbience.UpdateLightning` · `Combat/LootTierMark.ApplyGlow` ·
`Combat/AreaHazard.Begin` · `LightKind.Flare`.

**Đo trước khi làm:** trong cả dự án chỉ có **6 chỗ** gọi tới hệ đèn, và 5/10 `LightKind`
(`Torch` · `Lamp` · `Magic` · `Glow` · `Ember`) **không có một dòng code nào gọi tới**. Tức là
luật "ánh sáng đổi được quyết định" viết xong tháng trước vẫn **chưa có ai cầm đuốc** — đúng
bẫy *"làm xong nhưng không có đường nào gọi"*.

| Nguồn sáng mới | Ai bật | Đổi được quyết định gì |
|---|---|---|
| **Đuốc quân tuần** (`Torch`) | `NightTorches`, 30% quân, trần 16, chỉ scene có chu kỳ | mỗi đốm lửa là một toán quân đọc được từ xa; kẻ cầm nhìn xa như ban ngày nhưng **bị nhận ra nhanh hơn**; **giết nó là tắt đèn** |
| **Sét** (`WorldLighting.Flash`) | `WeatherAmbience` mỗi 4–11 s | một nhịp **không còn chỗ nấp**: cả sân sáng, kẻ bò trong tối bị lộ |
| **Vũng lửa** (`Campfire`) | `AreaHazard.Begin` | ném bom xăng chặn đường cũng là **thắp đèn cho địch** |
| **Đồ hiếm cấp ≥ 3** (`Glow`) | `LootTierMark` | ban đêm đọc được "có đáng chạy tới chỗ kia không" |
| **Chiêu thức / quả choáng / xây xong / hồi máu** (`Flare`) | `EffectManager` | — (thuần phần nhìn, khai đúng một chỗ) |

⚠⚠ **`LightKind.Flare` TỒN TẠI VÌ `Magic` KHÔNG CHỚP ĐƯỢC.** `StickmanLightFlash` là pool 24
suất, đèn trả về pool bằng chính `lifetime` của nó. `Magic`/`Glow`/`Ember`/`Torch` có
`lifetime = 0` (sáng mãi) ⇒ mượn từ pool là **không bao giờ trả**: vài chục giây sau pool đầy và
**mọi vụ nổ, mọi chớp đầu nòng trong cả ván đều tối thui**, im lặng. Nay `Play` từ chối loại
sống mãi (có log) và Doctor «Đèn chớp: loại xin có HẠN DÙNG không» quét chữ trong nguồn.

⚠ **Sét KHÔNG phải một `Light2D`.** Nó soi cả sân cùng lúc nên không nằm được trong sổ đèn
(sổ xếp theo khoảng cách tới camera). `WorldLighting.FlashAmount` cộng thẳng vào
`StickmanLightField.LitAmountAt`, nhờ vậy cả ba vế (nhìn · bị nhìn · nấp) tự ăn theo.

⚠ **Ánh sáng đi trước tiếng.** Tiếng sấm hoãn 0,2–1,6 s sau cú loé và nhỏ dần theo độ trễ — tai
tự đo được tia sét ở gần hay xa. `UpdateThunder` phải chạy TRƯỚC cửa `cam == null`, không thì
đổi map giữa cơn giông là một tia sét câm.

⚠ **Đuốc có TRỄ HAI CHIỀU** (thắp 0.42, dập 0.28). Một ngưỡng duy nhất thì lúc chạng vạng cả sân
nhấp nháy đuốc. Và **người chơi KHÔNG cầm đuốc**: không có nút dập thì nó không phải một lựa
chọn, mà bóng tối phải là chỗ nấp CỦA NGƯỜI CHƠI.

⚠ Đồ hiếm chỉ sáng từ **cấp 3**. Cho mọi món sáng thì 12 suất ngân sách bị đồ rơi chiếm sạch và
**đuốc tắt hết** — mất luôn thứ đang là một nước đi thật.

#### Phải chạy lại / kiểm

- Bảng điều khiển › Động tác · Effect · Tiếng › ba nút ánh sáng (theo thứ tự 1 → 2 → 3).
- «Dựng bộ EFFECT (1 nút)» sau khi thêm `EffectEvent` mới.
- «★ KHÁM SỨC KHOẺ DỰ ÁN» — ba phép đo mới ở `StickmanDoctor.Lighting.cs`.
- Quay lui: Tools › Stickman › Nâng cao › Ánh sáng › «TẮT hệ đèn 2D» và «Trả material về Unlit».
