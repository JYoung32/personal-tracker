import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

/**
 * Edit view for a Garage-page-level wishlist item (not tied to a specific
 * vehicle — see GarageWishlistDetailPage for the per-vehicle version).
 */
export function GarageWishlistItemDetailPage() {
  const { wishId } = useParams();

  return (
    <SimpleItemDetailPage
      id={wishId}
      collectionKey="garageWishlist"
      backTo="/garage"
      backLabel="Garage"
      title="Edit Wishlist Item"
      notFoundMessage="Wishlist item not found."
    />
  );
}
