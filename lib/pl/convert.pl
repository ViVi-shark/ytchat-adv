################## データ保存 ##################
use strict;
#use warnings;
use utf8;
use open ":utf8";
use LWP::UserAgent;
use JSON::PP;

sub dataGet {
  my $url = shift;
  my $ua  = LWP::UserAgent->new;
  my $res = $ua->get($url);
  if ($res->is_success) {
    return $res->decoded_content;
  }
  else {
    return undef;
  }
}

sub dataConvert {
  my $set_url = shift;
  my $game = $::in{'game'};
  
  {
    my $sheetHtml = dataGet($set_url) or error 'URLを開けませんでした';
    my $bodyUrl;
    my $gameName;
    my $bodyFilter = undef;
    if ($sheetHtml =~ /\<link\s+rel=\"ytchat-body-exporting-point\"\s+type=\"[a-z0-9\/]+\"\s+href=\"(.+?)\"\s*\/?\>/) {
      $bodyUrl = $1;
      if (substr($bodyUrl, 0, 1) eq '.') {
        my $relation = $bodyUrl;
        $bodyUrl = $set_url;
        $bodyUrl =~ s/\?.+$/$relation/;
        $bodyUrl =~ s#/\./#/#g;
      }
    } elsif ($set_url =~ /^https:\/\/www\.fragment-sys\.com\/(bloodorium|wefl)\/make\.html\?id=(\d+)/) {
      $gameName = $1;
      my $characterId = $2;

      my $systemCode;
      if ($gameName eq 'bloodorium') {
        $systemCode = 'bldrium';
      } elsif ($gameName eq 'wefl') {
        $systemCode = 'wldendfrnt';
      } else {
        error("Unsupported game: $gameName");
      }

      $bodyUrl = "https://20e41ubgh2.execute-api.ap-northeast-1.amazonaws.com/default/GetWebcharaItem/$systemCode/$characterId";
      $bodyFilter = 'fragment-system';
    } else {
      error('ステータスの取得できる参照先ではありません');
    }
    my $paletteUrl;
    if ($sheetHtml =~ /\<link\s+rel=\"ytchat-palette-exporting-point\"\s+type=\"[a-z0-9\/]+\"\s+href=\"(.+?)\"\s*\/?\>/) {
      $paletteUrl = $1;
      if (substr($paletteUrl, 0, 1) eq '.') {
        my $relation = $paletteUrl;
        $paletteUrl = $set_url;
        $paletteUrl =~ s/\?.+$/$relation/;
        $paletteUrl =~ s#/\./#/#g;
        if($game && !exists $set::games{$game}{'name'}){
          $paletteUrl .= '&tool=bcdice'
        }
      }
    } else {
      $paletteUrl = '';
    }
    my $data = dataGet($bodyUrl) or error 'JSONのURLを開けませんでした';
    my $json;
    eval { $json = decode_json(join '', $data); };
    if ($@) { error('JSONの形式が不正です'); }
    my %pc = %{ $json };

    if (defined($bodyFilter)) {
      if ($bodyFilter eq 'fragment-system') {
        %pc = %{convertFromFragmentSystem(\%pc, $gameName)};
      }
    }

    error('有効なキャラクターシートではありません') if !$pc{'ver'};
    my %stt;
    my @stt_name;
    my $memo;
    my $result;
    if($pc{'unitStatus'}){
      foreach my $data (@{$pc{'unitStatus'}}){
        if($data eq '|'){
          $result .= '<br>';
        }
        else {
          my $key = (keys %{$data})[0];
          if($key =~ /^(memo|メモ)$/){
            $memo = $data->{$key};
          }
          else {
            push(@stt_name, $key);
            $stt{$key} = $data->{$key};
          }
          $result .= "<b>$key</b>:$data->{$key}　";
        }
      }
    }
    if($::in{'status'}){
      my %except = {};
      %except = %{$pc{'unitExceptStatus'}} if $pc{'unitExceptStatus'};
      foreach my $label (split(' &lt;&gt; ', $::in{'status'})){
        next if($except{$label});
        push(@stt_name, $label);
      }
      if($::in{'statusDefault'}){
        foreach my $data (split(' &lt;&gt; ', $::in{'statusDefault'})){
          my ($label, $value) = split(/[:：]/, $data, 2);
          $stt{$label} ||= $value || '';
        }
      }
    }
    @stt_name = do { my %c; grep {!$c{$_}++} @stt_name }; # 重複削除
    # 名前
    my $aka  = nameConvert( $pc{'aka'} , $pc{'akaRuby'} );
    my $name = nameConvert(
      $pc{'characterName'} && $pc{'monsterName'} ? "$pc{'characterName'}（$pc{'monsterName'}）"
      : $pc{'characterName'}                     ? ($pc{'characterName'}, $pc{'characterNameRuby'})
      : $pc{'monsterName'}
    );
    # プロフィール
    my $profile = textConvert($pc{'sheetDescriptionM'});
    # 画像
    my $img;
    if($pc{'image'}){
      my $fit = $pc{'imageFit'};
      if   ($fit eq 'percentY')   { $fit = 'auto '.$pc{'imagePercent'}*1.3 .'%'; }
      elsif($fit =~ /^percentX?$/){ $fit =         $pc{'imagePercent'}*1.3 .'%'; }
      $img = "<chara-image:$pc{'imageURL'},$fit,$pc{'imagePositionX'}% $pc{'imagePositionY'}%>";
    }
    $result = ($img || '')
            . "[[".($aka?"“$aka”":'')."${name}>${set_url}]]<br>"
            . ($profile ? $profile.'<br>':'')
            . $result;
    # チャットパレット取得
    my $palette = $paletteUrl ? dataGet($paletteUrl) || '' : '';
    # 最終
    my %data = (
      'url' => $set_url,
      'status' => \%stt,
      'sttnames' => \@stt_name,
      'memo' => ($memo || ''),
      'palette' => $palette,
    );
    return (\%data, $result);
  }
}
sub nameConvert {
  my $text = shift;
  my $ruby = shift;
  if($ruby){
    return "<ruby>$text<rt>$ruby</rt></ruby>";
  }
  else {
    $text =~ s#[|｜](.+?)《(.+?)》#<ruby>$1<rt>$2</ruby>#g;
    return $text;
  }
}
sub textConvert {
  my $text = shift;
  $text =~ s#[|｜](.+?)《(.+?)》#<ruby>$1<rt>$2</ruby>#g;
  $text =~ s/&lt;br&gt;|\n/<br>/gi;
  return $text;
}
sub numConvert {
  my $text = shift;
  if($text =~ /^[0-9]+$/ && $text > 0) {
    return "$text/$text";
  }
  elsif($text =~ /^[\-ー－―×]$/){
    return "";
  }
  else { return $text; }
}

