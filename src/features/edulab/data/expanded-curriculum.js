import { createChapter, createLesson, quiz } from './curriculum/lesson-builder.js'

const topic = ({
  id, title, kind = 'concept', summary, items, takeaway,
  observation = `${title}中可以从实验事实和典型例子建立清晰的判断依据。`,
  macro = `${title}需要把概念、规律和实际应用联系起来理解。`,
  micro = `从微观粒子、结构或数量关系看，${title}都有对应的模型。`,
  boundary = '先写清研究对象、条件和适用范围，再下结论。',
  objectives = ['说出核心概念和判断依据', '联系一个典型例子', '用规范语言解释现象'],
  keyPoints = ['概念要有对象和条件', '结论必须有证据或模型支持'],
  mistakes = ['只背结论而不看适用条件', '把现象、结论和原因混写'],
  check = quiz(`关于“${title}”，更准确的学习方式是？`, ['先明确对象和条件，再用证据解释', '只记一句结论即可', '所有情况都套同一个结论'], 0, '化学结论必须和对象、条件及证据对应。')
}) => createLesson({ id, title, kind, summary, objectives, observation, macro, micro, boundary, keyPoints, mistakes, check, visualTitle: title, visual: items, takeaway })

const juniorUpper = [
  createChapter('ju-intro', '第一单元 走进化学世界', '走进化学世界', [
    topic({ id: 'ju-changes-properties', title: '物质的变化和性质', summary: '用“有没有新物质生成”区分变化，再区分变化与性质。', items: [['观察过程', '记录状态、颜色、气体、沉淀等证据'], ['寻找新物质', '比较变化前后的物质种类'], ['判断类别', '无新物质是物理变化，有新物质是化学变化']], takeaway: '先找新物质，再给变化分类。', check: quiz('判断化学变化的根本依据是？', ['生成新物质', '颜色改变', '产生热量'], 0, '现象是线索，生成新物质才是化学变化的本质。') }),
    topic({ id: 'ju-chemistry-experiment', title: '化学是一门以实验为基础的科学', kind: 'experiment', summary: '学习提出问题、设计实验、观察记录和依据证据得出结论。', items: [['提出问题', '问题要具体且可以通过实验检验'], ['设计与操作', '设置变量、对照和安全措施'], ['记录证据', '如实记录现象和数据'], ['解释结论', '结论不超出证据支持范围']], takeaway: '实验不是看热闹，而是用证据回答问题。' }),
    topic({ id: 'ju-lab-basics', title: '走进化学实验室', kind: 'experiment', summary: '掌握药品取用、加热、装置连接、洗涤和事故处理等基础规范。', items: [['取用', '按用量和状态选择药匙、镊子或滴管'], ['操作', '检查气密性、控制加热和装置方向'], ['结束', '清洗仪器、整理台面并处理废物']], takeaway: '不拿、不尝、不直接闻，安全规则先于实验结果。' })
  ]),
  createChapter('ju-air', '第二单元 我们周围的空气', '空气与氧气', [
    topic({ id: 'ju-air-components', title: '空气的组成', kind: 'experiment', summary: '从测定空气里氧气含量的实验理解混合物、误差和空气保护。', items: [['密闭空气', '先记录瓶内空气体积'], ['消耗氧气', '足量红磷只消耗其中的氧气'], ['水补体积', '冷却后水进入，约占原体积五分之一']], takeaway: '测定不是看水，而是把氧气消耗转化为体积变化。' }),
    topic({ id: 'ju-oxygen-properties', title: '氧气的性质', kind: 'experiment', summary: '比较木炭、硫、铁丝等物质在空气和氧气中燃烧的不同。', items: [['空气中', '氧气浓度较低，部分燃烧现象较弱'], ['纯氧中', '接触氧分子更充分，燃烧通常更剧烈'], ['得到结论', '氧气能支持燃烧，化学性质较活泼']], takeaway: '“燃得更旺”证明支持燃烧，不等于氧气自己燃烧。' }),
    topic({ id: 'ju-oxygen-preparation-principle', title: '制取氧气的原理选择', kind: 'experiment', summary: '比较高锰酸钾、氯酸钾和过氧化氢制氧气的条件与装置。', items: [['选反应', '依据药品状态和反应速率选择路线'], ['控条件', '加热或催化剂分别写在箭头上方'], ['收集检验', '排水法收集，带火星木条复燃']], takeaway: '装置选择由反应条件和氧气性质共同决定。' }),
    topic({ id: 'ju-air-pollution', title: '空气质量与污染防治', summary: '认识污染物、空气质量指数和源头减排，理解环保不是一句口号。', items: [['污染来源', '颗粒物、SO₂、氮氧化物和臭氧等'], ['影响判断', '结合浓度、时间和暴露人群评价风险'], ['治理路径', '清洁能源、末端净化和公众减排并行']], takeaway: '先识别污染物，再匹配监测和治理手段。' })
  ]),
  createChapter('ju-particles', '第三单元 物质构成的奥秘', '物质构成', [
    topic({ id: 'ju-molecule-atom', title: '分子和原子', summary: '用粒子观点解释扩散、状态变化和化学变化。', items: [['宏观物质', '颜色、气味和状态是大量粒子的整体表现'], ['分子运动', '粒子不断运动并存在间隔'], ['化学变化', '分子分开、原子重组，形成新分子']], takeaway: '化学变化改变组合方式，不创造或消灭原子。' }),
    topic({ id: 'ju-atomic-structure', title: '原子的结构', summary: '认识原子核、核外电子和相对原子质量，理解原子为什么通常不显电性。', items: [['原子核', '质子带正电，中子不带电，质量集中于此'], ['核外电子', '带负电，在核外分层运动'], ['电性判断', '比较质子数与电子数判断整体电荷']], takeaway: '先看质子数定元素，再看电子数定电性。' }),
    topic({ id: 'ju-elements', title: '元素与元素符号', summary: '用质子数给原子分类，并学会从元素周期表读取基本信息。', items: [['元素', '宏观上描述物质由哪些元素组成'], ['原子', '微观上描述元素对应的粒子'], ['周期表', '按原子序数组织元素信息']], takeaway: '宏观说元素，微观说原子、分子或离子。' }),
    topic({ id: 'ju-ions', title: '离子的形成', summary: '从最外层电子得失理解阳离子、阴离子及离子化合物。', items: [['中性原子', '质子数与电子数相等'], ['电子得失', '原子核不变，只改变核外电子数'], ['带电离子', '失电子显正电，得电子显负电']], takeaway: '元素看质子，电性看质子与电子的差。' }),
    topic({ id: 'ju-periodic-table-reading', title: '元素周期表的初步认识', summary: '读懂周期、族、原子序数和相对原子质量的基本位置关系。', items: [['横行周期', '电子层数相同的元素处在同一周期'], ['纵列族', '最外层电子排布相似的元素性质有规律'], ['单元格信息', '原子序数、元素符号和相对原子质量']], takeaway: '周期表是把元素信息和性质规律放在一张图上。' })
  ]),
  createChapter('ju-water', '第四单元 自然界的水', '自然界的水', [
    topic({ id: 'ju-water-resources', title: '爱护水资源', summary: '认识水资源分布、节水和防治水污染，把化学知识用于环境问题。', items: [['认识有限', '可直接利用淡水只占很小比例'], ['减少消耗', '生活、农业、工业提高用水效率'], ['控制污染', '源头减量、分类处理、达标排放']], takeaway: '清洁水来自保护和治理，而不只是最后一次过滤。' }),
    topic({ id: 'ju-water-purification', title: '水的净化', kind: 'experiment', summary: '比较静置、吸附、过滤、消毒和蒸馏的作用边界。', items: [['沉淀与过滤', '除去较大和不溶性颗粒'], ['吸附与消毒', '改善色味并控制微生物'], ['蒸馏', '利用沸点差异进一步获得较纯的水']], takeaway: '先判断杂质类型，再选择分离方法。' }),
    topic({ id: 'ju-hard-water', title: '硬水和软水', kind: 'experiment', summary: '用肥皂水区分硬水和软水，理解硬水软化与生活中的水垢。', items: [['取样', '分别加入等量肥皂水并振荡'], ['看泡沫', '泡沫少且浮渣多提示硬水'], ['软化', '生活中可煮沸，实验室可蒸馏']], takeaway: '硬水不等于有毒水，关键是可溶性钙镁化合物含量较高。' }),
    'ju-water-electrolysis',
    topic({ id: 'ju-water-electrolysis-conclusion', title: '水的组成结论', summary: '结合电解水两极气体检验，从实验事实推断水由氢、氧元素组成。', items: [['正极气体', '能使带火星木条复燃，体积较小'], ['负极气体', '可燃，体积约为正极两倍'], ['得出结论', '水由氢元素和氧元素组成']], takeaway: '先记实验事实，再写元素组成和体积关系。' })
  ]),
  createChapter('ju-equations', '第五单元 化学方程式', '化学方程式', [
    'ju-equation-conservation',
    topic({ id: 'ju-mass-conservation', title: '质量守恒定律', kind: 'experiment', summary: '从反应前后质量测量理解原子种类、数目和质量守恒。', items: [['称量反应物', '在密闭或质量不逸出的装置中记录质量'], ['发生反应', '原子重新组合，可能出现气泡、沉淀或颜色变化'], ['再次称量', '总质量不变，说明原子守恒']], takeaway: '质量守恒的微观基础是原子种类、数目和质量不变。' }),
    topic({ id: 'ju-equation-information', title: '化学方程式的信息', kind: 'calculation', summary: '从化学方程式读取反应物、生成物、条件和粒子数量关系。', items: [['物质信息', '化学式说明反应前后有哪些物质'], ['条件信息', '点燃、加热、催化剂等写在箭头上方'], ['数量信息', '计量数给出粒子个数比和质量关系']], takeaway: '一条方程式同时承载事实、条件和定量关系。' }),
    topic({ id: 'ju-write-equations', title: '正确书写化学方程式', kind: 'calculation', summary: '遵循客观事实和质量守恒，完成化学式、配平、条件与状态符号。', items: [['写', '依据事实写正确化学式'], ['配', '用计量数使各元素原子数守恒'], ['标与查', '补条件、状态符号并检查最简比']], takeaway: '事实决定化学式，守恒决定计量数。' }),
    topic({ id: 'ju-stoichiometry', title: '利用方程式的简单计算', kind: 'calculation', summary: '把化学方程式中的计量关系转化为质量关系。', items: [['配平方程式', '确认反应事实和计量数'], ['建立质量比', '计量数乘相对分子质量'], ['列式求解', '统一单位并检查数量级']], takeaway: '粒子数比通过相对质量变成可测量的质量比。' })
  ]),
  createChapter('ju-carbon', '第六单元 碳和碳的氧化物', '碳与氧化物', [
    topic({ id: 'ju-carbon-allotropes', title: '金刚石、石墨和 C₆₀', summary: '比较同种碳元素形成的不同单质，建立结构决定性质的观念。', items: [['金刚石', '空间网状结构，硬度大，用于切割'], ['石墨', '层状结构，质软且能导电'], ['C₆₀', '笼状分子结构，进入材料研究']], takeaway: '组成相同不代表性质相同，关键还要看结构。' }),
    topic({ id: 'ju-carbon-dioxide-lab', title: '二氧化碳制取的研究', kind: 'experiment', summary: '依据反应物状态、条件和气体性质选择发生、收集与检验装置。', items: [['选反应', '石灰石与稀盐酸常温反应'], ['选装置', '固液常温型发生，向上排空气收集'], ['检验验满', '石灰水检验，瓶口操作验满']], takeaway: '装置选择由反应条件和气体性质决定。' }),
    topic({ id: 'ju-carbon-oxides', title: '二氧化碳和一氧化碳', summary: '对比 CO₂ 与 CO 的性质、用途和风险，理解组成相似却性质不同。', items: [['CO₂', '不燃烧、不支持燃烧，可使石灰水变浑浊'], ['CO', '可燃、可还原且有毒，无明显气味'], ['安全应用', '依据性质选用途并控制排放风险']], takeaway: '只差一个氧原子，结构与性质就可能明显不同。' }),
    topic({ id: 'ju-carbon-reduction', title: '木炭还原氧化铜', summary: '用碳的还原性理解氧化物失氧、碳得氧和金属冶炼。', items: [['混合加热', '黑色氧化铜与木炭粉充分接触'], ['现象判断', '固体颜色变化，生成气体使石灰水变浑浊'], ['联系冶炼', '碳夺取金属氧化物中的氧得到金属']], takeaway: '还原性就是夺取含氧物质中氧的能力。' })
  ]),
  createChapter('ju-fuels', '第七单元 燃料及其利用', '燃料与能量', [
    topic({ id: 'ju-combustion-fire', title: '燃烧和灭火', kind: 'experiment', summary: '用燃烧三要素解释点燃、持续燃烧、灭火和爆炸防护。', items: [['可燃物', '没有燃料就不能持续燃烧'], ['氧气', '隔绝空气可终止反应'], ['着火点', '降温到着火点以下可灭火']], takeaway: '燃烧要三项齐全，灭火只需切断一项。' }),
    'ju-methane-combustion',
    topic({ id: 'ju-methane-safety', title: '使用燃料的安全', kind: 'experiment', summary: '从燃气泄漏、验纯和通风理解可燃气体的安全使用。', items: [['泄漏判断', '先关阀、通风，不开关电器'], ['点燃前', '可燃气体必须验纯，避免爆炸性混合物'], ['燃烧后', '保持通风并检查 CO 和烟尘风险']], takeaway: '燃料安全的核心是控制浓度、火源和通风。' }),
    topic({ id: 'ju-fuels-environment', title: '燃料利用与环境', summary: '比较化石燃料和新能源，综合评价热值、排放、安全与可持续性。', items: [['资源来源', '储量、可再生性与开采影响'], ['能量利用', '热值、效率、储运与安全'], ['环境结果', '温室气体、污染物和废弃物']], takeaway: '好的能源方案要同时看效率、安全、环境和可持续。' })
  ])
]

