import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import IconButton from '../../../components/icon_button';
import Overlay from 'react-overlays/lib/Overlay';
import Motion from '../../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import detectPassiveEvents from 'detect-passive-events';
import classNames from 'classnames';
import Icon from 'mastodon/components/icon';

const messages = defineMessages({
  plain_short: { id: 'contenttype.plain.short', defaultMessage: 'Plain' },
  plain_long: { id: 'contenttype.plain.long', defaultMessage: 'Plain text only, no formatting' },
  html_short: { id: 'contenttype.html.short', defaultMessage: 'HTML' },
  html_long: { id: 'contenttype.html.long', defaultMessage: 'Enchant your cant with HTML tag runes' },
  markdown_short: { id: 'contenttype.markdown.short', defaultMessage: 'Markdown' },
  markdown_long: { id: 'contenttype.markdown.long', defaultMessage: 'Enchant your cant with Markdown runes' },
  change_contenttype: { id: 'contenttype.change', defaultMessage: 'Change cant content type' },
});

const listenerOptions = detectPassiveEvents.hasSupport ? { passive: true } : false;

class ContentTypeDropdownMenu extends React.PureComponent {

  static propTypes = {
    style: PropTypes.object,
    items: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    placement: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  state = {
    mounted: false,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  }

  handleKeyDown = e => {
    const { items } = this.props;
    const value = e.currentTarget.getAttribute('data-index');
    const index = items.findIndex(item => {
      return (item.value === value);
    });
    let element;

    switch(e.key) {
    case 'Escape':
      this.props.onClose();
      break;
    case 'Enter':
      this.handleClick(e);
      break;
    case 'ArrowDown':
      element = this.node.childNodes[index + 1];
      if (element) {
        element.focus();
        this.props.onChange(element.getAttribute('data-index'));
      }
      break;
    case 'ArrowUp':
      element = this.node.childNodes[index - 1];
      if (element) {
        element.focus();
        this.props.onChange(element.getAttribute('data-index'));
      }
      break;
    case 'Home':
      element = this.node.firstChild;
      if (element) {
        element.focus();
        this.props.onChange(element.getAttribute('data-index'));
      }
      break;
    case 'End':
      element = this.node.lastChild;
      if (element) {
        element.focus();
        this.props.onChange(element.getAttribute('data-index'));
      }
      break;
    }
  }

  handleClick = e => {
    const value = e.currentTarget.getAttribute('data-index');

    e.preventDefault();

    this.props.onClose();
    this.props.onChange(value);
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
    if (this.focusedItem) this.focusedItem.focus();
    this.setState({ mounted: true });
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  }

  setFocusRef = c => {
    this.focusedItem = c;
  }

  render () {
    const { mounted } = this.state;
    const { style, items, placement, value } = this.props;

    return (
      <Motion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
        {({ opacity, scaleX, scaleY }) => (
          // It should not be transformed when mounting because the resulting
          // size will be used to determine the coordinate of the menu by
          // react-overlays
          <div className={`content-type-dropdown__dropdown ${placement}`} style={{ ...style, opacity: opacity, transform: mounted ? `scale(${scaleX}, ${scaleY})` : null, zIndex: 2 }} role='listbox' ref={this.setRef}>
            {items.map(item => (
              <div role='option' tabIndex='0' key={item.value} data-index={item.value} onKeyDown={this.handleKeyDown} onClick={this.handleClick} className={classNames('content-type-dropdown__option', { active: item.value === value })} aria-selected={item.value === value} ref={item.value === value ? this.setFocusRef : null}>
                <div className='content-type-dropdown__option__icon'>
                  <Icon id={item.icon} fixedWidth />
                </div>

                <div className='content-type-dropdown__option__content'>
                  <strong>{item.text}</strong>
                  {item.meta}
                </div>
              </div>
            ))}
          </div>
        )}
      </Motion>
    );
  }

}

export default @injectIntl
class ContentTypeDropdown extends React.PureComponent {

  static propTypes = {
    isUserTouching: PropTypes.func,
    isModalOpen: PropTypes.bool.isRequired,
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    placement: 'bottom',
  };

  handleToggle = ({ target }) => {
    if (this.props.isUserTouching()) {
      if (this.state.open) {
        this.props.onModalClose();
      } else {
        this.props.onModalOpen({
          actions: this.options.map(option => ({ ...option, active: option.value === this.props.value })),
          onClick: this.handleModalActionClick,
        });
      }
    } else {
      const { top } = target.getBoundingClientRect();
      this.setState({ placement: top * 2 < innerHeight ? 'bottom' : 'top' });
      this.setState({ open: !this.state.open });
    }
  }

  handleModalActionClick = (e) => {
    e.preventDefault();

    const { value } = this.options[e.currentTarget.getAttribute('data-index')];

    this.props.onModalClose();
    this.props.onChange(value);
  }

  handleKeyDown = e => {
    switch(e.key) {
    case 'Escape':
      this.handleClose();
      break;
    }
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleChange = value => {
    this.props.onChange(value);
  }

  componentWillMount () {
    const { intl: { formatMessage } } = this.props;

    this.options = [
      { icon: 'file-text-o', value: 'text/plain', text: formatMessage(messages.plain_short), meta: formatMessage(messages.plain_long) },
      { icon: 'code', value: 'text/html', text: formatMessage(messages.html_short), meta: formatMessage(messages.html_long) },
      { icon: 'arrow-circle-down', value: 'text/markdown', text: formatMessage(messages.markdown_short), meta: formatMessage(messages.markdown_long) },
    ];
  }

  render () {
    const { value, intl } = this.props;
    const { open, placement } = this.state;

    const valueOption = this.options.find(item => item.value === value);

    return (
      <div className={classNames('content-type-dropdown', placement, { active: open })} onKeyDown={this.handleKeyDown}>
        <div className={classNames('content-type-dropdown__value', { active: this.options.indexOf(valueOption) === 0 })}>
          <IconButton
            className='content-type-dropdown__value-icon'
            icon={valueOption.icon}
            title={intl.formatMessage(messages.change_contenttype)}
            size={18}
            expanded={open}
            active={open}
            inverted
            onClick={this.handleToggle}
            style={{ height: null, lineHeight: '27px' }}
          />
        </div>

        <Overlay show={open} placement={placement} target={this}>
          <ContentTypeDropdownMenu
            items={this.options}
            value={value}
            onClose={this.handleClose}
            onChange={this.handleChange}
            placement={placement}
          />
        </Overlay>
      </div>
    );
  }

}
