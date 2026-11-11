-- =============================================
-- Yumli Seed Data
-- Optional sample data. Run AFTER shared_project_setup.sql, only on an
-- empty project: the move from the old project brings the real recipes.
-- =============================================

-- Insert categories
insert into yumli.categories (name, slug, icon) values
  ('Breakfast', 'breakfast', null),
  ('Main Course', 'main-course', null),
  ('Dessert', 'dessert', null),
  ('Salad', 'salad', null),
  ('Soup', 'soup', null),
  ('Snack', 'snack', null)
on conflict (slug) do nothing;

-- Insert recipes
-- Breakfast
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Fluffy Japanese Souffle Pancakes',
  'Jiggly, cloud-like pancakes that are incredibly light and airy. A viral cafe-style treat you can make at home.',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
  '15 min',
  '20 min',
  2,
  'Medium',
  array['2 egg yolks', '3 tbsp milk', '1 tsp vanilla extract', '1/4 cup cake flour', '1/2 tsp baking powder', '3 egg whites', '2 tbsp sugar', 'Pinch of cream of tartar'],
  array['Mix egg yolks, milk, vanilla, flour, and baking powder into a smooth batter', 'Beat egg whites with cream of tartar until foamy, then gradually add sugar until stiff peaks form', 'Gently fold 1/3 of the meringue into the batter, then fold in the rest', 'Pipe or spoon tall mounds onto a low-heat buttered pan', 'Add a splash of water, cover, and cook 6-7 minutes per side', 'Serve immediately with butter, maple syrup, and fresh berries'],
  (select id from yumli.categories where slug = 'breakfast'),
  true
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Avocado Toast with Poached Egg',
  'Creamy avocado on crispy sourdough topped with a perfectly poached egg. The ultimate quick breakfast.',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop',
  '5 min',
  '5 min',
  1,
  'Easy',
  array['1 ripe avocado', '2 slices sourdough bread', '2 eggs', '1 tbsp white vinegar', 'Red pepper flakes', 'Flaky sea salt', 'Fresh lemon juice', 'Everything bagel seasoning'],
  array['Toast sourdough until golden and crispy', 'Mash avocado with lemon juice, salt, and pepper', 'Bring a pot of water to a gentle simmer, add vinegar', 'Create a swirl in the water and drop in an egg, cook 3-4 minutes', 'Spread avocado on toast, top with poached egg', 'Sprinkle with red pepper flakes and everything bagel seasoning'],
  (select id from yumli.categories where slug = 'breakfast'),
  true
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Berry Smoothie Bowl',
  'A thick, vibrant smoothie bowl loaded with fresh toppings. Feels like ice cream for breakfast but actually healthy.',
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop',
  '5 min',
  '0 min',
  1,
  'Easy',
  array['1 cup frozen mixed berries', '1 frozen banana', '1/3 cup Greek yogurt', '2 tbsp milk or oat milk', 'Granola for topping', 'Fresh berries', 'Sliced banana', 'Drizzle of honey'],
  array['Blend frozen berries, banana, yogurt, and milk until thick and creamy', 'Pour into a bowl — it should be thicker than a regular smoothie', 'Arrange toppings in rows: granola, fresh berries, banana slices', 'Drizzle with honey and serve immediately'],
  (select id from yumli.categories where slug = 'breakfast'),
  false
);

