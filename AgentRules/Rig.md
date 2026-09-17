## Kiến trúc nhân vật stickman (BẮT BUỘC theo cấu trúc này)

Chuẩn lấy từ `E:\Project\StickManVsBubble_Archer\Assets\Prefabs\Character.prefab`
(đã port vào `Assets/Prefabs/Character.prefab` — dùng làm gốc cho mọi nhân vật mới).

```
Character (Rigidbody2D + ArcherPlayerController)
├── Ragdoll                 ← group rỗng, INACTIVE; nhận ragdoll parts khi chết
└── Sprite                  ← nhóm hiển thị khi SỐNG (đây là _bodyTransform, flip qua localScale.x)
    ├── Bone (Animator + IKManager2D)
    │   ├── SolverGroup
    │   │   ├── Solver_armL / Solver_armR      (LimbSolver2D — KHÔNG chứa IK target)
    │   │   └── Solver_legL/IKLegL, Solver_legR/IKLegR
    │   └── body_1
    │       └── body_2
    │           ├── bodyRagdoll  [INACTIVE]
    │           └── boneHead                    ← TÊN LÀ boneHead, không phải "head"
    │               ├── AimTarget               ← điểm ngắm cung/súng
    │               ├── IKArmL, IKArmR          ← IK TAY nằm ở ĐÂY, không nằm dưới SolverGroup
    │               ├── armL → handL → Bow → BowString (LineRenderer)
    │               ├── armR → handR → tempArrow (mũi tên đang nạp trên tay)
    │               └── headRagdoll  [INACTIVE]
    │       (legL → footL, legR → footR treo dưới body_2)
    ├── Collider/groundCollider
    └── Skin (SpriteSkin mỗi part; part phải tên "hand"/"foot" — không hậu tố R)
```

**Vì sao IK tay nằm dưới `boneHead`:** xoay `boneHead` để ngắm thì hai tay đi theo →
cung/súng luôn hướng đúng. IK chân nằm dưới SolverGroup nên chân độc lập với hướng ngắm.

**Flow chết (TakeDamage):**
1. `_isDie = true`, `_rigBody.simulated = false` (tắt physics root)
2. Reparent tất cả `*Ragdoll` parts sang group `Ragdoll`, SetActive(true)
3. Bật group `Ragdoll`, tắt group `Sprite`
4. `AddForce(directHit * multiplier, ForceMode2D.Impulse)` vào head ragdoll
5. **TẮT script per-frame** (`DisablePerFrameScripts` trong FighterController.OnDeath):
   Locomotion, ProceduralAnimator, LegWalker, chính Fighter; StickmanAgent + CommandNode
   (non-root) tự tắt qua event `Died`. Early-return `if (_isDie)` KHÔNG đủ — Unity vẫn
   trả phí gọi Update cho từng xác.
6. **ĐỒ TRÊN NGƯỜI Ở LẠI VỚI CÁI XÁC** (`StickmanCorpseGear.KeepOn`, nghe event `Died`):
   nón · giáp · tóc/râu overlay được chuyển sang chính PART RAGDOLL tương ứng (`headRagdoll`,
   `bodyRagdoll`) nên lăn theo cái xác, mờ dần rồi biến mất cùng nó. **Chết KHÔNG làm rụng
   đồ** — món đồ chỉ rời khỏi người khi bị ĐÁNH RỚT (hết `armor` hoặc hết `hitsBlocked`).
   ⚠ Part ragdoll phải TRA TỪ TRƯỚC (lúc dò xương): khi `Died` bắn ra thì `EnableRagdoll` đã
   dời part khỏi xương, tra lúc đó là trượt và món đồ tắt theo nhóm `Sprite` TRONG IM LẶNG.
7. **ĐÓNG BĂNG XÁC** (`_freezeCorpse` trên StickmanController, mặc định bật): ragdoll nằm
   yên ~2.5s → mọi part chuyển `bodyType = Static` (10 RB + 9 joint/xác ngừng ăn CPU,
   collider vẫn còn nên tên vẫn cắm được). Bị đánh tiếp thì tự rã băng rồi đông lại.
   Đang bay thật (bom hất) thì không đông — chỉ cưỡng chế khi còn rung nhẹ do kẹt chồng.
8. **DỌN XÁC** (`_despawnCorpse`, mặc định bật): nằm `_corpseLifetime` (12s) → mờ dần
   `_corpseFadeTime` (1.5s) → `Destroy`. Đóng băng chỉ cắt phí PHYSICS, xác vẫn còn
   ~14 SpriteRenderer + 10 collider + GameObject. Van thứ hai là **TRẦN SỐ XÁC**
   (`_maxCorpses` = 12, 0 = vô hạn): quá trần thì xác GIÀ NHẤT mờ ngay, không đợi hết giờ —
   ở trận đông người thì chính cái trần này giữ nhịp máy. Bị đánh tiếp là gia hạn giờ +
   hiện lại nếu đang mờ dở. Đồ rơi ra đã `SetParent(null)` lúc chết nên KHÔNG bị huỷ theo xác.

9. ⚠⚠ **MŨI TÊN / LAO CẮM TRÊN NGƯỜI: CẮM VÀO XƯƠNG LÚC SỐNG, CHUYỂN SANG PART RAGDOLL LÚC
   CHẾT** (`ProjectileController.ResolveStickAnchor` + `OnHostDied`). Cùng bài toán với
   `StickmanCorpseGear`, và bản cũ giải sai đúng một nửa: nó cắm THẲNG vào part ragdoll gần
   nhất cho cả người CÒN SỐNG — mà part `*Ragdoll` **TẮT SUỐT LÚC CÒN SỐNG** (chỉ
   `EnableRagdoll` mới `SetActive(true)`). Hai thứ hỏng cùng lúc, cả hai câm lặng:
   · mũi tên **VÔ HÌNH** cho tới lúc nạn nhân chết mới hiện ra — đúng câu *"bắn trúng không
     thấy dính trong body, chết mới thấy"*;
   · `LateUpdate` của nó ngừng chạy theo ⇒ đồng hồ despawn đứng ⇒ mũi tên **KHÔNG BAO GIỜ về
     pool**, mỗi phát trúng người là rò một slot.
   ⚠ **ĐỪNG gỡ đăng ký `Died` trong `OnDisable`.** Chính lúc chết thì `EnableRagdoll` tắt
   nhóm `Sprite`, tức mũi tên bị vô hiệu hoá và `OnDisable` chạy **TRƯỚC** khi `Died` bắn ra —
   gỡ ở đó là handler biến mất đúng một nhịp trước lúc cần, và mũi tên tắt theo nhóm `Sprite`.
   Chỗ gỡ đúng: `OnDestroy` + `OnReleaseToPool`.
   ⚠ **Phải kéo về SORTING LAYER của rig** (`StickmanSorting.StuckProjectile` = 12, trên cùng):
   prefab đạn nằm layer `Default` còn rig nằm `character`, mà renderer so LAYER TRƯỚC — để
   nguyên là mũi tên chìm sau khối thân đen, cắm đúng chỗ mà nhìn không thấy gì (bẫy 3b).
   ⚠ **Trả lại MÀU lúc về pool**, không chỉ bậc vẽ: mũi tên cắm trên xác nằm trong cây con của
   nạn nhân, mà `StickmanController` làm mờ xác bằng cách quét MỌI `SpriteRenderer` từ ROOT —
   bắn vào cái xác sắp tan là mũi tên về pool với alpha gần 0, và phát bắn SAU lấy trúng nó.

