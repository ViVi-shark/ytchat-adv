require 'find'
require 'audioinfo'

SOUND_ASSETS_DIR_PATH = "#{__dir__}/../lib/sound/".freeze
DESTINATION_CODE_FILE_PATH = "#{__dir__}/../lib/pl/sound-effect.pl".freeze

sound_asset_paths = []
Find.find SOUND_ASSETS_DIR_PATH do |path|
    next unless path =~ /\.mp3$/i
    sound_asset_paths << path.sub(SOUND_ASSETS_DIR_PATH, '').encode(Encoding::UTF_8).freeze
end
sound_asset_paths.sort!
sound_asset_paths.freeze

def extract_file_name(path)
    name = File::basename(path)
    name.sub!(/\.[A-Za-z0-9]+$/, '')
    name.freeze
end

def read_sound_length(sound_asset_path)
    AudioInfo.open("#{SOUND_ASSETS_DIR_PATH}#{sound_asset_path}") do |asset|
        return asset.length
    end
end

class Copyright
    @@table = {
        'On-Jin' => 'On-Jin ～音人～',
    }.transform_keys(&:freeze).transform_values(&:freeze).freeze

    def self.get_by_path(path)
        first_separator_index = path.index(File::SEPARATOR)
        return nil if first_separator_index.nil?

        directory_name = path[0...first_separator_index]
        @@table[directory_name]
    end
end

sound_asset_list = sound_asset_paths.map do |sound_asset_path|
    {
        'path' => sound_asset_path,
        'shortName' => extract_file_name(sound_asset_path),
        'durationSeconds' => read_sound_length(sound_asset_path),
        'copyright' => Copyright.get_by_path(sound_asset_path),
    }.freeze
end.to_a.freeze

def indent(source)
    source.split("\n").map { |x| "  #{x}" }.join("\n")
end

def string_to_perl(source)
    "'#{source}'"
end

def hash_to_perl_code(source_hash)
    items_code = source_hash.to_a.map do |key, value|
        if value.is_a?(String)
            value_code = string_to_perl(value)
        elsif value.is_a?(Integer)
            value_code = value.to_s
        elsif value.nil?
            value_code = '\'\''
        else
            raise
        end

        "#{string_to_perl(key)} => #{value_code},"
    end.join("\n")

    "{\n#{indent(items_code)}\n}"
end

def list_to_perl_code(source_list)
    items_code = source_list.map do |x|
        hash_to_perl_code(x) + ','
    end.join("\n")

    "[\n#{indent(items_code)}\n]"
end

perl_code = <<-EOS
use strict;
use utf8;
use warnings;
package SoundEffect;

our @list = #{list_to_perl_code(sound_asset_list)};

1;
EOS

File.open(DESTINATION_CODE_FILE_PATH, 'wt') do |f|
    f.write perl_code
end
