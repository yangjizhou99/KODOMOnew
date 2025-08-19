-- Kodomo 2.0 — Test Seed Data (idempotent, safe to re-run)
-- 说明：本脚本基于 schema 文件 `db/kodomo-2-schema-with-rls-fixed.sql`
-- 特性：
-- 1) 仅使用自然键（email、sku、code 等）定位记录，避免硬编码 UUID
-- 2) 使用 upsert / on conflict，确保可重复执行
-- 3) 保持字段约束与外键完整

begin;

-- =========================
-- 基础账号（员工）
-- =========================
with upsert_admin as (
  insert into users(email, phone, role)
  values ('admin@example.com', '+81000000001', 'admin')
  on conflict(email) do update set
    phone = excluded.phone,
    role = excluded.role
  returning id
), upsert_cashier as (
  insert into users(email, phone, role)
  values ('cashier@example.com', '+81000000002', 'cashier')
  on conflict(email) do update set
    phone = excluded.phone,
    role = excluded.role
  returning id
), upsert_kitchen as (
  insert into users(email, phone, role)
  values ('kitchen@example.com', '+81000000003', 'kitchen')
  on conflict(email) do update set
    phone = excluded.phone,
    role = excluded.role
  returning id
)
select 1;

-- =========================
-- 会员用户（含钱包/积分账号）
-- =========================
-- Alice
with u as (
  insert into users(email, phone, role)
  values ('alice@example.com', '+81000001001', 'member')
  on conflict(email) do update set
    phone = excluded.phone,
    role = 'member'
  returning id
), m as (
  insert into members(id, member_no, name, birthday, marketing_opt_in)
  select id, 'M0001', '张三', '1990-01-01', true from u
  on conflict(id) do update set
    member_no = excluded.member_no,
    name = excluded.name,
    birthday = excluded.birthday,
    marketing_opt_in = excluded.marketing_opt_in
  returning id
), w as (
  insert into wallet_accounts(member_id, balance_cents, currency)
  select id, 0, 'JPY' from m
  on conflict(member_id) do nothing
  returning member_id
), p as (
  insert into points_accounts(member_id, points)
  select id, 0 from m
  on conflict(member_id) do nothing
  returning member_id
)
select 1;

-- Bob
with u as (
  insert into users(email, phone, role)
  values ('bob@example.com', '+81000001002', 'member')
  on conflict(email) do update set
    phone = excluded.phone,
    role = 'member'
  returning id
), m as (
  insert into members(id, member_no, name, birthday, marketing_opt_in)
  select id, 'M0002', '李四', '1992-02-02', false from u
  on conflict(id) do update set
    member_no = excluded.member_no,
    name = excluded.name,
    birthday = excluded.birthday,
    marketing_opt_in = excluded.marketing_opt_in
  returning id
), w as (
  insert into wallet_accounts(member_id, balance_cents, currency)
  select id, 0, 'JPY' from m
  on conflict(member_id) do nothing
  returning member_id
), p as (
  insert into points_accounts(member_id, points)
  select id, 0 from m
  on conflict(member_id) do nothing
  returning member_id
)
select 1;

-- =========================
-- 餐桌（QR 点餐）
-- 若已执行过 db/add-test-tables.sql，可忽略本段；这里确保幂等存在
-- =========================
insert into tables (name, qrcode_token, location) values
  ('A01桌', 'table_a01', '大厅A区'),
  ('A02桌', 'table_a02', '大厅A区'),
  ('A03桌', 'table_a03', '大厅A区'),
  ('B01桌', 'table_b01', '大厅B区'),
  ('B02桌', 'table_b02', '大厅B区'),
  ('包厢1', 'vip_room_1', 'VIP区域'),
  ('包厢2', 'vip_room_2', 'VIP区域')
on conflict (qrcode_token) do update set
  name = excluded.name,
  location = excluded.location;

