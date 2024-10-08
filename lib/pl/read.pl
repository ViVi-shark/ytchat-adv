use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use Encode qw/encode decode/;
use JSON::PP;
use Time::Piece;

###################
### 読み込み処理

my $dir = "./room/$::in{'room'}/";

my %tablog;
my $logfile = 'log-pre.dat';
my $reverseOn = 0;
if(!$::in{'loadedLog'}){
  my $presize = -s $dir.'log-pre.dat';
  my $allsize = -s $dir.'log-all.dat';
  if($allsize > $presize){ $logfile = 'log-all.dat'; $reverseOn = 1; }
}
my $now = localtime;
my @lines; my %palette;
my %pictures;
open(my $FH, '<', $dir.$logfile) or error "${logfile}が開けません";
foreach($reverseOn ? (reverse <$FH>) : <$FH>) {
  chomp;
  $_ =~ s/\\/\\\\/g;
  $_ =~ s/"/\\"/g;
  $_ =~ s/\t/\\t/g;
  my ($num, $date, $tab, $name, $color, $comm, $info, $system, $user, $address) = split(/<>/, $_);
  $color =~ s/^#{2,}/#/;
  # 初回読込時は各タブ最大100件まで読み込む
  if(!$::in{'loadedLog'}){
    next if $tablog{$tab} > 100;
  }
  # 以後差分まで
  else {
    last if ($::in{'num'} > $num - 1);
  }
  #
  my $timePiece = Time::Piece->strptime($date, '%Y/%m/%d %H:%M:%S');
  my $time = $timePiece->strftime($now->epoch - $timePiece->epoch > 60 * 60 * 12 ? '%Y/%m/%d %H:%M:%S' : '%H:%M:%S');
  my ($username, $userid) = $user =~ /^(.*)<([0-9a-zA-Z]+?)>$/;
  my $game;
  my $code;
  my @infos = split(/<br>/,$info);
  foreach (@infos){
    { $_ =~ s/\<\<(.*)$/$code = $1; ''/e; }
    if($system =~ /^dice/){
      $_ =~ s#(\[.*?\])#<i>$1</i>#g;
      $_ =~ s# = ([0-9a-z.∞]+)$# = <strong>$1</strong>#gi;
      $_ =~ s# = ([0-9a-z.∞]+)# = <b>$1</b>#gi;
      $_ =~ s# → ((?:成功|(?:自動)?失敗|／)+)$#" → ".stylizeSuccessAndFailure($1)#gie;
      #クリティカルをグラデにする
      my $crit = $_ =~ s/(クリティカル!\])/$1<em>/g;
      while($crit > 0){ $_ .= "</em>"; $crit--; }
      $_ =~ s#\[([0-9,]+?)!!]#<em>[$1]</em>#g;
      #ファンブル用の色適用
      if($_ =~ /1ゾロ|ファンブル/){
        if ($_ !~ /\|/) {
          $_ = "<em class='fail'>$_</em>";
        } else {
          my $retryFailed;
          if ($_ =~ /\|.+1ゾロ/) {
            $_ =~ s#^([^|]+?)(\s*\|\s*)(.+?)$#$1$2<em class='fail'>$3</em>#g ;
            $retryFailed = 1;
          }
          if ($_ =~ /1ゾロ.+\|/) {
            if ($retryFailed) {
              $_ =~ s#^([^|]+?)(\s*\|\s*)(.+?)$#<em class='fail'>$1</em>$2$3#g;
            } else {
              # 振り直し後が１ゾロでなかったのなら、行見出し部分にはファンブル色を適用しない（適用しない部分が $1 ）
              $_ =~ s#^(.*?)(威力[^|]+?)(\s*\|\s*)(.+?)$#$1<em class='fail'>$2</em>$3$4#g;
            }
          }
        }
      }
      $_ =~ s#\[([0-9,]+?)\.\.\.\]#<em class='fail'>[$1]</em>#g;
      #
      $_ =~ s#\{(.*?)\}#{<span class='division'>$1</span>}#g;

      if ($system =~ /^dice:?bloodorium$/) {
        if ($_ =~ /《トライアンフ》/) {
          $_ =~ s#\*([1-6])\*#<strong class='triumph-group' data-triumph-group-name='1'>$1</strong>#g;
          $_ =~ s#_([1-6])_#<strong class='triumph-group' data-triumph-group-name='2'>$1</strong>#g;
          $_ =~ s#~([1-6])~#<strong class='triumph-group' data-triumph-group-name='3'>$1</strong>#g;
          $_ =~ s#\#([1-6])\##<strong class='triumph-group' data-triumph-group-name='4'>$1</strong>#g;
          $_ =~ s#\^([1-6])\^#<strong class='triumph-group' data-triumph-group-name='5'>$1</strong>#g;
          $_ =~ s#@([1-6])@#<strong class='triumph-group' data-triumph-group-name='6'>$1</strong>#g;
        }

        $_ =~ s#⇒ (\d+)$#⇒ <strong>$1</strong>#;
      }
    }
    elsif($system eq 'choice') {
      if($_ =~ s#(\(.+\) → )(.+?)$#$1#){
        foreach my $result (split ",", $2) {
          $_ .= "<b class='result'>$result</b>";
        }
      }
    }
    elsif($system =~ /^unit/){
      $_ =~ s# (\[.*?\])# <i>$1</i>#g;
    }
  }
  $info = join('<br>', @infos);
  
  if($system =~ /^(choice:list|deck)/){
    $info =~ s#\[(.*?)\](?=\[|<br>|$)#<b class='result'>$1</b>#g;
  }
  elsif($system =~ /^(choice:table)/){
    $info =~ s#(?<=:) \[(.*?)\](?=.+? → |$)#<b class='chart-result'>$1</b>#g;
  }
  
  if($system eq 'palette'){
    $palette{$name} = 1;
  }elsif($system eq 'picture-settings'){
    $pictures{$name} = 1;
  }
  
  my $openlater;
  if($address =~ s/\#$//){ $openlater = 1; }
  if($address && $address ne $::in{'userId'} && $userid ne $::in{'userId'}){
    if($system =~ /^deck/){
      if($info =~ /([0-9]+)[#＃](.+?) →/){
        $info = "＃$2 から $1 枚ドローしました。"
      }
      else { $info = ''; }
      $address = '';
      $comm = '';
      $name = $username;
    }
    else {
      $name = $username;
      $comm = $info = '';
    }
  }
  if($address && ($address eq $::in{'userId'} || $userid eq $::in{'userId'})){
    if($system =~ /^deck/){
      $info .= '<span class=small><br>(※引いた枚数は全員に通知されます)</span>';
    }
  }
  
  my $picture;
  if ($comm =~ s/\s*(?:<|&lt;)picture:\s*(.+?)?\s*(?:>|&gt;)\s*//) {
    $picture = $1 if defined($1) && $1 ne 'none';
  }
  
  my $line  = '{'
    . '"num":'       .$num
    . ',"date":"'    .$time.'"'
    . ',"tab":"'     .$tab.'"'
    . ',"userId":"'  .$userid.'"'
    . ',"userName":"'.$username.'"'
    . ',"name":"'    .$name.'"'
    . ',"color":"'   .$color.'"'
    . ',"picture":"' .$picture.'"'
    . ',"comm":"'    .$comm.'"'
    . ($info   ? ',"info":"'   .$info.   '"' : '')
    . ($code   ? ',"code":"'   .$code.   '"' : '')
    . ($system ? ',"system":"' .$system. '"' : '')
    . ($address  ? ',"address":"'  .$address.  '"' : '')
    . ($openlater? ',"openlater":"'.$openlater.'"' : '')
    . '}';
  unshift(@lines, $line);
  $tablog{$tab}++;
}
close($FH);

my $paletteOuts;
if(%palette && $::in{'loadedLog'}){
  open(my $FH, '<', $dir.'room.dat') or error "room.datが開けません";
  my %load = %{ decode_json(encode('utf8', (join '', <$FH>))) };
  close($FH);
  my %pdata;
  foreach my $n (keys %palette){ $pdata{$n} = $load{'unit'}{$n}{'palette'} }
  $paletteOuts = decode('utf8', encode_json (\%pdata))
}

my $pictureOuts;
if(%pictures || !$::in{'loadedLog'}){
  open(my $FH, '<', $dir.'room.dat') or error "room.datが開けません";
  my %load = %{ decode_json(encode('utf8', (join '', <$FH>))) };
  close($FH);
  my %data;
  foreach my $n (keys %pictures){ $data{$n} = $load{'unit'}{$n}{'pictures'}; }
  $pictureOuts = decode('utf8', encode_json (\%data));
}

$" = ",";
print "Content-type:application/json; charset=UTF-8\n\n";
print '{';
print "\"logs\":[@lines]";
print ",\"palette\":$paletteOuts" if $paletteOuts;
print ",\"pictures\":$pictureOuts" if $pictureOuts;
print '}';

exit;

1;