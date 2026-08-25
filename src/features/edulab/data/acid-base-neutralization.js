const ion = (formula, latex, name, charge, element, color) => ({
  formula,
  latex,
  name,
  charge,
  color,
  atoms: [{ slot: 'X', element, position: [0, 0, 0], charge }],
  bonds: []
})

const acidBaseNeutralization = {
  meta: {
    title: '酸碱中和反应',
    subtitle: '盐酸与氢氧化钠在水溶液中生成水和氯化钠',
    accent: 'cyan',
    equations: [
      { label: '分子方程', latex: '\\mathrm{HCl + NaOH \\longrightarrow NaCl + H_2O}' },
      { label: '净离子方程', latex: '\\mathrm{H^+ + OH^- \\longrightarrow H_2O}' }
    ],
    molecularEquation: '\\mathrm{HCl + NaOH \\longrightarrow NaCl + H_2O}',
    netIonicEquation: '\\mathrm{H^+ + OH^- \\longrightarrow H_2O}'
  },
  conditions: {
    text: '水溶液'
  },
  species: {
    'H+': ion('H⁺', '\\mathrm{H^+}', '氢离子', 1, 'H', '#2d8eea'),
    'Na+': ion('Na⁺', '\\mathrm{Na^+}', '钠离子', 1, 'Na', '#8e62d9'),
    'Cl-': ion('Cl⁻', '\\mathrm{Cl^-}', '氯离子', -1, 'Cl', '#2daa70'),
    'OH-': {
      formula: 'OH⁻',
      latex: '\\mathrm{OH^-}',
      name: '氢氧根离子',
      charge: -1,
      color: '#199d87',
      atoms: [
        { slot: 'O', element: 'O', position: [0, 0, 0], charge: -1 },
        { slot: 'H', element: 'H', position: [0.8, 0.1, 0] }
      ],
      bonds: [{ a: 'O', b: 'H', order: 1 }]
    },
    H2O: {
      formula: 'H₂O',
      latex: '\\mathrm{H_2O}',
      name: '水分子',
      charge: 0,
      color: '#1e9ec0',
      atoms: [
        { slot: 'A', element: 'O', position: [0, 0, 0] },
        { slot: 'Ha', element: 'H', position: [-0.72, 0.55, 0] },
        { slot: 'Hb', element: 'H', position: [0.72, 0.55, 0] }
      ],
      bonds: [
        { a: 'A', b: 'Ha', order: 1 },
        { a: 'A', b: 'Hb', order: 1 }
      ]
    }
  },
  reactants: [
    { species: 'H+', position: [-4.5, 1.1, 0] },
    { species: 'OH-', position: [-2.5, 1.1, 0] },
    { species: 'Na+', position: [-4.5, -1.1, 0] },
    { species: 'Cl-', position: [-2.5, -1.1, 0] }
  ],
  products: [
    { species: 'H2O', position: [1.7, 0.7, 0] },
    { species: 'Na+', position: [4.3, -1.1, 0] },
    { species: 'Cl-', position: [4.3, 1.1, 0] }
  ],
  atomMap: [
    ['H+#1.X', 'H2O#1.Hb'],
    ['OH-#1.O', 'H2O#1.A'],
    ['OH-#1.H', 'H2O#1.Ha'],
    ['Na+#1.X', 'Na+#1.X'],
    ['Cl-#1.X', 'Cl-#1.X']
  ],
  steps: [
    {
      title: '水溶液中的离子',
      text: '盐酸和氢氧化钠进入水中后，分别形成 H⁺、Cl⁻、Na⁺ 和 OH⁻。Na⁺ 与 Cl⁻ 暂时不参与核心反应。'
    },
    {
      title: 'H⁺ 与 OH⁻ 结合',
      text: 'H⁺ 向 OH⁻ 靠近，新的 O–H 键形成，两个离子组合成稳定的水分子。'
    },
    {
      title: '中和完成与守恒',
      text: '反应后得到 H₂O，Na⁺ 和 Cl⁻ 仍留在溶液中。反应前后 H、O、Na、Cl 的数量和总电荷都没有改变。'
    }
  ],
  energy: {
    activation: 0.32,
    deltaH: -0.2,
    reactantLabel: 'H⁺ + OH⁻',
    productLabel: 'H₂O'
  }
}

export default acidBaseNeutralization