-- Main Course
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Creamy Garlic Butter Chicken',
  'Tender pan-seared chicken in a rich, creamy garlic butter sauce. Restaurant-quality dinner in 30 minutes.',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop',
  '10 min',
  '20 min',
  2,
  'Easy',
  array['2 chicken thighs, boneless', '3 cloves garlic, minced', '2 tbsp butter', '1/2 cup heavy cream', '1/4 cup chicken broth', '1/2 cup sun-dried tomatoes', 'Fresh basil', 'Salt, pepper, paprika'],
  array['Season chicken with salt, pepper, and paprika', 'Sear chicken in a hot pan with oil, 5-6 min per side, set aside', 'In the same pan, melt butter and saute garlic until fragrant', 'Add sun-dried tomatoes, broth, and cream — simmer until thickened', 'Return chicken to the sauce and coat well', 'Garnish with fresh basil and serve with rice or pasta'],
  (select id from yumli.categories where slug = 'main-course'),
  true
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'One-Pot Pasta Carbonara',
  'The classic Roman pasta made properly — silky egg sauce, crispy guanciale, and sharp pecorino. No cream needed.',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  '5 min',
  '15 min',
  2,
  'Medium',
  array['200g spaghetti', '100g guanciale or pancetta, diced', '2 whole eggs + 1 yolk', '1/2 cup pecorino romano, finely grated', 'Freshly cracked black pepper', 'Salt for pasta water'],
  array['Cook pasta in well-salted water until al dente, reserve 1 cup pasta water', 'While pasta cooks, crisp guanciale in a cold pan over medium heat', 'Whisk eggs, yolk, pecorino, and lots of black pepper in a bowl', 'Drain pasta and toss with guanciale, remove from heat', 'Pour egg mixture over pasta, toss vigorously — the residual heat cooks the eggs into a creamy sauce', 'Add splashes of pasta water to reach silky consistency, serve immediately with extra pecorino'],
  (select id from yumli.categories where slug = 'main-course'),
  true
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Honey Garlic Glazed Salmon',
  'Flaky salmon fillets with a sweet and savory honey garlic glaze. Impressive looking but surprisingly simple.',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
  '5 min',
  '15 min',
  1,
  'Easy',
  array['1 salmon fillet (6oz)', '2 tbsp honey', '1 tbsp soy sauce', '2 cloves garlic, minced', '1 tbsp butter', 'Juice of half a lemon', 'Sesame seeds', 'Steamed broccoli for serving'],
  array['Pat salmon dry and season with salt and pepper', 'Sear salmon skin-side up in a hot oiled pan for 4 minutes', 'Flip and cook 3 more minutes, remove from pan', 'In the same pan, melt butter with garlic, honey, soy sauce, and lemon juice', 'Return salmon to the pan and spoon glaze over it for 1-2 minutes', 'Top with sesame seeds and serve with steamed broccoli'],
  (select id from yumli.categories where slug = 'main-course'),
  false
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Thai Basil Stir-Fry',
  'A fast, fiery stir-fry with bold Thai flavors. Ready in under 15 minutes — perfect for busy weeknights.',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
  '10 min',
  '5 min',
  1,
  'Easy',
  array['150g chicken or tofu, sliced thin', '2 cloves garlic, minced', '2 Thai chilies, sliced', '1 tbsp oyster sauce', '1 tbsp soy sauce', '1 tsp sugar', '1 cup Thai basil leaves', 'Jasmine rice for serving'],
  array['Heat oil in a wok over high heat until smoking', 'Stir-fry garlic and chilies for 10 seconds', 'Add chicken, stir-fry until just cooked through (2-3 min)', 'Add oyster sauce, soy sauce, and sugar — toss well', 'Kill the heat and fold in Thai basil until wilted', 'Serve over jasmine rice with a fried egg on top'],
  (select id from yumli.categories where slug = 'main-course'),
  false
);

-- Dessert
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Molten Chocolate Lava Cake',
  'A warm chocolate cake with a gooey, flowing center. The most impressive dessert you can make in 20 minutes.',
  'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
  '10 min',
  '12 min',
  2,
  'Medium',
  array['100g dark chocolate (70%)', '3 tbsp butter', '1 egg + 1 egg yolk', '3 tbsp sugar', '2 tbsp flour', 'Pinch of salt', 'Powdered sugar for dusting', 'Vanilla ice cream for serving'],
  array['Preheat oven to 425F and butter two ramekins, dust with cocoa powder', 'Melt chocolate and butter together in a microwave in 30-second bursts', 'Whisk in egg, yolk, and sugar until smooth', 'Fold in flour and salt — do not overmix', 'Divide batter between ramekins and bake for exactly 12 minutes', 'Let rest 1 minute, run a knife around the edge, flip onto a plate, dust with powdered sugar and serve with ice cream'],
  (select id from yumli.categories where slug = 'dessert'),
  true
);

insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Brown Butter Chocolate Chip Cookies',
  'Chewy, gooey cookies with nutty brown butter and pools of melted chocolate. Better than any bakery.',
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
  '15 min',
  '10 min',
  12,
  'Easy',
  array['1/2 cup butter, browned', '1/2 cup brown sugar', '1/4 cup white sugar', '1 egg', '1 tsp vanilla', '1 1/4 cups flour', '1/2 tsp baking soda', '1/2 tsp salt', '1 cup chocolate chips', 'Flaky sea salt for topping'],
  array['Brown the butter in a saucepan until golden and nutty, let cool slightly', 'Whisk brown butter with both sugars until smooth', 'Beat in egg and vanilla', 'Fold in flour, baking soda, and salt until just combined', 'Fold in chocolate chips, chill dough 30 min if possible', 'Scoop onto baking sheet, bake at 375F for 9-11 minutes', 'Sprinkle with flaky sea salt while still warm'],
  (select id from yumli.categories where slug = 'dessert'),
  false
);

-- Salad
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Crispy Chicken Caesar Salad',
  'Crunchy romaine, crispy chicken, parmesan shavings, and a tangy homemade Caesar dressing. A complete meal.',
  'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
  '10 min',
  '10 min',
  1,
  'Easy',
  array['1 chicken breast', '1 head romaine lettuce', '1/4 cup parmesan shavings', 'Croutons', '1 anchovy fillet (optional)', '1 clove garlic', '1 egg yolk', '2 tbsp lemon juice', '1/3 cup olive oil', 'Dijon mustard'],
  array['Season chicken and pan-fry until golden and cooked through, slice', 'For dressing: blend garlic, anchovy, egg yolk, lemon juice, mustard, then slowly drizzle in olive oil', 'Chop romaine and toss with dressing', 'Top with sliced chicken, parmesan shavings, and croutons', 'Crack fresh black pepper over the top and serve'],
  (select id from yumli.categories where slug = 'salad'),
  false
);

-- Soup
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Creamy Tomato Basil Soup',
  'A velvety smooth tomato soup with fresh basil. The ultimate comfort food — perfect with a grilled cheese.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  '10 min',
  '25 min',
  2,
  'Easy',
  array['1 can (28oz) San Marzano tomatoes', '1 small onion, diced', '3 cloves garlic', '1/2 cup heavy cream', '2 tbsp butter', 'Fresh basil leaves', 'Salt, pepper, sugar', 'Crusty bread for serving'],
  array['Saute onion in butter until soft and translucent', 'Add garlic, cook 1 minute until fragrant', 'Pour in tomatoes with juices, season with salt, pepper, and a pinch of sugar', 'Simmer for 20 minutes, add basil leaves', 'Blend until smooth with an immersion blender', 'Stir in cream, taste and adjust seasoning', 'Serve with crusty bread or grilled cheese'],
  (select id from yumli.categories where slug = 'soup'),
  true
);

-- Snack
insert into yumli.recipes (title, description, image, prep_time, cook_time, servings, difficulty, ingredients, instructions, category_id, is_featured)
values (
  'Crispy Air Fryer Spring Rolls',
  'Golden, crunchy spring rolls with a savory veggie filling. Made in the air fryer — no deep frying needed.',
  'https://images.unsplash.com/photo-1548507200-b4d1e1ad02ef?w=800&h=600&fit=crop',
  '20 min',
  '10 min',
  8,
  'Medium',
  array['8 spring roll wrappers', '1 cup shredded cabbage', '1 carrot, julienned', '1/2 cup glass noodles, soaked', '2 cloves garlic', '1 tbsp soy sauce', '1 tsp sesame oil', 'Sweet chili sauce for dipping'],
  array['Saute garlic, cabbage, carrot, and noodles with soy sauce and sesame oil', 'Let filling cool completely', 'Place filling on a spring roll wrapper, fold and roll tightly, seal with water', 'Spray rolls with cooking oil', 'Air fry at 390F for 8-10 minutes, flipping halfway', 'Serve hot with sweet chili sauce'],
  (select id from yumli.categories where slug = 'snack'),
  false
);