const juniorLower = [
  createChapter('jl-metals', '第八单元 金属和金属材料', '金属', [
    topic({ id: 'jl-metal-properties', title: '金属材料的物理性质', summary: '从导电、导热、延展性和光泽认识金属共性与用途。', items: [['共性', '有金属光泽、导电导热、能延展'], ['差异', '密度、熔点、硬度和耐腐蚀性不同'], ['选材', '根据性能、成本和环境要求选择']], takeaway: '金属用途是性质、成本和加工条件共同决定的。' }),
    'jl-magnesium-acid',
    'jl-iron-copper',
    topic({ id: 'jl-alloys', title: '合金', summary: '理解合金为什么常比纯金属更适合工程和生活使用。', items: [['组成', '一种金属与其他元素形成的混合物'], ['结构', '不同微粒使金属层间移动受阻'], ['性能', '硬度、强度和耐腐蚀性通常得到改善']], takeaway: '合金不是新元素，而是性能更适合使用的材料。' }),
    topic({ id: 'jl-metal-corrosion', title: '金属锈蚀与防护', kind: 'experiment', summary: '用对比实验确定铁锈蚀需要水和氧气，并设计防护方案。', items: [['找条件', '干燥空气、煮沸水和普通水作对照'], ['看现象', '铁在水和氧气同时存在时更易生锈'], ['做防护', '涂漆、电镀、合金化或保持干燥']], takeaway: '防锈的本质是隔绝水、氧气或让金属更稳定。' })
  ]),
  createChapter('jl-solutions', '第九单元 溶液', '溶液', [
    topic({ id: 'jl-solution-composition', title: '溶液的组成', summary: '区分溶质、溶剂和溶液，理解均一稳定与溶解过程。', items: [['溶剂', '能溶解其他物质的液体'], ['溶质', '被溶解的物质，可以是固体、液体或气体'], ['溶液', '均一、稳定的混合物']], takeaway: '溶液是混合物，组成可通过质量守恒和浓度描述。' }),
    topic({ id: 'jl-solubility', title: '溶解度与溶解度曲线', kind: 'calculation', summary: '从曲线读取温度、溶解度、饱和溶液和结晶条件。', items: [['读曲线', '横轴温度，纵轴一定温度下的溶解度'], ['判状态', '曲线上、下方分别对应饱和和未饱和条件'], ['析晶', '降温或蒸发使溶液超过该温度溶解度']], takeaway: '曲线问题先看温度和溶液状态，再做溶质质量计算。' }),
    topic({ id: 'jl-solution-concentration', title: '一定溶质质量分数的溶液', kind: 'calculation', summary: '掌握溶质质量分数、配制和稀释的基本数量关系。', items: [['定义', '溶质质量分数＝溶质质量÷溶液质量'], ['配制', '称量、量取、溶解、装瓶并贴标签'], ['稀释', '稀释前后溶质质量不变']], takeaway: '质量分数计算的分母是溶液总质量，不是溶剂质量。' })
  ]),
  createChapter('jl-acids-bases', '第十单元 酸和碱', '酸和碱', [
    topic({ id: 'jl-acid-properties', title: '常见的酸', summary: '认识盐酸、硫酸的物理化学性质和使用安全。', items: [['共同性质', '能使紫色石蕊变红并与活泼金属反应'], ['典型反应', '与金属氧化物、碱和部分盐反应'], ['安全使用', '浓硫酸稀释时酸入水并不断搅拌']], takeaway: '酸的共同性质来自溶液中的 H⁺，不同酸还要看阴离子影响。' }),
    topic({ id: 'jl-base-properties', title: '常见的碱', summary: '认识氢氧化钠、氢氧化钙及碱的通性和用途。', items: [['共同性质', '能使紫色石蕊变蓝、酚酞变红'], ['典型反应', '与酸、非金属氧化物和部分盐反应'], ['安全使用', '强碱有腐蚀性，接触皮肤立即用大量水冲洗']], takeaway: '碱性与 OH⁻ 有关，强碱的腐蚀性不能等同于“有毒”。' }),
    'jl-neutralization',
    topic({ id: 'jl-ph-indicators', title: '酸碱指示剂和 pH', kind: 'experiment', summary: '用指示剂和 pH 试纸判断溶液酸碱性强弱。', items: [['指示剂', '颜色变化帮助判断酸碱性范围'], ['pH 试纸', '粗略测 pH，不能直接浸入原瓶'], ['强弱比较', 'pH 越小酸性越强，pH 越大碱性越强']], takeaway: '指示剂给颜色区间，pH 给酸碱强弱的数量线索。' })
  ]),
  createChapter('jl-salts', '第十一单元 盐 化肥', '盐与化肥', [
    topic({ id: 'jl-salt-properties', title: '常见的盐', summary: '认识氯化钠、碳酸钠、碳酸氢钠的用途和鉴别。', items: [['生活用盐', '氯化钠用于调味、腌制和医疗配液'], ['碳酸盐', '遇酸产生 CO₂，可用石灰水进一步检验'], ['合理使用', '依据性质选择用途和储存方式']], takeaway: '盐不是单一物质类别，阴、阳离子不同会带来不同性质。' }),
    'jl-silver-chloride',
    topic({ id: 'jl-fertilizers', title: '化肥的种类与使用', summary: '按营养元素认识氮肥、磷肥、钾肥和复合肥，关注合理施用。', items: [['氮肥', '促进枝叶生长，常含铵根或硝酸根'], ['磷钾肥', '影响根系、开花和抗病能力'], ['合理施肥', '测土配方，避免水体富营养化']], takeaway: '化肥要按作物、土壤和生长期精准使用。' }),
    topic({ id: 'jl-salt-reactions', title: '复分解反应发生条件', summary: '用沉淀、气体或水判断溶液中离子交换反应能否进行。', items: [['离子交换', '反应物在水中解离并重新组合'], ['驱动力', '生成沉淀、气体或弱电解质水'], ['净离子式', '删除反应前后不变的旁观离子']], takeaway: '复分解不是“交换就一定反应”，要有推动反应进行的结果。' })
  ]),
  createChapter('jl-life', '第十二单元 化学与生活', '化学与生活', [
    topic({ id: 'jl-nutrition', title: '人类重要的营养物质', summary: '认识蛋白质、糖类、油脂、维生素、无机盐和水的作用。', items: [['供能', '糖类和油脂提供能量，蛋白质兼具构建作用'], ['调节', '维生素和无机盐参与代谢与生理功能'], ['平衡', '合理膳食需要种类、比例和总量平衡']], takeaway: '营养不是越多越好，关键是种类齐全和比例合理。' }),
    topic({ id: 'jl-materials-life', title: '化学材料与健康', summary: '认识合成材料、金属材料和食品添加剂的合理使用。', items: [['材料性能', '结构和组成决定强度、耐热和耐腐蚀'], ['使用安全', '关注迁移、分解产物和使用条件'], ['回收利用', '分类、减量和再生降低环境负担']], takeaway: '化学材料既带来便利，也需要规范使用和全生命周期管理。' })
  ])
]

