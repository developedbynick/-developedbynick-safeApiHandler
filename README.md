# 🛡️ safeApiHandler

`safeApiHandler` is a generic and type-safe Express middleware wrapper for route handlers. It provides:

-   ✅ Schema validation using [Zod](https://github.com/colinhacks/zod)
-   ✅ Strongly typed `req.body`, `req.query`, or `req.params`
-   ✅ Optional Arcjet integration for advanced request decisions

This utility is ideal for building secure, validated APIs with minimal boilerplate.

---

## ✨ Features

-   🔒 Enforces input validation before handler execution
-   📦 Supports `body`, `query`, or `params` payload locations
-   🧠 Automatically infers types for `req.body`, `req.query`, or `req.params`
-   🧾 Sends `400 Bad Request` if validation fails
-   🔄 Optional integration with Arcjet’s decision system

---

## 📦 Installation

```bash
npm install express-safe-api-handler-ns
```
