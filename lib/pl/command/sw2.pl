use strict;
use utf8;
use open ":utf8";
use open ":std";

sub makeRestCommand {
    my $roomId = shift;
    my $unitName = shift;
    my $restScale = shift;

    my $dir = "./room/${roomId}/";

    sysopen(my $FH, $dir . 'room.dat', O_RDWR) or error "room.datが開けません";
    flock($FH, 2);
    my %data = %{decode_json(encode('utf8', (join '', <$FH>)))};
    close($FH);

    my @allStatusNames = ref $data{unit}{$unitName}{sttnames} ? @{$data{unit}{$unitName}{sttnames}} : ();
    my @hpNames = ();
    my @mpNames = ();

    foreach my $statusName (@allStatusNames) {
        if ($statusName =~ /^HP$/i) {
            push(@hpNames, $statusName);
        }
        elsif ($statusName =~ /^MP$/i) {
            push(@mpNames, $statusName);
        }
        elsif ($statusName =~ /[:_]HP$/i) {
            push(@hpNames, $statusName);
        }
        elsif ($statusName =~ /^(.+?)[:_]?MP$/i) {
            my $partName = $1;

            # 〈マナカートリッジ〉のようなものを除外しつつ自然回復対象っぽいＭＰのみ受け入れる:

            if (grep {$_ eq "${partName}:HP"} @allStatusNames) {
                # 同名のＨＰ項目があるなら、部位のＭＰっぽい.
            }
            elsif ($partName =~ /^(?:使い魔|ファミリア|蛙|蜘蛛|鳥|猫|蛇)$/) {
                # 使い魔っぽい.
            }
            else {
                # 自然回復対象ではなさそう.
                next;
            }

            push(@mpNames, $statusName);
        }
    }

    my %statuses = ref $data{unit}{$unitName}{status} ? %{$data{unit}{$unitName}{status}} : ();
    my @commandParts = ();

    my $healingCount;

    if ($restScale =~ s/(?:h|時間)$//i) {
        $healingCount = floor($restScale / 3);
    }
    else {
        $healingCount = $restScale;
    }

    foreach my $hpName (@hpNames) {
        my $value = $statuses{$hpName};
        next unless defined($value);
        next unless $value =~ /^-?\d+\/(\d+)/;
        my $maxValue = $1;

        my $healingValue = ceil($maxValue * 0.2);
        push(@commandParts, "${hpName}+${healingValue}*${healingCount}");
    }

    foreach my $mpName (@mpNames) {
        my $value = $statuses{$mpName};
        next unless defined($value);
        next unless $value =~ /^-?\d+\/(\d+)/;
        my $maxValue = $1;

        my $healingValue = ceil($maxValue * 0.5);
        push(@commandParts, "${mpName}+${healingValue}*${healingCount}");
    }

    return undef unless @commandParts;
    return join(' ', @commandParts);
}

1;