## タグ：全角スペース・英数を半角に変換 --------------------------------------------------
sub convertTags {
  my $tags = shift;
  $tags =~ tr/　/ /;
  $tags =~ tr/０-９Ａ-Ｚａ-ｚ/0-9A-Za-z/;
  $tags =~ tr/＋－＊／．，＿/\+\-\*\/\.,_/;
  $tags =~ tr/ / /s;
  return $tags
}

sub convertFromFragmentSystem {
  my $referenceToSource = shift;
  my $gameName = shift;

  my %source = %$referenceToSource;
  my %item = %{$source{'Item'}};

  my $roleName = $item{'string1'} eq 'senteis' ? '剪定者' : $item{'string1'} eq 'adabana' ? ($gameName eq 'bloodorium' ? '徒花' : '不凋花') : undef;

  my $className;
  if ($gameName eq 'bloodorium') {
    if ($item{'pcclass'} eq 'vamp' || $item{'pcclass'} eq 'class1') {
      $className = 'ヴァンパイア';
    }
    elsif ($item{'pcclass'} eq 'knight' || $item{'pcclass'} eq 'class2') {
      $className = '騎士';
    }
    elsif ($item{'pcclass'} eq 'rewrit' || $item{'pcclass'} eq 'class3') {
      $className = 'リライター';
    }
  }
  elsif ($gameName eq 'wefl') {
    if ($item{'pcclass'} eq 'class1') {
      $className = '亜神';
    }
    elsif ($item{'pcclass'} eq 'class2') {
      $className = '妖精';
    }
    elsif ($item{'pcclass'} eq 'class3') {
      $className = '契約者';
    }
  }

  my %statuses = %{getFragmentSystemStatusesByRoleAndClass($roleName, $className)};
  my %fragmentCounts = %{getFragmentSystemFragmentCounts(\%item, $roleName)};

  my $cloudImageUrl = $item{'imageurl'};
  my $hasImage = defined($cloudImageUrl) && !($cloudImageUrl eq '');
  my $imageUrl;
  if ($hasImage) {
    if ($cloudImageUrl =~ /^https?:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_\-.]+)(\/(view\?usp=(sharing|(?:share|drive)_link)(&|$)|edit))?/) {
      $imageUrl = 'https://drive.google.com/uc?id=' . $1;
    }
    elsif ($cloudImageUrl =~ /^https:\/\/www\.dropbox\.com\/s\/.+[?&]dl=[01](&|$)/) {
      $imageUrl = $cloudImageUrl;
      $imageUrl =~ s/([?&]dl=)[01](&|$)/${1}1${2}/;
    }
  }
  else {
    $imageUrl = undef;
  }

  return {
      'ver'               => 'x.x',
      'characterName'     => $item{'pcname'},
      'sheetDescriptionM' => makeFragmentSystemCharacterDescription($roleName, $className),
      'unitStatus'        => [
          { 'HP' => defined($statuses{'initialHp'}) ? "$statuses{'initialHp'}" : undef },
          { 'HP初期値' => defined($statuses{'initialHp'}) ? "$statuses{'initialHp'}" : undef },
          { 'ゲージ' => defined($statuses{'initialGauge'}) ? "$statuses{'initialGauge'}" : undef },
          { 'ロスト数値' => defined($statuses{'lostThreshold'}) ? "$statuses{'lostThreshold'}" : undef },
          { 'コレクトポイント' => '0' },
          { 'フラグメント' => "$fragmentCounts{'available'}/$fragmentCounts{'all'}" },
      ],
      'image'             => $hasImage,
      'imageURL'          => $imageUrl,
      'imageFit'          => 'contain',
      'imagePositionX'    => '50',
      'imagePositionY'    => '50',
  };
}

