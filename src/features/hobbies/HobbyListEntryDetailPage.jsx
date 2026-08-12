import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

/**
 * Edit view for an entry on a Modifications/Wishlist/Equipment-type hobby
 * list. Maintenance-type entries are real to-dos instead and are edited
 * via TaskDetailPage (/todos/:todoId).
 */
export function HobbyListEntryDetailPage() {
  const { hobbyId, entryId } = useParams();

  return (
    <SimpleItemDetailPage
      id={entryId}
      collectionKey="hobbyListEntries"
      backTo={`/hobbies/${hobbyId}`}
      backLabel="Back"
      title="Edit List Item"
      notFoundMessage="List item not found."
    />
  );
}
