import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'pdf-uploads',
  access: (allow) => ({
    'uploads/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
