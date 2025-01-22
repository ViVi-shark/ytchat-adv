use strict;
use utf8;
use open ":utf8";
use open ":std";

sub makeDoTCommand {
    my $roomId = shift;
    my $unitName = shift;

    my $dir = "./room/${roomId}/";

    sysopen(my $FH, $dir . 'room.dat', O_RDWR) or error "room.datが開けません";
    flock($FH, 2);
    my %data = %{decode_json(encode('utf8', (join '', <$FH>)))};
    close($FH);

    my @allStates = ref $data{unit}{$unitName}{states} ? @{$data{unit}{$unitName}{states}} : ();

    my $totalDotCount = 0;

    foreach my $stateReference (@allStates) {
        my %state = %{$stateReference};
        my $stateName = $state{name};

        if ($stateName =~ /^DOT(\d+)/) {
            $totalDotCount += $1;
        }
    }

    return undef if $totalDotCount == 0;
    return "HP-${totalDotCount}";
}

1;
