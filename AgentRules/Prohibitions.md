## Những điều KHÔNG làm

- Không thêm Anima2D (deprecated, không tương thích Unity 2019.3+)
- Không đổi tên field serialized mà không có `[FormerlySerializedAs]` (mất data prefab)
- Không sửa file .meta bằng tay trừ khi biết rõ đang làm gì
- Không commit `Library/`, `Temp/`, `obj/`, `UserSettings/` (đã có .gitignore)
