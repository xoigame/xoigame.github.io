# Code Map — bản đồ toàn bộ script

> Tra cứu nhanh: file nào làm gì, gọi API nào, ai phụ thuộc ai.
> ~14.400 dòng C# / 64 file. Cập nhật: 2026-08.
>
> Doc theo TÍNH NĂNG thì xem `WeaponSystem.md`, `AI-NPC.md`, `Ragdoll2D.md`.
> File này doc theo **CODE**: mở file nào ra sửa thì đọc dòng của nó ở đây trước.

## Sơ đồ phụ thuộc (ai gọi ai)

```
                       ┌─────────────────────┐
   input người chơi ──▶│ StickmanFighter     │◀── StickmanAgent (não NPC)
   hoặc AI            │ Controller (FACADE) │
                       └──────────┬──────────┘
                                  │ chỉ gọi 3 API: AimAt / AttackNow / EquipWeapon
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
     StickmanWeaponHolder  StickmanProcedural   StickmanLocomotion
     (cầm/đổi/rớt)         Animator (pose IK)   (Rigidbody2D velocity)
              │                                        │
              ▼                                        ▼
        WeaponBase                              StickmanLegWalker
   ┌────────┼────────┐                          (đung đưa IK chân)
   ▼        ▼        ▼
Ranged   Melee   Throwable
   │                 │
   └────────┬────────┘
            ▼
   ProjectileController ◀── ProjectilePoolManager
            │
            ▼
   StickmanController.TakeDamage(DamageInfo) ──▶ ragdoll + Died event
                                                      │
                            ┌─────────────────────────┼──────────────┐
                            ▼                         ▼              ▼
                    StickmanWeaponHolder      StickmanEquipment   LootDropper
                    (rớt vũ khí)              (rớt nón/giáp)      (rơi coin)
```

**Quy tắc vàng:** AI và người chơi dùng CHUNG một nhân vật. AI không được gọi thẳng
`WeaponBase`/`ProceduralAnimator`/pool — chỉ qua `StickmanFighterController`.

---

## 1. Lõi nhân vật

| File | Dòng | Việc |
|---|---:|---|
| `StickmanController.cs` | ~200 | **Gốc của mọi nhân vật.** Máu, `TakeDamage(DamageInfo)`, flow chết → ragdoll (reparent `*Ragdoll` sang group `Ragdoll`, tắt group `Sprite`), event `Died`/`Damaged`. Class con override **`OnDeath(DamageInfo)`**, KHÔNG override `TakeDamage`. Còn giữ **vòng đời XÁC**: đóng băng (Static) → hết giờ/quá trần → mờ dần → Destroy. |
| `ArcherPlayerController.cs` | | Bản cũ chỉ có cung — giữ cho `Character.prefab`. Nhân vật mới dùng `StickmanFighterController`. |
| `Combat/StickmanFighterController.cs` | | **FACADE.** Đọc input (chuột/phím/cảm ứng) HOẶC nhận lệnh AI. API công khai: `AimAt(worldPoint)`, `SetAimDirection`, `AttackNow(charge)`, `EquipWeapon(type\|index)`, `EquipNextWeapon`. Cờ `UseInput` tắt input để HUD/AI lái. **4 kiểu bắn** (`AimMode`, phím M): DragPull / PointAim / ClickShot / AutoFire. |
| `Combat/StickmanProceduralAnimator.cs` | 273 | Lerp giữa các `WeaponHoldPose` ở `LateUpdate` — **không dùng AnimationClip**. `SetBasePose` / `SetChargePose` / `PlayAttack(windup, strike, recover)` / `SetAim(angle, flip)`. |
| `Combat/StickmanHitboxes.cs` | | Vùng trúng đòn trên người (đầu/thân) → quy về `TakeDamage`. |
| `Combat/StickmanSorting.cs` | | Bảng sorting order chuẩn theo bộ phận (tay xa 3 · cẳng xa 4 · thân 5 · đầu 6 · tay gần 7 · cẳng gần 8 · vũ khí gần 9). |
| `Rig/StickmanPose.cs` | | `StickmanRigPaths` — hằng số đường dẫn transform trong rig + `GripPointOnHand()` (đo chỗ nắm tay = 73% xương bàn tay). **Mọi code cần tìm bone phải dùng hằng số ở đây.** |
| `Combat/StickmanBodyAnimator.cs` | ~570 | **Động tác TOÀN THÂN** (nhảy/rơi/tiếp đất/ngồi/bò/leo/đu dây/trúng đòn/đánh trúng/tấn thủ/lăn). Tự chọn động tác theo trạng thái + sự kiện. Sở hữu `Bone.localPosition.y`; MƯỢN chân của LegWalker và tay của ProceduralAnimator qua `SetActionLegs`/`SetActionArms` — **không tự ghi IK**. Xem `Docs/KnowledgeBase/Animation.md`. |
| `Rig/StickmanActionTypes.cs` | | `StickmanActionType` (14 loại) · `StickmanActionPose` (chân+thân là OFFSET, tay TUYỆT ĐỐI, `bodyHeightOffset` hạ cả rig) · `StickmanActionClip` (một STYLE: keys + loop + armMode + priority). |
| `Rig/StickmanActionSet.cs` | | Asset gom mọi style của mọi động tác; `Pick(type, style)` bốc theo tên hoặc theo trọng số. |
| `AI/StickmanClimbZone.cs` | | Thang / dây trong màn: trục, đáy, đỉnh + sổ đăng ký tĩnh `All` / `FindAt(point)`. |

