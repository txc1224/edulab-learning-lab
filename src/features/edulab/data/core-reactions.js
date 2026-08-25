import acidBaseNeutralization from './acid-base-neutralization.js'
import { pickSpecies } from './species-library.js'

const coreReactions = {
  'oxygen-preparation': {
    meta: {
      title: '过氧化氢制氧气',
      subtitle: '二氧化锰催化过氧化氢分解，生成水和氧气',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{2H_2O_2 \\xrightarrow{MnO_2} 2H_2O + O_2 \\uparrow}' }
      ]
    },
    conditions: { text: 'MnO₂ 作催化剂' },
    species: pickSpecies('H2O2', 'H2O', 'O2'),
    reactants: [{ species: 'H2O2', count: 2 }],
    products: [{ species: 'H2O', count: 2 }, { species: 'O2' }],
    atomMap: [
      ['H2O2#1.Oa', 'H2O#1.A'], ['H2O2#1.H1', 'H2O#1.Ha'],
      ['H2O2#1.H2', 'H2O#1.Hb'], ['H2O2#1.Ob', 'O2#1.Oa'],
      ['H2O2#2.Oa', 'H2O#2.A'], ['H2O2#2.H1', 'H2O#2.Ha'],
      ['H2O2#2.H2', 'H2O#2.Hb'], ['H2O2#2.Ob', 'O2#1.Ob']
    ],
    steps: [
      { title: '催化分解开始', text: '二氧化锰改变反应速率，但反应前后质量和化学性质不变，不写进反应物或生成物。' },
      { title: '过氧键发生变化', text: '过氧化氢分子中的原子重新组合：一部分氧原子保留在水中，另一部分两两结合。' },
      { title: '氧气生成', text: '生成的氧分子逸出形成气泡。反应前后共有 4 个氢原子和 4 个氧原子。' }
    ],
    energy: { activation: 0.42, deltaH: -0.12, reactantLabel: 'H₂O₂', productLabel: 'H₂O + O₂' }
  },

  'water-electrolysis': {
    meta: {
      title: '水的电解',
      subtitle: '从分子重新组合理解水由氢、氧元素组成',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{2H_2O \\xrightarrow{通电} 2H_2 \\uparrow + O_2 \\uparrow}' }
      ]
    },
    conditions: { text: '通直流电' },
    species: pickSpecies('H2O', 'H2', 'O2'),
    reactants: [{ species: 'H2O', count: 2 }],
    products: [{ species: 'H2', count: 2 }, { species: 'O2' }],
    atomMap: [
      ['H2O#1.Ha', 'H2#1.Ha'], ['H2O#1.Hb', 'H2#1.Hb'],
      ['H2O#1.A', 'O2#1.Oa'], ['H2O#2.Ha', 'H2#2.Ha'],
      ['H2O#2.Hb', 'H2#2.Hb'], ['H2O#2.A', 'O2#1.Ob']
    ],
    steps: [
      { title: '水分子获得能量', text: '通电为反应提供能量，水分子中的 O–H 键发生变化。' },
      { title: '原子重新组合', text: '氢原子两两结合形成氢分子，氧原子两两结合形成氧分子。' },
      { title: '检验并比较气体', text: '正极得到氧气，负极得到氢气；两者体积比约为 1∶2。' }
    ],
    energy: { activation: 0.68, deltaH: 0.36, reactantLabel: 'H₂O', productLabel: 'H₂ + O₂' }
  },

  'methane-combustion': {
    meta: {
      title: '甲烷完全燃烧',
      subtitle: '燃料中的碳、氢原子与氧重新组合',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{CH_4 + 2O_2 \\xrightarrow{点燃} CO_2 + 2H_2O}' }
      ]
    },
    conditions: { text: '点燃' },
    species: pickSpecies('CH4', 'O2', 'CO2', 'H2O'),
    reactants: [{ species: 'CH4' }, { species: 'O2', count: 2 }],
    products: [{ species: 'CO2' }, { species: 'H2O', count: 2 }],
    atomMap: [
      ['CH4#1.C', 'CO2#1.C'], ['CH4#1.H1', 'H2O#1.Ha'],
      ['CH4#1.H2', 'H2O#1.Hb'], ['CH4#1.H3', 'H2O#2.Ha'],
      ['CH4#1.H4', 'H2O#2.Hb'], ['O2#1.Oa', 'CO2#1.Oa'],
      ['O2#1.Ob', 'CO2#1.Ob'], ['O2#2.Oa', 'H2O#1.A'],
      ['O2#2.Ob', 'H2O#2.A']
    ],
    steps: [
      { title: '达到着火点', text: '点燃使甲烷和氧气获得启动反应所需的能量。' },
      { title: '旧键断裂、新键形成', text: '反应物分子中的原子并未消失，而是重新组合为二氧化碳和水。' },
      { title: '放出热量', text: '生成更稳定的物质并释放能量；检验产物时要分别关注水和二氧化碳。' }
    ],
    energy: { activation: 0.58, deltaH: -0.48, reactantLabel: 'CH₄ + O₂', productLabel: 'CO₂ + H₂O' }
  },

  'magnesium-acid': {
    meta: {
      title: '镁与稀盐酸',
      subtitle: '活泼金属置换出酸中的氢',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{Mg + 2HCl \\longrightarrow MgCl_2 + H_2 \\uparrow}' },
        { label: '净离子方程', latex: '\\mathrm{Mg + 2H^+ \\longrightarrow Mg^{2+} + H_2 \\uparrow}' }
      ]
    },
    conditions: { text: '稀盐酸' },
    species: pickSpecies('Mg', 'H+', 'Mg2+', 'H2'),
    reactants: [{ species: 'Mg' }, { species: 'H+', count: 2 }],
    products: [{ species: 'Mg2+' }, { species: 'H2' }],
    atomMap: [
      ['Mg#1.X', 'Mg2+#1.X'], ['H+#1.X', 'H2#1.Ha'], ['H+#2.X', 'H2#1.Hb']
    ],
    steps: [
      { title: '镁接触酸液', text: '镁条表面有气泡产生，镁逐渐溶解，溶液温度通常升高。' },
      { title: '发生电子转移', text: '镁原子失去电子成为 Mg²⁺，H⁺ 得到电子后两两结合形成 H₂。' },
      { title: '置换反应完成', text: '氯离子在核心变化中没有改变，因此净离子方程式中不写 Cl⁻。' }
    ],
    energy: { activation: 0.3, deltaH: -0.22, reactantLabel: 'Mg + H⁺', productLabel: 'Mg²⁺ + H₂' }
  },

  'iron-copper': {
    meta: {
      title: '铁置换硫酸铜中的铜',
      subtitle: '比较铁和铜的金属活动性',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{Fe + CuSO_4 \\longrightarrow FeSO_4 + Cu}' },
        { label: '净离子方程', latex: '\\mathrm{Fe + Cu^{2+} \\longrightarrow Fe^{2+} + Cu}' }
      ]
    },
    conditions: { text: '硫酸铜溶液' },
    species: pickSpecies('Fe', 'Cu2+', 'Fe2+', 'Cu'),
    reactants: [{ species: 'Fe' }, { species: 'Cu2+' }],
    products: [{ species: 'Fe2+' }, { species: 'Cu' }],
    atomMap: [['Fe#1.X', 'Fe2+#1.X'], ['Cu2+#1.X', 'Cu#1.X']],
    steps: [
      { title: '铁进入蓝色溶液', text: '铁表面逐渐覆盖红色固体，溶液蓝色变浅并逐渐呈浅绿色。' },
      { title: '电子从铁转移给铜离子', text: 'Fe 失去电子变成 Fe²⁺，Cu²⁺ 得到电子变成 Cu。' },
      { title: '活动性得出结论', text: '铁能从铜盐溶液中置换出铜，说明在该条件下铁比铜活泼。' }
    ],
    energy: { activation: 0.26, deltaH: -0.1, reactantLabel: 'Fe + Cu²⁺', productLabel: 'Fe²⁺ + Cu' }
  },

  'silver-chloride-precipitation': {
    meta: {
      title: '氯化银沉淀',
      subtitle: '溶液中的银离子与氯离子结合',
      equations: [
        { label: '示例方程式', latex: '\\mathrm{AgNO_3 + NaCl \\longrightarrow AgCl \\downarrow + NaNO_3}' },
        { label: '净离子方程', latex: '\\mathrm{Ag^+ + Cl^- \\longrightarrow AgCl \\downarrow}' }
      ]
    },
    conditions: { text: '水溶液' },
    species: pickSpecies('Ag+', 'Cl-', 'AgCl'),
    reactants: [{ species: 'Ag+' }, { species: 'Cl-' }],
    products: [{ species: 'AgCl' }],
    atomMap: [['Ag+#1.X', 'AgCl#1.Ag'], ['Cl-#1.X', 'AgCl#1.Cl']],
    steps: [
      { title: '两种溶液混合', text: '无色溶液混合后迅速出现白色沉淀。' },
      { title: '离子靠近并结合', text: 'Ag⁺ 与 Cl⁻ 形成难溶的 AgCl，离开自由移动的离子状态。' },
      { title: '写净离子方程', text: '只保留实际发生变化的微粒；Na⁺ 和 NO₃⁻ 属于旁观离子。' }
    ],
    energy: { activation: 0.12, deltaH: -0.08, reactantLabel: 'Ag⁺ + Cl⁻', productLabel: 'AgCl' }
  },

  'sodium-chlorine': {
    meta: {
      title: '钠在氯气中燃烧',
      subtitle: '从电子转移理解离子化合物的形成',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{2Na + Cl_2 \\xrightarrow{点燃} 2NaCl}' }
      ]
    },
    conditions: { text: '在氯气中点燃' },
    species: pickSpecies('Na', 'Cl2', 'NaCl'),
    reactants: [{ species: 'Na', count: 2 }, { species: 'Cl2' }],
    products: [{ species: 'NaCl', count: 2 }],
    atomMap: [
      ['Na#1.X', 'NaCl#1.Na'], ['Na#2.X', 'NaCl#2.Na'],
      ['Cl2#1.Cla', 'NaCl#1.Cl'], ['Cl2#1.Clb', 'NaCl#2.Cl']
    ],
    steps: [
      { title: '钠被点燃', text: '钠在氯气中剧烈燃烧，产生黄色火焰并生成白色固体。' },
      { title: '发生电子转移', text: '钠原子失去电子形成 Na⁺，氯原子得到电子形成 Cl⁻。' },
      { title: '离子晶体形成', text: '带相反电荷的离子相互吸引，形成氯化钠；宏观上不应理解为独立 NaCl 分子。' }
    ],
    energy: { activation: 0.5, deltaH: -0.44, reactantLabel: 'Na + Cl₂', productLabel: 'NaCl' }
  },

  'sodium-water': {
    meta: {
      title: '钠与水反应',
      subtitle: '观察活泼金属钠在水中的反应',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{2Na + 2H_2O \\longrightarrow 2NaOH + H_2 \\uparrow}' },
        { label: '离子方程式', latex: '\\mathrm{2Na + 2H_2O \\longrightarrow 2Na^+ + 2OH^- + H_2 \\uparrow}' }
      ]
    },
    conditions: { text: '常温水中' },
    species: pickSpecies('Na', 'H2O', 'Na+', 'OH-', 'H2'),
    reactants: [{ species: 'Na', count: 2 }, { species: 'H2O', count: 2 }],
    products: [{ species: 'Na+', count: 2 }, { species: 'OH-', count: 2 }, { species: 'H2' }],
    atomMap: [
      ['Na#1.X', 'Na+#1.X'], ['Na#2.X', 'Na+#2.X'],
      ['H2O#1.A', 'OH-#1.O'], ['H2O#1.Ha', 'OH-#1.H'],
      ['H2O#1.Hb', 'H2#1.Ha'], ['H2O#2.A', 'OH-#2.O'],
      ['H2O#2.Ha', 'OH-#2.H'], ['H2O#2.Hb', 'H2#1.Hb']
    ],
    steps: [
      { title: '钠浮在水面', text: '钠的密度小于水，反应放热使钠熔成小球，并推动它在水面游动。' },
      { title: '生成氢气', text: '钠失去电子，水中的氢得到电子形成 H₂，同时留下 OH⁻。' },
      { title: '溶液呈碱性', text: '反应后溶液中存在 Na⁺ 和 OH⁻，滴加酚酞会变红。' }
    ],
    energy: { activation: 0.2, deltaH: -0.4, reactantLabel: 'Na + H₂O', productLabel: 'NaOH + H₂' }
  },

  'sulfur-dioxide-oxidation': {
    meta: {
      title: '二氧化硫催化氧化',
      subtitle: '可逆反应与工业制硫酸的关键一步',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{2SO_2 + O_2 \\xrightleftharpoons[V_2O_5]{加热} 2SO_3}' }
      ]
    },
    conditions: { text: 'V₂O₅ 催化、加热' },
    species: pickSpecies('SO2', 'O2', 'SO3'),
    reactants: [{ species: 'SO2', count: 2 }, { species: 'O2' }],
    products: [{ species: 'SO3', count: 2 }],
    atomMap: [
      ['SO2#1.S', 'SO3#1.S'], ['SO2#1.Oa', 'SO3#1.O1'], ['SO2#1.Ob', 'SO3#1.O2'],
      ['SO2#2.S', 'SO3#2.S'], ['SO2#2.Oa', 'SO3#2.O1'], ['SO2#2.Ob', 'SO3#2.O2'],
      ['O2#1.Oa', 'SO3#1.O3'], ['O2#1.Ob', 'SO3#2.O3']
    ],
    steps: [
      { title: '气体进入转化器', text: '二氧化硫和氧气在催化剂表面接触；催化剂提高反应速率。' },
      { title: '建立动态平衡', text: '正反应和逆反应同时进行，达到平衡时两者速率相等，并非反应停止。' },
      { title: '优化工业条件', text: '实际生产要综合考虑平衡转化率、反应速率、设备成本和安全。' }
    ],
    energy: { activation: 0.54, deltaH: -0.28, reactantLabel: 'SO₂ + O₂', productLabel: 'SO₃' }
  },

  'ethene-hydrogenation': {
    meta: {
      title: '乙烯与氢气加成',
      subtitle: '碳碳双键中的一根键打开并连接新原子',
      equations: [
        { label: '化学方程式', latex: '\\mathrm{CH_2{=}CH_2 + H_2 \\xrightarrow{Ni,\,加热} CH_3CH_3}' }
      ]
    },
    conditions: { text: 'Ni 催化、加热' },
    species: pickSpecies('C2H4', 'H2', 'C2H6'),
    reactants: [{ species: 'C2H4' }, { species: 'H2' }],
    products: [{ species: 'C2H6' }],
    atomMap: [
      ['C2H4#1.C1', 'C2H6#1.C1'], ['C2H4#1.C2', 'C2H6#1.C2'],
      ['C2H4#1.H1', 'C2H6#1.H1'], ['C2H4#1.H2', 'C2H6#1.H2'],
      ['C2H4#1.H3', 'C2H6#1.H4'], ['C2H4#1.H4', 'C2H6#1.H5'],
      ['H2#1.Ha', 'C2H6#1.H3'], ['H2#1.Hb', 'C2H6#1.H6']
    ],
    steps: [
      { title: '识别碳碳双键', text: '乙烯分子含有碳碳双键，这是它容易发生加成反应的结构基础。' },
      { title: '双键与氢氢键变化', text: '双键中的一部分作用和 H–H 键发生变化，两个氢原子分别连接到两个碳原子。' },
      { title: '生成饱和烃', text: '产物乙烷只含碳碳单键；加成反应中不生成额外小分子。' }
    ],
    energy: { activation: 0.46, deltaH: -0.2, reactantLabel: 'C₂H₄ + H₂', productLabel: 'C₂H₆' }
  },

  'acid-base-neutralization': acidBaseNeutralization
}

export const defaultReactionId = 'water-electrolysis'

export function getReactionSpec(reactionId) {
  return coreReactions[reactionId] || null
}

export default coreReactions
