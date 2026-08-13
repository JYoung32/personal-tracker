import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

/**
 * Labeled free-form tag input — a controlled `{value, onChange}` pair
 * built on MUI's `Autocomplete` in `multiple freeSolo` mode (chips, no
 * suggestion list, since tags are arbitrary user text with no fixed set at
 * this scale). Callers normalize `value` through `utils/tags.js`'s
 * `normalizeTags` on submit (trim, drop empties, case-insensitive dedupe)
 * — this component just collects raw input. Originally lived inline in
 * `TodoForm`; extracted so every taggable entity's form (Hobbies, Tracker
 * items, Owe/Wish to Purchase, Modifications/Wishlist/Equipment entries)
 * shares one implementation instead of duplicating this block.
 */
export function TagsInput({ id = 'tags-input', value, onChange }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        component="label"
        htmlFor={id}
        align="center"
        sx={{ display: 'block', mb: 0.5 }}
      >
        Tags (optional)
      </Typography>
      <Autocomplete
        id={id}
        multiple
        freeSolo
        options={[]}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        renderValue={(val, getItemProps) =>
          val.map((tag, index) => {
            const { key, ...chipProps } = getItemProps({ index });
            return <Chip key={key} label={tag} size="small" {...chipProps} />;
          })
        }
        renderInput={(params) => (
          <TextField {...params} variant="standard" placeholder="Type a tag, press Enter" />
        )}
      />
    </Box>
  );
}