## 2. Vũ khí (`Assets/Scripts/Combat/`)

| File | Dòng | Việc |
|---|---:|---|
| `WeaponTypes.cs` | | Toàn bộ enum + struct dùng chung: `WeaponType`, `WeaponClass`, `WeaponCategory`, `HandGrip`, `AimMode`, `MeleeStyle`, **`DamageInfo`**, **`WeaponHoldPose`**. |
| `WeaponBase.cs` | ~400 | Lớp trừu tượng: cooldown, tích lực, pose cầm (`IdlePose`/`ChargedPose`), điểm nắm tay, muzzle, VFX/SFX, thông số cho AI (`AiPreferredRangePercent`, `AiAggression`). **Số thật phải đọc qua `Damage`/`Cooldown`/`Knockback`** — đã nhân hệ số CẤP ĐỘ, khác với `_damage`/`_cooldown` là số gốc cấp 1. |
| `WeaponTierTable.cs` | | **Cấp độ vũ khí**: mỗi cấp một hệ số `power`, chẻ ra damage^0.6 + tốc độ^0.4 nên ưu/khuyết của từng lớp giữ nguyên khi lên cấp. Cấp 1 = đúng số gốc trên prefab. |
| `RangedWeapon.cs` | 261 | Cung / súng — bắn `ProjectileController` từ muzzle. |
| `MeleeWeapon.cs` | 321 | Kiếm / giáo — quét hitbox theo `MeleeStyle` (chém vòng / đâm thẳng). |
| `ThrowableWeapon.cs` | 157 | Lao / búa / bom — ném theo cung, rời tay thành projectile. |
| `StickmanWeaponHolder.cs` | | Kho vũ khí trên người: `EquipIndex/EquipType/EquipNext`, `AddWeapon`, `DropCurrentWeapon`, event `WeaponChanged`. Chết là rớt vũ khí đang cầm. |
| `EquipmentHitbox.cs` | | Nón/khiên **đỡ đòn** — hết lượt đỡ thì món đồ rơi, người sống. |
| `WeaponPickup.cs` | | Vũ khí nằm dưới đất, bấm E để nhặt. |

## 3. Vật bay (`Assets/Scripts/Combat/Weapons/`)

| File | Dòng | Việc |
|---|---:|---|
| `ProjectileController.cs` | 468 | **Mọi thứ bay đều là cái này**: tên, đạn, lao, búa, bom. Trọng lực/xoay/cắm vào mục tiêu/nổ. |
| `ProjectilePoolManager.cs` | | Pool theo key (`arrow`/`bullet`/`javelin`/`hammer`/`bomb`) trên `UnityEngine.Pool.ObjectPool<T>`. **Không Instantiate/Destroy trực tiếp.** |
| `Explosion.cs` | | Sát thương vùng cho bom. |
| `ArrowController.cs`, `ArrowPoolManager.cs` | | Bản CŨ, chỉ còn phục vụ `Arrow.prefab`. Code mới dùng `ProjectileController`. |