const seniorOne = [
  createChapter('so-chapter-one', '第一章 物质及其变化', '物质及其变化', [
    topic({ id: 'so-mixture-separation', title: '物质的分类与分离', kind: 'experiment', summary: '用混合物、纯净物、胶体和溶液的概念组织高中化学第一章。', items: [['分类', '纯净物与混合物、单质与化合物'], ['分散系', '分散质粒子大小影响外观和性质'], ['分离', '过滤、萃取、蒸馏和分液对应不同差异']], takeaway: '先判组成和分散状态，再选择分离方法。' }),
    'so-ionic-reaction',
    topic({ id: 'so-electrolytes', title: '电解质在水溶液中的反应', summary: '认识强弱电解质、离子共存和离子反应的条件。', items: [['电离', '电解质在水中形成可自由移动的离子'], ['离子反应', '实际参加反应的是变化的离子'], ['离子共存', '结合沉淀、气体、弱电解质判断能否共存']], takeaway: '离子方程式要同时守元素、电荷和反应事实。' }),
    topic({ id: 'so-redox-basics', title: '氧化还原反应基础', summary: '用化合价升降和电子转移判断氧化剂、还原剂及半反应。', items: [['价态变化', '元素化合价升高被氧化，降低被还原'], ['电子转移', '氧化剂得电子，还原剂失电子'], ['守恒检查', '电子得失总数相等']], takeaway: '氧化还原的本质是电子转移，化合价升降是外在表现。' })
  ]),
  createChapter('so-sodium-chlorine', '第二章 海水中的重要元素——钠和氯', '钠和氯', [
    'so-sodium-water',
    'so-sodium-chlorine-reaction',
    topic({ id: 'so-chlorine', title: '氯及其化合物', kind: 'experiment', summary: '认识氯气的黄绿色、有毒、强氧化性和漂白相关反应。', items: [['氯气', '黄绿色有刺激性气味的有毒气体'], ['与水', '部分反应生成盐酸和次氯酸'], ['消毒漂白', '次氯酸的强氧化性用于消毒，但需控制浓度']], takeaway: '漂白和消毒要关注有效成分、浓度与安全边界。' }),
    topic({ id: 'so-sodium-compounds', title: '钠的化合物', summary: '比较 Na₂O₂、Na₂CO₃、NaHCO₃ 的性质、用途和转化。', items: [['过氧化钠', '与水或 CO₂ 反应并放出 O₂'], ['碳酸钠', '溶液呈碱性，可用于玻璃和洗涤'], ['碳酸氢钠', '受热分解，常用于发酵和灭火器']], takeaway: '同一元素的不同化合物要从组成、结构和反应性分别比较。' })
  ]),
  createChapter('so-iron', '第三章 铁 金属材料', '铁与金属材料', [
    topic({ id: 'so-aluminum', title: '铝及其化合物', summary: '理解铝的两性氧化膜、铝盐和铝酸盐的转化。', items: [['铝表面', '致密氧化膜保护内部金属'], ['两性', 'Al₂O₃、Al(OH)₃ 可与酸和强碱反应'], ['应用', '轻质、耐腐蚀和合金性能适合交通材料']], takeaway: '两性物质既能与酸反应，也能与强碱反应。' }),
    'so-iron-copper-redox',
    topic({ id: 'so-iron-compounds', title: '铁的重要化合物', summary: '比较 Fe²⁺、Fe³⁺ 和铁的氧化物、氢氧化物的转化。', items: [['价态', 'Fe²⁺ 与 Fe³⁺ 颜色和氧化还原性不同'], ['检验', '利用沉淀颜色或显色反应判断离子'], ['转化', '氧化还原条件决定铁元素价态变化']], takeaway: '铁化合物的性质与铁元素价态密切相关。' }),
    topic({ id: 'so-metal-materials', title: '金属材料与资源利用', summary: '从矿石冶炼、合金设计和金属回收理解材料化学。', items: [['矿石冶炼', '还原氧化物得到金属，条件依金属活动性而定'], ['合金设计', '通过组成和组织调节性能'], ['循环利用', '回收金属可节约矿产和降低能耗']], takeaway: '材料选择和资源利用要同时考虑性能、成本与环境。' })
  ]),
  createChapter('so-structure', '第四章 物质结构 元素周期律', '结构与周期律', [
    topic({ id: 'so-atomic-model', title: '原子结构与核外电子排布', summary: '用电子层、能级和价电子解释元素性质周期性变化。', items: [['核电荷数', '确定元素身份和核外电子总数'], ['电子排布', '能级和电子层决定价电子状态'], ['价电子', '参与成键和反应，影响化学性质']], takeaway: '化学性质的周期性根源在于核外电子排布的周期性。' }),
    topic({ id: 'so-periodic-law', title: '元素周期律', summary: '沿周期和族比较原子半径、得失电子能力及最高价氧化物性质。', items: [['同周期', '核电荷数增加，原子半径和金属性有规律变化'], ['同主族', '价电子数相似，化学性质相近'], ['推断', '位置可以预测性质，性质也能反推位置']], takeaway: '周期表不是记忆表，而是性质预测工具。' }),
    'so-ionic-bond',
    topic({ id: 'so-chemical-bonds', title: '化学键与物质构成', summary: '区分离子键、共价键和金属键，解释物质宏观性质。', items: [['离子键', '阴、阳离子间静电作用形成晶体'], ['共价键', '原子间共用电子对形成分子或网状结构'], ['金属键', '金属阳离子与自由电子共同构成金属晶体']], takeaway: '先判断微粒和连接方式，再解释熔点、导电性等宏观性质。' })
  ])
]

