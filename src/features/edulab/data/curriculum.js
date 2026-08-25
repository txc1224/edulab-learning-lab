import { expandCurriculum } from './expanded-curriculum.js'

const question = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation })

export const curriculum = [
  {
    id: 'junior-upper',
    stage: 'junior',
    stageLabel: '初中',
    title: '九年级上册',
    shortTitle: '九上',
    description: '从实验现象走向分子、原子和化学方程式',
    chapters: [
      {
        id: 'ju-air',
        title: '第二单元 我们周围的空气',
        shortTitle: '空气与氧气',
        lessons: [
          {
            id: 'ju-oxygen-preparation',
            title: '实验室制取氧气',
            reactionId: 'oxygen-preparation',
            textbookPosition: '人教版·九年级上册·第二单元「我们周围的空气」',
            summary: '用过氧化氢制氧气理解催化剂、气体生成和质量守恒。',
            objectives: ['描述过氧化氢分解的现象', '正确书写催化剂条件', '从原子重组解释质量守恒'],
            phenomenon: '加入二氧化锰后迅速产生大量气泡；把带火星的木条伸入集气瓶，木条复燃。',
            macroExplanation: '过氧化氢在二氧化锰催化下分解为水和氧气，氧气从溶液中逸出。',
            microExplanation: '过氧化氢分子中的氢、氧原子重新组合，原子的种类和数目保持不变。',
            conditions: '二氧化锰写在箭头上方，表示催化剂，不是反应物。',
            keyPoints: ['氧气用带火星木条检验', '催化剂改变速率，不改变产物和总质量'],
            commonMistakes: ['把 MnO₂ 写在等号左侧', '把“木条复燃”写成“氧气燃烧”'],
            checkQuestion: question('二氧化锰在反应中的作用是什么？', ['生成氧气', '作催化剂', '增加氧元素'], 1, '二氧化锰改变反应速率，反应前后质量和化学性质基本不变。')
          }
        ]
      },
      {
        id: 'ju-water',
        title: '第四单元 自然界的水',
        shortTitle: '自然界的水',
        lessons: [
          {
            id: 'ju-water-electrolysis',
            title: '水的组成与电解',
            reactionId: 'water-electrolysis',
            textbookPosition: '人教版·九年级上册·第四单元「自然界的水」',
            summary: '结合两极气体的检验，从实验事实推断水由氢、氧元素组成。',
            objectives: ['说出两极气体及体积关系', '用分子分成原子解释化学变化', '区分实验结论与实验现象'],
            phenomenon: '两支玻璃管内都有气泡，负极气体体积约为正极的 2 倍；两种气体分别可燃和能使带火星木条复燃。',
            macroExplanation: '通电时水分解成氢气和氧气，据此说明水由氢、氧元素组成。',
            microExplanation: '水分子分成氢、氧原子，原子重新组合成氢分子和氧分子。',
            conditions: '必须写“通电”，不能写成“加热”；实验体积比是约 2∶1。',
            keyPoints: ['正氧负氢', '氢气与氧气体积比约为 2∶1'],
            commonMistakes: ['由体积比直接写出水分子中原子个数比', '把气体体积比写反'],
            checkQuestion: question('电解水时，负极产生的气体是？', ['氧气', '氢气', '水蒸气'], 1, '负极产生氢气，体积约为正极氧气的 2 倍。')
          }
        ]
      },
      {
        id: 'ju-equations',
        title: '第五单元 化学方程式',
        shortTitle: '化学方程式',
        lessons: [
          {
            id: 'ju-equation-conservation',
            title: '从微观图配平方程式',
            reactionId: 'methane-combustion',
            textbookPosition: '人教版·九年级上册·第五单元「化学方程式」',
            summary: '跟踪每个原子的去向，理解配平是在保证反应前后原子数相等。',
            objectives: ['理解质量守恒的微观原因', '用最小整数比配平方程式', '区分化学式下标与化学计量数'],
            phenomenon: '甲烷燃烧产生明亮的蓝色火焰，放出热量；干冷烧杯内壁出现水雾，石灰水可检验二氧化碳。',
            macroExplanation: '甲烷和氧气反应生成二氧化碳和水，参加反应的各物质质量总和等于生成物质量总和。',
            microExplanation: '碳、氢、氧原子只改变组合方式，种类、数目和质量均不变。',
            conditions: '先写正确化学式，再调整化学计量数；绝不能改化学式下标。',
            keyPoints: ['配平本质是原子守恒', '化学计量数取最简整数比'],
            commonMistakes: ['通过修改 H₂O 或 CO₂ 的下标配平', '漏写点燃条件'],
            checkQuestion: question('配平化学方程式时可以改变什么？', ['化学式下标', '化学计量数', '元素符号'], 1, '配平只能改变化学式前的计量数。')
          }
        ]
      },
      {
        id: 'ju-fuels',
        title: '第七单元 燃料及其利用',
        shortTitle: '燃料与能量',
        lessons: [
          {
            id: 'ju-methane-combustion',
            title: '甲烷燃烧与燃料利用',
            reactionId: 'methane-combustion',
            textbookPosition: '人教版·九年级上册·第七单元「燃料及其利用」',
            summary: '从产物检验、能量释放和充分燃烧三个角度认识气体燃料。',
            objectives: ['写出甲烷完全燃烧方程式', '设计水和二氧化碳的检验顺序', '理解充分燃烧的意义'],
            phenomenon: '甲烷燃烧放热；火焰上方的干冷烧杯出现水雾，生成气体能使澄清石灰水变浑浊。',
            macroExplanation: '甲烷完全燃烧生成水和二氧化碳并释放能量。氧气不足时可能发生不完全燃烧。',
            microExplanation: '甲烷和氧气中的原子重新组合成更稳定的二氧化碳和水分子。',
            conditions: '点燃可提供启动反应的能量；使用可燃性气体前必须验纯。',
            keyPoints: ['先检验水，再检验二氧化碳', '通风和充足供氧有利于完全燃烧'],
            commonMistakes: ['用石灰水同时检验水和二氧化碳', '点燃未验纯的可燃气体'],
            checkQuestion: question('检验甲烷燃烧的两种产物时，合理顺序是？', ['先检验水，再检验二氧化碳', '先检验二氧化碳，再检验水', '顺序没有影响'], 0, '后续溶液可能带入水，因此通常先用干冷装置确认水。')
          }
        ]
      }
    ]
  },
  {
    id: 'junior-lower',
    stage: 'junior',
    stageLabel: '初中',
    title: '九年级下册',
    shortTitle: '九下',
    description: '用离子和活动性解释溶液中的常见反应',
    chapters: [
      {
        id: 'jl-metals',
        title: '第八单元 金属和金属材料',
        shortTitle: '金属',
        lessons: [
          {
            id: 'jl-magnesium-acid',
            title: '金属与酸的反应',
            reactionId: 'magnesium-acid',
            textbookPosition: '人教版·九年级下册·第八单元「金属和金属材料」',
            summary: '从镁和稀盐酸的反应认识置换反应及金属活动性。',
            objectives: ['描述金属与酸的典型现象', '判断置换反应', '用金属活动性解释能否反应'],
            phenomenon: '镁条表面迅速产生气泡并逐渐溶解，容器外壁发热，生成气体可燃。',
            macroExplanation: '镁置换出盐酸中的氢，生成氯化镁和氢气。',
            microExplanation: 'Mg 原子变成 Mg²⁺，H⁺ 变成 H₂；Cl⁻ 在反应前后没有改变。',
            conditions: '使用稀盐酸；判断反应时还要考虑酸的性质和金属表面状态。',
            keyPoints: ['生成气体是氢气', '置换反应是单质和化合物生成另一单质和化合物'],
            commonMistakes: ['认为所有金属都能与所有酸放出氢气', '漏写氢气上升符号'],
            checkQuestion: question('镁与稀盐酸反应的核心微粒是？', ['Mg 与 H⁺', 'Mg 与 Cl⁻', 'H⁺ 与 Cl⁻'], 0, 'Cl⁻ 未参与核心变化，实际发生电子转移的是 Mg 与 H⁺。')
          },
          {
            id: 'jl-iron-copper',
            title: '铁与硫酸铜溶液',
            reactionId: 'iron-copper',
            textbookPosition: '人教版·九年级下册·第八单元「金属和金属材料」',
            summary: '通过颜色和固体变化比较铁、铜的金属活动性。',
            objectives: ['描述铁置换铜的现象', '根据置换实验比较活动性', '写出对应化学方程式'],
            phenomenon: '铁表面出现红色固体，蓝色溶液逐渐变浅并趋向浅绿色。',
            macroExplanation: '铁把铜从硫酸铜溶液中置换出来，说明铁比铜活泼。',
            microExplanation: 'Fe 变为 Fe²⁺ 进入溶液，Cu²⁺ 变为 Cu 附着在铁表面。',
            conditions: '铁制品表面若有锈或油污，应先打磨；不要把“红色固体”写成“铜离子”。',
            keyPoints: ['固体颜色和溶液颜色要分别描述', '结论比较的是特定金属的活动性'],
            commonMistakes: ['把生成物写成 Fe₂(SO₄)₃', '只写溶液变色而漏写铁表面析出铜'],
            checkQuestion: question('该实验能得到的活动性结论是？', ['Cu > Fe', 'Fe > Cu', 'Fe = Cu'], 1, '较活泼的铁能从铜盐溶液中置换出铜。')
          }
        ]
      },
      {
        id: 'jl-acids-bases',
        title: '第十单元 酸和碱',
        shortTitle: '酸和碱',
        lessons: [
          {
            id: 'jl-neutralization',
            title: '酸和碱的中和反应',
            reactionId: 'acid-base-neutralization',
            textbookPosition: '人教版·九年级下册·第十单元「酸和碱」',
            summary: '借助指示剂判断无明显现象的中和反应，并观察真正发生变化的微粒。',
            objectives: ['说出中和反应的定义', '用指示剂判断反应发生', '写出中和反应的微观实质'],
            phenomenon: '滴有酚酞的氢氧化钠溶液呈红色，逐滴加入稀盐酸并振荡，红色逐渐褪去。',
            macroExplanation: '酸与碱反应生成盐和水；该反应没有沉淀或气泡，要借助指示剂观察。',
            microExplanation: 'H⁺ 与 OH⁻ 结合生成 H₂O，Na⁺ 与 Cl⁻ 是旁观离子。',
            conditions: '酸要逐滴加入并不断振荡，指示剂只帮助判断，不参与方程式。',
            keyPoints: ['中和反应的生成物是盐和水', '微观实质为 H⁺ + OH⁻ → H₂O'],
            commonMistakes: ['认为无明显现象就是没有反应', '把恰好褪色等同于加入了过量盐酸'],
            checkQuestion: question('盐酸和氢氧化钠反应的实质是？', ['Na⁺ 与 Cl⁻ 结合', 'H⁺ 与 OH⁻ 结合成水', '盐酸挥发'], 1, 'Na⁺、Cl⁻ 在反应前后仍在溶液中。')
          }
        ]
      },
      {
        id: 'jl-salts',
        title: '第十一单元 盐 化肥',
        shortTitle: '盐与复分解',
        lessons: [
          {
            id: 'jl-silver-chloride',
            title: '生成沉淀的复分解反应',
            reactionId: 'silver-chloride-precipitation',
            textbookPosition: '人教版·九年级下册·第十一单元「盐 化肥」',
            summary: '通过氯化银沉淀理解溶液中复分解反应发生的条件。',
            objectives: ['识别沉淀现象', '判断复分解反应能否发生', '找出实际结合的离子'],
            phenomenon: '硝酸银溶液与氯化钠溶液混合，立即出现白色沉淀。',
            macroExplanation: '两种化合物交换成分，生成难溶的氯化银，使反应能够进行。',
            microExplanation: 'Ag⁺ 和 Cl⁻ 结合成 AgCl 固体，Na⁺ 和 NO₃⁻ 仍在溶液中。',
            conditions: '反应物在溶液中可提供相应离子；生成沉淀是复分解反应发生的常见条件之一。',
            keyPoints: ['白色沉淀为 AgCl', '净离子式删除旁观离子'],
            commonMistakes: ['把所有白色沉淀都判断为 AgCl', '离子方程式中保留 Na⁺ 和 NO₃⁻'],
            checkQuestion: question('该反应中没有发生变化的离子是？', ['Ag⁺ 和 Cl⁻', 'Na⁺ 和 NO₃⁻', 'Ag⁺ 和 NO₃⁻'], 1, 'Na⁺ 和 NO₃⁻ 反应前后都以自由离子存在。')
          }
        ]
      }
    ]
  },
  {
    id: 'senior-one',
    stage: 'senior',
    stageLabel: '高中',
    title: '高一',
    shortTitle: '高一',
    description: '从离子反应、氧化还原到元素化合物',
    chapters: [
      {
        id: 'so-chapter-one',
        title: '第一章 物质及其变化',
        shortTitle: '物质及其变化',
        lessons: [
          {
            id: 'so-ionic-reaction',
            title: '离子反应与沉淀生成',
            reactionId: 'silver-chloride-precipitation',
            textbookPosition: '人教版·高中化学必修第一册·第一章「物质及其变化」',
            summary: '从电解质在水中的存在形式出发，建立离子方程式的书写规则。',
            objectives: ['判断物质能否拆写为离子', '删除方程两侧相同微粒', '检查元素和电荷守恒'],
            phenomenon: '两种无色溶液混合，快速生成白色难溶固体。',
            macroExplanation: '溶液中生成 AgCl 沉淀，导致自由离子浓度降低，反应向生成物方向进行。',
            microExplanation: 'Ag⁺ 和 Cl⁻ 结合形成晶体，其余离子在反应前后没有改变。',
            conditions: '强电解质在水溶液中按规则拆写；沉淀、气体、弱电解质和单质不拆。',
            keyPoints: ['离子方程式既守元素也守电荷', '“可拆”取决于物质状态和电解质强弱'],
            commonMistakes: ['把 AgCl 沉淀拆成离子', '约去反应物与生成物中系数不相等的离子'],
            checkQuestion: question('离子方程式中 AgCl 应怎样书写？', ['写成 Ag⁺ + Cl⁻', '写成 AgCl↓', '省略不写'], 1, '难溶沉淀保留化学式，并标注沉淀符号。')
          }
        ]
      },
      {
        id: 'so-sodium-chlorine',
        title: '第二章 海水中的重要元素——钠和氯',
        shortTitle: '钠和氯',
        lessons: [
          {
            id: 'so-sodium-water',
            title: '钠与水的反应',
            reactionId: 'sodium-water',
            textbookPosition: '人教版·高中化学必修第一册·第二章「海水中的重要元素——钠和氯」',
            summary: '把宏观的“浮、熔、游、响、红”逐项对应到反应原理。',
            objectives: ['解释钠与水的实验现象', '写出离子方程式', '从电子转移判断氧化剂和还原剂'],
            phenomenon: '钠浮在水面，熔成小球并快速游动，发出嘶嘶声；滴有酚酞的水变红。',
            macroExplanation: '钠与水剧烈反应，生成氢氧化钠和氢气并放热。',
            microExplanation: 'Na 失去电子成为 Na⁺，水中的氢得到电子生成 H₂，溶液中 OH⁻ 增多。',
            conditions: '取绿豆大小的钠，用滤纸吸干煤油后实验；禁止用手直接接触。',
            keyPoints: ['现象与性质逐项对应', 'Na 是还原剂，H₂O 是氧化剂'],
            commonMistakes: ['认为“红”是钠燃烧产生红色火焰', '离子方程式漏写水或电荷不守恒'],
            checkQuestion: question('钠与水反应中，作氧化剂的是？', ['Na', 'H₂O', 'NaOH'], 1, '水中的氢元素化合价降低，H₂O 得到电子作氧化剂。')
          },
          {
            id: 'so-sodium-chlorine-reaction',
            title: '钠与氯气的反应',
            reactionId: 'sodium-chlorine',
            textbookPosition: '人教版·高中化学必修第一册·第二章「海水中的重要元素——钠和氯」',
            summary: '用电子转移和离子形成解释钠在氯气中燃烧。',
            objectives: ['描述钠在氯气中的现象', '标出电子转移方向和数目', '理解 NaCl 的离子晶体本质'],
            phenomenon: '钠在氯气中剧烈燃烧，产生黄色火焰和白烟，生成白色固体。',
            macroExplanation: '钠与氯气化合生成氯化钠，是放热的氧化还原反应。',
            microExplanation: 'Na 把电子转移给 Cl，形成 Na⁺ 与 Cl⁻；离子间静电作用形成晶体。',
            conditions: '反应需点燃；观察时区分火焰颜色、白烟和最终固体。',
            keyPoints: ['Na 被氧化、Cl₂ 被还原', '电子转移总数相等'],
            commonMistakes: ['把白烟描述成白雾', '把 NaCl 晶体理解成彼此独立的双原子分子'],
            checkQuestion: question('该反应中电子从哪里转移到哪里？', ['Cl 转移给 Na', 'Na 转移给 Cl', '电子没有转移'], 1, '钠失去电子，氯得到电子。')
          }
        ]
      },
      {
        id: 'so-iron',
        title: '第三章 铁 金属材料',
        shortTitle: '铁与金属材料',
        lessons: [
          {
            id: 'so-iron-copper-redox',
            title: '铁与铜离子的氧化还原',
            reactionId: 'iron-copper',
            textbookPosition: '人教版·高中化学必修第一册·第三章「铁 金属材料」',
            summary: '在初中置换反应基础上，用半反应和电子守恒重新解释。',
            objectives: ['判断氧化剂与还原剂', '写出氧化和还原半反应', '用电子守恒检查方程式'],
            phenomenon: '铁表面析出红色铜，溶液中 Cu²⁺ 减少，Fe²⁺ 增多。',
            macroExplanation: '铁把铜离子还原为铜，自身被氧化为亚铁离子。',
            microExplanation: 'Fe → Fe²⁺ + 2e⁻；Cu²⁺ + 2e⁻ → Cu，电子得失相等。',
            conditions: '在水溶液中讨论；硫酸根离子不参与核心电子转移。',
            keyPoints: ['氧化剂被还原，还原剂被氧化', '电子不出现在总离子方程式中'],
            commonMistakes: ['把氧化剂判断为 Fe', '只看是否含氧元素判断氧化还原'],
            checkQuestion: question('Fe + Cu²⁺ → Fe²⁺ + Cu 中的还原剂是？', ['Fe', 'Cu²⁺', 'Fe²⁺'], 0, 'Fe 失去电子、被氧化，因此是还原剂。')
          }
        ]
      },
      {
        id: 'so-structure',
        title: '第四章 物质结构 元素周期律',
        shortTitle: '结构与周期律',
        lessons: [
          {
            id: 'so-ionic-bond',
            title: '从电子层结构看离子键',
            reactionId: 'sodium-chlorine',
            textbookPosition: '人教版·高中化学必修第一册·第四章「物质结构 元素周期律」',
            summary: '联系原子结构、离子形成与宏观物质性质，避免把离子键画成共价小分子。',
            objectives: ['根据最外层电子解释得失电子倾向', '区分离子键与共价键', '用结构观点认识 NaCl'],
            phenomenon: '钠与氯气反应生成白色氯化钠固体。',
            macroExplanation: '活泼金属和活泼非金属形成高熔点的离子化合物。',
            microExplanation: 'Na⁺ 与 Cl⁻ 按一定空间结构排列，离子键是阴、阳离子间的静电作用。',
            conditions: '3D 画面只截取一个局部结构单元，不代表固体由独立 NaCl 分子组成。',
            keyPoints: ['离子键无方向性，晶体是大量离子的规则排列', '原子达到稳定结构不等于所有元素都满足同一种规则'],
            commonMistakes: ['把离子键等同于一根具体短棒', '说 NaCl 中存在 NaCl 分子'],
            checkQuestion: question('固体氯化钠中主要存在的是？', ['独立 NaCl 分子', 'Na⁺、Cl⁻ 形成的离子晶体', 'Na 与 Cl₂ 混合物'], 1, 'NaCl 固体由大量阴、阳离子规则排列构成。')
          }
        ]
      }
    ]
  },
  {
    id: 'senior-two',
    stage: 'senior',
    stageLabel: '高中',
    title: '高二',
    shortTitle: '高二',
    description: '用反应原理连接无机、能量、有机与工业生产',
    chapters: [
      {
        id: 'st-nonmetal',
        title: '第五章 化工生产中的重要非金属元素',
        shortTitle: '重要非金属',
        lessons: [
          {
            id: 'st-sulfur-dioxide-oxidation',
            title: '二氧化硫的催化氧化',
            reactionId: 'sulfur-dioxide-oxidation',
            textbookPosition: '人教版·高中化学必修第二册·第五章「化工生产中的重要非金属元素」',
            summary: '用硫酸工业中的关键反应理解催化、可逆与生产条件选择。',
            objectives: ['写出 SO₂ 催化氧化方程式', '理解可逆符号的含义', '从速率与限度权衡工业条件'],
            phenomenon: '该工业反应在转化器中进行，单凭肉眼不易直接判断转化程度，需要结合组成检测。',
            macroExplanation: 'SO₂ 与 O₂ 在催化剂作用下生成 SO₃，反应放热且可逆。',
            microExplanation: 'SO₂、O₂ 与 SO₃ 持续发生正、逆反应；平衡时宏观组成稳定但微观反应没有停止。',
            conditions: 'V₂O₅ 作催化剂并控制适宜温度；工业选择是速率、转化率和成本的综合结果。',
            keyPoints: ['催化剂同时加快正、逆反应', '平衡状态是动态的'],
            commonMistakes: ['把可逆反应理解为进行一会儿后反向', '认为催化剂会提高平衡转化率'],
            checkQuestion: question('达到化学平衡时，下列说法正确的是？', ['正逆反应都停止', '正逆反应速率相等', '反应物全部转化'], 1, '平衡是动态平衡，正、逆反应仍在以相等速率进行。')
          }
        ]
      },
      {
        id: 'st-energy',
        title: '第六章 化学反应与能量',
        shortTitle: '反应与能量',
        lessons: [
          {
            id: 'st-combustion-energy',
            title: '化学键变化与反应能量',
            reactionId: 'methane-combustion',
            textbookPosition: '人教版·高中化学必修第二册·第六章「化学反应与能量」',
            summary: '用“断键吸能、成键放能”解释甲烷燃烧为何总体放热。',
            objectives: ['区分吸热过程和放热反应', '从键能角度判断能量变化', '读懂反应能量示意图'],
            phenomenon: '甲烷点燃后持续燃烧并明显放热，产物为二氧化碳和水。',
            macroExplanation: '反应物总能量高于生成物总能量，能量差以热等形式释放。',
            microExplanation: '断开反应物中的化学键需要吸能，形成产物中的化学键放能；后者更多，因此总反应放热。',
            conditions: '“需要点燃”只说明反应存在活化能，不代表该反应总体吸热。',
            keyPoints: ['活化能与反应热不是同一概念', '比较的是全部断键吸能与全部成键放能'],
            commonMistakes: ['认为要点燃的反应一定吸热', '说断键释放能量'],
            checkQuestion: question('甲烷燃烧需要点燃但总体放热，是因为？', ['点燃后不再需要能量', '成键释放的能量大于断键吸收的能量', '氧气本身会放热'], 1, '启动需要跨过活化能，总能量变化由全部断键和成键共同决定。')
          }
        ]
      },
      {
        id: 'st-organic',
        title: '第七章 有机化合物',
        shortTitle: '有机化合物',
        lessons: [
          {
            id: 'st-ethene-addition',
            title: '乙烯的加成反应',
            reactionId: 'ethene-hydrogenation',
            textbookPosition: '人教版·高中化学必修第二册·第七章「有机化合物」',
            summary: '观察碳碳双键变化，建立加成反应的结构视角。',
            objectives: ['识别乙烯的碳碳双键', '说明加成反应特点', '根据结构变化判断产物'],
            phenomenon: '乙烯能使溴的四氯化碳溶液或溴水褪色；与氢气在催化条件下生成乙烷。',
            macroExplanation: '含碳碳双键的乙烯可以与氢气等物质发生加成反应。',
            microExplanation: '双键中的一部分作用发生变化，新原子分别连接到双键两端的碳原子。',
            conditions: '与氢气加成通常需要金属催化剂和加热；溴水褪色实验的条件不同。',
            keyPoints: ['加成后不生成小分子副产物', '用结构简式表示连接位置'],
            commonMistakes: ['把加成反应写成取代反应', '产物中仍保留碳碳双键'],
            checkQuestion: question('乙烯与氢气完全加成后生成？', ['乙烷', '乙醇', '甲烷'], 0, '两个氢原子分别加到双键两端，生成乙烷。')
          }
        ]
      },
      {
        id: 'st-sustainable',
        title: '第八章 化学与可持续发展',
        shortTitle: '可持续发展',
        lessons: [
          {
            id: 'st-catalyst-green-chemistry',
            title: '催化剂与绿色反应设计',
            reactionId: 'oxygen-preparation',
            textbookPosition: '人教版·高中化学必修第二册·第八章「化学与可持续发展」',
            summary: '以过氧化氢分解为模型，区分催化剂、原子利用和反应条件优化。',
            objectives: ['正确描述催化剂作用', '从产物和条件评价反应', '理解绿色化学是系统性目标'],
            phenomenon: '过氧化氢在二氧化锰作用下快速产生氧气，催化剂反应后仍可分离。',
            macroExplanation: '选择适宜催化剂可以降低反应所需的活化能、提高单位时间产量。',
            microExplanation: '催化剂提供新的反应路径，不改变反应前后元素守恒和最终产物。',
            conditions: '绿色评价还要考虑原料来源、能耗、安全、副产物和回收，不能只看是否使用催化剂。',
            keyPoints: ['催化剂不改变反应的总能量变化', '绿色化学关注全流程'],
            commonMistakes: ['认为催化剂越多产物总量一定越大', '把“有催化剂”直接等同于“零污染”'],
            checkQuestion: question('催化剂能直接改变的是？', ['反应速率', '元素种类', '平衡时的反应热'], 0, '催化剂改变反应路径和速率，不改变元素种类与总能量变化。')
          }
        ]
      }
    ]
  },
  {
    id: 'senior-three',
    stage: 'senior',
    stageLabel: '高中',
    title: '高三综合复习',
    shortTitle: '高三',
    description: '按专题回顾反应原理、实验探究与有机化学',
    chapters: []
  }
]

export const defaultLessonId = 'ju-water-electrolysis'

expandCurriculum(curriculum)

export function flattenLessons(volumes = curriculum) {
  return volumes.flatMap((volume) => volume.chapters.flatMap((chapter) => (
    chapter.lessons.map((lesson) => ({ ...lesson, volumeId: volume.id, chapterId: chapter.id }))
  )))
}

export function findLesson(lessonId, volumes = curriculum) {
  return flattenLessons(volumes).find((lesson) => lesson.id === lessonId) || null
}

export default curriculum
