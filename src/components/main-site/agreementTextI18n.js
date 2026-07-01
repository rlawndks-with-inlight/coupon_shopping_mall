import { useLocales } from 'src/locales';
import { AGREEMENT_TITLE, AGREEMENT_INTRO, AGREEMENT_ARTICLES } from './agreementText';

// 무료 쇼핑몰 제공 약정서 — 5개국어.
// ko는 원본(agreementText.js) 그대로, en/ja/cn/es는 참고용 번역.
// 비한국어 화면에는 "한국어 원본이 법적 기준" 안내를 함께 표기한다(REF_NOTE).
const AGREEMENT_I18N = {
  ko: { title: AGREEMENT_TITLE, intro: AGREEMENT_INTRO, articles: AGREEMENT_ARTICLES },
  en: {
    "title": "Free Online Shopping Mall Provision Agreement",
    "intro": [
      "Provider: Woojin Platform Co., Ltd. (hereinafter referred to as \"the Company\")",
      "User: Franchisee (hereinafter referred to as \"the Merchant\")",
      "The Company and the Merchant hereby enter into this Agreement as follows in order to stipulate the various matters necessary for the Company to provide the Merchant, free of charge, with the shopping mall solution developed and operated by the Company, and to establish and operate a shopping mall through such solution, as well as the rights and obligations between the parties."
    ],
    "articles": [
      { "title": "Article 1 (Purpose of the Agreement)", "body": [
        "The purpose of this Agreement is to have the Company provide the Merchant, free of charge, with the shopping mall solution and related services developed and operated by the Company, and to stipulate the various matters necessary for the Merchant to operate an online shopping mall using such solution, as well as the rights and obligations of both parties."
      ]},
      { "title": "Article 3 (Contents of Service Provision)", "body": [
        "① The Company shall provide the Merchant with the following services free of charge.",
        "   - Right to use the shopping mall solution",
        "   - Basic design template setup",
        "   - Provision of an administrator page",
        "   - Provision of basic hosting and server space",
        "   - Maintenance of basic functions",
        "② The scope of free provision shall be limited to the basic specifications determined by the Company, and the following matters may be provided as separate paid services.",
        "   - Customized design development",
        "   - Additional function development",
        "   - Server expansion and additional traffic",
        "   - Integration with external solutions/APIs",
        "   - Other items designated by the Company as separate paid services",
        "③ The Company may change certain functions of the service as necessary for the improvement of service quality and operational needs, and in the event of a material change, shall notify the Merchant in advance."
      ]},
      { "title": "Article 4 (Responsibility for Shopping Mall Operation)", "body": [
        "① Responsibility for the operation of the shopping mall shall rest entirely with the Merchant.",
        "② The Merchant shall perform the following tasks at its own responsibility and expense.",
        "   - Product registration and management",
        "   - Order processing",
        "   - Customer service (CS)",
        "   - Delivery and exchange/refund processing",
        "   - Labeling/advertising obligations under the relevant laws",
        "   - Compliance with obligations related to the Korean e-commerce law and the mail-order business law",
        "③ Any complaints, refunds, disputes, damages, and legal liability arising in connection with the products or services sold by the Merchant shall be borne by the Merchant.",
        "④ The Merchant shall not engage in any of the following products or acts.",
        "   - Sale of illegal products",
        "   - Sale of products infringing intellectual property rights",
        "   - False or exaggerated advertising",
        "   - Acts in violation of the relevant laws",
        "   - Acts contrary to public order and good morals"
      ]},
      { "title": "Article 5 (Intellectual Property Rights and Data Ownership)", "body": [
        "① The copyright and intellectual property rights to the shopping mall operation program, solution, source code, design system, and related technologies shall belong to the Company.",
        "② The ownership of the product information, images, detail pages, member information, and operational data registered by the Merchant shall belong to the Merchant.",
        "③ The Merchant shall directly back up any necessary data prior to the termination of the Agreement, and the Company shall bear no obligation to retain data after the termination of the Agreement.",
        "④ The Merchant may not reproduce, modify, reverse-engineer, resell, or provide the solution to any third party without the prior written consent of the Company."
      ]},
      { "title": "Article 6 (Payment System and Fees)", "body": [
        "① In operating the shopping mall, the Merchant shall use the PG company (electronic payment agency) designated by \"FORSPAY\", an affiliated partner of the Company.",
        "② The review, approval, and any restriction of use for PG registration shall be in accordance with the policies of the PG company, and the responsibility therefor shall rest with the PG company.",
        "⑤ The Company shall not be liable for any damages arising from changes in the PG company's policies, malfunctions, or service suspensions, except in cases of willful misconduct or gross negligence."
      ]},
      { "title": "Article 7 (Mandatory Use Period and Penalty)", "body": [
        "① The minimum mandatory use period of this Agreement shall be 1 year from the date of the shopping mall's launch.",
        "② If the Merchant arbitrarily terminates the Agreement within the mandatory use period, or if the use of the service is suspended due to reasons attributable to the Merchant, the Merchant shall pay the following amounts as a penalty.",
        "   - Initial construction and setup support fund: waived",
        "   - In the case of a violation of Article 4, Paragraph 4: KRW 3,000,000",
        "③ The penalty shall be paid within 15 days from the date of termination of the Agreement.",
        "④ However, in the event of a material breach of the Agreement by the Company or a continued state of inability to provide the service, no penalty shall be imposed."
      ]},
      { "title": "Article 8 (Restriction and Suspension of Service)", "body": [
        "① The Company may restrict or suspend the provision of the service in any of the following cases.",
        "   - Sale of illegal products",
        "   - Infringement of the rights of others",
        "   - False or exaggerated advertising",
        "   - Violation of the relevant laws",
        "   - Cases causing material disruption to server operation",
        "   - Cases of an act in violation of this Agreement",
        "② If the Merchant's usage exceeds the scope of basic provision, the Company may request conversion to a paid service or payment of additional costs.",
        "③ If the Merchant refuses this, the use of the service may be restricted.",
        "④ The Company may temporarily suspend the provision of the service in the event of reasons such as regular inspections, system replacement, or emergency security measures, and shall notify in advance where possible."
      ]},
      { "title": "Article 9 (Personal Information Protection)", "body": [
        "① The Merchant shall lawfully collect, use, and retain the personal information of members acquired in the course of operating the shopping mall in accordance with the relevant laws.",
        "② The Company shall not arbitrarily use the personal information of the Merchant's members or provide it to any third party, except within the scope necessary for system operation.",
        "③ Both parties shall comply with the relevant laws, including the Korean personal information protection law."
      ]},
      { "title": "Article 10 (Confidentiality)", "body": [
        "① The Company and the Merchant shall not disclose to any third party or use for purposes other than those of this Agreement the other party's business, technical, and financial information as well as member information that they come to know in the course of performing the Agreement.",
        "② The obligations under this Article shall remain in effect for 3 years after the termination of the Agreement."
      ]},
      { "title": "Article 11 (Termination of the Agreement)", "body": [
        "① If either party violates its obligations under this Agreement, the other party may demand rectification in writing or by electronic document.",
        "② If the violation is not remedied within 30 days from the date of the demand for rectification, the other party may terminate the Agreement.",
        "③ Upon termination of the Agreement, the Company may terminate the shopping mall service and the administrator account.",
        "④ Any unsettled amounts, penalties, and other obligations incurred prior to the termination of the Agreement shall remain in effect after the termination of the Agreement."
      ]},
      { "title": "Article 12 (Indemnification)", "body": [
        "① The Company shall not be liable for any service disruption arising from force majeure reasons such as natural disasters, power outages, communication failures, hacking, or server failures.",
        "② The Company does not guarantee the operational performance, sales, or operating profit of the Merchant's shopping mall.",
        "③ The Company shall not be liable for any damages arising from reasons attributable to the Merchant.",
        "④ The Company's liability for damages shall be limited to cases of the Company's willful misconduct or gross negligence."
      ]},
      { "title": "Article 13 (Effect and Amendment of the Agreement)", "body": [
        "① This Agreement shall take effect from the date on which both parties sign or seal it.",
        "② Any amendment to this Agreement shall be made by agreement in writing or by electronic document.",
        "③ Electronic signatures and electronic documents shall have the same effect as writing."
      ]},
      { "title": "Article 14 (Dispute Resolution)", "body": [
        "① In the event of a dispute arising in connection with this Agreement, the parties shall endeavor to resolve it through mutual consultation.",
        "② If no consultation is reached, the court having jurisdiction over the location of the Company's head office shall be the exclusive competent court."
      ]}
    ]
  },
  ja: {
    "title": "無料ショッピングモール提供約定書",
    "intro": [
      "提供会社：株式会社ウジンプラットフォーム（以下「甲」という）",
      "利用会社：加盟店（以下「乙」という）",
      "「甲」と「乙」は、「甲」が開発および運営するショッピングモールソリューションを「乙」に無料で提供し、これを通じてショッピングモールを構築・運営するにあたり必要な諸般の事項および相互間の権利・義務を規定するため、次のとおり約定を締結する。"
    ],
    "articles": [
      { "title": "第1条（契約の目的）", "body": [
        "本契約は、「甲」が開発・運営するショッピングモールソリューションおよび関連サービスを「乙」に無償で提供し、「乙」がこれを利用してオンラインショッピングモールを運営するにあたり必要な諸般の事項および両当事者の権利・義務を規定することを目的とする。"
      ]},
      { "title": "第3条（サービス提供内容）", "body": [
        "① 「甲」は「乙」に対し、以下のサービスを無償で提供する。",
        "   - ショッピングモールソリューションの使用権限",
        "   - 基本デザインテンプレートの設定",
        "   - 管理者ページの提供",
        "   - 基本ホスティングおよびサーバー容量の提供",
        "   - 基本機能の保守",
        "② 無料提供の範囲は「甲」が定めた基本仕様に限り、以下の事項は別途有償サービスとして提供される場合がある。",
        "   - カスタマイズデザインの開発",
        "   - 機能の追加開発",
        "   - サーバーの増設およびトラフィックの追加",
        "   - 外部ソリューション／APIの連携",
        "   - その他「甲」が別途有償サービスとして指定した項目",
        "③ 「甲」はサービス品質の向上および運営上の必要に応じてサービスの一部機能を変更することができ、重大な変更がある場合には事前に「乙」に告知する。"
      ]},
      { "title": "第4条（ショッピングモール運営責任）", "body": [
        "① ショッピングモール運営に関する責任は全面的に「乙」にある。",
        "② 「乙」は次の各号の業務を自らの責任と費用で遂行しなければならない。",
        "   - 商品の登録および管理",
        "   - 注文処理",
        "   - 顧客対応（CS）",
        "   - 配送および交換・返金処理",
        "   - 関係法令に基づく表示・広告義務",
        "   - 韓国電子商取引法および通信販売業に関する義務の遵守",
        "③ 「乙」が販売する商品またはサービスに関連して発生する苦情、返金、紛争、損害賠償および法的責任は「乙」が負担する。",
        "④ 「乙」は以下の各号に該当する商品または行為を行ってはならない。",
        "   - 違法商品の販売",
        "   - 知的財産権侵害商品の販売",
        "   - 虚偽・誇大広告",
        "   - 関係法令違反行為",
        "   - 社会秩序および善良の風俗に反する行為"
      ]},
      { "title": "第5条（知的財産権およびデータ所有権）", "body": [
        "① ショッピングモール運営プログラム、ソリューション、ソースコード、デザインシステムおよび関連技術に対する著作権および知的財産権は「甲」に帰属する。",
        "② 「乙」が登録した商品情報、画像、詳細ページ、会員情報および運営データの所有権は「乙」に帰属する。",
        "③ 「乙」は契約終了前に必要なデータを自ら（みずから）バックアップしなければならず、契約終了後、「甲」はデータの保管義務を負わない。",
        "④ 「乙」は「甲」の事前の書面による同意なく、ソリューションを複製、修正、リバースエンジニアリング、再販売または第三者に提供することができない。"
      ]},
      { "title": "第6条（決済システムおよび手数料）", "body": [
        "① 「乙」はショッピングモール運営時、「甲」の提携パートナー社である「FORSPAY」が指定したPG社（電子決済代行会社）を使用しなければならない。",
        "② PG加入審査、承認および利用制限の可否はPG社の方針に従い、これに対する責任はPG社にある。",
        "⑤ 「甲」はPG社の方針変更、障害またはサービス中断により発生した損害に対し、故意または重大な過失がない限り責任を負わない。"
      ]},
      { "title": "第7条（義務使用期間および違約金）", "body": [
        "① 本契約の最低義務使用期間は、ショッピングモール開通日から1年とする。",
        "② 「乙」が義務使用期間内に任意に契約を解約し、または「乙」の帰責事由によりサービス利用が中断される場合、「乙」は以下の金額を違約金として支払わなければならない。",
        "   - 初期構築および設定支援金：免除（0ウォン）",
        "   - 第4条第4項違反の場合：300万ウォン",
        "③ 違約金は契約解約日から15日以内に支払わなければならない。",
        "④ ただし、「甲」の重大な契約違反またはサービス提供不能状態が継続する場合には、違約金を賦課しない。"
      ]},
      { "title": "第8条（サービス制限および中断）", "body": [
        "① 「甲」は以下の各号に該当する場合、サービスの提供を制限または中断することができる。",
        "   - 違法商品の販売",
        "   - 他人の権利侵害",
        "   - 虚偽・誇大広告",
        "   - 関係法令違反",
        "   - サーバー運営に重大な障害を引き起こす場合",
        "   - 本契約違反行為がある場合",
        "② 「乙」の使用量が基本提供範囲を超過する場合、「甲」は有料サービスへの転換または追加費用の支払いを要請することができる。",
        "③ 「乙」がこれを拒否する場合、サービス利用が制限される場合がある。",
        "④ 「甲」は定期点検、システム交換、緊急セキュリティ措置などの事由がある場合、サービスの提供を一時中断することができ、可能な場合は事前に告知する。"
      ]},
      { "title": "第9条（個人情報保護）", "body": [
        "① 「乙」はショッピングモール運営過程において取得した会員の個人情報を、関係法令に従い適法に収集・利用・保管しなければならない。",
        "② 「甲」はシステム運営上必要な範囲を除き、「乙」の会員個人情報を任意に利用し、または第三者に提供しない。",
        "③ 両当事者は韓国個人情報保護法など関係法令を遵守しなければならない。"
      ]},
      { "title": "第10条（秘密保持）", "body": [
        "① 「甲」と「乙」は、契約履行の過程において知り得た相手方の営業上・技術上・財務上の情報および会員情報を第三者に漏洩し、または本契約の目的以外に使用してはならない。",
        "② 本条項の義務は契約終了後も3年間有効とする。"
      ]},
      { "title": "第11条（契約の解約）", "body": [
        "① 当事者の一方が本契約上の義務に違反した場合、相手方は書面または電子文書により是正を要求することができる。",
        "② 是正要求日から30日以内に違反事項が改善されない場合、相手方は契約を解約することができる。",
        "③ 契約終了時、「甲」はショッピングモールサービスおよび管理者アカウントを終了することができる。",
        "④ 契約終了以前までに発生した未精算金額、違約金およびその他の債務は、契約終了後も有効とする。"
      ]},
      { "title": "第12条（免責）", "body": [
        "① 「甲」は天災地変、停電、通信障害、ハッキング、サーバー障害など不可抗力的事由により発生したサービス障害に対して責任を負わない。",
        "② 「甲」は「乙」のショッピングモール運営成果、売上または営業利益を保証しない。",
        "③ 「甲」は「乙」の帰責事由により発生した損害に対して責任を負わない。",
        "④ 「甲」の損害賠償責任は、「甲」に故意または重大な過失がある場合に限定する。"
      ]},
      { "title": "第13条（契約の効力および変更）", "body": [
        "① 本契約は両当事者が署名または捺印した日から効力を生ずる。",
        "② 本契約の変更は書面または電子文書による合意によらなければならない。",
        "③ 電子署名および電子文書は書面と同一の効力を有する。"
      ]},
      { "title": "第14条（紛争解決）", "body": [
        "① 本契約に関連して紛争が発生した場合、当事者は相互に協議して解決するよう努める。",
        "② 協議が成立しない場合、「甲」の本社所在地を管轄する裁判所を専属的合意管轄裁判所とする。"
      ]}
    ]
  },
  cn: {
    "title": "免费购物商城提供协议书",
    "intro": [
      "提供方：Woojin Platform Co., Ltd.（株式会社友进平台，以下简称\"公司\"）",
      "使用方：加盟店（以下简称\"商户\"）",
      "\"公司\"与\"商户\"就\"公司\"开发及运营的购物商城解决方案无偿提供给\"商户\"，并据此在构建、运营购物商城过程中所需的各项事宜以及双方之间的权利与义务，为予以规定，特订立协议如下。"
    ],
    "articles": [
      { "title": "第1条（合同目的）", "body": [
        "本合同旨在规定：公司将其开发、运营的购物商城解决方案及相关服务无偿提供给商户，商户利用该服务运营在线购物商城时所需的各项事宜以及双方当事人的权利与义务。"
      ]},
      { "title": "第3条（服务提供内容）", "body": [
        "① 公司向商户无偿提供以下服务。",
        "   - 购物商城解决方案使用权限",
        "   - 基本设计模板设置",
        "   - 管理员页面提供",
        "   - 基本托管及服务器空间提供",
        "   - 基本功能维护",
        "② 无偿提供范围仅限于公司所定的基本规格，以下事项可作为单独的有偿服务提供。",
        "   - 定制化设计开发",
        "   - 功能追加开发",
        "   - 服务器扩容及流量追加",
        "   - 外部解决方案／API对接",
        "   - 其他公司指定为单独有偿服务的项目",
        "③ 公司可根据提升服务质量及运营需要变更服务的部分功能，如有重大变更，应事先告知商户。"
      ]},
      { "title": "第4条（购物商城运营责任）", "body": [
        "① 购物商城运营的责任完全归属于商户。",
        "② 商户应以自身的责任及费用履行下列各项业务。",
        "   - 商品登记及管理",
        "   - 订单处理",
        "   - 客户应对（CS）",
        "   - 配送及换货、退款处理",
        "   - 依据相关法令的标示、广告义务",
        "   - 遵守韩国电子商务法及通信销售业相关义务",
        "③ 与商户所销售的商品或服务相关而发生的投诉、退款、纠纷、损害赔偿及法律责任，由商户承担。",
        "④ 商户不得从事下列各项所涉及的商品或行为。",
        "   - 销售非法商品",
        "   - 销售侵犯知识产权的商品",
        "   - 虚假、夸大广告",
        "   - 违反相关法令的行为",
        "   - 违反社会秩序及善良风俗的行为"
      ]},
      { "title": "第5条（知识产权及数据所有权）", "body": [
        "① 购物商城运营程序、解决方案、源代码、设计系统及相关技术的著作权与知识产权归属于公司。",
        "② 商户所登记的商品信息、图片、详情页、会员信息及运营数据的所有权归属于商户。",
        "③ 商户应在合同终止前自行备份所需数据，合同终止后公司不承担数据保管义务。",
        "④ 未经公司事先书面同意，商户不得复制、修改、逆向工程、转售解决方案或将其提供给第三方。"
      ]},
      { "title": "第6条（支付系统及手续费）", "body": [
        "① 商户在运营购物商城时，应使用由公司的合作伙伴公司\"FORSPAY\"指定的PG公司（电子支付代行公司）。",
        "② PG加入审查、批准及使用限制与否，依据PG公司的政策，其责任由PG公司承担。",
        "⑤ 因PG公司的政策变更、故障或服务中断所致的损害，除公司存在故意或重大过失外，公司不承担责任。"
      ]},
      { "title": "第7条（强制使用期限及违约金）", "body": [
        "① 本合同的最短强制使用期限自购物商城开通日起为1年。",
        "② 商户在强制使用期限内擅自解除合同，或因商户的过错事由导致服务使用中断的，商户应支付下列金额作为违约金。",
        "   - 初期构建及设置支援金：免除（0元）",
        "   - 违反第4条第4项的情形：KRW 3,000,000",
        "③ 违约金应自合同解除日起15日内支付。",
        "④ 但是，若公司存在重大违约或服务提供不能状态持续的情形，则不课征违约金。"
      ]},
      { "title": "第8条（服务限制及中断）", "body": [
        "① 公司在符合下列各项的情形下，可限制或中断服务提供。",
        "   - 销售非法商品",
        "   - 侵害他人权利",
        "   - 虚假、夸大广告",
        "   - 违反相关法令",
        "   - 对服务器运营造成重大障碍的情形",
        "   - 存在违反本合同行为的情形",
        "② 商户的使用量超出基本提供范围的，公司可要求其转为付费服务或支付追加费用。",
        "③ 商户拒绝的情形，服务使用可能受到限制。",
        "④ 公司在存在定期检修、系统更换、紧急安全措施等事由的情形下，可暂时中断服务提供，并在可能的情况下事先告知。"
      ]},
      { "title": "第9条（个人信息保护）", "body": [
        "① 商户应依据相关法令合法地收集、使用、保管在购物商城运营过程中取得的会员个人信息。",
        "② 除系统运营上所需的范围外，公司不得擅自使用商户的会员个人信息或将其提供给第三方。",
        "③ 双方当事人应遵守韩国个人信息保护法等相关法令。"
      ]},
      { "title": "第10条（保密）", "body": [
        "① 公司与商户不得将在履行合同过程中知悉的对方的营业上、技术上、财务上信息及会员信息泄露给第三方，或用于本合同目的以外的用途。",
        "② 本条款的义务在合同终止后仍有效3年。"
      ]},
      { "title": "第11条（合同解除）", "body": [
        "① 当事人一方违反本合同上的义务时，对方可以书面或电子文书要求其纠正。",
        "② 自纠正要求日起30日内未改善违反事项的，对方可解除合同。",
        "③ 合同终止时，公司可终止购物商城服务及管理员账户。",
        "④ 合同终止前所发生的未结算金额、违约金及其他债务，在合同终止后仍然有效。"
      ]},
      { "title": "第12条（免责）", "body": [
        "① 对于因天灾地变、停电、通信障碍、黑客攻击、服务器故障等不可抗力事由所发生的服务障碍，公司不承担责任。",
        "② 公司不保证商户的购物商城运营成果、销售额或营业利润。",
        "③ 对于因商户的过错事由所发生的损害，公司不承担责任。",
        "④ 公司的损害赔偿责任仅限于公司存在故意或重大过失的情形。"
      ]},
      { "title": "第13条（合同的效力及变更）", "body": [
        "① 本合同自双方当事人签名或盖章之日起生效。",
        "② 本合同的变更应经书面或电子文书协议。",
        "③ 电子签名及电子文书具有与书面同等的效力。"
      ]},
      { "title": "第14条（纠纷解决）", "body": [
        "① 与本合同相关发生纠纷时，当事人应努力通过相互协商予以解决。",
        "② 协商未达成时，以公司总部所在地的管辖法院为专属管辖法院。"
      ]}
    ]
  },
  es: {
    "title": "Contrato de Provisión de Tienda Online Gratuita",
    "intro": [
      "Proveedor: Woojin Platform Co., Ltd. (en adelante, \"la Empresa\")",
      "Usuario: el establecimiento afiliado (en adelante, \"el Comerciante\")",
      "\"La Empresa\" y \"el Comerciante\" celebran el presente contrato en los términos que se indican a continuación, con el fin de que \"la Empresa\" provea de forma gratuita a \"el Comerciante\" la solución de tienda online desarrollada y operada por \"la Empresa\", y de regular todas las cuestiones necesarias para la construcción y operación de la tienda online a través de ella, así como los derechos y obligaciones recíprocos entre las partes."
    ],
    "articles": [
      { "title": "Artículo 1 (Objeto del Contrato)", "body": [
        "El presente contrato tiene por objeto que la Empresa provea de forma gratuita a el Comerciante la solución de tienda online y los servicios relacionados desarrollados y operados por la Empresa, y regular todas las cuestiones necesarias para que el Comerciante opere una tienda online utilizándola, así como los derechos y obligaciones de ambas partes."
      ]},
      { "title": "Artículo 3 (Contenido de la Provisión del Servicio)", "body": [
        "① La Empresa provee de forma gratuita a el Comerciante los siguientes servicios.",
        "   - Derecho de uso de la solución de tienda online",
        "   - Configuración de la plantilla de diseño básica",
        "   - Provisión de la página de administrador",
        "   - Provisión de hosting básico y espacio de servidor",
        "   - Mantenimiento de las funciones básicas",
        "② El alcance de la provisión gratuita se limita a las especificaciones básicas establecidas por la Empresa, y las siguientes cuestiones podrán prestarse como servicios remunerados independientes.",
        "   - Desarrollo de diseño personalizado",
        "   - Desarrollo de funciones adicionales",
        "   - Ampliación del servidor y tráfico adicional",
        "   - Integración de soluciones/API externas",
        "   - Otros conceptos designados por la Empresa como servicios remunerados independientes",
        "③ La Empresa podrá modificar algunas funciones del servicio conforme a la mejora de la calidad del servicio y a las necesidades operativas, y en caso de que exista una modificación sustancial, lo notificará previamente a el Comerciante."
      ]},
      { "title": "Artículo 4 (Responsabilidad en la Operación de la Tienda Online)", "body": [
        "① La responsabilidad relativa a la operación de la tienda online recae de manera exclusiva en el Comerciante.",
        "② El Comerciante deberá realizar, bajo su propia responsabilidad y a su costa, las siguientes tareas.",
        "   - Registro y gestión de productos",
        "   - Procesamiento de pedidos",
        "   - Atención al cliente (CS)",
        "   - Gestión de envíos, cambios y devoluciones",
        "   - Obligaciones de indicación y publicidad conforme a la legislación aplicable",
        "   - Cumplimiento de las obligaciones relativas a la ley coreana de comercio electrónico y al negocio de venta por correo",
        "③ Las reclamaciones, devoluciones, controversias, indemnizaciones por daños y responsabilidades legales que surjan en relación con los productos o servicios vendidos por el Comerciante serán asumidas por el Comerciante.",
        "④ El Comerciante no deberá comercializar los productos ni realizar las conductas comprendidas en los siguientes apartados.",
        "   - Venta de productos ilegales",
        "   - Venta de productos que infrinjan derechos de propiedad intelectual",
        "   - Publicidad falsa o exagerada",
        "   - Conductas que infrinjan la legislación aplicable",
        "   - Conductas contrarias al orden social y a las buenas costumbres"
      ]},
      { "title": "Artículo 5 (Derechos de Propiedad Intelectual y Titularidad de los Datos)", "body": [
        "① Los derechos de autor y los derechos de propiedad intelectual sobre el programa de operación de la tienda online, la solución, el código fuente, el sistema de diseño y la tecnología relacionada corresponden a la Empresa.",
        "② La titularidad de la información de productos, imágenes, páginas de detalle, información de los miembros y datos operativos registrados por el Comerciante corresponde a el Comerciante.",
        "③ El Comerciante deberá realizar por sí mismo la copia de seguridad de los datos necesarios antes de la finalización del contrato, y tras la finalización del contrato la Empresa no asumirá obligación alguna de conservación de los datos.",
        "④ El Comerciante no podrá reproducir, modificar, someter a ingeniería inversa, revender ni proporcionar a terceros la solución sin el consentimiento previo y por escrito de la Empresa."
      ]},
      { "title": "Artículo 6 (Sistema de Pago y Comisiones)", "body": [
        "① El Comerciante deberá utilizar, en la operación de la tienda online, la empresa PG (agencia de pago electrónico) designada por \"FORSPAY\", empresa socia colaboradora de la Empresa.",
        "② El examen de alta, la aprobación y las eventuales restricciones de uso de la PG se rigen por las políticas de la empresa PG, y la responsabilidad al respecto recae en la empresa PG.",
        "⑤ La Empresa no asumirá responsabilidad por los daños derivados de cambios en las políticas, fallos o interrupción del servicio de la empresa PG, salvo que medie dolo o culpa grave."
      ]},
      { "title": "Artículo 7 (Período de Uso Obligatorio y Penalización)", "body": [
        "① El período mínimo de uso obligatorio del presente contrato será de 1 año a contar desde la fecha de apertura de la tienda online.",
        "② En caso de que el Comerciante rescinda el contrato de forma unilateral dentro del período de uso obligatorio, o de que el uso del servicio se interrumpa por causa imputable al Comerciante, el Comerciante deberá abonar como penalización los siguientes importes.",
        "   - Subvención de construcción y configuración inicial: exenta (0 KRW)",
        "   - En caso de infracción del apartado 4 del Artículo 4: KRW 3,000,000",
        "③ La penalización deberá abonarse dentro de los 15 días siguientes a la fecha de rescisión del contrato.",
        "④ No obstante, no se impondrá penalización en caso de que persista un incumplimiento sustancial del contrato por parte de la Empresa o un estado de imposibilidad de provisión del servicio."
      ]},
      { "title": "Artículo 8 (Restricción e Interrupción del Servicio)", "body": [
        "① La Empresa podrá restringir o interrumpir la provisión del servicio en los casos comprendidos en los siguientes apartados.",
        "   - Venta de productos ilegales",
        "   - Infracción de los derechos de terceros",
        "   - Publicidad falsa o exagerada",
        "   - Infracción de la legislación aplicable",
        "   - Cuando se cause una avería grave en la operación del servidor",
        "   - Cuando exista una conducta que infrinja el presente contrato",
        "② En caso de que el volumen de uso del Comerciante exceda el alcance de la provisión básica, la Empresa podrá solicitar la conversión a un servicio remunerado o el pago de un coste adicional.",
        "③ En caso de que el Comerciante lo rechace, el uso del servicio podrá quedar restringido.",
        "④ La Empresa podrá suspender temporalmente la provisión del servicio cuando existan motivos tales como mantenimiento periódico, sustitución de sistemas o medidas de seguridad urgentes, y lo notificará previamente cuando sea posible."
      ]},
      { "title": "Artículo 9 (Protección de Datos Personales)", "body": [
        "① El Comerciante deberá recopilar, utilizar y conservar de forma lícita, conforme a la legislación aplicable, los datos personales de los miembros obtenidos en el proceso de operación de la tienda online.",
        "② La Empresa no utilizará de forma arbitraria ni proporcionará a terceros los datos personales de los miembros del Comerciante, salvo en el alcance necesario para la operación del sistema.",
        "③ Ambas partes deberán cumplir la legislación aplicable, tal como la ley coreana de protección de datos personales."
      ]},
      { "title": "Artículo 10 (Confidencialidad)", "body": [
        "① La Empresa y el Comerciante no deberán revelar a terceros ni utilizar para fines ajenos al objeto del presente contrato la información comercial, técnica y financiera, así como la información de los miembros de la contraparte, de la que hayan tenido conocimiento en el curso de la ejecución del contrato.",
        "② La obligación establecida en la presente cláusula será válida durante 3 años incluso tras la finalización del contrato."
      ]},
      { "title": "Artículo 11 (Rescisión del Contrato)", "body": [
        "① En caso de que una de las partes incumpla las obligaciones establecidas en el presente contrato, la contraparte podrá exigir su subsanación por escrito o mediante documento electrónico.",
        "② En caso de que la infracción no se subsane dentro de los 30 días siguientes a la fecha del requerimiento de subsanación, la contraparte podrá rescindir el contrato.",
        "③ A la finalización del contrato, la Empresa podrá dar de baja el servicio de tienda online y la cuenta de administrador.",
        "④ Los importes pendientes de liquidación, las penalizaciones y demás deudas surgidos con anterioridad a la finalización del contrato seguirán siendo válidos incluso tras la finalización del contrato."
      ]},
      { "title": "Artículo 12 (Exención de Responsabilidad)", "body": [
        "① La Empresa no asumirá responsabilidad por las averías del servicio derivadas de causas de fuerza mayor tales como desastres naturales, cortes de energía, fallos de comunicación, ataques informáticos o fallos del servidor.",
        "② La Empresa no garantiza los resultados de operación, la facturación ni los beneficios de explotación de la tienda online del Comerciante.",
        "③ La Empresa no asumirá responsabilidad por los daños ocasionados por causa imputable al Comerciante.",
        "④ La responsabilidad de la Empresa por indemnización de daños se limita a los casos en que medie dolo o culpa grave de la Empresa."
      ]},
      { "title": "Artículo 13 (Vigencia y Modificación del Contrato)", "body": [
        "① El presente contrato entrará en vigor a partir de la fecha en que ambas partes lo firmen o sellen.",
        "② La modificación del presente contrato deberá realizarse mediante acuerdo por escrito o por documento electrónico.",
        "③ La firma electrónica y los documentos electrónicos tendrán la misma eficacia que la forma escrita."
      ]},
      { "title": "Artículo 14 (Resolución de Controversias)", "body": [
        "① En caso de que surja una controversia en relación con el presente contrato, las partes procurarán resolverla mediante negociación mutua.",
        "② En caso de que no se alcance un acuerdo, será tribunal de jurisdicción exclusiva el tribunal competente del lugar donde radica la sede central de la Empresa."
      ]}
    ]
  },
};

// 비한국어 화면에 표기할 "참고용 번역, 한국어 원본 우선" 안내
export const AGREEMENT_REF_NOTE = {
  en: '※ This is a reference translation. In case of any discrepancy, the Korean original shall prevail.',
  ja: '※ 本翻訳は参考用です。相違がある場合は韓国語原本が優先します。',
  cn: '※ 本翻译仅供参考。如有差异，以韩语原文为准。',
  es: '※ Esta es una traducción de referencia. En caso de discrepancia, prevalecerá el original en coreano.',
};

// 현재 선택 언어의 약정서 {title, intro, articles} 반환 (없으면 한국어)
export function useAgreement() {
  const { currentLang } = useLocales();
  const lang = currentLang?.value || 'ko';
  return {
    lang,
    data: AGREEMENT_I18N[lang] || AGREEMENT_I18N.ko,
    refNote: lang !== 'ko' ? AGREEMENT_REF_NOTE[lang] : '',
  };
}
