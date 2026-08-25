const atom = (slot, element, position, charge = 0) => ({ slot, element, position, charge })
const bond = (a, b, order = 1) => ({ a, b, order })

const mono = (formula, latex, name, element, charge, color) => ({
  formula,
  latex,
  name,
  charge,
  color,
  atoms: [atom('X', element, [0, 0, 0], charge)],
  bonds: []
})

const speciesLibrary = {
  'H+': mono('H⁺', '\\mathrm{H^+}', '氢离子', 'H', 1, '#2d8eea'),
  'Na': mono('Na', '\\mathrm{Na}', '钠原子', 'Na', 0, '#8e62d9'),
  'Na+': mono('Na⁺', '\\mathrm{Na^+}', '钠离子', 'Na', 1, '#8e62d9'),
  'Mg': mono('Mg', '\\mathrm{Mg}', '镁原子', 'Mg', 0, '#9aa6b2'),
  'Mg2+': mono('Mg²⁺', '\\mathrm{Mg^{2+}}', '镁离子', 'Mg', 2, '#9aa6b2'),
  'Fe': mono('Fe', '\\mathrm{Fe}', '铁原子', 'Fe', 0, '#d57b45'),
  'Fe2+': mono('Fe²⁺', '\\mathrm{Fe^{2+}}', '亚铁离子', 'Fe', 2, '#d57b45'),
  'Cu': mono('Cu', '\\mathrm{Cu}', '铜原子', 'Cu', 0, '#d98942'),
  'Cu2+': mono('Cu²⁺', '\\mathrm{Cu^{2+}}', '铜离子', 'Cu', 2, '#3d8dd8'),
  'Ag+': mono('Ag⁺', '\\mathrm{Ag^+}', '银离子', 'Ag', 1, '#a9b4c0'),
  'Cl-': mono('Cl⁻', '\\mathrm{Cl^-}', '氯离子', 'Cl', -1, '#2daa70'),
  H2: {
    formula: 'H₂', latex: '\\mathrm{H_2}', name: '氢分子', charge: 0, color: '#7c96ad',
    atoms: [atom('Ha', 'H', [-0.42, 0, 0]), atom('Hb', 'H', [0.42, 0, 0])],
    bonds: [bond('Ha', 'Hb')]
  },
  O2: {
    formula: 'O₂', latex: '\\mathrm{O_2}', name: '氧分子', charge: 0, color: '#e85058',
    atoms: [atom('Oa', 'O', [-0.55, 0, 0]), atom('Ob', 'O', [0.55, 0, 0])],
    bonds: [bond('Oa', 'Ob', 2)]
  },
  Cl2: {
    formula: 'Cl₂', latex: '\\mathrm{Cl_2}', name: '氯分子', charge: 0, color: '#2daa70',
    atoms: [atom('Cla', 'Cl', [-0.66, 0, 0]), atom('Clb', 'Cl', [0.66, 0, 0])],
    bonds: [bond('Cla', 'Clb')]
  },
  H2O: {
    formula: 'H₂O', latex: '\\mathrm{H_2O}', name: '水分子', charge: 0, color: '#1e9ec0',
    atoms: [
      atom('A', 'O', [0, 0, 0]),
      atom('Ha', 'H', [-0.72, 0.55, 0]),
      atom('Hb', 'H', [0.72, 0.55, 0])
    ],
    bonds: [bond('A', 'Ha'), bond('A', 'Hb')]
  },
  'OH-': {
    formula: 'OH⁻', latex: '\\mathrm{OH^-}', name: '氢氧根离子', charge: -1, color: '#199d87',
    atoms: [atom('O', 'O', [0, 0, 0], -1), atom('H', 'H', [0.82, 0.1, 0])],
    bonds: [bond('O', 'H')]
  },
  H2O2: {
    formula: 'H₂O₂', latex: '\\mathrm{H_2O_2}', name: '过氧化氢分子', charge: 0, color: '#4fa4c8',
    atoms: [
      atom('Oa', 'O', [-0.6, 0, 0]), atom('Ob', 'O', [0.6, 0, 0]),
      atom('H1', 'H', [-1.12, 0.55, 0.2]), atom('H2', 'H', [1.12, -0.55, -0.2])
    ],
    bonds: [bond('Oa', 'Ob'), bond('Oa', 'H1'), bond('Ob', 'H2')]
  },
  CH4: {
    formula: 'CH₄', latex: '\\mathrm{CH_4}', name: '甲烷分子', charge: 0, color: '#4b6277',
    atoms: [
      atom('C', 'C', [0, 0, 0]), atom('H1', 'H', [0.72, 0.72, 0.72]),
      atom('H2', 'H', [0.72, -0.72, -0.72]), atom('H3', 'H', [-0.72, 0.72, -0.72]),
      atom('H4', 'H', [-0.72, -0.72, 0.72])
    ],
    bonds: [bond('C', 'H1'), bond('C', 'H2'), bond('C', 'H3'), bond('C', 'H4')]
  },
  CO2: {
    formula: 'CO₂', latex: '\\mathrm{CO_2}', name: '二氧化碳分子', charge: 0, color: '#50667a',
    atoms: [atom('C', 'C', [0, 0, 0]), atom('Oa', 'O', [-1.05, 0, 0]), atom('Ob', 'O', [1.05, 0, 0])],
    bonds: [bond('C', 'Oa', 2), bond('C', 'Ob', 2)]
  },
  CO: {
    formula: 'CO', latex: '\\mathrm{CO}', name: '一氧化碳分子', charge: 0, color: '#6a7887',
    atoms: [atom('C', 'C', [-0.5, 0, 0]), atom('O', 'O', [0.5, 0, 0])],
    bonds: [bond('C', 'O', 3)]
  },
  NaCl: {
    formula: 'NaCl', latex: '\\mathrm{NaCl}', name: '氯化钠晶体单元', charge: 0, color: '#7c6ed4',
    atoms: [atom('Na', 'Na', [-0.66, 0, 0], 1), atom('Cl', 'Cl', [0.66, 0, 0], -1)],
    bonds: [bond('Na', 'Cl', 'ionic')]
  },
  AgCl: {
    formula: 'AgCl', latex: '\\mathrm{AgCl}', name: '氯化银沉淀', charge: 0, color: '#aab4bd',
    atoms: [atom('Ag', 'Ag', [-0.62, 0, 0], 1), atom('Cl', 'Cl', [0.62, 0, 0], -1)],
    bonds: [bond('Ag', 'Cl', 'ionic')]
  },
  SO2: {
    formula: 'SO₂', latex: '\\mathrm{SO_2}', name: '二氧化硫分子', charge: 0, color: '#d2a71f',
    atoms: [atom('S', 'S', [0, 0, 0]), atom('Oa', 'O', [-0.82, 0.72, 0]), atom('Ob', 'O', [0.82, 0.72, 0])],
    bonds: [bond('S', 'Oa', 2), bond('S', 'Ob', 2)]
  },
  SO3: {
    formula: 'SO₃', latex: '\\mathrm{SO_3}', name: '三氧化硫分子', charge: 0, color: '#c99422',
    atoms: [
      atom('S', 'S', [0, 0, 0]), atom('O1', 'O', [0, 1.05, 0]),
      atom('O2', 'O', [-0.91, -0.52, 0]), atom('O3', 'O', [0.91, -0.52, 0])
    ],
    bonds: [bond('S', 'O1', 2), bond('S', 'O2', 2), bond('S', 'O3', 2)]
  },
  C2H4: {
    formula: 'C₂H₄', latex: '\\mathrm{C_2H_4}', name: '乙烯分子', charge: 0, color: '#455c70',
    atoms: [
      atom('C1', 'C', [-0.68, 0, 0]), atom('C2', 'C', [0.68, 0, 0]),
      atom('H1', 'H', [-1.18, 0.76, 0]), atom('H2', 'H', [-1.18, -0.76, 0]),
      atom('H3', 'H', [1.18, 0.76, 0]), atom('H4', 'H', [1.18, -0.76, 0])
    ],
    bonds: [bond('C1', 'C2', 2), bond('C1', 'H1'), bond('C1', 'H2'), bond('C2', 'H3'), bond('C2', 'H4')]
  },
  C2H6: {
    formula: 'C₂H₆', latex: '\\mathrm{C_2H_6}', name: '乙烷分子', charge: 0, color: '#455c70',
    atoms: [
      atom('C1', 'C', [-0.68, 0, 0]), atom('C2', 'C', [0.68, 0, 0]),
      atom('H1', 'H', [-1.2, 0.78, 0]), atom('H2', 'H', [-1.2, -0.78, 0]),
      atom('H3', 'H', [-0.68, 0, 0.95]), atom('H4', 'H', [1.2, 0.78, 0]),
      atom('H5', 'H', [1.2, -0.78, 0]), atom('H6', 'H', [0.68, 0, -0.95])
    ],
    bonds: [
      bond('C1', 'C2'), bond('C1', 'H1'), bond('C1', 'H2'), bond('C1', 'H3'),
      bond('C2', 'H4'), bond('C2', 'H5'), bond('C2', 'H6')
    ]
  }
}

export function pickSpecies(...ids) {
  return Object.fromEntries(ids.map((id) => [id, speciesLibrary[id]]))
}

export default speciesLibrary
