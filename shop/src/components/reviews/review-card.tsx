/**
 * Review card — Kolshi I.1 adaptation.
 *
 * Kolshi-native review shape adds:
 *   - `helpfulCount` / `notHelpfulCount` / `currentUserVote` → mapped
 *     onto the legacy "feedback" UI (like / dislike). Voting posts to
 *     `POST /reviews/{id}/vote` via `useVoteReview` and is idempotent;
 *     the same vote cast twice is ignored by the backend.
 *   - `imageUrls` (string[]) → rendered as the review photo strip. The
 *     legacy `photos` Attachment[] is still honoured for backward
 *     compatibility.
 *   - `isVerifiedPurchase` → shows the checkmark next to the name when
 *     the Kolshi DTO confirms the reviewer purchased the product.
 *   - `customerName` → displayed as the reviewer name (falls back to
 *     the legacy `user.name`).
 *   - `response` (ReviewResponseDTO) → rendered inline below the review
 *     as a read-only shop-owner reply. Kolshi has no public endpoint
 *     for customers to reply to a shop owner response, so there are
 *     no actions on this surface.
 *
 * Removed surfaces:
 *   - "Report abuse" menu (I.6 Delete — Kolshi has no abuse endpoint).
 */
import cn from 'classnames';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import Rating from '@/components/ui/rating-badge';
import { Image } from '@/components/ui/image';
import { CheckedIcon } from '@/components/icons/checked';
import { LikeIcon } from '@/components/icons/like-icon';
import { DislikeIcon } from '@/components/icons/dislike-icon';
import { productPlaceholder } from '@/lib/placeholders';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useUser } from '@/framework/user';
import type { Review } from '@/types';
import { useRemoveReviewVote, useVoteReview } from '@/framework/review';

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const { isAuthorized } = useUser();
  const { voteReview } = useVoteReview(review?.productId);
  const { removeVote } = useRemoveReviewVote(review?.productId);

  const {
    id,
    comment,
    rating,
    created_at,
    user,
    customerName,
    isVerifiedPurchase,
    helpfulCount,
    notHelpfulCount,
    currentUserVote,
    imageUrls,
    photos,
    response,
    positive_feedbacks_count,
    negative_feedbacks_count,
  } = review;

  const displayName = customerName ?? user?.name ?? t('text-anonymous');
  const likeCount = helpfulCount ?? positive_feedbacks_count ?? 0;
  const dislikeCount = notHelpfulCount ?? negative_feedbacks_count ?? 0;
  const didVoteHelpful = currentUserVote === 'HELPFUL';
  const didVoteNotHelpful = currentUserVote === 'NOT_HELPFUL';

  const galleryImages = buildGalleryImages(imageUrls, photos);

  const handleVote = (voteType: 'HELPFUL' | 'NOT_HELPFUL') => {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    const alreadySelected =
      (voteType === 'HELPFUL' && didVoteHelpful) ||
      (voteType === 'NOT_HELPFUL' && didVoteNotHelpful);

    if (alreadySelected) {
      removeVote(id);
      return;
    }
    voteReview({ reviewId: id, voteType });
  };

  const handleImageClick = (idx: number) => {
    openModal('REVIEW_IMAGE_POPOVER', {
      images: galleryImages,
      initSlide: idx,
    });
  };

  return (
    <div className="border-t border-border-200 border-opacity-70 py-7 first:border-t-0">
      <Rating rating={rating} className="mb-2.5" />
      <div className="mb-4 flex items-center text-xs text-gray-500">
        {t('text-by')}{' '}
        <span className="capitalize ltr:ml-1 rtl:mr-1">{displayName}</span>
        {isVerifiedPurchase ? (
          <CheckedIcon className="h-[13px] w-[13px] text-gray-700 ltr:ml-1 rtl:mr-1" />
        ) : null}
      </div>
      <p className="text-base leading-7 text-heading">{comment}</p>

      <div className="space-s-2 flex items-start pt-3 flex-wrap">
        {galleryImages.map((photo, idx) => (
          <div
            className="m-1.5 cursor-pointer"
            key={photo.id}
            onClick={() => handleImageClick(idx)}
          >
            <Image
              src={photo.thumbnail ?? photo.original ?? productPlaceholder}
              alt={displayName ?? ''}
              width={80}
              height={80}
              className="inline-flex rounded-md bg-gray-200 object-contain"
            />
          </div>
        ))}
      </div>

      {response ? (
        <div className="mt-4 rounded-md bg-gray-50 p-4 border border-gray-100">
          <div className="mb-1 flex items-center text-xs font-semibold text-gray-600">
            <span className="uppercase tracking-wide">
              {t('text-shop-owner-response') ?? 'Shop owner response'}
            </span>
            {response.shopOwnerName ? (
              <span className="ml-2 font-normal text-gray-500">
                {`— ${response.shopOwnerName}`}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-heading whitespace-pre-line">
            {response.responseText}
          </p>
          {response.createdAt ? (
            <div className="mt-2 text-[11px] text-gray-400">
              {dayjs(response.createdAt).format('MMMM D, YYYY')}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="mt-3.5 text-xs text-gray-400">
          {t('text-date')}: {dayjs(created_at).format('MMMM D, YYYY')}
        </div>
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <button
            className="flex items-center text-xs tracking-wider text-gray-400 transition hover:text-accent"
            onClick={() => handleVote('HELPFUL')}
            aria-pressed={didVoteHelpful}
          >
            <LikeIcon
              className={cn('h-4 w-4 ltr:mr-1.5 rtl:ml-1.5', {
                'text-accent': didVoteHelpful,
              })}
            />
            {likeCount}
          </button>
          <button
            className="flex items-center text-xs tracking-wider text-gray-400 transition hover:text-accent"
            onClick={() => handleVote('NOT_HELPFUL')}
            aria-pressed={didVoteNotHelpful}
          >
            <DislikeIcon
              className={cn('h-4 w-4 ltr:mr-1.5 rtl:ml-1.5', {
                'text-accent': didVoteNotHelpful,
              })}
            />
            {dislikeCount}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Merges Kolshi's `imageUrls: string[]` with the legacy
 * `photos: Attachment[]` into a single display list. Kolshi-native
 * URLs win when both are present.
 */
function buildGalleryImages(
  imageUrls: string[] | undefined,
  photos: Review['photos'],
): Array<{ id: string | number; original?: string; thumbnail?: string }> {
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    return imageUrls.map((url, idx) => ({
      id: `kolshi-${idx}`,
      original: url,
      thumbnail: url,
    }));
  }
  return (photos ?? []).map((photo) => ({
    id: photo.id ?? `${photo.thumbnail ?? photo.original}`,
    original: photo.original,
    thumbnail: photo.thumbnail,
  }));
}