## 4. AI (`Assets/Scripts/AI/`)

| File | Dòng | Việc |
|---|---:|---|
| `StickmanAgent.cs` | ~700 | **Não NPC.** Giữ FSM, chọn mục tiêu (`SelectBestEnemy` có chấm điểm), né đòn, tinh thần (`IsShaken`), đội hình. Design pattern: State + Strategy + Observer + Facade. |
| `AIStates.cs` | | FSM: `AIStateIdle` / `Seek` / `Combat` / `Guard` / `Retreat`. Mỗi state 1 class thường (không MonoBehaviour), có `Name` để HUD hiển thị. |
| `CombatStrategies.cs` | 450 | **Lối đánh theo NHÓM vũ khí đang cầm** — melee áp sát, ranged kite, throwable ném vòng cung. Đổi vũ khí là NPC tự đổi cách đánh. |
| `AIProfile.cs` | | ScriptableObject chứa **toàn bộ số tuning** (tầm nhìn, tầm đánh, né, rút lui, đội hình). Không hardcode số trong code AI. |
| `TeamMember.cs` | | Phe + lọc va chạm (đồng đội/xác chết đi xuyên nhau), `FindNearestEnemy`, `CanDamage`, event tĩnh `AnyDied`. |
| `TeamCommander.cs` | ~380 | **Bộ máy hành chính của 1 phe**: giữ căn cứ + học thuyết, chọn CHỦ TƯỚNG (`_commanderUnit`, bỏ trống thì tự chọn), dựng cây lúc Start, `Issue()` cho lệnh tay. Chủ tướng chết → `HasCommand` = false, nút lệnh tắt. |
| `Command/CommandNode.cs` | ~1000 | **Một mắt xích trong cây chỉ huy** (Composite): lính / tổ trưởng / CHỦ TƯỚNG SỐNG dùng chung 1 class. Gom báo cáo dưới lên → ra quyết định → dời cột mốc + chia lệnh xuống. Chỉ huy đứng lùi sau tuyến; chết thì `TryPromoteHeir` hoặc `Disband` (tan hàng) theo học thuyết. |
| `Command/CommandTypes.cs` | | `CommandStance` (Attack/Hold/Defend/Regroup/Retreat/FreeRoam) + `CommandOrder` (lệnh xuống) + `SectorReport` (báo cáo lên, cộng dồn được). |
| `Command/CommandDoctrine.cs` | | ScriptableObject: **khi nào đánh, khi nào thủ** — ngưỡng cán cân lực lượng, `aggression`, chống bế tắc, tập trung hoả lực, quyền tự quyết cấp dưới. |
| `Command/CommandStructure.cs` | | Dựng cây từ đám lính có sẵn: chia nhóm `branching`, cử tổ trưởng (lính thật, đứa gần địch nhất), gắn vào gốc. `Attach()` cho lính spawn giữa trận. |
| `UnitLoadout.cs` | | ScriptableObject: `UnitRole` (Shield/Melee/Ranged) + vũ khí + máu + trang bị. |
| `StickmanLocomotion.cs` | | Đi lại bằng `Rigidbody2D.linearVelocity`: `Move(dir)`, `Stop()`, `MoveTowardsX`. Giữ luôn **đi bộ/chạy + thể lực** (`SetRun`, `StaminaPercent`, `IsExhausted`) và **CHẶN MÉP VỰC** (`IsLedgeAhead`, `IsNearLedge`, `IsOnIsland`) — cắt vận tốc đi về phía không có đất, chặn được mọi nguồn vì đây là chỗ duy nhất ghi vận tốc. |
| `StickmanLegWalker.cs` | | Bước chân **procedural** (đung đưa IK chân) — không cần clip Walk. |
| `StickmanFootsteps.cs` | | Tiếng bước chân — nghe event `StickmanLegWalker.Stepped` nên khớp với chân đang vẽ; đi bộ / chạy 2 bộ clip. |
| `StickmanAudio.cs` | | **Phát mọi tiếng SFX** (`Play` / `PlayVaried`) — 2D thuần + random cao độ. Thay `PlayClipAtPoint` (nó là 3D, camera z=-10 bóp còn 1/10 âm lượng). |
| `StickmanCombatVoice.cs` | | **Giọng nhân vật khi đánh nhau**: gắng sức (`WeaponBase.AnyAttacked`), trúng đòn (`Damaged`), chết (`Died`), hô xung trận (AI gọi). Giọng nam/nữ random mỗi nhân vật. |

