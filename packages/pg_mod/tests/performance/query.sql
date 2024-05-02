set local role authenticated;
set local dt.user_id to 30;

EXPLAIN (ANALYZE, TIMING FALSE, FORMAT JSON) SELECT * FROM public.folders limit 10;