-- =========================
-- 分类与商品（补充 Drinks 与更多商品）
-- schema 已插入 Rice/Noodles 与 2 个示例商品；此处做补充
-- =========================
insert into categories (name_zh, name_en, sort_order, is_active)
select '飲料','Drinks',3,true
where not exists (
  select 1 from categories where name_en='Drinks'
);

with c_drinks as (
  select id from categories where name_en='Drinks' order by id limit 1
)
insert into products (category_id, name_zh, name_en, desc_zh, desc_en, price_cents, image_url, is_active, is_sold_out, sku)
select c_drinks.id, '乌龙茶', 'Oolong Tea',
       '清香解腻。', 'Light and refreshing.',
       300, null, true, false, 'DRINK-001'
from c_drinks
on conflict (sku) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  desc_zh = excluded.desc_zh,
  desc_en = excluded.desc_en,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active,
  is_sold_out = excluded.is_sold_out;

-- 再补充一个面类商品
with c_noodles as (
  select id from categories where name_en='Noodles' order by id limit 1
)
insert into products (category_id, name_zh, name_en, desc_zh, desc_en, price_cents, image_url, is_active, is_sold_out, sku)
select c_noodles.id, '味噌拉麵', 'Miso Ramen',
       '浓郁味噌风味。', 'Rich miso flavor.',
       8200, null, true, false, 'RAMEN-002'
from c_noodles
on conflict (sku) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  desc_zh = excluded.desc_zh,
  desc_en = excluded.desc_en,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active,
  is_sold_out = excluded.is_sold_out;

-- =========================
-- 菜单
-- =========================
insert into menus (title_zh, title_en, is_active, valid_from, valid_to)
select '主菜单', 'Main Menu', true, current_date - interval '1 day', current_date + interval '60 days'
where not exists (
  select 1 from menus where title_en='Main Menu'
);

with m as (
  select id from menus where title_en='Main Menu' order by id limit 1
), p as (
  select id, sku from products where sku in ('KATSU-001','RAMEN-001','RAMEN-002','DRINK-001')
)
insert into menu_items (menu_id, product_id, price_override_cents, is_recommended)
select m.id,
       p.id,
       case when p.sku='RAMEN-001' then 7500 else null end,
       case when p.sku in ('KATSU-001','RAMEN-001') then true else false end
from m
cross join p
left join menu_items mi on mi.menu_id = m.id and mi.product_id = p.id
where mi.id is null;

-- =========================
-- 优惠券
-- =========================
insert into coupons (code, title_zh, title_en, desc_zh, desc_en, type, value, min_spend_cents, starts_at, ends_at, max_uses, per_user_limit, is_active)
values
  ('OFF10', '九折优惠', '10% OFF', '全单九折', '10 percent off order', 'percent'::coupon_type, 10, 0, now() - interval '1 day', now() + interval '30 days', 1000, 3, true),
  ('LESS500', '立减500円', 'JPY 500 OFF', '单笔满1000円立减500円', '500 JPY off order >= 1000 JPY', 'fixed'::coupon_type, 500, 1000, now() - interval '1 day', now() + interval '30 days', 1000, 1, true),
  ('GIFT', '赠品券', 'Gift Coupon', '下单赠小礼品', 'Gift with purchase', 'gift'::coupon_type, 0, 0, now() - interval '1 day', now() + interval '30 days', 1000, 1, true)
on conflict (code) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  desc_zh = excluded.desc_zh,
  desc_en = excluded.desc_en,
  type = excluded.type,
  value = excluded.value,
  min_spend_cents = excluded.min_spend_cents,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  max_uses = excluded.max_uses,
  per_user_limit = excluded.per_user_limit,
  is_active = excluded.is_active;

-- =========================
-- 内容（新闻/联系）
-- =========================
insert into news_posts (title_zh, title_en, body_zh, body_en, status, published_at, cover_url)
select '新店开业', 'Grand Opening', '我们正式开业，欢迎光临！', 'We are open! Welcome!', 'published', now(), null
where not exists (
  select 1 from news_posts where title_en='Grand Opening'
);

