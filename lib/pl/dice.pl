use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use List::Util qw/shuffle/;
use POSIX qw/ceil/;

###################
### ダイス処理


sub diceCheck {
  my $comm = shift;
  
  $comm =~ s/&gt;/>/;
  $comm =~ s/&lt;/</;
  $comm =~ s/<br>/ /;
  $comm =~ tr/ａ-ｚＡ-Ｚ０-９＋－＊／＾＠＄＃（）＜＞、＝！：｜/a-zA-Z0-9\+\-\*\/\^@\$#\(\)<>,=!:\|/;
  if   ($comm =~ /^[0-9\+\-\*\/()]*[0-9]+\)?D\(?([0-9\+\-\*\/@<>:=|\[]|\s|$)/i){ return diceRoll($comm), 'dice'; }
  elsif($comm =~ /^[0-9]*\@/){ return shuffleRoll($comm); }
  elsif($::in{'game'} eq 'sw2' && $comm =~ /^[^\s]*\$(?:貫通|突破)/) {
    require './lib/pl/dice/sw2.pl';
    return lineAoECheck($comm), 'dice:sw';
  }
  elsif($comm =~ /^[0-9]*\$/){ return  choiceRoll($comm); }
  elsif($comm =~ /^[0-9]*\#/){ return drawDeck($comm), 'deck'; }
  elsif($comm =~ /^set\#/   ){ return setDeck($comm), 'deck'; }
  # 四則演算
  elsif($comm =~ /^
    ( [(⌈]? \-? [0-9.]+ [\+\-\/*\^]
      [0-9.\+\-\/*\^()⌈⌉]*
      [0-9.] [)⌉]? )
    [=＝](?:\s|$)
    /ix){
    my $formula = $1;
    if($formula !~ /[\+\-\/\*\^]/) { return ''; }
    if($formula =~ m|//|) { return ''; }
    my $formula_perl = $formula;
    $formula =~ s#\^#\*\*#g;
    $formula_perl =~ s#\*\*#\^#g;
    $formula =~ s/⌈(.+?)⌉/ceil($1)/g;
    my $result = eval($formula);
    if($result eq ''){ return ''; }
    return "${formula_perl} = ${result}", 'dice';
  }
  # SW2
  elsif($::in{'game'} eq 'sw2'){
    if   ($comm =~ /^([rk]|威力)[0-9()a-zァ-ヴ]/i){ require './lib/pl/dice/sw2.pl'; return rateRoll($comm), 'dice:sw'; }
    elsif($comm =~ /^(gr|成長ダイス)/i)           { require './lib/pl/dice/sw2.pl'; return growRoll($comm), 'dice:sw'; }
  }
  # DX3
  elsif($::in{'game'} eq 'dx3'){
    if   ($comm =~ /^ET(P|N)?(?:\s|$)/i)      { require './lib/pl/dice/dx3.pl'; return emotionRoll($1), 'dice:dx'; }
    elsif($comm =~ /^HC(?:\s|$)/i)            { require './lib/pl/dice/dx3.pl'; return hcRoll(), 'dice:dx'; }
    elsif($comm =~ /^\+?ER([0-9]*)(?:\s|$)/i) { require './lib/pl/dice/dx3.pl'; return encroachRoll($1); }
    elsif($comm =~ /^-ER([0-9]*)(?:\s|$)/i)   { require './lib/pl/dice/dx3.pl'; return encroachRoll($1,1); }
    elsif($comm =~ /^RE([0-9]*)(?:\s|$)/i)    { require './lib/pl/dice/dx3.pl'; return resurrectRoll($1); }
    elsif($comm =~ /^\+RE([0-9]*)(?:\s|$)/i)  { require './lib/pl/dice/dx3.pl'; return resurrectRoll($1,1); }
    elsif($comm =~ /^[0-9\+\-\*\/()]+(r|dx)/i){ require './lib/pl/dice/dx3.pl'; return dxRoll($comm), 'dice:dx'; }
  }
  # BLOODORIUM
  elsif($::in{'game'} =~ /^bloodorium/){
    if($comm =~ /^(([0-9\+\-\*\/()]+DC|DC[0-9\+\-\*\/()]+)(\s*(add|sub)\s*([0-9\+\-\*\/()]+))?)(?:\s|$)/i){
      my $code = $1;
      require './lib/pl/dice/bloodorium.pl';
      return bloodoriumDiceCheck($comm), 'dice:bloodorium', $code;
    }
  }
}

sub diceRoll {
  my $comm = shift;
  if($comm !~ /^
    ( 
      \(?
      [0-9\+\-\*\/()]*
      [0-9]+
      \)?
      D
      [0-9(]*
      (\[[>=<]=\d+:[-+]\d+\])?
      \+?
      [0-9(]*
      [0-9\+\-\*\/()⌈⌉D@]*?
    )
    (?:(\/\/|\*\*) ([0-9]*) ([+-][0-9()][0-9\+\-\*()⌈⌉]*)? )?
    (?:(>=?|<=?|==) ([0-9\+\-\*()|]*) )?
    =?
    (?:\:([0-9]+|.+,.+))?
    (?:\s|$)
  /ix){
    return "";
  }
  
  my $base      = $1;
  my $burst     = $2;
  my $halfType  = $3;
  my $halfNum   = $4;
  my $add       = $5;
  my $rel       = $6;
  my $target    = $7;
  my $repeat    = $8;
  
  $base =~ s/\[.+?\]// if $burst;
  $base = parenthesisCalc($base);
  if($base eq ''){ return ''; }
  if($add){
    $add = parenthesisCalc($add);
    if($add eq ''){ return ''; }
  }
  if($target){
    for my $x (split(/\|/, $target)) {
      return '' if $x eq '';
    }
  }

  my @repeatLabels;
  if ($repeat !~ /,/) {
    @repeatLabels = ();
    $repeat = ($repeat > 50) ? 50 : (!$repeat) ? 1 : $repeat;
    push(@repeatLabels, '') foreach (1 .. $repeat);
  } else {
    @repeatLabels = split(/\s*,\s*/, $repeat);
    $repeat = @repeatLabels;
    $repeat = 50 if $repeat > 50;
    @repeatLabels = @repeatLabels[0 .. ($repeat - 1)];
  }

  my @result;
  foreach my $label (@repeatLabels){
    push(@result,
      ($label ne '' ? "〚$label〛 " : '') . diceCalc(
        $base      ,
        $burst    ,
        $halfType ,
        $halfNum  ,
        $add       ,
        $rel       ,
        $target    ,
      )
    );
  }
  return join('<br>',@result);
}

sub diceCalc {
  my $base      = shift;
  my $burst     = shift;
  my $halfType  = shift;
  my $halfNum   = shift;
  my $add       = shift;
  my $rel       = shift;
  my $targets   = shift;
  
  my $total = 0;
  my $dice_value = 0;
  my @code;
  # xDyを処理
  while ($base =~ s/([0-9]+)D([0-9]*)(@[0-9]+)?/<dice>/i){
    my ($code, $num, $text) = dice($1, $2, $3);
    return "$code → error\[$text\]" if $num eq '';
    return "$code → ∞" if $num eq '∞';
    push(@code, $code);
    $base =~ s/<dice>/ $num\[$text\] /;
    $dice_value += $num;
  }
  $base =~ s/[\.\+\-\*\/\s]+$//gi; # 末尾の演算子は消す

  # ファンブル／自動失敗チェック
  my $fumble;
  if( #SW2：2D6＆大なり記号あり＆1ゾロ
    ($::in{'game'} eq 'sw2') &&
    $#code == 0 &&
    $code[0] =~ /^2D6$/i &&
    $rel =~ /^>=?$/ &&
    $base =~ /\Q2[1,1...]\E/
  ) {
    $fumble = '自動失敗';
  }
  
  if ($burst && $burst =~ /^\[([>=<]=)(\d+):([-+]\d+)\]$/) {
    my $comparison = $1;
    my $border = $2;
    my $offset = $3;
    if (
        $comparison eq '>=' && $dice_value >= $border ||
        $comparison eq '==' && $dice_value == $border ||
        $comparison eq '<=' && $dice_value <= $border
    ) {
      $code[$#code] .= "($offset)";
      $base .= $offset;
    }
  }
  
  ## 基本合計値計算
  my $result = $base;
  $base =~ s/\[.+?\]//g; # []とその中は消す
  if($base =~ /@/){ return '' }
  my $total = calc($base);
  
  ## 半減,倍化処理
  if(!$halfNum){ $halfNum = 2 }
  if   ($halfType =~ /^\/\//){ $result = "{ $result = $total } /$halfNum "; $total = ceil($total / $halfNum); }
  elsif($halfType =~ /^\*\*/){ $result = "{ $result = $total } *$halfNum "; $total = $total * $halfNum; }
  ## 半減後追加
  $result .= $add;
  $total += calc($add);
  
  $total = int($total);
  
  if($result =~ /[\+\-\*\/\,]/){ $result .= ' = ' . $total; }
  else { $result = $total; }
  
  my $code = join('+',@code);
  
  ## ファンブル処理
  if($fumble){
    $result .= ' → '.$fumble;
  }
  ## 目標値成否
  elsif($rel && $targets ne '' && $targets ne '|'){
    $result .= ' → ';
    $code .= $rel;
    for my $target (split(/\|/, $targets)) {
      $target = parenthesisCalc($target);
      return '' if $target eq '';
      if ($result =~ /(成功|失敗)$/) {
        $result .= '／';
        $code .= '|';
      }
      if (
          ($rel eq '>'  && $total >  $target) ||
          ($rel eq '>=' && $total >= $target) ||
          ($rel eq '<'  && $total <  $target) ||
          ($rel eq '<=' && $total <= $target) ||
          ($rel eq '==' && $total == $target)
      ) {
        $result .= '成功';
      }
      else {$result .= '失敗';}
      $code .= $target;
    }
  }
  
  return $code .' → '. $result;
}

sub dice {
  my $rolls = $_[0];
  my $faces = $_[1];
  my $crit  = $_[2]; $crit =~ s/^@//;
  if($faces eq ''){ $faces = $set::games{$::in{'game'}}{'faces'} || 6 }
  if   ($rolls > 200) { return ("${rolls}D${faces}", '', 'ダイスの個数は200が最大です'); }
  elsif($faces > 1000){ return ("${rolls}D${faces}", '', 'ダイスの面数は1000が最大です'); }
  elsif($crit ne '' && $crit  <= $rolls){ return ("${rolls}D${faces}\@${crit}", '∞'); }
  
  my $numTotal;
  my @fullResults;
  foreach (my $i = 0; $i < 100; $i++) {
    my $num;
    my @results;
    foreach (1 .. $rolls){
      my $number = int(rand $faces) + 1;
      push(@results, $number);
    } 
    $num += $_ foreach @results;
    $numTotal += $num;
    
    my $result = join(',', @results);
    if($rolls && $::in{'game'} =~ /sw2/i){
      $result .= ($rolls*$faces == $num) ? '!!' : ($rolls == $num) ? '...' : '';
    }
    
    push(@fullResults, $result);
    
    last if !$crit;
    last if $num < $crit;
  }
  
  return
    "${rolls}D${faces}".($crit?"\@${crit}":''),
    $numTotal,
    join('][', @fullResults);
}

sub shuffleRoll {
  my $comm = shift;
  if($comm !~ s/^
    ([0-9]+)? @ (.*?) ([-+][-+*\/()0-9]+)?
    (?:\s|$)
  //ix){
    return;
  }
  my $rolls = my $rollsRaw = $1;
  my $faces = $2;
  my $modifier = $3;
  my $max = 20;
  my $def = 1;
  if($set::random_table{$faces}){
    $max = $set::random_table{$faces}{'max'} || $max;
    $def = $set::random_table{$faces}{'def'} || $def;
  }
  $rolls = $rolls > $max ? $max
         : !$rolls ? $def
         : $rolls;

  my $roomRandomTableReference = loadRoomRandomTable($faces);

  if(defined($roomRandomTableReference) || $set::random_table{$faces} // $set::random_table{$faces . $modifier}) {
    if (!defined($roomRandomTableReference) && !$set::random_table{$faces}) {
      # 補正値っぽい部分まで含めて表の名前だったっぽい:
      $faces .= $modifier;
      $modifier = undef;
    }

    my @list;

    if (defined($roomRandomTableReference)) {
      my %roomRandomTable = &loadRoomRandomTable($faces);
      @list = @{ $roomRandomTable{rows} };
    } else {
      open(my $FH, '<', "${set::rtable_dir}/$set::random_table{$faces}{'data'}") or error($set::random_table{$2} . 'が開けません');
      @list = <$FH>;
      close($FH);
    }

    if($list[0] =~ /^[0-9]+D[0-9]+$/i){
      return randomDiceTableRoll($rolls,$faces,$modifier,@list), 'choice:table';
    }
    else {
      @list = shuffle(@list);
      my @choice = @list[0 .. $rolls-1];
      foreach (@choice){
        chomp $_;
        $_ =~ s/\\n/<br>/g;
        $_ .= ($set::random_table{$faces}{'faces'} ? ' ('.$set::random_table{$faces}{'faces'}[rand @{ $set::random_table{$faces}{'faces'} }].')' : '')
      }
      return "${rolls}＠${faces} → [".join('][', @choice)."]", 'choice:list';
    }
  }
  else {
    $faces =~ s/>/&gt;/;
    $faces =~ s/</&lt;/;
    my @list = split(/[,、]/, $faces);
    return "" if (@list <= 1 || (!$rollsRaw)); #誤爆防止
    my @indexes = 0 .. $#list;
    @indexes = shuffle(@indexes);
    my @choiceIndexes = splice(@indexes, 0, $rolls);
    @choiceIndexes = sort(@choiceIndexes);
    @indexes = sort(@indexes);
    my @choice = ();
    foreach (@choiceIndexes) {
      push(@choice, $list[$_]);
    }
    my @notChoice = ();
    foreach (@indexes) {
      push(@notChoice, $list[$_]);
    }
    return '<b>【✔:'.join(',', @choice).'】</b> <s>［×:'.join(',', @notChoice).'］</s>', 'choice';
  }
  return "";
}

sub choiceRoll {
  my $comm = shift;
  if($comm !~ /^
    ([0-9]+)? \$ (.*?) ([-+][-+*\/()0-9]+)?
    (?:\s|$)
  /ix){
    return "";
  }
  my $rolls = my $rollsRaw = $1;
  my $faces = $2;
  my $modifier = $3;
  my $max = 20;
  my $def = 1;
  if($set::random_table{$faces}){
    $max = $set::random_table{$faces}{'max'} || $max;
    $def = $set::random_table{$faces}{'def'} || $def;
  }
  $rolls = $rolls > $max ? $max
         : !$rolls ? $def
         : $rolls;

  my $roomRandomTableReference = loadRoomRandomTable($faces);

  if(defined($roomRandomTableReference) || $set::random_table{$faces} // $set::random_table{$faces . $modifier}) {
    if (!defined($roomRandomTableReference) && !$set::random_table{$faces}) {
      # 補正値っぽい部分まで含めて表の名前だったっぽい:
      $faces .= $modifier;
      $modifier = undef;
    }

    my @list;

    if (defined($roomRandomTableReference)) {
      my %roomRandomTable = &loadRoomRandomTable($faces);
      @list = @{ $roomRandomTable{rows} };
    } else {
      open(my $FH, '<', "${set::rtable_dir}/$set::random_table{$faces}{'data'}") or error($set::random_table{$faces} . 'が開けません');
      @list = <$FH>;
      close($FH);
    }

    if($list[0] =~ /^[0-9]+D[0-9](?:,\d+D\d+)*+(?:\s+\d+){0,2}$/i){
      return randomDiceTableRoll($rolls,$faces,$modifier,@list), 'choice:table';
    }
    else {
      my @choice;
      foreach (1 .. $rolls){
        push(@choice,
          $list[rand(@list)]
          . ($set::random_table{$faces}{'faces'} ? ' ('.$set::random_table{$faces}{'faces'}[rand @{ $set::random_table{$faces}{'faces'} }].')' : '')
        );
      }
      foreach (@choice){ chomp $_; $_=~ s/\\n/<br>/g; }
      return "${rolls}＄${faces} → [".join('][', @choice)."]", 'choice:list';
    }
  }
  else {
    $faces =~ s/>/&gt;/;
    $faces =~ s/</&lt;/;
    my @list = split(/[,、]/, $faces);
    return "" if (@list <= 1 || (!$rollsRaw)); #誤爆防止

    my @results;
    foreach (1 .. $rolls){
      push(@results, $list[rand(@list)]);
    }
    return "(${faces}) → ".join(',', @results), 'choice';
  }
  return "";
}

sub randomDiceTableRoll {
  my $repeat = shift;
  my $name = shift;
  my $modifier = shift;
  my $code = shift;
  chomp $code;
  my ($rolls, $faces) = split(/D/i, $code);
  my %data;
  my $min;
  my $max;
  foreach (@_){
    chomp $_;
    $_=~ s/\\n/<br>/g;
    if($_ =~ /^(-?[0-9]+):/){
      $data{$1} = $_;
      $min = $1 if !defined($min) || $1 < $min;
      $max = $1 if !defined($max) || $1 > $max;
      $data{$1} =~ s/^(-?[0-9]+)://;
    }
    else {
      my $key = $_;
      $key =~ s/^(.+?):.*$/$1/s;
      $data{$key} = $_;
      $data{$key} =~ s/^([-0-9]+(,[-0-9]+)*)://;
    }
  }
  my $results;
  foreach(1 .. $repeat){
    my $key = '';
    my $values = '';
    my $texts = '';
    my @codeParts = split(',', $code);
    error "この表に補正値は適用できません" if $#codeParts > 0 && $modifier;
    for my $i (0 .. $#codeParts) {
      my $codePart = $codeParts[$i];
      ($codePart, my $rolledTotal, my $rolledNums) = dice(split(/D/i, $codePart));
      my $finalValue = defined($modifier) ? calc("$rolledTotal$modifier") : $rolledTotal;
      $finalValue = $min if defined($min) && $finalValue < $min;
      $finalValue = $max if defined($max) && $finalValue > $max;
      $rolledNums =~ s/[\!\.]//g;

      $key .= ',' if $key ne '';
      $key .= $finalValue;
      $values .= ',' if $values ne '';
      $values .= $rolledTotal;
      $texts .= ',' if $texts ne '';
      $texts .= $rolledNums;
    }
    $texts = '' if $texts eq $values;
    $results .= '<br>' if $results;
    if(exists $data{$key}){
      $results .= "＠$name → $code" . (defined($modifier) ? "($modifier)" : '') . " → $values" . ($texts ne '' ? "\[$texts\]" : '') . "$modifier : \[$data{$key}\]";
    }
    else {
      error "合致する行がありませんでした（出目: $key）";
    }
  }
  return $results;
}

sub setDeck {
  my $comm = shift;
  if($comm !~ /^
    set \# (?<deckName>.*?) [=＝] (?<list>.+?)
    (?:\s|$)
  /ix){
    return;
  }
  if($set::random_table{$+{list}}) {
    open(my $FH, '<', "${set::rtable_dir}/$set::random_table{$+{list}}{'data'}") or error($set::random_table{$+{list}}{'data'}.'が開けません');
    my @list = <$FH>;
    close($FH);
    if($list[0] =~ /^[0-9]+D[0-9]+$/i){ error("$+{deckName}は山札にできない表です"); }
    
    foreach (@list){ chomp $_; $_=~ s/\\n/<br>/g; }
    my %deck;
    sysopen(my $FH, "./room/$::in{'room'}/deck.pl", O_RDWR | O_CREAT) or error "deck.plが開けません";
    flock($FH, 2);
    my @lines = <$FH>;
    %deck = %{ decode_json(encode('utf8', (join '', @lines))) } if @lines;
    seek($FH, 0, 0);
    
    $deck{$+{deckName}} = { 'cards' => [ @list ], 'faces' => $set::random_table{$+{list}}{'faces'} };
    
    print $FH decode('utf8', encode_json \%deck);
    truncate($FH, tell($FH));
    close($FH);
    return "山札＃$+{deckName} に［$+{list}］をセットしました。";
  }
  return "";
}

sub drawDeck {
  my $comm = shift;
  if($comm !~ /^
    ([0-9]+)? \# (?<deckName>.*?)
    (?:\s|$)
  /ix){
    return "";
  }
  my $draw = $1 || 1;

  my %deck;
  sysopen(my $FH, "./room/$::in{'room'}/deck.pl", O_RDWR | O_CREAT) or return "";
  flock($FH, 2);
  my @lines = <$FH>;
  %deck = %{ decode_json(encode('utf8', (join '', @lines))) } if @lines;
  seek($FH, 0, 0);
  
  my @draws; my $finish;

  if($deck{$+{deckName}} && $deck{$+{deckName}}{'cards'}){
    if(!@{ $deck{$+{deckName}}{'cards'} }){ return "${draw}＃$+{deckName} → 山札が空です。" }
    foreach(1 .. $draw){
      push (@draws,
        splice(@{ $deck{$+{deckName}}{'cards'} }, int rand @{ $deck{$+{deckName}}{'cards'} }, 1)
          . ($deck{$+{deckName}}{'faces'} ? ' ('.$deck{$+{deckName}}{'faces'}[rand @{ $deck{$+{deckName}}{'faces'} }].')' : '')
      );
      if(@{ $deck{$+{deckName}}{'cards'} } <= 0){ $finish = 1; $draw = $_; last; }
    }
  }
  else { return '' }
  
  print $FH decode('utf8', encode_json \%deck);
  truncate($FH, tell($FH));
  close($FH);
  return "${draw}＃$+{deckName} → [".join('][',@draws)."]".($finish ? '<br>山札がなくなりました。':'');
}

sub loadRoomRandomTable {
  my $tableName = shift;

  my %tables = &loadRandomTables();

  if (!exists($tables{$tableName})) {
    return undef;
  }

  my %table = %{ $tables{$tableName} };

  if ($table{'diceCode'}) {
    my $command = $table{'diceCode'}{'command'};
    my @rows = @{ $table{'rows'} };
    unshift(@rows, $command);
    delete $table{'diceCode'};
    $table{'rows'} = \@rows;
  }

  return %table;
}

sub loadRandomTables {
  sysopen(my $FH, "./room/$::in{'room'}/room.dat", O_RDONLY) or error "room.datが開けません";
  my %data = %{ decode_json(encode('utf8', (join '', <$FH>))) };
  close($FH);

  if (!$data{randomTables}) {
    return {};
  }

  my %tables = %{ $data{randomTables} };
  return %tables;
}

1;