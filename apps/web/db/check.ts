import postgres from 'postgres'

// Prints tables, column types and row counts. Read-only.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL is required')
const sql = postgres(url, { max: 1, onnotice: () => {} })

async function main() {
  const cols = await sql`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position`
  const byTable = new Map<string, string[]>()
  for (const c of cols) {
    const list = byTable.get(c.table_name as string) ?? []
    list.push(`${c.column_name} ${c.data_type}`)
    byTable.set(c.table_name as string, list)
  }
  for (const [table, list] of byTable) {
    const [{ count }] = await sql`select count(*)::int as count from ${sql(table)}`
    console.log(`${table} (${count} rows): ${list.join(', ')}`)
  }
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => sql.end())
