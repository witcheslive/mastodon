# frozen_string_literal: true
require 'date'

class InitialStateSerializer < ActiveModel::Serializer
  attributes :meta, :compose, :accounts,
             :media_attachments, :settings

  has_one :push_subscription, serializer: REST::WebPushSubscriptionSerializer

  def julday(year, month, day)
    if year < 0 then
      year = year + 1
    end
    jy = year.to_i
    jm = month.to_i + 1
    if month <= 2 then
      jy = jy - 1
      jm = jm + 12
    end
    jul = (365.25 * jy).floor + (30.6001 * jm).floor + day.to_i + 1720995
    if day + 31*(month + 12*year) >= (15+31 * (10 + 12*1582)) then
      ja = (0.01 * jy).floor
      jul = jul + 2 - ja + (0.25 * ja).floor
    end
    return jul
  end

  def phaseday(year, month, day)
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
    j1 = julday(year,month,day);
    jd = (2415020 + 28 * n) + i;
    return (j1 - jd + 30) % 30;
  end

  def meta
    store = {
      streaming_api_base_url: Rails.configuration.x.streaming_api_base_url,
      access_token: object.token,
      locale: I18n.locale,
      domain: Rails.configuration.x.local_domain,
      admin: object.admin&.id&.to_s,
      search_enabled: Chewy.enabled?,
      repository: Mastodon::Version.repository,
      source_url: Mastodon::Version.source_url,
      version: Mastodon::Version.to_s,
      invites_enabled: Setting.min_invite_role == 'user',
      mascot: instance_presenter.mascot&.file&.url,
      profile_directory: Setting.profile_directory,
      trends: Setting.trends,
    }

    if object.current_account
      store[:me]               = object.current_account.id.to_s
      store[:unfollow_modal]   = object.current_account.user.setting_unfollow_modal
      store[:boost_modal]      = object.current_account.user.setting_boost_modal
      store[:delete_modal]     = object.current_account.user.setting_delete_modal
      store[:auto_play_gif]    = object.current_account.user.setting_auto_play_gif
      store[:display_media]    = object.current_account.user.setting_display_media
      store[:expand_spoilers]  = object.current_account.user.setting_expand_spoilers
      store[:reduce_motion]    = object.current_account.user.setting_reduce_motion
      store[:advanced_layout] = object.current_account.user.setting_advanced_layout
      store[:is_staff]         = object.current_account.user.staff?
      store[:strip_formatting] = object.current_account.user.setting_strip_formatting
      store[:default_content_type] = object.current_account.user.setting_default_content_type
      store[:moon_phase]        = phaseday(Date.today.strftime("%Y").to_i, Date.today.strftime("%m").to_i, Date.today.strftime("%d").to_i)
      store[:use_blurhash]    = object.current_account.user.setting_use_blurhash
      store[:use_pending_items] = object.current_account.user.setting_use_pending_items
      store[:is_staff]          = object.current_account.user.staff?
      store[:trends]            = Setting.trends && object.current_account.user.setting_trends
    end

    store
  end

  def compose
    store = {}

    if object.current_account
      store[:me]                = object.current_account.id.to_s
      store[:default_privacy]   = object.current_account.user.setting_default_privacy
      store[:default_sensitive] = object.current_account.user.setting_default_sensitive
    end

    store[:text] = object.text if object.text

    store
  end

  def accounts
    store = {}
    store[object.current_account.id.to_s] = ActiveModelSerializers::SerializableResource.new(object.current_account, serializer: REST::AccountSerializer) if object.current_account
    store[object.admin.id.to_s]           = ActiveModelSerializers::SerializableResource.new(object.admin, serializer: REST::AccountSerializer) if object.admin
    store
  end

  def media_attachments
    { accept_content_types: MediaAttachment.supported_file_extensions + MediaAttachment.supported_mime_types }
  end

  private

  def instance_presenter
    @instance_presenter ||= InstancePresenter.new
  end
end
