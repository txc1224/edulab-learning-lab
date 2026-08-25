const DEFAULT_ELEMENT_META = {
  H: { color: '#f8fafc', radius: 0.22, name: '氢' },
  O: { color: '#f05b61', radius: 0.38, name: '氧' },
  Na: { color: '#a879ff', radius: 0.48, name: '钠' },
  Cl: { color: '#55c978', radius: 0.43, name: '氯' },
  C: { color: '#334155', radius: 0.45, name: '碳' },
  N: { color: '#4d91ff', radius: 0.42, name: '氮' },
  Mg: { color: '#aeb8c2', radius: 0.48, name: '镁' },
  Fe: { color: '#c87543', radius: 0.48, name: '铁' },
  Cu: { color: '#d8873f', radius: 0.48, name: '铜' },
  Ag: { color: '#b7c1cb', radius: 0.49, name: '银' },
  S: { color: '#e0b52d', radius: 0.44, name: '硫' }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function rotatePoint(point, rotation = [0, 0, 0]) {
  const [rx = 0, ry = 0, rz = 0] = rotation
  const [x, y, z] = point
  const cx = Math.cos(rx); const sx = Math.sin(rx)
  const cy = Math.cos(ry); const sy = Math.sin(ry)
  const cz = Math.cos(rz); const sz = Math.sin(rz)
  const m = [
    [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
    [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
    [-sy, cy * sx, cy * cx]
  ]
  return [
    m[0][0] * x + m[0][1] * y + m[0][2] * z,
    m[1][0] * x + m[1][1] * y + m[1][2] * z,
    m[2][0] * x + m[2][1] * y + m[2][2] * z
  ]
}

function transformPoint(point, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const rotated = rotatePoint(point, rotation)
  return rotated.map((value, index) => Number((value + (position[index] || 0)).toFixed(4)))
}

function expandSide(entries = [], side) {
  const counters = new Map()
  const instances = []
  const pending = []
  entries.forEach((entry) => {
    const count = Math.max(1, Number(entry.count || 1))
    for (let index = 0; index < count; index += 1) {
      const current = (counters.get(entry.species) || 0) + 1
      counters.set(entry.species, current)
      pending.push({ entry, id: `${entry.species}#${current}`, species: entry.species, index })
    }
  })

  const baseX = side === 'reactant' ? -3.4 : 3.4
  const spacing = 2.2
  pending.forEach((item, index) => {
    const position = item.entry.position || [baseX, (index - (pending.length - 1) / 2) * spacing, 0]
    instances.push({
      ...item,
      position,
      rotation: item.entry.rotation || [0, 0, 0]
    })
  })
  return instances
}

function parseReference(reference) {
  const separator = reference.lastIndexOf('.')
  assert(separator > 0, `原子引用格式无效：${reference}`)
  return { instanceId: reference.slice(0, separator), slot: reference.slice(separator + 1) }
}

function createRefMap(instances, catalog) {
  const refs = new Map()
  const bonds = []
  instances.forEach((instance) => {
    const definition = catalog[instance.species]
    assert(definition, `未知物种：${instance.species}`)
    definition.atoms.forEach((atom) => {
      const key = `${instance.id}.${atom.slot}`
      refs.set(key, {
        ...atom,
        key,
        id: instance.id,
        species: instance.species,
        position: transformPoint(atom.position, instance.position, instance.rotation),
        charge: atom.charge ?? definition.charge ?? 0
      })
    })
    definition.bonds.forEach((bond) => {
      bonds.push({
        a: `${instance.id}.${bond.a}`,
        b: `${instance.id}.${bond.b}`,
        order: bond.order || 1
      })
    })
  })
  return { refs, bonds }
}

function bondKey(bond) {
  return `${[bond.a, bond.b].sort().join('::')}::${bond.order}`
}

function remapBonds(bonds, idMap) {
  return bonds.map((bond) => ({
    a: idMap.get(bond.a),
    b: idMap.get(bond.b),
    order: bond.order
  }))
}

function diffBonds(before, after) {
  const beforeMap = new Map(before.map((bond) => [bondKey(bond), bond]))
  const afterMap = new Map(after.map((bond) => [bondKey(bond), bond]))
  return {
    broken: [...beforeMap.entries()].filter(([key]) => !afterMap.has(key)).map(([, bond]) => bond),
    formed: [...afterMap.entries()].filter(([key]) => !beforeMap.has(key)).map(([, bond]) => bond),
    kept: [...afterMap.entries()].filter(([key]) => beforeMap.has(key)).map(([, bond]) => bond)
  }
}

function countElements(atoms) {
  return atoms.reduce((counts, atom) => {
    counts[atom.element] = (counts[atom.element] || 0) + 1
    return counts
  }, {})
}

function countCharge(instances, catalog) {
  return instances.reduce((total, instance) => total + (catalog[instance.species].charge || 0), 0)
}

function makeLabels(instances, refsBySide, atomIds) {
  return instances.map((instance) => {
    const atomKeys = refsBySide.get(`${instance.phase}:${instance.id}`) || []
    return {
      id: `${instance.phase}-${instance.id}`,
      text: `${instance.definition.name} (${instance.definition.formula})`,
      atoms: atomKeys.map((key) => atomIds.get(key)),
      phase: instance.phase,
      color: instance.definition.color || 'cyan'
    }
  }).filter((label) => label.atoms.length)
}

export function normalizeReactionSpec(spec) {
  assert(spec && typeof spec === 'object', 'reaction spec 必须是对象')
  assert(Array.isArray(spec.reactants) && spec.reactants.length, '至少需要一个反应物')
  assert(Array.isArray(spec.products) && spec.products.length, '至少需要一个产物')
  assert(Array.isArray(spec.atomMap) && spec.atomMap.length, '必须提供 atomMap')

  const catalog = spec.species || {}
  const reactants = expandSide(spec.reactants, 'reactant').map((item) => ({ ...item, phase: 'reactant', definition: catalog[item.species] }))
  const products = expandSide(spec.products, 'product').map((item) => ({ ...item, phase: 'product', definition: catalog[item.species] }))
  ;[...reactants, ...products].forEach((instance) => assert(instance.definition, `未知物种：${instance.species}`))

  const reactantResolved = createRefMap(reactants, catalog)
  const productResolved = createRefMap(products, catalog)
  const reactantKeys = new Set(reactantResolved.refs.keys())
  const productKeys = new Set(productResolved.refs.keys())
  const atomIds = new Map()
  const reverseIds = new Map()
  const elementCounters = {}
  const atoms = []

  spec.atomMap.forEach((pair, index) => {
    assert(Array.isArray(pair) && pair.length === 2, `atomMap 第 ${index + 1} 项无效`)
    const [reactantRef, productRef] = pair
    assert(reactantKeys.has(reactantRef), `atomMap 缺少或引用未知反应物原子：${reactantRef}`)
    assert(productKeys.has(productRef), `atomMap 缺少或引用未知产物原子：${productRef}`)
    assert(!atomIds.has(reactantRef) && !reverseIds.has(productRef), `atomMap 存在重复映射：${reactantRef}`)
    const reactantAtom = reactantResolved.refs.get(reactantRef)
    const productAtom = productResolved.refs.get(productRef)
    assert(reactantAtom.element === productAtom.element, `元素映射不一致：${reactantRef} ↔ ${productRef}`)
    const count = (elementCounters[reactantAtom.element] || 0) + 1
    elementCounters[reactantAtom.element] = count
    const id = `${reactantAtom.element}${count}`
    atomIds.set(reactantRef, id)
    reverseIds.set(productRef, id)
    atoms.push({
      id,
      element: reactantAtom.element,
      color: DEFAULT_ELEMENT_META[reactantAtom.element]?.color || '#94a3b8',
      radius: DEFAULT_ELEMENT_META[reactantAtom.element]?.radius || 0.35,
      charge: reactantAtom.charge,
      start: reactantAtom.position,
      end: productAtom.position,
      reactantRef,
      productRef
    })
  })

  assert(atomIds.size === reactantKeys.size, 'atomMap 未覆盖全部反应物原子')
  assert(reverseIds.size === productKeys.size, 'atomMap 未覆盖全部产物原子')

  const before = remapBonds(reactantResolved.bonds, atomIds)
  const after = remapBonds(productResolved.bonds, reverseIds)
  const bonds = diffBonds(before, after)
  const allInstances = [...reactants, ...products]
  const refsBySide = new Map()
  allInstances.forEach((instance) => {
    const resolved = instance.phase === 'reactant' ? reactantResolved.refs : productResolved.refs
    refsBySide.set(`${instance.phase}:${instance.id}`, [...resolved.keys()].filter((key) => key.startsWith(`${instance.id}.`)))
  })
  const labels = makeLabels(allInstances, refsBySide, instanceRefToAtomId(reactantResolved, productResolved, atomIds, reverseIds))

  const reactantCounts = countElements(reactants.flatMap((instance) => catalog[instance.species].atoms))
  const productCounts = countElements(products.flatMap((instance) => catalog[instance.species].atoms))
  Object.keys({ ...reactantCounts, ...productCounts }).forEach((element) => {
    assert(reactantCounts[element] === productCounts[element], `元素 ${element} 未守恒`)
  })
  const chargeBefore = countCharge(reactants, catalog)
  const chargeAfter = countCharge(products, catalog)
  assert(chargeBefore === chargeAfter, `总电荷未守恒：${chargeBefore} → ${chargeAfter}`)

  const meta = { language: 'zh-CN', accent: 'cyan', ...(spec.meta || {}) }
  meta.equations = meta.equations || [
    meta.molecularEquation && { label: '分子方程', latex: meta.molecularEquation },
    meta.netIonicEquation && { label: '净离子方程', latex: meta.netIonicEquation }
  ].filter(Boolean)

  return {
    meta,
    conditions: spec.conditions || {},
    atoms,
    bonds: { before, after, ...bonds },
    labels,
    elementCounts: reactantCounts,
    chargeTotals: { before: chargeBefore, after: chargeAfter },
    steps: spec.steps || [],
    energy: spec.energy || null,
    ui: spec.ui || {},
    species: catalog
  }
}

function instanceRefToAtomId(reactantResolved, productResolved, atomIds, reverseIds) {
  const mapping = new Map()
  reactantResolved.refs.forEach((_, key) => mapping.set(key, atomIds.get(key)))
  productResolved.refs.forEach((_, key) => mapping.set(key, reverseIds.get(key)))
  return mapping
}

export function interpolateAtoms(atoms, progress) {
  const ratio = Math.min(1, Math.max(0, Number(progress)))
  return atoms.map((atom) => ({
    ...atom,
    position: atom.start.map((value, index) => value + (atom.end[index] - value) * ratio)
  }))
}

export function getElementMeta(element) {
  return DEFAULT_ELEMENT_META[element] || { color: '#94a3b8', radius: 0.35, name: element }
}
