import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import moonPhase from '../../../initial_state';

const messages = defineMessages({
  phase: { id: 'moon_phase.label', defaultMessage: 'Moon Phase' },
});

const makeMapStateToProps = () => {
  const mapStateToProps = state => ({
  });

  return mapStateToProps;
};

export default @connect(makeMapStateToProps)
@injectIntl
class MoonPhase extends ImmutablePureComponent {

  static propTypes = {
    moon_phase: PropTypes.number,
    phases: PropTypes.array,
    phases_emojione: PropTypes.array,
    intl: PropTypes.object.isRequired,
  };

  render() {
    const { intl, phases, phase_names, phase_emoji_svg } = this.props;

    var mphase = moonPhase.meta.moon_phase;

    return (
      <div className='compose-form__moon-phase'>
        <span>
          <p>
            <img
              draggable='false'
              className='moon-phase-img'
              alt={phases[mphase]}
              title={messages.phase.defaultMessage + ': ' + phase_names[mphase]}
              src={phase_emoji_svg[mphase]}
            />
          </p>
        </span>
      </div>
    );
  }

}
