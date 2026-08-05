# Security Specification for Short Video Script Planner (Firebase Rules)

## 1. Data Invariants
- A short video script is owned by a single user identified by `userId`.
- Users can only read, write, update, or delete their own scripts. No cross-user access is allowed.
- The `createdAt` field is immutable once the document is created.
- The `userId` field is immutable and must match the authenticated user's UID (`request.auth.uid`).
- Key properties such as `title`, `originalIdea`, `style`, `tone`, and `scenes` must be strictly typed, constrained in length, and structurally complete.

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Malicious UserId Spoofing (Create Stage)
- Attempt: Creator sets the script's `userId` field to a different victim user's UID.
- Expectation: `PERMISSION_DENIED` since `incoming().userId` must strictly match `request.auth.uid`.

### Payload 2: Write without Auth
- Attempt: Authenticated-less request attempting to create a script.
- Expectation: `PERMISSION_DENIED`.

### Payload 3: Shadow Update (Injecting Ghost Fields)
- Attempt: Modifying a script with extra root-level fields like `isAdmin: true` or `systemBypass: true`.
- Expectation: `PERMISSION_DENIED` via validation functions enforcing exact structural schemas and key counts.

### Payload 4: PII Isolation Breach
- Attempt: Non-owner trying to list or read another user's kịch bản records.
- Expectation: `PERMISSION_DENIED`.

### Payload 5: Spoofed Unverified Email login
- Attempt: Request from account where `email_verified` is false or missing, trying to write.
- Expectation: `PERMISSION_DENIED`.

### Payload 6: Modifying Immortal Fields (Immutability Violation)
- Attempt: Update request aiming to modify `createdAt` or `userId`.
- Expectation: `PERMISSION_DENIED`.

### Payload 7: Huge String Poisoning
- Attempt: Flooding the `title` or `originalIdea` field with 1MB of text to incur cost attacks (DoW).
- Expectation: `PERMISSION_DENIED` due to validation on `.size()` of string values.

### Payload 8: Corrupted Scene Structure
- Attempt: Passing negative timelines or missing crucial structural items (like `dialogue` or `illustrationPrompt` list inside scenes).
- Expectation: `PERMISSION_DENIED`.

### Payload 9: Empty Title/Style Bypass
- Attempt: Setting title as an empty string or selecting unsupported style categories.
- Expectation: `PERMISSION_DENIED`.

### Payload 10: Denial of Wallet Query
- Attempt: Client executing a broad search query without filtering by `userId === current_uid`.
- Expectation: `PERMISSION_DENIED`.

### Payload 11: Future/Past Mock Timestamps
- Attempt: Client injecting a future timestamp rather than adhering to server-side `request.time`.
- Expectation: `PERMISSION_DENIED`.

### Payload 12: Admin Role Self-Assignment
- Attempt: User attempting to write directly to a fictitious system configuration or admin bypass index.
- Expectation: `PERMISSION_DENIED`.
