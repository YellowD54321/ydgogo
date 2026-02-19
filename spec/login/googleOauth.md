# Google OAuth 登入設計規格

## 1. 設計目標

- 使用 Google 官方登入按鈕（`@react-oauth/google`），不自行刻 UI
- 註冊與登入共用同一顆按鈕，前端自動判斷流程
- 登入成功後取得 JWT Token，儲存於 localStorage
- 棋盤頁不需登入即可使用，登入僅提供使用者資訊
- 已登入使用者造訪 `/login` 時自動導回首頁

## 2. 後端 API

兩個端點皆接收 `{ idToken: string }`，由 Google ID Token 驗證身份。

### POST /login/googleOauth

成功回應（200）：

```json
{
  "message": "Login successful",
  "user": { "userId": "uuid", "email": "user@example.com" },
  "token": "JWT_TOKEN"
}
```

錯誤回應：
- 400：缺少 request body / JSON 格式錯誤 / 缺少 idToken
- 401：Google Token 驗證失敗
- 404：使用者未註冊
- 500：伺服器內部錯誤

### POST /register/googleOauth

成功回應（201）：

```json
{
  "message": "User registered successfully",
  "user": { "userId": "uuid", "email": "user@example.com", "createdAt": "ISO8601" }
}
```

錯誤回應：
- 400：缺少 idToken
- 409：使用者已存在
- 500：伺服器內部錯誤

## 3. 常量配置

`src/constants/authConfig.ts`：

```typescript
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'ydgogo_token',
  USER: 'ydgogo_user',
} as const;
```

環境變數（`.env`）：

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:3000
```

## 4. API 服務層

### 4.1 介面定義

```typescript
// src/services/api/authApi.ts

export interface UserInfo {
  userId: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: UserInfo;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: UserInfo & { createdAt: string };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 4.2 API 函式

```typescript
export function googleLogin(idToken: string): Promise<LoginResponse>;
export function googleRegister(idToken: string): Promise<RegisterResponse>;
export async function googleLoginOrRegister(idToken: string): Promise<LoginResponse>;
```

### 4.3 自動登入/註冊流程

`googleLoginOrRegister` 封裝了核心邏輯：

1. 呼叫 `googleLogin(idToken)`
2. 若成功（200）→ 回傳 `LoginResponse`
3. 若失敗且 status 為 404 → 呼叫 `googleRegister(idToken)` → 再呼叫 `googleLogin(idToken)`
4. 其他錯誤直接拋出

## 5. Auth 狀態管理

沿用專案既有的 Context + Hook 模式。

### 5.1 AuthContext

```typescript
// src/contexts/AuthContext.ts

export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}
```

### 5.2 AuthProvider

```typescript
// src/contexts/AuthProvider.tsx
```

- 初始化時從 `localStorage` 還原 `token` 和 `user`
- `login(token, user)`：寫入 localStorage 並更新 state
- `logout()`：清除 localStorage 並重置 state
- 使用 `useMemo` 避免不必要的 re-render

### 5.3 useAuth Hook

```typescript
// src/hooks/useAuth.ts

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 6. 登入頁面

### 6.1 元件設計

```typescript
// src/pages/LoginPage.tsx
```

- 使用 `@react-oauth/google` 的 `GoogleLogin` 元件渲染官方按鈕
- 使用 TanStack Query 的 `useMutation` 管理 API 請求狀態
- `onSuccess`：取得 `credential`（ID Token），呼叫 `googleLoginOrRegister`
- 成功後呼叫 `auth.login()` 儲存 JWT，並用 `router.navigate({ to: '/' })` 導向首頁
- 載入中顯示 `CircularProgress` 並隱藏按鈕
- 錯誤時顯示 `Alert`

## 7. 路由設定

使用 TanStack Router 的 code-based routing。

### 7.1 路由結構

```typescript
// src/router.tsx

rootRoute        → Outlet（無 layout）
├── indexRoute   → / → NewGamePage（無認證限制）
└── loginRoute   → /login → LoginPage（已登入 redirect 到 /）
```

### 7.2 路由守衛

```typescript
// login route 的 beforeLoad
beforeLoad: ({ context }) => {
  if (context.auth.isAuthenticated) {
    throw redirect({ to: '/' });
  }
}
```

### 7.3 Router Context

透過 `createRootRouteWithContext<RouterContext>()` 注入 `auth` context，讓 `beforeLoad` 可存取認證狀態。在 `main.tsx` 中透過 `InnerApp` 元件將 `useAuth()` 的值傳入 `RouterProvider`。

### 7.4 型別安全

```typescript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

## 8. Provider 層級結構

```typescript
// src/main.tsx

<StrictMode>
  <GoogleOAuthProvider>      // Google OAuth SDK
    <QueryClientProvider>     // TanStack Query
      <AuthProvider>          // 認證狀態
        <InnerApp />          // RouterProvider + auth context 注入
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
</StrictMode>
```

## 9. 檔案清單

| 檔案 | 類型 | 說明 |
|------|------|------|
| `src/constants/authConfig.ts` | 新增 | localStorage key 常量 |
| `src/services/api/authApi.ts` | 新增 | 後端 API 呼叫封裝 |
| `src/contexts/AuthContext.ts` | 新增 | Auth Context 定義 |
| `src/contexts/AuthProvider.tsx` | 新增 | Auth 狀態管理 Provider |
| `src/hooks/useAuth.ts` | 新增 | Auth Hook |
| `src/pages/LoginPage.tsx` | 新增 | 登入頁面 |
| `src/pages/NewGamePage.tsx` | 新增 | 從 App.tsx 搬出的棋盤頁 |
| `src/router.tsx` | 新增 | TanStack Router 路由設定 |
| `src/main.tsx` | 修改 | Provider 層級與 RouterProvider |
| `src/App.tsx` | 刪除 | 功能移至 router 和 pages |
| `.env` | 新增 | 環境變數 |
| `.gitignore` | 修改 | 加入 .env 忽略規則 |

## 10. 測試策略

### API 服務層

- `googleLogin` 成功回傳 LoginResponse
- `googleLogin` 回傳 404 時拋出 ApiError
- `googleRegister` 成功回傳 RegisterResponse
- `googleRegister` 回傳 409 時拋出 ApiError
- `googleLoginOrRegister` 成功直接登入
- `googleLoginOrRegister` 404 時自動註冊再登入

### AuthProvider

- 初始化時從 localStorage 還原狀態
- `login()` 寫入 localStorage 並更新 isAuthenticated
- `logout()` 清除 localStorage 並重置狀態
- localStorage 為空或損壞時 gracefully 回到未登入狀態

### LoginPage

- 顯示 Google 登入按鈕
- 登入中顯示 loading 狀態
- 登入失敗顯示錯誤訊息
- 登入成功後導向首頁

### 路由

- 未登入可正常進入 `/`
- 已登入造訪 `/login` 導回 `/`
- 未登入可正常進入 `/login`
