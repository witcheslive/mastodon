import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import IconButton from 'mastodon/components/icon_button';
import Icon from 'mastodon/components/icon';
import classNames from 'classnames';

const messages = defineMessages({
  option_placeholder: { id: 'compose_form.poll.option_placeholder', defaultMessage: 'Choice {number}' },
  add_option: { id: 'compose_form.poll.add_option', defaultMessage: 'Add a choice' },
  remove_option: { id: 'compose_form.poll.remove_option', defaultMessage: 'Remove this choice' },
  poll_duration: { id: 'compose_form.poll.duration', defaultMessage: 'Poll duration' },
});

@injectIntl
class Option extends React.PureComponent {

  static propTypes = {
    title: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isPollMultiple: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleOptionTitleChange = (e) => {
    this.props.onChange(this.props.index, e.target.value);
  };

  handleOptionRemove = (e) => {
    this.props.onRemove(this.props.index);
  };

  render () {
    const { isPollMultiple, title, index, intl } = this.props;

    return (
      <li>
        <label className='poll__text editable'>
          <span className={classNames('poll__input', { checkbox: isPollMultiple })} />

          <input
            type='text'
            placeholder={intl.formatMessage(messages.option_placeholder, { number: index + 1 })}
            value={title}
            onChange={this.handleOptionTitleChange}
          />
        </label>

        {index > 1 && (
          <div className='poll__cancel'>
            <IconButton title={intl.formatMessage(messages.remove_option)} icon='times' onClick={this.handleOptionRemove} />
          </div>
        )}
      </li>
    );
  }
}

export default
@injectIntl
class PollForm extends ImmutablePureComponent {

  static propTypes = {
    options: ImmutablePropTypes.list,
    expiresIn: PropTypes.number,
    isMultiple: PropTypes.bool,
    onChangeOption: PropTypes.func.isRequired,
    onAddOption: PropTypes.func.isRequired,
    onRemoveOption: PropTypes.func.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleAddOption = () => {
    this.props.onAddOption('');
  };

  render () {
    const { options, expiresIn, isMultiple, onChangeOption, onRemoveOption } = this.props;

    if (!options) {
      return null;
    }

    return (
      <div className='compose-form__poll-wrapper'>
        <ul>
          {options.map((title, i) => <Option title={title} key={i} index={i} onChange={onChangeOption} onRemove={onRemoveOption} isPollMultiple={isMultiple} />)}
        </ul>

        {options.size < 4 && (
          <div className='poll__footer'>
            <button className='poll__link' onClick={this.handleAddOption}><Icon id='plus' /> <FormattedMessage {...messages.add_option} /></button>
          </div>
        )}
      </div>
    );
  }

}
