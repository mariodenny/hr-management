# 🚀 HR Management API

**Tech stack:** Next.js (App Router) + Tailwind + PostgreSQL (Prisma) + JWT

---

## 📌 Environment Variables

Buat file `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME"
JWT_SECRET="yoursecret"
WORK_START_HOUR=8
```

---

## 📂 Struktur API

| Endpoint                         | Method | Role        | Deskripsi                    |
| -------------------------------- | ------ | ----------- | ---------------------------- |
| `/api/auth/login`                | POST   | HR/Employee | Login, dapatkan JWT token    |
| `/api/employee`                  | POST   | HR          | Buat karyawan baru           |
| `/api/employee`                  | GET    | HR          | List semua karyawan          |
| `/api/employee/[id]`             | GET    | HR          | Get detail karyawan by ID    |
| `/api/employee/[id]`             | PATCH  | HR          | Update data karyawan         |
| `/api/employee/profile/password` | PATCH  | Employee    | Update password sendiri      |
| `/api/attendance`                | POST   | Employee    | Karyawan absen               |
| `/api/attendance/all`            | GET    | HR          | Lihat absensi semua karyawan |
| `/api/leave`                     | POST   | Employee    | Ajukan cuti                  |
| `/api/leave/manage`              | GET    | HR          | Lihat semua request cuti     |
| `/api/leave/manage`              | PATCH  | HR          | Setujui/Tolak cuti           |
| `/api/salary`                    | POST   | HR          | Input gaji karyawan          |
| `/api/salary/mine`               | GET    | Employee    | Lihat gaji sendiri           |

---

## 🔑 **Auth**

* Pakai JWT Bearer Token di header:

  ```
  Authorization: Bearer <token>
  ```

---

## ✅ **Endpoints Detail**

### `POST /api/auth/login`

Login sebagai HR atau Employee.

**Body:**

```json
{
  "username": "johndoe",
  "password": "123456"
}
```

**Response:**

```json
{
  "token": "<jwt_token>"
}
```

---

### `POST /api/employee`

Buat karyawan baru (HR only).

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "position": "Staff",
  "division": "Finance",
  "username": "johndoe",
  "password": "123456"
}
```

---

### `GET /api/employee`

List semua karyawan (HR only).

---

### `GET /api/employee/[id]`

Detail 1 karyawan by ID (HR only).

---

### `PATCH /api/employee/[id]`

Update data karyawan (HR only).

**Body:**

```json
{
  "id": 1,
  "name": "New Name",
  "email": "new@example.com",
  "position": "Manager",
  "division": "HR"
}
```

---

### `PATCH /api/employee/profile/password`

Update password sendiri (Employee).

**Body:**

```json
{
  "newPassword": "newpass123"
}
```

---

### `POST /api/attendance`

Employee absen.

**Body:**

```json
{
  "location": "Jakarta"
}
```

✅ **`status` dihitung otomatis di backend.**

---

### `GET /api/attendance/all`

List absensi semua karyawan (HR).

---

### `POST /api/leave`

Ajukan cuti (Employee).

**Body:**

```json
{
  "startDate": "2025-07-01",
  "endDate": "2025-07-05",
  "reason": "Family event"
}
```

---

### `GET /api/leave/manage`

List semua request cuti (HR).

---

### `PATCH /api/leave/manage`

Setujui atau tolak request cuti (HR).

**Body:**

```json
{
  "id": 2,
  "status": "APPROVED" // atau "REJECTED"
}
```

---

### `POST /api/salary`

Input gaji karyawan (HR).

**Body:**

```json
{
  "userId": 1,
  "amount": 5000000,
  "period": "2025-06",
  "note": "Gaji Bulanan"
}
```

---

### `GET /api/salary/mine`

Employee lihat gaji sendiri.

---

## ⚙️ **Run Project**

```bash
# Install dep
npm install

# Generate prisma client
npx prisma generate

# Jalankan migration
npx prisma migrate dev --name init

# Jalanin dev server
npm run dev
```

---