const seniorTwo = [
  createChapter('st-nonmetal', '第五章 化工生产中的重要非金属元素', '重要非金属', [
    'st-sulfur-dioxide-oxidation',
    topic({ id: 'st-nitrogen', title: '氮气与氮的固定', summary: '理解氮气稳定性、自然固氮和工业合成氨的意义。', items: [['氮气', 'N≡N 键能大，常温下化学性质较稳定'], ['固氮', '把空气中的 N₂ 转化为可利用含氮化合物'], ['资源循环', '氮肥提高产量，也要防止过量造成污染']], takeaway: '稳定的氮气要转化为活性含氮物质才能进入生物和农业循环。' }),
    topic({ id: 'st-ammonia', title: '氨与铵盐', kind: 'experiment', summary: '认识氨的溶解性、碱性、还原性和铵根检验。', items: [['氨的性质', '极易溶于水，水溶液呈碱性'], ['工业价值', '合成氨是氮肥和硝酸工业的重要原料'], ['铵根检验', '与强碱共热生成有刺激性气味的氨']], takeaway: '氨既是重要原料，也需要关注泄漏、刺激性和排放安全。' }),
    topic({ id: 'st-nitric-acid', title: '硝酸与氮氧化物', summary: '比较硝酸的酸性、氧化性及 NO、NO₂ 的转化和污染。', items: [['硝酸', '强酸且具有氧化性，浓度和温度影响反应'], ['氮氧化物', 'NO 易被氧化为 NO₂，参与光化学污染'], ['治理', '尾气净化和燃烧条件优化降低排放']], takeaway: '氮化合物既服务于工业，也必须纳入污染控制。' }),
    topic({ id: 'st-sulfur-compounds', title: '硫及其化合物', summary: '串联硫、SO₂、SO₃、硫酸的转化与环境影响。', items: [['硫燃烧', '生成 SO₂ 并释放能量'], ['催化氧化', 'SO₂ 与 O₂ 生成 SO₃，工业上需控制条件'], ['硫酸', '重要化工原料，同时要防止酸雨和腐蚀']], takeaway: '工业流程要把反应原理、速率、平衡和环保一起考虑。' }),
    topic({ id: 'st-silicon', title: '硅及其化合物', summary: '认识硅、二氧化硅、硅酸盐与芯片、玻璃、水泥等材料。', items: [['二氧化硅', '网状结构，硬度高、熔点高'], ['硅酸盐材料', '玻璃、水泥、陶瓷来自不同配方和工艺'], ['半导体硅', '通过纯化和掺杂调节导电性能']], takeaway: '硅材料把无机结构知识连接到现代信息与建筑工业。' })
  ]),
  createChapter('st-energy', '第六章 化学反应与能量', '反应与能量', [
    'st-combustion-energy',
    topic({ id: 'st-energy-change', title: '化学反应与能量变化', kind: 'calculation', summary: '从断键吸能、成键放能和能量图判断放热与吸热。', items: [['断键', '断开反应物化学键需要吸收能量'], ['成键', '形成生成物化学键释放能量'], ['总变化', '成键放能大于断键吸能时反应总体放热']], takeaway: '活化能决定能否启动，反应热决定总体吸放热。' }),
    topic({ id: 'st-reaction-rate', title: '化学反应速率', kind: 'experiment', summary: '用浓度、温度、压强、接触面积和催化剂解释速率变化。', items: [['有效碰撞', '粒子碰撞频率和能量决定反应快慢'], ['改变条件', '温度、浓度、表面积等改变碰撞机会'], ['数据表达', '用单位时间浓度变化表示平均速率']], takeaway: '速率研究的是快慢，不等于反应能进行到什么程度。' }),
    topic({ id: 'st-chemical-battery', title: '化学电源', kind: 'experiment', summary: '从氧化还原和电子定向移动理解原电池与日常电池。', items: [['自发反应', '氧化还原反应释放化学能'], ['电子流动', '电子经外电路定向移动形成电流'], ['电源设计', '电极材料、电解质和隔膜影响性能与安全']], takeaway: '电池把自发氧化还原反应的化学能转化为电能。' }),
    topic({ id: 'st-electrolysis', title: '电解池与电能转化', kind: 'experiment', summary: '认识外加电源驱动非自发反应，比较电解池和原电池。', items: [['接通电源', '外加电能推动离子定向移动'], ['两极变化', '阴极还原、阳极氧化'], ['产物控制', '电解质、离子浓度和电极材料影响产物']], takeaway: '原电池放电，电解池用电；两者都遵循氧化还原规律。' })
  ]),
  createChapter('st-organic', '第七章 有机化合物', '有机化合物', [
    'st-ethene-addition',
    topic({ id: 'st-methane-structure', title: '甲烷的结构与取代', summary: '认识甲烷正四面体结构、稳定性和光照下的取代反应。', items: [['空间结构', '碳原子与四个氢原子形成正四面体'], ['燃烧', '完全燃烧生成 CO₂ 和 H₂O'], ['取代', '光照下氯原子逐步替代氢原子']], takeaway: '有机反应要同时看官能团、空间结构和反应条件。' }),
    topic({ id: 'st-ethene-structure', title: '乙烯的结构与加成', summary: '从碳碳双键解释乙烯的平面结构、加成和聚合。', items: [['双键', '双键限制旋转并影响空间结构'], ['加成', '新原子加到双键两端，不生成小分子'], ['聚合', '许多乙烯分子连接成聚乙烯长链']], takeaway: '官能团是判断有机物反应类型的重要线索。' }),
    topic({ id: 'st-benzene', title: '苯的结构与性质', summary: '认识苯的平面环状结构、稳定性和取代反应。', items: [['环状结构', '六个碳形成平面正六边形骨架'], ['特殊稳定性', '电子离域使苯不易发生普通加成'], ['典型反应', '在一定条件下更容易发生取代']], takeaway: '结构模型能解释苯的反应选择性和物理性质。' }),
    topic({ id: 'st-ethanol', title: '乙醇与生活', summary: '认识羟基、乙醇氧化、燃烧和生物发酵。', items: [['官能团', '羟基决定乙醇的部分反应性质'], ['氧化', '乙醇可被氧化为乙醛、乙酸'], ['应用', '燃料、溶剂、消毒与饮用安全边界不同']], takeaway: '同一种有机物的用途取决于浓度、条件和使用场景。' }),
    topic({ id: 'st-acetic-acid', title: '乙酸与酯化', summary: '认识羧基、酸性和乙酸与乙醇的酯化反应。', items: [['羧基', '乙酸具有酸性，可与活泼金属和碱反应'], ['酯化', '酸与醇在浓硫酸、加热下生成酯和水'], ['生活联系', '酯类常带香味，广泛存在于香精和油脂中']], takeaway: '官能团变化决定有机物的主要化学性质。' }),
    topic({ id: 'st-polymer', title: '有机高分子材料', summary: '区分加聚和缩聚，理解塑料、橡胶、纤维及回收利用。', items: [['单体', '小分子通过重复连接形成高分子链'], ['性能', '链结构和交联程度影响强度、弹性、耐热'], ['环境', '减量、分类、再利用和可降解材料并行']], takeaway: '材料性能和环境代价要放在同一条全生命周期上评价。' })
  ]),
  createChapter('st-sustainable', '第八章 化学与可持续发展', '可持续发展', [
    'st-catalyst-green-chemistry',
    topic({ id: 'st-chemical-industry', title: '化工生产流程', kind: 'experiment', summary: '用原料、反应器、分离、循环和尾气处理读懂工业流程图。', items: [['原料预处理', '除杂、配比和预热提高流程稳定性'], ['反应与分离', '控制温度、压力、催化剂并及时分离产物'], ['循环治理', '未反应原料回收，废物分类和达标排放']], takeaway: '工业化学是反应、分离、能源和环保的系统工程。' }),
    topic({ id: 'st-green-chemistry', title: '绿色化学', summary: '用原子经济性、能耗、安全和废物最小化评价反应方案。', items: [['源头设计', '尽量少用有毒、危险和不可再生原料'], ['过程优化', '提高原子利用率，减少副产物和能耗'], ['产品与回收', '设计可降解、可回收、全生命周期友好的产品']], takeaway: '绿色化学优先在源头减少问题，而不是只在末端处理。' }),
    topic({ id: 'st-carbon-cycle', title: '碳循环与气候变化', summary: '连接燃烧、光合作用、海洋吸收和碳排放，理解温室效应。', items: [['碳释放', '燃烧和工业过程把化石碳转为 CO₂'], ['碳吸收', '植物、土壤和海洋储存并交换碳'], ['减排路径', '节能、清洁能源、碳汇和技术捕集协同推进']], takeaway: '气候问题需要看碳的来源、去向和时间尺度。' }),
    topic({ id: 'st-chemical-safety', title: '化学品安全与应急', kind: 'experiment', summary: '建立标签、储存、个人防护、泄漏和废物处理的安全闭环。', items: [['识别风险', '看标签、SDS 和危险 pictogram'], ['操作防护', '通风、护目镜、手套和分区储存'], ['事故应对', '隔离、冲洗、报告并按预案处置']], takeaway: '安全不是最后补一条注意事项，而是从设计开始嵌入流程。' })
  ])
]

