import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

/**
 * Edit view for an Armory-page-level wishlist item (not tied to a specific
 * firearm — see ArmoryWishlistDetailPage for the per-item version).
 */
export function ArmoryWishlistItemDetailPage() {
  const { wishId } = useParams();

  return (
    <SimpleItemDetailPage
      id={wishId}
      collectionKey="armoryWishlist"
      backTo="/armory"
      backLabel="Armory"
      title="Edit Wishlist Item"
      notFoundMessage="Wishlist item not found."
    />
  );
}
