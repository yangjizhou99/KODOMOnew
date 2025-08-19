export type Locale = 'zh-TW' | 'en'

export type Category = {
  id: string;
  name_zh: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
}

export type Product = {
  id: string;
  category_id: string;
  name_zh: string;
  name_en: string;
  desc_zh: string;
  desc_en: string;
  price_cents: number;
  image_url?: string | null;
  is_active: boolean;
  is_sold_out: boolean;
  sku?: string | null;
}
