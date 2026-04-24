/**
 * Review submission form — Kolshi I.1.
 *
 * Kolshi accepts `{ productId, rating, comment, orderId?, imageUrls? }`
 * and caps `imageUrls` at three entries. There is no backend concept
 * of "review a variation", so the `variation_option_id` leg of the
 * legacy payload is dropped. Photo uploads are handled through
 * Cloudinary earlier in the pipeline (FileInput → useCloudinaryUpload)
 * and arrive here as attachments whose `original` URL is forwarded as
 * `imageUrls` inside `toKolshiReviewPayload`.
 */
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Button from '@/components/ui/button';
import { useModalState } from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { Image } from '@/components/ui/image';
import FileInput from '@/components/ui/forms/file-input';
import RateInput from '@/components/ui/forms/rate-input';
import Label from '@/components/ui/forms/label';
import TextArea from '@/components/ui/forms/text-area';
import { useCreateReview, useUpdateReview } from '@/framework/review';
import type { CreateReviewInput } from '@/types';

const MAX_REVIEW_IMAGES = 3;

const reviewFormSchema = yup.object().shape({
  rating: yup
    .number()
    .min(1, 'error-rating-required')
    .max(5, 'error-rating-range')
    .required('error-rating-required'),
  comment: yup.string().required('error-comment-required'),
  photos: yup
    .array()
    .max(MAX_REVIEW_IMAGES, 'error-too-many-review-images'),
});

type ReviewFormValues = Pick<CreateReviewInput, 'rating' | 'comment' | 'photos'>;

export default function ReviewForm() {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { createReview, isLoading: creating } = useCreateReview();
  const { updateReview, isLoading: updating } = useUpdateReview();

  const onSubmit = (values: ReviewFormValues) => {
    const photos = (values.photos ?? []).slice(0, MAX_REVIEW_IMAGES).map(
      // drop GraphQL `__typename` leakage that persists in reused legacy
      // form state.
      ({ __typename, ...rest }: any) => rest,
    );

    const basePayload: CreateReviewInput = {
      product_id: data.product_id,
      order_id: data.order_id,
      rating: values.rating,
      comment: values.comment,
      photos,
    };

    if (data?.my_review?.id) {
      updateReview({ ...basePayload, id: data.my_review.id });
      return;
    }
    createReview(basePayload);
  };

  return (
    <div className="flex h-full min-h-screen w-screen flex-col justify-center bg-light md:h-auto md:min-h-0 md:max-w-[590px] md:rounded-xl">
      <div className="flex items-center border-b border-border-200 p-7">
        <div className="flex shrink-0">
          <Image
            src={data?.image?.thumbnail ?? '/'}
            alt={data?.name}
            width={90}
            height={90}
            className="inline-flex rounded bg-gray-200"
          />
        </div>
        <div className="ltr:pl-6 rtl:pr-6">
          <h3 className="mb-2 text-base font-semibold leading-[1.65em] text-heading">
            {data?.name}
          </h3>
        </div>
      </div>
      <div className="p-7">
        <Form<ReviewFormValues>
          onSubmit={onSubmit}
          validationSchema={reviewFormSchema}
          useFormProps={{
            defaultValues: {
              rating: data?.my_review?.rating ?? 0,
              comment: data?.my_review?.comment ?? '',
              photos: data?.my_review?.photos ?? [],
            },
          }}
        >
          {({ register, control, formState: { errors } }) => (
            <>
              <div className="mb-5">
                <Label className="mb-2">{t('text-give-ratings')}</Label>
                <div className="w-auto">
                  <RateInput
                    control={control}
                    name="rating"
                    defaultValue={0}
                    style={{ fontSize: 30 }}
                    allowClear={false}
                  />
                </div>
                {errors.rating?.message ? (
                  <p className="mt-2 text-xs text-red-500">
                    {t(errors.rating.message)}
                  </p>
                ) : null}
              </div>

              <TextArea
                label={t('text-description')}
                {...register('comment')}
                variant="outline"
                className="mb-5"
                error={t(errors.comment?.message!)}
              />

              <div className="mb-8">
                <Label htmlFor="photos">
                  {t('text-upload-images')}{' '}
                  <span className="text-xs text-gray-400">
                    ({t('text-max-images', { count: MAX_REVIEW_IMAGES })})
                  </span>
                </Label>
                <FileInput control={control} name="photos" multiple={true} />
                {errors.photos?.message ? (
                  <p className="mt-2 text-xs text-red-500">
                    {t(errors.photos.message as string)}
                  </p>
                ) : null}
              </div>

              <div className="mt-8">
                <Button
                  className="h-11 w-full sm:h-12"
                  loading={creating || updating}
                  disabled={creating || updating}
                >
                  {t('text-submit')}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
