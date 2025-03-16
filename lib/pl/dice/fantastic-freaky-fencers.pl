use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use List::Util qw(max);

sub fffDiceCheck {
    my $action = shift;
    my $diceFacesExpression = shift;
    my $diceCountExpression = shift;
    my $difficulty = shift;

    my $diceFaces = int(calc($diceFacesExpression));
    my $diceCount = int(calc($diceCountExpression));

    if ($diceFaces < 1 || $diceFaces > 1000) {
        return '';
    }

    if ($diceCount < 1 || $diceCount > 20) {
        return '';
    }

    my @diceValues = ();
    my $maxDiceValue = 0;
    my $totalDiceValue = 0;

    foreach (1 .. $diceCount) {
        my $diceValue = int(rand($diceFaces)) + 1;

        push(@diceValues, $diceValue);
        $maxDiceValue = max($maxDiceValue, $diceValue);
        $totalDiceValue += $diceValue;
    }

    @diceValues = sort { $a <=> $b } @diceValues;

    my $resultValue = $maxDiceValue;

    my $message = "${diceFaces}面×${diceCount}個";
    $message .= " → [@{[ join(',', @diceValues) ]}]";

    my $resultName;
    if ($action eq '攻撃') {
        $resultName = 'ダメージ';

        if ($totalDiceValue >= ($diceFaces + $diceCount * 10)) {
            $message .= " → 最大値 ${maxDiceValue}, 合計値 ${totalDiceValue}〈閃撃〉";
            $resultValue *= 2;
        }
    }
    elsif ($action eq '回避') {
        $resultName = '回避値';
    }
    else {
        $resultName = '最大値';
    }

    $message .= " → ${resultName} ${resultValue}";

    if ($action eq '回避' && $difficulty ne '' && $difficulty ne '?') {
        if ($resultValue >= $difficulty) {
            $message .= " ≧ ダメージ ${difficulty} → 完全回避！";
        }
        else {
            my $reduction = int($resultValue / 2);
            $message .= " ＜ ダメージ ${difficulty} → 不完全回避（${reduction}点軽減） → @{[ $difficulty - $reduction ]}点消耗";
        }
    }

    return ($message, $resultValue);
}

1;
