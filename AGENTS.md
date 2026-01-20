# AGENTS.md

This file contains development guidelines for agentic coding assistants working on this Vue 3 + TypeScript emotion diary frontend.

## Development Commands

### Build & Lint
```bash
npm run dev          # Start development server (Vite)
npm run build        # Production build (type-check + build-only)
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking (vue-tsc)
npm run lint         # ESLint with auto-fix and cache
npm run format       # Prettier formatting (src/ directory)
```

### Testing
⚠️ **No testing framework is currently configured.** This project has no test files, vitest/jest setup, or test scripts.

## Tech Stack
- **Framework**: Vue 3.5 with Composition API (`<script setup>`)
- **Language**: TypeScript ~5.9.0 with strict type checking
- **Build Tool**: Vite 7.2.4
- **State Management**: Pinia 3.0.4 (Composition API style)
- **Routing**: Vue Router 4.6.3
- **UI**: Tailwind CSS 3.4 + Reka UI 2.6 (headless components)
- **HTTP Client**: Axios 1.13.2 with request/response interceptors
- **Node**: ^20.19.0 || >=22.12.0

## Code Style Guidelines

### Imports
- Use `@/` alias for imports from src directory
- Single quotes for import statements
- Order imports: external libs → internal modules → types/components

```ts
// ✓ Correct
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { diaryApi, type Diary } from '@/api/diary';
import { Button } from '@/components/ui/button';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

// ✗ Wrong
import DiaryList from './diaryList.vue';  // Missing extension
import diaryApi from '../api/diary';     // Use @/ instead
```

### Naming Conventions

**Files & Components**
- Vue components: PascalCase (e.g., `DiaryListView.vue`, `AppHeader.vue`)
- Regular files: camelCase (e.g., `diary.ts`, `auth.ts`)

**Variables & Functions**
- Variables: camelCase (e.g., `searchKeyword`, `isLoading`)
- Functions: camelCase with verbs (e.g., `fetchDiaries`, `handleLogin`)

**Constants & Types**
- Constants: UPPER_CASE (e.g., `EMOTIONS`, `WEATHER_OPTIONS`)
- Interfaces/Types: PascalCase (e.g., `Diary`, `CreateDiaryDto`, `EmotionOption`)

### Component Structure

Use `<script setup lang="ts">` with this order:

```vue
<script setup lang="ts">
// 1. Imports
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// 2. Component/type imports
import { Button } from '@/components/ui/button';
import type { Diary } from '@/api/diary';

// 3. Setup
const router = useRouter();
const diaries = ref<Diary[]>([]);
const isLoading = ref(false);
const error = ref('');

// 4. Computed properties
const filteredDiaries = computed(() => diaries.value.filter(...));

// 5. Methods/Functions
const fetchDiaries = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    // API call
  } catch (err) {
    error.value = 'Error message';
  } finally {
    isLoading.value = false;
  }
};

// 6. Lifecycle hooks
onMounted(() => {
  fetchDiaries();
});
</script>
```

### Error Handling

Standard async pattern with error and loading refs:

```ts
const isLoading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    await api.call();
    // Success handling
  } catch (err: any) {
    console.error('Operation failed:', err);
    error.value = 'User-facing error message';
  } finally {
    isLoading.value = false;
  }
};
```

- Always use `error` ref for user-facing errors
- Always use `isLoading` ref for loading states
- Log errors with `console.error()` for debugging
- Display errors in UI with red styling (`bg-red-50 border-red-200`)

### API Patterns

All API calls go through centralized modules in `src/api/`:

```ts
// src/api/diary.ts
import api from './index';

export interface Diary { /* ... */ }
export const diaryApi = {
  create: (data: CreateDiaryDto) => api.post<Diary>('/diaries', data),
  getAll: () => api.get<Diary[]>('/diaries'),
  getOne: (id: number) => api.get<Diary>(`/diaries/${id}`),
  update: (id: number, data: Partial<CreateDiaryDto>) => api.patch<Diary>(`/diaries/${id}`, data),
  delete: (id: number) => api.delete(`/diaries/${id}`),
};
```

The axios instance in `src/api/index.ts` has:
- Request interceptor: Adds `Authorization: Bearer ${token}` header
- Response interceptor: Redirects to `/login` on 401 errors
- Base URL: `http://localhost:3000`

### State Management (Pinia)

Use Composition API style in stores:

```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string) => { /* ... */ };
  const logout = () => { /* ... */ };

  return { user, token, login, logout };
});
```

### Styling Guidelines

**Tailwind CSS**
- Use utility classes for styling
- Use `cn()` utility from `@/lib/utils` for conditional class merging

```ts
import { cn } from '@/lib/utils';

// Usage
<div :class="cn('base-classes', isActive && 'active-classes', customClass)">
```

**UI Components**
- Use Reka UI primitives with `reka-ui` package
- Component variants defined with `class-variance-authority` (cva)
- Example: `<Button variant="outline" size="sm">`

### Type Safety

- Always use `type` imports when importing types only
- Define interfaces for data structures (DTOs, responses)
- Use proper typing for ref values: `ref<string | null>(null)`
- Use optional chaining for nullable values: `authStore.user?.email`

### Constants

Define constants in `src/constants/`:

```ts
// src/constants/emotions.ts
export interface EmotionOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: EmotionOption[] = [/* ... */];
export const getEmotionOption = (value: string) => EMOTIONS.find(/* ... */);
```

### Router Guards

Use route meta for auth protection:

```ts
{
  path: '/diaries',
  meta: { requiresAuth: true },
  component: () => import('@/views/DiaryListView.vue'),
}

// In router/index.ts
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) {
    return '/login';
  }
});
```

## File Organization

```
src/
├── api/              # API modules (axios instances, interfaces)
├── components/       # Vue components
│   ├── ui/          # Reka UI components (Button, Card, etc.)
│   ├── icons/       # Icon components
│   └── *.vue        # Shared components (AppHeader, AppFooter)
├── constants/       # Constants (EMOTIONS, WEATHER_OPTIONS)
├── layouts/         # Layout components (DefaultLayout)
├── lib/            # Utilities (cn() function)
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
└── views/          # Page components
```

## ESLint & Prettier

- ESLint is configured with `@vue/eslint-config-typescript` and `vue-tsConfigs.recommended`
- Run `npm run lint` to fix issues automatically
- Run `npm run format` to format with Prettier
- No `.cursorrules` or Copilot instructions exist - follow this AGENTS.md instead
