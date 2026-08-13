import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

/**
 * Edit view for an entry on a Modifications/Wishlist/Equipment-type
 * tracker item list. Maintenance-type entries are real to-dos instead and
 * are edited via TaskDetailPage (/todos/:todoId) — same split as
 * HobbyListEntryDetailPage, which this mirrors.
 */
export function TrackerItemListEntryDetailPage() {
  const { typeId, itemId, entryId } = useParams();

  return (
    <SimpleItemDetailPage
      id={entryId}
      collectionKey="trackerItemListEntries"
      backTo={`/trackers/${typeId}/${itemId}`}
      backLabel="Back"
      title="Edit List Item"
      notFoundMessage="List item not found."
    />
  );
}
