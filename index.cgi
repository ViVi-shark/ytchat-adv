#!/usr/bin/perl
####################################
##               ゆとチャadv.     ##
##          by ゆとらいず工房     ##
##    https://yutorize.2-d.jp     ##
####################################
use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use CGI;
use CGI::Carp qw(fatalsToBrowser);

### バージョン #######################################################################################
our $ver = "1.02.000k";

### 設定読込 #########################################################################################
require './config.cgi';


### 各処理へ移動 #####################################################################################
our %in = getParam();

my $mode = $in{'mode'};

if    ($mode eq 'write') { require './lib/pl/write.pl'; }  #書込
elsif ($mode eq 'read')  { require './lib/pl/read.pl'; }   #読込
elsif ($mode eq 'room')  { require './lib/pl/room.pl'; }   #ルーム表示
elsif ($mode eq 'load')  { require './lib/pl/load.pl'; }   #ルームロード
elsif ($mode eq 'create'){ require './lib/pl/create.pl'; } #ルーム作成
elsif ($mode eq 'logs')  { require './lib/pl/logs.pl'; }   #過去ログ
elsif ($mode eq 'reset') { require './lib/pl/reset.pl'; }  #ルームリセット
elsif ($mode eq 'change'){ require './lib/pl/change.pl'; } #ルーム設定変更
elsif ($mode eq 'getfilename') { message(getFileNameDate()); }
else { require './lib/pl/list.pl'; } #部屋一覧

print "Content-type:text/plain; charset=UTF-8\n\n";
print "入力がありません";

### 共通処理 ########################################################################################
## パラメータ取得
sub getParam {
  my %params;
  my $query;
  if($ENV{'REQUEST_METHOD'} eq "POST") {
    read(STDIN, $query, $ENV{'CONTENT_LENGTH'});
  }
  else {
    $query = $ENV{'QUERY_STRING'};
  }

  my @pairs = split('&', $query);
  foreach (@pairs){
    my ($name, $value) = split('=', $_);
    $value =~ tr/+/ /;
    $value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
    $params{$name} = $value;
  }
  
  return %params;
}

## list.datのデータ取得
sub getRoomList {
  my %rooms;
  if(open(my $FH, './room/list.dat')){
    my $text = join('', <$FH>);
    %rooms = %{ decode_json(encode('utf8', $text)) } if $text;
    close($FH);
  }
  foreach my $key (keys %set::rooms){
    $rooms{$key} = $set::rooms{$key};
  }
  return %rooms;
}

## 計算処理
sub calc {
  my $formula = shift;
  $formula =~ s/[^0-9\.\+\-\*\/\(\)%⌈⌉]//gi; #数字と括弧と算術演算子と関数記号以外は消す
  $formula =~ tr/\+\-\/%//s; #指定記号の連続は一つにまとめる
  $formula =~ s/⌈(.+?)⌉/ceil($1)/g;
  
  return eval($formula);
}

## 暗号化 
sub e_crypt {
  my $plain = shift;
  my $s;
  my @salt = ('0'..'9','A'..'Z','a'..'z','.','/');
  1 while (length($s .= $salt[rand(@salt)]) < 8);
  return crypt($plain,index(crypt('a','$1$a$'),'$1$a$') == 0 ? '$1$'.$s.'$' : $s);
}
sub c_crypt {
  my($plain,$crypt) = @_;
  return ($plain ne '' && $crypt ne '' && crypt($plain,$crypt) eq $crypt);
}

## ファイル有無チェック
sub getFileNameDate {
  use Fcntl;
  my $roomexists = exists($set::rooms{$::in{'room'}}) ? 1 : 0;
  my $logs_dir = $set::rooms{$::in{'room'}}{'logs-dir'} || $set::logs_dir;
  my $date;
  sysopen(my $RD, "./room/$::in{'room'}/log-all.dat", O_RDONLY);
  while(<$RD>){
    $date = (split(/<>/, $_))[1];
    next if ($date !~ m"^[0-9]{4}/[0-9]{2}/[0-9]{2}");
    last if $date;
  }
  close($RD);
  $date =~ s"^([0-9]{4})/([0-9]{2})/([0-9]{2}) .+$"$1$2$3";
  error('ログから日付が取得できませんでした') if !$date;
  my $filename = $date;
  $filename .= $::in{'room'} if $set::logname_id_add && $roomexists;
  my $num = 0;
  while (-f "${logs_dir}/${filename}_${num}.dat" || -d "${logs_dir}/_${filename}_${num}"){
    $num++;
  }
  return "${filename}_${num}";
}