## 5. Rớt đồ / trang bị

| File | Việc |
|---|---|
| `Combat/StickmanEquipment.cs` | Mặc nón/giáp/khiên từ `EquipmentDefinition`; CHẾT THÌ ĐỒ Ở LẠI TRÊN XÁC (`StickmanCorpseGear`), chỉ rớt khi hết giáp / hết lượt đỡ. |
| `Combat/EquipmentDefinition.cs` | ScriptableObject: sprite + slot + offset + `keepUpright` + số đòn đỡ được; nón văn minh có `headFrontSprite`/`headBackSprite` theo cấp. |
| `Combat/EquipmentStabilizer.cs` | Ghim đồ **thẳng đứng** mỗi `LateUpdate`; nón sau khi ghim world rotation còn soi hướng art bằng `TransformVector` + `SpriteRenderer.flipX` cho cả lớp mặt ngoài và mặt sau. |
| `Combat/DroppedItem.cs` | Nền vật lý chung cho đồ rơi: tự thêm Rigidbody2D + collider, chạm đất thì đóng băng. Kèm **vòng đời**: nằm hết hạn → mờ dần → `Destroy` (mờ rồi thì tắt collider, hết nhặt được). |
| `Combat/LootDropper.cs` | Bảng prefab + tỉ lệ rơi, nghe event `Died`. |
| `Combat/HealPickup.cs` | THUỐC dưới đất — thiếu máu ăn ngay, đầy máu bỏ túi. Nhặt bằng CHÂN, không hỏi phím. |
| `Combat/MedkitBag.cs` | Túi 3 liều trên người; tự dùng < 55% máu và yên tiếng súng 1.6 s; người chơi bấm **H** / nút THUỐC. |
| `Combat/LootTierMark.cs` | Vạch màu dưới món đồ = CẤP của nó (xám→trắng→lục→lam→tím→cam), đọc được từ xa. |
| `Units/GearPickup.cs` | Nón/giáp/khiên dưới đất — mặc ngay nếu slot trống hoặc cấp thấp hơn. `SetGearTier` TRƯỚC `Equip`, AI phải `PinTier`. |
| `Combat/StickmanWeaponHolder.DropArsenal` | Bỏ CẢ KHO, chỉ giữ nắm đấm, **vẫn nhặt được** (khác `UseNaturalWeaponsOnly` vốn chặn luôn `AddWeapon`). |

## 6. Rig / skin (`Assets/Scripts/Core/Rig/` + `Assets/Scripts/Combat/Rig/`)

| File | Việc |
|---|---|
| `StickmanSkinSet.cs` | ScriptableObject map `partKey → Sprite`. Đổi 1 asset = đổi cả bộ hình. |
| `StickmanSkinBinder.cs` | Áp SkinSet lên mọi `SpriteRenderer` con (kể cả ragdoll đang tắt). |
| `StickmanRagdollDefinition.cs` | Công thức dựng ragdoll: mass / collider / joint limit từng part. |
| `StickmanAnimationRecipe.cs` | Danh sách pose + thời điểm → bake ra `.anim`. |

## 7. Demo / test (`Assets/Scripts/Demo/`)

| File | Việc |
|---|---|
| `DemoSceneCatalog.cs` | Danh sách scene test: mỗi bài có **thời kỳ** (`genre`) và **tab nội dung** (`category`). Thêm bài = khai đủ hai trục, không sửa UI. |
| `DemoSceneSwitcher.cs` | **Ô chọn scene (dropdown)** góc trên trái — F1 xổ danh sách theo cây **Thời kỳ → Cơ bản/AI/Chế độ chơi**; mũi tên + Enter chọn, R chơi lại. |
| `StickmanDemoHud.cs` | Bảng thông tin scene: vũ khí đang cầm, máu, đếm quân từng phe. |
| **`StickmanTestbedHud.cs`** | **Bàn thử 2 tab** (Demo_5): tab Animation đổi vũ khí + kéo góc ngắm/lực tích + đọc thẳng số IK tay; tab AI soi state từng NPC + chỉnh `Time.timeScale`. |
| `TeamCommandHud.cs` | Nút ra lệnh cho phe (Demo_3): Tấn công / Giữ tuyến / Về thủ / trả quyền cho tướng máy. |
| `CommandHierarchyHud.cs` | **Phím F9** — soi cả cây chỉ huy: thế trận từng cấp, cán cân lực lượng, state + mục tiêu + vũ khí từng lính. Chỗ đầu tiên nhìn khi AI không chịu đánh. |
| `StickmanPickupPrompt.cs` | Nút [E] Nhặt hiện trên món đồ gần người chơi. |
| `DemoCameraFollow.cs` | Camera bám nhân vật, kẹp trong biên map. |
| `DemoTeamFlag.cs` | Cờ màu trên đầu để phân biệt phe. |

