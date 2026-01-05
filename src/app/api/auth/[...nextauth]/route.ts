// src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth/auth" // auth.ts'ten handlers'ı çağırıyoruz

export const { GET, POST } = handlers // handlers içinden GET ve POST'u çıkarıyoruz