sub getFragmentSystemStatusesByRoleAndClass {
  my $roleName = shift;
  my $className = shift;

  my $initialGauge = undef;
  my $lostThreshold = undef;
  my $initialHp = undef;

  if ($roleName eq '剪定者') {
    if ($className eq 'ヴァンパイア') {
      $initialGauge = 5;
      $lostThreshold = 0;
      $initialHp = 13;
    }
    elsif ($className eq '騎士') {
      $initialGauge = 6;
      $lostThreshold = 0;
      $initialHp = 15;
    }
    elsif ($className eq 'リライター') {
      $initialGauge = 4;
      $lostThreshold = 16;
      $initialHp = 11;
    }
    elsif ($className eq '亜神') {
      $initialGauge = 20;
      $lostThreshold = 0;
      $initialHp = 16;
    }
    elsif ($className eq '妖精') {
      $initialGauge = 7;
      $lostThreshold = 21;
      $initialHp = 14;
    }
    elsif ($className eq '契約者') {
      $initialGauge = 3;
      $lostThreshold = 0;
      $initialHp = 12;
    }
  }

  return {
      'initialGauge'  => $initialGauge,
      'lostThreshold' => $lostThreshold,
      'initialHp'     => $initialHp,
  };
}

sub getFragmentSystemFragmentCounts {
  my $referenceToCharacter = shift;
  my $roleName = shift;

  my %character = %$referenceToCharacter;

  my $allCount = 0;
  my $lostCount = 0;

  my $maxFragmentCount = $roleName eq '剪定者' ? 6 : 20;

  for (my $id = 73; $id <= (73 + $maxFragmentCount - 1); $id++) {
    my $fragmentKey = 'string' . $id;
    my $fragment = $character{$fragmentKey};

    if (defined($fragment) && !($fragment eq '')) {
      $allCount++;

      my $lostKey = 'string' . ($id - 20);
      my $lostState = $character{$lostKey};

      if (defined($lostState) && !($lostState eq '' || $lostState == 0)) {
        $lostCount++;
      }
    }
  }

  return {
      'all'       => $allCount,
      'available' => $allCount - $lostCount,
  };
}

sub makeFragmentSystemCharacterDescription {
  my $roleName = shift;
  my $className = shift;

  my @items = ();

  if (defined($roleName) && !($roleName eq '')) {
    push(@items, $roleName);
  }

  if (defined($className) && !($className eq '')) {
    push(@items, "クラス: $className");
  }

  my $itemCount = @items;

  return $itemCount > 0 ? join('／', @items) : undef;
}

1;