sub resolveCloudAssetUrl {
  my $url = shift;
  my $_mode = shift;
  $url = resolveGoogleDriveAssetUrl($url, $_mode);
  $url = resolveDropboxAssetUrl($url);
  return $url;
}
sub resolveGoogleDriveAssetUrl {
  my $url = shift;
  my $_mode = shift;

  if ($_mode ne 'log') {
    if ($url =~ /^https?:\/\/drive\.google\.com\/file\/d\/(.+)\/view\?usp=(?:sharing|(?:share|drive)_link)$/) {
      return 'https://drive.google.com/uc?id=' . $1;
    }
  } else {
    if (
        $url =~ /^https?:\/\/drive\.google\.com\/file\/d\/(.+)\/view\?usp=(?:sharing|(?:share|drive)_link)$/ ||
        $url =~ /^https?:\/\/drive\.google\.com\/uc\?(?:.+&)?(.+?)(?:$|&)/
    ) {
      return './lib/php/download_asset.php?url=' . $url;
    }
  }

  return $url;
}
sub resolveDropboxAssetUrl {
  my $url = shift;

  if ($url =~ /^https?:\/\/www\.dropbox\.com\/.+[?&]dl=0$/) {
    $url =~ s/dl=0$/dl=1/;
    return $url;
  }

  return $url;
}