insert into contact_messages (name, email, phone, subject, message)
select '测试用户', 'test@demo.local', '+81000009999', '咨询营业时间', '请问周末营业时间是几点到几点？'
where not exists (
  select 1 from contact_messages
  where email='test@demo.local' and subject='咨询营业时间'
);

-- =========================
-- 库存（按 SKU 建立并建立出入库记录）
-- =========================
-- 依据商品 SKU 建立库存项目
with prod as (
  select id, sku, name_en from products where sku in ('KATSU-001','RAMEN-001','DRINK-001')
)
insert into inventory_items (sku, name, track_stock, stock_qty)
select p.sku, p.name_en, true, 0
from prod p
on conflict (sku) do nothing;

-- 初始入库 + 针对订单消耗的出库（如果重复执行，只会累计一次入库/出库，建议测试前清空 movements 或按需调整）
-- 这里采用 upsert 不适用，因为 ledger/流水通常保留历史，我们保持追加写入示例。
-- 若多次执行会重复追加，请在测试时仅执行一次此段，或在执行前清理 inventory_movements。
insert into inventory_movements (inventory_item_id, change, reason)
select ii.id, 50, '初始入库'
from inventory_items ii
where ii.sku in ('KATSU-001','RAMEN-001','DRINK-001')
and not exists (
  select 1 from inventory_movements im
  where im.inventory_item_id = ii.id and im.reason = '初始入库'
);

-- =========================
-- 订单与订单项（一个已付款订单 + 一个挂起订单）
-- =========================
-- Alice 的已付款订单（web, dine_in, A01桌），含优惠券 OFF10
with m as (
  select id as member_id from members where id in (select id from users where email='alice@example.com')
), t as (
  select id as table_id from tables where qrcode_token='table_a01' limit 1
), o as (
  insert into orders (channel, table_id, member_id, status, fulfillment, subtotal_cents, discount_cents, total_cents, currency, notes, paid_at)
  select 'web'::order_channel, t.table_id, m.member_id, 'paid'::order_status, 'dine_in'::order_fulfillment, 0, 0, 0, 'JPY', 'Alice 首单（含九折优惠）', now()
  from m, t
  returning id
), p as (
  select id, sku, price_cents from products where sku in ('KATSU-001','DRINK-001')
), oi as (
  insert into order_items (order_id, product_id, qty, unit_price_cents, options_json, line_total_cents)
  select o.id,
         p.id,
         case when p.sku='KATSU-001' then 2 else 1 end as qty,
         p.price_cents,
         '{}'::jsonb,
         case when p.sku='KATSU-001' then 2 * p.price_cents else 1 * p.price_cents end as line_total_cents
  from o, p
  returning order_id
), sums as (
  select oi.order_id, sum(line_total_cents)::int as subtotal
  from order_items oi
  join o on oi.order_id = o.id
  group by oi.order_id
), upd as (
  update orders ord
  set subtotal_cents = s.subtotal,
      discount_cents = floor(s.subtotal * 0.10)::int,
      total_cents = s.subtotal - floor(s.subtotal * 0.10)::int
  from sums s
  where ord.id = s.order_id
  returning ord.id, ord.member_id, ord.total_cents
), coupon as (
  select id as coupon_id from coupons where code='OFF10'
), redeem as (
  insert into coupon_redemptions (coupon_id, order_id, member_id)
  select c.coupon_id, u.id, u.member_id from upd u, coupon c
  on conflict do nothing
  returning order_id
)
select 1;

