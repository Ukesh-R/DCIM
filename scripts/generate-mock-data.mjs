// One-off Node script that generates realistic mock JSON datasets for the
// "no backend" mock database used by the app's service layer.
// Run with: node scripts/generate-mock-data.mjs
import { writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, "../src/database")
mkdirSync(OUT_DIR, { recursive: true })

// ---------- seeded RNG for reproducible data ----------
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260715)

const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const pickWeighted = (weightedArr) => {
  const total = weightedArr.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [val, w] of weightedArr) {
    r -= w
    if (r <= 0) return val
  }
  return weightedArr[0][0]
}
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min
const randFloat = (min, max, dp = 1) => Number((rand() * (max - min) + min).toFixed(dp))
const sample = (arr, n) => {
  const copy = [...arr]
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0])
  }
  return out
}
const pad = (n, len = 4) => String(n).padStart(len, "0")
const daysAgo = (d, jitterHours = 12) =>
  new Date(Date.now() - d * 86400000 - randInt(0, jitterHours) * 3600000).toISOString()
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString()

// ---------- shared pools ----------
const firstNames = [
  "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth",
  "William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen",
  "Christopher","Nancy","Daniel","Lisa","Matthew","Betty","Anthony","Margaret","Mark","Sandra",
  "Priya","Arjun","Wei","Mei","Hiroshi","Yuki","Fatima","Ahmed","Carlos","Sofia",
  "Ravi","Ananya","Chen","Li","Kenji","Aiko","Omar","Layla","Diego","Valentina",
  "Nina","Lucas","Emma","Noah","Olivia","Liam","Ava","Ethan","Sophia","Mason",
]
const lastNames = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Patel","Kumar","Nair","Sharma","Wang","Zhang","Tanaka","Suzuki","Khan","Ali",
  "Silva","Costa","Muller","Schmidt","Rossi","Ferrari","Novak","Kowalski","Dubois","Andersson",
]
const departments = [
  "Infrastructure","Network Operations","Site Reliability","Security","IT Support",
  "Cloud Platform","Database Administration","Customer Success","Procurement","Executive",
]
const jobTitlesByDept = {
  Infrastructure: ["Infrastructure Engineer","Senior Infrastructure Engineer","Infrastructure Architect","Data Center Technician"],
  "Network Operations": ["Network Engineer","NOC Analyst","Network Architect","Network Operations Manager"],
  "Site Reliability": ["SRE","Senior SRE","Reliability Lead","Platform Engineer"],
  Security: ["Security Analyst","Security Engineer","SOC Analyst","CISO Office Analyst"],
  "IT Support": ["IT Support Specialist","Helpdesk Technician","IT Support Lead","Desktop Support Engineer"],
  "Cloud Platform": ["Cloud Engineer","Cloud Architect","DevOps Engineer","Platform Lead"],
  "Database Administration": ["DBA","Senior DBA","Data Platform Engineer","Database Architect"],
  "Customer Success": ["Customer Success Manager","Account Manager","Onboarding Specialist","Support Engineer"],
  Procurement: ["Procurement Specialist","Vendor Manager","Asset Coordinator","Purchasing Analyst"],
  Executive: ["VP Engineering","Director of Operations","CTO","Head of Infrastructure"],
}
const locations = [
  "New York, US","San Jose, US","Austin, US","Ashburn, US","London, UK","Frankfurt, DE",
  "Amsterdam, NL","Singapore, SG","Mumbai, IN","Bangalore, IN","Tokyo, JP","Sydney, AU",
  "Toronto, CA","Sao Paulo, BR","Dublin, IE",
]
const avatarColors = ["blue","purple","green","amber","rose","cyan","indigo","teal","orange","pink"]

const regions = ["us-east-1","us-west-2","eu-central-1","eu-west-1","ap-south-1","ap-southeast-1","sa-east-1","ca-central-1"]
const datacenters = ["DC-NY-01","DC-SJ-02","DC-AUS-03","DC-ASH-04","DC-LON-05","DC-FRA-06","DC-SIN-07","DC-MUM-08","DC-TOK-09","DC-SYD-10"]
const cpuModels = [
  "Intel Xeon Platinum 8380","Intel Xeon Gold 6338","AMD EPYC 7763","AMD EPYC 9654",
  "Intel Xeon Platinum 8480+","AMD EPYC 7543","Ampere Altra Max","Intel Xeon Gold 6448Y",
]
const tagPool = ["critical","gpu","ml-training","backup","edge","high-memory","batch","real-time","dr-site","customer-facing","internal","compliance"]

