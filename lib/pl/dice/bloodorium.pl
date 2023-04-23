use strict;
#use warnings;
use utf8;
use open ":utf8";
use open ":std";
use List::Util qw(max);

sub bloodoriumDiceCheck {
    my $comm = shift;

    my $diceCountExpression = undef;

    if ($comm =~ /^([0-9\+\-\*\/()]+)DC/i) {
        $diceCountExpression = $1;
    } elsif ($comm =~ /^DC([0-9\+\-\*\/()]+)/i) {
        $diceCountExpression = $1;
    }

    if (!(defined($diceCountExpression))) {
        return '';
    }

    my $modificationOperator = undef;
    my $modificationValueExpression = undef;

    if ($comm =~ /^([0-9\+\-\*\/()]+DC|DC[0-9\+\-\*\/()]+)(\s*(add|sub)\s*([0-9\+\-\*\/()]+))(?:\s|$)/i) {
        $modificationOperator = $3;
        $modificationValueExpression = $4;
    }

    if (defined($modificationOperator)) {
        if ($modificationOperator =~ /^add$/i) {
            $modificationOperator = '+';
        } elsif ($modificationOperator =~ /^sub$/i) {
            $modificationOperator = '-';
        }
    }

    my $diceCount = int(calc($diceCountExpression));

    if ($diceCount < 1) {
        return '';
    } elsif ($diceCount > 200) {
        return '';
    }

    my $modificationValue = defined($modificationValueExpression) ? int(calc($modificationValueExpression)) : undef;

    my @diceValues = ();
    my %diceValueGroup = (1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0);

    foreach (1..$diceCount) {
        my $diceValue = int(rand(6)) + 1;

        push(@diceValues, $diceValue);
        $diceValueGroup{$diceValue} += 1;
    }

    @diceValues = sort { $a <=> $b } @diceValues;

    my $maxDiceValue = $diceValues[$diceCount - 1];
    my $maxRepdigitCount = List::Util::max(values(%diceValueGroup));

    if ($maxRepdigitCount > 1) {
        my @decorators = ('*', '_', '~', '#', '^', '@');
        my %decoratorMap = ();
        for my $i (0 ... $diceCount) {
            my $diceValue = $diceValues[$i];

            if ($diceValueGroup{$diceValue} == $maxRepdigitCount) {
                my $decorator;
                if (defined($decoratorMap{$diceValue})) {
                    $decorator = $decoratorMap{$diceValue};
                }
                else {
                    $decorator = shift(@decorators);
                    $decoratorMap{$diceValue} = $decorator;
                }

                $diceValues[$i] = "$decorator$diceValue$decorator";
            }
        }
    }

    my $diceValuesText = join(',', @diceValues);

    my $message = "【ダイスチェック： $diceCount 個】 ⇒ [$diceValuesText]";

    my $finalValue = $maxDiceValue;

    if ($maxRepdigitCount > 1) {
        $finalValue = $maxDiceValue * $maxRepdigitCount;
        $message .= " 最大値 $maxDiceValue ×《トライアンフ》 $maxRepdigitCount 倍！ = $finalValue";
    } else {
        $message .= " = $maxDiceValue";
    }

    if (defined($modificationOperator) && defined($modificationValue) && $modificationValue != 0) {
        $message .= ', ' . $modificationOperator . ($modificationValue >= 0 ? $modificationValue : '(' . $modificationValue . ')');
        if ($modificationOperator eq '+') {
            $finalValue += $modificationValue;
        } elsif ($modificationOperator eq '-') {
            $finalValue -= $modificationValue;
        }
        $message .= " ⇒ $finalValue";
    }

    return $message;
}

1;