-- Bob 的挂起订单（qr, takeout, B01桌）
with m as (
  select id as member_id from members where id in (select id from users where email='bob@example.com')
), t as (
  select id as table_id from tables where qrcode_token='table_b01' limit 1
), o as (
  insert into orders (channel, table_id, member_id, status, fulfillment, subtotal_cents, discount_cents, total_cents, currency, notes)
  select 'qr'::order_channel, t.table_id, m.member_id, 'pending'::order_status, 'takeout'::order_fulfillment, 0, 0, 0, 'JPY', 'Bob 未提交订单'
  from m, t
  returning id
), p as (
  select id, sku, price_cents from products where sku in ('RAMEN-001')
), oi as (
  insert into order_items (order_id, product_id, qty, unit_price_cents, options_json, line_total_cents)
  select o.id, p.id, 1, p.price_cents, '{}'::jsonb, p.price_cents
  from o, p
  returning order_id
), sums as (
  select oi.order_id, sum(line_total_cents)::int as subtotal
  from order_items oi
  join o on oi.order_id = o.id
  group by oi.order_id
)
update orders ord
set subtotal_cents = s.subtotal,
    total_cents = s.subtotal
from sums s
where ord.id = s.order_id;

-- 针对 Alice 的订单做库存出库记录（追加写入，避免重复执行多次）
insert into inventory_movements (inventory_item_id, change, reason, order_id)
select ii.id, -2, '出库：KATSU-001 x2 (Alice 订单)', o.id
from inventory_items ii
join products p on p.sku='KATSU-001' and ii.sku = p.sku
join orders o on o.notes like 'Alice 首单%'
left join inventory_movements im on im.inventory_item_id = ii.id and im.order_id = o.id and im.change = -2
where im.id is null;

insert into inventory_movements (inventory_item_id, change, reason, order_id)
select ii.id, -1, '出库：DRINK-001 x1 (Alice 订单)', o.id
from inventory_items ii
join products p on p.sku='DRINK-001' and ii.sku = p.sku
join orders o on o.notes like 'Alice 首单%'
left join inventory_movements im on im.inventory_item_id = ii.id and im.order_id = o.id and im.change = -1
where im.id is null;

-- =========================
-- 钱包与积分流水（根据订单追加）
-- =========================
-- Alice：充值 + 购买
with m as (
  select id as member_id from members where id in (select id from users where email='alice@example.com')
), o as (
  select id as order_id, total_cents from orders where notes like 'Alice 首单%'
)
insert into wallet_ledger (member_id, type, amount_cents, order_id, ref)
select m.member_id, 'topup'::wallet_type, 30000, null, '测试充值 300'
from m
union all
select m.member_id, 'purchase'::wallet_type, -o.total_cents, o.order_id, '订单支付'
from m, o;

-- Bob：仅充值
with m as (
  select id as member_id from members where id in (select id from users where email='bob@example.com')
)
insert into wallet_ledger (member_id, type, amount_cents, order_id, ref)
select m.member_id, 'topup'::wallet_type, 10000, null, '测试充值 100'
from m;

-- 按流水回写余额（幂等：直接以汇总覆盖）
update wallet_accounts w
set balance_cents = coalesce(s.sum_amount, 0),
    updated_at = now()
from (
  select member_id, sum(amount_cents)::int as sum_amount
  from wallet_ledger
  group by member_id
 ) s
where w.member_id = s.member_id;

-- 积分：Alice 按实付 1% 返利（四舍五入）
with m as (
  select id as member_id from members where id in (select id from users where email='alice@example.com')
), o as (
  select total_cents from orders where notes like 'Alice 首单%'
), pts as (
  select round((select total_cents from o) * 0.01)::int as earned
)
insert into points_ledger (member_id, delta_points, reason)
select m.member_id, pts.earned, '下单返利'
from m, pts;

-- 回写积分账户（幂等：直接以汇总覆盖）
update points_accounts p
set points = coalesce(s.sum_points, 0)
from (
  select member_id, sum(delta_points)::int as sum_points
  from points_ledger
  group by member_id
 ) s
where p.member_id = s.member_id;

commit;

-- 使用说明：
-- 1) 在 Supabase SQL Editor 或 psql 中执行本文件；
-- 2) 若仅需一次性流水（inventory_movements / wallet_ledger / points_ledger），请避免重复运行或先清理相关表；
-- 3) 可配合前端页面进行联调：菜单、下单、优惠券校验、钱包扣款、积分累积等场景。


