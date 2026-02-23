import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL não definida; banco desativado.");
}

const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export type Project = {
  id: string;
  name: string;
  client_name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  file_name?: string | null;
  metric_data?: string | null;
};

export async function getPool() {
  if (!pool) throw new Error("DATABASE_URL não configurada.");
  return pool;
}

export async function initDb() {
  const p = await getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'rascunho',
      file_name VARCHAR(512),
      metric_data TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  const col = await p.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'metric_data'"
  );
  if (col.rows.length === 0) {
    await p.query("ALTER TABLE projects ADD COLUMN metric_data TEXT");
  }
}

let inited = false;
async function ensureSchema() {
  if (!inited) {
    await initDb();
    inited = true;
  }
}

export async function listProjects(): Promise<Project[]> {
  const p = await getPool();
  await ensureSchema();
  const res = await p.query<Project>(
    "SELECT id, name, client_name, status, file_name, metric_data, created_at, updated_at FROM projects ORDER BY updated_at DESC"
  );
  return res.rows;
}

export async function getProject(id: string): Promise<Project | null> {
  const p = await getPool();
  await ensureSchema();
  const res = await p.query<Project>(
    "SELECT id, name, client_name, status, file_name, metric_data, created_at, updated_at FROM projects WHERE id = $1",
    [id]
  );
  return res.rows[0] ?? null;
}

export async function createProject(data: {
  name: string;
  client_name: string;
  status?: string;
}): Promise<Project> {
  const p = await getPool();
  await ensureSchema();
  const res = await p.query<Project>(
    `INSERT INTO projects (name, client_name, status)
     VALUES ($1, $2, $3)
     RETURNING id, name, client_name, status, file_name, metric_data, created_at, updated_at`,
    [data.name, data.client_name, data.status ?? "rascunho"]
  );
  return res.rows[0];
}

export async function setProjectFile(
  id: string,
  file_name: string
): Promise<void> {
  const p = await getPool();
  await ensureSchema();
  await p.query(
    "UPDATE projects SET file_name = $1, updated_at = NOW() WHERE id = $2",
    [file_name, id]
  );
}

export async function setProjectMetricData(
  id: string,
  metric_data: string
): Promise<void> {
  const p = await getPool();
  await ensureSchema();
  await p.query(
    "UPDATE projects SET metric_data = $1, updated_at = NOW() WHERE id = $2",
    [metric_data, id]
  );
}