const companies = [
  "Acme Logistics","Nimbus Retail Group","Vertex Financial","Northwind Traders","Globex Manufacturing",
  "Initech Systems","Umbrella Health","Stark Industries","Wayne Enterprises","Hooli Cloud",
  "Pinnacle Insurance","Redwood Media","Bluepeak Telecom","Cascade Energy","Summit Logistics",
  "Aurora Biotech","Meridian Bank","Falcon Aerospace","Cobalt Robotics","Ironclad Security",
  "Silverline Studios","Quantum Analytics","Harborview Shipping","Crestline Realty","Zenith Airlines",
]
const manufacturers = ["Dell","HPE","Lenovo","Cisco","Supermicro","NetApp","Pure Storage","Juniper"]
const assetModels = {
  server: ["PowerEdge R750","ProLiant DL380","ThinkSystem SR650","UCS C240 M6"],
  storage: ["PowerVault ME5","Nimble Storage dHCI","FlashArray//X","NetApp AFF A400"],
  network: ["Catalyst 9300","Nexus 93180YC-EX","EX4400 Switch","ASR 1001-X Router"],
  workstation: ["Precision 5680","ZBook Fury 16","ThinkStation P360"],
  peripheral: ["APC Smart-UPS 3000VA","Tripp Lite PDU","Rack Console Kit"],
}

// ============================================================
// USERS (100)
// ============================================================
const users = []
function makeUser(i, overrides = {}) {
  const first = overrides.firstName ?? pick(firstNames)
  const last = overrides.lastName ?? pick(lastNames)
  const dept = overrides.department ?? pick(departments)
  const role = overrides.role ?? pickWeighted([["admin", 0.16], ["user", 0.84]])
  const status = overrides.status ?? pickWeighted([["active", 0.85], ["inactive", 0.1], ["suspended", 0.05]])
  const created = overrides.createdAt ?? daysAgo(randInt(60, 1100))
  return {
    id: `usr-${pad(i)}`,
    firstName: first,
    lastName: last,
    fullName: `${first} ${last}`,
    email: overrides.email ?? `${first.toLowerCase()}.${last.toLowerCase()}${i}@dcims.io`,
    role,
    department: dept,
    jobTitle: overrides.jobTitle ?? pick(jobTitlesByDept[dept]),
    phone: `+1-${randInt(200, 989)}-${randInt(200, 989)}-${pad(randInt(0, 9999), 4)}`,
    status,
    avatarColor: pick(avatarColors),
    location: pick(locations),
    createdAt: created,
    lastLoginAt: status === "active" ? hoursAgo(randInt(0, 400)) : status === "inactive" ? daysAgo(randInt(30, 200)) : null,
  }
}

users.push(makeUser(1, {
  firstName: "Alex", lastName: "Morgan", email: "admin@dcims.io", role: "admin",
  department: "Executive", jobTitle: "Head of Infrastructure", status: "active", createdAt: daysAgo(900),
}))
users.push(makeUser(2, {
  firstName: "Jordan", lastName: "Reyes", email: "user@dcims.io", role: "user",
  department: "Site Reliability", jobTitle: "SRE", status: "active", createdAt: daysAgo(600),
}))
for (let i = 3; i <= 100; i++) users.push(makeUser(i))

const adminUsers = users.filter((u) => u.role === "admin")

// ============================================================
// CLUSTERS (200)
// ============================================================
const clusters = []
const clusterStatusPool = [["active", 0.72], ["maintenance", 0.1], ["inactive", 0.1], ["decommissioned", 0.08]]
const envPool = [["production", 0.5], ["staging", 0.22], ["development", 0.18], ["dr", 0.1]]
const allocPool = [["allocated", 0.65], ["unallocated", 0.25], ["reserved", 0.1]]
const storageTypePool = [["NVMe", 0.5], ["SSD", 0.35], ["HDD", 0.15]]
const clusterNamePrefix = ["Compute", "Web", "API", "Data", "ML", "Cache", "Batch", "Analytics", "Storage", "Edge"]

