// No-op stub — no native build required
const { View, Text, Image, ScrollView, FlatList } = require('react-native');

const noop = () => {};
const identity = (v) => v;
const makeShared = (v) => ({ value: v });

module.exports = {
  default: { View, Text, Image, ScrollView, FlatList, createAnimatedComponent: identity },
  Animated: { View, Text, Image, ScrollView, FlatList, createAnimatedComponent: identity },
  useSharedValue: makeShared,
  useAnimatedStyle: (fn) => { try { return fn() ?? {}; } catch { return {}; } },
  useAnimatedProps: (fn) => { try { return fn() ?? {}; } catch { return {}; } },
  useAnimatedRef: () => ({ current: null }),
  useAnimatedScrollHandler: () => noop,
  useDerivedValue: (fn) => { try { return { value: fn() }; } catch { return { value: undefined }; } },
  useAnimatedReaction: noop,
  useFrameCallback: noop,
  makeMutable: makeShared,
  withTiming: (toValue) => toValue,
  withSpring: (toValue) => toValue,
  withDelay: (_delay, anim) => anim,
  withRepeat: (anim) => anim,
  withSequence: (...anims) => anims[anims.length - 1],
  withDecay: (config) => config?.velocity ?? 0,
  cancelAnimation: noop,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  interpolate: (_val, _in, out) => out[0] ?? 0,
  interpolateColor: (_val, _in, out) => out[0] ?? '#000000',
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: {
    linear: identity,
    ease: identity,
    quad: identity,
    cubic: identity,
    bezier: () => identity,
    in: identity,
    out: identity,
    inOut: identity,
  },
  createAnimatedComponent: identity,
  setUpTests: noop,
  enableLayoutAnimations: noop,
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
};
