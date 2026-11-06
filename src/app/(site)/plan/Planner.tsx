'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { estimateTripCost, locateCity, locatePlace } from '@/app/actions';
import { Icon, Spark } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { SearchSelect, type SearchOption } from '@/components/SearchSelect';
import { distanceKm, TripMap, type MapPin } from '@/components/TripMap';
import { Container, PageHeading } from '@/components/site/Container';
import { Button, Card, cx, Label } from '@/components/ui';
import { cityName, PAKISTAN_CITIES, provinceName } from '@/data/cities';
import type { Place, Price } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatRs, groupDigits, pickText } from '@/lib/format';
import type { MapPoint } from '@/lib/geocode';
import { estimateTrip, type Estimate } from '@/lib/budget';
import { LIMITS, planQuery, STYLES, type PlanInput } from '@/lib/plan';

const pill = (on: boolean) => cx('rounded-2xl border-2 font-bold transition', on ? 'border-green bg-mint text-deep' : 'border-line bg-white text-ink hover:border-green');

// Plan page: choices on the left, a sticky summary with the estimate on the right.
export function Planner({ places, prices, initial }: { places: Place[]; prices: Price[]; initial: PlanInput }) {
  const { t, lang } = useT();
  const [plan, setPlan] = useState<PlanInput>(initial);
  const update = (changes: Partial<PlanInput>) => setPlan((p) => ({ ...p, ...changes }));
  // The chosen destinations, in visiting order (there can be one or several; none while the user is changing them).
  const placeKey = plan.places.join(',');
  const picked = plan.places.map((id) => ({ id, place: places.find((p) => p.id === id) }));
  const nameOf = (id: string) => {
    const p = places.find((x) => x.id === id);
    return p ? pickText(p.name, lang) : id;
  };
  const addPlace = (id: string) => setPlan((p) => (p.places.includes(id) || p.places.length >= LIMITS.places.max ? p : { ...p, places: [...p.places, id] }));
  const removePlace = (id: string) => setPlan((p) => ({ ...p, places: p.places.filter((x) => x !== id) }));
  const movePlace = (id: string, by: -1 | 1) =>
    setPlan((p) => {
      const i = p.places.indexOf(id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= p.places.length) return p;
      const next = [...p.places];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...p, places: next };
    });

  // Options of the two search boxes: every city of Pakistan, and the Azad Kashmir places not picked yet.
  const cityOptions = useMemo<SearchOption[]>(
    () => PAKISTAN_CITIES.map((c) => ({ id: c.id, label: cityName(c.id, lang), hint: provinceName(c.province, lang), keywords: `${c.name} ${c.ur} ${c.province}` })),
    [lang],
  );
  const placeOptions = useMemo<SearchOption[]>(
    () => places.filter((p) => !placeKey.split(',').includes(p.id)).map((p) => ({ id: p.id, label: pickText(p.name, lang), hint: pickText(p.district, lang), keywords: `${p.name.en} ${p.name.ur ?? ''} ${p.name.roman ?? ''} ${p.maps_query}` })),
    [places, lang, placeKey],
  );

  // Map pins: where the starting city and each destination are. Looked up on the server (OpenStreetMap
  // search, remembered there). A destination is looked up once, the first time it is picked.
  const [fromPoint, setFromPoint] = useState<{ id: string; point: MapPoint | null } | null>(null);
  const [points, setPoints] = useState<Record<string, MapPoint | null>>({});
  const asked = useRef(new Set<string>());
  useEffect(() => {
    let outdated = false;
    locateCity(plan.city)
      .catch(() => null)
      .then((point) => !outdated && setFromPoint({ id: plan.city, point }));
    return () => {
      outdated = true;
    };
  }, [plan.city]);
  useEffect(() => {
    for (const id of placeKey ? placeKey.split(',') : []) {
      if (asked.current.has(id)) continue;
      asked.current.add(id);
      locatePlace(id)
        .catch(() => null)
        .then((point) => setPoints((all) => ({ ...all, [id]: point })));
    }
  }, [placeKey]);
  const fromName = cityName(plan.city, lang);
  const fromPin: MapPin | null = fromPoint?.id === plan.city && fromPoint.point ? { ...fromPoint.point, label: fromName } : null;
  const stops: MapPin[] = plan.places.flatMap((id, i) => {
    const point = points[id];
    return point ? [{ ...point, label: plan.places.length > 1 ? `${i + 1} · ${nameOf(id)}` : nameOf(id) }] : [];
  });
  // Straight-line distance along the route: start city → first stop → next stop…
  const route = fromPin ? [fromPin, ...stops] : stops;
  const routeKm = route.slice(1).reduce((sum, pin, i) => sum + distanceKm(route[i], pin), 0);

  // The estimate comes from Gemini and updates by itself whenever a choice changes. We wait a moment
  // after the last tap (so tapping + a few times asks once) and drop answers for outdated choices.
  const { city, days, people, style } = plan;
  const hasPlaces = plan.places.length > 0;
  const key = `${city}|${placeKey}|${days}|${people}|${style}`;
  const [ai, setAi] = useState<{ key: string; estimate: Estimate | null } | null>(null);
  useEffect(() => {
    if (!placeKey) return;
    let outdated = false;
    const timer = setTimeout(() => {
      estimateTripCost({ city, places: placeKey.split(','), days, people, style })
        .catch(() => null)
        .then((result) => {
          if (!outdated) setAi({ key, estimate: result });
        });
    }, 500);
    return () => {
      outdated = true;
      clearTimeout(timer);
    };
  }, [key, city, placeKey, days, people, style]);
  const estimating = hasPlaces && ai?.key !== key;
  // If Gemini isn't available, fall back to the price list (first destination only, and only cities with prices set).
  const estimate: Estimate | null = !hasPlaces ? null : ai?.key === key && ai.estimate ? ai.estimate : estimateTrip(plan, picked[0].place, prices);
  const nights = Math.max(plan.days - 1, 0);
  const splitLabels = { transport: t('trip.transport'), stay: t('trip.stay', { nights }), food: t('trip.food'), extras: t('trip.extras') } as const;

  return (
    <Container>
      <PageHeading title={t('planner.title')} subtitle={t('planner.subtitle')} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Section label={t('planner.from')}>
            <SearchSelect
              label={t('planner.from')}
              options={cityOptions}
              value={plan.city}
              onChange={(city) => update({ city })}
              placeholder={t('planner.searchCity')}
              emptyText={t('planner.noMatch')}
              rtl={lang === 'ur'}
            />
          </Section>

          <Section label={t('planner.to')}>
            {picked.length > 0 && (
              <ol className="flex flex-wrap gap-2">
                {picked.map(({ id }, i) => (
                  <li key={id} className="flex items-center gap-0.5 rounded-full border-2 border-green bg-mint py-1 ps-3 pe-1 text-sm font-bold text-deep">
                    {picked.length > 1 && <span className="latin me-1.5 text-xs opacity-70">{i + 1}</span>}
                    <span className="me-1">{nameOf(id)}</span>
                    {picked.length > 1 && (
                      <>
                        <ChipButton label={`${t('planner.earlier')}: ${nameOf(id)}`} disabled={i === 0} onClick={() => movePlace(id, -1)}>
                          <Icon name="back" size={14} className="text-current" />
                        </ChipButton>
                        <ChipButton label={`${t('planner.later')}: ${nameOf(id)}`} disabled={i === picked.length - 1} onClick={() => movePlace(id, 1)}>
                          <Icon name="chev" size={14} className="text-current" />
                        </ChipButton>
                      </>
                    )}
                    <ChipButton label={`${t('planner.remove')}: ${nameOf(id)}`} onClick={() => removePlace(id)}>
                      <span aria-hidden className="latin text-base leading-none">
                        ×
                      </span>
                    </ChipButton>
                  </li>
                ))}
              </ol>
            )}
            {picked.length < LIMITS.places.max ? (
              <SearchSelect
                label={t('planner.to')}
                options={placeOptions}
                value=""
                onChange={addPlace}
                placeholder={picked.length > 0 ? t('planner.addAnother') : t('planner.searchPlace')}
                emptyText={t('planner.noMatch')}
                rtl={lang === 'ur'}
              />
            ) : null}
            <p className="text-xs text-muted">{picked.length >= LIMITS.places.max ? t('planner.maxPlaces', { max: LIMITS.places.max }) : t('planner.upTo', { max: LIMITS.places.max })}</p>
          </Section>

          <Section label={t('planner.map')}>
            <TripMap from={fromPin} stops={stops} label={t('planner.map')} />
            {route.length > 1 && <p className="text-xs text-muted">{t('planner.straightLine', { km: groupDigits(Math.round(routeKm / 10) * 10) })}</p>}
          </Section>

          <div className="grid gap-5 sm:grid-cols-2">
            <Stepper label={t('planner.days')} value={plan.days} onChange={(days) => update({ days })} {...LIMITS.days} />
            <Stepper label={t('planner.travellers')} value={plan.people} onChange={(people) => update({ people })} {...LIMITS.people} />
          </div>

          <Section label={t('planner.style')}>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map((s) => (
                <button key={s} type="button" aria-pressed={plan.style === s} onClick={() => update({ style: s })} className={cx('flex min-h-18 flex-col items-center justify-center gap-0.5 py-2', pill(plan.style === s))}>
                  <span>{t(`planner.styles.${s}`)}</span>
                  <span className="text-xs font-medium opacity-85">{t(`planner.styleSubs.${s}`)}</span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4 rounded-3xl bg-deep p-6 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-on-deep-muted">{hasPlaces ? plan.places.map(nameOf).join(' + ') : t('planner.pickPlace')}</span>
              <span className="text-sm text-on-deep-muted">
                {t('trip.meta', { city: fromName, people: plan.people, style: t(`planner.styles.${plan.style}`) })} · {t('common.daysCount', { count: plan.days })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-on-deep-muted">{t('planner.total')}</span>
              {!hasPlaces ? (
                <span className="text-xl font-extrabold">{t('planner.pickPlace')}</span>
              ) : estimating ? (
                <span role="status" className="animate-pulse text-xl font-extrabold">
                  {t('planner.estimating')}
                </span>
              ) : estimate ? (
                <>
                  <span className="text-4xl font-extrabold tracking-tight">{formatRs(estimate.total, lang)}</span>
                  <span className="text-sm text-on-deep-muted">{t('planner.perPerson', { amount: formatRs(estimate.perPerson, lang) })}</span>
                </>
              ) : (
                <span className="text-xl font-extrabold">{t('common.priceNotSet')}</span>
              )}
            </div>
            {!estimating && estimate && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {(Object.keys(splitLabels) as (keyof typeof splitLabels)[]).map((k) => (
                  <div key={k}>
                    <dt className="text-xs text-on-deep-muted">{splitLabels[k]}</dt>
                    <dd className="text-[15px] font-bold">{formatRs(estimate.split[k], lang)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {!estimating && <EstimatedNote lastChecked={estimate?.lastChecked ?? null} ai={estimate?.source === 'ai'} className="text-on-deep-muted" />}
            {!estimating && estimate?.note && <p className="text-xs text-on-deep-muted">{estimate.note}</p>}
            {hasPlaces ? (
              <Button href={`/trip?${planQuery(plan)}`} leading={<Spark size={18} />} variant="light">
                {t('planner.build')}
              </Button>
            ) : (
              <Button disabled leading={<Spark size={18} />} variant="light">
                {t('planner.build')}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
}

// Small round button inside a destination chip (move earlier / later, remove).
function ChipButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Label>{label}</Label>
      {children}
    </Card>
  );
}

// Card with − value + (days and travellers).
function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const { t } = useT();
  const square = 'latin flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg text-2xl font-bold text-deep transition hover:border-green disabled:opacity-40';
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Label>{label}</Label>
      <div className="flex items-center justify-between">
        <button type="button" className={square} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${t('planner.fewer')} ${label}`}>
          −
        </button>
        <span className="latin text-3xl font-extrabold" aria-live="polite">
          {value}
        </span>
        <button type="button" className={square} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${t('planner.more')} ${label}`}>
          +
        </button>
      </div>
    </Card>
  );
}