## 文字装飾変換
sub quoteConvert_Core {
  my $comm = shift;

  if ($comm !~ /&gt;/) {
    return $comm;
  }

  my @destinationLines = ();
  my @currentQuoted = ();

  foreach my $sourceLine (split(/\n/, $comm)) {
    if ($sourceLine =~ /\A&gt;\s*(.+?)\s*\Z/) {
      push(@currentQuoted, $1);
    } else {
      if ($#currentQuoted > 0) {
        push(@destinationLines, "&lt;quoted&gt;\n" . join("\n", @currentQuoted) . "\n&lt;/quoted&gt;");
        @currentQuoted = ();
      } elsif ($#destinationLines > 0) {
        push(@destinationLines, "\n");
      }
      push(@destinationLines, $sourceLine);
    }
  }

  if ($#currentQuoted > 0) {
    push(@destinationLines, "&lt;quoted&gt;\n" . join("\n", @currentQuoted) . "\n&lt;/quoted&gt;");
  }

  my $resolved = join('', @destinationLines);

  if (!($resolved eq $comm) && $resolved =~ /(&gt;|\n)&gt;/) {
    return quoteConvert_Core($resolved);
  }

  return $resolved;
}
sub quoteConvert {
  my $comm = shift;
  my $converted = quoteConvert_Core($comm);
  $converted =~ s/&lt;quoted&gt;\n+/&lt;quoted&gt;/g;
  $converted =~ s/\n+&lt;\/quoted&gt;/&lt;\/quoted&gt;/g;
  return $converted;
}
sub tagConvert {
  my $comm = shift;
  $comm =~ s/<br>/\n/g;

  # 画像記法・前処理
  my @pictureURL;
  $comm =~ s{&lt;picture&gt;(.+?)&lt;/picture&gt;}{ push(@pictureURL, $1); "<!img#".scalar(@pictureURL).">" }ge;

  # 自動リンク・前処理
  my @linkURL;
  $comm =~ s{(https?://[^\s\<]+)}{ push(@linkURL, $1); "<!a#".scalar(@linkURL).">" }ge;

  #
  $comm =~ s#&lt;br&gt;\n?#<br>#gi;
  $comm =~ s#&lt;hr&gt;\n?#<hr>#gi;
  $comm =~ s/(^\s*・(?!・)\s*.+?(\n|$))+/&listCreateByNakaguro($&)/egim;
  $comm =~ s/(^\s*\*\s*.+?(\n|$))+/&listCreateByAsterisk($&)/egim;
  $comm =~ s/(?:^(?:\|(?:.*?))+\|[hc]?(?:\n|$))+/&tableCreate($&)/egim;
  $comm =~ s#&lt;ruby&gt;(.+?)&lt;rt&gt;(.*?)&lt;/ruby&gt;#<ruby>$1<rt>$2</ruby>#gi;
  $comm =~ s#<ruby>(.+?)(?:<rp>\(</rp>)?<rt>(.*?)(?:<rp>\)</rp>)?</ruby>#<ruby>$1<rt>$2</ruby>#gi;
  $comm =~ s#[|｜ǀ∣│┃](.+?)《(.*?)》#<ruby>$1<rt>$2</ruby>#gi;
  $comm =~ s#([♠♤♥♡♣♧♦♢]+)#<span class="trump">$1</span>#gi;
  $comm =~ s#:([a-z0-9_]+?):#<span class="material-symbols-outlined"><i>:</i>$1<i>:</i></span>#g;

  # ユーザー定義
  foreach my $hash (@set::replace_regex){
    foreach my $key (keys %{$hash}){
      my $value = ${$hash}{$key};
         $value =~ s/"/\\"/g;
      $key =~ s/&lt;/</; $key =~ s/&gt;/>/;
      $comm =~ s/${key}/"\"${value}\""/gee;
    }
  }
  foreach my $key (keys %set::replace_rule){
    my $qkey = quotemeta $key;
    $comm =~ s/${qkey}/$set::replace_rule{$key}/g;
  }

  $comm = quoteConvert($comm);

  while ($comm =~ /(\A|^|\n|>)---+(<)?(\Z|$|\n)/) {
    $comm =~ s#(\A|^|\n|>)---+(<)?(\Z|$|\n)#$1<hr>$2#;
  }

  #
  $comm =~ s#<ruby>(.+?)(?:<rp>\(</rp>)?<rt>(.*?)(?:<rp>\)</rp>)?</ruby>#<ruby><rp>｜</rp>$1<rp>《</rp><rt>$2<rp>》</rp></ruby>#gi;

  1 while $comm =~ s#(^|\n)\#{6}\s*(.*?)(\n|$)#$1&lt;h6&gt;$2&lt;/h6&gt;$3#gis;
  1 while $comm =~ s#(^|\n)\#{5}\s*(.*?)(\n|$)#$1&lt;h5&gt;$2&lt;/h5&gt;$3#gis;
  1 while $comm =~ s#(^|\n)\#{4}\s*(.*?)(\n|$)#$1&lt;h4&gt;$2&lt;/h4&gt;$3#gis;
  1 while $comm =~ s#(^|\n)\#{3}\s*(.*?)(\n|$)#$1&lt;h3&gt;$2&lt;/h3&gt;$3#gis;
  1 while $comm =~ s#(^|\n)\#{2}\s*(.*?)(\n|$)#$1&lt;h2&gt;$2&lt;/h2&gt;$3#gis;
  1 while $comm =~ s#(^|\n)\#{1}\s*(.*?)(\n|$)#$1&lt;h1&gt;$2&lt;/h1&gt;$3#gis;

  1 while $comm =~ s#《《(.+?)》》#<em>$1</em>#gis;
  1 while $comm =~ s#'''(.*?)'''#<i>$1</i>#gis;
  1 while $comm =~ s#&lt;b&gt;(.*?)&lt;/b&gt;#<b>$1</b>#gis;
  1 while $comm =~ s#\*\*(.*?)\*\*#<b>$1</b>#gis;
  1 while $comm =~ s#''(.*?)''#<b>$1</b>#gis;
  1 while $comm =~ s#&lt;i&gt;(.*?)&lt;/i&gt;#<i>$1</i>#gis;
  1 while $comm =~ s#&lt;s&gt;(.*?)&lt;/s&gt;#<s>$1</s>#gis;
  1 while $comm =~ s#%%(.*?)%%#<s>$1</s>#gis;
  1 while $comm =~ s#~~(.*?)~~#<s>$1</s>#gis;
  1 while $comm =~ s#&lt;u&gt;(.*?)&lt;/u&gt;#<span class="under">$1</span>#gis;
  1 while $comm =~ s#__(.*?)__#<span class="under">$1</span>#gis;
  1 while $comm =~ s#&lt;o&gt;(.*?)&lt;/o&gt;#<span class="over">$1</span>#gis;
  1 while $comm =~ s#&lt;em&gt;(.+?)&lt;/em&gt;#<em>$1</em>#gis;
  1 while $comm =~ s#&lt;mi&gt;(.+?)&lt;/mi&gt;#<i class="serif">$1</i>#gis;
  1 while $comm =~ s#&lt;hide&gt;(.+?)&lt;/hide&gt;#<span class="hide">$1</span>#gis;
  1 while $comm =~ s#&lt;big&gt;(.*?)&lt;/big&gt;#<span class="large">$1</span>#gis;
  1 while $comm =~ s#&lt;small&gt;(.*?)&lt;/small&gt;#<span class="small">$1</span>#gis;
  1 while $comm =~ s#&lt;c:([0-9a-zA-Z\#]*?)&gt;(.*?)&lt;/c&gt;#<span style="color:$1">$2</span>#gis;
  
  1 while $comm =~ s#&lt;left&gt;(.*?)&lt;/left&gt;\n?#<div class="left">$1</div>#gis;
  1 while $comm =~ s#&lt;center&gt;(.*?)&lt;/center&gt;\n?#<div class="center">$1</div>#gis;
  1 while $comm =~ s#&lt;right&gt;(.*?)&lt;/right&gt;\n?#<div class="right">$1</div>#gis;
  1 while $comm =~ s#&lt;add-line-spacing&gt;(.*?)&lt;/add-line-spacing&gt;\n?#<div class="add-line-spacing">$1</div>#gis;
  1 while $comm =~ s#&lt;quoted&gt;(.*?)&lt;/quoted&gt;\n?#<blockquote class="decoration">$1</blockquote>#gis;
  
  1 while $comm =~ s#&lt;h([1-6])&gt;(.*?)&lt;/h\1&gt;\n?#<h$1>$2</h$1>#gis;
  
  1 while $comm =~ s#&lt;tip&gt;(.*?)=&gt;(.*?)&lt;\/tip&gt;#$1#gis;
  1 while $comm =~ s#&lt;snippet&gt;(.+?)&lt;\/snippet&gt;#$1#gis;
  
  # 自動リンク・後処理
  $comm =~ s{<!a#([0-9]+)>}{'<a href="'.$linkURL[$1-1].'" target="_blank">'.$linkURL[$1-1].'</a>'}ge;

  # 画像記法・後処理
  $comm =~ s{<!img#([0-9]+)>}{'<img class="picture" alt="picture" src="'.resolveCloudAssetUrl(@pictureURL[$1-1], 'log').'" onclick="imgView(this.src)" />'}ge;
  
  $comm =~ s#(</ul>)\n#$1#;
  
  $comm =~ s#\n#<br>#gi;
  $comm =~ s/(<|&lt;)data-structure(>|&gt;)\s*(.+?)\s*(<|&lt;)\/data-structure(>|&gt;)/&encodeDataStructure($3)/egim;

  return $comm;
}
sub tagConvertUnit {
  my $comm = shift;
  $comm =~ s/<br>/\n/g;

  $comm =~ s#<chara-image:(https?:\/\/[^\s\<]+)(?:,(.+?))(?:,(.+?))>#<div class="chara-image" style="background-image:url($1>);background-size:$2;background-position:$3;"></div>#g;
  $comm =~ s#\[\[(.+?)>(https?:\/\/[^\s\<]+)\]\]#<a href="$2" target="_blank">$1</a>#g;
  $comm =~ s#((?:\G|>)[^<]*?)(https?://[^\s\<]+)#$1<a href="$2" target="_blank">$2</a>#g;

  $comm =~ s#\n#<br>#gi;
  return $comm;
}
#リスト
sub listCreateByNakaguro {
  my $text = shift;
  return listCreate_Core($text, '・');
}
sub listCreateByAsterisk {
  my $text = shift;
  return listCreate_Core($text, '*');
}
sub listCreate_Core {
  my $text = shift;
  my $sign = shift;
  $text =~ s/^\s*[$sign]\s*/<li>/gm;
  my $needLinefeed = $text =~ /\n$/;
  $text =~ s/\n//g;
  return "<ul>$text</ul>" . ($needLinefeed ? "\n" : '');
}
#テーブル
sub tableCreate {
  my $text = shift;
  my $output;
  my @data;
  foreach my $line (split("\n", $text)){
    if   ($line =~ /c$/){ $output .= tableColCreate($line); next; }
    elsif($line =~ /h$/){ $output .= tableHeaderCreate($line); next; }
    $line =~ s/^\|//;
    my @row = split('\|', $line);
    push(@data, [ @row ]);
  }
  my $row_num = 0;
  foreach my $row (@data){
    next if !@{$row};
    $output .= "<tr data-test=@{$row}>";
    my $col_num = 0;
    my $colspan = 1;
    foreach my $col (@{$row}){
      my $rowspan = 1;
      my $td = 'td';
      while($data[$row_num+$rowspan][$col_num] eq '~'){ $rowspan++; }
      $col_num++;
      if   ($col eq '&gt;'){ $colspan++; next; }
      elsif($col eq '~')   { next; }
      elsif($col =~ s/^~//){ $td = 'th' }
      $output .= "<$td";
      if($colspan > 1){ $output .= ' colspan="'.$colspan.'"'; }
      if($rowspan > 1){ $output .= ' rowspan="'.$rowspan.'"'; }
      $output .= ">$col";
    }
    $output .= "</tr>";
    $row_num++;
  }
  return "<table>$output</table>";
}
sub tableColCreate {
  my @out;
  my @col = split(/\|/, $_[0]);
  foreach(@col){
    push (@out, &tableStyleCreate($_));
  }
  return '<colgroup>'.(join '', @out).'</colgroup>';
}
sub tableStyleCreate {
  if($_[0] =~ /([0-9]+)(px|em|\%)/){
    my $num = $1; my $type = $2;
    if   ($type eq 'px' && $num > 300){ $num = 300 }
    elsif($type eq 'em' && $num >  20){ $num =  20 }
    elsif($type eq  '%' && $num > 100){ $num = 100 }
    return "<col style=\"width:calc(${num}${type} + 1em)\">";
  }
  else { return '<col>' }
}
sub tableHeaderCreate {
  my $line = shift;
  my $output;
  $line =~ s/^\|//;
  $line =~ s/h$//;
  $output .= "<thead><tr>";
  my $colspan = 1;
  foreach my $col (split('\|', $line)){
    my $td = 'td';
    if   ($col eq '&gt;'){ $colspan++; next; }
    elsif($col =~ s/^~//){ $td = 'th' }
    $output .= "<$td";
    if($colspan > 1){ $output .= ' colspan="'.$colspan.'"'; }
    $output .= ">$col";
  }
  $output .= "</tr></thead>";
  return $output;
}

## 山括弧エスケープ
sub escapeBracket {
  my $text = shift;
  $text =~ s/</&lt;/g;
  $text =~ s/>/&gt;/g;
  return $text;
}

sub encodeDataStructure {
  use URI::Escape;
  my $source = shift;
  my $encoded = uri_escape_utf8($source);
  return "<data-structure class=\"data-structure-source\" style=\"display: none;\">$encoded</data-structure>";
}

## タグ削除
sub tagDelete {
  my $text = $_[0];
  $text =~ s/<img alt="&#91;(.)&#93;"/[$1]<img /g;
  $text =~ s/<br>/ /g;
  $text =~ s/<.+?>//g;
  $text =~ s/"/&quot;/g;
  return $text;
}

## ランダム表整形
sub reformatRandomTable {
  my %sourceTable = %{ shift; };
  my %destinationTable = ();
  my @destinationRows = ();

  if ($sourceTable{'diceCode'}) {
    my @sourceRows = @{ $sourceTable{'rows'} };
    my $lastBody = undef;
    foreach my $sourceRow (@sourceRows) {
      if ($sourceRow =~ s/^(\d+)://) {
        my $dice = $1;
        my $body = $sourceRow;
        if ($body eq $lastBody) {
          my $rowCount = @destinationRows;
          my $lastRowIndex = $rowCount - 1;
          my %lastRow = %{ @destinationRows[$lastRowIndex] };
          $lastRow{'range'}{'end'} = $dice;
        } else {
          $lastBody = $body;
          push(@destinationRows, { 'range' => { 'begin' => $dice, 'end' => $dice }, 'body' => $sourceRow });
        }
      }
    }

    $destinationTable{'diceCode'} = $sourceTable{'diceCode'};
  } else {
    my @sourceRows = @{ $sourceTable{'rows'} };
    foreach my $sourceRow (@sourceRows) {
      push(@destinationRows, {'body' => $sourceRow});
    }
  }

  $destinationTable{'rows'} = \@destinationRows;
  return \%destinationTable;
}
sub makeRandomTableHtml {
  my %table = %{ shift; };

  my $html = '<table class="random-table">';

  if ($table{'diceCode'}) {
    $html .= '<thead><tr><th>出目</th><th>内容</th></tr></thead>';
  }

  $html .= '<tbody>';

  my @rows = @{ $table{'rows'} };
  foreach my $rowReference (@rows) {
    $html .= '<tr>';
    my %row = %{ $rowReference };
    if ($row{'range'}) {
      my %range = %{ $row{'range'} };
      my $begin = $range{'begin'};
      my $end = $range{'end'};
      $html .= '<th>' . ($begin eq $end ? $begin : "$begin - $end") . '</th>';
    }
    $html .= '<td>' . CGI::escapeHTML($row{'body'}) . '</td>';
    $html .= '</tr>';
  }

  $html .= '</tbody></table>';

  return $html;
}

##
sub logNameFileCreate {
  my $dir = shift;
  opendir(my $DIR, $dir);
  my @filelist = readdir($DIR);
  closedir($DIR);
  my $names;
  foreach my $file (reverse sort @filelist) {
    if ($_ =~ /^_log-names\.dat$/) {}
    elsif ($file =~ /\.dat$/) {
      open(my $FH, '<',  "$dir/$file");
      my $line = <$FH>;
      close($FH);
      chomp $line;
      my $title = $1 if($line =~ /^>(.+?)<>.+$/);
      $file =~ s/\..+?$//;
      $names .= "$file<>$title\n";
    }
    elsif ($file =~ /^_.+?(?!.dat)$/) {
      open(my $FH, '<',  "$dir/$file/config.pl");
      my $json;
      $json .= $_ while <$FH>;
      close($FH);
      if($json){
        my %logconfig = %{ decode_json( encode('utf-8', $json) ) };
        $file =~ s/^_//;
        $names .= "$file<>$logconfig{'title'}\n";
      }
    }
  }
  open(my $FH, '>',  "${dir}/_log-names.dat");
  print $FH $names;
  close($FH);
}

## メッセージ・データ
sub message {
  print "Content-type:application/json; charset=UTF-8\n\n";
  print '{"status":"ok","filename":"'.$_[0].'"}';
  exit;
}

## エラー
sub error {
  if($in{'mode'} =~ /write|read|reset|change/){
    my $message = $_[0];
    $message =~ s/\n/\\n/g;
    print "Content-type:application/json; charset=UTF-8\n\n";
    print '{"status":"error","text":"'.$message.'"}';
  }
  else {
    print "Content-type:text/plain; charset=UTF-8\n\n";
    print $_[0];
  }
  exit;
}
sub errorHtml {
  print "Content-type:text/html; charset=UTF-8\n\n";
  print <<"HTML";
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ゆとチャadv.</title>
  <link rel="stylesheet" media="all" href="lib/css/base.css?$::ver">
  <link rel="stylesheet" media="all" href="lib/css/list.css?$::ver">
  <link rel="stylesheet" media="all" href="lib/css/config.css?$::ver">
</head>
<body>
<div id="base" class="box" style="position:relative;">
  <header>
    <h1>ゆとチャadv.</h1>
  </header>
  <article id="contents">
    <h2><span class="material-symbols-outlined">warning</span>エラー</h2>
    <p style="padding: 1em;">$_[0]</p>
    <p><a href="./">ゲームルーム一覧に戻る</a></p>
  </article>
  <footer>
    ゆとチャadv. ver.$::ver - <a href="https://yutorize.2-d.jp" target="_blank">ゆとらいず工房</a>
  </footer>
</div>
</body>
</html>
HTML
  exit;
}