use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use POSIX qw/ceil/;

###################
### ソードワールド

my @rating = (['3','4','5','c','15','18','24','28','37','3c',],['4','5','6','e','18','24','28','2c','3c','41',],['5','6','7','10','1b','28','37','3c','41','46',],['6','7','10','12','1e','2c','3c','41','46','5a',],['7','8','12','1e','21','30','41','46','5a','60',],['8','12','14','21','24','34','46','5a','60','66',],['9','14','16','24','34','38','4b','60','66','6c',],['a','16','18','27','38','4b','50','66','6c','85',],['b','18','27','2a','3c','50','55','6c','85','8c',],['c','1a','2a','3c','40','55','5a','72','8c','a8',],['1a','1c','2d','40','44','5a','72','78','93','b0',],['1c','2d','30','44','48','5f','78','93','9a','b8',],['1e','30','33','48','5f','64','7e','9a','a1','c0',],['20','33','48','4c','64','69','84','a1','c0','c8',],['22','36','4c','64','69','6e','8a','a8','c8','ea',],['24','39','50','69','6e','8a','90','af','d0','f3',],['26','3c','54','6e','73','90','af','d0','d8','fc',],['28','3f','58','73','90','96','b6','d8','e0','105',],['2a','42','5c','78','96','b6','bd','e0','e8','10e',],['2c','45','60','7d','9c','bd','e0','e8','10e','136',],['2e','48','64','82','a2','c4','e8','10e','136','160',],['30','4b','68','87','c4','cb','f0','117','140','16b',],['32','4e','6c','a8','cb','d2','f8','120','14a','176',],['4e','51','70','ae','d2','f8','100','129','154','181',],['51','70','91','b4','d9','100','108','132','15e','18c',],['54','74','96','ba','e0','108','132','13b','168','197',],['57','78','9b','c0','e7','132','13b','168','172','1a2',],['5a','7c','a0','e7','ee','13b','144','172','17c','1ad',],['5d','80','a5','ee','f5','144','172','17c','1ad','1b8',],['60','84','aa','f5','120','14d','17c','186','1b8','1c3',],['63','aa','af','fc','128','156','186','1b8','1c3','1ce',],['66','af','d8','103','130','15f','190','1c3','1ce','204',],['8c','b4','de','10a','138','168','1c3','1ce','1d9','210',],['90','b9','e4','111','168','171','1ce','1d9','1e4','21c',],['94','be','ea','118','171','1a4','1d9','1e4','21c','228',],['98','c3','f0','148','17a','1ae','1e4','1ef','228','263',],['9c','f0','f6','150','183','1b8','1ef','228','234','270',],['a0','f6','126','158','18c','1c2','1fa','234','270','27d',],['a4','fc','12d','160','195','1fa','205','240','27d','2bc',],['d2','102','134','168','19e','205','240','24c','28a','2ca',],['d7','108','13b','170','1d6','210','24c','258','297','2d8',],['dc','13b','142','178','1e0','21b','258','297','2a4','2e6',],['e1','142','178','180','1ea','226','264','2a4','2e6','2f4',],['e6','149','180','1b9','1f4','231','270','2b1','2f4','339',],['eb','150','188','1c2','231','23c','27c','2be','302','348',],['f0','157','190','1fe','23c','247','288','2cb','310','357',],['f5','15e','198','208','247','252','2cb','310','31e','366',],['fa','165','1a0','212','252','294','2d8','31e','32c','3b0',],['ff','16c','1a8','21c','25d','2d8','2e5','32c','33a','3c0',],['104','173','1b0','25d','268','2e5','2f2','33a','384','3d0',],['109','17a','1ef','268','273','2f2','2ff','348','3d0','3e0',],['144','1b8','1f8','273','27e','2ff','30c','356','3e0','3f0',],['14a','1c0','201','27e','2c4','30c','319','364','3f0','400',],['150','1c8','244','289','2d0','319','326','372','400','410',],['156','1d0','24e','294','2dc','326','372','3c0','410','462',],['15c','1d8','294','29f','2e8','333','380','3cf','462','473',],['162','21c','29f','2aa','2f4','340','38e','420','473','484',],['168','225','2aa','2f4','300','34d','39c','430','484','4da',],['16e','22e','2b5','300','34d','35a','3aa','440','495','4ec',],['174','276','2c0','30c','35a','367','3fc','450','4a6','4fe',],['17a','280','2cb','318','367','3b8','40b','460','4b7','558',],['180','28a','2d6','324','374','3c6','41a','4b7','510','56b',],['186','294','2e1','330','3c6','3d4','429','4c8','522','57e',],['18c','29e','2ec','33c','3d4','3e2','480','522','534','591',],['192','2a8','2f7','348','3e2','438','490','534','546','5a4',],['198','2b2','302','39b','3f0','447','4a0','546','5a4','5b7',],['19e','2bc','30d','3a8','3fe','4a0','4b0','558','5b7','618',],['1a4','2c6','318','3b5','40c','4b0','50c','56a','618','62c',],['1aa','2d0','323','3c2','465','4c0','51d','57c','62c','640',],['1b0','2da','32e','3cf','474','51d','52e','58e','640','654',],['1b6','2e4','339','3dc','483','52e','58e','5f0','654','668',],['1bc','2ee','344','436','492','53f','5a0','603','668','6cf',],['1c2','2f8','34f','444','4f0','550','5b2','616','67c','6e4',],['1c8','302','35a','452','500','561','5c4','67c','6e4','74e',],['21b','30c','365','460','510','572','629','690','6f9','764',],['222','316','370','46e','572','583','63c','6a4','70e','77a',],['229','320','37b','47c','583','5e8','64f','6b8','723','790',],['230','32a','386','48a','594','5fa','662','723','790','7ff',],['237','334','391','498','5a5','60c','6cc','738','7ff','870',],['23e','33e','39c','4a6','5b6','675','6e0','74d','816','888',],['245','348','3a7','4b4','5c7','688','74d','7bc','82d','8a0',],['24c','352','3b2','4c2','630','69b','762','7d2','844','8b8',],['253','35c','3bd','528','642','6ae','777','7e8','85b','92e',],['25a','366','420','537','654','6c1','78c','7fe','8d0','947',],['261','370','42c','546','666','730','7a1','814','8e8','960',],['268','37a','438','555','678','744','814','889','900','979',],['2c8','3de','444','564','68a','758','82a','8a0','918','9f4',],['2d0','3e9','4ac','573','69c','76c','840','8b7','992','a0e',],['2d8','3f4','4b9','582','70d','780','856','8ce','9ab','a28',],['2e0','3ff','4c6','5f0','720','794','86c','8e5','9c4','aa7',],['2e8','40a','4d3','600','733','7a8','882','960','a42','ac2',],['2f0','474','540','610','746','7bc','898','978','a5c','add',],['2f8','480','54e','620','7bc','834','8ae','990','a76','b60',],['360','48c','55c','630','76c','849','92a','9a8','a90','b7c',],['369','498','56a','6a4','77f','85e','941','9c0','aaa','c02',],['372','4a4','5dc','6b5','792','873','958','9d8','b2e','c1f',],['37b','4b0','5eb','6c6','80c','888','96f','9f0','b49','c3c',],['384','4bc','5fa','6d7','820','89d','986','a73','bd0','c59',],['38d','52e','670','6e8','834','8b2','99d','a8c','bec','c76',],['396','53b','680','762','848','8c7','9b4','aa5','c08','d02',],['39f','548','690','7de','85c','8dc','9cb','abe','c24','d90',]);

