# frozen_string_literal: true
require 'date'

class Sanitize
  module Config
    year  = Integer(Date.today.strftime("%Y"))
    month = Integer(Date.today.strftime("%m"))
    day   = Integer(Date.today.strftime("%d"))

    if year < 0 then
      year = year + 1
    end
    jy = Integer(year)
    jm = Integer(month) + 1
    if month <= 2 then
      jy = jy - 1
      jm = jm + 12
    end
    jul = (365.25 * jy).floor + (30.6001 * jm).floor + Integer(day) + 1720995
    if day + 31*(month + 12*year) >= (15+31 * (10 + 12*1582)) then
      ja = (0.01 * jy).floor
      jul = jul + 2 - ja + (0.25 * ja).floor
    end
    n = (12.37 * (year - 1900 + (( 1.0 * month - 0.5) / 12.0))).floor
    rad = 3.14159265/180.0
    t = n / 1236.85;
    t2 = t * t
    as = 359.2242 + 29.105356 * n
    am = 306.0253 + 385.816918 * n + 0.010730 * t2
    xtra = 0.75933 + 1.53058868 * n + ((1.178e-4) - (1.55e-7) * t) * t2
    xtra = xtra + (0.1734 - 3.93e-4 * t) * Math.sin(rad * as) - 0.4068 * Math.sin(rad * am)
    if xtra > 0.0 then
      i = xtra.floor
    else
      i = (xtra - 1.0).ceil
    end
    j1 = jul
    jd = (2415020 + 28 * n) + i
    moonphase =  (j1 - jd + 30) % 30

    HTTP_PROTOCOLS ||= ['http', 'https', 'dat', 'dweb', 'ipfs', 'ipns', 'ssb', 'gopher', :relative].freeze

    CLASS_WHITELIST_TRANSFORMER = lambda do |env|
      node = env[:node]
      class_list = node['class']&.split(/[\t\n\f\r ]/)

      return unless class_list

      class_list.keep_if do |e|
        next true if e =~ /^(h|p|u|dt|e)-/ # microformats classes
        next true if e =~ /^(mention|hashtag)$/ # semantic classes
        next true if e =~ /^(ellipsis|invisible)$/ # link formatting classes
      end

      node['class'] = class_list.join(' ')
    end

    if moonphase == 15 then
      phaseelements = %w(p br span a abbr del pre blockquote code b strong u sub i em h1 h2 h3 h4 h5 ul ol li marquee font)
      phaseattributes = {
        'a'          => %w(href rel class title),
        'span'       => %w(class),
        'abbr'       => %w(title),
        'blockquote' => %w(cite),
        'font'       => %w(color),
      }
    else
      phaseelements = %w(p br span a abbr del pre blockquote code b strong u sub i em h1 h2 h3 h4 h5 ul ol li)
      phaseattributes = {
        'a'          => %w(href rel class title),
        'span'       => %w(class),
        'abbr'       => %w(title),
        'blockquote' => %w(cite),
      }
    end

    UNSUPPORTED_ELEMENTS_TRANSFORMER = lambda do |env|
      return unless %w(h1 h2 h3 h4 h5 h6 blockquote pre ul ol li).include?(env[:node_name])

      case env[:node_name]
      when 'li'
        env[:node].traverse do |node|
          node.add_next_sibling('<br>') if node.next_sibling
          node.replace(node.children) unless node.text?
        end
      else
        env[:node].name = 'p'
      end
    end




    MASTODON_STRICT ||= freeze_config(
      elements: phaseelements,

      attributes: phaseattributes,

      add_attributes: {
        'a' => {
          'rel' => 'nofollow noopener',
          'target' => '_blank',
        },
      },

      protocols: {
        'a'          => { 'href' => HTTP_PROTOCOLS },
        'blockquote' => { 'cite' => HTTP_PROTOCOLS },
      },

      transformers: [
        CLASS_WHITELIST_TRANSFORMER,
        #UNSUPPORTED_ELEMENTS_TRANSFORMER,
      ]
    )

    MASTODON_OEMBED ||= freeze_config merge(
      RELAXED,
      elements: RELAXED[:elements] + %w(audio embed iframe source video),

      attributes: merge(
        RELAXED[:attributes],
        'audio'  => %w(controls),
        'embed'  => %w(height src type width),
        'iframe' => %w(allowfullscreen frameborder height scrolling src width),
        'source' => %w(src type),
        'video'  => %w(controls height loop width),
        'div'    => [:data]
      ),

      protocols: merge(
        RELAXED[:protocols],
        'embed'  => { 'src' => HTTP_PROTOCOLS },
        'iframe' => { 'src' => HTTP_PROTOCOLS },
        'source' => { 'src' => HTTP_PROTOCOLS }
      )
    )
  end
end
