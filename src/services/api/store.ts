/**
 * Minimal in-memory mutable "table" seeded from a static JSON import.
 * Simulates persistence for the lifetime of the session only — this is a
 * mock backend, so create/update/delete never write back to disk.
 */
export class EntityStore<T extends { id: string }> {
  private records: T[]

  constructor(seed: T[]) {
    this.records = structuredClone(seed)
  }

  getAll(): T[] {
    return structuredClone(this.records)
  }

  getById(id: string): T | undefined {
    const found = this.records.find((r) => r.id === id)
    return found ? structuredClone(found) : undefined
  }

  insert(record: T): T {
    this.records.unshift(record)
    return structuredClone(record)
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const idx = this.records.findIndex((r) => r.id === id)
    if (idx === -1) return undefined
    this.records[idx] = { ...this.records[idx], ...patch }
    return structuredClone(this.records[idx])
  }

  remove(id: string): boolean {
    const before = this.records.length
    this.records = this.records.filter((r) => r.id !== id)
    return this.records.length < before
  }

  removeMany(ids: string[]): number {
    const idSet = new Set(ids)
    const before = this.records.length
    this.records = this.records.filter((r) => !idSet.has(r.id))
    return before - this.records.length
  }
}
