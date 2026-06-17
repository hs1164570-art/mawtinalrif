# 🏡 موطن الريف — Admin Dashboard Setup

## 📁 File Placement Map

```
your-project/
└── app/
    ├── providers.tsx                          ← NEW (wrap root layout)
    └── admin/
        ├── layout.tsx                         ← NEW
        ├── page.tsx                           ← NEW (dashboard)
        ├── types.ts                           ← NEW (shared types)
        ├── _components/
        │   ├── AdminSidebar.tsx               ← NEW
        │   ├── AdminHeader.tsx                ← NEW
        │   └── CommandMenu.tsx                ← NEW
        ├── products/
        │   ├── page.tsx                       ← NEW (server)
        │   └── _components/
        │       ├── ProductsClient.tsx         ← NEW
        │       ├── ProductFormDrawer.tsx      ← NEW
        │       └── ImageUploader.tsx          ← NEW
        ├── categories/
        │   ├── page.tsx                       ← NEW (server)
        │   └── _components/
        │       ├── CategoriesClient.tsx       ← NEW
        │       └── CategoryFormDialog.tsx     ← NEW
        ├── orders/
        │   ├── page.tsx                       ← NEW (server)
        │   └── _components/
        │       ├── OrdersClient.tsx           ← NEW
        │       └── OrderStatusModal.tsx       ← NEW
        └── users/
            ├── page.tsx                       ← NEW (server)
            └── _components/
                └── UsersClient.tsx            ← NEW
```

---

## 📦 Install Dependencies

```bash
npm install cmdk vaul nuqs react-dropzone browser-image-compression next-cloudinary
```

All other dependencies (framer-motion, @tanstack/react-query, react-hook-form,
@hookform/resolvers, zod, sonner, lucide-react) are already in your package.json.

---

## 🔑 Environment Variables (.env.local)

```env
# App URL (required for server-side prefetch)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Create Cloudinary Upload Preset:

1. Go to Cloudinary Dashboard → Settings → Upload
2. Add Upload Preset → Set to **Unsigned**
3. Set folder to `mawtin-elrif`
4. Copy the preset name to `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

## 🔌 Root Layout Integration

Update `app/layout.tsx` to use the Providers:

```tsx
import { Providers } from "./providers";
import { Cairo } from "next/font/google";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🛡️ Middleware (Protect /admin routes)

Add to your `middleware.ts`:

```ts
import { auth } from "@/auth"; // your next-auth setup

export default auth((req) => {
  const isAdmin = req.auth?.user?.role === "ADMIN";
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 🔗 API Route Mapping

The admin dashboard calls these endpoints:

| Feature         | Method            | Route                       |
| --------------- | ----------------- | --------------------------- |
| Products list   | GET               | `/api/products`             |
| Product CRUD    | POST/PATCH/DELETE | `/api/products`             |
| Categories list | GET               | `/api/categories`           |
| Category CRUD   | POST/PATCH/DELETE | `/api/admin/categories`     |
| Orders list     | GET               | `/api/products/order`       |
| Order status    | PATCH             | `/api/products/order`       |
| Order stats     | GET               | `/api/products/order/stats` |
| Users list      | GET               | `/api/users/details`        |
| User status     | PATCH             | `/api/users/details`        |
| User stats      | GET               | `/api/products/user/stats`  |

> ⚠️ Double-check these routes match your actual file structure.
> Update the fetch URLs in each `_components/` file if needed.

---

## 🧹 Tailwind v4 Custom Colors

Add to your `app/globals.css`:

```css
@theme {
  --color-gold: #b89a5a;
  --color-espresso: #3d2b1f;
  --color-brown: #6b4c3b;
  --color-cream: #f5efe6;
  --color-border: #ede5d8;
  --color-sage: #6a9e7f;
  --color-terra: #c4614a;
  --color-dusty: #7a9bbf;
}
```

---

## ✅ Feature Checklist

- [x] RTL Arabic layout with Cairo font
- [x] Animated sidebar (collapse / expand / mobile drawer)
- [x] Global command menu `⌘K` with cmdk
- [x] Products table with filters, search, sort, pagination
- [x] Low stock alerts banner (< 10 units)
- [x] Add/Edit product drawer with vaul
- [x] Image upload: react-dropzone → compress → Cloudinary
- [x] Gallery upload (up to 10 images)
- [x] Auto-slug generation from product name
- [x] Profit preview (price - costPrice)
- [x] Categories tree: root → subcategories
- [x] Add root category with image upload
- [x] Add subcategory to existing root
- [x] Delete with cascade warning
- [x] Orders table with expandable rows
- [x] Order status filter tabs with counts
- [x] Search orders by ID or email
- [x] Status update modal with all options
- [x] Users table with search, role, status filters
- [x] Ban / Unban users with confirmation
- [x] TanStack Query server prefetch + HydrationBoundary
- [x] nuqs URL-based state (search, filters, pagination)
- [x] Sonner toast notifications
- [x] Framer Motion animations throughout
- [x] Fully responsive (mobile sidebar overlay)
- [x] Accessible (aria-label, aria-expanded, aria-pressed)
