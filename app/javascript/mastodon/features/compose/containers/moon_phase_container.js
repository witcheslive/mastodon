import { connect } from 'react-redux';
import MoonPhase from '../components/moon_phase';

const mapStateToProps = state => ({
  phases: [
    '🌑', '🌒', '🌒', '🌒', '🌒', '🌒', '🌒', '🌒', '🌓',
    '🌔', '🌔', '🌔', '🌔', '🌔', '🌔', '🌕',
    '🌖', '🌖', '🌖', '🌖', '🌖', '🌖', '🌖', '🌗',
    '🌘', '🌘', '🌘', '🌘', '🌘', '🌘',
  ],
  phase_emoji_name: [
    'new_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'waxing_crescent_moon', 'First Quarter Moon',
    'moon', 'moon', 'moon', 'moon', 'moon', 'moon', 'full_moon',
    'waning_gibbous_moon', 'waning_gibbous_moon', 'waning_gibbous_moon', 'waning_gibbous_moon', 'waning_gibbous_moon', 'waning_gibbous_moon', 'waning_gibbous_moon', 'last_quarter_moon',
    'waning_crescent_moon', 'waning_crescent_moon', 'waning_crescent_moon', 'waning_crescent_moon', 'waning_crescent_moon', 'waning_crescent_moon',
  ],
  phase_names: [
    'New 🌑', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'Waxing Crescent 🌒', 'First Quarter 🌓',
    'Waxing Gibbous 🌔', 'Waxing Gibbous 🌔', 'Waxing Gibbous 🌔', 'Waxing Gibbous 🌔', 'Waxing Gibbous 🌔', 'Waxing Gibbous 🌔', 'FULL 🌕',
    'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Waning Gibbous 🌖', 'Last Quarter 🌗',
    'Waning Crescent 🌘', 'Waning Crescent 🌘', 'Waning Crescent 🌘', 'Waning Crescent 🌘', 'Waning Crescent 🌘', 'Waning Crescent 🌘',
  ],
  phase_emoji_svg: [
    '/emoji/1f311.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f312.svg', '/emoji/1f313.svg',
    '/emoji/1f314.svg', '/emoji/1f314.svg', '/emoji/1f314.svg', '/emoji/1f314.svg', '/emoji/1f314.svg', '/emoji/1f314.svg', '/emoji/1f315.svg',
    '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f316.svg', '/emoji/1f317.svg',
    '/emoji/1f318.svg', '/emoji/1f318.svg', '/emoji/1f318.svg', '/emoji/1f318.svg', '/emoji/1f318.svg', '/emoji/1f318.svg',
  ],
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(MoonPhase);
