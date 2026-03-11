import { defineConfig } from 'orval';

export default defineConfig({
  pina: {
    input: {
      target: 'http://localhost:3000/swagger-json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/api/endpoints',
      schemas: './lib/api/model',
      client: 'react-query',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './lib/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
