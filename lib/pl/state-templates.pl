use strict;
use utf8;

package StateTemplate;

our @stateTemplates = (
    {
        'gameName' => 'SW2.5',
        'categories' => [
            {
                'categoryName' => '汎用',
                'states' => [
                    {'name' => '転倒', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '起き上がるまで', 'description' => '行動判定－２\n起き上がった後も手番中は継続'},
                    {'name' => '全力移動', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－４', 'source' => '#self'},
                    {'name' => '離脱準備', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－４', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => 'リスク',
                'states' => [
                    {'name' => 'リスク／回避力判定－２', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'source' => '#self'},
                    {'name' => 'リスク／回避力判定－１', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'source' => '#self'},
                    {'name' => 'リスク／《ディフェンススタンス》', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => 'ほとんどの行為判定－４', 'source' => '#self'},
                    {'name' => 'リスク／抵抗力判定－２', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '生命・精神抵抗力判定－２', 'source' => '#self'},
                    {'name' => 'リスク／《シールドバッシュⅠ》', 'icon' => {'category' => '汎用', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '盾の有利な作用無効', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => '真語魔法',
                'states' => [
                    {'name' => '【ブラント・ウェポン】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '近接攻撃・遠隔攻撃の物理ダメージ－４'},
                    {'name' => '【ナップ】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '軽い眠り；精神効果（弱）'},
                    {'name' => '【バイタリティ】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '生命抵抗力判定＋２'},
                    {'name' => '【パラライズ】／命中', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '命中力判定－２'},
                    {'name' => '【パラライズ】／回避', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '回避力判定－２'},
                    {'name' => '【ウェポン・マスター】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '戦闘特技《》を一時的に習得'},
                    {'name' => '【ウォール・ウォーキング】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => 'あらゆる物体を歩ける\n全力移動と排他'},
                    {'name' => '【レビテーション】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '浮遊する；地上10ｍまで\n制限移動のみ', 'source' => '#self'},
                    {'name' => '【ブリンク】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '回避力判定に自動成功；１回だけ', 'source' => '#self'},
                    {'name' => '【マジシャン】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '戦闘特技《》を一時的に習得'},
                    {'name' => '【イレイス・マジック】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '特定系統の６レベル（ランク）以下の魔法を行使できない'},
                    {'name' => '【ブレード・ネット】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '手番終了時にダメージ'},
                    {'name' => '【ブレード・ネット】短縮', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '手番終了時にダメージ'},
                    {'name' => '【レデュース・マジック】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => '魔法ダメージに適用ダメージと同点のＭＰを得る；１回だけ', 'source' => '#self'},
                    {'name' => '【フライト】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '速度50で飛行；全力移動のみ'},
                    {'name' => '【スロウ】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '6R', 'description' => '移動力半分\n手番開始時に３分の１で主動作不可'},
                    {'name' => '【ビカム・ドラゴン】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => 'ドラゴネットになる', 'source' => '#self'},
                    {'name' => '【デスルーテリィ】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '行使判定－４'},
                    {'name' => '【デスルーテリィ】短縮', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行使判定－４'},
                    {'name' => '【ライトニング・バインド】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '行動判定－２；移動不可\n手番終了時にダメージ'},
                    {'name' => '【ライトニング・バインド】短縮', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行動判定－２；移動不可\n手番終了時にダメージ'},
                    {'name' => '【マジック・リフレクション】', 'icon' => {'category' => 'SW2/真語魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '「対象：１体」（全・Ｘを含む）の魔法を跳ね返す；１回だけ', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => '操霊魔法',
                'states' => [
                    {'name' => '【エンチャント・ウェポン】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を魔法の武器によるものとし、物理ダメージ＋１'},
                    {'name' => '【ダーク・ミスト】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－２'},
                    {'name' => '【プロテクション】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '毒、病気、呪い以外のダメージ－１'},
                    {'name' => '【カウンター・マジック】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '精神抵抗力判定＋２'},
                    {'name' => '【ファナティシズム】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '18R', 'description' => '命中力判定＋２、回避力判定－２'},
                    {'name' => '【クリエイト・アンデッド】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '1日'},
                    {'name' => '【クリエイト・ゴーレム】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '1日'},
                    {'name' => '【ファイア・ウェポン】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を炎属性の魔法の武器によるものとし、物理ダメージ＋２'},
                    {'name' => '【ディスガイズ】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '60分', 'description' => '特定の人族・蛮族になりすます'},
                    {'name' => '【ドール・サイト】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '人形の視界を得る'},
                    {'name' => '【フォビドゥン・マジック】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '特定系統の３レベル（ランク）以下の魔法を行使できない'},
                    {'name' => '【ポイズン・クラウド】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '6R', 'description' => '手番の終了時に毒属性の魔法ダメージ３点'},
                    {'name' => '【アース・シールド】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '防護点＋２'},
                    {'name' => '【インテンス・コントロール】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => 'ゴーレムの命中力判定・回避力判定＋２、発生させる物理ダメージ＋２、受ける物理・魔法ダメージ－２'},
                    {'name' => '【スペル・エンハンス】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '魔力＋１'},
                    {'name' => '【カウンター・センス】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => 'かけられた魔法を探知する', 'source' => '#self'},
                    {'name' => '【スタン・クラウド】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '宣言特技の宣言と補助動作不可'},
                    {'name' => '【ダブル・インディケイト】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '２体のゴーレムやアンデッドに指示をできる', 'source' => '#self'},
                    {'name' => '【アイシクル・ウェポン】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を水・氷属性の魔法の武器によるものとし、物理ダメージ＋３'},
                    {'name' => '【バインド・オペレーション】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '制限移動以外の移動不可'},
                    {'name' => '【バインド・オペレーション】短縮', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '制限移動以外の移動不可'},
                    {'name' => '【プロテクションⅡ】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '毒、病気、呪い以外のダメージ－３'},
                    {'name' => '【コマンド】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '6R', 'description' => 'ゴーレムやアンデッドの支配権を奪う'},
                    {'name' => '【スケープ・ドール】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => 'ＨＰへのダメージを人形に肩代わりさせる；１回だけ'},
                    {'name' => '【ペトロ・クラウド】途中', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '6R', 'description' => '６Ｒ経過後に石化'},
                    {'name' => '【ペトロ・クラウド】完了', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '永続', 'description' => '石化'},
                    {'name' => '【スニーク】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '魔法的・機械的な知覚から隠蔽\n全力移動ならびに他のキャラクターへの干渉によって解除'},
                    {'name' => '【ヘイスト】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '6R', 'description' => '移動速度＋12\n手番終了時に３分の１で主動作を追加'},
                    {'name' => '【ソニック・ウェポン】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を風属性の魔法の武器によるものとし、クリティカル値－１、物理ダメージ＋２\n打撃点の場合、物理ダメージ＋４'},
                    {'name' => '【マナ・シール】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '6R', 'description' => '１手番内に11点以上のＭＰを消費できない'},
                    {'name' => '【レイス・フォーム】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '1日', 'description' => 'レイスとして行動する'},
                    {'name' => '【コピー・ドール】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'other'}, 'duration' => '1年', 'description' => '人形を分身として動かす'},
                    {'name' => '【スティール・メモリー】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '永続', 'description' => '特定の記憶の奪取'},
                    {'name' => '【レブナント・カース】', 'icon' => {'category' => 'SW2/操霊魔法', 'direction' => 'debuff'}, 'duration' => '1日', 'description' => '死後にレブナントとして術者に従う'},
                ],
            },
            {
                'categoryName' => '深智魔法',
                'states' => [
                    {'name' => '【ロックオン】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'other'}, 'duration' => '18R', 'description' => '術者から誤射されない'},
                    {'name' => '【タフパワー】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '生命・精神抵抗力判定＋２'},
                    {'name' => '【インスタント・アンデッド】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'other'}, 'duration' => '6R'},
                    {'name' => '【インスタント・ゴーレム】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'other'}, 'duration' => '6R'},
                    {'name' => '【マナ・コンバージェンス】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '「射程：接触」の魔法の魔力＋１', 'source' => '#self'},
                    {'name' => '【ディフェンス・マスター】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '戦闘特技《》を一時的に習得'},
                    {'name' => '【スリープ・クラウド】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '眠り；精神効果（弱）'},
                    {'name' => '【マルチターゲット】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '広範囲の魔法を複数同時に行使できる', 'source' => '#self'},
                    {'name' => '【プロテクションⅢ】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '毒、病気、呪い以外のダメージ－４'},
                    {'name' => '【ギアス】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'debuff'}, 'duration' => '永続', 'description' => '禁止命令'},
                    {'name' => '【フリー・フライト】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'buff'}, 'duration' => '60R', 'description' => '飛行する'},
                    {'name' => '【マナ・インテグレイション】', 'icon' => {'category' => 'SW2/深智魔法', 'direction' => 'other'}, 'duration' => '18R', 'description' => '受けるダメージ－10\n「射程：10ｍ」以上の魔法がすべて「射程：接触」になる', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => '神聖魔法',
                'states' => [
                    {'name' => '【フィールド・レジスト】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '指定属性ダメージ－３'},
                    {'name' => '【セイクリッド・ウェポン】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '蛮族またはアンデッドに対する近接・遠隔攻撃の命中力判定＋１、物理ダメージ＋２'},
                    {'name' => '【ヴァイス・ウェポン】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '人族またはアンデッドに対する近接・遠隔攻撃の命中力判定＋１、物理ダメージ＋２'},
                    {'name' => '【セイクリッド・シールド】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '蛮族またはアンデッドから受ける物理ダメージ－３'},
                    {'name' => '【ヴァイス・シールド】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '人族またはアンデッドから受ける物理ダメージ－３'},
                    {'name' => '【ブレス】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '器用度・敏捷度・筋力・生命力のいずれかを＋６'},
                    {'name' => '【バトルソング】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '特殊', 'description' => '近接・遠隔攻撃の命中力判定＋２、ダメージ＋２'},
                    {'name' => '【フィールド・プロテクションⅡ】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '毒、病気、呪い以外のダメージ－２'},
                    {'name' => '【ホーリー・ブレッシング】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '一時ＨＰを与える'},
                    {'name' => '【ブレスⅡ】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '能力値すべてを＋６'},
                    {'name' => '【ホーリー・ライトⅡ】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '精神抵抗力判定－２'},
                    {'name' => '【レスキュー】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => 'ＨＰ監視\n同意があれば呼び寄せられる'},
                    {'name' => '【インスタント・ブランデッド】蛮族', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '6R', 'description' => '手番の終了時に２分の１で追加の主動作'},
                    {'name' => '【インスタント・ブランデッド】人族', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'debuff'}, 'duration' => '6R', 'description' => '手番の開始時に２分の１で移動と主動作不可'},
                    {'name' => '【インスタント・ブランデッド】人族（短縮）', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '手番の開始時に２分の１で移動と主動作不可'},
                    {'name' => '【ディバイン・ウォー】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '360分', 'description' => '任意の戦士系技能＋３レベル'},
                ],
            },
            {
                'categoryName' => '特殊神聖魔法',
                'states' => [
                    {'name' => '【デイブレイク】', 'icon' => {'category' => 'SW2/神聖魔法', 'direction' => 'buff'}, 'duration' => '180分', 'description' => '半径30ｍを照らす\n投げつけて攻撃できる'},
                ],
            },
            {
                'categoryName' => '魔動機術',
                'states' => [
                    {'name' => '【ターゲットサイト】', 'icon' => {'category' => 'SW2/魔動機術', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '命中力判定＋１', 'source' => '#self'},
                    {'name' => '【エフェクトウェポン】', 'icon' => {'category' => 'SW2/魔動機術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を指定属性をもつ魔法の武器によるものとし、物理ダメージ＋１'},
                ],
            },
            {
                'categoryName' => '妖精魔法',
                'states' => [
                    {'name' => '【ハンドルフェアリー】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '妖精の行動に対する回避力判定や抵抗力判定＋２', 'source' => '#self'},
                    {'name' => '【フェアリーウィッシュⅡ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '360分', 'description' => '一度だけ、行為判定に＋２\n戦闘によって強制解除', 'source' => '#self'},
                    {'name' => '【ミティゲイトフェアリー】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '「分類：妖精」に対してのみ、行為判定－２、発生させる物理・魔法ダメージ－２'},
                    {'name' => '【ストーンガード】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '一度だけ、物理ダメージ－５'},
                    {'name' => '【エントラップ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '移動力０、回避力判定－２、あらたに飛行する権利を失う\n主動作で脱出を試みることができる（詳細⇒『ＭＡ』132頁）'},
                    {'name' => '【リングプロテクション】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '１ラウンドにつき一度だけ、物理ダメージ－５'},
                    {'name' => '【グレートキャプチャー】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '移動力０、脱出以外の主動作不可、回避力判定自動失敗、飛行不可\n主動作で脱出を試みることができる（詳細⇒『ＭＡ』133頁）'},
                    {'name' => '【ウォータースクリーン】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '炎属性の魔法ダメージ－３'},
                    {'name' => '【ボトムウォーキング】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '水底で活動できる'},
                    {'name' => '【ハードウォーター】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '水上を歩行できる'},
                    {'name' => '【シンク】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '浮力を失う'},
                    {'name' => '【アイスコフィン】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '永続', 'description' => '半永久的に氷の棺に閉じ込められる'},
                    {'name' => '【フリーズ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行為判定－４'},
                    {'name' => '【フレア】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '盲目となる（「知覚：魔法」には無効）'},
                    {'name' => '【フレイムコート】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '水・氷属性のあらたな悪影響を無効化し、当該属性のダメージ－５'},
                    {'name' => '【ウィンドガード】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '風属性の魔法ダメージ－３'},
                    {'name' => '【ホバリング】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'other'}, 'duration' => '18R', 'description' => '地表から10㎝ほど浮かぶ；敏捷度半減'},
                    {'name' => '【サイレントムーブ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '物音を経てずに行動できる；触れていないものが建てる音には無効；音を発すると解除'},
                    {'name' => '【シークレットボイス】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '秘密の会話ができる'},
                    {'name' => '【ミサイルプロテクション】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '遠隔攻撃を２分の１の確率で自動的に回避'},
                    {'name' => '【サウンドポケット】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '発する音が他者に聞こえず（聴覚喪失に準ずる）、自身以外が発する音が自身に聞こえない'},
                    {'name' => '【エアウォーク】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '空中に足場があるかのように移動できる'},
                    {'name' => '【ダウンバースト】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '手番開始時の10ｍ効果、飛行・上昇不可'},
                    {'name' => '【ワールウィンド】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'other'}, 'duration' => '60分', 'description' => '空中を運ばれる'},
                    {'name' => '【ディストラクション】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '魔法行使不可；精神効果（弱）'},
                    {'name' => '【デイズ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '以降、最初に要求された回避力判定に自動失敗する；精神効果（弱）'},
                    {'name' => '【パニックラン】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '乱戦エリアの中にいるならば離脱ないしは離脱準備を優先的におこなわなければならない＆乱戦エリアの外にいるなら乱戦エリア内に移動できない'},
                    {'name' => '【マインドブランク】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '術者を認識できない；術者から積極的な行動がおこなわれるなら、その直前に解除される'},
                    {'name' => '【マインドリンク】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '術者と対象が感覚・意識を共有する'},
                    {'name' => '【ショッキングウェイブ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '2R', 'description' => '主動作、補助動作、宣言型能力の使用不可；精神効果（弱）'},
                    {'name' => '【インサニティ】凶暴化', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '命中力判定＋２、回避力判定－２、魔法行使不可'},
                    {'name' => '【インサニティ】知性減退', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '知力－12（下限値１）'},
                    {'name' => '【インサニティ】活動意志喪失', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '3R', 'description' => '主動作不可'},
                    {'name' => '【マスキング】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '他者に【マインドブランク】を与えている相当。\n「術者のフェアリーテイマー技能レベル－３」以上のキャラクターと遭遇するたび、そのキャラクターが精神抵抗力判定を試み、それが成功したなら解除される。'},
                    {'name' => '【イビルドリーム】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '永続', 'description' => '睡眠を欠く不利益を与える；持続には毎日の儀式が必要（詳細⇒『ＭＡ』143頁）'},
                    {'name' => '【フォーゲット】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '7日', 'description' => '行使時点から一週間前までの記憶を失う'},
                    {'name' => '【マインドクラッシュ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '知力－12、精神力－12'},
                    {'name' => '【バーチャルタフネス】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => 'ＨＰの現在値と最大値を増加'},
                    {'name' => '【ナーシング】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => '毒属性、病気属性の効果の進行を抑制（⇒『ＭＡ』140頁）'},
                    {'name' => '【ライフサポート】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => 'ＨＰへの適用ダメージを半減\nＨＰ０のあいだのみ有効'},
                    {'name' => '【インビジビリティ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '「知覚：五感」「知覚：機械」に対して透明になる'},
                    {'name' => '【バーチャルタフネスⅡ】', 'icon' => {'category' => 'SW2/妖精魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => 'ＨＰの現在値と最大値を増加'},
                ],
            },
            {
                'categoryName' => '森羅魔法',
                'states' => [
                    {'name' => '【ラタイトランナー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '10分', 'description' => '移動力を増加'},
                    {'name' => '【ファイアプロテクター】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '「◯炎無効」相当を得る'},
                    {'name' => '【フォッシルアブソーバー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '受ける魔法ダメージ－６点'},
                    {'name' => '【コールドプロテクター】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '「◯水・氷無効」相当を得る'},
                    {'name' => '【ウイングフライヤーⅡ】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '「◯飛行Ⅱ」相当を得る'},
                    {'name' => '【リプロデューサー／リビングツリー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '6R', 'description' => '「◯再生＝10点」相当を得る'},
                    {'name' => '【ポイズナスアタッカー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接・遠隔攻撃を毒属性の魔法の武器によるものとし、物理ダメージ＋５'},
                    {'name' => '【ノイジィディスターバー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行使判定・演奏判定－４'},
                    {'name' => '【サイケデリックスポア】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行動判定－４'},
                    {'name' => '【サプレッシングゲイザー】', 'icon' => {'category' => 'SW2/森羅魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '行動判定－２、累積可'},
                ],
            },
            {
                'categoryName' => '召異魔法',
                'states' => [
                    {'name' => '送還判定－１', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '送還まで', 'source' => '#self'},
                    {'name' => '送還判定－２', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '送還まで', 'source' => '#self'},
                    {'name' => '【デモンズアーム】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '近接・遠隔攻撃を純エネルギー属性をもつ魔法の武器によるものとし、物理ダメージ＋２\n術者の防護点＋２', 'source' => '#self'},
                    {'name' => '【デモンズドッジ】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => 'デーモンルーラー技能＋敏捷度ボーナスで回避力判定をおこなえる', 'source' => '#self'},
                    {'name' => '【デモンズセンス】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '暗視；聞き耳判定・危険感知判定＋２', 'source' => '#self'},
                    {'name' => '【デモンズポテンシャル】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '魔神行動表の達成値＋１；＋３まで累積'},
                    {'name' => '【リコマンド】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '魔神行動表を振り直せる；１回だけ', 'source' => '#self'},
                    {'name' => '【イビルコントラクト】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '魔神行動表の達成値＋２\n魔神行動表で与える物理・魔法ダメージ＋２'},
                    {'name' => '【デモンズテイル】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接攻撃への攻撃障害を遠隔攻撃のものに減じる', 'source' => '#self'},
                    {'name' => '【ブラッドミスト】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '命中力判定・回避力判定－２'},
                    {'name' => '【デモニックスキン】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '防護点減少'},
                    {'name' => '【デモニックスキン】短縮', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '防護点減少'},
                    {'name' => '【マイティデーモン】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '魔神行動表から与える物理・魔法ダメージ＋３'},
                    {'name' => '【デモンスクリーム】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '生命・精神抵抗力判定－２'},
                    {'name' => '【デモンスクリーム】短縮', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '生命・精神抵抗力判定－２'},
                    {'name' => '【ブランチ】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '魔神行動表を２回実行する'},
                    {'name' => '【デモンズタックス】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '近接攻撃・遠隔攻撃で物理・魔法ダメージを受けたとき、攻撃者にダメージを与える；１回だけ', 'source' => '#self'},
                    {'name' => '【アンサモンゲート】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '10分', 'description' => '送還判定＋４；送還時のＭＰ返還なし', 'source' => '#self'},
                    {'name' => '【ブラッドマーカー】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'other'}, 'duration' => '永続', 'description' => '術者から居場所を把握され、視認されていなくとも召異魔法の対象にされる'},
                    {'name' => '【アンチマジックバリア】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '遠隔攻撃または「形状：射撃」から受ける魔法ダメージ－５；１回だけ', 'source' => '#self'},
                    {'name' => '【アトロフィー】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '先制値－２'},
                    {'name' => '【デモンズハンド】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '「射程：接触」の召異魔法を10ｍ以内の任意の対象に行使できる\n（射程自体は変更されない）', 'source' => '#self'},
                    {'name' => '【デモンズフライト】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '60分', 'description' => '移動力20で「○飛行」', 'source' => '#self'},
                    {'name' => '【ディフィシェンシー】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '「弱点：毒・病気・呪い属性ダメージ＋３」'},
                    {'name' => '【デモンズブレード】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '特殊な近接武器を作成する'},
                    {'name' => '【イミテイトシャドウ】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'other'}, 'duration' => '1日', 'description' => '影に擬態する'},
                    {'name' => '【シールドサークル】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'other'}, 'duration' => '永続', 'description' => '魔法陣に封印'},
                    {'name' => '【デモンズスプレッド】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '指定属性のダメージを半減', 'source' => '#self'},
                    {'name' => '【フェイクメモリー】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'other'}, 'duration' => '永続', 'description' => '偽りの記憶を植え付けられる'},
                    {'name' => '【ワースレスマジック】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'debuff'}, 'duration' => '18R', 'description' => '指定された魔法名２つを禁止される'},
                    {'name' => '【ソウルサクリファイス】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'other'}, 'duration' => '永続', 'description' => 'ドッペルゲンガーになる'},
                    {'name' => '【デモンズレギオン】', 'icon' => {'category' => 'SW2/召異魔法', 'direction' => 'buff'}, 'duration' => '1日', 'description' => '「魔神軍勢ポイント」100を得て、いくつかの用途に消費できる', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => '練技',
                'states' => [
                    {'name' => '【キャッツアイ】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '命中力判定＋１', 'source' => '#self'},
                    {'name' => '【ガゼルフット】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '回避力判定＋１', 'source' => '#self'},
                    {'name' => '【ストロングブラッド】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '炎、水・氷属性ダメージ－５', 'source' => '#self'},
                    {'name' => '【ビートルスキン】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '防護点＋２', 'source' => '#self'},
                    {'name' => '【マッスルベアー】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '筋力ボーナス＋２', 'source' => '#self'},
                    {'name' => '【メディテーション】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '3R', 'description' => '精神効果属性に対する精神抵抗力判定＋４', 'source' => '#self'},
                    {'name' => '【スフィンクスノレッジ】', 'icon' => {'category' => 'SW2/練技', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '知力＋６', 'source' => '#self'},
                ],
            },
            {
                'categoryName' => '騎芸',
                'states' => [
                    {'name' => '【獅子奮迅】ペナルティ', 'icon' => {'category' => 'SW2/騎芸', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－２'},
                    {'name' => '【八面六臂】ペナルティ', 'icon' => {'category' => 'SW2/騎芸', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－２'},
                ],
            },
            {
                'categoryName' => '賦術',
                'states' => [
                    {'name' => '【ヴォーパルウェポン】Ｂ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '物理ダメージ＋１'},
                    {'name' => '【ヴォーパルウェポン】Ａ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '物理ダメージ＋２'},
                    {'name' => '【ヴォーパルウェポン】Ｓ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '物理ダメージ＋３'},
                    {'name' => '【ヴォーパルウェポン】SS', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '物理ダメージ＋６'},
                    {'name' => '【バークメイル】Ｂ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '防護点＋１'},
                    {'name' => '【バークメイル】Ａ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '防護点＋２'},
                    {'name' => '【バークメイル】Ｓ', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '防護点＋４'},
                    {'name' => '【バークメイル】SS', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'buff'}, 'duration' => '18R', 'description' => '防護点＋８'},
                    {'name' => '【パラライズミスト】Ａ短縮', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－１'},
                    {'name' => '【パラライズミスト】Ｓ短縮', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－２'},
                    {'name' => '【パラライズミスト】SS短縮', 'icon' => {'category' => 'SW2/賦術', 'direction' => 'debuff'}, 'duration' => '1R', 'description' => '回避力判定－４'},
                ],
            },
            {
                'categoryName' => '鼓咆',
                'states' => [
                    {'name' => '【神展の構え】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '移動力＋５、制限移動＋２ｍ'},
                    {'name' => '【怒涛の攻陣Ⅰ】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接・遠隔攻撃の物理ダメージ＋１'},
                    {'name' => '【怒涛の攻陣Ⅱ：旋風】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '命中力判定＋１'},
                    {'name' => '【怒涛の攻陣Ⅲ：旋刃】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接・遠隔攻撃の物理ダメージ＋１、命中力判定＋１'},
                    {'name' => '【怒涛の攻陣Ⅳ：輝斬】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接・遠隔攻撃の物理ダメージ＋１、命中力判定＋１'},
                    {'name' => '【怒涛の攻陣Ⅴ：颱風】', 'icon' => {'category' => 'SW2/鼓咆', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '近接・遠隔攻撃の物理ダメージ＋２、命中力判定＋２'},
                ],
            },
            {
                'categoryName' => 'アイテム',
                'states' => [
                    {'name' => '〈スマルティエの風切り布〉', 'icon' => {'category' => '汎用', 'direction' => 'buff'}, 'duration' => '1R', 'description' => '命中力判定・回避力判定＋２', 'source' => '#self'},
                ],
            },
        ],
    },
);