for (let i = 1; i <= 200; i++) {
  const status = pickWeighted(clusterStatusPool)
  const environment = pickWeighted(envPool)
  const owner = pick(users)
  const region = pick(regions)
  const dc = pick(datacenters)
  const envCode = { production: "prod", staging: "stg", development: "dev", dr: "dr" }[environment]
  const isDown = status === "decommissioned"
  const util = () => (isDown ? 0 : randInt(5, 96))
  clusters.push({
    id: `cl-${pad(i)}`,
    name: `${pick(clusterNamePrefix)} Cluster ${pad(i, 3)}`,
    hostname: `dc-cl-${envCode}-${pad(i, 3)}.corp.local`,
    ipAddress: `10.${randInt(0, 63)}.${randInt(0, 255)}.${randInt(2, 254)}`,
    status,
    environment,
    region,
    datacenter: dc,
    rack: `R${randInt(1, 40)}-U${randInt(1, 42)}`,
    specs: {
      cpuCores: pick([16, 32, 64, 96, 128]),
      cpuModel: pick(cpuModels),
      ramGb: pick([128, 256, 512, 1024, 2048]),
      storageTb: pick([4, 8, 16, 32, 64, 128]),
      storageType: pickWeighted(storageTypePool),
      nodeCount: pick([1, 3, 5, 8, 12, 16]),
    },
    utilizationCpu: util(),
    utilizationRam: util(),
    utilizationStorage: util(),
    allocationStatus: isDown ? "unallocated" : pickWeighted(allocPool),
    ownerId: owner.id,
    ownerName: owner.fullName,
    department: owner.department,
    tags: sample(tagPool, randInt(1, 4)),
    createdAt: daysAgo(randInt(30, 900)),
    updatedAt: daysAgo(randInt(0, 29)),
    lastHealthCheckAt: isDown ? daysAgo(randInt(30, 200)) : hoursAgo(randInt(0, 6)),
  })
}

// ============================================================
// CUSTOMER ASSETS (150)
// ============================================================
const customerAssets = []
const assetTypePool = [["server", 0.4], ["storage", 0.2], ["network", 0.2], ["workstation", 0.12], ["peripheral", 0.08]]
const assetStatusPool = [["in-service", 0.68], ["in-storage", 0.15], ["under-repair", 0.1], ["retired", 0.07]]

for (let i = 1; i <= 150; i++) {
  const type = pickWeighted(assetTypePool)
  const status = pickWeighted(assetStatusPool)
  const owner = pick(users)
  const customer = pick(companies)
  const manufacturer = pick(manufacturers)
  const purchase = daysAgo(randInt(200, 1500))
  customerAssets.push({
    id: `ast-${pad(i)}`,
    assetTag: `AST-${pad(i, 5)}`,
    name: `${customer.split(" ")[0]} ${type[0].toUpperCase() + type.slice(1)} ${pad(i, 3)}`,
    type,
    status,
    customerName: customer,
    customerId: `cust-${pad(companies.indexOf(customer) + 1, 3)}`,
    serialNumber: `SN${randInt(10000000, 99999999)}`,
    manufacturer,
    model: pick(assetModels[type]),
    ipAddress: `172.${randInt(16, 31)}.${randInt(0, 255)}.${randInt(2, 254)}`,
    location: pick(locations),
    datacenter: pick(datacenters),
    allocationStatus: status === "retired" ? "unallocated" : pickWeighted(allocPool),
    purchaseDate: purchase,
    warrantyExpiry: new Date(new Date(purchase).getTime() + randInt(3, 5) * 365 * 86400000).toISOString(),
    specs: {
      cpu: type === "server" || type === "workstation" ? pick(cpuModels) : "N/A",
      ramGb: type === "server" || type === "workstation" ? pick([16, 32, 64, 128, 256]) : 0,
      storageGb: pick([256, 512, 1024, 2048, 4096]),
    },
    ownerId: owner.id,
    ownerName: owner.fullName,
    notes: pick([
      "Deployed as part of standard customer onboarding.",
      "Upgraded firmware during last maintenance window.",
      "Awaiting decommission approval.",
      "Part of customer's primary production footprint.",
      "Flagged for warranty renewal review.",
      "",
    ]),
    createdAt: purchase,
    updatedAt: daysAgo(randInt(0, 60)),
  })
}

// ============================================================
// ALERTS (300)
// ============================================================
const alerts = []
const alertLevelPool = [["critical", 0.15], ["warning", 0.4], ["info", 0.45]]
const alertStatusPool = [["open", 0.4], ["acknowledged", 0.25], ["resolved", 0.35]]
const alertCategories = ["performance", "availability", "security", "capacity", "hardware", "network"]

