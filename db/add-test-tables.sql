-- 添加测试桌位数据
INSERT INTO tables (name, qrcode_token, location) VALUES
  ('A01桌', 'table_a01', '大厅A区'),
  ('A02桌', 'table_a02', '大厅A区'),
  ('A03桌', 'table_a03', '大厅A区'),
  ('B01桌', 'table_b01', '大厅B区'),
  ('B02桌', 'table_b02', '大厅B区'),
  ('包厢1', 'vip_room_1', 'VIP区域'),
  ('包厢2', 'vip_room_2', 'VIP区域')
ON CONFLICT (qrcode_token) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location;