const seniorThree = [
  createChapter('s3-reaction-review', '专题一 反应原理综合', '反应原理综合', [
    topic({ id: 's3-equation-review', title: '化学方程式综合', kind: 'calculation', summary: '把物质、条件、守恒和现象放进同一条方程式审题流程。', items: [['读题', '先找反应物、生成物和实验条件'], ['配平', '同时检查元素守恒、电荷守恒和最简整数比'], ['回看', '用现象、状态符号和数量关系验证结果']], takeaway: '高三方程式题先还原反应事实，再做守恒检查。' }),
    topic({ id: 's3-ionic-redox-review', title: '离子反应与氧化还原综合', summary: '在同一反应中同时判断离子变化、电子转移和反应方向。', items: [['找变化', '区分真正变化的离子与旁观离子'], ['判价态', '用化合价升降判断氧化剂和还原剂'], ['做守恒', '元素、电荷和电子得失分别检查']], takeaway: '离子方程式解决“谁在变”，氧化还原解决“电子怎么变”。' })
  ]),
  createChapter('s3-experiment-review', '专题二 实验与探究', '实验与探究', [
    topic({ id: 's3-experiment-design', title: '化学实验方案设计', kind: 'experiment', summary: '从研究目的、变量控制、装置选择和证据链评价实验方案。', items: [['定问题', '把结论拆成可以观测和比较的问题'], ['控变量', '设置对照，只改变一个关键条件'], ['证结论', '现象、数据和误差共同支撑结论']], takeaway: '实验设计的核心不是装置复杂，而是变量和证据清楚。' }),
    topic({ id: 's3-lab-safety', title: '实验安全与规范操作', kind: 'experiment', summary: '把风险识别、操作规范和废物处理贯穿实验全过程。', items: [['识别风险', '关注腐蚀、易燃、有毒和氧化性物质'], ['规范操作', '通风、护目镜、取用顺序和尾气处理'], ['应急处置', '先隔离和冲洗，再报告并按预案处理']], takeaway: '安全规范既是得分点，也是实验能否可信完成的前提。' })
  ]),
  createChapter('s3-organic-review', '专题三 有机与材料', '有机与材料', [
    topic({ id: 's3-organic-synthesis', title: '有机物结构与合成', summary: '从官能团、反应类型和结构简式串联常见有机物的转化。', items: [['认官能团', '用结构特征判断主要性质和反应类型'], ['排路线', '围绕目标官能团选择氧化、还原、加成或取代'], ['查条件', '催化剂、温度和试剂决定转化能否发生']], takeaway: '有机推断先找官能团，再沿反应条件倒推路线。' }),
    topic({ id: 's3-chemistry-application', title: '化学与生活综合', summary: '从材料、能源、环境和安全角度评价化学方案的实际价值。', items: [['看性能', '组成和结构决定材料的使用边界'], ['看代价', '比较能耗、排放、资源和回收成本'], ['做选择', '在安全、效率和可持续之间找到平衡']], takeaway: '综合题既考化学原理，也考用证据评价真实方案。' })
  ])
]