const alertTemplates = {
  performance: {
    title: (n) => `High CPU utilization on ${n}`,
    desc: (n) => `Sustained CPU utilization above threshold detected on ${n}.`,
    rec: "Consider scaling out additional nodes or migrating noisy workloads to a less utilized cluster.",
    unit: "%", min: 75, max: 99, threshold: 80,
  },
  availability: {
    title: (n) => `Health check failures on ${n}`,
    desc: (n) => `${n} failed consecutive health check probes.`,
    rec: "Investigate service logs and restart the affected process group; escalate to on-call SRE if it persists.",
    unit: "failed checks", min: 2, max: 10, threshold: 3,
  },
  security: {
    title: (n) => `Suspicious login pattern detected on ${n}`,
    desc: (n) => `Multiple failed authentication attempts observed against ${n}.`,
    rec: "Review access logs, rotate credentials if compromise is suspected, and enable IP allow-listing.",
    unit: "attempts", min: 5, max: 40, threshold: 5,
  },
  capacity: {
    title: (n) => `Storage capacity nearing limit on ${n}`,
    desc: (n) => `Storage utilization on ${n} is approaching provisioned capacity.`,
    rec: "Provision additional storage or archive cold data to lower-cost tiers.",
    unit: "%", min: 78, max: 99, threshold: 85,
  },
  hardware: {
    title: (n) => `Hardware sensor warning on ${n}`,
    desc: (n) => `Temperature or fan sensor reading out of normal range on ${n}.`,
    rec: "Schedule a physical inspection and verify cooling/airflow in the rack.",
    unit: "°C", min: 68, max: 95, threshold: 70,
  },
  network: {
    title: (n) => `Elevated network latency on ${n}`,
    desc: (n) => `Network round-trip latency exceeded acceptable bounds on ${n}.`,
    rec: "Check upstream switch/router utilization and verify no packet loss on the uplink.",
    unit: "ms", min: 45, max: 400, threshold: 50,
  },
}

for (let i = 1; i <= 300; i++) {
  const sourceType = pickWeighted([["cluster", 0.62], ["asset", 0.38]])
  const source = sourceType === "cluster" ? pick(clusters) : pick(customerAssets)
  const sourceName = sourceType === "cluster" ? source.name : source.name
  const level = pickWeighted(alertLevelPool)
  const status = pickWeighted(alertStatusPool)
  const category = pick(alertCategories)
  const tmpl = alertTemplates[category]
  const created = daysAgo(randInt(0, 45))
  const ackAt = status !== "open" ? new Date(new Date(created).getTime() + randInt(1, 6) * 3600000).toISOString() : null
  const resolvedAt = status === "resolved" ? new Date(new Date(ackAt ?? created).getTime() + randInt(1, 20) * 3600000).toISOString() : null
  const acknowledger = status !== "open" ? pick(adminUsers.length ? adminUsers : users) : null

  alerts.push({
    id: `alt-${pad(i, 5)}`,
    title: tmpl.title(sourceName),
    description: tmpl.desc(sourceName),
    level,
    status,
    category,
    sourceType,
    sourceId: source.id,
    sourceName,
    ipAddress: source.ipAddress,
    recommendation: tmpl.rec,
    metricValue: randFloat(tmpl.min, tmpl.max),
    metricThreshold: tmpl.threshold,
    metricUnit: tmpl.unit,
    createdAt: created,
    acknowledgedAt: ackAt,
    acknowledgedBy: acknowledger ? acknowledger.fullName : null,
    resolvedAt,
  })
}

// ============================================================
// REQUESTS (150) — cluster + asset allocation requests
// ============================================================
const requests = []
const reqStatusPool = [["pending", 0.35], ["approved", 0.35], ["rejected", 0.15], ["cancelled", 0.15]]
const reqPriorityPool = [["low", 0.25], ["medium", 0.4], ["high", 0.25], ["urgent", 0.1]]

const reqTitlesByType = {
  cluster: [
    "New production compute cluster for Q_ launch",
    "Additional ML training capacity",
    "DR failover cluster provisioning",
    "Staging environment refresh",
    "Scale-out request for API tier",
    "Dedicated analytics cluster",
  ],
  asset: [
    "Replacement server for aging hardware",
    "New storage array for customer workload",
    "Network switch upgrade request",
    "Workstation provisioning for new hire",
    "Additional UPS unit for rack redundancy",
    "Customer-dedicated asset allocation",
  ],
}

