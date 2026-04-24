import PromotionSlider from '@/components/promotions/promotion-slider';
import ErrorMessage from '@/components/ui/error-message';
import { useSettings } from '@/framework/settings';
import { useType } from '@/framework/type';

/**
 * Kolshi K.4 — promotion slider.
 *
 * Legacy Pickbazar pulled `promotional_sliders` from the selected
 * `Type`. Kolshi has no per-type slider API, so the primary source is
 * the platform-settings payload (`promo.sliders`, a list of image
 * URLs). The legacy `type.promotional_sliders` field is still honoured
 * as a fallback for any template theme that still seeds it (it is
 * empty by default in Kolshi — see KOLSHI_DEFAULT_TYPE).
 *
 * The resulting list is passed through unchanged; `PromotionSlider`
 * safely handles an empty list.
 */
export default function PromotionSliders({ variables }: any) {
  const { type, error } = useType(variables.type);
  const { settings } = useSettings();

  if (error) return <ErrorMessage message={error.message} />;

  const platformSliders = (settings as any)?.promo?.sliders as
    | Array<string | { original?: string; url?: string; id?: string | number }>
    | undefined;

  const typeSliders = type?.promotional_sliders ?? [];

  const sliders = (platformSliders && platformSliders.length > 0
    ? platformSliders
    : typeSliders
  )
    .map((raw: any, idx: number) => {
      const url =
        typeof raw === 'string' ? raw : raw?.original ?? raw?.url ?? null;
      if (!url) return null;
      return {
        id: raw?.id ?? idx,
        original: url,
      };
    })
    .filter(Boolean) as Array<{ id: string | number; original: string }>;

  if (sliders.length === 0) return null;
  return <PromotionSlider sliders={sliders} />;
}
