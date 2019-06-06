# frozen_string_literal: true

class ProcessingWorker
  include Sidekiq::Worker

  # sidekiq_options backtrace: true
  # modified to prevent forwarding deletions to avoid congestion
  sidekiq_options queue: :ingress, backtrace: true

  def perform(account_id, body)
    ProcessFeedService.new.call(body, Account.find(account_id), override_timestamps: true)
  end
end
