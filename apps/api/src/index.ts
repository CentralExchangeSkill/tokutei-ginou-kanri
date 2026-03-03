import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { LoginSchema, CreateWorkerSchema } from "@tokutei/shared";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

type AuthPayload = { sub: string; role: Role };

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

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "change-me", {
    expiresIn: "8h"
  });

  res.json({ token, role: user.role, email: user.email });
});

app.get("/workers", auth(), async (_req, res) => {
  const workers = await prisma.worker.findMany({ orderBy: { visaExpiryDate: "asc" } });
  res.json(
    workers.map((w) => ({
      ...w,
      visaExpiryDate: w.visaExpiryDate.toISOString()
    }))
  );
});

app.get("/workers/:id", auth(), async (req, res) => {
  const worker = await prisma.worker.findUnique({ where: { id: req.params.id } });
  if (!worker) return res.status(404).json({ message: "Not found" });

  res.json({
    ...worker,
    visaExpiryDate: worker.visaExpiryDate.toISOString(),
    immigrationInfo: { residenceCardNumber: "TODO", statusOfResidence: worker.visaType },
    documents: [],
    cases: []
  });
});

app.post("/workers", auth([Role.ADMIN]), async (req, res) => {
  const parsed = CreateWorkerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const created = await prisma.worker.create({
    data: {
      ...parsed.data,
      visaExpiryDate: new Date(parsed.data.visaExpiryDate)
    }
  });

  res.status(201).json({ ...created, visaExpiryDate: created.visaExpiryDate.toISOString() });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
