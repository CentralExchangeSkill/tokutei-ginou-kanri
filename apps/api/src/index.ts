import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { LoginSchema, CreateWorkerSchema } from "@tokutei/shared";
import { query } from "./db.js";

type Role = "ADMIN" | "USER";
type WorkerStatus = "ACTIVE" | "INACTIVE";

type AuthPayload = { sub: string; role: Role };

type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
};

type WorkerRow = {
  id: string;
  fullName: string;
  nationality: string;
  visaType: string;
  visaExpiryDate: Date;
  status: WorkerStatus;
  createdAt: Date;
};

const app = express();

app.use(cors());
app.use(express.json());

function auth(requiredRoles?: Role[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me") as AuthPayload;
      (req as any).user = payload;
      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const userResult = await query<UserRow>(
    'SELECT id, email, "passwordHash", role FROM "User" WHERE email = $1 LIMIT 1',
    [parsed.data.email]
  );

  const user = userResult.rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "change-me", {
    expiresIn: "8h"
  });

  res.json({ token, role: user.role, email: user.email });
});

app.get("/workers", auth(), async (_req, res) => {
  const workersResult = await query<WorkerRow>(
    'SELECT id, "fullName", nationality, "visaType", "visaExpiryDate", status, "createdAt" FROM "Worker" ORDER BY "visaExpiryDate" ASC'
  );

  res.json(
    workersResult.rows.map((w) => ({
      ...w,
      visaExpiryDate: w.visaExpiryDate.toISOString()
    }))
  );
});

app.get("/workers/:id", auth(), async (req, res) => {
  const workerResult = await query<WorkerRow>(
    'SELECT id, "fullName", nationality, "visaType", "visaExpiryDate", status, "createdAt" FROM "Worker" WHERE id = $1 LIMIT 1',
    [req.params.id]
  );

  const worker = workerResult.rows[0];
  if (!worker) return res.status(404).json({ message: "Not found" });

  res.json({
    ...worker,
    visaExpiryDate: worker.visaExpiryDate.toISOString(),
    immigrationInfo: { residenceCardNumber: "TODO", statusOfResidence: worker.visaType },
    documents: [],
    cases: []
  });
});

app.post("/workers", auth(["ADMIN"]), async (req, res) => {
  const parsed = CreateWorkerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const createdResult = await query<WorkerRow>(
    'INSERT INTO "Worker" (id, "fullName", nationality, "visaType", "visaExpiryDate", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, "fullName", nationality, "visaType", "visaExpiryDate", status, "createdAt"',
    [randomUUID(), parsed.data.fullName, parsed.data.nationality, parsed.data.visaType, parsed.data.visaExpiryDate, "ACTIVE"]
  );

  const created = createdResult.rows[0];
  res.status(201).json({ ...created, visaExpiryDate: created.visaExpiryDate.toISOString() });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
