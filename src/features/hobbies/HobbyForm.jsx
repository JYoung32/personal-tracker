import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from '../../components/common/FormActions';
import { TagsInput } from '../../components/common/TagsInput';
import { normalizeTags } from '../../utils/tags';

/**
 * Form for adding or editing a hobby. Calls onSubmit({ name, description, tags }). In "add" mode
 * (no initialValues) it clears itself after submit; pass initialValues (an existing hobby)
 * to prefill for editing.
 */
export function HobbyForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [tags, setTags] = useState(initialValues?.tags ?? []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onSubmit({ name: trimmed, description: description.trim() || null, tags: normalizeTags(tags) });
    if (!initialValues) {
      setName('');
      setDescription('');
      setTags([]);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="hobby-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Hobby name
        </Typography>
        <TextField
          id="hobby-name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="hobby-description"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Description (optional)
        </Typography>
        <TextField
          id="hobby-description"
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <TagsInput id="hobby-tags" value={tags} onChange={setTags} />

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
