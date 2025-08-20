-- 修复 tables 和 orders 之间的外键约束
-- 添加级联删除选项

-- 1. 删除现有的外键约束
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey;

-- 2. 重新创建外键约束，添加级联删除
ALTER TABLE orders ADD CONSTRAINT orders_table_id_fkey 
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE;

-- 验证约束已创建
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'orders' 
  AND kcu.column_name = 'table_id';