## 8. Tool editor (`Assets/Editor/`)

| File | Menu / dùng khi |
|---|---|
| `StickmanDemoBuilder.cs` | `Create Demo Scenes (All)` + `Demo Scenes/1..5` — dựng toàn bộ scene test. |
| `StickmanSceneUtils.cs` | Hàm chung: `EnsureAllAssets`, **`CreateGround`** (set size collider bằng tay — auto-fit là rơi xuyên đất), `ValidateScene`. |
| `StickmanWeaponBuilder.cs` | `Weapons > Build Everything (1-4)`, `New Weapon Variant`, `Mount/Unmount`. |
| `WeaponArtGenerator.cs` | Sinh sprite placeholder cho vũ khí/trang bị. |
| `StickmanAIBuilder.cs` | `AI > 1. Create NPC Prefab`, `2. Create AI Demo Scenes`, `Add AI to Selected Fighter`. |
| `StickmanRagdollBuilder.cs` | `Build or Refresh Ragdoll` — anchor joint tự tính từ vị trí bone. |
| `StickmanAnimationBaker.cs` | Capture pose IK trong scene → bake `.anim`. |
| `StickmanRigTools.cs` | `Validate Rig`, `Check SkinSet Compatibility`, `Create SkinSet`, `EnsureFolderPublic`. |
| `StickmanRigMetrics.cs` | **Đo** rig (bán kính đầu, nửa cao thân) → tính scale trang bị, không hardcode. |
| `SpritePivotTool.cs` | Click đặt pivot sprite vũ khí + auto Tip/collider. |
| `WeaponBaseEditor.cs`, `EquipmentDefinitionEditor.cs` | Nút **Capture** / **Mặc thử** — chỉnh pose bằng mắt rồi ghi số. |
| `StickmanArmorFitTool.cs` | `Civilizations/9` — bake lại scale/offset giáp theo vùng opaque và neo vai; không sửa art hay thông số phòng thủ. |
| `StickmanHelmetFitTool.cs` | `Civilizations/10` — bake lại cỡ/neo nón theo vành hoặc `.headanchor.json` cho từng cấp; không gõ tay transform. |
| `StickmanHelmetLayerTool.cs` | `Civilizations/11` — bake nón văn minh theo order mặt ngoài/đầu/mặt sau trên cùng canvas; **Front luôn giữ đủ PNG nguồn**, Back chỉ là bản sao phụ nên không thể khoét lõm/cắt hình. |
| `StickmanEquipmentRosterSmoke.cs` | `Civilizations/8` — smoke toàn bộ nón/giáp văn minh, cấp 1–5, hai hướng; batch trả exit code để CI chặn hồi quy. |

---

## Chỗ dễ sai khi sửa code

1. **Đừng gọi thẳng `WeaponBase` từ AI** — qua `StickmanFighterController` (xem sơ đồ trên).
2. **Đừng hardcode đường dẫn bone** — dùng `StickmanRigPaths`.
3. **Đừng hardcode số tuning AI** — vào `AIProfile`.
4. **Đừng `Instantiate`/`Destroy` projectile** — qua `ProjectilePoolManager`.
5. **Đừng override `TakeDamage`** ở class con — override `OnDeath(DamageInfo)`.
6. **Đừng đổi tên field serialized** mà không `[FormerlySerializedAs]`.
7. **Đừng thêm scene test mà sửa UI** — thêm 1 dòng vào `DemoSceneCatalog`.