my %unique = (
                     # 2  3  4  5  6  7  8  9 10 11 12
  'WB' => { 'num' => [ 0, 0, 0, 0, 0, 3, 3, 3, 6, 6, 6], 'name'=>'ウルフバイト',       },
  'SB' => { 'num' => [ 4, 4, 4, 4, 4, 7, 7, 7,13,13,13], 'name'=>'ソーンバッシュ',     },
  'KS' => { 'num' => [12,12,12,12,12,15,15,15,18,18,18], 'name'=>'コングスマッシュ',   },
  'BR' => { 'num' => [13,13,13,13,13,16,16,16,19,19,19], 'name'=>'ボアラッシュ',       },
  'MP' => { 'num' => [18,18,18,18,18,21,21,21,24,24,24], 'name'=>'マルサーヴラプレス', },
  'LA' => { 'num' => [18,18,18,18,18,21,21,21,36,36,36], 'name'=>'ルナアタック',       },
  'DS' => { 'num' => [24,24,24,24,24,27,27,27,30,30,30], 'name'=>'ダブルストンプ',     },
);
$unique{'ウルフバイト'}       = $unique{'WB'};
$unique{'ソーンバッシュ'}     = $unique{'SB'};
$unique{'コングスマッシュ'}   = $unique{'KS'};
$unique{'ボアラッシュ'}       = $unique{'BR'};
$unique{'マルサーヴラプレス'} = $unique{'MP'};
$unique{'ルナアタック'}       = $unique{'LA'};
$unique{'ダブルストンプ'}     = $unique{'DS'};
my $unique_reg = join('|', keys %unique);
sub rateRoll {
  my $comm = shift;
  if($comm !~ /^
    (?: (?:[kr]|威力) ( [0-9]+ | \([0-9\+\-]+\) | $unique_reg ) )
    (?:\[([0-9\+\-]+)\])?
    ([0-9a-z\+\-\*\/\@\$()><\#!PAVC値必殺首切出目難半減威力確実化聖王の冠]*)
    (?:\:([0-9]+|.+,.+))?
    (?:\s|$)
  /ix){
    return "";
  }
  my $rate   = $1;
  my $unique = (exists $unique{$rate}) ? $unique{$rate}{'name'} : '';
  my $crit   = $2;
  my $form   = $3;
  my $repeat = $4;
  my $rate_up;
  my $crit_atk;
  my $crit_ray;
  my $fixed;
  my $powerAccurate;
  my $virtuousCrown;
  my $curse;
  my $gf;
  while($form =~ s/gf//gi)                            { $gf = ' GF'; }                      #Gフォーチュン
  while($form =~ s/(?:\@|C値)([0-9][0-9\+\-]*)//gi)   { $crit     = $1 if !$crit; }         #C値
  while($form =~ s/(?:[rck]|首切)(\-?[0-9]*)//gi)     { $rate_up  = $1 ne ''?$1:5 if !$rate_up; } #首切効果
  while($form =~ s/(?:[#b!]|必殺)([\+\-]?[0-9]*)//gi) { $crit_atk = $1 ne ''?$1:1 if !$crit_atk; }#必殺効果
  while($form =~ s/(?:[\$]|出目)(n?[0-9]+)//gi)       { $fixed    = $1 if !$fixed; }        #出目固定
  while($form =~ s/(?:[\$]|出目)\+?([\+\-][0-9]+)//gi){ $crit_ray = $1 if !$crit_ray; }     #出目修正
  while($form =~ s/(?:PA|威力確実化)(\d+)?//gi)       { $powerAccurate = $1 || 4; }         #威力確実化
  while($form =~ s/(?:VC|聖王(?:の冠)?)//gi)          { $virtuousCrown = 1; }               #聖王の冠
  while($form =~ s/(?:[<]|難)([0-9]+)//gi)            { $curse    = $1 if !$curse; }        #Aカース「難しい」
  
  $rate = $unique || calc($rate);
  $crit = calc($crit);
  if($rate > 100){ $rate = 100; } elsif($rate < 0){ $rate = 0; }
  if($crit <= 0){ $crit = 0; } elsif($crit < 3){ $crit = 3; }

  my @repeatLabels;
  if ($repeat !~ /,/) {
    @repeatLabels = ();
    $repeat = ($repeat > 50) ? 50 : (!$repeat) ? 1 : $repeat;
    for my $i (1 .. $repeat) {
      push(@repeatLabels, makeRollIndexText($i));
    }
  } else {
    @repeatLabels = split(/\s*,\s*/, $repeat);
    $repeat = @repeatLabels;
    $repeat = 50 if $repeat > 50;
    @repeatLabels = @repeatLabels[0 .. ($repeat - 1)];
  }

  my @result;
  foreach my $i (1 .. ($repeat || 1)){
    my $resultRow = '';

    foreach my $j (1 .. ($powerAccurate ? 2 : 1)) {
      (my $currentResultRow, my $criticalCount, my $lastNumber) = rateCalc(
          $rate    ,
          $crit    ,
          $form    ,
          $rate_up ,
          $crit_atk,
          $crit_ray,
          $fixed   ,
          $curse   ,
          $virtuousCrown,
          $gf      ,
          $repeat > 1 && $j == 1 ? $repeatLabels[$i - 1] : undef,
          $repeat && $j == 1 ? $i : undef
      );

      # 威力確実化
      if ($j == 1 && $powerAccurate && !$criticalCount && $lastNumber <= $powerAccurate) {
        $resultRow = "$currentResultRow | 振り直し: ";
        next;
      } else {
        $resultRow .= $currentResultRow;
        last;
      }
    }

    push(@result, $resultRow);
  }
  return join('<br>',@result);
}

sub rateCalc {
  my $rate     = shift;
  my $crit     = shift; 
  my $form     = shift;
  my $rate_up  = shift;
  my $crit_atk = shift;
  my $crit_ray = shift;
  my $fixed    = shift;
  my $curse    = shift;
  my $virtuousCrown = shift;
  my $gf       = shift;
  my $label    = shift;
  my $repeat   = shift;
  my $unique   = (exists $unique{$rate}) ? $unique{$rate}{'name'} : '';
  
  return '' if $form =~ /[a-z]/i;
  
  my $total = 0;
  my $code = (defined($label) ? $label . ' ' : '') . ($unique || "威力${rate}");
  my @results;
  my $crits_max = 20;
  my $lastNumber;
  foreach my $crits (0 .. $crits_max) {
    my $number;
    my $inside_code;
    # 出目固定
    if($fixed){
      #片方固定
      if((my $demifixed = $fixed) =~ s/^n//){
        $demifixed = ($demifixed > 6) ? 6 : ($demifixed < 1) ? 1 : $demifixed;  
        my $dice = int(rand(6)) + 1;
        $number = $dice + $demifixed;
        $inside_code = "($demifixed)+${dice}";
        #出目最低値がC値以下だと∞
        if($crit && $demifixed > 1 && $demifixed+1 >= $crit){ return ($code." C値${crit} → \[${inside_code}:クリティカル!!!\]... = ∞", undef, $number); }
      }
      #両方固定
      else {
        $number = ($fixed > 12) ? 12 : ($fixed < 2) ? 2 : $fixed;
        if($number <= 2 && !$unique && !$virtuousCrown){ return ($code." → \[${number}:1ゾロ..\] = 0", 0, $number); }
        $fixed = 0; # 1回処理したらなくなる
      }
    }
    else {
      if($gf){ #GF
        my $dice = int(rand(6)) + 1;
        $number = $dice * 2;
        $inside_code = "${dice}*2";
      }
      else { #通常
        my $dice1 = int(rand(6)) + 1;
        my $dice2 = int(rand(6)) + 1;
        $number = $dice1 + $dice2;
        $inside_code = "${dice1}+${dice2}";
      }
    }
    my $number_result = $number;
    
    # 1ゾロ
    if(!$crits && $number <= 2 && !$unique && !$virtuousCrown){
      return ($code." → \[${inside_code}=${number}:1ゾロ..\] = 0", 0, $number);
      last;
    }
    $inside_code .= $inside_code ? '=' : '';
    
    # 必殺
    if($crit_atk && ($number > 2 || $unique)){
      $number += $crit_atk;
      $number = 12 if $number > 12;
      $number = 2  if $number <  2;
      $number_result .=">$number";
    }
    # クリティカルレイ
    if($crit_ray != 0 && (!defined($repeat) || $repeat == 1 || $unique)){
      $number += $crit_ray;
      $number = 12 if $number > 12;
      $number =  2 if $number <  2;
      $number_result .=">$number";
      $crit_ray = 0; # 1回処理したらなくなる
    }
    # アビスカース「難しい」
    if($curse && $number <= $curse){
      $number = 2;
      $number_result .=">×";
    }
    
    $lastNumber = $number;
    
    # 威力結果算出
    my $power;
    if($unique){
      $power = $unique{$unique}{'num'}[$number-2];
    }
    else {
      if   ($number < 3) { $power = 0; } #1ゾロ
      else { $power = ((hex($rating[$rate][$number-3]) - $number - $rate) / ($number + $rate)); } #それ以外
    }
    $total += $power;
    
    # クリティカル
    if($crit && $number >= $crit){
      push(@results, " $power\[${inside_code}${number_result}:クリティカル!\] ");
      # 首切
      if($rate_up){
        $rate += $rate_up;
        $rate = 100 if $rate > 100; #威力100以上にはしない
        $rate = 0 if $rate < 0;   #威力0未満にはしない
        $code .= ">$rate";
      }
      # 〆
      push(@results, "[クリティカル限界設定オーバーです。振り足してください]") if ($crits >= $crits_max);
      next;
    }
    
    # クリティカルしなかったので〆
    push(@results, " $power\[${inside_code}${number_result}\] ");
    last;
  }
  my $result = join('+', @results);
  my $criticalCount = $#results; # クリティカルした回数
  
  ## 修正値処理
  $form =~ s|半減|//|;
  $form =~ s/(\/\/|\*\*)([0-9]*)/<\/\/>/;
  my $half_type = $1;
  my $half_num = $2;
  my ($pre_add, $post_add) = split('<//>', $form);
  if($pre_add){
    $pre_add = parenthesisCalc($pre_add);
    if($pre_add eq ''){ return ''; }
  }
  $result .= $pre_add;
  $total += int(calc($pre_add));
  
  ## 半減,倍化処理
  if(!$half_num){ $half_num = 2 }
  if($half_type =~ /^\/\//){ $result = "{ $result = $total } /$half_num "; $total = ceil($total / $half_num); }
  elsif($half_type =~ /^\*\*/){ $result = "{ $result = $total } *$half_num "; $total = $total * $half_num; }
  ## 半減後追加
  if($post_add){
    $post_add = parenthesisCalc($post_add);
    if($post_add eq ''){ return ''; }
  }
  $result .= $post_add;
  $total += int(calc($post_add));
  
  $result .= ' = ';
  $code .= " C値${crit}" if $crit;
  return ($code . $gf. ' → '. $result . $total, $criticalCount, $lastNumber);
}

sub growRoll {
  my $comm = shift;
  if($comm !~ /^
    (?: gr | 成長ダイス )
    ( [0-9] )?
    (?:\s|$)
  /ix){
    return "";
  }
  my $num = $1;
  my @grow = ('器用度','敏捷度','筋力','生命力','知力','精神力');
  
  $num = $num ? $num : 2;
  my @result;
  foreach(1 .. $num){
    push(@result, $grow[int(rand(6))]);
  }
  return join(' or ', @result);
}

sub makeRollIndexText {
  my $repeatId = shift;
  return undef unless defined($repeatId);
  my @chars = (
      '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
      '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
      '㉑', '㉒', '㉓', '㉔', '㉕', '㉖', '㉗', '㉘', '㉙', '㉚',
      '㉛', '㉜', '㉝', '㉞', '㉟', '㊱', '㊲', '㊳', '㊴', '㊵',
      '㊶', '㊷', '㊸', '㊹', '㊺', '㊻', '㊼', '㊽', '㊾', '㊿',
  );
  return $chars[$repeatId - 1];
}

1;