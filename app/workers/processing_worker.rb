# frozen_string_literal: true

class ProcessingWorker
  include Sidekiq::Worker

  # sidekiq_options backtrace: true
  # modified to prevent forwarding deletions to avoid congestion
  sidekiq_options queue: :ingress, backtrace: true

  def perform(account_id, body); end
end
