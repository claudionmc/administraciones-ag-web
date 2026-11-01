begin;

-- Optional evidence for a full payout/reset at the investment start.
-- These payments settled interest earned before (or on) that start date.
-- They are NOT payments against interest accruing in the current investment.
-- NULL means unknown; existing snapshots and balances remain unchanged.
alter table public.valorizaciones_inversiones
  add column intereses_pagados_al_reinicio numeric
    check (intereses_pagados_al_reinicio >= 0
      and intereses_pagados_al_reinicio < 'Infinity'::numeric
      and intereses_pagados_al_reinicio = round(intereses_pagados_al_reinicio)),
  add column intereses_ganados_historicos numeric generated always as
    (intereses_pagados_al_reinicio + interes_acumulado) stored;

-- Existing table SELECT grants and own-active-account RLS cover both columns.
-- No new writes are granted to clients. No personal data in this migration.
comment on column public.valorizaciones_inversiones.intereses_pagados_al_reinicio is
  'Intereses anteriores totalmente pagados al reinicio; no deducir del cierre actual. NULL: desconocidos.';
comment on column public.valorizaciones_inversiones.intereses_ganados_historicos is
  'Intereses anteriores pagados al reinicio más intereses acumulados del período actual; no es capital ni saldo.';

commit;
