-- update_translations.sql

-- Actualizar el JSON de translations para agregar los nuevos campos del heroSlider

UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{es,Hero,home_hero_title1}', '"Este sueño no empezó hoy"'),
      '{es,Hero,home_hero_subtitle1}', '"Empezó hace muchos años en las manos de quienes nos enseñaron a trabajar, creer y amar. Hoy Antica M&M honra ese legado atemporal."'
    ),
    '{es,Hero,home_hero_button1}', '"Descubre Nuestra Historia"'
  ),
  '{es,Hero,home_hero_link1}', '"/es/nosotros"'
)
WHERE id = 'translations';

UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{es,Hero,home_hero_title2}', '"Experiencias Únicas"'),
      '{es,Hero,home_hero_subtitle2}', '"Vive momentos inolvidables con nuestro café premium y experiencias exclusivas."'
    ),
    '{es,Hero,home_hero_button2}', '"Explorar Experiencias"'
  ),
  '{es,Hero,home_hero_link2}', '"/es/experiencias"'
)
WHERE id = 'translations';

UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{es,Hero,home_hero_title3}', '"Productos Exclusivos"'),
      '{es,Hero,home_hero_subtitle3}', '"Descubre nuestra selección de productos de alta calidad para llevar el sabor de Antica a casa."'
    ),
    '{es,Hero,home_hero_button3}', '"Ver Productos"'
  ),
  '{es,Hero,home_hero_link3}', '"/es/productos"'
)
WHERE id = 'translations';

-- Para inglés
UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{en,Hero,home_hero_title1}', '"This dream didn''t start today"'),
      '{en,Hero,home_hero_subtitle1}', '"It started many years ago in the hands of those who taught us to work, believe and love. Today Antica M&M honors that timeless legacy."'
    ),
    '{en,Hero,home_hero_button1}', '"Discover Our Story"'
  ),
  '{en,Hero,home_hero_link1}', '"/en/nosotros"'
)
WHERE id = 'translations';

UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{en,Hero,home_hero_title2}', '"Unique Experiences"'),
      '{en,Hero,home_hero_subtitle2}', '"Live unforgettable moments with our premium coffee and exclusive experiences."'
    ),
    '{en,Hero,home_hero_button2}', '"Explore Experiences"'
  ),
  '{en,Hero,home_hero_link2}', '"/en/experiencias"'
)
WHERE id = 'translations';

UPDATE public.storefront_content
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{en,Hero,home_hero_title3}', '"Exclusive Products"'),
      '{en,Hero,home_hero_subtitle3}', '"Discover our selection of high-quality products to bring the flavor of Antica home."'
    ),
    '{en,Hero,home_hero_button3}', '"View Products"'
  ),
  '{en,Hero,home_hero_link3}', '"/en/productos"'
)
WHERE id = 'translations';