for (let i = 1; i <= 150; i++) {
  const targetType = pickWeighted([["cluster", 0.58], ["asset", 0.42]])
  const requester = pick(users)
  const status = pickWeighted(reqStatusPool)
  const created = daysAgo(randInt(0, 90))
  const decided = status !== "pending" ? new Date(new Date(created).getTime() + randInt(4, 96) * 3600000).toISOString() : null
  const approver = status === "approved" || status === "rejected" ? pick(adminUsers.length ? adminUsers : users) : null
  const allocatedResource = status === "approved" ? (targetType === "cluster" ? pick(clusters) : pick(customerAssets)) : null

  requests.push({
    id: `req-${pad(i, 4)}`,
    requestNumber: `REQ-2026-${pad(i, 5)}`,
    targetType,
    title: pick(reqTitlesByType[targetType]),
    justification: targetType === "cluster"
      ? "Current capacity is insufficient to meet projected workload growth for the upcoming quarter."
      : "Existing asset has reached end-of-life or customer requires additional dedicated hardware.",
    priority: pickWeighted(reqPriorityPool),
    status,
    requestedById: requester.id,
    requestedByName: requester.fullName,
    department: requester.department,
    approverId: approver ? approver.id : null,
    approverName: approver ? approver.fullName : null,
    allocatedResourceId: allocatedResource ? allocatedResource.id : null,
    allocatedResourceName: allocatedResource ? allocatedResource.name : null,
    requestedSpecs: targetType === "cluster"
      ? `${pick([16, 32, 64])} vCPU, ${pick([128, 256, 512])}GB RAM, ${pick([4, 8, 16])}TB storage`
      : `${pick(["Server", "Storage array", "Network switch", "Workstation"])}, ${pick([16, 32, 64])}GB RAM`,
    customerName: targetType === "asset" ? pick(companies) : null,
    createdAt: created,
    updatedAt: decided ?? created,
    decidedAt: decided,
    decisionNote: status === "approved"
      ? "Approved — resource allocated per current capacity plan."
      : status === "rejected"
      ? "Rejected — insufficient budget approval for this cycle."
      : null,
  })
}

// ============================================================
// MONITORING RECORDS (500) — time series samples across a subset of clusters
// ============================================================
const monitoring = []
const activeClusters = clusters.filter((c) => c.status !== "decommissioned")
// Concentrate samples on a small "monitored fleet" so every time-range filter
// (1h/6h/24h/7d) has real density instead of ~1 sample/day spread across 70 clusters.
const MONITORED_CLUSTER_COUNT = 10
const SAMPLES_PER_CLUSTER = 50 // 10 * 50 = 500 total records
const WINDOW_HOURS = 24 // samples span the last 24h at ~29min cadence
const monitoredClusters = sample(activeClusters, Math.min(MONITORED_CLUSTER_COUNT, activeClusters.length))
let recId = 1

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

for (const cluster of monitoredClusters) {
  let cpu = randInt(25, 65)
  let ram = randInt(30, 70)
  let storage = cluster.utilizationStorage || randInt(20, 70)
  let netIn = randInt(80, 350)
  let netOut = randInt(80, 350)
  let load = randFloat(0.5, 3)
  let temp = randInt(38, 52)
  const uptimeStart = randInt(3600, 60 * 86400)

  // Build oldest -> newest via a bounded random walk so the line looks like a
  // real metrics feed rather than independent noisy points.
  const samples = []
  for (let s = 0; s < SAMPLES_PER_CLUSTER; s++) {
    cpu = clamp(cpu + randInt(-6, 6), 3, 97)
    ram = clamp(ram + randInt(-5, 5), 3, 97)
    storage = clamp(storage + randInt(-2, 2), 3, 97)
    netIn = clamp(netIn + randInt(-30, 30), 5, 950)
    netOut = clamp(netOut + randInt(-30, 30), 5, 950)
    load = Number(clamp(load + randFloat(-0.4, 0.4), 0.1, 10).toFixed(2))
    temp = clamp(temp + randInt(-2, 2), 28, 88)
    samples.push({ cpu, ram, storage, netIn, netOut, load, temp })
  }

  for (let s = 0; s < SAMPLES_PER_CLUSTER; s++) {
    const hoursBack = WINDOW_HOURS * (1 - s / (SAMPLES_PER_CLUSTER - 1))
    const snap = samples[s]
    monitoring.push({
      id: `mon-${pad(recId++, 5)}`,
      clusterId: cluster.id,
      clusterName: cluster.name,
      ipAddress: cluster.ipAddress,
      timestamp: hoursAgo(hoursBack),
      cpuUtilization: snap.cpu,
      ramUtilization: snap.ram,
      storageUtilization: snap.storage,
      networkInMbps: snap.netIn,
      networkOutMbps: snap.netOut,
      systemLoad: snap.load,
      temperatureC: snap.temp,
      uptimeSeconds: uptimeStart + Math.round(((WINDOW_HOURS - hoursBack) * 3600)),
    })
  }
}
monitoring.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

// ============================================================
// WRITE OUTPUT
// ============================================================
const write = (filename, data) => {
  writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(data, null, 2) + "\n", "utf-8")
  console.log(`wrote ${filename}: ${data.length} records`)
}

write("users.json", users)
write("clusters.json", clusters)
write("customerAssets.json", customerAssets)
write("alerts.json", alerts)
write("requests.json", requests)
write("monitoring.json", monitoring)

console.log("Mock data generation complete.")