export function expandCurriculum(volumes) {
  const existingLessons = new Map()
  volumes.forEach((volume) => volume.chapters.forEach((chapter) => chapter.lessons.forEach((lesson) => existingLessons.set(lesson.id, lesson))))
  const plans = {
    'junior-upper': juniorUpper,
    'junior-lower': juniorLower,
    'senior-one': seniorOne,
    'senior-two': seniorTwo,
    'senior-three': seniorThree
  }

  volumes.forEach((volume) => {
    const plan = plans[volume.id]
    if (!plan) return
    volume.chapters = plan.map((chapterPlan) => ({
      ...chapterPlan,
      lessons: chapterPlan.lessons.map((lessonPlan) => {
        if (typeof lessonPlan === 'string') {
          const existing = existingLessons.get(lessonPlan)
          if (!existing) throw new Error(`教材课程引用了不存在的反应课：${lessonPlan}`)
          return {
            ...existing,
            kind: existing.kind || 'reaction',
            textbookPosition: `人教版·${volume.title}·${chapterPlan.title}`
          }
        }
        return {
          ...lessonPlan,
          textbookPosition: `人教版·${volume.title}·${chapterPlan.title}`
        }
      })
    }))
  })

  return volumes
}

export default { juniorUpper, juniorLower, seniorOne, seniorTwo, seniorThree }
